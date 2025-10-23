"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus, Search, TrendingUp, Clock, ArrowUp } from "lucide-react";
import PlaylistCard from "@/components/PlaylistCard";
import Header from "@/components/Header";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";

interface PlaylistItem {
  id: string;
  title: string;
  thumbnail?: string;
  year?: string;
  type?: string;
  genres?: string[];
}

interface Playlist {
  id: string;
  title: string;
  creator?: string;
  description?: string;
  itemCount: number;
  votes: number;
  coverColor: string;
  thumbnails: string[];
  createdAt: Date;
  items?: PlaylistItem[];
  coverCss?: string;
}

// Mock data for initial display
const mockPlaylists: Playlist[] = [
  {
    id: "1",
    title: "Ultimate Sci-Fi Collection",
    creator: "MovieBuff2024",
    description: "A carefully curated collection of mind-bending sci-fi masterpieces that explore the boundaries of imagination and technology.",
    itemCount: 12,
    votes: 234,
    coverColor: "#8B5CF6",
    thumbnails: [],
    createdAt: new Date("2024-01-15"),
    items: [
      { id: "1", title: "Interstellar Journey", thumbnail: "https://images.unsplash.com/photo-1536440136628-849c177e76a1?w=300&h=400&fit=crop", year: "2023", type: "movie", genres: ["Sci-Fi", "Drama"] },
      { id: "2", title: "The Matrix Reborn", thumbnail: "https://images.unsplash.com/photo-1574267432644-f637eca6d2c4?w=300&h=400&fit=crop", year: "2022", type: "movie", genres: ["Sci-Fi", "Action"] },
      { id: "3", title: "Blade Runner 2099", thumbnail: "https://images.unsplash.com/photo-1446776653964-20c1d3a81b06?w=300&h=400&fit=crop", year: "2024", type: "movie", genres: ["Sci-Fi", "Thriller"] },
      { id: "4", title: "Alien Contact", thumbnail: "https://images.unsplash.com/photo-1509347528160-9a9e33742cdb?w=300&h=400&fit=crop", year: "2023", type: "movie", genres: ["Sci-Fi", "Horror"] },
    ],
  },
  {
    id: "2",
    title: "Classic Action Heroes",
    creator: "ActionFan",
    description: "Non-stop adrenaline with legendary action heroes and explosive sequences that defined a generation.",
    itemCount: 8,
    votes: 189,
    coverColor: "#EC4899",
    thumbnails: [],
    createdAt: new Date("2024-01-20"),
    items: [
      { id: "5", title: "Die Hard Legacy", thumbnail: "https://images.unsplash.com/photo-1509347528160-9a9e33742cdb?w=300&h=400&fit=crop", year: "2021", type: "movie", genres: ["Action", "Thriller"] },
      { id: "6", title: "The Expendables", thumbnail: "https://images.unsplash.com/photo-1594908900066-3f47337549d8?w=300&h=400&fit=crop", year: "2020", type: "movie", genres: ["Action", "Adventure"] },
      { id: "7", title: "Rapid Fire", thumbnail: "https://images.unsplash.com/photo-1478720568477-152d9b164e26?w=300&h=400&fit=crop", year: "2022", type: "movie", genres: ["Action", "Crime"] },
      { id: "8", title: "Maximum Force", thumbnail: "https://images.unsplash.com/photo-1536440136628-849c177e76a1?w=300&h=400&fit=crop", year: "2023", type: "movie", genres: ["Action", "Drama"] },
    ],
  },
  {
    id: "3",
    title: "Mind-Bending Thrillers",
    creator: "CinemaLover",
    description: "Psychological thrillers that will keep you guessing until the very end. Prepare to question everything.",
    itemCount: 15,
    votes: 156,
    coverColor: "#3B82F6",
    thumbnails: [],
    createdAt: new Date("2024-01-10"),
    items: [
      { id: "9", title: "Inception Dreams", thumbnail: "https://images.unsplash.com/photo-1574267432644-f637eca6d2c4?w=300&h=400&fit=crop", year: "2022", type: "movie", genres: ["Thriller", "Sci-Fi"] },
      { id: "10", title: "Shutter Island", thumbnail: "https://images.unsplash.com/photo-1446776653964-20c1d3a81b06?w=300&h=400&fit=crop", year: "2021", type: "movie", genres: ["Thriller", "Mystery"] },
      { id: "11", title: "The Prestige", thumbnail: "https://images.unsplash.com/photo-1594908900066-3f47337549d8?w=300&h=400&fit=crop", year: "2023", type: "movie", genres: ["Thriller", "Drama"] },
    ],
  },
  {
    id: "4",
    title: "Best Drama Collection",
    creator: "DramaQueen",
    description: "Powerful stories that touch the heart and soul. Experience raw emotions and unforgettable performances.",
    itemCount: 20,
    votes: 142,
    coverColor: "#10B981",
    thumbnails: [],
    createdAt: new Date("2024-01-25"),
    items: [
      { id: "12", title: "The Pursuit", thumbnail: "https://images.unsplash.com/photo-1478720568477-152d9b164e26?w=300&h=400&fit=crop", year: "2020", type: "movie", genres: ["Drama", "Biography"] },
      { id: "13", title: "Moonlight Stories", thumbnail: "https://images.unsplash.com/photo-1594908900066-3f47337549d8?w=300&h=400&fit=crop", year: "2021", type: "movie", genres: ["Drama", "Romance"] },
    ],
  },
  {
    id: "5",
    title: "Comedy Gold",
    creator: "LaughTrack",
    description: "Laugh until your sides hurt with these hilarious comedies that never get old.",
    itemCount: 18,
    votes: 128,
    coverColor: "#F59E0B",
    thumbnails: [],
    createdAt: new Date("2024-01-18"),
    items: [
      { id: "14", title: "Super Troopers", thumbnail: "https://images.unsplash.com/photo-1446776653964-20c1d3a81b06?w=300&h=400&fit=crop", year: "2019", type: "movie", genres: ["Comedy", "Crime"] },
      { id: "15", title: "The Hangover", thumbnail: "https://images.unsplash.com/photo-1574267432644-f637eca6d2c4?w=300&h=400&fit=crop", year: "2020", type: "movie", genres: ["Comedy", "Adventure"] },
    ],
  },
  {
    id: "6",
    title: "Horror Marathon",
    creator: "ScreamQueen",
    description: "Terrifying tales that will haunt your dreams. Perfect for a spine-chilling movie night.",
    itemCount: 10,
    votes: 95,
    coverColor: "#EF4444",
    thumbnails: [],
    createdAt: new Date("2024-01-22"),
    items: [
      { id: "16", title: "The Conjuring", thumbnail: "https://images.unsplash.com/photo-1594908900066-3f47337549d8?w=300&h=400&fit=crop", year: "2021", type: "movie", genres: ["Horror", "Thriller"] },
      { id: "17", title: "A Quiet Place", thumbnail: "https://images.unsplash.com/photo-1536440136628-849c177e76a1?w=300&h=400&fit=crop", year: "2022", type: "movie", genres: ["Horror", "Drama"] },
    ],
  },
];

