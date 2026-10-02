import type { L, Lang } from "./types";

export const LANGS: { code: Lang; label: string; native: string; speech: string[] }[] = [
  { code: "en", label: "English", native: "English", speech: ["en-IN", "en-GB", "en-US", "en"] },
  { code: "hi", label: "Hindi", native: "हिन्दी", speech: ["hi-IN", "hi"] },
  { code: "mr", label: "Marathi", native: "मराठी", speech: ["mr-IN", "mr"] },
];

type Dict = Record<string, L>;

/**
 * UI dictionary for the main patient workflow (nav, dashboard, upload, report, care plan, voice help).
 * Technical clinical labels in the doctor workspace are intentionally English-only.
 * Hindi and Marathi were written for this prototype and should be reviewed by a native speaker
 * before any real use.
 */
export const DICT: Dict = {
  "app.name": { en: "Clinical Screening Platform", hi: "क्लिनिकल स्क्रीनिंग प्लेटफ़ॉर्म", mr: "क्लिनिकल स्क्रीनिंग प्लॅटफॉर्म" },
  "nav.home": { en: "Home", hi: "होम", mr: "मुख्यपृष्ठ" },
  "nav.upload": { en: "Upload", hi: "अपलोड", mr: "अपलोड" },
  "nav.cases": { en: "Cases", hi: "केस", mr: "केसेस" },
  "nav.history": { en: "History", hi: "इतिहास", mr: "इतिहास" },
  "nav.medicines": { en: "Medicines", hi: "दवाइयाँ", mr: "औषधे" },
  "nav.instructions": { en: "Instructions", hi: "निर्देश", mr: "सूचना" },
  "nav.carePlan": { en: "Care plan", hi: "केयर प्लान", mr: "केअर प्लॅन" },
  "nav.settings": { en: "Settings", hi: "सेटिंग्स", mr: "सेटिंग्ज" },
  "nav.models": { en: "System view", hi: "सिस्टम व्यू", mr: "सिस्टम व्ह्यू" },
  "common.logout": { en: "Log out", hi: "लॉग आउट", mr: "लॉग आउट" },
  "common.language": { en: "Language", hi: "भाषा", mr: "भाषा" },
  "common.continue": { en: "Continue", hi: "आगे बढ़ें", mr: "पुढे जा" },
  "common.back": { en: "Back", hi: "वापस", mr: "मागे" },
  "common.listen": { en: "Listen", hi: "सुनें", mr: "ऐका" },
  "common.stop": { en: "Stop", hi: "रोकें", mr: "थांबवा" },
  "common.pause": { en: "Pause", hi: "रुकें", mr: "थांबा" },
  "common.print": { en: "Print", hi: "प्रिंट", mr: "प्रिंट" },
  "common.demo": { en: "Demo data", hi: "डेमो डेटा", mr: "डेमो डेटा" },
  "common.simulated": { en: "Simulated", hi: "नकली (सिम्युलेटेड)", mr: "सिम्युलेटेड" },

  "disclaimer.title": { en: "This is not a medical diagnosis.", hi: "यह कोई चिकित्सीय निदान नहीं है।", mr: "हे वैद्यकीय निदान नाही." },
  "disclaimer.body": {
    en: "This report was made by a computer program to help you understand your files. It can be wrong. Do not start, stop or change any medicine because of this report. Always show this report to a doctor and follow the doctor's advice. We are not responsible for any decision taken only on the basis of this report.",
    hi: "यह रिपोर्ट एक कंप्यूटर प्रोग्राम ने आपकी फ़ाइलें समझने में मदद के लिए बनाई है। यह ग़लत हो सकती है। इस रिपोर्ट के आधार पर कोई दवा शुरू, बंद या बदलें नहीं। यह रिपोर्ट हमेशा डॉक्टर को दिखाएँ और डॉक्टर की सलाह मानें। केवल इस रिपोर्ट के आधार पर लिए गए किसी भी निर्णय की ज़िम्मेदारी हमारी नहीं है।",
    mr: "हा अहवाल तुमच्या फाइल्स समजण्यास मदत करण्यासाठी संगणक प्रोग्रामने तयार केला आहे. तो चुकीचा असू शकतो. या अहवालामुळे कोणतेही औषध सुरू करू नका, बंद करू नका किंवा बदलू नका. हा अहवाल नेहमी डॉक्टरांना दाखवा आणि डॉक्टरांचा सल्ला पाळा. केवळ या अहवालावर आधारित कोणत्याही निर्णयाची जबाबदारी आमची नाही.",
  },
  "prototype.notice": {
    en: "Prototype with fictional demo data. All AI results are simulated — no real medical model ran.",
    hi: "यह काल्पनिक डेमो डेटा वाला प्रोटोटाइप है। सभी AI परिणाम नकली (सिम्युलेटेड) हैं — कोई असली मेडिकल मॉडल नहीं चला।",
    mr: "काल्पनिक डेमो डेटासह प्रोटोटाइप. सर्व AI निकाल सिम्युलेटेड आहेत — कोणतेही खरे वैद्यकीय मॉडेल चालले नाही.",
  },

  "dash.welcome": { en: "Namaskar", hi: "नमस्कार", mr: "नमस्कार" },
  "dash.uploadCta": { en: "Upload new reports", hi: "नई रिपोर्ट अपलोड करें", mr: "नवीन अहवाल अपलोड करा" },
  "dash.newCase": { en: "Start a new case", hi: "नया केस शुरू करें", mr: "नवीन केस सुरू करा" },
  "dash.latestReport": { en: "Latest report", hi: "ताज़ा रिपोर्ट", mr: "ताजा अहवाल" },
  "dash.prevVisit": { en: "Previous visit summary", hi: "पिछली विज़िट का सारांश", mr: "मागील भेटीचा सारांश" },
  "dash.reminders": { en: "Today's reminders", hi: "आज की याद दिलाने वाली सूचनाएँ", mr: "आजची स्मरणे" },
  "dash.pending": { en: "Pending actions", hi: "बाकी काम", mr: "प्रलंबित कामे" },
  "dash.documents": { en: "Documents uploaded", hi: "अपलोड किए दस्तावेज़", mr: "अपलोड केलेली कागदपत्रे" },
  "dash.labTrends": { en: "Lab trends", hi: "लैब ट्रेंड", mr: "लॅब ट्रेंड" },

  "upload.title": { en: "Upload your medical files", hi: "अपनी मेडिकल फ़ाइलें अपलोड करें", mr: "तुमच्या वैद्यकीय फाइल्स अपलोड करा" },
  "upload.help": {
    en: "Take a photo of each report, one by one. Hold the paper flat in good light. For an X-ray film, hold it against a window or bright screen.",
    hi: "हर रिपोर्ट की एक-एक करके फ़ोटो लें। काग़ज़ को सीधा और अच्छी रोशनी में रखें। एक्स-रे फ़िल्म को खिड़की या तेज़ स्क्रीन के सामने पकड़ें।",
    mr: "प्रत्येक अहवालाचा एक-एक करून फोटो घ्या. कागद सरळ आणि चांगल्या प्रकाशात धरा. एक्स-रे फिल्म खिडकी किंवा तेजस्वी स्क्रीनसमोर धरा.",
  },
  "upload.drop": { en: "Drag files here or choose files", hi: "फ़ाइलें यहाँ खींचें या चुनें", mr: "फाइल्स येथे ओढा किंवा निवडा" },
  "upload.choose": { en: "Choose files", hi: "फ़ाइलें चुनें", mr: "फाइल्स निवडा" },
  "upload.sample": { en: "Load sample files", hi: "सैंपल फ़ाइलें लोड करें", mr: "नमुना फाइल्स लोड करा" },
  "upload.analyze": { en: "Create case and analyse", hi: "केस बनाएँ और जाँचें", mr: "केस तयार करा आणि तपासा" },
  "upload.clear": { en: "Clear all", hi: "सब हटाएँ", mr: "सर्व काढा" },
  "upload.consent": {
    en: "I agree to use these files in this demo. Files stay in my browser and are not uploaded anywhere.",
    hi: "मैं इन फ़ाइलों को इस डेमो में उपयोग करने की सहमति देता/देती हूँ। फ़ाइलें मेरे ब्राउज़र में ही रहती हैं, कहीं अपलोड नहीं होतीं।",
    mr: "मी या फाइल्स या डेमोमध्ये वापरण्यास सहमत आहे. फाइल्स माझ्या ब्राउझरमध्येच राहतात, कुठेही अपलोड होत नाहीत.",
  },
  "upload.q1": { en: "Since when do you have the cough?", hi: "आपको खाँसी कब से है?", mr: "तुम्हाला खोकला कधीपासून आहे?" },
  "upload.q2": { en: "Do you feel breathless?", hi: "क्या आपको साँस फूलती है?", mr: "तुम्हाला धाप लागते का?" },
  "upload.q3": { en: "Do you have chest pain or discomfort?", hi: "क्या आपको सीने में दर्द या बेचैनी है?", mr: "तुम्हाला छातीत दुखते किंवा अस्वस्थ वाटते का?" },

  "progress.title": { en: "Checking your files", hi: "आपकी फ़ाइलों की जाँच", mr: "तुमच्या फाइल्सची तपासणी" },
  "progress.xray": { en: "Checking your chest X-ray…", hi: "आपका छाती का एक्स-रे जाँचा जा रहा है…", mr: "तुमचा छातीचा एक्स-रे तपासत आहोत…" },
  "progress.ecg": { en: "Checking your heart test…", hi: "आपका हृदय परीक्षण जाँचा जा रहा है…", mr: "तुमची हृदय तपासणी तपासत आहोत…" },
  "progress.lab": { en: "Reading your blood reports…", hi: "आपकी ख़ून की रिपोर्ट पढ़ी जा रही है…", mr: "तुमचे रक्त अहवाल वाचत आहोत…" },
  "progress.history": { en: "Reading your old reports…", hi: "आपकी पुरानी रिपोर्ट पढ़ी जा रही हैं…", mr: "तुमचे जुने अहवाल वाचत आहोत…" },
  "progress.write": { en: "Writing your report…", hi: "आपकी रिपोर्ट तैयार हो रही है…", mr: "तुमचा अहवाल तयार होत आहे…" },

  "report.title": { en: "My screening report", hi: "मेरी स्क्रीनिंग रिपोर्ट", mr: "माझा स्क्रीनिंग अहवाल" },
  "report.next": { en: "What to do next", hi: "आगे क्या करें", mr: "पुढे काय करावे" },
  "report.found": { en: "What we found, file by file", hi: "हमें क्या मिला, फ़ाइल-दर-फ़ाइल", mr: "आम्हाला काय आढळले, फाइलनुसार" },
  "report.agree": { en: "Do your results agree?", hi: "क्या आपके परिणाम आपस में मेल खाते हैं?", mr: "तुमचे निकाल एकमेकांशी जुळतात का?" },
  "report.older": { en: "From your older reports", hi: "आपकी पुरानी रिपोर्ट से", mr: "तुमच्या जुन्या अहवालांमधून" },
  "report.notSure": { en: "What the AI is not sure about", hi: "AI किस बारे में निश्चित नहीं है", mr: "AI ला कशाबद्दल खात्री नाही" },
  "report.listen": { en: "Listen in my language", hi: "मेरी भाषा में सुनें", mr: "माझ्या भाषेत ऐका" },
  "report.showDoctor": { en: "Show to doctor", hi: "डॉक्टर को दिखाएँ", mr: "डॉक्टरांना दाखवा" },
  "report.pdf": { en: "Download PDF for doctor", hi: "डॉक्टर के लिए PDF डाउनलोड करें", mr: "डॉक्टरांसाठी PDF डाउनलोड करा" },
  "report.sure": { en: "The AI is {n} percent sure", hi: "AI {n} प्रतिशत निश्चित है", mr: "AI {n} टक्के खात्रीशीर आहे" },
  "report.urgentCall": { en: "If you have chest pain or trouble breathing, call 108 for an ambulance.", hi: "यदि आपको सीने में दर्द या साँस लेने में तकलीफ़ हो, तो एम्बुलेंस के लिए 108 पर कॉल करें।", mr: "छातीत दुखत असल्यास किंवा श्वास घेण्यास त्रास होत असल्यास रुग्णवाहिकेसाठी 108 ला कॉल करा." },
  "risk.normal": { en: "Looks normal", hi: "सामान्य दिखता है", mr: "सामान्य दिसते" },
  "risk.show_doctor": { en: "Show to a doctor", hi: "डॉक्टर को दिखाएँ", mr: "डॉक्टरांना दाखवा" },
  "risk.see_soon": { en: "See a doctor soon", hi: "जल्दी डॉक्टर से मिलें", mr: "लवकर डॉक्टरांना भेटा" },
  "risk.not_sure": { en: "Not sure", hi: "निश्चित नहीं", mr: "खात्री नाही" },

  "care.title": { en: "My care plan", hi: "मेरा केयर प्लान", mr: "माझा केअर प्लॅन" },
  "care.hearDoctor": { en: "Hear doctor", hi: "डॉक्टर की आवाज़ सुनें", mr: "डॉक्टरांचा आवाज ऐका" },
  "care.hearMine": { en: "Hear in my language", hi: "मेरी भाषा में सुनें", mr: "माझ्या भाषेत ऐका" },
  "care.done": { en: "Done", hi: "हो गया", mr: "झाले" },
  "care.today": { en: "Today", hi: "आज", mr: "आज" },
  "care.upcoming": { en: "Upcoming", hi: "आगामी", mr: "येणारी" },

  "voice.welcome": {
    en: "Namaskar. Please take a photo of each report, one by one.",
    hi: "नमस्कार। कृपया हर रिपोर्ट की एक-एक करके फ़ोटो लीजिए।",
    mr: "नमस्कार. कृपया प्रत्येक अहवालाचा एक-एक करून फोटो घ्या.",
  },
  "voice.photoTip": {
    en: "Hold the paper flat, in good light, and keep the whole page inside the photo.",
    hi: "काग़ज़ को सीधा रखें, अच्छी रोशनी में, और पूरा पन्ना फ़ोटो के अंदर रखें।",
    mr: "कागद सरळ धरा, चांगल्या प्रकाशात, आणि संपूर्ण पान फोटोमध्ये ठेवा.",
  },
  "voice.title": { en: "Voice help", hi: "आवाज़ सहायता", mr: "आवाज मदत" },
  "voice.askNote": { en: "Voice answers here are a simulation: no speech-to-text service is connected.", hi: "यहाँ आवाज़ वाले उत्तर सिम्युलेशन हैं: कोई स्पीच-टू-टेक्स्ट सेवा जुड़ी नहीं है।", mr: "येथील आवाजातील उत्तरे सिम्युलेशन आहेत: कोणतीही स्पीच-टू-टेक्स्ट सेवा जोडलेली नाही." },
};

export function t(lang: Lang, key: string, vars?: Record<string, string | number>): string {
  const entry = DICT[key];
  let s = entry ? (entry[lang] ?? entry.en) : key;
  if (vars) for (const [k, v] of Object.entries(vars)) s = s.replace(`{${k}}`, String(v));
  return s;
}

export function tl(lang: Lang, text: L | undefined): string {
  if (!text) return "";
  return text[lang] ?? text.en;
}

/** True when the requested language has no translation for this text (falls back to English). */
export function isFallback(lang: Lang, text: L): boolean {
  return lang !== "en" && !text[lang];
}

export const L3 = (en: string, hi?: string, mr?: string): L => ({ en, hi, mr });
