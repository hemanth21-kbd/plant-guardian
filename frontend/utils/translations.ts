export type Language =
    | 'en' | 'hi' | 'ta' | 'te' | 'kn' | 'ml' | 'bn' | 'gu' | 'mr' | 'pa' | 'ur' // Indian
    | 'es' | 'fr' | 'de' | 'it' | 'pt' | 'ru' | 'Zh' | 'ja' | 'ko' | 'ar'; // Global

// English content source of truth
const enContent = {
    appTitle: "Plant Guardian",
    subtitle: "Instantly detect plant diseases and get expert treatment advice.",
    tabs: {
        camera: "Scanner",
        upload: "Upload",
        assist: "AI Assist",
        garden: "My Garden"
    },
    garden: {
        title: "My Garden",
        addPlant: "Add Plant",
        empty: "Your garden is empty 🌱",
        addFirst: "Add your first plant to start tracking!"
    },
    history: {
        title: "History",
        addEntry: "Add Entry",
        listen: "Tap to Speak",
        listening: "Listening...",
        compare: "Compare Photos"
    },
    common: {
        loading: "Loading...",
        save: "Save",
        cancel: "Cancel",
        submit: "Submit"
    }
};

export type TranslationSchema = typeof enContent;

export const translations: Record<Language, TranslationSchema> = {
    en: enContent,
    // --- Indian Languages ---
    hi: {
        appTitle: "प्लांट गार्जियन (Plant Guardian)",
        subtitle: "पौधों के रोगों का तुरंत पता लगाएं और विशेषज्ञ उपचार सलाह प्राप्त करें।",
        tabs: { camera: "कैमरा", upload: "अपलोड", assist: "एआई सहायता", garden: "मेरा बगीचा" },
        garden: { title: "मेरा बगीचा", addPlant: "पौधा जोड़ें", empty: "आपका बगीचा खाली है", addFirst: "अपना पहला पौधा जोड़ें!" },
        history: { title: "इतिहास", addEntry: "प्रविष्टि जोड़ें", listen: "बोलने के लिए टैप करें", listening: "सुन रहे हैं...", compare: "तुलना करें" },
        common: { loading: "लोड हो रहा है...", save: "सहेजें", cancel: "रद्द करें", submit: "जमा करें" }
    },
    ta: {
        appTitle: "தாவர பாதுகாவலர்",
        subtitle: "தாவர நோய்களை உடனடியாகக் கண்டறிந்து நிபுணர் சிகிச்சை ஆலோசனை பெறுங்கள்.",
        tabs: { camera: "கேமரா", upload: "பதிவேற்றம்", assist: "AI உதவி", garden: "என் தோட்டம்" },
        garden: { title: "என் தோட்டம்", addPlant: "சேர்க்கவும்", empty: "தோட்டம் காலியாக உள்ளது", addFirst: "முதல் செடியைச் சேர்க்கவும்!" },
        history: { title: "வரலாறு", addEntry: "சேர்", listen: "பேச தட்டவும்", listening: "கேட்கிறது...", compare: "ஒப்பிடுக" },
        common: { loading: "ஏற்றுகிறது...", save: "சேமி", cancel: "ரத்து", submit: "சமர்ப்பி" }
    },
    te: {
        appTitle: "ప్లాంట్ గార్డియన్",
        subtitle: "మొక్కల తెగుళ్లను గుర్తించి నిపుణుల సలహా పొందండి.",
        tabs: { camera: "కెమెరా", upload: "అప్‌లోడ్", assist: "AI సహాయం", garden: "నా తోట" },
        garden: { title: "నా తోట", addPlant: "జోడించండి", empty: "తోట ఖాళీగా ఉంది", addFirst: "మొక్కను జోడించండి!" },
        history: { title: "చరిత్ర", addEntry: "జోడించు", listen: "మాట్లాడండి", listening: "వింటున్నారు...", compare: "పోల్చండి" },
        common: { loading: "లోడ్ అవుతోంది...", save: "సేవ్", cancel: "రద్దు", submit: "సమర్పించు" }
    },
    kn: {
        appTitle: "ಪ್ಲಾಂಟ್ ಗಾರ್ಡಿಯನ್",
        subtitle: "ಸಸ್ಯ ರೋಗಗಳನ್ನು ತಕ್ಷಣವೇ ಪತ್ತೆ ಮಾಡಿ ಮತ್ತು ತಜ್ಞರ ಸಲಹೆ ಪಡೆಯಿರಿ.",
        tabs: { camera: "ಕ್ಯಾಮೆರಾ", upload: "ಅಪ್‌ಲೋಡ್", assist: "AI ಸಹಾಯ", garden: "ನನ್ನ ತೋಟ" },
        garden: { title: "ನನ್ನ ತೋಟ", addPlant: "ಸಸ್ಯ ಸೇರಿಸಿ", empty: "ನಿಮ್ಮ ತೋಟ ಖಾಲಿಯಾಗಿದೆ", addFirst: "ಟ್ರ್ಯಾಕಿಂಗ್ ಪ್ರಾರಂಭಿಸಲು ಸಸ್ಯ ಸೇರಿಸಿ!" },
        history: { title: "ಇತಿಹಾಸ", addEntry: "ಸೇರಿಸಿ", listen: "ಮಾತನಾಡಲು ಟ್ಯಾಪ್ ಮಾಡಿ", listening: "ಕೇಳುತ್ತಿದೆ...", compare: "ಹೋಲಿಸಿ" },
        common: { loading: "ಲೋಡ್ ಆಗುತ್ತಿದೆ...", save: "ಉಳಿಸಿ", cancel: "ರದ್ದುಮಾಡಿ", submit: "ಸಲ್ಲಿಸಿ" }
    },
    ml: {
        appTitle: "പ്ലാന്റ് ഗാർഡിയൻ",
        subtitle: "ചെടികളുടെ രോഗങ്ങൾ കണ്ടെത്തി വിദഗ്ദ്ധ ചികിത്സ നേടുക.",
        tabs: { camera: "ക്യാമറ", upload: "അപ്‌ലോഡ്", assist: "AI സഹായം", garden: "എന്റെ തോട്ടം" },
        garden: { title: "എന്റെ തോട്ടം", addPlant: "ചെടി ചേർക്കുക", empty: "തോട്ടം ശൂന്യമാണ്", addFirst: "ആദ്യത്തെ ചെടി ചേർക്കുക!" },
        history: { title: "ചരിത്രം", addEntry: "ചേർക്കുക", listen: "സംസാരിക്കാൻ ടാപ്പുചെയ്യുക", listening: "ശ്രദ്ധിക്കുന്നു...", compare: "താരതമ്യം ചെയ്യുക" },
        common: { loading: "ലോഡുചെയ്യുന്നു...", save: "സേവ് ചെയ്യുക", cancel: "റദ്ദാക്കുക", submit: "സമർപ്പിക്കുക" }
    },
    bn: {
        appTitle: "প্ল্যান্ট গার্ডিয়ান",
        subtitle: "অবিলম্বে গাছের রোগ সনাক্ত করুন এবং বিশেষজ্ঞের পরামর্শ নিন।",
        tabs: { camera: "ক্যামেরা", upload: "আপলোড", assist: "AI সহায়তা", garden: "আমার বাগান" },
        garden: { title: "আমার বাগান", addPlant: "গাছ যোগ করুন", empty: "বাগান খালি 🌱", addFirst: "ট্র্যাকিং শুরু করতে গাছ যোগ করুন!" },
        history: { title: "ইতিহাস", addEntry: "এন্ট্রি যোগ করুন", listen: "কথা বলতে ট্যাপ করুন", listening: "শুনছি...", compare: "তুলনা করুন" },
        common: { loading: "লোডিং...", save: "সংরক্ষণ", cancel: "বাতিল", submit: "জমা দিন" }
    },
    gu: {
        appTitle: "પ્લાન્ટ ગાર્ડિયન",
        subtitle: "છોડના રોગોને તરત જ શોધો અને નિષ્ણાત સારવાર સલાહ મેળવો.",
        tabs: { camera: "કેમેરા", upload: "અપલોડ", assist: "AI મદદ", garden: "મારો બગીચો" },
        garden: { title: "મારો બગીચો", addPlant: "છોડ ઉમેરો", empty: "તમારો બગીચો ખાલી છે", addFirst: "પ્રથમ છોડ ઉમેરો!" },
        history: { title: "ઇતિહાસ", addEntry: "ઉમેરો", listen: "બોલવા માટે ટેપ કરો", listening: "સાંભળી રહ્યું છે...", compare: "સરખામણી કરો" },
        common: { loading: "લોડ થઈ રહ્યું છે...", save: "સાચવો", cancel: "રદ કરો", submit: "સબમિટ" }
    },
    mr: {
        appTitle: "प्लांट गार्डियन",
        subtitle: "झाडांचे रोग त्वरित ओळखा आणि तज्ञांचा सल्ला मिळवा.",
        tabs: { camera: "कॅमेरा", upload: "अपलोड", assist: "AI मदत", garden: "माझी बाग" },
        garden: { title: "माझी बाग", addPlant: "झाड जोडा", empty: "तुमची बाग रिकामी आहे", addFirst: "ट्रॅकिंग सुरू करण्यासाठी झाड जोडा!" },
        history: { title: "इतिहास", addEntry: "नोंद करा", listen: "बोलण्यासाठी टॅप करा", listening: "ऐकत आहे...", compare: "तुलना करा" },
        common: { loading: "लोड होत आहे...", save: "जतन करा", cancel: "रद्द करा", submit: "सबमिट करा" }
    },
    pa: {
        appTitle: "ਪਲਾਂਟ ਗਾਰਡੀਅਨ",
        subtitle: "ਪੌਦਿਆਂ ਦੀਆਂ ਬਿਮਾਰੀਆਂ ਦਾ ਪਤਾ ਲਗਾਓ ਅਤੇ ਮਾਹਰ ਇਲਾਜ ਪ੍ਰਾਪਤ ਕਰੋ।",
        tabs: { camera: "ਕੈਮਰਾ", upload: "ਅਪਲੋਡ", assist: "AI ਮਦਦ", garden: "ਮੇਰਾ ਬਗੀਚਾ" },
        garden: { title: "ਮੇਰਾ ਬਗੀਚਾ", addPlant: "ਪੌਦਾ ਜੋੜੋ", empty: "ਤੁਹਾਡਾ ਬਗੀਚਾ ਖਾਲੀ ਹੈ", addFirst: "ਪਹਿਲਾ ਪੌਦਾ ਜੋੜੋ!" },
        history: { title: "ਇਤਿਹਾਸ", addEntry: "ਜੋੜੋ", listen: "ਬੋਲਣ ਲਈ ਟੈਪ ਕਰੋ", listening: "ਸੁਣ ਰਿਹਾ ਹੈ...", compare: "ਤੁਲਨਾ ਕਰੋ" },
        common: { loading: "ਲੋਡ ਹੋ ਰਿਹਾ ਹੈ...", save: "ਸੇਵ", cancel: "ਰੱਦ ਕਰੋ", submit: "ਜਮ੍ਹਾਂ ਕਰੋ" }
    },
    ur: {
        appTitle: "پلانٹ گارڈین",
        subtitle: "پودوں کی بیماریوں کا فوری پتہ لگائیں اور ماہرانہ علاج حاصل کریں۔",
        tabs: { camera: "کیمرہ", upload: "اپ لوڈ", assist: "AI مدد", garden: "میرا باغ" },
        garden: { title: "میرا باغ", addPlant: "پودا شامل کریں", empty: "آپ کا باغ خالی ہے", addFirst: "شروع کرنے کے لیے پودا شامل کریں!" },
        history: { title: "تاریخ", addEntry: "اندراج", listen: "بولنے کے لیے ٹیپ کریں", listening: "سن رہا ہے...", compare: "موازنہ کریں" },
        common: { loading: "لوڈ ہو رہا ہے...", save: "محفوظ کریں", cancel: "منسوخ", submit: "جمع کرائیں" }
    },
    // --- Major Global Languages ---
    es: {
        appTitle: "Plant Guardian",
        subtitle: "Detecta enfermedades y obtén consejos expertos.",
        tabs: { camera: "Cámara", upload: "Subir", assist: "Asistente IA", garden: "Mi Jardín" },
        garden: { title: "Mi Jardín", addPlant: "Añadir Planta", empty: "Tu jardín está vacío", addFirst: "¡Añade tu primera planta!" },
        history: { title: "Historial", addEntry: "Añadir", listen: "Tocar para hablar", listening: "Escuchando...", compare: "Comparar" },
        common: { loading: "Cargando...", save: "Guardar", cancel: "Cancelar", submit: "Enviar" }
    },
    fr: {
        appTitle: "Plant Guardian",
        subtitle: "Détectez les maladies et obtenez des conseils d'experts.",
        tabs: { camera: "Caméra", upload: "Télécharger", assist: "Assistant IA", garden: "Mon Jardin" },
        garden: { title: "Mon Jardin", addPlant: "Ajouter", empty: "Votre jardin est vide", addFirst: "Ajoutez votre première plante!" },
        history: { title: "Historique", addEntry: "Ajouter", listen: "Appuyez pour parler", listening: "Écoute...", compare: "Comparer" },
        common: { loading: "Chargement...", save: "Sauvegarder", cancel: "Annuler", submit: "Soumettre" }
    },
    de: {
        appTitle: "Plant Guardian",
        subtitle: "Pflanzenkrankheiten erkennen und Expertenrat erhalten.",
        tabs: { camera: "Kamera", upload: "Hochladen", assist: "KI-Hilfe", garden: "Mein Garten" },
        garden: { title: "Mein Garten", addPlant: "Pflanze hinzufügen", empty: "Dein Garten ist leer", addFirst: "Füge deine erste Pflanze hinzu!" },
        history: { title: "Verlauf", addEntry: "Eintrag", listen: "Tippen zum Sprechen", listening: "Zuhören...", compare: "Vergleichen" },
        common: { loading: "Laden...", save: "Speichern", cancel: "Abbrechen", submit: "Senden" }
    },
    it: {
        appTitle: "Plant Guardian",
        subtitle: "Rileva malattie e ottieni consigli esperti.",
        tabs: { camera: "Fotocamera", upload: "Carica", assist: "Assistente IA", garden: "Il Mio Giardino" },
        garden: { title: "Il Mio Giardino", addPlant: "Aggiungi Pianta", empty: "Il tuo giardino è vuoto", addFirst: "Aggiungi la tua prima pianta!" },
        history: { title: "Cronologia", addEntry: "Aggiungi", listen: "Tocca per parlare", listening: "Ascolto...", compare: "Confronta" },
        common: { loading: "Caricamento...", save: "Salva", cancel: "Annulla", submit: "Invia" }
    },
    pt: {
        appTitle: "Plant Guardian",
        subtitle: "Detecte doenças e obtenha conselhos especializados.",
        tabs: { camera: "Câmera", upload: "Carregar", assist: "Assistente IA", garden: "Meu Jardim" },
        garden: { title: "Meu Jardim", addPlant: "Adicionar Planta", empty: "Seu jardim está vazio", addFirst: "Adicione sua primeira planta!" },
        history: { title: "Histórico", addEntry: "Adicionar", listen: "Toque para falar", listening: "Ouvindo...", compare: "Comparar" },
        common: { loading: "Carregando...", save: "Salvar", cancel: "Cancelar", submit: "Enviar" }
    },
    ru: {
        appTitle: "Plant Guardian",
        subtitle: "Выявляйте болезни растений и получайте советы.",
        tabs: { camera: "Камера", upload: "Загрузить", assist: "ИИ Помощник", garden: "Мой Сад" },
        garden: { title: "Мой Сад", addPlant: "Добавить", empty: "Ваш сад пуст", addFirst: "Добавьте свое первое растение!" },
        history: { title: "История", addEntry: "Добавить", listen: "Нажмите, чтобы говорить", listening: "Слушаю...", compare: "Сравнить" },
        common: { loading: "Загрузка...", save: "Сохранить", cancel: "Отмена", submit: "Отправить" }
    },
    Zh: {
        appTitle: "植物卫士",
        subtitle: "即时检测植物病害并获得专家治疗建议。",
        tabs: { camera: "扫描", upload: "上传", assist: "AI助手", garden: "我的花园" },
        garden: { title: "我的花园", addPlant: "添加植物", empty: "你的花园是空的", addFirst: "添加你的第一株植物！" },
        history: { title: "历史", addEntry: "添加记录", listen: "点击说话", listening: "正在聆听...", compare: "对比照片" },
        common: { loading: "加载中...", save: "保存", cancel: "取消", submit: "提交" }
    },
    ja: {
        appTitle: "プラントガーディアン",
        subtitle: "植物の病気を即座に検出し、専門的な治療アドバイスを受け取ります。",
        tabs: { camera: "カメラ", upload: "アップロード", assist: "AIアシスト", garden: "マイガーデン" },
        garden: { title: "マイガーデン", addPlant: "植物を追加", empty: "庭は空です", addFirst: "最初の植物を追加してください！" },
        history: { title: "履歴", addEntry: "追加", listen: "タップして話す", listening: "聞き取り中...", compare: "比較" },
        common: { loading: "読み込み中...", save: "保存", cancel: "キャンセル", submit: "送信" }
    },
    ko: {
        appTitle: "식물 가디언",
        subtitle: "식물 병해를 즉시 감지하고 전문가의 조언을 받으세요.",
        tabs: { camera: "카메라", upload: "업로드", assist: "AI 지원", garden: "나의 정원" },
        garden: { title: "나의 정원", addPlant: "식물 추가", empty: "정원이 비어 있습니다", addFirst: "첫 번째 식물을 추가하세요!" },
        history: { title: "기록", addEntry: "추가", listen: "탭하여 말하기", listening: "듣는 중...", compare: "비교" },
        common: { loading: "로딩 중...", save: "저장", cancel: "취소", submit: "제출" }
    },
    ar: {
        appTitle: "حارس النبات",
        subtitle: "اكتشف أمراض النباتات فوراً واحصل على نصائح الخبراء.",
        tabs: { camera: "كاميرا", upload: "رفع", assist: "مساعد الذكاء الاصطناعي", garden: "حديقتي" },
        garden: { title: "حديقتي", addPlant: "إضافة نبات", empty: "حديقتك فارغة", addFirst: "أضف نباتك الأول!" },
        history: { title: "تاريخ", addEntry: "إضافة", listen: "اضغط للتحدث", listening: "جاري الاستماع...", compare: "مقارنة" },
        common: { loading: "جار التحميل...", save: "حفظ", cancel: "إلغاء", submit: "إرسال" }
    }
};

