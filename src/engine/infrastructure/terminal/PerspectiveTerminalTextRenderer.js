export class PerspectiveTerminalTextRenderer {
  constructor({
    screenElement,
    focalLength,
    cameraDistance,
    vanishingPointX,
    vanishingPointY,
    nearZ,
    depthStep,
    maxDepth,
    nearOpacity,
    farOpacity,
    blurMaxPx,
    nearScale,
    lineGapY,
    baseX,
    baseY
  }) {
    if (!screenElement) {
      throw new Error("screenElement is required");
    }
    this.validatePositiveNumber({ value: focalLength, key: "focalLength" });
    this.validatePositiveNumber({ value: cameraDistance, key: "cameraDistance" });
    this.validateNumberInRange({ value: vanishingPointX, key: "vanishingPointX", min: 0, max: 1 });
    this.validateNumberInRange({ value: vanishingPointY, key: "vanishingPointY", min: 0, max: 1 });
    this.validateNumber({ value: nearZ, key: "nearZ" });
    this.validatePositiveNumber({ value: depthStep, key: "depthStep" });
    this.validatePositiveNumber({ value: maxDepth, key: "maxDepth" });
    this.validateNumberInRange({ value: nearOpacity, key: "nearOpacity", min: 0, max: 1 });
    this.validateNumberInRange({ value: farOpacity, key: "farOpacity", min: 0, max: 1 });
    this.validatePositiveNumber({ value: blurMaxPx, key: "blurMaxPx" });
    this.validatePositiveNumber({ value: nearScale, key: "nearScale" });
    this.validatePositiveNumber({ value: lineGapY, key: "lineGapY" });
    this.validateNumberInRange({ value: baseX, key: "baseX", min: 0, max: 1 });
    this.validateNumberInRange({ value: baseY, key: "baseY", min: 0, max: 1 });
    this.screenElement = screenElement;
    this.focalLength = focalLength;
    this.cameraDistance = cameraDistance;
    this.vanishingPointX = vanishingPointX;
    this.vanishingPointY = vanishingPointY;
    this.nearZ = nearZ;
    this.depthStep = depthStep;
    this.maxDepth = maxDepth;
    this.nearOpacity = nearOpacity;
    this.farOpacity = farOpacity;
    this.blurMaxPx = blurMaxPx;
    this.nearScale = nearScale;
    this.lineGapY = lineGapY;
    this.baseX = baseX;
    this.baseY = baseY;
    this.screenElement.style.position = "relative";
    this.screenElement.style.overflow = "hidden";
    this.screenElement.style.whiteSpace = "pre";
  }

  validatePositiveNumber({ value, key }) {
    if (typeof value !== "number" || Number.isNaN(value) || value <= 0) {
      throw new Error(`${key} must be a positive number`);
    }
  }

  validateNumber({ value, key }) {
    if (typeof value !== "number" || Number.isNaN(value)) {
      throw new Error(`${key} must be a number`);
    }
  }

  validateNumberInRange({ value, key, min, max }) {
    this.validateNumber({ value, key });
    if (value < min || value > max) {
      throw new Error(`${key} must be between ${min} and ${max}`);
    }
  }

  render({ lines }) {
    if (!Array.isArray(lines)) {
      throw new Error("lines must be an array");
    }
    const width = this.screenElement.clientWidth;
    const height = this.screenElement.clientHeight;
    if (width <= 0 || height <= 0) {
      return;
    }
    const fragment = document.createDocumentFragment();
    this.screenElement.textContent = "";
    const visibleLines = lines.slice(Math.max(0, lines.length - this.maxDepth - 1));
    const vanishingPointPx = {
      x: width * this.vanishingPointX,
      y: height * this.vanishingPointY
    };
    const nearAnchorPx = {
      x: width * this.baseX,
      y: height * this.baseY
    };
    const nearLineSpacingPx = height * this.lineGapY;
    for (let i = 0; i < visibleLines.length; i += 1) {
      const sourceIndex = visibleLines.length - 1 - i;
      const text = visibleLines[sourceIndex];
      const depthIndex = i;
      const t = Math.min(1, depthIndex / this.maxDepth);
      if (t >= 1) {
        continue;
      }
      const z = this.nearZ + depthIndex * this.depthStep;
      const scale = this.computeScale({ z });
      if (scale <= 0.12) {
        continue;
      }
      const nearY = nearAnchorPx.y - depthIndex * nearLineSpacingPx;
      const x = this.interpolate(nearAnchorPx.x, vanishingPointPx.x, t);
      const y = this.interpolate(nearY, vanishingPointPx.y, t);
      const element = document.createElement("div");
      const opacity = this.interpolate(this.nearOpacity, this.farOpacity, t);
      const blurPx = this.interpolate(0, this.blurMaxPx, t);
      element.textContent = text;
      element.style.position = "absolute";
      element.style.left = `${x}px`;
      element.style.top = `${y}px`;
      element.style.opacity = `${opacity}`;
      element.style.filter = `blur(${blurPx}px)`;
      element.style.transformOrigin = "left top";
      element.style.transform = `scale(${scale})`;
      element.style.whiteSpace = "pre";
      element.style.pointerEvents = "none";
      element.style.zIndex = `${this.maxDepth - depthIndex}`;
      fragment.appendChild(element);
    }
    this.screenElement.appendChild(fragment);
  }

  computeScale({ z }) {
    const nearDenominator = this.nearZ + this.cameraDistance;
    const currentDenominator = z + this.cameraDistance;
    const nearProjectionScale = this.focalLength / nearDenominator;
    const currentProjectionScale = this.focalLength / currentDenominator;
    return this.nearScale * (currentProjectionScale / nearProjectionScale);
  }

  interpolate(start, end, t) {
    return start + (end - start) * t;
  }
}
