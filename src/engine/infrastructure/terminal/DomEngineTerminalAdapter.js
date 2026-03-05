export class DomEngineTerminalAdapter {
  constructor({
    containerElement,
    screenElement,
    inputElement,
    prompt,
    promptSeparator,
    maxLines,
    historySize,
    autocompleteEnabled,
    commandNames,
    onCommand
  }) {
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
    if (!historySize) {
      throw new Error("historySize is required");
    }
    if (autocompleteEnabled === undefined || autocompleteEnabled === null) {
      throw new Error("autocompleteEnabled is required");
    }
    if (!Array.isArray(commandNames) || commandNames.length === 0) {
      throw new Error("commandNames must be a non-empty array");
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
    this.historySize = historySize;
    this.autocompleteEnabled = Boolean(autocompleteEnabled);
    this.commandNames = commandNames;
    this.onCommand = onCommand;
    this.lines = [];
    this.history = [];
    this.historyIndex = null;
    this.historyDraft = "";
  }

  bind() {
    this.containerElement.style.display = "grid";
    this.inputElement.addEventListener("keydown", (event) => {
      if (event.key === "Enter") {
        event.preventDefault();
        this.handleSubmit();
        return;
      }
      if (event.key === "ArrowUp") {
        event.preventDefault();
        this.navigateHistory({ direction: "up" });
        return;
      }
      if (event.key === "ArrowDown") {
        event.preventDefault();
        this.navigateHistory({ direction: "down" });
        return;
      }
      if (event.key === "Tab") {
        event.preventDefault();
        this.autocompleteInput();
      }
    });
  }

  handleSubmit() {
    const rawInput = this.inputElement.value;
    const normalized = rawInput.trim();
    this.appendLine(`${this.prompt}${this.promptSeparator}${rawInput}`);
    this.registerHistory({ normalizedInput: normalized });
    try {
      const outputLines = this.onCommand({ rawInput });
      for (const line of outputLines) {
        this.appendLine(line);
      }
    } catch (error) {
      this.appendLine(error.message);
    }
    this.inputElement.value = "";
    this.historyIndex = null;
    this.historyDraft = "";
    this.render();
  }

  registerHistory({ normalizedInput }) {
    if (!normalizedInput) {
      return;
    }
    this.history.push(normalizedInput);
    if (this.history.length > this.historySize) {
      this.history = this.history.slice(this.history.length - this.historySize);
    }
  }

  navigateHistory({ direction }) {
    if (this.history.length === 0) {
      return;
    }
    if (direction === "up") {
      if (this.historyIndex === null) {
        this.historyDraft = this.inputElement.value;
        this.historyIndex = this.history.length - 1;
      } else {
        this.historyIndex = Math.max(0, this.historyIndex - 1);
      }
      this.inputElement.value = this.history[this.historyIndex];
      return;
    }
    if (direction === "down") {
      if (this.historyIndex === null) {
        return;
      }
      if (this.historyIndex >= this.history.length - 1) {
        this.historyIndex = null;
        this.inputElement.value = this.historyDraft;
        return;
      }
      this.historyIndex += 1;
      this.inputElement.value = this.history[this.historyIndex];
    }
  }

  autocompleteInput() {
    if (!this.autocompleteEnabled) {
      return;
    }
    const currentValue = this.inputElement.value;
    const normalized = currentValue.trim();
    if (!normalized || normalized.includes(" ")) {
      return;
    }
    const matches = this.commandNames.filter((commandName) => commandName.startsWith(normalized));
    if (matches.length === 0) {
      return;
    }
    if (matches.length === 1) {
      this.inputElement.value = matches[0];
      return;
    }
    this.appendLine(matches.join(" "));
    this.render();
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
    this.screenElement.scrollTop = this.screenElement.scrollHeight;
  }

  focusInput() {
    this.inputElement.focus();
  }
}
