const chokidar = require('chokidar');
const path = require('path');

// Load environment variables
require('dotenv').config({ path: '.env.local' });

const PostmanSync = require('./sync-postman');
const config = require('../postman.config');

class ApiWatcher {
  constructor() {
    this.sync = new PostmanSync();
    this.debounceTimer = null;
    this.debounceDelay = 2000; // 2 seconds debounce
    this.isUpdating = false;
  }

  // Debounced sync function
  debouncedSync() {
    clearTimeout(this.debounceTimer);
    
    this.debounceTimer = setTimeout(async () => {
      if (this.isUpdating) {
        console.log('⏳ Update already in progress, skipping...');
        return;
      }

      this.isUpdating = true;
      
      try {
        console.log('🔍 Checking for API changes...');
        const hasChanges = await this.sync.checkForChanges();
        
        if (hasChanges) {
          console.log('🔄 API changes detected, syncing with Postman...');
          await this.sync.updateCollection();
          console.log('✨ Sync complete!');
        } else {
          console.log('ℹ️  No structural changes detected');
        }
      } catch (error) {
        console.error('❌ Sync failed:', error.message);
      } finally {
        this.isUpdating = false;
      }
    }, this.debounceDelay);
  }

  // Start watching API files
  start() {
    console.log('👁️  Starting API file watcher...');
    console.log('📁 Watching paths:', config.watchPaths);

    // Initialize watcher
    const watcher = chokidar.watch(config.watchPaths, {
      persistent: true,
      ignoreInitial: true,
      awaitWriteFinish: {
        stabilityThreshold: 1000,
        pollInterval: 100
      }
    });

    // File added
    watcher.on('add', (filePath) => {
      console.log(`➕ New API file: ${path.relative(process.cwd(), filePath)}`);
      this.debouncedSync();
    });

    // File changed
    watcher.on('change', (filePath) => {
      console.log(`📝 API file changed: ${path.relative(process.cwd(), filePath)}`);
      this.debouncedSync();
    });

    // File removed
    watcher.on('unlink', (filePath) => {
      console.log(`➖ API file removed: ${path.relative(process.cwd(), filePath)}`);
      this.debouncedSync();
    });

    // Watcher ready
    watcher.on('ready', () => {
      console.log('✅ API watcher is ready!');
      console.log('📌 Postman collection will auto-sync when API files change');
      console.log('   Press Ctrl+C to stop watching\n');
      
      // Initial sync
      this.debouncedSync();
    });

    // Handle errors
    watcher.on('error', (error) => {
      console.error('❌ Watcher error:', error);
    });

    // Handle process termination
    process.on('SIGINT', () => {
      console.log('\n👋 Stopping API watcher...');
      watcher.close();
      process.exit(0);
    });
  }
}

// Start the watcher
if (require.main === module) {
  const watcher = new ApiWatcher();
  watcher.start();
}