import React from 'react';
import { useLanguage } from '../context/LanguageContext';
import { BookOpen, Map, Landmark, Users, ShieldAlert, Award, Compass, Eye, ShieldCheck } from 'lucide-react';

export default function About() {
  const { t, language } = useLanguage();

  const timelineEvents = [
    { year: "1800 years ago", titleEn: "Temple Built", titleOr: "ମନ୍ଦିର ନିର୍ମାଣ", titleHi: "मंदिर का निर्माण", descEn: "The temple was built by the Raja of Badakhemundi.", descOr: "ବଡ଼ଖେମୁଣ୍ଡିର ରାଜାଙ୍କ ଦ୍ୱାରା ମନ୍ଦିର ନିର୍ମିତ ହୋଇଥିଲା।", descHi: "मंदिर का निर्माण बड़ाखेमुंडी के राजा ने कराया था।" },
    { year: "1994", titleEn: "Temple Renovated", titleOr: "ମନ୍ଦିର ସଂସ୍କାର", titleHi: "मंदिर का जीर्णोद्धार", descEn: "The temple was renovated.", descOr: "ମନ୍ଦିରର ସଂସ୍କାର କରାଯାଇଥିଲା।", descHi: "मंदिर का जीर्णोद्धार कराया गया था।" },
  ];

  return (
    <div className="min-h-screen bg-cream-light dark:bg-temple-dark text-temple-900 pb-20">
      
      {/* Page Banner Header */}
      <div className="relative bg-temple-dark text-cream-light py-20 border-b border-gold/20 text-center">
        <div className="absolute inset-0 bg-[url('/assets/temple_chariot_sunset.jpg')] bg-cover bg-center opacity-25"></div>
        <div className="relative z-10 max-w-4xl mx-auto px-4">
          <h2 className="text-3xl md:text-5xl font-extrabold font-outfit text-glow text-white">
            {t('about')}
          </h2>
          <div className="mt-4 flex justify-center items-center gap-2">
            <span className="w-10 h-0.5 bg-gold"></span>
            <Landmark size={20} className="text-gold" />
            <span className="w-10 h-0.5 bg-gold"></span>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-16 space-y-16">
        
        {/* Origin & History Section */}
        <section className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div className="glass-card overflow-hidden rounded-2xl relative shadow-md group">
            <img 
              src="/assets/temple_spire_flags.jpg" 
              alt="Sidheswar Temple Spire" 
              className="w-full h-96 object-cover object-center group-hover:scale-105 transition-transform duration-700" 
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
            <div className="absolute bottom-6 left-6 text-white z-10">
              <h3 className="text-xl font-bold font-outfit">Siddheswar Temple Spire</h3>
              <p className="text-xs text-cream-light/80 mt-1">Carved from traditional Ganjam stone slabs.</p>
            </div>
          </div>

          <div className="space-y-6">
            <div className="flex items-center gap-2 text-saffron font-bold">
              <BookOpen size={20} />
              <span className="uppercase text-xs tracking-wider">Sacred Origin</span>
            </div>
            <h3 className="text-2xl md:text-3xl font-extrabold font-outfit text-maroon leading-tight">
              {language === 'or' ? "ମନ୍ଦିରର ପବିତ୍ର ଇତିହାସ ଓ ପରମ୍ପରା" : language === 'hi' ? "मंदिर का पवित्र इतिहास और परंपरा" : "Sacred History & Tradition"}
            </h3>
            
            <div className="text-sm text-temple-700 space-y-4 leading-relaxed font-semibold">
              <p>
                {language === 'or' 
                  ? "ସିଦ୍ଧେଶ୍ୱର ଶ୍ରୀ ଜଗନ୍ନାଥ ମନ୍ଦିର ଓଡ଼ିଶାର ଗଞ୍ଜାମ ଜିଲ୍ଲାର ଏକ ପ୍ରମୁଖ ଭକ୍ତିକେନ୍ଦ୍ର। ଏହି ମନ୍ଦିର ପ୍ରାୟ 1800 ବର୍ଷ ପୂର୍ବେ ବଡ଼ଖେମୁଣ୍ଡିର ରାଜାଙ୍କ ଦ୍ୱାରା ନିର୍ମିତ ହୋଇଥିଲା। ଏଠାରେ ଭକ୍ତମାନେ ପତିତପାବନ ଶ୍ରୀ ଜଗନ୍ନାଥଙ୍କ ସହ ସିଧାସଳଖ ଯୋଗାଯୋଗ ସ୍ଥାପନ କରିପାରିବେ।"
                  : language === 'hi'
                  ? "सिद्धेश्वर श्री जगन्नाथ मंदिर ओडिशा के गंजाम जिले में भक्ति का एक प्रमुख केंद्र है। इस मंदिर का निर्माण लगभग 1800 वर्ष पहले बड़ाखेमुंडी के राजा ने कराया था। यहाँ भक्त पतितपावन भगवान जगन्नाथ से सीधे जुड़ सकते हैं।"
                  : "The Sidheswar Shree Jagannath Temple stands as a central beacon of devotion in the Ganjam district of Odisha. Built about 1800 years ago by the Raja of Badakhemundi, it provides a quiet sanctuary where devotees can connect directly with Lord Jagannath (Patitapavan)."
                }
              </p>
              <p>
                {language === 'or'
                  ? "ମନ୍ଦିର ପ୍ରବେଶ ଦ୍ୱାର ନିକଟରେ ଉଚ୍ଚ ସିଂହଦ୍ୱାର ପ୍ରତିଷ୍ଠା ହୋଇଛି, ଯେଉଁଠୁ ପତିତପାବନ ରୂପେ ମହାପ୍ରଭୁ ସମସ୍ତ ସାମାଜିକ ବିଭେଦର ଉର୍ଦ୍ଧ୍ୱରେ ରହି ସର୍ବସାଧାରଣଙ୍କୁ ଦର୍ଶନ ଦେଉଛନ୍ତି। ଏହି ପୀଠରେ କରାଯାଉଥିବା ପ୍ରତ୍ୟେକ ଦୈନିକ ନୀତିକାନ୍ତି ପୁରୀ ଶ୍ରୀମନ୍ଦିରର ପରମ୍ପରାକୁ ଅନୁସରଣ କରିଥାଏ।"
                  : language === 'hi'
                  ? "मंदिर के प्रवेश द्वार पर भव्य सिंहद्वार स्थापित है, जहां से पतितपावन के रूप में भगवान सभी सामाजिक भेदों से ऊपर उठकर दर्शन देते हैं। इस पीठ में किया जाने वाला प्रत्येक दैनिक अनुष्ठान पुरी श्रीमंदिर की परंपराओं का पालन करता है।"
                  : "At the entrance of the temple premises stands the prominent Singhadwara (Lion's Gate), showcasing the 'Patita Pavan' aspect of Lord Jagannath. In keeping with Odishan heritage, the temple maintains rigorous compliance with Puri's ritual schedule (Nitis) to ensure spiritual authenticity for Ganjam's devotees."
                }
              </p>
            </div>
          </div>
        </section>

        {/* Deity Section */}
        <section className="bg-white dark:bg-temple-darker p-8 md:p-12 rounded-2xl border border-saffron/10 box-glow space-y-8">
          <div className="text-center max-w-2xl mx-auto">
            <span className="text-xs font-bold text-saffron uppercase tracking-widest">Our Presiding Deity</span>
            <h3 className="text-2xl md:text-3xl font-extrabold font-outfit text-maroon mt-1">
              {language === 'or' ? "ପତିତପାବନ ଶ୍ରୀ ଜଗନ୍ନାଥ" : language === 'hi' ? "पतितपावन श्री जगन्नाथ" : "Lord Jagannath — Patitapavan"}
            </h3>
            <p className="text-xs text-temple-500 mt-2 font-semibold">
              Worshipped here as Patitapavan, the redeemer of the fallen.
            </p>
          </div>

          <div className="grid grid-cols-1 max-w-md mx-auto gap-8">
            {/* Lord Jagannath */}
            <div className="text-center space-y-3 p-6 bg-temple-50 dark:bg-temple-dark rounded-xl border border-saffron/5">
              <div className="w-16 h-16 bg-rose-100 text-rose-800 rounded-full flex items-center justify-center font-bold text-xl mx-auto border border-rose-200">
                ଜଗନ୍ନାଥ
              </div>
              <h4 className="text-lg font-bold text-temple-900">Lord Jagannath</h4>
              <p className="text-xs text-temple-600 leading-relaxed font-semibold">
                The Lord of the Universe (Krishna/Vishnu), colored in dark black. His round eyes represent universal watchfulness, extending infinite love to redeem all fallen souls.
              </p>
            </div>
          </div>
        </section>

        {/* Temple Architecture & Premises details */}
        <section className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div className="space-y-6 lg:order-2">
            <div className="flex items-center gap-2 text-saffron font-bold">
              <Compass size={20} />
              <span className="uppercase text-xs tracking-wider">Kalinga Architecture</span>
            </div>
            <h3 className="text-2xl md:text-3xl font-extrabold font-outfit text-maroon">
              Vimana, Jagamohana & Natamandira
            </h3>
            
            <div className="text-sm text-temple-700 space-y-4 leading-relaxed font-semibold">
              <p>
                {language === 'or' 
                  ? "ସିଦ୍ଧେଶ୍ୱର ମନ୍ଦିର କଳିଙ୍ଗ ସ୍ଥାପତ୍ୟ ଶୈଳୀର ଏକ ସୁନ୍ଦର ଉଦାହରଣ ଅଟେ। ଏହା ମୁଖ୍ୟତଃ ଚାରି ଭାଗରେ ବିଭକ୍ତ - ଗର୍ଭଗୃହ (ବିମାନ), ଜଗମୋହନ (ସଭା ଗୃହ), ନାଟମନ୍ଦିର (ନୃତ୍ୟ ଶାଳା) ଏବଂ ଭୋଗମଣ୍ଡପ। ଏହାର କାରୁକାର୍ଯ୍ୟରେ ପ୍ରାଚୀନ ଓଡ଼ିଶାର ଶୈଳୀ ଓ କୋଣାର୍କ ଚକ୍ରର ପ୍ରତିକୃତି ସ୍ଥାନ ପାଇଛି।"
                  : language === 'hi'
                  ? "सिद्धेश्वर मंदिर कलिंग वास्तुकला शैली का एक सुंदर उदाहरण है। यह मुख्य रूप से चार भागों में विभाजित है - गर्भगृह (विमान), जगमोहन (सभा गृह), नाटमंदिर और भोगमंडप। इसके नक्काशी में प्राचीन ओडिशा की कला और कोणार्क चक्र की प्रतिकृति शामिल है।"
                  : "The architectural design mirrors classic Kalinga stone temple planning. Built with horizontal layered red sandstone slabs, it comprises the primary Garbhagriha (sanctum spire/Vimana), the pillared assembly hall (Jagamohana), and the outer hall (Natamandira). Exquisite stone carvings of wheels, lotus motifs, and guardians guard the entrance gates."
                }
              </p>
              <p>
                {language === 'or'
                  ? "ମନ୍ଦିର ଚତୁଃପାର୍ଶ୍ୱରେ ଥିବା ବେଢ଼ାରେ ବିଭିନ୍ନ ପାର୍ଶ୍ଵ ଦେବାଦେବୀ ଯଥା ଶ୍ରୀ ଗଣେଶ, ମାଆ ସରସ୍ୱତୀ, ହନୁମାନ ଏବଂ ପ୍ରଭୁ ଶିବ ଶମ୍ଭୁଙ୍କ କ୍ଷୁଦ୍ର ଆୟତନ ବିଶିଷ୍ଟ ପବିତ୍ର ପୀଠ ମଧ୍ୟ ରହିଅଛି।"
                  : language === 'hi'
                  ? "मंदिर के चारों ओर मुख्य परिसर में विभिन्न देवताओं जैसे श्री गणेश, देवी सरस्वती, हनुमान और भगवान शिव के छोटे पवित्र मंदिर भी हैं।"
                  : "The secure outer courtyard (Meghnad Pacheri) hosts additional subsidiary shrines dedicated to Lord Ganesha, Goddess Saraswati, Lord Shiva, and Hanuman, creating an immersive spiritual layout."
                }
              </p>
            </div>
          </div>

          <div className="glass-card overflow-hidden rounded-2xl relative shadow-md group lg:order-1">
            <img 
              src="/assets/jagannath_sanctum_seva.jpg" 
              alt="Devotee performing seva in front of Lord Jagannath" 
              className="w-full h-96 object-cover object-center group-hover:scale-105 transition-transform duration-700" 
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
            <div className="absolute bottom-6 left-6 text-white z-10">
              <h3 className="text-xl font-bold font-outfit">Anandabazar Dining Area</h3>
              <p className="text-xs text-cream-light/80 mt-1">Sustained by continuous devotee contributions.</p>
            </div>
          </div>
        </section>

        {/* Historical Timeline */}
        <section className="space-y-8">
          <div className="text-center max-w-2xl mx-auto">
            <span className="text-xs font-bold text-saffron uppercase tracking-widest">Chronicles</span>
            <h3 className="text-2xl md:text-3xl font-extrabold font-outfit text-maroon mt-1">
              Historical Timeline
            </h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 relative max-w-3xl mx-auto">
            <div className="hidden md:block absolute top-1/2 left-0 w-full h-0.5 bg-gold/30 -z-10"></div>
            {timelineEvents.map((event, idx) => (
              <div key={idx} className="glass-card p-6 border-t-4 border-saffron flex flex-col justify-between items-center text-center shadow-sm hover:shadow-md transition-shadow">
                <span className="px-3 py-1 bg-saffron text-white rounded-full text-xs font-bold font-outfit mb-3">{event.year}</span>
                <h4 className="font-bold text-sm text-temple-800 mb-2">
                  {language === 'or' ? event.titleOr : language === 'hi' ? event.titleHi : event.titleEn}
                </h4>
                <p className="text-xs text-temple-600 leading-relaxed font-semibold">
                  {language === 'or' ? event.descOr : language === 'hi' ? event.descHi : event.descEn}
                </p>
              </div>
            ))}
          </div>
        </section>

        {/* Mission, Vision, Committee & Rules */}
        <section className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Mission & Vision */}
          <div className="glass-card p-8 border-t-4 border-maroon">
            <div className="flex items-center gap-2 text-maroon font-bold mb-4">
              <Eye size={20} />
              <h3 className="text-lg font-bold font-outfit">Mission & Vision</h3>
            </div>
            <p className="text-xs text-temple-600 leading-relaxed font-semibold">
              To sustain and spread the spiritual tenets of Jagannath culture (Universal brotherhood, humility, charity). The trust works tirelessly to support local Vedic pathshalas, feed poor pilgrims daily, and expand access to clean drinking water and medical resources in Digapahandi villages.
            </p>
          </div>

          {/* Trust Managing Committee */}
          <div className="glass-card p-8 border-t-4 border-gold">
            <div className="flex items-center gap-2 text-gold-dark font-bold mb-4">
              <Users size={20} />
              <h3 className="text-lg font-bold font-outfit">Managing Trust</h3>
            </div>
            <p className="text-xs text-temple-600 leading-relaxed font-semibold">
              The temple is professionally managed by the <strong>Sidheswar Shree Jagannath Temple Trust Board</strong>, registered under the Odisha Hindu Religious Endowments Act. The committee consists of local administrators, hereditary servitors, spiritual scholars, and senior citizen volunteers.
            </p>
          </div>

          {/* Devotee Guidelines / Rules */}
          <div className="glass-card p-8 border-t-4 border-saffron">
            <div className="flex items-center gap-2 text-saffron font-bold mb-4">
              <ShieldCheck size={20} />
              <h3 className="text-lg font-bold font-outfit">Rules & Values</h3>
            </div>
            <p className="text-xs text-temple-600 leading-relaxed font-semibold">
              We urge pilgrims to maintain highest sanctity. Avoid leather wallets/belts inside. Strictly respect dressing guidelines (no shorts, no footwear inside the main gate, mobile phones switched off). Cooperation with crowd controllers helps maintain a peaceful darshan.
            </p>
          </div>
        </section>

        {/* Mukhya Sevaks & Web Seva Section */}
        <section className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Mukhya Sevaks */}
          <div className="glass-card p-8 border-t-4 border-gold flex flex-col justify-between box-glow">
            <div>
              <div className="flex items-center gap-2 text-gold-dark font-bold mb-4">
                <Users size={20} />
                <h3 className="text-lg font-bold font-outfit">Mukhya Sevaks (Chief Servitors)</h3>
              </div>
              <p className="text-xs text-temple-600 leading-relaxed font-semibold mb-4">
                The daily nitis, rituals, and spiritual offerings of the temple are faithfully performed and guided by our Chief Servitors (Mukhya Sevaks):
              </p>
              <ul className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-2 text-xs text-temple-800 font-extrabold list-disc pl-5">
                <li>Kishor Chandra Padhy</li>
                <li>Lulu Padhy</li>
                <li>Rama Chandra Padhy</li>
                <li>Krushna Chandra Padhy</li>
                <li>Binod Chandra Padhy</li>
                <li>Kanhu Charan Khadanga</li>
                <li>Pramod Padhy</li>
              </ul>
            </div>
            <div className="mt-6 pt-4 border-t border-saffron/10 flex items-center gap-2 text-xs text-temple-600">
              <strong>Emergency Phone:</strong> <a href="tel:+919337822942" className="text-saffron hover:underline font-bold">+91 93378 22942</a>
            </div>
          </div>

          {/* Website Creator / Head Sevak */}
          <div className="glass-card p-8 border-t-4 border-saffron flex flex-col justify-between box-glow">
            <div>
              <div className="flex items-center gap-2 text-saffron font-bold mb-4">
                <Award size={20} />
                <h3 className="text-lg font-bold font-outfit">Web Seva & Digital Stewardship</h3>
              </div>
              <p className="text-xs text-temple-600 leading-relaxed font-semibold">
                This digital gateway has been designed and developed as a devotional service (Seva) to Lord Jagannath:
              </p>
              <div className="mt-4 p-4 bg-temple-50 dark:bg-temple-darker rounded-xl border border-saffron/10 space-y-1">
                <h4 className="font-extrabold text-sm text-temple-900">Sumit Kumar Padhy</h4>
                <p className="text-xs text-saffron font-bold">Head Sevak & Website Architect</p>
                <p className="text-[11px] text-temple-500 leading-relaxed font-semibold">
                  Serving both in physical worship and digital administration for Siddheswar Shree Jagannath Temple.
                </p>
              </div>
            </div>
            <div className="mt-6 pt-4 border-t border-saffron/10 flex items-center gap-2 text-xs text-temple-600">
              <strong>Emergency Contact:</strong> <a href="tel:+919337822942" className="text-saffron hover:underline font-bold">+91 93378 22942</a>
            </div>
          </div>
        </section>

      </div>
    </div>
  );
}
