import { RenderSceneUseCase } from "../application/use_cases/RenderSceneUseCase.js";
import { buildRotatingShapesSceneService } from "../application/services/RotatingShapesSceneService.js";
import { EngineRuntimeState } from "../application/services/EngineRuntimeState.js";
import { HandleEngineTerminalCommandUseCase } from "../application/use_cases/HandleEngineTerminalCommandUseCase.js";
import { JsonConfigRepository } from "../infrastructure/config/JsonConfigRepository.js";
import { AnimationLoop } from "../infrastructure/clock/AnimationLoop.js";
import { FormulaProjectionAdapter } from "../infrastructure/projection/FormulaProjectionAdapter.js";
import { buildFrameRendererAdapter } from "../infrastructure/rendering/buildFrameRendererAdapter.js";
import { DomEngineTerminalAdapter } from "../infrastructure/terminal/DomEngineTerminalAdapter.js";

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
    paused: config.loop.startPaused
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
      const points3d = sceneService.nextFramePoints();
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
  const commandUseCase = new HandleEngineTerminalCommandUseCase({
    runtimeState,
    sceneService,
    commandsConfig: config.rendering.terminal.console.commands,
    messagesConfig: config.rendering.terminal.console.messages
  });
  return new DomEngineTerminalAdapter({
    containerElement,
    screenElement,
    inputElement,
    prompt: config.rendering.terminal.console.prompt,
    promptSeparator: config.rendering.terminal.console.promptSeparator,
    maxLines: config.rendering.terminal.console.maxLines,
    onCommand: ({ rawInput }) => commandUseCase.execute({ rawInput })
  });
}
