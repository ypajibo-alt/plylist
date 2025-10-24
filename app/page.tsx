"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus, Search, TrendingUp, Clock, ArrowUp, Edit2, Trash2, Share2, Check } from "lucide-react";
import PlaylistCard from "@/components/PlaylistCard";
import Header from "@/components/Header";
import { getTubiDeepLink, searchTubiContent, getBestThumbnail } from "@/lib/tubi-api";
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

// Function to generate mock playlists with real Tubi content
async function generateMockPlaylistsWithTubiContent(): Promise<Playlist[]> {
  const playlistTemplates = [
    {
      title: "Action & Adventure Collection",
      creator: "ActionFan",
      description: "High-octane thrills and epic adventures that will keep you on the edge of your seat.",
      coverColor: "#DC2626",
      searchTerms: ["action", "adventure"],
      votes: 234,
      createdAt: new Date("2024-01-15"),
    },
    {
      title: "Comedy Central",
      creator: "LaughTrack",
      description: "Hilarious comedies and feel-good movies to brighten your day.",
      coverColor: "#F59E0B",
      searchTerms: ["comedy", "funny"],
      votes: 189,
      createdAt: new Date("2024-01-20"),
    },
    {
      title: "Drama Masterpieces",
      creator: "DramaQueen",
      description: "Powerful stories and unforgettable performances that touch the heart.",
      coverColor: "#10B981",
      searchTerms: ["drama", "family"],
      votes: 156,
      createdAt: new Date("2024-01-10"),
    },
    {
      title: "Sci-Fi & Fantasy",
      creator: "MovieBuff2024",
      description: "Mind-bending sci-fi and magical fantasy adventures from other worlds.",
      coverColor: "#8B5CF6",
      searchTerms: ["sci-fi", "fantasy"],
      votes: 142,
      createdAt: new Date("2024-01-25"),
    },
    {
      title: "Horror & Thrillers",
      creator: "ScreamQueen",
      description: "Spine-chilling horror and edge-of-your-seat thrillers for the brave.",
      coverColor: "#EF4444",
      searchTerms: ["horror", "thriller"],
      votes: 128,
      createdAt: new Date("2024-01-18"),
    },
    {
      title: "True Stories",
      creator: "DocumentaryLover",
      description: "Real stories, documentaries, and biopics that inspire and educate.",
      coverColor: "#3B82F6",
      searchTerms: ["documentary", "biography"],
      votes: 95,
      createdAt: new Date("2024-01-22"),
    },
  ];

  const mockPlaylists: Playlist[] = [];

  for (const template of playlistTemplates) {
    try {
      // Search for content using random search terms
      const searchTerm = template.searchTerms[Math.floor(Math.random() * template.searchTerms.length)];
      const searchResults = await searchTubiContent(searchTerm, 8);
      
      if (searchResults && searchResults.contents && searchResults.contents.length > 0) {
        // Convert Tubi content to playlist items
        const items: PlaylistItem[] = searchResults.contents.slice(0, 6).map(content => ({
          id: content.id,
          title: content.title,
          thumbnail: getBestThumbnail(content) || undefined,
          year: content.year?.toString(),
          type: content.type === "s" ? "series" : "movie",
          genres: content.tags?.slice(0, 2) || [],
        }));

        // Generate thumbnails array for the playlist
        const thumbnails = items
          .filter(item => item.thumbnail)
          .slice(0, 4)
          .map(item => item.thumbnail!);

        const playlist: Playlist = {
          id: (mockPlaylists.length + 1).toString(),
          title: template.title,
          creator: template.creator,
          description: template.description,
          itemCount: items.length,
          votes: Math.floor(template.votes + Math.random() * 50 - 25), // Add some randomness
          coverColor: template.coverColor,
          thumbnails,
          createdAt: template.createdAt,
          items,
        };

        mockPlaylists.push(playlist);
        console.log(`🎬 Generated playlist: ${playlist.title} with ${items.length} items`);
      }
    } catch (error) {
      console.error(`Failed to generate playlist for ${template.title}:`, error);
    }
  }

  return mockPlaylists;
}

// Fallback mock playlists in case API fails
const fallbackMockPlaylists: Playlist[] = [
  {
    id: "1",
    title: "Popular Movies",
    creator: "MovieBuff2024",
    description: "The most popular movies on Tubi right now.",
    itemCount: 12,
    votes: 234,
    coverColor: "#8B5CF6",
    thumbnails: [],
    createdAt: new Date("2024-01-15"),
    items: [],
  },
  {
    id: "2",
    title: "Action Adventures",
    creator: "ActionFan",
    description: "High-octane action and thrilling adventures.",
    itemCount: 8,
    votes: 189,
    coverColor: "#DC2626",
    thumbnails: [],
    createdAt: new Date("2024-01-20"),
    items: [],
  },
  {
    id: "3",
    title: "Comedy Collection",
    creator: "LaughTrack",
    description: "Hilarious movies to brighten your day.",
    itemCount: 15,
    votes: 156,
    coverColor: "#F59E0B",
    thumbnails: [],
    createdAt: new Date("2024-01-10"),
    items: [],
  },
];

