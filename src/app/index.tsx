import { LogoMark } from '@/components/brand';
import { ThemedText } from '@/components/themed-text';
import { Sprinkles } from '@/components/ui';
import { Brand } from '@/constants/brand';
import { Colors, SerifFont } from '@/constants/theme';
import { useAuth } from '@/context/PageContext';
import { goReplace } from '@/lib/nav';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useEffect, useRef, useState } from 'react';
import { StatusBar, View } from 'react-native';

const MIN_SPLASH_MS = 1100;
const MAX_WAIT_MS = 5000; // don't hang on the splash if the network is down

/** Branded splash. Routes to home (signed in), sign-in (returning) or onboarding (first launch). */
export default function Splash() {
  const { authReady, uid, profileReady } = useAuth();
  const [minElapsed, setMinElapsed] = useState(false);
  const [timedOut, setTimedOut] = useState(false);
  const navigated = useRef(false);

  useEffect(() => {
    const a = setTimeout(() => setMinElapsed(true), MIN_SPLASH_MS);
    const b = setTimeout(() => setTimedOut(true), MAX_WAIT_MS);
    return () => {
      clearTimeout(a);
      clearTimeout(b);
    };
  }, []);

  useEffect(() => {
    if (navigated.current || !authReady || !minElapsed) return;
    if (uid && !profileReady && !timedOut) return; // let the profile load so Home isn't empty
    navigated.current = true;

    (async () => {
      if (uid) return goReplace('/(tabs)/home');
      let target = '/onboard';
      try {
        if ((await AsyncStorage.getItem('onboarded')) === 'true') target = '/auth/logIn';
      } catch (e) {
        console.error('Unable to read onboarding status', e);
      }
      goReplace(target);
    })();
  }, [authReady, uid, profileReady, minElapsed, timedOut]);

  return (
    <View style={{ flex: 1, backgroundColor: Colors.hero, alignItems: 'center', justifyContent: 'center' }}>
      <StatusBar barStyle="light-content" />
      <Sprinkles opacity={0.2} />
      <LogoMark size={96} light />
      <ThemedText
        style={{ fontFamily: SerifFont, color: '#FFF8F0', fontSize: 44, lineHeight: 50, fontWeight: '800', letterSpacing: -1, marginTop: 20 }}
      >
        {Brand.name}
      </ThemedText>
      <ThemedText style={{ color: Colors.heroMuted, letterSpacing: 6, fontWeight: '800', fontSize: 12, marginTop: 2 }}>KITCHEN</ThemedText>
      <ThemedText style={{ color: Colors.heroMuted, marginTop: 28, fontWeight: '600' }}>{Brand.tagline}</ThemedText>
    </View>
  );
}
