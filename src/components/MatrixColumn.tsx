import React, { useCallback } from "react";
import { View, Text, TouchableOpacity, FlatList } from "react-native";
import * as math from "mathjs";

import { useCalculator } from "../hooks/useCalculator";

import MatrixData from "../utils/MatrixData";
import { stringify } from "../utils/math";

import ElementDataWithPosition from "../interfaces/ElementDataWithPosition";
import SelectedMatrixElement from "../interfaces/SelectedMatrixElement";

const ELEMENT_HEIGHT = 40;
const ELEMENT_VERTICAL_MARGIN = 11;

interface FlatListDimensions {
  height: number;
  width: number;
}

interface MatrixColumnProps {
  wholeMatrix: MatrixData;
  matrixColumn: Array<ElementDataWithPosition>;
  selectedMatrixElement: SelectedMatrixElement | null;
  minWidth: number;
  flatListDimensions: FlatListDimensions;
  changeFlatListDimensions(dimensions: FlatListDimensions): void;
  editableOperatorNumber: math.MathNode | null;
  changeSelectedMatrixElement?(position: SelectedMatrixElement): void;
}

const MatrixColumn = ({
  wholeMatrix,
  matrixColumn,
  selectedMatrixElement,
  minWidth,
  flatListDimensions,
  changeFlatListDimensions,
  editableOperatorNumber,
  changeSelectedMatrixElement = () => {},
}: MatrixColumnProps) => {
  const { invertedWithDenominator } = useCalculator();

  const isElementSelected = useCallback(
    ({ row, column }) =>
      selectedMatrixElement &&
      selectedMatrixElement.row === row &&
      selectedMatrixElement.column === column,
    [selectedMatrixElement]
  );

  const getElementStyle = useCallback(
    (row, column) => {
      return {
        backgroundColor: isElementSelected({ row, column })
          ? "#404040"
          : wholeMatrix.data[row][column] === null
          ? "#1c1c1c"
          : "transparent",
        ...(wholeMatrix.data[row][column] === null &&
          {
            //borderColor: '#fff',
            //borderWidth: 1.5,
            //borderStyle: 'dashed',
          }),
      };
    },
    [wholeMatrix, isElementSelected]
  );

  const formatElement = useCallback(
    ({ number, row, column }: ElementDataWithPosition) => {
      return stringify(
        isElementSelected({ row, column }) && editableOperatorNumber
          ? editableOperatorNumber
          : number
      );
    },
    [editableOperatorNumber, isElementSelected]
  );

  return (
    <FlatList
      style={{
        transform: [{ rotateX: "180deg" }],
      }}
      scrollEnabled={false}
      key={JSON.stringify(wholeMatrix.dimensions())}
      onLayout={() => {
        changeFlatListDimensions({
          ...flatListDimensions,
          height:
            (ELEMENT_HEIGHT + 2 * ELEMENT_VERTICAL_MARGIN) *
            wholeMatrix.dimensions().rows,
        });
      }}
      keyExtractor={(element) => `${element.row}:${element.column}`}
      data={matrixColumn}
      renderItem={({ item }) => {
        const { number, row, column } = item;

        return (
          <TouchableOpacity
            style={{
              alignSelf: "stretch",
              transform: [{ rotateY: "180deg" }, { rotateX: "180deg" }],
            }}
            onPress={() => {
              changeSelectedMatrixElement({
                row,
                column,
              });
            }}
          >
            <View
              style={{
                ...getElementStyle(row, column),
                marginVertical: ELEMENT_VERTICAL_MARGIN,
                paddingVertical: 5,
                paddingHorizontal: 10,
                borderRadius: 10,
                alignItems: "center",
                justifyContent: "center",
                height: ELEMENT_HEIGHT,
                minWidth: minWidth,
                marginHorizontal: 5,
              }}
            >
              <Text
                style={{
                  color: "#fff",
                  fontSize: 26,
                  textAlign: "center",
                }}
              >
                {formatElement(item)}
              </Text>
            </View>
          </TouchableOpacity>
        );
      }}
    />
  );
};

export default MatrixColumn;
