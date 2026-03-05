export class DomEngineTerminalAdapter {
  constructor({ containerElement, screenElement, inputElement, prompt, promptSeparator, maxLines, onCommand }) {
    if (!containerElement) {
      throw new Error("containerElement is required");
    }
    if (!screenElement) {
      throw new Error("screenElement is required");
    }
    if (!inputElement) {
      throw new Error("inputElement is required");
    }
    if (!prompt) {
      throw new Error("prompt is required");
    }
    if (promptSeparator === undefined || promptSeparator === null) {
      throw new Error("promptSeparator is required");
    }
    if (!maxLines) {
      throw new Error("maxLines is required");
    }
    if (!onCommand) {
      throw new Error("onCommand is required");
    }
    this.containerElement = containerElement;
    this.screenElement = screenElement;
    this.inputElement = inputElement;
    this.prompt = prompt;
    this.promptSeparator = promptSeparator;
    this.maxLines = maxLines;
    this.onCommand = onCommand;
    this.lines = [];
  }

  bind() {
    this.containerElement.style.display = "grid";
    this.inputElement.addEventListener("keydown", (event) => {
      if (event.key !== "Enter") {
        return;
      }
      event.preventDefault();
      const rawInput = this.inputElement.value;
      this.appendLine(`${this.prompt}${this.promptSeparator}${rawInput}`);
      try {
        const outputLines = this.onCommand({ rawInput });
        for (const line of outputLines) {
          this.appendLine(line);
        }
      } catch (error) {
        this.appendLine(error.message);
      }
      this.inputElement.value = "";
      this.render();
    });
  }

  appendLine(line) {
    this.lines.push(line);
    if (this.lines.length > this.maxLines) {
      this.lines = this.lines.slice(this.lines.length - this.maxLines);
    }
  }

  appendLines(lines) {
    for (const line of lines) {
      this.appendLine(line);
    }
  }

  render() {
    this.screenElement.textContent = this.lines.join("\n");
  }

  focusInput() {
    this.inputElement.focus();
  }
}
