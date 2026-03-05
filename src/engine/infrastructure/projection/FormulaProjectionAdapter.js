import { ProjectionPort } from "../../domain/ports/ProjectionPort.js";

export class FormulaProjectionAdapter extends ProjectionPort {
  constructor({ focalLength, cameraDistance }) {
    super();
    if (!focalLength) {
      throw new Error("focalLength is required");
    }
    if (!cameraDistance) {
      throw new Error("cameraDistance is required");
    }
    this.focalLength = focalLength;
    this.cameraDistance = cameraDistance;
  }

  project({ point, viewport }) {
    const denominator = point.z + this.cameraDistance;
    if (denominator <= 0) {
      throw new Error("Point is behind the camera plane");
    }
    const scale = this.focalLength / denominator;
    return {
      x: viewport.width * 0.5 + point.x * scale,
      y: viewport.height * 0.5 - point.y * scale
    };
  }
}
