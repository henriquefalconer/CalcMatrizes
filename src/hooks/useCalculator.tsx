import React, {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
} from 'react';
import {
  CalcState,
  count,
  SystemSolutionType,
  Operator,
} from '../utilities/constants';
import MatrixOperations from '../utilities/MatrixOperations';
import {varOperation} from '../utilities/ExpressionSimplification';
import {
  createMatrixElement,
  ExpressionData,
  VariableData,
} from '../utilities/ExpressionClasses';
import MatrixData from '../utilities/MatrixData';
import SelectedMatrixElement from '../interfaces/SelectedMatrixElement';
import MatrixDimensions from '../interfaces/MatrixDimensions';
import FullEquationData from '../interfaces/FullEquationData';
import ScalarOperations from '../utilities/ScalarOperations';

interface MatrixHistory {
  history: Array<MatrixData>;
  currentPosition: number;
}

interface ChangeNumberWrittenParams {
  newNumber: ExpressionData;
  forceNotOperatorNumber?: boolean;
}

interface EnterEditingModeParams {
  newCalcState: CalcState;
  newEditableMatrix?: MatrixData;
  newSelectedElement?: SelectedMatrixElement;
  newScalar?: ExpressionData;
}

interface CalculatorContextData {
  // ---- useStates: ----
  // Estado geral da calculadora:
  calcState: CalcState;
  // Estados de matrizes:
  readyMatrix: MatrixData;
  editableMatrix: MatrixData;
  matrixHistory: MatrixHistory;
  selectedMatrixElement: SelectedMatrixElement | null;
  shouldUserInputOverwriteElement: boolean;
  // Estados de escalares:
  editableScalar: ExpressionData | null;
  fullScreenDeterminant: boolean;
  // Estados de operações:
  operationHappening: boolean;
  editableOperatorNumber: ExpressionData | null;
  fullEquation: FullEquationData | null;
  viewReduced: boolean;
  // Estados de botões
  secondSetOfKeysActive: boolean;
  isRActive: boolean;
  columnDirectionActive: boolean;
  isVariableKeyboardActive: boolean;
  selectedOperator: Operator | null;
  // ---- useMemos: ----
  editableDimensions: MatrixDimensions;
  editableDimensionsString: string;
  isNumberKeyboardActive: boolean;
  matrixOnScreen: MatrixData;
  isMatrixSquare: boolean;
  isMatrixFull: boolean;
  matrixOnScreenDeterminant: ExpressionData | null;
  isInverseEnabled: boolean;
  isCheckActive: boolean;
  shouldACAppear: boolean;
  // ---- useCallbacks: ----
  undoHistory(): void;
  redoHistory(): void;
  clearHistory(): void;
  getSolutionTypeString(withVariables: boolean): string;
  changeNumberWritten(params: ChangeNumberWrittenParams): void;
  changeEditableDimensions(params: MatrixDimensions): void;
  changeSelectedMatrixElement(selectedElement: SelectedMatrixElement): void;
  changeColumnDirectionActive(): void;
  changeSecondSetOfKeysActive(): void;
  changeViewReduced(): void;
  changeFullScreenDeterminant(): void;
  changeIsVariableKeyboardActive(): void;
  onPressInfoAreaBackground(): void;
  onPressNumberButton(element: number | string): void;
  onPressAC(): void;
  onLongPressAC(): void;
  onPressCE(): void;
  onPressAddMatrix(): void;
  onPressSubtractMatrix(): void;
  onPressAxB(): void;
  onPressBxA(): void;
  onPressLambdaxA(): void;
  onPressOperator(operator: Operator): void;
  onPressR(): void;
  onPressResolveEquation(newState: CalcState): void;
  onPressGaussianElimination(): void;
  onPressGaussianEliminationReduced(): void;
  onTranspose(): void;
  onInvert(): void;
  onEnter(): void;
  onCheck(): void;
}

class IntialMatrix extends MatrixData {
  constructor() {
    super(
      __DEV__
        ? [
            [1, 2, 3],
            [4, 5, 6],
            [7, 8, 9],
          ]
        : [[0], [0], [0]],
    );
  }
}

const CalculatorContext = createContext<CalculatorContextData>(
  {} as CalculatorContextData,
);

