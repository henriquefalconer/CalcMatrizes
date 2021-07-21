import FullEquationData from '../interfaces/FullEquationData';
import {CalcState, SystemSolutionType} from './constants';
import MatrixData from './MatrixData';

interface EquationDataParams {
  fullEquation: FullEquationData;
  viewReduced?: boolean;
}

class EquationData {
  firstOperator: string | undefined;
  variablePosition: number | undefined;
  secondOperator: string | undefined;
  matrix1: MatrixData | undefined;
  matrix2: MatrixData | undefined;
  matrix3: MatrixData | undefined;
  scalar: string | undefined;
  singleMatrixOperator: string | undefined;

  constructor({fullEquation, viewReduced = false}: EquationDataParams) {
    switch (fullEquation.equationType) {
      case CalcState.AxXeB:
        this.firstOperator = '×';

        this.secondOperator = '=';

        this.variablePosition = 2;

        this.matrix2 = fullEquation.matrixC;

        if (viewReduced) {
          this.matrix1 = fullEquation.matrixD;

          this.matrix3 = fullEquation.matrixE;
        } else {
          this.matrix1 = fullEquation.matrixA;

          this.matrix3 = fullEquation.matrixB;
        }

        break;
      case CalcState.BxXeA:
        this.firstOperator = '×';

        this.secondOperator = '=';

        this.variablePosition = 2;

        this.matrix2 = fullEquation.matrixC;

        if (viewReduced) {
          this.matrix1 = fullEquation.matrixD;

          this.matrix3 = fullEquation.matrixE;
        } else {
          this.matrix1 = fullEquation.matrixB;

          this.matrix3 = fullEquation.matrixA;
        }

        break;
      case CalcState.XxAeB:
        this.firstOperator = '×';

        this.secondOperator = '=';

        this.variablePosition = 1;

        this.matrix1 = fullEquation.matrixC;

        if (viewReduced) {
          this.matrix2 = fullEquation.matrixD;

          this.matrix3 = fullEquation.matrixE;
        } else {
          this.matrix2 = fullEquation.matrixA;

          this.matrix3 = fullEquation.matrixB;
        }

        break;
      case CalcState.XxBeA:
        this.firstOperator = '×';

        this.secondOperator = '=';

        this.variablePosition = 1;

        this.matrix1 = fullEquation.matrixC;

        if (viewReduced) {
          this.matrix2 = fullEquation.matrixD;

          this.matrix3 = fullEquation.matrixE;
        } else {
          this.matrix2 = fullEquation.matrixB;

          this.matrix3 = fullEquation.matrixA;
        }

        break;
      case CalcState.gaussianElimination:
        this.firstOperator = 'GE(';

        this.matrix2 = fullEquation.matrixA;

        this.secondOperator = ') =';

        this.matrix3 = viewReduced
          ? fullEquation.matrixD
          : fullEquation.matrixC;

        break;
      case CalcState.addMatrix:
        this.matrix1 = fullEquation.matrixA;

        this.firstOperator = '+';

        this.matrix2 = fullEquation.matrixB;

        this.secondOperator = '=';

        this.matrix3 = fullEquation.matrixC;

        break;
      case CalcState.subtractMatrix:
        this.matrix1 = fullEquation.matrixA;

        this.firstOperator = '-';

        this.matrix2 = fullEquation.matrixB;

        this.secondOperator = '=';

        this.matrix3 = fullEquation.matrixC;

        break;
      case CalcState.AxB:
        this.matrix1 = fullEquation.matrixA;

        this.firstOperator = '×';

        this.matrix2 = fullEquation.matrixB;

        this.secondOperator = '=';

        this.matrix3 = fullEquation.matrixC;

        break;
      case CalcState.BxA:
        this.matrix1 = fullEquation.matrixA;

        this.firstOperator = '×';

        this.matrix2 = fullEquation.matrixB;

        this.secondOperator = '=';

        this.matrix3 = fullEquation.matrixC;

        break;
      case CalcState.LambdaxA:
        this.scalar = fullEquation.scalar?.commaStringify();

        this.firstOperator = '×';

        this.matrix2 = fullEquation.matrixB;

        this.secondOperator = '=';

        this.matrix3 = fullEquation.matrixC;

        break;
      case CalcState.transpose:
        this.matrix1 = fullEquation.matrixA;

        this.singleMatrixOperator = 'T';

        this.firstOperator = '=';

        this.matrix2 = fullEquation.matrixB;

        break;
      case CalcState.invert:
        this.matrix1 = fullEquation.matrixA;

        this.singleMatrixOperator = '-1';

        this.firstOperator = '=';

        this.matrix2 = fullEquation.matrixB;

        break;
      default:
        break;
    }
  }

  getQuantityOfMatrices() {
    return (
      (this.matrix1 !== undefined ? 1 : 0) +
      (this.matrix2 !== undefined ? 1 : 0) +
      (this.matrix3 !== undefined ? 1 : 0)
    );
  }

  getQuantityOfOperators() {
    return (
      (this.firstOperator !== undefined ? 1 : 0) +
      (this.secondOperator !== undefined ? 1 : 0) +
      (this.singleMatrixOperator !== undefined ? 1 : 0) +
      (this.scalar !== undefined ? 1 : 0)
    );
  }

  hasXOperator(): boolean {
    return this.variablePosition !== undefined;
  }

  getVariableDimensions() {
    if (this.variablePosition === 1) {
      return `${this.matrix3?.dimensions().rows}x${
        this.matrix2?.dimensions().rows
      }`;
    } else {
      return `${this.matrix1?.dimensions().columns}x${
        this.matrix3?.dimensions().columns
      }`;
    }
  }
}

export default EquationData;
