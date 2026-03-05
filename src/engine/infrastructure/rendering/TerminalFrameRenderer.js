import { FrameRendererPort } from "../../domain/ports/FrameRendererPort.js";

export class TerminalFrameRenderer extends FrameRendererPort {
  constructor({ container, columns, rows, emptyChar, depthShades, backgroundColor, pointColor, cameraDistance }) {
    super();
    if (!container) {
      throw new Error("container is required");
    }
    if (!columns) {
      throw new Error("columns is required");
    }
    if (!rows) {
      throw new Error("rows is required");
    }
    if (!emptyChar) {
      throw new Error("emptyChar is required");
    }
    if (!depthShades) {
      throw new Error("depthShades is required");
    }
    if (Array.from(depthShades).length === 0) {
      throw new Error("depthShades must be non-empty");
    }
    if (!backgroundColor) {
      throw new Error("backgroundColor is required");
    }
    if (!pointColor) {
      throw new Error("pointColor is required");
    }
    if (!cameraDistance) {
      throw new Error("cameraDistance is required");
    }
    this.container = container;
    this.columns = columns;
    this.rows = rows;
    this.emptyChar = emptyChar;
    this.depthShades = Array.from(depthShades);
    this.backgroundColor = backgroundColor;
    this.pointColor = pointColor;
    this.cameraDistance = cameraDistance;
    this.buffer = [];
    this.depthBuffer = [];
    this.container.style.backgroundColor = this.backgroundColor;
    this.container.style.color = this.pointColor;
    this.container.style.margin = "0";
    this.container.style.whiteSpace = "pre";
    this.container.style.fontFamily = "monospace";
    this.container.style.userSelect = "none";
  }

  beginFrame() {
    this.buffer = Array.from({ length: this.rows }, () => Array.from({ length: this.columns }, () => this.emptyChar));
    this.depthBuffer = Array.from({ length: this.rows }, () => Array.from({ length: this.columns }, () => Number.NEGATIVE_INFINITY));
  }

  renderPoint({ x, y, z, viewport }) {
    if (!viewport) {
      throw new Error("viewport is required");
    }
    if (viewport.width <= 1 || viewport.height <= 1) {
      throw new Error("viewport width and height must be greater than 1");
    }
    if (z === undefined || z === null) {
      throw new Error("z is required");
    }
    const col = Math.round((x / (viewport.width - 1)) * (this.columns - 1));
    const row = Math.round((y / (viewport.height - 1)) * (this.rows - 1));
    if (row < 0 || row >= this.rows || col < 0 || col >= this.columns) {
      return;
    }
    if (z <= this.depthBuffer[row][col]) {
      return;
    }
    this.depthBuffer[row][col] = z;
    this.buffer[row][col] = this.mapDepthToChar(z);
  }

  endFrame() {
    const content = this.buffer.map((row) => row.join("")).join("\n");
    this.container.textContent = content;
  }

  mapDepthToChar(z) {
    const normalized = (z + this.cameraDistance) / (this.cameraDistance * 2);
    const clamped = Math.min(1, Math.max(0, normalized));
    const index = Math.round(clamped * (this.depthShades.length - 1));
    return this.depthShades[index];
  }
}
