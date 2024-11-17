import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

import translationEN from './en/translation.json';
import translationKO from './ko/translation.json';
import translationZH from './zh/translation.json';

const resources = {
    en: {
        translation: translationEN
    },
    ko: {
        translation: translationKO
    },
    zh: {
        translation: translationZH
    },
};

i18n
    .use(initReactI18next)
    .init({
        resources,
        lng: 'en', // default language
        fallbackLng: 'en',
        interpolation: {
            escapeValue: false,
        },
    });

export default i18n;
