import MatrixDimensions from '../interfaces/MatrixDimensions';
import SelectedMatrixElement from '../interfaces/SelectedMatrixElement';

import * as math from 'mathjs';

class MatrixData {
  data: math.MathNode[][];

  constructor(data: (math.MathNode | number)[][]) {
    this.data = data.map((row) =>
      row.map((e) => (e instanceof Object ? e : math.parse(`${e}`)))
    );
  }

  dimensions(): MatrixDimensions {
    return {
      rows: this.data.length,
      columns: this.data[0].length,
    };
  }

  hasPosition({ row, column }: SelectedMatrixElement) {
    return row < this.dimensions().rows && column < this.dimensions().columns;
  }
}

export default MatrixData;
