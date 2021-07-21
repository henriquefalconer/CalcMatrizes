import {findFraction, Operator} from './constants';
import {
  createMatrixElement,
  ElementData,
  ElementDataParams,
  ExpressionData,
  VariableData,
} from './ExpressionClasses';

export function simplifyExpression(expression: ExpressionData) {
  return simplifyExpressionAlgorithm(expression);
  // return fixUnnecessaryScalars(simplifiedList);
}

export function isExpressionInstance(element: any) {
  return element instanceof ExpressionData;
}

export function varOperation(
  element1: ExpressionData,
  operator: Operator,
  element2: ExpressionData,
) {
  if (
    !(element1 instanceof ElementData) &&
    !(element1 instanceof ExpressionData)
  ) {
    console.log(
      'ERRO em varOperation: element1 não é um ElementData: ' + element1,
    );
  }

  if (
    !(element2 instanceof ElementData) &&
    !(element2 instanceof ExpressionData)
  ) {
    console.log(
      'ERRO em varOperation: element2 não é um ElementData: ' + element2,
    );
  }

  const expressionData = new ExpressionData({
    operator,
    elements: [element1, element2],
  });

  // console.log(JSON.stringify({expressionData}))

  const result = simplifyExpressionAlgorithm(expressionData);

  console.log({
    initial: expressionData.stringify(),
    RESULT: result.stringify(),
  });

  return result;
}

function raiseVariablesExponent(
  variables: Array<VariableData>,
  exponent: number,
) {
  let newVariables: Array<VariableData> = [];

  for (let variableData of variables) {
    newVariables.push(
      new VariableData({
        variable: variableData.variable,
        exponent: variableData.exponent * exponent,
      }),
    );
  }

  return newVariables;
}

function additionMatches(elements1: ExpressionData, elements2: ExpressionData) {
  return elements1.stringify() === elements2.stringify();
}

function normalizeAddition(addition: ExpressionData) {
  const firstExpression = addition.elements[0];

  const normalizationFactor = !firstExpression.oneElement
    ? 1
    : firstExpression.oneElement.scalar;

  const normalizedElements = addition.elements.map(elem =>
    !elem.oneElement
      ? new ExpressionData({
          operator: Operator.Multiply,
          elements: [
            createMatrixElement({
              scalar: 1 / normalizationFactor,
            }),
            elem,
          ],
        })
      : new ExpressionData({
          oneElement: new ElementData({
            scalar: elem.oneElement.scalar / normalizationFactor,
            variables: elem.oneElement.variables,
          }),
        }),
  );

  return {
    normalizedAddition: new ExpressionData({
      operator: Operator.Add,
      elements: normalizedElements,
    }),
    normalizationFactor,
  };
}

function getIndexOfMultipliableAddition(
  additionElements: Array<ExpressionData>,
  additionSearch: ExpressionData,
) {
  const normalizedSearchData = normalizeAddition(additionSearch);

  const normalizedElementsData = additionElements.map(elem =>
    normalizeAddition(elem),
  );

  const normalizedElementsAdditions = normalizedElementsData.map(
    e => e.normalizedAddition,
  );

  const index = getIndexOfNormalizedAddition(
    normalizedElementsAdditions,
    normalizedSearchData.normalizedAddition,
  );

  return {
    index,
    searchNormalizationFactor: normalizedSearchData.normalizationFactor,
    elementEliminationFactor:
      index !== -1 ? normalizedElementsData[index].normalizationFactor : null,
  };
}

function getIndexOfNormalizedAddition(
  additionElements: Array<ExpressionData>,
  additionSearch: ExpressionData,
) {
  for (let index = 0; index < additionElements.length; index++) {
    const addition = additionElements[index];

    if (addition.operator !== Operator.Add) {
      throw 'addition should have Add operator: ' + addition.operator;
    }

    if (additionMatches(addition, additionSearch)) {
      return index;
    }
  }

  return -1;
}

function variablesMatch(variables1: ElementData, variables2: ElementData) {
  return variables1.stringifyVariables() === variables2.stringifyVariables();
  // if (variables1.length !== variables2.length) return false;
  // else if (variables1.length === 0) return true;
  // for (let i = 0; i < variables1.length; i++) {
  //     let found = false
  //     for (let j = 0; j < variables2.length; j++) {
  //         if (
  //             variables1[i].variable === variables2[j].variable
  //             &&
  //             variables1[i].exponent === variables2[j].exponent
  //         ) found = true;
  //     }
  //     if (!found) return false;
  // }
  // return true;
}

function getIndexOfVariable(
  simplifiedElements: Array<ElementData>,
  variablesSearch: ElementData,
) {
  // console.log(JSON.stringify({variablesSearch: variablesSearch, simplifiedElements: simplifiedElements}));

  for (let index = 0; index < simplifiedElements.length; index++) {
    // console.log({aaa: simplifiedElements[index].variables, index})

    if (variablesMatch(simplifiedElements[index], variablesSearch)) {
      return index;
    }
  }

  return -1;
}

function distributiveMultiplication(
  distributives: Array<ExpressionData>,
): ExpressionData {
  while (distributives.length > 1) {
    let biDistribution = [];

    const distrib1 = distributives.shift() as ExpressionData;
    const distrib2 = distributives.shift() as ExpressionData;

    const distrib1List = !distrib1.oneElement
      ? distrib1.elements
      : [
          new ExpressionData({
            oneElement: distrib1.oneElement,
          }),
        ];

    const distrib2List = !distrib2.oneElement
      ? distrib2.elements
      : [
          new ExpressionData({
            oneElement: distrib2.oneElement,
          }),
        ];

    for (let distElement1 of distrib1List) {
      for (let distElement2 of distrib2List) {
        // console.log('ENTERING MULTIPLICATION SUB-LOOP')
        // console.log({distElement1: distElement1.stringify(), distElement2: distElement2.stringify()})
        biDistribution.push(
          doOperation(
            new ExpressionData({
              operator: Operator.Multiply,
              elements: [distElement1, distElement2],
            }),
          ),
        );
        // console.log('ENDED MULTIPLICATION SUB-LOOP')
        // console.log({biDistribution: biDistribution.map(a => a.stringify())})
      }
    }

    // console.log('ENTERING ADDITION SUB-LOOP')

    const result = doOperation(
      new ExpressionData({
        operator: Operator.Add,
        elements: biDistribution,
      }),
    );

    distributives = [result, ...distributives];

    // console.log('ENDED ADDITION SUB-LOOP')
    // console.log({distributives: distributives.map(a => a.stringify())})
  }

  return distributives[0];
}

