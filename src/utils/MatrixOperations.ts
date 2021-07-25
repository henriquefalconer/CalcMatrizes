import MatrixData from "./MatrixData";

import ElementDataWithPosition from "../interfaces/ElementDataWithPosition";
import MatrixColumnWithPosition from "../interfaces/MatrixColumnWithPosition";
import SelectedMatrixElement from "../interfaces/SelectedMatrixElement";
import MatrixDimensions from "../interfaces/MatrixDimensions";

import { SystemSolutionType } from "./constants";

import * as math from "mathjs";
import {
  add,
  subtract,
  multiply,
  divide,
  isZero,
  isOne,
  zero,
  plusOne,
  minusOne,
  condNeg,
  simplify,
  simplifyInversion,
  hasVariables,
  parseComma,
} from "./math";

interface ChangeElementParams extends SelectedMatrixElement {
  matrix: MatrixData;
  numberWritten: math.MathNode;
}

interface JoinEditableAndOriginalMatricesParams extends MatrixDimensions {
  originalMatrix: MatrixData;
  editableMatrix: MatrixData;
}

interface FindSolutionMatrixEquationData {
  eliminatedMatrixA: math.MathNode[][];
  eliminatedMatrixB: math.MathNode[][];
  solution: math.MathNode[][] | undefined;
  systemSolutionsType: SystemSolutionType;
  lettersUsed: Array<string> | undefined;
}

interface TransformEquationToVectorFormData {
  matrixA: math.MathNode[][];
  vectorizedX: math.MathNode[];
  vectorizedB: math.MathNode[];
}

class MatrixOperations {
  static print(m: math.MathNode[][]) {
    for (let row of m) {
      let rowString = "";
      for (let elem of row) {
        rowString += ` ${elem} `;
      }
      console.log(rowString);
    }
    console.log("\n");
  }

  static compare(m1: math.MathNode[][], m2: math.MathNode[][]) {
    const [rows, cols] = [m1.length, m1[0].length];
    const [rows2, cols2] = [m2.length, m2[0].length];
    if (rows !== rows2 || cols !== cols2) return false;
    for (let row = 0; row < rows; row++)
      for (let col = 0; col < cols; col++)
        if (!m1[row][col].equals(m2[row][col])) return false;
    return true;
  }

  static dimensions(
    m: math.MathNode[][],
    transposed: boolean = false
  ): [rows: number, cols: number] {
    return transposed ? [m[0].length, m.length] : [m.length, m[0].length];
  }

  static simplify(m: math.MathNode[][]) {
    const [rows, cols] = [m.length, m[0].length];
    for (let row = 0; row < rows; row++)
      for (let col = 0; col < cols; col++) m[row][col] = simplify(m[row][col]);
    return m;
  }

  static sum(m1: math.MathNode[][], m2: math.MathNode[][]) {
    const [rows, cols] = [m1.length, m1[0].length];
    const m = MatrixOperations.empty(rows, cols);
    for (let row = 0; row < rows; row++)
      for (let col = 0; col < cols; col++)
        m[row][col] = simplify(add(m1[row][col], m2[row][col]));
    return m;
  }

  static subtract(m1: math.MathNode[][], m2: math.MathNode[][]) {
    const [rows, cols] = [m1.length, m1[0].length];
    const m = MatrixOperations.empty(rows, cols);
    for (let row = 0; row < rows; row++)
      for (let col = 0; col < cols; col++)
        m[row][col] = simplify(subtract(m1[row][col], m2[row][col]));
    return m;
  }

  static multiply(m1: math.MathNode[][], m2: math.MathNode[][]) {
    const [rows1, cols1] = [m1.length, m1[0].length];
    const cols2 = m2[0].length;
    const m = MatrixOperations.empty(rows1, cols2);
    let adder: math.MathNode;
    for (let row = 0; row < rows1; row++) {
      for (let col = 0; col < cols2; col++) {
        adder = zero;
        for (let i = 0; i < cols1; i++)
          adder = add(adder, multiply(m1[row][i], m2[i][col]));
        m[row][col] = simplify(adder);
      }
    }
    return m;
  }

