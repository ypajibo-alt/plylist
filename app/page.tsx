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

// Dynamic playlist title generation system
interface TitleGenerationData {
  genres: string[];
  titles: string[];
  themes: string[];
  tone: string;
  searchTerm: string;
}

function generateContextualTitle(data: TitleGenerationData): string {
  const { genres, titles, themes, tone, searchTerm } = data;
  
  // Extract dominant genre and themes
  const dominantGenre = genres[0] || searchTerm;
  const seedTitle = titles[0];
  const timeOfDay = getTimeOfDay();
  
  // Genre-specific base phrases
  const genreBasePhrases: Record<string, string[]> = {
    action: ["Adrenaline Rush", "High-Octane", "Action Packed", "Thrill Seekers", "Combat Zone"],
    adventure: ["Epic Quests", "Wild Journeys", "Adventure Awaits", "Uncharted Territory", "Explorer's Choice"],
    comedy: ["Laugh Factory", "Comedy Gold", "Humor Central", "Giggle Fest", "Smile Sessions"],
    drama: ["Emotional Journeys", "Heart & Soul", "Drama Deep Dive", "Powerful Stories", "Life Lessons"],
    horror: ["Nightmare Fuel", "Spine Chillers", "Fear Factor", "Dark Corners", "Midnight Screams"],
    thriller: ["Edge of Your Seat", "Pulse Pounders", "Suspense Central", "Tension Zone", "Mind Games"],
    "sci-fi": ["Future Shock", "Cosmic Adventures", "Tech Noir", "Space Odyssey", "Tomorrow's Tales"],
    fantasy: ["Magical Realms", "Enchanted Journeys", "Mythic Adventures", "Wonder Worlds", "Fantasy Escapes"],
    romance: ["Love Stories", "Heart Flutters", "Romantic Escapes", "Passion Play", "Love Lines"],
    documentary: ["Real Talk", "Truth Unveiled", "Documentary Deep Dive", "Fact Check", "Reality Bites"],
    biography: ["Life Stories", "True Legends", "Human Interest", "biographical", "Real Heroes"],
    crime: ["Crime & Chaos", "Law & Disorder", "Criminal Minds", "Street Justice", "Underworld Tales"],
    mystery: ["Whodunit", "Mystery Box", "Puzzle Pieces", "Detective Stories", "Hidden Truths"],
    western: ["Wild West", "Frontier Tales", "Cowboy Chronicles", "Desert Showdowns", "Outlaw Stories"],
  };

  // Title pattern templates
  const titlePatterns = [
    // Genre-based patterns
    () => {
      const basePhrase = getRandomFromArray(genreBasePhrases[dominantGenre.toLowerCase()] || ["Mixed Bag"]);
      const modifiers = ["Collection", "Essentials", "Favorites", "Mix", "Selection", "Showcase", "Chronicles"];
      return `${basePhrase} ${getRandomFromArray(modifiers)}`;
    },
    
    // Time-based patterns
    () => {
      const timePhrases = ["Late-Night", "Weekend", "Sunday", "Midnight", "Evening", "Prime Time"];
      const endings = ["Watchlist", "Binge", "Marathon", "Sessions", "Vibes", "Energy"];
      return `${getRandomFromArray(timePhrases)} ${dominantGenre} ${getRandomFromArray(endings)}`;
    },
    
    // Mood-based patterns
    () => {
      const moodWords = ["Epic", "Intense", "Chill", "Wild", "Smooth", "Raw", "Pure", "Ultimate"];
      const connectors = ["Escapes", "Adventures", "Journeys", "Experiences", "Chronicles", "Tales"];
      return `${getRandomFromArray(moodWords)} ${dominantGenre} ${getRandomFromArray(connectors)}`;
    },
    
    // Recommendation-style patterns
    () => {
      if (seedTitle && seedTitle.length < 25) {
        const starters = ["If You Liked", "Fans of", "More Like", "Similar to"];
        return `${getRandomFromArray(starters)} ${seedTitle}`;
      }
      return `Hidden ${dominantGenre} Gems`;
    },
    
    // Energy/vibe patterns
    () => {
      const energyWords = ["High Energy", "Smooth Vibes", "Intense", "Chill", "Raw", "Pure"];
      const formats = ["${energy} ${genre}", "${genre} ${energy}", "Powered by ${energy}"];
      const format = getRandomFromArray(formats);
      const energy = getRandomFromArray(energyWords);
      return format.replace("${energy}", energy).replace("${genre}", dominantGenre);
    },
    
    // Thematic patterns
    () => {
      const themes = ["Best of", "Ultimate", "Essential", "Premier", "Top-Tier", "Premium"];
      const year = new Date().getFullYear();
      return `${getRandomFromArray(themes)} ${dominantGenre} ${Math.random() > 0.5 ? year : "Collection"}`;
    },
    
    // Creative combinations
    () => {
      const adjectives = ["Midnight", "Underground", "Premium", "Exclusive", "Curated", "Elite"];
      const nouns = ["Selection", "Vault", "Archive", "Collection", "Library", "Anthology"];
      return `${getRandomFromArray(adjectives)} ${dominantGenre} ${getRandomFromArray(nouns)}`;
    }
  ];

  // Select a random pattern and generate title
  const selectedPattern = getRandomFromArray(titlePatterns);
  return selectedPattern();
}

