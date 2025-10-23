# Tubi PlayApp Integration Guide

## Overview

PlayApp is now fully integrated with the Tubi backend through the chatgpt-app API server. This integration provides:

✅ **Real Tubi Content** - Search and browse actual titles from Tubi's catalog  
✅ **Real Cover Art** - Professional poster images from Tubi  
✅ **Rich Metadata** - Descriptions, cast, genres, ratings, and more  
✅ **Deep Linking** - Click any title to open it on Tubi  
✅ **Playlist Management** - Create and share playlists with real Tubi content

## Architecture

```
┌─────────────────┐         ┌─────────────────┐         ┌─────────────────┐
│   PlayApp       │         │  chatgpt-app    │         │   Tubi API      │
│   (Next.js)     │  HTTP   │  (Express)      │  HTTPS  │   (Production)  │
│   Port 3001     │────────>│  Port 3000      │────────>│                 │
│                 │         │                 │         │                 │
│  • Search UI    │         │  • REST API     │         │  • Search       │
│  • Playlists    │         │  • Token Mgmt   │         │  • Browse       │
│  • Cover Art    │         │  • CORS         │         │  • Metadata     │
└─────────────────┘         └─────────────────┘         └─────────────────┘
```

## Setup Instructions

### 1. Start the API Server (chatgpt-app)

```bash
# Terminal 1: Start the Tubi API server
cd /Users/asriram/chatgpt-app

# Install dependencies (if not already done)
npm install

# Build the server
npm run build

# Start the server on port 3000
npm start
```

**Expected output:**
```
✅ MCP Server running on http://localhost:3000
📍 MCP endpoint: http://localhost:3000/mcp
🏥 Health checks:
   • Liveness:  http://localhost:3000/healthz
   • Readiness: http://localhost:3000/healthz/readiness
   • Legacy:    http://localhost:3000/health

🔍 Test with MCP Inspector:
   npx @modelcontextprotocol/inspector http://localhost:3000/mcp
```

### 2. Start the PlayApp Frontend

```bash
# Terminal 2: Start the PlayApp
cd /Users/asriram/plylist

# Install dependencies (if not already done)
npm install

# Start the Next.js dev server
npm run dev
```

**Expected output:**
```
   ▲ Next.js 14.2.0
   - Local:        http://localhost:3000
   - Ready in 2.3s
```

**Note:** If port 3000 is already in use (by chatgpt-app), Next.js will automatically use port 3001.

### 3. Open PlayApp in Your Browser

Navigate to:
- http://localhost:3001 (or whichever port Next.js is using)

## API Endpoints

The chatgpt-app server provides these REST API endpoints for PlayApp:

### Search Content
```bash
GET http://localhost:3000/api/search?q=<query>&limit=20

# Example
curl "http://localhost:3000/api/search?q=action+movies&limit=10"
```

**Response:**
```json
{
  "contents": [
    {
      "id": "100000123",
      "title": "Die Hard",
      "type": "v",
      "year": 1988,
      "description": "...",
      "thumbnails": ["https://..."],
      "posterarts": ["https://..."],
      "tags": ["Action", "Thriller"],
      "ratings": [{"code": "R", "system": "mpaa"}]
    }
  ],
  "total": 42
}
```

### Browse Categories
```bash
GET http://localhost:3000/api/browse?mode=<mode>

# mode can be: movie, tv, latino, linear, or omit for all
curl "http://localhost:3000/api/browse?mode=movie"
```

### Get Container Details
```bash
GET http://localhost:3000/api/container/:containerId?limit=<limit>

# Example
curl "http://localhost:3000/api/container/featured-movies?limit=20"
```

### Get Content Details
```bash
GET http://localhost:3000/api/content/:contentId

# Example
curl "http://localhost:3000/api/content/100000123"
```

## Features

### 1. Search Real Tubi Content

- Type any search query in the search box
- Results are fetched from Tubi's catalog in real-time
- Searches are debounced (500ms) to avoid excessive API calls
- Shows loading spinner while searching

### 2. Real Cover Art

- All titles display actual poster art from Tubi
- Fallback to generated gradients if images fail to load
- Images are lazy-loaded for performance

### 3. Deep Linking to Tubi

- Click any title poster or name to open on Tubi
- Opens in a new tab: `https://tubitv.com/movies/{id}` or `/series/{id}`
- Works for both movies and series

### 4. Create Playlists

- Search for up to 10 titles
- Drag to reorder (using arrow buttons)
- Auto-generated playlist cover based on content mood
- AI-suggested playlist titles
- Save to localStorage (persists across sessions)

### 5. Browse Playlists

- View all saved playlists on the homepage
- Sort by votes or recency
- Search playlists by name or creator
- Vote on playlists

## File Structure

### chatgpt-app (API Server)

```
chatgpt-app/
├── src/
│   ├── server.ts                # Added REST API endpoints (lines 223-320)
│   ├── tubi-api/
│   │   ├── search-v2.ts        # Tubi search API wrapper
│   │   ├── browse-list.ts      # Browse categories API
│   │   ├── container-details.ts # Container contents API
│   │   └── common.ts           # Token generation & auth
│   └── handlers/               # MCP handlers (not used by PlayApp)
```

### plylist (PlayApp Frontend)

