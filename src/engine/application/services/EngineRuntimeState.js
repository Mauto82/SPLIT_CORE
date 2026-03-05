export class EngineRuntimeState {
  constructor({ paused }) {
    if (paused === undefined || paused === null) {
      throw new Error("paused is required");
    }
    this.paused = paused;
  }

  setPaused({ value }) {
    if (value === undefined || value === null) {
      throw new Error("value is required");
    }
    this.paused = Boolean(value);
  }

  isPaused() {
    return this.paused;
  }
}
