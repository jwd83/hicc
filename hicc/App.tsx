import React, {useCallback, useEffect, useState} from 'react';
import {NavigationContainer} from '@react-navigation/native';
import {createNativeStackNavigator} from '@react-navigation/native-stack';
import {StatusBar, View, Text, StyleSheet, Pressable} from 'react-native';
import SearchScreen from './src/screens/SearchScreen';
import UnlockScreen from './src/screens/UnlockScreen';
import PlayerScreen from './src/screens/PlayerScreen';
import SettingsScreen from './src/screens/SettingsScreen';
import LibraryScreen from './src/screens/LibraryScreen';
import {hasApiKey} from './src/services/alldebrid';

export type RootStackParamList = {
  Search: {initialQuery?: string} | undefined;
  Unlock: {
    magnet: string;
    title: string;
    infoHash: string;
    size?: string;
    seeds?: number;
    leeches?: number;
  };
  Player: {url: string; title: string};
  Settings: undefined;
  Library: undefined;
};

const Stack = createNativeStackNavigator<RootStackParamList>();

function HeaderButton({
  onPress,
  label,
}: {
  onPress: () => void;
  label: string;
}) {
  const [isFocused, setIsFocused] = useState(false);

  const handleFocus = useCallback(() => setIsFocused(true), []);
  const handleBlur = useCallback(() => setIsFocused(false), []);

  return (
    <Pressable
      onPress={onPress}
      onFocus={handleFocus}
      onBlur={handleBlur}
      style={[styles.headerButton, isFocused && styles.headerButtonFocused]}>
      <Text style={[styles.headerText, isFocused && styles.headerTextFocused]}>
        {label}
      </Text>
    </Pressable>
  );
}

export default function App() {
  const [needsApiKey, setNeedsApiKey] = useState<boolean | null>(null);

  useEffect(() => {
    hasApiKey().then(has => setNeedsApiKey(!has));
  }, []);

  if (needsApiKey === null) {
    return (
      <View style={styles.loading}>
        <Text style={styles.loadingText}>Loading...</Text>
      </View>
    );
  }

  return (
    <>
      <StatusBar barStyle="light-content" backgroundColor="#1a1a2e" />
      <NavigationContainer>
        <Stack.Navigator
          initialRouteName={needsApiKey ? 'Settings' : 'Search'}
          screenOptions={{
            headerStyle: {backgroundColor: '#1a1a2e'},
            headerTintColor: '#fff',
            headerTitleStyle: {fontWeight: '600'},
            contentStyle: {backgroundColor: '#1a1a2e'},
            animation: 'fade',
          }}>
          <Stack.Screen
            name="Search"
            component={SearchScreen}
            options={({navigation}) => ({
              title: 'HICC',
              headerRight: () => (
                <View style={styles.headerButtons}>
                  <HeaderButton
                    onPress={() => navigation.navigate('Library')}
                    label="Library"
                  />
                  <HeaderButton
                    onPress={() => navigation.navigate('Settings')}
                    label="Settings"
                  />
                </View>
              ),
            })}
          />
          <Stack.Screen
            name="Unlock"
            component={UnlockScreen}
            options={{title: 'Files'}}
          />
          <Stack.Screen
            name="Player"
            component={PlayerScreen}
            options={{
              headerShown: false,
              orientation: 'landscape',
            }}
          />
          <Stack.Screen
            name="Settings"
            component={SettingsScreen}
            options={{title: 'Settings'}}
          />
          <Stack.Screen
            name="Library"
            component={LibraryScreen}
            options={{title: 'My Library'}}
          />
        </Stack.Navigator>
      </NavigationContainer>
    </>
  );
}

const styles = StyleSheet.create({
  loading: {
    flex: 1,
    backgroundColor: '#1a1a2e',
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    color: '#fff',
    fontSize: 18,
  },
  headerButtons: {
    flexDirection: 'row',
    gap: 8,
  },
  headerButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 3,
    borderColor: 'transparent',
    backgroundColor: '#2d2d44',
  },
  headerButtonFocused: {
    borderColor: '#FFD700',
    backgroundColor: '#6c5ce7',
  },
  headerText: {
    fontSize: 16,
    color: '#a0a0a0',
    fontWeight: '500',
  },
  headerTextFocused: {
    color: '#FFD700',
    fontWeight: '700',
  },
});
