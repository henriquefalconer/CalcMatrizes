import React, { useState } from 'react';
import { SafeAreaView, StatusBar } from 'react-native';
import ButtonsArea from './components/ButtonsArea';
import InfoArea from './components/InfoArea';
import { MatrixState, count, SystemSolutionType, Operator } from './utilities/constants';
import MatrixOperations from './utilities/MatrixOperations';
import ScalarOperations from './utilities/ScalarOperations';
import { simplifyExpression, varOperation } from './utilities/ExpressionSimplification';
import { ElementData, VariableData, ExpressionData } from './utilities/ExpressionClasses';

const INITIAL_MATRIX = MatrixOperations.emptyMatrix({
    rows: 3,
    columns: 1,
});

export default function CalculatorScreen({ isPortrait }) {
    let [readyMatrix, changeReadyMatrix] = useState(INITIAL_MATRIX);
    let [editableMatrix, changeEditableMatrix] = useState(INITIAL_MATRIX);
    let [editableScalar, changeEditableScalar] = useState(null);
    let [selectedMatrixElement, changeSelectedMatrixElement] = useState({
        row: 0,
        column: 0,
    });
    let [shouldUserInputOverwriteElement, changeShouldUserInputOverwriteElement] = useState(true);
    let [editableDimensions, changeEditableDimensions] = useState(INITIAL_MATRIX.dimensions());
    let [matrixState, changeMatrixState] = useState(MatrixState.editing);
    let [secondSetOfKeysActive, changeSecondSetOfKeysActive] = useState(false);
    let [isRActive, changeIsRActive] = useState(false);
    let [solutionType, changeSolutionType] = useState(null);
    let [fullEquation, changeFullEquation] = useState(null);
    let [viewReduced, changeViewReduced] = useState(false);
    let [selectedOperator, changeSelectedOperator] = useState(null);
    let [operationHappening, changeOperationHappening] = useState(false);
    let [editableOperatorNumber, changeEditableOperatorNumber] = useState(null);
    let [columnDirectionActive, changeColumnDirectionActive] = useState(true);
    let [isVariableKeyboardActive, changeIsVariableKeyboardActive] = useState(false);

    function printState() {
        console.log({
            readyMatrix,
            editableMatrix,
            editableScalar,
            selectedMatrixElement,
            shouldUserInputOverwriteElement,
            editableDimensions,
            matrixState,
            secondSetOfKeysActive,
            columnDirectionActive,
            numberWritten: getNumberWritten(),
            selectedOperator,
            operationHappening,
            editableOperatorNumber,
        })
    }

    function changeSettingsOfSelectedMatrixElement(selectedElement) {
        changeSelectedMatrixElement(selectedElement);
        changeShouldUserInputOverwriteElement(true);
    }

    const matrixOnScreen = matrixState === MatrixState.ready 
        ? readyMatrix
        : editableMatrix;

    function enterEditingMode({ editableMatrix, matrixState, selectedElement, scalar }) {
        changeMatrixState(matrixState);
        changeFullEquation(null);
        changeSolutionType(null);

        /*
        changeSecondSetOfKeysActive(false);
        changeIsRActive(false);
        */
       
        changeEditableMatrix(editableMatrix);
        changeEditableDimensions(
            editableMatrix 
                ? editableMatrix.dimensions()
                : null
        );
        changeEditableScalar(scalar);
        selectedElement !== undefined && changeSettingsOfSelectedMatrixElement(selectedElement);
    }

    function exitEditingMode() {
        changeMatrixState(MatrixState.ready);
    }

    function changeNumberWritten({ newNumber, forceNotOperatorNumber=false }) {

        if (operationHappening && !forceNotOperatorNumber) {
            changeEditableOperatorNumber(newNumber);
        }

        else if (matrixState === MatrixState.LambdaxA) {
            changeEditableScalar(newNumber);
        }

        else {
            changeEditableMatrix(
                MatrixOperations.changeElement({
                    matrix: editableMatrix || readyMatrix,
                    ...selectedMatrixElement,
                    numberWritten: newNumber,
                })
            )
        } 
    }

    function getNumberWritten({ forceNotOperatorNumber=false, doNotStringify=false }={}) {
        if (operationHappening && !forceNotOperatorNumber) 
            return editableOperatorNumber === null && !doNotStringify
                ? ''
                : editableOperatorNumber;

        const { row, column } = selectedMatrixElement || {};
        const matrixNumber = matrixState === MatrixState.LambdaxA
            ? editableScalar
            : editableMatrix 
                && editableMatrix.data 
                && editableMatrix.data[row] 
                && editableMatrix.data[row][column];

        if (
            (
                shouldUserInputOverwriteElement 
                || (
                    matrixNumber instanceof ElementData
                    && matrixNumber.scalar === 0
                )
            ) && !forceNotOperatorNumber
        ) 
            return doNotStringify
                ? null
                : '';
            
        return doNotStringify
            ? matrixNumber
            : matrixNumber.commaStringify({ dontFindFraction: true });
    }

    function nextElement() {
        const { row, column } = selectedMatrixElement;
        const maxRows = editableMatrix.dimensions().rows;
        const maxColumns = editableMatrix.dimensions().columns;
        
        let selectedElement = {row: null, column: null};

        if (
            !(row == maxRows - 1
            && column == maxColumns - 1)
            && selectedElement
        ) {
            if (columnDirectionActive) {
                if (row < maxRows - 1) {
                    selectedElement.column = column;
                    selectedElement.row = row + 1;
                } else {
                    selectedElement.column = column + 1;
                    selectedElement.row = 0;
                }
            } else {
                if (column < maxColumns - 1) {
                    selectedElement.column = column + 1;
                    selectedElement.row = row;
                } else {
                    selectedElement.column = 0;
                    selectedElement.row = row + 1;
                }
            }
        } else selectedElement = null;

        changeSettingsOfSelectedMatrixElement(selectedElement);
    }

    function isEditableScalarReady() {
        return editableScalar !== null && !editableScalar.stringify().toString().endsWith('.');
    }

    function resetScalarOperations() {
        changeEditableOperatorNumber(null);
        changeOperationHappening(false);
        changeSelectedOperator(null);
    }

    function applyOperation() {
        resetScalarOperations();

        if (editableOperatorNumber !== null) 
            changeNumberWritten({
                newNumber: varOperation(
                    getNumberWritten({ forceNotOperatorNumber: true, doNotStringify: true }),
                    selectedOperator,
                    editableOperatorNumber
                ),
                forceNotOperatorNumber: true,
            });
    }

    function isAFirst() {
        return ![
            MatrixState.BxA,
            MatrixState.BxXeA,
            MatrixState.XxBeA,
        ].includes(matrixState);
    }

    function solveOperationsFullEquationSetup() {
        let {
            partiallyEliminatedOriginal,
            solution,
            systemSolutionsType,
        } = MatrixOperations.findSolutionForMatrixEquation({
            matrixA: isAFirst() ? readyMatrix : editableMatrix,
            matrixB: isAFirst() ? editableMatrix : readyMatrix,
            verticalElimination: [
                    MatrixState.XxAeB,
                    MatrixState.XxBeA,
                ].includes(matrixState),
            showSteps: false,
        });
        changeViewReduced(false);
        changeFullEquation({
            equationType: matrixState,
            solutionType: systemSolutionsType,
            matrixA: readyMatrix,
            matrixB: editableMatrix,
            matrixC: solution,
            matrixD: partiallyEliminatedOriginal,
        });
        changeSolutionType(systemSolutionsType);
        systemSolutionsType == SystemSolutionType.SPD && changeReadyMatrix(solution);
    }

    function singleInputFullEquationSetup(matrixOperation) {
        const oldMatrix = matrixState === MatrixState.ready 
            ? readyMatrix 
            : editableMatrix;

        const newMatrix = matrixOperation === MatrixState.transpose 
            ? MatrixOperations.transpose(oldMatrix)
            : MatrixOperations.invert(oldMatrix);
        
        changeFullEquation({
            equationType: matrixOperation,
            matrixA: oldMatrix,
            matrixB: newMatrix,
        });
    }

    function scalarFullEquationSetup({ newMatrix, scalar }) {
        changeReadyMatrix(newMatrix);
        changeFullEquation({
            equationType: matrixState,
            matrixB: readyMatrix,
            matrixC: newMatrix,
            scalar,
        });
    }

    function generalFullEquationSetup({ newMatrix }) {
        changeReadyMatrix(newMatrix);
        changeFullEquation({
            equationType: matrixState,
            matrixA: isAFirst() ? readyMatrix : editableMatrix,
            matrixB: isAFirst() ? editableMatrix : readyMatrix,
            matrixC: newMatrix,
        });
    }
    
    return (
        <SafeAreaView
            style={{
                flex: 1,
                backgroundColor: '#000',
                justifyContent: 'flex-end',
            }}
        >
            <StatusBar barStyle='light-content' />
            <InfoArea 
                matrixState={matrixState}
                readyMatrix={readyMatrix}
                changeReadyMatrix={changeReadyMatrix}
                onPressBackground={
                    () => {
                        
                        operationHappening && applyOperation();

                        if (matrixState !== MatrixState.LambdaxA) {
                            changeFullEquation(null);
                            exitEditingMode();
                            matrixState === MatrixState.editing 
                                && changeReadyMatrix(editableMatrix);
                            changeSettingsOfSelectedMatrixElement(null);
                        }
                    }
                }
                editableMatrix={editableMatrix}
                changeEditableMatrix={changeEditableMatrix}
                selectedMatrixElement={selectedMatrixElement}
                changeSelectedMatrixElement={
                    (selection) => {

                        operationHappening && applyOperation();

                        changeSettingsOfSelectedMatrixElement(
                            selection === null 
                                ? null 
                                : { 
                                    row: selection.row, 
                                    column: selection.column,
                                }
                        );

                        if (matrixState === MatrixState.ready) {
                            enterEditingMode({
                                matrixState: MatrixState.editing,
                                editableMatrix: readyMatrix,
                            });
                        }
                    }
                }
                editableDimensions={editableDimensions}
                changeEditableDimensions={changeEditableDimensions}
                editableScalar={editableScalar}
                operationHappening={operationHappening}
                editableOperatorNumber={editableOperatorNumber}
                solutionType={solutionType}
                fullEquation={fullEquation}
                viewReduced={viewReduced}
                changeViewReduced={changeViewReduced}
                isPortrait={isPortrait}
            />
            <ButtonsArea
                hidden={!isPortrait}
                matrixState={matrixState}
                matrixOnScreen={matrixOnScreen}
                readyMatrix={readyMatrix}
                changeReadyMatrix={changeReadyMatrix}
                numberWritten={getNumberWritten({ doNotStringify: true })}
                secondSetOfKeysActive={secondSetOfKeysActive}
                changeSecondSetOfKeysActive={
                    () => changeSecondSetOfKeysActive(!secondSetOfKeysActive)
                }
                columnDirectionActive={columnDirectionActive}
                changeColumnDirectionActive={
                    () => changeColumnDirectionActive(!columnDirectionActive)
                }
                selectedMatrixElement={selectedMatrixElement}
                isMatrixFull={MatrixOperations.isMatrixFull(matrixOnScreen)}
                isMatrixSquare={MatrixOperations.isMatrixSquare(matrixOnScreen)}
                isKeyboardBeActive={selectedMatrixElement || matrixState === MatrixState.LambdaxA}
                isCheckActive={
                    matrixState !== MatrixState.LambdaxA
                        ? MatrixOperations.isMatrixFull(matrixOnScreen)
                        : isEditableScalarReady()
                }
                isInverseEnabled={
                    MatrixOperations.isMatrixFull(matrixOnScreen)
                    && MatrixOperations.isMatrixSquare(matrixOnScreen)
                    && MatrixOperations.determinant(matrixOnScreen) !== 0.0
                }
                isVariableKeyboardActive={isVariableKeyboardActive}
                changeIsVariableKeyboardActive={changeIsVariableKeyboardActive}
                isRActive={isRActive}
                operatorsActive={
                    matrixState === MatrixState.editing
                    || matrixState === MatrixState.LambdaxA
                }
                selectedOperator={selectedOperator}
                editableOperatorNumber={editableOperatorNumber}
                onPressAC={
                    () => {
                        resetScalarOperations();

                        if (matrixState !== MatrixState.LambdaxA) {
                            const changeMatrixOnScreen = matrixState === MatrixState.ready 
                                ? changeReadyMatrix
                                : changeEditableMatrix;
    
                            changeMatrixOnScreen(
                                MatrixOperations.emptyMatrix(matrixOnScreen.dimensions())
                            );
    
                            if (MatrixOperations.isMatrixEmpty(matrixOnScreen)) {
                                exitEditingMode();
                                changeSettingsOfSelectedMatrixElement(0);
                            }
                        } else {
                            exitEditingMode();
                        }
                    }
                }
                onPressCE={
                    () => {
                        changeNumberWritten({
                            newNumber: new ElementData({
                                scalar: 0
                            })
                        })
                    }
                }
                numberButtonPressed={
                    (element) => {

                        const originalValue = getNumberWritten({ doNotStringify: true });

                        const letters = /^[a-i]+$/;

                        if (element.toString().match(letters))
                            changeNumberWritten({ 
                                newNumber: new ElementData({
                                    scalar: originalValue !== null
                                        ? originalValue.scalar
                                        : 1,
                                    variables: [
                                        new VariableData({
                                            variable: element
                                        }),
                                        ...((originalValue !== null && originalValue.variables) || [])
                                    ]
                                })
                            });

                        else if (getNumberWritten().length === 0 && element === '.')
                            changeNumberWritten({
                                newNumber: new ElementData({
                                    scalar: '0.'
                                })
                            });
                        
                        else if (count(getNumberWritten(), /\./, true) === 0 || element !== '.')
                            changeNumberWritten({
                                newNumber: new ElementData({
                                    scalar: originalValue === null
                                        ? element
                                        : originalValue.scalar.toString() + element,
                                    variables: (originalValue !== null && originalValue.variables) || []
                                })
                            });
                        
                        changeShouldUserInputOverwriteElement(false);
                    }
                }
                onPressOperator={(operator) => {
                    operationHappening && applyOperation();
                    changeOperationHappening(true);
                    changeEditableOperatorNumber(null);
                    changeSelectedOperator(operator);
                }}
                onPressAxB={() => {
                    matrixState !== MatrixState.ready && changeReadyMatrix(editableMatrix);
                    enterEditingMode({
                        matrixState: MatrixState.AxB,
                        editableMatrix: MatrixOperations.emptyMatrix(
                            MatrixOperations.getTransposedDimensions(matrixOnScreen)
                        ),
                        selectedElement: {
                            row: 0,
                            column: 0,
                        },
                    });
                }}
                onPressBxA={() => {
                    matrixState !== MatrixState.ready && changeReadyMatrix(editableMatrix);
                    enterEditingMode({
                        matrixState: MatrixState.BxA,
                        editableMatrix: MatrixOperations.emptyMatrix(
                            MatrixOperations.getTransposedDimensions(matrixOnScreen)
                        ),
                        selectedElement: {
                            row: 0,
                            column: 0,
                        },
                    });
                }}
                onPressLambdaxA={() => {
                    matrixState !== MatrixState.ready && changeReadyMatrix(editableMatrix);
                    
                    enterEditingMode({
                        matrixState: MatrixState.LambdaxA,
                        editableMatrix: null,
                        selectedElement: null,
                        scalar: new ElementData({
                            scalar: 0
                        }),
                    });

                }}
                onPressAddMatrix={() => {
                    matrixState !== MatrixState.ready && changeReadyMatrix(editableMatrix);
                    enterEditingMode({
                        matrixState: MatrixState.addMatrix,
                        editableMatrix: MatrixOperations.emptyMatrix(matrixOnScreen.dimensions()),
                        selectedElement: {
                            row: 0,
                            column: 0,
                        },
                    });
                }}
                onPressSubtractMatrix={() => {
                    matrixState !== MatrixState.ready && changeReadyMatrix(editableMatrix);
                    enterEditingMode({
                        matrixState: MatrixState.subtractMatrix,
                        editableMatrix: MatrixOperations.emptyMatrix(matrixOnScreen.dimensions()),
                        selectedElement: {
                            row: 0,
                            column: 0,
                        },
                    });
                }}
                onPressR={() => changeIsRActive(!isRActive)}
                onPressResolveEquation={(newState) => {
                    changeIsRActive(false);
                    matrixState !== MatrixState.ready && changeReadyMatrix(editableMatrix);
                    enterEditingMode({
                        matrixState: newState,
                        editableMatrix: MatrixOperations.emptyMatrix(matrixOnScreen.dimensions()),
                        selectedElement: {
                            row: 0,
                            column: 0,
                        },
                    });
                }}
                onTranspose={() => {
                    
                    if (matrixState === MatrixState.ready) {
                        changeReadyMatrix(
                            MatrixOperations.transpose(readyMatrix)
                        );
                    }

                    else {
                        changeEditableMatrix(
                            MatrixOperations.transpose(editableMatrix)
                        );
                        changeSettingsOfSelectedMatrixElement({
                            row: selectedMatrixElement.column,
                            column: selectedMatrixElement.row,
                        });
                        changeEditableDimensions({
                            rows: editableDimensions.columns,
                            columns: editableDimensions.rows,
                        });
                    }

                    singleInputFullEquationSetup(MatrixState.transpose);
                    
                }}
                onInvert={() => {

                    try {
                    
                        if (matrixState === MatrixState.ready) {
                            changeReadyMatrix(
                                MatrixOperations.invert(readyMatrix)
                            );
                        }
    
                        else {
                            changeReadyMatrix(
                                MatrixOperations.invert(editableMatrix)
                            );
                            changeSettingsOfSelectedMatrixElement(null);
                            exitEditingMode();
                        }
    
                        singleInputFullEquationSetup(MatrixState.invert);
                    
                    } catch (e) {
                        console.log(e);
                    }
                    
                }}
                onEnter={() => {
                    operationHappening && applyOperation();
                    selectedMatrixElement && nextElement();
                }}
                onCheck={() => {
                    switch (matrixState) {
                        case MatrixState.editing:
                            changeReadyMatrix(editableMatrix);
                            break;
                        case MatrixState.addMatrix:
                            generalFullEquationSetup({
                                newMatrix: MatrixOperations.sum(readyMatrix, editableMatrix)
                            });
                            break;
                        case MatrixState.subtractMatrix:
                            generalFullEquationSetup({
                                newMatrix: MatrixOperations.subtract(readyMatrix, editableMatrix)
                            });
                            break;
                        case MatrixState.AxB:
                            generalFullEquationSetup({
                                newMatrix: MatrixOperations.multiplyMatrix(readyMatrix, editableMatrix)
                            });
                            break;
                        case MatrixState.BxA:
                            generalFullEquationSetup({
                                newMatrix: MatrixOperations.multiplyMatrix(editableMatrix, readyMatrix),
                            });
                            break;
                        case MatrixState.LambdaxA:
                            scalarFullEquationSetup({
                                newMatrix: MatrixOperations.multiplyMatrixByScalar({
                                    matrixA: readyMatrix,
                                    scalar: editableScalar,
                                }),
                                scalar: editableScalar,
                            });
                            break;
                        case MatrixState.AxXeB:
                            solveOperationsFullEquationSetup();
                            break;
                        case MatrixState.BxXeA:
                            solveOperationsFullEquationSetup();
                            break;
                        case MatrixState.XxAeB:
                            solveOperationsFullEquationSetup();
                            break;
                        case MatrixState.XxBeA:
                            solveOperationsFullEquationSetup();
                            break;
                        default:
                            break;
                    }
                    exitEditingMode();
                }}
            />
        </SafeAreaView>
    );
}