import React, {useEffect, useState} from 'react';
import {
  ActivityIndicator,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import {useNavigation, useRoute} from '@react-navigation/native';
import type {RouteProp} from '@react-navigation/native';
import type {RootStackParamList} from '../../App';
import {unlockLink} from '../services/alldebrid';
import SendIntentAndroid from 'react-native-send-intent';

type PlayerRouteProp = RouteProp<RootStackParamList, 'Player'>;

export default function PlayerScreen() {
  const navigation = useNavigation();
  const route = useRoute<PlayerRouteProp>();
  const {url, title} = route.params;

  const [status, setStatus] = useState('Preparing stream...');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    const launchVlc = async () => {
      try {
        setStatus('Unlocking link...');

        let resolved = url;
        try {
          resolved = await unlockLink(url);
        } catch (e) {
          console.warn('Failed to unlock link, falling back to original URL', e);
        }

        if (cancelled) return;

        setStatus('Opening in VLC...');

        // Use native intent to open VLC with the video URL
        await SendIntentAndroid.openAppWithData(
          'org.videolan.vlc',
          resolved,
          'video/*',
        );

        if (!cancelled) {
          navigation.goBack();
        }
      } catch (e: unknown) {
        if (cancelled) return;
        const message =
          e instanceof Error
            ? e.message
            : 'Unable to open VLC. Please ensure it is installed.';
        setError(message);
      }
    };

    launchVlc();

    return () => {
      cancelled = true;
    };
  }, [navigation, url]);

  return (
    <View style={styles.container}>
      <Text style={styles.title} numberOfLines={2}>
        {title}
      </Text>

      {error ? (
        <>
          <Text style={styles.error}>{error}</Text>
          <Pressable style={styles.button} onPress={() => navigation.goBack()}>
            <Text style={styles.buttonText}>Back</Text>
          </Pressable>
        </>
      ) : (
        <View style={styles.statusContainer}>
          <ActivityIndicator size="large" color="#fff" />
          <Text style={styles.status}>{status}</Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1a1a2e',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  title: {
    color: '#fff',
    fontSize: 22,
    fontWeight: '700',
    textAlign: 'center',
    marginBottom: 24,
  },
  statusContainer: {
    alignItems: 'center',
    gap: 12,
  },
  status: {
    color: '#a0a0a0',
    fontSize: 16,
    textAlign: 'center',
  },
  error: {
    color: '#ff6b6b',
    fontSize: 18,
    textAlign: 'center',
    marginBottom: 20,
  },
  button: {
    backgroundColor: '#2d2d44',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 10,
    borderWidth: 3,
    borderColor: 'transparent',
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});
