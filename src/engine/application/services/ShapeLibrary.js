export class ShapeLibrary {
  constructor() {
    this.verticesByShape = {
      cube: [
        [-1, -1, -1],
        [1, -1, -1],
        [1, 1, -1],
        [-1, 1, -1],
        [-1, -1, 1],
        [1, -1, 1],
        [1, 1, 1],
        [-1, 1, 1]
      ],
      tetrahedron: [
        [1, 1, 1],
        [-1, -1, 1],
        [-1, 1, -1],
        [1, -1, -1]
      ],
      octahedron: [
        [1, 0, 0],
        [-1, 0, 0],
        [0, 1, 0],
        [0, -1, 0],
        [0, 0, 1],
        [0, 0, -1]
      ],
      prism: [
        [-1, -1, -1],
        [1, -1, -1],
        [0, 1, -1],
        [-1, -1, 1],
        [1, -1, 1],
        [0, 1, 1]
      ]
    };
  }

  getVertices(shapeId) {
    const vertices = this.verticesByShape[shapeId];
    if (!vertices) {
      throw new Error(`Unsupported shape: ${shapeId}`);
    }
    return vertices;
  }
}
