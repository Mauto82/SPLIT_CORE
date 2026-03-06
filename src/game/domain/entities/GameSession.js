import { FileSystem } from './FileSystem.js';

export class GameSession {
  constructor() {
    this.level = 0;
    this.fileSystem = new FileSystem();
    this.commandHistory = [];
  }

  advanceLevel() {
    this.level++;
  }

  executeCommand(command) {
    this.commandHistory.push(command);
  }
}