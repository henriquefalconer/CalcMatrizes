import React from 'react';
import {View, TouchableWithoutFeedback} from 'react-native';
import MatrixArea from './MatrixArea';
import {useCalculator} from '../hooks/useCalculator';
import {useOrientation} from '../hooks/useOrientation';

const InfoArea: React.FC = () => {
  const {onPressInfoAreaBackground, fullScreenDeterminant} = useCalculator();

  const {isPortrait} = useOrientation();

  return (
    <TouchableWithoutFeedback
      onPress={onPressInfoAreaBackground}
      disabled={fullScreenDeterminant || !isPortrait}>
      <View style={{flex: 1}}>
        <MatrixArea />
      </View>
    </TouchableWithoutFeedback>
  );
};

export default InfoArea;
