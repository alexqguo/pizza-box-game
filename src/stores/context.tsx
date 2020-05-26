import React from 'react';
import rootStore from './';

export const StoreContext = React.createContext<any>(null);
export const StoreProvider = ({ children }: any) => {
  return (
    <StoreContext.Provider value={rootStore}>
      {children}
    </StoreContext.Provider>
  )
};