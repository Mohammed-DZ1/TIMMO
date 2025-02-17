import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

const resources = {
  en: {
    translation: {
      "welcome": "Welcome to TIMMO Dashboard",
      "dashboard": "Dashboard",
      "properties": "Properties",
      "clients": "Clients",
      "agents": "Agents",
      "settings": "Settings",
      "addUser": "Add User",
      "editUser": "Edit User",
      "deleteUser": "Delete User",
      "addProperty": "Add Property",
      "editProperty": "Edit Property",
      "deleteProperty": "Delete Property",
      "addClient": "Add Client",
      "editClient": "Edit Client",
      "deleteClient": "Delete Client",
      "submit": "Submit",
      "cancel": "Cancel",
      "language": "Language",
      "english": "English",
      "french": "French",
      "arabic": "Arabic",
      "logout": "Logout",
      "logoutMessage": "You have successfully logged out.",
      "noLinks": "No links available"
    }
  },
  fr: {
    translation: {
      "welcome": "Bienvenue sur le tableau de bord TIMMO",
      "dashboard": "Tableau de bord",
      "properties": "Propriétés",
      "clients": "Clients",
      "agents": "Agents",
      "settings": "Paramètres",
      "addUser": "Ajouter un utilisateur",
      "editUser": "Modifier l'utilisateur",
      "deleteUser": "Supprimer l'utilisateur",
      "addProperty": "Ajouter une propriété",
      "editProperty": "Modifier la propriété",
      "deleteProperty": "Supprimer la propriété",
      "addClient": "Ajouter un client",
      "editClient": "Modifier le client",
      "deleteClient": "Supprimer le client",
      "submit": "Soumettre",
      "cancel": "Annuler",
      "language": "Langue",
      "english": "Anglais",
      "french": "Français",
      "arabic": "Arabe",
      "logout": "Déconnexion",
      "logoutMessage": "Vous vous êtes déconnecté avec succès.",
      "noLinks": "Aucun lien disponible"
    }
  },
  ar: {
    translation: {
      "welcome": "مرحبًا بك في لوحة معلومات TIMMO",
      "dashboard": "لوحة القيادة",
      "properties": "العقارات",
      "clients": "العملاء",
      "agents": "الوكلاء",
      "settings": "الإعدادات",
      "addUser": "إضافة مستخدم",
      "editUser": "تعديل المستخدم",
      "deleteUser": "حذف المستخدم",
      "addProperty": "إضافة عقار",
      "editProperty": "تعديل العقار",
      "deleteProperty": "حذف العقار",
      "addClient": "إضافة عميل",
      "editClient": "تعديل العميل",
      "deleteClient": "حذف العميل",
      "submit": "إرسال",
      "cancel": "إلغاء",
      "language": "اللغة",
      "english": "الإنجليزية",
      "french": "الفرنسية",
      "arabic": "العربية",
      "logout": "تسجيل الخروج",
      "logoutMessage": "لقد قمت بتسجيل الخروج بنجاح.",
      "noLinks": "لا توجد روابط متاحة"
    }
  }
};

i18n
  .use(initReactI18next)
  .init({
    resources,
    lng: "en", // Default language
    fallbackLng: "en",
    interpolation: {
      escapeValue: false
    }
  });

export default i18n;
