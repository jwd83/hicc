import React, {useState, useCallback} from 'react';
import {View, Text, FlatList, StyleSheet} from 'react-native';
import {useNavigation, useFocusEffect} from '@react-navigation/native';
import type {NativeStackNavigationProp} from '@react-navigation/native-stack';
import type {RootStackParamList} from '../../App';
import TVFocusable from '../components/TVFocusable';
import libraryService, {SavedSearch, SavedMagnet} from '../services/library';

type NavigationProp = NativeStackNavigationProp<RootStackParamList, 'Library'>;

type Tab = 'library' | 'searches';

export default function LibraryScreen() {
  const navigation = useNavigation<NavigationProp>();
  const [activeTab, setActiveTab] = useState<Tab>('library');
  const [savedMagnets, setSavedMagnets] = useState<SavedMagnet[]>([]);
  const [savedSearches, setSavedSearches] = useState<SavedSearch[]>([]);

  const loadData = useCallback(async () => {
    const [magnets, searches] = await Promise.all([
      libraryService.getSavedMagnets(),
      libraryService.getSavedSearches(),
    ]);
    setSavedMagnets(magnets);
    setSavedSearches(searches);
  }, []);

  useFocusEffect(
    useCallback(() => {
      loadData();
    }, [loadData]),
  );

  const handleMagnetSelect = useCallback(
    (item: SavedMagnet) => {
      navigation.navigate('Unlock', {
        magnet: item.magnet,
        title: item.title,
        infoHash: item.infoHash,
      });
    },
    [navigation],
  );

  const handleSearchSelect = useCallback(
    (query: string) => {
      navigation.navigate('Search', {initialQuery: query});
    },
    [navigation],
  );

  const handleRemoveMagnet = useCallback(
    async (id: string) => {
      await libraryService.removeSavedMagnet(id);
      loadData();
    },
    [loadData],
  );

  const handleRemoveSearch = useCallback(
    async (id: string) => {
      await libraryService.removeSavedSearch(id);
      loadData();
    },
    [loadData],
  );

  const renderMagnetItem = useCallback(
    ({item, index}: {item: SavedMagnet; index: number}) => (
      <View style={styles.itemRow}>
        <TVFocusable
          style={styles.itemContent}
          onPress={() => handleMagnetSelect(item)}
          hasTVPreferredFocus={index === 0 && activeTab === 'library'}>
          {(focused: boolean) => (
            <>
              <Text
                style={[styles.itemTitle, focused && styles.itemTitleFocused]}
                numberOfLines={2}>
                {item.title}
              </Text>
              <View style={styles.itemMeta}>
                <Text style={styles.itemSize}>{item.size}</Text>
                <Text style={styles.itemSeeds}>S: {item.seeds}</Text>
                <Text style={styles.itemLeeches}>L: {item.leeches}</Text>
              </View>
              <Text style={styles.itemDate}>
                Added {new Date(item.savedAt).toLocaleDateString()}
              </Text>
            </>
          )}
        </TVFocusable>
        <TVFocusable
          style={styles.removeButton}
          onPress={() => handleRemoveMagnet(item.id)}>
          {(focused: boolean) => (
            <Text
              style={[
                styles.removeButtonText,
                focused && styles.removeButtonTextFocused,
              ]}>
              Remove
            </Text>
          )}
        </TVFocusable>
      </View>
    ),
    [handleMagnetSelect, handleRemoveMagnet, activeTab],
  );

  const renderSearchItem = useCallback(
    ({item, index}: {item: SavedSearch; index: number}) => (
      <View style={styles.itemRow}>
        <TVFocusable
          style={styles.itemContent}
          onPress={() => handleSearchSelect(item.query)}
          hasTVPreferredFocus={index === 0 && activeTab === 'searches'}>
          {(focused: boolean) => (
            <>
              <Text
                style={[styles.itemTitle, focused && styles.itemTitleFocused]}
                numberOfLines={1}>
                {item.query}
              </Text>
              <Text style={styles.itemDate}>
                Saved {new Date(item.savedAt).toLocaleDateString()}
              </Text>
            </>
          )}
        </TVFocusable>
        <TVFocusable
          style={styles.removeButton}
          onPress={() => handleRemoveSearch(item.id)}>
          {(focused: boolean) => (
            <Text
              style={[
                styles.removeButtonText,
                focused && styles.removeButtonTextFocused,
              ]}>
              Remove
            </Text>
          )}
        </TVFocusable>
      </View>
    ),
    [handleSearchSelect, handleRemoveSearch, activeTab],
  );

  return (
    <View style={styles.container}>
      <View style={styles.tabContainer}>
        <TVFocusable
          style={[styles.tab, activeTab === 'library' && styles.activeTab]}
          onPress={() => setActiveTab('library')}>
          {(focused: boolean) => (
            <Text
              style={[
                styles.tabText,
                activeTab === 'library' && styles.activeTabText,
                focused && styles.tabTextFocused,
              ]}>
              My Library ({savedMagnets.length})
            </Text>
          )}
        </TVFocusable>
        <TVFocusable
          style={[styles.tab, activeTab === 'searches' && styles.activeTab]}
          onPress={() => setActiveTab('searches')}>
          {(focused: boolean) => (
            <Text
              style={[
                styles.tabText,
                activeTab === 'searches' && styles.activeTabText,
                focused && styles.tabTextFocused,
              ]}>
              Saved Searches ({savedSearches.length})
            </Text>
          )}
        </TVFocusable>
      </View>

      {activeTab === 'library' && (
        <>
          {savedMagnets.length === 0 ? (
            <Text style={styles.emptyText}>No saved items yet</Text>
          ) : (
            <FlatList
              data={savedMagnets}
              renderItem={renderMagnetItem}
              keyExtractor={item => item.id}
              style={styles.list}
              contentContainerStyle={styles.listContent}
            />
          )}
        </>
      )}

      {activeTab === 'searches' && (
        <>
          {savedSearches.length === 0 ? (
            <Text style={styles.emptyText}>No saved searches yet</Text>
          ) : (
            <FlatList
              data={savedSearches}
              renderItem={renderSearchItem}
              keyExtractor={item => item.id}
              style={styles.list}
              contentContainerStyle={styles.listContent}
            />
          )}
        </>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1a1a2e',
    padding: 20,
  },
  tabContainer: {
    flexDirection: 'row',
    marginBottom: 20,
    gap: 12,
  },
  tab: {
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 24,
    backgroundColor: '#2d2d44',
  },
  activeTab: {
    backgroundColor: '#6c5ce7',
  },
  tabText: {
    color: '#a0a0a0',
    fontSize: 16,
    fontWeight: '500',
  },
  activeTabText: {
    color: '#fff',
  },
  tabTextFocused: {
    color: '#FFD700',
  },
  list: {
    flex: 1,
  },
  listContent: {
    paddingBottom: 20,
  },
  itemRow: {
    flexDirection: 'row',
    marginBottom: 10,
    gap: 10,
  },
  itemContent: {
    flex: 1,
    backgroundColor: '#2d2d44',
    padding: 16,
    borderRadius: 8,
  },
  itemTitle: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 8,
  },
  itemTitleFocused: {
    color: '#FFD700',
    fontWeight: '700',
  },
  itemMeta: {
    flexDirection: 'row',
    gap: 16,
    marginBottom: 4,
  },
  itemSize: {
    color: '#a0a0a0',
    fontSize: 14,
  },
  itemSeeds: {
    color: '#2ecc71',
    fontSize: 14,
  },
  itemLeeches: {
    color: '#e74c3c',
    fontSize: 14,
  },
  itemDate: {
    color: '#666',
    fontSize: 12,
    marginTop: 4,
  },
  removeButton: {
    backgroundColor: '#2d2d44',
    paddingHorizontal: 16,
    borderRadius: 8,
    justifyContent: 'center',
  },
  removeButtonText: {
    color: '#e74c3c',
    fontSize: 14,
    fontWeight: '500',
  },
  removeButtonTextFocused: {
    color: '#ff6b6b',
  },
  emptyText: {
    color: '#666',
    fontSize: 16,
    textAlign: 'center',
    marginTop: 40,
  },
});
