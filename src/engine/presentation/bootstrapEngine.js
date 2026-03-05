import { RenderSceneUseCase } from "../application/use_cases/RenderSceneUseCase.js";
import { CubeSceneService } from "../application/services/CubeSceneService.js";
import { JsonConfigRepository } from "../infrastructure/config/JsonConfigRepository.js";
import { AnimationLoop } from "../infrastructure/clock/AnimationLoop.js";
import { FormulaProjectionAdapter } from "../infrastructure/projection/FormulaProjectionAdapter.js";
import { CanvasFrameRenderer } from "../infrastructure/rendering/CanvasFrameRenderer.js";

export async function bootstrapEngine({ configPath }) {
  const configRepository = new JsonConfigRepository({ path: configPath });
  const config = await configRepository.load();
  const canvas = document.getElementById(config.canvasId);
  if (!canvas) {
    throw new Error(`Canvas not found: ${config.canvasId}`);
  }
  canvas.width = config.viewport.width;
  canvas.height = config.viewport.height;

  const projectionPort = new FormulaProjectionAdapter({
    focalLength: config.projection.focalLength,
    cameraDistance: config.projection.cameraDistance
  });
  const frameRendererPort = new CanvasFrameRenderer({
    canvas,
    backgroundColor: config.rendering.backgroundColor
  });
  const renderSceneUseCase = new RenderSceneUseCase({ projectionPort, frameRendererPort });
  const cubeSceneService = new CubeSceneService({
    cubeSize: config.scene.cubeSize,
    rotationSpeed: config.scene.rotationSpeed
  });

  const animationLoop = new AnimationLoop({
    frameRate: config.loop.frameRate,
    onTick: () => {
      const points3d = cubeSceneService.nextFramePoints();
      renderSceneUseCase.execute({
        points3d,
        viewport: config.viewport,
        color: config.rendering.pointColor,
        radius: config.rendering.pointRadius
      });
    }
  });

  animationLoop.start();
}
