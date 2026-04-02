import React from 'react';
import { View } from 'react-native';
import QRCode from 'react-native-qrcode-svg';

interface QRGeneratorProps {
  value: string;
}

const QRGenerator: React.FC<QRGeneratorProps> = ({ value }) => {
  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
      <QRCode
        value={value}
        size={200}
        color="#000000"
        backgroundColor="#ffffff"
      />
    </View>
  );
};

export default QRGenerator;
