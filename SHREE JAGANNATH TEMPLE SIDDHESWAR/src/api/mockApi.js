// Mock API layer for Sidheswar Shree Jagannath Temple React Application
// Persists state to localStorage so changes reflect across refreshes and logins.

const LATENCY = 400; // Simulated network delay in ms

// Seed Data definition
const SEED_NOTICES = [
  {
    id: "not_1",
    titleEn: "Devotee Registration for Kartik Brata passes",
    titleOr: "କାର୍ତ୍ତିକ ବ୍ରତ ପାସ ପାଇଁ ଶ୍ରଦ୍ଧାଳୁ ପଞ୍ଜୀକରଣ",
    titleHi: "कार्तिक व्रत पास के लिए श्रद्धालु पंजीकरण",
    contentEn: "Devotees visiting during Kartik Brata (starting in October) are advised to register at the Temple Trust Office for early morning Darshan passes. Queue management measures are being established.",
    contentOr: "କାର୍ତ୍ତିକ ବ୍ରତ ସମୟରେ (ଅକ୍ଟୋବରରୁ ଆରମ୍ଭ) ଆସୁଥିବା ଶ୍ରଦ୍ଧାଳୁମାନଙ୍କୁ ସକାଳୁ ଦର୍ଶନ ପାସ ପାଇଁ ମନ୍ଦିର ଟ୍ରଷ୍ଟ କାର୍ଯ୍ୟାଳୟରେ ପଞ୍ଜୀକରଣ କରିବାକୁ ପରାମର୍ଶ ଦିଆଯାଇଛି।",
    contentHi: "कार्तिक व्रत (अक्टूबर से शुरू) के दौरान आने वाले श्रद्धालुओं को सलाह दी जाती है कि वे सुबह के दर्शन पास के लिए मंदिर ट्रस्ट कार्यालय में पंजीकरण कराएं।",
    category: "urgent",
    isPinned: true,
    publishDate: "2026-07-04",
    expiryDate: "2026-11-30",
    pdfUrl: "#"
  },
  {
    id: "not_2",
    titleEn: "Weekly Annadan Seva inside Anandabazar Complex",
    titleOr: "ସାପ୍ତାହିକ ଅନ୍ନଦାନ ସେବା ଆନନ୍ଦବଜାର ପରିସରରେ",
    titleHi: "साप्ताहिक अन्नदान सेवा आनंदबाजार परिसर में",
    contentEn: "Annadan Seva (Mahaprasad Distribution) is now fully operational every Sunday from 1:00 PM to 3:00 PM in the new Anandabazar complex behind the temple.",
    contentOr: "ପ୍ରତି ରବିବାର ମଧ୍ୟାହ୍ନ ୧:୦୦ ରୁ ୩:୦୦ ପର୍ଯ୍ୟନ୍ତ ମନ୍ଦିର ପଛପାର୍ଶ୍ଵରେ ଥିବା ଆନନ୍ଦବଜାର ପରିସରରେ ଅନ୍ନଦାନ ସେବା (ମହାପ୍ରସାଦ ସେବନ) ସମ୍ପୂର୍ଣ୍ଣ କାର୍ଯ୍ୟକାରୀ ହେବ।",
    contentHi: "अन्नदान सेवा (महाप्रसाद वितरण) अब मंदिर के पीछे नए आनंदबाजार परिसर में हर रविवार दोपहर 1:00 बजे से 3:00 बजे तक पूरी तरह से चालू है।",
    category: "general",
    isPinned: false,
    publishDate: "2026-06-30",
    expiryDate: "2026-12-31",
    pdfUrl: "#"
  },
  {
    id: "not_3",
    titleEn: "Donations for Boundary Wall construction accepted",
    titleOr: "ସୀମା ପ୍ରାଚୀର ନିର୍ମାଣ ପାଇଁ ଦାନ ଗ୍ରହଣ କରାଯାଉଛି",
    titleHi: "सीमा पर्ची निर्माण के लिए दान स्वीकार किए जाते हैं",
    contentEn: "Donations for the construction of the new boundary wall (Meghnad Pacheri) are accepted through UPI, Net Banking, and at the Temple Office counters. Receipt will be provided instantly.",
    contentOr: "ନୂତନ ସୀମା ପ୍ରାଚୀର (ମେଘନାଦ ପାଚେରୀ) ନିର୍ମାଣ ପାଇଁ ଦାନ UPI, ନେଟ୍ ବ୍ୟାଙ୍କିଙ୍ଗ୍ ଏବଂ ମନ୍ଦିର କାର୍ଯ୍ୟାଳୟ କାଉଣ୍ଟର ମାଧ୍ୟମରେ ଗ୍ରହଣ କରାଯାଉଛି। ରସିଦ ତୁରନ୍ତ ପ୍ରଦାନ କରାଯିବ।",
    contentHi: "नया सीमा पर्ची (मेघनाद पचेरी) के निर्माण के लिए दान यूपीआई, नेट बैंकिंग और मंदिर कार्यालय काउंटर के माध्यम से स्वीकार किए जाते हैं। रसीद तुरंत प्रदान की जाएगी।",
    category: "committee",
    isPinned: false,
    publishDate: "2026-06-15",
    expiryDate: "2026-09-30",
    pdfUrl: "#"
  }
];