function simpleMultiplication(multipliers: Array<ElementData>): ElementData {
  let scalar = 1;
  let variables: Array<VariableData> = [];

  for (let element of multipliers) {
    if (element.scalar === 0) {
      return new ElementData({
        scalar: 0,
      });
    }

    scalar *= element.scalar;

    variables = [...variables, ...element.variables];
  }

  return new ElementData({
    scalar,
    variables,
  });
}

function addNumbersWithSameVariables(adders: Array<ElementData>) {
  // console.log('start')

  let simplifiedElements: Array<ElementData> = [];

  for (let element of adders) {
    if (element.scalar !== 0) {
      const usedVariablesIndex = getIndexOfVariable(
        simplifiedElements,
        element,
      );

      // console.log({addIndex: usedVariablesIndex})

      if (usedVariablesIndex === -1) {
        simplifiedElements.push(element);
      } else {
        simplifiedElements[usedVariablesIndex] = new ElementData({
          scalar:
            Number.parseFloat(
              simplifiedElements[usedVariablesIndex].scalar.toString(),
            ) + Number.parseFloat(element.scalar.toString()),
          variables:
            simplifiedElements[usedVariablesIndex].isZero && element.isZero
              ? []
              : element.variables,
        });
      }
    }
  }
  // console.log('finish')

  return simplifiedElements;
}

function separateNumeratorsAndDenominators(elem: ExpressionData) {
  let numerator: ExpressionData | null = null;
  let denominators: Array<ExpressionData> = [];

  if (elem.operator !== Operator.Multiply) {
    return {
      numerator: elem,
      denominators: [] as Array<ExpressionData>,
    };
  }

  for (let e of elem.elements) {
    // console.log(JSON.stringify({e}))
    if (e.operator === Operator.Elevate) {
      const exponentElement = e.elements[1];

      if (!exponentElement.oneElement) {
        throw 'exponentElement should be oneElement';
      }

      if (exponentElement.oneElement.scalar < 0) {
        denominators.push(e);
      }
    } else {
      if (numerator !== null) {
        throw (
          'elem should be a multiplication of an expression and an elevation expression: ' +
          elem.stringify()
        );
      }

      numerator = e;
    }
  }

  if (!numerator) {
    numerator = createMatrixElement({scalar: 1});
  }

  return {
    numerator: numerator as ExpressionData,
    denominators,
  };
}

function denominatorsMatch(denominatorsList: ExpressionData[][]) {
  const [first, ...rest] = denominatorsList;

  // denominator1 e denominator2 são Elevations:
  for (const denominator1 of first) {
    const [base1, exponent1] = denominator1.elements;

    for (const second of rest) {
      let match = false;

      for (const denominator2 of second) {
        const [base2, exponent2] = denominator2.elements;

        if (!exponent1.oneElement || !exponent2.oneElement) {
          throw 'exponent1 and exponent2 should be oneElements';
        }

        if (
          additionMatches(base1, base2) &&
          exponent1.oneElement.scalar === exponent2.oneElement.scalar
        ) {
          match = true;
        }
      }

      if (!match) {
        return false;
      }
    }
  }

  return true;
}

enum CombinationMarkerTypes {
  Selected = 'Selected',
  Discarted = 'Discarted',
  Null = 'Null',
}

interface CombinationMarker {
  type: CombinationMarkerTypes;
}

function getAdditionsCombination(number: number) {
  function copyMarkers(markers: CombinationMarker[]) {
    return [...markers].map(marker => ({...marker}));
  }

  function recursiveAdditionsCombination(
    markersCombinations: CombinationMarker[][],
  ) {
    let newMarkersCombinations: CombinationMarker[][] = [];

    let noNullMarkers = true;

    for (const markers of markersCombinations) {
      let markersCopy = copyMarkers(markers);

      const nullMarker = markersCopy.find(
        marker => marker.type === CombinationMarkerTypes.Null,
      );

      if (nullMarker) {
        noNullMarkers = false;

        nullMarker.type = CombinationMarkerTypes.Selected;

        const selectedVariations = recursiveAdditionsCombination([
          copyMarkers(markersCopy),
        ]);

        nullMarker.type = CombinationMarkerTypes.Discarted;

        const discartedVariations = recursiveAdditionsCombination([
          copyMarkers(markersCopy),
        ]);

        newMarkersCombinations = [
          ...newMarkersCombinations,
          ...selectedVariations,
          ...discartedVariations,
        ];
      }
    }

    return noNullMarkers ? markersCombinations : newMarkersCombinations;
  }

  const initialMarkers = Array(number)
    .join()
    .split(',')
    .map(_ => ({type: CombinationMarkerTypes.Null} as CombinationMarker));

  const markersCombinations = recursiveAdditionsCombination([initialMarkers]);

  const allSelectedMarkersCombinations = markersCombinations.filter(
    m => m.filter(c => c.type === CombinationMarkerTypes.Selected).length > 1,
  );

  return allSelectedMarkersCombinations;
}

