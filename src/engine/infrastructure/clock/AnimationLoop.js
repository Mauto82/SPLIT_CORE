export class AnimationLoop {
  constructor({ frameRate, onTick }) {
    if (!frameRate) {
      throw new Error("frameRate is required");
    }
    if (!onTick) {
      throw new Error("onTick is required");
    }
    this.frameRate = frameRate;
    this.onTick = onTick;
    this.frameDuration = 1000 / frameRate;
    this.lastFrameTimestamp = 0;
  }

  start() {
    const loop = (timestamp) => {
      const elapsed = timestamp - this.lastFrameTimestamp;
      if (elapsed >= this.frameDuration) {
        this.lastFrameTimestamp = timestamp;
        this.onTick();
      }
      requestAnimationFrame(loop);
    };
    requestAnimationFrame(loop);
  }
}
