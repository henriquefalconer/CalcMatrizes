import React, {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  useEffect,
} from "react";

import SelectedMatrixElement from "../interfaces/SelectedMatrixElement";
import MatrixDimensions from "../interfaces/MatrixDimensions";
import FullEquationData from "../interfaces/FullEquationData";

import MatrixOperations from "../utils/MatrixOperations";
import MatrixData from "../utils/MatrixData";

import { subscript, stringifySymbol } from "../utils/string";
import { CalcState, SystemSolutionType, Operator } from "../utils/constants";

import * as math from "mathjs";
import {
  genericOperation,
  invert,
  multiply,
  isConstant,
  isZero,
  simplify,
  splitNumsAndVars,
  hasVariables,
  parseComma,
  zero,
} from "../utils/math";

interface MatrixHistory {
  history: Array<MatrixData>;
  currentPosition: number;
}

interface ChangeNumberWrittenParams {
  newNumber: math.MathNode;
  forceNotOperatorNumber?: boolean;
}

interface EnterEditingModeParams {
  newCalcState: CalcState;
  newEditableMatrix?: MatrixData;
  newSelectedElement?: SelectedMatrixElement;
  newScalar?: math.MathNode;
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
  editableScalar: math.MathNode | null;
  fullScreenDeterminant: boolean;
  // Estados de operações:
  operationHappening: boolean;
  editableOperatorNumber: math.MathNode | null;
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
  matrixOnScreenDeterminant: math.MathNode | null;
  invertedWithDenominator: boolean;
  isInverseEnabled: boolean;
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
        : [[0], [0], [0]]
    );
  }
}

const CalculatorContext = createContext<CalculatorContextData>(
  {} as CalculatorContextData
);

