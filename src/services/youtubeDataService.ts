import { YouTubeVideo, YouTubeSearchResult, YouTubeCategory } from '../types';

const FALLBACK_CATEGORIES: YouTubeCategory[] = [
  { id: '10', title: 'Music', assignable: true },
  { id: '27', title: 'Education', assignable: true },
  { id: '28', title: 'Science & Technology', assignable: true }
];

const FALLBACK_VIDEOS: YouTubeVideo[] = [
  {
    id: 'jfKfPfyJRdk',
    title: 'lofi hip hop radio - beats to relax/study to',
    channelTitle: 'Lofi Girl',
    channelId: 'UCSJ4gkVC6NrvII8umztf0Ow',
    description: 'Beats to relax/study to',
    thumbnails: {
      default: { url: 'https://i.ytimg.com/vi/jfKfPfyJRdk/default.jpg' },
      medium: { url: 'https://i.ytimg.com/vi/jfKfPfyJRdk/mqdefault.jpg' },
      high: { url: 'https://i.ytimg.com/vi/jfKfPfyJRdk/hqdefault.jpg' }
    },
    publishedAt: new Date().toISOString(),
    duration: '0:00'
  },
  {
    id: '4xDzrCkZ2e8',
    title: 'Lofi Space Station beats to chill/study to',
    channelTitle: 'Lofi Girl',
    channelId: 'UCSJ4gkVC6NrvII8umztf0Ow',
    description: 'Ambient space lofi',
    thumbnails: {
      default: { url: 'https://i.ytimg.com/vi/4xDzrCkZ2e8/default.jpg' },
      medium: { url: 'https://i.ytimg.com/vi/4xDzrCkZ2e8/mqdefault.jpg' },
      high: { url: 'https://i.ytimg.com/vi/4xDzrCkZ2e8/hqdefault.jpg' }
    },
    publishedAt: new Date().toISOString(),
    duration: '0:00'
  },
  {
    id: 'lTRiuFIWV54',
    title: '1 A.M Study Session - [lofi hip hop/chill beats]',
    channelTitle: 'Lofi Girl',
    channelId: 'UCSJ4gkVC6NrvII8umztf0Ow',
    description: 'Late night focus',
    thumbnails: {
      default: { url: 'https://i.ytimg.com/vi/lTRiuFIWV54/default.jpg' },
      medium: { url: 'https://i.ytimg.com/vi/lTRiuFIWV54/mqdefault.jpg' },
      high: { url: 'https://i.ytimg.com/vi/lTRiuFIWV54/hqdefault.jpg' }
    },
    publishedAt: new Date().toISOString(),
    duration: '0:00'
  }
];

class YouTubeDataService {
  private apiKey: string = '';
  private baseUrl: string = 'https://www.googleapis.com/youtube/v3';

  constructor() {
    this.apiKey = import.meta.env.VITE_YOUTUBE_API || '';
  }

  private hasValidKey(): boolean {
    return this.apiKey.trim().length > 0;
  }

  private async makeRequest(endpoint: string, params: Record<string, string>): Promise<any> {
    if (!this.hasValidKey()) {
      throw new Error('MISSING_API_KEY');
    }

    const url = new URL(`${this.baseUrl}/${endpoint}`);
    url.searchParams.append('key', this.apiKey);

    Object.entries(params).forEach(([key, value]) => {
      url.searchParams.append(key, value);
    });

    const response = await fetch(url.toString());
    if (!response.ok) {
      throw new Error(`YouTube API error: ${response.statusText}`);
    }

    return response.json();
  }

