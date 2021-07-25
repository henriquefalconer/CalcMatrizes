import * as math from 'mathjs';
import { OperatorNode } from 'mathjs';
import { Operator } from './constants';
import {
  superscript,
  stringifySymbol,
  unicodeDiagonalFraction,
} from './string';

interface Options {
  parenthesis?: 'keep' | 'auto' | 'all';
  handler?(node: math.MathNode, options: Options): string | void;
  implicit?: 'hide' | 'show';
}

export const isConstant = (
  node: math.MathNode | null | undefined,
  strict = false
) =>
  (strict
    ? node?.isConstantNode
    : node && ['SymbolNode', 'ConstantNode'].includes(node.type)) ||
  (node?.isOperatorNode &&
    node.fn === 'unaryMinus' &&
    node.args &&
    ['SymbolNode', 'ConstantNode'].includes(node.args[0].type));

export const condPrth = (
  node: math.MathNode,
  str: string,
  ops: string,
  constArgOps = ''
) =>
  node.isOperatorNode &&
  node.args?.length === 2 &&
  node.op &&
  (constArgOps.indexOf(node.op) === -1
    ? ops.indexOf(node.op) !== -1
    : !node.args?.every((a) => isConstant(a, true)))
    ? `(${str})`
    : str;

export const isZero = (node: math.MathNode | null | undefined) =>
  node && isConstant(node, true) && node.value === 0;

export const isOne = (node: math.MathNode) =>
  isConstant(node, true) && node.value === 1;

const commentStringify = (node: math.MathNode | null) => {
  const handler = (node: math.MathNode) => {
    if (node.comment) return node.comment;
  };
  return node?.toString({ handler }) ?? '';
};

