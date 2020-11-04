import { Operator, count } from "./constants";

class ScalarOperations {

    static isNumber(element: string) {
        const letters = /[a-i]/;
        if (count(element, letters, true) > 0) return false;
        return !Number.isNaN(element) 
            && count(element.toString(), '\\(', true) === 0
            && count(element.toString(), '\\)', true) === 0;
    }

    static superscript(number: number | string) {
        const string = number.toString();
        let newNumber = '';
        for (let index = 0; index < string.length; index++) {
            switch (string[index]) {
                case '0':
                    newNumber += '\u2070';
                    break;
                case '1':
                    newNumber +=  '\u00B9';
                    break;
                case '2':
                    newNumber += '\u00B2';
                    break;
                case '3':
                    newNumber += '\u00B3';
                    break;
                case '4':
                    newNumber += '\u2074';
                    break;
                case '5':
                    newNumber += '\u2075';
                    break;
                case '6':
                    newNumber += '\u2076';
                    break;
                case '7':
                    newNumber += '\u2077';
                    break;
                case '8':
                    newNumber += '\u2078';
                    break;
                case '9':
                    newNumber += '\u2079';
                    break;
                case '-':
                    newNumber += '\u207B';
                    break;
                case '+':
                    newNumber += '\u207A';
                    break;
                case '/':
                    newNumber += '\u141F';
                    break;
                case '(':
                    newNumber += '\u207D';
                    break;
                case ')':
                    newNumber += '\u207E';
                    break;
                default:
                    newNumber += string[index];
                    break;
            }
        }
        return newNumber;
    }

    static subscript(number: number | string) {
        const string = number.toString();
        let newNumber = '';
        for (let index = 0; index < string.length; index++) {
            switch (string[index]) {
                case '0':
                    newNumber += '\u2080';
                    break;
                case '1':
                    newNumber +=  '\u2081';
                    break;
                case '2':
                    newNumber += '\u2082';
                    break;
                case '3':
                    newNumber += '\u2083';
                    break;
                case '4':
                    newNumber += '\u2084';
                    break;
                case '5':
                    newNumber += '\u2085';
                    break;
                case '6':
                    newNumber += '\u2086';
                    break;
                case '7':
                    newNumber += '\u2087';
                    break;
                case '8':
                    newNumber += '\u2088';
                    break;
                case '9':
                    newNumber += '\u2089';
                    break;
                case '-':
                    newNumber += '\u208B';
                    break;
                case '+':
                    newNumber += '\u208A';
                    break;
                case '/':
                    newNumber += '\u141F';
                    break;
                case '(':
                    newNumber += '\u208D';
                    break;
                case ')':
                    newNumber += '\u208E';
                    break;
                default:
                    newNumber += string[index];
                    break;
            }
        }
        return newNumber;
    }

}

export default ScalarOperations;