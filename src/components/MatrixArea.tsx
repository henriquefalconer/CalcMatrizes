import React, { useCallback, useMemo, useState } from "react";
import { View, Text, ScrollView } from "react-native";
import Matrix from "./Matrix";
import { CalcState, SystemSolutionType } from "../utilities/constants";
import ArrowButtonsArea from "./ArrowButtonsArea";
import FullEquation from "./FullEquation";

import { useCalculator } from "../hooks/useCalculator";
import { useOrientation } from "../hooks/useOrientation";
import * as math from "mathjs";
import { stringify } from "../utilities/math";

const BUTTON_AREAS_CROSS_WIDTH = 70;

const MatrixArea: React.FC = () => {
  const { isPortrait, setLandscape, setPortrait } = useOrientation();

  const {
    calcState,
    matrixOnScreen,
    matrixOnScreenDeterminant,
    selectedMatrixElement,
    editableDimensions,
    editableDimensionsString,
    editableScalar,
    changeViewReduced,
    onPressGaussianEliminationReduced,
    changeSelectedMatrixElement,
    changeFullScreenDeterminant,
    operationHappening,
    editableOperatorNumber,
    changeEditableDimensions,
    fullEquation,
    getSolutionTypeString,
    viewReduced,
    fullScreenDeterminant,
  } = useCalculator();

  const [matrixAreaWidth, changeMatrixAreaWidth] = useState(0);

  const formatDeterminant = useCallback(
    (
      determinant: math.MathNode | null,
      overflow: boolean = true,
      det: boolean = true
    ) => {
      if (!determinant) return null;

      let stringDeterminant = stringify(determinant);

      if (stringDeterminant.length > 8 && overflow)
        stringDeterminant = stringDeterminant.substring(0, 8 - 3) + "...";

      return det ? `det: ${stringDeterminant}` : stringDeterminant;
    },
    []
  );

  const scalarText = useMemo(() => {
    const scalar =
      editableOperatorNumber === null ? editableScalar : editableOperatorNumber;

    if (scalar === null) {
      return null;
    }
    return stringify(scalar);
  }, [editableOperatorNumber, editableScalar]);

  const equationTypeString = useMemo(() => {
    switch (fullEquation?.equationType) {
      case CalcState.AxXeB:
        return "A×X=B";
      case CalcState.BxXeA:
        return "B×X=A";
      case CalcState.XxAeB:
        return "X×A=B";
      case CalcState.XxBeA:
        return "X×B=A";
      default:
        return "";
    }
  }, [fullEquation]);

  const bottomLeftText = useMemo(
    () =>
      calcState === CalcState.LambdaxA
        ? "Scalar"
        : fullEquation !== null && !isPortrait
        ? equationTypeString
        : !fullScreenDeterminant
        ? editableDimensionsString
        : "",
    [
      equationTypeString,
      calcState,
      fullEquation,
      editableDimensions,
      isPortrait,
      fullScreenDeterminant,
    ]
  );

  return (
    <View
      style={{
        flex: 1,
        marginTop: 20,
      }}
      onLayout={(event) => {
        changeMatrixAreaWidth(event.nativeEvent.layout.width);
      }}
    >
      <View
        style={{
          flexDirection: "row",
          justifyContent: "space-between",
          flex: 1,
        }}
      >
        {(!fullEquation || isPortrait) && (
          <ArrowButtonsArea
            vertical
            backHistory
            hidden
            editableDimensions={editableDimensions}
            changeEditableDimensions={changeEditableDimensions}
            crossWidth={BUTTON_AREAS_CROSS_WIDTH}
          />
        )}
        {calcState !== CalcState.LambdaxA ? (
          fullEquation !== null && !isPortrait ? (
            <FullEquation
              fullEquation={fullEquation}
              totalMaxAreaWidth={matrixAreaWidth - 2 * BUTTON_AREAS_CROSS_WIDTH}
              viewReduced={viewReduced}
            />
          ) : fullScreenDeterminant ? (
            <ScrollView
              contentContainerStyle={{
                flexGrow: 1,
                justifyContent: "center",
              }}
              showsVerticalScrollIndicator={false}
            >
              <Text
                style={{
                  color: "#fff",
                  fontSize: 60,
                  textAlign: "center",
                }}
              >
                {formatDeterminant(matrixOnScreenDeterminant, false, false)}
              </Text>
            </ScrollView>
          ) : (
            <Matrix
              maxMatrixWidth={matrixAreaWidth - 2 * BUTTON_AREAS_CROSS_WIDTH}
              matrixData={matrixOnScreen}
              selectedMatrixElement={selectedMatrixElement}
              editableOperatorNumber={editableOperatorNumber}
              changeSelectedMatrixElement={changeSelectedMatrixElement}
            />
          )
        ) : (
          <View
            style={{
              justifyContent: "center",
              alignItems: "center",
              flex: 1,
            }}
          >
            <Text
              style={{
                color: "#fff",
                fontSize: 60,
                textAlign: "right",
              }}
            >
              {scalarText}
            </Text>
          </View>
        )}
        {(!fullEquation || isPortrait) && (
          <ArrowButtonsArea
            vertical
            forwardHistory
            hidden={
              calcState === CalcState.ready ||
              calcState === CalcState.LambdaxA ||
              !editableDimensions
            }
            disabled={
              [
                CalcState.addMatrix,
                CalcState.subtractMatrix,
                CalcState.BxA,
                CalcState.XxAeB,
                CalcState.XxBeA,
              ].includes(calcState) || fullScreenDeterminant
            }
            bottomLeftText={bottomLeftText}
            editableDimensions={editableDimensions}
            changeEditableDimensions={changeEditableDimensions}
            crossWidth={BUTTON_AREAS_CROSS_WIDTH}
          />
        )}
      </View>
      <ArrowButtonsArea
        hidden={
          calcState === CalcState.ready ||
          calcState === CalcState.LambdaxA ||
          !editableDimensions
        }
        disabled={
          [
            CalcState.addMatrix,
            CalcState.subtractMatrix,
            CalcState.AxB,
            CalcState.AxXeB,
            CalcState.BxXeA,
          ].includes(calcState) || fullScreenDeterminant
        }
        editableDimensions={editableDimensions}
        changeEditableDimensions={changeEditableDimensions}
        bottomLeftText={bottomLeftText}
        bottomRightText={
          fullEquation?.solutionType === SystemSolutionType.SPD
            ? null
            : fullEquation !== null && !isPortrait
            ? [
                CalcState.AxXeB,
                CalcState.BxXeA,
                CalcState.XxAeB,
                CalcState.XxBeA,
              ].includes(fullEquation.equationType)
              ? viewReduced
                ? "Original"
                : "Reduzida"
              : fullEquation.equationType === CalcState.gaussianElimination
              ? viewReduced
                ? "Não Reduzida"
                : "Reduzida"
              : null
            : !operationHappening &&
              calcState !== CalcState.LambdaxA &&
              formatDeterminant(matrixOnScreenDeterminant)
        }
        bottomMiddleText={
          fullEquation?.equationType === CalcState.gaussianElimination &&
          calcState !== CalcState.editing &&
          isPortrait
            ? viewReduced
              ? "Não Reduzida"
              : "Reduzida"
            : calcState === CalcState.ready
            ? getSolutionTypeString(!isPortrait)
            : ""
        }
        onPressBottomMiddleText={() =>
          (isPortrait &&
            (fullEquation?.equationType === CalcState.gaussianElimination
              ? onPressGaussianEliminationReduced()
              : setLandscape())) ||
          (!isPortrait && setPortrait())
        }
        onPressBottomRightText={
          !isPortrait
            ? fullEquation !== null
              ? fullEquation.equationType === CalcState.gaussianElimination
                ? onPressGaussianEliminationReduced
                : changeViewReduced
              : () => {}
            : !operationHappening
            ? changeFullScreenDeterminant
            : () => {}
        }
        crossWidth={BUTTON_AREAS_CROSS_WIDTH}
      />
    </View>
  );
};

export default MatrixArea;