function getTimeOfDay(): string {
  const hour = new Date().getHours();
  if (hour >= 0 && hour < 6) return "Late-Night";
  if (hour >= 6 && hour < 12) return "Morning";
  if (hour >= 12 && hour < 17) return "Afternoon";
  if (hour >= 17 && hour < 22) return "Evening";
  return "Night";
}

function getRandomFromArray<T>(array: T[]): T {
  return array[Math.floor(Math.random() * array.length)];
}

function analyzePlaylistContent(items: PlaylistItem[], searchTerm: string): TitleGenerationData {
  // Extract and count genres
  const allGenres = items.flatMap(item => item.genres || []);
  const genreCount = allGenres.reduce((acc, genre) => {
    acc[genre] = (acc[genre] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);
  
  // Sort genres by frequency
  const sortedGenres = Object.entries(genreCount)
    .sort(([,a], [,b]) => b - a)
    .map(([genre]) => genre);

  // Extract titles and themes
  const titles = items.map(item => item.title);
  const themes = [...new Set(allGenres)]; // Unique themes
  
  // Determine tone based on dominant genres
  const dominantGenre = sortedGenres[0]?.toLowerCase() || searchTerm.toLowerCase();
  let tone = "neutral";
  
  if (["action", "thriller", "horror"].includes(dominantGenre)) tone = "intense";
  else if (["comedy", "romance"].includes(dominantGenre)) tone = "light";
  else if (["drama", "biography", "documentary"].includes(dominantGenre)) tone = "serious";
  else if (["sci-fi", "fantasy", "adventure"].includes(dominantGenre)) tone = "adventurous";

  return {
    genres: sortedGenres,
    titles,
    themes,
    tone,
    searchTerm
  };
}

function generateCreatorName(genres: string[], tone: string): string {
  const creatorStyles = {
    intense: ["ActionJunkie", "ThrillSeeker", "AdrenalFan", "EdgeMaster", "IntenseCinema"],
    light: ["ChillVibes", "FunTimes", "HappyWatcher", "GoodMoods", "SmileMaker"],
    serious: ["DeepThoughts", "ArtCinema", "StoryLover", "DramaQueen", "RealTalk"],
    adventurous: ["Explorer", "QuestSeeker", "WonderFan", "EpicTales", "CosmicVibes"],
    neutral: ["CinemaLover", "MovieBuff", "FilmFan", "ScreenTime", "ReelTalk"]
  };
  
  const styleArray = creatorStyles[tone as keyof typeof creatorStyles] || creatorStyles.neutral;
  return getRandomFromArray(styleArray) + Math.floor(Math.random() * 999);
}

function generateContextualDescription(data: TitleGenerationData, title: string): string {
  const { genres, tone, titles } = data;
  const dominantGenre = genres[0] || "movies";
  
  // Description templates based on tone and content
  const descriptionTemplates = {
    intense: [
      `Heart-pounding ${dominantGenre} that will keep you on the edge of your seat.`,
      `Adrenaline-fueled ${dominantGenre} for thrill seekers who crave excitement.`,
      `High-octane ${dominantGenre} that deliver non-stop action and suspense.`,
      `Pulse-pounding collection of ${dominantGenre} guaranteed to get your blood racing.`
    ],
    light: [
      `Feel-good ${dominantGenre} perfect for brightening your day.`,
      `Uplifting ${dominantGenre} that bring joy and laughter to any evening.`,
      `Heartwarming ${dominantGenre} designed to put a smile on your face.`,
      `Delightful ${dominantGenre} for when you need a mood boost.`
    ],
    serious: [
      `Thought-provoking ${dominantGenre} that explore the depths of human experience.`,
      `Powerful ${dominantGenre} featuring unforgettable performances and compelling stories.`,
      `Critically acclaimed ${dominantGenre} that challenge and inspire.`,
      `Award-worthy ${dominantGenre} that tackle important themes with depth and nuance.`
    ],
    adventurous: [
      `Epic ${dominantGenre} that transport you to incredible worlds and experiences.`,
      `Mind-bending ${dominantGenre} full of wonder, mystery, and imagination.`,
      `Spectacular ${dominantGenre} featuring breathtaking journeys and discoveries.`,
      `Captivating ${dominantGenre} that push the boundaries of possibility.`
    ],
    neutral: [
      `Carefully curated ${dominantGenre} showcasing diverse storytelling.`,
      `Essential ${dominantGenre} that represent the best of their genre.`,
      `Handpicked ${dominantGenre} offering something for every viewer.`,
      `Premium collection of ${dominantGenre} worth your time.`
    ]
  };

  const templates = descriptionTemplates[tone as keyof typeof descriptionTemplates] || descriptionTemplates.neutral;
  let description = getRandomFromArray(templates);
  
  // Add contextual elements occasionally
  if (Math.random() > 0.7 && titles.length > 0) {
    const featuredTitle = titles[0];
    if (featuredTitle.length < 30) {
      description += ` Featuring standouts like "${featuredTitle}" and more hidden gems.`;
    }
  }
  
  // Add time-based context occasionally
  if (Math.random() > 0.8) {
    const timeContexts = [
      "Perfect for weekend binges.",
      "Ideal for late-night viewing.",
      "Great for your next movie marathon.",
      "Curated for discerning viewers."
    ];
    description += ` ${getRandomFromArray(timeContexts)}`;
  }

  return description;
}

function generateCoverColor(tone: string, dominantGenre?: string): string {
  const colorPalettes = {
    intense: ["#DC2626", "#EF4444", "#B91C1C", "#991B1B"], // Reds
    light: ["#F59E0B", "#FBBF24", "#10B981", "#059669"], // Yellows/Greens
    serious: ["#3B82F6", "#1D4ED8", "#6366F1", "#4338CA"], // Blues/Purples
    adventurous: ["#8B5CF6", "#7C3AED", "#A855F7", "#9333EA"], // Purples
    neutral: ["#6B7280", "#4B5563", "#374151", "#1F2937"] // Grays
  };

  // Genre-specific color overrides
  const genreColors: Record<string, string[]> = {
    horror: ["#991B1B", "#7F1D1D", "#450A0A"],
    romance: ["#EC4899", "#DB2777", "#BE185D"],
    sci_fi: ["#06B6D4", "#0891B2", "#0E7490"],
    fantasy: ["#8B5CF6", "#7C3AED", "#6D28D9"],
    comedy: ["#F59E0B", "#D97706", "#B45309"],
    action: ["#DC2626", "#B91C1C", "#991B1B"],
    drama: ["#3B82F6", "#2563EB", "#1D4ED8"],
    thriller: ["#374151", "#1F2937", "#111827"]
  };

  // Use genre-specific color if available
  const genreKey = dominantGenre?.toLowerCase().replace('-', '_');
  if (genreKey && genreColors[genreKey]) {
    return getRandomFromArray(genreColors[genreKey]);
  }

  // Fall back to tone-based colors
  const paletteColors = colorPalettes[tone as keyof typeof colorPalettes] || colorPalettes.neutral;
  return getRandomFromArray(paletteColors);
}

// Function to generate mock playlists with real Tubi content and dynamic titles
async function generateMockPlaylistsWithTubiContent(): Promise<Playlist[]> {
  const searchQueries = [
    "action", "comedy", "drama", "horror", "thriller", "sci-fi", 
    "fantasy", "romance", "documentary", "adventure", "crime", "mystery"
  ];

  const mockPlaylists: Playlist[] = [];
  const targetPlaylistCount = 6; // Generate 6 diverse playlists
  const usedGenres = new Set<string>(); // Track genres to ensure variety

  // Shuffle search queries for randomness
  const shuffledQueries = [...searchQueries].sort(() => Math.random() - 0.5);

  for (let i = 0; i < targetPlaylistCount && i < shuffledQueries.length; i++) {
    const searchTerm = shuffledQueries[i];
    try {
      console.log(`🔍 Generating playlist for: ${searchTerm}`);
      
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

        // Analyze content to generate contextual title and description
        const contentAnalysis = analyzePlaylistContent(items, searchTerm);
        const dynamicTitle = generateContextualTitle(contentAnalysis);
        const creator = generateCreatorName(contentAnalysis.genres, contentAnalysis.tone);
        
        // Generate description based on content analysis
        const description = generateContextualDescription(contentAnalysis, dynamicTitle);
        
        // Generate cover color based on genre/tone
        const coverColor = generateCoverColor(contentAnalysis.tone, contentAnalysis.genres[0]);

        // Generate thumbnails array for the playlist
        const thumbnails = items
          .filter(item => item.thumbnail)
          .slice(0, 4)
          .map(item => item.thumbnail!);

        const playlist: Playlist = {
          id: (mockPlaylists.length + 1).toString(),
          title: dynamicTitle,
          creator: creator,
          description: description,
          itemCount: items.length,
          votes: Math.floor(Math.random() * 300 + 50), // Random votes between 50-350
          coverColor: coverColor,
          thumbnails,
          createdAt: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000), // Random date within last 30 days
          items,
        };

        mockPlaylists.push(playlist);
        usedGenres.add(searchTerm);
        console.log(`🎬 Generated playlist: "${playlist.title}" by ${playlist.creator} with ${items.length} items`);
      }
    } catch (error) {
      console.error(`Failed to generate playlist for ${searchTerm}:`, error);
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
