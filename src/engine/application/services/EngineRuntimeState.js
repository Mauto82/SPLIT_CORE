export class EngineRuntimeState {
  constructor({ paused, projectionEnabled = false }) {
    if (paused === undefined || paused === null) {
      throw new Error("paused is required");
    }
    this.paused = Boolean(paused);
    this.initialPaused = Boolean(paused);
    this.projectionEnabled = Boolean(projectionEnabled);
    this.initialProjectionEnabled = Boolean(projectionEnabled);
  }

  setPaused({ value }) {
    if (value === undefined || value === null) {
      throw new Error("value is required");
    }
    this.paused = Boolean(value);
  }

  setProjectionEnabled({ value }) {
    if (value === undefined || value === null) {
      throw new Error("value is required");
    }
    this.projectionEnabled = Boolean(value);
  }

  isPaused() {
    return this.paused;
  }

  isProjectionEnabled() {
    return this.projectionEnabled;
  }

  reset() {
    this.paused = this.initialPaused;
    this.projectionEnabled = this.initialProjectionEnabled;
  }
}
