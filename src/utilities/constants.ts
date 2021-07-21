import { VariableData } from "./ExpressionClasses";
import ScalarOperations from "./ScalarOperations";

export enum CalcState {
    ready = 'ready',
    editing = 'editing',
    addMatrix = 'addMatrix',
    subtractMatrix = 'subtractMatrix',
    AxB = 'AxB',
    BxA = 'BxA',
    LambdaxA = 'LambdaxA',
    AxXeB = 'AxXeB',
    BxXeA = 'BxXeA',
    XxAeB = 'XxAeB',
    XxBeA = 'XxBeA',
    gaussianElimination = 'gaussianElimination',
    transpose = 'transpose',
    invert = 'invert'
}

export enum Operator {
    Add = 'Add',
    Subtract = 'Subtract',
    Multiply = 'Multiply',
    Divide = 'Divide',
    Elevate = 'Elevate',
    None = 'None'
}

export enum ButtonType {
    One = 1,
    Two = 2,
    Three = 3,
    Four = 4,
    Five = 5,
    Six = 6,
    Seven = 7,
    Eight = 8,
    Nine = 9,
    Zero = 0,
    abc = 'abc',
    a = 'a',
    b = 'b',
    c = 'c',
    d = 'd',
    e = 'e',
    f = 'f',
    g = 'g',
    h = 'h',
    i = 'i',
    Comma = 'Comma',
    AC = 'AC',
    CE = 'CE',
    Operators = 'Operators',
    Save = 'Save',
    SavedList = 'SavedList',
    Second = 'Second',
    ColumnDirection = 'ColumnDirection',
    R = 'R',
    AxXeB = 'AxXeB',
    BxXeA = 'BxXeA',
    XxAeB = 'XxAeB',
    XxBeA = 'XxBeA',
    GaussianElimination = 'GaussianElimination',
    LambdaxA = 'LambdaxA',
    AxB = 'AxB',
    BxA = 'BxA',
    Inverse = 'Inverse',
    Transposed = 'Transposed',
    Subtract = 'Subtract',
    Add = 'Add',
    SubtractMatrix = 'SubtractMatrix',
    AddMatrix = 'AddMatrix',
    Multiply = 'Multiply',
    Divide = 'Divide',
    Enter = 'Enter',
    Check = 'Check'
}

export function count(string: number | string, substring: RegExp | string, caseSensitive: boolean) {
    // Se caseSensitive for indefinido, ele é considerada falsa:
    return ((caseSensitive ? string.toString() : string.toString().toLowerCase()).match(new RegExp((caseSensitive || substring instanceof RegExp ? substring : substring.toLowerCase()), "g")) || []).length;
};

export function decimalPlaces(number: number | string) {
    return (number.toString().split(".").pop() as string).length;
}

export function removeScientificNotation(x: number): string {
    if (Math.abs(x) < 1e-6) {
        var e = parseInt(x.toString().split('e-')[1]);
        if (e) {
            x *= Math.pow(10, e - 1);
            x = '0.' + (new Array(e)).join('0') + x.toString().split(/\./)[1];
        }
    } else {
        var e = parseInt(x.toString().split('+')[1]);
        if (e > 20) {
            e -= 20;
            x /= Math.pow(10, e);
            x += (new Array(e + 1)).join('0');
        }
    }
    return x.toString();
}

const PRECISION = 6;

export function smartToFixed(element: number) {

    if (!element.toString().match(/\./)) return element;

    // A precisao define quantos zeros ou noves seguidos apos a virgula a funcao deveria aceitar para que ela arredende o numero:
    function lastDigitIndex(string: string) {
        let index = 0;
        let repetitions = 0;
        for (let i = 0; i < string.length - 1; i++) {
            const substring = string.substring(i + 1, i + 2);
            const lastSubstring = string.substring(i, i + 1);
            if (substring !== lastSubstring || !substring.match(/0|9/)) {
                repetitions = 0;
                index = i + 1;
            }
            else repetitions += 1;
            if (repetitions === PRECISION) return index;
        }
        return null;
    }

    if (Math.abs(element) < 1e-6)
        return 0;

    const digits = removeScientificNotation(element).split(".").pop() as string;

    // console.log({element: removeScientificNotation(element), lastDig: lastDigitIndex(digits)});
    if (lastDigitIndex(digits) !== null) {
        return Number.parseFloat(element.toFixed(lastDigitIndex(digits) as number));
    }
    else
        return element;
}

