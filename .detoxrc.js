/** @type {Detox.DetoxConfig} */
module.exports = {
  testRunner: {
    args: {
      $0: 'jest',
      config: 'e2e/jest.config.js',
    },
    jest: {
      setupTimeout: 120000,
    },
  },
  apps: {
    'android.debug': {
      type: 'android.apk',
      binaryPath: 'android/app/build/outputs/apk/debug/app-debug.apk',
      testBinaryPath:
        'android/app/build/outputs/apk/androidTest/debug/app-debug-androidTest.apk',
      build:
        'cd android && ./gradlew assembleDebug assembleAndroidTest -DtestBuildType=debug --no-daemon',
      reversePorts: [8081],
    },
    'android.release': {
      type: 'android.apk',
      binaryPath: 'android/app/build/outputs/apk/release/app-release.apk',
      build:
        'cd android && ./gradlew assembleRelease assembleAndroidTest -DtestBuildType=release --no-daemon',
    },
  },
  devices: {
    emulator: {
      type: 'android.emulator',
<<<<<<< HEAD
      // avdName is set by reactivecircus/android-emulator-runner in CI.
      // For local runs, create an AVD named below or override via DETOX_AVD_NAME.
      device: {avdName: process.env.DETOX_AVD_NAME ?? 'Pixel_6_API_34'},
=======
      device: {avdName: 'Pixel_6_API_34'},
>>>>>>> 6da7de6 (enulator test)
    },
  },
  configurations: {
    'android.emu.debug': {
      device: 'emulator',
      app: 'android.debug',
    },
    'android.emu.release': {
      device: 'emulator',
      app: 'android.release',
    },
  },
};
