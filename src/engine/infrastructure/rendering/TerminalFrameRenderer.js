import { FrameRendererPort } from "../../domain/ports/FrameRendererPort.js";

export class TerminalFrameRenderer extends FrameRendererPort {
  constructor({ container, columns, rows, emptyChar, pointChar, backgroundColor, pointColor }) {
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
    if (!pointChar) {
      throw new Error("pointChar is required");
    }
    if (!backgroundColor) {
      throw new Error("backgroundColor is required");
    }
    if (!pointColor) {
      throw new Error("pointColor is required");
    }
    this.container = container;
    this.columns = columns;
    this.rows = rows;
    this.emptyChar = emptyChar;
    this.pointChar = pointChar;
    this.backgroundColor = backgroundColor;
    this.pointColor = pointColor;
    this.buffer = [];
    this.container.style.backgroundColor = this.backgroundColor;
    this.container.style.color = this.pointColor;
    this.container.style.margin = "0";
    this.container.style.whiteSpace = "pre";
    this.container.style.fontFamily = "monospace";
    this.container.style.userSelect = "none";
  }

  beginFrame() {
    this.buffer = Array.from({ length: this.rows }, () => Array.from({ length: this.columns }, () => this.emptyChar));
  }

  renderPoint({ x, y, viewport }) {
    if (!viewport) {
      throw new Error("viewport is required");
    }
    if (viewport.width <= 1 || viewport.height <= 1) {
      throw new Error("viewport width and height must be greater than 1");
    }
    const col = Math.round((x / (viewport.width - 1)) * (this.columns - 1));
    const row = Math.round((y / (viewport.height - 1)) * (this.rows - 1));
    if (row < 0 || row >= this.rows || col < 0 || col >= this.columns) {
      return;
    }
    this.buffer[row][col] = this.pointChar;
  }

  endFrame() {
    const content = this.buffer.map((row) => row.join("")).join("\n");
    this.container.textContent = content;
  }
}