function addFractionsWithSameDenominator(fractions: ExpressionData[]) {
  let newElements: Array<ExpressionData> = [];
  let addedIndexes: Array<number> = [];

  const additionsCombination = getAdditionsCombination(fractions.length);

  for (const marker of additionsCombination) {
    const additionList = fractions.filter(
      (_, index) => marker[index].type === CombinationMarkerTypes.Selected,
    );

    const currentIndexes = marker.reduce((indexesAccumulator, c, index) => {
      c.type === CombinationMarkerTypes.Selected &&
        indexesAccumulator.push(index);

      return indexesAccumulator;
    }, [] as number[]);

    const someIndexAlreadyAdded = currentIndexes.some(i =>
      addedIndexes.some(index => index === i),
    );

    if (!someIndexAlreadyAdded) {
      console.log({
        fractions: fractions.map(a => a.stringify()),
        additionList: additionList.map(a => a.stringify()),
        marker,
      });

      const fractionsList = additionList.map(expression =>
        separateNumeratorsAndDenominators(expression),
      );

      const denominators = fractionsList.map(e => e.denominators);

      const someDenominatorLengthZero = denominators.some(d => d.length === 0);

      if (denominatorsMatch(denominators) && !someDenominatorLengthZero) {
        const [commonDenominator] = denominators;

        const numeratorList = fractionsList.map(f => f.numerator);

        console.log({
          commonDenominator: commonDenominator.map(e => e.stringify()),
          numeratorList: numeratorList.map(n => n.stringify()),
        });

        if (commonDenominator.length > 1) {
          throw (
            'preguiça do desenvolvedor: commonDenominator muito longo: ' +
            commonDenominator
          );
        }

        const numeratorAddition = doOperation(
          new ExpressionData({
            operator: Operator.Add,
            elements: numeratorList,
          }),
        );

        currentIndexes.forEach(index => addedIndexes.push(index));

        if (!numeratorAddition.isZero) {
          const rejoinedFraction = rejoinFractionComponents(
            numeratorAddition,
            commonDenominator,
          );

          newElements.push(rejoinedFraction);
        }
      }
    }
  }

  for (let index = 0; index < fractions.length; index++) {
    if (!addedIndexes.includes(index)) {
      newElements.push(fractions[index]);
    }
  }

  let [newOneElements, expressionDatas] = newElements.reduce(
    (separationAccumulator, expression) => {
      let [newOneElements, expressionDatas] = separationAccumulator;

      if (!expression.oneElement) {
        expressionDatas.push(expression);
      } else {
        newOneElements.push(expression.oneElement);
      }

      return separationAccumulator;
    },
    [[] as Array<ElementData>, [] as Array<ExpressionData>],
  );

  newOneElements = addNumbersWithSameVariables(newOneElements);

  const expressionNewOneElements = newOneElements
    .map(
      elem =>
        new ExpressionData({
          oneElement: new ElementData(elem),
        }),
    )
    .filter(e => !e.isZero);

  // console.log('ENDED SYMPLIFYDENOMINATORS')
  // console.log(JSON.stringify({
  //     newElements: newElements.map(a => a.stringify())
  // }));

  if (expressionNewOneElements.length === 0 && expressionDatas.length === 0) {
    return createMatrixElement({scalar: 0});
  }

  if (expressionNewOneElements.length === 0 && expressionDatas.length === 1) {
    return expressionDatas[0];
  }

  if (expressionNewOneElements.length === 1 && expressionDatas.length === 0) {
    return expressionNewOneElements[0];
  }

  const result = new ExpressionData({
    operator: Operator.Add,
    elements: [...expressionNewOneElements, ...expressionDatas],
    isSimplified: true,
  });

  console.log({resultFractions: result.stringify()});

  return result;
}

function rejoinFractionComponents(
  numerator: ExpressionData,
  denominators: ExpressionData[],
) {
  return denominators.length === 0
    ? numerator
    : new ExpressionData({
        operator: Operator.Multiply,
        elements: [numerator, ...denominators],
      });
}

function separateFractionsNumerators(addition: ExpressionData[]) {
  // Transform addition expressions into oneElements:
  const oneElementsFractions = addition.reduce(
    (oneElementsAccumulator, expression) => {
      const {numerator, denominators} = separateNumeratorsAndDenominators(
        expression,
      );

      if (
        !(
          numerator.operator === Operator.Add &&
          !numerator.elements.some(e => !e.oneElement)
        ) &&
        !numerator.oneElement
      ) {
        return [...oneElementsAccumulator, expression];
      }

      const newNumerators = numerator.oneElement
        ? [createMatrixElement(numerator.oneElement)]
        : numerator.elements;

      const newFractions = newNumerators.map(n =>
        rejoinFractionComponents(n, denominators),
      );

      return [...oneElementsAccumulator, ...newFractions];
    },
    [] as ExpressionData[],
  );

  return oneElementsFractions;
}

