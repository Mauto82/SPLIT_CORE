import { RenderSceneUseCase } from "../application/use_cases/RenderSceneUseCase.js";
import { buildRotatingShapesSceneService } from "../application/services/RotatingShapesSceneService.js";
import { JsonConfigRepository } from "../infrastructure/config/JsonConfigRepository.js";
import { AnimationLoop } from "../infrastructure/clock/AnimationLoop.js";
import { FormulaProjectionAdapter } from "../infrastructure/projection/FormulaProjectionAdapter.js";
import { buildFrameRendererAdapter } from "../infrastructure/rendering/buildFrameRendererAdapter.js";

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

  const animationLoop = new AnimationLoop({
    frameRate: config.loop.frameRate,
    onTick: () => {
      const points3d = sceneService.nextFramePoints();
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
