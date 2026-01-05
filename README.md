```
cd hicc
npm start
npm run android
```


.zshrc updates
```
export ANDROID_HOME=~/Library/Android/sdk
export JAVA_HOME=/Applications/Android\ Studio.app/Contents/jbr/Contents/Home
export PATH=$ANDROID_HOME/platform-tools:$ANDROID_HOME/emulator:$PATH
```

installing dev builds


```
   Option 1: Using ADB (easiest if you have a computer)
   1. On the Onn 4K: Settings > Device Preferences > About > Build (click 7 times to enable Developer Mode)
   2. Go back to Device Preferences > Developer Options > Enable USB/Network debugging
   3. Note the IP address from Settings > Network & Internet
   4. From your Mac:

        adb connect <IP_ADDRESS>
        adb install /Users/jared/projects/hicc/hicc/android/app/build/outputs/apk/release/app-release.apk

   Option 2: Using a file manager app
   1. Install "Send Files to TV" on both your phone and the Onn 4K (from Play Store)
   2. Transfer the APK to the Onn 4K
   3. Install a file manager like "File Commander" or "X-plore" on the Onn 4K
   4. Enable "Install from unknown sources" for the file manager
   5. Navigate to the APK and install

   Option 3: USB drive
   1. Copy APK to a USB drive
   2. Plug into Onn 4K
   3. Use a file manager to navigate and install
   4. You'll need to enable "Install from unknown sources" first
```