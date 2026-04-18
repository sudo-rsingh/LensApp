# LensApp

A small React Native document scanner. Point it at a page, it crops the edges, lets you review, and saves a PDF you can share.

Built on top of [`react-native-document-scanner-plugin`](https://github.com/websitebeaver/react-native-document-scanner-plugin), with `react-native-html-to-pdf` for export and `react-native-share` for sending things out.

## What's in it

- Scan multi-page documents with automatic edge detection
- Review pages before saving (reorder, retake, apply a filter)
- Persist scans locally, rename them, view them later
- Export as PDF and share

Screens live in `src/screens/` — `Home`, `Scan`, `Review`, `Viewer`. Navigation is plain state in `App.tsx`; there's no router dependency. Document storage is a simple hook (`src/hooks/useDocumentStore.ts`).

## Requirements

- Node 18+
- JDK 17, Android SDK (for Android)
- Xcode + CocoaPods (for iOS)

The usual React Native 0.73 setup. If you haven't done this before, the [RN environment guide](https://reactnative.dev/docs/environment-setup) is the canonical reference.

## Running it

Install:

```
npm install
```

iOS only — install pods:

```
cd ios && pod install && cd ..
```

Start Metro in one terminal:

```
npm start
```

Then in another:

```
npm run android
# or
npm run ios
```

## Tests

Unit tests (Jest + React Native Testing Library):

```
npm test
```

## Builds

Android release APKs are split per-ABI (armeabi-v7a, arm64-v8a, x86_64) — see `android/app/build.gradle`. Per-arch APKs are smaller than a universal one.

CI builds live in `.github/workflows/`.

## Project layout

```
App.tsx                # screen switcher + top-level state
src/
  screens/             # Home, Scan, Review, Viewer
  components/          # DocumentCard, FilterPicker
  hooks/               # useDocumentStore
  utils/               # generatePdf, imageProcessing
  types/               # shared types
patches/               # patch-package patches applied postinstall
```

## Notes

- `Alert.prompt` is iOS-only; the rename flow falls back to a modal on Android (see `App.tsx`).
- `postinstall` runs `patch-package` — if a patch fails to apply after a dependency bump, check `patches/`.
