import {CalcState, SystemSolutionType} from '../utilities/constants';
import {ExpressionData} from '../utilities/ExpressionClasses';
import MatrixData from '../utilities/MatrixData';

interface FullEquationData {
  equationType: CalcState;
  solutionType?: SystemSolutionType;
  matrixA?: MatrixData;
  matrixB?: MatrixData;
  matrixC?: MatrixData;
  matrixD?: MatrixData;
  matrixE?: MatrixData;
  scalar?: ElementData | ExpressionData;
  lettersUsed?: Array<string>;
}

export default FullEquationData;
