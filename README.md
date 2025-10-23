# Tubi Playlist Builder

A beautiful, interactive playlist builder and gallery for **real Tubi content**. Now fully integrated with Tubi's backend API!

## 🎬 Features

### Gallery Page (Home)
- 📚 Browse all community playlists
- 🔍 Search by title or creator
- 🔥 Sort by votes or recent activity
- 👍 Upvote your favorite playlists

### Playlist Builder (/create)
- 🎬 **Real Tubi Content** - Search the actual Tubi catalog
- 🖼️ **Real Cover Art** - Professional posters from Tubi
- 🔗 **Deep Links** - Click titles to open on Tubi
- 🎨 Auto-generated cover art based on playlist mood
- ✨ AI-powered title suggestions
- ↕️ Drag and reorder items
- 📱 Responsive design
- 🎭 Smooth animations with Framer Motion
- 💾 Local storage persistence

## 🚀 Quick Start (With Tubi Integration)

**Option 1: Use the start script (Recommended)**

```bash
# This starts both the API server and PlayApp
./start-with-api.sh
```

**Option 2: Manual start**

```bash
# Terminal 1: Start the Tubi API server (chatgpt-app)
cd /Users/asriram/chatgpt-app
npm run build
npm start
# Server runs on http://localhost:3000

# Terminal 2: Start PlayApp
cd /Users/asriram/plylist
npm install
npm run dev
# App runs on http://localhost:3001
```

Then open http://localhost:3001 in your browser.

## 📚 Documentation

- **[TUBI_INTEGRATION.md](./TUBI_INTEGRATION.md)** - Complete integration guide, API reference, and troubleshooting

## Technology Stack

- **Next.js 14** - React framework
- **TypeScript** - Type safety
- **Tailwind CSS** - Styling
- **Framer Motion** - Animations
- **shadcn/ui** - UI components
- **Lucide React** - Icons

## Usage

### Home Page (/)
1. Browse featured and community playlists
2. Search for playlists by title or creator
3. Sort by top voted or most recent
4. Click "Create Playlist" to start building
5. Upvote playlists you enjoy

### Playlist Builder (/create)
1. **Search** - Type any query (e.g., "action movies", "comedy series") to search real Tubi content
2. **Click to View** - Click any title poster or name to open it on Tubi in a new tab
3. **Add to Playlist** - Click the + button to add titles to your playlist (up to 10)
4. **Reorder** - Use the arrow buttons to reorder items in your playlist
5. **Auto-Title** - Use the "Suggest" button to generate creative playlist titles
6. **Publish** - When you have 5-10 titles, click "Publish" to save your playlist
7. **View Gallery** - Click "Tubi Playlists" in the header to see all playlists

## 🔗 Deep Links

Click any title to open it directly on Tubi:
- Movies: `https://tubitv.com/movies/{id}`
- Series: `https://tubitv.com/series/{id}`

## 🎯 Example Searches

Try these searches to get started:
- "action movies"
- "horror films"
- "romantic comedy"
- "sci-fi series"
- "documentaries"

