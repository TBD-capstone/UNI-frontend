import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

import translationEN from './en/translation.json';
import translationKO from './ko/translation.json';
import translationZH from './zh/translation.json';

const resources = {
    en: { translation: translationEN },
    ko: { translation: translationKO },
    zh: { translation: translationZH },
};

i18n
    .use(LanguageDetector)
    .use(initReactI18next)
    .init({
        resources,
        fallbackLng: 'en', // 기본 언어를 영어로 설정
        interpolation: {
            escapeValue: false, // React의 XSS 보호
        },
        detection: {
            order: ['navigator', 'querystring', 'cookie', 'localStorage', 'htmlTag', 'path', 'subdomain'], // 감지 순서
            caches: ['cookie'], // 감지된 언어를 쿠키에 저장
        },
        debug: true, // 디버깅 활성화
    });

export default i18n;
