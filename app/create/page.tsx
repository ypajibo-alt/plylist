"use client";

import React, { useMemo, useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Plus, Search, X, ArrowUp, ArrowDown, Sparkles, Save } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { v4 as uuidv4 } from "uuid";
import Link from "next/link";
import Header from "@/components/Header";

// --- Mock Catalog (replace with Tubi API) ---
// Minimal set; add more items as needed for demo
const CATALOG = [
  { id: "t1", title: "Scooby-Doo, Where Are You?", year: 1969, genres: ["Animation", "Family", "Mystery"], mood: "playful" },
  { id: "t2", title: "Coraline", year: 2009, genres: ["Animation", "Fantasy", "Horror"], mood: "moody" },
  { id: "t3", title: "The Craft", year: 1996, genres: ["Horror", "Fantasy"], mood: "witchy" },
  { id: "t4", title: "Autumn in New York", year: 2000, genres: ["Romance", "Drama"], mood: "cozy" },
  { id: "t5", title: "Home for Harvest", year: 2019, genres: ["Romance"], mood: "cozy" },
  { id: "t6", title: "Relazing Autumn Leaves", year: 2021, genres: ["Lifestyle"], mood: "calm" },
  { id: "t7", title: "Bob the Builder", year: 1998, genres: ["Kids", "Animation"], mood: "bright" },
  { id: "t8", title: "Leaving Soon: Cult Classics", year: 2020, genres: ["Collection", "Cult"], mood: "retro" },
  { id: "t9", title: "Storm Chasers", year: 2011, genres: ["Reality", "Action"], mood: "intense" },
  { id: "t10", title: "The Beauty of Love", year: 2016, genres: ["Romance"], mood: "sweet" },
  { id: "t11", title: "Autumn Road", year: 2020, genres: ["Drama"], mood: "cozy" },
  { id: "t12", title: "Candles on Bay Street", year: 2006, genres: ["Drama"], mood: "warm" },
  { id: "t13", title: "Most Popular Horror Mix", year: 2022, genres: ["Horror"], mood: "dark" },
  { id: "t14", title: "Staff Picks: Feel-Good", year: 2023, genres: ["Comedy", "Drama"], mood: "uplifting" },
  { id: "t15", title: "Autumn Stables", year: 2018, genres: ["Romance"], mood: "cozy" },
  { id: "t16", title: "Relaxing White Noise", year: 2023, genres: ["Lifestyle"], mood: "calm" },
  { id: "t17", title: "Sabrina the Teenage Witch", year: 1996, genres: ["Comedy", "Fantasy"], mood: "nostalgic" },
  { id: "t18", title: "Secondhand Lions", year: 2003, genres: ["Family", "Adventure"], mood: "heartwarming" },
  { id: "t19", title: "The Legend Is Real", year: 2024, genres: ["Action", "Adventure"], mood: "epic" },
  { id: "t20", title: "A Tribute to Diane Keaton", year: 2024, genres: ["Documentary"], mood: "elegant" },
];

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

// Save to localStorage for hackathon demo
function savePlaylist({ id, title, description, items, coverCss }: any) {
  const key = "tubi_playlists";
  const existing = JSON.parse(localStorage.getItem(key) || "[]");
  const entry = {
    id,
    title,
    description,
    items,
    coverCss,
    votes: 0,
    createdAt: new Date().toISOString(),
  };
  localStorage.setItem(key, JSON.stringify([entry, ...existing]));
  return entry;
}

function PlaceholderPoster({ title }: { title: string }) {
  const hue = hashStringToHue(title);
  const bg = `linear-gradient(135deg, hsl(${hue} 70% 45%), hsl(${(hue + 40) % 360} 70% 30%))`;
  return (
    <div className="aspect-[2/3] w-full rounded-xl shadow-md overflow-hidden" style={{ background: bg }}>
      <div className="p-2 text-white/90 text-xs font-semibold line-clamp-3 font-inter">{title}</div>
    </div>
  );
}

