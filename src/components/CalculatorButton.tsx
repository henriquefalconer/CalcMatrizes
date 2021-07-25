import React, { useMemo } from "react";
import { Image, TouchableOpacity } from "react-native";
import { ButtonType, CalcState, Operator } from "../utils/constants";
import ButtonData from "../interfaces/ButtonData";

import { useCalculator } from "../hooks/useCalculator";

interface CalculatorButtonProps {
  buttonType: ButtonType;
}

const CalculatorButton = ({ buttonType }: CalculatorButtonProps) => {
  const useCalculatorData = useCalculator();

  const buttonData = useMemo(() => {
    const {
      calcState,
      fullScreenDeterminant: fullKeyboardDisabled,
      isNumberKeyboardActive,
      isVariableKeyboardActive,
      onPressNumberButton,
      changeColumnDirectionActive,
      changeSecondSetOfKeysActive,
      isMatrixSquare,
      isInverseEnabled,
      changeIsVariableKeyboardActive,
      secondSetOfKeysActive,
      columnDirectionActive,
      selectedOperator,
      editableOperatorNumber,
      isRActive,
      onPressAC,
      onLongPressAC,
      onPressCE,
      onPressLambdaxA,
      onPressR,
      onPressAxB,
      onPressBxA,
      onInvert,
      onTranspose,
      onPressResolveEquation,
      onPressGaussianElimination,
      onPressAddMatrix,
      onPressSubtractMatrix,
      onPressOperator,
      onEnter,
      onCheck,
    } = useCalculatorData;

    const getData = () => {
      switch (buttonType) {
        case ButtonType.Zero:
          return {
            source: require("../assets/buttons/0.png"),
            flex: 2,
            onPress: () => onPressNumberButton("0"),
            disabled: !isNumberKeyboardActive || isVariableKeyboardActive,
          };
        case ButtonType.One:
          return {
            source: require("../assets/buttons/1.png"),
            onPress: () => onPressNumberButton("1"),
            disabled: !isNumberKeyboardActive,
          };
        case ButtonType.Two:
          return {
            source: require("../assets/buttons/2.png"),
            onPress: () => onPressNumberButton("2"),
            disabled: !isNumberKeyboardActive,
          };
        case ButtonType.Three:
          return {
            source: require("../assets/buttons/3.png"),
            onPress: () => onPressNumberButton("3"),
            disabled: !isNumberKeyboardActive,
          };
        case ButtonType.Four:
          return {
            source: require("../assets/buttons/4.png"),
            onPress: () => onPressNumberButton("4"),
            disabled: !isNumberKeyboardActive,
          };
        case ButtonType.Five:
          return {
            source: require("../assets/buttons/5.png"),
            onPress: () => onPressNumberButton("5"),
            disabled: !isNumberKeyboardActive,
          };
        case ButtonType.Six:
          return {
            source: require("../assets/buttons/6.png"),
            onPress: () => onPressNumberButton("6"),
            disabled: !isNumberKeyboardActive,
          };
        case ButtonType.Seven:
          return {
            source: require("../assets/buttons/7.png"),
            onPress: () => onPressNumberButton("7"),
            disabled: !isNumberKeyboardActive,
          };
        case ButtonType.Eight:
          return {
            source: require("../assets/buttons/8.png"),
            onPress: () => onPressNumberButton("8"),
            disabled: !isNumberKeyboardActive,
          };
        case ButtonType.Nine:
          return {
            source: require("../assets/buttons/9.png"),
            onPress: () => onPressNumberButton("9"),
            disabled: !isNumberKeyboardActive,
          };
        case ButtonType.Comma:
          return {
            source: require("../assets/buttons/Comma.png"),
            onPress: () => onPressNumberButton("."),
            disabled: !isNumberKeyboardActive || isVariableKeyboardActive,
          };
        case ButtonType.a:
          return {
            source: require("../assets/buttons/a.png"),
            onPress: () => onPressNumberButton("a"),
            disabled: !isNumberKeyboardActive,
          };
        case ButtonType.b:
          return {
            source: require("../assets/buttons/b.png"),
            onPress: () => onPressNumberButton("b"),
            disabled: !isNumberKeyboardActive,
          };
        case ButtonType.c:
          return {
            source: require("../assets/buttons/c.png"),
            onPress: () => onPressNumberButton("c"),
            disabled: !isNumberKeyboardActive,
          };
        case ButtonType.d:
          return {
            source: require("../assets/buttons/d.png"),
            onPress: () => onPressNumberButton("d"),
            disabled: !isNumberKeyboardActive,
          };
        case ButtonType.e:
          return {
            source: require("../assets/buttons/e.png"),
            onPress: () => onPressNumberButton("e"),
            disabled: !isNumberKeyboardActive,
          };
        case ButtonType.f:
          return {
            source: require("../assets/buttons/f.png"),
            onPress: () => onPressNumberButton("f"),
            disabled: !isNumberKeyboardActive,
          };
        case ButtonType.g:
          return {
            source: require("../assets/buttons/g.png"),
            onPress: () => onPressNumberButton("g"),
            disabled: !isNumberKeyboardActive,
          };
        case ButtonType.h:
          return {
            source: require("../assets/buttons/h.png"),
            onPress: () => onPressNumberButton("h"),
            disabled: !isNumberKeyboardActive,
          };
        case ButtonType.i:
          return {
            source: require("../assets/buttons/i.png"),
            onPress: () => onPressNumberButton("i"),
            disabled: !isNumberKeyboardActive,
          };
        case ButtonType.AC:
          return {
            source: require("../assets/buttons/AC.png"),
            onPress: onPressAC,
            onLongPress: onLongPressAC,
          };
        case ButtonType.CE:
          return {
            source: require("../assets/buttons/CE.png"),
            onPress: onPressCE,
          };
        case ButtonType.abc:
          return {
            source: require("../assets/buttons/abc.png"),
            sourceActive: require("../assets/buttons/abcSelected.png"),
            active: isVariableKeyboardActive,
            onPress: changeIsVariableKeyboardActive,
          };
        case ButtonType.Save:
          return {
            source: require("../assets/buttons/Save.png"),
          };
        case ButtonType.SavedList:
          return {
            source: require("../assets/buttons/SavedList.png"),
          };
        case ButtonType.Second:
          return {
            source: require("../assets/buttons/InactiveSecond.png"),
            sourceActive: require("../assets/buttons/ActiveSecond.png"),
            active: secondSetOfKeysActive,
            disabled: isNumberKeyboardActive || isRActive,
            onPress: changeSecondSetOfKeysActive,
          };
        case ButtonType.ColumnDirection:
          return {
            source: require("../assets/buttons/InactiveColumnDirection.png"),
            sourceActive: require("../assets/buttons/ActiveColumnDirection.png"),
            active: columnDirectionActive,
            onPress: changeColumnDirectionActive,
          };
        case ButtonType.R:
          return {
            source: require("../assets/buttons/R.png"),
            sourceActive: require("../assets/buttons/RSelected.png"),
            active: isRActive,
            disabled: isNumberKeyboardActive,
            onPress: onPressR,
          };
        case ButtonType.AxXeB:
          return {
            source: require("../assets/buttons/AxXeB.png"),
            sourceActive: require("../assets/buttons/AxXeBActive.png"),
            active: calcState === CalcState.AxXeB,
            onPress: () => onPressResolveEquation(CalcState.AxXeB),
          };
        case ButtonType.BxXeA:
          return {
            source: require("../assets/buttons/BxXeA.png"),
            sourceActive: require("../assets/buttons/BxXeAActive.png"),
            active: calcState === CalcState.BxXeA,
            onPress: () => onPressResolveEquation(CalcState.BxXeA),
          };
        case ButtonType.XxAeB:
          return {
            source: require("../assets/buttons/XxAeB.png"),
            sourceActive: require("../assets/buttons/XxAeBActive.png"),
            active: calcState === CalcState.XxAeB,
            onPress: () => onPressResolveEquation(CalcState.XxAeB),
          };
        case ButtonType.XxBeA:
          return {
            source: require("../assets/buttons/XxBeA.png"),
            sourceActive: require("../assets/buttons/XxBeAActive.png"),
            active: calcState === CalcState.XxBeA,
            onPress: () => onPressResolveEquation(CalcState.XxBeA),
          };
        case ButtonType.GaussianElimination:
          return {
            source: require("../assets/buttons/GaussianElimination.png"),
            onPress: onPressGaussianElimination,
          };
        case ButtonType.LambdaxA:
          return {
            source: require("../assets/buttons/LambdaxA.png"),
            sourceActive: require("../assets/buttons/LambdaxASelected.png"),
            active: calcState === CalcState.LambdaxA,
            onPress: onPressLambdaxA,
          };
        case ButtonType.AxB:
          return {
            source: require("../assets/buttons/AxB.png"),
            sourceActive: require("../assets/buttons/AxBSelected.png"),
            active: calcState === CalcState.AxB,
            onPress: onPressAxB,
          };
        case ButtonType.BxA:
          return {
            source: require("../assets/buttons/BxA.png"),
            sourceActive: require("../assets/buttons/BxASelected.png"),
            active: calcState === CalcState.BxA,
            onPress: onPressBxA,
          };
        case ButtonType.Inverse:
          return {
            source: require("../assets/buttons/Inverse.png"),
            onPress: onInvert,
            disabled: !isInverseEnabled,
          };
        case ButtonType.Transposed:
          return {
            source: require("../assets/buttons/Transposed.png"),
            onPress: onTranspose,
            disabled:
              [
                CalcState.addMatrix,
                CalcState.subtractMatrix,
                CalcState.AxB,
                CalcState.BxA,
              ].includes(calcState) && !isMatrixSquare,
          };
        case ButtonType.SubtractMatrix:
          return {
            source: require("../assets/buttons/SubtractMatrix.png"),
            sourceActive: require("../assets/buttons/SubtractMatrixSelected.png"),
            active: calcState === CalcState.subtractMatrix,
            onPress: onPressSubtractMatrix,
          };
        case ButtonType.AddMatrix:
          return {
            source: require("../assets/buttons/AddMatrix.png"),
            sourceActive: require("../assets/buttons/AddMatrixSelected.png"),
            active: calcState === CalcState.addMatrix,
            onPress: onPressAddMatrix,
          };
        case ButtonType.Subtract:
          return {
            source: require("../assets/buttons/Subtract.png"),
            sourceActive: require("../assets/buttons/ActiveSubtract.png"),
            disabled: !isNumberKeyboardActive,
            active:
              selectedOperator === Operator.Subtract &&
              editableOperatorNumber === null,
            onPress: () => onPressOperator(Operator.Subtract),
          };
        case ButtonType.Add:
          return {
            source: require("../assets/buttons/Add.png"),
            sourceActive: require("../assets/buttons/ActiveAdd.png"),
            disabled: !isNumberKeyboardActive,
            active:
              selectedOperator === Operator.Add &&
              editableOperatorNumber === null,
            onPress: () => onPressOperator(Operator.Add),
          };
        case ButtonType.Multiply:
          return {
            source: require("../assets/buttons/Multiply.png"),
            sourceActive: require("../assets/buttons/ActiveMultiply.png"),
            disabled: !isNumberKeyboardActive,
            active:
              selectedOperator === Operator.Multiply &&
              editableOperatorNumber === null,
            onPress: () => onPressOperator(Operator.Multiply),
          };
        case ButtonType.Divide:
          return {
            source: require("../assets/buttons/Divide.png"),
            sourceActive: require("../assets/buttons/ActiveDivide.png"),
            disabled: !isNumberKeyboardActive,
            active:
              selectedOperator === Operator.Divide &&
              editableOperatorNumber === null,
            onPress: () => onPressOperator(Operator.Divide),
          };
        case ButtonType.Enter:
          return {
            source: require("../assets/buttons/Enter.png"),
            onPress: onEnter,
          };
        case ButtonType.Check:
          return {
            source: require("../assets/buttons/Check.png"),
            onPress: onCheck,
            disabled: calcState === CalcState.ready,
          };
        default:
          return {
            source: require("../assets/buttons/Comma.png"),
            onPress: () => onPressNumberButton(","),
          };
      }
    };

    const data: ButtonData = {
      sourceActive: require("../assets/buttons/Comma.png"),
      ...getData(),
    };

    return {
      ...data,
      disabled: data.disabled || fullKeyboardDisabled,
      correctSource: data.active || false ? data.sourceActive : data.source,
    };
  }, [useCalculatorData, buttonType]);

  return (
    <TouchableOpacity
      style={{
        flex: buttonData.flex || 1,
        opacity: buttonData.disabled ? 0.6 : 1,
      }}
      disabled={buttonData.disabled || false}
      onPress={buttonData.onPress}
      onLongPress={buttonData.onLongPress}
    >
      <Image
        style={{
          flex: 1,
          height: undefined,
          width: undefined,
        }}
        source={buttonData.correctSource}
        resizeMode="contain"
      />
    </TouchableOpacity>
  );
};

export default CalculatorButton;
