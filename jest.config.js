module.exports = {
  preset: 'react-native',
  testMatch: [
    '**/__tests__/**/*.test.{ts,tsx}',
    '**/?(*.)+(spec|test).{ts,tsx}',
  ],
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json'],
  transformIgnorePatterns: [
    'node_modules/(?!(react-native|@react-native|react-native-document-scanner-plugin|react-native-fs|react-native-html-to-pdf|react-native-share)/)',
  ],
};