  static scalarMultiply(m: math.MathNode[][], s: math.MathNode) {
    const [rows, cols] = [m.length, m[0].length];
    const res = MatrixOperations.empty(rows, cols);
    for (let row = 0; row < rows; row++)
      for (let col = 0; col < cols; col++)
        res[row][col] = simplify(multiply(m[row][col], s));
    return res;
  }

  static transpose(m: math.MathNode[][]) {
    const [rows, cols] = [m.length, m[0].length];
    const res = MatrixOperations.empty(cols, rows);
    for (let row = 0; row < rows; row++)
      for (let col = 0; col < cols; col++) res[col][row] = m[row][col];
    return res;
  }

  static parseComma(m: math.MathNode[][]) {
    const [rows, cols] = [m.length, m[0].length];
    const res = MatrixOperations.empty(rows, cols);
    for (let row = 0; row < rows; row++)
      for (let col = 0; col < cols; col++)
        res[row][col] = parseComma(m[row][col]);
    return res;
  }

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
    matrix: MatrixData
  ): Array<MatrixColumnWithPosition> {
    let positionMatrix: Array<MatrixColumnWithPosition> = [];

    if (!matrix) return positionMatrix;

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

  static copyMatrixData(m: MatrixData) {
    return new MatrixData(MatrixOperations.clone(m.data));
  }

  static clone(m: math.MathNode[][]) {
    return m.map((row) => row.map((node) => node.clone()));
  }

  static joinElements = (
    matrix1: MatrixData,
    matrix2: MatrixData,
    row: number,
    column: number
  ) => {
    const joinedElement =
      (matrix1.data[row] && matrix1.data[row][column]) ||
      (!matrix1.hasPosition({ row, column }) &&
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
          column
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
      })
    );
  }

  static isEmpty(m: math.MathNode[][]) {
    const [rows, cols] = [m.length, m[0].length];
    for (let row = 0; row < rows; row++)
      for (let col = 0; col < cols; col++)
        if (!isZero(m[row][col])) return false;
    return true;
  }

  static isSquare(m: math.MathNode[][]) {
    return m.length === m[0].length;
  }

  static emptyMatrix({ rows, columns }: MatrixDimensions) {
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

  static empty(rows: number, cols: number) {
    return Array.from(
      { length: rows },
      () => Array.from({ length: cols }, () => zero) as math.MathNode[]
    );
  }

  // Escalona a porcao, seja abaixo ou acima, da diagonal principal
  // de m1, assim como retorna o determinante da matriz.
  static partialGaussianElimination(
    mA: math.MathNode[][],
    eliminateBelowMainDiagonal = true
  ) {
    const [rowsA, colsA] = [mA.length, mA[0].length];

    const minDimensionsA = Math.min(rowsA, colsA);

    let noPivotOnColumn = false;

    for (
      let pivotColumn = eliminateBelowMainDiagonal ? 0 : minDimensionsA - 1;
      pivotColumn != (eliminateBelowMainDiagonal ? minDimensionsA : -1);
      pivotColumn += eliminateBelowMainDiagonal ? 1 : -1
    ) {
      let pivot = mA[pivotColumn][pivotColumn];

      // Se estiver na eliminação acima da diagonal e
      // encontrar um pivot zero, simplesmente pular para o próximo
      // (permite deixar da forma escalonada reduzida):
      if (eliminateBelowMainDiagonal || !isZero(pivot)) {
        if (isZero(pivot)) {
          let testRow = pivotColumn + 1;
          while (true) {
            // Se houver uma coluna sem pivot em uma matriz escalonada reduzida, o determinante dela é nulo:
            if (testRow === colsA) {
              noPivotOnColumn = true;
              break;
            }

            if (!isZero(mA[testRow][pivotColumn])) break;

            testRow++;
          }

          if (!noPivotOnColumn) {
            [mA[pivotColumn], mA[testRow]] = [mA[testRow], mA[pivotColumn]];

            pivot = mA[pivotColumn][pivotColumn];
          }
        }

        if (!noPivotOnColumn) {
          if (!isOne(pivot)) {
            for (let index = 0; index < colsA; index++)
              mA[pivotColumn][index] = divide(mA[pivotColumn][index], pivot);

            pivot = mA[pivotColumn][pivotColumn];
          }

          for (
            let index = eliminateBelowMainDiagonal ? 0 : pivotColumn - 1;
            index !=
            (eliminateBelowMainDiagonal ? rowsA - pivotColumn - 1 : -1);
            index += eliminateBelowMainDiagonal ? 1 : -1
          ) {
            let verticalIndex: number;
            if (eliminateBelowMainDiagonal)
              verticalIndex = index + pivotColumn + 1;
            else verticalIndex = index;

            const element = mA[verticalIndex][pivotColumn];
            const eliminationFactor = divide(
              multiply(element, minusOne),
              pivot
            );

            for (
              let horizontalIndex = 0;
              horizontalIndex < colsA;
              horizontalIndex++
            ) {
              mA[verticalIndex][horizontalIndex] = add(
                multiply(eliminationFactor, mA[pivotColumn][horizontalIndex]),
                mA[verticalIndex][horizontalIndex]
              );
            }
          }

          MatrixOperations.simplify(mA);
        }
      }
    }

    return mA;
  }

  static getGaussianElimination(
    m: math.MathNode[][]
  ): [ref: math.MathNode[][], rref: math.MathNode[][]] {
    const ref = MatrixOperations.partialGaussianElimination(m, true);
    const rref = MatrixOperations.partialGaussianElimination(
      MatrixOperations.clone(ref),
      false
    );
    return [ref, rref];
  }

  static separateMatrixRows(m: math.MathNode[][], colsA: number) {
    const [rows, cols] = [m.length, m[0].length];
    const [m1, m2] = m.reduce(
      (acc, row, i) => {
        let [m1, m2] = acc;
        m1[i] = row.slice(0, colsA);
        m2[i] = row.slice(colsA, cols);
        return [m1, m2];
      },
      [
        MatrixOperations.empty(rows, colsA),
        MatrixOperations.empty(rows, cols - colsA),
      ]
    );
    return [m1, m2];
  }

  static transformMatrixToReducedRowEchelonForm(m: math.MathNode[][]) {
    const [rows, cols] = [m.length, m[0].length];
    const minDim = Math.min(rows, cols);
    let pivot: math.MathNode;
    for (let row = 0; row < minDim; row++) {
      pivot = m[row][row];
      if (!isZero(pivot)) {
        m[row][row] = plusOne;
        for (let col = row + 1; col < cols; col++)
          m[row][col] = divide(m[row][col], pivot);
      }
    }
    return m;
  }

  static recursiveDet(m: math.MathNode[][]): math.MathNode {
    const size = m.length;
    if (size === 1) return m[0][0];
    let pivot: math.MathNode;
    let subM: math.MathNode[][];
    let d = zero;
    let recD: math.MathNode;
    for (let row = 0; row < size; row++) {
      pivot = m[row][0];
      subM = m
        .filter((_, i) => i !== row)
        .map((row) => row.filter((_, i) => i > 0));
      recD = MatrixOperations.recursiveDet(subM);
      d = add(d, condNeg(multiply(recD, pivot), row % 2 !== 0));
    }
    return d;
  }

  static rmvDivisor(
    m: math.MathNode[][]
  ): [noDiv: math.MathNode[][], div: math.MathNode] {
    const [rows, cols] = [m.length, m[0].length];
    const noDiv = MatrixOperations.empty(rows, cols);
    let node: math.MathNode;
    let divs: math.MathNode[] = [];
    for (let row = 0; row < rows; row++) {
      for (let col = 0; col < cols; col++) {
        node = m[row][col];
        if (
          node.isOperatorNode &&
          node.op === "/" &&
          node.args?.[1].isOperatorNode
        ) {
          const div = node.args[1];
          if (divs.every((d) => !d.equals(div))) divs.push(node.args[1]);
        }
      }
    }
    let multiplyDivs: math.MathNode[];
    for (let row = 0; row < rows; row++) {
      for (let col = 0; col < cols; col++) {
        node = m[row][col];
        multiplyDivs = divs;
        if (
          m[row][col].isOperatorNode &&
          m[row][col].op === "/" &&
          m[row][col].args?.[1].isOperatorNode
        ) {
          node = m[row][col].args?.[0] as math.MathNode;
          multiplyDivs = divs.filter(
            (d) => !d.equals((m[row][col].args as math.MathNode[])[1])
          );
        }
        noDiv[row][col] = multiplyDivs.length
          ? multiply(node, ...multiplyDivs)
          : node;
      }
    }
    return [noDiv, divs.length > 1 ? multiply(...divs) : divs?.[0] ?? plusOne];
  }

  // Adjugate matrix for inverse matrix calculation:
  // https://math.stackexchange.com/questions/1149957/find-the-inverse-of-a-matrix-with-an-unknown-variable
  static adjTrans(m: math.MathNode[][]): math.MathNode[][] {
    const size = m.length;
    let subM: math.MathNode[][];
    let recD: math.MathNode;
    const adjTrans = MatrixOperations.empty(size, size);
    for (let row = 0; row < size; row++) {
      for (let col = 0; col < size; col++) {
        subM = m
          .filter((_, i) => i !== row)
          .map((row) => row.filter((_, i) => i !== col));
        recD = MatrixOperations.recursiveDet(subM);
        adjTrans[col][row] = condNeg(recD, (row + col) % 2 !== 0);
      }
    }
    return adjTrans;
  }

  static transformAdjTransToInv(adjTrans: math.MathNode[][], d: math.MathNode) {
    const size = adjTrans.length;
    for (let row = 0; row < size; row++)
      for (let col = 0; col < size; col++)
        adjTrans[row][col] = simplifyInversion(
          divide(simplify(adjTrans[row][col]), d)
        );
    return adjTrans;
  }

  static bareissAlgorithm(m1: math.MathNode[][], m2: math.MathNode[][]) {
    let m = m1.map((row, i) => [...row, ...m2[i]]);

    // Aqui uma página legal para entender o funcionamento do algoritmo de Bareiss:
    // https://matrixcalc.org/en/#determinant%28%7B%7B1,4,7%7D,%7B2,5,8%7D,%7B3,6,10%7D%7D%29
    // Obs.: Para encontrar a explicação, escreva uma matriz, clique no botão de achar
    // o determinante e aperte "Details (Montante's method (Bareiss algorithm))"
    const applyBareissFormula = (
      entryMatrix: math.MathNode[][],
      exitMatrix: math.MathNode[][],
      i: number,
      j: number,
      r: number
    ) => {
      const subtraction = subtract(
        multiply(entryMatrix[r][r], entryMatrix[i][j]),
        multiply(entryMatrix[r][j], entryMatrix[i][r])
      );

      const result =
        r - 1 < 0
          ? subtraction
          : divide(subtraction, entryMatrix[r - 1][r - 1]);

      exitMatrix[i][j] = result;
    };

    const cols1 = m1[0].length;
    const [rows, cols] = [m.length, m[0].length];
    const minDim = Math.min(rows, cols);

    let noPivotOnColumn = false;
    let testRow: number;
    let pivot: math.MathNode;
    let mCopy: math.MathNode[][];

    for (let i = 0; i < minDim; i++) {
      pivot = m[i][i];

      if (isZero(pivot)) {
        testRow = i + 1;

        while (true) {
          // Se houver uma coluna sem pivot em uma matriz escalonada reduzida, o determinante dela é nulo:
          if (testRow === rows) {
            noPivotOnColumn = true;
            break;
          }

          if (!isZero(m[testRow][i])) break;

          testRow++;
        }

        if (!noPivotOnColumn) [m[i], m[testRow]] = [m[testRow], m[i]];
      }

      if (!noPivotOnColumn) {
        mCopy = MatrixOperations.clone(m);

        for (let row = 0; row < rows; row++)
          for (let col = 0; col < cols; col++)
            if (row !== i) applyBareissFormula(m, mCopy, row, col, i);

        m = mCopy;

        MatrixOperations.simplify(m);
      }
    }

    [m1, m2] = MatrixOperations.separateMatrixRows(
      MatrixOperations.transformMatrixToReducedRowEchelonForm(
        MatrixOperations.simplify(m)
      ),
      cols1
    );

    return {
      matrixA: m1,
      matrixB: m2,
    };
  }

  static findSolutionForMatrixEquation(
    m1: math.MathNode[][],
    m2: math.MathNode[][],
    vertElim: boolean = false
  ) {
    if (vertElim) [m1, m2] = [m1, m2].map(MatrixOperations.transpose);

    const [cols1, cols2] = [m1[0].length, m2[0].length];

    let {
      matrixA: eliminatedMatrixA,
      matrixB: eliminatedMatrixB,
    } = MatrixOperations.bareissAlgorithm(m1, m2);

    const resizedEliminatedMatrixB = MatrixOperations.resizeMatrixAfterPartialElimination(
      cols1,
      cols2,
      new MatrixData(eliminatedMatrixB)
    ).data;

    const multiplication = MatrixOperations.multiply(
      m1,
      resizedEliminatedMatrixB
    );

    MatrixOperations.simplify(m2);
    MatrixOperations.simplify(eliminatedMatrixB);
    MatrixOperations.simplify(multiplication);

    let systemSolutionsType = MatrixOperations.systemSolutionTypesVerification(
      m2,
      eliminatedMatrixA[0].length,
      eliminatedMatrixB,
      multiplication
    );

    let solution: math.MathNode[][] | undefined = undefined;
    let lettersUsed: Array<string> | undefined = undefined;

    if (systemSolutionsType === SystemSolutionType.SPDOrSPI) {
      // Método de transformar A(mxo) * X(oxn) = B(mxn)
      // em A((m*n)x(o*n)) * X((o*n)x1) = B((m*n)x1):
      const vectorEquation = MatrixOperations.transformEquationToVectorForm(
        eliminatedMatrixA,
        resizedEliminatedMatrixB,
        eliminatedMatrixB
      );

      MatrixOperations.simplify(vectorEquation.matrixA);

      // Sendo matrixX um vetor, achar vetor com variáveis independentes:
      // Aqui é feita a separação entre SPD e SPI:
      const generalVectorData = MatrixOperations.findGeneralVectorForSPDOrSPIEquation(
        vectorEquation
      );

      systemSolutionsType = generalVectorData.solutionType;

      generalVectorData.lettersUsed.length > 0 &&
        (lettersUsed = generalVectorData.lettersUsed);

      const devectorizedMatrixX = MatrixOperations.devectorizeVector(
        generalVectorData.vectorizedX,
        resizedEliminatedMatrixB[0].length
      );

      solution = MatrixOperations.simplify(devectorizedMatrixX);
    }

    if (vertElim) {
      solution && (solution = MatrixOperations.transpose(solution));
      eliminatedMatrixA = MatrixOperations.transpose(eliminatedMatrixA);
    }

    MatrixOperations.simplify(eliminatedMatrixA);
    MatrixOperations.simplify(eliminatedMatrixB);

    return {
      eliminatedMatrixA,
      eliminatedMatrixB,
      solution,
      systemSolutionsType,
      lettersUsed,
    } as FindSolutionMatrixEquationData;
  }

  static transformEquationToVectorForm(
    mA: math.MathNode[][],
    mX: math.MathNode[][],
    mB: math.MathNode[][]
  ) {
    const [rowsA, colsA] = [mA.length, mA[0].length];
    const colsX = mX[0].length;

    const [rowsNewA, colsNewA] = [rowsA * colsX, colsA * colsX];

    const newMatrixAData = MatrixOperations.empty(rowsNewA, colsNewA);

    const vectorizedX = MatrixOperations.vectorizeMatrix(mX);
    const vectorizedB = MatrixOperations.vectorizeMatrix(mB);

    let rowA: number;
    let colX: number;
    let rowX: number;
    let columnA: number;

    for (let newRowA = 0; newRowA < rowsNewA; newRowA++) {
      rowA = Math.floor(newRowA / colsX);
      colX = newRowA % colsX;

      for (
        let vectorXIndex = 0;
        vectorXIndex < vectorizedX.length;
        vectorXIndex++
      ) {
        if (vectorXIndex % colsX === colX) {
          rowX = Math.floor(vectorXIndex / colsX);
          columnA = rowX;
          newMatrixAData[newRowA][vectorXIndex] = mA[rowA][columnA];
        }
      }
    }

    return {
      matrixA: newMatrixAData,
      vectorizedX,
      vectorizedB,
    };
  }

  static devectorizeVector(v: math.MathNode[], cols: number) {
    let lastElement: math.MathNode[];
    const m = v.reduce((dataAccumulator, element) => {
      lastElement = dataAccumulator.pop() as math.MathNode[];
      return !lastElement
        ? [[element]]
        : lastElement.length < cols
        ? [...dataAccumulator, [...lastElement, element]]
        : [...dataAccumulator, lastElement, [element]];
    }, [] as math.MathNode[][]);
    return m;
  }

  static vectorizeMatrix(matrix: math.MathNode[][]) {
    const vector = matrix.reduce(
      (acc, elementRow) => [...acc, ...elementRow],
      [] as math.MathNode[]
    );
    return vector;
  }

  static findGeneralVectorForSPDOrSPIEquation(
    vectorEquation: TransformEquationToVectorFormData
  ) {
    const { matrixA, vectorizedX } = vectorEquation;

    let lettersUsed: string[] = [];
    let solutionType = SystemSolutionType.SPD;
    let foundIndependentVariable;
    let variable: string;

    const getLetter = () => `n_${lettersUsed.length + 1}`;

    const [rows, cols] = [matrixA.length, matrixA[0].length];
    const minDim = Math.min(rows, cols);

    // Definição das variáveis independentes:
    for (let pivotIndex = 0; pivotIndex < vectorizedX.length; pivotIndex++) {
      foundIndependentVariable =
        pivotIndex >= minDim || isZero(matrixA[pivotIndex][pivotIndex]);

      if (foundIndependentVariable) {
        solutionType = SystemSolutionType.SPI;
        variable = getLetter();
        lettersUsed.push(variable);
        vectorizedX[pivotIndex] = math.parse(variable);
      }
    }

    const initialIndex = Math.min(vectorizedX.length, rows) - 1;

    // Definição das variáveis dependentes:
    // Começa no último elemento antes da variável independente:
    for (let rowIndex = initialIndex; rowIndex >= 0; rowIndex--)
      for (let columnIndex = cols - 1; columnIndex > rowIndex; columnIndex--)
        vectorizedX[rowIndex] = subtract(
          vectorizedX[rowIndex],
          multiply(matrixA[rowIndex][columnIndex], vectorizedX[columnIndex])
        );

    return {
      vectorizedX,
      solutionType,
      lettersUsed,
    };
  }

  static systemSolutionTypesVerification(
    mB: math.MathNode[][],
    colsElimA: number,
    elimMB: math.MathNode[][],
    mult: math.MathNode[][]
  ) {
    const [rowsElimB, colsElimB] = [elimMB.length, elimMB[0].length];
    const [rowsB, colsB] = [mB.length, mB[0].length];

    /* Se, na expressão, houver uma igualdade de um número nulo com 
        um não nulo fora das dimensoes da matrix final, ela é um SI: */
    for (let row = colsElimA; row < rowsElimB; row++)
      for (let col = 0; col < colsElimB; col++)
        if (!isZero(elimMB[row][col])) return SystemSolutionType.SI;

    let isSPIorSI = false;
    for (let row = 0; row < rowsB; row++) {
      for (let col = 0; col < colsB; col++) {
        if (!mB[row][col].equals(mult[row][col])) {
          if (!hasVariables(mB[row][col]) && !hasVariables(mult[row][col]))
            return SystemSolutionType.SI;

          isSPIorSI = true;
        }
      }
    }

    return isSPIorSI ? SystemSolutionType.SPIOrSI : SystemSolutionType.SPDOrSPI;
  }

  static resizeMatrixAfterPartialElimination(
    mACols: number,
    mBCols: number,
    mX: MatrixData
  ) {
    return MatrixOperations.resizeMatrix({
      originalMatrix: MatrixOperations.emptyMatrix(mX.dimensions()),
      editableMatrix: mX,
      rows: mACols,
      columns: mBCols,
    });
  }
}

export default MatrixOperations;
