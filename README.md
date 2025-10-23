# Tubi Playlist Builder

A beautiful, interactive playlist builder and gallery for Tubi content.

## Features

### Gallery Page (Home)
- 📚 Browse all community playlists
- 🔍 Search by title or creator
- 🔥 Sort by votes or recent activity
- 👍 Upvote your favorite playlists

### Playlist Builder (/create)
- 🎨 Auto-generated cover art based on playlist mood
- 🔍 Real-time search functionality
- ✨ AI-powered title suggestions
- ↕️ Drag and reorder items
- 📱 Responsive design
- 🎭 Smooth animations with Framer Motion
- 💾 Local storage persistence

## Getting Started

1. Install dependencies:
```bash
npm install
```

2. Run the development server:
```bash
npm run dev
```

3. Open [http://localhost:3000](http://localhost:3000) in your browser.

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
1. Search for Tubi titles using the search bar
2. Click the + button to add titles to your playlist
3. Reorder items using the arrow buttons
4. Use the "Suggest" button to generate creative playlist titles
5. Publish when you have 5-10 titles
6. Click "Gallery" to return home and view your published playlist

## Note

This is a hackathon MVP with mock data. In production, replace the mock catalog with actual Tubi API calls.

