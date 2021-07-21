import MatrixColumnData from '../interfaces/MatrixColumnData';
import MatrixDimensions from '../interfaces/MatrixDimensions';
import SelectedMatrixElement from '../interfaces/SelectedMatrixElement';
import {ExpressionData} from './ExpressionClasses';
import MatrixOperations from './MatrixOperations';

class MatrixData {
  data: Array<MatrixColumnData>;

  constructor(data: Array<Array<ExpressionData | number>>) {
    this.data = MatrixOperations.applyFrescuresToMatrixData(data);
  }

  dimensions(): MatrixDimensions {
    return {
      rows: this.data.length,
      columns: this.data[0] && this.data[0].length,
    };
  }

  hasPosition({row, column}: SelectedMatrixElement) {
    return row < this.dimensions().rows && column < this.dimensions().columns;
  }
}

export default MatrixData;