function ResultTile({ item, onAdd, disabled }: any) {
  return (
    <motion.div layout initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="group">
      <Card className="border-0 bg-transparent">
        <CardContent className="p-2">
          <PlaceholderPoster title={item.title} />
          <div className="mt-2 flex items-center justify-between gap-2">
            <div className="text-sm font-bold truncate font-tubi text-white" title={item.title}>
              {item.title}
            </div>
            <Button size="icon" variant="secondary" className="shrink-0" disabled={disabled} onClick={() => onAdd(item)}>
              <Plus className="h-4 w-4" />
            </Button>
          </div>
          <div className="text-xs text-muted-foreground truncate font-inter">{item.genres.join(", ")}</div>
        </CardContent>
      </Card>
    </motion.div>
  );
}

function PlaylistItem({ item, index, onRemove, onMoveUp, onMoveDown }: any) {
  return (
    <motion.div layout className="flex items-center gap-3 p-2 rounded-xl bg-white/5 border border-white/10">
      <div className="w-12">
        <PlaceholderPoster title={item.title} />
      </div>
      <div className="flex-1 min-w-0">
        <div className="text-sm font-bold truncate font-tubi text-white">{item.title}</div>
        <div className="text-xs text-muted-foreground truncate font-inter">{item.genres.join(" • ")}</div>
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
  const [query, setQuery] = useState("");
  const [playlist, setPlaylist] = useState<any[]>([]);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [coverCss, setCoverCss] = useState(computeCoverGradient([]));
  const [publishedId, setPublishedId] = useState<string | null>(null);

  const results = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return CATALOG;
    return CATALOG.filter((it) =>
      [it.title, ...(it.genres || [])]
        .join(" ")
        .toLowerCase()
        .includes(q)
    );
  }, [query]);

  useEffect(() => {
    setCoverCss(computeCoverGradient(playlist));
  }, [playlist]);

  const onAdd = (item: any) => {
    if (playlist.some((p) => p.id === item.id)) return;
    setPlaylist((p) => [...p, item].slice(0, 10));
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
    if (playlist.length < 5) {
      alert("Add at least 5 titles to publish your playlist.");
      return;
    }
    const id = uuidv4();
    const entry = savePlaylist({ id, title: title || suggestTitleFrom(playlist), description, items: playlist, coverCss });
    setPublishedId(entry.id);
    window.scrollTo({ top: 0, behavior: "smooth" });
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
              <Sparkles className="h-5 w-5" /> Build Your Playlist
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Cover Preview */}
              <div>
                <div className="rounded-2xl aspect-[16/10] shadow-xl border border-white/10" style={{ background: coverCss }} />
                <div className="mt-2 text-xs text-white/70 font-inter">Cover art auto-generated from your playlist vibes.</div>
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
                  <div className="text-sm text-white/70 font-inter">Add 5–10 titles • Click + to add • Use arrows to reorder</div>
                  <div className="flex items-center gap-2">
                    <Button variant="secondary" onClick={handlePublish}>
                      <Save className="h-4 w-4 mr-1" /> Publish
                    </Button>
                  </div>
                </div>
                {publishedId && (
                  <div className="text-emerald-300 text-sm font-inter">
                    Published! Your playlist is saved locally for the demo.{" "}
                    <Link href="/" className="underline">
                      View Gallery
                    </Link>
                  </div>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Your Playlist Panel */}
        <Card className="bg-white/5 border-white/10">
          <CardHeader>
            <CardTitle className="text-white">Your Playlist ({playlist.length}/10)</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {playlist.length === 0 && (
              <div className="text-sm text-white/70 font-inter">No titles added yet. Search and press + on any title to add it here.</div>
            )}
            <motion.div layout className="space-y-2">
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
          <h2 className="text-lg font-bold font-tubi text-white">Results</h2>
          <div className="text-sm text-white/70 font-inter">{results.length} titles</div>
        </div>
        <motion.div layout className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
          {results.map((item) => (
            <ResultTile key={item.id} item={item} onAdd={onAdd} disabled={playlist.some((p) => p.id === item.id) || playlist.length >= 10} />
          ))}
        </motion.div>
        <div className="h-16" />
      </div>

      {/* Footer */}
      <div className="border-t border-white/10 mt-6">
        <div className="mx-auto max-w-7xl px-4 py-8 text-xs text-white/60 font-inter">
          * Hackathon MVP — Mock data only. Replace catalog + storage with Tubi APIs.
        </div>
      </div>
    </div>
  );
}