const Index = () => {
  const [playlists, setPlaylists] = useState<Playlist[]>(fallbackMockPlaylists);
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState<"votes" | "recent">("votes");
  const [selectedPlaylist, setSelectedPlaylist] = useState<Playlist | null>(null);
  const [shareSuccess, setShareSuccess] = useState(false);
  const [isLoadingPlaylists, setIsLoadingPlaylists] = useState(true);

  // Load playlists from localStorage and generate mock playlists with real Tubi content
  useEffect(() => {
    const loadPlaylistsWithRealContent = async () => {
      try {
        setIsLoadingPlaylists(true);
        console.log("🎬 Loading playlists with real Tubi content...");
        
        // Generate mock playlists with real Tubi content
        const realContentPlaylists = await generateMockPlaylistsWithTubiContent();
        
        // Load user-created playlists from localStorage
        const key = "tubi_playlists";
        const stored = localStorage.getItem(key);
        let userPlaylists: Playlist[] = [];
        
        if (stored) {
          try {
            const savedPlaylists = JSON.parse(stored);
            userPlaylists = savedPlaylists.map((p: any) => ({
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
          } catch (e) {
            console.error("Failed to load user playlists:", e);
          }
        }
        
        // Combine user playlists with generated mock playlists
        const allPlaylists = [...userPlaylists, ...realContentPlaylists];
        
        // Use fallback if no real content was generated
        if (realContentPlaylists.length === 0) {
          console.warn("⚠️ Failed to generate playlists with real content, using fallback");
          allPlaylists.push(...fallbackMockPlaylists);
        }
        
        setPlaylists(allPlaylists);
        console.log(`✅ Loaded ${allPlaylists.length} playlists (${userPlaylists.length} user, ${realContentPlaylists.length} generated)`);
        
        // Check for modal parameter in URL
        const urlParams = new URLSearchParams(window.location.search);
        const modalPlaylistId = urlParams.get('modal');
        if (modalPlaylistId) {
          const playlist = allPlaylists.find(p => p.id === modalPlaylistId);
          if (playlist) {
            setSelectedPlaylist(playlist);
          }
          // Clean up URL without reloading
          window.history.replaceState({}, document.title, window.location.pathname);
        }
        
      } catch (error) {
        console.error("Failed to load playlists:", error);
        // Use fallback playlists with some user playlists if they exist
        const key = "tubi_playlists";
        const stored = localStorage.getItem(key);
        let fallbackPlaylists = [...fallbackMockPlaylists];
        
        if (stored) {
          try {
            const savedPlaylists = JSON.parse(stored);
            const userPlaylists = savedPlaylists.map((p: any) => ({
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
            fallbackPlaylists = [...userPlaylists, ...fallbackMockPlaylists];
          } catch (e) {
            console.error("Failed to load user playlists:", e);
          }
        }
        
        setPlaylists(fallbackPlaylists);
      } finally {
        setIsLoadingPlaylists(false);
      }
    };

    loadPlaylistsWithRealContent();
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

  // Check if current user owns the playlist
  const isOwner = (playlist: Playlist) => {
    return playlist.creator === "You";
  };

  const handleEditPlaylist = (playlist: Playlist) => {
    // Navigate to create page with edit parameter
    window.location.href = `/create?edit=${playlist.id}`;
  };

  const handleDeletePlaylist = (playlist: Playlist) => {
    // Single click with native confirmation dialog
    if (window.confirm(`Are you sure you want to delete "${playlist.title}"? This action cannot be undone.`)) {
      // Perform actual deletion
      const updatedPlaylists = playlists.filter(p => p.id !== playlist.id);
      setPlaylists(updatedPlaylists);
      
      // Update localStorage
      const key = "tubi_playlists";
      const stored = localStorage.getItem(key);
      if (stored) {
        try {
          const savedPlaylists = JSON.parse(stored);
          const filtered = savedPlaylists.filter((p: any) => p.id !== playlist.id);
          localStorage.setItem(key, JSON.stringify(filtered));
        } catch (e) {
          console.error("Failed to delete playlist:", e);
        }
      }
      
      setSelectedPlaylist(null);
    }
  };

  const handleSharePlaylist = async (playlist: Playlist) => {
    const shareUrl = `${window.location.origin}/?modal=${playlist.id}`;
    
    try {
      await navigator.clipboard.writeText(shareUrl);
      setShareSuccess(true);
      setTimeout(() => setShareSuccess(false), 2000);
    } catch (error) {
      console.error("Failed to copy to clipboard:", error);
      // Fallback to alert
      alert(`Share this playlist: ${shareUrl}`);
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
              onClick={() => setSortBy("votes")}
              className={`gap-2 transition-all ${
                sortBy === "votes" 
                  ? "bg-white text-black hover:bg-white/90" 
                  : "bg-[#2a0146] text-white hover:bg-[#3a0656] border border-white/20"
              }`}
            >
              <TrendingUp className="w-4 h-4" />
              Top Voted
            </Button>
            <Button
              onClick={() => setSortBy("recent")}
              className={`gap-2 transition-all ${
                sortBy === "recent" 
                  ? "bg-white text-black hover:bg-white/90" 
                  : "bg-[#2a0146] text-white hover:bg-[#3a0656] border border-white/20"
              }`}
            >
              <Clock className="w-4 h-4" />
              Recent
            </Button>
          </div>
        </div>

        {/* Playlists Grid */}
        {isLoadingPlaylists ? (
          <div className="text-center py-20">
            <div className="flex items-center justify-center gap-3 mb-4">
              <div className="w-6 h-6 border-2 border-white/20 border-t-white rounded-full animate-spin"></div>
              <p className="text-xl text-white/70 font-inter">Loading playlists with real Tubi content...</p>
            </div>
            <p className="text-sm text-white/60 font-inter">Fetching the latest movies and shows for you</p>
          </div>
        ) : (
          <>
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

            {filteredPlaylists.length === 0 && !isLoadingPlaylists && (
              <div className="text-center py-20">
                <p className="text-xl text-white/70 font-inter">No playlists found</p>
                <p className="text-sm text-white/60 mt-2 font-inter">Try a different search term</p>
              </div>
            )}
          </>
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
                  <div className="flex items-center gap-2">
                    {/* Action Icons */}
                    <div className="flex items-center gap-1">
                      {isOwner(selectedPlaylist) ? (
                        <>
                          {/* Edit Button */}
                          <Button
                            size="sm"
                            variant="ghost"
                            className="h-8 w-8 p-0 text-white/60 hover:text-white hover:bg-white/10 transition-colors"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleEditPlaylist(selectedPlaylist);
                            }}
                            aria-label="Edit playlist"
                            title="Edit playlist"
                          >
                            <Edit2 className="w-4 h-4" />
                          </Button>
                          
                          {/* Delete Button */}
                          <Button
                            size="sm"
                            variant="ghost"
                            className="h-8 w-8 p-0 text-white/60 hover:text-red-400 hover:bg-red-500/10 transition-colors"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDeletePlaylist(selectedPlaylist);
                            }}
                            aria-label="Delete playlist"
                            title="Delete playlist"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </>
                      ) : null}
                      
                      {/* Share Button */}
                      <Button
                        size="sm"
                        variant="ghost"
                        className="h-8 w-8 p-0 text-white/60 hover:text-white hover:bg-white/10 transition-colors relative"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleSharePlaylist(selectedPlaylist);
                        }}
                        aria-label="Share playlist"
                        title="Share playlist"
                      >
                        {shareSuccess ? (
                          <Check className="w-4 h-4 text-green-400" />
                        ) : (
                          <Share2 className="w-4 h-4" />
                        )}
                      </Button>
                    </div>
                    
                    {/* Vote Button */}
                    <Button
                      size="sm"
                      className="gap-1 shadow-lg transition-all hover:shadow-xl bg-[#FFFF13] hover:bg-[#FFFF13]/85 active:bg-[#FFFF13]/70 text-black font-bold ml-2"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleVote(selectedPlaylist.id);
                      }}
                      aria-label={`Vote for ${selectedPlaylist.title}`}
                      title={`Vote for ${selectedPlaylist.title}`}
                    >
                      <ArrowUp className="w-4 h-4" />
                      {selectedPlaylist.votes}
                    </Button>
                  </div>
                </div>
              </DialogHeader>
              
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 pt-4">
                {selectedPlaylist.items?.map((item) => {
                  const handlePosterClick = () => {
                    // Generate deep link to Tubi content
                    const deepLink = getTubiDeepLink(item.id, item.type === "series" ? "s" : "v");
                    window.open(deepLink, "_blank");
                  };

                  return (
                    <div
                      key={item.id}
                      className="group cursor-pointer"
                    >
                      <div 
                        className="relative overflow-hidden rounded-lg aspect-[2/3] mb-2 cursor-pointer hover:opacity-90 transition-opacity"
                        onClick={handlePosterClick}
                        title={`Watch ${item.title} on Tubi`}
                      >
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
                  );
                })}
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
