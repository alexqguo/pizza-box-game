import React, {useState, useEffect} from 'react';
import en from '../i18n/en_US.json';
import es from '../i18n/es_MX.json';

const languages: {[key: string]: any} = {  en, es };
// const langaugeGetter = (language: string): any => langauges[language]  

const browserLanguage: string =  navigator?.language.split('-')[0] || 'en';

export const LanguageContext = React.createContext<any>(en);
export const LanguageProvider = ({ children }: any) => {
  const [language, setLanguage] = useState(en);
  useEffect(()=> {
    const language = languages[browserLanguage];
    if(language){
      setLanguage(language)
    }
  },[])
  
  
  return (
    <LanguageContext.Provider value={language}>
      {children}
    </LanguageContext.Provider>
  )
};