export const CalculatorProvider: React.FC = ({children}) => {
  // Estado geral da Calculadora:
  const [calcState, setCalcState] = useState(CalcState.editing);

  // Estados de matrizes:
  const [readyMatrix, _setReadyMatrix] = useState<MatrixData>(
    new IntialMatrix(),
  );

  const [editableMatrix, setEditableMatrix] = useState<MatrixData>(
    new IntialMatrix(),
  );

  const [matrixHistory, setMatrixHistory] = useState<MatrixHistory>({
    history: [new IntialMatrix()],
    currentPosition: 0,
  });

  const [
    selectedMatrixElement,
    setSelectedMatrixElement,
  ] = useState<SelectedMatrixElement | null>({
    row: 0,
    column: 0,
  });

  const [
    shouldUserInputOverwriteElement,
    setShouldUserInputOverwriteElement,
  ] = useState(true);

  // Estados de escalares:
  const [editableScalar, setEditableScalar] = useState<ExpressionData | null>(
    null,
  );

  const [fullScreenDeterminant, setFullScreenDeterminant] = useState(false);

  // Estados de operações:
  const [operationHappening, setOperationHappening] = useState(false);

  const [
    editableOperatorNumber,
    setEditableOperatorNumber,
  ] = useState<ExpressionData | null>(null);

  const [fullEquation, setFullEquation] = useState<FullEquationData | null>(
    null,
  );

  const [viewReduced, setViewReduced] = useState(false);

  // Estados de botões:
  const [secondSetOfKeysActive, setSecondSetOfKeysActive] = useState(false);
  const [isRActive, setIsRActive] = useState(false);
  const [columnDirectionActive, setColumnDirectionActive] = useState(true);

  const [isVariableKeyboardActive, setIsVariableKeyboardActive] = useState(
    false,
  );

  const [selectedOperator, setSelectedOperator] = useState<Operator | null>(
    null,
  );

  const setInitialState = useCallback(() => {
    setCalcState(CalcState.ready);

    _setReadyMatrix(new IntialMatrix());

    setEditableMatrix(new IntialMatrix());

    setMatrixHistory({
      history: [new IntialMatrix()],
      currentPosition: 0,
    });

    setSelectedMatrixElement(null);

    setShouldUserInputOverwriteElement(true);

    setEditableScalar(null);

    setFullScreenDeterminant(false);

    setOperationHappening(false);

    setEditableOperatorNumber(null);

    setFullEquation(null);

    setViewReduced(false);

    setSecondSetOfKeysActive(false);

    setIsRActive(false);

    setColumnDirectionActive(true);

    setIsVariableKeyboardActive(false);

    setSelectedOperator(null);
  }, [
    setCalcState,
    _setReadyMatrix,
    setEditableMatrix,
    setMatrixHistory,
    setSelectedMatrixElement,
    setShouldUserInputOverwriteElement,
    setEditableScalar,
    setFullScreenDeterminant,
    setOperationHappening,
    setEditableOperatorNumber,
    setFullEquation,
    setViewReduced,
    setSecondSetOfKeysActive,
    setIsRActive,
    setColumnDirectionActive,
    setIsVariableKeyboardActive,
    setSelectedOperator,
  ]);

  const setReadyMatrix = useCallback(
    (newMatrix: MatrixData) => {
      _setReadyMatrix(newMatrix);

      const {currentPosition} = matrixHistory;

      const newHistory = [...matrixHistory.history].slice(
        0,
        currentPosition + 1,
      );

      if (
        !MatrixOperations.compareMatrices(
          newMatrix,
          newHistory[newHistory.length - 1],
        )
      ) {
        setMatrixHistory({
          history: [...newHistory, MatrixOperations.copyMatrixData(newMatrix)],
          currentPosition: currentPosition + 1,
        });
      }
    },
    [matrixHistory, _setReadyMatrix, setMatrixHistory],
  );

  const getSolutionTypeString = useCallback(
    (withVariables: boolean) =>
      fullEquation?.solutionType
        ? fullEquation?.solutionType +
          (!fullEquation.lettersUsed || !withVariables
            ? ''
            : ` (${
                fullEquation.lettersUsed.length > 3
                  ? 'n' + ScalarOperations.subscript('i')
                  : fullEquation.lettersUsed.join(', ')
              } \u2208 R)`)
        : '',
    [fullEquation],
  );

  const isNumberKeyboardActive = useMemo(
    () => !!selectedMatrixElement || calcState === CalcState.LambdaxA,
    [calcState, selectedMatrixElement],
  );

  const matrixOnScreen = useMemo(
    () => (calcState === CalcState.ready ? readyMatrix : editableMatrix),
    [calcState, readyMatrix, editableMatrix],
  );

  const editableDimensions = useMemo(() => matrixOnScreen.dimensions(), [
    matrixOnScreen,
  ]);

  const editableDimensionsString = useMemo(
    () =>
      editableDimensions
        ? `${editableDimensions.rows}x${editableDimensions.columns}`
        : '',
    [editableDimensions],
  );

  const setMatrixOnScreen = useMemo(
    () => (newMatrix: MatrixData) =>
      calcState === CalcState.ready
        ? setReadyMatrix(newMatrix)
        : setEditableMatrix(newMatrix),
    [calcState, setReadyMatrix, setEditableMatrix],
  );

  const isMatrixSquare = useMemo(
    () => MatrixOperations.isMatrixSquare(matrixOnScreen),
    [matrixOnScreen],
  );

  const isMatrixFull = useMemo(
    () => MatrixOperations.isMatrixFull(matrixOnScreen),
    [matrixOnScreen],
  );

  const matrixOnScreenDeterminant = useMemo(() => {
    if (isMatrixFull && isMatrixSquare) {
      const {determinant, error} = MatrixOperations.determinant(matrixOnScreen);

      if (!error) {
        return determinant;
      }
    }

    return null;
  }, [selectedMatrixElement, isMatrixFull, isMatrixSquare, matrixOnScreen]);

  const isInverseEnabled = useMemo(() => {
    console.log({
      a: matrixOnScreenDeterminant?.isZero,
      b: matrixOnScreenDeterminant?.commaStringify(),
    });

    return (
      MatrixOperations.isMatrixFull(matrixOnScreen) &&
      MatrixOperations.isMatrixSquare(matrixOnScreen) &&
      !matrixOnScreenDeterminant?.isZero
    );
  }, [matrixOnScreen, matrixOnScreenDeterminant]);

  const isEditableScalarReady = useMemo(
    () => !editableScalar?.stringify().toString().endsWith('.'),
    [editableScalar],
  );

  const isCheckActive = useMemo(
    () =>
      calcState !== CalcState.LambdaxA
        ? MatrixOperations.isMatrixFull(matrixOnScreen)
        : isEditableScalarReady,
    [calcState, matrixOnScreen, isEditableScalarReady],
  );

  const isAFirst = useMemo(() => {
    return ![CalcState.BxA, CalcState.BxXeA, CalcState.XxBeA].includes(
      calcState,
    );
  }, [calcState]);

  const clearHistory = useCallback(
    () =>
      setMatrixHistory({
        history: [MatrixOperations.copyMatrixData(matrixOnScreen)],
        currentPosition: 0,
      }),
    [matrixOnScreen, _setReadyMatrix, setMatrixHistory],
  );

  const undoHistory = useCallback(() => {
    const {history, currentPosition} = matrixHistory;

    setFullEquation(null);

    setMatrixHistory({
      history,
      currentPosition: currentPosition - 1,
    });

    _setReadyMatrix(
      MatrixOperations.copyMatrixData(history[currentPosition - 1]),
    );
  }, [matrixHistory, _setReadyMatrix, setFullEquation, setMatrixHistory]);

  const redoHistory = useCallback(() => {
    const {history, currentPosition} = matrixHistory;

    setMatrixHistory({
      history,
      currentPosition: currentPosition + 1,
    });

    _setReadyMatrix(
      MatrixOperations.copyMatrixData(history[currentPosition + 1]),
    );
  }, [matrixHistory, _setReadyMatrix, setMatrixHistory]);

  const getNumberWritten = useCallback(
    (
      forceNotOperatorNumber: boolean,
      doNotStringify: boolean,
    ): ExpressionData | string | null => {
      if (operationHappening && !forceNotOperatorNumber) {
        return editableOperatorNumber === null && !doNotStringify
          ? ''
          : editableOperatorNumber;
      }

      if (calcState !== CalcState.LambdaxA && !selectedMatrixElement) {
        return !doNotStringify ? '' : null;
      }

      const {row, column} =
        selectedMatrixElement || ({} as SelectedMatrixElement);

      const matrixNumber =
        calcState === CalcState.LambdaxA
          ? editableScalar
          : editableMatrix?.data[row] && editableMatrix.data[row][column];

      if (
        (shouldUserInputOverwriteElement ||
          (matrixNumber?.oneElement?.scalar === 0 &&
            !matrixNumber?.oneElement?.unfilteredString)) &&
        !forceNotOperatorNumber
      ) {
        return doNotStringify ? null : '';
      }

      return doNotStringify
        ? matrixNumber
        : (matrixNumber as ExpressionData).commaStringify(true);
    },
    [
      calcState,
      editableMatrix,
      shouldUserInputOverwriteElement,
      editableScalar,
      operationHappening,
      selectedMatrixElement,
      editableOperatorNumber,
    ],
  );

  const stringifiedNumberWritten = useMemo(
    () => getNumberWritten(false, false) as string,
    [getNumberWritten],
  );

  const elementDataNumberWritten = useMemo(
    () => getNumberWritten(false, true) as ExpressionData,
    [getNumberWritten],
  );

  const notOperatorNumberWritten = useMemo(
    () => getNumberWritten(true, true) as ExpressionData,
    [getNumberWritten],
  );

  const shouldACAppear = useMemo(
    () =>
      elementDataNumberWritten?.oneElement?.scalar === 0 ||
      calcState === CalcState.ready,
    [elementDataNumberWritten, calcState],
  );

  const changeNumberWritten = useCallback(
    ({
      newNumber,
      forceNotOperatorNumber = false,
    }: ChangeNumberWrittenParams) => {
      if (operationHappening && !forceNotOperatorNumber) {
        setEditableOperatorNumber(newNumber);
      } else if (calcState === CalcState.LambdaxA) {
        setEditableScalar(newNumber);
      } else {
        setEditableMatrix(
          MatrixOperations.changeElement({
            matrix: editableMatrix || readyMatrix,
            ...(selectedMatrixElement as SelectedMatrixElement),
            numberWritten: newNumber,
          }),
        );
      }
    },
    [
      calcState,
      readyMatrix,
      editableMatrix,
      selectedMatrixElement,
      operationHappening,
      setEditableOperatorNumber,
      setEditableScalar,
      setEditableMatrix,
    ],
  );

  const changeViewReduced = useCallback(() => setViewReduced(!viewReduced), [
    viewReduced,
    setViewReduced,
  ]);

  const changeFullScreenDeterminant = useCallback(
    () => setFullScreenDeterminant(!fullScreenDeterminant),
    [fullScreenDeterminant, setFullScreenDeterminant],
  );

  const changeIsVariableKeyboardActive = useCallback(
    () => setIsVariableKeyboardActive(!isVariableKeyboardActive),
    [isVariableKeyboardActive, setIsVariableKeyboardActive],
  );

  const onPressNumberButton = useCallback(
    (element: string) => {
      const originalValue = elementDataNumberWritten;

      if (element.match(/^[a-i]+$/)) {
        changeNumberWritten({
          newNumber: createMatrixElement({
            scalar:
              originalValue !== null ? originalValue?.oneElement?.scalar : 1,
            variables: [
              new VariableData({
                variable: element,
              }),
              ...((originalValue !== null &&
                originalValue?.oneElement?.variables) ||
                []),
            ],
          }),
        });
      } else if (stringifiedNumberWritten.length === 0 && element === '.') {
        changeNumberWritten({
          newNumber: createMatrixElement({
            unfilteredString: '0.',
          }),
        });
      } else if (
        count(stringifiedNumberWritten, /\.|,/, true) === 0 ||
        element !== '.'
      ) {
        if (element === '.') {
          changeNumberWritten({
            newNumber: createMatrixElement({
              unfilteredString: originalValue?.oneElement?.scalar + '.',
              variables:
                (originalValue !== null &&
                  originalValue?.oneElement?.variables) ||
                [],
            }),
          });
        } else {
          changeNumberWritten({
            newNumber: createMatrixElement({
              scalar:
                originalValue === null
                  ? element
                  : originalValue?.oneElement?.unfilteredString
                  ? (originalValue?.oneElement?.unfilteredString as string) +
                    element
                  : originalValue?.oneElement?.variables.length === 0 ||
                    originalValue?.oneElement?.scalar !== 1
                  ? originalValue?.oneElement?.scalar.toString() + element
                  : element,
              variables:
                (originalValue !== null &&
                  originalValue?.oneElement?.variables) ||
                [],
            }),
          });
        }
      }

      setShouldUserInputOverwriteElement(false);
    },
    [
      elementDataNumberWritten,
      stringifiedNumberWritten,
      selectedMatrixElement,
      getNumberWritten,
      changeNumberWritten,
    ],
  );

  const changeSettingsOfSelectedMatrixElement = useCallback(
    selectedElement => {
      setShouldUserInputOverwriteElement(true);

      setSelectedMatrixElement(selectedElement);
    },
    [setShouldUserInputOverwriteElement, setSelectedMatrixElement],
  );

  const resetScalarOperations = useCallback(() => {
    setEditableOperatorNumber(null);

    setOperationHappening(false);

    setSelectedOperator(null);
  }, [setEditableOperatorNumber, setOperationHappening, setSelectedOperator]);

  const applyOperation = useCallback(() => {
    resetScalarOperations();

    if (editableOperatorNumber !== null) {
      changeNumberWritten({
        newNumber: varOperation(
          notOperatorNumberWritten,
          selectedOperator as Operator,
          editableOperatorNumber,
        ),
        forceNotOperatorNumber: true,
      });
    }
  }, [
    editableOperatorNumber,
    notOperatorNumberWritten,
    selectedOperator,
    resetScalarOperations,
    changeNumberWritten,
    getNumberWritten,
  ]);

  const enterEditingMode = useCallback(
    ({
      newEditableMatrix,
      newCalcState,
      newSelectedElement = undefined,
      newScalar,
    }: EnterEditingModeParams) => {
      setCalcState(newCalcState);

      setFullEquation(null);

      newEditableMatrix && setEditableMatrix(newEditableMatrix);

      newScalar && setEditableScalar(newScalar);

      newSelectedElement !== undefined &&
        changeSettingsOfSelectedMatrixElement(newSelectedElement);
    },
    [
      setCalcState,
      setFullEquation,
      setEditableMatrix,
      setEditableScalar,
      changeSettingsOfSelectedMatrixElement,
    ],
  );

  const changeSelectedMatrixElement = useCallback(
    selectedElement => {
      operationHappening && applyOperation();

      changeSettingsOfSelectedMatrixElement(selectedElement);

      if (calcState === CalcState.ready) {
        enterEditingMode({
          newCalcState: CalcState.editing,
          newEditableMatrix: readyMatrix,
          newSelectedElement: selectedElement,
        });
      }
    },
    [
      calcState,
      readyMatrix,
      operationHappening,
      applyOperation,
      changeSettingsOfSelectedMatrixElement,
      enterEditingMode,
    ],
  );

  const changeColumnDirectionActive = useCallback(
    () => setColumnDirectionActive(!columnDirectionActive),
    [columnDirectionActive, setColumnDirectionActive],
  );

  const changeSecondSetOfKeysActive = useCallback(
    () => setSecondSetOfKeysActive(!secondSetOfKeysActive),
    [secondSetOfKeysActive, setSecondSetOfKeysActive],
  );

  const exitEditingMode = useCallback(() => setCalcState(CalcState.ready), [
    setCalcState,
  ]);

  const nextElement = useCallback(() => {
    const {row, column} = selectedMatrixElement as SelectedMatrixElement;
    const maxRows = editableMatrix.dimensions().rows;
    const maxColumns = editableMatrix.dimensions().columns;

    let selectedElement = {} as SelectedMatrixElement | null;

    if (!(row == maxRows - 1 && column == maxColumns - 1) && selectedElement) {
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
    } else {
      selectedElement = null;
    }

    changeSettingsOfSelectedMatrixElement(selectedElement);
  }, [
    selectedMatrixElement,
    editableMatrix,
    columnDirectionActive,
    changeSettingsOfSelectedMatrixElement,
  ]);

  const solveOperationsFullEquationSetup = useCallback(() => {
    const {result, error} = MatrixOperations.findSolutionForMatrixEquation(
      isAFirst ? readyMatrix : editableMatrix,
      isAFirst ? editableMatrix : readyMatrix,
      [CalcState.XxAeB, CalcState.XxBeA].includes(calcState),
    );

    if (!error) {
      const {
        eliminatedMatrixA,
        eliminatedMatrixB,
        solution,
        systemSolutionsType,
        lettersUsed,
      } = result;

      setViewReduced(false);

      setFullEquation({
        equationType: calcState,
        solutionType: systemSolutionsType,
        matrixA: readyMatrix,
        matrixB: editableMatrix,
        matrixC: solution,
        matrixD: eliminatedMatrixA,
        matrixE: eliminatedMatrixB,
        lettersUsed,
      });

      setReadyMatrix(
        systemSolutionsType == SystemSolutionType.SPD
          ? (solution as MatrixData)
          : readyMatrix,
      );
    }
  }, [
    isAFirst,
    calcState,
    readyMatrix,
    editableMatrix,
    setViewReduced,
    setFullEquation,
    setReadyMatrix,
  ]);

  const singleInputFullEquationSetup = useCallback(
    (matrixOperation: CalcState, newMatrix: MatrixData) => {
      const oldMatrix = matrixOnScreen;

      setFullEquation({
        equationType: matrixOperation,
        matrixA: oldMatrix,
        matrixB: newMatrix,
      } as FullEquationData);
    },
    [matrixOnScreen, setFullEquation],
  );

  const scalarFullEquationSetup = useCallback(
    ({newMatrix, scalar}) => {
      setReadyMatrix(newMatrix);

      setFullEquation({
        equationType: calcState,
        matrixB: readyMatrix,
        matrixC: newMatrix,
        scalar,
      });
    },
    [calcState, readyMatrix, setReadyMatrix, setFullEquation],
  );

  const generalFullEquationSetup = useCallback(
    ({newMatrix}) => {
      setReadyMatrix(newMatrix);

      setFullEquation({
        equationType: calcState,
        matrixA: isAFirst ? readyMatrix : editableMatrix,
        matrixB: isAFirst ? editableMatrix : readyMatrix,
        matrixC: newMatrix,
      });
    },
    [
      calcState,
      readyMatrix,
      editableMatrix,
      isAFirst,
      setReadyMatrix,
      setFullEquation,
    ],
  );

  const onPressInfoAreaBackground = useCallback(() => {
    if (fullScreenDeterminant) {
      setFullScreenDeterminant(false);
    } else {
      operationHappening && applyOperation();

      if (calcState !== CalcState.LambdaxA) {
        setCalcState(CalcState.ready);

        calcState === CalcState.editing && setReadyMatrix(editableMatrix);

        changeSettingsOfSelectedMatrixElement(null);
      }
    }
  }, [
    calcState,
    editableMatrix,
    fullScreenDeterminant,
    operationHappening,
    setFullScreenDeterminant,
    applyOperation,
    setCalcState,
    setReadyMatrix,
    changeSettingsOfSelectedMatrixElement,
  ]);

  const changeEditableDimensions = useCallback(
    ({rows, columns}: MatrixDimensions) => {
      setEditableMatrix(
        MatrixOperations.resizeMatrix({
          originalMatrix:
            calcState === CalcState.editing ? readyMatrix : editableMatrix,
          editableMatrix: editableMatrix,
          rows,
          columns,
        }),
      );

      setSelectedMatrixElement(
        selectedMatrixElement?.row ||
          rows <= 0 ||
          selectedMatrixElement?.column ||
          columns <= 0
          ? null
          : selectedMatrixElement,
      );
    },
    [
      calcState,
      readyMatrix,
      editableMatrix,
      selectedMatrixElement,
      setEditableMatrix,
      setSelectedMatrixElement,
    ],
  );

  const onPressAC = useCallback(() => {
    resetScalarOperations();

    if (calcState !== CalcState.LambdaxA) {
      setMatrixOnScreen(
        MatrixOperations.emptyMatrix(matrixOnScreen.dimensions()),
      );

      if (MatrixOperations.isMatrixEmpty(matrixOnScreen)) {
        exitEditingMode();

        changeSettingsOfSelectedMatrixElement(0);
      }
    } else {
      exitEditingMode();
    }
  }, [
    calcState,
    matrixOnScreen,
    setMatrixOnScreen,
    resetScalarOperations,
    exitEditingMode,
    changeSettingsOfSelectedMatrixElement,
  ]);

  const onLongPressAC = useCallback(setInitialState, [setInitialState]);

  const onPressCE = useCallback(
    () =>
      changeNumberWritten({
        newNumber: createMatrixElement({
          scalar: 0,
        }),
      }),
    [changeNumberWritten],
  );

  const onPressOperator = useCallback(
    operator => {
      operationHappening && applyOperation();

      setOperationHappening(true);

      setEditableOperatorNumber(null);

      setSelectedOperator(operator);
    },
    [
      operationHappening,
      applyOperation,
      setOperationHappening,
      setEditableOperatorNumber,
      setSelectedOperator,
    ],
  );

  const onPressAxB = useCallback(() => {
    setReadyMatrix(
      calcState !== CalcState.ready ? editableMatrix : readyMatrix,
    );

    enterEditingMode({
      newCalcState: CalcState.AxB,
      newEditableMatrix: MatrixOperations.emptyMatrix(
        MatrixOperations.getTransposedDimensions(matrixOnScreen),
      ),
      newSelectedElement: {
        row: 0,
        column: 0,
      },
    });
  }, [
    calcState,
    readyMatrix,
    editableMatrix,
    matrixOnScreen,
    setReadyMatrix,
    enterEditingMode,
  ]);

  const onPressBxA = useCallback(() => {
    setReadyMatrix(
      calcState !== CalcState.ready ? editableMatrix : readyMatrix,
    );

    enterEditingMode({
      newCalcState: CalcState.BxA,
      newEditableMatrix: MatrixOperations.emptyMatrix(
        MatrixOperations.getTransposedDimensions(matrixOnScreen),
      ),
      newSelectedElement: {
        row: 0,
        column: 0,
      },
    });
  }, [
    calcState,
    readyMatrix,
    editableMatrix,
    matrixOnScreen,
    setReadyMatrix,
    enterEditingMode,
  ]);

  const onPressLambdaxA = useCallback(() => {
    setReadyMatrix(
      calcState !== CalcState.ready ? editableMatrix : readyMatrix,
    );

    enterEditingMode({
      newCalcState: CalcState.LambdaxA,
      newScalar: createMatrixElement({
        scalar: 0,
      }),
    });
  }, [
    calcState,
    readyMatrix,
    editableMatrix,
    setReadyMatrix,
    enterEditingMode,
  ]);

  const onPressAddMatrix = useCallback(() => {
    setReadyMatrix(
      calcState !== CalcState.ready ? editableMatrix : readyMatrix,
    );

    enterEditingMode({
      newCalcState: CalcState.addMatrix,
      newEditableMatrix: MatrixOperations.emptyMatrix(
        matrixOnScreen.dimensions(),
      ),
      newSelectedElement: {
        row: 0,
        column: 0,
      },
    });
  }, [
    calcState,
    readyMatrix,
    editableMatrix,
    matrixOnScreen,
    setReadyMatrix,
    enterEditingMode,
  ]);

  const onPressSubtractMatrix = useCallback(() => {
    setReadyMatrix(
      calcState !== CalcState.ready ? editableMatrix : readyMatrix,
    );

    enterEditingMode({
      newCalcState: CalcState.subtractMatrix,
      newEditableMatrix: MatrixOperations.emptyMatrix(
        matrixOnScreen.dimensions(),
      ),
      newSelectedElement: {
        row: 0,
        column: 0,
      },
    });
  }, [
    calcState,
    readyMatrix,
    editableMatrix,
    matrixOnScreen,
    setReadyMatrix,
    enterEditingMode,
  ]);

  const onPressR = useCallback(() => setIsRActive(!isRActive), [
    isRActive,
    setIsRActive,
  ]);

  const onPressResolveEquation = useCallback(
    (newState: CalcState) => {
      setIsRActive(!isRActive);

      setReadyMatrix(
        calcState !== CalcState.ready ? editableMatrix : readyMatrix,
      );

      enterEditingMode({
        newCalcState: newState,
        newEditableMatrix: MatrixOperations.emptyMatrix(
          matrixOnScreen.dimensions(),
        ),
        newSelectedElement: {
          row: 0,
          column: 0,
        },
      });
    },
    [
      calcState,
      readyMatrix,
      editableMatrix,
      isRActive,
      matrixOnScreen,
      setIsRActive,
      setReadyMatrix,
      enterEditingMode,
    ],
  );

  const onPressGaussianElimination = useCallback(() => {
    const {
      gaussianElimination,
      error,
    } = MatrixOperations.getGaussianElimination(matrixOnScreen);

    if (!error) {
      const {rowEchelonForm, reducedRowEchelonForm} = gaussianElimination;

      setViewReduced(false);

      setFullEquation({
        equationType: CalcState.gaussianElimination,
        matrixA: matrixOnScreen,
        matrixC: rowEchelonForm,
        matrixD: reducedRowEchelonForm,
      });

      setMatrixOnScreen(rowEchelonForm);
    }
  }, [matrixOnScreen, setViewReduced, setFullEquation, setMatrixOnScreen]);

  const onPressGaussianEliminationReduced = useCallback(() => {
    changeViewReduced();

    setReadyMatrix(
      (viewReduced
        ? (fullEquation as FullEquationData).matrixC
        : (fullEquation as FullEquationData).matrixD) as MatrixData,
    );
  }, [viewReduced, fullEquation, changeViewReduced, setReadyMatrix]);

  const onTranspose = useCallback(() => {
    const transposed = MatrixOperations.transpose(matrixOnScreen);

    if (calcState === CalcState.ready) {
      setReadyMatrix(transposed);
    } else {
      setEditableMatrix(transposed);

      changeSettingsOfSelectedMatrixElement({
        row: selectedMatrixElement?.column,
        column: selectedMatrixElement?.row,
      });
    }

    singleInputFullEquationSetup(CalcState.transpose, transposed);
  }, [
    calcState,
    readyMatrix,
    editableMatrix,
    selectedMatrixElement,
    editableDimensions,
    setReadyMatrix,
    setEditableMatrix,
    changeSettingsOfSelectedMatrixElement,
    singleInputFullEquationSetup,
  ]);

  const onInvert = useCallback(() => {
    const {inverted, error} = MatrixOperations.invert(matrixOnScreen);

    if (!error) {
      if (calcState === CalcState.ready) {
        setReadyMatrix(inverted);
      } else {
        setEditableMatrix(inverted);

        changeSettingsOfSelectedMatrixElement(null);

        exitEditingMode();
      }

      singleInputFullEquationSetup(CalcState.invert, inverted);
    }
  }, [
    calcState,
    readyMatrix,
    editableMatrix,
    setReadyMatrix,
    setEditableMatrix,
    changeSettingsOfSelectedMatrixElement,
    exitEditingMode,
    singleInputFullEquationSetup,
  ]);

  const onEnter = useCallback(() => {
    operationHappening && applyOperation();

    selectedMatrixElement && nextElement();
  }, [operationHappening, selectedMatrixElement, applyOperation, nextElement]);

  const onCheck = useCallback(() => {
    switch (calcState) {
      case CalcState.editing:
        setReadyMatrix(editableMatrix);

        break;
      case CalcState.addMatrix:
        generalFullEquationSetup({
          newMatrix: MatrixOperations.sum(readyMatrix, editableMatrix),
        });

        break;
      case CalcState.subtractMatrix:
        generalFullEquationSetup({
          newMatrix: MatrixOperations.subtract(readyMatrix, editableMatrix),
        });

        break;
      case CalcState.AxB:
        generalFullEquationSetup({
          newMatrix: MatrixOperations.multiplyMatrix(
            readyMatrix,
            editableMatrix,
          ),
        });

        break;
      case CalcState.BxA:
        generalFullEquationSetup({
          newMatrix: MatrixOperations.multiplyMatrix(
            editableMatrix,
            readyMatrix,
          ),
        });

        break;
      case CalcState.LambdaxA:
        scalarFullEquationSetup({
          newMatrix: MatrixOperations.multiplyMatrixByScalar({
            matrixA: readyMatrix,
            scalar: editableScalar as ExpressionData,
          }),
          scalar: editableScalar,
        });

        break;
      case CalcState.AxXeB:
        solveOperationsFullEquationSetup();

        break;
      case CalcState.BxXeA:
        solveOperationsFullEquationSetup();

        break;
      case CalcState.XxAeB:
        solveOperationsFullEquationSetup();

        break;
      case CalcState.XxBeA:
        solveOperationsFullEquationSetup();

        break;
      default:
        break;
    }

    exitEditingMode();
  }, [
    calcState,
    readyMatrix,
    editableMatrix,
    editableScalar,
    setReadyMatrix,
    generalFullEquationSetup,
    scalarFullEquationSetup,
    solveOperationsFullEquationSetup,
    exitEditingMode,
  ]);

  return (
    <CalculatorContext.Provider
      value={{
        // ---- useStates: ----
        // Estado geral da calculadora:
        calcState,
        // Estados de matrizes:
        readyMatrix,
        editableMatrix,
        matrixHistory,
        selectedMatrixElement,
        shouldUserInputOverwriteElement,
        // Estados de escalares:
        editableScalar,
        fullScreenDeterminant,
        // Estados de operações:
        operationHappening,
        editableOperatorNumber,
        fullEquation,
        viewReduced,
        // Estados de botões
        secondSetOfKeysActive,
        isRActive,
        columnDirectionActive,
        isVariableKeyboardActive,
        selectedOperator,
        // ---- useMemos: ----
        editableDimensions,
        editableDimensionsString,
        isNumberKeyboardActive,
        matrixOnScreen,
        isMatrixSquare,
        isMatrixFull,
        matrixOnScreenDeterminant,
        isInverseEnabled,
        isCheckActive,
        shouldACAppear,
        // ---- useCallbacks: ----
        undoHistory,
        redoHistory,
        clearHistory,
        getSolutionTypeString,
        changeNumberWritten,
        changeEditableDimensions,
        changeSelectedMatrixElement,
        changeColumnDirectionActive,
        changeSecondSetOfKeysActive,
        changeViewReduced,
        changeFullScreenDeterminant,
        changeIsVariableKeyboardActive,
        onPressInfoAreaBackground,
        onPressNumberButton,
        onPressAC,
        onLongPressAC,
        onPressCE,
        onPressAddMatrix,
        onPressSubtractMatrix,
        onPressAxB,
        onPressBxA,
        onPressLambdaxA,
        onPressOperator,
        onPressR,
        onPressResolveEquation,
        onPressGaussianElimination,
        onPressGaussianEliminationReduced,
        onTranspose,
        onInvert,
        onEnter,
        onCheck,
      }}>
      {children}
    </CalculatorContext.Provider>
  );
};

export const useCalculator = () => useContext(CalculatorContext);
