// src/context/SettingsContext.js
import React, { createContext, useState, useEffect, useContext } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

// ============================================
// TRANSLATIONS (English & Amharic)
// ============================================
export const translations = {
  en: {
    // Common UI
    app_name: 'Neighborhood Finder',
    settings: 'Settings',
    app_settings: 'App Settings',
    app_theme: 'App Theme',
    dark: 'Dark',
    light: 'Light',
    change_password: 'Change Password',
    app_language: 'App Language',
    english: 'English',
    amharic: 'አማርኛ',
    about: 'About',
    about_app: 'About App',
    coming_soon: 'Coming soon!',
    ok: 'OK',
    error: 'Error',
    cancel: 'Cancel',
    back: 'Back',
    optional: 'Optional',
    loading: 'Loading...',
    success: 'Success',

    // HomeScreen
    hello: 'Hello',
    hello_guest: 'Hello, Guest',
    what_service: 'What service do you need?',
    all_categories: 'All Categories',
    map: 'Map',
    logout: 'Logout',
    logout_unavailable: 'Logout function not available',
    could_not_load_categories: 'Could not load categories',
    login_required: 'Login Required',
    login_prompt: 'Please login or create an account to post a service request.',

    // LoginScreen
    welcome_back: 'Welcome Back',
    login_to_account: 'Login to your account',
    phone_number: 'Phone Number',
    phone_placeholder: 'e.g. 0911234567',
    password: 'Password',
    password_placeholder: 'Your password',
    login: 'Login',
    no_account: "Don't have an account?",
    register: 'Register',
    missing_fields: 'Missing Fields',
    enter_phone_password: 'Please enter your phone and password',
    account_pending: 'Account Pending',
    pending_message: 'Your account is under review. Please wait for admin approval.',
    login_failed: 'Login Failed',

    // RegisterScreen
    create_account: 'Create Account',
    join_us: 'Join Neighborhood Service Finder',
    full_name: 'Full Name',
    name_placeholder: 'Your full name',
    i_am_a: 'I am a...',
    seeker: 'Service Seeker',
    provider: 'Service Provider',
    seeker_desc: 'I need services',
    provider_desc: 'I offer services',
    weak_password: 'Weak Password',
    password_length: 'Password must be at least 6 characters',
    id_required: 'ID Required',
    upload_id: 'Please upload your National ID photo',
    provider_pending_message: 'Your documents have been submitted. An admin will review and activate your account shortly.',
    seeker_success_message: 'You can now login to your account.',
    login_now: 'Login Now',
    have_account: 'Already have an account?',
    registration_success: 'Registration Successful!',
    registration_failed: 'Registration Failed',
    fill_all_fields: 'Please fill all fields',
    verification_docs: '📋 Provider Verification Documents',
    admin_review_note: 'Admin will review these before activating your account.',
    national_id: 'National ID Photo',
    id_selected: '✅ ID Photo Selected',
    certificate: 'Certificate / Credentials',
    upload_cert: '📄 Upload Certificate',
    cert_selected: '✅ Certificate Selected',
    experience_desc: 'Experience Description',
    experience_placeholder: 'Describe your experience, skills, and years of work...',
    verification_note: '⏳ Admin will review your documents and activate your account. You cannot receive jobs until verified.',

    // Admin Dashboard
    admin_panel: 'Admin Panel 👮',
    platform_overview: 'Platform Overview',
    dashboard: 'Dashboard',
    user_management: 'User Management',
    complaints: 'Complaints',
    reviews_moderation: 'Reviews',
    reports: 'Reports',
    platform_cashflow: 'Cashflow',
    platform_stats: '📊 Platform Stats',
    seekers: 'Seekers',
    providers: 'Providers',
    pending: 'Pending',
    requests: 'Requests',
    completed: 'Completed',
    revenue_etb: 'Revenue ETB',
    pending_providers: '⏳ Pending Providers',
    registered: 'Registered',
    view_id: 'View ID',
    verify: 'Verify',
    reject: 'Reject',
    all_users: 'All Users',
    status: 'Status',
    suspend: 'Suspend',
    activate: 'Activate',
    complaints_count: 'Complaints',
    cancelled_requests: 'Cancelled requests',
    open_complaints: 'Open Complaints',
    complaint: 'Complaint',
    reporter: 'Reporter',
    against: 'Against',
    reason: 'Reason',
    date: 'Date',
    resolve: 'Resolve',
    all_reviews: 'All Reviews',
    review_by: 'Review by',
    delete: 'Delete',
    generate_report: 'Generate Report',
    select_report_type: 'Select report type',
    users: 'Users',
    transactions: 'Transactions',
    generate: 'Generate',
    recent_transactions: 'Recent Transactions',
    close: 'Close',
    confirm_user_status: 'Are you sure you want to {action} {name}?',
    user_status_updated: 'User status updated to {status}',
    provider_activated: 'Provider activated successfully.',
    activate_provider_confirm: 'Activate "{name}" as a verified provider?',
    resolve_complaint: 'Resolve Complaint',
    resolve_confirm: 'Mark this complaint as resolved?',
    complaint_resolved: 'Complaint resolved.',
    delete_review: 'Delete Review',
    delete_review_confirm: 'Are you sure you want to delete this review? This cannot be undone.',
    review_deleted: 'Review deleted.',
    report: 'Report',
  },

  am: {
    // Common UI
    app_name: 'ሰፈር አገልግሎት ፈላጊ',
    settings: 'ቅንብሮች',
    app_settings: 'የመተግበሪያ ቅንብሮች',
    app_theme: 'የመተግበሪያ ገጽታ',
    dark: 'ጨለማ',
    light: 'ብርሃን',
    change_password: 'የይለፍ ቃል ቀይር',
    app_language: 'የመተግበሪያ ቋንቋ',
    english: 'እንግሊዝኛ',
    amharic: 'አማርኛ',
    about: 'ስለ',
    about_app: 'ስለ መተግበሪያ',
    coming_soon: 'በቅርቡ ይመጣል!',
    ok: 'እሺ',
    error: 'ስህተት',
    cancel: 'ሰርዝ',
    back: 'ተመለስ',
    optional: 'አማራጭ',
    loading: 'በመጫን ላይ...',
    success: 'ተሳክቷል',

    // HomeScreen
    hello: 'ሰላም',
    hello_guest: 'ሰላም እንግዳ',
    what_service: 'ምን አገልግሎት ያስፈልግዎታል?',
    all_categories: 'ሁሉም ምድቦች',
    map: 'ካርታ',
    logout: 'ውጣ',
    logout_unavailable: 'የውጣ ተግባር አይገኝም',
    could_not_load_categories: 'ምድቦችን ማምጣት አልተቻለም',
    login_required: 'መግባት ያስፈልጋል',
    login_prompt: 'አገልግሎት ለመጠየቅ እባክዎ ይግቡ ወይም መለያ ይፍጠሩ።',

    // LoginScreen
    welcome_back: 'እንኳን ደህና መጣህ',
    login_to_account: 'ወደ መለያዎ ይግቡ',
    phone_number: 'ስልክ ቁጥር',
    phone_placeholder: 'ለምሳሌ 0911234567',
    password: 'የይለፍ ቃል',
    password_placeholder: 'የይለፍ ቃልዎ',
    login: 'ግባ',
    no_account: 'መለያ የለም?',
    register: 'ተመዝገብ',
    missing_fields: 'የጎደሉ መስኮች',
    enter_phone_password: 'እባክዎ ስልክ ቁጥር እና የይለፍ ቃል ያስገቡ',
    account_pending: 'መለያ በመጠበቅ ላይ',
    pending_message: 'መለያዎ በማጽደቅ ሂደት ላይ ነው። እባክዎ ይጠብቁ።',
    login_failed: 'መግባት አልተሳካም',

    // RegisterScreen
    create_account: 'መለያ ፍጠር',
    join_us: 'የሰፈር አገልግሎት ፈላጊ ይቀላቀሉ',
    full_name: 'ሙሉ ስም',
    name_placeholder: 'ሙሉ ስምዎ',
    i_am_a: 'እኔ...',
    seeker: 'አገልግሎት ፈላጊ',
    provider: 'አገልግሎት ሰጪ',
    seeker_desc: 'አገልግሎት ያስፈልገኛል',
    provider_desc: 'አገልግሎት እሰጣለሁ',
    weak_password: 'ደካማ የይለፍ ቃል',
    password_length: 'የይለፍ ቃል ቢያንስ 6 ቁምፊዎች መሆን አለበት',
    id_required: 'መታወቂያ ያስፈልጋል',
    upload_id: 'እባክዎ የናሽናል መታወቂያ ፎቶ ይስቀሉ',
    provider_pending_message: 'ሰነዶችዎ ቀርበዋል። አስተዳዳሪ በቅርቡ ይገመግማሉ እና መለያዎን ያገባሉ።',
    seeker_success_message: 'አሁን ወደ መለያዎ መግባት ይችላሉ።',
    login_now: 'አሁን ግባ',
    have_account: 'አካውንት አለዎት?',
    registration_success: 'ምዝገባ ተሳክቷል!',
    registration_failed: 'ምዝገባ አልተሳካም',
    fill_all_fields: 'እባክዎ ሁሉንም መስኮች ይሙሉ',
    verification_docs: '📋 የአገልግሎት ሰጪ ማረጋገጫ ሰነዶች',
    admin_review_note: 'አስተዳዳሪ መለያዎን ከማግበር በፊት እነዚህን ይገመግማል።',
    national_id: 'ናሽናል መታወቂያ ፎቶ',
    id_selected: '✅ የመታወቂያ ፎቶ ተመርጧል',
    certificate: 'ሰርተፊኬት / ማስረጃ',
    upload_cert: '📄 ሰርተፊኬት ስቀል',
    cert_selected: '✅ ሰርተፊኬት ተመርጧል',
    experience_desc: 'የልምድ መግለጫ',
    experience_placeholder: 'ልምድዎን፣ ክህሎትዎን እና የስራ ዓመታትዎን ይግለጹ...',
    verification_note: '⏳ አስተዳዳሪ ሰነዶችዎን ይገመግማሉ እና መለያዎን ያገባሉ። እስኪረጋገጥ ድረስ ሥራ መቀበል አይችሉም።',

    // Admin Dashboard
    admin_panel: 'የአስተዳዳሪ ፓነል 👮',
    platform_overview: 'የመድረክ አጠቃላይ እይታ',
    dashboard: 'ዳሽቦርድ',
    user_management: 'የተጠቃሚ አስተዳደር',
    complaints: 'ቅሬታዎች',
    reviews_moderation: 'ግምገማዎች',
    reports: 'ሪፖርቶች',
    platform_cashflow: 'የገንዘብ ፍሰት',
    platform_stats: '📊 የመድረክ ስታቲስቲክስ',
    seekers: 'ፈላጊዎች',
    providers: 'አቅራቢዎች',
    pending: 'በመጠባበቅ ላይ',
    requests: 'ጥያቄዎች',
    completed: 'ተጠናቀቀ',
    revenue_etb: 'ገቢ ብር',
    pending_providers: '⏳ በመጠባበቅ ላይ ያሉ አቅራቢዎች',
    registered: 'ተመዝግቧል',
    view_id: 'መታወቂያ ይመልከቱ',
    verify: 'አረጋግጥ',
    reject: 'ውድቅ',
    all_users: 'ሁሉም ተጠቃሚዎች',
    status: 'ሁኔታ',
    suspend: 'እገዳ',
    activate: 'አንቃ',
    complaints_count: 'ቅሬታዎች',
    cancelled_requests: 'የተሰረዙ ጥያቄዎች',
    open_complaints: 'ክፍት ቅሬታዎች',
    complaint: 'ቅሬታ',
    reporter: 'አቅራቢ',
    against: 'በላይ',
    reason: 'ምክንያት',
    date: 'ቀን',
    resolve: 'ፍታ',
    all_reviews: 'ሁሉም ግምገማዎች',
    review_by: 'ግምገማ በ',
    delete: 'ሰርዝ',
    generate_report: 'ሪፖርት ፍጠር',
    select_report_type: 'የሪፖርት አይነት ይምረጡ',
    users: 'ተጠቃሚዎች',
    transactions: 'ግብይቶች',
    generate: 'ፍጠር',
    recent_transactions: 'የቅርብ ጊዜ ግብይቶች',
    close: 'ዝጋ',
    confirm_user_status: '{action} {name} ብለው እርግጠኛ ነዎት?',
    user_status_updated: 'የተጠቃሚ ሁኔታ ወደ {status} ተቀይሯል',
    provider_activated: 'አቅራቢ በሚገባ ነቃ።',
    activate_provider_confirm: '"{name}" እንደ የተረጋገጠ አቅራቢ ማግበር ይፈልጋሉ?',
    resolve_complaint: 'ቅሬታ ፍታ',
    resolve_confirm: 'ይህ ቅሬታ እንደተፈታ ምልክት ማድረግ ይፈልጋሉ?',
    complaint_resolved: 'ቅሬታ ተፈትቷል።',
    delete_review: 'ግምገማ ሰርዝ',
    delete_review_confirm: 'ይህን ግምገማ መሰረዝ እንደሚፈልጉ እርግጠኛ ነዎት? ይህ ሊቀለበስ አይችልም።',
    review_deleted: 'ግምገማ ተሰርዟል።',
    report: 'ሪፖርት',
  },
};

const SettingsContext = createContext();

export const useSettings = () => useContext(SettingsContext);

export const SettingsProvider = ({ children }) => {
  const [theme, setTheme] = useState('light');
  const [language, setLanguage] = useState('en');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      const savedTheme = await AsyncStorage.getItem('app_theme');
      const savedLanguage = await AsyncStorage.getItem('app_language');
      if (savedTheme) setTheme(savedTheme);
      if (savedLanguage) setLanguage(savedLanguage);
    } catch (error) {
      console.log('Failed to load settings', error);
    } finally {
      setLoading(false);
    }
  };

  const updateTheme = async (newTheme) => {
    setTheme(newTheme);
    await AsyncStorage.setItem('app_theme', newTheme);
  };

  const updateLanguage = async (newLanguage) => {
    setLanguage(newLanguage);
    await AsyncStorage.setItem('app_language', newLanguage);
  };

  const t = (key) => {
    return translations[language][key] || translations.en[key] || key;
  };

  if (loading) return null;

  return (
    <SettingsContext.Provider value={{ theme, language, updateTheme, updateLanguage, t }}>
      {children}
    </SettingsContext.Provider>
  );
};