// Defaults used by BOTH the website and the server. Sevas, timings and events can be changed later from the Admin panel;
// the server never trusts an amount sent by the browser - it always looks the price up in the database.

export const SEVAS = [
  { name: "Annadan Seva (Mahaprasad)", price: 1100, desc: "Feed visiting pilgrims and saints. Earthen kudua pot mahaprasad meals." },
  { name: "Pushpalankara & Puja Seva", price: 501, desc: "Sponsor flower garlands (tulasi, marigold) for deity decoration." },
  { name: "Daily Morning Balabhoga Seva", price: 251, desc: "Sponsor morning breakfast sweets and coconuts." },
  { name: "Khadya Bhoga & Evening Aarti", price: 751, desc: "Evening dry bhoga offering and special light aarti." },
  { name: "Anna Daan Seva (Large Group - 50 Pilgrims)", price: 5001, desc: "Feed up to 50 pilgrims in the Anandabazar complex." },
  { name: "Temple Development Seva (Stone Boundary Wall)", price: 2500, desc: "Contribute to the construction of Meghnad Pacheri boundary stone wall." },
];

// Donation purposes shown on the site (the older keys stay valid so old receipts still display)
export const DONATION_PURPOSES = [
  { key: 'general_fund', label: 'General Donation', or: 'ସାଧାରଣ ଦାନ', hi: 'सामान्य दान' },
  { key: 'anna_daan', label: 'Anna Daan', or: 'ଅନ୍ନ ଦାନ', hi: 'अन्न दान' },
  { key: 'temple_development', label: 'Temple Development', or: 'ମନ୍ଦିର ବିକାଶ', hi: 'मंदिर विकास' },
  { key: 'festival_fund', label: 'Festival Seva', or: 'ଉତ୍ସବ ସେବା', hi: 'उत्सव सेवा' },
];
export const DONATION_CATEGORIES = [
  'general_fund', 'anna_daan', 'festival_fund', 'temple_development', 'construction_fund', 'cleanliness_fund', 'charity',
];
export const CATEGORY_LABELS = {
  general_fund: 'General Donation', anna_daan: 'Anna Daan', temple_development: 'Temple Development', festival_fund: 'Festival Seva',
  construction_fund: 'Temple Boundary Construction', cleanliness_fund: 'Temple Cleanliness', charity: 'Charity',
};

export const MIN_DONATION = 50;       // INR
export const MAX_DONATION = 500000;   // INR per online payment

// Time slots offered for sevas unless the admin sets different ones (they stay inside the temple's open hours)
export const DEFAULT_SLOTS = ['Morning (05:00 AM - 11:00 AM)', 'Evening (04:00 PM - 07:30 PM)'];

// Sevas that are listed in the Admin panel but hidden from devotees until the committee enters the real price and switches them on
export const DRAFT_SEVAS = [
  { name: 'Archana', price: 0, desc: 'Archana (offering of prayers with the devotee\'s name, gotra and nakshatra).' },
  { name: 'Abhishekam', price: 0, desc: 'Abhishekam (ritual bathing of the deity) on behalf of the devotee.' },
  { name: 'Special Puja', price: 0, desc: 'Special Puja performed on behalf of the devotee for a personal sankalpa.' },
];

export const NAKSHATRAS = [
  'Ashwini', 'Bharani', 'Krittika', 'Rohini', 'Mrigashira', 'Ardra', 'Punarvasu', 'Pushya', 'Ashlesha', 'Magha', 'Purva Phalguni', 'Uttara Phalguni', 'Hasta', 'Chitra',
  'Swati', 'Vishakha', 'Anuradha', 'Jyeshtha', 'Mula', 'Purva Ashadha', 'Uttara Ashadha', 'Shravana', 'Dhanishta', 'Shatabhisha', 'Purva Bhadrapada', 'Uttara Bhadrapada', 'Revati',
];

