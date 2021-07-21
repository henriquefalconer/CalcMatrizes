import {ElementData, ExpressionData} from '../utilities/ExpressionClasses';

interface ElementDataWithPosition {
  number: ElementData | ExpressionData;
  row: number;
  column: number;
}

export default ElementDataWithPosition;
