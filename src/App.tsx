import React, { useState, useEffect, useRef } from 'react';
import {
  Home, Image as ImageIcon, Video, Laptop, Smartphone, Bot, Calendar as CalendarIcon,
  PhoneCall, BookOpen, Newspaper, Wrench, Sparkles, Bookmark, User, Settings, Search,
  Menu, X, Plus, Heart, ExternalLink, Copy, Upload, Send, Trash2,
  CloudSun, Compass, Globe, ArrowLeftRight, AlertCircle, CheckCircle2,
  LogOut, LogIn, MessageCircle, RefreshCw, ChevronRight
} from 'lucide-react';
import { supabase } from './supabaseClient';
import devicesData from './data/devices.json';
import galleryData from './data/gallery.json';

// --- TYPES ---
type SectionId =
  | 'home' | 'pinterest' | 'videos' | 'computers' | 'smartphones'
  | 'ai-assistant' | 'calendar' | 'operators' | 'directory' | 'news'
  | 'tools' | 'ai-tools' | 'bookmarks' | 'profile' | 'settings' | 'contact';

interface UserProfile {
  id?: string;
  name: string;
  email: string;
  phone: string;
  avatar: string;
  provider?: 'google' | 'phone';
}

interface PinItem {
  id: string;
  title: string;
  category: string;
  image: string;
  author: string;
  likes: number;
  board: string;
}

interface VideoItem {
  id: string;
  platform: 'YouTube' | 'Instagram' | 'TikTok';
  originalUrl: string;
  embedUrl: string;
  title: string;
  addedAt: string;
}

interface DeviceItem {
  id: string;
  brand: string;
  model: string;
  year: number;
  processor: string;
  ram: string;
  storage: string;
  display: string;
  battery: string;
  camera: string;
  price: number;
  image: string;
}

interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
  isError?: boolean;
  attachmentName?: string;
}

interface CalendarEvent {
  id: string;
  title: string;
  date: string;
  time: string;
  color: string;
  notes: string;
}

interface OperatorInfo {
  id: string;
  name: string;
  color: string;
  support: string;
  shortNumbers: { code: string; desc: string }[];
  ussdCodes: { code: string; desc: string }[];
  balanceCode: string;
  tariffs: { name: string; price: string; details: string }[];
  packages: { name: string; price: string; validity: string }[];
  services: string[];
  website: string;
}

interface DirectoryEntry {
  id: string;
  category: string;
  name: string;
  phone: string;
  description: string;
  website?: string;
  address?: string;
  hours?: string;
}

interface NewsItem {
  id: string;
  category: string;
  title: string;
  summary: string;
  date: string;
  source: string;
  url: string;
  image: string;
}

interface AiToolItem {
  id: string;
  name: string;
  category: string;
  description: string;
  pricing: string;
  url: string;
}

interface BookmarkItem {
  id: string;
  type: 'Rasm' | 'Video' | 'Qurilma' | 'Maqola' | 'Raqam';
  title: string;
  subtitle: string;
  section: SectionId;
}

// --- WEBP PLACEHOLDER & SAFE IMAGE COMPONENT ---
const FALLBACK_WEBP_PLACEHOLDER =
  "data:image/svg+xml;utf8," +
  encodeURIComponent(
    `<svg xmlns="http://www.w3.org/2000/svg" width="800" height="500" viewBox="0 0 800 500">
      <rect width="800" height="500" fill="#F4F5F7"/>
      <rect x="330" y="185" width="140" height="95" rx="16" fill="#E4E4E7"/>
      <circle cx="368" cy="218" r="11" fill="#A1A1AA"/>
      <path d="M342 265 L385 228 L415 252 L435 236 L458 265 Z" fill="#A1A1AA"/>
      <text x="400" y="315" font-family="sans-serif" font-size="16" font-weight="600" fill="#71717A" text-anchor="middle">VerMix Media</text>
    </svg>`
  );

function SafeWebPImage({
  src,
  alt,
  className,
}: {
  src: string;
  alt: string;
  className?: string;
}) {
  return (
    <img
      src={src || FALLBACK_WEBP_PLACEHOLDER}
      alt={alt}
      loading="lazy"
      decoding="async"
      onError={(e) => {
        const target = e.currentTarget;
        if (target.src !== FALLBACK_WEBP_PLACEHOLDER) {
          target.src = FALLBACK_WEBP_PLACEHOLDER;
        }
      }}
      className={className}
    />
  );
}

// --- DATA FROM JSON FILES ---
const PHONES_DB: DeviceItem[] = devicesData.phones;
const COMPUTERS_DB: DeviceItem[] = devicesData.computers;
const INITIAL_PINS: PinItem[] = galleryData.pins;
const SECTION_COVERS = galleryData.sectionCovers;

const UZ_OPERATORS: OperatorInfo[] = [
  {
    id: 'beeline', name: 'Beeline Uzbekistan', color: 'bg-amber-400 text-black',
    support: '0611 (Beeline raqamidan) / +998 90 185-00-55',
    shortNumbers: [
      { code: '0611', desc: 'Mijozlarni qo‘llab-quvvatlash markazi' },
      { code: '0674', desc: 'Xizmatlarni boshqarish markazi' },
    ],
    ussdCodes: [
      { code: '*102#', desc: 'Asosiy balans va daqiqalarni tekshirish' },
      { code: '*103#', desc: 'Internet-trafik qoldig‘ini tekshirish' },
      { code: '*110*05#', desc: 'Joriy tarif rejasini bilish' },
      { code: '*148#', desc: 'O‘z raqamini aniqlash' },
      { code: '*110*09#', desc: 'Yoqilgan pullik xizmatlarni ko‘rish' },
    ],
    balanceCode: '*102# / *103#',
    tariffs: [
      { name: 'Yana Bitta', price: '45 000 so‘m/oy', details: '15 GB internet, cheksiz qo‘ng‘iroqlar, 1000 SMS' },
      { name: 'Hammasi ZO‘R 3', price: '65 000 so‘m/oy', details: '30 GB internet, tungi cheksiz trafik, Beeline TV' },
    ],
    packages: [
      { name: 'Internet-paket 5 GB', price: '25 000 so‘m', validity: '30 kun (*1*05#)' },
      { name: 'Internet-paket 20 GB', price: '55 000 so‘m', validity: '30 kun (*1*20#)' },
    ],
    services: ['Beeline TV', 'Beeline Music', 'Beepul to‘lov tizimi', 'eSIM xizmati'],
    website: 'https://beeline.uz'
  },
  {
    id: 'ucell', name: 'Ucell', color: 'bg-purple-600 text-white',
    support: '8123 (Ucell raqamidan) / +998 93 180-00-00',
    shortNumbers: [
      { code: '8123', desc: 'Call-markaz (24/7)' },
      { code: '9999', desc: 'Axborot xizmati' },
    ],
    ussdCodes: [
      { code: '*100#', desc: 'Balansni tekshirish' },
      { code: '*107#', desc: 'Internet va daqiqa qoldiqlarini ko‘rish' },
      { code: '*450#', desc: 'O‘z telefon raqamini bilish' },
      { code: '*120#', desc: 'Tarif rejasini tekshirish' },
      { code: '*401#', desc: 'Faol xizmatlar ro‘yxati' },
    ],
    balanceCode: '*100# / *107#',
    tariffs: [
      { name: 'Katta Doimiy 40', price: '40 000 so‘m/oy', details: '12 GB internet, tarmoq ichida cheksiz, 1500 daqiqa' },
      { name: 'Katta Doimiy 70', price: '70 000 so‘m/oy', details: '35 GB internet, barcha yo‘nalishlarga cheksiz qo‘ng‘iroq' },
    ],
    packages: [
      { name: 'Oylik 6 GB', price: '28 000 so‘m', validity: '30 kun (*555*3*2#)' },
      { name: 'Oylik 18 GB', price: '55 000 so‘m', validity: '30 kun (*555*3*4#)' },
    ],
    services: ['Ucell mobil ilovasi', 'eSIM', 'U-To‘lov', 'Xalqaro rouming'],
    website: 'https://ucell.uz'
  },
  {
    id: 'uzmobile', name: 'Uztelecom (Uzmobile)', color: 'bg-sky-600 text-white',
    support: '1099 (Uzmobile raqamidan) / +998 71 200-09-09',
    shortNumbers: [
      { code: '1099', desc: 'Mobil aloqa qo‘llab-quvvatlash markazi' },
      { code: '1084', desc: 'Uy interneti (Uzonline) texnik yordam' },
    ],
    ussdCodes: [
      { code: '*100#', desc: 'Hisob (balans) va limitlarni tekshirish' },
      { code: '*107#', desc: 'Bonus va internet-paket qoldig‘i' },
      { code: '*100*4#', desc: 'O‘z raqamini aniqlash' },
      { code: '*111#', desc: 'Umumiy USSD menyu' },
    ],
    balanceCode: '*100# / *107#',
    tariffs: [
      { name: 'Milliy 40', price: '40 000 so‘m/oy', details: '12 GB internet, O‘zbekiston bo‘ylab cheksiz qo‘ng‘iroq' },
      { name: 'Milliy 70', price: '70 000 so‘m/oy', details: '35 GB internet, cheksiz qo‘ng‘iroqlar, 3000 SMS' },
    ],
    packages: [
      { name: 'Internet 5 GB', price: '22 000 so‘m', validity: '30 kun (*147*10072#)' },
      { name: 'Internet 20 GB', price: '50 000 so‘m', validity: '30 kun (*147*10075#)' },
    ],
    services: ['MyUZTELECOM', 'TelecomTV', 'eSIM', 'Bulutli xizmatlar'],
    website: 'https://uztelecom.uz'
  },
  {
    id: 'mobiuz', name: 'Mobiuz', color: 'bg-red-600 text-white',
    support: '0890 (Mobiuz raqamidan) / +998 97 130-09-09',
    shortNumbers: [
      { code: '0890', desc: 'Mijozlarga xizmat ko‘rsatish markazi' },
      { code: '0990', desc: 'Tezkor ma’lumot xizmati' },
    ],
    ussdCodes: [
      { code: '*100#', desc: 'Balansni tekshirish' },
      { code: '*102#', desc: 'Internet-paket qoldig‘ini tekshirish' },
      { code: '*150#', desc: 'O‘z telefon raqamini bilish' },
      { code: '*111#', desc: 'Mobiuz USSD boshqaruv menyusi' },
    ],
    balanceCode: '*100# / *102#',
    tariffs: [
      { name: 'Xotirjam 40', price: '40 000 so‘m/oy', details: '15 GB internet, O‘zbekiston bo‘ylab cheksiz qo‘ng‘iroq' },
      { name: 'Xotirjam 60', price: '60 000 so‘m/oy', details: '30 GB internet, messenjerlar uchun qo‘shimcha trafik' },
    ],
    packages: [
      { name: 'OnNet 5 GB', price: '25 000 so‘m', validity: '30 kun (*171*019*3#)' },
      { name: 'OnNet 20 GB', price: '55 000 so‘m', validity: '30 kun (*171*019*6#)' },
    ],
    services: ['Mobiuz ilovasi', 'Chiroyli raqamlar', 'eSIM', 'MobiMusic'],
    website: 'https://mobi.uz'
  },
  {
    id: 'humans', name: 'Humans', color: 'bg-yellow-300 text-black',
    support: '1234 (Humans raqamidan) / +998 71 207-77-77',
    shortNumbers: [
      { code: '1234', desc: 'Humans qo‘llab-quvvatlash xizmati' },
    ],
    ussdCodes: [
      { code: '*100#', desc: 'Balans va paketlar holati' },
      { code: '*111#', desc: 'O‘z raqamini aniqlash' },
    ],
    balanceCode: '*100# yoki Humans ilovasi',
    tariffs: [
      { name: 'Konstruktor Tarif', price: '25 000 so‘mdan', details: 'Daqiqa va gigabaytlarni ilovada o‘zingiz tanlaysiz' },
    ],
    packages: [
      { name: 'Cheksiz Telegram/Instagram', price: '15 000 so‘m', validity: '30 kun (ilovada)' },
    ],
    services: ['Humans Visa bank kartasi', 'Keshbek tizimi', 'eSIM', 'HUMANS.uz ilovasi'],
    website: 'https://humans.uz'
  }
];

const UZ_DIRECTORY: DirectoryEntry[] = [
  { id: 'd1', category: 'Favqulodda xizmatlar', name: 'O‘t o‘chirish va FVV qutqaruv xizmati', phone: '101', description: 'Yong‘in va favqulodda vaziyatlarda tezkor yordam (24/7)', hours: '24/7' },
  { id: 'd2', category: 'Favqulodda xizmatlar', name: 'Ichki ishlar organlari (Militsiya / 102)', phone: '102', description: 'Huquq-tartibot va tezkor xavfsizlik xizmati', hours: '24/7' },
  { id: 'd3', category: 'Favqulodda xizmatlar', name: 'Tez tibbiy yordam', phone: '103', description: 'Shoshilinch tibbiy yordam chaqirish raqami', hours: '24/7' },
  { id: 'd4', category: 'Gaz xizmati', name: 'Hududgazta’minot avariya xizmati', phone: '104', description: 'Gaz sizib chiqishi va avariya holatlari uchun tezkor raqam', website: 'https://hududgaz.uz', hours: '24/7' },
  { id: 'd5', category: 'Elektr xizmati', name: 'Hududiy elektr tarmoqlari (HET)', phone: '1154', description: 'Elektr energiyasi uzilishlari va hisoblagichlar bo‘yicha call-markaz', website: 'https://het.uz', hours: '24/7' },
  { id: 'd6', category: 'Suv xizmati', name: 'O‘zsuvta’minot yagona call-markazi', phone: '1255', description: 'Ichimlik suvi va kanalizatsiya tarmoqlari bo‘yicha murojaatlar', website: 'https://uzsuv.uz', hours: '24/7' },
  { id: 'd7', category: 'Banklar', name: 'O‘zbekiston Respublikasi Markaziy banki', phone: '+998 71 200-00-44', description: 'Ishonch telefoni va bank xizmatlari bo‘yicha murojaatlar', website: 'https://cbu.uz', address: 'Toshkent sh., Islom Karimov ko‘chasi, 6', hours: '09:00 - 18:00' },
  { id: 'd8', category: 'Banklar', name: 'Milliy bank (NBU)', phone: '+998 78 148-00-10', description: 'Jismoniy va yuridik shaxslar uchun call-markaz', website: 'https://nbu.uz', hours: '24/7' },
  { id: 'd9', category: 'Banklar', name: 'Kapitalbank', phone: '1340', description: 'Kartalar, ilova va bank xizmatlari qo‘llab-quvvatlash markazi', website: 'https://kapitalbank.uz', hours: '24/7' },
  { id: 'd10', category: 'Davlat tashkilotlari', name: 'Yagona interaktiv davlat xizmatlari (My.gov.uz)', phone: '1148', description: 'Elektron davlat xizmatlari bo‘yicha yagona yordam markazi', website: 'https://my.gov.uz', hours: '24/7' },
  { id: 'd11', category: 'Davlat tashkilotlari', name: 'Soliq qo‘mitasi call-markazi', phone: '1198', description: 'Soliq to‘lovchilar uchun maslahat va texnik yordam', website: 'https://soliq.uz', hours: '09:00 - 18:00' },
  { id: 'd12', category: 'Internet provayderlar', name: 'Uzonline (Uztelecom)', phone: '1084', description: 'Uy va ofis optik internet xizmatlari texnik yordami', website: 'https://uztelecom.uz', hours: '24/7' },
  { id: 'd13', category: 'Internet provayderlar', name: 'Sarkor Telecom', phone: '+998 78 120-00-00', description: 'Yuqori tezlikdagi internet va TV xizmatlari', website: 'https://sarkor.uz', hours: '24/7' },
  { id: 'd14', category: 'Aviakompaniyalar', name: 'Uzbekistan Airways', phone: '+998 78 140-02-00', description: 'Aviachiptalar, reyslar jadvali va qo‘llab-quvvatlash', website: 'https://uzairways.com', hours: '24/7' },
  { id: 'd15', category: 'Transport', name: 'O‘zbekiston temir yo‘llari', phone: '1005', description: 'Poyezd chiptalari va vokzal ma’lumotxonasi', website: 'https://railway.uz', hours: '24/7' },
  { id: 'd16', category: 'Universitetlar', name: 'TATU (Toshkent axborot texnologiyalari universiteti)', phone: '+998 71 238-64-15', description: 'Qabul komissiyasi va ma’muriyat', website: 'https://tuit.uz', address: 'Toshkent sh., Amir Temur shoh ko‘chasi, 108', hours: '09:00 - 17:00' },
  { id: 'd17', category: 'Yetkazib berish', name: 'O‘zbekiston pochtasi (UzPost)', phone: '+998 71 233-57-47', description: 'Pochta jo‘natmalari va kuryerlik xizmati', website: 'https://uz.post', hours: '09:00 - 18:00' },
];

