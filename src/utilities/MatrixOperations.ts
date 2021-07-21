import MatrixData from './MatrixData';
import {SystemSolutionType, Operator} from './constants';
import ScalarOperations from './ScalarOperations';
import * as ExpressionSimplification from './ExpressionSimplification';
import {
  createMatrixElement,
  ExpressionData,
  VariableData,
} from './ExpressionClasses';
import ElementDataWithPosition from '../interfaces/ElementDataWithPosition';
import MatrixColumnWithPosition from '../interfaces/MatrixColumnWithPosition';
import SelectedMatrixElement from '../interfaces/SelectedMatrixElement';
import MatrixColumnData from '../interfaces/MatrixColumnData';
import MatrixDimensions from '../interfaces/MatrixDimensions';
import addErrorTreatment from './addErrorTreatment';

interface ChangeElementParams extends SelectedMatrixElement {
  matrix: MatrixData;
  numberWritten: ExpressionData;
}

interface JoinEditableAndOriginalMatricesParams extends MatrixDimensions {
  originalMatrix: MatrixData;
  editableMatrix: MatrixData;
}

interface MultiplyMatrixByScalarParams {
  matrixA: MatrixData;
  scalar: ExpressionData;
}

interface PartialGaussianEliminationParams {
  matrixA: MatrixData;
  matrixB: MatrixData;
  eliminateBelowMainDiagonal?: boolean;
}

interface FindSolutionMatrixEquationData {
  eliminatedMatrixA: MatrixData;
  eliminatedMatrixB: MatrixData;
  solution: MatrixData | undefined;
  systemSolutionsType: SystemSolutionType;
  lettersUsed: Array<string> | undefined;
}

interface GetGaussianEliminationData {
  rowEchelonForm: MatrixData;
  reducedRowEchelonForm: MatrixData;
}

interface PartialGaussianEliminationData {
  matrixA: MatrixData;
  matrixB: MatrixData;
  determinant: ExpressionData;
}

interface TransformEquationToVectorFormData {
  matrixA: MatrixData;
  vectorizedX: Array<ExpressionData>;
  vectorizedB: Array<ExpressionData>;
}

class MatrixOperations {
  static changeElement({
    matrix,
    column,
    row,
    numberWritten,
  }: ChangeElementParams) {
    let matrixDataCopy = [...matrix.data];

    matrixDataCopy[row][column] = numberWritten;

    return new MatrixData(matrixDataCopy);
  }

  static insertElementsPosition(
    matrix: MatrixData,
  ): Array<MatrixColumnWithPosition> {
    let positionMatrix: Array<MatrixColumnWithPosition> = [];

    if (!matrix) {
      return positionMatrix;
    }

    for (let column = matrix.dimensions().columns - 1; column >= 0; column--) {
      let positionMatrixColumn: Array<ElementDataWithPosition> = [];

      for (let row = matrix.dimensions().rows - 1; row >= 0; row--) {
        positionMatrixColumn.push({
          number: matrix.data[row][column],
          row,
          column,
        });
      }

      positionMatrix.push({
        data: positionMatrixColumn,
        column,
      });
    }

    return positionMatrix;
  }

  static copyMatrixData(matrix: MatrixData) {
    let copyData = [];

    for (let row = 0; row < matrix.dimensions().rows; row++) {
      let copyDataRow = [];

      for (let column = 0; column < matrix.dimensions().columns; column++) {
        copyDataRow.push(matrix.data[row][column]);
      }

      copyData.push(copyDataRow);
    }

    return new MatrixData(copyData);
  }

  static minDimensions = (matrix1: MatrixData, matrix2: MatrixData) => ({
    rows: Math.min(matrix1.dimensions().rows, matrix2.dimensions().rows),
    columns: Math.min(
      matrix1.dimensions().columns,
      matrix2.dimensions().columns,
    ),
  });

  static maxDimensions = (matrix1: MatrixData, matrix2: MatrixData) => ({
    rows: Math.max(matrix1.dimensions().rows, matrix2.dimensions().rows),
    columns: Math.max(
      matrix1.dimensions().columns,
      matrix2.dimensions().columns,
    ),
  });

  static joinElements = (
    matrix1: MatrixData,
    matrix2: MatrixData,
    row: number,
    column: number,
  ) => {
    const joinedElement =
      (matrix1.data[row] && matrix1.data[row][column]) ||
      (!matrix1.hasPosition({row, column}) &&
        matrix2.data[row] &&
        matrix2.data[row][column]) ||
      0;

    return joinedElement === undefined ? 0 : joinedElement;
  };

