"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { Search, Menu, X, HelpCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export default function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  return (
    <nav className="bg-transparent">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="flex items-center justify-between h-16">
          {/* Left section - Menu & Logo */}
          <div className="flex items-center gap-4">
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="text-white hover:text-[#FFD302] transition-colors"
              aria-label="Menu"
            >
              {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
            
            <Link href="/" className="flex-shrink-0">
              <Image
                src="/Tubi_Logo_RGB_Hello_Yellow.webp"
                alt="Tubi"
                width={50}
                height={20}
                className="h-5 w-auto"
              />
            </Link>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center gap-6 ml-6">
              <Link href="/create" className="text-white hover:text-[#FFD302] transition-colors font-tubi text-sm">
                Playlists
              </Link>
              <Link href="/" className="text-white hover:text-[#FFD302] transition-colors font-tubi text-sm">
                Gallery
              </Link>
            </div>
          </div>

          {/* Right section - Search, Help, Sign In */}
          <div className="flex items-center gap-4">
            {/* Search */}
            <div className="hidden sm:flex items-center">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-white/60" />
                <Input
                  type="search"
                  placeholder="Find movies, TV shows and more"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 pr-4 py-2 bg-white/10 border-white/20 text-white placeholder:text-white/60 w-64 lg:w-80 focus:bg-white/20"
                />
              </div>
            </div>

            {/* Help Icon */}
            <button className="text-white hover:text-[#FFD302] transition-colors hidden md:block" aria-label="Help">
              <HelpCircle size={20} />
            </button>

            {/* Sign In / Register */}
            <div className="hidden md:flex items-center gap-2">
              <Link href="/login">
                <Button variant="ghost" className="text-white hover:text-[#FFD302] hover:bg-white/10 font-tubi">
                  Sign In
                </Button>
              </Link>
              <Link href="/signup">
                <Button className="bg-white text-black hover:bg-white/90 font-tubi">
                  Register
                </Button>
              </Link>
            </div>

            {/* Mobile Search Icon */}
            <button className="sm:hidden text-white" aria-label="Search">
              <Search size={20} />
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="md:hidden py-4">
            <div className="flex flex-col gap-3">
              <Link
                href="/create"
                className="text-white hover:text-[#FFD302] transition-colors font-tubi py-2"
                onClick={() => setIsMenuOpen(false)}
              >
                Playlists
              </Link>
              <Link
                href="/"
                className="text-white hover:text-[#FFD302] transition-colors font-tubi py-2"
                onClick={() => setIsMenuOpen(false)}
              >
                Gallery
              </Link>
              <div className="pt-3 flex flex-col gap-2">
                <Link href="/login" onClick={() => setIsMenuOpen(false)}>
                  <Button variant="ghost" className="w-full text-white hover:text-[#FFD302] hover:bg-white/10 font-tubi">
                    Sign In
                  </Button>
                </Link>
                <Link href="/signup" onClick={() => setIsMenuOpen(false)}>
                  <Button className="w-full bg-white text-black hover:bg-white/90 font-tubi">
                    Register
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}

