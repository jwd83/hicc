import React, {useState, useEffect, useCallback} from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  Alert,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {useNavigation} from '@react-navigation/native';
import {setApiKey} from '../services/alldebrid';
import TVFocusable from '../components/TVFocusable';

const API_KEY_STORAGE = 'alldebrid_api_key';

export default function SettingsScreen() {
  const [apiKey, setApiKeyState] = useState('');
  const [saved, setSaved] = useState(false);
  const navigation = useNavigation();

  useEffect(() => {
    AsyncStorage.getItem(API_KEY_STORAGE).then(key => {
      if (key) setApiKeyState(key);
    });
  }, []);

  const handleSave = useCallback(async () => {
    if (!apiKey.trim()) {
      Alert.alert('Error', 'Please enter an API key');
      return;
    }

    await setApiKey(apiKey.trim());
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  }, [apiKey]);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Settings</Text>

      <View style={styles.section}>
        <Text style={styles.label}>AllDebrid API Key</Text>
        <Text style={styles.hint}>
          Get your API key from alldebrid.com/apikeys
        </Text>
        <TextInput
          style={styles.input}
          value={apiKey}
          onChangeText={setApiKeyState}
          placeholder="Enter your API key"
          placeholderTextColor="#888"
          autoCapitalize="none"
          autoCorrect={false}
        />
        <TVFocusable style={styles.saveButton} onPress={handleSave}>
          {(focused: boolean) => (
            <Text
              style={[
                styles.saveButtonText,
                focused && styles.saveButtonTextFocused,
              ]}>
              {saved ? 'Saved' : 'Save API Key'}
            </Text>
          )}
        </TVFocusable>
      </View>

      <TVFocusable
        style={styles.backButton}
        onPress={() => navigation.goBack()}>
        {(focused: boolean) => (
          <Text
            style={[
              styles.backButtonText,
              focused && styles.backButtonTextFocused,
            ]}>
            Back to Search
          </Text>
        )}
      </TVFocusable>
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
    marginBottom: 30,
  },
  section: {
    marginBottom: 30,
  },
  label: {
    fontSize: 18,
    fontWeight: '600',
    color: '#fff',
    marginBottom: 8,
  },
  hint: {
    fontSize: 14,
    color: '#a0a0a0',
    marginBottom: 12,
  },
  input: {
    backgroundColor: '#2d2d44',
    color: '#fff',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 8,
    fontSize: 16,
    marginBottom: 16,
  },
  saveButton: {
    backgroundColor: '#6c5ce7',
    paddingHorizontal: 24,
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: 'center',
  },
  saveButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  saveButtonTextFocused: {
    color: '#fff',
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
});
