export class JsonConfigRepository {
  constructor({ path }) {
    if (!path) {
      throw new Error("path is required");
    }
    this.path = path;
  }

  async load() {
    const response = await fetch(this.path);
    if (!response.ok) {
      throw new Error(`Cannot load config file: ${this.path}`);
    }
    const parsed = await response.json();
    this.validate(parsed);
    return parsed;
  }

  validate(config) {
    const requiredPaths = [
      "canvasId",
      "viewport.width",
      "viewport.height",
      "rendering.backgroundColor",
      "rendering.pointColor",
      "rendering.pointRadius",
      "projection.focalLength",
      "projection.cameraDistance",
      "scene.cubeSize",
      "scene.rotationSpeed.x",
      "scene.rotationSpeed.y",
      "scene.rotationSpeed.z",
      "loop.frameRate"
    ];
    for (const keyPath of requiredPaths) {
      const value = keyPath.split(".").reduce((node, key) => node?.[key], config);
      if (value === undefined || value === null) {
        throw new Error(`Missing required config value: ${keyPath}`);
      }
    }
  }
}
