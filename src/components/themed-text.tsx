import { StyleSheet, Text, type TextProps } from 'react-native';

import { SerifFont, ThemeColor } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

export type ThemedTextProps = TextProps & {
  type?:
    | 'default'
    | 'display'
    | 'title'
    | 'subtitle'
    | 'large'
    | 'big'
    | 'bold'
    | 'mid'
    | 'small'
    | 'smallBold'
    | 'caption'
    | 'label'
    | 'amount'
    | 'price';
  themeColor?: ThemeColor;
};

export function ThemedText({ style, type = 'default', themeColor, ...rest }: ThemedTextProps) {
  const theme = useTheme();
  return (
    <Text
      style={[{ color: theme[themeColor ?? 'text'] }, styles[type], style]}
      {...rest}
    />
  );
}

// display / title / subtitle / large / big use the serif headline face.
const serif = { fontFamily: SerifFont };

const styles = StyleSheet.create({
  default: { fontSize: 16, lineHeight: 24, fontWeight: '400' },
  display: { ...serif, fontSize: 44, lineHeight: 48, fontWeight: '800', letterSpacing: -1 },
  title: { ...serif, fontSize: 32, lineHeight: 38, fontWeight: '800', letterSpacing: -0.6 },
  subtitle: { ...serif, fontSize: 24, lineHeight: 30, fontWeight: '700', letterSpacing: -0.3 },
  large: { ...serif, fontSize: 28, lineHeight: 34, fontWeight: '800', letterSpacing: -0.4 },
  big: { ...serif, fontSize: 21, lineHeight: 27, fontWeight: '700', letterSpacing: -0.2 },
  bold: { fontSize: 17, lineHeight: 22, fontWeight: '700' },
  mid: { fontSize: 15, lineHeight: 21, fontWeight: '500' },
  small: { fontSize: 14, lineHeight: 20, fontWeight: '500' },
  smallBold: { fontSize: 14, lineHeight: 20, fontWeight: '700' },
  caption: { fontSize: 12, lineHeight: 16, fontWeight: '500' },
  label: { fontSize: 11, lineHeight: 14, fontWeight: '800', letterSpacing: 1.4, textTransform: 'uppercase' },
  amount: { fontSize: 16, lineHeight: 22, fontWeight: '700', fontVariant: ['tabular-nums'] },
  price: { ...serif, fontSize: 17, lineHeight: 22, fontWeight: '800', fontVariant: ['tabular-nums'] },
});
