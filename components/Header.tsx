import { Image } from "expo-image";
import { Text, View, StyleSheet } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Colors } from "@/constants/theme";

interface HeaderProps {
  
  variant?: 'solid' | 'transparent';
}

export default function Header({ variant = 'solid' }: HeaderProps) {
  const isTransparent = variant === 'transparent';

  return (
    <SafeAreaView
      edges={['top']}
      style={[
        styles.safeArea,
        isTransparent ? styles.safeAreaTransparent : styles.safeAreaSolid,
      ]}
    >
      {/* Accent line at the very bottom of the bar */}
      {!isTransparent && <View style={styles.accentLine} />}

      <View style={styles.container}>
        {/* Logo */}
        <View style={[styles.logoWrapper, isTransparent && styles.logoWrapperTransparent]}>
          <Image
            source={require("../assets/images/uict-logo.png")}
            style={styles.logo}
            contentFit="cover"
          />
        </View>

        {/* Brand text */}
        <View style={styles.brandBlock}>
          <Text style={[styles.brandName, isTransparent && styles.brandNameTransparent]}>
            AttendPay
          </Text>
          <Text style={[styles.tagline, isTransparent && styles.taglineTransparent]}>
           Attendance-based-payroll
          </Text>
        </View>

        {/* Right spacer to keep brand centered */}
        <View style={{ width: 46 }} />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    position: 'relative',
  },
  safeAreaSolid: {
    backgroundColor: '#0060B8',   // slightly deeper than primaryBlue for depth
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.18,
    shadowRadius: 8,
    elevation: 6,
  },
  safeAreaTransparent: {
    backgroundColor: 'rgba(0, 0, 0, 0.28)',
  },

  accentLine: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 3,
    backgroundColor: 'rgba(255, 255, 255, 0.18)',
  },

  container: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 18,
    paddingVertical: 12,
    gap: 12,
  },

  // Logo circle
  logoWrapper: {
    width:80,
    height: 80,
    borderRadius: 23,
    backgroundColor: '#FFFFFF',
    borderWidth: 1.5,
    borderColor: 'rgba(255, 255, 255, 0.6)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 3,
    overflow: 'hidden',
  },
  logoWrapperTransparent: {
    backgroundColor: '#FFFFFF',
    borderColor: 'rgba(255, 255, 255, 0.8)',
  },
  logo: {
    width: 78,
    height: 78,
  },

  // Brand
  brandBlock: {
    flex: 1,
    gap: 1,
  },
  brandName: {
    fontSize: 30,
    fontWeight: '800',
    color: '#FFFFFF',
    letterSpacing: 0.4,
    textAlign:"center",
  },
  brandNameTransparent: {
    color: '#FFFFFF',
    textShadowColor: 'rgba(0,0,0,0.4)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 4,
  },
  tagline: {
    fontSize: 12,
    fontWeight: '700',
    color: '#FFFFFF',
    letterSpacing: 0.2,
    textAlign:'center',
  },
  taglineTransparent: {
    color: 'rgba(255, 255, 255, 0.65)',
  },

  // Right badge
  badge: {
    paddingHorizontal: 9,
    paddingVertical: 4,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.25)',
  },
  badgeTransparent: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  badgeText: {
    fontSize: 11,
    fontWeight: '700',
    color: 'rgba(255, 255, 255, 0.9)',
    letterSpacing: 0.3,
  },
  badgeTextTransparent: {
    color: 'rgba(255, 255, 255, 0.75)',
  },
});
