// src/context/SettingsContext.js
import React, { createContext, useState, useContext, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

const SettingsContext = createContext(null);

const translations = {
  en: {
    // Common
    hello: 'Hello',
    hello_guest: 'Hello Guest',
    what_service: 'What service do you need today?',
    all_categories: 'All Categories',
    map: 'Map',
    logout: 'Logout',
    error: 'Error',
    cancel: 'Cancel',
    login: 'Login',
    back: 'Back',
    ok: 'OK',
    
    // Navigation Tab Labels
    home: 'Home',
    post_job: 'Post a Job',
    my_requests: 'My Requests',
    dashboard: 'Dashboard',
    offered_jobs: 'Offered Jobs',
    offered: 'Offered',
    accepted_jobs: 'Accepted Jobs',
    accepted: 'Accepted',
    admin_panel: 'Admin Panel',
    settings: 'Settings',
    about: 'About',
    
    // Welcome Screen
    welcome_back: 'Welcome Back',
    login_to_account: 'Login to your account',
    no_account: "Don't have an account?",
    register: 'Register',
    enter_phone_password: 'Please enter phone and password',
    account_pending: 'Account Pending',
    pending_message: 'Your account is under review. Please wait for admin approval.',
    login_failed: 'Login Failed',
    
    // Register Screen
    create_account: 'Create Account',
    join_us: 'Join our community',
    i_am_a: 'I am a',
    seeker: 'Service Seeker',
    seeker_desc: 'Need a service done',
    provider: 'Service Provider',
    provider_desc: 'Offer your skills',
    full_name: 'Full Name',
    name_placeholder: 'Enter your full name',
    phone_number: 'Phone Number',
    phone_placeholder: '+251912345678',
    password: 'Password',
    password_placeholder: 'At least 6 characters with 1 number',
    missing_fields: 'Missing Fields',
    fill_all_fields: 'Please fill in all required fields',
    weak_password: 'Weak Password',
    password_length: 'Password must be at least 6 characters',
    id_required: 'ID Required',
    upload_id: 'Please upload your National ID',
    service_required: 'Service Required',
    select_at_least_one_service: 'Please select at least one service you offer',
    registration_success: 'Registration Successful',
    seeker_success_message: 'You can now login to your account',
    provider_pending_message: 'Your account is pending admin verification',
    registration_failed: 'Registration Failed',
    login_now: 'Login Now',
    have_account: 'Already have an account?',
    
    // Provider Registration Fields
    verification_docs: 'Verification Documents',
    admin_review_note: 'These will be reviewed by admin',
    national_id: 'National ID Photo',
    certificate: 'Certificate/Credentials',
    optional: 'Optional',
    experience_desc: 'Experience Description',
    experience_placeholder: 'Tell us about your experience...',
    id_selected: 'ID Photo Selected',
    cert_selected: 'Certificate Selected',
    upload_id_btn: 'Upload National ID',
    upload_cert_btn: 'Upload Certificate',
    verification_note: 'Your documents will be reviewed. You will be notified once verified.',
    
    // Service Selection
    select_services: 'Select Your Services',
    select_services_desc: 'Choose all services you offer',
    
    // Home Screen
    login_required: 'Login Required',
    login_prompt: 'Please login to post a service request',
    could_not_load_categories: 'Could not load categories',
    logout_unavailable: 'Logout function not available',
    
    // Settings Screen
    appearance: 'Appearance',
    light_mode: 'Light Mode',
    dark_mode: 'Dark Mode',
    language: 'Language',
    english: 'English',
    amharic: 'Amharic',
    app_name: 'Neighborhood Service Finder',
    app_description: 'Connect with trusted local service providers in your neighborhood.',
    contact_us: 'Contact Us',
    email: 'Email',
    phone: 'Phone',
    website: 'Website',
    app_settings: 'App Settings',
    app_theme: 'App Theme',
    app_language: 'App Language',
    about_app: 'About App',
    light: 'Light',
    dark: 'Dark',
    
    // Post Request
    post_request: 'Post a Request',
    tell_us: 'Tell us what you need help with',
    select_category: 'Service Category',
    describe_problem: 'Describe Your Problem',
    add_photo: 'Add a Photo (Optional)',
    your_location: 'Your Location',
    location_detected: 'Location detected',
    location_unavailable: 'Location not available',
    fee_info: 'Fee Information',
    fee_description: 'After provider accepts, pay 100 ETB to unlock contact details.',
    post_button: 'Post Request',
    
    // My Requests
    no_requests: 'No requests yet',
    no_requests_desc: 'Post your first service request',
    post_request_btn: 'Post a Request',
    pay_now: 'Pay 100 ETB to Unlock Contact',
    payment_success: 'Payment Successful',
    provider_contact: 'Provider Contact',
    
    // Provider Screens
    no_offered_jobs: 'No offered jobs',
    no_accepted_jobs: 'No accepted jobs',
    go_online: 'Go Online',
    go_offline: 'Go Offline',
    online_status: 'Status',
    online: 'Online',
    offline: 'Offline',
    accept_job: 'Accept Job',
    reject_job: 'Reject',
    accept_confirm: 'Accept Job?',
    accept_fee_warning: 'Pay 20 ETB to unlock seeker contact details.',
    payment_required: 'Payment Required',
    
    // Admin
    total_seekers: 'Total Seekers',
    active_providers: 'Active Providers',
    pending_providers: 'Pending Providers',
    total_requests: 'Total Requests',
    completed_jobs: 'Completed Jobs',
    total_revenue: 'Total Revenue',
    pending_verification: 'Pending Verification',
    verify: 'Verify',
    reject: 'Reject',
    view_document: 'View Document',
    
    // Role Selection
    welcome_user: 'Welcome',
    choose_role: 'Choose how you want to use the app',
    need_service: 'I Need a Service',
    need_service_desc: 'Find and request services from providers',
    offer_service: 'I Offer Services',
    offer_service_desc: 'Offer your skills and accept jobs',
    
    // Forgot Password
    forgot_password: 'Forgot Password?',
    enter_phone: 'Enter your phone number to receive a reset code',
    reset_code: 'Reset Code',
    enter_code: 'Enter 6-digit code',
    new_password: 'New Password',
    confirm_password: 'Confirm Password',
    send_code: 'Send Reset Code',
    verify_code: 'Verify Code',
    reset_password: 'Reset Password',
    remember_password: 'Remember your password?',
  },
  am: {
    // Common
    hello: 'ሰላም',
    hello_guest: 'እንኳን ደህና መጣህ',
    what_service: 'ዛሬ ምን አገልግሎት ይፈልጋሉ?',
    all_categories: 'ሁሉም ምድቦች',
    map: 'ካርታ',
    logout: 'ውጣ',
    error: 'ስህተት',
    cancel: 'ሰርዝ',
    login: 'ግባ',
    back: 'ተመለስ',
    ok: 'እሺ',
    
    // Navigation Tab Labels
    home: 'መነሻ',
    post_job: 'ስራ ለጥፍ',
    my_requests: 'ጥያቄዎቼ',
    dashboard: 'ዳሽቦርድ',
    offered_jobs: 'የቀረቡ ስራዎች',
    offered: 'የቀረበ',
    accepted_jobs: 'ተቀባይነት ያገኙ',
    accepted: 'ተቀባይነት አግኝቷል',
    admin_panel: 'አስተዳዳሪ ፓነል',
    settings: 'ቅንብሮች',
    about: 'ስለ መተግበሪያ',
    
    // Welcome Screen
    welcome_back: 'እንኳን ደህና መጡ',
    login_to_account: 'ወደ መለያዎ ይግቡ',
    no_account: 'አካውንት የለዎትም?',
    register: 'ይመዝገቡ',
    enter_phone_password: 'እባክዎ ስልክ ቁጥር እና የይለፍ ቃል ያስገቡ',
    account_pending: 'አካውንት በመጠባበቅ ላይ',
    pending_message: 'አካውንትዎ በአስተዳዳሪ ግምገራ ላይ ነው',
    login_failed: 'መግቢያ አልተሳካም',
    
    // Register Screen
    create_account: 'አካውንት ፍጠር',
    join_us: 'ከማህበረሰባችን ጋር ይቀላቀሉ',
    i_am_a: 'እኔ ነኝ',
    seeker: 'አገልግሎት ፈላጊ',
    seeker_desc: 'አገልግሎት ይፈልጋሉ',
    provider: 'አገልግሎት ሰጪ',
    provider_desc: 'ክህሎትዎን ያቅርቡ',
    full_name: 'ሙሉ ስም',
    name_placeholder: 'ሙሉ ስምዎን ያስገቡ',
    phone_number: 'ስልክ ቁጥር',
    phone_placeholder: '+251912345678',
    password: 'የይለፍ ቃል',
    password_placeholder: 'ቢያንስ 6 ቁምፊዎች ከ1 ቁጥር ጋር',
    missing_fields: 'የጎደሉ መረጃዎች',
    fill_all_fields: 'እባክዎ ሁሉንም አስፈላጊ መረጃዎች ይሙሉ',
    weak_password: 'ደካማ የይለፍ ቃል',
    password_length: 'የይለፍ ቃል ቢያንስ 6 ቁምፊዎች መሆን አለበት',
    id_required: 'መታወቂያ ያስፈልጋል',
    upload_id: 'እባክዎ ብሔራዊ መታወቂያዎን ይስቀሉ',
    service_required: 'አገልግሎት ያስፈልጋል',
    select_at_least_one_service: 'እባክዎ ቢያንስ አንድ አገልግሎት ይምረጡ',
    registration_success: 'ምዝገባ ተሳክቷል',
    seeker_success_message: 'አሁን ወደ መግቢያ ገፅ መሄድ ይችላሉ',
    provider_pending_message: 'አካውንትዎ በአስተዳዳሪ ማረጋገጫ ላይ ነው',
    registration_failed: 'ምዝገባ አልተሳካም',
    login_now: 'አሁን ግቡ',
    have_account: 'አካውንት አለዎት?',
    
    // Provider Registration Fields
    verification_docs: 'ማረጋገጫ ሰነዶች',
    admin_review_note: 'እነዚህ ሰነዶች በአስተዳዳሪ ይገመገማሉ',
    national_id: 'ብሔራዊ መታወቂያ ፎቶ',
    certificate: 'ሰርተፊኬት/ማረጋገጫ',
    optional: 'አማራጭ',
    experience_desc: 'የስራ ልምድ መግለጫ',
    experience_placeholder: 'ስለ ልምድዎ ይንገሩን...',
    id_selected: 'መታወቂያ ተመርጧል',
    cert_selected: 'ሰርተፊኬት ተመርጧል',
    upload_id_btn: 'ብሔራዊ መታወቂያ ስቀል',
    upload_cert_btn: 'ሰርተፊኬት ስቀል',
    verification_note: 'ሰነዶችዎ ይገመገማሉ. ከተረጋገጡ በኋላ ይነገሩዎታል',
    
    // Service Selection
    select_services: 'አገልግሎቶችዎን ይምረጡ',
    select_services_desc: 'የሚሰጧቸውን ሁሉንም አገልግሎቶች ይምረጡ',
    
    // Home Screen
    login_required: 'መግቢያ ያስፈልጋል',
    login_prompt: 'እባክዎ አገልግሎት ለመጠየቅ ይግቡ',
    could_not_load_categories: 'ምድቦችን ማግኘት አልተቻለም',
    logout_unavailable: 'የውጣ ተግባር አይገኝም',
    
    // Settings Screen
    appearance: 'መልክ',
    light_mode: 'ቀላል ሁነታ',
    dark_mode: 'ጨለማ ሁነታ',
    language: 'ቋንቋ',
    english: 'እንግሊዝኛ',
    amharic: 'አማርኛ',
    app_name: 'ሰፈር አገልግሎት ፈላጊ',
    app_description: 'በአካባቢዎ ከሚታመኑ አገልግሎት ሰጪዎች ጋር ይገናኙ',
    contact_us: 'ያግኙን',
    email: 'ኢሜይል',
    phone: 'ስልክ',
    website: 'ድረ ገፅ',
    app_settings: 'የመተግበሪያ ቅንብሮች',
    app_theme: 'የመተግበሪያ መልክ',
    app_language: 'የመተግበሪያ ቋንቋ',
    about_app: 'ስለ መተግበሪያ',
    light: 'ቀላል',
    dark: 'ጨለማ',
    
    // Post Request
    post_request: 'ጥያቄ ለጥፍ',
    tell_us: 'ምን እርዳታ እንደሚፈልጉ ይንገሩን',
    select_category: 'የአገልግሎት ምድብ',
    describe_problem: 'ችግርዎን ይግለጹ',
    add_photo: 'ፎቶ ያክሉ (አማራጭ)',
    your_location: 'አካባቢዎ',
    location_detected: 'አካባቢ ተለይቷል',
    location_unavailable: 'አካባቢ አልተገኘም',
    fee_info: 'ክፍያ መረጃ',
    fee_description: 'አገልግሎት ሰጪው ጥያቄዎን ከተቀበለ በኋላ 100 ብር መክፈል ያስፈልጋል',
    post_button: 'ጥያቄ ለጥፍ',
    
    // My Requests
    no_requests: 'ምንም ጥያቄ የለም',
    no_requests_desc: 'የመጀመሪያ ጥያቄዎን ይለጥፉ',
    post_request_btn: 'ጥያቄ ለጥፍ',
    pay_now: 'አግኙት ለመክፈት 100 ብር ክፈል',
    payment_success: 'ክፍያ ተሳክቷል',
    provider_contact: 'የአገልግሎት ሰጪ መገኛ',
    
    // Provider Screens
    no_offered_jobs: 'ምንም የቀረቡ ስራዎች የሉም',
    no_accepted_jobs: 'ምንም ተቀባይነት ያገኙ ስራዎች የሉም',
    go_online: 'መስመር ላይ ውጣ',
    go_offline: 'ከመስመር ውጣ',
    online_status: 'ሁኔታ',
    online: 'በመስመር ላይ',
    offline: 'ከመስመር ውጭ',
    accept_job: 'ስራ ተቀበል',
    reject_job: 'ውድቅ አድርግ',
    accept_confirm: 'ስራ ተቀበል?',
    accept_fee_warning: 'የጠያቂውን መገኛ ለመክፈት 20 ብር ክፍያ መክፈል ያስፈልጋል',
    payment_required: 'ክፍያ ያስፈልጋል',
    
    // Admin
    total_seekers: 'ጠቅላላ ፈላጊዎች',
    active_providers: 'ንቁ አገልግሎት ሰጪዎች',
    pending_providers: 'በመጠባበቅ ላይ ያሉ',
    total_requests: 'ጠቅላላ ጥያቄዎች',
    completed_jobs: 'የተጠናቀቁ ስራዎች',
    total_revenue: 'ጠቅላላ ገቢ',
    pending_verification: 'ማረጋገጫ ላይ',
    verify: 'አረጋግጥ',
    reject: 'ውድቅ አድርግ',
    view_document: 'ሰነድ ተመልከት',
    
    // Role Selection
    welcome_user: 'እንኳን ደህና መጡ',
    choose_role: 'እንዴት መጠቀም እንደሚፈልጉ ይምረጡ',
    need_service: 'አገልግሎት እፈልጋለሁ',
    need_service_desc: 'ከአገልግሎት ሰጪዎች መጠየቅ እና ማግኘት',
    offer_service: 'አገልግሎት እሰጣለሁ',
    offer_service_desc: 'ክህሎትዎን ያቅርቡ እና ስራ ይቀበሉ',
    
    // Forgot Password
    forgot_password: 'የይለፍ ቃል ረሳሁት?',
    enter_phone: 'የማስመለሻ ኮድ ለመቀበል ስልክ ቁጥርዎን ያስገቡ',
    reset_code: 'ማስመለሻ ኮድ',
    enter_code: '6-አሃዝ ኮድ ያስገቡ',
    new_password: 'አዲስ የይለፍ ቃል',
    confirm_password: 'የይለፍ ቃል ያረጋግጡ',
    send_code: 'ማስመለሻ ኮድ ላክ',
    verify_code: 'ኮድ አረጋግጥ',
    reset_password: 'የይለፍ ቃል ዳግም አስጀምር',
    remember_password: 'የይለፍ ቃልዎን ያስታወሱ?',
  }
};

export function SettingsProvider({ children }) {
  const [theme, setTheme] = useState('light');
  const [language, setLanguage] = useState('en');

  useEffect(() => {
    loadSettings();
  }, []);

  async function loadSettings() {
    try {
      const savedTheme = await AsyncStorage.getItem('theme');
      const savedLanguage = await AsyncStorage.getItem('language');
      if (savedTheme) setTheme(savedTheme);
      if (savedLanguage) setLanguage(savedLanguage);
    } catch (error) {
      console.log('Error loading settings:', error);
    }
  }

  async function updateTheme(newTheme) {
    setTheme(newTheme);
    await AsyncStorage.setItem('theme', newTheme);
  }

  async function updateLanguage(newLanguage) {
    setLanguage(newLanguage);
    await AsyncStorage.setItem('language', newLanguage);
  }

  function t(key) {
    return translations[language][key] || translations.en[key] || key;
  }

  return (
    <SettingsContext.Provider value={{ theme, language, updateTheme, updateLanguage, t }}>
      {children}
    </SettingsContext.Provider>
  );
}

export function useSettings() {
  return useContext(SettingsContext);
}