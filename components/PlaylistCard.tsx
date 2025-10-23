"use client";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ArrowUp, User, Film } from "lucide-react";

interface Playlist {
  id: string;
  title: string;
  creator?: string;
  itemCount: number;
  votes: number;
  coverColor: string;
  thumbnails: string[];
  createdAt: Date;
}

interface PlaylistCardProps {
  playlist: Playlist;
  onVote: (id: string) => void;
  onClick: (id: string) => void;
}

export default function PlaylistCard({ playlist, onVote, onClick }: PlaylistCardProps) {
  return (
    <Card
      className="overflow-hidden cursor-pointer transition-all hover:scale-[1.02] hover:shadow-xl bg-card border-border"
      onClick={() => onClick(playlist.id)}
    >
      {/* Thumbnail Grid */}
      <div className="relative h-48 grid grid-cols-2 gap-1 p-1 bg-muted">
        {playlist.thumbnails.slice(0, 4).map((thumb, idx) => (
          <div
            key={idx}
            className="relative overflow-hidden rounded"
            style={{
              background: `linear-gradient(135deg, ${playlist.coverColor}40, ${playlist.coverColor}20)`,
            }}
          >
            <div className="absolute inset-0 flex items-center justify-center text-white/20 text-4xl font-bold">
              {idx + 1}
            </div>
          </div>
        ))}
      </div>

      {/* Content */}
      <div className="p-4 space-y-3">
        <div>
          <h3 className="font-bold text-lg line-clamp-1 font-tubi">{playlist.title}</h3>
          <div className="flex items-center gap-2 text-sm text-muted-foreground mt-1 font-inter">
            <User className="w-3 h-3" />
            <span>{playlist.creator}</span>
          </div>
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-sm text-muted-foreground font-inter">
            <Film className="w-4 h-4" />
            <span>{playlist.itemCount} titles</span>
          </div>
          
          <Button
            variant="outline"
            size="sm"
            className="gap-1"
            onClick={(e) => {
              e.stopPropagation();
              onVote(playlist.id);
            }}
          >
            <ArrowUp className="w-4 h-4" />
            {playlist.votes}
          </Button>
        </div>
      </div>
    </Card>
  );
}

