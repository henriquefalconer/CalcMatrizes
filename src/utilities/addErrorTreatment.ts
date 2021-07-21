import {Alert} from 'react-native';

type ErrorTreatment<T, K extends string> = Record<K, T> &
  Record<'error', boolean>;

const addErrorTreatment = <T, K extends string>(
  funct: () => T,
  key: K,
): {[key in keyof ErrorTreatment<T, K>]: ErrorTreatment<T, K>[key]} => {
  let data = {} as Record<K, T>;
  let error = false;

  data[key] = {} as T;

  try {
    data[key] = funct();
  } catch (e) {
    error = true;

    Alert.alert(
      'Erro de cálculo',
      __DEV__
        ? e.toString()
        : 'Calculadora tentou resolver uma expressão muito complicada.',
    );
  }

  return {
    ...data,
    error,
  };
};

export default addErrorTreatment;
