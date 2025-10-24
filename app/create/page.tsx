"use client";

import React, { useMemo, useState, useEffect, useCallback } from "react";
import { motion } from "framer-motion";
import { Plus, Search, X, ArrowUp, ArrowDown, Sparkles, Save, Share2, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { v4 as uuidv4 } from "uuid";
import Link from "next/link";
import { useRouter } from "next/navigation";
import Header from "@/components/Header";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { searchTubiContent, TubiContent, getBestThumbnail, getTubiDeepLink } from "@/lib/tubi-api";

// Normalized content type for playlist items
interface PlaylistItem {
  id: string;
  title: string;
  year?: number;
  genres: string[];
  mood: string;
  thumbnail?: string;
  type: string;
}

// --- Utilities ---
const clamp = (v: number, min: number, max: number) => Math.max(min, Math.min(max, v));

function hashStringToHue(str: string) {
  let h = 0;
  for (let i = 0; i < str.length; i++) h = (h << 5) - h + str.charCodeAt(i);
  return Math.abs(h) % 360;
}

function moodToPalette(mood: string): [number, number] {
  switch (mood) {
    case "cozy":
      return [30, 12]; // warm oranges
    case "moody":
      return [220, 240]; // blue/purple
    case "witchy":
      return [280, 320]; // purple/magenta
    case "calm":
      return [180, 200]; // teal/sea
    case "intense":
      return [0, 20]; // red
    case "bright":
      return [45, 60]; // yellow
    case "uplifting":
      return [120, 150]; // green
    case "dark":
      return [340, 360]; // deep magenta/red
    case "retro":
      return [20, 45];
    case "epic":
      return [200, 220];
    case "elegant":
      return [260, 280];
    default:
      return [hashStringToHue(mood || "tubi"), hashStringToHue((mood || "tubi") + "x")];
  }
}

function computeCoverGradient(playlist: any[]) {
  // Derive palette from dominant mood across items
  const moodCounts: Record<string, number> = {};
  playlist.forEach((it) => {
    const m = it.mood || "tubi";
    moodCounts[m] = (moodCounts[m] || 0) + 1;
  });
  const topMood = Object.entries(moodCounts).sort((a, b) => b[1] - a[1])[0]?.[0] || "tubi";
  const [h1, h2] = moodToPalette(topMood);
  const s = 70;
  const l1 = 48;
  const l2 = 28;
  return `linear-gradient(135deg, hsl(${h1} ${s}% ${l1}%), hsl(${h2} ${s}% ${l2}%))`;
}

function suggestTitleFrom(playlist: any[]) {
  if (playlist.length === 0) return "My Tubi Playlist";
  const words = playlist
    .flatMap((p) => [p.mood, ...p.genres, p.title.split(" ")[0]])
    .filter(Boolean)
    .map((w) => w.toLowerCase());
  const top = Object.entries(words.reduce((acc: Record<string, number>, w) => ((acc[w] = (acc[w] || 0) + 1), acc), {}))
    .sort((a, b) => b[1] - a[1])
    .slice(0, 3)
    .map((w) => w[0]);
  const presets = [
    `Vibes: ${top.join(" · ")}`,
    `${top[0] ? top[0][0].toUpperCase() + top[0].slice(1) : "Tubi"} Energy Mix`,
    `Because We Love ${playlist[0].title.split(" ")[0]}`,
    `Weekend ${top[1] || "Binge"} Stack`,
    `The ${top[0] || "Tubi"} Collection`,
  ];
  return presets[Math.floor(Math.random() * presets.length)];
}

// Convert Tubi content to playlist item
function tubiToPlaylistItem(content: TubiContent): PlaylistItem {
  // Determine mood based on genres
  const tags = content.tags || [];
  let mood = "tubi";
  
  if (tags.some(t => t.toLowerCase().includes("horror") || t.toLowerCase().includes("thriller"))) {
    mood = "dark";
  } else if (tags.some(t => t.toLowerCase().includes("comedy"))) {
    mood = "uplifting";
  } else if (tags.some(t => t.toLowerCase().includes("romance"))) {
    mood = "sweet";
  } else if (tags.some(t => t.toLowerCase().includes("action"))) {
    mood = "intense";
  } else if (tags.some(t => t.toLowerCase().includes("sci-fi") || t.toLowerCase().includes("science fiction"))) {
    mood = "epic";
  } else if (tags.some(t => t.toLowerCase().includes("drama"))) {
    mood = "moody";
  }
  
  return {
    id: content.id,
    title: content.title,
    year: content.year,
    genres: content.tags || ["Unknown"],
    mood,
    thumbnail: getBestThumbnail(content) || undefined,
    type: content.type === "s" ? "series" : "movie",
  };
}

// Save to localStorage for hackathon demo
function savePlaylist({ id, title, description, items, coverCss, votes = 0, isEdit = false }: any) {
  const key = "tubi_playlists";
  const existing = JSON.parse(localStorage.getItem(key) || "[]");
  
  // Generate thumbnails array from first 4 items with thumbnails
  const thumbnails = items
    .filter((item: PlaylistItem) => item.thumbnail)
    .slice(0, 4)
    .map((item: PlaylistItem) => item.thumbnail);
  
  const entry = {
    id,
    title,
    description,
    items,
    coverCss,
    thumbnails,
    votes,
    createdAt: new Date().toISOString(),
  };
  
  if (isEdit) {
    // Update existing playlist
    const updatedPlaylists = existing.map((p: any) => 
      p.id === id ? { ...entry, createdAt: p.createdAt } : p
    );
    localStorage.setItem(key, JSON.stringify(updatedPlaylists));
  } else {
    // Create new playlist
    localStorage.setItem(key, JSON.stringify([entry, ...existing]));
  }
  
  return entry;
}

// Collage Preview Component for dynamic cover art
function CollagePreview({ playlist, coverCss }: { playlist: PlaylistItem[]; coverCss: string }) {
  const maxItems = 4;
  const itemsWithThumbnails = playlist.filter(item => item.thumbnail).slice(0, maxItems);
  
  // If no thumbnails available, show gradient fallback
  if (itemsWithThumbnails.length === 0) {
    return (
      <div className="rounded-2xl aspect-square shadow-xl border border-white/10" style={{ background: coverCss }}>
        <div className="flex items-center justify-center h-full text-white/50 text-sm font-inter">
          Add items with covers to generate collage
        </div>
      </div>
    );
  }
  
  // Create grid layout based on number of items
  const getGridLayout = (count: number) => {
    if (count === 1) return "grid-cols-1";
    if (count === 2) return "grid-cols-2";
    return "grid-cols-2 grid-rows-2";
  };
  
  return (
    <div className="rounded-2xl aspect-square shadow-xl border border-white/10 overflow-hidden relative">
      {/* Gradient overlay for brand consistency */}
      <div 
        className="absolute inset-0 opacity-20" 
        style={{ background: coverCss }}
      />
      
      {/* Thumbnail grid */}
      <div className={`grid ${getGridLayout(itemsWithThumbnails.length)} gap-1 h-full p-1`}>
        {itemsWithThumbnails.map((item, index) => (
          <div key={item.id} className="relative overflow-hidden rounded-lg">
            <img
              src={item.thumbnail}
              alt={item.title}
              className="w-full h-full object-cover"
              onError={(e) => {
                // Fallback to gradient if image fails
                const target = e.target as HTMLImageElement;
                const hue = hashStringToHue(item.title);
                const bg = `linear-gradient(135deg, hsl(${hue} 70% 45%), hsl(${(hue + 40) % 360} 70% 30%))`;
                target.style.background = bg;
                target.style.display = 'flex';
                target.style.alignItems = 'center';
                target.style.justifyContent = 'center';
                target.innerText = item.title.charAt(0);
              }}
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
          </div>
        ))}
        
        {/* Fill empty slots with gradient if less than 4 items */}
        {itemsWithThumbnails.length < maxItems && 
          Array.from({ length: maxItems - itemsWithThumbnails.length }).map((_, index) => (
            <div 
              key={`empty-${index}`} 
              className="relative overflow-hidden rounded-lg opacity-30"
              style={{ background: coverCss }}
            >
              <div className="flex items-center justify-center h-full text-white/50 text-2xl font-bold">
                +
              </div>
            </div>
          ))
        }
      </div>
    </div>
  );
}

function PlaceholderPoster({ title, thumbnail }: { title: string; thumbnail?: string }) {
  const hue = hashStringToHue(title);
  const bg = `linear-gradient(135deg, hsl(${hue} 70% 45%), hsl(${(hue + 40) % 360} 70% 30%))`;
  
  // Use real thumbnail if available
  if (thumbnail) {
    return (
      <div className="aspect-[2/3] w-full rounded-xl shadow-md overflow-hidden relative">
        <img 
          src={thumbnail} 
          alt={title}
          className="w-full h-full object-cover"
          onError={(e) => {
            // Fallback to gradient if image fails to load
            (e.target as HTMLImageElement).style.display = 'none';
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
      </div>
    );
  }
  
  // Fallback to gradient
  return (
    <div className="aspect-[2/3] w-full rounded-xl shadow-md overflow-hidden" style={{ background: bg }}>
      <div className="p-2 text-white/90 text-xs font-semibold line-clamp-3 font-inter">{title}</div>
    </div>
  );
}

function ResultTile({ item, onAdd, disabled }: any) {
  const handlePosterClick = () => {
    // Open Tubi content in new tab
    const deepLink = getTubiDeepLink(item.id, item.type === "series" ? "s" : "v");
    window.open(deepLink, "_blank");
  };

  return (
    <motion.div layout initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="group">
      <Card className="border-0 bg-transparent">
        <CardContent className="p-2">
          <div onClick={handlePosterClick} className="cursor-pointer hover:opacity-80 transition-opacity">
            <PlaceholderPoster title={item.title} thumbnail={item.thumbnail} />
          </div>
          <div className="mt-2 flex items-center justify-between gap-2">
            <div 
              className="text-sm font-bold truncate font-tubi text-white hover:text-purple-300 cursor-pointer transition-colors" 
              title={item.title}
              onClick={handlePosterClick}
            >
              {item.title}
            </div>
            <Button size="icon" variant="secondary" className="shrink-0" disabled={disabled} onClick={() => onAdd(item)}>
              <Plus className="h-4 w-4" />
            </Button>
          </div>
          <div className="text-xs text-muted-foreground truncate font-inter">
            {item.year && `${item.year} • `}
            {item.genres.slice(0, 2).join(", ")}
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}

function PlaylistItem({ item, index, onRemove, onMoveUp, onMoveDown }: any) {
  const handleClick = () => {
    // Open Tubi content in new tab
    const deepLink = getTubiDeepLink(item.id, item.type === "series" ? "s" : "v");
    window.open(deepLink, "_blank");
  };

  return (
    <motion.div layout className="flex items-center gap-3 p-2 rounded-xl bg-white/5 border border-white/10">
      <div className="w-12 cursor-pointer hover:opacity-80 transition-opacity" onClick={handleClick}>
        <PlaceholderPoster title={item.title} thumbnail={item.thumbnail} />
      </div>
      <div className="flex-1 min-w-0">
        <div 
          className="text-sm font-bold truncate font-tubi text-white hover:text-purple-300 cursor-pointer transition-colors"
          onClick={handleClick}
        >
          {item.title}
        </div>
        <div className="text-xs text-muted-foreground truncate font-inter">
          {item.year && `${item.year} • `}
          {item.genres.slice(0, 2).join(" • ")}
        </div>
      </div>
      <div className="flex items-center gap-1">
        <Button size="icon" variant="ghost" onClick={() => onMoveUp(index)}>
          <ArrowUp className="h-4 w-4" />
        </Button>
        <Button size="icon" variant="ghost" onClick={() => onMoveDown(index)}>
          <ArrowDown className="h-4 w-4" />
        </Button>
        <Button size="icon" variant="ghost" onClick={() => onRemove(index)}>
          <X className="h-4 w-4" />
        </Button>
      </div>
    </motion.div>
  );
}

export default function PlaylistBuilderPage() {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [playlist, setPlaylist] = useState<PlaylistItem[]>([]);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [coverCss, setCoverCss] = useState(computeCoverGradient([]));
  const [publishedId, setPublishedId] = useState<string | null>(null);
  const [results, setResults] = useState<PlaylistItem[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [initialLoaded, setInitialLoaded] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [editMode, setEditMode] = useState<string | null>(null);
  const [originalVotes, setOriginalVotes] = useState(0);

  // Load initial popular content on mount
  useEffect(() => {
    const loadInitialContent = async () => {
      if (initialLoaded) return;
      
      console.log("🎬 Loading initial popular content...");
      setIsSearching(true);
      
      // Search for popular/trending content by default
      const response = await searchTubiContent("popular movies", 30);
      
      if (response && response.contents.length > 0) {
        const items = response.contents.map(tubiToPlaylistItem);
        setResults(items);
        console.log(`✅ Loaded ${items.length} initial items`);
      } else {
        console.warn("⚠️ Failed to load initial content");
        setResults([]);
      }
      
      setIsSearching(false);
      setInitialLoaded(true);
    };

    loadInitialContent();
  }, [initialLoaded]);

  // Search Tubi content when query changes (debounced)
  useEffect(() => {
    const searchContent = async () => {
      const q = query.trim();
      
      // If empty query, show initial popular content
      if (!q) {
        return;
      }

      console.log(`🔍 Searching for: "${q}"`);
      setIsSearching(true);
      
      const response = await searchTubiContent(q, 50);
      
      if (response && response.contents.length > 0) {
        const items = response.contents.map(tubiToPlaylistItem);
        setResults(items);
        console.log(`✅ Found ${items.length} results`);
      } else {
        console.warn("⚠️ No results found");
        setResults([]);
      }
      
      setIsSearching(false);
    };

    // Debounce search by 500ms
    const timer = setTimeout(() => {
      if (query.trim()) {
        searchContent();
      }
    }, 500);

    return () => clearTimeout(timer);
  }, [query]);

  useEffect(() => {
    setCoverCss(computeCoverGradient(playlist));
  }, [playlist]);

  // Check for edit mode and load playlist data
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const editId = urlParams.get('edit');
    
    if (editId) {
      setEditMode(editId);
      
      // Load playlist data from localStorage
      const key = "tubi_playlists";
      const stored = localStorage.getItem(key);
      if (stored) {
        try {
          const savedPlaylists = JSON.parse(stored);
          const playlistToEdit = savedPlaylists.find((p: any) => p.id === editId);
          
          if (playlistToEdit) {
            setTitle(playlistToEdit.title || "");
            setDescription(playlistToEdit.description || "");
            setPlaylist(playlistToEdit.items || []);
            setOriginalVotes(playlistToEdit.votes || 0);
            console.log("📝 Loaded playlist for editing:", playlistToEdit.title);
          }
        } catch (e) {
          console.error("Failed to load playlist for editing:", e);
        }
      }
    }
  }, []);

  const onAdd = (item: any) => {
    if (playlist.some((p) => p.id === item.id)) return;
    setPlaylist((p) => [...p, item].slice(0, 25));
  };
  const onRemove = (idx: number) => setPlaylist((p) => p.filter((_, i) => i !== idx));
  const onMoveUp = (idx: number) =>
    setPlaylist((p) => {
      const i = clamp(idx - 1, 0, p.length - 1);
      const arr = [...p];
      [arr[i], arr[idx]] = [arr[idx], arr[i]];
      return arr;
    });
  const onMoveDown = (idx: number) =>
    setPlaylist((p) => {
      const i = clamp(idx + 1, 0, p.length - 1);
      const arr = [...p];
      [arr[i], arr[idx]] = [arr[idx], arr[i]];
      return arr;
    });

  const handleSuggestTitle = () => setTitle((t) => (t && Math.random() < 0.35 ? t : suggestTitleFrom(playlist)));

  const handlePublish = () => {
    if (playlist.length < 10) {
      alert("Add at least 10 titles to publish your playlist.");
      return;
    }
    
    const finalTitle = title || suggestTitleFrom(playlist);
    
    if (editMode) {
      // Update existing playlist
      const entry = savePlaylist({ 
        id: editMode, 
        title: finalTitle, 
        description, 
        items: playlist, 
        coverCss,
        votes: originalVotes,
        isEdit: true
      });
      setPublishedId(entry.id);
    } else {
      // Create new playlist
      const id = uuidv4();
      const entry = savePlaylist({ id, title: finalTitle, description, items: playlist, coverCss });
      setPublishedId(entry.id);
    }
    
    setTitle(finalTitle); // Ensure title is set for the modal
    setShowSuccessModal(true);
  };

  const handleShare = () => {
    if (publishedId) {
      const shareUrl = `${window.location.origin}/?modal=${publishedId}`;
      navigator.clipboard.writeText(shareUrl);
      // You could add a toast notification here if you have a toast system
      alert("Share link copied to clipboard!");
    }
  };

  const handleViewInGallery = () => {
    setShowSuccessModal(false);
    if (publishedId) {
      // Navigate to gallery with modal parameter to open the specific playlist
      router.push(`/?modal=${publishedId}`);
    } else {
      router.push("/");
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#2b0058] via-[#2a0146] to-[#120022] text-white">
      <Header />
      
      {/* Search Bar */}
      <div className="mx-auto max-w-7xl px-4 py-4 flex items-center gap-4">
        <div className="flex-1 max-w-2xl">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-white/60" />
            <Input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search Tubi titles…"
              className="pl-9 bg-white/10 border-white/10 text-white placeholder:text-white/60"
            />
          </div>
        </div>
        <Button variant="secondary" onClick={() => setPlaylist([])}>Reset</Button>
      </div>

      {/* Hero / Cover Composer */}
      <div className="mx-auto max-w-7xl px-4 grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="col-span-2 bg-white/5 border-white/10 overflow-hidden">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-white">
              <Sparkles className="h-5 w-5" /> {editMode ? "Edit Your Playlist" : "Build Your Playlist"}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Cover Preview */}
              <div>
                <CollagePreview playlist={playlist} coverCss={coverCss} />
                <div className="mt-2 text-xs text-white/70 font-inter">
                  {playlist.filter(item => item.thumbnail).length > 0 
                    ? "Cover collage generated from your playlist items." 
                    : "Cover art auto-generated from your playlist vibes."
                  }
                </div>
              </div>
              {/* Metadata */}
              <div className="md:col-span-2 space-y-3">
                <div className="flex gap-2">
                  <Input
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="Playlist title (e.g., Cozy Autumn Nights)"
                    className="bg-white/10 border-white/10 text-white placeholder:text-white/60"
                  />
                  <Button variant="secondary" onClick={handleSuggestTitle}>
                    <Sparkles className="h-4 w-4 mr-1" /> Suggest
                  </Button>
                </div>
                <Textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={3}
                  placeholder="Optional: Describe your vibe, inspiration, or rules (max 200 chars)."
                  className="bg-white/10 border-white/10 text-white placeholder:text-white/60"
                />
                <div className="flex items-center justify-between pt-2">
                  <div className="text-sm text-white/70 font-inter">Add 10–25 titles • Click + to add • Use arrows to reorder</div>
                  <div className="flex items-center gap-2">
                    <Button variant="secondary" onClick={handlePublish}>
                      <Save className="h-4 w-4 mr-1" /> {editMode ? "Update" : "Publish"}
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Your Playlist Panel */}
        <Card className="bg-white/5 border-white/10">
          <CardHeader>
            <CardTitle className="text-white">Your Playlist ({playlist.length}/25)</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {playlist.length === 0 && (
              <div className="text-sm text-white/70 font-inter">No titles added yet. Search and press + on any title to add it here.</div>
            )}
            <motion.div 
              layout 
              className="space-y-2 max-h-[320px] overflow-y-auto pr-2 pb-4 playlist-scroll"
              style={{
                scrollbarWidth: 'thin',
                scrollbarColor: 'rgba(255, 255, 255, 0.2) transparent'
              }}
            >
              {playlist.map((item, idx) => (
                <PlaylistItem
                  key={item.id}
                  item={item}
                  index={idx}
                  onRemove={onRemove}
                  onMoveUp={onMoveUp}
                  onMoveDown={onMoveDown}
                />
              ))}
            </motion.div>
          </CardContent>
        </Card>
      </div>

      {/* Search Results */}
      <div className="mx-auto max-w-7xl px-4 mt-6">
        <div className="flex items-center justify-between mb-2">
          <h2 className="text-lg font-bold font-tubi text-white">
            {query.trim() ? `Search Results` : `Popular Content`}
          </h2>
          <div className="text-sm text-white/70 font-inter">
            {isSearching ? "Searching..." : `${results.length} titles`}
          </div>
        </div>
        
        {isSearching && (
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-white"></div>
            <p className="text-white/70 mt-4 font-inter">Searching Tubi catalog...</p>
          </div>
        )}
        
        {!isSearching && results.length === 0 && (
          <div className="text-center py-12">
            <p className="text-white/70 font-inter">
              {query.trim() ? "No results found. Try a different search." : "Loading content..."}
            </p>
          </div>
        )}
        
        {!isSearching && results.length > 0 && (
          <motion.div layout className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {results.map((item) => (
              <ResultTile key={item.id} item={item} onAdd={onAdd} disabled={playlist.some((p) => p.id === item.id) || playlist.length >= 25} />
            ))}
          </motion.div>
        )}
        <div className="h-16" />
      </div>

      {/* Footer */}
      <div className="border-t border-white/10 mt-6">
        <div className="mx-auto max-w-7xl px-4 py-8 text-xs text-white/60 font-inter">
          🎬 Powered by Tubi • Real content from the Tubi catalog
        </div>
      </div>

      {/* Success Modal */}
      <Dialog open={showSuccessModal} onOpenChange={setShowSuccessModal}>
        <DialogContent 
          className="sm:max-w-md text-white border-purple-500/30"
          style={{
            background: "linear-gradient(15deg, #45009D 0%, #8C00E5 100%)",
          }}
        >
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold text-center font-tubi text-white">
              {editMode ? "Playlist Updated!" : "Congrats! You made a Tubi playlist"}
            </DialogTitle>
            <DialogDescription className="text-center text-base text-white/80 font-inter">
              {editMode ? "Your playlist has been updated." : "View in Gallery and Share with Your friends."}
            </DialogDescription>
          </DialogHeader>
          
          <div className="flex flex-col items-center gap-6 py-4">
            {/* Cover Art Preview */}
            <div 
              className="w-48 h-48 rounded-lg flex items-center justify-center text-white text-6xl font-bold shadow-lg font-tubi-black overflow-hidden"
              style={{ background: coverCss }}
            >
              {playlist.length > 0 ? (
                <CollagePreview playlist={playlist} coverCss={coverCss} />
              ) : (
                title.charAt(0).toUpperCase()
              )}
            </div>
            
            {/* Playlist Title */}
            <h3 className="text-xl font-semibold text-center font-tubi text-white">{title}</h3>
            
            {/* Action Buttons */}
            <div className="flex flex-col w-full gap-3">
              <Button 
                onClick={handleViewInGallery}
                size="lg"
                className="w-full gap-2 shadow-lg transition-all hover:shadow-xl bg-[#FFFF13] hover:bg-[#FFFF13]/85 active:bg-[#FFFF13]/70 text-black font-bold"
              >
                <ExternalLink className="h-5 w-5" />
                View in Gallery
              </Button>
              
              <Button 
                onClick={handleShare}
                size="lg"
                className="w-full gap-2 shadow-lg transition-all hover:shadow-xl bg-[#FFFF13] hover:bg-[#FFFF13]/85 active:bg-[#FFFF13]/70 text-black font-bold"
              >
                <Share2 className="h-5 w-5" />
                Share Link
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

