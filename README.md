# LensApp

A small React Native document scanner. Point it at a page, it crops the edges, lets you review, and saves a PDF you can share.

Built on [`react-native-document-scanner-plugin`](https://github.com/websitebeaver/react-native-document-scanner-plugin) with a custom native PDF generator and `react-native-share` for export.

## What's in it

- Scan multi-page documents with automatic edge detection (Google ML Kit on Android, VisionKit on iOS)
- Review pages and apply filters (Original, Grayscale, B&W, Enhanced)
- Persist scans locally, rename and delete them
- Export as PDF — share a single page or the whole document

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

- PDF generation is handled by a custom native module (`PdfGeneratorModule.kt` / `PdfGeneratorModule.swift`) rather than a third-party library.
- `postinstall` runs `patch-package` — if a patch fails to apply after a dependency bump, check `patches/`.

## Roadmap

- [ ] 1. Getting the App to a stable working state with no unpredictable behaviour.
- [ ] 2. Create a simple logo for the App.
- [ ] 4. Adding a sponsor/donate, share and contact us button.
- [ ] 3. Post the app on Play Store.
