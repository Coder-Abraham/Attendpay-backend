import { Image } from "expo-image";
import { useState, useEffect } from "react";
import { Text, View, StyleSheet } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

interface HeaderProps {
  variant?: 'solid' | 'transparent';
}

export default function Header({ variant = 'solid' }: HeaderProps) {
  const isTransparent = variant === 'transparent';
  const [time, setTime] = useState('');

  useEffect(() => {
    const tick = () => {
      const now = new Date();
      setTime(now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true }));
    };
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, []);

  return (
    <SafeAreaView
      edges={['top']}
      style={[styles.safeArea, isTransparent ? styles.safeAreaTransparent : styles.safeAreaSolid]}
    >
      {!isTransparent && <View style={styles.accentLine} />}

      <View style={styles.container}>

        {/* Left — logo circle */}
        <View style={[styles.logoWrapper, isTransparent && styles.logoWrapperTransparent]}>
          <Image
            source={require("../assets/images/uict-logo.png")}
            style={styles.logo}
            contentFit="cover"
          />
        </View>

        {/* Centre — brand name + tagline */}
        <View style={styles.brandBlock}>
          <Text style={[styles.brandName, isTransparent && styles.brandNameTransparent]}>
            AttendPay
          </Text>
          <Text style={[styles.tagline, isTransparent && styles.taglineTransparent]}>
            Attendance-based Payroll
          </Text>
        </View>

        {/* Right — clock image */}
        <View style={styles.clockWrapper}>
          <Image
            source={require("../assets/images/clock.jpg")}
            style={styles.clockImage}
            contentFit="cover"
          />
          <Text style={[styles.clockText, isTransparent && styles.clockTextTransparent]}>
            {time}
          </Text>
        </View>

      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    position: 'relative',
  },
  safeAreaSolid: {
    backgroundColor: '#0060B8',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.18,
    shadowRadius: 8,
    elevation: 6,
  },
  safeAreaTransparent: {
    backgroundColor: 'rgba(12, 12, 12, 0.28)',
  },
  accentLine: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 3,
    backgroundColor: 'rgba(51, 151, 168, 0.18)',
  },


  container: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 10,
    gap: 10,
    
  },

  logoWrapper: {
    width: 80,
    height: 80,
    borderRadius: 26,
    backgroundColor: '#FFFFFF',
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.7)',
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.18,
    shadowRadius: 4,
    elevation: 4,
     marginBottom:15,
  },
  logoWrapperTransparent: {
    borderColor: 'rgba(255,255,255,0.85)',
  },
  logo: {
    width: 78,
    height: 78,
   
  },

  
  brandBlock: {
    flex: 1,
    gap: 2,
  },
  brandName: {
    fontSize: 22,
    fontWeight: '800',
    color: '#FFFFFF',
    letterSpacing: 0.3,
    textAlign:"center",
    
  },
  brandNameTransparent: {
    textShadowColor: 'rgba(0,0,0,0.4)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 4,
  },
  tagline: {
    fontSize: 11,
    fontWeight: '500',
    color: 'rgba(255,255,255,0.78)',
    letterSpacing: 0.1,
    textAlign:"center"
  },
  taglineTransparent: {
    color: 'rgba(255,255,255,0.65)',
  },


  clockWrapper: {
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
  },
  clockImage: {
    width: 60,
    height: 60,
    borderRadius: 29,
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.7)',
    overflow: 'hidden',
  },
  clockText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#FFFFFF',
    letterSpacing: 0.3,
  },
  clockTextTransparent: {
    color: 'rgba(255,255,255,0.9)',
  },
});
