export class FrameRendererPort {
  beginFrame() {
    throw new Error("FrameRendererPort.beginFrame must be implemented");
  }

  renderPoint() {
    throw new Error("FrameRendererPort.renderPoint must be implemented");
  }

  endFrame() {
    throw new Error("FrameRendererPort.endFrame must be implemented");
  }
}