export const languageOptions = [
    { code: 'en', name: 'English', flag: '🇺🇸' },
    { code: 'hi', name: 'हिंदी (Hindi)', flag: '🇮🇳' },
    { code: 'ta', name: 'தமிழ் (Tamil)', flag: '🇮🇳' },
    { code: 'te', name: 'తెలుగు (Telugu)', flag: '🇮🇳' },
    { code: 'kn', name: 'ಕನ್ನಡ (Kannada)', flag: '🇮🇳' },
    { code: 'ml', name: 'മലയാളം (Malayalam)', flag: '🇮🇳' },
    { code: 'bn', name: 'বাংলা (Bengali)', flag: '🇮🇳' },
    { code: 'gu', name: 'ગુજરાતી (Gujarati)', flag: '🇮🇳' },
    { code: 'mr', name: 'मराठी (Marathi)', flag: '🇮🇳' },
    { code: 'pa', name: 'ਪੰਜਾਬੀ (Punjabi)', flag: '🇮🇳' },
    { code: 'ur', name: 'اردو (Urdu)', flag: '🇵🇰' },
    { code: 'es', name: 'Español', flag: '🇪🇸' },
    { code: 'fr', name: 'Français', flag: '🇫🇷' },
    { code: 'de', name: 'Deutsch', flag: '🇩🇪' },
    { code: 'it', name: 'Italiano', flag: '🇮🇹' },
    { code: 'pt', name: 'Português', flag: '🇵🇹' },
    { code: 'ru', name: 'Русский', flag: '🇷🇺' },
    { code: 'Zh', name: '中文 (Chinese)', flag: '🇨🇳' },
    { code: 'ja', name: '日本語 (Japanese)', flag: '🇯🇵' },
    { code: 'ko', name: '한국어 (Korean)', flag: '🇰🇷' },
    { code: 'ar', name: 'العربية (Arabic)', flag: '🇸🇦' }
];
