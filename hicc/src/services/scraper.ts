import axios from 'axios';

const BASE_URL = 'https://apibay.org';

export interface SearchResult {
  title: string;
  seeds: number;
  leeches: number;
  size: string;
  magnet: string;
  infoHash: string;
}

function formatSize(bytes: number): string {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

export async function searchApibay(query: string): Promise<SearchResult[]> {
  const sanitizedQuery = query.replace(/'/g, ' ').replace(/\s+/g, ' ').trim();
  
  try {
    const searchUrl = `${BASE_URL}/q.php?q=${encodeURIComponent(sanitizedQuery)}&cat=0`;
    const response = await axios.get(searchUrl);
    const results = response.data;

    if (results[0] && results[0].name === 'No results returned') {
      return [];
    }

    return results.map((item: any) => ({
      title: item.name,
      seeds: parseInt(item.seeders, 10),
      leeches: parseInt(item.leechers, 10),
      size: formatSize(parseInt(item.size, 10)),
      magnet: `magnet:?xt=urn:btih:${item.info_hash}&dn=${encodeURIComponent(item.name)}`,
      infoHash: item.info_hash,
    }));
  } catch (error) {
    console.error('Scraper search error:', error);
    return [];
  }
}