const NEWS_ITEMS: NewsItem[] = [
  { id: 'n1', category: 'AI yangiliklari', title: 'Google Gemini 2.5 modellarining yangi avlod imkoniyatlari taqdim etildi', summary: 'Yangi multimodal tahlil va kod yozish tezligi dasturchilar uchun katta qulaylik yaratmoqda.', date: '2026-11-12', source: 'Google AI Blog', url: 'https://blog.google/technology/ai/', image: 'https://images.unsplash.com/photo-1677442136019-21780ecad995?auto=format&fit=crop&w=800&q=80&fm=webp' },
  { id: 'n2', category: 'O‘zbekiston', title: 'IT Park Uzbekistan eksport hajmi yangi rekord darajaga yetdi', summary: 'Mahalliy dasturiy mahsulotlar va autsorsing xizmatlari 60 dan ortiq davlatga eksport qilinmoqda.', date: '2026-11-11', source: 'IT Park UZ', url: 'https://it-park.uz', image: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=800&q=80&fm=webp' },
  { id: 'n3', category: 'Smartfonlar', title: 'Flagman smartfonlarda kremniy-uglerod (Silicon-Carbon) batareyalar davri', summary: 'Yupqa korpusda 6000 mAh sig‘imli batareyalar endi yangi standartga aylanmoqda.', date: '2026-11-10', source: 'GSMArena', url: 'https://www.gsmarena.com', image: 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?auto=format&fit=crop&w=800&q=80&fm=webp' },
  { id: 'n4', category: 'Kompyuterlar', title: 'ARM arxitekturasidagi noutbuklar bozor ulushini tez sur’atda oshirmoqda', summary: 'Apple Silicon va Snapdragon X seriyalari avtonomlik bo‘yicha yangi mezon o‘rnatdi.', date: '2026-11-09', source: 'The Verge', url: 'https://www.theverge.com', image: 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?auto=format&fit=crop&w=800&q=80&fm=webp' },
  { id: 'n5', category: 'Koinot', title: 'James Webb teleskopi uzoq ekzosayyora atmosferasida yangi molekulalarni aniqladi', summary: 'Astronomlar yerdan 120 yorug‘lik yili uzoqlikdagi sayyora tarkibini o‘rganmoqda.', date: '2026-11-08', source: 'NASA Science', url: 'https://science.nasa.gov', image: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&w=800&q=80&fm=webp' },
  { id: 'n6', category: 'Texnologiya', title: 'WebAssembly va Edge Computing zamonaviy veb-ilovalarni tezlashtirmoqda', summary: 'Brauzer ichida og‘ir hisob-kitoblarni bajarish yanada soddalashdi.', date: '2026-11-07', source: 'TechCrunch', url: 'https://techcrunch.com', image: 'https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=800&q=80&fm=webp' },
];

const AI_TOOLS_DIR: AiToolItem[] = [
  { id: 'at1', name: 'ChatGPT (OpenAI)', category: 'Matn va Muloqot', description: 'Savol-javob, matn yozish, tahlil va dasturlash uchun universal AI.', pricing: 'Freemium', url: 'https://chatgpt.com' },
  { id: 'at2', name: 'Google Gemini', category: 'Matn va Muloqot', description: 'Multimodal AI yordamchi — matn, kod, rasm va hujjatlar bilan ishlaydi.', pricing: 'Freemium', url: 'https://gemini.google.com' },
  { id: 'at3', name: 'Claude (Anthropic)', category: 'Dasturlash', description: 'Katta hajmli kod bazalari va murakkab tahlillar uchun kuchli model.', pricing: 'Freemium', url: 'https://claude.ai' },
  { id: 'at4', name: 'Midjourney', category: 'Rasm yaratish', description: 'Matn tavsifi asosida yuqori badiiy sifatdagi tasvirlar generatsiyasi.', pricing: 'Pullik', url: 'https://www.midjourney.com' },
  { id: 'at5', name: 'Perplexity AI', category: 'Qidiruv va Tadqiqot', description: 'Manbalarga asoslangan real vaqtdagi aqlli qidiruv tizimi.', pricing: 'Freemium', url: 'https://www.perplexity.ai' },
  { id: 'at6', name: 'Cursor AI', category: 'Dasturlash', description: 'AI o‘rnatilgan zamonaviy kod muharriri (IDE).', pricing: 'Freemium', url: 'https://www.cursor.com' },
  { id: 'at7', name: 'ElevenLabs', category: 'Audio va Ovoz', description: 'Tabiiy ovoz sintezi va matnni ovozga o‘girish platformasi.', pricing: 'Freemium', url: 'https://elevenlabs.io' },
  { id: 'at8', name: 'Notion AI', category: 'Samaradorlik', description: 'Eslatmalar, hujjatlar va loyiha rejalarini avtomatlashtirish.', pricing: 'Pullik', url: 'https://www.notion.so' },
];

// --- HELPER: VIDEO URL PARSER ---
function parseVideoEmbed(url: string): { platform: 'YouTube' | 'Instagram' | 'TikTok'; embedUrl: string } | null {
  const trimmed = url.trim();
  const ytMatch = trimmed.match(/(?:youtube\.com\/(?:watch\?v=|shorts\/|embed\/)|youtu\.be\/)([a-zA-Z0-9_-]{11})/);
  if (ytMatch) {
    return { platform: 'YouTube', embedUrl: `https://www.youtube.com/embed/${ytMatch[1]}` };
  }
  const igMatch = trimmed.match(/instagram\.com\/(?:p|reel|tv)\/([a-zA-Z0-9_-]+)/);
  if (igMatch) {
    return { platform: 'Instagram', embedUrl: `https://www.instagram.com/p/${igMatch[1]}/embed` };
  }
  const ttMatch = trimmed.match(/tiktok\.com\/@[^/]+\/video\/(\d+)/);
  if (ttMatch) {
    return { platform: 'TikTok', embedUrl: `https://www.tiktok.com/embed/v2/${ttMatch[1]}` };
  }
  return null;
}

// --- MAIN APPLICATION ---
export default function App() {
  const [activeSection, setActiveSection] = useState<SectionId>('home');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [globalQuery, setGlobalQuery] = useState('');
  const [toastMsg, setToastMsg] = useState<string | null>(null);
  const [now, setNow] = useState(new Date());

  // Floating Bottom-Right AI Widget State
  const [floatingAiOpen, setFloatingAiOpen] = useState(false);

  // Auth & Profile (Google & Telefon SMS — Telegram login va PWA yo'q)
  const [user, setUser] = useState<UserProfile | null>(() => {
    const saved = localStorage.getItem('vermix_user');
    return saved ? JSON.parse(saved) : null;
  });
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [authTab, setAuthTab] = useState<'google' | 'phone'>('google');
  const [phoneInput, setPhoneInput] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  const [otpCode, setOtpCode] = useState('');
  const [authLoading, setAuthLoading] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);

  // Pinterest State
  const [pins, setPins] = useState<PinItem[]>(() => {
    const saved = localStorage.getItem('vermix_pins_v2');
    return saved ? JSON.parse(saved) : INITIAL_PINS;
  });
  const [pinCategory, setPinCategory] = useState('Barchasi');
  const [pinSearch, setPinSearch] = useState('');
  const [likedPins, setLikedPins] = useState<string[]>([]);
  const [newPinModal, setNewPinModal] = useState(false);
  const [newPinTitle, setNewPinTitle] = useState('');
  const [newPinUrl, setNewPinUrl] = useState('');
  const [newPinCat, setNewPinCat] = useState('Texnologiya');

  // Videos State
  const [videoUrlInput, setVideoUrlInput] = useState('');
  const [videos, setVideos] = useState<VideoItem[]>(() => {
    const saved = localStorage.getItem('vermix_videos');
    return saved ? JSON.parse(saved) : [
      {
        id: 'v1',
        platform: 'YouTube',
        originalUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
        embedUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
        title: 'YouTube Rasmiy Embed Namuna',
        addedAt: 'Bugun',
      },
    ];
  });
  const [activeVideo, setActiveVideo] = useState<VideoItem | null>(videos[0] || null);
  const [videoError, setVideoError] = useState<string | null>(null);

  // Computers & Smartphones Filter + Search + Sort State
  const [compBrand, setCompBrand] = useState('Barchasi');
  const [compSearch, setCompSearch] = useState('');
  const [compSort, setCompSort] = useState<'default' | 'price-asc' | 'price-desc' | 'year-desc'>('default');
  const [selectedComputer, setSelectedComputer] = useState<DeviceItem | null>(null);
  const [compareComputers, setCompareComputers] = useState<string[]>(['c1', 'c5']);

  const [phoneBrand, setPhoneBrand] = useState('Barchasi');
  const [phoneSearch, setPhoneSearch] = useState('');
  const [phoneSort, setPhoneSort] = useState<'default' | 'price-asc' | 'price-desc' | 'year-desc'>('default');
  const [selectedPhone, setSelectedPhone] = useState<DeviceItem | null>(null);
  const [comparePhones, setComparePhones] = useState<string[]>(['s1', 's7']);

  // AI Assistant State
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>(() => {
    const saved = localStorage.getItem('vermix_chat');
    return saved ? JSON.parse(saved) : [
      {
        id: 'm1',
        role: 'assistant',
        content: 'Assalomu alaykum! Men **VerMix AI** yordamchisiman. Savollaringizga javob beraman, kod yozaman va qurilma tanlashda yordam beraman.',
        timestamp: 'Hozir',
      },
    ];
  });
  const [chatInput, setChatInput] = useState('');
  const [aiThinking, setAiThinking] = useState(false);
  const [uploadedFileName, setUploadedFileName] = useState<string | null>(null);
  const [uploadedFileText, setUploadedFileText] = useState<string>('');
  const floatingChatEndRef = useRef<HTMLDivElement | null>(null);

  // Calendar State
  const [events, setEvents] = useState<CalendarEvent[]>(() => {
    const saved = localStorage.getItem('vermix_events');
    const todayStr = new Date().toISOString().slice(0, 10);
    return saved ? JSON.parse(saved) : [
      { id: 'e1', title: 'VerMix loyihasini yangilash', date: todayStr, time: '14:00', color: 'bg-blue-500', notes: 'Yangi modellarni tekshirish' },
      { id: 'e2', title: 'Jamoa bilan uchrashuv', date: todayStr, time: '18:30', color: 'bg-emerald-500', notes: 'Dizayn muhokamasi' },
    ];
  });
  const [calView, setCalView] = useState<'month' | 'week' | 'day'>('month');
  const [newEventTitle, setNewEventTitle] = useState('');
  const [newEventDate, setNewEventDate] = useState(new Date().toISOString().slice(0, 10));
  const [newEventTime, setNewEventTime] = useState('12:00');
  const [newEventColor, setNewEventColor] = useState('bg-blue-500');

  // Operators & Directory State
  const [selectedOperator, setSelectedOperator] = useState<string>('beeline');
  const [dirCategory, setDirCategory] = useState('Barchasi');
  const [dirSearch, setDirSearch] = useState('');

  // Productivity Tools State
  const [activeTool, setActiveTool] = useState<'calc' | 'currency' | 'unit' | 'timer' | 'notes' | 'todo' | 'qr' | 'password'>('calc');
  const [calcExpr, setCalcExpr] = useState('');
  const [usdAmount, setUsdAmount] = useState('100');
  const [uzsRate] = useState(12850);
  const [unitMeters, setUnitMeters] = useState('1000');
  const [stopwatchSec, setStopwatchSec] = useState(0);
  const [stopwatchRunning, setStopwatchRunning] = useState(false);
  const [noteText, setNoteText] = useState(() => localStorage.getItem('vermix_notes') || 'Tezkor eslatmalar uchun bloknot...');
  const [todos, setTodos] = useState<{ id: string; text: string; done: boolean }[]>(() => {
    const saved = localStorage.getItem('vermix_todos');
    return saved ? JSON.parse(saved) : [
      { id: 'td1', text: 'Google Auth va SMS OTP ni tekshirish', done: true },
      { id: 'td2', text: 'Yangi vazifalar rejasini tuzish', done: false },
    ];
  });
  const [todoInput, setTodoInput] = useState('');
  const [qrText, setQrText] = useState('https://vermix.uz');
  const [genPass, setGenPass] = useState('VmX#92!kLp@2026');

  // News & AI Tools State
  const [newsCategory, setNewsCategory] = useState('Barchasi');
  const [aiToolCat, setAiToolCat] = useState('Barchasi');
  const [aiToolSearch, setAiToolSearch] = useState('');

  // Bookmarks State
  const [bookmarks, setBookmarks] = useState<BookmarkItem[]>(() => {
    const saved = localStorage.getItem('vermix_bookmarks');
    return saved ? JSON.parse(saved) : [
      { id: 'b1', type: 'Qurilma', title: 'MacBook Pro 14 (M4 Pro)', subtitle: 'Apple • $1,999', section: 'computers' },
      { id: 'b2', type: 'Raqam', title: 'Tez tibbiy yordam — 103', subtitle: 'Favqulodda xizmatlar', section: 'directory' },
    ];
  });

  // Contact Form State
  const [contactName, setContactName] = useState('');
  const [contactMsg, setContactMsg] = useState('');

  // --- EFFECTS ---
  useEffect(() => {
    const t = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(t);
  }, []);

  useEffect(() => {
    if (!stopwatchRunning) return;
    const t = setInterval(() => setStopwatchSec((s) => s + 1), 1000);
    return () => clearInterval(t);
  }, [stopwatchRunning]);

  useEffect(() => {
    if (user) localStorage.setItem('vermix_user', JSON.stringify(user));
    else localStorage.removeItem('vermix_user');
  }, [user]);

  useEffect(() => { localStorage.setItem('vermix_pins_v2', JSON.stringify(pins)); }, [pins]);
  useEffect(() => { localStorage.setItem('vermix_videos', JSON.stringify(videos)); }, [videos]);
  useEffect(() => {
    localStorage.setItem('vermix_chat', JSON.stringify(chatMessages));
    floatingChatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatMessages, floatingAiOpen]);
  useEffect(() => { localStorage.setItem('vermix_events', JSON.stringify(events)); }, [events]);
  useEffect(() => { localStorage.setItem('vermix_notes', noteText); }, [noteText]);
  useEffect(() => { localStorage.setItem('vermix_todos', JSON.stringify(todos)); }, [todos]);
  useEffect(() => { localStorage.setItem('vermix_bookmarks', JSON.stringify(bookmarks)); }, [bookmarks]);

  // Supabase Auth Session Listener
  useEffect(() => {
    if (!supabase) return;
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        const u = session.user;
        setUser({
          id: u.id,
          name: u.user_metadata?.full_name || u.user_metadata?.name || u.phone || u.email?.split('@')[0] || 'Foydalanuvchi',
          email: u.email || '',
          phone: u.phone || '',
          avatar: u.user_metadata?.avatar_url || u.user_metadata?.picture || '',
          provider: u.phone ? 'phone' : 'google',
        });
      }
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user) {
        const u = session.user;
        setUser({
          id: u.id,
          name: u.user_metadata?.full_name || u.user_metadata?.name || u.phone || u.email?.split('@')[0] || 'Foydalanuvchi',
          email: u.email || '',
          phone: u.phone || '',
          avatar: u.user_metadata?.avatar_url || u.user_metadata?.picture || '',
          provider: u.phone ? 'phone' : 'google',
        });
        setAuthModalOpen(false);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  // --- HELPERS ---
  const showToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(null), 3000);
  };

  const copyText = (text: string, label?: string) => {
    navigator.clipboard.writeText(text);
    showToast(`${label || text} nusxalandi!`);
  };

  const navigateTo = (id: SectionId) => {
    setActiveSection(id);
    setSidebarOpen(false);
  };

  const toggleBookmark = (item: BookmarkItem) => {
    setBookmarks((prev) => {
      const exists = prev.some((b) => b.title === item.title);
      if (exists) {
        showToast('Saqlanganlardan olib tashlandi');
        return prev.filter((b) => b.title !== item.title);
      }
      showToast('Saqlanganlarga qo‘shildi!');
      return [item, ...prev];
    });
  };

  // --- SUPABASE AUTH HANDLERS ---
  const handleGoogleLogin = async () => {
    setAuthError(null);
    if (!supabase) {
      setAuthError('Supabase ulanmagan: Railway Variables bo‘limida VITE_SUPABASE_URL va VITE_SUPABASE_ANON_KEY kiritilganini tekshiring.');
      return;
    }
    setAuthLoading(true);
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: window.location.origin },
    });
    setAuthLoading(false);
    if (error) setAuthError('Google orqali kirishda xatolik: ' + error.message);
  };

  const handleSendOtp = async () => {
    setAuthError(null);
    const digits = phoneInput.replace(/\D/g, '');
    if (digits.length !== 9) {
      setAuthError('Iltimos, 9 xonali telefon raqamingizni kiriting (masalan: 90 123 45 67).');
      return;
    }
    const fullPhone = `+998${digits}`;
    if (!supabase) {
      setAuthError('Supabase ulanmagan! Railway Variables bo‘limini tekshiring.');
      return;
    }
    setAuthLoading(true);
    const { error } = await supabase.auth.signInWithOtp({ phone: fullPhone });
    setAuthLoading(false);
    if (error) {
      setAuthError(`SMS yuborishda xatolik: ${error.message}`);
    } else {
      setOtpSent(true);
      showToast(`${fullPhone} raqamiga tasdiqlash kodi yuborildi!`);
    }
  };

  const handleVerifyOtp = async () => {
    setAuthError(null);
    const digits = phoneInput.replace(/\D/g, '');
    const fullPhone = `+998${digits}`;
    if (otpCode.trim().length < 4) {
      setAuthError('Telefoningizga kelgan SMS kodni kiriting.');
      return;
    }
    if (!supabase) return;
    setAuthLoading(true);
    const { data, error } = await supabase.auth.verifyOtp({
      phone: fullPhone,
      token: otpCode.trim(),
      type: 'sms',
    });
    setAuthLoading(false);
    if (error) {
      setAuthError('Kod noto‘g‘ri yoki muddati tugagan: ' + error.message);
    } else if (data.user) {
      setUser({
        id: data.user.id,
        name: data.user.user_metadata?.full_name || fullPhone,
        email: data.user.email || '',
        phone: fullPhone,
        avatar: '',
        provider: 'phone',
      });
      setAuthModalOpen(false);
      setOtpSent(false);
      setOtpCode('');
      showToast('Telefon raqami orqali muvaffaqiyatli kirdingiz!');
    }
  };

  const handleLogout = async () => {
    if (supabase) await supabase.auth.signOut();
    setUser(null);
    showToast('Tizimdan chiqdingiz');
  };

  // --- VIDEO EMBED HANDLER ---
  const handleAddVideo = (e: React.FormEvent) => {
    e.preventDefault();
    setVideoError(null);
    const parsed = parseVideoEmbed(videoUrlInput);
    if (!parsed) {
      setVideoError('Noto‘g‘ri havola! Faqat YouTube, Instagram (Post/Reels) yoki TikTok video havolasini kiriting.');
      return;
    }
    const item: VideoItem = {
      id: `vid-${Date.now()}`,
      platform: parsed.platform,
      originalUrl: videoUrlInput.trim(),
      embedUrl: parsed.embedUrl,
      title: `${parsed.platform} Video (${new Date().toLocaleTimeString('uz-UZ', { hour: '2-digit', minute: '2-digit' })})`,
      addedAt: 'Hozirgina',
    };
    setVideos((prev) => [item, ...prev]);
    setActiveVideo(item);
    setVideoUrlInput('');
    showToast(`${parsed.platform} videosi aniqlandi!`);
  };

  // --- AI ASSISTANT HANDLER (/api/chat backend endpoint orqali) ---
  const handleSendAiMessage = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const promptText = chatInput.trim();
    if (!promptText && !uploadedFileText) return;

    const fullUserPrompt = uploadedFileText
      ? `${promptText || 'Ushbu faylni tahlil qilib ber:'}\n\n[Biriktirilgan fayl: ${uploadedFileName}]\n${uploadedFileText.slice(0, 3000)}`
      : promptText;

    const userMsg: ChatMessage = {
      id: `u-${Date.now()}`,
      role: 'user',
      content: promptText || `Fayl yuklandi: ${uploadedFileName}`,
      timestamp: new Date().toLocaleTimeString('uz-UZ', { hour: '2-digit', minute: '2-digit' }),
      attachmentName: uploadedFileName || undefined,
    };

    setChatMessages((prev) => [...prev, userMsg]);
    setChatInput('');
    setUploadedFileName(null);
    setUploadedFileText('');
    setAiThinking(true);

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: fullUserPrompt,
          history: chatMessages.slice(-8).map((m) => ({ role: m.role, content: m.content })),
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Serverdan xatolik qaytdi');
      }

      setChatMessages((prev) => [
        ...prev,
        {
          id: `a-${Date.now()}`,
          role: 'assistant',
          content: data.reply,
          timestamp: new Date().toLocaleTimeString('uz-UZ', { hour: '2-digit', minute: '2-digit' }),
        },
      ]);
    } catch (err: any) {
      setChatMessages((prev) => [
        ...prev,
        {
          id: `err-${Date.now()}`,
          role: 'assistant',
          content: `Xatolik yuz berdi: ${err?.message || 'AI serveri bilan bog‘lanib bo‘lmadi.'} Iltimos, internet aloqasini yoki Railway Variables sozlamalarini tekshiring.`,
          timestamp: new Date().toLocaleTimeString('uz-UZ', { hour: '2-digit', minute: '2-digit' }),
          isError: true,
        },
      ]);
    } finally {
      setAiThinking(false);
    }
  };

  // --- FILTERED & SORTED DEVICES ---
  const phoneBrands = ['Barchasi', ...Array.from(new Set(PHONES_DB.map((p) => p.brand)))];
  const filteredPhones = PHONES_DB
    .filter(
      (p) =>
        (phoneBrand === 'Barchasi' || p.brand === phoneBrand) &&
        `${p.brand} ${p.model} ${p.processor} ${p.year}`.toLowerCase().includes(phoneSearch.toLowerCase())
    )
    .sort((a, b) => {
      if (phoneSort === 'price-asc') return a.price - b.price;
      if (phoneSort === 'price-desc') return b.price - a.price;
      if (phoneSort === 'year-desc') return b.year - a.year;
      return 0;
    });

  const compBrands = ['Barchasi', ...Array.from(new Set(COMPUTERS_DB.map((c) => c.brand)))];
  const filteredComputers = COMPUTERS_DB
    .filter(
      (c) =>
        (compBrand === 'Barchasi' || c.brand === compBrand) &&
        `${c.brand} ${c.model} ${c.processor} ${c.year}`.toLowerCase().includes(compSearch.toLowerCase())
    )
    .sort((a, b) => {
      if (compSort === 'price-asc') return a.price - b.price;
      if (compSort === 'price-desc') return b.price - a.price;
      if (compSort === 'year-desc') return b.year - a.year;
      return 0;
    });

  // --- NAVIGATION ITEMS ---
  const NAV_ITEMS: { id: SectionId; label: string; icon: React.ElementType; badge?: string }[] = [
    { id: 'home', label: 'Bosh sahifa', icon: Home },
    { id: 'pinterest', label: 'Pinterest Galereya', icon: ImageIcon },
    { id: 'videos', label: 'Videolar', icon: Video },
    { id: 'computers', label: `Kompyuterlar (${COMPUTERS_DB.length})`, icon: Laptop },
    { id: 'smartphones', label: `Smartfonlar (${PHONES_DB.length})`, icon: Smartphone },
    { id: 'ai-assistant', label: 'AI Yordamchi', icon: Bot, badge: 'AI' },
    { id: 'calendar', label: 'Kalendar', icon: CalendarIcon },
    { id: 'operators', label: 'Mobil Operatorlar', icon: PhoneCall },
    { id: 'directory', label: 'Telefon Ma’lumotnomasi', icon: BookOpen },
    { id: 'news', label: 'Yangiliklar', icon: Newspaper },
    { id: 'tools', label: 'Foydali Vositalar', icon: Wrench },
    { id: 'ai-tools', label: 'AI Vositalar', icon: Sparkles },
    { id: 'bookmarks', label: 'Saqlanganlar', icon: Bookmark },
    { id: 'profile', label: 'Profil', icon: User },
    { id: 'settings', label: 'Sozlamalar', icon: Settings },
    { id: 'contact', label: 'Aloqa (@roz1matoff_me)', icon: MessageCircle },
  ];

  // Global search results
  const q = globalQuery.trim().toLowerCase();
  const globalMatches = q
    ? [
        ...COMPUTERS_DB.filter((c) => `${c.brand} ${c.model}`.toLowerCase().includes(q)).map((c) => ({
          title: `${c.brand} ${c.model} (${c.year})`,
          sub: `Kompyuter • $${c.price}`,
          section: 'computers' as SectionId,
        })),
        ...PHONES_DB.filter((p) => `${p.brand} ${p.model}`.toLowerCase().includes(q)).map((p) => ({
          title: `${p.brand} ${p.model} (${p.year})`,
          sub: `Smartfon • $${p.price}`,
          section: 'smartphones' as SectionId,
        })),
        ...UZ_DIRECTORY.filter((d) => `${d.name} ${d.phone} ${d.category}`.toLowerCase().includes(q)).map((d) => ({
          title: `${d.name} (${d.phone})`,
          sub: d.category,
          section: 'directory' as SectionId,
        })),
        ...UZ_OPERATORS.filter((o) => o.name.toLowerCase().includes(q)).map((o) => ({
          title: o.name,
          sub: `Mobil operator • ${o.balanceCode}`,
          section: 'operators' as SectionId,
        })),
      ].slice(0, 8)
    : [];

  return (
    <div className="min-h-screen bg-[#FFFFFF] text-zinc-900 flex font-sans">
      {/* Toast Notification */}
      {toastMsg && (
        <div className="fixed top-20 right-5 z-50 bg-zinc-900 text-white px-4 py-2.5 rounded-xl shadow-xl text-sm font-medium flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          {toastMsg}
        </div>
      )}

      {/* Mobile Sidebar Backdrop */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/40 z-30 lg:hidden backdrop-blur-xs"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* SIDEBAR */}
      <aside
        className={`fixed lg:sticky top-0 left-0 z-40 h-screen w-64 bg-[#F8F9FA] border-r border-zinc-200/80 flex flex-col transition-transform duration-200 ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        }`}
      >
        <div className="p-5 flex items-center justify-between border-b border-zinc-200/70">
          <button onClick={() => navigateTo('home')} className="flex items-center gap-2.5 text-left">
            <div className="w-9 h-9 rounded-xl bg-zinc-900 text-white flex items-center justify-center font-bold text-lg shadow-sm">
              V
            </div>
            <div>
              <span className="font-bold text-lg tracking-tight block leading-none">VerMix</span>
              <span className="text-[11px] text-zinc-500">Shaxsiy Raqamli Ekotizim</span>
            </div>
          </button>
          <button onClick={() => setSidebarOpen(false)} className="lg:hidden p-1.5 rounded-lg hover:bg-zinc-200">
            <X className="w-5 h-5" />
          </button>
        </div>

        <nav className="flex-1 overflow-y-auto p-3 space-y-1">
          {NAV_ITEMS.map((item) => {
            const Icon = item.icon;
            const active = activeSection === item.id;
            return (
              <button
                key={item.id}
                onClick={() => navigateTo(item.id)}
                className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${
                  active
                    ? 'bg-zinc-900 text-white shadow-sm'
                    : 'text-zinc-600 hover:bg-zinc-200/70 hover:text-zinc-900'
                }`}
              >
                <span className="flex items-center gap-3 truncate">
                  <Icon className="w-4 h-4 shrink-0" />
                  <span className="truncate">{item.label}</span>
                </span>
                {item.badge && (
                  <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-md bg-blue-600 text-white">
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>

        {/* User Mini Card in Sidebar */}
        <div className="p-3 border-t border-zinc-200/70">
          {user ? (
            <div className="flex items-center justify-between p-2 rounded-xl bg-white border border-zinc-200/70">
              <button onClick={() => navigateTo('profile')} className="flex items-center gap-2.5 min-w-0 text-left">
                {user.avatar ? (
                  <SafeWebPImage src={user.avatar} alt={user.name} className="w-8 h-8 rounded-full object-cover" />
                ) : (
                  <div className="w-8 h-8 rounded-full bg-zinc-900 text-white flex items-center justify-center text-xs font-bold shrink-0">
                    {user.name.slice(0, 2).toUpperCase()}
                  </div>
                )}
                <div className="truncate">
                  <p className="text-xs font-semibold truncate">{user.name}</p>
                  <p className="text-[10px] text-zinc-500 truncate">{user.phone || user.email}</p>
                </div>
              </button>
              <button onClick={handleLogout} title="Chiqish" className="p-1.5 text-zinc-400 hover:text-red-500">
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <button
              onClick={() => { setAuthError(null); setAuthModalOpen(true); }}
              className="w-full py-2.5 px-3 rounded-xl bg-zinc-900 text-white text-xs font-semibold flex items-center justify-center gap-2 hover:opacity-90 transition"
            >
              <LogIn className="w-4 h-4" />
              Google / Telefon orqali kirish
            </button>
          )}
        </div>
      </aside>

      {/* MAIN CONTENT AREA */}
      <div className="flex-1 flex flex-col min-w-0 bg-[#FFFFFF]">
        {/* TOP HEADER */}
        <header className="sticky top-0 z-20 bg-white/95 backdrop-blur-md border-b border-zinc-200/80 px-4 lg:px-8 py-3.5 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3 flex-1 max-w-xl relative">
            <button
              onClick={() => setSidebarOpen(true)}
              className="lg:hidden p-2 rounded-xl border border-zinc-200 bg-white"
            >
              <Menu className="w-5 h-5" />
            </button>
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-zinc-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={globalQuery}
                onChange={(e) => setGlobalQuery(e.target.value)}
                placeholder="VerMix bo‘ylab qidirish (telefonlar, noutbuklar, USSD...)"
                className="w-full pl-10 pr-4 py-2 rounded-xl bg-[#F4F5F7] border border-transparent focus:border-zinc-300 focus:bg-white text-sm outline-none transition"
              />
              {globalMatches.length > 0 && (
                <div className="absolute left-0 right-0 top-12 bg-white border border-zinc-200 rounded-2xl shadow-xl p-2 z-50">
                  {globalMatches.map((m, idx) => (
                    <button
                      key={idx}
                      onClick={() => { navigateTo(m.section); setGlobalQuery(''); }}
                      className="w-full text-left px-3 py-2 rounded-xl hover:bg-zinc-100 flex items-center justify-between"
                    >
                      <div>
                        <p className="text-sm font-medium">{m.title}</p>
                        <p className="text-xs text-zinc-500">{m.sub}</p>
                      </div>
                      <ChevronRight className="w-4 h-4 text-zinc-400" />
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          <div className="flex items-center gap-2.5">
            {!user ? (
              <button
                onClick={() => { setAuthError(null); setAuthModalOpen(true); }}
                className="px-4 py-2 rounded-xl bg-zinc-900 text-white text-sm font-semibold hover:opacity-90 transition"
              >
                Kirish
              </button>
            ) : (
              <button
                onClick={() => navigateTo('profile')}
                className="px-3 py-1.5 rounded-xl border border-zinc-200 bg-white text-xs font-semibold flex items-center gap-2"
              >
                <span className="w-2 h-2 rounded-full bg-emerald-500" />
                {user.name}
              </button>
            )}
          </div>
        </header>

        {/* SECTION ROUTER */}
        <main className="flex-1 p-4 lg:p-8 max-w-7xl w-full mx-auto pb-24">
          {/* 1. HOME / DASHBOARD */}
          {activeSection === 'home' && (
            <div className="space-y-8">
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 p-7 rounded-3xl bg-[#F8F9FA] border border-zinc-200/80 flex flex-col justify-between relative overflow-hidden">
                  <div className="relative z-10">
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white border border-zinc-200 text-xs font-medium mb-4">
                      <Sparkles className="w-3.5 h-3.5 text-blue-600" />
                      VerMix Shaxsiy Raqamli Ekotizim
                    </span>
                    <h1 className="text-2xl lg:text-3xl font-bold tracking-tight mb-2">
                      Xush kelibsiz{user ? `, ${user.name}` : ''}!
                    </h1>
                    <p className="text-zinc-600 text-sm max-w-xl">
                      {PHONES_DB.length} ta smartfon, {COMPUTERS_DB.length} ta kompyuter modeli, rasmlar galereyasi, AI yordamchi va O‘zbekiston mobil operatorlari USSD kodlari bitta platformada.
                    </p>
                  </div>
                  <div className="mt-6 flex flex-wrap gap-2.5 relative z-10">
                    <button onClick={() => setFloatingAiOpen(true)} className="px-4 py-2.5 rounded-xl bg-zinc-900 text-white text-sm font-semibold flex items-center gap-2">
                      <Bot className="w-4 h-4" /> Tezkor AI Chat
                    </button>
                    <button onClick={() => navigateTo('smartphones')} className="px-4 py-2.5 rounded-xl bg-white border border-zinc-200 text-sm font-medium">
                      Smartfonlar ({PHONES_DB.length})
                    </button>
                    <button onClick={() => navigateTo('computers')} className="px-4 py-2.5 rounded-xl bg-white border border-zinc-200 text-sm font-medium">
                      Kompyuterlar ({COMPUTERS_DB.length})
                    </button>
                  </div>
                </div>

                {/* Weather & Clock Widget */}
                <div className="p-6 rounded-3xl bg-[#F8F9FA] border border-zinc-200/80 flex flex-col justify-between">
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="text-xs text-zinc-500 uppercase tracking-wider font-semibold">Samarqand / Toshkent</p>
                      <p className="text-3xl font-bold mt-1">
                        {now.toLocaleTimeString('uz-UZ', { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                      </p>
                      <p className="text-xs text-zinc-500 mt-1">
                        {now.toLocaleDateString('uz-UZ', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
                      </p>
                    </div>
                    <div className="p-3 rounded-2xl bg-white shadow-2xs text-amber-500 border border-zinc-200/60">
                      <CloudSun className="w-7 h-7" />
                    </div>
                  </div>
                  <div className="mt-6 pt-4 border-t border-zinc-200/70 flex items-center justify-between text-sm">
                    <span className="text-zinc-500">Ob-havo: Ochiq</span>
                    <span className="font-bold">+16°C • USD: {uzsRate.toLocaleString()} so‘m</span>
                  </div>
                </div>
              </div>

              {/* Section Cover Banner */}
              <div className="rounded-3xl overflow-hidden border border-zinc-200/80 h-44 relative">
                <SafeWebPImage src={SECTION_COVERS.homeBanner} alt="VerMix Workspace" className="w-full h-full object-cover" />
                <div className="absolute inset-0 bg-gradient-to-r from-white/95 via-white/75 to-transparent flex items-center p-6 lg:p-8">
                  <div className="max-w-md">
                    <p className="text-xs font-bold uppercase tracking-wider text-blue-600">Yagona Raqamli Muhit</p>
                    <h2 className="text-xl font-bold mt-1">Barcha kundalik xizmatlar va texnologiyalar katalogi</h2>
                    <p className="text-xs text-zinc-600 mt-1">Pastki o‘ng burchakdagi AI tugmasi orqali istalgan sahifadan maslahat oling.</p>
                  </div>
                </div>
              </div>

              {/* Quick Access Grid */}
              <div>
                <h2 className="text-lg font-bold mb-4">Tezkor bo‘limlar</h2>
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
                  {[
                    { id: 'pinterest', title: 'Pinterest', desc: `${pins.length} ta WebP rasm`, icon: ImageIcon },
                    { id: 'videos', title: 'Videolar', desc: 'YT / IG / TikTok', icon: Video },
                    { id: 'computers', title: 'Kompyuterlar', desc: `${COMPUTERS_DB.length} ta model`, icon: Laptop },
                    { id: 'smartphones', title: 'Smartfonlar', desc: `${PHONES_DB.length} ta model`, icon: Smartphone },
                    { id: 'operators', title: 'Operatorlar', desc: 'USSD kodlar', icon: PhoneCall },
                    { id: 'directory', title: 'Ma’lumotnoma', desc: '101, 102, 103, Banklar', icon: BookOpen },
                  ].map((card) => {
                    const Icon = card.icon;
                    return (
                      <button
                        key={card.id}
                        onClick={() => navigateTo(card.id as SectionId)}
                        className="p-4 rounded-2xl bg-[#F8F9FA] border border-zinc-200/70 hover:border-zinc-400 text-left transition group"
                      >
                        <div className="w-10 h-10 rounded-xl bg-white border border-zinc-200/60 flex items-center justify-center mb-3 group-hover:scale-105 transition">
                          <Icon className="w-5 h-5" />
                        </div>
                        <p className="font-semibold text-sm">{card.title}</p>
                        <p className="text-xs text-zinc-500 mt-0.5">{card.desc}</p>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Daily Discovery */}
              <div className="p-6 rounded-3xl bg-[#F8F9FA] border border-zinc-200/80">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-lg font-bold flex items-center gap-2">
                    <Compass className="w-5 h-5 text-blue-600" /> Kunlik Kashfiyotlar
                  </h2>
                  <span className="text-xs text-zinc-500">Har kuni yangilanadi</span>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="p-4 rounded-2xl bg-white border border-zinc-200/70">
                    <span className="text-[11px] font-semibold text-blue-600 uppercase">Foydali Fakt</span>
                    <p className="font-semibold text-sm mt-1">Birinchi kompyuter sichqonchasi 1964-yilda yog‘ochdan yasalgan.</p>
                  </div>
                  <div className="p-4 rounded-2xl bg-white border border-zinc-200/70">
                    <span className="text-[11px] font-semibold text-emerald-600 uppercase">Kun AI Vositasi</span>
                    <p className="font-semibold text-sm mt-1">Perplexity AI — manbalar bilan aniq javob beruvchi qidiruv tizimi.</p>
                  </div>
                  <div className="p-4 rounded-2xl bg-white border border-zinc-200/70">
                    <span className="text-[11px] font-semibold text-purple-600 uppercase">Tezkor USSD</span>
                    <p className="font-semibold text-sm mt-1">Beeline balans: *102# • Ucell va Uzmobile balans: *100#</p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* 2. PINTEREST */}
          {activeSection === 'pinterest' && (
            <div className="space-y-6">
              <div className="flex flex-wrap items-center justify-between gap-4">
                <div>
                  <h1 className="text-2xl font-bold">Pinterest Vizual Galereya</h1>
                  <p className="text-sm text-zinc-500">{pins.length} ta WebP formatdagi yuqori sifatli rasmlar kolleksiyasi</p>
                </div>
                <button
                  onClick={() => setNewPinModal(true)}
                  className="px-4 py-2.5 rounded-xl bg-zinc-900 text-white text-sm font-semibold flex items-center gap-2"
                >
                  <Plus className="w-4 h-4" /> Rasm qo‘shish
                </button>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                {['Barchasi', 'Texnologiya', 'Dizayn', 'Sayohat', 'Arxitektura', 'Koinot', 'Hayot tarzi'].map((cat) => (
                  <button
                    key={cat}
                    onClick={() => setPinCategory(cat)}
                    className={`px-3.5 py-1.5 rounded-full text-xs font-semibold transition ${
                      pinCategory === cat ? 'bg-zinc-900 text-white' : 'bg-[#F4F5F7] text-zinc-600 hover:bg-zinc-200'
                    }`}
                  >
                    {cat}
                  </button>
                ))}
                <input
                  type="text"
                  value={pinSearch}
                  onChange={(e) => setPinSearch(e.target.value)}
                  placeholder="Rasmlardan qidirish..."
                  className="ml-auto px-3.5 py-1.5 rounded-xl bg-[#F4F5F7] text-sm outline-none"
                />
              </div>

              <div className="columns-1 sm:columns-2 md:columns-3 lg:columns-4 gap-4 space-y-4">
                {pins
                  .filter((p) => (pinCategory === 'Barchasi' || p.category === pinCategory) && p.title.toLowerCase().includes(pinSearch.toLowerCase()))
                  .map((pin) => {
                    const liked = likedPins.includes(pin.id);
                    return (
                      <div key={pin.id} className="break-inside-avoid rounded-2xl overflow-hidden bg-[#F8F9FA] border border-zinc-200/70 group">
                        <div className="relative">
                          <SafeWebPImage src={pin.image} alt={pin.title} className="w-full h-auto object-cover" />
                          <div className="absolute top-2.5 right-2.5 flex gap-1.5">
                            <button
                              onClick={() => toggleBookmark({ id: pin.id, type: 'Rasm', title: pin.title, subtitle: pin.category, section: 'pinterest' })}
                              className="p-2 rounded-full bg-white/95 text-zinc-900 shadow-sm hover:scale-105 transition"
                              title="Saqlash"
                            >
                              <Bookmark className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                        <div className="p-3.5">
                          <p className="font-semibold text-sm">{pin.title}</p>
                          <div className="flex items-center justify-between mt-2 text-xs text-zinc-500">
                            <span>{pin.author} • {pin.board}</span>
                            <button
                              onClick={() => setLikedPins((prev) => liked ? prev.filter((x) => x !== pin.id) : [...prev, pin.id])}
                              className={`flex items-center gap-1 font-medium ${liked ? 'text-red-500' : ''}`}
                            >
                              <Heart className={`w-3.5 h-3.5 ${liked ? 'fill-red-500' : ''}`} />
                              {pin.likes + (liked ? 1 : 0)}
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  })}
              </div>
            </div>
          )}

          {/* 3. VIDEOS */}
          {activeSection === 'videos' && (
            <div className="space-y-6">
              <div>
                <h1 className="text-2xl font-bold">Ijtimoiy Tarmoqlar Video Pleyeri</h1>
                <p className="text-sm text-zinc-500">YouTube, Instagram (Reels/Post) va TikTok rasmiy havolalarini joylashtiring</p>
              </div>

              <form onSubmit={handleAddVideo} className="flex flex-col sm:flex-row gap-3">
                <input
                  type="url"
                  value={videoUrlInput}
                  onChange={(e) => setVideoUrlInput(e.target.value)}
                  placeholder="https://www.youtube.com/watch?v=... yoki Instagram / TikTok havolasi"
                  className="flex-1 px-4 py-3 rounded-2xl bg-[#F4F5F7] text-sm outline-none border border-transparent focus:border-zinc-400"
                  required
                />
                <button type="submit" className="px-6 py-3 rounded-2xl bg-zinc-900 text-white text-sm font-semibold">
                  Videoni ochish
                </button>
              </form>

              {videoError && (
                <div className="p-3.5 rounded-xl bg-red-50 text-red-600 text-sm flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" /> {videoError}
                </div>
              )}

              {activeVideo && (
                <div className="rounded-3xl overflow-hidden bg-[#F8F9FA] border border-zinc-200 p-4 lg:p-6">
                  <div className="aspect-video w-full max-w-4xl mx-auto rounded-2xl overflow-hidden bg-black">
                    <iframe
                      src={activeVideo.embedUrl}
                      title={activeVideo.title}
                      className="w-full h-full border-0"
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      allowFullScreen
                    />
                  </div>
                  <div className="max-w-4xl mx-auto mt-4 flex flex-wrap items-center justify-between gap-2">
                    <div>
                      <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-zinc-900 text-white mr-2">
                        {activeVideo.platform}
                      </span>
                      <span className="font-semibold text-sm">{activeVideo.title}</span>
                    </div>
                    <a href={activeVideo.originalUrl} target="_blank" rel="noreferrer" className="text-xs text-blue-600 flex items-center gap-1">
                      Asl manbada ochish <ExternalLink className="w-3.5 h-3.5" />
                    </a>
                  </div>
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {videos.map((v) => (
                  <button
                    key={v.id}
                    onClick={() => setActiveVideo(v)}
                    className="p-4 rounded-2xl bg-[#F8F9FA] border border-zinc-200/70 text-left hover:border-zinc-400 transition"
                  >
                    <span className="text-[11px] font-bold text-blue-600">{v.platform}</span>
                    <p className="font-semibold text-sm mt-1 truncate">{v.title}</p>
                    <p className="text-xs text-zinc-500 truncate mt-1">{v.originalUrl}</p>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* 4. COMPUTERS DATABASE */}
          {activeSection === 'computers' && (
            <div className="space-y-6">
              <div className="flex flex-wrap items-center justify-between gap-4">
                <div>
                  <h1 className="text-2xl font-bold">Kompyuter va Noutbuklar Katalogi ({filteredComputers.length} ta)</h1>
                  <p className="text-sm text-zinc-500">Apple MacBook, Lenovo, HP, Dell, ASUS, Acer, MSI va boshqa brendlar</p>
                </div>
                <div className="flex flex-wrap items-center gap-2">
                  <input
                    type="text"
                    value={compSearch}
                    onChange={(e) => setCompSearch(e.target.value)}
                    placeholder="Model yoki protsessor..."
                    className="px-4 py-2 rounded-xl bg-[#F4F5F7] text-sm outline-none"
                  />
                  <select
                    value={compSort}
                    onChange={(e) => setCompSort(e.target.value as typeof compSort)}
                    className="px-3 py-2 rounded-xl bg-[#F4F5F7] text-xs font-semibold outline-none"
                  >
                    <option value="default">Saralash: Standart</option>
                    <option value="price-asc">Narx: Arzondan qimmatga</option>
                    <option value="price-desc">Narx: Qimmatdan arzonga</option>
                    <option value="year-desc">Yil: Yangilari birinchi</option>
                  </select>
                </div>
              </div>

              <div className="flex flex-wrap gap-2">
                {compBrands.map((b) => (
                  <button
                    key={b}
                    onClick={() => setCompBrand(b)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition ${
                      compBrand === b ? 'bg-zinc-900 text-white' : 'bg-[#F4F5F7] hover:bg-zinc-200'
                    }`}
                  >
                    {b}
                  </button>
                ))}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                {filteredComputers.map((comp) => {
                  const inCompare = compareComputers.includes(comp.id);
                  return (
                    <div key={comp.id} className="rounded-3xl bg-[#F8F9FA] border border-zinc-200/80 overflow-hidden flex flex-col">
                      <SafeWebPImage src={comp.image} alt={comp.model} className="w-full h-48 object-cover" />
                      <div className="p-5 flex-1 flex flex-col justify-between">
                        <div>
                          <div className="flex items-center justify-between">
                            <span className="text-xs font-bold text-blue-600">{comp.brand} • {comp.year}</span>
                            <span className="font-bold text-sm">${comp.price.toLocaleString()}</span>
                          </div>
                          <h3 className="font-bold text-base mt-1">{comp.model}</h3>
                          <ul className="mt-3 space-y-1 text-xs text-zinc-600">
                            <li>• <b>CPU:</b> {comp.processor}</li>
                            <li>• <b>RAM / SSD:</b> {comp.ram} / {comp.storage}</li>
                            <li>• <b>Ekran:</b> {comp.display}</li>
                            <li>• <b>Batareya:</b> {comp.battery}</li>
                          </ul>
                        </div>
                        <div className="mt-4 pt-3 border-t border-zinc-200/70 flex items-center gap-2">
                          <button
                            onClick={() => setSelectedComputer(comp)}
                            className="flex-1 py-2 rounded-xl bg-zinc-900 text-white text-xs font-semibold"
                          >
                            Batafsil
                          </button>
                          <button
                            onClick={() => setCompareComputers((prev) => inCompare ? prev.filter((x) => x !== comp.id) : [...prev.slice(-1), comp.id])}
                            className={`px-3 py-2 rounded-xl text-xs font-semibold border ${inCompare ? 'border-blue-600 text-blue-600 bg-blue-50' : 'border-zinc-300 bg-white'}`}
                          >
                            {inCompare ? 'Tanlangan' : 'Taqqoslash'}
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              {compareComputers.length === 2 && (
                <div className="p-6 rounded-3xl bg-[#F8F9FA] border border-zinc-200 overflow-x-auto">
                  <h2 className="text-lg font-bold mb-4 flex items-center gap-2">
                    <ArrowLeftRight className="w-5 h-5 text-blue-600" /> Noutbuklarni Taqqoslash
                  </h2>
                  <table className="w-full text-sm text-left">
                    <thead>
                      <tr className="border-b border-zinc-200">
                        <th className="py-2 text-zinc-500">Xususiyat</th>
                        {compareComputers.map((id) => {
                          const c = COMPUTERS_DB.find((x) => x.id === id);
                          return <th key={id} className="py-2 font-bold">{c?.brand} {c?.model}</th>;
                        })}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-zinc-200/70 text-xs">
                      {(['year', 'processor', 'ram', 'storage', 'display', 'battery', 'camera', 'price'] as const).map((field) => (
                        <tr key={field}>
                          <td className="py-2.5 font-semibold uppercase text-zinc-500">{field}</td>
                          {compareComputers.map((id) => {
                            const c = COMPUTERS_DB.find((x) => x.id === id);
                            return <td key={id} className="py-2.5">{field === 'price' ? `$${c?.price.toLocaleString()}` : c?.[field]}</td>;
                          })}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          {/* 5. SMARTPHONES DATABASE */}
          {activeSection === 'smartphones' && (
            <div className="space-y-6">
              <div className="flex flex-wrap items-center justify-between gap-4">
                <div>
                  <h1 className="text-2xl font-bold">Smartfonlar Katalogi ({filteredPhones.length} ta)</h1>
                  <p className="text-sm text-zinc-500">Apple, Samsung, Xiaomi, Redmi, Poco, Realme, Honor, Huawei, Tecno, Infinix, Google Pixel</p>
                </div>
                <div className="flex flex-wrap items-center gap-2">
                  <input
                    type="text"
                    value={phoneSearch}
                    onChange={(e) => setPhoneSearch(e.target.value)}
                    placeholder="Smartfon yoki chip qidirish..."
                    className="px-4 py-2 rounded-xl bg-[#F4F5F7] text-sm outline-none"
                  />
                  <select
                    value={phoneSort}
                    onChange={(e) => setPhoneSort(e.target.value as typeof phoneSort)}
                    className="px-3 py-2 rounded-xl bg-[#F4F5F7] text-xs font-semibold outline-none"
                  >
                    <option value="default">Saralash: Standart</option>
                    <option value="price-asc">Narx: Arzondan qimmatga</option>
                    <option value="price-desc">Narx: Qimmatdan arzonga</option>
                    <option value="year-desc">Yil: Yangilari birinchi</option>
                  </select>
                </div>
              </div>

              <div className="flex flex-wrap gap-2">
                {phoneBrands.map((b) => (
                  <button
                    key={b}
                    onClick={() => setPhoneBrand(b)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition ${
                      phoneBrand === b ? 'bg-zinc-900 text-white' : 'bg-[#F4F5F7] hover:bg-zinc-200'
                    }`}
                  >
                    {b}
                  </button>
                ))}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                {filteredPhones.map((phone) => {
                  const inCompare = comparePhones.includes(phone.id);
                  return (
                    <div key={phone.id} className="rounded-3xl bg-[#F8F9FA] border border-zinc-200/80 overflow-hidden flex flex-col">
                      <SafeWebPImage src={phone.image} alt={phone.model} className="w-full h-48 object-cover" />
                      <div className="p-5 flex-1 flex flex-col justify-between">
                        <div>
                          <div className="flex items-center justify-between">
                            <span className="text-xs font-bold text-blue-600">{phone.brand} • {phone.year}</span>
                            <span className="font-bold text-sm">${phone.price.toLocaleString()}</span>
                          </div>
                          <h3 className="font-bold text-base mt-1">{phone.model}</h3>
                          <ul className="mt-3 space-y-1 text-xs text-zinc-600">
                            <li>• <b>CPU:</b> {phone.processor}</li>
                            <li>• <b>RAM / Xotira:</b> {phone.ram} / {phone.storage}</li>
                            <li>• <b>Kamera:</b> {phone.camera}</li>
                            <li>• <b>Batareya:</b> {phone.battery}</li>
                          </ul>
                        </div>
                        <div className="mt-4 pt-3 border-t border-zinc-200/70 flex items-center gap-2">
                          <button
                            onClick={() => setSelectedPhone(phone)}
                            className="flex-1 py-2 rounded-xl bg-zinc-900 text-white text-xs font-semibold"
                          >
                            Batafsil
                          </button>
                          <button
                            onClick={() => setComparePhones((prev) => inCompare ? prev.filter((x) => x !== phone.id) : [...prev.slice(-1), phone.id])}
                            className={`px-3 py-2 rounded-xl text-xs font-semibold border ${inCompare ? 'border-blue-600 text-blue-600 bg-blue-50' : 'border-zinc-300 bg-white'}`}
                          >
                            {inCompare ? 'Tanlangan' : 'Taqqoslash'}
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              {comparePhones.length === 2 && (
                <div className="p-6 rounded-3xl bg-[#F8F9FA] border border-zinc-200 overflow-x-auto">
                  <h2 className="text-lg font-bold mb-4 flex items-center gap-2">
                    <ArrowLeftRight className="w-5 h-5 text-blue-600" /> Smartfonlarni Taqqoslash
                  </h2>
                  <table className="w-full text-sm text-left">
                    <thead>
                      <tr className="border-b border-zinc-200">
                        <th className="py-2 text-zinc-500">Parametr</th>
                        {comparePhones.map((id) => {
                          const p = PHONES_DB.find((x) => x.id === id);
                          return <th key={id} className="py-2 font-bold">{p?.brand} {p?.model}</th>;
                        })}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-zinc-200/70 text-xs">
                      {(['year', 'display', 'processor', 'ram', 'storage', 'camera', 'battery', 'price'] as const).map((field) => (
                        <tr key={field}>
                          <td className="py-2.5 font-semibold uppercase text-zinc-500">{field}</td>
                          {comparePhones.map((id) => {
                            const p = PHONES_DB.find((x) => x.id === id);
                            return <td key={id} className="py-2.5">{field === 'price' ? `$${p?.price.toLocaleString()}` : p?.[field]}</td>;
                          })}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          {/* 6. AI ASSISTANT FULL SECTION */}
          {activeSection === 'ai-assistant' && (
            <div className="h-[calc(100vh-11rem)] flex flex-col rounded-3xl bg-[#F8F9FA] border border-zinc-200/80 overflow-hidden">
              <div className="p-4 border-b border-zinc-200/80 flex items-center justify-between bg-white">
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-xl bg-blue-600 text-white flex items-center justify-center">
                    <Bot className="w-5 h-5" />
                  </div>
                  <div>
                    <h2 className="font-bold text-sm">VerMix AI Yordamchi</h2>
                    <p className="text-[11px] text-emerald-600 font-medium">● Xavfsiz /api/chat endpoint orqali ulangan</p>
                  </div>
                </div>
                <button
                  onClick={() => setChatMessages([{ id: 'new', role: 'assistant', content: 'Yangi suhbat boshlandi. Qanday yordam bera olaman?', timestamp: 'Hozir' }])}
                  className="px-3 py-1.5 rounded-xl border border-zinc-200 text-xs font-semibold flex items-center gap-1.5 bg-white"
                >
                  <Plus className="w-3.5 h-3.5" /> Yangi chat
                </button>
              </div>

              <div className="flex-1 overflow-y-auto p-4 lg:p-6 space-y-4">
                {chatMessages.map((msg) => (
                  <div key={msg.id} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                    <div
                      className={`max-w-2xl rounded-2xl p-4 text-sm leading-relaxed ${
                        msg.role === 'user'
                          ? 'bg-zinc-900 text-white'
                          : msg.isError
                          ? 'bg-red-50 text-red-700 border border-red-200'
                          : 'bg-white border border-zinc-200/80'
                      }`}
                    >
                      {msg.attachmentName && (
                        <div className="text-xs font-semibold mb-1.5 px-2.5 py-1 rounded-lg bg-blue-500/10 text-blue-600 inline-block">
                          📎 {msg.attachmentName}
                        </div>
                      )}
                      <p className="whitespace-pre-wrap">{msg.content}</p>
                      <div className="mt-2 flex items-center justify-between text-[10px] opacity-60">
                        <span>{msg.timestamp}</span>
                        {msg.role === 'assistant' && !msg.isError && (
                          <button onClick={() => copyText(msg.content, 'AI javobi')} className="hover:opacity-100 flex items-center gap-1">
                            <Copy className="w-3 h-3" /> Nusxalash
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
                {aiThinking && (
                  <div className="text-xs text-zinc-500 flex items-center gap-2">
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" /> VerMix AI yozmoqda...
                  </div>
                )}
              </div>

              <form onSubmit={handleSendAiMessage} className="p-3 bg-white border-t border-zinc-200/80 flex items-center gap-2">
                <label className="p-2.5 rounded-xl bg-[#F4F5F7] cursor-pointer hover:bg-zinc-200 transition" title="Fayl tahlili">
                  <Upload className="w-4 h-4" />
                  <input
                    type="file"
                    accept=".txt,.md,.json,.csv,.js,.ts,.py"
                    className="hidden"
                    onChange={(e) => {
                      const f = e.target.files?.[0];
                      if (!f) return;
                      setUploadedFileName(f.name);
                      const reader = new FileReader();
                      reader.onload = () => setUploadedFileText(String(reader.result || ''));
                      reader.readAsText(f);
                    }}
                  />
                </label>
                <input
                  type="text"
                  value={chatInput}
                  onChange={(e) => setChatInput(e.target.value)}
                  placeholder={uploadedFileName ? `${uploadedFileName} bo‘yicha savol yozing...` : 'Savol bering, kod yozdiring yoki tarjima qiling...'}
                  className="flex-1 px-4 py-2.5 rounded-xl bg-[#F4F5F7] text-sm outline-none"
                />
                <button type="submit" disabled={aiThinking} className="p-2.5 rounded-xl bg-zinc-900 text-white disabled:opacity-50">
                  <Send className="w-4 h-4" />
                </button>
              </form>
            </div>
          )}

          {/* 7. CALENDAR */}
          {activeSection === 'calendar' && (
            <div className="space-y-6">
              <div className="flex flex-wrap items-center justify-between gap-4">
                <div>
                  <h1 className="text-2xl font-bold">Interaktiv Kalendar va Rejalar</h1>
                  <p className="text-sm text-zinc-500">Tadbirlar, eslatmalar va kunlik vazifalarni boshqaring</p>
                </div>
                <div className="flex gap-1.5 bg-[#F4F5F7] p-1 rounded-xl">
                  {(['month', 'week', 'day'] as const).map((v) => (
                    <button
                      key={v}
                      onClick={() => setCalView(v)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-semibold ${calView === v ? 'bg-white shadow-2xs' : ''}`}
                    >
                      {v === 'month' ? 'Oylik' : v === 'week' ? 'Haftalik' : 'Kunlik'}
                    </button>
                  ))}
                </div>
              </div>

              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  if (!newEventTitle.trim()) return;
                  setEvents((prev) => [
                    { id: `ev-${Date.now()}`, title: newEventTitle.trim(), date: newEventDate, time: newEventTime, color: newEventColor, notes: '' },
                    ...prev,
                  ]);
                  setNewEventTitle('');
                  showToast('Tadbir kalendarga qo‘shildi!');
                }}
                className="p-4 rounded-2xl bg-[#F8F9FA] border border-zinc-200/80 grid grid-cols-1 sm:grid-cols-5 gap-3"
              >
                <input
                  type="text"
                  value={newEventTitle}
                  onChange={(e) => setNewEventTitle(e.target.value)}
                  placeholder="Yangi tadbir yoki eslatma nomi..."
                  className="sm:col-span-2 px-3.5 py-2 rounded-xl bg-white border border-zinc-200 text-sm outline-none"
                  required
                />
                <input
                  type="date"
                  value={newEventDate}
                  onChange={(e) => setNewEventDate(e.target.value)}
                  className="px-3 py-2 rounded-xl bg-white border border-zinc-200 text-sm"
                />
                <input
                  type="time"
                  value={newEventTime}
                  onChange={(e) => setNewEventTime(e.target.value)}
                  className="px-3 py-2 rounded-xl bg-white border border-zinc-200 text-sm"
                />
                <div className="flex items-center gap-2">
                  <select
                    value={newEventColor}
                    onChange={(e) => setNewEventColor(e.target.value)}
                    className="px-2.5 py-2 rounded-xl bg-white border border-zinc-200 text-xs"
                  >
                    <option value="bg-blue-500">Ko‘k</option>
                    <option value="bg-emerald-500">Yashil</option>
                    <option value="bg-amber-500">Sariq</option>
                    <option value="bg-purple-500">Binafsha</option>
                  </select>
                  <button type="submit" className="flex-1 py-2 px-4 rounded-xl bg-zinc-900 text-white text-xs font-semibold">
                    Qo‘shish
                  </button>
                </div>
              </form>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {events.map((ev) => (
                  <div key={ev.id} className="p-4 rounded-2xl bg-[#F8F9FA] border border-zinc-200/80 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <span className={`w-3 h-10 rounded-full ${ev.color}`} />
                      <div>
                        <p className="font-semibold text-sm">{ev.title}</p>
                        <p className="text-xs text-zinc-500">{ev.date} • Soat {ev.time}</p>
                      </div>
                    </div>
                    <button onClick={() => setEvents((prev) => prev.filter((x) => x.id !== ev.id))} className="p-2 text-zinc-400 hover:text-red-500">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* 8. UZBEKISTAN MOBILE OPERATORS */}
          {activeSection === 'operators' && (
            <div className="space-y-6">
              <div className="rounded-3xl overflow-hidden border border-zinc-200/80 h-36 relative">
                <SafeWebPImage src={SECTION_COVERS.operatorsBanner} alt="Mobil Operatorlar" className="w-full h-full object-cover" />
                <div className="absolute inset-0 bg-white/85 flex items-center px-6">
                  <div>
                    <h1 className="text-2xl font-bold">O‘zbekiston Mobil Operatorlari Ma’lumotnomasi</h1>
                    <p className="text-sm text-zinc-600">Barcha USSD kodlarni bir bosishda nusxalang va tariflarni ko‘ring</p>
                  </div>
                </div>
              </div>

              <div className="flex flex-wrap gap-2.5">
                {UZ_OPERATORS.map((op) => (
                  <button
                    key={op.id}
                    onClick={() => setSelectedOperator(op.id)}
                    className={`px-4 py-2.5 rounded-2xl text-sm font-bold transition ${
                      selectedOperator === op.id ? `${op.color} shadow-md` : 'bg-[#F4F5F7] hover:bg-zinc-200'
                    }`}
                  >
                    {op.name}
                  </button>
                ))}
              </div>

              {(() => {
                const op = UZ_OPERATORS.find((x) => x.id === selectedOperator) || UZ_OPERATORS[0];
                return (
                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    <div className="lg:col-span-2 space-y-4">
                      <div className="p-6 rounded-3xl bg-[#F8F9FA] border border-zinc-200/80">
                        <div className="flex flex-wrap items-center justify-between gap-2 mb-4">
                          <h2 className="text-xl font-bold">{op.name} — USSD Kodlar</h2>
                          <a href={op.website} target="_blank" rel="noreferrer" className="text-xs text-blue-600 font-semibold flex items-center gap-1">
                            Rasmiy sayt <ExternalLink className="w-3.5 h-3.5" />
                          </a>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                          {op.ussdCodes.map((u) => (
                            <div key={u.code} className="p-3.5 rounded-2xl bg-white border border-zinc-200/70 flex items-center justify-between gap-2">
                              <div>
                                <span className="font-mono font-bold text-base text-blue-600">{u.code}</span>
                                <p className="text-xs text-zinc-500 mt-0.5">{u.desc}</p>
                              </div>
                              <button
                                onClick={() => copyText(u.code, `USSD kod (${u.code})`)}
                                className="p-2 rounded-xl bg-[#F4F5F7] hover:bg-zinc-200 transition shrink-0"
                                title="Nusxalash"
                              >
                                <Copy className="w-4 h-4" />
                              </button>
                            </div>
                          ))}
                        </div>
                      </div>

                      <div className="p-6 rounded-3xl bg-[#F8F9FA] border border-zinc-200/80">
                        <h3 className="font-bold text-base mb-3">Mashhur Tariflar va Internet Paketlar</h3>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                          {op.tariffs.map((t) => (
                            <div key={t.name} className="p-4 rounded-2xl bg-white border border-zinc-200/70">
                              <div className="flex justify-between font-bold text-sm">
                                <span>{t.name}</span>
                                <span className="text-emerald-600">{t.price}</span>
                              </div>
                              <p className="text-xs text-zinc-500 mt-1">{t.details}</p>
                            </div>
                          ))}
                          {op.packages.map((p) => (
                            <div key={p.name} className="p-4 rounded-2xl bg-white border border-zinc-200/70">
                              <div className="flex justify-between font-bold text-sm">
                                <span>{p.name}</span>
                                <span className="text-blue-600">{p.price}</span>
                              </div>
                              <p className="text-xs text-zinc-500 mt-1">{p.validity}</p>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>

                    <div className="p-6 rounded-3xl bg-[#F8F9FA] border border-zinc-200/80 space-y-4">
                      <h3 className="font-bold text-base">Qo‘llab-quvvatlash va Xizmatlar</h3>
                      <div className="p-3.5 rounded-2xl bg-white border border-zinc-200/70">
                        <p className="text-xs text-zinc-500">Call-markaz:</p>
                        <p className="font-bold text-sm mt-0.5">{op.support}</p>
                      </div>
                      <div className="space-y-2">
                        {op.shortNumbers.map((s) => (
                          <div key={s.code} className="flex items-center justify-between text-xs p-2.5 rounded-xl bg-white border border-zinc-200/60">
                            <span><b>{s.code}</b> — {s.desc}</span>
                            <button onClick={() => copyText(s.code)} className="text-blue-600 font-semibold">Nusxa</button>
                          </div>
                        ))}
                      </div>
                      <div>
                        <p className="text-xs font-semibold text-zinc-500 mb-2">Qo‘shimcha xizmatlar:</p>
                        <div className="flex flex-wrap gap-1.5">
                          {op.services.map((srv) => (
                            <span key={srv} className="text-xs px-2.5 py-1 rounded-lg bg-white border border-zinc-200/70">
                              {srv}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })()}
            </div>
          )}

          {/* 9. DIRECTORY */}
          {activeSection === 'directory' && (
            <div className="space-y-6">
              <div className="flex flex-wrap items-center justify-between gap-4">
                <div>
                  <h1 className="text-2xl font-bold">O‘zbekiston Tashkilotlari va Ishonch Telefonlari</h1>
                  <p className="text-sm text-zinc-500">Favqulodda xizmatlar, banklar, kommunal va davlat tashkilotlari raqamlari</p>
                </div>
                <input
                  type="text"
                  value={dirSearch}
                  onChange={(e) => setDirSearch(e.target.value)}
                  placeholder="Tashkilot yoki raqam qidirish..."
                  className="px-4 py-2 rounded-xl bg-[#F4F5F7] text-sm outline-none"
                />
              </div>

              <div className="flex flex-wrap gap-2">
                {['Barchasi', ...Array.from(new Set(UZ_DIRECTORY.map((d) => d.category)))].map((cat) => (
                  <button
                    key={cat}
                    onClick={() => setDirCategory(cat)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-semibold ${
                      dirCategory === cat ? 'bg-zinc-900 text-white' : 'bg-[#F4F5F7]'
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {UZ_DIRECTORY
                  .filter((d) => (dirCategory === 'Barchasi' || d.category === dirCategory) && `${d.name} ${d.phone} ${d.description}`.toLowerCase().includes(dirSearch.toLowerCase()))
                  .map((item) => (
                    <div key={item.id} className="p-5 rounded-3xl bg-[#F8F9FA] border border-zinc-200/80 flex flex-col justify-between">
                      <div>
                        <div className="flex items-center justify-between gap-2">
                          <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-blue-500/10 text-blue-600">{item.category}</span>
                          <button
                            onClick={() => toggleBookmark({ id: item.id, type: 'Raqam', title: `${item.name} — ${item.phone}`, subtitle: item.category, section: 'directory' })}
                            className="text-zinc-400 hover:text-zinc-900"
                          >
                            <Bookmark className="w-4 h-4" />
                          </button>
                        </div>
                        <h3 className="font-bold text-base mt-2">{item.name}</h3>
                        <p className="text-xs text-zinc-500 mt-1">{item.description}</p>
                        {item.address && <p className="text-[11px] text-zinc-400 mt-2">📍 {item.address}</p>}
                        {item.hours && <p className="text-[11px] text-zinc-400">🕒 Ish vaqti: {item.hours}</p>}
                      </div>
                      <div className="mt-4 pt-3 border-t border-zinc-200/70 flex items-center justify-between gap-2">
                        <a
                          href={`tel:${item.phone.replace(/\s+/g, '')}`}
                          className="flex-1 py-2 px-3 rounded-xl bg-emerald-600 text-white text-xs font-bold flex items-center justify-center gap-1.5"
                        >
                          <PhoneCall className="w-3.5 h-3.5" /> {item.phone}
                        </a>
                        <button
                          onClick={() => copyText(item.phone, 'Telefon raqami')}
                          className="p-2 rounded-xl bg-white border border-zinc-200"
                          title="Raqamni nusxalash"
                        >
                          <Copy className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))}
              </div>
            </div>
          )}

          {/* 10. PRODUCTIVITY TOOLS */}
          {activeSection === 'tools' && (
            <div className="space-y-6">
              <div>
                <h1 className="text-2xl font-bold">Foydali Kundalik Vositalar</h1>
                <p className="text-sm text-zinc-500">Kalkulyator, valyuta konvertori, sekundomer, QR generator, parol yaratuvchi va bloknot</p>
              </div>

              <div className="flex flex-wrap gap-2">
                {[
                  { id: 'calc', label: 'Kalkulyator' },
                  { id: 'currency', label: 'Valyuta (USD/UZS)' },
                  { id: 'unit', label: 'O‘lchov birligi' },
                  { id: 'timer', label: 'Sekundomer' },
                  { id: 'notes', label: 'Bloknot & So‘z sanagich' },
                  { id: 'todo', label: 'Vazifalar ro‘yxati' },
                  { id: 'qr', label: 'QR Generator' },
                  { id: 'password', label: 'Parol Generator' },
                ].map((t) => (
                  <button
                    key={t.id}
                    onClick={() => setActiveTool(t.id as typeof activeTool)}
                    className={`px-3.5 py-2 rounded-xl text-xs font-semibold ${
                      activeTool === t.id ? 'bg-zinc-900 text-white' : 'bg-[#F4F5F7]'
                    }`}
                  >
                    {t.label}
                  </button>
                ))}
              </div>

              <div className="p-6 rounded-3xl bg-[#F8F9FA] border border-zinc-200/80 max-w-2xl">
                {activeTool === 'calc' && (
                  <div className="space-y-3">
                    <input
                      type="text"
                      value={calcExpr}
                      readOnly
                      placeholder="0"
                      className="w-full p-4 rounded-2xl bg-white text-right font-mono text-2xl font-bold border border-zinc-200"
                    />
                    <div className="grid grid-cols-4 gap-2">
                      {['7', '8', '9', '/', '4', '5', '6', '*', '1', '2', '3', '-', 'C', '0', '=', '+'].map((btn) => (
                        <button
                          key={btn}
                          onClick={() => {
                            if (btn === 'C') setCalcExpr('');
                            else if (btn === '=') {
                              try {
                                if (/^[0-9+\-*/.() ]+$/.test(calcExpr)) {
                                  setCalcExpr(String(Function(`"use strict";return (${calcExpr})`)()));
                                }
                              } catch {
                                setCalcExpr('Xato');
                              }
                            } else {
                              setCalcExpr((prev) => prev + btn);
                            }
                          }}
                          className="py-3.5 rounded-xl bg-white border border-zinc-200/80 font-bold text-base hover:bg-zinc-100"
                        >
                          {btn}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {activeTool === 'currency' && (
                  <div className="space-y-4">
                    <h3 className="font-bold">USD → UZS Valyuta Konvertori (1 USD = {uzsRate.toLocaleString()} so‘m)</h3>
                    <input
                      type="number"
                      value={usdAmount}
                      onChange={(e) => setUsdAmount(e.target.value)}
                      className="w-full p-3.5 rounded-xl bg-white border border-zinc-200 text-lg font-bold"
                    />
                    <p className="text-2xl font-bold text-emerald-600">
                      = {(Number(usdAmount || 0) * uzsRate).toLocaleString()} O‘zbekiston so‘mi
                    </p>
                  </div>
                )}

                {activeTool === 'unit' && (
                  <div className="space-y-4">
                    <h3 className="font-bold">Metr → Kilometr / Santimetr / Fut</h3>
                    <input
                      type="number"
                      value={unitMeters}
                      onChange={(e) => setUnitMeters(e.target.value)}
                      className="w-full p-3.5 rounded-xl bg-white border border-zinc-200 font-bold"
                    />
                    <div className="grid grid-cols-3 gap-3 text-sm">
                      <div className="p-3 rounded-xl bg-white border border-zinc-200/70"><b>{(Number(unitMeters) / 1000).toFixed(3)}</b> km</div>
                      <div className="p-3 rounded-xl bg-white border border-zinc-200/70"><b>{(Number(unitMeters) * 100).toLocaleString()}</b> sm</div>
                      <div className="p-3 rounded-xl bg-white border border-zinc-200/70"><b>{(Number(unitMeters) * 3.28084).toFixed(2)}</b> fut</div>
                    </div>
                  </div>
                )}

                {activeTool === 'timer' && (
                  <div className="text-center space-y-4">
                    <p className="text-4xl font-mono font-bold">
                      {String(Math.floor(stopwatchSec / 60)).padStart(2, '0')}:{String(stopwatchSec % 60).padStart(2, '0')}
                    </p>
                    <div className="flex justify-center gap-3">
                      <button onClick={() => setStopwatchRunning(!stopwatchRunning)} className="px-5 py-2.5 rounded-xl bg-zinc-900 text-white text-sm font-semibold">
                        {stopwatchRunning ? 'To‘xtatish' : 'Boshlash'}
                      </button>
                      <button onClick={() => { setStopwatchRunning(false); setStopwatchSec(0); }} className="px-5 py-2.5 rounded-xl border border-zinc-300 bg-white text-sm font-semibold">
                        Nolga qaytarish
                      </button>
                    </div>
                  </div>
                )}

                {activeTool === 'notes' && (
                  <div className="space-y-3">
                    <textarea
                      rows={6}
                      value={noteText}
                      onChange={(e) => setNoteText(e.target.value)}
                      className="w-full p-4 rounded-2xl bg-white border border-zinc-200 text-sm outline-none"
                    />
                    <div className="flex justify-between text-xs text-zinc-500">
                      <span>So‘zlar soni: <b>{noteText.trim() ? noteText.trim().split(/\s+/).length : 0}</b> • Belgilar: <b>{noteText.length}</b></span>
                      <button onClick={() => copyText(noteText, 'Matn')} className="text-blue-600 font-semibold">Nusxalash</button>
                    </div>
                  </div>
                )}

                {activeTool === 'todo' && (
                  <div className="space-y-4">
                    <form
                      onSubmit={(e) => {
                        e.preventDefault();
                        if (!todoInput.trim()) return;
                        setTodos((prev) => [{ id: `t-${Date.now()}`, text: todoInput.trim(), done: false }, ...prev]);
                        setTodoInput('');
                      }}
                      className="flex gap-2"
                    >
                      <input
                        type="text"
                        value={todoInput}
                        onChange={(e) => setTodoInput(e.target.value)}
                        placeholder="Yangi vazifa..."
                        className="flex-1 px-3.5 py-2 rounded-xl bg-white border border-zinc-200 text-sm"
                      />
                      <button type="submit" className="px-4 py-2 rounded-xl bg-zinc-900 text-white text-xs font-semibold">Qo‘shish</button>
                    </form>
                    <div className="space-y-2">
                      {todos.map((td) => (
                        <div key={td.id} className="flex items-center justify-between p-3 rounded-xl bg-white border border-zinc-200/70">
                          <button
                            onClick={() => setTodos((prev) => prev.map((x) => x.id === td.id ? { ...x, done: !x.done } : x))}
                            className={`text-sm text-left ${td.done ? 'line-through text-zinc-400' : ''}`}
                          >
                            {td.done ? '✅' : '⬜'} {td.text}
                          </button>
                          <button onClick={() => setTodos((prev) => prev.filter((x) => x.id !== td.id))} className="text-zinc-400 hover:text-red-500">
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {activeTool === 'qr' && (
                  <div className="space-y-4 text-center">
                    <input
                      type="text"
                      value={qrText}
                      onChange={(e) => setQrText(e.target.value)}
                      className="w-full p-3 rounded-xl bg-white border border-zinc-200 text-sm"
                    />
                    {qrText && (
                      <SafeWebPImage
                        src={`https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(qrText)}`}
                        alt="QR Code"
                        className="mx-auto rounded-2xl border p-2 bg-white w-48 h-48"
                      />
                    )}
                  </div>
                )}

                {activeTool === 'password' && (
                  <div className="space-y-4">
                    <div className="flex items-center justify-between p-4 rounded-2xl bg-white border border-zinc-200">
                      <span className="font-mono font-bold text-lg">{genPass}</span>
                      <button onClick={() => copyText(genPass, 'Parol')} className="p-2 rounded-xl bg-[#F4F5F7]">
                        <Copy className="w-4 h-4" />
                      </button>
                    </div>
                    <button
                      onClick={() => {
                        const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz23456789!@#$%^&*';
                        let p = '';
                        for (let i = 0; i < 16; i++) p += chars[Math.floor(Math.random() * chars.length)];
                        setGenPass(p);
                      }}
                      className="px-4 py-2.5 rounded-xl bg-zinc-900 text-white text-xs font-semibold"
                    >
                      Yangi kuchli parol yaratish
                    </button>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* 11. NEWS */}
          {activeSection === 'news' && (
            <div className="space-y-6">
              <div>
                <h1 className="text-2xl font-bold">Texnologiya va Dunyo Yangiliklari</h1>
                <p className="text-sm text-zinc-500">AI, smartfonlar, kompyuterlar va O‘zbekiston IT yangiliklari</p>
              </div>

              <div className="flex flex-wrap gap-2">
                {['Barchasi', 'AI yangiliklari', 'O‘zbekiston', 'Smartfonlar', 'Kompyuterlar', 'Koinot', 'Texnologiya'].map((cat) => (
                  <button
                    key={cat}
                    onClick={() => setNewsCategory(cat)}
                    className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold ${
                      newsCategory === cat ? 'bg-zinc-900 text-white' : 'bg-[#F4F5F7]'
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                {NEWS_ITEMS
                  .filter((n) => newsCategory === 'Barchasi' || n.category === newsCategory)
                  .map((news) => (
                    <div key={news.id} className="rounded-3xl bg-[#F8F9FA] border border-zinc-200/80 overflow-hidden flex flex-col">
                      <SafeWebPImage src={news.image} alt={news.title} className="w-full h-44 object-cover" />
                      <div className="p-5 flex-1 flex flex-col justify-between">
                        <div>
                          <span className="text-[11px] font-bold text-blue-600">{news.category} • {news.date}</span>
                          <h3 className="font-bold text-base mt-1">{news.title}</h3>
                          <p className="text-xs text-zinc-500 mt-2">{news.summary}</p>
                        </div>
                        <div className="mt-4 pt-3 border-t border-zinc-200/70 flex items-center justify-between">
                          <span className="text-xs text-zinc-400">{news.source}</span>
                          <a href={news.url} target="_blank" rel="noreferrer" className="text-xs font-semibold text-blue-600 flex items-center gap-1">
                            O‘qish <ExternalLink className="w-3.5 h-3.5" />
                          </a>
                        </div>
                      </div>
                    </div>
                  ))}
              </div>
            </div>
          )}

          {/* 12. AI TOOLS DIRECTORY */}
          {activeSection === 'ai-tools' && (
            <div className="space-y-6">
              <div className="flex flex-wrap items-center justify-between gap-4">
                <div>
                  <h1 className="text-2xl font-bold">AI Vositalar Katalogi</h1>
                  <p className="text-sm text-zinc-500">Ish, o‘qish va ijod uchun eng foydali sun’iy intellekt platformalari</p>
                </div>
                <input
                  type="text"
                  value={aiToolSearch}
                  onChange={(e) => setAiToolSearch(e.target.value)}
                  placeholder="AI vosita qidirish..."
                  className="px-4 py-2 rounded-xl bg-[#F4F5F7] text-sm outline-none"
                />
              </div>

              <div className="flex flex-wrap gap-2">
                {['Barchasi', 'Matn va Muloqot', 'Dasturlash', 'Rasm yaratish', 'Qidiruv va Tadqiqot', 'Audio va Ovoz', 'Samaradorlik'].map((cat) => (
                  <button
                    key={cat}
                    onClick={() => setAiToolCat(cat)}
                    className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold ${
                      aiToolCat === cat ? 'bg-zinc-900 text-white' : 'bg-[#F4F5F7]'
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {AI_TOOLS_DIR
                  .filter((t) => (aiToolCat === 'Barchasi' || t.category === aiToolCat) && `${t.name} ${t.description}`.toLowerCase().includes(aiToolSearch.toLowerCase()))
                  .map((tool) => (
                    <div key={tool.id} className="p-5 rounded-3xl bg-[#F8F9FA] border border-zinc-200/80 flex flex-col justify-between">
                      <div>
                        <div className="flex items-center justify-between">
                          <span className="text-[11px] font-bold text-purple-600">{tool.category}</span>
                          <span className="text-[10px] px-2 py-0.5 rounded-full bg-white border border-zinc-200">{tool.pricing}</span>
                        </div>
                        <h3 className="font-bold text-base mt-2">{tool.name}</h3>
                        <p className="text-xs text-zinc-500 mt-1.5">{tool.description}</p>
                      </div>
                      <a
                        href={tool.url}
                        target="_blank"
                        rel="noreferrer"
                        className="mt-4 py-2 px-3 rounded-xl bg-zinc-900 text-white text-xs font-semibold flex items-center justify-center gap-1.5"
                      >
                        Saytga o‘tish <ExternalLink className="w-3.5 h-3.5" />
                      </a>
                    </div>
                  ))}
              </div>
            </div>
          )}

          {/* 13. BOOKMARKS */}
          {activeSection === 'bookmarks' && (
            <div className="space-y-6">
              <div>
                <h1 className="text-2xl font-bold">Saqlanganlar (Xatcho‘plar)</h1>
                <p className="text-sm text-zinc-500">Saqlangan rasmlar, qurilmalar va foydali telefon raqamlar</p>
              </div>

              {bookmarks.length === 0 ? (
                <div className="p-12 rounded-3xl bg-[#F8F9FA] text-center text-sm text-zinc-500 border border-zinc-200/70">
                  Hozircha saqlangan elementlar yo‘q.
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {bookmarks.map((b) => (
                    <div key={b.id} className="p-4 rounded-2xl bg-[#F8F9FA] border border-zinc-200/80 flex items-center justify-between">
                      <button onClick={() => navigateTo(b.section)} className="text-left">
                        <span className="text-[10px] font-bold text-blue-600 uppercase">{b.type}</span>
                        <p className="font-bold text-sm mt-0.5">{b.title}</p>
                        <p className="text-xs text-zinc-500">{b.subtitle}</p>
                      </button>
                      <button onClick={() => setBookmarks((prev) => prev.filter((x) => x.id !== b.id))} className="p-2 text-zinc-400 hover:text-red-500">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* 14. PROFILE */}
          {activeSection === 'profile' && (
            <div className="max-w-2xl space-y-6">
              <h1 className="text-2xl font-bold">Shaxsiy Profil</h1>
              {user ? (
                <div className="p-6 rounded-3xl bg-[#F8F9FA] border border-zinc-200/80 space-y-4">
                  <div className="flex items-center gap-4">
                    {user.avatar ? (
                      <SafeWebPImage src={user.avatar} alt={user.name} className="w-16 h-16 rounded-full object-cover" />
                    ) : (
                      <div className="w-16 h-16 rounded-full bg-zinc-900 text-white flex items-center justify-center text-xl font-bold">
                        {user.name.slice(0, 2).toUpperCase()}
                      </div>
                    )}
                    <div>
                      <h2 className="text-xl font-bold">{user.name}</h2>
                      <p className="text-sm text-zinc-500">{user.email || user.phone}</p>
                      <span className="inline-block mt-1 text-[11px] font-semibold px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-700">
                        Tasdiqlangan akkaunt ({user.provider === 'phone' ? 'Telefon SMS' : 'Google OAuth'})
                      </span>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-3 pt-4 border-t border-zinc-200 text-center">
                    <div className="p-3 rounded-2xl bg-white border border-zinc-200/60">
                      <p className="text-xl font-bold">{bookmarks.length}</p>
                      <p className="text-xs text-zinc-500">Saqlanganlar</p>
                    </div>
                    <div className="p-3 rounded-2xl bg-white border border-zinc-200/60">
                      <p className="text-xl font-bold">{events.length}</p>
                      <p className="text-xs text-zinc-500">Tadbirlar</p>
                    </div>
                  </div>
                  <button onClick={handleLogout} className="px-4 py-2.5 rounded-xl bg-red-600 text-white text-xs font-semibold">
                    Akkauntdan chiqish
                  </button>
                </div>
              ) : (
                <div className="p-8 rounded-3xl bg-[#F8F9FA] border border-zinc-200/80 text-center space-y-4">
                  <p className="text-sm text-zinc-600">
                    Google akkauntingiz yoki O‘zbekiston (+998) telefon raqamingiz orqali tizimga kiring.
                  </p>
                  <button
                    onClick={() => { setAuthError(null); setAuthModalOpen(true); }}
                    className="px-6 py-3 rounded-xl bg-zinc-900 text-white text-sm font-semibold"
                  >
                    Kirish / Ro‘yxatdan o‘tish
                  </button>
                </div>
              )}
            </div>
          )}

          {/* 15. SETTINGS */}
          {activeSection === 'settings' && (
            <div className="max-w-2xl space-y-6">
              <h1 className="text-2xl font-bold">Platforma Sozlamalari</h1>
              <div className="p-6 rounded-3xl bg-[#F8F9FA] border border-zinc-200/80 space-y-4">
                <div>
                  <p className="font-semibold text-sm">Interfeys mavzusi</p>
                  <p className="text-xs text-zinc-500">Platforma toza oq (#FFFFFF) fon va yuqori o‘qiluvchanlik standartida ishlaydi.</p>
                </div>
                <div className="pt-4 border-t border-zinc-200">
                  <p className="font-semibold text-sm mb-1">Backend & Auth Holati</p>
                  <p className="text-xs text-zinc-500">
                    Supabase ulanishi: {supabase ? <span className="text-emerald-600 font-bold">Faol</span> : <span className="text-amber-600 font-bold">Kalitlar kutilmoqda</span>}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* 16. CONTACT */}
          {activeSection === 'contact' && (
            <div className="max-w-2xl space-y-6">
              <div>
                <h1 className="text-2xl font-bold">Aloqa va Qo‘llab-quvvatlash</h1>
                <p className="text-sm text-zinc-500">Takliflar, hamkorlik va texnik savollar uchun bevosita bog‘laning</p>
              </div>

              <div className="p-6 rounded-3xl bg-[#F8F9FA] border border-zinc-200/80 space-y-5">
                <div className="flex flex-wrap items-center justify-between gap-4 p-4 rounded-2xl bg-white border border-zinc-200/70">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-2xl bg-sky-500 text-white flex items-center justify-center">
                      <Send className="w-5 h-5" />
                    </div>
                    <div>
                      <p className="text-xs text-zinc-500">Rasmiy aloqa</p>
                      <p className="font-bold text-lg">@roz1matoff_me</p>
                    </div>
                  </div>
                  <button
                    onClick={() => copyText('@roz1matoff_me', 'Username')}
                    className="px-3.5 py-2 rounded-xl border border-zinc-200 text-xs font-semibold flex items-center gap-1.5"
                  >
                    <Copy className="w-3.5 h-3.5" /> Nusxalash
                  </button>
                </div>

                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    if (!contactMsg.trim()) return;
                    showToast('Xabaringiz qabul qilindi! Tez orada javob beramiz.');
                    setContactName('');
                    setContactMsg('');
                  }}
                  className="space-y-3"
                >
                  <input
                    type="text"
                    value={contactName}
                    onChange={(e) => setContactName(e.target.value)}
                    placeholder="Ismingiz"
                    className="w-full px-4 py-2.5 rounded-xl bg-white border border-zinc-200 text-sm outline-none"
                  />
                  <textarea
                    rows={4}
                    value={contactMsg}
                    onChange={(e) => setContactMsg(e.target.value)}
                    placeholder="Xabaringizni yozing..."
                    className="w-full px-4 py-2.5 rounded-xl bg-white border border-zinc-200 text-sm outline-none"
                    required
                  />
                  <button type="submit" className="px-5 py-2.5 rounded-xl bg-zinc-900 text-white text-sm font-semibold">
                    Xabar yuborish
                  </button>
                </form>
              </div>
            </div>
          )}
        </main>
      </div>

      {/* DOIMIY KO'RINIB TURADIGAN SUZUVCHI AI YORDAMCHI (bottom: 20px; right: 20px) */}
      <div style={{ position: 'fixed', bottom: '20px', right: '20px', zIndex: 60 }}>
        {!floatingAiOpen ? (
          <button
            onClick={() => setFloatingAiOpen(true)}
            aria-label="VerMix AI Yordamchini ochish"
            className="w-14 h-14 rounded-full bg-zinc-900 text-white shadow-2xl hover:scale-105 active:scale-95 transition flex items-center justify-center border-2 border-white"
          >
            <Bot className="w-6 h-6" />
          </button>
        ) : (
          <div className="fixed inset-3 sm:inset-auto sm:bottom-5 sm:right-5 sm:w-[380px] sm:h-[520px] bg-white border border-zinc-200 rounded-3xl shadow-2xl flex flex-col overflow-hidden z-60">
            <div className="px-4 py-3.5 bg-zinc-900 text-white flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center">
                  <Bot className="w-4 h-4 text-white" />
                </div>
                <div>
                  <h3 className="text-sm font-bold leading-none">VerMix AI Yordamchi</h3>
                  <span className="text-[11px] text-emerald-400">● Onlayn</span>
                </div>
              </div>
              <button
                onClick={() => setFloatingAiOpen(false)}
                aria-label="Chatni yopish"
                className="p-1.5 rounded-xl hover:bg-white/15 transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-3.5 space-y-3 bg-[#F8F9FA]">
              {chatMessages.map((msg) => (
                <div key={msg.id} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                  <div
                    className={`max-w-[85%] rounded-2xl px-3.5 py-2.5 text-xs leading-relaxed ${
                      msg.role === 'user'
                        ? 'bg-zinc-900 text-white rounded-br-xs'
                        : msg.isError
                        ? 'bg-red-50 text-red-700 border border-red-200 rounded-bl-xs'
                        : 'bg-white text-zinc-800 border border-zinc-200/80 rounded-bl-xs shadow-2xs'
                    }`}
                  >
                    <p className="whitespace-pre-wrap">{msg.content}</p>
                    <span className="block text-[10px] opacity-55 mt-1 text-right">{msg.timestamp}</span>
                  </div>
                </div>
              ))}

              {aiThinking && (
                <div className="flex justify-start">
                  <div className="bg-white border border-zinc-200 rounded-2xl px-4 py-2.5 flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-zinc-400 animate-bounce" style={{ animationDelay: '0ms' }} />
                    <span className="w-2 h-2 rounded-full bg-zinc-400 animate-bounce" style={{ animationDelay: '150ms' }} />
                    <span className="w-2 h-2 rounded-full bg-zinc-400 animate-bounce" style={{ animationDelay: '300ms' }} />
                  </div>
                </div>
              )}
              <div ref={floatingChatEndRef} />
            </div>

            <form onSubmit={handleSendAiMessage} className="p-2.5 bg-white border-t border-zinc-200 flex items-center gap-2">
              <input
                type="text"
                value={chatInput}
                onChange={(e) => setChatInput(e.target.value)}
                placeholder="Savolingizni yozing..."
                className="flex-1 px-3.5 py-2 rounded-xl bg-[#F4F5F7] text-xs outline-none focus:bg-zinc-100"
              />
              <button
                type="submit"
                disabled={aiThinking || !chatInput.trim()}
                className="p-2.5 rounded-xl bg-zinc-900 text-white disabled:opacity-40 transition"
              >
                <Send className="w-4 h-4" />
              </button>
            </form>
          </div>
        )}
      </div>

      {/* --- MODALS --- */}

      {/* AUTH MODAL */}
      {authModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 border border-zinc-200 shadow-2xl space-y-5">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-bold">VerMix’ga Kirish</h2>
              <button onClick={() => setAuthModalOpen(false)} className="p-1.5 rounded-lg hover:bg-zinc-100">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="grid grid-cols-2 gap-1.5 p-1 rounded-xl bg-[#F4F5F7]">
              <button
                onClick={() => { setAuthTab('google'); setAuthError(null); }}
                className={`py-2 rounded-lg text-xs font-semibold ${authTab === 'google' ? 'bg-white shadow-2xs' : ''}`}
              >
                Google Akkaunt
              </button>
              <button
                onClick={() => { setAuthTab('phone'); setAuthError(null); }}
                className={`py-2 rounded-lg text-xs font-semibold ${authTab === 'phone' ? 'bg-white shadow-2xs' : ''}`}
              >
                Telefon (+998 SMS)
              </button>
            </div>

            {authError && (
              <div className="p-3 rounded-xl bg-red-50 text-red-600 text-xs leading-relaxed">
                {authError}
              </div>
            )}

            {authTab === 'google' ? (
              <div className="space-y-4">
                <p className="text-xs text-zinc-500">
                  Google akkauntingiz orqali bir bosishda xavfsiz tizimga kiring.
                </p>
                <button
                  onClick={handleGoogleLogin}
                  disabled={authLoading}
                  className="w-full py-3 px-4 rounded-xl bg-zinc-900 text-white text-sm font-semibold flex items-center justify-center gap-2.5 hover:opacity-90 disabled:opacity-50"
                >
                  <Globe className="w-4 h-4" />
                  {authLoading ? 'Yo‘naltirilmoqda...' : 'Google bilan davom etish'}
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                {!otpSent ? (
                  <>
                    <div>
                      <label className="text-xs font-semibold text-zinc-500 block mb-1.5">O‘zbekiston telefon raqami</label>
                      <div className="flex items-center rounded-xl border border-zinc-200 overflow-hidden bg-[#F8F9FA]">
                        <span className="px-3.5 py-2.5 text-sm font-bold border-r border-zinc-200">+998</span>
                        <input
                          type="tel"
                          value={phoneInput}
                          onChange={(e) => setPhoneInput(e.target.value)}
                          placeholder="90 123 45 67"
                          className="flex-1 px-3.5 py-2.5 text-sm bg-transparent outline-none"
                        />
                      </div>
                    </div>
                    <button
                      onClick={handleSendOtp}
                      disabled={authLoading}
                      className="w-full py-3 rounded-xl bg-zinc-900 text-white text-sm font-semibold disabled:opacity-50"
                    >
                      {authLoading ? 'SMS yuborilmoqda...' : 'SMS kod yuborish'}
                    </button>
                  </>
                ) : (
                  <>
                    <div>
                      <label className="text-xs font-semibold text-zinc-500 block mb-1.5">Telefoningizga kelgan 6 xonali kod</label>
                      <input
                        type="text"
                        value={otpCode}
                        onChange={(e) => setOtpCode(e.target.value)}
                        placeholder="123456"
                        className="w-full px-4 py-2.5 rounded-xl border border-zinc-200 text-center font-mono text-lg tracking-widest bg-[#F8F9FA] outline-none"
                      />
                    </div>
                    <button
                      onClick={handleVerifyOtp}
                      disabled={authLoading}
                      className="w-full py-3 rounded-xl bg-emerald-600 text-white text-sm font-semibold disabled:opacity-50"
                    >
                      {authLoading ? 'Tekshirilmoqda...' : 'Kodni tasdiqlash'}
                    </button>
                    <button onClick={() => setOtpSent(false)} className="w-full text-xs text-zinc-500 underline">
                      Raqamni o‘zgartirish
                    </button>
                  </>
                )}
              </div>
            )}
          </div>
        </div>
      )}

      {/* ADD PIN MODAL */}
      {newPinModal && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              if (!newPinTitle.trim() || !newPinUrl.trim()) return;
              setPins((prev) => [{
                id: `p-${Date.now()}`, title: newPinTitle.trim(), category: newPinCat,
                image: newPinUrl.trim(), author: user?.name || 'Foydalanuvchi', likes: 1, board: newPinCat
              }, ...prev]);
              setNewPinModal(false);
              setNewPinTitle('');
              setNewPinUrl('');
              showToast('Rasm galereyaga qo‘shildi!');
            }}
            className="bg-white rounded-3xl max-w-md w-full p-6 border border-zinc-200 space-y-4"
          >
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-bold">Yangi rasm qo‘shish</h2>
              <button type="button" onClick={() => setNewPinModal(false)}><X className="w-5 h-5" /></button>
            </div>
            <input type="text" value={newPinTitle} onChange={(e) => setNewPinTitle(e.target.value)} placeholder="Rasm sarlavhasi" className="w-full px-3.5 py-2.5 rounded-xl bg-[#F4F5F7] text-sm" required />
            <input type="url" value={newPinUrl} onChange={(e) => setNewPinUrl(e.target.value)} placeholder="WebP rasm URL manzili (https://...)" className="w-full px-3.5 py-2.5 rounded-xl bg-[#F4F5F7] text-sm" required />
            <select value={newPinCat} onChange={(e) => setNewPinCat(e.target.value)} className="w-full px-3.5 py-2.5 rounded-xl bg-[#F4F5F7] text-sm">
              <option>Texnologiya</option>
              <option>Dizayn</option>
              <option>Sayohat</option>
              <option>Arxitektura</option>
              <option>Koinot</option>
            </select>
            <button type="submit" className="w-full py-3 rounded-xl bg-zinc-900 text-white text-sm font-semibold">Saqlash</button>
          </form>
        </div>
      )}

      {/* COMPUTER DETAIL MODAL */}
      {selectedComputer && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-2xl w-full p-6 border border-zinc-200 max-h-[90vh] overflow-y-auto space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-bold">{selectedComputer.brand} {selectedComputer.model} ({selectedComputer.year})</h2>
              <button onClick={() => setSelectedComputer(null)}><X className="w-5 h-5" /></button>
            </div>
            <SafeWebPImage src={selectedComputer.image} alt={selectedComputer.model} className="w-full h-56 object-cover rounded-2xl" />
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div className="p-3 rounded-xl bg-[#F8F9FA]"><b>Brend / Yil:</b> {selectedComputer.brand} ({selectedComputer.year})</div>
              <div className="p-3 rounded-xl bg-[#F8F9FA]"><b>Taxminiy narxi:</b> ${selectedComputer.price.toLocaleString()}</div>
              <div className="p-3 rounded-xl bg-[#F8F9FA]"><b>Protsessor:</b> {selectedComputer.processor}</div>
              <div className="p-3 rounded-xl bg-[#F8F9FA]"><b>RAM / Xotira:</b> {selectedComputer.ram} / {selectedComputer.storage}</div>
              <div className="p-3 rounded-xl bg-[#F8F9FA]"><b>Ekran:</b> {selectedComputer.display}</div>
              <div className="p-3 rounded-xl bg-[#F8F9FA]"><b>Batareya:</b> {selectedComputer.battery}</div>
              <div className="p-3 rounded-xl bg-[#F8F9FA] sm:col-span-2"><b>Kamera:</b> {selectedComputer.camera}</div>
            </div>
          </div>
        </div>
      )}

      {/* PHONE DETAIL MODAL */}
      {selectedPhone && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-xl w-full p-6 border border-zinc-200 max-h-[90vh] overflow-y-auto space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-bold">{selectedPhone.brand} {selectedPhone.model} ({selectedPhone.year})</h2>
              <button onClick={() => setSelectedPhone(null)}><X className="w-5 h-5" /></button>
            </div>
            <SafeWebPImage src={selectedPhone.image} alt={selectedPhone.model} className="w-full h-56 object-cover rounded-2xl" />
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 text-xs">
              <div className="p-3 rounded-xl bg-[#F8F9FA]"><b>Brend / Yil:</b> {selectedPhone.brand} ({selectedPhone.year})</div>
              <div className="p-3 rounded-xl bg-[#F8F9FA]"><b>Taxminiy narxi:</b> ${selectedPhone.price.toLocaleString()}</div>
              <div className="p-3 rounded-xl bg-[#F8F9FA]"><b>Protsessor:</b> {selectedPhone.processor}</div>
              <div className="p-3 rounded-xl bg-[#F8F9FA]"><b>RAM / Xotira:</b> {selectedPhone.ram} / {selectedPhone.storage}</div>
              <div className="p-3 rounded-xl bg-[#F8F9FA] sm:col-span-2"><b>Ekran:</b> {selectedPhone.display}</div>
              <div className="p-3 rounded-xl bg-[#F8F9FA] sm:col-span-2"><b>Kamera:</b> {selectedPhone.camera}</div>
              <div className="p-3 rounded-xl bg-[#F8F9FA] sm:col-span-2"><b>Batareya:</b> {selectedPhone.battery}</div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}