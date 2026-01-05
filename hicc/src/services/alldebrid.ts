import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

const BASE_URL = 'https://api.alldebrid.com/v4';
const BASE_URL_V41 = 'https://api.alldebrid.com/v4.1';
const AGENT = 'hicc-app';
const API_KEY_STORAGE = 'alldebrid_api_key';

export interface MagnetInfo {
  id: number;
  hash: string;
  name: string;
  ready: boolean;
  statusCode?: number;
}

export interface UnlockedFile {
  filename: string;
  link: string;
  size?: number;
}

async function getApiKey(): Promise<string | null> {
  return AsyncStorage.getItem(API_KEY_STORAGE);
}

export async function setApiKey(key: string): Promise<void> {
  await AsyncStorage.setItem(API_KEY_STORAGE, key);
}

export async function hasApiKey(): Promise<boolean> {
  const key = await getApiKey();
  return !!key;
}

export async function uploadMagnet(magnet: string): Promise<MagnetInfo> {
  const apiKey = await getApiKey();
  if (!apiKey) throw new Error('API Key not set');

  const response = await axios.get(`${BASE_URL}/magnet/upload`, {
    params: {agent: AGENT, apikey: apiKey, magnets: magnet},
  });

  // Check the magnets array first - it contains status per magnet
  const magnetData = response.data.data?.magnets?.[0];

  if (magnetData) {
    // Check if this specific magnet has an error (like MAGNET_MUST_BE_PREMIUM)
    if (magnetData.error) {
      throw new Error(magnetData.error.message || magnetData.error.code || 'Magnet error');
    }

    // Validate we have a valid ID
    if (!magnetData.id || magnetData.id === 0) {
      throw new Error('Invalid magnet ID returned from AllDebrid');
    }

    // Magnet uploaded successfully or already exists
    return {
      id: magnetData.id,
      hash: magnetData.hash || '',
      name: magnetData.name || magnetData.filename || 'Unknown',
      ready: magnetData.ready ?? false,
    };
  }

  // Top-level error
  if (response.data.status !== 'success') {
    throw new Error(response.data.error?.message || 'Failed to upload magnet');
  }

  throw new Error('No magnet data in response');
}

export async function getMagnetStatus(id: number): Promise<MagnetInfo> {
  const apiKey = await getApiKey();
  if (!apiKey) throw new Error('API Key not set');

  const headers = {Authorization: `Bearer ${apiKey}`};
  const form = new URLSearchParams();
  form.append('id', String(id));

  const response = await axios.post(`${BASE_URL_V41}/magnet/status`, form, {
    headers,
  });

  if (response.data.status !== 'success') {
    throw new Error(response.data.error?.message || 'Failed to get status');
  }

  const magnets = response.data.data.magnets;
  const m = Array.isArray(magnets) ? magnets[0] : magnets;

  return {
    id: m.id,
    hash: m.hash,
    name: m.filename,
    ready: m.statusCode === 4,
    statusCode: m.statusCode,
  };
}

// Legacy v4 GET status - returns links that need to be unlocked
async function getLegacyStatus(id: number): Promise<any> {
  const apiKey = await getApiKey();
  if (!apiKey) throw new Error('API Key not set');

  const response = await axios.get(`${BASE_URL}/magnet/status`, {
    params: {agent: AGENT, apikey: apiKey, id},
  });

  return response.data;
}

// Extract links from legacy status response
function extractLinksFromLegacyStatus(statusRes: any, id: number): string[] {
  const magnets = statusRes?.data?.magnets;
  const m = Array.isArray(magnets)
    ? magnets.find((x: any) => String(x.id) === String(id))
    : magnets && typeof magnets === 'object'
      ? magnets[String(id)]
      : null;
  const links = m?.links || [];
  return links.map((l: any) => (typeof l === 'string' ? l : l.link));
}

// Unlock individual links to get direct URLs
async function unlockLinksToFiles(links: string[]): Promise<UnlockedFile[]> {
  const apiKey = await getApiKey();
  if (!apiKey) throw new Error('API Key not set');

  const out: UnlockedFile[] = [];
  for (const link of links) {
    try {
      const response = await axios.get(`${BASE_URL}/link/unlock`, {
        params: {agent: AGENT, apikey: apiKey, link},
      });
      if (response.data?.status === 'success' && response.data?.data?.link) {
        out.push({
          filename: decodeURIComponent(response.data.data.filename || 'file'),
          link: response.data.data.link,
          size: response.data.data.filesize,
        });
      }
    } catch {
      // ignore individual link failures
    }
  }
  return out;
}

export async function getMagnetFiles(id: number): Promise<UnlockedFile[]> {
  const apiKey = await getApiKey();
  if (!apiKey) throw new Error('API Key not set');

  // Try v4.1 magnet/files
  try {
    const headers = {
      Authorization: `Bearer ${apiKey}`,
      'Content-Type': 'application/x-www-form-urlencoded',
    };
    const form = new URLSearchParams();
    form.append('id[]', String(id));

    const response = await axios.post(`${BASE_URL_V41}/magnet/files`, form.toString(), {
      headers,
    });

    if (response.data.status === 'success') {
      const files: UnlockedFile[] = [];
      const magnetsMaybeArray = response.data.data?.magnets;
      
      const magnets = Array.isArray(magnetsMaybeArray)
        ? magnetsMaybeArray
        : magnetsMaybeArray && typeof magnetsMaybeArray === 'object'
          ? Object.values(magnetsMaybeArray)
          : [];

      function flattenFiles(items: any[], pathPrefix = '') {
        for (const item of items) {
          if (item.e) {
            flattenFiles(item.e, pathPrefix + item.n + '/');
          } else if (item.l) {
            files.push({
              filename: pathPrefix + item.n,
              link: item.l,
              size: item.s,
            });
          }
        }
      }

      if (magnets.length > 0) {
        const firstMagnet = magnets[0] as any;
        if (!firstMagnet.error && firstMagnet.files) {
          flattenFiles(firstMagnet.files);
        }
      }

      if (files.length > 0) {
        return files;
      }
    }
  } catch {
    // v4.1 failed, fall through to legacy
  }

  // Fallback: use legacy v4 status + unlock links (deprecated but kept for compatibility)
  const legacy = await getLegacyStatus(id);
  const links = extractLinksFromLegacyStatus(legacy, id);
  return unlockLinksToFiles(links);
}

export async function unlockLink(link: string): Promise<string> {
  const apiKey = await getApiKey();
  if (!apiKey) throw new Error('API Key not set');

  const response = await axios.get(`${BASE_URL}/link/unlock`, {
    params: {agent: AGENT, apikey: apiKey, link},
  });

  if (response.data.status !== 'success') {
    throw new Error(response.data.error?.message || 'Failed to unlock link');
  }

  return response.data.data.link;
}

export function getVideoFiles(files: UnlockedFile[]): UnlockedFile[] {
  const videoExtensions = ['mp4', 'mkv', 'avi', 'mov', 'wmv', 'webm'];
  return files.filter(f => {
    const ext = f.filename.split('.').pop()?.toLowerCase();
    return ext && videoExtensions.includes(ext);
  });
}
