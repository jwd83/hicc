#!/bin/bash
cd "$(dirname "$0")/hicc/android" && ./gradlew assembleRelease

echo ""
echo "APK built successfully at hicc/android/app/build/outputs/apk/release"
