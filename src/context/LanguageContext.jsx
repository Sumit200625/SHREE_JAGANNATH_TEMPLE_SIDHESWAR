import React, { createContext, useState, useContext, useEffect } from 'react';

const LanguageContext = createContext();

const translations = {
  en: {
    // Navigation
    home: "Home",
    about: "About Temple",
    darshan: "Darshan & Rituals",
    festivals: "Festival Calendar",
    seva: "Seva & Puja",
    donation: "Donation / Hundi",
    prasad: "Prasad Information",
    gallery: "Gallery",
    notices: "News & Notices",
    visit: "Plan Your Visit",
    contact: "Contact",
    adminLogin: "Admin Login",
    userAccount: "My Account",
    logout: "Logout",
    
    // Common / Global
    templeName: "Sidheswar Shree Jagannath Temple",
    location: "9JMV+VVC, Sidhaswar, Odisha 761054",
    jaiJagannath: "Jai Jagannath",
    patitaPavan: "Patita Pavan",
    viewTimings: "View Darshan Timings",
    getDirections: "Get Directions",
    donateNow: "Donate Now",
    templeStatus: "Today's Temple Status",
    open: "Open",
    closed: "Closed",
    lastUpdated: "Last updated by Temple Committee",
    fraudWarning: "Fraud Warning: Use only official temple payment and contact details.",
    learnMore: "Learn More",
    submit: "Submit",
    loading: "Loading...",
    success: "Success",
    error: "Error",
    
    // Home Page
    heroSubtitle: "Welcome to the Sacred Abode of Lord Jagannath, Balabhadra & Devi Subhadra in Ganjam",
    dailyTimings: "Daily Darshan Timings",
    morningAarti: "Morning Aarti",
    noonBhoga: "Noon Bhoga",
    eveningAarti: "Evening Aarti",
    closingTime: "Closing Time",
    upcomingFestival: "Upcoming Festival Countdown",
    days: "Days",
    hours: "Hours",
    minutes: "Minutes",
    seconds: "Seconds",
    subscribeTitle: "Devotional Updates & Notices",
    subscribeDesc: "Subscribe to receive daily notices and festival schedule announcements on WhatsApp/Email.",
    subscribePlaceholder: "Enter mobile number / email",
    subscribeBtn: "Subscribe",
    recentNotices: "Latest Temple Notices",
    viewAllNotices: "View All Notices",
    photoGalleryPreview: "Temple Gallery Showcase",
    hundiTitle: "Digital Hundi / Donation Portal",
    hundiDesc: "Support the daily seva, prasad distribution, and temple stone boundary wall construction.",
    mapsTitle: "Locate Us on Maps",
    quoteText: "|| Nilachala Nivasaya Nityaya Paramatmane | Balabhadra Subhadrabhyam Jagannathaya Te Namah ||",
    quoteTranslation: "\"Salutations to Lord Jagannath, the supreme soul residing eternally in Nilachala, along with His divine siblings Balabhadra and Subhadra.\"",

    // Seva Page
    sevaBookingTitle: "Online Seva & Puja Booking",
    sevaBookingDisclaimer: "Disclaimer: Seva booking is confirmed only after temple committee approval and official receipt generation.",
    devoteeName: "Devotee's Name",
    mobileNumber: "Mobile Number",
    emailAddress: "Email Address",
    gotra: "Gotra (Optional)",
    address: "Address",
    familyMembers: "Family Member Names (comma separated)",
    specialRequest: "Special Puja Request (Optional)",
    selectDate: "Select Auspicious Date",
    selectSevaType: "Select Seva Category",
    bookSevaBtn: "Request Seva",
    bookingRef: "Booking Reference Number",
    paymentStatus: "Payment Status",
    approvalStatus: "Approval Status",
    digitalReceipt: "Digital Receipt",

    // Donation Page
    donationTitle: "Devotional Contributions (Digital Hundi)",
    donationDisclaimer: "Please verify Bank Details before transferring. Do not send funds to any personal accounts.",
    customAmount: "Custom Amount",
    donationCategory: "Donation Purpose",
    panNumber: "PAN Card Number (Optional for Tax exemption)",
    anonymousDonation: "Make this contribution Anonymous",
    upiOption: "UPI / QR Code Payment",
    generateQR: "Generate Payment QR",
    officialBankDetails: "Official Bank Account (SBI Digapahandi)",
    ifsc: "IFSC Code",
    branch: "Branch",
    accNo: "Account No",
    monthlyTransparencyReport: "Monthly transparency report is published by the managing trust on the 1st of every month.",

    // Plan Your Visit
    visitTitle: "Plan Your Holy Visit",
    distances: "Distances to Siddheswar",
    fromDigapahandi: "From Digapahandi Town Center",
    fromBerhampur: "From Brahmapur Railway Station",
    fromBhubaneswar: "From Bhubaneswar Airport",
    transportation: "Local Transport Information",
    parkingAvailability: "Parking Facilities",
    wheelchairAssistance: "Accessibility & Wheelchair Assistance",
    nearbyAccommodations: "Nearby Dharamshalas & Hotels",
    emergencyContacts: "Emergency Helpline Numbers",
    bestTimeToVisit: "Best Season to Visit"
  },
  or: {
    // Navigation
    home: "ଗୃହ",
    about: "ମନ୍ଦିର ବିଷୟରେ",
    darshan: "ଦର୍ଶନ ଓ ସମୟ",
    festivals: "ଉତ୍ସବ କ୍ୟାଲେଣ୍ଡର",
    seva: "ସେବା ଓ ପୂଜା",
    donation: "ଦାନ / ହୁଣ୍ଡି",
    prasad: "ପ୍ରସାଦ ସୂଚନା",
    gallery: "ଗ୍ୟାଲେରୀ",
    notices: "ଖବର ଓ ନୋଟିସ୍",
    visit: "ଯାତ୍ରା ଯୋଜନା",
    contact: "ଯୋଗାଯୋଗ",
    adminLogin: "ପ୍ରଶାସନିକ ଲଗଇନ୍",
    userAccount: "ମୋର ଆକାଉଣ୍ଟ",
    logout: "ଲଗଆଉଟ୍",

    // Common / Global
    templeName: "ସିଦ୍ଧେଶ୍ୱର ଶ୍ରୀ ଜଗନ୍ନାଥ ମନ୍ଦିର",
    location: "9JMV+VVC, ସିଦ୍ଧେଶ୍ୱର, ଓଡ଼ିଶା 761054",
    jaiJagannath: "ଜୟ ଜଗନ୍ନାଥ",
    patitaPavan: "ପତିତପାବନ",
    viewTimings: "ଦର୍ଶନ ସମୟ ଦେଖନ୍ତୁ",
    getDirections: "ରାସ୍ତା ମାର୍ଗ ଦେଖନ୍ତୁ",
    donateNow: "ଦାନ କରନ୍ତୁ",
    templeStatus: "ଆଜିର ମନ୍ଦିର ସ୍ଥିତି",
    open: "ଖୋଲା ଅଛି",
    closed: "ବନ୍ଦ ଅଛି",
    lastUpdated: "ମନ୍ଦିର କମିଟି ଦ୍ୱାରା ଶେଷ ଅପଡେଟ୍",
    fraudWarning: "ଜାଲିଆତି ଚେତାବନୀ: କେବଳ ସରକାରୀ ଏବଂ ମନ୍ଦିରର ଅଫିସିଆଲ୍ ପେମେଣ୍ଟ ମାଧ୍ୟମ ବ୍ୟବହାର କରନ୍ତୁ।",
    learnMore: "ଅଧିକ ଜାଣନ୍ତୁ",
    submit: "ଦାଖଲ କରନ୍ତୁ",
    loading: "ଲୋଡ୍ ହେଉଛି...",
    success: "ସଫଳତା",
    error: "ତ୍ରୁଟି",

    // Home Page
    heroSubtitle: "ଗଞ୍ଜାମର ପବିତ୍ର ପ୍ରଭୁ ଶ୍ରୀ ଜଗନ୍ନାଥ, ବଳଭଦ୍ର ଓ ଦେବୀ ସୁଭଦ୍ରାଙ୍କ ମନ୍ଦିରକୁ ଆପଣଙ୍କୁ ସ୍ୱାଗତ",
    dailyTimings: "ଦୈନିକ ଦର୍ଶନ ସମୟ ସୂଚୀ",
    morningAarti: "ମଙ୍ଗଳ ଆଳତି",
    noonBhoga: "ମଧ୍ୟାହ୍ନ ମହାପ୍ରସାଦ",
    eveningAarti: "ସନ୍ଧ୍ୟା ଆଳତି",
    closingTime: "ପହୁଡ଼ ସମୟ",
    upcomingFestival: "ଆଗାମୀ ପର୍ବପର୍ବାଣୀ କାଉଣ୍ଟଡାଉନ",
    days: "ଦିନ",
    hours: "ଘଣ୍ଟା",
    minutes: "ମିନିଟ୍",
    seconds: "ସେକେଣ୍ଡ",
    subscribeTitle: "ଆଧ୍ୟାତ୍ମିକ ନୋଟିସ୍ ଓ ସୂଚନା",
    subscribeDesc: "ହ୍ୱାଟ୍ସଆପ୍ / ଇମେଲ୍ ରେ ଦୈନିକ ମନ୍ଦିର ନୀତି ଏବଂ ପର୍ବ ସୂଚନା ପାଇବା ପାଇଁ ପଞ୍ଜୀକରଣ କରନ୍ତୁ।",
    subscribePlaceholder: "ମୋବାଇଲ୍ ନମ୍ବର / ଇମେଲ୍ ଦିଅନ୍ତୁ",
    subscribeBtn: "ସବସ୍କ୍ରାଇବ୍",
    recentNotices: "ସଦ୍ୟତମ ମନ୍ଦିର ସୂଚନାବଳୀ",
    viewAllNotices: "ସମସ୍ତ ନୋଟିସ୍ ଦେଖନ୍ତୁ",
    photoGalleryPreview: "ମନ୍ଦିରର ସୁନ୍ଦର ଚିତ୍ରାବଳୀ",
    hundiTitle: "ଡିଜିଟାଲ୍ ଦାନ ହୁଣ୍ଡି ପୋର୍ଟାଲ୍",
    hundiDesc: "ମନ୍ଦିରର ଦୈନିକ ନୀତିକାନ୍ତି, ଅନ୍ନପ୍ରସାଦ ବିତରଣ ଏବଂ ପଥର ମେଘନାଦ ପାଚେରୀ ନିର୍ମାଣ ପାଇଁ ଦାନ କରନ୍ତୁ।",
    mapsTitle: "ମାନଚିତ୍ରରେ ଆମର ଅବସ୍ଥିତି",
    quoteText: "|| ନୀଳାଚଳ ନିବାସାୟ ନିତ୍ୟାୟ ପରମାତ୍ମନେ । ବଳଭଦ୍ର ସୁଭଦ୍ରାଭ୍ୟାଂ ଜଗନ୍ନାଥାୟ ତେ ନମଃ ॥",
    quoteTranslation: "\"ନୀଳାଚଳରେ ଅନନ୍ତ କାଳ ଧରି ବିରାଜମାନ ପରମାତ୍ମା ପ୍ରଭୁ ଜଗନ୍ନାଥ, ଭ୍ରାତା ବଳଭଦ୍ର ଓ ଭଗିନୀ ସୁଭଦ୍ରାଙ୍କୁ ବାରମ୍ବାର ପ୍ରଣାମ।\"",

    // Seva Page
    sevaBookingTitle: "ଅନଲାଇନ୍ ସେବା ଓ ପୂଜା ବୁକିଂ",
    sevaBookingDisclaimer: "ସୂଚନା: ମନ୍ଦିର ଟ୍ରଷ୍ଟ କମିଟି ଦ୍ୱାରା ଅନୁମୋଦନ ଏବଂ ଅଫିସିଆଲ୍ ରସିଦ ପ୍ରଦାନ ପରେ ହିଁ ବୁକିଂ ସଫଳ ହେବ।",
    devoteeName: "ଭକ୍ତଙ୍କ ନାମ",
    mobileNumber: "ମୋବାଇଲ୍ ନମ୍ବର",
    emailAddress: "ଇମେଲ୍ ଠିକଣା",
    gotra: "ଗୋତ୍ର (ଐଚ୍ଛିକ)",
    address: "ଠିକଣା",
    familyMembers: "ପରିବାର ସଦସ୍ୟଙ୍କ ନାମ (କମା ଚିହ୍ନ ଦେଇ ଲେଖନ୍ତୁ)",
    specialRequest: "ସ୍ୱତନ୍ତ୍ର ପୂଜା ଅନୁରୋଧ (ଐଚ୍ଛିକ)",
    selectDate: "ଶୁଭ ତାରିଖ ବାଛନ୍ତୁ",
    selectSevaType: "ସେବା ଶ୍ରେଣୀ ବାଛନ୍ତୁ",
    bookSevaBtn: "ସେବା ଅନୁରୋଧ କରନ୍ତୁ",
    bookingRef: "ବୁକିଂ ରେଫରେନ୍ସ ନମ୍ବର",
    paymentStatus: "ପେମେଣ୍ଟ ସ୍ଥିତି",
    approvalStatus: "ଅନୁମୋଦନ ସ୍ଥିତି",
    digitalReceipt: "ଡିଜିଟାଲ୍ ରସିଦ",

    // Donation Page
    donationTitle: "ଆଧ୍ୟାତ୍ମିକ ଦାନ ଅବଦାନ (ଡିଜିଟାଲ୍ ହୁଣ୍ଡି)",
    donationDisclaimer: "ଟ୍ରାନ୍ସଫର କରିବା ପୂର୍ବରୁ ବ୍ୟାଙ୍କ ତଥ୍ୟ ଯାଞ୍ଚ କରନ୍ତୁ। କୌଣସି ବ୍ୟକ୍ତିଗତ ଆକାଉଣ୍ଟକୁ ଟଙ୍କା ପଠାନ୍ତୁ ନାହିଁ।",
    customAmount: "ଇଚ୍ଛାଧୀନ ରାଶି",
    donationCategory: "ଦାନର ଉଦ୍ଦେଶ୍ୟ",
    panNumber: "ପାନ ନମ୍ବର (ଟ୍ୟାକ୍ସ ରିହାତି ପାଇଁ ଐଚ୍ଛିକ)",
    anonymousDonation: "ଏହି ଦାନକୁ ଗୁପ୍ତ ରଖନ୍ତୁ",
    upiOption: "UPI / QR କୋଡ୍ ପେମେଣ୍ଟ",
    generateQR: "QR କୋଡ୍ ପ୍ରସ୍ତୁତ କରନ୍ତୁ",
    officialBankDetails: "ଅଫିସିଆଲ୍ ବ୍ୟାଙ୍କ ଆକାଉଣ୍ଟ (SBI ଦିଗପହଣ୍ଡି)",
    ifsc: "IFSC କୋଡ୍",
    branch: "ଶାଖା",
    accNo: "ଖାତା ନମ୍ବର",
    monthlyTransparencyReport: "ପ୍ରତି ମାସ ୧ ତାରିଖରେ ମନ୍ଦିର ଟ୍ରଷ୍ଟ ଦ୍ୱାରା ଦାନର ସ୍ୱଚ୍ଛତା ରିପୋର୍ଟ ପ୍ରକାଶିତ ହୁଏ।",

    // Plan Your Visit
    visitTitle: "ମନ୍ଦିର ଦର୍ଶନ ଯୋଜନା",
    distances: "ସିଦ୍ଧେଶ୍ୱର ମନ୍ଦିରର ଦୂରତା",
    fromDigapahandi: "ଦିଗପହଣ୍ଡି ମୁଖ୍ୟ ବସଷ୍ଟାଣ୍ଡରୁ",
    fromBerhampur: "ବ୍ରହ୍ମପୁର ରେଳ ଷ୍ଟେସନରୁ",
    fromBhubaneswar: "ଭୁବନେଶ୍ୱର ବିମାନବନ୍ଦରରୁ",
    transportation: "ସ୍ଥାନୀୟ ଯାତାୟାତ ସୂଚନା",
    parkingAvailability: "ପାର୍କିଂ ବ୍ୟବସ୍ଥା",
    wheelchairAssistance: "ଶାରୀରିକ ଅକ୍ଷମଙ୍କ ପାଇଁ ହ୍ୱିଲ ଚେୟାର ସହାୟତା",
    nearbyAccommodations: "ନିକଟସ୍ଥ ଧର୍ମଶାଳା ଏବଂ ହୋଟେଲ",
    emergencyContacts: "ଜରୁରୀକାଳୀନ ହେଲ୍ପଲାଇନ ନମ୍ବର",
    bestTimeToVisit: "ଦର୍ଶନ ପାଇଁ ସର୍ବୋତ୍ତମ ସମୟ"
  },
  hi: {
    // Navigation
    home: "गृह",
    about: "मंदिर के बारे में",
    darshan: "दर्शन व अनुष्ठान",
    festivals: "उत्सव कैलेंडर",
    seva: "सेवा और पूजा",
    donation: "दान / हुंडी",
    prasad: "प्रसाद जानकारी",
    gallery: "गैलरी",
    notices: "समाचार और सूचना",
    visit: "यात्रा की योजना",
    contact: "संपर्क",
    adminLogin: "एडमिन लॉगिन",
    userAccount: "मेरा खाता",
    logout: "लॉगआउट",

    // Common / Global
    templeName: "सिद्धेश्वर श्री जगन्नाथ मंदिर",
    location: "9JMV+VVC, सिद्धेश्वर, ओडिशा 761054",
    jaiJagannath: "जय जगन्नाथ",
    patitaPavan: "पतित पावन",
    viewTimings: "दर्शन समय देखें",
    getDirections: "दिशा निर्देश प्राप्त करें",
    donateNow: "दान करें",
    templeStatus: "आज मंदिर की स्थिति",
    open: "खुला है",
    closed: "बंद है",
    lastUpdated: "मंदिर समिति द्वारा अंतिम अपडेट",
    fraudWarning: "धोखाधड़ी चेतावनी: केवल आधिकारिक मंदिर भुगतान और संपर्क विवरण का उपयोग करें।",
    learnMore: "अधिक जानें",
    submit: "जमा करें",
    loading: "लोड हो रहा है...",
    success: "सफलता",
    error: "त्रुटि",

    // Home Page
    heroSubtitle: "गंजम में भगवान जगन्नाथ, बलभद्र और देवी सुभद्रा के पवित्र निवास में आपका स्वागत है",
    dailyTimings: "दैनिक दर्शन समय",
    morningAarti: "मंगला आरती",
    noonBhoga: "मध्याह्न भोग",
    eveningAarti: "संध्या आरती",
    closingTime: "शयन काल",
    upcomingFestival: "आगामी उत्सव उलटी गिनती",
    days: "दिन",
    hours: "घंटे",
    minutes: "मिनट",
    seconds: "सेकंड",
    subscribeTitle: "भक्ति अपडेट और सूचनाएं",
    subscribeDesc: "व्हाट्सएप/ईमेल पर दैनिक मंदिर नीति और त्योहारों के समय की जानकारी प्राप्त करने के लिए सदस्यता लें।",
    subscribePlaceholder: "मोबाइल नंबर / ईमेल दर्ज करें",
    subscribeBtn: "सदस्यता लें",
    recentNotices: "नवीनतम मंदिर सूचनाएं",
    viewAllNotices: "सभी सूचनाएं देखें",
    photoGalleryPreview: "मंदिर गैलरी शो",
    hundiTitle: "डिजिटल हुंडी / दान पोर्टल",
    hundiDesc: "दैनिक सेवा, महाप्रसाद वितरण और मंदिर की पत्थर की चारदीवारी के निर्माण में योगदान दें।",
    mapsTitle: "मानचित्र पर हमारी स्थिति",
    quoteText: "|| नीलाचल निवासाय नित्याय परमात्मने | बलभद्र सुभद्राभ्याम् जगन्नाथाय ते नमः ||",
    quoteTranslation: "\"नीलाचल धाम में शाश्वत निवास करने वाले परमपिता भगवान जगन्नाथ, भ्राता बलभद्र और भगिनी सुभद्रा को कोटि-कोटि नमन।\"",

    // Seva Page
    sevaBookingTitle: "ऑनलाइन सेवा और पूजा बुकिंग",
    sevaBookingDisclaimer: "अस्वीकरण: सेवा बुकिंग की पुष्टि केवल मंदिर समिति की मंजूरी और आधिकारिक रसीद के बाद ही की जाएगी।",
    devoteeName: "भक्त का नाम",
    mobileNumber: "मोबाइल नंबर",
    emailAddress: "ईमेल पता",
    gotra: "गोत्र (वैकल्पिक)",
    address: "पता",
    familyMembers: "परिवार के सदस्यों के नाम (अल्पविराम से अलग)",
    specialRequest: "विशेष पूजा अनुरोध (वैकल्पिक)",
    selectDate: "शुभ तिथि चुनें",
    selectSevaType: "सेवा श्रेणी चुनें",
    bookSevaBtn: "सेवा का अनुरोध करें",
    bookingRef: "बुकिंग संदर्भ संख्या",
    paymentStatus: "भुगतान की स्थिति",
    approvalStatus: "मंजूरी की स्थिति",
    digitalReceipt: "डिजिटल रसीद",

    // Donation Page
    donationTitle: "भक्तिपूर्ण दान योगदान (डिजिटल हुंडी)",
    donationDisclaimer: "स्थानांतरण से पहले बैंक विवरण सत्यापित करें। किसी भी व्यक्तिगत खाते में राशि न भेजें।",
    customAmount: "कस्टम राशि",
    donationCategory: "दान का उद्देश्य",
    panNumber: "पैन नंबर (कर छूट के लिए वैकल्पिक)",
    anonymousDonation: "इस योगदान को गुप्त रखें",
    upiOption: "UPI / QR कोड भुगतान",
    generateQR: "भुगतान QR कोड बनाएं",
    officialBankDetails: "आधिकारिक बैंक खाता (SBI दिगपहंडी)",
    ifsc: "IFSC कोड",
    branch: "शाखा",
    accNo: "खाता नंबर",
    monthlyTransparencyReport: "प्रबंधक ट्रस्ट द्वारा हर महीने की 1 तारीख को दान की पारदर्शिता रिपोर्ट प्रकाशित की जाती है।",

    // Plan Your Visit
    visitTitle: "दर्शन यात्रा की योजना",
    distances: "सिद्धेश्वर मंदिर की दूरी",
    fromDigapahandi: "दिगपहंडी मुख्य बस स्टैंड से",
    fromBerhampur: "ब्रह्मपुर रेलवे स्टेशन से",
    fromBhubaneswar: "भुवनेश्वर हवाई अड्डे से",
    transportation: "स्थानीय परिवहन जानकारी",
    parkingAvailability: "पार्किंग की व्यवस्था",
    wheelchairAssistance: "शारीरिक विकलांगों के लिए व्हीलचेयर सहायता",
    nearbyAccommodations: "निकटतम धर्मशालाएं और होटल",
    emergencyContacts: "आपातकालीन हेल्पलाइन नंबर",
    bestTimeToVisit: "दर्शन के लिए सबसे अच्छा समय"
  }
};

export const LanguageProvider = ({ children }) => {
  const [language, setLanguageState] = useState(() => {
    return localStorage.getItem('temple-lang') || 'en';
  });

  const setLanguage = (lang) => {
    setLanguageState(lang);
    localStorage.setItem('temple-lang', lang);
  };

  const t = (key) => {
    return translations[language][key] || translations['en'][key] || key;
  };

  // Synchronize document direction and lang attribute
  useEffect(() => {
    document.documentElement.lang = language;
  }, [language]);

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => useContext(LanguageContext);
