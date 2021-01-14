import React, { Provider } from 'react';

export default function createGenericContext<T extends unknown>(): readonly [
  () => T,
  Provider<T | undefined>
] {
  const genericContext = React.createContext<T | undefined>(undefined);
  const useGenericContext = (): T => {
    const contextIsDefined = React.useContext(genericContext);
    if (!contextIsDefined) {
      throw new Error('useGenericContext must be used within a Provider');
    }
    return contextIsDefined;
  };

  return [useGenericContext, genericContext.Provider] as const;
}
