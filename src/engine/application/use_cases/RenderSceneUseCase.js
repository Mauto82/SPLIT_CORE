export class RenderSceneUseCase {
  constructor({ projectionPort, frameRendererPort }) {
    if (!projectionPort) {
      throw new Error("projectionPort is required");
    }
    if (!frameRendererPort) {
      throw new Error("frameRendererPort is required");
    }
    this.projectionPort = projectionPort;
    this.frameRendererPort = frameRendererPort;
  }

  execute({ points3d, viewport, color, radius }) {
    if (!Array.isArray(points3d)) {
      throw new Error("points3d must be an array");
    }
    this.frameRendererPort.beginFrame();
    for (const point of points3d) {
      const projected = this.projectionPort.project({ point, viewport });
      this.frameRendererPort.renderPoint({
        x: projected.x,
        y: projected.y,
        color,
        radius
      });
    }
    this.frameRendererPort.endFrame();
  }
}
