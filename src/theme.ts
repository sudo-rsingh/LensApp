import {useColorScheme} from 'react-native';

const dark = {
  bg: '#000000',
  surface: '#1c1c1e',
  text: '#ffffff',
  textSecondary: '#8e8e93',
  border: '#2c2c2e',
  accent: '#007AFF',
  danger: '#ff453a',
  statusBar: 'light-content' as const,
};

const light = {
  bg: '#f2f2f7',
  surface: '#ffffff',
  text: '#000000',
  textSecondary: '#636366',
  border: '#d1d1d6',
  accent: '#007AFF',
  danger: '#ff3b30',
  statusBar: 'dark-content' as const,
};

export type Theme = typeof dark;

export function useTheme(): Theme {
  const scheme = useColorScheme();
  return scheme === 'dark' ? dark : light;
}
