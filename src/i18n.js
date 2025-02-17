import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

const resources = {
  en: {
    translation: {
      "welcome": "Welcome to TIMMO Dashboard",
    }
  },
  fr: {
    translation: {
      "welcome": "Bienvenue sur le tableau de bord TIMMO",
    }
  },
  ar: {
    translation: {
      "welcome": "مرحبًا بك في لوحة معلومات TIMMO",
    }
  }
};

i18n
  .use(initReactI18next)
  .init({
    resources,
    lng: "en",
    interpolation: {
      escapeValue: false
    }
  });

export default i18n;
