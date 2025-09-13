const fs = require('fs');
const path = require('path');
const glob = require('glob');

class EndpointScanner {
  constructor() {
    this.endpoints = [];
    this.apiBasePath = path.join(process.cwd(), 'src/app/api');
  }

  // Extract HTTP methods from route files
  extractMethods(content) {
    const methods = [];
    const methodRegex = /export\s+(?:async\s+)?function\s+(GET|POST|PUT|DELETE|PATCH|HEAD|OPTIONS)/g;
    let match;
    while ((match = methodRegex.exec(content)) !== null) {
      methods.push(match[1]);
    }
    return methods;
  }

  // Extract request/response examples from comments
  extractExamples(content) {
    const examples = {
      request: null,
      response: null
    };

    // Look for @example or example comments
    const exampleRegex = /\/\*\*[\s\S]*?@example[\s\S]*?\*\//g;
    const matches = content.match(exampleRegex);
    
    if (matches) {
      // Parse examples from JSDoc comments
      matches.forEach(match => {
        if (match.includes('request:')) {
          const requestMatch = match.match(/request:\s*({[\s\S]*?})/);
          if (requestMatch) {
            try {
              examples.request = JSON.parse(requestMatch[1]);
            } catch (e) {
              // Invalid JSON, skip
            }
          }
        }
        if (match.includes('response:')) {
          const responseMatch = match.match(/response:\s*({[\s\S]*?})/);
          if (responseMatch) {
            try {
              examples.response = JSON.parse(responseMatch[1]);
            } catch (e) {
              // Invalid JSON, skip
            }
          }
        }
      });
    }

    return examples;
  }

  // Extract parameters from the code
  extractParameters(content, method) {
    const params = {
      query: [],
      body: null,
      headers: []
    };

    // Extract query parameters
    const queryParamRegex = /searchParams\.get\(['"](\w+)['"]\)/g;
    let match;
    while ((match = queryParamRegex.exec(content)) !== null) {
      params.query.push({
        key: match[1],
        value: `{{${match[1]}}`,
        description: `${match[1]} parameter`
      });
    }

    // Extract body schema for POST/PUT/PATCH
    if (['POST', 'PUT', 'PATCH'].includes(method)) {
      const bodyRegex = /await\s+request\.json\(\)/;
      if (bodyRegex.test(content)) {
        // Try to extract destructured parameters
        const destructureRegex = /const\s*{\s*([^}]+)\s*}\s*=\s*await\s+request\.json\(\)/;
        const destructureMatch = content.match(destructureRegex);
        if (destructureMatch) {
          const fields = destructureMatch[1].split(',').map(f => f.trim());
          const bodyObj = {};
          fields.forEach(field => {
            const fieldName = field.split(':')[0].trim();
            bodyObj[fieldName] = `{{${fieldName}}}`;
          });
          params.body = JSON.stringify(bodyObj, null, 2);
        } else {
          // Generic body
          params.body = '{\n  "key": "value"\n}';
        }
      }
    }

    return params;
  }

  // Convert file path to API endpoint path
  filePathToEndpoint(filePath) {
    const relativePath = path.relative(this.apiBasePath, filePath);
    const parts = relativePath.split(path.sep);
    
    // Remove 'route.js' or 'route.ts' from the end
    if (parts[parts.length - 1].match(/^route\.(js|ts)$/)) {
      parts.pop();
    }

    // Join with forward slashes and prepend /api/
    return '/api/' + parts.join('/');
  }

  // Scan a single route file
  scanRouteFile(filePath) {
    const content = fs.readFileSync(filePath, 'utf-8');
    const methods = this.extractMethods(content);
    const endpoint = this.filePathToEndpoint(filePath);
    const examples = this.extractExamples(content);

    methods.forEach(method => {
      const params = this.extractParameters(content, method);
      
      // Determine name based on endpoint and method
      let name = `${method} ${endpoint}`;
      if (endpoint.includes('chat')) {
        name = method === 'POST' ? 'Send Chat Message' : `${method} Chat`;
      } else if (endpoint.includes('farming')) {
        if (method === 'GET') {
          name = 'Get Farm Data';
        } else if (method === 'POST') {
          name = 'Farm Action';
        }
      }

      this.endpoints.push({
        name,
        method,
        endpoint,
        path: endpoint.split('/').filter(p => p),
        params,
        examples,
        filePath: path.relative(process.cwd(), filePath)
      });
    });
  }

  // Scan all API routes
  scan() {
    this.endpoints = []; // Reset endpoints
    
    // Find all route files
    const routeFiles = glob.sync('src/app/api/**/route.{js,ts}', {
      cwd: process.cwd()
    });

    routeFiles.forEach(file => {
      const fullPath = path.join(process.cwd(), file);
      this.scanRouteFile(fullPath);
    });

    // Also check pages/api if it exists
    if (fs.existsSync(path.join(process.cwd(), 'src/pages/api'))) {
      const pagesApiFiles = glob.sync('src/pages/api/**/*.{js,ts}', {
        cwd: process.cwd()
      });

      pagesApiFiles.forEach(file => {
        const fullPath = path.join(process.cwd(), file);
        const content = fs.readFileSync(fullPath, 'utf-8');
        
        // Pages API routes typically export default handler
        if (content.includes('export default')) {
          const methods = ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'].filter(m => 
            content.includes(`req.method === '${m}'`) || 
            content.includes(`req.method === "${m}"`)
          );
          
          if (methods.length === 0) {
            methods.push('GET'); // Default to GET if no method check found
          }

          const endpoint = '/api/' + path.relative(
            path.join(process.cwd(), 'src/pages/api'),
            fullPath
          ).replace(/\.(js|ts)$/, '').replace(/\\/g, '/');

          methods.forEach(method => {
            this.endpoints.push({
              name: `${method} ${endpoint}`,
              method,
              endpoint,
              path: endpoint.split('/').filter(p => p),
              params: this.extractParameters(content, method),
              examples: this.extractExamples(content),
              filePath: path.relative(process.cwd(), fullPath)
            });
          });
        }
      });
    }

    return this.endpoints;
  }

  // Get endpoints grouped by path
  getGroupedEndpoints() {
    const groups = {};
    
    this.endpoints.forEach(endpoint => {
      const groupName = endpoint.path[1] || 'root'; // api/[group]/...
      if (!groups[groupName]) {
        groups[groupName] = {
          name: groupName.charAt(0).toUpperCase() + groupName.slice(1) + ' API',
          description: `${groupName} related endpoints`,
          endpoints: []
        };
      }
      groups[groupName].endpoints.push(endpoint);
    });

    return groups;
  }
}

module.exports = EndpointScanner;

// If running directly, output the scan results
if (require.main === module) {
  const scanner = new EndpointScanner();
  const endpoints = scanner.scan();
  console.log(JSON.stringify({
    total: endpoints.length,
    endpoints: endpoints,
    groups: scanner.getGroupedEndpoints()
  }, null, 2));
}