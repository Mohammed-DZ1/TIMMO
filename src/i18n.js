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
      "noLinks": "No links available",
      // Dashboard KPIs
      "activeProperties": "Active Properties",
      "totalAgents": "Total Agents",
      "revenueGrowth": "Revenue Growth",
      "averagePrice": "Average Price",
      "avgDaysOnMarket": "Days on Market",
      "conversionRate": "Conversion Rate",
      // Charts
      "agentPerformance": "Agent Performance",
      "propertyDistribution": "Property Distribution",
      "propertyTypes": "Property Types",
      "topPerformingAreas": "Top Areas",
      "total": "Total",
      // Time Ranges
      "daily": "Daily",
      "monthly": "Monthly",
      "yearly": "Yearly",
      "resetZoom": "Reset Zoom",
      "zoomTip": "Hold Ctrl + Scroll to zoom, Shift + Drag to pan",
      // Filters
      "allProperties": "All Properties",
      "forSale": "For Sale",
      "forRent": "For Rent",
      "startDate": "Start Date",
      "endDate": "End Date",
      // Error messages
      "error": "Error",
      "loadingData": "Loading data..."
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
      "noLinks": "Aucun lien disponible",
      // Dashboard KPIs
      "activeProperties": "Propriétés Actives",
      "totalAgents": "Total des Agents",
      "revenueGrowth": "Croissance des Revenus",
      "averagePrice": "Prix Moyen",
      "avgDaysOnMarket": "Jours sur le Marché",
      "conversionRate": "Taux de Conversion",
      // Charts
      "agentPerformance": "Performance des Agents",
      "propertyDistribution": "Distribution des Propriétés",
      "propertyTypes": "Types de Propriétés",
      "topPerformingAreas": "Meilleures Zones",
      "total": "Total",
      // Time Ranges
      "daily": "Quotidien",
      "monthly": "Mensuel",
      "yearly": "Annuel",
      "resetZoom": "Réinitialiser le zoom",
      "zoomTip": "Maintenez Ctrl + Défilement pour zoomer, Shift + Glisser pour faire défiler",
      // Filters
      "allProperties": "Toutes les Propriétés",
      "forSale": "À Vendre",
      "forRent": "À Louer",
      "startDate": "Date de Début",
      "endDate": "Date de Fin",
      // Error messages
      "error": "Erreur",
      "loadingData": "Chargement des données..."
    }
  },
  ar: {
    translation: {
      "welcome": "مرحباً بك في لوحة تحكم تيمو",
      "dashboard": "لوحة التحكم",
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
      "logoutMessage": "تم تسجيل خروجك بنجاح.",
      "noLinks": "لا توجد روابط متاحة",
      // Dashboard KPIs
      "activeProperties": "العقارات النشطة",
      "totalAgents": "إجمالي الوكلاء",
      "revenueGrowth": "نمو الإيرادات",
      "averagePrice": "متوسط السعر",
      "avgDaysOnMarket": "أيام في السوق",
      "conversionRate": "معدل التحويل",
      // Charts
      "agentPerformance": "أداء الوكلاء",
      "propertyDistribution": "توزيع العقارات",
      "propertyTypes": "أنواع العقارات",
      "topPerformingAreas": "أفضل المناطق",
      "total": "الإجمالي",
      // Time Ranges
      "daily": "يومي",
      "monthly": "شهري",
      "yearly": "سنوي",
      "resetZoom": "إعادة ضبط التكبير",
      "zoomTip": "احتفظ ب Ctrl + التمرير لتكبير ، Shift + سحب للتمرير",
      // Filters
      "allProperties": "جميع العقارات",
      "forSale": "للبيع",
      "forRent": "للإيجار",
      "startDate": "تاريخ البداية",
      "endDate": "تاريخ النهاية",
      // Error messages
      "error": "خطأ",
      "loadingData": "جاري تحميل البيانات..."
    }
  }
};

i18n
  .use(initReactI18next)
  .init({
    resources,
    lng: "en",
    fallbackLng: "en",
    interpolation: {
      escapeValue: false
    }
  });

export default i18n;
