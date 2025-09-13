# Postman API Sync Integration

This project includes automatic synchronization between your API endpoints and Postman collection.

## Features

- **Automatic Detection**: Scans all API routes in `src/app/api` and `src/pages/api`
- **Real-time Sync**: Watches for changes and updates Postman collection automatically
- **Smart Updates**: Only syncs when actual API changes are detected
- **Local Backup**: Maintains a local copy of the collection

## Setup

1. **Environment Variables**
   Add your Postman API key to `.env.local`:
   ```
   NEXT_PUBLIC_POSTMAN_API=your-postman-api-key
   ```

2. **Collection ID**
   The collection ID is already configured in `postman.config.js`:
   ```
   774506e7-3cdc-42c3-9be0-f3c8d0ddfdf0
   ```

## Usage

### Manual Commands

```bash
# Scan API endpoints (dry run)
npm run postman:scan

# Sync with Postman (only if changes detected)
npm run postman:sync

# Force sync with Postman
npm run postman:sync:force

# Watch for changes and auto-sync
npm run postman:watch

# Run dev server with auto-sync
npm run dev:api
```

### Automatic Sync

When you run `npm run postman:watch` or `npm run dev:api`, the system will:

1. Watch all files in `src/app/api/**/*`
2. Detect when you:
   - Add new API routes
   - Modify existing endpoints
   - Remove API files
3. Automatically update your Postman collection
4. Show sync status in the console

### How It Works

1. **Endpoint Scanner** (`scripts/scan-endpoints.js`)
   - Parses route files to find exported HTTP methods (GET, POST, etc.)
   - Extracts parameters from code (query params, body schema)
   - Generates endpoint documentation

2. **Sync Engine** (`scripts/sync-postman.js`)
   - Builds complete Postman collection structure
   - Compares with previous state to detect changes
   - Updates collection via Postman API

3. **File Watcher** (`scripts/watch-api.js`)
   - Monitors API files for changes
   - Debounces rapid changes (2 second delay)
   - Triggers sync when changes stabilize

## Configuration

Edit `postman.config.js` to customize:

- Collection name and description
- Environment variables
- Watch paths
- Base URL

## State Management

The system maintains state in `.postman-sync-state.json` to track:
- Current endpoints
- File paths
- Parameters

This file is used to detect actual changes vs. cosmetic edits.

## Example Workflow

1. Create a new API route:
   ```javascript
   // src/app/api/users/route.js
   export async function GET(request) {
     return NextResponse.json({ users: [] });
   }
   
   export async function POST(request) {
     const body = await request.json();
     return NextResponse.json({ created: true });
   }
   ```

2. The watcher detects the new file
3. Scanner extracts the GET and POST methods
4. Sync engine updates Postman collection
5. Your Postman collection now has the new endpoints!

## Troubleshooting

- **No changes detected**: Check `.postman-sync-state.json` and delete it to force a full rescan
- **API key issues**: Verify your Postman API key in `.env.local`
- **Collection not updating**: Use `npm run postman:sync:force` to force update

## Collection Structure

The generated collection includes:
- Organized folders by API group (chat, farming, etc.)
- Environment variables for configuration
- Pre-request scripts for timestamps
- Test scripts for response validation
- Example requests and responses