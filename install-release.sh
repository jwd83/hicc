#!/bin/bash
cd "$(dirname "$0")/hicc/android" && adb install -r app/build/outputs/apk/release/app-release.apk
