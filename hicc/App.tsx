import React, {useEffect, useState} from 'react';
import {NavigationContainer} from '@react-navigation/native';
import {createNativeStackNavigator} from '@react-navigation/native-stack';
import {
  StatusBar,
  View,
  Text,
  StyleSheet,
  Pressable,
  PressableStateCallbackType,
} from 'react-native';
import SearchScreen from './src/screens/SearchScreen';
import UnlockScreen from './src/screens/UnlockScreen';
import PlayerScreen from './src/screens/PlayerScreen';
import SettingsScreen from './src/screens/SettingsScreen';
import {hasApiKey} from './src/services/alldebrid';

type TVPressableState = PressableStateCallbackType & {focused?: boolean};

export type RootStackParamList = {
  Search: undefined;
  Unlock: {magnet: string; title: string; infoHash: string};
  Player: {url: string; title: string};
  Settings: undefined;
};

const Stack = createNativeStackNavigator<RootStackParamList>();

function SettingsHeaderButton({onPress}: {onPress: () => void}) {
  return (
    <Pressable
      onPress={onPress}
      style={(state: TVPressableState) => [
        styles.settingsButton,
        state.focused && styles.settingsButtonFocused,
      ]}>
      {(state: TVPressableState) => (
        <Text
          style={[
            styles.settingsText,
            state.focused && styles.settingsTextFocused,
          ]}>
          Settings
        </Text>
      )}
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
                <SettingsHeaderButton
                  onPress={() => navigation.navigate('Settings')}
                />
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
  settingsButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 3,
    borderColor: 'transparent',
  },
  settingsButtonFocused: {
    borderColor: '#6c5ce7',
    backgroundColor: 'rgba(108, 92, 231, 0.3)',
    transform: [{scale: 1.05}],
  },
  settingsText: {
    fontSize: 16,
    color: '#a0a0a0',
  },
  settingsTextFocused: {
    color: '#fff',
  },
});
