"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus, Search, TrendingUp, Clock } from "lucide-react";
import PlaylistCard from "@/components/PlaylistCard";
import Header from "@/components/Header";

interface Playlist {
  id: string;
  title: string;
  creator?: string;
  itemCount: number;
  votes: number;
  coverColor: string;
  thumbnails: string[];
  createdAt: Date;
  items?: any[];
  coverCss?: string;
}

// Mock data for initial display
const mockPlaylists: Playlist[] = [
  {
    id: "1",
    title: "Ultimate Sci-Fi Collection",
    creator: "MovieBuff2024",
    itemCount: 12,
    votes: 234,
    coverColor: "#8B5CF6",
    thumbnails: [],
    createdAt: new Date("2024-01-15"),
  },
  {
    id: "2",
    title: "Classic Action Heroes",
    creator: "ActionFan",
    itemCount: 8,
    votes: 189,
    coverColor: "#EC4899",
    thumbnails: [],
    createdAt: new Date("2024-01-20"),
  },
  {
    id: "3",
    title: "Mind-Bending Thrillers",
    creator: "CinemaLover",
    itemCount: 15,
    votes: 156,
    coverColor: "#3B82F6",
    thumbnails: [],
    createdAt: new Date("2024-01-10"),
  },
  {
    id: "4",
    title: "Best Drama Collection",
    creator: "DramaQueen",
    itemCount: 20,
    votes: 142,
    coverColor: "#10B981",
    thumbnails: [],
    createdAt: new Date("2024-01-25"),
  },
  {
    id: "5",
    title: "Comedy Gold",
    creator: "LaughTrack",
    itemCount: 18,
    votes: 128,
    coverColor: "#F59E0B",
    thumbnails: [],
    createdAt: new Date("2024-01-18"),
  },
  {
    id: "6",
    title: "Horror Marathon",
    creator: "ScreamQueen",
    itemCount: 10,
    votes: 95,
    coverColor: "#EF4444",
    thumbnails: [],
    createdAt: new Date("2024-01-22"),
  },
];

const Index = () => {
  const [playlists, setPlaylists] = useState<Playlist[]>(mockPlaylists);
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState<"votes" | "recent">("votes");

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
          itemCount: p.items?.length || 0,
          votes: p.votes || 0,
          coverColor: extractColorFromGradient(p.coverCss) || "#8B5CF6",
          thumbnails: [],
          createdAt: new Date(p.createdAt),
          items: p.items,
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
    // Would navigate to playlist detail page
    console.log("Viewing playlist:", id);
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
          background: "#45009D", /* Fallback for older browsers */
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
