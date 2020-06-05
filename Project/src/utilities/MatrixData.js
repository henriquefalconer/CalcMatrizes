import MatrixOperations from "./MatrixOperations";

export default class MatrixData {

    constructor({ data }) {
        this.data = MatrixOperations.applyFrescuresToMatrixData(data);
    }

    dimensions() {
        return {
            rows: this.data.length,
            columns: this.data[0] && this.data[0].length,
        };
    }

    hasPosition({ row, column }) {
        return row < this.dimensions().rows && column < this.dimensions().columns;
    } 
}