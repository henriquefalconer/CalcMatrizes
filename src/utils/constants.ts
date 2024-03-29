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
  invert = 'invert',
}

export enum Operator {
  Add = 'Add',
  Subtract = 'Subtract',
  Multiply = 'Multiply',
  Divide = 'Divide',
  Elevate = 'Elevate',
  None = 'None',
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
  Check = 'Check',
}

export enum SystemSolutionType {
  SPI = 'SPI',
  SPD = 'SPD',
  SI = 'SI',
  SPDOrSPI = 'SPD ou SPI',
  SPIOrSI = 'SPI ou SI',
}
