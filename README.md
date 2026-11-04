This is a new [**React Native**](https://reactnative.dev) project, bootstrapped using [`@react-native-community/cli`](https://github.com/react-native-community/cli).

# Getting Started

> **Note**: Make sure you have completed the [Set Up Your Environment](https://reactnative.dev/docs/set-up-your-environment) guide before proceeding.

## Step 1: Start Metro

First, you will need to run **Metro**, the JavaScript build tool for React Native.

To start the Metro dev server, run the following command from the root of your React Native project:

```sh
# Using npm
npm start

# OR using Yarn
yarn start
```

## Step 2: Build and run your app

With Metro running, open a new terminal window/pane from the root of your React Native project, and use one of the following commands to build and run your Android or iOS app:

### Android

```sh
# Using npm
npm run android

# OR using Yarn
yarn android
```

### iOS

For iOS, remember to install CocoaPods dependencies (this only needs to be run on first clone or after updating native deps).

The first time you create a new project, run the Ruby bundler to install CocoaPods itself:

```sh
bundle install
```

Then, and every time you update your native dependencies, run:

```sh
bundle exec pod install
```

For more information, please visit [CocoaPods Getting Started guide](https://guides.cocoapods.org/using/getting-started.html).

```sh
# Using npm
npm run ios

# OR using Yarn
yarn ios
```

If everything is set up correctly, you should see your new app running in the Android Emulator, iOS Simulator, or your connected device.

This is one way to run your app — you can also build it directly from Android Studio or Xcode.

## Step 3: Modify your app

Now that you have successfully run the app, let's make changes!

Open `App.tsx` in your text editor of choice and make some changes. When you save, your app will automatically update and reflect these changes — this is powered by [Fast Refresh](https://reactnative.dev/docs/fast-refresh).

When you want to forcefully reload, for example to reset the state of your app, you can perform a full reload:

- **Android**: Press the <kbd>R</kbd> key twice or select **"Reload"** from the **Dev Menu**, accessed via <kbd>Ctrl</kbd> + <kbd>M</kbd> (Windows/Linux) or <kbd>Cmd ⌘</kbd> + <kbd>M</kbd> (macOS).
- **iOS**: Press <kbd>R</kbd> in iOS Simulator.

## Congratulations! :tada:

You've successfully run and modified your React Native App. :partying_face:

### Now what?

- If you want to add this new React Native code to an existing application, check out the [Integration guide](https://reactnative.dev/docs/integration-with-existing-apps).
- If you're curious to learn more about React Native, check out the [docs](https://reactnative.dev/docs/getting-started).

# Troubleshooting

If you're having issues getting the above steps to work, see the [Troubleshooting](https://reactnative.dev/docs/troubleshooting) page.

# Learn More

To learn more about React Native, take a look at the following resources:

- [React Native Website](https://reactnative.dev) - learn more about React Native.
- [Getting Started](https://reactnative.dev/docs/environment-setup) - an **overview** of React Native and how setup your environment.
- [Learn the Basics](https://reactnative.dev/docs/getting-started) - a **guided tour** of the React Native **basics**.
- [Blog](https://reactnative.dev/blog) - read the latest official React Native **Blog** posts.
- [`@facebook/react-native`](https://github.com/facebook/react-native) - the Open Source; GitHub **repository** for React Native.

## Firebase Chat Setup

The app uses the Firebase JavaScript SDK (`firebase/auth` and `firebase/database`),
with React Native Auth persistence backed by AsyncStorage. It does not use the
`@react-native-firebase` APIs.

1. In Firebase Console, create a project, add an app using the **Web** platform,
   enable **Authentication > Email/Password**, and create a **Realtime Database**.
2. Copy the Web app values into `firebaseConfig` in `src/services/firebase.ts`:
   `apiKey`, `authDomain`, `projectId`, and `appId`. Replace `databaseURL` with
   the exact URL shown for the Realtime Database instance (including its region).
   The app displays an explicit setup error until every placeholder is replaced.
3. Review `database.rules.json` against the official rules supplied by the
   assignment and the Firebase Console data structure, then publish the rules.
   The included rules deny unauthenticated access and restrict user data,
   presence, chat reads, and writes to authenticated users and chat members.
4. The proposed RTDB schema is:
   - `users/{uid}`: public display name, optional avatar URL, and creation time.
   - `userPrivate/{uid}/email`: email address readable only by its owner.
   - `presence/{uid}/connections/{connectionId}` and `lastSeen`: onDisconnect
     presence; online state is derived from active connection records.
   - `chats/{chatId}`: stable UID-pair ID, fixed `members.first` /
     `members.second` UIDs, metadata, and messages.
   - `userChats/{uid}/{chatId}`: per-user chat index, preview, and
     `unreadMessages/{messageId}` markers. Unique markers are atomically written
     with each message so concurrent messages do not overwrite unread counts.
5. After adding or changing native geolocation setup, install iOS pods if needed
   and rebuild the native app. The Android location permissions are declared in
   `android/app/src/main/AndroidManifest.xml`; iOS uses
   `NSLocationWhenInUseUsageDescription` in `ios/MiniChat_TH3/Info.plist`.

Run the app with `npm start` and, in another terminal, `npm run android` or
`npm run ios`. The iOS run command requires macOS and Xcode.