const SEED_FESTIVALS = [
  {
    id: "fest_1",
    festivalNameEnglish: "Rath Yatra (Chariot Festival)",
    festivalNameOdia: "ଶ୍ରୀ ଗୁଣ୍ଡିଚା ରଥଯାତ୍ରା",
    festivalNameHindi: "श्री गुंडिचा रथ यात्रा",
    date: "2026-06-26",
    startTime: "06:00 AM",
    endTime: "09:00 PM",
    category: "Major Festival",
    status: "Tentative — subject to temple committee confirmation",
    shortDescription: "The grand chariot procession of Lord Jagannath, Balabhadra, and Subhadra to Gundicha Temple.",
    fullDescription: "Rath Yatra is the most auspicious annual festival. Lord Jagannath, Lord Balabhadra, and Devi Subhadra ride their respective wooden chariots (Nandighosa, Taladhwaja, and Debadalana) to the Gundicha temple, pulled by thousands of devotees in a mass assembly of faith.",
    ritualSchedule: "06:30 AM Mangala Alati, 08:30 AM Pahandi Bije, 11:30 AM Chera Pahanra, 03:00 PM Chariot Pulling",
    visitorGuidelines: "Expect extremely large crowds. Follow instructions from police and volunteers. Wheelchair assistance is available at VIP block bypass.",
    parkingInformation: "Two-wheeler parking at High School Ground. Heavy vehicles and cars must park at the Block Office Bypass bypass road.",
    contactInformation: "+91 94371 99999 / Temple Office Control",
    imageUrl: "/assets/rath_yatra.png",
    isFeatured: true,
    isPublished: true,
    lastUpdated: "2026-07-04"
  },
  {
    id: "fest_2",
    festivalNameEnglish: "Deba Snana Purnima",
    festivalNameOdia: "ଦେବ ସ୍ନାନ ପୂର୍ଣ୍ଣିମା",
    festivalNameHindi: "देव स्नान पूर्णिमा",
    date: "2026-06-09",
    startTime: "05:00 AM",
    endTime: "09:30 PM",
    category: "Jagannath Ritual",
    status: "Tentative — subject to temple committee confirmation",
    shortDescription: "The bathing festival of the deities followed by the famous Hati Besha (Elephant attire).",
    fullDescription: "Snana Purnima is the bathing festival of Lord Jagannath, Balabhadra, and Subhadra. The deities are escorted to the Snana Mandapa and bathed with 108 pots of perfumed water. Afterwards, they dress in the Ganesha-like Hati Besha.",
    ritualSchedule: "06:00 AM Jalabhishek, 11:00 AM Snana Niti, 04:00 PM Hati Besha, 08:00 PM Pahada",
    visitorGuidelines: "Photography of Snana Niti is prohibited. Keep queue discipline.",
    parkingInformation: "Free parking at Block Office Ground with shuttle rickshaws.",
    contactInformation: "+91 94371 99999",
    imageUrl: "/assets/deity_darshan.png",
    isFeatured: true,
    isPublished: true,
    lastUpdated: "2026-07-04"
  },
  {
    id: "fest_3",
    festivalNameEnglish: "Makar Sankranti",
    festivalNameOdia: "ମକର ସଂକ୍ରାନ୍ତି",
    festivalNameHindi: "मकर संक्रांति",
    date: "2026-01-14",
    startTime: "05:30 AM",
    endTime: "08:30 PM",
    category: "Major Festival",
    status: "Tentative — subject to temple committee confirmation",
    shortDescription: " Transit of Sun into Capricorn celebrated with Makar Chaula bhoga offerings.",
    fullDescription: "Marks the change of solar cycles. Special Makar Chaula (harvest sweet uncooked rice, ghee, banana, and coconut) is offered to Lord Jagannath. The deities are dressed in Makar Vesha.",
    ritualSchedule: "06:00 AM Mangala Aarti, 10:00 AM Makar Chaula offering, 06:30 PM Sandhya Aarti",
    visitorGuidelines: "Arrive early to buy Makar Chaula packages. Long queues expected.",
    parkingInformation: "Normal temple parking available.",
    contactInformation: "+91 94371 99999",
    imageUrl: "/assets/temple_exterior.png",
    isFeatured: false,
    isPublished: true,
    lastUpdated: "2026-07-04"
  },
  {
    id: "fest_4",
    festivalNameEnglish: "Basant Panchami / Saraswati Puja",
    festivalNameOdia: "ବସନ୍ତ ପଞ୍ଚମୀ",
    festivalNameHindi: "बसंत पंचमी / सरस्वती पूजा",
    date: "2026-01-23",
    startTime: "06:00 AM",
    endTime: "08:00 PM",
    category: "Special Puja",
    status: "Tentative — subject to temple committee confirmation",
    shortDescription: "Offering of yellow flowers and launching the chariot wood collection rituals.",
    fullDescription: "Saraswati Puja marks the onset of spring. At the Jagannath temple, special yellow garments are offered, and the first log of wood for the Rath Yatra chariots is officially sanctified.",
    ritualSchedule: "07:00 AM Saraswati Puja rituals, 10:00 AM Chariot wood log worship",
    visitorGuidelines: "Yellow attire is encouraged for devotees visiting on this day.",
    parkingInformation: "Temple outer ground parking.",
    contactInformation: "+91 94371 99999",
    imageUrl: "/assets/temple_exterior.png",
    isFeatured: false,
    isPublished: true,
    lastUpdated: "2026-07-04"
  },
  {
    id: "fest_5",
    festivalNameEnglish: "Maha Shivaratri",
    festivalNameOdia: "ମହା ଶିବରାତ୍ରୀ",
    festivalNameHindi: "महा शिवरात्रि",
    date: "2026-02-15",
    startTime: "05:00 AM",
    endTime: "11:50 PM",
    category: "Local Temple Festival",
    status: "Tentative — subject to temple committee confirmation",
    shortDescription: "Special night long lamp offerings at the Shiva shrines within the temple complex.",
    fullDescription: "Although primarily a Jagannath shrine, Maha Shivaratri is celebrated at the Shiva temples situated in the outer wall campus, demonstrating the Harihara union.",
    ritualSchedule: "06:00 AM Rudrabhishek, 10:00 PM Hari-Hara Puja, 11:30 PM Mahadipa lifting",
    visitorGuidelines: "Fasting devotees are requested to wait in designated pandals for Mahadipa.",
    parkingInformation: "High School Bypass ground.",
    contactInformation: "+91 94371 99999",
    imageUrl: "/assets/temple_exterior.png",
    isFeatured: false,
    isPublished: true,
    lastUpdated: "2026-07-04"
  },
  {
    id: "fest_6",
    festivalNameEnglish: "Dola Purnima",
    festivalNameOdia: "ଦୋଳ ପୂର୍ଣ୍ଣିମା",
    festivalNameHindi: "डोल पूर्णिमा",
    date: "2026-03-03",
    startTime: "05:30 AM",
    endTime: "09:00 PM",
    category: "Major Festival",
    status: "Tentative — subject to temple committee confirmation",
    shortDescription: "Spring festival of colours with deities placed on swing platforms (Dola Bedi).",
    fullDescription: "Celebrated on spring full moon. Dola Govinda (merger form of Krishna-Jagannath) is placed on a beautifully decorated swing platform, and devotees offer Abira (natural color powder).",
    ritualSchedule: "08:00 AM Pahandi to Dola Bedi, 11:00 AM Abira offering, 05:00 PM Rajarajeshwar Besha",
    visitorGuidelines: "Use only dry organic colors (gulal/abir) inside premises. Avoid liquid paint.",
    parkingInformation: "Block Office parking area.",
    contactInformation: "+91 94371 99999",
    imageUrl: "/assets/deity_darshan.png",
    isFeatured: false,
    isPublished: true,
    lastUpdated: "2026-07-04"
  },
  {
    id: "fest_7",
    festivalNameEnglish: "Pana Sankranti / Odia New Year",
    festivalNameOdia: "ପଣା ସଂକ୍ରାନ୍ତି / ଓଡ଼ିଆ ନବବର୍ଷ",
    festivalNameHindi: "पना संक्रांति / ओड़िया नववर्ष",
    date: "2026-04-14",
    startTime: "05:00 AM",
    endTime: "08:30 PM",
    category: "Major Festival",
    status: "Tentative — subject to temple committee confirmation",
    shortDescription: "Odia New Year celebrated with distribution of Pana sweet drinks.",
    fullDescription: "Pana Sankranti marks the new solar year in Odisha. A special clay pot with a small hole is hung over the sacred Tulasi plant, and Pana (sweet herbal fruit drink) is offered and distributed to visitors.",
    ritualSchedule: "06:30 AM Hanuman Puja, 10:30 AM Pana offering, 01:00 PM Free Pana distribution counter",
    visitorGuidelines: "Free pana drink cups will be distributed at the main gate.",
    parkingInformation: "Temple ground parking open.",
    contactInformation: "+91 94371 99999",
    imageUrl: "/assets/temple_exterior.png",
    isFeatured: false,
    isPublished: true,
    lastUpdated: "2026-07-04"
  },
  {
    id: "fest_8",
    festivalNameEnglish: "Akshaya Tritiya",
    festivalNameOdia: "ଅକ୍ଷୟ ତୃତୀୟା",
    festivalNameHindi: "अक्षय तृतीया",
    date: "2026-04-20",
    startTime: "06:00 AM",
    endTime: "08:00 PM",
    category: "Jagannath Ritual",
    status: "Tentative — subject to temple committee confirmation",
    shortDescription: "Commencement of Chariot construction and start of Chandan Yatra.",
    fullDescription: "Akshaya Tritiya is highly sacred. Chariot builders formally start carving the logs (Ratha Anukula). This also marks the beginning of the 21-day water cruise Chandan Yatra.",
    ritualSchedule: "08:00 AM Ratha wood worship, 10:00 AM Chandan paste grinding",
    visitorGuidelines: "Observe the wood carving artisans outside the temple boundary.",
    parkingInformation: "Outer bypass road parking.",
    contactInformation: "+91 94371 99999",
    imageUrl: "/assets/temple_exterior.png",
    isFeatured: false,
    isPublished: true,
    lastUpdated: "2026-07-04"
  },
  {
    id: "fest_9",
    festivalNameEnglish: "Chandan Yatra",
    festivalNameOdia: "ଶ୍ରୀ ଚନ୍ଦନ ଯାତ୍ରା",
    festivalNameHindi: "चंदन यात्रा",
    date: "2026-04-20",
    startTime: "04:00 PM",
    endTime: "08:30 PM",
    category: "Jagannath Ritual",
    status: "Tentative — subject to temple committee confirmation",
    shortDescription: "21-day summer cruise of Madan Mohan in the temple pond.",
    fullDescription: "To soothe the deities during hot summer, Madan Mohan and representatives are smeared with sandalwood paste and taken on beautifully decorated boats (Chapa) in the temple tank.",
    ritualSchedule: "04:30 PM Deity procession to pond, 05:30 PM Water cruise (Chapa Yatra)",
    visitorGuidelines: "Avoid standing on slippery edges of the temple pond. Stay behind barricades.",
    parkingInformation: "Temple pond bypass road.",
    contactInformation: "+91 94371 99999",
    imageUrl: "/assets/deity_darshan.png",
    isFeatured: false,
    isPublished: true,
    lastUpdated: "2026-07-04"
  },
  {
    id: "fest_10",
    festivalNameEnglish: "Anasara Period",
    festivalNameOdia: "ଅଣସର ସମୟ",
    festivalNameHindi: "अनासर काल",
    date: "2026-06-10",
    startTime: "05:00 AM",
    endTime: "09:00 PM",
    category: "Jagannath Ritual",
    status: "Tentative — subject to temple committee confirmation",
    shortDescription: "15-day recovery period where deities rest inside the Anasara chamber.",
    fullDescription: "Following the heavy bath of Snana Purnima, the deities are believed to fall ill with fever. They rest in the private Anasara chamber for 15 days, where only special herbal treatments (Dasamula) are offered.",
    ritualSchedule: "No public Darshan of deities. Devotees worship Patita Pavan or Alarnath paintings.",
    visitorGuidelines: "Main sanctum is closed. View the Patita Pavan image at the outer courtyard.",
    parkingInformation: "Temple general parking.",
    contactInformation: "+91 94371 99999",
    imageUrl: "/assets/deity_darshan.png",
    isFeatured: false,
    isPublished: true,
    lastUpdated: "2026-07-04"
  },
  {
    id: "fest_11",
    festivalNameEnglish: "Netrotsava",
    festivalNameOdia: "ନେତ୍ରୋତ୍ସବ",
    festivalNameHindi: "नेत्रोत्सव",
    date: "2026-06-25",
    startTime: "06:00 AM",
    endTime: "09:00 PM",
    category: "Jagannath Ritual",
    status: "Tentative — subject to temple committee confirmation",
    shortDescription: "Re-opening of temple gates after Anasara sickness.",
    fullDescription: "Netrotsava (Festival of the Eyes) is when the deities recover from illness and their eyes are painted anew (Naba Jaubana Darshan) before they step out for Rath Yatra.",
    ritualSchedule: "06:00 AM Naba Jaubana Darshan, 10:00 AM Netrotsava Puja offering",
    visitorGuidelines: "Huge rush expected after 15 days of closure. Cooperate with staff.",
    parkingInformation: "High School Ground.",
    contactInformation: "+91 94371 99999",
    imageUrl: "/assets/deity_darshan.png",
    isFeatured: false,
    isPublished: true,
    lastUpdated: "2026-07-04"
  },
  {
    id: "fest_12",
    festivalNameEnglish: "Hera Panchami",
    festivalNameOdia: "ହେରା ପଞ୍ଚମୀ",
    festivalNameHindi: "हेरा पंचमी",
    date: "2026-06-30",
    startTime: "05:00 PM",
    endTime: "10:00 PM",
    category: "Jagannath Ritual",
    status: "Tentative — subject to temple committee confirmation",
    shortDescription: "Goddess Laxmi visits Gundicha Temple in anger to retrieve Lord Jagannath.",
    fullDescription: "On the fifth day of Rath Yatra, Goddess Lakshmi goes to Gundicha Temple to find Lord Jagannath, breaking a part of His chariot in anger for not being taken along.",
    ritualSchedule: "06:30 PM Goddess Laxmi procession, 08:30 PM Chariot breaking ritual",
    visitorGuidelines: "Perform offering to Goddess Lakshmi during her procession path.",
    parkingInformation: "Block Office bypass road.",
    contactInformation: "+91 94371 99999",
    imageUrl: "/assets/rath_yatra.png",
    isFeatured: false,
    isPublished: true,
    lastUpdated: "2026-07-04"
  },
  {
    id: "fest_13",
    festivalNameEnglish: "Bahuda Yatra",
    festivalNameOdia: "ବାହୁଡ଼ା ଯାତ୍ରା",
    festivalNameHindi: "बहुड़ा यात्रा",
    date: "2026-07-04",
    startTime: "06:00 AM",
    endTime: "08:30 PM",
    category: "Major Festival",
    status: "Tentative — subject to temple committee confirmation",
    shortDescription: "The return procession of the chariots to the main temple.",
    fullDescription: "Bahuda Yatra is the return journey of Lord Jagannath, Lord Balabhadra, and Devi Subhadra from Gundicha Temple back to their main temple after 9 days.",
    ritualSchedule: "07:00 AM Bahuda Pahandi, 12:00 PM Chariot pulling starts",
    visitorGuidelines: "Do not stand directly in front of the wheels. Stay in queue.",
    parkingInformation: "High School Bypass grounds.",
    contactInformation: "+91 94371 99999",
    imageUrl: "/assets/rath_yatra.png",
    isFeatured: false,
    isPublished: true,
    lastUpdated: "2026-07-04"
  },
  {
    id: "fest_14",
    festivalNameEnglish: "Suna Besha",
    festivalNameOdia: "ସୁନା ବେଶ",
    festivalNameHindi: "सुना वेश (स्वर्ण रूप)",
    date: "2026-07-05",
    startTime: "03:00 PM",
    endTime: "11:00 PM",
    category: "Major Festival",
    status: "Tentative — subject to temple committee confirmation",
    shortDescription: "The deities dressed in solid gold ornaments on their chariots.",
    fullDescription: "Also known as Rajadhiraja Besha, the deities are adorned in massive gold crowns, hands, and ornaments directly on their chariots parked in front of the temple.",
    ritualSchedule: "04:00 PM Golden ornaments dressing, 05:00 PM to 10:30 PM Public Darshan",
    visitorGuidelines: "VIP and general queue systems are strictly separated for safety.",
    parkingInformation: "High School Ground and Block Office Bypass.",
    contactInformation: "+91 94371 99999",
    imageUrl: "/assets/deity_darshan.png",
    isFeatured: false,
    isPublished: true,
    lastUpdated: "2026-07-04"
  },
  {
    id: "fest_15",
    festivalNameEnglish: "Niladri Bije",
    festivalNameOdia: "ନୀଳାଦ୍ରି ବିଜେ",
    festivalNameHindi: "नीलाद्रि बिजे",
    date: "2026-07-07",
    startTime: "04:00 PM",
    endTime: "10:30 PM",
    category: "Jagannath Ritual",
    status: "Tentative — subject to temple committee confirmation",
    shortDescription: "Deities return inside the sanctum. Lord offers Rasagola to Lakshmi.",
    fullDescription: "The return of deities into the inner sanctum (Garbhagriha). Lord Jagannath pacifies Goddess Lakshmi with Rasagola sweet offerings to gain entry after leaving her behind.",
    ritualSchedule: "05:00 PM Rasagola offering ritual, 07:00 PM Pahandi to Ratna Singhasana",
    visitorGuidelines: "Observe the Rasagola festival and purchase fresh offerings at counter.",
    parkingInformation: "Temple general parking.",
    contactInformation: "+91 94371 99999",
    imageUrl: "/assets/deity_darshan.png",
    isFeatured: false,
    isPublished: true,
    lastUpdated: "2026-07-04"
  },
  {
    id: "fest_16",
    festivalNameEnglish: "Janmashtami",
    festivalNameOdia: "ଜନ୍ମାଷ୍ଟମୀ",
    festivalNameHindi: "जन्माष्टमी",
    date: "2026-09-04",
    startTime: "06:00 AM",
    endTime: "11:59 PM",
    category: "Special Puja",
    status: "Tentative — subject to temple committee confirmation",
    shortDescription: "The appearance day of Lord Sri Krishna with midnight rituals.",
    fullDescription: "Celebrated with elaborate midnight rituals, bathing of Baby Krishna (Jeebanyasa), and special sweet offerings.",
    ritualSchedule: "06:30 AM Morning Puja, 10:00 PM Birth rituals, 12:00 AM Midnight Aarti",
    visitorGuidelines: "Late night Darshan allowed. Bring kids for Bal Gopal blessings.",
    parkingInformation: "Temple outer boundary parking.",
    contactInformation: "+91 94371 99999",
    imageUrl: "/assets/deity_darshan.png",
    isFeatured: false,
    isPublished: true,
    lastUpdated: "2026-07-04"
  },
  {
    id: "fest_17",
    festivalNameEnglish: "Ganesh Chaturthi",
    festivalNameOdia: "ଗଣେଶ ଚତୁର୍ଥୀ",
    festivalNameHindi: "गणेश चतुर्थी",
    date: "2026-09-15",
    startTime: "06:00 AM",
    endTime: "08:30 PM",
    category: "Special Puja",
    status: "Tentative — subject to temple committee confirmation",
    shortDescription: "Worship of Lord Ganesha at the outer temple shrine.",
    fullDescription: "Lord Ganesha is worshiped with modak offerings and special chants at the Ganesh shrine inside the temple complex.",
    ritualSchedule: "08:00 AM Ganesh Puja, 11:30 AM Modak offering, 06:30 PM Sandhya Aarti",
    visitorGuidelines: "Traditional wear requested.",
    parkingInformation: "Temple parking open.",
    contactInformation: "+91 94371 99999",
    imageUrl: "/assets/temple_exterior.png",
    isFeatured: false,
    isPublished: true,
    lastUpdated: "2026-07-04"
  },
  {
    id: "fest_18",
    festivalNameEnglish: "Nuakhai",
    festivalNameOdia: "ନୂଆଖାଇ",
    festivalNameHindi: "नुआखाई",
    date: "2026-09-16",
    startTime: "06:00 AM",
    endTime: "08:00 PM",
    category: "Community Event",
    status: "Tentative — subject to temple committee confirmation",
    shortDescription: "Agricultural festival of offering the first crop of new rice.",
    fullDescription: "A major harvest festival of Western Odisha, also observed here by offering Nabanna (newly harvested crop cooked with milk and sugar) to the Lord.",
    ritualSchedule: "09:30 AM Nabanna offering to Lord Jagannath, 11:00 AM Prasad consumption",
    visitorGuidelines: "Fasting till Nabanna offering is recommended.",
    parkingInformation: "Temple general parking.",
    contactInformation: "+91 94371 99999",
    imageUrl: "/assets/annadan_seva.png",
    isFeatured: false,
    isPublished: true,
    lastUpdated: "2026-07-04"
  },
  {
    id: "fest_19",
    festivalNameEnglish: "Durga Puja",
    festivalNameOdia: "ଦୁର୍ଗା ପୂଜା",
    festivalNameHindi: "दुर्गा पूजा",
    date: "2026-10-17",
    startTime: "05:00 AM",
    endTime: "10:30 PM",
    category: "Major Festival",
    status: "Tentative — subject to temple committee confirmation",
    shortDescription: "Vijayadashami celebrations with weapon worship of deities.",
    fullDescription: "Celebrated with Kanak Durga rituals. On Dashami day, Lord Jagannath assumes Rajarajeswar Besha, and traditional weapon worship is performed.",
    ritualSchedule: "06:00 AM Shodasa Upachara Puja, 07:00 PM Vijayadashami Shastra Puja",
    visitorGuidelines: "Avoid carrying large bags. Security checks will be active.",
    parkingInformation: "High School Ground bypass.",
    contactInformation: "+91 94371 99999",
    imageUrl: "/assets/temple_exterior.png",
    isFeatured: false,
    isPublished: true,
    lastUpdated: "2026-07-04"
  },
  {
    id: "fest_20",
    festivalNameEnglish: "Kumar Purnima",
    festivalNameOdia: "କୁମାର ପୂର୍ଣ୍ଣିମା",
    festivalNameHindi: "कुमार पूर्णिमा",
    date: "2026-10-25",
    startTime: "05:30 AM",
    endTime: "09:00 PM",
    category: "Community Event",
    status: "Tentative — subject to temple committee confirmation",
    shortDescription: "Moon worship and offering of fried paddy to deities.",
    fullDescription: "Celebrated by girls offering prayers to the moon. Lord Jagannath is dressed in clean white garments, and special Khae (fried paddy) is offered.",
    ritualSchedule: "05:00 PM Khae bhoga offering, 06:30 PM Moon-sighting prayers",
    visitorGuidelines: "Evening cultural programs will be held in the temple compound.",
    parkingInformation: "Block Office Ground.",
    contactInformation: "+91 94371 99999",
    imageUrl: "/assets/deity_darshan.png",
    isFeatured: false,
    isPublished: true,
    lastUpdated: "2026-07-04"
  },
  {
    id: "fest_21",
    festivalNameEnglish: "Kartika Purnima",
    festivalNameOdia: "କାର୍ତ୍ତିକ ପୂର୍ଣ୍ଣିମା",
    festivalNameHindi: "कार्तिक पूर्णिमा",
    date: "2026-11-24",
    startTime: "04:30 AM",
    endTime: "10:00 PM",
    category: "Major Festival",
    status: "Tentative — subject to temple committee confirmation",
    shortDescription: "Boita Bandana ritual and Radha Damodar Vesha of deities.",
    fullDescription: "One of the holiest days. Devotees float paper/cork boats (Boita Bandana) in the temple pond. The deities are dressed in the grand Suna Besha (Golden Attire) inside the temple.",
    ritualSchedule: "04:30 AM Boita Bandana, 06:00 AM Suna Besha dressing, 09:30 AM Anna Mahaprasad offering",
    visitorGuidelines: "Float boats only in designated safe pond areas. Strict security in place.",
    parkingInformation: "All parking grounds active with shuttle rickshaws.",
    contactInformation: "+91 94371 99999",
    imageUrl: "/assets/deity_darshan.png",
    isFeatured: true,
    isPublished: true,
    lastUpdated: "2026-07-04"
  },
  {
    id: "fest_22",
    festivalNameEnglish: "Prathamastami",
    festivalNameOdia: "ପ୍ରଥମାଷ୍ଟମୀ",
    festivalNameHindi: "प्रथमाष्टमी",
    date: "2026-12-03",
    startTime: "06:00 AM",
    endTime: "08:30 PM",
    category: "Community Event",
    status: "Tentative — subject to temple committee confirmation",
    shortDescription: "Traditional Odia festival celebrating the first-born child.",
    fullDescription: "The first-born child is showered with blessings. Special Enduri Pitha (rice cakes wrapped in turmeric leaves) is offered to Lord Jagannath.",
    ritualSchedule: "08:00 AM Special puja for first-borns, 11:30 AM Enduri Pitha bhoga offering",
    visitorGuidelines: "Purchase authentic Enduri Pitha at Anandabazar counter.",
    parkingInformation: "Temple parking open.",
    contactInformation: "+91 94371 99999",
    imageUrl: "/assets/annadan_seva.png",
    isFeatured: false,
    isPublished: true,
    lastUpdated: "2026-07-04"
  },
  {
    id: "fest_23",
    festivalNameEnglish: "Gita Jayanti",
    festivalNameOdia: "ଗୀତା ଜୟନ୍ତୀ",
    festivalNameHindi: "गीता जयंती",
    date: "2026-12-20",
    startTime: "06:00 AM",
    endTime: "08:00 PM",
    category: "Special Puja",
    status: "Tentative — subject to temple committee confirmation",
    shortDescription: "Recitation of Srimad Bhagavad Gita and special homam.",
    fullDescription: "Recitation of Gita chapters and spiritual discourses inside the temple assembly hall.",
    ritualSchedule: "08:30 AM Gita Yajna, 02:00 PM Recitations, 07:00 PM Sandhya Aarti",
    visitorGuidelines: "Join the chanting circle in the assembly hall.",
    parkingInformation: "Temple outer ground.",
    contactInformation: "+91 94371 99999",
    imageUrl: "/assets/temple_exterior.png",
    isFeatured: false,
    isPublished: true,
    lastUpdated: "2026-07-04"
  },
  {
    id: "fest_24",
    festivalNameEnglish: "Dhanu Sankranti",
    festivalNameOdia: "ଧନୁ ସଂକ୍ରାନ୍ତି",
    festivalNameHindi: "धनु संक्रांति",
    date: "2026-12-16",
    startTime: "05:30 AM",
    endTime: "08:00 PM",
    category: "Special Puja",
    status: "Tentative — subject to temple committee confirmation",
    shortDescription: "Offering of Dhanu Muan sweet to the deities.",
    fullDescription: "Marks the sun's transit into Sagittarius. Special sweet Dhanu Muan (made of puffed rice, jaggery, and ghee) is prepared and offered to the Lord.",
    ritualSchedule: "06:00 AM Dhanu Muan offering rituals, 06:30 PM Sandhya Aarti",
    visitorGuidelines: "Dhanu Muan packets will be available at temple counters.",
    parkingInformation: "Temple parking open.",
    contactInformation: "+91 94371 99999",
    imageUrl: "/assets/temple_exterior.png",
    isFeatured: false,
    isPublished: true,
    lastUpdated: "2026-07-04"
  },
  {
    id: "fest_25",
    festivalNameEnglish: "Local Temple Annual Festival",
    festivalNameOdia: "ବାର୍ଷିକ ପ୍ରତିଷ୍ଠା ଉତ୍ସବ",
    festivalNameHindi: "स्थानीय मंदिर वार्षिक उत्सव",
    date: "2026-03-15",
    startTime: "05:00 AM",
    endTime: "09:30 PM",
    category: "Local Temple Festival",
    status: "Tentative — subject to temple committee confirmation",
    shortDescription: "Annual establishment anniversary of Sidheswar Temple.",
    fullDescription: "Anniversary of the temple sanctification. 108 pots Abhishek and Yajna are performed in the temple compound.",
    ritualSchedule: "06:00 AM Maha Yajna starts, 12:00 PM Purnahuti, 01:30 PM Annadan for all",
    visitorGuidelines: "Free mass lunch (prasad) will be served to all visiting devotees.",
    parkingInformation: "High School bypass grounds.",
    contactInformation: "+91 94371 99999",
    imageUrl: "/assets/temple_exterior.png",
    isFeatured: false,
    isPublished: true,
    lastUpdated: "2026-07-04"
  },
  {
    id: "fest_26",
    festivalNameEnglish: "Special Jagannath Puja Days",
    festivalNameOdia: "ଗୁରୁବାର ସ୍ୱତନ୍ତ୍ର ପୂଜା",
    festivalNameHindi: "विशेष गुरुवार पूजा",
    date: "2026-05-14",
    startTime: "06:00 AM",
    endTime: "08:30 PM",
    category: "Special Puja",
    status: "Tentative — subject to temple committee confirmation",
    shortDescription: "Weekly Thursday prayers and Lakshmi rituals.",
    fullDescription: "Every Thursday, special prayers are offered to Goddess Mahalakshmi and Lord Jagannath with yellow flowers.",
    ritualSchedule: "08:00 AM Lakshmi Puja, 06:30 PM Sandhya Deepa offering",
    visitorGuidelines: "Wear traditional clean clothes.",
    parkingInformation: "Temple parking open.",
    contactInformation: "+91 94371 99999",
    imageUrl: "/assets/deity_darshan.png",
    isFeatured: false,
    isPublished: true,
    lastUpdated: "2026-07-04"
  },
  {
    id: "fest_27",
    festivalNameEnglish: "Ekadashi / Purnima Observances",
    festivalNameOdia: "ଏକାଦଶୀ ଓ ପୂର୍ଣ୍ଣିମା ନୀତି",
    festivalNameHindi: "एकादशी एवं पूर्णिमा अनुष्ठान",
    date: "2026-07-25",
    startTime: "05:00 AM",
    endTime: "09:30 PM",
    category: "Ekadashi / Purnima / Amavasya",
    status: "Tentative — subject to temple committee confirmation",
    shortDescription: "Monthly Ekadashi Mahadipa and Purnima special offerings.",
    fullDescription: "Observation of holy Ekadashi (raising the Mahadipa on top of temple spire) and Amavasya/Purnima specialized nitis.",
    ritualSchedule: "06:30 PM Ekadashi rituals, 08:30 PM Mahadipa lifting on spire",
    visitorGuidelines: "Watch the temple spire at 08:30 PM to catch sight of the holy light lifting.",
    parkingInformation: "Temple parking open.",
    contactInformation: "+91 94371 99999",
    imageUrl: "/assets/temple_exterior.png",
    isFeatured: false,
    isPublished: true,
    lastUpdated: "2026-07-04"
  }
];