export function findFraction(number: number): [numerator: number, denominator: number] {
    const MAX_DENOMINATOR = 10000;

    for (let denominator = 1; denominator < MAX_DENOMINATOR; denominator++) {
        let numerator = smartToFixed(number * denominator);
        if (count(numerator.toString(), /\./, true) === 0 || numerator.toString().endsWith('.0')) {
            if (denominator === 1) return [number, 1];
            if (numerator.toString().endsWith('.0')) numerator = Number(numerator.toString().split('.')[0]);
            return [numerator, denominator];
        }
    }

    return [number, 1];
}

export function unicodeDiagonalFraction(numerator: number, denominator: number) {
    if (denominator === 1) return numerator.toString();
    return `${ScalarOperations.superscript(numerator)}\u2044${ScalarOperations.subscript(denominator)} `;
}

export function normalStringFraction(numerator: number, denominator: number) {
    if (denominator === 1) return numerator.toString();
    return numerator + '/' + denominator;
}

export function latexFraction(numerator: number, denominator: number) {
    if (denominator === 1) return numerator.toString();
    return `\\frac{${numerator}}{${denominator}}`;
}

export function latexVariables(variables: VariableData[]) {
    const formatExponent =
        (exponent: number) => exponent === 1
            ? ''
            : '^{' + latexFraction(...findFraction(exponent)) + '}'
    const formatVariables =
        () => variables.map(
            (vari: VariableData) => `${vari.variable}${formatExponent(vari.exponent)}`
        )
    return formatVariables().join('');
}


export function toFixedOnZeroes(number: string | number) {
    if (number === number.toString() && number.startsWith('0.')) return number.toString();
    let string = number.toString();
    if (string.endsWith('.')) return string;
    if (count(string, /\./, true) === 0) return number;
    while (string.endsWith('0')) string = string.substring(0, string.length - 1);
    if (string.endsWith('.')) string = string.substring(0, string.length - 1);
    return Number.parseFloat(string);
}

export enum SystemSolutionType {
    SPI = 'SPI',
    SPD = 'SPD',
    SI = 'SI',
    SPDOrSPI = 'SPD ou SPI',
    SPIOrSI = 'SPI ou SI'
};

export function toFixedWithThreeDots(number: string | number) {
    if (number.toString().endsWith('.')) return number.toString();
    number = toFixedOnZeroes(number);
    if (decimalPlaces(number) > PRECISION
        && count(number.toString(), /\./, true) !== 0
    ) return Number.parseFloat(number.toString()).toFixed(PRECISION) + '...';
    return number;
}

export function parenthesisEnglobe(string: string) {

    // console.log({string})
    if (!string.startsWith('(') || !string.endsWith(')'))
        return false;

    let openParenthesis = 0

    for (let index = 0; index < string.length; index++) {
        if (string.substring(index, index + 1) === '(')
            openParenthesis++;
        else if (string.substring(index, index + 1) === ')')
            openParenthesis--;
        if (openParenthesis === 0 && index < string.length - 1)
            return false;
    }

    return true;
}

export const repeatedChar = (char: string, repeat: number) => new Array(repeat + 1).join(char);

export const indentText = (lines: Array<string>, indent: number) => (
    repeatedChar(' ', indent) + lines.join('\n' + repeatedChar(' ', indent))
);

export const indentExpression = (start: string, middle: Array<string>, end: string, indent: number, delta: number) => (
    repeatedChar(' ', delta) + start + '\n' + indentText([
        ...middle,
        end
    ], indent)
);