// Daily darshan / ritual schedule (editable in Admin > Timings)
export const DEFAULT_TIMINGS = [
  {
    "time": "05:00 AM - 05:30 AM",
    "eventEn": "Dwara Fita",
    "eventOr": "ଦ୍ୱାର ଫିଟା",
    "eventHi": "द्वार खोलना",
    "descEn": "Dwara Fita — temple doors open",
    "descOr": "ମନ୍ଦିର ଦ୍ୱାର ଖୋଲିବା ଏବଂ ମଙ୍ଗଳ ବାଦ୍ୟ",
    "descHi": "मंदिर के कपाट खोलना"
  },
  {
    "time": "05:30 AM - 06:00 AM",
    "eventEn": "Abakash",
    "eventOr": "ଅବକାଶ ନୀତି",
    "eventHi": "अबकाश",
    "descEn": "Abakash — morning cleansing/bathing rituals",
    "descOr": "ମହାପ୍ରଭୁଙ୍କ ସ୍ନାନ ଓ ମୁଖଶୋଧନ",
    "descHi": "सुबह का स्नान और मुखमार्जन"
  },
  {
    "time": "06:00 AM - 07:00 AM",
    "eventEn": "Mailam and Besa",
    "eventOr": "ମଇଲମ ଓ ବେଶ",
    "eventHi": "मैलम और वेश",
    "descEn": "Mailam and Besa — new dress and decoration",
    "descOr": "ନୂତନ ବସ୍ତ୍ର ଓ ପୁଷ୍ପ ଶୃଙ୍ଗାର",
    "descHi": "नवीन वस्त्र और पुष्प श्रृंगार"
  },
  {
    "time": "07:00 AM - 08:00 AM",
    "eventEn": "Sahanamela",
    "eventOr": "ସାହାଣମେଲା",
    "eventHi": "सहानमेला",
    "descEn": "Sahanamela — closer public darshan, when permitted",
    "descOr": "ଭକ୍ତମାନଙ୍କ ପାଇଁ ନିକଟ ଦର୍ଶନ ସମୟ",
    "descHi": "भक्तों के लिए समीप दर्शन"
  },
  {
    "time": "08:00 AM - 09:00 AM",
    "eventEn": "Surya Dwarapaala Puja",
    "eventOr": "ରୋଷ ହୋମ, ସୂର୍ଯ୍ୟ ପୂଜା ଓ ଦ୍ୱାରପାଳ ପୂଜା",
    "eventHi": "रोष होम, सूर्य पूजा, द्वारपाल पूजा",
    "descEn": "Rosa Homa, Surya Puja, Dwarapala Puja",
    "descOr": "ମନ୍ଦିର ରୋଷଘର ହୋମ, ଭାନୁ ପୂଜା ଓ ଦ୍ୱାର ରକ୍ଷକ ପୂଜା",
    "descHi": "रसोईघर हवन, सूर्य पूजा और द्वारपाल पूजा"
  },
  {
    "time": "09:00 AM - 09:30 AM",
    "eventEn": "Sakala Dhupa",
    "eventOr": "ସକାଳ ଧୂପ",
    "eventHi": "सकाल धूप",
    "descEn": "Sakala Dhupa — main morning food offering and puja",
    "descOr": "ଖେଚୁଡ଼ି ଓ ଅନ୍ନପ୍ରସାଦ ସହ ସକାଳ ଧୂପ ପୂଜା",
    "descHi": "सुबह का मुख्य भोजन भोग और पूजा"
  },
  {
    "time": "09:30 AM - 10:30 AM",
    "eventEn": "Bhoga Mandap Bhoga",
    "eventOr": "ଭୋଗ ମଣ୍ଡପ ଭୋଗ",
    "eventHi": "भोग मण्डप भोग",
    "descEn": "Bhoga Mandap Bhoga — large offering of Mahaprasad",
    "descOr": "ବୃହତ ମହାପ୍ରସାଦ ଅନ୍ନ ଧୂପ ଅର୍ପଣ",
    "descHi": "महाप्रसाद का मुख्य दोपहर भोग"
  },
  {
    "time": "11:00 AM - 04:00 PM",
    "eventEn": "Pahuda",
    "eventOr": "ଦିବା ପହୁଡ଼",
    "eventHi": "शयन",
    "descEn": "Pahuda — rest period; darshan is paused",
    "descOr": "ପହୁଡ଼ — ବିଶ୍ରାମ ସମୟ; ଦର୍ଶନ ବନ୍ଦ ରହେ",
    "descHi": "पहुड़ — विश्राम का समय; दर्शन बंद रहते हैं"
  },
  {
    "time": "04:00 PM - 06:00 PM",
    "eventEn": "Reopening",
    "eventOr": "ପୁନଃ ଦ୍ୱାର ଫିଟା",
    "eventHi": "पुनः द्वार खुलना",
    "descEn": "Reopening — temple doors open again for darshan",
    "descOr": "ପୁନଃ ଦ୍ୱାର ଫିଟା — ଦର୍ଶନ ପାଇଁ ମନ୍ଦିର ପୁଣି ଖୋଲେ",
    "descHi": "पुनः द्वार खुलना — दर्शन के लिए मंदिर फिर से खुलता है"
  },
  {
    "time": "06:00 PM - 07:30 PM",
    "eventEn": "Sandhya Arati & Sandhya Dhupa",
    "eventOr": "ସନ୍ଧ୍ୟା ଆଳତି ଓ ସନ୍ଧ୍ୟା ଧୂପ",
    "eventHi": "संध्या आरती और धूप",
    "descEn": "Sandhya Arati and Sandhya Dhupa — evening arati and offering",
    "descOr": "ସନ୍ଧ୍ୟା ଆଳତି ଓ ଧୂପ ଦର୍ଶନ",
    "descHi": "शाम की भव्य आरती और भोग"
  },
  {
    "time": "08:00 PM - 09:00 PM",
    "eventEn": "Sankirtana",
    "eventOr": "ସଂକୀର୍ତ୍ତନ",
    "eventHi": "संकीर्तन",
    "descEn": "Sankirtan (ramtarak mahamantra jap)",
    "descOr": "ରାମତାରକ ମହାମନ୍ତ୍ର ଜପ ଓ ନାମ ସଂକୀର୍ତ୍ତନ",
    "descHi": "रामतारक महामंत्र जाप और संकीर्तन"
  },
  {
    "time": "09:00 PM - 10:00 PM",
    "eventEn": "Ratri Bhoga",
    "eventOr": "ରାତ୍ରି ଭୋଗ",
    "eventHi": "रात्रि भोग",
    "descEn": "Ratri Bhoga — night offering",
    "descOr": "ରାତ୍ରି ଶେଷ ଧୂପ ସେବା",
    "descHi": "रात्रि का अंतिम भोग"
  },
  {
    "time": "10:00 PM - 11:00 PM",
    "eventEn": "Khata Seja Lagi",
    "eventOr": "ଖଟ ସେଜ ଲାଗି",
    "eventHi": "खट सेज लागि",
    "descEn": "Khata Seja Lagi — bedding ritual; Lord Jagannath retires for the night and the temple closes",
    "descOr": "ଖଟ ସେଜ ଲାଗି — ଶୟନ ନୀତି; ପ୍ରଭୁ ଶ୍ରୀ ଜଗନ୍ନାଥ ବିଶ୍ରାମ କରନ୍ତି ଓ ମନ୍ଦିର ବନ୍ଦ ହୁଏ",
    "descHi": "खट सेज लागि — शयन अनुष्ठान; भगवान जगन्नाथ विश्राम करते हैं और मंदिर बंद होता है"
  }
];