  static joinEditableAndOriginalMatrices({
    originalMatrix,
    editableMatrix,
    rows,
    columns,
  }: JoinEditableAndOriginalMatricesParams) {
    let joined = [];

    for (let row = 0; row < rows; row++) {
      let fixedRow = [];

      for (let column = 0; column < columns; column++) {
        const joinedElement = MatrixOperations.joinElements(
          editableMatrix,
          originalMatrix,
          row,
          column,
        );

        fixedRow.push(joinedElement);
      }

      joined.push(fixedRow);
    }

    return joined;
  }

  static resizeMatrix({
    originalMatrix,
    editableMatrix,
    rows,
    columns,
  }: JoinEditableAndOriginalMatricesParams) {
    return new MatrixData(
      MatrixOperations.joinEditableAndOriginalMatrices({
        originalMatrix,
        editableMatrix,
        rows,
        columns,
      }),
    );
  }

  static getTransposedDimensions(matrix: MatrixData) {
    return MatrixOperations.transpose(matrix).dimensions();
  }

  static compareMatrices(matrix1: MatrixData, matrix2: MatrixData) {
    if (
      matrix1.dimensions().rows !== matrix2.dimensions().rows ||
      matrix1.dimensions().columns !== matrix2.dimensions().columns
    ) {
      return false;
    }

    for (let row = 0; row < matrix1.dimensions().rows; row++) {
      for (let column = 0; column < matrix1.dimensions().columns; column++) {
        if (
          matrix1.data[row][column]?.commaStringify() !==
          matrix2.data[row][column]?.commaStringify()
        ) {
          return false;
        }
      }
    }

    return true;
  }

  static isMatrixFull(matrix: MatrixData) {
    if (!matrix) {
      return false;
    }

    for (let row = 0; row < matrix.dimensions().rows; row++) {
      for (let column = 0; column < matrix.dimensions().columns; column++) {
        if (Number.isNaN(matrix.data[row][column])) {
          return false;
        }
      }
    }

    return true;
  }

  static isMatrixEmpty(matrix: MatrixData) {
    if (!matrix) {
      return false;
    }

    for (let row = 0; row < matrix.dimensions().rows; row++) {
      for (let column = 0; column < matrix.dimensions().columns; column++) {
        if (matrix.data[row][column]?.commaStringify() !== '0') {
          return false;
        }
      }
    }

    return true;
  }

  static isMatrixSquare(matrix: MatrixData) {
    return matrix && matrix.dimensions().rows === matrix.dimensions().columns;
  }

  static printMatrix(matrix: MatrixData) {
    for (let row of matrix.data) {
      let rowString = '';

      for (let elem of row) {
        rowString += ` ${elem.stringify()} `;
      }

      console.log(rowString);
    }

    console.log('\n');
  }

  // static smartToFixedOnMatrix(matrixData) {
  //     let fixed = [];

  //     for (let row = 0; row < matrixData.length; row++) {
  //         let fixedRow = [];
  //         for (let column = 0; column < matrixData[0].length; column++) {
  //             fixedRow.push(smartToFixed(matrixData[row][column]));
  //         }
  //         fixed.push(fixedRow);
  //     }

  //     return fixed;
  // }

  static applyFrescuresToMatrixData(
    matrixData: Array<Array<ExpressionData | number>>,
  ): Array<MatrixColumnData> {
    if (!matrixData) {
      return [];
    }

    let converted = [];

    for (let row = 0; row < matrixData.length; row++) {
      let convertedRow = [];

      for (let column = 0; column < matrixData[0].length; column++) {
        let element = matrixData[row][column];

        if (!(element instanceof ExpressionData)) {
          // console.log('applyFrescuresToMatrixData: elemento não é um ElementData: ' + element);
          element = createMatrixElement({
            scalar: element,
          });
        }

        // if (!element.unfilteredString)
        //     element = Number.parseFloat(element.scalar)

        convertedRow.push(element);
      }

      converted.push(convertedRow);
    }

    return converted;
  }

  static emptyMatrix({rows, columns}: MatrixDimensions) {
    let matrix = [];

    for (let row = 0; row < rows; row++) {
      let matrixRow = [];

      for (let column = 0; column < columns; column++) {
        matrixRow.push(0);
      }

      matrix.push(matrixRow);
    }

    return new MatrixData(matrix);
  }

  static identity(dimension: number) {
    let identity = [];

    for (let row = 0; row < dimension; row++) {
      let identityRow = [];

      for (let column = 0; column < dimension; column++) {
        identityRow.push(row === column ? 1 : 0);
      }

      identity.push(identityRow);
    }

    return new MatrixData(identity);
  }

