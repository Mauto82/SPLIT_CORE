import { ShapeLibrary } from "./ShapeLibrary.js";

export class RotatingShapesSceneService {
  constructor({ shapeLibrary, shapes }) {
    if (!shapeLibrary) {
      throw new Error("shapeLibrary is required");
    }
    if (!Array.isArray(shapes) || shapes.length === 0) {
      throw new Error("shapes must be a non-empty array");
    }
    this.shapeLibrary = shapeLibrary;
    this.shapes = shapes.map((shape) => this.validateShape(shape));
    this.anglesByShape = new Map();
    for (const shape of this.shapes) {
      this.anglesByShape.set(shape.id, { x: 0, y: 0, z: 0 });
    }
  }

  nextFramePoints() {
    const points = [];
    for (const shape of this.shapes) {
      const angles = this.anglesByShape.get(shape.id);
      angles.x += shape.rotationSpeed.x;
      angles.y += shape.rotationSpeed.y;
      angles.z += shape.rotationSpeed.z;
      const vertices = this.shapeLibrary.getVertices(shape.type);
      for (const vertex of vertices) {
        const scaled = {
          x: vertex[0] * shape.size,
          y: vertex[1] * shape.size,
          z: vertex[2] * shape.size
        };
        const rotated = this.rotatePoint(scaled, angles);
        points.push({
          x: rotated.x + shape.offset.x,
          y: rotated.y + shape.offset.y,
          z: rotated.z + shape.offset.z
        });
      }
    }
    return points;
  }

  rotatePoint(point, angles) {
    const cosX = Math.cos(angles.x);
    const sinX = Math.sin(angles.x);
    const cosY = Math.cos(angles.y);
    const sinY = Math.sin(angles.y);
    const cosZ = Math.cos(angles.z);
    const sinZ = Math.sin(angles.z);

    const y1 = point.y * cosX - point.z * sinX;
    const z1 = point.y * sinX + point.z * cosX;
    const x2 = point.x * cosY + z1 * sinY;
    const z2 = -point.x * sinY + z1 * cosY;
    const x3 = x2 * cosZ - y1 * sinZ;
    const y3 = x2 * sinZ + y1 * cosZ;
    return { x: x3, y: y3, z: z2 };
  }

  validateShape(shape) {
    if (!shape.id) {
      throw new Error("shape.id is required");
    }
    if (!shape.type) {
      throw new Error("shape.type is required");
    }
    if (!shape.size) {
      throw new Error("shape.size is required");
    }
    if (!shape.rotationSpeed) {
      throw new Error(`shape.rotationSpeed is required: ${shape.id}`);
    }
    if (shape.rotationSpeed.x === undefined || shape.rotationSpeed.y === undefined || shape.rotationSpeed.z === undefined) {
      throw new Error(`shape.rotationSpeed.x/y/z are required: ${shape.id}`);
    }
    if (!shape.offset) {
      throw new Error(`shape.offset is required: ${shape.id}`);
    }
    if (shape.offset.x === undefined || shape.offset.y === undefined || shape.offset.z === undefined) {
      throw new Error(`shape.offset.x/y/z are required: ${shape.id}`);
    }
    this.shapeLibrary.getVertices(shape.type);
    return shape;
  }
}

export function buildRotatingShapesSceneService({ shapes }) {
  return new RotatingShapesSceneService({
    shapeLibrary: new ShapeLibrary(),
    shapes
  });
}
