const fs = require('fs');
const path = require('path');
const EndpointScanner = require('./scan-endpoints');

// Load environment variables
require('dotenv').config({ path: '.env.local' });

const config = require('../postman.config');

class PostmanSync {
  constructor() {
    this.config = config;
    this.apiKey = process.env.NEXT_PUBLIC_POSTMAN_API || config.apiKey;
    this.collectionId = config.collection.id;
    this.scanner = new EndpointScanner();
  }

  // Generate Postman request item from endpoint data
  generateRequestItem(endpoint) {
    const url = {
      raw: `{{base_url}}${endpoint.endpoint}`,
      host: ['{{base_url}}'],
      path: endpoint.path.filter(p => p !== 'api')
    };

    // Add query parameters if any
    if (endpoint.params.query.length > 0) {
      url.query = endpoint.params.query;
    }

    const request = {
      method: endpoint.method,
      header: [
        {
          key: 'Content-Type',
          value: 'application/json'
        }
      ],
      url
    };

    // Add body for POST/PUT/PATCH requests
    if (endpoint.params.body) {
      request.body = {
        mode: 'raw',
        raw: endpoint.params.body
      };
    }

    // Generate response examples
    const responses = [];
    if (endpoint.examples.response) {
      responses.push({
        name: 'Successful Response',
        status: 'OK',
        code: 200,
        body: JSON.stringify(endpoint.examples.response, null, 2)
      });
    }

    return {
      name: endpoint.name,
      request,
      response: responses,
      _postman_isSubFolder: false
    };
  }

  // Build complete Postman collection
  buildCollection() {
    const endpoints = this.scanner.scan();
    const groups = this.scanner.getGroupedEndpoints();

    const collection = {
      info: {
        _postman_id: this.collectionId,
        name: this.config.collection.name,
        description: this.config.collection.description,
        schema: 'https://schema.getpostman.com/json/collection/v2.1.0/collection.json',
        version: '1.0.0'
      },
      variable: this.config.variables,
      item: []
    };

    // Create folders for each API group
    Object.keys(groups).forEach(groupKey => {
      const group = groups[groupKey];
      const folder = {
        name: group.name,
        description: group.description,
        item: group.endpoints.map(endpoint => this.generateRequestItem(endpoint))
      };
      collection.item.push(folder);
    });

    // Add test scenarios folder
    collection.item.push({
      name: 'Test Scenarios',
      description: 'Automated test scenarios',
      item: this.generateTestScenarios()
    });

    // Add pre-request and test scripts
    collection.event = [
      {
        listen: 'prerequest',
        script: {
          type: 'text/javascript',
          exec: [
            '// Auto-generated pre-request script',
            'pm.environment.set("timestamp", new Date().toISOString());',
            '',
            '// Log request details',
            'console.log("Request:", pm.request.method, pm.request.url.toString());'
          ]
        }
      },
      {
        listen: 'test',
        script: {
          type: 'text/javascript',
          exec: [
            '// Auto-generated test script',
            'pm.test("Response time is acceptable", function () {',
            '    pm.expect(pm.response.responseTime).to.be.below(2000);',
            '});',
            '',
            'pm.test("Response has valid content type", function () {',
            '    const contentType = pm.response.headers.get("Content-Type");',
            '    if (contentType) {',
            '        pm.expect(contentType).to.include("application/json");',
            '    }',
            '});',
            '',
            'if (pm.response.code === 200) {',
            '    pm.test("Response has valid JSON body", function () {',
            '        pm.response.to.have.jsonBody();',
            '    });',
            '}'
          ]
        }
      }
    ];

    return collection;
  }

