# Install and debug extension for Firefox Android

a. **Prerequisite**

1. Install or update [web-ext](https://github.com/mozilla/web-ext) to version 4.1.0 or later.
2. Install the [Android Platform Tools](https://developer.android.com/tools/releases/platform-tools) (you can use Android studio's [sdk manager](https://developer.android.com/studio/intro/update.html#sdk-manager) or [sdk manager](https://developer.android.com/tools/sdkmanager) command line tools to install android platform tools)
3. Make sure you have adb installed and in your PATH.

b. **Setup Android Device**

1.  Install [Firefox for Android Nightly](https://play.google.com/store/apps/details?id=org.mozilla.fenix) on Android
2.  Enable [Android USB debugging](https://developer.android.com/studio/debug/dev-options) on the device.
3.  Attach your device to the development computer using a USB cable. When prompted, allow USB debugging for the connection.
4.  In the settings view for Firefox for Android Nightly, enable "Remote debugging via USB."
5.  Run `$ adb devices` in the command shell to get the device ID

c. **Install and run extension**

1. Remove native messaging permission from extensions manifest (web-ext currently doesn't ignore unsupported permissions. temporarily we need to do this unless we find proper solution)
2. Run extension's local development environment via `$ ALBY_API_URL="https://api.getalby.com" yarn run dev:firefox`
3. Go to extension's dist directory: `dist/development/firefox`
4. In the unzipped dist directory of the extension run `$ web-ext run -t firefox-android --adb-device <your_device_id> --firefox-apk org.mozilla.fenix`