const SEED_SEVAS = [
  {
    id: "sev_1",
    devoteeName: "Kailash Chandra Patnaik",
    email: "kailash.patnaik@yahoo.com",
    phone: "9876543222",
    gotra: "Vatsa",
    address: "Brahmapur, Odisha",
    familyMembers: ["Sabita Patnaik", "Sourav Patnaik"],
    selectedDate: "2026-07-10",
    sevaType: "Annadan Seva (Mahaprasad)",
    amount: 1100,
    specialRequest: "Anniversary offering",
    bookingReference: "SEVA-761012-9843",
    paymentStatus: "paid",
    approvalStatus: "approved",
    createdAt: "2026-07-01T10:00:00.000Z"
  },
  {
    id: "sev_2",
    devoteeName: "Rajesh Kumar Sharma",
    email: "sharmarajesh@gmail.com",
    phone: "9123456789",
    gotra: "Kashyap",
    address: "New Delhi",
    familyMembers: ["Anjali Sharma"],
    selectedDate: "2026-07-16",
    sevaType: "Pushpalankara & Puja Seva",
    amount: 501,
    specialRequest: "Good health for family during Rath Yatra",
    bookingReference: "SEVA-761012-1402",
    paymentStatus: "paid",
    approvalStatus: "pending",
    createdAt: "2026-07-03T14:30:00.000Z"
  }
];