const Index = () => {
  const [playlists, setPlaylists] = useState<Playlist[]>(mockPlaylists);
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState<"votes" | "recent">("votes");
  const [selectedPlaylist, setSelectedPlaylist] = useState<Playlist | null>(null);

  // Load playlists from localStorage on mount
  useEffect(() => {
    const key = "tubi_playlists";
    const stored = localStorage.getItem(key);
    if (stored) {
      try {
        const savedPlaylists = JSON.parse(stored);
        const formatted = savedPlaylists.map((p: any) => ({
          id: p.id,
          title: p.title,
          creator: "You",
          description: p.description || "Created with Tubi Playlist Builder",
          itemCount: p.items?.length || 0,
          votes: p.votes || 0,
          coverColor: extractColorFromGradient(p.coverCss) || "#8B5CF6",
          thumbnails: p.thumbnails || [],
          createdAt: new Date(p.createdAt),
          items: p.items || [],
          coverCss: p.coverCss,
        }));
        setPlaylists([...formatted, ...mockPlaylists]);
      } catch (e) {
        console.error("Failed to load playlists:", e);
      }
    }
  }, []);

  const handleVote = (id: string) => {
    setPlaylists(playlists.map(p =>
      p.id === id ? { ...p, votes: p.votes + 1 } : p
    ));
    
    // Update selectedPlaylist if it's the same one being voted on
    if (selectedPlaylist && selectedPlaylist.id === id) {
      setSelectedPlaylist({ ...selectedPlaylist, votes: selectedPlaylist.votes + 1 });
    }
    
    // Update localStorage if it's a saved playlist
    const key = "tubi_playlists";
    const stored = localStorage.getItem(key);
    if (stored) {
      try {
        const savedPlaylists = JSON.parse(stored);
        const updated = savedPlaylists.map((p: any) =>
          p.id === id ? { ...p, votes: (p.votes || 0) + 1 } : p
        );
        localStorage.setItem(key, JSON.stringify(updated));
      } catch (e) {
        console.error("Failed to update votes:", e);
      }
    }
  };

  const handlePlaylistClick = (id: string) => {
    const playlist = playlists.find(p => p.id === id);
    if (playlist) {
      setSelectedPlaylist(playlist);
    }
  };

  const filteredPlaylists = playlists
    .filter(p =>
      p.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (p.creator && p.creator.toLowerCase().includes(searchQuery.toLowerCase()))
    )
    .sort((a, b) => {
      if (sortBy === "votes") {
        return b.votes === a.votes
          ? b.createdAt.getTime() - a.createdAt.getTime()
          : b.votes - a.votes;
      }
      return b.createdAt.getTime() - a.createdAt.getTime();
    });

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#0f0014] via-[#1a0520] to-[#2a0146]">
      {/* Header + Hero Wrapper with Turple Gradient */}
      <div 
        className="relative"
        style={{
          background: "linear-gradient(15deg, #45009D 0%, #8C00E5 100%)",
        }}
      >
        <Header />
        
        {/* Hero Section */}
        <section className="relative min-h-[65vh] flex items-center justify-center overflow-hidden px-6">
        <div className="absolute inset-0 bg-gradient-to-t from-[#0f0014] via-[#0f0014]/60 to-transparent" />
        <div className="relative z-10 flex w-full max-w-[820px] flex-col items-center text-center gap-6 sm:gap-8 md:gap-10 lg:gap-12">
          <h1 className="m-0 text-5xl md:text-6xl text-white font-tubi-black leading-tight tracking-[-0.01em]">
            Tubi <span className="bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">Playlists</span>
          </h1>
          <p className="m-0 text-xl text-white/80 font-inter leading-relaxed">
            Create and share curated playlists of your favorite Tubi content
          </p>
          <Link href="/create" className="m-0">
            <Button
              size="lg"
              className="gap-2 text-lg px-8 h-14 shadow-lg transition-all hover:shadow-xl bg-[#FFFF13] hover:bg-[#FFFF13]/85 active:bg-[#FFFF13]/70 text-black font-bold"
            >
              <Plus className="w-5 h-5" />
              Create Playlist
            </Button>
          </Link>
        </div>
      </section>
      </div>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-6 py-12">
        {/* Search & Filter Bar */}
        <div className="flex flex-col md:flex-row gap-4 mb-8">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-white/60" />
            <Input
              placeholder="Search playlists or creators..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 bg-white/10 border-white/20 text-white placeholder:text-white/60 h-12"
            />
          </div>
          <div className="flex gap-2">
            <Button
              variant={sortBy === "votes" ? "default" : "playlist"}
              onClick={() => setSortBy("votes")}
              className="gap-2"
            >
              <TrendingUp className="w-4 h-4" />
              Top Voted
            </Button>
            <Button
              variant={sortBy === "recent" ? "default" : "playlist"}
              onClick={() => setSortBy("recent")}
              className="gap-2"
            >
              <Clock className="w-4 h-4" />
              Recent
            </Button>
          </div>
        </div>

        {/* Playlists Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredPlaylists.map((playlist) => (
            <PlaylistCard
              key={playlist.id}
              playlist={playlist}
              onVote={handleVote}
              onClick={handlePlaylistClick}
            />
          ))}
        </div>

        {filteredPlaylists.length === 0 && (
          <div className="text-center py-20">
            <p className="text-xl text-white/70 font-inter">No playlists found</p>
            <p className="text-sm text-white/60 mt-2 font-inter">Try a different search term</p>
          </div>
        )}
      </main>

      {/* Playlist Detail Modal */}
      <Dialog open={!!selectedPlaylist} onOpenChange={() => setSelectedPlaylist(null)}>
        <DialogContent 
          className="max-w-4xl max-h-[90vh] overflow-y-auto text-white border-purple-500/30"
          style={{
            background: "linear-gradient(15deg, #45009D 0%, #8C00E5 100%)",
          }}
        >
          {selectedPlaylist && (
            <>
              <DialogHeader>
                <DialogTitle className="text-2xl font-bold font-tubi text-white">{selectedPlaylist.title}</DialogTitle>
                <DialogDescription className="text-base pt-2 text-white/80 font-inter">
                  {selectedPlaylist.description}
                </DialogDescription>
                <div className="flex justify-between items-center pt-1">
                  <p className="text-sm text-white/60 font-inter">
                    Created by {selectedPlaylist.creator} • {selectedPlaylist.itemCount} items
                  </p>
                  <Button
                    size="sm"
                    className="gap-1 shadow-lg transition-all hover:shadow-xl bg-[#FFFF13] hover:bg-[#FFFF13]/85 active:bg-[#FFFF13]/70 text-black font-bold"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleVote(selectedPlaylist.id);
                    }}
                  >
                    <ArrowUp className="w-4 h-4" />
                    {selectedPlaylist.votes}
                  </Button>
                </div>
              </DialogHeader>
              
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 pt-4">
                {selectedPlaylist.items?.map((item) => (
                  <div
                    key={item.id}
                    className="group cursor-pointer"
                  >
                    <div className="relative overflow-hidden rounded-lg aspect-[2/3] mb-2">
                      {item.thumbnail ? (
                        <img
                          src={item.thumbnail}
                          alt={item.title}
                          className="w-full h-full object-cover transition-transform group-hover:scale-110"
                        />
                      ) : (
                        <div 
                          className="w-full h-full flex items-center justify-center text-white/30 text-4xl font-bold"
                          style={{
                            background: `linear-gradient(135deg, ${selectedPlaylist.coverColor}40, ${selectedPlaylist.coverColor}20)`,
                          }}
                        >
                          {item.title.charAt(0)}
                        </div>
                      )}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                    </div>
                    <h4 className="font-semibold text-sm line-clamp-2 text-white font-inter">{item.title}</h4>
                    {item.year && (
                      <p className="text-xs text-white/60 font-inter">{item.year}</p>
                    )}
                    {item.genres && item.genres.length > 0 && (
                      <p className="text-xs text-white/50 font-inter">{item.genres.slice(0, 2).join(", ")}</p>
                    )}
                  </div>
                ))}
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

// Helper to extract a color from gradient CSS
function extractColorFromGradient(gradientCss?: string): string | null {
  if (!gradientCss) return null;
  const match = gradientCss.match(/hsl\((\d+)\s+(\d+)%\s+(\d+)%\)/);
  if (match) {
    const [, h, s, l] = match;
    return `hsl(${h}, ${s}%, ${l}%)`;
  }
  return null;
}

export default Index;