export const CalculatorProvider: React.FC = ({ children }) => {
  // Estado geral da Calculadora:
  const [calcState, setCalcState] = useState(CalcState.editing);

  // Estados de matrizes:
  const [readyMatrix, __setReadyMatrix] = useState<MatrixData>(
    new IntialMatrix()
  );
  const [editableMatrix, setEditableMatrix] = useState<MatrixData>(
    new IntialMatrix()
  );
  const [
    matrixOnScreenDeterminant,
    setMatrixOnScreenDeterminant,
  ] = useState<math.MathNode | null>(null);
  const [invertedWithDenominator, setInvertedWithDenominator] = useState(false);
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
  const [editableScalar, setEditableScalar] = useState<math.MathNode | null>(
    null
  );
  const [fullScreenDeterminant, setFullScreenDeterminant] = useState(false);

  // Estados de operações:
  const [operationHappening, setOperationHappening] = useState(false);
  const [
    _editableOperatorNumber,
    setEditableOperatorNumber,
  ] = useState<math.MathNode | null>(null);
  const [fullEquation, setFullEquation] = useState<FullEquationData | null>(
    null
  );
  const [viewReduced, setViewReduced] = useState(false);

  // Estados de botões:
  const [secondSetOfKeysActive, setSecondSetOfKeysActive] = useState(false);
  const [isRActive, setIsRActive] = useState(false);
  const [columnDirectionActive, setColumnDirectionActive] = useState(true);
  const [isVariableKeyboardActive, setIsVariableKeyboardActive] = useState(
    false
  );
  const [selectedOperator, setSelectedOperator] = useState<Operator | null>(
    null
  );

  const _setReadyMatrix = useCallback(
    (newMatrix: MatrixData, preserveDenominator: boolean = false) => {
      setInvertedWithDenominator(preserveDenominator);
      __setReadyMatrix(newMatrix);
    },
    [__setReadyMatrix, setInvertedWithDenominator]
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
    (newMatrix: MatrixData, preserveDenominator: boolean = false) => {
      const { currentPosition } = matrixHistory;

      const newHistory = [...matrixHistory.history].slice(
        0,
        currentPosition + 1
      );

      if (
        !MatrixOperations.compare(
          newMatrix.data,
          newHistory[newHistory.length - 1].data
        )
      ) {
        _setReadyMatrix(newMatrix, preserveDenominator);

        setMatrixHistory({
          history: [...newHistory, MatrixOperations.copyMatrixData(newMatrix)],
          currentPosition: currentPosition + 1,
        });
      }
    },
    [matrixHistory, _setReadyMatrix, setMatrixHistory]
  );

  const getSolutionTypeString = useCallback(
    (withVariables: boolean) =>
      fullEquation?.solutionType
        ? fullEquation?.solutionType +
          (!fullEquation.lettersUsed || !withVariables
            ? ""
            : ` (${
                fullEquation.lettersUsed.length > 3
                  ? "n" + subscript("i")
                  : fullEquation.lettersUsed.map(stringifySymbol).join(", ")
              } \u2208 R)`)
        : "",
    [fullEquation]
  );

  const isNumberKeyboardActive = useMemo(
    () => !!selectedMatrixElement || calcState === CalcState.LambdaxA,
    [calcState, selectedMatrixElement]
  );

  const matrixOnScreen = useMemo(
    () => (calcState === CalcState.ready ? readyMatrix : editableMatrix),
    [calcState, readyMatrix, editableMatrix]
  );

  const parsedMatrixOnScreen = useMemo(
    () => new MatrixData(MatrixOperations.parseComma(matrixOnScreen.data)),
    [matrixOnScreen]
  );

  const editableDimensions = useMemo(() => matrixOnScreen.dimensions(), [
    matrixOnScreen,
  ]);

  const editableDimensionsString = useMemo(
    () =>
      editableDimensions
        ? `${editableDimensions.rows}x${editableDimensions.columns}`
        : "",
    [editableDimensions]
  );

  const setMatrixOnScreen = useMemo(
    () => (newMatrix: MatrixData) =>
      calcState === CalcState.ready
        ? setReadyMatrix(newMatrix)
        : setEditableMatrix(newMatrix),
    [calcState, setReadyMatrix, setEditableMatrix]
  );

  const isMatrixSquare = useMemo(
    () => MatrixOperations.isSquare(matrixOnScreen.data),
    [matrixOnScreen]
  );

  useEffect(() => {
    !invertedWithDenominator &&
      setMatrixOnScreenDeterminant(
        isMatrixSquare
          ? simplify(MatrixOperations.recursiveDet(parsedMatrixOnScreen.data))
          : null
      );
  }, [selectedMatrixElement, isMatrixSquare, parsedMatrixOnScreen]);

  const editableOperatorNumber = useMemo(
    () => (operationHappening ? _editableOperatorNumber : null),
    [operationHappening, _editableOperatorNumber]
  );

  const isInverseEnabled = useMemo(() => {
    return (
      MatrixOperations.isSquare(matrixOnScreen.data) &&
      !isZero(matrixOnScreenDeterminant)
    );
  }, [matrixOnScreen, matrixOnScreenDeterminant]);

  const isAFirst = useMemo(() => {
    return ![CalcState.BxA, CalcState.BxXeA, CalcState.XxBeA].includes(
      calcState
    );
  }, [calcState]);

  const clearHistory = useCallback(
    () =>
      setMatrixHistory({
        history: [MatrixOperations.copyMatrixData(parsedMatrixOnScreen)],
        currentPosition: 0,
      }),
    [parsedMatrixOnScreen, _setReadyMatrix, setMatrixHistory]
  );

  const undoHistory = useCallback(() => {
    const { history, currentPosition } = matrixHistory;

    setFullEquation(null);

    setMatrixHistory({
      history,
      currentPosition: currentPosition - 1,
    });

    _setReadyMatrix(
      MatrixOperations.copyMatrixData(history[currentPosition - 1])
    );
  }, [matrixHistory, _setReadyMatrix, setFullEquation, setMatrixHistory]);

  const redoHistory = useCallback(() => {
    const { history, currentPosition } = matrixHistory;

    setMatrixHistory({
      history,
      currentPosition: currentPosition + 1,
    });

    _setReadyMatrix(
      MatrixOperations.copyMatrixData(history[currentPosition + 1])
    );
  }, [matrixHistory, _setReadyMatrix, setMatrixHistory]);

  const getNumberWritten = useCallback(
    (
      forceNotOperatorNumber: boolean,
      doNotStringify: boolean
    ): math.MathNode | string | null => {
      if (operationHappening && !forceNotOperatorNumber)
        return editableOperatorNumber === null && !doNotStringify
          ? ""
          : editableOperatorNumber;

      if (calcState !== CalcState.LambdaxA && !selectedMatrixElement)
        return !doNotStringify ? "" : null;

      const { row, column } =
        selectedMatrixElement || ({} as SelectedMatrixElement);

      const matrixNumber =
        calcState === CalcState.LambdaxA
          ? editableScalar
          : editableMatrix?.data[row] && editableMatrix.data[row][column];

      if (
        (shouldUserInputOverwriteElement || isZero(matrixNumber)) &&
        !forceNotOperatorNumber
      )
        return doNotStringify ? null : "";

      return matrixNumber;
    },
    [
      calcState,
      editableMatrix,
      shouldUserInputOverwriteElement,
      editableScalar,
      operationHappening,
      selectedMatrixElement,
      editableOperatorNumber,
    ]
  );

  const stringifiedNumberWritten = useMemo(
    () => getNumberWritten(false, false) as string,
    [getNumberWritten]
  );

  const elementDataNumberWritten = useMemo(
    () => getNumberWritten(false, true) as math.MathNode | null,
    [getNumberWritten]
  );

  const notOperatorNumberWritten = useMemo(
    () => getNumberWritten(true, true) as math.MathNode,
    [getNumberWritten]
  );

  const shouldACAppear = useMemo(
    () => isZero(elementDataNumberWritten) || calcState === CalcState.ready,
    [elementDataNumberWritten, calcState]
  );

  const changeNumberWritten = useCallback(
    ({
      newNumber,
      forceNotOperatorNumber = false,
    }: ChangeNumberWrittenParams) => {
      const newNode = newNumber;

      if (operationHappening && !forceNotOperatorNumber)
        setEditableOperatorNumber(newNode);
      else if (calcState === CalcState.LambdaxA) setEditableScalar(newNode);
      else
        setEditableMatrix(
          MatrixOperations.changeElement({
            matrix: editableMatrix || readyMatrix,
            ...(selectedMatrixElement as SelectedMatrixElement),
            numberWritten: newNode,
          })
        );
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
    ]
  );

  const changeViewReduced = useCallback(() => setViewReduced(!viewReduced), [
    viewReduced,
    setViewReduced,
  ]);

  const changeFullScreenDeterminant = useCallback(
    () => setFullScreenDeterminant(!fullScreenDeterminant),
    [fullScreenDeterminant, setFullScreenDeterminant]
  );

  const changeIsVariableKeyboardActive = useCallback(
    () => setIsVariableKeyboardActive(!isVariableKeyboardActive),
    [isVariableKeyboardActive, setIsVariableKeyboardActive]
  );

  const onPressNumberButton = useCallback(
    (element: string) => {
      const originalValue = elementDataNumberWritten;

      const [nums, vars] = splitNumsAndVars(originalValue);

      if (!hasVariables(element)) {
        const newNums = math.parse(
          element === "." ? "#" + (nums || "0") + element : nums + element
        );
        changeNumberWritten({
          newNumber: vars ? multiply(newNums, vars) : newNums,
        });
      } else {
        const newElem = math.parse(element);
        const newVars = vars ? simplify(multiply(vars, newElem)) : newElem;
        changeNumberWritten({
          newNumber: nums ? multiply(math.parse(nums), newVars) : newVars,
        });
      }

      setShouldUserInputOverwriteElement(false);
    },
    [
      elementDataNumberWritten,
      stringifiedNumberWritten,
      selectedMatrixElement,
      getNumberWritten,
      changeNumberWritten,
    ]
  );

  const changeSettingsOfSelectedMatrixElement = useCallback(
    (selectedElement) => {
      if (elementDataNumberWritten)
        changeNumberWritten({
          newNumber: parseComma(elementDataNumberWritten),
        });
      setShouldUserInputOverwriteElement(true);
      setSelectedMatrixElement(selectedElement);
    },
    [
      elementDataNumberWritten,
      setShouldUserInputOverwriteElement,
      setSelectedMatrixElement,
    ]
  );

  const resetScalarOperations = useCallback(() => {
    setEditableOperatorNumber(null);
    setOperationHappening(false);
    setSelectedOperator(null);
  }, [setEditableOperatorNumber, setOperationHappening, setSelectedOperator]);

  const applyOperation = useCallback(() => {
    resetScalarOperations();

    if (editableOperatorNumber !== null)
      changeNumberWritten({
        newNumber: simplify(
          genericOperation(
            selectedOperator as Operator,
            notOperatorNumberWritten,
            editableOperatorNumber
          )
        ),
        forceNotOperatorNumber: true,
      });
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
    ]
  );

  const changeSelectedMatrixElement = useCallback(
    (selectedElement) => {
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
    ]
  );

  const changeColumnDirectionActive = useCallback(
    () => setColumnDirectionActive(!columnDirectionActive),
    [columnDirectionActive, setColumnDirectionActive]
  );

  const changeSecondSetOfKeysActive = useCallback(
    () => setSecondSetOfKeysActive(!secondSetOfKeysActive),
    [secondSetOfKeysActive, setSecondSetOfKeysActive]
  );

  const exitEditingMode = useCallback(() => setCalcState(CalcState.ready), [
    setCalcState,
  ]);

  const nextElement = useCallback(() => {
    const { row, column } = selectedMatrixElement as SelectedMatrixElement;
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
    } else selectedElement = null;

    changeSettingsOfSelectedMatrixElement(selectedElement);
  }, [
    selectedMatrixElement,
    editableMatrix,
    columnDirectionActive,
    changeSettingsOfSelectedMatrixElement,
  ]);

  const solveOperationsFullEquationSetup = useCallback(() => {
    const result = MatrixOperations.findSolutionForMatrixEquation(
      (isAFirst ? readyMatrix : editableMatrix).data,
      (isAFirst ? editableMatrix : readyMatrix).data,
      [CalcState.XxAeB, CalcState.XxBeA].includes(calcState)
    );

    const {
      eliminatedMatrixA,
      eliminatedMatrixB,
      solution,
      systemSolutionsType,
      lettersUsed,
    } = result;

    const matrixC = solution && new MatrixData(solution);
    const matrixD = new MatrixData(eliminatedMatrixA);
    const matrixE = new MatrixData(eliminatedMatrixB);

    setViewReduced(false);
    setFullEquation({
      equationType: calcState,
      solutionType: systemSolutionsType,
      matrixA: readyMatrix,
      matrixB: editableMatrix,
      matrixC,
      matrixD,
      matrixE,
      lettersUsed,
    });

    setReadyMatrix(
      systemSolutionsType == SystemSolutionType.SPD
        ? (matrixC as MatrixData)
        : readyMatrix
    );
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
      const oldMatrix = parsedMatrixOnScreen;

      setFullEquation({
        equationType: matrixOperation,
        matrixA: oldMatrix,
        matrixB: newMatrix,
      } as FullEquationData);
    },
    [parsedMatrixOnScreen, setFullEquation]
  );

  const scalarFullEquationSetup = useCallback(
    (newMatrix: math.MathNode[][], scalar: math.MathNode) => {
      const matrixData = new MatrixData(newMatrix);

      setReadyMatrix(matrixData);

      setFullEquation({
        equationType: calcState,
        matrixB: readyMatrix,
        matrixC: matrixData,
        scalar,
      });
    },
    [calcState, readyMatrix, setReadyMatrix, setFullEquation]
  );

  const generalFullEquationSetup = useCallback(
    (newMatrix: math.MathNode[][]) => {
      const matrixData = new MatrixData(newMatrix);

      setReadyMatrix(matrixData);

      setFullEquation({
        equationType: calcState,
        matrixA: isAFirst ? readyMatrix : editableMatrix,
        matrixB: isAFirst ? editableMatrix : readyMatrix,
        matrixC: matrixData,
      });
    },
    [
      calcState,
      readyMatrix,
      editableMatrix,
      isAFirst,
      setReadyMatrix,
      setFullEquation,
    ]
  );

  const onPressInfoAreaBackground = useCallback(() => {
    if (fullScreenDeterminant) setFullScreenDeterminant(false);
    else {
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
    ({ rows, columns }: MatrixDimensions) => {
      setEditableMatrix(
        MatrixOperations.resizeMatrix({
          originalMatrix:
            calcState === CalcState.editing ? readyMatrix : editableMatrix,
          editableMatrix: editableMatrix,
          rows,
          columns,
        })
      );
      setSelectedMatrixElement(
        selectedMatrixElement?.row ||
          0 >= rows ||
          selectedMatrixElement?.column ||
          0 >= columns
          ? null
          : selectedMatrixElement
      );
    },
    [
      calcState,
      readyMatrix,
      editableMatrix,
      selectedMatrixElement,
      setEditableMatrix,
      setSelectedMatrixElement,
    ]
  );

  const onPressAC = useCallback(() => {
    resetScalarOperations();

    setFullEquation(null);

    if (calcState !== CalcState.LambdaxA) {
      setMatrixOnScreen(
        MatrixOperations.emptyMatrix(parsedMatrixOnScreen.dimensions())
      );

      if (MatrixOperations.isEmpty(parsedMatrixOnScreen.data)) {
        exitEditingMode();
        changeSettingsOfSelectedMatrixElement(0);
      }
    } else {
      exitEditingMode();
    }
  }, [
    calcState,
    parsedMatrixOnScreen,
    setMatrixOnScreen,
    resetScalarOperations,
    exitEditingMode,
    changeSettingsOfSelectedMatrixElement,
  ]);

  const onLongPressAC = useCallback(setInitialState, [setInitialState]);

  const onPressCE = useCallback(
    () =>
      changeNumberWritten({
        newNumber: zero,
      }),
    [changeNumberWritten]
  );

  const onPressOperator = useCallback(
    (operator) => {
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
    ]
  );

  const onPressAxB = useCallback(() => {
    setReadyMatrix(
      calcState !== CalcState.ready ? editableMatrix : readyMatrix
    );

    enterEditingMode({
      newCalcState: CalcState.AxB,
      newEditableMatrix: new MatrixData(
        MatrixOperations.empty(
          ...MatrixOperations.dimensions(matrixOnScreen.data, true)
        )
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
      calcState !== CalcState.ready ? editableMatrix : readyMatrix
    );

    enterEditingMode({
      newCalcState: CalcState.BxA,
      newEditableMatrix: new MatrixData(
        MatrixOperations.empty(
          ...MatrixOperations.dimensions(matrixOnScreen.data, true)
        )
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
      calcState !== CalcState.ready ? editableMatrix : readyMatrix
    );

    enterEditingMode({
      newCalcState: CalcState.LambdaxA,
      newScalar: zero,
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
      calcState !== CalcState.ready ? editableMatrix : readyMatrix
    );

    enterEditingMode({
      newCalcState: CalcState.addMatrix,
      newEditableMatrix: MatrixOperations.emptyMatrix(
        matrixOnScreen.dimensions()
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
      calcState !== CalcState.ready ? editableMatrix : readyMatrix
    );

    enterEditingMode({
      newCalcState: CalcState.subtractMatrix,
      newEditableMatrix: MatrixOperations.emptyMatrix(
        matrixOnScreen.dimensions()
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
        calcState !== CalcState.ready ? editableMatrix : readyMatrix
      );

      enterEditingMode({
        newCalcState: newState,
        newEditableMatrix: MatrixOperations.emptyMatrix(
          matrixOnScreen.dimensions()
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
    ]
  );

  const onPressGaussianElimination = useCallback(() => {
    const [ref, rref] = MatrixOperations.getGaussianElimination(
      parsedMatrixOnScreen.data
    );

    const [rowEchelonForm, reducedRowEchelonForm] = [ref, rref].map(
      (m) => new MatrixData(m)
    );

    setViewReduced(false);
    setFullEquation({
      equationType: CalcState.gaussianElimination,
      matrixA: parsedMatrixOnScreen,
      matrixC: rowEchelonForm,
      matrixD: reducedRowEchelonForm,
    });

    setMatrixOnScreen(rowEchelonForm);
  }, [
    parsedMatrixOnScreen,
    setViewReduced,
    setFullEquation,
    setMatrixOnScreen,
  ]);

  const onPressGaussianEliminationReduced = useCallback(() => {
    changeViewReduced();
    setReadyMatrix(
      (viewReduced
        ? (fullEquation as FullEquationData).matrixC
        : (fullEquation as FullEquationData).matrixD) as MatrixData
    );
  }, [viewReduced, fullEquation, changeViewReduced, setReadyMatrix]);

  const onTranspose = useCallback(() => {
    const transposed = new MatrixData(
      MatrixOperations.transpose(parsedMatrixOnScreen.data)
    );

    if (calcState === CalcState.ready) setReadyMatrix(transposed);
    else {
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
    const adjTrans = MatrixOperations.adjTrans(parsedMatrixOnScreen.data);

    const invDet = matrixOnScreenDeterminant as math.MathNode;

    const isNotConstant = !isConstant(matrixOnScreenDeterminant);

    if (isNotConstant) setMatrixOnScreenDeterminant(invert(invDet));

    const inverted = new MatrixData(
      MatrixOperations.transformAdjTransToInv(adjTrans, invDet)
    );

    if (calcState === CalcState.ready) {
      setReadyMatrix(inverted, isNotConstant);
    } else {
      setEditableMatrix(inverted);
      changeSettingsOfSelectedMatrixElement(null);
      exitEditingMode();
    }

    singleInputFullEquationSetup(CalcState.invert, inverted);
  }, [
    calcState,
    readyMatrix,
    editableMatrix,
    matrixOnScreenDeterminant,
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
        generalFullEquationSetup(
          MatrixOperations.sum(readyMatrix.data, editableMatrix.data)
        );
        break;
      case CalcState.subtractMatrix:
        generalFullEquationSetup(
          MatrixOperations.subtract(readyMatrix.data, editableMatrix.data)
        );
        break;
      case CalcState.AxB:
        generalFullEquationSetup(
          MatrixOperations.multiply(readyMatrix.data, editableMatrix.data)
        );
        break;
      case CalcState.BxA:
        generalFullEquationSetup(
          MatrixOperations.multiply(editableMatrix.data, readyMatrix.data)
        );
        break;
      case CalcState.LambdaxA:
        scalarFullEquationSetup(
          MatrixOperations.scalarMultiply(
            readyMatrix.data,
            parseComma(editableScalar as math.MathNode)
          ),
          editableScalar as math.MathNode
        );
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
        matrixOnScreenDeterminant,
        invertedWithDenominator,
        isInverseEnabled,
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
      }}
    >
      {children}
    </CalculatorContext.Provider>
  );
};

export const useCalculator = () => useContext(CalculatorContext);
