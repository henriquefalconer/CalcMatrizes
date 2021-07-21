import ElementDataWithPosition from './ElementDataWithPosition';
import MatrixColumnData from './MatrixColumnData';

interface MatrixColumnWithPosition {
  data: Array<ElementDataWithPosition>;
  column: number;
}

export default MatrixColumnWithPosition;
