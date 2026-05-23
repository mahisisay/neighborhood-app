// src/context/SettingsContext.js
// Complete Amharic translations for all features including navigation

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
    
    // Navigation / Tab Labels
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
    admin_review_note: 'These documents will be reviewed by admin',
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
    select_services_desc: 'Choose all services you offer (you can select multiple)',
    
    // Home Screen
    login_required: 'Login Required',
    login_prompt: 'Please login or create an account to post a service request',
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
    switch_role: 'Switch Role',
    current_mode: 'Current Mode',
    both_roles_desc: 'You have both roles. Switch between them anytime.',
    seeker_mode: 'Seeker Mode',
    provider_mode: 'Provider Mode',
    
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
    fee_description: 'After a provider accepts your request, you will pay a 100 ETB commitment fee to unlock their contact details.',
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
    accept_fee_warning: 'You will need to pay 20 ETB service fee to unlock the seeker\'s contact details.',
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
    
    // Welcome Screen
    welcome_back: 'Welcome Back',
    login_to_account: 'Login to your account',
    no_account: "Don't have an account?",
    register: 'Register',
    enter_phone_password: 'Please enter phone and password',
    account_pending: 'Account Pending',
    pending_message: 'Your account is under review. Please wait for admin approval.',
    login_failed: 'Login Failed',
    
    // Forgot Password
    forgot_password: 'Forgot Password?',
    enter_phone: 'Enter your phone number to receive a reset code',
    reset_code: 'Reset Code',
    enter_code: 'Enter 6-digit code',
    enter_code_placeholder: 'Enter 6-digit code',
    new_password: 'New Password',
    confirm_password: 'Confirm Password',
    confirm_password_placeholder: 'Re-enter new password',
    send_code: 'Send Reset Code',
    verify_code: 'Verify Code',
    reset_password: 'Reset Password',
    remember_password: 'Remember your password?',
    enter_new_password: 'Create your new password',
    password_required: 'New password is required',
    password_mismatch: 'Passwords do not match',
    success: 'Success',
    reset_success: 'Password reset successful. Please login with your new password.',
    
    // Role Selection
    welcome_user: 'Welcome',
    choose_role: 'Choose how you want to use the app',
    need_service: 'I Need a Service',
    need_service_desc: 'Find and request services from providers',
    offer_service: 'I Offer Services',
    offer_service_desc: 'Offer your skills and accept jobs',
    
    // About Screen
    about_text: 'This app connects residents with verified local service providers in Gondar city.',
    developer_info: 'Developer Information',
    developer: 'Developer',
    university: 'University',
    department: 'Department',
    location: 'Location',
    year: 'Year',
    key_features: 'Key Features',
    feature_gps: 'GPS-based provider matching within 10km',
    feature_verified: 'Verified provider profiles with documents',
    feature_rating: 'Rating and review system',
    feature_payment: 'Secure Chapa payment integration',
    feature_roles: 'Switch between Seeker and Provider roles',
    feature_theme: 'Light and Dark theme support',
    feature_language: 'Amharic and English language support',
    
    // Map Screen
    away: 'away',
    search_radius: 'Search Radius',
    available_provider: 'Available Provider',
    loading_providers: 'Loading nearby providers...',
    retry: 'Retry',
    distance: 'Distance',
    rating: 'Rating',
    status: 'Status',
    new: 'New',
    
    // Rate Provider Screen
    rate_provider: 'Rate Provider',
    service_provider: 'Service Provider',
    how_was_experience: 'How was your experience?',
    tap_to_rate: 'Tap a star to rate',
    you_rated: 'You rated',
    out_of_5: 'out of 5 stars',
    your_review: 'Your Review',
    review_placeholder: 'Share your experience with this provider...',
    submit_rating: 'Submit Rating',
    skip: 'Skip for now',
    rating_required: 'Please select a rating (1-5 stars)',
    rating_submitted: 'Your rating has been submitted successfully.',
    thank_you: 'Thank You!',
    
    // Accepted Jobs Screen
    step1: 'Accept a job from "Offered Jobs"',
    step2: 'Pay 20 ETB service fee',
    step3: 'Get seeker\'s phone number',
    step4: 'Call seeker and go to location',
    step5: 'Complete the job',
    step6: 'Seeker will rate you',
    jobs_accepted: 'job(s) accepted',
    pay_20_btn: 'Pay 20 ETB to Unlock Contact',
    pay_20_title: 'Pay 20 ETB Service Fee',
    pay_20_message: 'Pay to unlock the seeker\'s contact details and confirm the job.',
    pay_20: 'Pay 20 ETB',
    how_to_complete: 'How to complete a job:',
    accepted_jobs_hint: 'Jobs you accept will appear here.',
    
    // Admin Screen
    no_pending_providers: 'No pending providers',
    registered: 'Registered',
    view_id: 'View ID',
    no_id: 'No ID',
    view_certificate: 'View Certificate',
    no_certificate: 'No Certificate',
    provider_verified: 'Provider has been verified and activated',
    provider_rejected: 'Provider has been rejected',
    reject_provider: 'Reject Provider',
    reject_confirm: 'Are you sure you want to reject this provider?',
    
    // Provider Home Screen
    accept_pay: 'Accept & Pay 20 ETB',
    job_rejected: 'Job offer has been declined',
    fee_applies: 'fee applies on acceptance',
    jobs_available: 'job(s) available near you',
    go_online_hint: 'Go online to receive job offers from nearby seekers',
    online_hint: 'You are visible to seekers within 10km',
    offline_hint: 'Go online to receive job offers',
    your_dashboard: 'Your Dashboard',
    quick_actions: 'Quick Actions',
    view_offered_jobs: 'View Offered Jobs',
    my_accepted_jobs: 'My Accepted Jobs',
    pro_tip: 'Pro Tip',
    pro_tip_text: 'Stay online to receive job offers. The closer you are to the seeker\'s location, the higher your chance of getting matched!',
    
    // Post Request Additional
    selected_service: 'Selected Service',
    service_category: 'Service Category',
    select_service_error: 'Please select a specific service type',
    description_required: 'Please describe what you need',
    location_required: 'We need your location to match providers',
    location_needed: 'Location needed',
    location_permission: 'We need your location to find nearby providers.',
    location_error: 'Could not get your location',
    providers_notified: 'provider(s) have been notified near you!',
    view_requests: 'View My Requests',
    photo_selected: 'Photo Selected',
    choose_photo: 'Choose Photo',
    select_category_error: 'Please select a service category',
    
    // Payment
    pay_100_title: 'Pay 100 ETB Commitment Fee',
    pay_100_message: 'You will be redirected to Chapa to complete the payment.',
    pay_now: 'Pay Now',
    payment_complete: 'Did you complete payment?',
    payment_verify_message: 'Come back here after paying on Chapa.',
    not_yet: 'Not yet',
    yes_verify: 'Yes, verify',
    payment_url_error: 'Could not get payment URL',
    provider: 'Provider',
    seeker_contact: 'Seeker Contact Unlocked',
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
    
    // Navigation / Tab Labels
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
    select_services_desc: 'የሚሰጧቸውን ሁሉንም አገልግሎቶች ይምረጡ (ብዙ መምረጥ ይችላሉ)',
    
    // Home Screen
    login_required: 'መግቢያ ያስፈልጋል',
    login_prompt: 'እባክዎ አገልግሎት ለመጠየቅ ይግቡ ወይም አካውንት ይፍጠሩ',
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
    switch_role: 'ሚና ቀይር',
    current_mode: 'አሁን ያለሁበት ሁነታ',
    both_roles_desc: 'ሁለቱም ሚናዎች አሉዎት። በማንኛውም ጊዜ መቀየር ይችላሉ።',
    seeker_mode: 'ፈላጊ ሁነታ',
    provider_mode: 'አገልግሎት ሰጪ ሁነታ',
    
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
    fee_description: 'አገልግሎት ሰጪው ጥያቄዎን ከተቀበለ በኋላ አግኙት ቁልፍን ለመክፈት 100 ብር መክፈል ያስፈልጋል',
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
    
    // Welcome Screen
    welcome_back: 'እንኳን ደህና መጡ',
    login_to_account: 'ወደ መለያዎ ይግቡ',
    no_account: 'አካውንት የለዎትም?',
    register: 'ይመዝገቡ',
    enter_phone_password: 'እባክዎ ስልክ ቁጥር እና የይለፍ ቃል ያስገቡ',
    account_pending: 'አካውንት በመጠባበቅ ላይ',
    pending_message: 'አካውንትዎ በአስተዳዳሪ ግምገራ ላይ ነው። እባክዎ ይጠብቁ።',
    login_failed: 'መግቢያ አልተሳካም',
    
    // Forgot Password
    forgot_password: 'የይለፍ ቃል ረሳሁት?',
    enter_phone: 'የማስመለሻ ኮድ ለመቀበል ስልክ ቁጥርዎን ያስገቡ',
    reset_code: 'ማስመለሻ ኮድ',
    enter_code: '6-አሃዝ ኮድ ያስገቡ',
    enter_code_placeholder: '6-አሃዝ ኮድ ያስገቡ',
    new_password: 'አዲስ የይለፍ ቃል',
    confirm_password: 'የይለፍ ቃል ያረጋግጡ',
    confirm_password_placeholder: 'አዲስ የይለፍ ቃል ያስገቡ',
    send_code: 'ማስመለሻ ኮድ ላክ',
    verify_code: 'ኮድ አረጋግጥ',
    reset_password: 'የይለፍ ቃል ዳግም አስጀምር',
    remember_password: 'የይለፍ ቃልዎን ያስታወሱ?',
    enter_new_password: 'አዲስ የይለፍ ቃል ይፍጠሩ',
    password_required: 'አዲስ የይለፍ ቃል ያስፈልጋል',
    password_mismatch: 'የይለፍ ቃሎቹ አይዛመዱም',
    success: 'ተሳክቷል',
    reset_success: 'የይለፍ ቃል በተሳካ ሁኔታ ተቀይሯል። እባክዎ ይግቡ።',
    
    // Role Selection
    welcome_user: 'እንኳን ደህና መጡ',
    choose_role: 'እንዴት መጠቀም እንደሚፈልጉ ይምረጡ',
    need_service: 'አገልግሎት እፈልጋለሁ',
    need_service_desc: 'ከአገልግሎት ሰጪዎች መጠየቅ እና ማግኘት',
    offer_service: 'አገልግሎት እሰጣለሁ',
    offer_service_desc: 'ክህሎትዎን ያቅርቡ እና ስራ ይቀበሉ',
    
    // About Screen
    about_text: 'ይህ መተግበሪያ በጎንደር ከተማ ነዋሪዎችን ከተረጋገጡ የአካባቢ አገልግሎት ሰጪዎች ጋር ያገናኛል።',
    developer_info: 'ገንቢ መረጃ',
    developer: 'ገንቢ',
    university: 'ዩኒቨርሲቲ',
    department: 'ዲፓርትመንት',
    location: 'አካባቢ',
    year: 'ዓመት',
    key_features: 'ቁልፍ ባህሪያት',
    feature_gps: 'በ10ኪሜ ርቀት ውስጥ በጂፒኤስ አገልግሎት ሰጪዎችን ማዛመድ',
    feature_verified: 'የተረጋገጡ አገልግሎት ሰጪ መገለጫዎች ከሰነዶች ጋር',
    feature_rating: 'የደረጃ አሰጣጥ እና ግምገማ ስርዓት',
    feature_payment: 'ደህንነቱ የተጠበቀ የቻፓ ክፍያ ውህደት',
    feature_roles: 'በፈላጊ እና አገልግሎት ሰጪ ሚናዎች መካከል መቀያየር',
    feature_theme: 'ቀላል እና ጨለማ ጭብጥ ድጋፍ',
    feature_language: 'አማርኛ እና እንግሊዝኛ ቋንቋ ድጋፍ',
    
    // Map Screen
    away: 'ርቀት',
    search_radius: 'የፍለጋ ራዲየስ',
    available_provider: 'የሚገኝ አገልግሎት ሰጪ',
    loading_providers: 'በአካባቢዎ ያሉ አገልግሎት ሰጪዎችን በማግኘት ላይ...',
    retry: 'እንደገና ሞክር',
    distance: 'ርቀት',
    rating: 'ደረጃ',
    status: 'ሁኔታ',
    new: 'አዲስ',
    
    // Rate Provider Screen
    rate_provider: 'አገልግሎት ሰጪውን ደረጃ ስጥ',
    service_provider: 'አገልግሎት ሰጪ',
    how_was_experience: 'ልምድዎ እንዴት ነበር?',
    tap_to_rate:'ኮከብ ይንኩ ደረጃ ለመስጠት',
    you_rated: 'ደረጃ ሰጥተዋል',
    out_of_5: 'ከ5 ኮከቦች',
    your_review: 'ግምገማዎ',
    review_placeholder: 'ስለ ልምድዎ ይንገሩን...',
    submit_rating: 'ደረጃ አስገባ',
    skip: 'ለአሁን ዘልል',
    rating_required: 'እባክዎ ደረጃ ይምረጡ (1-5 ኮከቦች)',
    rating_submitted: 'የእርስዎ ደረጃ በተሳካ ሁኔታ ገብቷል።',
    thank_you: 'እናመሰግናለን!',
    
    // Accepted Jobs Screen
    step1: 'ከ"የቀረቡ ስራዎች" ስራ ተቀበል',
    step2: '20 ብር የአገልግሎት ክፍያ ክፈል',
    step3: 'የጠያቂውን ስልክ ቁጥር አግኝ',
    step4: 'ጠያቂውን ደውል እና ወደ ቦታው ሂድ',
    step5: 'ስራውን አጠናቅቅ',
    step6: 'ጠያቂው ደረጃ ይሰጥዎታል',
    jobs_accepted: 'ስራ(ዎች) ተቀባይነት አግኝተዋል',
    pay_20_btn: 'አግኙት ለመክፈት 20 ብር ክፈል',
    pay_20_title: '20 ብር የአገልግሎት ክፍያ ክፈል',
    pay_20_message: 'የጠያቂውን መገኛ ለማግኘት ይክፈሉ',
    pay_20: '20 ብር ክፈል',
    how_to_complete: 'ስራ ለማጠናቀቅ ደረጃዎች:',
    accepted_jobs_hint: 'የተቀበሏቸው ስራዎች እዚህ ይታያሉ።',
    
    // Admin Screen
    no_pending_providers: 'ምንም በመጠባበቅ ላይ ያሉ አገልግሎት ሰጪዎች የሉም',
    registered: 'ተመዝግቧል',
    view_id: 'መታወቂያ ተመልከት',
    no_id: 'ምንም መታወቂያ የለም',
    view_certificate: 'ሰርተፊኬት ተመልከት',
    no_certificate: 'ምንም ሰርተፊኬት የለም',
    provider_verified: 'አገልግሎት ሰጪው ተረጋግጧል እና ንቁ ሆኗል',
    provider_rejected: 'አገልግሎት ሰጪው ውድቅ ተደርጓል',
    reject_provider: 'አገልግሎት ሰጪውን ውድቅ አድርግ',
    reject_confirm: 'እርግጠኛ ነዎት ይህን አገልግሎት ሰጪ ውድቅ ማድረግ ይፈልጋሉ?',
    
    // Provider Home Screen
    accept_pay: 'ተቀበል እና 20 ብር ክፈል',
    job_rejected: 'የስራ ቅናሽ ውድቅ ተደርጓል',
    fee_applies: 'ክፍያ በስራ መቀበል ላይ ይከፈላል',
    jobs_available: 'ስራ(ዎች) በአካባቢዎ ይገኛሉ',
    go_online_hint: 'ከአካባቢ ፈላጊዎች የስራ ቅናሾችን ለመቀበል በመስመር ላይ ውጡ',
    online_hint: 'በ10ኪሜ ርቀት ውስጥ ላሉ ፈላጊዎች ይታያሉ',
    offline_hint: 'የስራ ቅናሾችን ለመቀበል በመስመር ላይ ይውጡ',
    your_dashboard: 'የእርስዎ ዳሽቦርድ',
    quick_actions: 'ፈጣን ድርጊቶች',
    view_offered_jobs: 'የቀረቡ ስራዎችን ተመልከት',
    my_accepted_jobs: 'የተቀበልኳቸው ስራዎች',
    pro_tip: 'ምክር',
    pro_tip_text: 'የስራ ቅናሾችን ለመቀበል በመስመር ላይ ይሁኑ። ለጠያቂው ቦታ በተጠጋሁ መጠን የመመዛመድ እድሉ ከፍ ይላል!',
    
    // Post Request Additional
    selected_service: 'የተመረጠ አገልግሎት',
    service_category: 'የአገልግሎት ምድብ',
    select_service_error: 'እባክዎ የተወሰነ የአገልግሎት አይነት ይምረጡ',
    description_required: 'እባክዎ ምን እንደሚፈልጉ ይግለጹ',
    location_required: 'አገልግሎት ሰጪዎችን ለማዛመድ አካባቢዎ ያስፈልጋል',
    location_needed: 'አካባቢ ያስፈልጋል',
    location_permission: 'በአካባቢዎ ያሉ አገልግሎት ሰጪዎችን ለማግኘት አካባቢዎ ያስፈልጋል',
    location_error: 'አካባቢዎ ማግኘት አልተቻለም',
    providers_notified: 'አገልግሎት ሰጪ(ዎች) በአካባቢዎ ተነግረዋል!',
    view_requests: 'ጥያቄዎቼን ተመልከት',
    photo_selected: 'ፎቶ ተመርጧል',
    choose_photo: 'ፎቶ ምረጥ',
    select_category_error: 'እባክዎ የአገልግሎት ምድብ ይምረጡ',
    
    // Payment
    pay_100_title: '100 ብር የቁርጠኝነት ክፍያ ክፈል',
    pay_100_message: 'ክፍያውን ለማጠናቀቅ ወደ ቻፓ ይዘዋወራሉ',
    pay_now: 'አሁን ክፈል',
    payment_complete: 'ክፍያ አጠናቀዋል?',
    payment_verify_message: 'በቻፓ ከከፈሉ በኋላ እዚህ ተመለስ',
    not_yet: 'ገና አልከፈልኩም',
    yes_verify: 'አዎ አረጋግጥ',
    payment_url_error: 'የክፍያ አገናኝ ማግኘት አልተቻለም',
    provider: 'አገልግሎት ሰጪ',
    seeker_contact: 'የጠያቂ መገኛ ተከፍቷል',
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