function symplifyDenominators(addition: Array<ExpressionData>): ExpressionData {
  function inverseDistributive(
    numeratorList: ExpressionData[],
    denominator: ExpressionData,
  ): ExpressionData | null {
    function addToExponent(variableData: VariableData, add: number) {
      variableData.exponent += add;
    }

    function insertNotExistingVariables(
      element: ElementData,
      allVariables: Array<string>,
    ) {
      // console.log({element: element.stringify(), allVariables})
      return {
        scalar: element.scalar,
        variables: allVariables.map(v => ({
          variable: v,
          exponent: getVariableFromElement(v, element)?.exponent || 0,
        })),
      } as ElementData;
    }

    function getVariableFromElement(variable: string, element: ElementData) {
      const list = element.variables.filter(vari => vari.variable === variable);

      return list.length !== 0 ? list[0] : null;
    }

    function searchVariable(search: string, variables: Array<VariableData>) {
      return variables.find(v => v.variable === search);
    }

    // console.log('STARTED INVERSE DISTRIBUTIVE')

    const [denominatorBase, denominatorExponent] = denominator.elements;

    if (!denominatorExponent.oneElement) {
      throw 'denominatorExponent should be oneElement';
    }

    const exponent = denominatorExponent.oneElement.scalar;

    // console.log({
    //     numerator1: numerator1.stringify(),
    //     numerator2: numerator2.stringify(),
    //     denominatorBase: denominatorBase.stringify()
    // });

    if (denominatorBase.elements.length !== 2) {
      throw 'erro de preguiça do programador: programa só funciona com denominador de duas variáveis';
    }

    const [baseExpression1, baseExpression2] = denominatorBase.elements;

    if (!baseExpression1.oneElement || !baseExpression2.oneElement) {
      throw 'baseExpression1 and baseExpression2 should be oneElements';
    }

    const someNumeratorNotOneElement = numeratorList.some(n => !n.oneElement);

    if (someNumeratorNotOneElement) {
      throw 'numerators should be oneElements';
    }

    const numeratorVariables = numeratorList.reduce(
      (variableAccumulator, numerator) => [
        ...variableAccumulator,
        ...(numerator.oneElement as ElementData).variables,
      ],
      [] as VariableData[],
    );

    let allVariables = [
      ...numeratorVariables,
      ...baseExpression1.oneElement.variables,
      ...baseExpression2.oneElement.variables,
    ].map(v => v.variable);

    allVariables = allVariables.filter(
      (v, index) => allVariables.indexOf(v) === index,
    );

    let denominatorBaseElementsCopy = denominatorBase.elements.map(e =>
      insertNotExistingVariables(e.oneElement as ElementData, allVariables),
    );

    const noVariables = (e: ElementData) =>
      !e.variables.some(v => v.exponent !== 0);

    denominatorBaseElementsCopy.sort(
      (a, b) => (noVariables(b) ? 1 : 0) - (noVariables(a) ? 1 : 0),
    );

    for (let denominatorElement of denominatorBaseElementsCopy) {
      let numeratorsListCopy = numeratorList.map(n =>
        insertNotExistingVariables(n.oneElement as ElementData, allVariables),
      );

      numeratorsListCopy.sort(
        (a, b) => (noVariables(b) ? 1 : 0) - (noVariables(a) ? 1 : 0),
      );

      console.log({
        denominatorBaseElementsCopy: denominatorBaseElementsCopy.map(e =>
          new ElementData(e).stringify(),
        ),
        numeratorsListCopy: numeratorsListCopy.map(e =>
          new ElementData(e).stringify(),
        ),
      });

      // console.log(JSON.stringify({
      //     numerator1Copy: createMatrixElement(numerator1Copy).stringify(),
      //     numerator2Copy: createMatrixElement(numerator2Copy).stringify(),
      //     denominatorBaseElementsCopy: denominatorBaseElementsCopy.map(
      //         e => createMatrixElement(e).stringify()
      //     ),
      //     allVariables
      // }));

      let [firstNumeratorCopy] = numeratorsListCopy;

      let common = {
        scalar: firstNumeratorCopy.scalar / denominatorElement.scalar,
        variables: [] as Array<VariableData>,
      };

      numeratorsListCopy.forEach(
        n => (n.scalar *= Math.pow(common.scalar, -1)),
      );

      for (let variable of allVariables) {
        let denominatorVariable = getVariableFromElement(
          variable,
          denominatorElement,
        );

        if (!denominatorVariable) {
          throw 'denominatorVariable is for some reason null';
        }

        let numeratorsSearchedVariable = numeratorsListCopy.map(n =>
          searchVariable(variable, n.variables),
        );

        let [
          firstNumeratorSearchedVariable,
        ] = numeratorsSearchedVariable as VariableData[];

        const someVariableNotFound = numeratorsSearchedVariable.some(
          n => n === undefined,
        );

        if (someVariableNotFound) {
          throw (
            'ERRO em inverseDistributive: índice não existe: ' +
            {numeratorsSearchedVariable}
          );
        }

        while (
          firstNumeratorSearchedVariable.exponent !==
          denominatorVariable.exponent
        ) {
          const numberToAdd =
            firstNumeratorSearchedVariable.exponent <
            denominatorVariable.exponent
              ? 1
              : -1;

          numeratorsSearchedVariable.forEach(v =>
            addToExponent(v as VariableData, numberToAdd),
          );

          common.variables.push(
            new VariableData({
              variable,
              exponent: -1 * numberToAdd,
            }),
          );
        }
      }

      const numeratorsExpressionDataList = numeratorsListCopy.map(n =>
        createMatrixElement(n as ElementDataParams),
      );

      const newNumerator = new ExpressionData({
        operator: Operator.Add,
        elements: numeratorsExpressionDataList,
      });

      const commonElement = new ElementData(common);

      console.log('PATINHO FEIO');

      console.log({
        originalNumerators: numeratorList.map(n => n.stringify()),
        denominatorBaseElementsCopy: denominatorBaseElementsCopy.map(e =>
          createMatrixElement(e).stringify(),
        ),
        newNumerator: newNumerator.stringify(),
        commonElement: commonElement.stringify(),
      });

      // Se for verdade, foi encontrado o resultado da divisão entre o numerador e denominador:
      if (additionMatches(newNumerator, denominatorBase)) {
        // console.log('ENCONTRADO!')

        if (1 + exponent === 0) {
          return new ExpressionData({
            oneElement: commonElement,
          });
        }

        const finalDenominator = doOperation(
          new ExpressionData({
            operator: Operator.Elevate,
            elements: [
              denominatorBase,
              new ExpressionData({
                oneElement: new ElementData({
                  scalar: 1 + exponent,
                }),
              }),
            ],
          }),
        );

        // console.log({
        //     commonElement: commonElement.stringify(),
        //     finalDenominator: finalDenominator.stringify()
        // })

        // console.log('ENDED INVERSE DISTRIBUTIVE')

        if (commonElement.isOne) {
          return finalDenominator;
        }

        return new ExpressionData({
          operator: Operator.Multiply,
          elements: [
            new ExpressionData({
              oneElement: commonElement,
            }),
            finalDenominator,
          ],
        });
      }
      // Estas próximas linhas realizam a verificação de possibilidade da fração
      // poder ser simplificada da maneira N/D = (a + b)D/D = a + b.
      // Em contraste, as linhas anteriores verificavam apenas o caso N/D = aD/D = a.
      else if (newNumerator.elements.length > denominatorBase.elements.length) {
        const secondCommon = doOperation(
          new ExpressionData({
            operator: Operator.Divide,
            elements: [
              doOperation(
                new ExpressionData({
                  operator: Operator.Multiply,
                  elements: [
                    createMatrixElement(commonElement),
                    doOperation(
                      new ExpressionData({
                        operator: Operator.Subtract,
                        elements: [newNumerator, denominatorBase],
                      }),
                    ),
                  ],
                }),
              ),
              denominatorBase,
            ],
          }),
        );

        if (secondCommon.oneElement) {
          console.log('ENCONTRADO!');

          const wholeCommon = new ExpressionData({
            operator: Operator.Add,
            elements: [createMatrixElement(commonElement), secondCommon],
          });

          console.log({wholeCommon: wholeCommon.stringify()});

          if (1 + exponent === 0) {
            return wholeCommon;
          }

          const finalDenominator = doOperation(
            new ExpressionData({
              operator: Operator.Elevate,
              elements: [
                denominatorBase,
                new ExpressionData({
                  oneElement: new ElementData({
                    scalar: 1 + exponent,
                  }),
                }),
              ],
            }),
          );

          return new ExpressionData({
            operator: Operator.Multiply,
            elements: [
              new ExpressionData({
                oneElement: commonElement,
              }),
              finalDenominator,
            ],
          });
        }
      }
    }

    // console.log('ENDED INVERSE DISTRIBUTIVE')

    return null;
  }

  let newElements: Array<ExpressionData> = [];
  let addedIndexes: Array<number> = [];

  console.log({
    addition: addition.map(a => a.stringify()),
  });

  // Transform addition expressions into oneElements:
  const additionOneElements = separateFractionsNumerators(addition);

  const additionsCombination = getAdditionsCombination(
    additionOneElements.length,
  );

  // console.log('STARTING SYMPLIFYDENOMINATORS')
  // console.log(JSON.stringify({
  //     elementsss: addition.elements.map(a => a.stringify())
  // }));

  for (const marker of additionsCombination) {
    const additionList = additionOneElements.filter(
      (_, index) => marker[index].type === CombinationMarkerTypes.Selected,
    );

    const currentIndexes = marker.reduce((indexesAccumulator, c, index) => {
      c.type === CombinationMarkerTypes.Selected &&
        indexesAccumulator.push(index);

      return indexesAccumulator;
    }, [] as number[]);

    const someIndexAlreadyAdded = currentIndexes.some(i =>
      addedIndexes.some(index => index === i),
    );

    if (!someIndexAlreadyAdded) {
      console.log({
        addition: additionOneElements.map(a => a.stringify()),
        additionList: additionList.map(a => a.stringify()),
        marker,
      });

      const fractionsList = additionList.map(expression =>
        separateNumeratorsAndDenominators(expression),
      );

      const denominators = fractionsList.map(e => e.denominators);

      const someDenominatorLengthZero = denominators.some(d => d.length === 0);

      if (denominatorsMatch(denominators) && !someDenominatorLengthZero) {
        const [commonDenominator] = denominators;

        const numeratorList = fractionsList.map(f => f.numerator);

        console.log({
          commonDenominator: commonDenominator.map(e => e.stringify()),
          numeratorList: numeratorList.map(n => n.stringify()),
        });

        if (commonDenominator.length > 1) {
          throw (
            'preguiça do desenvolvedor: commonDenominator muito longo: ' +
            commonDenominator
          );
        }

        const [firstDenominator] = commonDenominator;

        const divisionResult = inverseDistributive(
          numeratorList,
          firstDenominator,
        );

        if (divisionResult !== null) {
          currentIndexes.forEach(index => addedIndexes.push(index));

          newElements.push(divisionResult);
        }
      }
    }
  }

  for (let index = 0; index < additionOneElements.length; index++) {
    if (!addedIndexes.includes(index)) {
      newElements.push(additionOneElements[index]);
    }
  }

  let [newOneElements, expressionDatas] = newElements.reduce(
    (separationAccumulator, expression) => {
      let [newOneElements, expressionDatas] = separationAccumulator;

      if (!expression.oneElement) {
        expressionDatas.push(expression);
      } else {
        newOneElements.push(expression.oneElement);
      }

      return separationAccumulator;
    },
    [[] as Array<ElementData>, [] as Array<ExpressionData>],
  );

  newOneElements = addNumbersWithSameVariables(newOneElements);

  const expressionNewOneElements = newOneElements
    .map(
      elem =>
        new ExpressionData({
          oneElement: new ElementData(elem),
        }),
    )
    .filter(e => !e.isZero);

  // console.log('ENDED SYMPLIFYDENOMINATORS')
  // console.log(JSON.stringify({
  //     newElements: newElements.map(a => a.stringify())
  // }));

  if (expressionNewOneElements.length === 0 && expressionDatas.length === 1) {
    return expressionDatas[0];
  }

  if (expressionNewOneElements.length === 1 && expressionDatas.length === 0) {
    return expressionNewOneElements[0];
  }

  const result = new ExpressionData({
    operator: Operator.Add,
    elements: [...expressionNewOneElements, ...expressionDatas],
    isSimplified: true,
  });

  console.log({result: result.stringify()});

  return result;
}

