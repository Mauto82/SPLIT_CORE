export class JsonConfigRepository {
  constructor({ path }) {
    if (!path) {
      throw new Error("path is required");
    }
    this.path = path;
  }

  async load() {
    const response = await fetch(this.path, { cache: "no-store" });
    if (!response.ok) {
      throw new Error(`Cannot load config file: ${this.path}`);
    }
    const parsed = await response.json();
    this.validate(parsed);
    return parsed;
  }

  validate(config) {
    const requiredPaths = [
      "viewport.width",
      "viewport.height",
      "rendering.backend",
      "rendering.backgroundColor",
      "rendering.pointColor",
      "rendering.pointRadius",
      "projection.focalLength",
      "projection.cameraDistance",
      "scene.shapes",
      "loop.frameRate",
      "loop.startPaused"
    ];
    for (const keyPath of requiredPaths) {
      const value = keyPath.split(".").reduce((node, key) => node?.[key], config);
      if (value === undefined || value === null) {
        throw new Error(`Missing required config value: ${keyPath}`);
      }
    }
    if (config.rendering.backend === "canvas") {
      this.validateKeyPath({ value: config, keyPath: "canvasId", label: "config" });
    } else if (config.rendering.backend === "terminal") {
      const terminalPaths = [
        "canvasId",
        "rendering.terminal.elementId",
        "rendering.terminal.columns",
        "rendering.terminal.rows",
        "rendering.terminal.fontSizePx",
        "rendering.terminal.lineHeight",
        "rendering.terminal.emptyChar",
        "rendering.terminal.depthShades",
        "rendering.terminal.depthRange.near",
        "rendering.terminal.depthRange.far",
        "rendering.terminal.console.enabled"
      ];
      for (const keyPath of terminalPaths) {
        this.validateKeyPath({ value: config, keyPath, label: "config" });
      }
      if (config.rendering.terminal.console.enabled) {
        const consolePaths = [
          "rendering.terminal.console.containerElementId",
          "rendering.terminal.console.screenElementId",
          "rendering.terminal.console.inputElementId",
          "rendering.terminal.console.prompt",
          "rendering.terminal.console.promptSeparator",
          "rendering.terminal.console.maxLines",
          "rendering.terminal.console.welcomeLines",
          "rendering.terminal.console.commands.help",
          "rendering.terminal.console.commands.pause",
          "rendering.terminal.console.commands.resume",
          "rendering.terminal.console.commands.speed",
          "rendering.terminal.console.commands.status",
          "rendering.terminal.console.messages.help",
          "rendering.terminal.console.messages.paused",
          "rendering.terminal.console.messages.resumed",
          "rendering.terminal.console.messages.statusPrefix",
          "rendering.terminal.console.messages.runningToken",
          "rendering.terminal.console.messages.pausedToken",
          "rendering.terminal.console.messages.speedToken",
          "rendering.terminal.console.messages.shapesToken",
          "rendering.terminal.console.messages.speedUpdatedPrefix",
          "rendering.terminal.console.messages.invalidSpeedValue",
          "rendering.terminal.console.messages.unknownCommandPrefix"
        ];
        for (const keyPath of consolePaths) {
          this.validateKeyPath({ value: config, keyPath, label: "config" });
        }
      }
    } else {
      throw new Error(`Unsupported rendering backend: ${config.rendering.backend}`);
    }
    if (!Array.isArray(config.scene.shapes) || config.scene.shapes.length === 0) {
      throw new Error("scene.shapes must be a non-empty array");
    }
    for (const shape of config.scene.shapes) {
      const requiredShapePaths = [
        "id",
        "type",
        "size",
        "rotationSpeed.x",
        "rotationSpeed.y",
        "rotationSpeed.z",
        "offset.x",
        "offset.y",
        "offset.z"
      ];
      for (const keyPath of requiredShapePaths) {
        this.validateKeyPath({ value: shape, keyPath, label: "shape" });
      }
    }
  }

  validateKeyPath({ value, keyPath, label }) {
    const keyValue = keyPath.split(".").reduce((node, key) => node?.[key], value);
    if (keyValue === undefined || keyValue === null) {
      throw new Error(`Missing required ${label} value: ${keyPath}`);
    }
  }
}
