import { CalcState, SystemSolutionType } from "../utilities/constants";
import MatrixData from "../utilities/MatrixData";
import * as math from "mathjs";

interface FullEquationData {
  equationType: CalcState;
  solutionType?: SystemSolutionType;
  matrixA?: MatrixData;
  matrixB?: MatrixData;
  matrixC?: MatrixData;
  matrixD?: MatrixData;
  matrixE?: MatrixData;
  scalar?: math.MathNode;
  lettersUsed?: string[];
}

export default FullEquationData;
