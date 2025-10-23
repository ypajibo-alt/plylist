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
      <div className="relative aspect-square grid grid-cols-2 gap-1 p-1 bg-muted">
        {playlist.thumbnails && playlist.thumbnails.length > 0 ? (
          // Show actual thumbnails if available
          <>
            {playlist.thumbnails.slice(0, 4).map((thumb, idx) => (
              <div key={idx} className="relative overflow-hidden rounded">
                <img
                  src={thumb}
                  alt={`${playlist.title} item ${idx + 1}`}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    // Fallback to gradient if image fails
                    const target = e.target as HTMLImageElement;
                    target.style.background = `linear-gradient(135deg, ${playlist.coverColor}40, ${playlist.coverColor}20)`;
                    target.style.display = 'flex';
                    target.style.alignItems = 'center';
                    target.style.justifyContent = 'center';
                    target.innerText = (idx + 1).toString();
                  }}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent" />
              </div>
            ))}
            {/* Fill remaining slots if less than 4 thumbnails */}
            {playlist.thumbnails.length < 4 && 
              Array.from({ length: 4 - playlist.thumbnails.length }).map((_, idx) => (
                <div
                  key={`empty-${idx}`}
                  className="relative overflow-hidden rounded"
                  style={{
                    background: `linear-gradient(135deg, ${playlist.coverColor}40, ${playlist.coverColor}20)`,
                  }}
                >
                  <div className="absolute inset-0 flex items-center justify-center text-white/20 text-4xl font-bold">
                    +
                  </div>
                </div>
              ))
            }
          </>
        ) : (
          // Fallback to numbered placeholders for playlists without thumbnails
          Array.from({ length: 4 }).map((_, idx) => (
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
          ))
        )}
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

