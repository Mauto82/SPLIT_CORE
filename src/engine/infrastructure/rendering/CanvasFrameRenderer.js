import { FrameRendererPort } from "../../domain/ports/FrameRendererPort.js";

export class CanvasFrameRenderer extends FrameRendererPort {
  constructor({ canvas, backgroundColor }) {
    super();
    if (!canvas) {
      throw new Error("canvas is required");
    }
    if (!backgroundColor) {
      throw new Error("backgroundColor is required");
    }
    const context = canvas.getContext("2d");
    if (!context) {
      throw new Error("2d context is required");
    }
    this.canvas = canvas;
    this.context = context;
    this.backgroundColor = backgroundColor;
  }

  beginFrame() {
    this.context.fillStyle = this.backgroundColor;
    this.context.fillRect(0, 0, this.canvas.width, this.canvas.height);
  }

  renderPoint({ x, y, color, radius }) {
    this.context.fillStyle = color;
    this.context.beginPath();
    this.context.arc(x, y, radius, 0, Math.PI * 2);
    this.context.fill();
  }

  endFrame() {}
}
