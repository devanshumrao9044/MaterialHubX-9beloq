export const Colors = {
  light: {
    primary: '#6C63FF',
    secondary: '#2D3561',
    accent: '#FF6584',
    background: '#F8F9FD',
    card: '#FFFFFF',
    text: '#2D3561',
    textSecondary: '#8F92A1',
    border: '#E8ECF4',
    success: '#4CAF50',
    warning: '#FFA726',
    error: '#EF5350',
    gradient: ['#6C63FF', '#8B5CF6'],
    shadow: 'rgba(108, 99, 255, 0.15)',
  },
  dark: {
    primary: '#8B7CFF',
    secondary: '#E8ECF4',
    accent: '#FF6584',
    background: '#0F1419',
    card: '#1A1F2E',
    text: '#E8ECF4',
    textSecondary: '#8F92A1',
    border: '#2D3561',
    success: '#66BB6A',
    warning: '#FFB74D',
    error: '#EF5350',
    gradient: ['#6C63FF', '#8B5CF6'],
    shadow: 'rgba(0, 0, 0, 0.5)',
  },
};

export const useTheme = (isDarkMode?: boolean) => {
  return Colors[isDarkMode ? 'dark' : 'light'];
};

export const Spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
};

export const Typography = {
  h1: {
    fontSize: 28,
    fontWeight: '700' as const,
    lineHeight: 36,
  },
  h2: {
    fontSize: 24,
    fontWeight: '700' as const,
    lineHeight: 32,
  },
  h3: {
    fontSize: 20,
    fontWeight: '600' as const,
    lineHeight: 28,
  },
  body: {
    fontSize: 16,
    fontWeight: '400' as const,
    lineHeight: 24,
  },
  bodyBold: {
    fontSize: 16,
    fontWeight: '600' as const,
    lineHeight: 24,
  },
  caption: {
    fontSize: 14,
    fontWeight: '400' as const,
    lineHeight: 20,
  },
  small: {
    fontSize: 12,
    fontWeight: '400' as const,
    lineHeight: 16,
  },
};

export const BorderRadius = {
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  full: 9999,
};
