import React, { useMemo, useState } from 'react';
import { View, Text, ScrollView, FlatList } from 'react-native';
import Matrix from './Matrix';
import EquationData from '../utils/EquationData';
import { CalcState } from '../utils/constants';
import FullEquationData from '../interfaces/FullEquationData';

const OPERATORS_WIDTH = 50;
const X_OPERATOR_WIDTH = 50;

interface FullEquationProps {
  fullEquation: FullEquationData;
  totalMaxAreaWidth: number;
  viewReduced: boolean;
}

interface ScalarProps {
  scalar: number | string;
}

interface XOperatorProps {
  variableDimensions: string;
}

const Scalar = ({ scalar }: ScalarProps) => {
  return (
    <Text
      style={{
        color: '#fff',
        textAlign: 'center',
        fontSize: 30,
        top: 2,
      }}
    >
      {scalar}
    </Text>
  );
};

const XOperator = ({ variableDimensions }: XOperatorProps) => {
  return (
    <Text
      style={{
        color: '#fff',
        textAlign: 'center',
        fontSize: 30,
        top: 2,
        width: X_OPERATOR_WIDTH,
      }}
    >
      <Text
        style={{
          color: '#fff',
          fontSize: 30,
        }}
      >
        X
      </Text>
      <Text
        style={{
          color: '#fff',
          fontSize: 14,
          top: 50,
        }}
      >
        {variableDimensions}
      </Text>
    </Text>
  );
};

const FullEquation = ({
  fullEquation,
  totalMaxAreaWidth,
  viewReduced,
}: FullEquationProps) => {
  const [matrix1Height, changeMatrix1Height] = useState(0);

  const equationData = useMemo<EquationData>(
    () =>
      new EquationData({
        fullEquation,
        viewReduced,
      }),
    [fullEquation, viewReduced]
  );

  const singleMatrixMaxWidth = useMemo(
    () =>
      (totalMaxAreaWidth -
        equationData.getQuantityOfOperators() * OPERATORS_WIDTH -
        (equationData.hasXOperator() ? X_OPERATOR_WIDTH : 0)) /
      equationData.getQuantityOfMatrices(),
    [totalMaxAreaWidth, equationData]
  );

  return (
    <ScrollView
      contentContainerStyle={{
        flexGrow: 1,
        alignItems: 'center',
        justifyContent: 'center',
      }}
      style={{
        paddingBottom: 3,
        paddingTop: 15,
      }}
      horizontal
      showsHorizontalScrollIndicator={false}
      overScrollMode="never"
    >
      {equationData.matrix1 ? (
        <Matrix
          matrixData={equationData.matrix1}
          onLayout={(event) => {
            changeMatrix1Height(event.nativeEvent.layout.height);
          }}
        />
      ) : equationData.scalar !== undefined ? (
        <Scalar scalar={equationData.scalar} />
      ) : (
        equationData.variablePosition === 1 && (
          <XOperator
            variableDimensions={equationData.getVariableDimensions()}
          />
        )
      )}
      {equationData.singleMatrixOperator && (
        <Text
          style={{
            color: '#fff',
            textAlign: 'center',
            fontSize: 30,
            justifyContent: 'flex-start',
            width: OPERATORS_WIDTH,
            top: -matrix1Height / 2,
          }}
        >
          {equationData.singleMatrixOperator}
        </Text>
      )}
      {equationData.firstOperator && (
        <Text
          style={{
            color: '#fff',
            textAlign: 'center',
            fontSize: 35,
            width:
              fullEquation.equationType === CalcState.gaussianElimination
                ? 60
                : OPERATORS_WIDTH,
          }}
        >
          {equationData.firstOperator}
        </Text>
      )}
      {equationData.matrix2 ? (
        <Matrix matrixData={equationData.matrix2} />
      ) : (
        equationData.variablePosition === 2 && (
          <XOperator
            variableDimensions={equationData.getVariableDimensions()}
          />
        )
      )}
      {equationData.secondOperator && (
        <Text
          style={{
            color: '#fff',
            textAlign: 'center',
            fontSize: 35,
            width: OPERATORS_WIDTH,
          }}
        >
          {equationData.secondOperator}
        </Text>
      )}
      {equationData.matrix3 ? (
        <Matrix matrixData={equationData.matrix3} />
      ) : (
        equationData.variablePosition === 3 && (
          <XOperator
            variableDimensions={equationData.getVariableDimensions()}
          />
        )
      )}
    </ScrollView>
  );
};

export default FullEquation;
