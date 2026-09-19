import { Slide } from '../types';

export interface ComputedThemeStyles {
  containerStyle: React.CSSProperties;
  titleStyle: React.CSSProperties;
  subtitleStyle: React.CSSProperties;
  cardStyle: React.CSSProperties;
  badgeStyle: React.CSSProperties;
  buttonStyle: React.CSSProperties;
  accentColor: string;
  secondaryColor: string;
  fontFamily: string;
  headingFontFamily: string;
}

export function getComputedThemeStyles(theme?: Slide['theme']): ComputedThemeStyles {
  const t = theme || {};

  const backgroundColor = t.backgroundColor || '#0F172A';
  const backgroundGradient = t.backgroundGradient || undefined;
  const textColor = t.textColor || '#FFFFFF';
  const accentColor = t.accentColor || '#6366F1';
  const secondaryColor = t.secondaryColor || '#EC4899';
  const cardBackgroundColor = t.cardBackgroundColor || 'rgba(30, 41, 59, 0.7)';
  const cardBorderColor = t.cardBorderColor || 'rgba(99, 102, 241, 0.3)';
  const fontFamily = t.fontFamily || 'Outfit, sans-serif';
  const headingFontFamily = t.headingFontFamily || t.fontFamily || 'Outfit, sans-serif';
  const accentBorderRadius = t.accentBorderRadius || '24px';

  // Container styling
  const containerStyle: React.CSSProperties = {
    backgroundColor,
    backgroundImage: backgroundGradient ? backgroundGradient : undefined,
    color: textColor,
    fontFamily
  };

  // Heading styling
  const titleStyle: React.CSSProperties = {
    fontFamily: headingFontFamily,
    color: textColor
  };

  // Subtitle styling
  const subtitleStyle: React.CSSProperties = {
    fontFamily,
    color: accentColor
  };

  // Card / Box styling
  const cardStyle: React.CSSProperties = {
    backgroundColor: cardBackgroundColor,
    borderColor: cardBorderColor,
    borderRadius: accentBorderRadius,
    backdropFilter: 'blur(12px)',
    WebkitBackdropFilter: 'blur(12px)'
  };

  // Badge styling
  const badgeStyle: React.CSSProperties = {
    backgroundColor: `${accentColor}22`,
    borderColor: `${accentColor}55`,
    color: accentColor,
    fontFamily
  };

  // Button styling
  const buttonStyle: React.CSSProperties = {
    backgroundColor: accentColor,
    color: '#FFFFFF',
    fontFamily: headingFontFamily
  };

  return {
    containerStyle,
    titleStyle,
    subtitleStyle,
    cardStyle,
    badgeStyle,
    buttonStyle,
    accentColor,
    secondaryColor,
    fontFamily,
    headingFontFamily
  };
}