export function onlyJoinFractions(expression: ExpressionData) {
  const fractions = expression.elements.filter(
    e => separateNumeratorsAndDenominators(e).denominators.length > 0,
  );

  const nonFractions = expression.elements.filter(
    e => separateNumeratorsAndDenominators(e).denominators.length === 0,
  );

  const simplifiedFractions = addFractionsWithSameDenominator(fractions);

  if (simplifiedFractions.operator === Operator.Add) {
    return new ExpressionData({
      operator: Operator.Add,
      elements: [...simplifiedFractions.elements, ...nonFractions],
    });
  } else {
    if (nonFractions.length === 0) {
      return simplifiedFractions;
    } else {
      return new ExpressionData({
        operator: Operator.Add,
        elements: [simplifiedFractions, ...nonFractions],
      });
    }
  }
}

export function doOperation(expression: ExpressionData): ExpressionData {
  let element = null;

  console.log({doOperation: expression.stringify()});

  switch (expression.operator) {
    case Operator.Elevate:
      if (expression.elements.length !== 2) {
        throw 'Elevation should only have two expressions';
      }

      const baseExpression = expression.elements[0];
      const exponentExpression = expression.elements[1];

      if (!exponentExpression.oneElement) {
        throw 'exponentExpression is not oneElement';
      }

      const exponent = exponentExpression.oneElement.scalar;

      if (baseExpression.oneElement) {
        return new ExpressionData({
          oneElement: new ElementData({
            scalar: Math.pow(baseExpression.oneElement.scalar, exponent),
            variables: raiseVariablesExponent(
              baseExpression.oneElement.variables,
              exponent,
            ),
          }),
        });
      }

      if (baseExpression.operator === Operator.Elevate) {
        const [
          newBaseExpression,
          newExponentExpression,
        ] = baseExpression.elements;

        if (!newExponentExpression.oneElement) {
          throw 'newExponentExpression is not oneElement';
        }

        return doOperation(
          new ExpressionData({
            operator: Operator.Elevate,
            elements: [
              newBaseExpression,
              createMatrixElement({
                scalar: newExponentExpression.oneElement.scalar * exponent,
              }),
            ],
          }),
        );
      }

      // if baseExpression is Fraction:
      if (baseExpression.operator === Operator.Multiply) {
        const finalElevationResult = baseExpression.elements.map(elem =>
          doOperation(
            new ExpressionData({
              operator: Operator.Elevate,
              elements: [elem, exponentExpression],
            }),
          ),
        );

        return finalElevationResult.length === 1
          ? finalElevationResult[0]
          : new ExpressionData({
              operator: Operator.Multiply,
              elements: finalElevationResult,
              isSimplified: true,
            });
      }

      if (exponent === 0) {
        return new ExpressionData({
          oneElement: new ElementData({
            scalar: 1,
          }),
        });
      }

      if (exponent === 1) {
        return baseExpression;
      }

      return new ExpressionData({
        operator: expression.operator,
        elements: expression.elements,
        isSimplified: true,
      });
    case Operator.Divide:
      if (expression.elements.length !== 2) {
        throw 'Division should only be applied to two elements';
      }

      const [numerator, denominator] = expression.elements;

      if (numerator.oneElement && denominator.oneElement) {
        const [numeratorElem, denominatorElem] = [
          numerator.oneElement,
          denominator.oneElement,
        ];

        const result = createMatrixElement({
          scalar: numeratorElem.scalar / denominatorElem.scalar,
          variables: [
            ...numeratorElem.variables,
            ...denominatorElem.variables.map(
              ({variable, exponent}) =>
                new VariableData({
                  variable,
                  exponent: -exponent,
                }),
            ),
          ],
        });

        return result;
      }

      let invertedDenominator;

      if (denominator.oneElement) {
        const {scalar, variables} = denominator.oneElement;

        if (scalar === 0) {
          throw 'ERRO em doOperation: divisão por zero.';
        }

        invertedDenominator = createMatrixElement({
          scalar: 1 / scalar,
          variables: raiseVariablesExponent(variables, -1),
        });
      } else {
        invertedDenominator = doOperation(
          createMatrixElement({
            operator: Operator.Elevate,
            elements: [
              denominator,
              createMatrixElement({
                scalar: -1,
              }),
            ],
          }),
        );
      }

      const multiplicationElements = [numerator, invertedDenominator];

      return doOperation(
        createMatrixElement({
          operator: Operator.Multiply,
          elements: multiplicationElements,
        }),
      );
    case Operator.Multiply:
      let oneElements: Array<ElementData> = [];
      let distributives: Array<ExpressionData> = [];
      let elevations: Array<ExpressionData> = [];

      for (let multiplier of expression.elements) {
        switch (multiplier.operator) {
          case Operator.Add:
            distributives.push(multiplier);

            break;
          case Operator.Multiply:
            for (let elem of multiplier.elements) {
              if (elem.oneElement) {
                oneElements.push(elem.oneElement);
              } else if (elem.operator === Operator.Elevate) {
                elevations.push(elem);
              } else if (elem.operator === Operator.Add) {
                distributives.push(elem);
              }
            }

            break;
          case Operator.Elevate:
            elevations.push(multiplier);

            break;
          case Operator.None:
            oneElements.push(multiplier.oneElement as ElementData);

            break;
          default:
            throw (
              'ERRO em doOperation: um dos multiplicadores não é aceitável: ' +
              multiplier.operator
            );
        }
      }

      let oneElementsMultiplicationResult = simpleMultiplication(oneElements);

      if (
        (distributives.length === 0 && elevations.length === 0) ||
        oneElementsMultiplicationResult.scalar === 0
      ) {
        return new ExpressionData({
          oneElement: oneElementsMultiplicationResult,
        });
      }

      let simplifiedElevations: Array<ExpressionData> = [];

      console.log({elevations: elevations.map(e => e.stringify())});

      console.log({distributives: distributives.map(e => e.stringify())});

      console.log({
        oneElementsMultiplicationResult: oneElementsMultiplicationResult.stringify(),
      });

      for (let elevationExpression of elevations) {
        if (elevationExpression.elements.length !== 2) {
          throw 'elevationElement should have two expressions';
        }

        const [
          baseExpression,
          exponentExpression,
        ] = elevationExpression.elements;

        if (!exponentExpression.oneElement) {
          throw 'exponentExpression is not oneElement';
        }

        const exponent = exponentExpression.oneElement.scalar;

        const distributivesCopyData = getIndexOfMultipliableAddition(
          distributives,
          baseExpression,
        );

        const elevationsBases = simplifiedElevations.map(
          elem => elem.elements[0],
        );

        const elevationsCopyData = getIndexOfMultipliableAddition(
          elevationsBases,
          baseExpression,
        );

        // console.log({distributivesCopyData, elevationsCopyData})

        if (distributivesCopyData.index !== -1) {
          console.log({exponent, distributivesCopyData});

          const multiplier = new ElementData({
            scalar:
              (distributivesCopyData.elementEliminationFactor as number) *
              Math.pow(
                distributivesCopyData.searchNormalizationFactor,
                exponent,
              ),
          });

          const normalizedDistributive = normalizeAddition(
            distributives.splice(distributivesCopyData.index)[0],
          ).normalizedAddition;

          console.log({
            normalizedDistributive: normalizedDistributive.stringify(),
          });

          const normalizedMultipliedBase = doOperation(
            new ExpressionData({
              operator: Operator.Elevate,
              elements: [
                normalizedDistributive,
                new ExpressionData({
                  oneElement: new ElementData({
                    scalar: exponent + 1,
                  }),
                }),
              ],
            }),
          );

          let newElement = normalizedMultipliedBase;

          console.log({multiplier: multiplier.stringify()});

          if (multiplier.scalar === 1) {
            // console.log({newElement: newElement.stringify()})

            if (newElement.oneElement) {
              oneElementsMultiplicationResult = simpleMultiplication([
                oneElementsMultiplicationResult,
                newElement.oneElement,
              ]);
            } else {
              simplifiedElevations.push(newElement);
            }
          } else {
            if (newElement.oneElement) {
              oneElementsMultiplicationResult = simpleMultiplication([
                multiplier,
                oneElementsMultiplicationResult,
                newElement.oneElement,
              ]);
            } else {
              if (exponent + 1 === -1) {
                const [multNum, multDen] = findFraction(multiplier.scalar);

                const [newBase] = normalizedMultipliedBase.elements;

                const baseWithDenominator = doOperation(
                  new ExpressionData({
                    operator: Operator.Multiply,
                    elements: [newBase, createMatrixElement({scalar: multDen})],
                  }),
                );

                const newDenominator = new ExpressionData({
                  operator: Operator.Elevate,
                  elements: [
                    baseWithDenominator,
                    createMatrixElement({scalar: exponent + 1}),
                  ],
                  isSimplified: true,
                });

                newElement =
                  multNum === 1
                    ? newDenominator
                    : new ExpressionData({
                        operator: Operator.Multiply,
                        elements: [
                          createMatrixElement({scalar: multNum}),
                          newDenominator,
                        ],
                      });

                simplifiedElevations.push(newElement);
              } else {
                newElement = new ExpressionData({
                  operator: Operator.Multiply,
                  elements: [
                    createMatrixElement(multiplier),
                    normalizedMultipliedBase,
                  ],
                });

                simplifiedElevations.push(newElement);
              }
            }
          }
        }

        if (elevationsCopyData.index !== -1) {
          console.log({exponent, elevationsCopyData});

          const multiplier = new ElementData({
            scalar:
              (elevationsCopyData.elementEliminationFactor as number) *
              Math.pow(elevationsCopyData.searchNormalizationFactor, exponent),
          });

          const [sameBase, exponentExpression] = simplifiedElevations.splice(
            elevationsCopyData.index,
          )[0].elements;

          const otherExponent = (exponentExpression.oneElement as ElementData)
            .scalar;

          if (multiplier.scalar !== 1) {
            throw 'Erro de preguiça de programador: sameBase deveria ser multiplicado por multiplier';
          }

          const normalizedMultipliedBase = doOperation(
            new ExpressionData({
              operator: Operator.Elevate,
              elements: [
                sameBase,
                new ExpressionData({
                  oneElement: new ElementData({
                    scalar: exponent + otherExponent,
                  }),
                }),
              ],
            }),
          );

          let newElement = normalizedMultipliedBase;

          if (multiplier.scalar === 1) {
            if (newElement.oneElement) {
              oneElementsMultiplicationResult = simpleMultiplication([
                oneElementsMultiplicationResult,
                newElement.oneElement,
              ]);
            } else {
              simplifiedElevations.push(newElement);
            }
          } else {
            if (newElement.oneElement) {
              oneElementsMultiplicationResult = simpleMultiplication([
                multiplier,
                oneElementsMultiplicationResult,
                newElement.oneElement,
              ]);
            } else {
              newElement = new ExpressionData({
                operator: Operator.Multiply,
                elements: [
                  new ExpressionData({
                    oneElement: multiplier,
                  }),
                  normalizedMultipliedBase,
                ],
              });

              simplifiedElevations.push(newElement);
            }
          }
        }

        if (
          distributivesCopyData.index === -1 &&
          elevationsCopyData.index === -1
        ) {
          simplifiedElevations.push(elevationExpression);
        }
      }

      console.log({
        simplifiedElevations: simplifiedElevations.map(e => e.stringify()),
      });

      if (distributives.length === 0) {
        if (simplifiedElevations.length === 0) {
          // console.log(2)
          return new ExpressionData({
            oneElement: oneElementsMultiplicationResult,
          });
        }

        if (
          !(
            oneElementsMultiplicationResult.scalar === 1 &&
            oneElementsMultiplicationResult.variables.length === 0
          )
        ) {
          // console.log(3)
          return new ExpressionData({
            operator: Operator.Multiply,
            elements: [
              new ExpressionData({
                oneElement: oneElementsMultiplicationResult,
              }),
              ...simplifiedElevations,
            ],
            isSimplified: true,
          });
        }

        if (simplifiedElevations.length === 1) {
          // console.log(4)
          return simplifiedElevations[0];
        }

        // console.log(5)
        return new ExpressionData({
          operator: Operator.Multiply,
          elements: simplifiedElevations,
          isSimplified: true,
        });
      }

      // console.log(JSON.stringify({distributives}))

      let simplifiedDistributives = distributiveMultiplication(distributives);

      // console.log(JSON.stringify({simplifiedDistributives: simplifiedDistributives.stringify()}))

      // Se simplifiedDistributives for um ExpressionData, com operador Add:
      if (!simplifiedDistributives.oneElement) {
        let finalResult: Array<ExpressionData> = [];

        for (let distr of simplifiedDistributives.elements) {
          console.log('ENTERING MULT MULTIPLICATION SUB-LOOP');

          // console.log({
          //     multipliersResult: multipliersResult.stringify(),
          //     distr: distr.stringify()
          // });
          const mult = oneElementsMultiplicationResult.isOne
            ? distr
            : doOperation(
                new ExpressionData({
                  operator: Operator.Multiply,
                  elements: [
                    new ExpressionData({
                      oneElement: oneElementsMultiplicationResult,
                    }),
                    distr,
                  ],
                }),
              );

          console.log('ENDED MULT MULTIPLICATION SUB-LOOP');

          console.log({
            mult: mult.stringify(),
          });

          if (simplifiedElevations.length === 0) {
            finalResult.push(mult);
          } else {
            if (mult.isZero) {
              return new ExpressionData({
                oneElement: new ElementData({
                  scalar: 0,
                }),
              });
            } else if (mult.isOne) {
              if (simplifiedElevations.length === 1) {
                return simplifiedElevations[0];
              } else {
                finalResult.push(
                  new ExpressionData({
                    operator: Operator.Multiply,
                    elements: simplifiedElevations,
                    isSimplified: true,
                  }),
                );
              }
            } else {
              if (mult.operator === Operator.Multiply) {
                const everythingMultiplied = doOperation(
                  new ExpressionData({
                    operator: Operator.Multiply,
                    elements: [...mult.elements, ...simplifiedElevations],
                  }),
                );

                finalResult.push(everythingMultiplied);
              } else {
                finalResult.push(
                  new ExpressionData({
                    operator: Operator.Multiply,
                    elements: [mult, ...simplifiedElevations],
                    isSimplified: true,
                  }),
                );
              }
            }
          }
        }

        console.log({
          simplifiedElevations: simplifiedElevations.map(e => e.stringify()),
          finalResult: finalResult.map(e => e.stringify()),
        });

        if (simplifiedElevations.length > 0) {
          const initialJoinedFractions = onlyJoinFractions(
            new ExpressionData({
              operator: Operator.Add,
              elements: finalResult,
            }),
          );

          console.log({
            initialJoinedFractions: initialJoinedFractions.stringify(),
          });

          const newFractionsToSimplify =
            initialJoinedFractions.operator === Operator.Add
              ? initialJoinedFractions.elements
              : [initialJoinedFractions];

          return symplifyDenominators(newFractionsToSimplify);
        }

        return new ExpressionData({
          operator: Operator.Add,
          elements: finalResult,
          isSimplified: true,
        });
      } else {
        oneElementsMultiplicationResult = simpleMultiplication([
          oneElementsMultiplicationResult,
          simplifiedDistributives.oneElement,
        ]);

        if (simplifiedElevations.length === 0) {
          // console.log(7)
          return new ExpressionData({
            oneElement: oneElementsMultiplicationResult,
          });
        }

        if (oneElementsMultiplicationResult.stringify() === '1') {
          if (simplifiedElevations.length === 1) {
            // console.log(8)
            return simplifiedElevations[0];
          }

          // console.log(9)
          return new ExpressionData({
            operator: Operator.Multiply,
            elements: simplifiedElevations,
            isSimplified: true,
          });
        }

        // console.log(10)
        return new ExpressionData({
          operator: Operator.Multiply,
          elements: [
            new ExpressionData({
              oneElement: oneElementsMultiplicationResult,
            }),
            ...simplifiedElevations,
          ],
          isSimplified: true,
        });
      }
    case Operator.Add:
      let adders: Array<ElementData> = [];
      let notAdders: Array<ExpressionData> = [];

      // console.log(JSON.stringify({elele: expression.elements}))

      for (let adderElement of expression.elements) {
        if (!adderElement.oneElement) {
          if (adderElement.operator === Operator.Add) {
            for (let elem of adderElement.elements) {
              if (!elem.oneElement) {
                notAdders.push(elem);
              } else if (elem.oneElement.scalar !== 0) {
                adders.push(elem.oneElement);
              }
            }
          } else {
            notAdders.push(adderElement);
          }
        } else if (adderElement.oneElement.scalar !== 0) {
          adders.push(adderElement.oneElement);
        }
      }

      // console.log({
      //     adders: adders.map(a => a.stringify()),
      //     notAdders: notAdders.map(a => a.stringify())
      // });

      let simplifiedAdders = addNumbersWithSameVariables(
        addNumbersWithSameVariables(adders),
      );

      // console.log({simplifiedAdders, notAdders, adders})

      if (simplifiedAdders.length === 0 && notAdders.length === 0) {
        return new ExpressionData({
          oneElement: new ElementData({
            scalar: 0,
          }),
        });
      }

      if (simplifiedAdders.length === 1 && notAdders.length === 0) {
        return new ExpressionData({
          oneElement: simplifiedAdders[0],
        });
      }

      if (simplifiedAdders.length === 0 && notAdders.length === 1) {
        return notAdders[0];
      }

      const expressionAdders = simplifiedAdders.map(
        elem =>
          new ExpressionData({
            oneElement: elem,
          }),
      );

      const someDenominator = notAdders.some(
        n =>
          n.operator === Operator.Multiply &&
          n.elements[1].operator === Operator.Elevate &&
          (n.elements[1].elements[1].oneElement?.scalar || 0) < 0,
      );

      const finalAdditionExpressions = [...expressionAdders, ...notAdders];

      if (someDenominator) {
        const initialJoinedFractions = onlyJoinFractions(
          new ExpressionData({
            operator: Operator.Add,
            elements: finalAdditionExpressions,
          }),
        );

        const newFractionsToSimplify =
          initialJoinedFractions.operator === Operator.Add
            ? initialJoinedFractions.elements
            : [initialJoinedFractions];

        const simplifiedAdditions = symplifyDenominators(
          newFractionsToSimplify,
        );

        if (simplifiedAdditions.operator === Operator.Add) {
          return onlyJoinFractions(simplifiedAdditions);
        }

        return simplifiedAdditions;
      } else {
        return new ExpressionData({
          operator: Operator.Add,
          elements: finalAdditionExpressions,
          isSimplified: true,
        });
      }
    case Operator.Subtract:
      if (expression.elements.length !== 2) {
        throw 'Subtraction should only be applied to two elements';
      }

      const [first, second] = expression.elements;

      let negativeSecond;

      if (second.oneElement) {
        const {scalar, variables} = second.oneElement;

        negativeSecond = new ExpressionData({
          oneElement: new ElementData({
            scalar: -1 * scalar,
            variables,
          }),
        });
      } else {
        negativeSecond = doOperation(
          new ExpressionData({
            operator: Operator.Multiply,
            elements: [
              second,
              new ExpressionData({
                oneElement: new ElementData({
                  scalar: -1,
                }),
              }),
            ],
          }),
        );
      }

      return doOperation(
        createMatrixElement({
          operator: Operator.Add,
          elements: [first, negativeSecond],
        }),
      );
    default:
      throw (
        'ERRO em doOperation: não foi selecionado um operador: ' +
        expression.operator
      );
  }
}

function stringifyExpression(expression: any) {
  return isExpressionInstance(expression)
    ? expression.stringify()
    : expression.toString();
}

function simplifyExpressionAlgorithm(expression: ExpressionData) {
  console.log(JSON.stringify({expression12: expression.stringify()}));

  if (!expression.isSimplified) {
    // Realiza, recursivamente, a simplificação da expressão:
    for (let element of expression.elements) {
      element = simplifyExpressionAlgorithm(element);
    }

    // Após isso, realiza a operação:
    expression = doOperation(expression);
  }

  return expression;
}

// a  2  5
// 5  2  8
// 4  0  3
