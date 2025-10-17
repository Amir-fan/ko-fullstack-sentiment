# Mobile (React Native CLI)

Quick start

- Requirements: Node, JDK/Android SDK, react-native CLI
- Env: set `API_BASE_URL` (e.g., https://ko-fullstack-sentiment-1.onrender.com)
- Run (Android):
  - `npm i`
  - `npx react-native start`
  - `npx react-native run-android`

Behavior
- One screen: list messages, input, send button.
- Calls `/register` and `/message` on first use.
- Shows sentiment returned by backend.

Build APK (debug)
- `cd android`
- `./gradlew assembleDebug` (or `gradlew.bat assembleDebug` on Windows)
- APK at `android/app/build/outputs/apk/debug/app-debug.apk`
