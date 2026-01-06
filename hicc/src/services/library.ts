import AsyncStorage from '@react-native-async-storage/async-storage';

const KEYS = {
  SAVED_SEARCHES: 'savedSearches',
  SAVED_MAGNETS: 'savedMagnets',
};

export interface SavedSearch {
  id: string;
  query: string;
  savedAt: string;
}

export interface SavedMagnet {
  id: string;
  title: string;
  magnet: string;
  infoHash: string;
  size: string;
  seeds: number;
  leeches: number;
  savedAt: string;
}

class LibraryService {
  // Saved Searches
  async getSavedSearches(): Promise<SavedSearch[]> {
    try {
      const data = await AsyncStorage.getItem(KEYS.SAVED_SEARCHES);
      return data ? JSON.parse(data) : [];
    } catch {
      return [];
    }
  }

  async addSavedSearch(
    searchQuery: string,
  ): Promise<{success: boolean; message: string}> {
    try {
      const searches = await this.getSavedSearches();
      const existing = searches.find(s => s.query === searchQuery);
      if (existing) {
        return {success: false, message: 'Search already saved'};
      }
      searches.unshift({
        id: Date.now().toString(),
        query: searchQuery,
        savedAt: new Date().toISOString(),
      });
      await AsyncStorage.setItem(KEYS.SAVED_SEARCHES, JSON.stringify(searches));
      return {success: true, message: 'Search saved'};
    } catch {
      return {success: false, message: 'Failed to save search'};
    }
  }

  async removeSavedSearch(id: string): Promise<{success: boolean; message: string}> {
    try {
      const searches = await this.getSavedSearches();
      const filtered = searches.filter(s => s.id !== id);
      await AsyncStorage.setItem(KEYS.SAVED_SEARCHES, JSON.stringify(filtered));
      return {success: true, message: 'Search removed'};
    } catch {
      return {success: false, message: 'Failed to remove search'};
    }
  }

  // Saved Magnets (Library Items)
  async getSavedMagnets(): Promise<SavedMagnet[]> {
    try {
      const data = await AsyncStorage.getItem(KEYS.SAVED_MAGNETS);
      return data ? JSON.parse(data) : [];
    } catch {
      return [];
    }
  }

  async addSavedMagnet(
    magnetData: Omit<SavedMagnet, 'id' | 'savedAt'>,
  ): Promise<{success: boolean; message: string}> {
    try {
      const magnets = await this.getSavedMagnets();
      const existing = magnets.find(m => m.magnet === magnetData.magnet);
      if (existing) {
        return {success: false, message: 'Already in library'};
      }
      magnets.unshift({
        id: Date.now().toString(),
        ...magnetData,
        savedAt: new Date().toISOString(),
      });
      await AsyncStorage.setItem(KEYS.SAVED_MAGNETS, JSON.stringify(magnets));
      return {success: true, message: 'Added to library'};
    } catch {
      return {success: false, message: 'Failed to add to library'};
    }
  }

  async removeSavedMagnet(id: string): Promise<{success: boolean; message: string}> {
    try {
      const magnets = await this.getSavedMagnets();
      const filtered = magnets.filter(m => m.id !== id);
      await AsyncStorage.setItem(KEYS.SAVED_MAGNETS, JSON.stringify(filtered));
      return {success: true, message: 'Removed from library'};
    } catch {
      return {success: false, message: 'Failed to remove from library'};
    }
  }

  async isMagnetSaved(magnet: string): Promise<boolean> {
    const magnets = await this.getSavedMagnets();
    return magnets.some(m => m.magnet === magnet);
  }

  async isSearchSaved(query: string): Promise<boolean> {
    const searches = await this.getSavedSearches();
    return searches.some(s => s.query === query);
  }
}

export default new LibraryService();