const SEED_DONATIONS = [
  {
    id: "don_1",
    donorName: "Anil Kumar Jena",
    email: "aniljena@gmail.com",
    phone: "9438012345",
    panNumber: "ABCDE1234F",
    amount: 5001,
    category: "construction_fund",
    isAnonymous: false,
    paymentGateway: "UPI",
    transactionId: "TXN987654321098",
    receiptNumber: "RECEIPT-2026-1082",
    date: "2026-07-02T11:20:00.000Z"
  },
  {
    id: "don_2",
    donorName: "Anonymous Devotee",
    email: "",
    phone: "",
    panNumber: "",
    amount: 2500,
    category: "anna_daan",
    isAnonymous: true,
    paymentGateway: "UPI",
    transactionId: "TXN765432109876",
    receiptNumber: "RECEIPT-2026-1083",
    date: "2026-07-03T08:15:00.000Z"
  },
  {
    id: "don_3",
    donorName: "Manish Kumar Gupta",
    email: "manishgupta@gmail.com",
    phone: "9988776655",
    panNumber: "FGHIJ5678K",
    amount: 10000,
    category: "general_fund",
    isAnonymous: false,
    paymentGateway: "Bank Transfer",
    transactionId: "TXN112233445566",
    receiptNumber: "RECEIPT-2026-1084",
    date: "2026-07-04T12:00:00.000Z"
  }
];

