export class HandleEngineTerminalCommandUseCase {
  constructor({ runtimeState, sceneService, commandsConfig, messagesConfig }) {
    if (!runtimeState) {
      throw new Error("runtimeState is required");
    }
    if (!sceneService) {
      throw new Error("sceneService is required");
    }
    if (!commandsConfig) {
      throw new Error("commandsConfig is required");
    }
    if (!messagesConfig) {
      throw new Error("messagesConfig is required");
    }
    this.runtimeState = runtimeState;
    this.sceneService = sceneService;
    this.commandsConfig = commandsConfig;
    this.messagesConfig = messagesConfig;
  }

  execute({ rawInput }) {
    if (rawInput === undefined || rawInput === null) {
      throw new Error("rawInput is required");
    }
    const normalized = rawInput.trim();
    if (!normalized) {
      return [];
    }
    const [command, value] = normalized.split(/\s+/);
    if (command === this.commandsConfig.help) {
      return [this.messagesConfig.help];
    }
    if (command === this.commandsConfig.pause) {
      this.runtimeState.setPaused({ value: true });
      return [this.messagesConfig.paused];
    }
    if (command === this.commandsConfig.resume) {
      this.runtimeState.setPaused({ value: false });
      return [this.messagesConfig.resumed];
    }
    if (command === this.commandsConfig.speed) {
      return this.handleSpeed({ value });
    }
    if (command === this.commandsConfig.status) {
      return [this.buildStatusLine()];
    }
    return [`${this.messagesConfig.unknownCommandPrefix}: ${command}`];
  }

  handleSpeed({ value }) {
    if (value === undefined || value === null) {
      throw new Error(this.messagesConfig.invalidSpeedValue);
    }
    const parsedValue = Number(value);
    if (Number.isNaN(parsedValue) || parsedValue <= 0) {
      throw new Error(this.messagesConfig.invalidSpeedValue);
    }
    this.sceneService.setRotationSpeedMultiplier({ value: parsedValue });
    return [`${this.messagesConfig.speedUpdatedPrefix}: ${parsedValue}`];
  }

  buildStatusLine() {
    const pausedToken = this.runtimeState.isPaused()
      ? this.messagesConfig.pausedToken
      : this.messagesConfig.runningToken;
    return `${this.messagesConfig.statusPrefix} ${pausedToken} | ${this.messagesConfig.speedToken}: ${this.sceneService.getRotationSpeedMultiplier()} | ${this.messagesConfig.shapesToken}: ${this.sceneService.getShapeCount()}`;
  }
}
