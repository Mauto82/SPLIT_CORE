export class CubeSceneService {
  constructor({ cubeSize, rotationSpeed }) {
    if (!cubeSize) {
      throw new Error("cubeSize is required");
    }
    if (!rotationSpeed) {
      throw new Error("rotationSpeed is required");
    }
    this.cubeSize = cubeSize;
    this.rotationSpeed = rotationSpeed;
    this.angleX = 0;
    this.angleY = 0;
    this.angleZ = 0;
    this.vertices = [
      [-1, -1, -1],
      [1, -1, -1],
      [1, 1, -1],
      [-1, 1, -1],
      [-1, -1, 1],
      [1, -1, 1],
      [1, 1, 1],
      [-1, 1, 1]
    ];
  }

  nextFramePoints() {
    this.angleX += this.rotationSpeed.x;
    this.angleY += this.rotationSpeed.y;
    this.angleZ += this.rotationSpeed.z;
    return this.vertices.map((vertex) => {
      const scaled = {
        x: vertex[0] * this.cubeSize,
        y: vertex[1] * this.cubeSize,
        z: vertex[2] * this.cubeSize
      };
      return this.rotate(scaled);
    });
  }

  rotate(point) {
    const cosX = Math.cos(this.angleX);
    const sinX = Math.sin(this.angleX);
    const cosY = Math.cos(this.angleY);
    const sinY = Math.sin(this.angleY);
    const cosZ = Math.cos(this.angleZ);
    const sinZ = Math.sin(this.angleZ);

    const y1 = point.y * cosX - point.z * sinX;
    const z1 = point.y * sinX + point.z * cosX;
    const x2 = point.x * cosY + z1 * sinY;
    const z2 = -point.x * sinY + z1 * cosY;
    const x3 = x2 * cosZ - y1 * sinZ;
    const y3 = x2 * sinZ + y1 * cosZ;

    return { x: x3, y: y3, z: z2 };
  }
}