  private formatDuration(duration: string): string {
    const match = duration.match(/PT(\d+H)?(\d+M)?(\d+S)?/);
    if (!match) return '0:00';

    const hours = match[1] ? parseInt(match[1]) : 0;
    const minutes = match[2] ? parseInt(match[2]) : 0;
    const seconds = match[3] ? parseInt(match[3]) : 0;

    if (hours > 0) {
      return `${hours}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
    }
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  }

  private mapVideoData(item: any): YouTubeVideo {
    return {
      id: item.id.videoId || item.id,
      title: item.snippet.title,
      channelTitle: item.snippet.channelTitle,
      channelId: item.snippet.channelId,
      description: item.snippet.description,
      thumbnails: {
        default: item.snippet.thumbnails.default,
        medium: item.snippet.thumbnails.medium,
        high: item.snippet.thumbnails.high
      },
      publishedAt: item.snippet.publishedAt,
      duration: item.contentDetails?.duration || '',
      viewCount: item.statistics?.viewCount,
      likeCount: item.statistics?.likeCount
    };
  }

  async searchVideos(query: string, maxResults: number = 20, pageToken?: string): Promise<YouTubeSearchResult> {
    try {
      const params: Record<string, string> = {
        part: 'snippet',
        type: 'video',
        q: query,
        maxResults: maxResults.toString(),
        order: 'relevance',
        videoCategoryId: '10'
      };

      if (pageToken) {
        params.pageToken = pageToken;
      }

      const searchResponse = await this.makeRequest('search', params);
      const videoIds = searchResponse.items.map((item: any) => item.id.videoId).join(',');

      const videoDetails = await this.makeRequest('videos', {
        part: 'snippet,contentDetails,statistics',
        id: videoIds
      });

      const videos = videoDetails.items.map((item: any) => this.mapVideoData(item));

      return {
        videos,
        nextPageToken: searchResponse.nextPageToken,
        totalResults: searchResponse.pageInfo.totalResults
      };
    } catch (error: any) {
      if (error.message === 'MISSING_API_KEY') {
        const filtered = FALLBACK_VIDEOS.filter(v =>
          v.title.toLowerCase().includes(query.toLowerCase()) ||
          v.channelTitle.toLowerCase().includes(query.toLowerCase())
        );
        return {
          videos: filtered.length > 0 ? filtered : FALLBACK_VIDEOS,
          nextPageToken: '',
          totalResults: FALLBACK_VIDEOS.length
        };
      }
      throw error;
    }
  }

  async getTrendingVideos(maxResults: number = 20): Promise<YouTubeVideo[]> {
    try {
      const response = await this.makeRequest('videos', {
        part: 'snippet,contentDetails,statistics',
        chart: 'mostPopular',
        videoCategoryId: '10',
        maxResults: maxResults.toString(),
        regionCode: 'US'
      });

      return response.items.map((item: any) => this.mapVideoData(item));
    } catch (error: any) {
      if (error.message === 'MISSING_API_KEY') {
        return FALLBACK_VIDEOS;
      }
      throw error;
    }
  }

  async getVideosByCategory(categoryId: string, maxResults: number = 20): Promise<YouTubeVideo[]> {
    try {
      const response = await this.makeRequest('videos', {
        part: 'snippet,contentDetails,statistics',
        chart: 'mostPopular',
        videoCategoryId: categoryId,
        maxResults: maxResults.toString(),
        regionCode: 'US'
      });

      return response.items.map((item: any) => this.mapVideoData(item));
    } catch (error: any) {
      if (error.message === 'MISSING_API_KEY') {
        return FALLBACK_VIDEOS;
      }
      throw error;
    }
  }

  async getVideoCategories(): Promise<YouTubeCategory[]> {
    try {
      const response = await this.makeRequest('videoCategories', {
        part: 'snippet',
        regionCode: 'US'
      });

      return response.items
        .filter((item: any) => item.snippet.assignable)
        .map((item: any) => ({
          id: item.id,
          title: item.snippet.title,
          assignable: item.snippet.assignable
        }));
    } catch (error: any) {
      if (error.message === 'MISSING_API_KEY') {
        return FALLBACK_CATEGORIES;
      }
      throw error;
    }
  }

  async getSearchSuggestions(query: string): Promise<string[]> {
    if (!query.trim()) return [];

    return new Promise((resolve) => {
      const callbackName = `jsonp_yt_${Date.now()}_${Math.floor(Math.random() * 1000)}`;
      const script = document.createElement('script');

      const cleanup = () => {
        delete (window as any)[callbackName];
        if (script.parentNode) {
          script.parentNode.removeChild(script);
        }
      };

      (window as any)[callbackName] = (data: any) => {
        cleanup();
        if (Array.isArray(data) && Array.isArray(data[1])) {
          resolve(data[1].map((item: any) => item[0] || item));
        } else {
          resolve([]);
        }
      };

      script.onerror = () => {
        cleanup();
        resolve([]);
      };

      script.src = `https://suggestqueries.google.com/complete/search?client=youtube&ds=yt&q=${encodeURIComponent(query)}&callback=${callbackName}`;
      document.body.appendChild(script);
    });
  }

  async getRelatedVideos(videoId: string, maxResults: number = 10): Promise<YouTubeVideo[]> {
    try {
      const videoResponse = await this.makeRequest('videos', {
        part: 'snippet',
        id: videoId
      });

      if (!videoResponse.items.length) return [];

      const video = videoResponse.items[0];
      const searchQuery = `${video.snippet.title} ${video.snippet.channelTitle}`;

      const searchResult = await this.searchVideos(searchQuery, maxResults);
      return searchResult.videos.filter(v => v.id !== videoId);
    } catch (error: any) {
      if (error.message === 'MISSING_API_KEY') {
        return FALLBACK_VIDEOS.filter(v => v.id !== videoId);
      }
      throw error;
    }
  }
}

export default new YouTubeDataService();
