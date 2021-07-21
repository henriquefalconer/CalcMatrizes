import React from 'react';
import {useState} from 'react';
import {View, StyleSheet} from 'react-native';
import CalculatorButton from './CalculatorButton';
import {ButtonType} from '../utilities/constants';

import {useCalculator} from '../hooks/useCalculator';

const ButtonsArea: React.FC = () => {
  const {
    shouldACAppear,
    editableOperatorNumber,
    isNumberKeyboardActive,
    selectedMatrixElement,
    secondSetOfKeysActive,
    isRActive,
    isVariableKeyboardActive,
  } = useCalculator();

  const [buttonsAreaWidth, changeButtonsAreaWidth] = useState(0);

  const styles = StyleSheet.create({
    button: {
      height: (buttonsAreaWidth / 4) * 0.7,
      flexDirection: 'row',
      marginVertical: 3,
      marginHorizontal: 6,
    },
  });

  return (
    <View
      onLayout={event => {
        changeButtonsAreaWidth(event.nativeEvent.layout.width);
      }}
      style={{
        marginBottom: 10,
      }}>
      <View style={styles.button}>
        <CalculatorButton
          buttonType={shouldACAppear ? ButtonType.AC : ButtonType.CE}
        />
        <CalculatorButton
          buttonType={isNumberKeyboardActive ? ButtonType.abc : ButtonType.R}
        />
        <CalculatorButton buttonType={ButtonType.Second} />
        <CalculatorButton
          buttonType={
            isNumberKeyboardActive
              ? ButtonType.Divide
              : isRActive
              ? ButtonType.XxBeA
              : secondSetOfKeysActive
              ? ButtonType.Transposed
              : ButtonType.Inverse
          }
        />
      </View>
      <View style={styles.button}>
        <CalculatorButton
          buttonType={
            isVariableKeyboardActive ? ButtonType.g : ButtonType.Seven
          }
        />
        <CalculatorButton
          buttonType={
            isVariableKeyboardActive ? ButtonType.h : ButtonType.Eight
          }
        />
        <CalculatorButton
          buttonType={isVariableKeyboardActive ? ButtonType.i : ButtonType.Nine}
        />
        <CalculatorButton
          buttonType={
            isNumberKeyboardActive
              ? ButtonType.Multiply
              : isRActive
              ? ButtonType.XxAeB
              : secondSetOfKeysActive
              ? ButtonType.GaussianElimination
              : ButtonType.LambdaxA
          }
        />
      </View>
      <View style={styles.button}>
        <CalculatorButton
          buttonType={isVariableKeyboardActive ? ButtonType.d : ButtonType.Four}
        />
        <CalculatorButton
          buttonType={isVariableKeyboardActive ? ButtonType.e : ButtonType.Five}
        />
        <CalculatorButton
          buttonType={isVariableKeyboardActive ? ButtonType.f : ButtonType.Six}
        />
        <CalculatorButton
          buttonType={
            isNumberKeyboardActive
              ? ButtonType.Subtract
              : isRActive
              ? ButtonType.BxXeA
              : secondSetOfKeysActive
              ? ButtonType.BxA
              : ButtonType.AxB
          }
        />
      </View>
      <View style={styles.button}>
        <CalculatorButton
          buttonType={isVariableKeyboardActive ? ButtonType.a : ButtonType.One}
        />
        <CalculatorButton
          buttonType={isVariableKeyboardActive ? ButtonType.b : ButtonType.Two}
        />
        <CalculatorButton
          buttonType={
            isVariableKeyboardActive ? ButtonType.c : ButtonType.Three
          }
        />
        <CalculatorButton
          buttonType={
            isNumberKeyboardActive
              ? ButtonType.Add
              : isRActive
              ? ButtonType.AxXeB
              : secondSetOfKeysActive
              ? ButtonType.SubtractMatrix
              : ButtonType.AddMatrix
          }
        />
      </View>
      <View style={styles.button}>
        <CalculatorButton buttonType={ButtonType.Zero} />
        <CalculatorButton buttonType={ButtonType.Comma} />
        <CalculatorButton
          buttonType={
            selectedMatrixElement || editableOperatorNumber !== null
              ? ButtonType.Enter
              : ButtonType.Check
          }
        />
      </View>
    </View>
  );
};

export default ButtonsArea;
