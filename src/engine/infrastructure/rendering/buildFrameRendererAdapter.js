import { CanvasFrameRenderer } from "./CanvasFrameRenderer.js";
import { TerminalFrameRenderer } from "./TerminalFrameRenderer.js";

export function buildFrameRendererAdapter({ config, documentRef }) {
  const backend = config.rendering.backend;
  if (backend === "canvas") {
    const canvas = documentRef.getElementById(config.canvasId);
    if (!canvas) {
      throw new Error(`Canvas not found: ${config.canvasId}`);
    }
    canvas.width = config.viewport.width;
    canvas.height = config.viewport.height;
    setElementVisibility({ element: canvas, visible: true });
    if (config.rendering.terminal?.elementId) {
      const terminal = documentRef.getElementById(config.rendering.terminal.elementId);
      if (terminal) {
        setElementVisibility({ element: terminal, visible: false });
      }
    }
    return new CanvasFrameRenderer({
      canvas,
      backgroundColor: config.rendering.backgroundColor
    });
  }
  if (backend === "terminal") {
    const terminal = documentRef.getElementById(config.rendering.terminal.elementId);
    if (!terminal) {
      throw new Error(`Terminal container not found: ${config.rendering.terminal.elementId}`);
    }
    setElementVisibility({ element: terminal, visible: true });
    const canvas = documentRef.getElementById(config.canvasId);
    if (canvas) {
      setElementVisibility({ element: canvas, visible: false });
    }
    return new TerminalFrameRenderer({
      container: terminal,
      columns: config.rendering.terminal.columns,
      rows: config.rendering.terminal.rows,
      fontSizePx: config.rendering.terminal.fontSizePx,
      lineHeight: config.rendering.terminal.lineHeight,
      emptyChar: config.rendering.terminal.emptyChar,
      depthShades: config.rendering.terminal.depthShades,
      backgroundColor: config.rendering.backgroundColor,
      pointColor: config.rendering.pointColor,
      depthNear: config.rendering.terminal.depthRange.near,
      depthFar: config.rendering.terminal.depthRange.far
    });
  }
  throw new Error(`Unsupported rendering backend: ${backend}`);
}

function setElementVisibility({ element, visible }) {
  element.style.display = visible ? "block" : "none";
}
