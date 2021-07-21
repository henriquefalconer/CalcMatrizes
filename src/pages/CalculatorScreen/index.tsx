import React from 'react';
import {SafeAreaView, StatusBar} from 'react-native';
import ButtonsArea from '../../components/ButtonsArea';
import InfoArea from '../../components/InfoArea';
import {useOrientation} from '../../hooks/useOrientation';

const CalculatorScreen: React.FC = () => {
  const {isPortrait} = useOrientation();

  return (
    <SafeAreaView style={{}}>
      <StatusBar barStyle="light-content" />
      <InfoArea />
      {isPortrait && <ButtonsArea />}
    </SafeAreaView>
  );
};

export default CalculatorScreen;