export const splitNumsAndVars = (
  node: math.MathNode | null,
  stringifiedNode?: string
): [nums: string, vars: math.MathNode | null] => {
  const str = stringifiedNode ?? commentStringify(node);
  if (!str.match(/^[\d#]/)) return ['', node];
  const sep = str.indexOf('*');
  if (sep === -1) return [str, null];
  const [nums, vars] = [str.substring(0, sep - 1), str.substring(sep + 2)];
  return [nums, math.parse(vars)];
};

const options: Options = {
  parenthesis: 'auto',
  handler: (node, options) => {
    if (node.comment) return node.comment.substring(1).replace('.', ',');

    if (isConstant(node, true))
      return `${
        node.fn === 'unaryMinus'
          ? '-' + (node.args?.[0].value ?? node.args?.[0].name)
          : node.value
      }`.replace('.', ',');

    if (node.isSymbolNode) return stringifySymbol(node.name);

    if (!node.args || node.args.length > 2) return;

    const [arg1, arg2] = node.args.map((arg) => arg.toString(options));

    switch (node.fn) {
      case 'divide':
        if (node.args.every((a) => isConstant(a, true)))
          return unicodeDiagonalFraction(arg1, arg2);
        return (
          condPrth(node.args[0], arg1, '+-/') +
          '/' +
          condPrth(node.args[1], arg2, '+-/*')
        );
      case 'multiply':
        const [arg1Prth, arg2Prth] = [arg1, arg2].map((a, i) =>
          condPrth(node.args[i], a, '+-/', '/')
        );
        return (
          arg1Prth +
          (arg1.match(/^[\d-×]*$/) && arg2Prth.startsWith('(') ? '×' : '') +
          arg2Prth
        );
      case 'pow':
        return condPrth(node.args[0], arg1, '+-/') + superscript(arg2);
      case 'unaryMinus':
        return '-' + condPrth(node.args[0], arg1, '+-');
    }
  },
  implicit: 'hide',
};

export const stringify = (node: math.MathNode) => node.toString(options);

const rules = [
  // Distributivas:
  'n*(n1+n2) -> (n*n1+n*n2)',
  'n*(n1-n2) -> (n*n1-n*n2)',
  '-n*(n1+n2) -> -(n*n1+n*n2)',
  '-n*(n1-n2) -> -(n*n1-n*n2)',
  // Outras:
  'n1/n2*n3 -> n1*n3/n2',
  '(n1/n2)^c -> n1^c/n2^c',
  ...math.simplify.rules,
  '-(n) -> (-n)',
  'n1+-(n2) -> n1-n2',
  'n1+-n2 -> n1-n2',
  'v/c -> 1/c*v',
  'v*c1/c2 -> c1/c2*v',
  'v*-c1/c2 -> -c1/c2*v',
  'v*c -> c*v',
  'v*-c -> -c*v',
  'c1*(1/c2) -> c1/c2',
  '-c1*(1/c2) -> -c1/c2',
  'v1/v2*v3 -> v1*v3/v2',
];

const postInversionRules = [
  // Junção de numeradores para a inversão:
  'n1/n+n3/n -> (n1+n3)/n',
  'n1/n-n3/n -> (n1-n3)/n',
  '-(n1/n)+n3/n -> (-n1+n3)/n',
  '-(n1/n)-n3/n -> (-n1-n3)/n',
  'n1*n2/n+n3*n4/n -> (n1*n2+n3*n4)/n',
  'n1*n2/n+n3/n -> (n1*n2+n3)/n',
  '-(n1*n2/n)+n3*n4/n -> (-n1*n2+n3*n4)/n',
  '-(n1*n2/n)+n3/n -> (-n1*n2+n3)/n',
  'n1*n2/n-n3*n4/n -> (n1*n2-n3*n4)/n',
  'n1*n2/n-n3/n -> (n1*n2-n3)/n',
  '-(n1*n2/n)-n3*n4/n -> (-n1*n2-n3*n4)/n',
  '-(n1*n2/n)-n3/n -> (-n1*n2-n3)/n',
  // Regras básicas
  ...math.simplify.rules,
  '-(n) -> (-n)',
  'n1+-(n2) -> n1-n2',
  'n1+-n2 -> n1-n2',
];

const simpleInversionRules = ['1/(1/n) -> n', '1/(-1/n) -> -n'];

export const simplify = (node: math.MathNode) => math.simplify(node, rules);
export const simplifyInversion = (node: math.MathNode) =>
  math.simplify(node, postInversionRules);

const buildOperation = (symbol: string, symbolName: string) => (
  ...elems: math.MathNode[]
) => new OperatorNode(symbol, symbolName, elems) as math.MathNode;

export const add = buildOperation('+', 'add');
export const subtract = buildOperation('-', 'subtract');
export const multiply = buildOperation('*', 'multiply');
export const divide = buildOperation('/', 'divide');

export const genericOperation = (
  operator: Operator,
  ...elems: math.MathNode[]
) => {
  switch (operator) {
    case Operator.Add:
      return add(...elems);
    case Operator.Subtract:
      return subtract(...elems);
    case Operator.Multiply:
      return multiply(...elems);
    case Operator.Divide:
      return divide(...elems);
  }
  throw 'Error: Invalid Operator';
};

export const zero = math.parse('0');
export const plusOne = math.parse('1');
export const minusOne = math.parse('-1');

export const condNeg = (node: math.MathNode, neg: boolean) =>
  neg ? multiply(minusOne, node) : node;

export const parseComma = (node: math.MathNode) => {
  const str = commentStringify(node);
  if (!str.match(/#/)) return node;
  const [nums, vars] = splitNumsAndVars(node, str);
  const newNums = math.simplify(
    math.parse(nums.substring(1).replace(/\.$/, ''))
  );
  return vars ? multiply(newNums, vars) : newNums;
};

export const invert = (node: math.MathNode) =>
  math.simplify(divide(plusOne, node), simpleInversionRules);

export const hasVariables = (e: any) => !!e.toString().match(/[a-i]/);