const SEED_GALLERY = [
  {
    id: "gal_1",
    title: "Lord Jagannath, Balabhadra & Subhadra",
    altText: "Lord Jagannath, Lord Balabhadra and Devi Subhadra on the sanctorum altar",
    category: "Deities",
    imageUrl: "/assets/deity_darshan.png",
    thumbnailUrl: "/assets/deity_darshan.png",
    caption: "The divine siblings beautifully adorned with Tulasi garlands on the main sanctum sanctorum altar.",
    date: "2026-06-29",
    isFeatured: true,
    isApproved: true
  },
  {
    id: "gal_2",
    title: "Sidheswar Shree Jagannath Temple Spire",
    altText: "Exterior structure of Sidheswar Temple showcasing Kalinga architecture and the Nilachakra",
    category: "Temple",
    imageUrl: "/assets/temple_exterior.png",
    thumbnailUrl: "/assets/temple_exterior.png",
    caption: "The majestic main temple structure showcasing traditional Odishan architectural details with the sacred Nilachakra flag fluttering high.",
    date: "2026-07-01",
    isFeatured: true,
    isApproved: true
  },
  {
    id: "gal_3",
    title: "Chariot Pulling during Rath Yatra",
    altText: "Huge crowd of devotees pulling the wooden chariot of Lord Jagannath on the main road",
    category: "Rath Yatra",
    imageUrl: "/assets/rath_yatra.png",
    thumbnailUrl: "/assets/rath_yatra.png",
    caption: "Devotees pulling the grand Nandighosa chariot during Gundicha Yatra, filling the air with sounds of Ghanta and prayers.",
    date: "2026-07-16",
    isFeatured: true,
    isApproved: true
  },
  {
    id: "gal_4",
    title: "Patita Pavan Altar Close-up",
    altText: "Close-up of Lord Patita Pavan Jagannath statue",
    category: "Deities",
    imageUrl: "/assets/hero_jagannath.png",
    thumbnailUrl: "/assets/hero_jagannath.png",
    caption: "Lord Patita Pavan, the redeemer of the fallen, at the outer gate of the inner temple.",
    date: "2026-07-04",
    isFeatured: false,
    isApproved: true
  },
  {
    id: "gal_5",
    title: "Preparation of Anna Mahaprasad",
    altText: "Odishan clay pot cooking preparations for Annadan Seva",
    category: "Bhoga/Prasad",
    imageUrl: "/assets/annadan_seva.png",
    thumbnailUrl: "/assets/annadan_seva.png",
    caption: "Authentic clay-pot cooking by the temple Suaras for the daily devotee distribution.",
    date: "2026-07-03",
    isFeatured: false,
    isApproved: true
  },
  {
    id: "gal_6",
    title: "Deba Snana Purnima Rituals",
    altText: "Bathing ritual of Lord Jagannath on the Snana Mandapa",
    category: "Festivals",
    imageUrl: "/assets/deity_darshan.png",
    thumbnailUrl: "/assets/deity_darshan.png",
    caption: "Lord Jagannath in the sacred Elephant Attire (Hati Besha) on Snana Purnima.",
    date: "2026-06-09",
    isFeatured: false,
    isApproved: true
  },
  {
    id: "gal_7",
    title: "Kartik Brata Devotee Gathering",
    altText: "Gathering of devotees during the holy month of Kartika inside temple grounds",
    category: "Devotee Events",
    imageUrl: "/assets/temple_exterior.png",
    thumbnailUrl: "/assets/temple_exterior.png",
    caption: "Hundreds of devotees assemble in the outer courtyard for early morning prayers during the holy Kartika month.",
    date: "2026-07-04",
    isFeatured: false,
    isApproved: true
  },
  {
    id: "gal_8",
    title: "Historic Photo of Sidheswar Temple Spire",
    altText: "Vintage photograph of Sidheswar Temple structure from the late 20th century",
    category: "Old Photos",
    imageUrl: "/assets/temple_exterior.png",
    thumbnailUrl: "/assets/temple_exterior.png",
    caption: "A rare archival photograph showing the Kalinga style architecture and original main entrance of the temple.",
    date: "2026-07-04",
    isFeatured: false,
    isApproved: true
  },
  {
    id: "gal_u1",
    title: "Temple Spires with Nilachakra and Flags",
    altText: "Temple Spires with Nilachakra and Flags",
    category: "Temple",
    imageUrl: "/assets/temple_spire_flags.jpg",
    thumbnailUrl: "/assets/temple_spire_flags.jpg",
    caption: "Colourful temple spires crowned with the Nilachakra and fluttering flags against the evening sky.",
    date: "2026-10-02",
    isFeatured: true,
    isApproved: true
  },
  {
    id: "gal_u2",
    title: "Lord Jagannath Procession at Night",
    altText: "Lord Jagannath Procession at Night",
    category: "Festivals",
    imageUrl: "/assets/deity_procession_close.jpg",
    thumbnailUrl: "/assets/deity_procession_close.jpg",
    caption: "Lord Jagannath adorned with Tulasi and flowers, carried in procession among devotees with decorated chhatras.",
    date: "2026-10-02",
    isFeatured: true,
    isApproved: true
  },
  {
    id: "gal_u3",
    title: "Hanuman Shrine",
    altText: "Hanuman Shrine",
    category: "Deities",
    imageUrl: "/assets/hanuman_shrine.jpg",
    thumbnailUrl: "/assets/hanuman_shrine.jpg",
    caption: "Hanuman idol with folded hands, offered fresh flowers inside the temple premises.",
    date: "2026-10-02",
    isFeatured: true,
    isApproved: true
  },
  {
    id: "gal_u4",
    title: "Devotees Gathered for the Night Procession",
    altText: "Devotees Gathered for the Night Procession",
    category: "Festivals",
    imageUrl: "/assets/procession_night_street.jpg",
    thumbnailUrl: "/assets/procession_night_street.jpg",
    caption: "A large gathering of devotees lining the street, with the deity procession and festive lights above.",
    date: "2026-10-02",
    isFeatured: true,
    isApproved: true
  },
  {
    id: "gal_u5",
    title: "Temple and Chariot at Sunset",
    altText: "Temple and Chariot at Sunset",
    category: "Rath Yatra",
    imageUrl: "/assets/temple_chariot_sunset.jpg",
    thumbnailUrl: "/assets/temple_chariot_sunset.jpg",
    caption: "The colourful chariot and temple complex glowing under a golden sunset sky.",
    date: "2026-10-02",
    isFeatured: true,
    isApproved: true
  },
  {
    id: "gal_u6",
    title: "Lord Jagannath Adorned with Tulasi Garlands",
    altText: "Lord Jagannath Adorned with Tulasi Garlands",
    category: "Deities",
    imageUrl: "/assets/jagannath_sanctum_seva.jpg",
    thumbnailUrl: "/assets/jagannath_sanctum_seva.jpg",
    caption: "Lord Jagannath in the sanctum, decorated with Tulasi leaves and marigold garlands, with flower offerings in front.",
    date: "2026-10-02",
    isFeatured: true,
    isApproved: true
  },
  {
    id: "gal_u7",
    title: "Lord Jagannath - Divine Darshan",
    altText: "Lord Jagannath - Divine Darshan",
    category: "Deities",
    imageUrl: "/assets/jagannath_tulasi_closeup.jpg",
    thumbnailUrl: "/assets/jagannath_tulasi_closeup.jpg",
    caption: "A close view of the Lord's large eyes, framed by Tulasi leaves, marigolds and jasmine flowers.",
    date: "2026-10-02",
    isFeatured: true,
    isApproved: true
  },
];
const SEED_AUDIT_LOGS = [
  { id: "aud_1", adminId: "usr_1", adminName: "Prakash Chandra Rath", role: "super_admin", action: "SYSTEM_INITIALIZE", description: "Temple Website Live Database Preseeded", timestamp: "2026-07-04T00:00:00.000Z" }
];

