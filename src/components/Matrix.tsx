import React, {useState} from 'react';
import {View, FlatList, LayoutChangeEvent} from 'react-native';
import MatrixContainer from './MatrixContainer';
import MatrixColumn from './MatrixColumn';
import MatrixOperations from '../utilities/MatrixOperations';
import SelectedMatrixElement from '../interfaces/SelectedMatrixElement';
import {ElementData} from '../utilities/ExpressionClasses';
import MatrixData from '../utilities/MatrixData';

interface MatrixProps {
  matrixData: MatrixData;
  selectedMatrixElement?: SelectedMatrixElement | null;
  maxMatrixWidth: number;
  editableOperatorNumber?: ElementData | null;
  onLayout?(e: LayoutChangeEvent): void;
  changeSelectedMatrixElement?(position: SelectedMatrixElement): void;
}

const Matrix = ({
  matrixData,
  selectedMatrixElement = null,
  maxMatrixWidth,
  editableOperatorNumber = null,
  onLayout,
  changeSelectedMatrixElement,
}: MatrixProps) => {
  const [flatListDimensions, changeFlatListDimensions] = useState({
    height: 0,
    width: 0,
  });

  return (
    <MatrixContainer
      maxWidth={maxMatrixWidth}
      matrixContent={
        <View
          onLayout={event => {
            changeFlatListDimensions({
              ...flatListDimensions,
              width: event.nativeEvent.layout.width,
            });

            onLayout && onLayout(event);
          }}>
          <FlatList
            horizontal
            directionalLockEnabled={false}
            style={{
              transform: [{rotateY: '180deg'}],
            }}
            showsVerticalScrollIndicator={false}
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={{
              height: flatListDimensions.height,
            }}
            contentInset={{
              top: 1,
              bottom: 1,
              right: 1,
              left: 1,
            }}
            data={MatrixOperations.insertElementsPosition(matrixData)}
            keyExtractor={element => element.column.toString()}
            renderItem={({item}) => {
              return (
                <MatrixColumn
                  wholeMatrix={matrixData}
                  matrixColumn={item.data}
                  selectedMatrixElement={selectedMatrixElement}
                  minWidth={50}
                  flatListDimensions={flatListDimensions}
                  changeFlatListDimensions={changeFlatListDimensions}
                  editableOperatorNumber={editableOperatorNumber}
                  changeSelectedMatrixElement={changeSelectedMatrixElement}
                />
              );
            }}
          />
        </View>
      }
    />
  );
};

export default Matrix;
