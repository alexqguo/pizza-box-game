import React from 'react';
import en_US from '../i18n/en_US.json';
const stringTranslation = en_US;

// import {LanguageContext} from './Translation'
// const i18n = useContext(LanguageContext);

export const LanguageContext = React.createContext<any>('us_EN');
export const LanguageProvider = ({ children }: any) => {
  return (
    <LanguageContext.Provider value={stringTranslation}>
      {children}
    </LanguageContext.Provider>
  )
};