import { GameSession } from '../../domain/entities/GameSession.js';

export class HandleGameTerminalCommandUseCase {
  constructor({ gameSessionRepository }) {
    if (!gameSessionRepository) {
      throw new Error('gameSessionRepository is required');
    }
    this.gameSessionRepository = gameSessionRepository;
    
    // Load session or create new one
    this.session = this.gameSessionRepository.load();
    if (!this.session) {
      this.session = new GameSession();
      this.gameSessionRepository.save(this.session);
    }
  }

  getCommandNames() {
    return ['ls', 'cd', 'pwd', 'help', 'cat', 'whoami'];
  }

  getInitialPrompt() {
    return `guest@local:${this.session.fileSystem.getCurrentPath()}$ `;
  }

  execute({ rawInput }) {
    if (!rawInput || !rawInput.trim()) {
      return { output: [] };
    }

    const parts = rawInput.trim().split(/\s+/);
    const command = parts[0];
    const args = parts.slice(1);
    
    this.session.executeCommand(rawInput);

    let output = [];
    let prompt = null;

    try {
      switch (command) {
        case 'ls':
          const lsPath = args[0] || null;
          const files = this.session.fileSystem.listFiles(lsPath);
          output = files.length > 0 ? [files.join('  ')] : [];
          break;
          
        case 'cd':
          const target = args[0];
          if (!target) {
            this.session.fileSystem.changeDirectory('/');
          } else {
            this.session.fileSystem.changeDirectory(target);
          }
          prompt = `guest@local:${this.session.fileSystem.getCurrentPath()}$ `;
          break;
          
        case 'pwd':
          output = [this.session.fileSystem.getCurrentPath()];
          break;
          
        case 'cat':
          const filePath = args[0];
          if (!filePath) {
            throw new Error('Usage: cat <filename>');
          }
          const content = this.session.fileSystem.readFile(filePath);
          output = [content];
          break;

        case 'whoami':
          output = ['guest (restricted access)'];
          break;

        case 'help':
          output = [
            'System is in restricted mode.',
            'Available commands:',
            '  ls, cd, pwd, cat, whoami',
            '',
            'For assistance, contact system administrator.'
          ];
          break;
          
        default:
          // Simulate "command not found" system behavior
          throw new Error(`Command not found: ${command}`);
      }
      
      this.gameSessionRepository.save(this.session);
      
      return {
        output,
        prompt
      };
      
    } catch (e) {
      return {
        output: [`sh: ${e.message}`]
      };
    }
  }
}