  static sum(matrixA: MatrixData, matrixB: MatrixData) {
    let matrix = [];

    for (let row = 0; row < matrixA.dimensions().rows; row++) {
      let matrixRow = [];

      for (let column = 0; column < matrixA.dimensions().columns; column++) {
        matrixRow.push(
          ExpressionSimplification.varOperation(
            matrixA.data[row][column],
            Operator.Add,
            matrixB.data[row][column],
          ),
        );
      }

      matrix.push(matrixRow);
    }

    return new MatrixData(matrix);
  }

  static subtract(matrixA: MatrixData, matrixB: MatrixData) {
    let matrix = [];

    for (let row = 0; row < matrixA.dimensions().rows; row++) {
      let matrixRow = [];

      for (let column = 0; column < matrixA.dimensions().columns; column++) {
        matrixRow.push(
          ExpressionSimplification.varOperation(
            matrixA.data[row][column],
            Operator.Subtract,
            matrixB.data[row][column],
          ),
        );
      }

      matrix.push(matrixRow);
    }

    return new MatrixData(matrix);
  }

  static multiplyMatrix(matrixA: MatrixData, matrixB: MatrixData) {
    let matrix = [];

    for (let row = 0; row < matrixA.dimensions().rows; row++) {
      let matrixRow = [];

      for (let column = 0; column < matrixB.dimensions().columns; column++) {
        let newElement = createMatrixElement({
          scalar: 0,
        });

        for (let index = 0; index < matrixA.dimensions().columns; index++) {
          newElement = ExpressionSimplification.varOperation(
            ExpressionSimplification.varOperation(
              matrixA.data[row][index],
              Operator.Multiply,
              matrixB.data[index][column],
            ),
            Operator.Add,
            newElement,
          );
        }

        matrixRow.push(newElement);
      }

      matrix.push(matrixRow);
    }

    return new MatrixData(matrix);
  }

  static multiplyMatrixByScalar({
    matrixA,
    scalar,
  }: MultiplyMatrixByScalarParams) {
    let matrix = [];

    for (let row = 0; row < matrixA.dimensions().rows; row++) {
      let matrixRow = [];

      for (let column = 0; column < matrixA.dimensions().columns; column++) {
        matrixRow.push(
          ExpressionSimplification.varOperation(
            matrixA.data[row][column],
            Operator.Multiply,
            scalar,
          ),
        );
      }

      matrix.push(matrixRow);
    }

    return new MatrixData(matrix);
  }

  static transpose(matrix: MatrixData) {
    let transposedData = [];

    for (let column = 0; column < matrix.dimensions().columns; column++) {
      let transposedRow = [];

      for (let row = 0; row < matrix.dimensions().rows; row++) {
        transposedRow.push(matrix.data[row][column]);
      }

      transposedData.push(transposedRow);
    }

    return new MatrixData(transposedData);
  }

  static invert(matrix: MatrixData) {
    function _invert() {
      return MatrixOperations.bareissAlgorithm(
        matrix,
        MatrixOperations.identity(matrix.dimensions().rows),
      ).matrixB;
    }

    return addErrorTreatment(_invert, 'inverted');
  }

  static determinant(matrix: MatrixData) {
    return addErrorTreatment(
      () =>
        MatrixOperations.bareissAlgorithm(
          matrix,
          MatrixOperations.identity(matrix.dimensions().rows),
          false,
          true,
        ).determinant,
      'determinant',
    );
  }