const SEED_FAQS = [
  {
    id: "faq_1",
    questionEn: "What are the timings of Mangala Aarti?",
    questionOr: "à¬®à¬™à­à¬—à¬³ à¬†à¬³à¬¤à¬¿ à¬° à¬¸à¬®à­Ÿ à¬•à­‡à¬¤à­‡à¬¬à­‡à¬³à­‡?",
    questionHi: "à¤®à¤‚à¤—à¤²à¤¾ à¤†à¤°à¤¤à¥€ à¤•à¤¾ à¤¸à¤®à¤¯ à¤•à¤¬ à¤¹à¥ˆ?",
    answerEn: "Mangala Aarti takes place daily at 05:30 AM right after the temple gates open at 05:00 AM.",
    answerOr: "à¬®à¬¨à­à¬¦à¬¿à¬° à¬¦à­à¬µà¬¾à¬° à¬¸à¬•à¬¾à¬³ à­«:à­¦à­¦ à¬°à­‡ à¬–à­‹à¬²à¬¿à¬¬à¬¾ à¬ªà¬°à­‡ à¬®à¬™à­à¬—à¬³ à¬†à¬³à¬¤à¬¿ à¬¦à­ˆà¬¨à¬¿à¬• à¬¸à¬•à¬¾à¬³ à­«:à­©à­¦ à¬°à­‡ à¬¹à­‹à¬‡à¬¥à¬¾à¬à¥¤",
    answerHi: "à¤®à¤‚à¤¦à¤¿à¤° à¤•à¥‡ à¤¦à¥à¤µà¤¾à¤° à¤¸à¥à¤¬à¤¹ 05:00 à¤¬à¤œà¥‡ à¤–à¥à¤²à¤¨à¥‡ à¤•à¥‡ à¤¤à¥à¤°à¤‚à¤¤ à¤¬à¤¾à¤¦ à¤®à¤‚à¤—à¤²à¤¾ à¤†à¤°à¤¤à¥€ à¤¦à¥ˆà¤¨à¤¿à¤• à¤°à¥‚à¤ª à¤¸à¥‡ à¤¸à¥à¤¬à¤¹ 05:30 à¤¬à¤œà¥‡ à¤¹à¥‹à¤¤à¥€ à¤¹à¥ˆà¥¤"
  },
  {
    id: "faq_2",
    questionEn: "Are mobile phones allowed inside the temple premises?",
    questionOr: "à¬®à¬¨à­à¬¦à¬¿à¬° à¬ªà¬°à¬¿à¬¸à¬° à¬®à¬§à­à­Ÿà¬•à­ à¬®à­‹à¬¬à¬¾à¬‡à¬²à­ à¬«à­‹à¬¨ à¬¨à­‡à¬¬à¬¾ à¬…à¬¨à­à¬®à¬¤à¬¿ à¬…à¬›à¬¿ à¬•à¬¿?",
    questionHi: "à¤•à¥à¤¯à¤¾ à¤®à¤‚à¤¦à¤¿à¤° à¤ªà¤°à¤¿à¤¸à¤° à¤•à¥‡ à¤­à¥€à¤¤à¤° à¤®à¥‹à¤¬à¤¾à¤‡à¤² à¤«à¥‹à¤¨ à¤²à¥‡ à¤œà¤¾à¤¨à¥‡ à¤•à¥€ à¤…à¤¨à¥à¤®à¤¤à¤¿ à¤¹à¥ˆ?",
    answerEn: "Mobile phones and photography are strictly prohibited inside the main temple premises. Devotees are requested to keep their phones at the Temple Office shoe-counter locker.",
    answerOr: "à¬®à­à¬–à­à­Ÿ à¬®à¬¨à­à¬¦à¬¿à¬° à¬ªà¬°à¬¿à¬¸à¬° à¬®à¬§à­à­Ÿà¬°à­‡ à¬®à­‹à¬¬à¬¾à¬‡à¬²à­ à¬«à­‹à¬¨ à¬¬à­à­Ÿà¬¬à¬¹à¬¾à¬° à¬à¬¬à¬‚ à¬«à¬Ÿà­‹à¬—à­à¬°à¬¾à¬«à¬¿ à¬¸à¬®à­à¬ªà­‚à¬°à­à¬£à­à¬£ à¬¨à¬¿à¬·à­‡à¬§à¥¤ à¬¶à­à¬°à¬¦à­à¬§à¬¾à¬³à­à¬®à¬¾à¬¨à¬™à­à¬•à­ à¬¸à­‡à¬®à¬¾à¬¨à¬™à­à¬• à¬«à­‹à¬¨ à¬®à¬¨à­à¬¦à¬¿à¬° à¬•à¬¾à¬°à­à¬¯à­à­Ÿà¬¾à¬³à­Ÿ à¬° à¬œà­‹à¬¤à¬¾ à¬•à¬¾à¬‰à¬£à­à¬Ÿà¬° à¬²à¬•à¬°à¬°à­‡ à¬°à¬–à¬¿à¬¬à¬¾à¬•à­ à¬…à¬¨à­à¬°à­‹à¬§à¥¤",
    answerHi: "à¤®à¥à¤–à¥à¤¯ à¤®à¤‚à¤¦à¤¿à¤° à¤ªà¤°à¤¿à¤¸à¤° à¤•à¥‡ à¤­à¥€à¤¤à¤° à¤®à¥‹à¤¬à¤¾à¤‡à¤² à¤«à¥‹à¤¨ à¤”à¤° à¤«à¥‹à¤Ÿà¥‹à¤—à¥à¤°à¤¾à¤«à¥€ à¤¸à¤–à¥à¤¤ à¤µà¤°à¥à¤œà¤¿à¤¤ à¤¹à¥ˆà¤‚à¥¤ à¤¶à¥à¤°à¤¦à¥à¤§à¤¾à¤²à¥à¤“à¤‚ à¤¸à¥‡ à¤…à¤¨à¥à¤°à¥‹à¤§ à¤¹à¥ˆ à¤•à¤¿ à¤µà¥‡ à¤…à¤ªà¤¨à¥‡ à¤«à¥‹à¤¨ à¤®à¤‚à¤¦à¤¿à¤° à¤•à¤¾à¤°à¥à¤¯à¤¾à¤²à¤¯ à¤•à¥‡ à¤œà¥‚à¤¤à¤¾ à¤•à¤¾à¤‰à¤‚à¤Ÿà¤° à¤²à¥‰à¤•à¤° à¤®à¥‡à¤‚ à¤°à¤–à¥‡à¤‚à¥¤"
  }
];