```
plylist/
├── lib/
│   └── tubi-api.ts             # NEW: API client for chatgpt-app
├── app/
│   ├── page.tsx                # Homepage (browse playlists)
│   └── create/
│       └── page.tsx            # UPDATED: Search & create with real Tubi data
├── components/
│   ├── PlaylistCard.tsx        # Playlist card component
│   └── Header.tsx              # App header
└── TUBI_INTEGRATION.md         # This file
```

## Environment Variables (Optional)

### chatgpt-app

No environment variables are required! The server automatically generates Tubi access tokens.

**Optional overrides:**
```bash
# .env (optional)
TUBI_API_BASE=https://search.production-public.tubi.io
TUBI_ACCESS_TOKEN=your_token_here  # Skip auto-generation
PORT=3000
```

### plylist

```bash
# .env.local (optional)
NEXT_PUBLIC_TUBI_API_URL=http://localhost:3000
```

Default: `http://localhost:3000` (no config needed)

## Testing the Integration

### 1. Test API Server Health

```bash
# Check if server is running
curl http://localhost:3000/health

# Expected response:
# {"status":"ok","server":"tubi-mcp-server","version":"1.0.0"}
```

### 2. Test Search API

```bash
# Search for action movies
curl "http://localhost:3000/api/search?q=action&limit=5"

# Should return JSON with real Tubi content
```

### 3. Test PlayApp UI

1. Open http://localhost:3001
2. Click "Create Playlist"
3. Type "horror" in search box
4. Wait 500ms for results to load
5. Click on any movie poster → should open Tubi in new tab
6. Click the + button to add to playlist
7. Add 5-10 titles and click "Publish"

### 4. Test Deep Links

Click any title in the search results or playlist. It should open one of:
- `https://tubitv.com/movies/{contentId}` (for movies)
- `https://tubitv.com/series/{contentId}` (for TV series)

## Troubleshooting

### "Failed to fetch" errors in PlayApp

**Problem:** PlayApp can't reach the API server

**Solutions:**
1. Verify chatgpt-app is running: `curl http://localhost:3000/health`
2. Check the port (should be 3000)
3. Check browser console for CORS errors
4. Make sure both servers are running

### No search results

**Problem:** Tubi API returns empty results

**Solutions:**
1. Check chatgpt-app console for API errors
2. Try a different search term (e.g., "action", "comedy")
3. Verify Tubi API token is valid (auto-generated on startup)

### Images not loading

**Problem:** Cover art doesn't display

**Solutions:**
1. Check browser console for image load errors
2. Verify Tubi API returned image URLs in the response
3. Check if images are blocked by ad blocker
4. Fallback gradients should display if images fail

### Port conflicts

**Problem:** Port 3000 or 3001 already in use

**Solutions:**
```bash
# Kill process on port 3000
lsof -ti:3000 | xargs kill -9

# Or use different port for chatgpt-app
PORT=3002 npm start

# Update PlayApp API URL
# In plylist/.env.local:
NEXT_PUBLIC_TUBI_API_URL=http://localhost:3002
```

## Performance Notes

### API Call Optimization

- Search is debounced by 500ms to reduce API calls
- Initial page load fetches "popular movies" by default
- Results are limited to 30-50 items for fast loading
- No caching (for MVP), but can be added if needed

### Image Loading

- Images are loaded on-demand (not preloaded)
- Fallback gradients for failed images
- Consider adding image CDN/proxy for production

## Next Steps & Production Considerations

### For Local Development (Current State)
✅ Fully functional for local testing  
✅ No auth needed (local-only)  
✅ Automatic token generation  
✅ CORS enabled for localhost  

### For Production Deployment
🔴 **DO NOT DEPLOY AS-IS** - Several changes needed:

1. **Authentication**
   - Add OAuth 2.0 for user identity
   - API key authentication for PlayApp → chatgpt-app
   - Rate limiting per user/IP

2. **Security**
   - Remove CORS wildcard (`*`)
   - Add proper CORS whitelist
   - Add request validation & sanitization
   - Add HTTPS/TLS

3. **Scaling**
   - Add Redis/Memcached for API response caching
   - Add database for playlist persistence (PostgreSQL/MongoDB)
   - Add CDN for images (CloudFront, Cloudflare)
   - Add load balancer

4. **Monitoring**
   - Add logging (Winston, Pino)
   - Add error tracking (Sentry, Rollbar)
   - Add metrics (Prometheus, Datadog)
   - Add health checks & alerting

## API Client Reference

See `lib/tubi-api.ts` for the complete API client implementation.

### Key Functions

```typescript
// Search Tubi content
const results = await searchTubiContent("action movies", 20);

// Get browse categories
const categories = await getBrowseCategories("movie");

// Get container contents
const contents = await getContainerContents("featured-movies", 20);

// Get content details
const movie = await getContentDetails("100000123");

// Helper: Get best thumbnail
const thumbnail = getBestThumbnail(content);

// Helper: Generate deep link
const link = getTubiDeepLink(contentId, "v"); // "v" or "s"

// Helper: Format duration
const duration = formatDuration(7200); // "2h 0m"
```

## Support

For issues or questions:
1. Check chatgpt-app console for API errors
2. Check browser console for frontend errors
3. Verify both servers are running
4. Review this guide's troubleshooting section

## Summary

✅ **Status:** Fully integrated and working locally  
🎯 **Purpose:** MVP for Tubi playlist feature  
⚡ **Performance:** Fast search, real-time results  
🔗 **Deep Links:** Direct links to Tubi content  
🎨 **UI:** Beautiful, responsive, modern design  

**Enjoy building Tubi playlists!** 🎬✨