  /*
        Escalona a porcao, seja abaixo ou acima, da diagonal principal
        de matrixA, assim como retorna o determinante da matriz.
        OBS: verticalElimination deve ser verdadeiro se a ordem da equação a ser escalonada é X*A=B.
    */
  static partialGaussianElimination({
    matrixA,
    matrixB,
    eliminateBelowMainDiagonal = true,
  }: PartialGaussianEliminationParams) {
    let _matrixA = MatrixOperations.copyMatrixData(matrixA);
    let _matrixB = MatrixOperations.copyMatrixData(matrixB);

    MatrixOperations.printMatrix(_matrixA);

    const dimensionsA = _matrixA.dimensions();
    const dimensionsB = _matrixB.dimensions();

    const minDimensionsA = Math.min(dimensionsA.rows, dimensionsA.columns);

    let determinant = createMatrixElement({scalar: 1});
    let noPivotOnColumn = false;

    for (
      let pivotColumn = eliminateBelowMainDiagonal ? 0 : minDimensionsA - 1;
      pivotColumn != (eliminateBelowMainDiagonal ? minDimensionsA : -1);
      pivotColumn += eliminateBelowMainDiagonal ? 1 : -1
    ) {
      let pivot = _matrixA.data[pivotColumn][pivotColumn];

      // Se estiver na eliminação acima da diagonal e
      // encontrar um pivot zero, simplesmente pular para o próximo
      // (permite deixar da forma escalonada reduzida):
      if (eliminateBelowMainDiagonal || !pivot.isZero) {
        if (pivot.isZero) {
          let testRow = pivotColumn + 1;

          while (true) {
            // Se houver uma coluna sem pivot em uma matriz escalonada reduzida, o determinante dela é nulo:
            if (testRow === dimensionsA.columns) {
              noPivotOnColumn = true;

              break;
            }

            let possibleNewPivot = _matrixA.data[testRow][pivotColumn];

            if (!possibleNewPivot.isZero) {
              break;
            }

            testRow++;
          }

          if (!noPivotOnColumn) {
            let _matrixACopy = MatrixOperations.copyMatrixData(_matrixA);
            let _matrixBCopy = MatrixOperations.copyMatrixData(_matrixB);

            _matrixA.data[pivotColumn] = _matrixACopy.data[testRow];

            _matrixA.data[testRow] = _matrixACopy.data[pivotColumn];

            _matrixB.data[pivotColumn] = _matrixBCopy.data[testRow];

            _matrixB.data[testRow] = _matrixBCopy.data[pivotColumn];

            pivot = _matrixA.data[pivotColumn][pivotColumn];

            determinant = ExpressionSimplification.varOperation(
              determinant,
              Operator.Multiply,
              createMatrixElement({scalar: -1}),
            );
          }
        }

        if (!noPivotOnColumn) {
          console.log({pivot: pivot.stringify(), pivotColumn});

          if (!pivot.isOne) {
            for (let index = 0; index < dimensionsA.columns; index++) {
              _matrixA.data[pivotColumn][
                index
              ] = ExpressionSimplification.varOperation(
                _matrixA.data[pivotColumn][index],
                Operator.Divide,
                pivot,
              );
            }

            console.log('STARTING MATRIX B DIVISION BY PIVOT');

            for (let index = 0; index < dimensionsB.columns; index++) {
              _matrixB.data[pivotColumn][
                index
              ] = ExpressionSimplification.varOperation(
                _matrixB.data[pivotColumn][index],
                Operator.Divide,
                pivot,
              );
            }

            console.log('ENDED MATRIX B DIVISION BY PIVOT');

            determinant = ExpressionSimplification.varOperation(
              determinant,
              Operator.Multiply,
              pivot,
            );

            //if (showSteps)
            //    exibicao_passos_resolver_equacao_matricial(_matrixA, _matrixB, pivot, pivotColumn+1, pivotColumn+1, verticalElimination, None)

            pivot = _matrixA.data[pivotColumn][pivotColumn];
          }

          for (
            let index = eliminateBelowMainDiagonal ? 0 : pivotColumn - 1;
            index !=
            (eliminateBelowMainDiagonal
              ? dimensionsA.rows - pivotColumn - 1
              : -1);
            index += eliminateBelowMainDiagonal ? 1 : -1
          ) {
            let verticalIndex: number;

            if (eliminateBelowMainDiagonal) {
              verticalIndex = index + pivotColumn + 1;
            } else {
              verticalIndex = index;
            }

            const element = _matrixA.data[verticalIndex][pivotColumn];

            const eliminationFactor = ExpressionSimplification.varOperation(
              ExpressionSimplification.varOperation(
                element,
                Operator.Multiply,
                createMatrixElement({scalar: -1}),
              ),
              Operator.Divide,
              pivot,
            );

            MatrixOperations.printMatrix(_matrixA);

            console.log({
              element: element.stringify(),
              pivot: pivot.stringify(),
              eliminationFactor: eliminationFactor.stringify(),
            });

            for (
              let horizontalIndex = 0;
              horizontalIndex < dimensionsA.columns;
              horizontalIndex++
            ) {
              _matrixA.data[verticalIndex][
                horizontalIndex
              ] = ExpressionSimplification.varOperation(
                _matrixA.data[verticalIndex][horizontalIndex],
                Operator.Add,
                ExpressionSimplification.varOperation(
                  eliminationFactor,
                  Operator.Multiply,
                  _matrixA.data[pivotColumn][horizontalIndex],
                ),
              );
            }

            console.log('STARTING MATRIX B MERGE ROWS');

            for (
              let horizontalIndex = 0;
              horizontalIndex < dimensionsB.columns;
              horizontalIndex++
            ) {
              _matrixB.data[verticalIndex][
                horizontalIndex
              ] = ExpressionSimplification.varOperation(
                _matrixB.data[verticalIndex][horizontalIndex],
                Operator.Add,
                ExpressionSimplification.varOperation(
                  eliminationFactor,
                  Operator.Multiply,
                  _matrixB.data[pivotColumn][horizontalIndex],
                ),
              );
            }

            console.log('ENDED MATRIX B MERGE ROWS');

            //if (showSteps)
            //    exibicao_passos_resolver_equacao_matricial(_matrixA, _matrixB, eliminationFactor, pivotColumn+1, verticalIndex+1, verticalElimination, None)
          }

          MatrixOperations.printMatrix(_matrixA);
        }
      } else {
        determinant = createMatrixElement({scalar: 0});
      }
    }

    if (noPivotOnColumn) {
      determinant = createMatrixElement({
        scalar: 0,
      });
    }

    console.log({determinant});

    console.log({determinantString: determinant.stringify()});

    return {
      matrixA: MatrixOperations.copyMatrixData(_matrixA),
      matrixB: MatrixOperations.copyMatrixData(_matrixB),
      determinant,
    };
    // return arredondamento_na_raca(determinant, 6);
  }

