
import { TaskType } from "../types";

const SIGNATURE_ODIA = "\n\n- ପ୍ରଣବ କୁମାର ବଳବନ୍ତରାୟ";
const SIGNATURE_ENGLISH = "\n\n- Pranab Kumar Balabantaray";
const SIGNATURE_HINDI = "\n\n- प्रणब कुमार बलबंतराय";

const ODIA_BIRTHDAY_TEMPLATES = [
    "ଜନ୍ମଦିନର ହାର୍ଦ୍ଦିକ ଶୁଭେଚ୍ଛା ଓ ଶୁଭକାମନା {name}! ମହାପ୍ରଭୁ ଶ୍ରୀ ଜଗନ୍ନାଥ ଆପଣଙ୍କୁ ସଦା ସର୍ବଦା ସୁସ୍ଥ ଓ ନିରାମୟ ରଖନ୍ତୁ।",
    "{name}, ଆପଣଙ୍କୁ ଜନ୍ମଦିନର ଅନେକ ଅନେକ ଶୁଭେଚ୍ଛା। ଆପଣଙ୍କ ଆଗାମୀ ଜୀବନ ସୁଖମୟ ହେଉ, ଏହା ହିଁ ମୋର କାମନା।",
    "ଜନ୍ମଦିନର ଅଶେଷ ଅଶେଷ ଶୁଭେଚ୍ଛା {name}! ଆପଣଙ୍କର ସମସ୍ତ ସ୍ୱପ୍ନ ପୂରଣ ହେଉ।",
    "ଶୁଭ ଜନ୍ମଦିନ {name}! ପ୍ରଭୁ ଜଗନ୍ନାଥଙ୍କ କୃପାରୁ ଆପଣ ଦୀର୍ଘାୟୁ ହୁଅନ୍ତୁ।",
    "ଆଜିର ଏହି ପବିତ୍ର ଦିନରେ ଆପଣଙ୍କୁ ଜନ୍ମଦିନର ହାର୍ଦ୍ଦିକ ଅଭିନନ୍ଦନ {name}।"
];

const ODIA_ANNIVERSARY_TEMPLATES = [
    "ବିବାହ ବାର୍ଷିକୀର ହାର୍ଦ୍ଦିକ ଶୁଭେଚ୍ଛା ଓ ଅଭିନନ୍ଦନ {name}! ଆପଣଙ୍କ ଦାମ୍ପତ୍ୟ ଜୀବନ ସୁଖମୟ ହେଉ।",
    "{name}, ଆପଣଙ୍କୁ ଓ ଆପଣଙ୍କ ପରିବାରକୁ ବିବାହ ବାର୍ଷିକୀର ଅନେକ ଅନେକ ଶୁଭେଚ୍ଛା।",
    "ଶୁଭ ବିବାହ ବାର୍ଷିକୀ {name}! ମହାପ୍ରଭୁ ଜଗନ୍ନାଥ ଆପଣଙ୍କ ଯୋଡିକୁ ସଦା ସର୍ବଦା ଖୁସିରେ ରଖନ୍ତୁ।",
    "ଆଜିର ଏହି ଶୁଭ ଦିନରେ ଆପଣଙ୍କୁ ବିବାହ ବାର୍ଷିକୀର ହାର୍ଦ୍ଦିକ ଶୁଭକାମନା {name}।",
    "ବିବାହ ବାର୍ଷିକୀର ଅଶେଷ ଶୁଭେଚ୍ଛା {name}! ଆପଣଙ୍କ ସମ୍ପର୍କ ଅତୁଟ ରହୁ।"
];

const ENGLISH_BIRTHDAY_TEMPLATES = [
    "Happy Birthday {name}! Wishing you a fantastic year ahead filled with health and happiness.",
    "Many happy returns of the day, {name}! May Lord Jagannath bless you with good health.",
    "Happy Birthday {name}! Wishing you a year full of success and joy.",
    "Dear {name}, wishing you a very Happy Birthday and a prosperous year ahead!",
    "Happy Birthday {name}! Stay blessed and happy always."
];

