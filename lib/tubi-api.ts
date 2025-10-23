/**
 * Tubi API Client for PlayApp
 * Connects to local chatgpt-app REST API for Tubi content
 */

// API base URL - chatgpt-app runs on port 3000, frontend on 3001
const API_BASE = process.env.NEXT_PUBLIC_TUBI_API_URL || "http://localhost:3000";

// ============================================================================
// Types
// ============================================================================

export interface TubiContent {
  id: string;
  type: "v" | "s" | string; // v = video/movie, s = series
  title: string;
  description?: string;
  year?: number;
  duration?: number;
  thumbnails?: string[];
  posterarts?: string[];
  hero_images?: string[];
  landscape_images?: string[];
  backgrounds?: string[];
  tags?: string[];
  actors?: string[];
  directors?: string[];
  ratings?: Array<{
    code: string;
    system: string;
    value: string;
  }>;
  video_resources?: Array<{
    manifest?: {
      duration?: number;
    };
  }>;
}

export interface SearchResponse {
  contents: TubiContent[];
  total?: number;
}

export interface BrowseContainer {
  id: string;
  title?: string;
  type?: string;
  slug?: string;
  display_name?: string;
  subtitle?: string;
}

export interface BrowseResponse {
  containers?: BrowseContainer[];
  total?: number;
}

export interface ContainerDetailsResponse {
  container?: {
    id: string;
    title?: string;
    type?: string;
    description?: string;
  };
  contents?: Record<string, TubiContent> | TubiContent[];
}

// ============================================================================
// API Functions
// ============================================================================

/**
 * Search Tubi content
 * @param query - Search query (e.g., "action movies", "comedy series")
 * @param limit - Maximum number of results (default: 20)
 */
export async function searchTubiContent(
  query: string,
  limit: number = 20
): Promise<SearchResponse | null> {
  try {
    const url = `${API_BASE}/api/search?q=${encodeURIComponent(query)}&limit=${limit}`;
    console.log(`🔍 Searching Tubi: "${query}"`);

    const response = await fetch(url);
    
    if (!response.ok) {
      console.error(`❌ Search failed: ${response.status} ${response.statusText}`);
      return null;
    }

    const data = await response.json();
    console.log(`✅ Found ${data.contents?.length || 0} results`);
    return data;
  } catch (error) {
    console.error("❌ Search error:", error);
    return null;
  }
}

/**
 * Get browse categories/containers
 * @param mode - Content mode: 'movie', 'tv', 'latino', 'linear', or undefined for all
 */
export async function getBrowseCategories(
  mode?: "movie" | "tv" | "latino" | "linear"
): Promise<BrowseResponse | null> {
  try {
    const url = mode
      ? `${API_BASE}/api/browse?mode=${mode}`
      : `${API_BASE}/api/browse`;
    console.log(`📋 Getting browse categories (mode: ${mode || "all"})`);

    const response = await fetch(url);
    
    if (!response.ok) {
      console.error(`❌ Browse failed: ${response.status} ${response.statusText}`);
      return null;
    }

    const data = await response.json();
    console.log(`✅ Found ${data.containers?.length || 0} categories`);
    return data;
  } catch (error) {
    console.error("❌ Browse error:", error);
    return null;
  }
}

/**
 * Get contents of a specific container/category
 * @param containerId - Container ID from browse list
 * @param limit - Maximum number of contents to return
 */
export async function getContainerContents(
  containerId: string,
  limit?: number
): Promise<ContainerDetailsResponse | null> {
  try {
    const url = limit
      ? `${API_BASE}/api/container/${encodeURIComponent(containerId)}?limit=${limit}`
      : `${API_BASE}/api/container/${encodeURIComponent(containerId)}`;
    console.log(`📦 Getting container: "${containerId}"`);

    const response = await fetch(url);
    
    if (!response.ok) {
      console.error(`❌ Container failed: ${response.status} ${response.statusText}`);
      return null;
    }

    const data = await response.json();
    
    // Normalize contents to array format
    let contentsArray: TubiContent[] = [];
    if (data.contents) {
      if (Array.isArray(data.contents)) {
        contentsArray = data.contents;
      } else {
        contentsArray = Object.values(data.contents);
      }
    }
    
    console.log(`✅ Found ${contentsArray.length} items in container`);
    return data;
  } catch (error) {
    console.error("❌ Container error:", error);
    return null;
  }
}

/**
 * Get details for a specific content item
 * @param contentId - Content ID
 */
export async function getContentDetails(
  contentId: string
): Promise<TubiContent | null> {
  try {
    const url = `${API_BASE}/api/content/${encodeURIComponent(contentId)}`;
    console.log(`🎬 Getting content: "${contentId}"`);

    const response = await fetch(url);
    
    if (!response.ok) {
      console.error(`❌ Content failed: ${response.status} ${response.statusText}`);
      return null;
    }

    const data = await response.json();
    console.log(`✅ Got content: "${data.title}"`);
    return data;
  } catch (error) {
    console.error("❌ Content error:", error);
    return null;
  }
}

// ============================================================================
// Helper Functions
// ============================================================================

/**
 * Get the best thumbnail image URL for a content item
 * Prefers posterarts, then thumbnails, then landscape
 */
export function getBestThumbnail(content: TubiContent): string | null {
  if (content.posterarts && content.posterarts.length > 0) {
    return content.posterarts[0];
  }
  if (content.thumbnails && content.thumbnails.length > 0) {
    return content.thumbnails[0];
  }
  if (content.landscape_images && content.landscape_images.length > 0) {
    return content.landscape_images[0];
  }
  return null;
}

/**
 * Get the best hero/background image for a content item
 */
export function getBestHeroImage(content: TubiContent): string | null {
  if (content.hero_images && content.hero_images.length > 0) {
    return content.hero_images[0];
  }
  if (content.backgrounds && content.backgrounds.length > 0) {
    return content.backgrounds[0];
  }
  return null;
}

/**
 * Format duration from seconds to human-readable string
 */
export function formatDuration(seconds?: number): string {
  if (!seconds) return "";
  
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  
  if (hours > 0) {
    return `${hours}h ${minutes}m`;
  }
  return `${minutes}m`;
}

/**
 * Get deep link to Tubi app/web
 * @param contentId - Content ID
 * @param contentType - "v" for video/movie, "s" for series
 */
export function getTubiDeepLink(contentId: string, contentType: string): string {
  // Tubi deep link format
  // Mobile app: tubi://content/{id}
  // Web fallback: https://tubitv.com/movies/{id} or https://tubitv.com/series/{id}
  
  const webPath = contentType === "s" ? "series" : "movies";
  return `https://tubitv.com/${webPath}/${contentId}`;
}

/**
 * Get content type display name
 */
export function getContentTypeName(type: string): string {
  if (type === "v") return "Movie";
  if (type === "s") return "Series";
  return "Content";
}

/**
 * Extract primary genre from tags
 */
export function getPrimaryGenre(tags?: string[]): string {
  if (!tags || tags.length === 0) return "";
  return tags[0];
}

/**
 * Get content rating display (e.g., "PG-13", "TV-14")
 */
export function getContentRating(content: TubiContent): string {
  if (!content.ratings || content.ratings.length === 0) return "";
  return content.ratings[0].code || content.ratings[0].value || "";
}

