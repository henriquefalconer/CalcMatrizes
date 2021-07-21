import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from 'react';
import {Dimensions} from 'react-native';

import ChangeOrientation from 'react-native-change-orientation';

// Copiado de react-native-change-orientation:
interface ChangeOrientationType {
  multiply(a: number, b: number): Promise<number>;
  /**
   * Para rodar `setLandscape` em modo de desenvolvimento,
   * talvez seja necessário definir `__DEV__` como false em index.tsx.
   */
  setLandscape(): Promise<void>;
  /**
   * Para rodar `setPortrait` em modo de desenvolvimento,
   * talvez seja necessário definir `__DEV__` como false em index.tsx.
   */
  setPortrait(): Promise<void>;
}

interface OrientationContextData extends ChangeOrientationType {
  isPortrait: boolean;
}

const OrientationContext = createContext<OrientationContextData>(
  {} as OrientationContextData,
);

export const OrientionProvider: React.FC = ({children}) => {
  const checkIfPortrait = useCallback(() => {
    const dimensions = Dimensions.get('screen');

    return dimensions.height >= dimensions.width;
  }, []);

  const [isPortrait, setIsPortrait] = useState(checkIfPortrait());

  useEffect(
    () =>
      Dimensions.addEventListener('change', () =>
        setIsPortrait(checkIfPortrait()),
      ),
    [],
  );

  return (
    <OrientationContext.Provider value={{isPortrait, ...ChangeOrientation}}>
      {children}
    </OrientationContext.Provider>
  );
};

export const useOrientation = () => useContext(OrientationContext);