  static joinMatrixRows(matrixA: MatrixData, matrixB: MatrixData) {
    return new MatrixData(
      matrixA.data.map((row, index) => [...row, ...matrixB.data[index]]),
    );
  }

  static separateMatrixRows(matrix: MatrixData, columnsA: number) {
    const [matrixA, matrixB] = matrix.data.reduce(
      (matrixDatasAccumulator, rowData, rowIndex) => {
        let [matrixA, matrixB] = matrixDatasAccumulator;

        matrixA.data[rowIndex] = rowData.slice(0, columnsA);

        matrixB.data[rowIndex] = rowData.slice(
          columnsA,
          matrix.dimensions().columns,
        );

        return [matrixA, matrixB];
      },
      [
        MatrixOperations.emptyMatrix({
          rows: matrix.dimensions().rows,
          columns: columnsA,
        }),
        MatrixOperations.emptyMatrix({
          rows: matrix.dimensions().rows,
          columns: matrix.dimensions().columns - columnsA,
        }),
      ],
    );

    return [matrixA, matrixB];
  }

  static transformMatrixToReducedRowEchelonForm(matrix: MatrixData) {
    const {rows, columns} = matrix.dimensions();

    const minDimensions = Math.min(rows, columns);

    for (let row = 0; row < minDimensions; row++) {
      const pivot = matrix.data[row][row];

      if (!pivot.isZero) {
        for (let column = row; column < matrix.dimensions().columns; column++) {
          matrix.data[row][column] = ExpressionSimplification.varOperation(
            matrix.data[row][column],
            Operator.Divide,
            pivot,
          );
        }
      }
    }
  }

