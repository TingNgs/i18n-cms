import translation from '../public/locales/en/translation.json';

// import the original type declarations
import 'react-i18next';

declare module 'react-i18next' {
  // and extend them!
  interface CustomTypeOptions {
    // custom namespace type if you changed it
    defaultNS: 'translation';
    // custom resources type
    resources: {
      translation: typeof translation;
    };
  }
}
