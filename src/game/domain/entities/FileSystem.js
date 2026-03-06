export class FileSystem {
  constructor() {
    this.currentPath = '/';
    this.root = {
      type: 'directory',
      name: '/',
      children: {
        'clues': { 
          type: 'directory', 
          name: 'clues', 
          children: {} 
        },
        'trash': { 
          type: 'directory', 
          name: 'trash', 
          children: {
            'dump.log': { type: 'file', name: 'dump.log', content: 'Corrupted segment at 0x00045F... recovering...' }
          } 
        },
        'system': { 
          type: 'directory', 
          name: 'system', 
          children: {
            'kernel.msg': { type: 'file', name: 'kernel.msg', content: 'System initialized. User privileges: restricted.' }
          } 
        },
        'README.txt': { 
          type: 'file', 
          name: 'README.txt', 
          content: 'NON TOCCARE NULLA.\nIl sistema è instabile.\nAspetta istruzioni.' 
        }
      }
    };
  }

  resolveNode(path) {
    if (!path || path === '/') {
      return this.root;
    }

    const parts = path.split('/').filter(p => p.length > 0);
    let currentNode = this.root;

    // Se il path non inizia con /, parte dalla directory corrente
    if (!path.startsWith('/')) {
        // TODO: gestire path relativi complessi. Per ora assumiamo che currentPath sia sempre / o /dir
        if (this.currentPath !== '/') {
            const currentDirName = this.currentPath.substring(1);
            if (this.root.children[currentDirName]) {
                currentNode = this.root.children[currentDirName];
            }
        }
    }

    for (const part of parts) {
      if (part === '.') continue;
      if (part === '..') {
          // Risalita semplice: se siamo in una sottocartella, torniamo a root
          // TODO: implementare parent link veri per annidamento profondo
          currentNode = this.root; 
          continue;
      }
      
      if (currentNode.type !== 'directory') {
        return null;
      }
      
      if (!currentNode.children[part]) {
        return null;
      }
      
      currentNode = currentNode.children[part];
    }
    
    return currentNode;
  }

  changeDirectory(path) {
    if (!path) {
      this.currentPath = '/';
      return;
    }

    const targetNode = this.resolveNode(path);
    
    if (!targetNode || targetNode.type !== 'directory') {
      throw new Error(`Directory not found: ${path}`);
    }

    // Ricostruzione path assoluto (semplificato per ora a 1 livello)
    if (targetNode === this.root) {
        this.currentPath = '/';
    } else {
        this.currentPath = '/' + targetNode.name;
    }
  }

  listFiles(path = null) {
    const targetNode = path ? this.resolveNode(path) : this.resolveNode(this.currentPath);

    if (!targetNode || targetNode.type !== 'directory') {
      throw new Error(`Invalid directory path`);
    }

    return Object.keys(targetNode.children).map(key => {
        const child = targetNode.children[key];
        return child.type === 'directory' ? `${key}/` : key;
    });
  }

  readFile(path) {
    const targetNode = this.resolveNode(path);
    
    if (!targetNode) {
      throw new Error(`File not found: ${path}`);
    }
    
    if (targetNode.type !== 'file') {
      throw new Error(`${path} is a directory`);
    }

    return targetNode.content;
  }

  getCurrentPath() {
    return this.currentPath;
  }
}