  static bareissAlgorithm(
    matrixA: MatrixData,
    matrixB: MatrixData,
    forceReducedRowEchelonForm: boolean = false,
    exitOnDeterminantFound: boolean = false,
  ) {
    let joinedMatrix = MatrixOperations.joinMatrixRows(matrixA, matrixB);

    // Aqui uma página legal para entender o funcionamento do algoritmo de Bareiss:
    // https://matrixcalc.org/en/#determinant%28%7B%7B1,4,7%7D,%7B2,5,8%7D,%7B3,6,10%7D%7D%29
    // Obs.: Para encontrar a explicação, escreva uma matriz, clique no botão de achar
    // o determinante e aperte "Details (Montante's method (Bareiss algorithm))"

    const applyBareissFormula = (
      entryMatrix: MatrixData,
      exitMatrix: MatrixData,
      i: number,
      j: number,
      r: number,
    ) => {
      exitMatrix.data[i][j] = ExpressionSimplification.varOperation(
        ExpressionSimplification.varOperation(
          ExpressionSimplification.varOperation(
            entryMatrix.data[r][r],
            Operator.Multiply,
            entryMatrix.data[i][j],
          ),
          Operator.Subtract,
          ExpressionSimplification.varOperation(
            entryMatrix.data[r][j],
            Operator.Multiply,
            entryMatrix.data[i][r],
          ),
        ),
        Operator.Divide,
        r - 1 < 0
          ? createMatrixElement({scalar: 1})
          : entryMatrix.data[r - 1][r - 1],
      );
    };

    console.log('INICIO BAREISS');

    let noPivotOnColumn = false;
    let determinant: ExpressionData | null = null;

    const {rows, columns} = joinedMatrix.dimensions();

    const minDimensions = Math.min(rows, columns);

    for (let pivotIndex = 0; pivotIndex < minDimensions; pivotIndex++) {
      const pivot = joinedMatrix.data[pivotIndex][pivotIndex];

      if (pivot.isZero) {
        let testRow = pivotIndex + 1;

        while (true) {
          // Se houver uma coluna sem pivot em uma matriz escalonada reduzida, o determinante dela é nulo:
          if (testRow === joinedMatrix.dimensions().rows) {
            noPivotOnColumn = true;

            break;
          }

          const possibleNewPivot = joinedMatrix.data[testRow][pivotIndex];

          if (!possibleNewPivot.isZero) {
            break;
          }

          testRow++;
        }

        if (!noPivotOnColumn) {
          let joinedMatrixTempCopy = MatrixOperations.copyMatrixData(
            joinedMatrix,
          );

          joinedMatrix.data[pivotIndex] = joinedMatrixTempCopy.data[testRow];

          joinedMatrix.data[testRow] = joinedMatrixTempCopy.data[pivotIndex];
        }
      }

      MatrixOperations.printMatrix(joinedMatrix);

      if (!noPivotOnColumn) {
        let joinedMatrixCopy = MatrixOperations.copyMatrixData(joinedMatrix);

        for (let row = 0; row < joinedMatrix.dimensions().rows; row++) {
          for (
            let column = 0;
            column < joinedMatrix.dimensions().columns;
            column++
          ) {
            if (row !== pivotIndex) {
              applyBareissFormula(
                joinedMatrix,
                joinedMatrixCopy,
                row,
                column,
                pivotIndex,
              );
            }
          }
        }

        joinedMatrix = joinedMatrixCopy;

        console.log('NOVO PASSO BAREISS');

        MatrixOperations.printMatrix(joinedMatrix);
      }

      if (pivotIndex === joinedMatrix.dimensions().rows - 2) {
        if (MatrixOperations.isMatrixSquare(matrixA)) {
          if (noPivotOnColumn) {
            determinant = createMatrixElement({
              scalar: 0,
            });
          } else {
            determinant =
              joinedMatrix.data[matrixA.dimensions().rows - 1][
                matrixA.dimensions().columns - 1
              ];
          }
        }

        console.log('BAREISS DETERMINANT');

        console.log({determinant: determinant?.stringify()});

        if (exitOnDeterminantFound) {
          return {
            matrixA,
            matrixB,
            determinant,
          };
        }
      }
    }

    if (!noPivotOnColumn || forceReducedRowEchelonForm) {
      MatrixOperations.transformMatrixToReducedRowEchelonForm(joinedMatrix);
    }

    let [newMatrixA, newMatrixB] = MatrixOperations.separateMatrixRows(
      joinedMatrix,
      matrixA.dimensions().columns,
    );

    console.log('FIM BAREISS');

    MatrixOperations.printMatrix(joinedMatrix);

    MatrixOperations.printMatrix(newMatrixA);

    MatrixOperations.printMatrix(newMatrixB);

    return {
      matrixA: newMatrixA,
      matrixB: newMatrixB,
      determinant,
    };
  }

  static getGaussianElimination(matrix: MatrixData) {
    function _getGaussianElimination(): GetGaussianEliminationData {
      const {
        matrixA: rowEchelonForm,
      } = MatrixOperations.partialGaussianElimination({
        matrixA: matrix,
        matrixB: MatrixOperations.emptyMatrix({
          rows: matrix.dimensions().rows,
          columns: 1,
        }),
        eliminateBelowMainDiagonal: true,
      });

      const {
        matrixA: reducedRowEchelonForm,
      } = MatrixOperations.partialGaussianElimination({
        matrixA: rowEchelonForm,
        matrixB: MatrixOperations.emptyMatrix({
          rows: matrix.dimensions().rows,
          columns: 1,
        }),
        eliminateBelowMainDiagonal: false,
      });

      return {
        rowEchelonForm,
        reducedRowEchelonForm,
      };
    }

    return addErrorTreatment(_getGaussianElimination, 'gaussianElimination');
  }