const SEED_GRIEVANCES = [];

// Local Storage Initialization Helper
const getOrSetLocal = (key, seedData) => {
  const data = localStorage.getItem(key);
  if (!data) {
    localStorage.setItem(key, JSON.stringify(seedData));
    return seedData;
  }
  return JSON.parse(data);
};

// Initialize DB elements
const initMockDB = () => {
  getOrSetLocal('temple-db-notices', SEED_NOTICES);
  getOrSetLocal('temple-db-festivals', SEED_FESTIVALS);
  getOrSetLocal('temple-db-sevas', SEED_SEVAS);
  getOrSetLocal('temple-db-donations', SEED_DONATIONS);
  // Gallery: also merge in any new seed photos for returning visitors whose browser already saved an older list
  const savedGallery = getOrSetLocal('temple-db-gallery', SEED_GALLERY);
  const savedIds = new Set(savedGallery.map((g) => g.id));
  const missingSeeds = SEED_GALLERY.filter((g) => !savedIds.has(g.id));
  if (missingSeeds.length > 0) {
    localStorage.setItem('temple-db-gallery', JSON.stringify([...savedGallery, ...missingSeeds]));
  }
  getOrSetLocal('temple-db-auditlogs', SEED_AUDIT_LOGS);
  getOrSetLocal('temple-db-faqs', SEED_FAQS);
  getOrSetLocal('temple-db-grievances', SEED_GRIEVANCES);
};

initMockDB();

// General API Wrapper with Delay
const delayCall = (cb) => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve(cb());
    }, LATENCY);
  });
};

