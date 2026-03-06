import { RenderSceneUseCase } from "../application/use_cases/RenderSceneUseCase.js";
import { buildRotatingShapesSceneService } from "../application/services/RotatingShapesSceneService.js";
import { EngineRuntimeState } from "../application/services/EngineRuntimeState.js";
import { HandleEngineTerminalCommandUseCase } from "../application/use_cases/HandleEngineTerminalCommandUseCase.js";
import { JsonConfigRepository } from "../infrastructure/config/JsonConfigRepository.js";
import { AnimationLoop } from "../infrastructure/clock/AnimationLoop.js";
import { FormulaProjectionAdapter } from "../infrastructure/projection/FormulaProjectionAdapter.js";
import { buildFrameRendererAdapter } from "../infrastructure/rendering/buildFrameRendererAdapter.js";
import { DomEngineTerminalAdapter } from "../infrastructure/terminal/DomEngineTerminalAdapter.js";
import { PerspectiveTerminalTextRenderer } from "../infrastructure/terminal/PerspectiveTerminalTextRenderer.js";
import { HandleGameTerminalCommandUseCase } from "../../game/application/use_cases/HandleGameTerminalCommandUseCase.js";
import { LocalStorageGameSessionRepository } from "../../game/infrastructure/repositories/LocalStorageGameSessionRepository.js";

export async function bootstrapEngine({ configPath }) {
  const configRepository = new JsonConfigRepository({ path: configPath });
  const config = await configRepository.load();

  const projectionPort = new FormulaProjectionAdapter({
    focalLength: config.projection.focalLength,
    cameraDistance: config.projection.cameraDistance
  });
  const frameRendererPort = buildFrameRendererAdapter({
    config,
    documentRef: document
  });
  const renderSceneUseCase = new RenderSceneUseCase({ projectionPort, frameRendererPort });
  const sceneService = buildRotatingShapesSceneService({
    shapes: config.scene.shapes
  });
  const runtimeState = new EngineRuntimeState({
    paused: config.loop.startPaused,
    projectionEnabled: config.projection.enabled
  });
  const terminalConsole = buildTerminalConsole({
    config,
    sceneService,
    runtimeState,
    documentRef: document
  });

  const animationLoop = new AnimationLoop({
    frameRate: config.loop.frameRate,
    onTick: () => {
      if (runtimeState.isPaused()) {
        return;
      }
      let points3d = [];
      if (runtimeState.isProjectionEnabled()) {
        points3d = sceneService.nextFramePoints();
      }
      renderSceneUseCase.execute({
        points3d,
        viewport: config.viewport,
        color: config.rendering.pointColor,
        radius: config.rendering.pointRadius
      });
    }
  });

  if (terminalConsole) {
    terminalConsole.bind();
    terminalConsole.appendLines(config.rendering.terminal.console.welcomeLines);
    terminalConsole.render();
    terminalConsole.focusInput();
  }
  animationLoop.start();
}

function buildTerminalConsole({ config, sceneService, runtimeState, documentRef }) {
  if (config.rendering.backend !== "terminal") {
    return null;
  }
  if (!config.rendering.terminal.console.enabled) {
    return null;
  }
  const containerElement = documentRef.getElementById(config.rendering.terminal.console.containerElementId);
  if (!containerElement) {
    throw new Error(`Terminal console container not found: ${config.rendering.terminal.console.containerElementId}`);
  }
  const screenElement = documentRef.getElementById(config.rendering.terminal.console.screenElementId);
  if (!screenElement) {
    throw new Error(`Terminal console screen not found: ${config.rendering.terminal.console.screenElementId}`);
  }
  const inputElement = documentRef.getElementById(config.rendering.terminal.console.inputElementId);
  if (!inputElement) {
    throw new Error(`Terminal console input not found: ${config.rendering.terminal.console.inputElementId}`);
  }
  const engineCommandUseCase = new HandleEngineTerminalCommandUseCase({
    runtimeState,
    sceneService,
    commandsConfig: config.rendering.terminal.console.commands,
    messagesConfig: config.rendering.terminal.console.messages
  });
  const gameSessionRepository = new LocalStorageGameSessionRepository();
  const gameCommandUseCase = new HandleGameTerminalCommandUseCase({ gameSessionRepository });
  const engineCommandNames = engineCommandUseCase.getCommandNames();
  const gameCommandNames = gameCommandUseCase.getCommandNames();
  const initialPrompt = gameCommandUseCase.getInitialPrompt();
  const perspectiveConfig = config.rendering.terminal.console.perspective;
  const terminalTextRenderer = new PerspectiveTerminalTextRenderer({
    screenElement,
    focalLength: perspectiveConfig.focalLength,
    cameraDistance: perspectiveConfig.cameraDistance,
    vanishingPointX: perspectiveConfig.vanishingPointX,
    vanishingPointY: perspectiveConfig.vanishingPointY,
    nearZ: perspectiveConfig.nearZ,
    depthStep: perspectiveConfig.depthStep,
    maxDepth: perspectiveConfig.maxDepth,
    nearOpacity: perspectiveConfig.nearOpacity,
    farOpacity: perspectiveConfig.farOpacity,
    blurMaxPx: perspectiveConfig.blurMaxPx,
    nearScale: perspectiveConfig.nearScale,
    lineGapY: perspectiveConfig.lineGapY,
    baseX: perspectiveConfig.baseX,
    baseY: perspectiveConfig.baseY
  });

  return new DomEngineTerminalAdapter({
    containerElement,
    screenElement,
    inputElement,
    terminalTextRenderer,
    prompt: initialPrompt,
    promptSeparator: config.rendering.terminal.console.promptSeparator,
    maxLines: config.rendering.terminal.console.maxLines,
    historySize: config.rendering.terminal.console.historySize,
    autocompleteEnabled: config.rendering.terminal.console.autocompleteEnabled,
    commandNames: [...engineCommandNames, ...gameCommandNames],
    onCommand: ({ rawInput }) => {
      const parts = rawInput.trim().split(/\s+/);
      const command = parts[0];
      if (engineCommandNames.includes(command)) {
        return engineCommandUseCase.execute({ rawInput });
      }
      return gameCommandUseCase.execute({ rawInput });
    }
  });
}