const ENGLISH_ANNIVERSARY_TEMPLATES = [
    "Happy Anniversary {name}! Wishing you both endless love and happiness.",
    "Happy Anniversary {name}! May your bond grow stronger with each passing year.",
    "Congratulations on another year of togetherness, {name}! Happy Anniversary.",
    "Happy Anniversary {name}! May your home always be filled with laughter and love.",
    "Best wishes to you, {name}, on your wedding anniversary. Have a lovely day!"
];

const HINDI_BIRTHDAY_TEMPLATES = [
    "जन्मदिन की हार्दिक शुभकामनाएँ {name}! भगवान जगन्नाथ आपको हमेशा स्वस्थ और खुश रखें।",
    "{name}, आपको जन्मदिन की बहुत-बहुत बधाई। आपका आने वाला जीवन मंगलमय हो।",
    "जन्मदिन की ढेर सारी शुभकामनाएँ {name}! आपके सभी सपने पूरे हों।",
    "शुभ जन्मदिन {name}! ईश्वर की कृपा से आप दीर्घायु हों।",
    "आज के इस खास दिन पर आपको जन्मदिन की हार्दिक बधाई {name}।"
];

const HINDI_ANNIVERSARY_TEMPLATES = [
    "शादी की सालगिरह की हार्दिक शुभकामनाएँ {name}! आपका दांपत्य जीवन सुखमय हो।",
    "{name}, आपको और आपके परिवार को शादी की सालगिरह की बहुत-बहुत बधाई।",
    "शुभ विवाह वर्षगांठ {name}! भगवान जगन्नाथ आपकी जोड़ी को हमेशा खुश रखें।",
    "आज के इस शुभ दिन पर आपको शादी की सालगिरह की हार्दिक शुभकामनाएँ {name}।",
    "शादी की सालगिरह की ढेर सारी बधाई {name}! आपका रिश्ता हमेशा अटूट रहे।"
];

const GENERIC_GROUP_MSG = {
    BIRTHDAY: "ଜନ୍ମଦିନର ହାର୍ଦ୍ଦିକ ଶୁଭେଚ୍ଛା! ମହାପ୍ରଭୁ ଶ୍ରୀ ଜଗନ୍ନାଥ ଆପଣଙ୍କୁ ସଦା ସର୍ବଦା ସୁସ୍ଥ ଓ ନିରାମୟ ରଖନ୍ତୁ।",
    ANNIVERSARY: "ବିବାହ ବାର୍ଷିକୀର ହାର୍ଦ୍ଦିକ ଶୁଭେଚ୍ଛା! ଆପଣଙ୍କ ଦାମ୍ପତ୍ୟ ଜୀବନ ସୁଖମୟ ହେଉ।"
};

const getRandomItem = (arr: string[]) => arr[Math.floor(Math.random() * arr.length)];

export const GreetingService = {
    getInstantMessage: (name: string, type: TaskType, language: 'ODIA' | 'ENGLISH' | 'HINDI' = 'ODIA'): string => {
        let templates;
        let signature;

        if (language === 'ODIA') {
            templates = type === 'BIRTHDAY' ? ODIA_BIRTHDAY_TEMPLATES : ODIA_ANNIVERSARY_TEMPLATES;
            signature = SIGNATURE_ODIA;
        } else if (language === 'HINDI') {
            templates = type === 'BIRTHDAY' ? HINDI_BIRTHDAY_TEMPLATES : HINDI_ANNIVERSARY_TEMPLATES;
            signature = SIGNATURE_HINDI;
        } else {
            templates = type === 'BIRTHDAY' ? ENGLISH_BIRTHDAY_TEMPLATES : ENGLISH_ANNIVERSARY_TEMPLATES;
            signature = SIGNATURE_ENGLISH;
        }

        const template = getRandomItem(templates);
        return template.replace("{name}", name) + signature;
    },

    getGenericGroupMessage: (type: TaskType | 'ALL'): string => {
        let msg = "ଶୁଭେଚ୍ଛା ଓ ଅଭିନନ୍ଦନ!";
        if (type === 'BIRTHDAY') msg = GENERIC_GROUP_MSG.BIRTHDAY;
        if (type === 'ANNIVERSARY') msg = GENERIC_GROUP_MSG.ANNIVERSARY;
        
        return msg + SIGNATURE_ODIA;
    }
};