  /*
        Resolve o sistema A * X = B, quando a incognita procede a matriz A conhecida,
        ou o sistema X * A = B, quando a incognita precede a matriz A conhecida.
        OBS: verticalElimination deve ser verdadeiro se a ordem da equação a ser escalonada é X*A=B.
    */
  static findSolutionForMatrixEquation(
    matrixA: MatrixData,
    matrixB: MatrixData,
    verticalElimination: boolean = false,
  ) {
    function _findSolutionForMatrixEquation(): FindSolutionMatrixEquationData {
      let _matrixA = matrixA;
      let _matrixB = matrixB;

      if (verticalElimination) {
        _matrixA = MatrixOperations.transpose(matrixA);

        _matrixB = MatrixOperations.transpose(matrixB);
      }

      let {
        matrixA: eliminatedMatrixA,
        matrixB: eliminatedMatrixB,
      } = MatrixOperations.bareissAlgorithm(_matrixA, _matrixB, true);

      const resizedEliminatedMatrixB = MatrixOperations.resizeMatrixAfterPartialElimination(
        _matrixA.dimensions().columns,
        _matrixB.dimensions().columns,
        eliminatedMatrixB,
      );

      const multiplication = MatrixOperations.multiplyMatrix(
        _matrixA,
        resizedEliminatedMatrixB,
      );

      MatrixOperations.printMatrix(_matrixA);

      MatrixOperations.printMatrix(resizedEliminatedMatrixB);

      MatrixOperations.printMatrix(multiplication);

      MatrixOperations.printMatrix(_matrixB);

      let systemSolutionsType = MatrixOperations.systemSolutionTypesVerification(
        _matrixB,
        eliminatedMatrixA,
        eliminatedMatrixB,
        multiplication,
      );

      let solution: MatrixData | undefined;
      let lettersUsed: Array<string> | undefined;

      if (systemSolutionsType === SystemSolutionType.SPDOrSPI) {
        // Método de transformar A(mxo) * X(oxn) = B(mxn)
        // em A((m*n)x(o*n)) * X((o*n)x1) = B((m*n)x1):
        const vectorEquation = MatrixOperations.transformEquationToVectorForm(
          eliminatedMatrixA,
          resizedEliminatedMatrixB,
          eliminatedMatrixB,
        );

        MatrixOperations.printMatrix(vectorEquation.matrixA);

        // Sendo matrixX um vetor, achar vetor com variáveis independentes:
        // Aqui é feita a separação entre SPD e SPI:
        const generalVectorData = MatrixOperations.findGeneralVectorForSPDOrSPIEquation(
          vectorEquation,
        );

        systemSolutionsType = generalVectorData.solutionType;

        generalVectorData.lettersUsed.length > 0 &&
          (lettersUsed = generalVectorData.lettersUsed);

        const devectorizedMatrixX = MatrixOperations.devectorizeVector(
          generalVectorData.vectorizedX,
          resizedEliminatedMatrixB.dimensions(),
        );

        solution = devectorizedMatrixX;
      }

      if (verticalElimination) {
        solution && (solution = MatrixOperations.transpose(solution));

        eliminatedMatrixA = MatrixOperations.transpose(eliminatedMatrixA);
      }

      return {
        eliminatedMatrixA,
        eliminatedMatrixB,
        solution,
        systemSolutionsType,
        lettersUsed,
      };
    }

    return addErrorTreatment(_findSolutionForMatrixEquation, 'result');
  }

  static transformEquationToVectorForm(
    matrixA: MatrixData,
    matrixX: MatrixData,
    matrixB: MatrixData,
  ): TransformEquationToVectorFormData {
    const dimensionsA = matrixA.dimensions();
    const dimensionsX = matrixX.dimensions();

    const newMatrixAData = MatrixOperations.emptyMatrix({
      rows: dimensionsA.rows * dimensionsX.columns,
      columns: dimensionsA.columns * dimensionsX.columns,
    });

    const dimensionsNewA = newMatrixAData.dimensions();

    const vectorizedX = MatrixOperations.vectorizeMatrix(matrixX);
    const vectorizedB = MatrixOperations.vectorizeMatrix(matrixB);

    for (let newRowA = 0; newRowA < dimensionsNewA.rows; newRowA++) {
      const rowA = Math.floor(newRowA / dimensionsX.columns);
      const columnX = newRowA % dimensionsX.columns;

      for (
        let vectorXIndex = 0;
        vectorXIndex < vectorizedX.length;
        vectorXIndex++
      ) {
        if (vectorXIndex % dimensionsX.columns === columnX) {
          const rowX = Math.floor(vectorXIndex / dimensionsX.columns);
          const columnA = rowX;

          newMatrixAData.data[newRowA][vectorXIndex] =
            matrixA.data[rowA][columnA];
        }
      }
    }

    return {
      matrixA: newMatrixAData,
      vectorizedX,
      vectorizedB,
    };
  }

