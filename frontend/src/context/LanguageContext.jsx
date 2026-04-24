import React, { createContext, useState, useEffect } from 'react';

export const LanguageContext = createContext();

export const translations = {
  en: {
    dashboard: "Dashboard",
    myCrops: "My Crops",
    marketplace: "Buyers Marketplace",
    contracts: "Contracts",
    payments: "Payments",
    analytics: "Analytics",
    logout: "Logout",
    agriProducer: "Agri-Producer",
    buyer: "Buyer",
    account: "ACCOUNT",
    agriContract: "AgriContract",
    welcome: "Welcome back",
    quickActions: "Quick Actions",
    sourceCrops: "Source Crops",
    priceInsights: "Price Insights",
    totalCrops: "Total Crops",
    totalOrders: "Total Orders",
    activeContracts: "Active Contracts",
    buyerContracts: "Buyer Contracts",
    earnings: "Earnings",
    spending: "Spending",
    pendingDeals: "Pending Deals",
    availableCrops: "Available Crops",
    recentActivity: "Recent Activity",
    listNewCrop: "List New Crop",
    viewContracts: "View Contracts",
    browseMarket: "Browse Market"
  },
  mr: {
    dashboard: "डॅशबोर्ड",
    myCrops: "माझे पिके",
    marketplace: "खरेदीदार बाजारपेठ",
    contracts: "करार",
    payments: "पेमेंट",
    analytics: "विश्लेषण",
    logout: "लॉगआउट",
    agriProducer: "शेतकरी उत्पादक",
    buyer: "खरेदीदार",
    account: "खाते",
    agriContract: "अॅग्रीकॉन्ट्रॅक्ट",
    welcome: "परत स्वागत आहे",
    quickActions: "त्वरित कृती",
    sourceCrops: "पिके शोधा",
    priceInsights: "दर माहिती",
    totalCrops: "एकूण पिके",
    totalOrders: "एकूण ऑर्डर्स",
    activeContracts: "सक्रिय करार",
    buyerContracts: "खरेदीदार करार",
    earnings: "कमाई",
    spending: "खर्च",
    pendingDeals: "प्रलंबित व्यवहार",
    availableCrops: "उपलब्ध पिके",
    recentActivity: "अलीकडील घडामोडी",
    listNewCrop: "नवीन पीक नोंदवा",
    viewContracts: "करार पहा",
    browseMarket: "बाजारपेठ पहा"
  }
};

export function LanguageProvider({ children }) {
  const [lang, setLang] = useState(() => localStorage.getItem('agri_lang') || 'en');

  useEffect(() => {
    localStorage.setItem('agri_lang', lang);
  }, [lang]);

  const t = (key) => translations[lang][key] || key;
  const toggleLang = () => setLang(prev => prev === 'en' ? 'mr' : 'en');

  return (
    <LanguageContext.Provider value={{ lang, toggleLang, t }}>
      {children}
    </LanguageContext.Provider>
  );
}