  // Generate test scenarios based on endpoints
  generateTestScenarios() {
    const scenarios = [];

    // Add health check
    scenarios.push({
      name: 'Health Check',
      request: {
        method: 'GET',
        header: [],
        url: {
          raw: '{{base_url}}/api/farming',
          host: ['{{base_url}}'],
          path: ['api', 'farming']
        }
      }
    });

    // Add error handling test
    scenarios.push({
      name: 'Error Handling Test',
      request: {
        method: 'POST',
        header: [
          {
            key: 'Content-Type',
            value: 'application/json'
          }
        ],
        body: {
          mode: 'raw',
          raw: JSON.stringify({
            action: 'invalid_action',
            poolId: 999
          }, null, 2)
        },
        url: {
          raw: '{{base_url}}/api/farming',
          host: ['{{base_url}}'],
          path: ['api', 'farming']
        }
      }
    });

    return scenarios;
  }

  // Update Postman collection via API
  async updateCollection() {
    try {
      const collection = this.buildCollection();
      
      console.log('📦 Updating Postman collection...');
      
      const response = await fetch(`https://api.getpostman.com/collections/${this.collectionId}`, {
        method: 'PUT',
        headers: {
          'X-API-Key': this.apiKey,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ collection })
      });

      const result = await response.json();
      
      if (response.ok) {
        console.log('✅ Postman collection updated successfully!');
        console.log(`   Collection ID: ${this.collectionId}`);
        console.log(`   Total endpoints: ${this.scanner.endpoints.length}`);
        
        // Save local backup
        const backupPath = path.join(process.cwd(), 'GrowIQ_API_Collection.postman_collection.json');
        fs.writeFileSync(backupPath, JSON.stringify(collection, null, 2));
        console.log(`   Local backup saved: ${backupPath}`);
        
        return result;
      } else {
        throw new Error(result.error?.message || 'Failed to update collection');
      }
    } catch (error) {
      console.error('❌ Error updating Postman collection:', error.message);
      throw error;
    }
  }

  // Compare current endpoints with last known state
  async checkForChanges() {
    const stateFile = path.join(process.cwd(), '.postman-sync-state.json');
    const currentEndpoints = this.scanner.scan();
    
    let hasChanges = false;
    let lastState = {};
    
    if (fs.existsSync(stateFile)) {
      lastState = JSON.parse(fs.readFileSync(stateFile, 'utf-8'));
    }
    
    // Convert endpoints to comparable format
    const currentState = {};
    currentEndpoints.forEach(ep => {
      const key = `${ep.method}:${ep.endpoint}`;
      currentState[key] = {
        filePath: ep.filePath,
        params: ep.params
      };
    });
    
    // Check for changes
    const currentKeys = Object.keys(currentState);
    const lastKeys = Object.keys(lastState);
    
    if (currentKeys.length !== lastKeys.length) {
      hasChanges = true;
    } else {
      for (const key of currentKeys) {
        if (!lastState[key] || 
            JSON.stringify(currentState[key]) !== JSON.stringify(lastState[key])) {
          hasChanges = true;
          break;
        }
      }
    }
    
    if (hasChanges) {
      // Save new state
      fs.writeFileSync(stateFile, JSON.stringify(currentState, null, 2));
      
      // Log changes
      const added = currentKeys.filter(k => !lastKeys.includes(k));
      const removed = lastKeys.filter(k => !currentKeys.includes(k));
      const modified = currentKeys.filter(k => 
        lastState[k] && JSON.stringify(currentState[k]) !== JSON.stringify(lastState[k])
      );
      
      if (added.length > 0) {
        console.log('➕ New endpoints:', added);
      }
      if (removed.length > 0) {
        console.log('➖ Removed endpoints:', removed);
      }
      if (modified.length > 0) {
        console.log('📝 Modified endpoints:', modified);
      }
    }
    
    return hasChanges;
  }
}

module.exports = PostmanSync;

// If running directly, perform sync
if (require.main === module) {
  const sync = new PostmanSync();
  
  (async () => {
    try {
      const hasChanges = await sync.checkForChanges();
      
      if (hasChanges || process.argv.includes('--force')) {
        await sync.updateCollection();
      } else {
        console.log('ℹ️  No changes detected in API endpoints');
      }
    } catch (error) {
      console.error('Failed to sync:', error);
      process.exit(1);
    }
  })();
}