  static devectorizeVector(
    matrix: Array<ExpressionData>,
    matrixDimensions: MatrixDimensions,
  ) {
    const newData = matrix.reduce((dataAccumulator, element) => {
      console.log(JSON.stringify({dataAccumulator}));

      let lastElement = dataAccumulator.pop();

      if (!lastElement) {
        return [[element]];
      }
      if (lastElement.length < matrixDimensions.columns) {
        return [...dataAccumulator, [...lastElement, element]];
      } else {
        return [...dataAccumulator, lastElement, [element]];
      }
    }, [] as Array<MatrixColumnData>);

    return new MatrixData(newData);
  }

  static vectorizeMatrix(matrix: MatrixData) {
    const vector = matrix.data.reduce(
      (elementsAccumulator, elementRow) => [
        ...elementsAccumulator,
        ...elementRow,
      ],
      [] as MatrixColumnData,
    );

    return vector;
  }

  static findGeneralVectorForSPDOrSPIEquation(
    vectorEquation: TransformEquationToVectorFormData,
  ) {
    const {matrixA, vectorizedX} = vectorEquation;

    let lettersUsed: Array<string> = [];

    const getLetter = () =>
      'n' + ScalarOperations.subscript(lettersUsed.length + 1);

    let solutionType = SystemSolutionType.SPD;

    const {rows, columns} = matrixA.dimensions();

    const minDimensions = Math.min(rows, columns);

    // Definição das variáveis independentes:
    for (let pivotIndex = 0; pivotIndex < vectorizedX.length; pivotIndex++) {
      const foundIndependentVariable =
        pivotIndex >= minDimensions ||
        matrixA.data[pivotIndex][pivotIndex].isZero;

      if (foundIndependentVariable) {
        solutionType = SystemSolutionType.SPI;

        const variable = getLetter();

        lettersUsed.push(variable);

        vectorizedX[pivotIndex] = createMatrixElement({
          variables: [new VariableData({variable})],
        });
      }
    }

    // Definição das variáveis dependentes:
    // Começa no último elemento antes da variável independente:
    for (let rowIndex = vectorizedX.length - 1; rowIndex >= 0; rowIndex--) {
      for (
        let columnIndex = matrixA.dimensions().columns - 1;
        columnIndex > rowIndex;
        columnIndex--
      ) {
        vectorizedX[rowIndex] = ExpressionSimplification.varOperation(
          vectorizedX[rowIndex],
          Operator.Subtract,
          ExpressionSimplification.varOperation(
            matrixA.data[rowIndex][columnIndex],
            Operator.Multiply,
            vectorizedX[columnIndex],
          ),
        );
      }
    }

    return {
      vectorizedX,
      solutionType,
      lettersUsed,
    };
  }

  static systemSolutionTypesVerification(
    matrixB: MatrixData,
    eliminatedMatrixA: MatrixData,
    eliminatedMatrixB: MatrixData,
    multiplication: MatrixData,
  ) {
    /* Se, na expressão, houver uma igualdade de um número nulo com
        um não nulo fora das dimensoes da matrix final, ela é um SI: */
    for (
      let row = eliminatedMatrixA.dimensions().columns;
      row < eliminatedMatrixB.dimensions().rows;
      row++
    ) {
      for (
        let column = 0;
        column < eliminatedMatrixB.dimensions().columns;
        column++
      ) {
        if (!eliminatedMatrixB.data[row][column].isZero) {
          return SystemSolutionType.SI;
        }
      }
    }

    let isSPIorSI = false;

    for (let row = 0; row < matrixB.dimensions().rows; row++) {
      for (let column = 0; column < matrixB.dimensions().columns; column++) {
        if (
          matrixB.data[row][column].commaStringify() !==
          multiplication.data[row][column].commaStringify()
        ) {
          if (
            !matrixB.data[row][column].hasVariables &&
            !multiplication.data[row][column].hasVariables
          ) {
            return SystemSolutionType.SI;
          }

          isSPIorSI = true;
        }
      }
    }

    if (isSPIorSI) {
      return SystemSolutionType.SPIOrSI;
    }

    return SystemSolutionType.SPDOrSPI;
  }

  static resizeMatrixAfterPartialElimination(
    matrixAColumns: number,
    matrixBColumns: number,
    matrixX: MatrixData,
  ) {
    return MatrixOperations.resizeMatrix({
      originalMatrix: MatrixOperations.emptyMatrix(matrixX.dimensions()),
      editableMatrix: matrixX,
      rows: matrixAColumns,
      columns: matrixBColumns,
    });
  }
}

export default MatrixOperations;
