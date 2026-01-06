import React, {useEffect, useState, useCallback} from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  ActivityIndicator,
} from 'react-native';
import {useNavigation, useRoute} from '@react-navigation/native';
import type {NativeStackNavigationProp} from '@react-navigation/native-stack';
import type {RouteProp} from '@react-navigation/native';
import type {RootStackParamList} from '../../App';
import {
  uploadMagnet,
  getMagnetStatus,
  getMagnetFiles,
  getVideoFiles,
  UnlockedFile,
} from '../services/alldebrid';
import TVFocusable from '../components/TVFocusable';
import libraryService from '../services/library';

type NavigationProp = NativeStackNavigationProp<RootStackParamList, 'Unlock'>;
type UnlockRouteProp = RouteProp<RootStackParamList, 'Unlock'>;

export default function UnlockScreen() {
  const navigation = useNavigation<NavigationProp>();
  const route = useRoute<UnlockRouteProp>();
  const {magnet, title, infoHash, size, seeds, leeches} = route.params;

  const [status, setStatus] = useState<string>('Uploading magnet...');
  const [files, setFiles] = useState<UnlockedFile[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isSaved, setIsSaved] = useState(false);

  useEffect(() => {
    libraryService.isMagnetSaved(magnet).then(setIsSaved);
  }, [magnet]);

  const handleSaveToLibrary = useCallback(async () => {
    const result = await libraryService.addSavedMagnet({
      title,
      magnet,
      infoHash,
      size: size || '',
      seeds: seeds || 0,
      leeches: leeches || 0,
    });
    if (result.success) {
      setIsSaved(true);
    }
  }, [title, magnet, infoHash, size, seeds, leeches]);

  const unlockMagnet = useCallback(async () => {
    try {
      setStatus('Uploading magnet to AllDebrid...');
      const magnetInfo = await uploadMagnet(magnet);

      if (magnetInfo.ready) {
        setStatus('Fetching files...');
        const allFiles = await getMagnetFiles(magnetInfo.id);
        const videoFiles = getVideoFiles(allFiles);
        setFiles(videoFiles);
        setStatus(`Found ${videoFiles.length} video file(s)`);
      } else {
        setStatus('Waiting for AllDebrid to cache...');
        let attempts = 0;
        const maxAttempts = 30;

        const checkStatus = async () => {
          attempts++;
          const currentStatus = await getMagnetStatus(magnetInfo.id);

          if (currentStatus.ready) {
            setStatus('Fetching files...');
            const allFiles = await getMagnetFiles(magnetInfo.id);
            const videoFiles = getVideoFiles(allFiles);
            setFiles(videoFiles);
            setStatus(`Found ${videoFiles.length} video file(s)`);
            return true;
          }

          if (attempts >= maxAttempts) {
            setError('Timeout waiting for cache. Try again later.');
            return true;
          }

          setStatus(
            `Caching... (${attempts}/${maxAttempts}) - Status: ${currentStatus.statusCode}`,
          );
          return false;
        };

        const pollInterval = setInterval(async () => {
          const done = await checkStatus();
          if (done) {
            clearInterval(pollInterval);
            setLoading(false);
          }
        }, 3000);

        return () => clearInterval(pollInterval);
      }
    } catch (e: any) {
      setError(e.message || 'Failed to unlock magnet');
    } finally {
      setLoading(false);
    }
  }, [magnet]);

  useEffect(() => {
    unlockMagnet();
  }, [unlockMagnet]);

  const handlePlayFile = useCallback(
    (file: UnlockedFile) => {
      navigation.navigate('Player', {
        url: file.link,
        title: file.filename,
      });
    },
    [navigation],
  );

  const renderFile = useCallback(
    ({item, index}: {item: UnlockedFile; index: number}) => (
      <TVFocusable
        style={styles.fileItem}
        onPress={() => handlePlayFile(item)}
        hasTVPreferredFocus={index === 0}>
        {(focused: boolean) => (
          <>
            <Text
              style={[styles.fileName, focused && styles.fileNameFocused]}
              numberOfLines={2}>
              {item.filename}
            </Text>
            <Text style={[styles.playText, focused && styles.playTextFocused]}>
              Play
            </Text>
          </>
        )}
      </TVFocusable>
    ),
    [handlePlayFile],
  );

  return (
    <View style={styles.container}>
      <Text style={styles.title} numberOfLines={2}>
        {title}
      </Text>

      {loading && (
        <View style={styles.statusContainer}>
          <ActivityIndicator size="large" color="#fff" />
          <Text style={styles.status}>{status}</Text>
        </View>
      )}

      {error && <Text style={styles.error}>{error}</Text>}

      {!loading && files.length > 0 && (
        <>
          <Text style={styles.sectionTitle}>Video Files</Text>
          <FlatList
            data={files}
            renderItem={renderFile}
            keyExtractor={item => item.link}
            style={styles.list}
          />
        </>
      )}

      {!loading && files.length === 0 && !error && (
        <Text style={styles.noFiles}>No video files found</Text>
      )}

      <View style={styles.buttonRow}>
        {!isSaved ? (
          <TVFocusable style={styles.saveButton} onPress={handleSaveToLibrary}>
            {(focused: boolean) => (
              <Text
                style={[
                  styles.saveButtonText,
                  focused && styles.saveButtonTextFocused,
                ]}>
                Save to Library
              </Text>
            )}
          </TVFocusable>
        ) : (
          <View style={styles.savedIndicator}>
            <Text style={styles.savedText}>In Library</Text>
          </View>
        )}
        <TVFocusable style={styles.backButton} onPress={() => navigation.goBack()}>
          {(focused: boolean) => (
            <Text
              style={[
                styles.backButtonText,
                focused && styles.backButtonTextFocused,
              ]}>
              Back
            </Text>
          )}
        </TVFocusable>
      </View>
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
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 20,
  },
  statusContainer: {
    alignItems: 'center',
    marginVertical: 40,
  },
  status: {
    color: '#a0a0a0',
    fontSize: 16,
    marginTop: 16,
    textAlign: 'center',
  },
  error: {
    color: '#ff6b6b',
    fontSize: 16,
    textAlign: 'center',
    marginVertical: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#fff',
    marginBottom: 12,
  },
  list: {
    flex: 1,
  },
  fileItem: {
    backgroundColor: '#2d2d44',
    padding: 16,
    borderRadius: 8,
    marginBottom: 10,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  fileName: {
    color: '#fff',
    fontSize: 16,
    flex: 1,
    marginRight: 16,
  },
  fileNameFocused: {
    color: '#fff',
  },
  playText: {
    color: '#6c5ce7',
    fontSize: 16,
    fontWeight: '600',
  },
  playTextFocused: {
    color: '#fff',
  },
  noFiles: {
    color: '#a0a0a0',
    fontSize: 16,
    textAlign: 'center',
    marginVertical: 40,
  },
  backButton: {
    marginTop: 20,
    padding: 12,
    borderRadius: 8,
  },
  backButtonText: {
    color: '#6c5ce7',
    fontSize: 16,
  },
  backButtonTextFocused: {
    color: '#fff',
  },
  buttonRow: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 20,
  },
  saveButton: {
    flex: 1,
    backgroundColor: '#2ecc71',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  saveButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  saveButtonTextFocused: {
    color: '#FFD700',
  },
  savedIndicator: {
    flex: 1,
    backgroundColor: '#2d2d44',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  savedText: {
    color: '#2ecc71',
    fontSize: 16,
    fontWeight: '600',
  },
});
