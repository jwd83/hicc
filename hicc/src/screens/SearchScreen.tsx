import React, {useState, useCallback, useRef} from 'react';
import {
  View,
  Text,
  TextInput,
  FlatList,
  StyleSheet,
  ActivityIndicator,
} from 'react-native';
import {searchApibay, SearchResult} from '../services/scraper';
import {useNavigation} from '@react-navigation/native';
import type {NativeStackNavigationProp} from '@react-navigation/native-stack';
import type {RootStackParamList} from '../../App';
import TVFocusable from '../components/TVFocusable';

type NavigationProp = NativeStackNavigationProp<RootStackParamList, 'Search'>;

export default function SearchScreen() {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const navigation = useNavigation<NavigationProp>();
  const inputRef = useRef<TextInput>(null);

  const handleSearch = useCallback(async () => {
    if (!query.trim()) return;

    setLoading(true);
    setError(null);
    try {
      const searchResults = await searchApibay(query);
      setResults(searchResults);
      if (searchResults.length === 0) {
        setError('No results found');
      }
    } catch {
      setError('Search failed');
    } finally {
      setLoading(false);
    }
  }, [query]);

  const handleSelectResult = useCallback(
    (item: SearchResult) => {
      navigation.navigate('Unlock', {
        magnet: item.magnet,
        title: item.title,
        infoHash: item.infoHash,
      });
    },
    [navigation],
  );

  const renderItem = useCallback(
    ({item, index}: {item: SearchResult; index: number}) => (
      <TVFocusable
        style={styles.resultItem}
        onPress={() => handleSelectResult(item)}
        hasTVPreferredFocus={index === 0}>
        {(focused: boolean) => (
          <>
            <Text
              style={[styles.resultTitle, focused && styles.resultTitleFocused]}
              numberOfLines={2}>
              {item.title}
            </Text>
            <View style={styles.resultMeta}>
              <Text style={styles.resultSize}>{item.size}</Text>
              <Text style={styles.resultSeeds}>S: {item.seeds}</Text>
              <Text style={styles.resultLeeches}>L: {item.leeches}</Text>
            </View>
          </>
        )}
      </TVFocusable>
    ),
    [handleSelectResult],
  );

  return (
    <View style={styles.container}>
      <Text style={styles.title}>HICC</Text>
      <View style={styles.searchContainer}>
        <TextInput
          ref={inputRef}
          style={styles.input}
          value={query}
          onChangeText={setQuery}
          placeholder="Search for movies, shows..."
          placeholderTextColor="#888"
          onSubmitEditing={handleSearch}
          returnKeyType="search"
        />
        <TVFocusable
          style={styles.searchButton}
          onPress={handleSearch}
          disabled={loading}>
          {(focused: boolean) => (
            <Text
              style={[
                styles.searchButtonText,
                focused && styles.searchButtonTextFocused,
              ]}>
              Search
            </Text>
          )}
        </TVFocusable>
      </View>

      {loading && (
        <ActivityIndicator size="large" color="#fff" style={styles.loader} />
      )}

      {error && <Text style={styles.error}>{error}</Text>}

      <FlatList
        data={results}
        renderItem={renderItem}
        keyExtractor={item => item.infoHash}
        style={styles.list}
        contentContainerStyle={styles.listContent}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1a1a2e',
    padding: 20,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#fff',
    textAlign: 'center',
    marginBottom: 20,
  },
  searchContainer: {
    flexDirection: 'row',
    marginBottom: 20,
  },
  input: {
    flex: 1,
    backgroundColor: '#2d2d44',
    color: '#fff',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 8,
    fontSize: 18,
    marginRight: 10,
  },
  searchButton: {
    backgroundColor: '#6c5ce7',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
    justifyContent: 'center',
  },
  searchButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
  },
  searchButtonTextFocused: {
    color: '#FFD700',
    fontWeight: '700',
  },
  loader: {
    marginVertical: 20,
  },
  error: {
    color: '#ff6b6b',
    textAlign: 'center',
    marginBottom: 10,
  },
  list: {
    flex: 1,
  },
  listContent: {
    paddingBottom: 20,
  },
  resultItem: {
    backgroundColor: '#2d2d44',
    padding: 16,
    borderRadius: 8,
    marginBottom: 10,
  },
  resultTitle: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 8,
  },
  resultTitleFocused: {
    color: '#FFD700',
    fontWeight: '700',
  },
  resultMeta: {
    flexDirection: 'row',
    gap: 16,
  },
  resultSize: {
    color: '#a0a0a0',
    fontSize: 14,
  },
  resultSeeds: {
    color: '#2ecc71',
    fontSize: 14,
  },
  resultLeeches: {
    color: '#e74c3c',
    fontSize: 14,
  },
});