export const mockApi = {
  // Notices API
  getNotices: () => delayCall(() => JSON.parse(localStorage.getItem('temple-db-notices'))),
  createNotice: (noticeData, adminUser) => delayCall(() => {
    const list = JSON.parse(localStorage.getItem('temple-db-notices')) || [];
    const newNotice = {
      id: `not_${Date.now()}`,
      publishDate: new Date().toISOString().split('T')[0],
      ...noticeData
    };
    localStorage.setItem('temple-db-notices', JSON.stringify([newNotice, ...list]));
    mockApi.logAudit(adminUser, "CREATE_NOTICE", `Created announcement: ${noticeData.titleEn}`);
    return newNotice;
  }),
  deleteNotice: (id, adminUser) => delayCall(() => {
    const list = JSON.parse(localStorage.getItem('temple-db-notices')) || [];
    const notice = list.find(n => n.id === id);
    const filtered = list.filter(n => n.id !== id);
    localStorage.setItem('temple-db-notices', JSON.stringify(filtered));
    if (notice) {
      mockApi.logAudit(adminUser, "DELETE_NOTICE", `Deleted announcement: ${notice.titleEn}`);
    }
    return { success: true };
  }),
  updateNotice: (id, updateData, adminUser) => delayCall(() => {
    const list = JSON.parse(localStorage.getItem('temple-db-notices')) || [];
    const index = list.findIndex(n => n.id === id);
    if (index !== -1) {
      list[index] = { ...list[index], ...updateData };
      localStorage.setItem('temple-db-notices', JSON.stringify(list));
      mockApi.logAudit(adminUser, "UPDATE_NOTICE", `Updated announcement: ${list[index].titleEn}`);
      return list[index];
    }
    throw new Error("Notice not found");
  }),

  // Festivals API
  getFestivals: () => delayCall(() => JSON.parse(localStorage.getItem('temple-db-festivals'))),
  createFestival: (festivalData, adminUser) => delayCall(() => {
    const list = JSON.parse(localStorage.getItem('temple-db-festivals')) || [];
    const newFest = {
      id: `fest_${Date.now()}`,
      lastUpdated: new Date().toISOString(),
      ...festivalData
    };
    localStorage.setItem('temple-db-festivals', JSON.stringify([newFest, ...list]));
    mockApi.logAudit(adminUser, "CREATE_FESTIVAL", `Created festival event: ${festivalData.festivalNameEnglish}`);
    return newFest;
  }),
  updateFestival: (id, updateData, adminUser) => delayCall(() => {
    const list = JSON.parse(localStorage.getItem('temple-db-festivals')) || [];
    const index = list.findIndex(f => f.id === id);
    if (index !== -1) {
      list[index] = { ...list[index], ...updateData, lastUpdated: new Date().toISOString() };
      localStorage.setItem('temple-db-festivals', JSON.stringify(list));
      mockApi.logAudit(adminUser, "UPDATE_FESTIVAL", `Updated festival: ${list[index].festivalNameEnglish}`);
      return list[index];
    }
    throw new Error("Festival not found");
  }),
  deleteFestival: (id, adminUser) => delayCall(() => {
    const list = JSON.parse(localStorage.getItem('temple-db-festivals')) || [];
    const fest = list.find(f => f.id === id);
    const filtered = list.filter(f => f.id !== id);
    localStorage.setItem('temple-db-festivals', JSON.stringify(filtered));
    if (fest) {
      mockApi.logAudit(adminUser, "DELETE_FESTIVAL", `Deleted festival: ${fest.festivalNameEnglish}`);
    }
    return { success: true };
  }),

  // Sevas Booking API
  getSevas: () => delayCall(() => JSON.parse(localStorage.getItem('temple-db-sevas'))),
  bookSeva: (bookingData, userObj) => delayCall(() => {
    const list = JSON.parse(localStorage.getItem('temple-db-sevas')) || [];
    const refNum = `SEVA-761012-${Math.floor(1000 + Math.random() * 9000)}`;
    const newBooking = {
      id: `sev_${Date.now()}`,
      bookingReference: refNum,
      paymentStatus: "paid",
      approvalStatus: "pending",
      createdAt: new Date().toISOString(),
      userId: userObj ? userObj.id : null,
      ...bookingData
    };
    localStorage.setItem('temple-db-sevas', JSON.stringify([newBooking, ...list]));
    return newBooking;
  }),
  updateSevaStatus: (id, approvalStatus, rejectionReason, adminUser) => delayCall(() => {
    const list = JSON.parse(localStorage.getItem('temple-db-sevas')) || [];
    const index = list.findIndex(s => s.id === id);
    if (index !== -1) {
      list[index].approvalStatus = approvalStatus;
      if (rejectionReason) list[index].rejectionReason = rejectionReason;
      localStorage.setItem('temple-db-sevas', JSON.stringify(list));
      mockApi.logAudit(adminUser, "UPDATE_SEVA", `Updated Seva status (${approvalStatus}) for ref: ${list[index].bookingReference}`);
      return list[index];
    }
    throw new Error("Booking not found");
  }),

  // Donations API
  getDonations: () => delayCall(() => JSON.parse(localStorage.getItem('temple-db-donations'))),
  donate: (donationData, userObj) => delayCall(() => {
    const list = JSON.parse(localStorage.getItem('temple-db-donations')) || [];
    const txnId = `TXN${Math.floor(100000000000 + Math.random() * 900000000000)}`;
    const receiptNum = `RECEIPT-2026-${Math.floor(1000 + Math.random() * 9000)}`;
    const newDonation = {
      id: `don_${Date.now()}`,
      transactionId: txnId,
      receiptNumber: receiptNum,
      date: new Date().toISOString(),
      userId: userObj ? userObj.id : null,
      ...donationData
    };
    localStorage.setItem('temple-db-donations', JSON.stringify([newDonation, ...list]));
    return newDonation;
  }),

  // Gallery API
  getGallery: () => delayCall(() => JSON.parse(localStorage.getItem('temple-db-gallery'))),
  uploadGalleryItem: (itemData, userObj) => delayCall(() => {
    const list = JSON.parse(localStorage.getItem('temple-db-gallery')) || [];
    const isApproved = userObj && userObj.role !== "devotee";
    const newItem = {
      id: `gal_${Date.now()}`,
      isApproved,
      uploadedBy: userObj ? userObj.name : "Anonymous Devotee",
      ...itemData
    };
    localStorage.setItem('temple-db-gallery', JSON.stringify([...list, newItem]));
    return newItem;
  }),
  approveGalleryItem: (id, adminUser) => delayCall(() => {
    const list = JSON.parse(localStorage.getItem('temple-db-gallery')) || [];
    const index = list.findIndex(g => g.id === id);
    if (index !== -1) {
      list[index].isApproved = true;
      localStorage.setItem('temple-db-gallery', JSON.stringify(list));
      mockApi.logAudit(adminUser, "APPROVE_PHOTO", `Approved gallery upload: ${list[index].title}`);
      return list[index];
    }
    throw new Error("Item not found");
  }),
  deleteGalleryItem: (id, adminUser) => delayCall(() => {
    const list = JSON.parse(localStorage.getItem('temple-db-gallery')) || [];
    const item = list.find(g => g.id === id);
    const filtered = list.filter(g => g.id !== id);
    localStorage.setItem('temple-db-gallery', JSON.stringify(filtered));
    if (item) {
      mockApi.logAudit(adminUser, "DELETE_PHOTO", `Deleted gallery item: ${item.title}`);
    }
    return { success: true };
  }),

  // FAQs API
  getFAQs: () => delayCall(() => JSON.parse(localStorage.getItem('temple-db-faqs'))),
  addFAQ: (faqData, adminUser) => delayCall(() => {
    const list = JSON.parse(localStorage.getItem('temple-db-faqs')) || [];
    const newFaq = {
      id: `faq_${Date.now()}`,
      ...faqData
    };
    localStorage.setItem('temple-db-faqs', JSON.stringify([...list, newFaq]));
    mockApi.logAudit(adminUser, "ADD_FAQ", `Added FAQ question: ${faqData.questionEn}`);
    return newFaq;
  }),
  deleteFAQ: (id, adminUser) => delayCall(() => {
    const list = JSON.parse(localStorage.getItem('temple-db-faqs')) || [];
    const faq = list.find(f => f.id === id);
    const filtered = list.filter(f => f.id !== id);
    localStorage.setItem('temple-db-faqs', JSON.stringify(filtered));
    if (faq) {
      mockApi.logAudit(adminUser, "DELETE_FAQ", `Deleted FAQ: ${faq.questionEn}`);
    }
    return { success: true };
  }),

  // Contact / Grievances API
  submitTicket: (ticketData) => delayCall(() => {
    const list = JSON.parse(localStorage.getItem('temple-db-grievances')) || [];
    const ticketNo = `TKT-${Math.floor(100000 + Math.random() * 900000)}`;
    const newTicket = {
      id: `tkt_${Date.now()}`,
      ticketNumber: ticketNo,
      status: "open",
      createdAt: new Date().toISOString(),
      adminNotes: "",
      ...ticketData
    };
    localStorage.setItem('temple-db-grievances', JSON.stringify([newTicket, ...list]));
    return newTicket;
  }),
  getTickets: () => delayCall(() => JSON.parse(localStorage.getItem('temple-db-grievances'))),
  updateTicketStatus: (id, status, notes, adminUser) => delayCall(() => {
    const list = JSON.parse(localStorage.getItem('temple-db-grievances')) || [];
    const index = list.findIndex(t => t.id === id);
    if (index !== -1) {
      list[index].status = status;
      if (notes) list[index].adminNotes = notes;
      localStorage.setItem('temple-db-grievances', JSON.stringify(list));
      mockApi.logAudit(adminUser, "UPDATE_TICKET", `Updated ticket: ${list[index].ticketNumber} to status: ${status}`);
      return list[index];
    }
    throw new Error("Ticket not found");
  }),

  // Audit Logs API
  getAuditLogs: () => delayCall(() => JSON.parse(localStorage.getItem('temple-db-auditlogs'))),
  logAudit: (adminUser, action, description) => {
    const list = JSON.parse(localStorage.getItem('temple-db-auditlogs')) || [];
    const newLog = {
      id: `aud_${Date.now()}`,
      adminId: adminUser ? adminUser.id : "System",
      adminName: adminUser ? adminUser.name : "System Daemon",
      role: adminUser ? adminUser.role : "system",
      action,
      description,
      timestamp: new Date().toISOString()
    };
    localStorage.setItem('temple-db-auditlogs', JSON.stringify([newLog, ...list]));
  },

  // Dashboard Analytics API
  getAnalytics: () => delayCall(() => {
    const donations = JSON.parse(localStorage.getItem('temple-db-donations')) || [];
    const sevas = JSON.parse(localStorage.getItem('temple-db-sevas')) || [];
    const tickets = JSON.parse(localStorage.getItem('temple-db-grievances')) || [];
    const notices = JSON.parse(localStorage.getItem('temple-db-notices')) || [];

    const totalDonations = donations.reduce((sum, d) => sum + Number(d.amount), 0);
    const pendingSevas = sevas.filter(s => s.approvalStatus === 'pending').length;
    const approvedSevas = sevas.filter(s => s.approvalStatus === 'approved').length;
    const openTickets = tickets.filter(t => t.status === 'open').length;

    const categoriesSum = {};
    donations.forEach(d => {
      categoriesSum[d.category] = (categoriesSum[d.category] || 0) + Number(d.amount);
    });

    return {
      totalDonations,
      totalDonationsCount: donations.length,
      pendingSevasCount: pendingSevas,
      approvedSevasCount: approvedSevas,
      openTicketsCount: openTickets,
      totalNoticesCount: notices.length,
      categoryBreakdown: categoriesSum
    };
  }),

  // Database Backup simulator
  backupDatabase: () => {
    const tables = {
      notices: JSON.parse(localStorage.getItem('temple-db-notices')),
      festivals: JSON.parse(localStorage.getItem('temple-db-festivals')),
      sevas: JSON.parse(localStorage.getItem('temple-db-sevas')),
      donations: JSON.parse(localStorage.getItem('temple-db-donations')),
      gallery: JSON.parse(localStorage.getItem('temple-db-gallery')),
      auditlogs: JSON.parse(localStorage.getItem('temple-db-auditlogs')),
      faqs: JSON.parse(localStorage.getItem('temple-db-faqs')),
      grievances: JSON.parse(localStorage.getItem('temple-db-grievances'))
    };
    const jsonString = `data:text/json;charset=utf-8,${encodeURIComponent(JSON.stringify(tables, null, 2))}`;
    return {
      filename: `temple_db_backup_${new Date().toISOString().split('T')[0]}.json`,
      dataUri: jsonString
    };
  }
};