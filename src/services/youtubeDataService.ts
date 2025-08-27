import { YouTubeVideo, YouTubeSearchResult, YouTubeCategory } from '../types';

class YouTubeDataService {
  private apiKey: string = '';
  private baseUrl: string = 'https://www.googleapis.com/youtube/v3';

  constructor() {
    this.apiKey = import.meta.env.VITE_YOUTUBE_API || '';
  }

  private async makeRequest(endpoint: string, params: Record<string, string>): Promise<any> {
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
  }

  async getTrendingVideos(maxResults: number = 20): Promise<YouTubeVideo[]> {
    const response = await this.makeRequest('videos', {
      part: 'snippet,contentDetails,statistics',
      chart: 'mostPopular',
      videoCategoryId: '10',
      maxResults: maxResults.toString(),
      regionCode: 'US'
    });

    return response.items.map((item: any) => this.mapVideoData(item));
  }

  async getVideosByCategory(categoryId: string, maxResults: number = 20): Promise<YouTubeVideo[]> {
    const response = await this.makeRequest('videos', {
      part: 'snippet,contentDetails,statistics',
      chart: 'mostPopular',
      videoCategoryId: categoryId,
      maxResults: maxResults.toString(),
      regionCode: 'US'
    });

    return response.items.map((item: any) => this.mapVideoData(item));
  }

  async getVideoCategories(): Promise<YouTubeCategory[]> {
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
  }

  async getSearchSuggestions(query: string): Promise<string[]> {
    try {
      const response = await fetch(
        `https://suggestqueries.google.com/complete/search?client=youtube&ds=yt&q=${encodeURIComponent(query)}`
      );
      const text = await response.text();
      const jsonp = text.match(/\[.*\]/);
      if (jsonp) {
        const data = JSON.parse(jsonp[0]);
        return data[1]?.map((item: any) => item[0]) || [];
      }
      return [];
    } catch (error) {
      console.error('Error fetching search suggestions:', error);
      return [];
    }
  }

  async getRelatedVideos(videoId: string, maxResults: number = 10): Promise<YouTubeVideo[]> {
    const videoResponse = await this.makeRequest('videos', {
      part: 'snippet',
      id: videoId
    });

    if (!videoResponse.items.length) return [];

    const video = videoResponse.items[0];
    const searchQuery = `${video.snippet.title} ${video.snippet.channelTitle}`;

    const searchResult = await this.searchVideos(searchQuery, maxResults);
    return searchResult.videos.filter(v => v.id !== videoId);
  }
}

export default new YouTubeDataService();