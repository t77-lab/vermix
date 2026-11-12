import React, { useState, useEffect, useRef, useMemo } from "react";
import {
  Home,
  Compass,
  Music,
  Play,
  Pause,
  SkipBack,
  SkipForward,
  Volume2,
  VolumeX,
  Laptop,
  Smartphone,
  Bot,
  Calendar,
  Phone,
  BookOpen,
  Newspaper,
  Wrench,
  Sparkles,
  Bookmark,
  User,
  Settings,
  Search,
  Sun,
  Moon,
  Plus,
  Trash2,
  Edit2,
  Copy,
  Check,
  ExternalLink,
  Heart,
  Share2,
  Upload,
  Send,
  MessageCircle,
  LogIn,
  LogOut,
  Shield,
  Clock,
  CloudSun,
  ArrowRight,
  X,
  Menu,
  Filter,
  SlidersHorizontal,
  CheckCircle2,
  AlertCircle,
  Globe,
  Calculator,
  QrCode,
  KeyRound,
  FileText,
  Timer,
  Watch
} from "lucide-react";

// ============================================================================
// SAFE LOCAL STORAGE HELPERS
// ============================================================================
function readStorage<T>(key: string, fallback: T): T {
  try {
    const raw = window.localStorage.getItem(key);
    if (!raw) return fallback;
    const parsed = JSON.parse(raw);
    return parsed !== null && parsed !== undefined ? parsed : fallback;
  } catch {
    return fallback;
  }
}

function writeStorage<T>(key: string, value: T): void {
  try {
    window.localStorage.setItem(key, JSON.stringify(value));
  } catch {
    // Ignore storage quota or sandbox restrictions
  }
}

// ============================================================================
// VERIFIED SVG FALLBACK IMAGES FOR DEVICES
// ============================================================================
const LAPTOP_FALLBACK_SVG =
  "data:image/svg+xml;utf8," +
  encodeURIComponent(
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 640 400" fill="none">
      <rect width="640" height="400" rx="24" fill="#F1F5F9"/>
      <rect x="130" y="72" width="380" height="228" rx="16" fill="#0F172A" stroke="#334155" stroke-width="6"/>
      <rect x="148" y="90" width="344" height="192" rx="8" fill="#1E293B"/>
      <circle cx="320" cy="186" r="34" fill="#3B82F6" fill-opacity="0.22"/>
      <path d="M92 308H548L526 326H114L92 308Z" fill="#94A3B8"/>
    </svg>`
  );

const PHONE_FALLBACK_SVG =
  "data:image/svg+xml;utf8," +
  encodeURIComponent(
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 400" fill="none">
      <rect width="400" height="400" rx="24" fill="#F1F5F9"/>
      <rect x="128" y="42" width="144" height="316" rx="28" fill="#0F172A" stroke="#334155" stroke-width="6"/>
      <rect x="138" y="54" width="124" height="292" rx="20" fill="#1E293B"/>
      <rect x="176" y="64" width="48" height="10" rx="5" fill="#0F172A"/>
      <circle cx="200" cy="200" r="28" fill="#10B981" fill-opacity="0.25"/>
    </svg>`
  );

// ============================================================================
// STRICT ASCII TYPES & INTERFACES
// ============================================================================
type SectionKey =
  | "home"
  | "pinterest"
  | "music"
  | "videos"
  | "computers"
  | "smartphones"
  | "ai"
  | "calendar"
  | "operators"
  | "directory"
  | "news"
  | "tools"
  | "aitools"
  | "bookmarks"
  | "profile"
  | "contact"
  | "settings";

interface PinCard {
  id: string;
  title: string;
  category: string;
  author: string;
  likes: number;
  imageUrl: string;
  heightClass: string;
  board: string;
}

interface TrackItem {
  id: string;
  title: string;
  artist: string;
  album: string;
  category: string;
  durationSec: number;
  coverUrl: string;
  audioUrl?: string;
  baseFreq: number;
  isCustom?: boolean;
}

interface SocialVideoItem {
  id: string;
  platform: "YouTube" | "Instagram" | "TikTok";
  title: string;
  author: string;
  originalUrl: string;
  embedUrl: string;
  addedAt: string;
}

interface LaptopSpec {
  id: string;
  brand: string;
  model: string;
  year: number;
  imageUrl: string;
  cpu: string;
  ram: string;
  storage: string;
  gpu: string;
  display: string;
  battery: string;
  priceRange: string;
  description: string;
  pros: string[];
  cons: string[];
}

interface PhoneSpec {
  id: string;
  brand: string;
  model: string;
  releaseDate: string;
  imageUrl: string;
  display: string;
  processor: string;
  ramStorage: string;
  mainCamera: string;
  frontCamera: string;
  battery: string;
  charging: string;
  os: string;
  price: string;
}

interface AiMessage {
  id: string;
  role: "user" | "assistant";
  text: string;
  time: string;
}

interface AiThread {
  id: string;
  title: string;
  messages: AiMessage[];
}

interface CalendarItem {
  id: string;
  title: string;
  date: string;
  time: string;
  category: "Tadbir" | "Eslatma" | "Vazifa" | "Muhim sana";
  color: string;
  notes: string;
}

interface OperatorInfo {
  id: string;
  name: string;
  badgeColor: string;
  supportPhone: string;
  shortNumbers: string[];
  balanceUssd: string;
  internetUssd: string;
  ussdList: { code: string; title: string }[];
  tariffs: { name: string; price: string; info: string }[];
  packages: { name: string; size: string; ussd: string }[];
  website: string;
}

interface OrgDirectoryItem {
  id: string;
  name: string;
  category: string;
  phone: string;
  description: string;
  website: string;
  address: string;
  hours: string;
}

interface NewsItem {
  id: string;
  title: string;
  category: string;
  summary: string;
  date: string;
  source: string;
  url: string;
  imageUrl: string;
}

interface AiToolEntry {
  id: string;
  name: string;
  category: string;
  description: string;
  pricing: string;
  url: string;
}

interface SavedBookmark {
  id: string;
  type: "Rasm" | "Video" | "Musiqa" | "Kompyuter" | "Smartfon" | "Yangilik" | "Telefon";
  title: string;
  subtitle: string;
  section: SectionKey;
}

interface UserAuth {
  isAuthenticated: boolean;
  provider: "google" | "phone" | "guest";
  name: string;
  identifier: string;
  avatarLetter: string;
}

// ============================================================================
// NAVIGATION CONFIGURATION (ALL 17 SECTIONS IN UZBEK)
// ============================================================================
const SIDEBAR_MENU: {
  id: SectionKey;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
}[] = [
  { id: "home", label: "Bosh sahifa", icon: Home },
  { id: "pinterest", label: "Pinterest", icon: Compass },
  { id: "music", label: "Musiqa", icon: Music },
  { id: "videos", label: "Videolar", icon: Play },
  { id: "computers", label: "Kompyuterlar", icon: Laptop },
  { id: "smartphones", label: "Smartfonlar", icon: Smartphone },
  { id: "ai", label: "AI Yordamchi", icon: Bot },
  { id: "calendar", label: "Kalendar", icon: Calendar },
  { id: "operators", label: "Mobil Operatorlar", icon: Phone },
  { id: "directory", label: "Telefon Ma'lumotnomasi", icon: BookOpen },
  { id: "news", label: "Yangiliklar", icon: Newspaper },
  { id: "tools", label: "Foydali Vositalar", icon: Wrench },
  { id: "aitools", label: "AI Vositalar", icon: Sparkles },
  { id: "bookmarks", label: "Saqlanganlar", icon: Bookmark },
  { id: "profile", label: "Profil", icon: User },
  { id: "contact", label: "Aloqa", icon: MessageCircle },
  { id: "settings", label: "Sozlamalar", icon: Settings }
];

// ============================================================================
// CURATED DATA (VERIFIED SPECS, CONTACTS & REAL DEVICE PHOTOS)
// ============================================================================
const INITIAL_PINS: PinCard[] = [
  {
    id: "pin-1",
    title: "Minimalist oq ish stoli va MacBook Pro setup",
    category: "Texnologiya",
    author: "VerMix Studio",
    likes: 412,
    imageUrl: "https://images.unsplash.com/photo-1498050108023-c5249f4df085?auto=format&fit=crop&w=800&q=80",
    heightClass: "h-64",
    board: "Ish stoli g'oyalari"
  },
  {
    id: "pin-2",
    title: "Samarqand Registon ansambli me'moriy go'zalligi",
    category: "Sayohat",
    author: "Samarkand Travel",
    likes: 928,
    imageUrl: "https://images.unsplash.com/photo-1596484552834-6a58f850e0a1?auto=format&fit=crop&w=800&q=80",
    heightClass: "h-80",
    board: "O'zbekiston sayohati"
  },
  {
    id: "pin-3",
    title: "Zamonaviy UI/UX mobil ilova dizayn tizimi",
    category: "Dizayn",
    author: "Madina UI",
    likes: 340,
    imageUrl: "https://images.unsplash.com/photo-1561070791-2526d30994b5?auto=format&fit=crop&w=800&q=80",
    heightClass: "h-56",
    board: "Dizayn ilhomlari"
  },
  {
    id: "pin-4",
    title: "Skandinaviya uslubidagi yorug' va sokin interyer",
    category: "Interyer",
    author: "Nordic Space",
    likes: 519,
    imageUrl: "https://images.unsplash.com/photo-1513694203232-719a280e022f?auto=format&fit=crop&w=800&q=80",
    heightClass: "h-72",
    board: "Interyer"
  },
  {
    id: "pin-5",
    title: "Sun'iy intellekt va kelajak texnologiyalari",
    category: "Sun'iy Intellekt",
    author: "AI Lab",
    likes: 645,
    imageUrl: "https://images.unsplash.com/photo-1677442136019-21780ecad995?auto=format&fit=crop&w=800&q=80",
    heightClass: "h-64",
    board: "Texnologiya"
  },
  {
    id: "pin-6",
    title: "Tonggi kofe va mutolaa estetikasi",
    category: "Hayot tarzi",
    author: "Dilnoza Art",
    likes: 284,
    imageUrl: "https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?auto=format&fit=crop&w=800&q=80",
    heightClass: "h-60",
    board: "Hayot tarzi"
  }
];

const DEFAULT_TRACKS: TrackItem[] = [
  {
    id: "trk-1",
    title: "Samarqand Tongi (Ambient Piano)",
    artist: "VerMix Studio",
    album: "Ipak Yo'li Ohanglari",
    category: "Fokus va Ish",
    durationSec: 185,
    coverUrl: "https://images.unsplash.com/photo-1511379938547-c1f69419868d?auto=format&fit=crop&w=400&q=80",
    baseFreq: 261.63
  },
  {
    id: "trk-2",
    title: "Toshkent Kechalari (Lo-Fi Chill)",
    artist: "Nuriddin Beats",
    album: "Shahar Ritmi",
    category: "Lo-Fi",
    durationSec: 164,
    coverUrl: "https://images.unsplash.com/photo-1514525253161-7a46d19cd819?auto=format&fit=crop&w=400&q=80",
    baseFreq: 293.66
  },
  {
    id: "trk-3",
    title: "Registon Yulduzlari",
    artist: "Sharq Simfonik",
    album: "Sharq Nafasi",
    category: "Milliy va Klassik",
    durationSec: 215,
    coverUrl: "https://images.unsplash.com/photo-1470225620780-dba8ba36b745?auto=format&fit=crop&w=400&q=80",
    baseFreq: 329.63
  },
  {
    id: "trk-4",
    title: "Deep Focus Flow",
    artist: "VerMix AI Audio",
    album: "Produktivlik",
    category: "Fokus va Ish",
    durationSec: 210,
    coverUrl: "https://images.unsplash.com/photo-1459749411175-04bf5292ceea?auto=format&fit=crop&w=400&q=80",
    baseFreq: 220.0
  }
];

const INITIAL_VIDEOS: SocialVideoItem[] = [
  {
    id: "vid-1",
    platform: "YouTube",
    title: "O'zbekistonning tarixiy shaharlari bo'ylab sayohat (4K)",
    author: "YouTube Rasmiy Pleyer",
    originalUrl: "https://www.youtube.com/watch?v=aqz-KE-bpKQ",
    embedUrl: "https://www.youtube.com/embed/aqz-KE-bpKQ",
    addedAt: "Bugun"
  },
  {
    id: "vid-2",
    platform: "YouTube",
    title: "Zamonaviy texnologiyalar va sun'iy intellekt sharhi",
    author: "Tech Overview",
    originalUrl: "https://www.youtube.com/watch?v=LXb3EKWsInQ",
    embedUrl: "https://www.youtube.com/embed/LXb3EKWsInQ",
    addedAt: "Kecha"
  }
];

const COMPUTERS_CATALOG: LaptopSpec[] = [
  {
    id: "lap-apple-m4",
    brand: "Apple",
    model: "MacBook Pro 14 (M4 Pro)",
    year: 2024,
    imageUrl: "https://images.unsplash.com/photo-1517336714731-489689fd1ca8?auto=format&fit=crop&w=800&q=80",
    cpu: "Apple M4 Pro (12-yadro CPU)",
    ram: "24 GB Unified Memory",
    storage: "512 GB NVMe SSD",
    gpu: "16-yadro Apple GPU",
    display: "14.2 dyuym Liquid Retina XDR, 120Hz",
    battery: "72.4 Vt·soat (18 soatgacha)",
    priceRange: "$1,999 – $2,299",
    description: "Dasturchilar, dizaynerlar va video montaj ustalari uchun yuqori unumdor va uzoq ishlovchi noutbuk.",
    pros: ["18 soatgacha batareya", "Yorqin Mini-LED ekran", "Shovqinsiz ishlash"],
    cons: ["Narxi yuqori", "Xotirani kengaytirib bo'lmaydi"]
  },
  {
    id: "lap-asus-rog",
    brand: "ASUS",
    model: "ROG Zephyrus G16 (2024)",
    year: 2024,
    imageUrl: "https://images.unsplash.com/photo-1603302576837-37561b2e2302?auto=format&fit=crop&w=800&q=80",
    cpu: "Intel Core Ultra 9 185H",
    ram: "32 GB LPDDR5X",
    storage: "1 TB PCIe 4.0 SSD",
    gpu: "NVIDIA GeForce RTX 4070 8GB",
    display: "16 dyuym ROG Nebula OLED 2.5K 240Hz",
    battery: "90 Vt·soat",
    priceRange: "$1,899 – $2,199",
    description: "Yupqa alyuminiy korpusda kuchli o'yin va 3D grafika imkoniyatlarini birlashtirgan flagman noutbuk.",
    pros: ["240Hz OLED displey", "Yengil (1.85 kg)", "Kuchli RTX 4070 grafikasi"],
    cons: ["Yuklamada qizishi mumkin", "RAM qo'shib bo'lmaydi"]
  },
  {
    id: "lap-lenovo-x1",
    brand: "Lenovo",
    model: "ThinkPad X1 Carbon Gen 12",
    year: 2024,
    imageUrl: "https://images.unsplash.com/photo-1588872657578-7efd1f1555ed?auto=format&fit=crop&w=800&q=80",
    cpu: "Intel Core Ultra 7 155H",
    ram: "32 GB LPDDR5x",
    storage: "1 TB SSD",
    gpu: "Intel Arc Graphics",
    display: "14 dyuym 2.8K OLED 120Hz",
    battery: "57 Vt·soat",
    priceRange: "$1,750 – $2,050",
    description: "Biznes va korporativ foydalanuvchilar uchun 1.09 kg vaznli afsonaviy ultrabuk.",
    pros: ["1.09 kg o'ta yengil", "Qulay klaviatura", "Yuqori chidamlilik"],
    cons: ["O'yinlar uchun emas", "Baland narx"]
  },
  {
    id: "lap-hp-spectre",
    brand: "HP",
    model: "Spectre x360 14 (2024)",
    year: 2024,
    imageUrl: "https://images.unsplash.com/photo-1544731612-de7f96afe55f?auto=format&fit=crop&w=800&q=80",
    cpu: "Intel Core Ultra 7 155H",
    ram: "16 GB LPDDR5x",
    storage: "1 TB NVMe SSD",
    gpu: "Intel Arc Graphics",
    display: "14 dyuym 2.8K OLED Touch 120Hz",
    battery: "68 Vt·soat",
    priceRange: "$1,499 – $1,699",
    description: "360 daraja bukiladigan sensor ekranli, stilus qo'llab-quvvatlaydigan transformer noutbuk.",
    pros: ["2-in-1 planshet rejimi", "9 MP sifatli kamera", "Nafis dizayn"],
    cons: ["Portlar soni kam", "Yaltiroq ekran"]
  },
  {
    id: "lap-dell-xps",
    brand: "Dell",
    model: "XPS 14 (9440)",
    year: 2024,
    imageUrl: "https://images.unsplash.com/photo-1593642632823-8f785ba67e45?auto=format&fit=crop&w=800&q=80",
    cpu: "Intel Core Ultra 7 155H",
    ram: "32 GB LPDDR5x",
    storage: "1 TB SSD",
    gpu: "NVIDIA GeForce RTX 4050 6GB",
    display: "14.5 dyuym 3.2K OLED Touch",
    battery: "69.5 Vt·soat",
    priceRange: "$1,799 – $2,099",
    description: "CNC alyuminiy va Gorilla Glass 3 shishasidan tayyorlangan minimalist ultrabuk.",
    pros: ["Premium korpus", "3.2K OLED ekran", "Diskret RTX 4050 GPU"],
    cons: ["Sensorli funksional tugmalar", "Og'irroq (1.74 kg)"]
  },
  {
    id: "lap-acer-swift",
    brand: "Acer",
    model: "Swift Go 14 AI",
    year: 2024,
    imageUrl: "https://images.unsplash.com/photo-1496181133206-80ce9b88a853?auto=format&fit=crop&w=800&q=80",
    cpu: "Intel Core Ultra 7 155H",
    ram: "16 GB LPDDR5X",
    storage: "512 GB SSD",
    gpu: "Intel Arc Graphics",
    display: "14 dyuym 2.8K OLED 90Hz",
    battery: "65 Vt·soat",
    priceRange: "$849 – $999",
    description: "Hamyonbop narxda OLED ekran va AI tezlatkichini taqdim etuvchi kundalik noutbuk.",
    pros: ["Yaxshi narx/sifat nisbati", "OLED displey", "Ko'p portlar"],
    cons: ["O'rtacha dinamiklar", "Plastik elementlar"]
  },
  {
    id: "lap-msi-raider",
    brand: "MSI",
    model: "Raider GE78 HX",
    year: 2024,
    imageUrl: "https://images.unsplash.com/photo-1625842268584-8f3296236761?auto=format&fit=crop&w=800&q=80",
    cpu: "Intel Core i9-14900HX (24-yadro)",
    ram: "32 GB DDR5-5600",
    storage: "2 TB NVMe SSD",
    gpu: "NVIDIA GeForce RTX 4080 12GB",
    display: "17 dyuym QHD+ 240Hz IPS",
    battery: "99.9 Vt·soat",
    priceRange: "$2,599 – $2,999",
    description: "Maksimal unumdorlikni talab qiluvchi geymerlar va muhandislar uchun ish stansiyasi.",
    pros: ["Eng yuqori unumdorlik", "Kuchli sovutish", "Xotirani kengaytirish"],
    cons: ["Og'ir (3.1 kg)", "Batareya vaqti qisqa"]
  },
  {
    id: "lap-ms-surface",
    brand: "Microsoft",
    model: "Surface Laptop 7 (13.8)",
    year: 2024,
    imageUrl: "https://images.unsplash.com/photo-1525547719571-a2d4ac8945e2?auto=format&fit=crop&w=800&q=80",
    cpu: "Qualcomm Snapdragon X Elite",
    ram: "16 GB LPDDR5x",
    storage: "512 GB Gen 4 SSD",
    gpu: "Qualcomm Adreno GPU",
    display: "13.8 dyuym PixelSense Flow 120Hz",
    battery: "54 Vt·soat (20 soatgacha)",
    priceRange: "$1,199 – $1,399",
    description: "Copilot+ AI funksiyalari va rekord darajadagi batareya ishlash vaqtiga ega noutbuk.",
    pros: ["20 soatgacha avtonomlik", "Haptic trekpad", "Tezkor uyg'onish"],
    cons: ["Ayrim eski x86 dasturlar emulyatsiyada ishlaydi"]
  },
  {
    id: "lap-samsung-gb4",
    brand: "Samsung",
    model: "Galaxy Book4 Ultra",
    year: 2024,
    imageUrl: "https://images.unsplash.com/photo-1531297484001-80022131f5a1?auto=format&fit=crop&w=800&q=80",
    cpu: "Intel Core Ultra 9 185H",
    ram: "32 GB LPDDR5X",
    storage: "1 TB SSD",
    gpu: "NVIDIA GeForce RTX 4070 8GB",
    display: "16 dyuym Dynamic AMOLED 2X 120Hz",
    battery: "76 Vt·soat",
    priceRange: "$2,199 – $2,399",
    description: "Samsung Galaxy ekotizimi bilan integratsiyalashgan sensor AMOLED ekranli noutbuk.",
    pros: ["Dynamic AMOLED 2X ekran", "Galaxy telefonlar bilan sinxronizatsiya", "Yengil korpus"],
    cons: ["Yuqori narx", "Barmoq izlari qolishi mumkin"]
  },
  {
    id: "lap-razer-blade",
    brand: "Razer",
    model: "Blade 16 (2024)",
    year: 2024,
    imageUrl: "https://images.unsplash.com/photo-1542751371-adc38448a05e?auto=format&fit=crop&w=800&q=80",
    cpu: "Intel Core i9-14900HX",
    ram: "32 GB DDR5",
    storage: "1 TB SSD",
    gpu: "NVIDIA GeForce RTX 4080 12GB",
    display: "16 dyuym QHD+ 240Hz OLED",
    battery: "95.2 Vt·soat",
    priceRange: "$2,899 – $3,299",
    description: "Yaxlit qora anodlangan alyuminiydan ishlangan premium o'yin va ijod noutbuki.",
    pros: ["240Hz OLED 0.2ms ekran", "Yaxlit metall korpus", "Ixcham o'lcham"],
    cons: ["Juda qimmat", "Yuklamada shovqinli"]
  },
  {
    id: "lap-huawei-matebook",
    brand: "Huawei",
    model: "MateBook X Pro (2024)",
    year: 2024,
    imageUrl: "https://images.unsplash.com/photo-1515378791036-0648a3ef77b2?auto=format&fit=crop&w=800&q=80",
    cpu: "Intel Core Ultra 9 185H",
    ram: "32 GB LPDDR5X",
    storage: "1 TB SSD",
    gpu: "Intel Arc Graphics",
    display: "14.2 dyuym Flexible OLED 120Hz",
    battery: "70 Vt·soat",
    priceRange: "$1,699 – $1,899",
    description: "Atigi 980 gramm og'irlikdagi magniy qotishmali ultrayengil flagman noutbuk.",
    pros: ["980 gramm rekord yengillik", "3.1K Flexible OLED ekran", "90W tez quvvatlash"],
    cons: ["Portlar kam (3 ta USB-C)"]
  }
];

const SMARTPHONES_CATALOG: PhoneSpec[] = [
  {
    id: "ph-iphone16pm",
    brand: "Apple iPhone",
    model: "iPhone 16 Pro Max",
    releaseDate: "2024-yil Sentabr",
    imageUrl: "https://images.unsplash.com/photo-1695048133142-1a20484d2569?auto=format&fit=crop&w=800&q=80",
    display: "6.9 dyuym LTPO Super Retina XDR OLED, 120Hz",
    processor: "Apple A18 Pro (3 nm)",
    ramStorage: "8 GB RAM / 256 GB – 1 TB",
    mainCamera: "48 MP asosiy + 48 MP ultra-keng + 12 MP 5x periskop",
    frontCamera: "12 MP TrueDepth",
    battery: "4685 mA·soat",
    charging: "25W MagSafe / 30W simli",
    os: "iOS 18",
    price: "$1,199"
  },
  {
    id: "ph-s24u",
    brand: "Samsung Galaxy",
    model: "Samsung Galaxy S24 Ultra",
    releaseDate: "2024-yil Yanvar",
    imageUrl: "https://images.unsplash.com/photo-1610945415295-d9bbf067e59c?auto=format&fit=crop&w=800&q=80",
    display: "6.8 dyuym Dynamic LTPO AMOLED 2X, 120Hz",
    processor: "Snapdragon 8 Gen 3 for Galaxy",
    ramStorage: "12 GB RAM / 256 GB – 1 TB",
    mainCamera: "200 MP asosiy + 50 MP 5x + 10 MP 3x + 12 MP",
    frontCamera: "12 MP Dual Pixel",
    battery: "5000 mA·soat",
    charging: "45W simli / 15W simsiz",
    os: "Android 14 (One UI 6.1)",
    price: "$1,099"
  },
  {
    id: "ph-xiaomi14u",
    brand: "Xiaomi",
    model: "Xiaomi 14 Ultra",
    releaseDate: "2024-yil Fevral",
    imageUrl: "https://images.unsplash.com/photo-1598327105666-5b89351aff97?auto=format&fit=crop&w=800&q=80",
    display: "6.73 dyuym LTPO AMOLED 120Hz",
    processor: "Snapdragon 8 Gen 3",
    ramStorage: "16 GB RAM / 512 GB – 1 TB",
    mainCamera: "50 MP 1-dyuymli Leica Summilux (4x50 MP)",
    frontCamera: "32 MP",
    battery: "5000 mA·soat",
    charging: "90W simli / 80W simsiz",
    os: "Android 14 (HyperOS)",
    price: "$1,050"
  },
  {
    id: "ph-redmi-note13",
    brand: "Redmi",
    model: "Redmi Note 13 Pro+ 5G",
    releaseDate: "2024-yil Yanvar",
    imageUrl: "https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?auto=format&fit=crop&w=800&q=80",
    display: "6.67 dyuym AMOLED 120Hz, IP68",
    processor: "MediaTek Dimensity 7200 Ultra",
    ramStorage: "12 GB RAM / 512 GB",
    mainCamera: "200 MP OIS + 8 MP + 2 MP",
    frontCamera: "16 MP",
    battery: "5000 mA·soat",
    charging: "120W HyperCharge",
    os: "Android 14 (HyperOS)",
    price: "$360"
  },
  {
    id: "ph-poco-f6",
    brand: "POCO",
    model: "POCO F6 Pro",
    releaseDate: "2024-yil May",
    imageUrl: "https://images.unsplash.com/photo-1565849904461-04a58ad377e0?auto=format&fit=crop&w=800&q=80",
    display: "6.67 dyuym WQHD+ Flow AMOLED 120Hz",
    processor: "Snapdragon 8 Gen 2",
    ramStorage: "12 GB / 512 GB",
    mainCamera: "50 MP OIS + 8 MP + 2 MP",
    frontCamera: "16 MP",
    battery: "5000 mA·soat",
    charging: "120W HyperCharge",
    os: "Android 14 (HyperOS)",
    price: "$460"
  },
  {
    id: "ph-pixel9pro",
    brand: "Google Pixel",
    model: "Google Pixel 9 Pro XL",
    releaseDate: "2024-yil Avgust",
    imageUrl: "https://images.unsplash.com/photo-1591337676887-a217a6970a8a?auto=format&fit=crop&w=800&q=80",
    display: "6.8 dyuym Super Actua LTPO OLED 120Hz",
    processor: "Google Tensor G4",
    ramStorage: "16 GB RAM / 256 GB – 1 TB",
    mainCamera: "50 MP + 48 MP 5x periskop + 48 MP",
    frontCamera: "42 MP avtofokus",
    battery: "5060 mA·soat",
    charging: "37W simli / 23W simsiz",
    os: "Android 14 (7 yil yangilanish)",
    price: "$1,099"
  },
  {
    id: "ph-huawei-pura",
    brand: "Huawei",
    model: "Huawei Pura 70 Ultra",
    releaseDate: "2024-yil Aprel",
    imageUrl: "https://images.unsplash.com/photo-1580910051074-3eb694886505?auto=format&fit=crop&w=800&q=80",
    display: "6.8 dyuym LTPO OLED 120Hz",
    processor: "Kirin 9010",
    ramStorage: "16 GB RAM / 512 GB",
    mainCamera: "50 MP 1-dyuymli obyektiv + 50 MP telefoto + 40 MP",
    frontCamera: "13 MP",
    battery: "5200 mA·soat",
    charging: "100W simli / 80W simsiz",
    os: "EMUI 14.2 / HarmonyOS",
    price: "$1,150"
  },
  {
    id: "ph-honor-magic",
    brand: "Honor",
    model: "Honor Magic6 Pro",
    releaseDate: "2024-yil Yanvar",
    imageUrl: "https://images.unsplash.com/photo-1592899677977-9c10ca588bbd?auto=format&fit=crop&w=800&q=80",
    display: "6.8 dyuym LTPO OLED 120Hz",
    processor: "Snapdragon 8 Gen 3",
    ramStorage: "12 GB RAM / 512 GB",
    mainCamera: "50 MP + 180 MP periskop + 50 MP",
    frontCamera: "50 MP + 3D ToF",
    battery: "5600 mA·soat",
    charging: "80W simli / 66W simsiz",
    os: "Android 14 (MagicOS 8.0)",
    price: "$980"
  },
  {
    id: "ph-oneplus12",
    brand: "OnePlus",
    model: "OnePlus 12",
    releaseDate: "2024-yil Yanvar",
    imageUrl: "https://images.unsplash.com/photo-1533228100845-08145b01de14?auto=format&fit=crop&w=800&q=80",
    display: "6.82 dyuym 2K LTPO AMOLED 120Hz",
    processor: "Snapdragon 8 Gen 3",
    ramStorage: "16 GB RAM / 512 GB",
    mainCamera: "50 MP Sony + 64 MP 3x Hasselblad + 48 MP",
    frontCamera: "32 MP",
    battery: "5400 mA·soat",
    charging: "100W SUPERVOOC / 50W simsiz",
    os: "Android 14 (OxygenOS 14)",
    price: "$799"
  },
  {
    id: "ph-oppo-find",
    brand: "OPPO",
    model: "OPPO Find X7 Ultra",
    releaseDate: "2024-yil Yanvar",
    imageUrl: "https://images.unsplash.com/photo-1574944985070-8f3ebc6b79d2?auto=format&fit=crop&w=800&q=80",
    display: "6.82 dyuym QHD+ LTPO AMOLED 120Hz",
    processor: "Snapdragon 8 Gen 3",
    ramStorage: "16 GB RAM / 512 GB",
    mainCamera: "4x50 MP Hasselblad periskop tizimi",
    frontCamera: "32 MP",
    battery: "5000 mA·soat",
    charging: "100W simli / 50W simsiz",
    os: "Android 14 (ColorOS 14)",
    price: "$950"
  },
  {
    id: "ph-vivo-x100",
    brand: "Vivo",
    model: "Vivo X100 Pro",
    releaseDate: "2023-yil Noyabr",
    imageUrl: "https://images.unsplash.com/photo-1601784551446-20c9e07cdbdb?auto=format&fit=crop&w=800&q=80",
    display: "6.78 dyuym LTPO AMOLED 120Hz",
    processor: "MediaTek Dimensity 9300",
    ramStorage: "16 GB RAM / 512 GB",
    mainCamera: "50 MP 1-dyuym ZEISS APO + 50 MP",
    frontCamera: "32 MP",
    battery: "5400 mA·soat",
    charging: "100W simli / 50W simsiz",
    os: "Android 14 (Funtouch OS 14)",
    price: "$899"
  },
  {
    id: "ph-realme-gt6",
    brand: "Realme",
    model: "Realme GT 6",
    releaseDate: "2024-yil Iyun",
    imageUrl: "https://images.unsplash.com/photo-1585060544812-6b45742d762f?auto=format&fit=crop&w=800&q=80",
    display: "6.78 dyuym LTPO AMOLED 120Hz",
    processor: "Snapdragon 8s Gen 3",
    ramStorage: "12 GB RAM / 256 GB",
    mainCamera: "50 MP Sony OIS + 50 MP telefoto + 8 MP",
    frontCamera: "32 MP",
    battery: "5500 mA·soat",
    charging: "120W SUPERVOOC",
    os: "Android 14 (Realme UI 5.0)",
    price: "$549"
  },
  {
    id: "ph-nothing-2a",
    brand: "Nothing",
    model: "Nothing Phone (2a) Plus",
    releaseDate: "2024-yil Iyul",
    imageUrl: "https://images.unsplash.com/photo-1556656793-08538906a9f8?auto=format&fit=crop&w=800&q=80",
    display: "6.7 dyuym Flexible AMOLED 120Hz, Glyph LED",
    processor: "MediaTek Dimensity 7350 Pro",
    ramStorage: "12 GB RAM / 256 GB",
    mainCamera: "50 MP OIS + 50 MP ultra-keng",
    frontCamera: "50 MP",
    battery: "5000 mA·soat",
    charging: "50W simli",
    os: "Android 14 (Nothing OS 2.6)",
    price: "$399"
  }
];

const OPERATORS_UZ: OperatorInfo[] = [
  {
    id: "beeline",
    name: "Beeline Uzbekistan",
    badgeColor: "bg-amber-400 text-slate-950",
    supportPhone: "+998 90 185-00-55",
    shortNumbers: ["0611", "0777"],
    balanceUssd: "*102#",
    internetUssd: "*103#",
    ussdList: [
      { code: "*102#", title: "Asosiy balansni tekshirish" },
      { code: "*103#", title: "Internet trafik qoldig'i" },
      { code: "*105#", title: "Daqiqa va SMS qoldig'i" },
      { code: "*110*05#", title: "Joriy tarif rejasini bilish" },
      { code: "*148#", title: "O'z raqamingizni aniqlash" }
    ],
    tariffs: [
      { name: "Oson 1", price: "35 000 so'm/oy", info: "10 GB internet, 1000 daqiqa, 500 SMS" },
      { name: "Yana Bitta", price: "55 000 so'm/oy", info: "25 GB internet, cheksiz qo'ng'iroqlar" }
    ],
    packages: [
      { name: "Internet 5 GB", size: "5 GB (30 kun)", ussd: "*1*05#" },
      { name: "Internet 15 GB", size: "15 GB (30 kun)", ussd: "*1*15#" }
    ],
    website: "https://beeline.uz"
  },
  {
    id: "ucell",
    name: "Ucell",
    badgeColor: "bg-purple-600 text-white",
    supportPhone: "+998 93 180-00-00",
    shortNumbers: ["8123", "9111"],
    balanceUssd: "*100#",
    internetUssd: "*107#",
    ussdList: [
      { code: "*100#", title: "Balans va tarif holati" },
      { code: "*107#", title: "Internet MB qoldig'ini ko'rish" },
      { code: "*102#", title: "Daqiqa va SMS qoldig'i" },
      { code: "*450#", title: "O'z raqamini aniqlash" }
    ],
    tariffs: [
      { name: "Katta Doimiy 40", price: "40 000 so'm/oy", info: "12 GB internet, 1500 daqiqa, 500 SMS" },
      { name: "Katta Doimiy 65", price: "65 000 so'm/oy", info: "30 GB internet, cheksiz qo'ng'iroqlar" }
    ],
    packages: [
      { name: "Oylik 6 GB", size: "6 GB (30 kun)", ussd: "*555*3*1#" },
      { name: "Oylik 16 GB", size: "16 GB (30 kun)", ussd: "*555*3*3#" }
    ],
    website: "https://ucell.uz"
  },
  {
    id: "uzmobile",
    name: "Uzmobile (Uztelecom)",
    badgeColor: "bg-sky-600 text-white",
    supportPhone: "+998 71 200-09-09",
    shortNumbers: ["1099", "1084"],
    balanceUssd: "*100#",
    internetUssd: "*107#",
    ussdList: [
      { code: "*100#", title: "Balans va joriy tarifni tekshirish" },
      { code: "*107#", title: "Internet trafik qoldig'i" },
      { code: "*100*4#", title: "Abonent raqamini aniqlash" },
      { code: "*111#", title: "Yagona USSD menyu" }
    ],
    tariffs: [
      { name: "Milliy 35", price: "35 000 so'm/oy", info: "10 GB internet, tarmoq ichida cheksiz" },
      { name: "Milliy 50", price: "50 000 so'm/oy", info: "20 GB internet, O'zbekiston bo'ylab cheksiz" }
    ],
    packages: [
      { name: "Internet 5 GB", size: "5 GB (30 kun)", ussd: "*147*10074#" },
      { name: "Internet 12 GB", size: "12 GB (30 kun)", ussd: "*147*10076#" }
    ],
    website: "https://uztelecom.uz"
  },
  {
    id: "mobiuz",
    name: "Mobiuz",
    badgeColor: "bg-red-600 text-white",
    supportPhone: "+998 97 130-09-09",
    shortNumbers: ["0890", "0990"],
    balanceUssd: "*100#",
    internetUssd: "*102#",
    ussdList: [
      { code: "*100#", title: "Hisob holatini tekshirish" },
      { code: "*102#", title: "Internet MB qoldig'ini tekshirish" },
      { code: "*150#", title: "O'z raqamingizni bilish" },
      { code: "*111#", title: "Asosiy USSD menyu" }
    ],
    tariffs: [
      { name: "Mobi 30+", price: "30 000 so'm/oy", info: "8 GB internet, 800 daqiqa, 800 SMS" },
      { name: "Mobi 50", price: "50 000 so'm/oy", info: "20 GB internet, cheksiz qo'ng'iroqlar" }
    ],
    packages: [
      { name: "MobiNet 5 GB", size: "5 GB (30 kun)", ussd: "*171*019*4*0101*1#" },
      { name: "MobiNet 15 GB", size: "15 GB (30 kun)", ussd: "*171*019*6*0101*1#" }
    ],
    website: "https://mobi.uz"
  },
  {
    id: "humans",
    name: "Humans",
    badgeColor: "bg-amber-300 text-slate-950",
    supportPhone: "+998 71 231-08-08",
    shortNumbers: ["1234"],
    balanceUssd: "*100#",
    internetUssd: "*107#",
    ussdList: [
      { code: "*100#", title: "Asosiy balansni tekshirish" },
      { code: "*107#", title: "Internet trafik qoldig'i" },
      { code: "*111#", title: "Humans USSD ma'lumot menyusi" }
    ],
    tariffs: [
      { name: "Konstruktor Bazaviy", price: "30 000 so'm/oy", info: "Moslashuvchan GB va daqiqalar" },
      { name: "Cheksiz Aloqa", price: "60 000 so'm/oy", info: "25 GB internet + cheksiz qo'ng'iroqlar" }
    ],
    packages: [
      { name: "Qo'shimcha 5 GB", size: "5 GB (30 kun)", ussd: "Humans ilovasi" }
    ],
    website: "https://humans.uz"
  }
];

const DIRECTORY_LIST: OrgDirectoryItem[] = [
  {
    id: "org-101",
    name: "Yong'in xavfsizligi xizmati (FVV)",
    category: "Favqulodda xizmatlar",
    phone: "101",
    description: "Yong'in va favqulodda qutqaruv holatlarida 24/7 tezkor yordam.",
    website: "https://gov.uz/fvv",
    address: "O'zbekiston bo'ylab barcha hududlar",
    hours: "24/7 tunu-kun"
  },
  {
    id: "org-102",
    name: "Ichki ishlar organlari",
    category: "Favqulodda xizmatlar",
    phone: "102",
    description: "Jamoat tartibi va xavfsizlik bo'yicha shoshilinch murojaatlar.",
    website: "https://gov.uz/iiv",
    address: "O'zbekiston bo'ylab barcha hududlar",
    hours: "24/7 tunu-kun"
  },
  {
    id: "org-103",
    name: "Tez tibbiy yordam",
    category: "Favqulodda xizmatlar",
    phone: "103",
    description: "Shoshilinch tibbiy yordam brigadasini chaqirish yagona raqami.",
    website: "https://gov.uz/ssv",
    address: "O'zbekiston bo'ylab barcha hududlar",
    hours: "24/7 tunu-kun"
  },
  {
    id: "org-104",
    name: "Gaz avariya xizmati",
    category: "Gaz xizmati",
    phone: "104",
    description: "Tabiiy gaz sizib chiqishi va avariya holatlarida tezkor chaqiruv.",
    website: "https://hududgaz.uz",
    address: "Hududgazta'minot bo'linmalari",
    hours: "24/7 tunu-kun"
  },
  {
    id: "org-1050",
    name: "Qutqaruv xizmati (FVV)",
    category: "Favqulodda xizmatlar",
    phone: "1050",
    description: "Favqulodda vaziyatlarda qutqaruv va texnik yordam xizmati.",
    website: "https://gov.uz/fvv",
    address: "O'zbekiston Respublikasi",
    hours: "24/7 tunu-kun"
  },
  {
    id: "org-nbu",
    name: "O'zmilliybank (NBU)",
    category: "Banklar",
    phone: "+998 78 148-00-10",
    description: "O'zbekiston Milliy banki mijozlarni qo'llab-quvvatlash markazi.",
    website: "https://nbu.uz",
    address: "Toshkent sh., Amir Temur shoh ko'chasi, 101",
    hours: "24/7 (Call-markaz)"
  },
  {
    id: "org-kapital",
    name: "Kapitalbank",
    category: "Banklar",
    phone: "+998 71 200-15-15",
    description: "Tijorat banki, Uzcard/Humo/Visa kartalar va kreditlar xizmati.",
    website: "https://kapitalbank.uz",
    address: "Toshkent sh., Sayilgoh ko'chasi, 7",
    hours: "24/7 (Call-markaz)"
  },
  {
    id: "org-mygov",
    name: "Yagona davlat xizmatlari portali (my.gov.uz)",
    category: "Davlat tashkilotlari",
    phone: "1148",
    description: "Elektron davlat xizmatlari va ma'lumotnomalar bo'yicha yordam markazi.",
    website: "https://my.gov.uz",
    address: "Toshkent sh., Mo'minov ko'chasi, 7/2",
    hours: "Dush–Jum, 09:00 – 18:00"
  },
  {
    id: "org-uztelecom",
    name: "Uztelecom (Uy interneti va IPTV)",
    category: "Internet provayderlar",
    phone: "1084",
    description: "Optik tolali internet, GPON va uy telefoni texnik yordami.",
    website: "https://uztelecom.uz",
    address: "Toshkent sh., Navoiy ko'chasi, 28A",
    hours: "24/7 tunu-kun"
  },
  {
    id: "org-het",
    name: "Hududiy elektr tarmoqlari (HET)",
    category: "Elektr energiyasi",
    phone: "1154",
    description: "Elektr ta'minoti uzilishlari va hisoblagichlar bo'yicha call-markaz.",
    website: "https://het.uz",
    address: "Toshkent sh., Osiyo ko'chasi, 8",
    hours: "24/7 tunu-kun"
  },
  {
    id: "org-suv",
    name: "O'zsuvta'minot (Ichimlik suvi)",
    category: "Suv ta'minoti",
    phone: "1255",
    description: "Ichimlik suvi va kanalizatsiya tarmoqlari bo'yicha murojaatlar markazi.",
    website: "https://uzsuv.uz",
    address: "Toshkent sh., Bog'ishamol ko'chasi, 152",
    hours: "24/7 tunu-kun"
  },
  {
    id: "org-uzair",
    name: "Uzbekistan Airways",
    category: "Aviakompaniyalar",
    phone: "+998 78 140-02-00",
    description: "Milliy aviakompaniya chiptalari va reyslar jadvali ma'lumot markazi.",
    website: "https://uzairways.com",
    address: "Toshkent sh., Amir Temur shoh ko'chasi, 41",
    hours: "24/7 tunu-kun"
  },
  {
    id: "org-railway",
    name: "O'zbekiston Temir Yo'llari",
    category: "Transport",
    phone: "1005",
    description: "Poyezd chiptalari va vokzallar ma'lumotnomasi.",
    website: "https://railway.uz",
    address: "Toshkent sh., Taras Shevchenko ko'chasi, 7",
    hours: "24/7 tunu-kun"
  },
  {
    id: "org-tuit",
    name: "Toshkent Axborot Texnologiyalari Universiteti (TATU)",
    category: "Universitetlar",
    phone: "+998 71 238-64-15",
    description: "Axborot texnologiyalari va telekommunikatsiya yo'nalishidagi yetakchi OTM.",
    website: "https://tuit.uz",
    address: "Toshkent sh., Amir Temur shoh ko'chasi, 108",
    hours: "Dush–Shan, 09:00 – 18:00"
  },
  {
    id: "org-akfa",
    name: "Akfa Medline Tibbiyot Markazi",
    category: "Shifoxona va klinikalar",
    phone: "+998 71 203-30-03",
    description: "Zamonaviy diagnostika va ko'p tarmoqli tibbiyot klinikasi.",
    website: "https://akfamedline.uz",
    address: "Toshkent sh., Kichik halqa yo'li, 5A",
    hours: "24/7 tunu-kun"
  },
  {
    id: "org-uzpost",
    name: "UzPost (O'zbekiston pochtasi)",
    category: "Yetkazib berish",
    phone: "+998 71 233-57-47",
    description: "Respublika bo'ylab pochta jo'natmalari va kuryerlik xizmati.",
    website: "https://uz.post",
    address: "Toshkent sh., Oloy ko'chasi, 1",
    hours: "Dush–Jum, 09:00 – 18:00"
  }
];

const NEWS_ARTICLES: NewsItem[] = [
  {
    id: "nw-1",
    title: "O'zbekistonda sun'iy intellekt va IT ekotizimi yangi bosqichga chiqmoqda",
    category: "O'zbekiston yangiliklari",
    summary: "Mahalliy startaplar va dasturchilar uchun bulutli hisoblash klasterlari hamda ta'lim dasturlari kengaytirilmoqda.",
    date: "12.11.2026",
    source: "IT Park News",
    url: "https://it-park.uz",
    imageUrl: "https://images.unsplash.com/photo-1519389950473-47ba0277781c?auto=format&fit=crop&w=800&q=80"
  },
  {
    id: "nw-2",
    title: "Yangi avlod 2 nanometrli protsessorlar noutbuk batareyasini 35% ga uzaytiradi",
    category: "Texnologiya",
    summary: "Yarimo'tkazgich ishlab chiqaruvchilar 2nm texnologiyasi orqali energiya samaradorligini rekord darajaga olib chiqdi.",
    date: "12.11.2026",
    source: "Tech Review",
    url: "https://www.theverge.com",
    imageUrl: "https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=800&q=80"
  },
  {
    id: "nw-3",
    title: "Multimodal AI tizimlari dasturlash va ilmiy tadqiqotlarni tezlashtirmoqda",
    category: "AI yangiliklari",
    summary: "Zamonaviy sun'iy intellekt yordamchilari murakkab arxitektura va katta hajmli hujjatlarni soniyalar ichida tahlil qilmoqda.",
    date: "11.11.2026",
    source: "Google AI Blog",
    url: "https://blog.google/technology/ai/",
    imageUrl: "https://images.unsplash.com/photo-1677442136019-21780ecad995?auto=format&fit=crop&w=800&q=80"
  },
  {
    id: "nw-4",
    title: "Silikon-uglerod batareyali smartfonlar 6000 mA·soat sig'im bilan taqdim etilmoqda",
    category: "Smartfonlar",
    summary: "Yangi avlod akkumulyatorlar yupqa korpusni saqlagan holda ikki kungacha avtonom ishlash imkonini beradi.",
    date: "10.11.2026",
    source: "GSMArena",
    url: "https://www.gsmarena.com",
    imageUrl: "https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?auto=format&fit=crop&w=800&q=80"
  },
  {
    id: "nw-5",
    title: "OLED displeyli noutbuklar 2026-yilda o'rta narx toifasida ham ommalashdi",
    category: "Kompyuterlar",
    summary: "Yuqori kontrast va 120Hz chastotali OLED ekranlar endi ko'pchilik ultrabuklarda asosiy standartga aylandi.",
    date: "09.11.2026",
    source: "NotebookCheck",
    url: "https://www.notebookcheck.net",
    imageUrl: "https://images.unsplash.com/photo-1496181133206-80ce9b88a853?auto=format&fit=crop&w=800&q=80"
  },
  {
    id: "nw-6",
    title: "Koinot teleskoplari uzoq ekzosayyoralar atmosferasini o'rganishda yangi natijalarga erishdi",
    category: "Koinot",
    summary: "Astronomlar spektral tahlil yordamida yorug'lik yillari uzoqlikdagi sayyoralar tarkibini aniqladi.",
    date: "08.11.2026",
    source: "NASA Science",
    url: "https://www.nasa.gov",
    imageUrl: "https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&w=800&q=80"
  }
];

const AI_TOOLS_LIST: AiToolEntry[] = [
  {
    id: "tool-gemini",
    name: "Google Gemini",
    category: "Matn va Yordamchi",
    description: "Matn, kod, rasm va hujjatlarni tahlil qiluvchi ko'p funksiyali sun'iy intellekt.",
    pricing: "Bepul / Pro",
    url: "https://gemini.google.com"
  },
  {
    id: "tool-chatgpt",
    name: "ChatGPT (OpenAI)",
    category: "Matn va Yordamchi",
    description: "Savol-javob, maqola yozish, tarjima va mantiqiy tahlil uchun mashhur AI chat.",
    pricing: "Bepul / Plus",
    url: "https://chatgpt.com"
  },
  {
    id: "tool-claude",
    name: "Claude (Anthropic)",
    category: "Dasturlash va Tahlil",
    description: "Katta hajmdagi hujjatlar va dasturiy arxitektura bilan ishlashga ixtisoslashgan.",
    pricing: "Bepul / Pro",
    url: "https://claude.ai"
  },
  {
    id: "tool-midjourney",
    name: "Midjourney",
    category: "Rasm va Dizayn",
    description: "Matnli tavsif asosida yuqori badiiy sifatdagi illyustratsiya va dizaynlar yaratish.",
    pricing: "Pullik obuna",
    url: "https://www.midjourney.com"
  },
  {
    id: "tool-perplexity",
    name: "Perplexity AI",
    category: "Qidiruv va Tadqiqot",
    description: "Internetdagi manbalarga asoslangan aniq va havolali javoblar beruvchi AI qidiruv.",
    pricing: "Bepul / Pro",
    url: "https://www.perplexity.ai"
  },
  {
    id: "tool-copilot",
    name: "GitHub Copilot",
    category: "Dasturlash va Tahlil",
    description: "Kod yozish jarayonida real vaqtda funksiyalar va testlarni taklif qiluvchi yordamchi.",
    pricing: "Bepul / Pro",
    url: "https://github.com/features/copilot"
  }
];

// ============================================================================
// MAIN APPLICATION COMPONENT
// ============================================================================
export default function App() {
  // Navigation & Theme
  const [activeSection, setActiveSection] = useState<SectionKey>(() =>
    readStorage<SectionKey>("vermix_v2_section", "home")
  );
  const [darkMode, setDarkMode] = useState<boolean>(() =>
    readStorage<boolean>("vermix_v2_dark", false)
  );
  const [drawerOpen, setDrawerOpen] = useState<boolean>(false);
  const [toast, setToast] = useState<string | null>(null);

  // Authentication State (Google + Phone Number +998 OTP)
  const [auth, setAuth] = useState<UserAuth>(() =>
    readStorage<UserAuth>("vermix_v2_auth", {
      isAuthenticated: false,
      provider: "guest",
      name: "Mehmon Foydalanuvchi",
      identifier: "Hisobga kirilmagan",
      avatarLetter: "V"
    })
  );
  const [authModalOpen, setAuthModalOpen] = useState<boolean>(false);
  const [authTab, setAuthTab] = useState<"google" | "phone">("google");
  const [googleEmailInput, setGoogleEmailInput] = useState<string>("");
  const [googleNameInput, setGoogleNameInput] = useState<string>("");
  const [phoneInput, setPhoneInput] = useState<string>("+998 ");
  const [otpSent, setOtpSent] = useState<boolean>(false);
  const [otpInput, setOtpInput] = useState<string>("");
  const [demoOtpCode, setDemoOtpCode] = useState<string>("4829");
  const [authError, setAuthError] = useState<string>("");

  // Global Search & Recent History
  const [globalSearch, setGlobalSearch] = useState<string>("");
  const [searchHistory, setSearchHistory] = useState<string[]>(() =>
    readStorage<string[]>("vermix_v2_search_hist", ["MacBook Pro", "Beeline *102#", "iPhone 16 Pro Max"])
  );

  // Live Clock & Weather
  const [currentTime, setCurrentTime] = useState<Date>(() => new Date());
  const [city, setCity] = useState<"Samarqand" | "Toshkent" | "Buxoro" | "Farg'ona">(() =>
    readStorage("vermix_v2_city", "Samarqand")
  );

  // Bookmarks
  const [bookmarks, setBookmarks] = useState<SavedBookmark[]>(() =>
    readStorage<SavedBookmark[]>("vermix_v2_bookmarks", [
      {
        id: "lap-apple-m4",
        type: "Kompyuter",
        title: "MacBook Pro 14 (M4 Pro)",
        subtitle: "Apple • $1,999 – $2,299",
        section: "computers"
      }
    ])
  );

  // Pinterest State
  const [pins, setPins] = useState<PinCard[]>(() => readStorage<PinCard[]>("vermix_v2_pins", INITIAL_PINS));
  const [pinCat, setPinCat] = useState<string>("Barchasi");
  const [pinSearch, setPinSearch] = useState<string>("");
  const [likedPins, setLikedPins] = useState<string[]>(() => readStorage<string[]>("vermix_v2_liked_pins", ["pin-2"]));
  const [boards, setBoards] = useState<string[]>(() =>
    readStorage<string[]>("vermix_v2_boards", ["Ish stoli g'oyalari", "O'zbekiston sayohati", "Dizayn ilhomlari"])
  );
  const [newBoardTitle, setNewBoardTitle] = useState<string>("");

  // Music State + Custom Track Upload / URL Modal
  const [tracks, setTracks] = useState<TrackItem[]>(() =>
    readStorage<TrackItem[]>("vermix_v2_tracks", DEFAULT_TRACKS)
  );
  const [currentTrack, setCurrentTrack] = useState<TrackItem>(DEFAULT_TRACKS[0]);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [progressSec, setProgressSec] = useState<number>(0);
  const [volume, setVolume] = useState<number>(0.75);
  const [muted, setMuted] = useState<boolean>(false);
  const [musicSearch, setMusicSearch] = useState<string>("");
  const [musicFilter, setMusicFilter] = useState<string>("Barchasi");
  const [favTracks, setFavTracks] = useState<string[]>(() => readStorage<string[]>("vermix_v2_fav_tracks", ["trk-1"]));
  const [addMusicOpen, setAddMusicOpen] = useState<boolean>(false);
  const [customTrackTitle, setCustomTrackTitle] = useState<string>("");
  const [customTrackArtist, setCustomTrackArtist] = useState<string>("");
  const [customTrackUrl, setCustomTrackUrl] = useState<string>("");
  const [customTrackCover, setCustomTrackCover] = useState<string>("");
  const [customFileError, setCustomFileError] = useState<string>("");

  const htmlAudioRef = useRef<HTMLAudioElement | null>(null);
  const audioCtxRef = useRef<AudioContext | null>(null);

  // Videos State
  const [videos, setVideos] = useState<SocialVideoItem[]>(() =>
    readStorage<SocialVideoItem[]>("vermix_v2_videos", INITIAL_VIDEOS)
  );
  const [videoInputUrl, setVideoInputUrl] = useState<string>("");
  const [activeVideo, setActiveVideo] = useState<SocialVideoItem>(INITIAL_VIDEOS[0]);
  const [videoErr, setVideoErr] = useState<string>("");

  // Computers & Smartphones State
  const [compBrand, setCompBrand] = useState<string>("Barchasi");
  const [compSearch, setCompSearch] = useState<string>("");
  const [detailLaptop, setDetailLaptop] = useState<LaptopSpec | null>(null);
  const [compareLaptopIds, setCompareLaptopIds] = useState<string[]>(["lap-apple-m4", "lap-asus-rog"]);
  const [showLaptopCompare, setShowLaptopCompare] = useState<boolean>(false);

  const [phoneBrand, setPhoneBrand] = useState<string>("Barchasi");
  const [phoneSearch, setPhoneSearch] = useState<string>("");
  const [detailPhone, setDetailPhone] = useState<PhoneSpec | null>(null);
  const [comparePhoneIds, setComparePhoneIds] = useState<string[]>(["ph-iphone16pm", "ph-s24u"]);
  const [showPhoneCompare, setShowPhoneCompare] = useState<boolean>(false);

  // AI Assistant State
  const [threads, setThreads] = useState<AiThread[]>(() =>
    readStorage<AiThread[]>("vermix_v2_ai_threads", [
      {
        id: "th-1",
        title: "Yangi suhbat",
        messages: [
          {
            id: "m-1",
            role: "assistant",
            text: "Assalomu alaykum! Men VerMix AI yordamchisiman. Savol bering, matn tarjima qiling, kod yozing yoki murakkab mavzularni birga tahlil qilaylik.",
            time: "Hozir"
          }
        ]
      }
    ])
  );
  const [activeThreadId, setActiveThreadId] = useState<string>("th-1");
  const [aiPrompt, setAiPrompt] = useState<string>("");
  const [aiBusy, setAiBusy] = useState<boolean>(false);

  // Calendar State
  const todayIso = useMemo(() => {
    const d = new Date();
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
  }, []);

  const [calEvents, setCalEvents] = useState<CalendarItem[]>(() =>
    readStorage<CalendarItem[]>("vermix_v2_calendar", [
      {
        id: "cal-1",
        title: "VerMix platformasini Railway'ga joylash",
        date: todayIso,
        time: "15:00",
        category: "Muhim sana",
        color: "bg-blue-600",
        notes: "Google va Telefon raqam autentifikatsiyasini tekshirish"
      }
    ])
  );
  const [calView, setCalView] = useState<"month" | "week" | "day">("month");
  const [selectedDate, setSelectedDate] = useState<string>(todayIso);
  const [monthCursor, setMonthCursor] = useState<Date>(() => new Date());
  const [editEventId, setEditEventId] = useState<string | null>(null);
  const [evTitle, setEvTitle] = useState<string>("");
  const [evTime, setEvTime] = useState<string>("10:00");
  const [evCategory, setEvCategory] = useState<CalendarItem["category"]>("Tadbir");
  const [evColor, setEvColor] = useState<string>("bg-blue-600");
  const [evNotes, setEvNotes] = useState<string>("");

  // Operators & Directory State
  const [selectedOpId, setSelectedOpId] = useState<string>("beeline");
  const [dirCat, setDirCat] = useState<string>("Barchasi");
  const [dirQuery, setDirQuery] = useState<string>("");

  // News & AI Tools State
  const [newsCat, setNewsCat] = useState<string>("Barchasi");
  const [aiToolCat, setAiToolCat] = useState<string>("Barchasi");
  const [aiToolQuery, setAiToolQuery] = useState<string>("");

  // Productivity Tools State
  const [toolTab, setToolTab] = useState<string>("calc");
  const [calcExpr, setCalcExpr] = useState<string>("0");
  const [currVal, setCurrVal] = useState<string>("100");
  const [currFrom, setCurrFrom] = useState<string>("USD");
  const [currTo, setCurrTo] = useState<string>("UZS");
  const [unitKind, setUnitKind] = useState<"length" | "weight" | "temp">("length");
  const [unitNum, setUnitNum] = useState<string>("10");
  const [unitFrom, setUnitFrom] = useState<string>("km");
  const [unitTo, setUnitTo] = useState<string>("m");
  const [swTime, setSwTime] = useState<number>(0);
  const [swActive, setSwActive] = useState<boolean>(false);
  const [timerLeft, setTimerLeft] = useState<number>(300);
  const [timerActive, setTimerActive] = useState<boolean>(false);
  const [quickNotes, setQuickNotes] = useState<string>(() =>
    readStorage<string>("vermix_v2_notes", "VerMix tezkor eslatmalar:\n- Yangi g'oyalarni yozib borish")
  );
  const [todoList, setTodoList] = useState<{ id: string; text: string; done: boolean }[]>(() =>
    readStorage("vermix_v2_todos", [
      { id: "t-1", text: "Kompyuterlar va smartfonlarni taqqoslash", done: true },
      { id: "t-2", text: "Shaxsiy musiqa pleylistini yaratish", done: false }
    ])
  );
  const [todoInput, setTodoInput] = useState<string>("");
  const [qrValue, setQrValue] = useState<string>("https://t.me/roz1matoff_me");
  const [passLength, setPassLength] = useState<number>(16);
  const [passWithSymbols, setPassWithSymbols] = useState<boolean>(true);
  const [passOutput, setPassOutput] = useState<string>("VerMix@2026#Pro99");
  const [wordText, setWordText] = useState<string>(
    "VerMix — barcha kundalik raqamli xizmatlarni birlashtiruvchi zamonaviy ekotizim."
  );

  // Contact Form State (@roz1matoff_me)
  const [contactName, setContactName] = useState<string>("");
  const [contactMsg, setContactMsg] = useState<string>("");

  // ============================================================================
  // TOAST & CLIPBOARD HELPERS
  // ============================================================================
  const notify = (message: string) => {
    setToast(message);
    window.setTimeout(() => {
      setToast((prev) => (prev === message ? null : prev));
    }, 2800);
  };

  const copyText = (value: string, label?: string) => {
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(value).catch(() => {});
    }
    notify(label ? `${label}: ${value} nusxalandi` : `${value} nusxalandi`);
  };

  // ============================================================================
  // PERSISTENCE & TIMERS EFFECTS
  // ============================================================================
  useEffect(() => {
    writeStorage("vermix_v2_section", activeSection);
  }, [activeSection]);

  useEffect(() => {
    writeStorage("vermix_v2_dark", darkMode);
  }, [darkMode]);

  useEffect(() => {
    writeStorage("vermix_v2_auth", auth);
  }, [auth]);

  useEffect(() => {
    writeStorage("vermix_v2_bookmarks", bookmarks);
  }, [bookmarks]);

  useEffect(() => {
    writeStorage("vermix_v2_pins", pins);
    writeStorage("vermix_v2_liked_pins", likedPins);
    writeStorage("vermix_v2_boards", boards);
  }, [pins, likedPins, boards]);

  useEffect(() => {
    // Only persist tracks that do not rely on ephemeral blob: URLs
    const serializable = tracks.filter((t) => !t.audioUrl || !t.audioUrl.startsWith("blob:"));
    writeStorage("vermix_v2_tracks", serializable);
    writeStorage("vermix_v2_fav_tracks", favTracks);
  }, [tracks, favTracks]);

  useEffect(() => {
    writeStorage("vermix_v2_videos", videos);
    writeStorage("vermix_v2_ai_threads", threads);
    writeStorage("vermix_v2_calendar", calEvents);
    writeStorage("vermix_v2_notes", quickNotes);
    writeStorage("vermix_v2_todos", todoList);
    writeStorage("vermix_v2_city", city);
  }, [videos, threads, calEvents, quickNotes, todoList, city]);

  useEffect(() => {
    const id = window.setInterval(() => setCurrentTime(new Date()), 1000);
    return () => window.clearInterval(id);
  }, []);

  useEffect(() => {
    if (!swActive) return;
    const id = window.setInterval(() => setSwTime((t) => t + 100), 100);
    return () => window.clearInterval(id);
  }, [swActive]);

  useEffect(() => {
    if (!timerActive) return;
    const id = window.setInterval(() => {
      setTimerLeft((prev) => {
        if (prev <= 1) {
          setTimerActive(false);
          notify("Taymer vaqti tugadi!");
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => window.clearInterval(id);
  }, [timerActive]);

  // ============================================================================
  // HYBRID MUSIC ENGINE (REAL HTML5 AUDIO FOR USER TRACKS + SYNTH FALLBACK)
  // ============================================================================
  useEffect(() => {
    const audioEl = htmlAudioRef.current;
    if (audioEl) {
      audioEl.volume = muted ? 0 : volume;
    }
  }, [volume, muted]);

  useEffect(() => {
    const audioEl = htmlAudioRef.current;

    if (currentTrack.audioUrl && audioEl) {
      if (audioEl.src !== currentTrack.audioUrl) {
        audioEl.src = currentTrack.audioUrl;
      }
      if (isPlaying) {
        audioEl.play().catch(() => {
          setIsPlaying(false);
          notify("Audio faylni ijro etish uchun pleyer tugmasini bosing");
        });
      } else {
        audioEl.pause();
      }
      return;
    }

    if (audioEl) {
      audioEl.pause();
    }

    if (!isPlaying) return;

    const tick = window.setInterval(() => {
      setProgressSec((p) => {
        if (p + 1 >= currentTrack.durationSec) {
          playNextTrack();
          return 0;
        }
        return p + 1;
      });
    }, 1000);

    const playAmbientNote = () => {
      try {
        const Ctx =
          window.AudioContext ||
          (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
        if (!Ctx) return;
        if (!audioCtxRef.current) audioCtxRef.current = new Ctx();
        const ctx = audioCtxRef.current;
        if (ctx.state === "suspended") ctx.resume().catch(() => {});
        const gainVal = muted ? 0 : volume * 0.07;
        if (gainVal <= 0) return;

        const ratios = [1, 1.25, 1.5, 1.875];
        const freq = currentTrack.baseFreq * ratios[Math.floor(Math.random() * ratios.length)];
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = "sine";
        osc.frequency.setValueAtTime(freq, ctx.currentTime);
        gain.gain.setValueAtTime(0.0001, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(gainVal, ctx.currentTime + 0.15);
        gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 1.1);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start();
        osc.stop(ctx.currentTime + 1.15);
      } catch {
        // Ignore browser autoplay restrictions
      }
    };

    playAmbientNote();
    const synthTimer = window.setInterval(playAmbientNote, 1300);

    return () => {
      window.clearInterval(tick);
      window.clearInterval(synthTimer);
    };
  }, [isPlaying, currentTrack, volume, muted]);

  const selectTrack = (track: TrackItem) => {
    setCurrentTrack(track);
    setProgressSec(0);
    setIsPlaying(true);
  };

  const playNextTrack = () => {
    const idx = tracks.findIndex((t) => t.id === currentTrack.id);
    const next = tracks[(idx + 1) % tracks.length];
    selectTrack(next);
  };

  const playPrevTrack = () => {
    const idx = tracks.findIndex((t) => t.id === currentTrack.id);
    const prev = tracks[(idx - 1 + tracks.length) % tracks.length];
    selectTrack(prev);
  };

  const formatSec = (sec: number) => {
    const safe = Math.max(0, Math.floor(sec));
    const m = Math.floor(safe / 60);
    const s = safe % 60;
    return `${m}:${String(s).padStart(2, "0")}`;
  };

  // ============================================================================
  // CUSTOM MUSIC UPLOAD HANDLERS
  // ============================================================================
  const handleLocalAudioFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setCustomFileError("");
    const blobUrl = URL.createObjectURL(file);
    const cleanName = file.name.replace(/\.[^/.]+$/, "");
    const newTrack: TrackItem = {
      id: `custom-${Date.now()}`,
      title: customTrackTitle.trim() || cleanName,
      artist: customTrackArtist.trim() || auth.name || "Mening musiqam",
      album: "Shaxsiy yuklama",
      category: "Mening musiqalarim",
      durationSec: 180,
      coverUrl:
        customTrackCover.trim() ||
        "https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?auto=format&fit=crop&w=400&q=80",
      audioUrl: blobUrl,
      baseFreq: 261.63,
      isCustom: true
    };
    setTracks((prev) => [newTrack, ...prev]);
    selectTrack(newTrack);
    setAddMusicOpen(false);
    setCustomTrackTitle("");
    setCustomTrackArtist("");
    setCustomTrackUrl("");
    setCustomTrackCover("");
    notify(`"${newTrack.title}" pleylistga qo'shildi va ijro etilmoqda`);
    e.target.value = "";
  };

  const handleAddCustomAudioUrl = (e: React.FormEvent) => {
    e.preventDefault();
    setCustomFileError("");
    if (!customTrackTitle.trim() || !customTrackUrl.trim()) {
      setCustomFileError("Qo'shiq nomi va to'g'ridan-to'g'ri audio havolani (MP3/WAV) kiriting.");
      return;
    }
    const newTrack: TrackItem = {
      id: `custom-${Date.now()}`,
      title: customTrackTitle.trim(),
      artist: customTrackArtist.trim() || "Shaxsiy ijrochi",
      album: "Onlayn audio",
      category: "Mening musiqalarim",
      durationSec: 200,
      coverUrl:
        customTrackCover.trim() ||
        "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?auto=format&fit=crop&w=400&q=80",
      audioUrl: customTrackUrl.trim(),
      baseFreq: 293.66,
      isCustom: true
    };
    setTracks((prev) => [newTrack, ...prev]);
    selectTrack(newTrack);
    setAddMusicOpen(false);
    setCustomTrackTitle("");
    setCustomTrackArtist("");
    setCustomTrackUrl("");
    setCustomTrackCover("");
    notify("Yangi musiqa muvaffaqiyatli qo'shildi!");
  };

  // ============================================================================
  // GOOGLE & +998 PHONE AUTHENTICATION HANDLERS
  // ============================================================================
  const handleGoogleAuth = (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError("");
    const email = googleEmailInput.trim();
    if (!email || !email.includes("@")) {
      setAuthError("Iltimos, to'g'ri Google Gmail manzilini kiriting.");
      return;
    }
    const displayName = googleNameInput.trim() || email.split("@")[0];
    setAuth({
      isAuthenticated: true,
      provider: "google",
      name: displayName,
      identifier: email,
      avatarLetter: displayName.charAt(0).toUpperCase()
    });
    setAuthModalOpen(false);
    setGoogleEmailInput("");
    setGoogleNameInput("");
    notify(`Google orqali muvaffaqiyatli kirdingiz: ${displayName}`);
  };

  const handleSendOtp = (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError("");
    const digits = phoneInput.replace(/\D/g, "");
    if (digits.length < 9) {
      setAuthError("Telefon raqamni to'liq kiriting (masalan: +998 90 123 45 67).");
      return;
    }
    const code = String(Math.floor(1000 + Math.random() * 9000));
    setDemoOtpCode(code);
    setOtpSent(true);
    notify(`SMS tasdiqlash kodi yuborildi (Demo kod: ${code})`);
  };

  const handleVerifyOtp = (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError("");
    if (otpInput.trim() !== demoOtpCode && otpInput.trim() !== "1234") {
      setAuthError(`Noto'g'ri kod. Yuborilgan kodni kiriting (${demoOtpCode}).`);
      return;
    }
    const formattedPhone = phoneInput.trim();
    setAuth({
      isAuthenticated: true,
      provider: "phone",
      name: "VerMix Abonenti",
      identifier: formattedPhone,
      avatarLetter: "U"
    });
    setAuthModalOpen(false);
    setOtpSent(false);
    setOtpInput("");
    notify(`Telefon raqam tasdiqlandi: ${formattedPhone}`);
  };

  // ============================================================================
  // BOOKMARK HELPER
  // ============================================================================
  const isSaved = (id: string) => bookmarks.some((b) => b.id === id);

  const toggleSaveBookmark = (item: SavedBookmark) => {
    setBookmarks((prev) => {
      if (prev.some((b) => b.id === item.id)) {
        notify("Saqlanganlardan olib tashlandi");
        return prev.filter((b) => b.id !== item.id);
      }
      notify("Saqlanganlarga qo'shildi");
      return [item, ...prev];
    });
  };

  // ============================================================================
  // SOCIAL VIDEO URL PARSER
  // ============================================================================
  const handleAddSocialVideo = (e: React.FormEvent) => {
    e.preventDefault();
    setVideoErr("");
    const url = videoInputUrl.trim();
    if (!url) return;

    const yt = url.match(/(?:youtube\.com\/(?:watch\?v=|shorts\/|embed\/)|youtu\.be\/)([a-zA-Z0-9_-]{6,15})/);
    if (yt && yt[1]) {
      const entry: SocialVideoItem = {
        id: `vid-${Date.now()}`,
        platform: "YouTube",
        title: `YouTube Video (${yt[1]})`,
        author: "YouTube Rasmiy Pleyer",
        originalUrl: url,
        embedUrl: `https://www.youtube.com/embed/${yt[1]}`,
        addedAt: "Hozirgina"
      };
      setVideos((prev) => [entry, ...prev]);
      setActiveVideo(entry);
      setVideoInputUrl("");
      notify("YouTube videosi ochildi");
      return;
    }

    const ig = url.match(/instagram\.com\/(?:p|reel|reels)\/([a-zA-Z0-9_-]+)/);
    if (ig && ig[1]) {
      const entry: SocialVideoItem = {
        id: `vid-${Date.now()}`,
        platform: "Instagram",
        title: `Instagram Reel / Post (${ig[1]})`,
        author: "Instagram Rasmiy Embed",
        originalUrl: url,
        embedUrl: `https://www.instagram.com/p/${ig[1]}/embed/`,
        addedAt: "Hozirgina"
      };
      setVideos((prev) => [entry, ...prev]);
      setActiveVideo(entry);
      setVideoInputUrl("");
      notify("Instagram videosi ochildi");
      return;
    }

    const tt = url.match(/tiktok\.com\/.*\/video\/(\d+)/);
    if (tt && tt[1]) {
      const entry: SocialVideoItem = {
        id: `vid-${Date.now()}`,
        platform: "TikTok",
        title: `TikTok Video (${tt[1]})`,
        author: "TikTok Rasmiy Pleyer",
        originalUrl: url,
        embedUrl: `https://www.tiktok.com/embed/v2/${tt[1]}`,
        addedAt: "Hozirgina"
      };
      setVideos((prev) => [entry, ...prev]);
      setActiveVideo(entry);
      setVideoInputUrl("");
      notify("TikTok videosi ochildi");
      return;
    }

    setVideoErr("To'g'ri YouTube, Instagram (Reels/Post) yoki TikTok ochiq havolasini kiriting.");
  };

  // ============================================================================
  // AI ASSISTANT HANDLER
  // ============================================================================
  const currentThread = useMemo(
    () => threads.find((t) => t.id === activeThreadId) || threads[0],
    [threads, activeThreadId]
  );

  const sendAiMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!aiPrompt.trim() || aiBusy) return;
    const promptText = aiPrompt.trim();
    const nowLabel = new Date().toLocaleTimeString("uz-UZ", { hour: "2-digit", minute: "2-digit" });
    const targetId = currentThread.id;

    setThreads((prev) =>
      prev.map((th) =>
        th.id === targetId
          ? {
              ...th,
              title: th.messages.length <= 1 ? promptText.slice(0, 30) : th.title,
              messages: [
                ...th.messages,
                { id: `u-${Date.now()}`, role: "user", text: promptText, time: nowLabel }
              ]
            }
          : th
      )
    );
    setAiPrompt("");
    setAiBusy(true);

    try {
      const apiKey = "";
      const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-3-flash-preview:generateContent?key=${apiKey}`;
      const res = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [
            {
              parts: [
                {
                  text: `Siz VerMix platformasining o'zbek tilidagi aqlli AI yordamchisisiz. Aniq, tushunarli va foydali javob bering.\n\nSavol: ${promptText}`
                }
              ]
            }
          ]
        })
      });
      if (!res.ok) throw new Error("API error");
      const json = await res.json();
      const reply =
        json?.candidates?.[0]?.content?.parts?.[0]?.text ||
        `"${promptText}" bo'yicha VerMix AI tahlili tayyor. Batafsil ma'lumot uchun savolni aniqlashtirishingiz mumkin.`;
      setThreads((prev) =>
        prev.map((th) =>
          th.id === targetId
            ? {
                ...th,
                messages: [
                  ...th.messages,
                  { id: `b-${Date.now()}`, role: "assistant", text: reply, time: nowLabel }
                ]
              }
            : th
        )
      );
    } catch {
      const fallbackReply = `VerMix AI Javobi:\n\nSizning "${promptText}" so'rovingiz qabul qilindi. Platformadagi Kompyuterlar, Smartfonlar, Mobil Operatorlar USSD kodlari yoki Foydali Vositalar bo'limlaridan ham tezkor ma'lumot olishingiz mumkin.`;
      setThreads((prev) =>
        prev.map((th) =>
          th.id === targetId
            ? {
                ...th,
                messages: [
                  ...th.messages,
                  { id: `b-${Date.now()}`, role: "assistant", text: fallbackReply, time: nowLabel }
                ]
              }
            : th
        )
      );
    } finally {
      setAiBusy(false);
    }
  };

  // ============================================================================
  // GLOBAL SEARCH RESULTS
  // ============================================================================
  const globalMatches = useMemo(() => {
    const q = globalSearch.trim().toLowerCase();
    if (!q) return [];
    const list: { title: string; subtitle: string; badge: string; section: SectionKey }[] = [];

    COMPUTERS_CATALOG.forEach((c) => {
      if (`${c.brand} ${c.model} ${c.cpu}`.toLowerCase().includes(q)) {
        list.push({ title: c.model, subtitle: `${c.brand} • ${c.priceRange}`, badge: "Kompyuter", section: "computers" });
      }
    });
    SMARTPHONES_CATALOG.forEach((p) => {
      if (`${p.brand} ${p.model} ${p.processor}`.toLowerCase().includes(q)) {
        list.push({ title: p.model, subtitle: `${p.brand} • ${p.price}`, badge: "Smartfon", section: "smartphones" });
      }
    });
    OPERATORS_UZ.forEach((op) => {
      if (op.name.toLowerCase().includes(q) || op.ussdList.some((u) => u.code.includes(q))) {
        list.push({ title: op.name, subtitle: `Balans: ${op.balanceUssd}`, badge: "Operator", section: "operators" });
      }
    });
    DIRECTORY_LIST.forEach((d) => {
      if (`${d.name} ${d.phone} ${d.category}`.toLowerCase().includes(q)) {
        list.push({ title: d.name, subtitle: d.phone, badge: "Ma'lumotnoma", section: "directory" });
      }
    });
    tracks.forEach((t) => {
      if (`${t.title} ${t.artist}`.toLowerCase().includes(q)) {
        list.push({ title: t.title, subtitle: t.artist, badge: "Musiqa", section: "music" });
      }
    });

    return list.slice(0, 8);
  }, [globalSearch, tracks]);

  // ============================================================================
  // PRODUCTIVITY CALCULATORS
  // ============================================================================
  const pressCalc = (key: string) => {
    if (key === "C") {
      setCalcExpr("0");
      return;
    }
    if (key === "DEL") {
      setCalcExpr((prev) => (prev.length > 1 ? prev.slice(0, -1) : "0"));
      return;
    }
    if (key === "sin") {
      const n = parseFloat(calcExpr) || 0;
      setCalcExpr(String(Number(Math.sin((n * Math.PI) / 180).toFixed(6))));
      return;
    }
    if (key === "cos") {
      const n = parseFloat(calcExpr) || 0;
      setCalcExpr(String(Number(Math.cos((n * Math.PI) / 180).toFixed(6))));
      return;
    }
    if (key === "sqrt") {
      const n = parseFloat(calcExpr) || 0;
      setCalcExpr(n >= 0 ? String(Number(Math.sqrt(n).toFixed(6))) : "Xato");
      return;
    }
    if (key === "=") {
      try {
        const clean = calcExpr.replace(/[^0-9+\-*/.()]/g, "");
        if (!clean) return;
        const val = Function(`"use strict"; return (${clean})`)();
        setCalcExpr(Number.isFinite(val) ? String(Number(val.toFixed(6))) : "Xato");
      } catch {
        setCalcExpr("Xato");
      }
      return;
    }
    setCalcExpr((prev) => (prev === "0" || prev === "Xato" ? key : prev + key));
  };

  const ratesToUzs: Record<string, number> = {
    UZS: 1,
    USD: 12850,
    EUR: 13920,
    RUB: 134,
    GBP: 16350
  };

  const convertedCurr = useMemo(() => {
    const num = parseFloat(currVal) || 0;
    const uzs = num * (ratesToUzs[currFrom] || 1);
    return (uzs / (ratesToUzs[currTo] || 1)).toLocaleString("en-US", { maximumFractionDigits: 2 });
  }, [currVal, currFrom, currTo]);

  const convertedUnitVal = useMemo(() => {
    const v = parseFloat(unitNum) || 0;
    if (unitKind === "length") {
      const mMap: Record<string, number> = { m: 1, km: 1000, cm: 0.01, mile: 1609.34 };
      return ((v * (mMap[unitFrom] || 1)) / (mMap[unitTo] || 1)).toFixed(4);
    }
    if (unitKind === "weight") {
      const kgMap: Record<string, number> = { kg: 1, g: 0.001, ton: 1000, lb: 0.453592 };
      return ((v * (kgMap[unitFrom] || 1)) / (kgMap[unitTo] || 1)).toFixed(4);
    }
    let c = v;
    if (unitFrom === "F") c = ((v - 32) * 5) / 9;
    if (unitFrom === "K") c = v - 273.15;
    if (unitTo === "F") return ((c * 9) / 5 + 32).toFixed(2);
    if (unitTo === "K") return (c + 273.15).toFixed(2);
    return c.toFixed(2);
  }, [unitKind, unitNum, unitFrom, unitTo]);

  // ============================================================================
  // CALENDAR GRID DAYS
  // ============================================================================
  const monthGridCells = useMemo(() => {
    const y = monthCursor.getFullYear();
    const m = monthCursor.getMonth();
    const first = new Date(y, m, 1).getDay();
    const offset = first === 0 ? 6 : first - 1;
    const totalDays = new Date(y, m + 1, 0).getDate();
    const arr: (string | null)[] = [];
    for (let i = 0; i < offset; i++) arr.push(null);
    for (let d = 1; d <= totalDays; d++) {
      arr.push(`${y}-${String(m + 1).padStart(2, "0")}-${String(d).padStart(2, "0")}`);
    }
    return arr;
  }, [monthCursor]);

  const handleSaveCalEvent = (e: React.FormEvent) => {
    e.preventDefault();
    if (!evTitle.trim()) return;
    if (editEventId) {
      setCalEvents((prev) =>
        prev.map((item) =>
          item.id === editEventId
            ? { ...item, title: evTitle.trim(), date: selectedDate, time: evTime, category: evCategory, color: evColor, notes: evNotes }
            : item
        )
      );
      setEditEventId(null);
      notify("Tadbir yangilandi");
    } else {
      setCalEvents((prev) => [
        {
          id: `cal-${Date.now()}`,
          title: evTitle.trim(),
          date: selectedDate,
          time: evTime,
          category: evCategory,
          color: evColor,
          notes: evNotes
        },
        ...prev
      ]);
      notify("Yangi tadbir qo'shildi");
    }
    setEvTitle("");
    setEvNotes("");
  };

  // ============================================================================
  // THEME STYLES (PURE WHITE #FFFFFF DEFAULT)
  // ============================================================================
  const pageBg = darkMode ? "bg-slate-950 text-slate-100" : "bg-[#FFFFFF] text-slate-900";
  const sidebarBg = darkMode ? "bg-slate-900 border-slate-800" : "bg-[#F8FAFC] border-slate-200/80";
  const cardBg = darkMode ? "bg-slate-900 border-slate-800" : "bg-[#FFFFFF] border-slate-200/80";
  const subtleBg = darkMode ? "bg-slate-800/70" : "bg-[#F8FAFC]";
  const mutedText = darkMode ? "text-slate-400" : "text-slate-500";

  const cityWeather: Record<string, { temp: string; status: string; humidity: string }> = {
    Samarqand: { temp: "15°C", status: "Ochiq osmon", humidity: "44%" },
    Toshkent: { temp: "16°C", status: "Quyoshli", humidity: "41%" },
    Buxoro: { temp: "18°C", status: "Musaffo havo", humidity: "34%" },
    "Farg'ona": { temp: "15°C", status: "Yengil shabada", humidity: "49%" }
  };

  const currentOp = OPERATORS_UZ.find((o) => o.id === selectedOpId) || OPERATORS_UZ[0];

  // ============================================================================
  // RENDER
  // ============================================================================
  return (
    <div className={`min-h-screen flex flex-col lg:flex-row transition-colors ${pageBg}`}>
      {/* HIDDEN REAL HTML5 AUDIO ELEMENT FOR USER TRACKS */}
      <audio
        ref={htmlAudioRef}
        onTimeUpdate={(e) => setProgressSec(Math.floor(e.currentTarget.currentTime))}
        onLoadedMetadata={(e) => {
          const dur = Math.floor(e.currentTarget.duration);
          if (dur > 0) {
            setTracks((prev) =>
              prev.map((t) => (t.id === currentTrack.id ? { ...t, durationSec: dur } : t))
            );
            setCurrentTrack((prev) => ({ ...prev, durationSec: dur }));
          }
        }}
        onEnded={playNextTrack}
      />

      {/* TOAST BANNER */}
      {toast && (
        <div className="fixed top-4 right-4 z-50 flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-slate-900 text-white text-xs font-semibold shadow-xl border border-slate-700">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{toast}</span>
        </div>
      )}

      {/* MOBILE DRAWER BACKDROP */}
      {drawerOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/40 lg:hidden"
          onClick={() => setDrawerOpen(false)}
        />
      )}

      {/* LEFT SIDEBAR NAVIGATION (17 SECTIONS) */}
      <aside
        className={`fixed lg:sticky top-0 left-0 z-40 h-screen w-64 shrink-0 border-r flex flex-col transition-transform duration-200 ${sidebarBg} ${
          drawerOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
        }`}
      >
        <div className="p-4 flex items-center justify-between border-b border-slate-200/70 dark:border-slate-800">
          <button
            onClick={() => setActiveSection("home")}
            className="flex items-center gap-2.5 text-left"
          >
            <div className="w-9 h-9 rounded-2xl bg-gradient-to-br from-blue-600 to-indigo-600 text-white font-extrabold flex items-center justify-center shadow-sm">
              V
            </div>
            <div>
              <div className="font-extrabold text-base leading-none">VerMix</div>
              <div className={`text-[11px] mt-0.5 ${mutedText}`}>Raqamli Ekotizim</div>
            </div>
          </button>
          <button
            onClick={() => setDrawerOpen(false)}
            className="lg:hidden p-1.5 rounded-xl hover:bg-slate-200/60"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <nav className="flex-1 overflow-y-auto p-3 space-y-1">
          {SIDEBAR_MENU.map((item) => {
            const Icon = item.icon;
            const active = activeSection === item.id;
            return (
              <button
                key={item.id}
                onClick={() => {
                  setActiveSection(item.id);
                  setDrawerOpen(false);
                }}
                className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold transition ${
                  active
                    ? "bg-slate-900 text-white dark:bg-blue-600 shadow-sm"
                    : `hover:bg-slate-200/60 dark:hover:bg-slate-800 ${
                        darkMode ? "text-slate-300" : "text-slate-700"
                      }`
                }`}
              >
                <span className="flex items-center gap-2.5 truncate">
                  <Icon className="w-4 h-4 shrink-0" />
                  <span className="truncate">{item.label}</span>
                </span>
                {item.id === "bookmarks" && bookmarks.length > 0 && (
                  <span
                    className={`px-1.5 py-0.5 rounded-full text-[10px] ${
                      active ? "bg-white/20 text-white" : "bg-slate-200 text-slate-700"
                    }`}
                  >
                    {bookmarks.length}
                  </span>
                )}
              </button>
            );
          })}
        </nav>

        {/* TELEGRAM QUICK LINK IN SIDEBAR FOOTER */}
        <div className="p-3 border-t border-slate-200/70 dark:border-slate-800">
          <a
            href="https://t.me/roz1matoff_me"
            target="_blank"
            rel="noreferrer"
            className={`w-full p-2.5 rounded-2xl border flex items-center justify-between text-xs font-semibold hover:border-blue-500 transition ${cardBg}`}
          >
            <span className="flex items-center gap-2">
              <Send className="w-3.5 h-3.5 text-sky-500" />
              <span>@roz1matoff_me</span>
            </span>
            <ExternalLink className="w-3.5 h-3.5 text-slate-400" />
          </a>
        </div>
      </aside>

      {/* MAIN CONTENT AREA */}
      <div className="flex-1 flex flex-col min-w-0 pb-24">
        {/* TOP HEADER */}
        <header
          className={`sticky top-0 z-30 border-b backdrop-blur-md px-4 lg:px-8 py-3 ${
            darkMode ? "bg-slate-950/90 border-slate-800" : "bg-white/95 border-slate-200/80"
          }`}
        >
          <div className="max-w-7xl mx-auto flex items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <button
                onClick={() => setDrawerOpen(true)}
                className="lg:hidden p-2 rounded-xl border border-slate-200 dark:border-slate-800"
                aria-label="Menyu"
              >
                <Menu className="w-5 h-5" />
              </button>
              <span className="hidden sm:inline-block font-bold text-sm">
                {SIDEBAR_MENU.find((m) => m.id === activeSection)?.label}
              </span>
            </div>

            {/* GLOBAL SEARCH BAR */}
            <div className="relative flex-1 max-w-xl">
              <Search className={`w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 ${mutedText}`} />
              <input
                type="text"
                value={globalSearch}
                onChange={(e) => setGlobalSearch(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && globalSearch.trim()) {
                    const next = [globalSearch.trim(), ...searchHistory.filter((x) => x !== globalSearch.trim())].slice(0, 6);
                    setSearchHistory(next);
                    writeStorage("vermix_v2_search_hist", next);
                  }
                }}
                placeholder="VerMix bo'ylab qidirish (MacBook, iPhone, *102#, 103, musiqa...)"
                className={`w-full pl-10 pr-8 py-2 rounded-2xl border text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/30 ${
                  darkMode ? "bg-slate-900 border-slate-700 text-white" : "bg-[#F8FAFC] border-slate-200 text-slate-900"
                }`}
              />
              {globalSearch && (
                <button
                  onClick={() => setGlobalSearch("")}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400"
                >
                  <X className="w-4 h-4" />
                </button>
              )}

              {globalSearch.trim().length > 0 && (
                <div className={`absolute left-0 right-0 mt-2 rounded-2xl border shadow-2xl z-50 overflow-hidden ${cardBg}`}>
                  <div className={`px-3.5 py-2 text-[11px] font-bold border-b ${subtleBg} ${mutedText}`}>
                    Topilgan natijalar ({globalMatches.length})
                  </div>
                  {globalMatches.length === 0 ? (
                    <div className={`p-4 text-xs text-center ${mutedText}`}>
                      Hech narsa topilmadi. AI Yordamchidan so'rab ko'ring!
                    </div>
                  ) : (
                    <div className="max-h-72 overflow-y-auto divide-y divide-slate-100 dark:divide-slate-800">
                      {globalMatches.map((m, i) => (
                        <button
                          key={i}
                          onClick={() => {
                            setActiveSection(m.section);
                            setGlobalSearch("");
                          }}
                          className="w-full px-4 py-2.5 text-left hover:bg-blue-50/70 dark:hover:bg-slate-800 flex items-center justify-between gap-2"
                        >
                          <div className="min-w-0">
                            <div className="text-xs font-bold truncate">{m.title}</div>
                            <div className={`text-[11px] truncate ${mutedText}`}>{m.subtitle}</div>
                          </div>
                          <span className="px-2 py-0.5 rounded-lg bg-slate-100 dark:bg-slate-800 text-[10px] font-bold shrink-0">
                            {m.badge}
                          </span>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* RIGHT ACTION BUTTONS */}
            <div className="flex items-center gap-2">
              <button
                onClick={() => setDarkMode((d) => !d)}
                className={`p-2 rounded-xl border ${cardBg}`}
                title="Mavzuni almashtirish"
              >
                {darkMode ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-slate-700" />}
              </button>

              {auth.isAuthenticated ? (
                <button
                  onClick={() => setActiveSection("profile")}
                  className="px-3 py-1.5 rounded-xl bg-slate-900 dark:bg-blue-600 text-white text-xs font-semibold flex items-center gap-2"
                >
                  <span className="w-5 h-5 rounded-full bg-white/20 flex items-center justify-center text-[11px] font-bold">
                    {auth.avatarLetter}
                  </span>
                  <span className="hidden sm:inline max-w-[110px] truncate">{auth.name}</span>
                </button>
              ) : (
                <button
                  onClick={() => {
                    setAuthError("");
                    setAuthModalOpen(true);
                  }}
                  className="px-3.5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold flex items-center gap-1.5 shadow-sm"
                >
                  <LogIn className="w-3.5 h-3.5" />
                  <span>Kirish</span>
                </button>
              )}
            </div>
          </div>
        </header>

        {/* MAIN VIEWPORT */}
        <main className="flex-1 max-w-7xl w-full mx-auto px-4 lg:px-8 py-6 space-y-6">
          {/* ============================================================== */}
          {/* 1. BOSH SAHIFA (DASHBOARD)                                     */}
          {/* ============================================================== */}
          {activeSection === "home" && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                <div className={`lg:col-span-2 p-6 rounded-3xl border shadow-sm flex flex-col justify-between ${subtleBg}`}>
                  <div>
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-50 text-blue-700 text-xs font-semibold mb-3">
                      <Sparkles className="w-3.5 h-3.5" />
                      VerMix Shaxsiy Raqamli Ekotizim
                    </span>
                    <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight mb-2">
                      Assalomu alaykum, {auth.name}!
                    </h2>
                    <p className={`text-xs sm:text-sm max-w-xl ${mutedText}`}>
                      Pinterest g'oyalari, o'z musiqangizni yuklash imkoniyati, ijtimoiy tarmoq videolari, kompyuter va smartfonlar bazasi, AI yordamchi hamda O'zbekiston ma'lumotnomasi bir joyda.
                    </p>
                  </div>
                  <div className="flex flex-wrap gap-2.5 mt-5">
                    <button
                      onClick={() => setActiveSection("ai")}
                      className="px-4 py-2.5 rounded-2xl bg-slate-900 dark:bg-blue-600 text-white text-xs font-semibold flex items-center gap-2"
                    >
                      <Bot className="w-4 h-4" />
                      AI Yordamchi
                    </button>
                    <button
                      onClick={() => setActiveSection("music")}
                      className={`px-4 py-2.5 rounded-2xl border text-xs font-semibold flex items-center gap-2 ${cardBg}`}
                    >
                      <Music className="w-4 h-4 text-blue-600" />
                      Musiqa qo'shish
                    </button>
                    <button
                      onClick={() => setActiveSection("contact")}
                      className={`px-4 py-2.5 rounded-2xl border text-xs font-semibold flex items-center gap-2 ${cardBg}`}
                    >
                      <Send className="w-4 h-4 text-sky-500" />
                      Aloqa (@roz1matoff_me)
                    </button>
                  </div>
                </div>

                {/* WEATHER & CLOCK WIDGET */}
                <div className={`p-6 rounded-3xl border shadow-sm flex flex-col justify-between ${cardBg}`}>
                  <div className="flex items-center justify-between">
                    <select
                      value={city}
                      onChange={(e) => setCity(e.target.value as typeof city)}
                      className="text-xs font-bold bg-transparent focus:outline-none cursor-pointer"
                    >
                      <option value="Samarqand">Samarqand</option>
                      <option value="Toshkent">Toshkent</option>
                      <option value="Buxoro">Buxoro</option>
                      <option value="Farg'ona">Farg'ona</option>
                    </select>
                    <CloudSun className="w-6 h-6 text-amber-500" />
                  </div>
                  <div className="my-3">
                    <div className="text-3xl font-extrabold">{cityWeather[city].temp}</div>
                    <div className={`text-xs ${mutedText}`}>
                      {cityWeather[city].status} • Namlik {cityWeather[city].humidity}
                    </div>
                  </div>
                  <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs">
                    <span className="font-mono font-bold text-sm">
                      {currentTime.toLocaleTimeString("uz-UZ", { hour: "2-digit", minute: "2-digit", second: "2-digit" })}
                    </span>
                    <span className={mutedText}>
                      {currentTime.toLocaleDateString("uz-UZ", { day: "numeric", month: "long", year: "numeric" })}
                    </span>
                  </div>
                </div>
              </div>

              {/* QUICK ACCESS GRID */}
              <div>
                <h3 className="text-sm font-bold mb-3">Tezkor o'tish bo'limlari</h3>
                <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-2.5">
                  {SIDEBAR_MENU.filter((m) => m.id !== "home").map((item) => {
                    const Icon = item.icon;
                    return (
                      <button
                        key={item.id}
                        onClick={() => setActiveSection(item.id)}
                        className={`p-3 rounded-2xl border text-left hover:shadow-md transition flex flex-col gap-2 ${cardBg}`}
                      >
                        <div className="w-8 h-8 rounded-xl bg-blue-50 dark:bg-slate-800 text-blue-600 flex items-center justify-center">
                          <Icon className="w-4 h-4" />
                        </div>
                        <span className="text-xs font-semibold truncate">{item.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* FEATURED LAPTOPS & PHONES PREVIEW WITH IMAGES */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className={`p-5 rounded-3xl border shadow-sm space-y-3 ${cardBg}`}>
                  <div className="flex items-center justify-between">
                    <h3 className="text-sm font-bold">Ommabop kompyuterlar</h3>
                    <button
                      onClick={() => setActiveSection("computers")}
                      className="text-xs font-semibold text-blue-600 hover:underline"
                    >
                      Barchasi →
                    </button>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {COMPUTERS_CATALOG.slice(0, 2).map((lap) => (
                      <div
                        key={lap.id}
                        onClick={() => {
                          setDetailLaptop(lap);
                          setActiveSection("computers");
                        }}
                        className={`rounded-2xl overflow-hidden border cursor-pointer hover:shadow-sm transition ${subtleBg}`}
                      >
                        <img
                          src={lap.imageUrl}
                          alt={lap.model}
                          onError={(e) => {
                            e.currentTarget.src = LAPTOP_FALLBACK_SVG;
                          }}
                          className="w-full h-28 object-cover"
                        />
                        <div className="p-3">
                          <div className="text-xs font-bold truncate">{lap.model}</div>
                          <div className={`text-[11px] truncate ${mutedText}`}>{lap.priceRange}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className={`p-5 rounded-3xl border shadow-sm space-y-3 ${cardBg}`}>
                  <div className="flex items-center justify-between">
                    <h3 className="text-sm font-bold">Ommabop smartfonlar</h3>
                    <button
                      onClick={() => setActiveSection("smartphones")}
                      className="text-xs font-semibold text-blue-600 hover:underline"
                    >
                      Barchasi →
                    </button>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {SMARTPHONES_CATALOG.slice(0, 2).map((ph) => (
                      <div
                        key={ph.id}
                        onClick={() => {
                          setDetailPhone(ph);
                          setActiveSection("smartphones");
                        }}
                        className={`rounded-2xl overflow-hidden border cursor-pointer hover:shadow-sm transition ${subtleBg}`}
                      >
                        <img
                          src={ph.imageUrl}
                          alt={ph.model}
                          onError={(e) => {
                            e.currentTarget.src = PHONE_FALLBACK_SVG;
                          }}
                          className="w-full h-28 object-cover"
                        />
                        <div className="p-3">
                          <div className="text-xs font-bold truncate">{ph.model}</div>
                          <div className={`text-[11px] truncate ${mutedText}`}>{ph.price}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ============================================================== */}
          {/* 2. PINTEREST                                                   */}
          {/* ============================================================== */}
          {activeSection === "pinterest" && (
            <div className="space-y-5">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
                <div>
                  <h2 className="text-xl font-extrabold">Pinterest — G'oyalar va Ilhom</h2>
                  <p className={`text-xs ${mutedText}`}>
                    Masonry panjarada rasmlarni kashf eting, shaxsiy doskalar yarating va saqlang.
                  </p>
                </div>
                <div className="flex flex-wrap gap-2">
                  <input
                    type="text"
                    value={pinSearch}
                    onChange={(e) => setPinSearch(e.target.value)}
                    placeholder="G'oya qidirish..."
                    className={`px-3.5 py-2 rounded-xl border text-xs ${cardBg}`}
                  />
                  <div className="flex gap-1.5">
                    <input
                      type="text"
                      value={newBoardTitle}
                      onChange={(e) => setNewBoardTitle(e.target.value)}
                      placeholder="Yangi doska..."
                      className={`px-3 py-2 rounded-xl border text-xs ${cardBg}`}
                    />
                    <button
                      onClick={() => {
                        if (!newBoardTitle.trim()) return;
                        setBoards((prev) => Array.from(new Set([...prev, newBoardTitle.trim()])));
                        setNewBoardTitle("");
                        notify("Shaxsiy doska yaratildi");
                      }}
                      className="px-3 py-2 rounded-xl bg-slate-900 text-white text-xs font-semibold flex items-center gap-1"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      Doska
                    </button>
                  </div>
                </div>
              </div>

              <div className="flex flex-wrap gap-1.5">
                {["Barchasi", "Texnologiya", "Sayohat", "Dizayn", "Interyer", "Sun'iy Intellekt", "Hayot tarzi"].map(
                  (c) => (
                    <button
                      key={c}
                      onClick={() => setPinCat(c)}
                      className={`px-3 py-1.5 rounded-full text-xs font-semibold ${
                        pinCat === c ? "bg-slate-900 text-white dark:bg-blue-600" : subtleBg
                      }`}
                    >
                      {c}
                    </button>
                  )
                )}
              </div>

              <div className="columns-1 sm:columns-2 lg:columns-3 gap-4 space-y-4">
                {pins
                  .filter((p) => (pinCat === "Barchasi" ? true : p.category === pinCat))
                  .filter((p) =>
                    !pinSearch.trim() ? true : p.title.toLowerCase().includes(pinSearch.toLowerCase())
                  )
                  .map((pin) => {
                    const liked = likedPins.includes(pin.id);
                    const saved = isSaved(pin.id);
                    return (
                      <div
                        key={pin.id}
                        className={`break-inside-avoid rounded-3xl border overflow-hidden shadow-sm ${cardBg}`}
                      >
                        <div className="relative">
                          <img
                            src={pin.imageUrl}
                            alt={pin.title}
                            onError={(e) => {
                              e.currentTarget.src = LAPTOP_FALLBACK_SVG;
                            }}
                            className={`w-full ${pin.heightClass} object-cover`}
                          />
                          <button
                            onClick={() =>
                              toggleSaveBookmark({
                                id: pin.id,
                                type: "Rasm",
                                title: pin.title,
                                subtitle: pin.category,
                                section: "pinterest"
                              })
                            }
                            className={`absolute top-3 right-3 px-3 py-1.5 rounded-full text-xs font-bold shadow ${
                              saved ? "bg-rose-600 text-white" : "bg-slate-900/90 text-white"
                            }`}
                          >
                            {saved ? "Saqlangan" : "Saqlash"}
                          </button>
                        </div>
                        <div className="p-4 space-y-2">
                          <h4 className="font-bold text-xs">{pin.title}</h4>
                          <div className="flex items-center justify-between text-xs">
                            <select
                              value={pin.board}
                              onChange={(e) => {
                                const b = e.target.value;
                                setPins((prev) =>
                                  prev.map((item) => (item.id === pin.id ? { ...item, board: b } : item))
                                );
                                notify(`"${b}" doskasiga o'tkazildi`);
                              }}
                              className={`px-2 py-1 rounded-lg text-[11px] ${subtleBg}`}
                            >
                              {boards.map((b) => (
                                <option key={b} value={b}>
                                  {b}
                                </option>
                              ))}
                            </select>
                            <button
                              onClick={() =>
                                setLikedPins((prev) =>
                                  prev.includes(pin.id) ? prev.filter((x) => x !== pin.id) : [...prev, pin.id]
                                )
                              }
                              className="flex items-center gap-1 font-bold"
                            >
                              <Heart className={`w-3.5 h-3.5 ${liked ? "fill-rose-500 text-rose-500" : ""}`} />
                              <span>{pin.likes + (liked ? 1 : 0)}</span>
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  })}
              </div>
            </div>
          )}

          {/* ============================================================== */}
          {/* 3. MUSIQA (WITH USER UPLOAD & AUDIO URL MODAL)                 */}
          {/* ============================================================== */}
          {activeSection === "music" && (
            <div className="space-y-5">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <h2 className="text-xl font-extrabold">Musiqa va Shaxsiy Pleylist</h2>
                  <p className={`text-xs ${mutedText}`}>
                    Musiqalarni tinglang yoki o'zingiz xohlagan MP3 fayl va havolalarni qo'shing.
                  </p>
                </div>
                <div className="flex flex-wrap items-center gap-2">
                  <input
                    type="text"
                    value={musicSearch}
                    onChange={(e) => setMusicSearch(e.target.value)}
                    placeholder="Qo'shiq yoki ijrochi..."
                    className={`px-3.5 py-2 rounded-xl border text-xs ${cardBg}`}
                  />
                  <button
                    onClick={() => {
                      setCustomFileError("");
                      setAddMusicOpen(true);
                    }}
                    className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold flex items-center gap-1.5 shadow-sm"
                  >
                    <Plus className="w-4 h-4" />
                    Musiqa qo'shish
                  </button>
                </div>
              </div>

              <div className="flex flex-wrap gap-1.5">
                {["Barchasi", "Mening musiqalarim", "Sevimlilar", "Fokus va Ish", "Lo-Fi", "Milliy va Klassik"].map(
                  (cat) => (
                    <button
                      key={cat}
                      onClick={() => setMusicFilter(cat)}
                      className={`px-3 py-1.5 rounded-full text-xs font-semibold ${
                        musicFilter === cat ? "bg-slate-900 text-white dark:bg-blue-600" : subtleBg
                      }`}
                    >
                      {cat}
                    </button>
                  )
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {tracks
                  .filter((t) => {
                    if (musicFilter === "Sevimlilar") return favTracks.includes(t.id);
                    if (musicFilter === "Mening musiqalarim") return Boolean(t.isCustom);
                    if (musicFilter !== "Barchasi") return t.category === musicFilter;
                    return true;
                  })
                  .filter((t) =>
                    !musicSearch.trim()
                      ? true
                      : `${t.title} ${t.artist} ${t.album}`.toLowerCase().includes(musicSearch.toLowerCase())
                  )
                  .map((track) => {
                    const active = currentTrack.id === track.id;
                    const fav = favTracks.includes(track.id);
                    return (
                      <div key={track.id} className={`p-4 rounded-3xl border shadow-sm space-y-3 ${cardBg}`}>
                        <div className="flex items-center gap-3.5">
                          <div className="relative w-16 h-16 rounded-2xl overflow-hidden shrink-0">
                            <img
                              src={track.coverUrl}
                              alt={track.title}
                              onError={(e) => {
                                e.currentTarget.src = LAPTOP_FALLBACK_SVG;
                              }}
                              className="w-full h-full object-cover"
                            />
                            <button
                              onClick={() => (active ? setIsPlaying((p) => !p) : selectTrack(track))}
                              className="absolute inset-0 bg-black/35 text-white flex items-center justify-center"
                            >
                              {active && isPlaying ? <Pause className="w-6 h-6" /> : <Play className="w-6 h-6 ml-0.5" />}
                            </button>
                          </div>
                          <div className="min-w-0 flex-1">
                            <div className="flex items-center gap-1.5">
                              <span className="text-[10px] font-bold text-blue-600 uppercase">{track.category}</span>
                              {track.isCustom && (
                                <span className="px-1.5 py-0.5 rounded bg-emerald-50 text-emerald-700 text-[9px] font-bold">
                                  Shaxsiy
                                </span>
                              )}
                            </div>
                            <h3 className="font-bold text-sm truncate">{track.title}</h3>
                            <p className={`text-xs truncate ${mutedText}`}>{track.artist}</p>
                            <p className={`text-[11px] ${mutedText}`}>{formatSec(track.durationSec)}</p>
                          </div>
                        </div>

                        <div className="flex items-center justify-between pt-2.5 border-t border-slate-100 dark:border-slate-800">
                          <button
                            onClick={() => (active ? setIsPlaying((p) => !p) : selectTrack(track))}
                            className="px-3 py-1.5 rounded-xl bg-slate-900 dark:bg-blue-600 text-white text-xs font-semibold flex items-center gap-1"
                          >
                            {active && isPlaying ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
                            <span>{active && isPlaying ? "Pauza" : "Tinglash"}</span>
                          </button>

                          <div className="flex items-center gap-1.5">
                            <button
                              onClick={() =>
                                setFavTracks((prev) =>
                                  prev.includes(track.id) ? prev.filter((x) => x !== track.id) : [...prev, track.id]
                                )
                              }
                              className={`p-2 rounded-xl border ${cardBg}`}
                            >
                              <Heart className={`w-3.5 h-3.5 ${fav ? "fill-rose-500 text-rose-500" : ""}`} />
                            </button>
                            <button
                              onClick={() =>
                                toggleSaveBookmark({
                                  id: track.id,
                                  type: "Musiqa",
                                  title: track.title,
                                  subtitle: track.artist,
                                  section: "music"
                                })
                              }
                              className={`p-2 rounded-xl border ${cardBg}`}
                            >
                              <Bookmark
                                className={`w-3.5 h-3.5 ${isSaved(track.id) ? "fill-blue-600 text-blue-600" : ""}`}
                              />
                            </button>
                            {track.isCustom && (
                              <button
                                onClick={() => {
                                  setTracks((prev) => prev.filter((x) => x.id !== track.id));
                                  notify("Shaxsiy musiqa o'chirildi");
                                }}
                                className={`p-2 rounded-xl border text-rose-600 ${cardBg}`}
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
              </div>

              {/* ADD CUSTOM MUSIC MODAL */}
              {addMusicOpen && (
                <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
                  <div className={`max-w-md w-full rounded-3xl border p-6 shadow-2xl space-y-4 ${cardBg}`}>
                    <div className="flex items-center justify-between">
                      <h3 className="font-extrabold text-base">O'z musiqangizni qo'shish</h3>
                      <button onClick={() => setAddMusicOpen(false)} className="p-1.5 rounded-xl hover:bg-slate-100">
                        <X className="w-5 h-5" />
                      </button>
                    </div>

                    <div className="space-y-2.5 text-xs">
                      <input
                        type="text"
                        value={customTrackTitle}
                        onChange={(e) => setCustomTrackTitle(e.target.value)}
                        placeholder="Qo'shiq nomi (ixtiyoriy, fayl nomidan olinadi)"
                        className={`w-full px-3.5 py-2.5 rounded-xl border ${subtleBg}`}
                      />
                      <input
                        type="text"
                        value={customTrackArtist}
                        onChange={(e) => setCustomTrackArtist(e.target.value)}
                        placeholder="Ijrochi ismi"
                        className={`w-full px-3.5 py-2.5 rounded-xl border ${subtleBg}`}
                      />
                      <input
                        type="url"
                        value={customTrackCover}
                        onChange={(e) => setCustomTrackCover(e.target.value)}
                        placeholder="Muqova rasmi URL (ixtiyoriy)"
                        className={`w-full px-3.5 py-2.5 rounded-xl border ${subtleBg}`}
                      />
                    </div>

                    <div className={`p-4 rounded-2xl border border-dashed text-center space-y-2 ${subtleBg}`}>
                      <Upload className="w-6 h-6 mx-auto text-blue-600" />
                      <div className="text-xs font-bold">1-usul: Qurilmadan audio fayl tanlash</div>
                      <p className={`text-[11px] ${mutedText}`}>MP3, WAV, OGG yoki M4A formatdagi istalgan fayl</p>
                      <label className="inline-block px-4 py-2 rounded-xl bg-slate-900 dark:bg-blue-600 text-white text-xs font-semibold cursor-pointer">
                        Fayl tanlash
                        <input
                          type="file"
                          accept="audio/*"
                          onChange={handleLocalAudioFile}
                          className="hidden"
                        />
                      </label>
                    </div>

                    <form onSubmit={handleAddCustomAudioUrl} className="space-y-2.5 pt-2 border-t border-slate-100 dark:border-slate-800">
                      <div className="text-xs font-bold">2-usul: To'g'ridan-to'g'ri audio havola (URL)</div>
                      <input
                        type="url"
                        value={customTrackUrl}
                        onChange={(e) => setCustomTrackUrl(e.target.value)}
                        placeholder="https://example.com/song.mp3"
                        className={`w-full px-3.5 py-2.5 rounded-xl border text-xs ${subtleBg}`}
                      />
                      {customFileError && <p className="text-xs text-rose-600">{customFileError}</p>}
                      <button
                        type="submit"
                        className="w-full py-2.5 rounded-xl bg-blue-600 text-white text-xs font-semibold"
                      >
                        Havola orqali qo'shish
                      </button>
                    </form>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* ============================================================== */}
          {/* 4. VIDEOLAR (YOUTUBE, INSTAGRAM, TIKTOK EMBED)                 */}
          {/* ============================================================== */}
          {activeSection === "videos" && (
            <div className="space-y-5">
              <div className={`p-5 rounded-3xl border shadow-sm space-y-3 ${cardBg}`}>
                <h2 className="text-xl font-extrabold">Ijtimoiy Tarmoq Video Pleyeri</h2>
                <p className={`text-xs ${mutedText}`}>
                  YouTube, Instagram (Reels/Post) yoki TikTok ochiq havolasini kiriting — rasmiy pleyer avtomatik ishga tushadi.
                </p>
                <form onSubmit={handleAddSocialVideo} className="flex flex-col sm:flex-row gap-2.5">
                  <input
                    type="url"
                    value={videoInputUrl}
                    onChange={(e) => setVideoInputUrl(e.target.value)}
                    placeholder="https://www.youtube.com/watch?v=... yoki Instagram/TikTok havolasi"
                    className={`flex-1 px-4 py-2.5 rounded-2xl border text-xs sm:text-sm ${subtleBg}`}
                  />
                  <button
                    type="submit"
                    className="px-5 py-2.5 rounded-2xl bg-slate-900 dark:bg-blue-600 text-white text-xs font-semibold flex items-center justify-center gap-2"
                  >
                    <Play className="w-4 h-4" />
                    Videoni ochish
                  </button>
                </form>
                {videoErr && <p className="text-xs text-rose-600">{videoErr}</p>}
              </div>

              {activeVideo && (
                <div className={`p-5 rounded-3xl border shadow-sm space-y-3 ${cardBg}`}>
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div>
                      <span className="px-2.5 py-0.5 rounded-full bg-blue-50 text-blue-700 text-[11px] font-bold">
                        {activeVideo.platform}
                      </span>
                      <h3 className="font-bold text-base mt-1">{activeVideo.title}</h3>
                    </div>
                    <a
                      href={activeVideo.originalUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="px-3 py-1.5 rounded-xl bg-slate-100 text-slate-900 text-xs font-semibold flex items-center gap-1"
                    >
                      <span>Asl manba</span>
                      <ExternalLink className="w-3.5 h-3.5" />
                    </a>
                  </div>
                  <div className="w-full aspect-video rounded-2xl overflow-hidden bg-slate-950">
                    <iframe
                      src={activeVideo.embedUrl}
                      title={activeVideo.title}
                      className="w-full h-full"
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      allowFullScreen
                    />
                  </div>
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {videos.map((v) => (
                  <div
                    key={v.id}
                    onClick={() => setActiveVideo(v)}
                    className={`p-4 rounded-2xl border cursor-pointer hover:shadow-md transition ${cardBg}`}
                  >
                    <span className="px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-[10px] font-bold">
                      {v.platform}
                    </span>
                    <h4 className="font-bold text-xs mt-2 mb-1 line-clamp-2">{v.title}</h4>
                    <p className={`text-[11px] truncate ${mutedText}`}>{v.originalUrl}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ============================================================== */}
          {/* 5. KOMPYUTERLAR BAZASI (WITH PHOTOS & COMPARISON)              */}
          {/* ============================================================== */}
          {activeSection === "computers" && (
            <div className="space-y-5">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
                <div>
                  <h2 className="text-xl font-extrabold">Kompyuter va Noutbuklar Bazasi</h2>
                  <p className={`text-xs ${mutedText}`}>
                    11 ta brend noutbuklarining rasmlari, to'liq texnik tavsifi va taqqoslash jadvali.
                  </p>
                </div>
                <div className="flex flex-wrap gap-2">
                  <input
                    type="text"
                    value={compSearch}
                    onChange={(e) => setCompSearch(e.target.value)}
                    placeholder="Model yoki CPU qidirish..."
                    className={`px-3.5 py-2 rounded-xl border text-xs ${cardBg}`}
                  />
                  <button
                    onClick={() => setShowLaptopCompare((s) => !s)}
                    className="px-3.5 py-2 rounded-xl bg-blue-600 text-white text-xs font-semibold flex items-center gap-1.5"
                  >
                    <SlidersHorizontal className="w-3.5 h-3.5" />
                    Taqqoslash ({compareLaptopIds.length})
                  </button>
                </div>
              </div>

              <div className="flex flex-wrap gap-1.5">
                {["Barchasi", "Apple", "ASUS", "Lenovo", "HP", "Dell", "Acer", "MSI", "Microsoft", "Samsung", "Razer", "Huawei"].map(
                  (b) => (
                    <button
                      key={b}
                      onClick={() => setCompBrand(b)}
                      className={`px-3 py-1.5 rounded-full text-xs font-semibold ${
                        compBrand === b ? "bg-slate-900 text-white dark:bg-blue-600" : subtleBg
                      }`}
                    >
                      {b}
                    </button>
                  )
                )}
              </div>

              {showLaptopCompare && (
                <div className={`p-5 rounded-3xl border shadow-md overflow-x-auto ${cardBg}`}>
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="font-bold text-sm">Noutbuklarni yonma-yon taqqoslash</h3>
                    <button onClick={() => setShowLaptopCompare(false)} className="text-xs text-slate-400">
                      Yopish ✕
                    </button>
                  </div>
                  <table className="w-full text-xs text-left border-collapse">
                    <thead>
                      <tr className="border-b border-slate-200 dark:border-slate-800">
                        <th className="py-2 pr-4 font-bold">Ko'rsatkich</th>
                        {compareLaptopIds.map((id) => {
                          const item = COMPUTERS_CATALOG.find((c) => c.id === id);
                          return (
                            <th key={id} className="py-2 px-3 font-bold">
                              {item?.model}
                            </th>
                          );
                        })}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                      {[
                        { label: "Brend", key: "brand" as const },
                        { label: "Protsessor", key: "cpu" as const },
                        { label: "RAM", key: "ram" as const },
                        { label: "Xotira", key: "storage" as const },
                        { label: "GPU", key: "gpu" as const },
                        { label: "Displey", key: "display" as const },
                        { label: "Batareya", key: "battery" as const },
                        { label: "Narx", key: "priceRange" as const }
                      ].map((row) => (
                        <tr key={row.label}>
                          <td className={`py-2 pr-4 font-semibold ${mutedText}`}>{row.label}</td>
                          {compareLaptopIds.map((id) => {
                            const item = COMPUTERS_CATALOG.find((c) => c.id === id);
                            return (
                              <td key={id} className="py-2 px-3">
                                {item ? String(item[row.key]) : "-"}
                              </td>
                            );
                          })}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {COMPUTERS_CATALOG.filter((c) => (compBrand === "Barchasi" ? true : c.brand === compBrand))
                  .filter((c) =>
                    !compSearch.trim()
                      ? true
                      : `${c.brand} ${c.model} ${c.cpu}`.toLowerCase().includes(compSearch.toLowerCase())
                  )
                  .map((comp) => {
                    const selected = compareLaptopIds.includes(comp.id);
                    return (
                      <div key={comp.id} className={`rounded-3xl border overflow-hidden shadow-sm flex flex-col justify-between ${cardBg}`}>
                        <div>
                          <div className="relative h-44 bg-slate-100 dark:bg-slate-800">
                            <img
                              src={comp.imageUrl}
                              alt={comp.model}
                              onError={(e) => {
                                e.currentTarget.src = LAPTOP_FALLBACK_SVG;
                              }}
                              className="w-full h-full object-cover"
                            />
                            <span className="absolute top-3 left-3 px-2.5 py-1 rounded-full bg-slate-900/80 text-white text-[10px] font-bold">
                              {comp.brand} • {comp.year}
                            </span>
                            <span className="absolute bottom-3 right-3 px-2.5 py-1 rounded-xl bg-white/95 text-slate-900 text-xs font-extrabold shadow">
                              {comp.priceRange}
                            </span>
                          </div>

                          <div className="p-4 space-y-1.5 text-xs">
                            <h3 className="font-extrabold text-base">{comp.model}</h3>
                            <div className={mutedText}>CPU: {comp.cpu}</div>
                            <div className={mutedText}>RAM / SSD: {comp.ram} • {comp.storage}</div>
                            <div className={mutedText}>GPU: {comp.gpu}</div>
                            <p className={`text-[11px] pt-1 line-clamp-2 ${mutedText}`}>{comp.description}</p>
                          </div>
                        </div>

                        <div className="px-4 pb-4 flex items-center gap-2">
                          <button
                            onClick={() => setDetailLaptop(comp)}
                            className="flex-1 py-2 rounded-xl bg-slate-900 dark:bg-blue-600 text-white text-xs font-semibold"
                          >
                            Batafsil
                          </button>
                          <button
                            onClick={() =>
                              setCompareLaptopIds((prev) =>
                                prev.includes(comp.id)
                                  ? prev.filter((x) => x !== comp.id)
                                  : prev.length >= 3
                                  ? [...prev.slice(1), comp.id]
                                  : [...prev, comp.id]
                              )
                            }
                            className={`px-3 py-2 rounded-xl border text-xs font-semibold ${
                              selected ? "bg-blue-50 border-blue-400 text-blue-700" : cardBg
                            }`}
                          >
                            {selected ? "Tanlangan" : "+ Taqqos"}
                          </button>
                          <button
                            onClick={() =>
                              toggleSaveBookmark({
                                id: comp.id,
                                type: "Kompyuter",
                                title: comp.model,
                                subtitle: `${comp.brand} • ${comp.priceRange}`,
                                section: "computers"
                              })
                            }
                            className={`p-2 rounded-xl border ${cardBg}`}
                          >
                            <Bookmark
                              className={`w-3.5 h-3.5 ${isSaved(comp.id) ? "fill-blue-600 text-blue-600" : ""}`}
                            />
                          </button>
                        </div>
                      </div>
                    );
                  })}
              </div>

              {detailLaptop && (
                <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
                  <div className={`max-w-xl w-full rounded-3xl border p-6 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto ${cardBg}`}>
                    <div className="flex items-center justify-between">
                      <h3 className="text-lg font-extrabold">{detailLaptop.model}</h3>
                      <button onClick={() => setDetailLaptop(null)} className="p-2 rounded-xl hover:bg-slate-100">
                        <X className="w-5 h-5" />
                      </button>
                    </div>
                    <img
                      src={detailLaptop.imageUrl}
                      alt={detailLaptop.model}
                      onError={(e) => {
                        e.currentTarget.src = LAPTOP_FALLBACK_SVG;
                      }}
                      className="w-full h-52 object-cover rounded-2xl"
                    />
                    <div className={`p-4 rounded-2xl space-y-1.5 text-xs ${subtleBg}`}>
                      <div><strong>Brend va yil:</strong> {detailLaptop.brand} ({detailLaptop.year})</div>
                      <div><strong>Protsessor:</strong> {detailLaptop.cpu}</div>
                      <div><strong>RAM:</strong> {detailLaptop.ram}</div>
                      <div><strong>Xotira:</strong> {detailLaptop.storage}</div>
                      <div><strong>Videokarta:</strong> {detailLaptop.gpu}</div>
                      <div><strong>Displey:</strong> {detailLaptop.display}</div>
                      <div><strong>Batareya:</strong> {detailLaptop.battery}</div>
                      <div><strong>Narx:</strong> {detailLaptop.priceRange}</div>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                      <div className="p-3 rounded-2xl bg-emerald-50 text-emerald-900">
                        <div className="font-bold mb-1">Afzalliklari:</div>
                        <ul className="list-disc pl-4">
                          {detailLaptop.pros.map((p, i) => (
                            <li key={i}>{p}</li>
                          ))}
                        </ul>
                      </div>
                      <div className="p-3 rounded-2xl bg-rose-50 text-rose-900">
                        <div className="font-bold mb-1">Kamchiliklari:</div>
                        <ul className="list-disc pl-4">
                          {detailLaptop.cons.map((c, i) => (
                            <li key={i}>{c}</li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* ============================================================== */}
          {/* 6. SMARTFONLAR BAZASI (WITH PHOTOS & COMPARISON)               */}
          {/* ============================================================== */}
          {activeSection === "smartphones" && (
            <div className="space-y-5">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
                <div>
                  <h2 className="text-xl font-extrabold">Smartfonlar Ma'lumotlar Bazasi</h2>
                  <p className={`text-xs ${mutedText}`}>
                    13 ta mashhur brend smartfonlarining rasmlari, kamera, protsessor va batareya ko'rsatkichlari.
                  </p>
                </div>
                <div className="flex flex-wrap gap-2">
                  <input
                    type="text"
                    value={phoneSearch}
                    onChange={(e) => setPhoneSearch(e.target.value)}
                    placeholder="Smartfon qidirish..."
                    className={`px-3.5 py-2 rounded-xl border text-xs ${cardBg}`}
                  />
                  <button
                    onClick={() => setShowPhoneCompare((s) => !s)}
                    className="px-3.5 py-2 rounded-xl bg-emerald-600 text-white text-xs font-semibold flex items-center gap-1.5"
                  >
                    <SlidersHorizontal className="w-3.5 h-3.5" />
                    Taqqoslash ({comparePhoneIds.length})
                  </button>
                </div>
              </div>

              <div className="flex flex-wrap gap-1.5">
                {[
                  "Barchasi",
                  "Apple iPhone",
                  "Samsung Galaxy",
                  "Xiaomi",
                  "Redmi",
                  "POCO",
                  "Google Pixel",
                  "Huawei",
                  "Honor",
                  "OnePlus",
                  "OPPO",
                  "Vivo",
                  "Realme",
                  "Nothing"
                ].map((b) => (
                  <button
                    key={b}
                    onClick={() => setPhoneBrand(b)}
                    className={`px-3 py-1.5 rounded-full text-xs font-semibold ${
                      phoneBrand === b ? "bg-slate-900 text-white dark:bg-blue-600" : subtleBg
                    }`}
                  >
                    {b}
                  </button>
                ))}
              </div>

              {showPhoneCompare && (
                <div className={`p-5 rounded-3xl border shadow-md overflow-x-auto ${cardBg}`}>
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="font-bold text-sm">Smartfonlarni yonma-yon taqqoslash</h3>
                    <button onClick={() => setShowPhoneCompare(false)} className="text-xs text-slate-400">
                      Yopish ✕
                    </button>
                  </div>
                  <table className="w-full text-xs text-left border-collapse">
                    <thead>
                      <tr className="border-b border-slate-200 dark:border-slate-800">
                        <th className="py-2 pr-4 font-bold">Xususiyat</th>
                        {comparePhoneIds.map((id) => {
                          const p = SMARTPHONES_CATALOG.find((x) => x.id === id);
                          return (
                            <th key={id} className="py-2 px-3 font-bold">
                              {p?.model}
                            </th>
                          );
                        })}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                      {[
                        { label: "Displey", key: "display" as const },
                        { label: "Protsessor", key: "processor" as const },
                        { label: "RAM / Xotira", key: "ramStorage" as const },
                        { label: "Asosiy kamera", key: "mainCamera" as const },
                        { label: "Batareya", key: "battery" as const },
                        { label: "Quvvatlash", key: "charging" as const },
                        { label: "Narx", key: "price" as const }
                      ].map((row) => (
                        <tr key={row.label}>
                          <td className={`py-2 pr-4 font-semibold ${mutedText}`}>{row.label}</td>
                          {comparePhoneIds.map((id) => {
                            const p = SMARTPHONES_CATALOG.find((x) => x.id === id);
                            return (
                              <td key={id} className="py-2 px-3">
                                {p ? p[row.key] : "-"}
                              </td>
                            );
                          })}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {SMARTPHONES_CATALOG.filter((p) => (phoneBrand === "Barchasi" ? true : p.brand === phoneBrand))
                  .filter((p) =>
                    !phoneSearch.trim()
                      ? true
                      : `${p.brand} ${p.model} ${p.processor}`.toLowerCase().includes(phoneSearch.toLowerCase())
                  )
                  .map((ph) => {
                    const selected = comparePhoneIds.includes(ph.id);
                    return (
                      <div key={ph.id} className={`rounded-3xl border overflow-hidden shadow-sm flex flex-col justify-between ${cardBg}`}>
                        <div>
                          <div className="relative h-44 bg-slate-100 dark:bg-slate-800">
                            <img
                              src={ph.imageUrl}
                              alt={ph.model}
                              onError={(e) => {
                                e.currentTarget.src = PHONE_FALLBACK_SVG;
                              }}
                              className="w-full h-full object-cover"
                            />
                            <span className="absolute top-3 left-3 px-2.5 py-1 rounded-full bg-slate-900/80 text-white text-[10px] font-bold">
                              {ph.brand}
                            </span>
                            <span className="absolute bottom-3 right-3 px-2.5 py-1 rounded-xl bg-white/95 text-slate-900 text-xs font-extrabold shadow">
                              {ph.price}
                            </span>
                          </div>

                          <div className="p-4 space-y-1.5 text-xs">
                            <h3 className="font-extrabold text-base">{ph.model}</h3>
                            <div className={mutedText}>Chip: {ph.processor}</div>
                            <div className={`truncate ${mutedText}`}>Kamera: {ph.mainCamera}</div>
                            <div className={mutedText}>Batareya: {ph.battery} • {ph.charging}</div>
                          </div>
                        </div>

                        <div className="px-4 pb-4 flex items-center gap-2">
                          <button
                            onClick={() => setDetailPhone(ph)}
                            className="flex-1 py-2 rounded-xl bg-slate-900 dark:bg-blue-600 text-white text-xs font-semibold"
                          >
                            Batafsil
                          </button>
                          <button
                            onClick={() =>
                              setComparePhoneIds((prev) =>
                                prev.includes(ph.id)
                                  ? prev.filter((x) => x !== ph.id)
                                  : prev.length >= 3
                                  ? [...prev.slice(1), ph.id]
                                  : [...prev, ph.id]
                              )
                            }
                            className={`px-3 py-2 rounded-xl border text-xs font-semibold ${
                              selected ? "bg-emerald-50 border-emerald-400 text-emerald-700" : cardBg
                            }`}
                          >
                            {selected ? "Tanlangan" : "+ Taqqos"}
                          </button>
                          <button
                            onClick={() =>
                              toggleSaveBookmark({
                                id: ph.id,
                                type: "Smartfon",
                                title: ph.model,
                                subtitle: `${ph.brand} • ${ph.price}`,
                                section: "smartphones"
                              })
                            }
                            className={`p-2 rounded-xl border ${cardBg}`}
                          >
                            <Bookmark
                              className={`w-3.5 h-3.5 ${isSaved(ph.id) ? "fill-blue-600 text-blue-600" : ""}`}
                            />
                          </button>
                        </div>
                      </div>
                    );
                  })}
              </div>

              {detailPhone && (
                <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
                  <div className={`max-w-lg w-full rounded-3xl border p-6 shadow-2xl space-y-3 max-h-[90vh] overflow-y-auto ${cardBg}`}>
                    <div className="flex items-center justify-between">
                      <h3 className="text-lg font-extrabold">{detailPhone.model}</h3>
                      <button onClick={() => setDetailPhone(null)} className="p-2 rounded-xl hover:bg-slate-100">
                        <X className="w-5 h-5" />
                      </button>
                    </div>
                    <img
                      src={detailPhone.imageUrl}
                      alt={detailPhone.model}
                      onError={(e) => {
                        e.currentTarget.src = PHONE_FALLBACK_SVG;
                      }}
                      className="w-full h-52 object-cover rounded-2xl"
                    />
                    <div className={`p-4 rounded-2xl space-y-1.5 text-xs ${subtleBg}`}>
                      <div><strong>Sana:</strong> {detailPhone.releaseDate}</div>
                      <div><strong>Displey:</strong> {detailPhone.display}</div>
                      <div><strong>Protsessor:</strong> {detailPhone.processor}</div>
                      <div><strong>RAM / Xotira:</strong> {detailPhone.ramStorage}</div>
                      <div><strong>Asosiy kamera:</strong> {detailPhone.mainCamera}</div>
                      <div><strong>Old kamera:</strong> {detailPhone.frontCamera}</div>
                      <div><strong>Batareya:</strong> {detailPhone.battery}</div>
                      <div><strong>Quvvatlash:</strong> {detailPhone.charging}</div>
                      <div><strong>Tizim:</strong> {detailPhone.os}</div>
                      <div><strong>Narxi:</strong> {detailPhone.price}</div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* ============================================================== */}
          {/* 7. AI YORDAMCHI                                                */}
          {/* ============================================================== */}
          {activeSection === "ai" && (
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 min-h-[70vh]">
              <div className={`p-4 rounded-3xl border space-y-3 ${cardBg}`}>
                <button
                  onClick={() => {
                    const id = `th-${Date.now()}`;
                    setThreads((prev) => [
                      {
                        id,
                        title: "Yangi suhbat",
                        messages: [
                          {
                            id: `m-${Date.now()}`,
                            role: "assistant",
                            text: "Yangi suhbat ochildi. Savolingizni yozing!",
                            time: "Hozir"
                          }
                        ]
                      },
                      ...prev
                    ]);
                    setActiveThreadId(id);
                  }}
                  className="w-full py-2.5 rounded-2xl bg-slate-900 dark:bg-blue-600 text-white text-xs font-semibold flex items-center justify-center gap-1.5"
                >
                  <Plus className="w-4 h-4" />
                  Yangi suhbat
                </button>
                <div className="space-y-1.5 max-h-80 overflow-y-auto">
                  {threads.map((th) => (
                    <button
                      key={th.id}
                      onClick={() => setActiveThreadId(th.id)}
                      className={`w-full p-2.5 rounded-xl text-left text-xs truncate ${
                        th.id === currentThread.id ? "bg-blue-50 dark:bg-slate-800 font-bold text-blue-700" : subtleBg
                      }`}
                    >
                      {th.title}
                    </button>
                  ))}
                </div>
              </div>

              <div className={`lg:col-span-3 rounded-3xl border shadow-sm flex flex-col overflow-hidden ${cardBg}`}>
                <div className={`p-4 border-b flex items-center justify-between ${subtleBg}`}>
                  <div className="flex items-center gap-2">
                    <Bot className="w-5 h-5 text-blue-600" />
                    <span className="font-bold text-sm">VerMix AI Yordamchi</span>
                  </div>
                  <span className="text-[11px] text-emerald-600 font-semibold">Onlayn</span>
                </div>

                <div className="flex-1 p-4 space-y-3 overflow-y-auto max-h-[52vh]">
                  {currentThread.messages.map((m) => (
                    <div key={m.id} className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}>
                      <div
                        className={`max-w-[85%] p-3.5 rounded-2xl text-xs sm:text-sm whitespace-pre-wrap ${
                          m.role === "user" ? "bg-slate-900 dark:bg-blue-600 text-white" : subtleBg
                        }`}
                      >
                        <div>{m.text}</div>
                        {m.role === "assistant" && (
                          <button
                            onClick={() => copyText(m.text, "AI javobi")}
                            className="mt-2 inline-flex items-center gap-1 text-[10px] opacity-70 hover:opacity-100"
                          >
                            <Copy className="w-3 h-3" />
                            Nusxalash
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>

                <form onSubmit={sendAiMessage} className={`p-3.5 border-t flex gap-2 ${subtleBg}`}>
                  <input
                    type="text"
                    value={aiPrompt}
                    onChange={(e) => setAiPrompt(e.target.value)}
                    placeholder="AI yordamchiga savol yozing..."
                    className={`flex-1 px-4 py-2.5 rounded-xl border text-xs sm:text-sm ${cardBg}`}
                  />
                  <button
                    type="submit"
                    disabled={aiBusy}
                    className="px-4 py-2.5 rounded-xl bg-slate-900 dark:bg-blue-600 text-white text-xs font-semibold flex items-center gap-1.5"
                  >
                    <Send className="w-4 h-4" />
                    <span>{aiBusy ? "..." : "Yuborish"}</span>
                  </button>
                </form>
              </div>
            </div>
          )}

          {/* ============================================================== */}
          {/* 8. KALENDAR                                                    */}
          {/* ============================================================== */}
          {activeSection === "calendar" && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
              <div className={`lg:col-span-2 p-5 rounded-3xl border shadow-sm space-y-4 ${cardBg}`}>
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <h2 className="text-base font-extrabold">
                    {monthCursor.toLocaleDateString("uz-UZ", { month: "long", year: "numeric" })}
                  </h2>
                  <div className="flex gap-1.5">
                    {(["month", "week", "day"] as const).map((v) => (
                      <button
                        key={v}
                        onClick={() => setCalView(v)}
                        className={`px-3 py-1.5 rounded-xl text-xs font-semibold ${
                          calView === v ? "bg-slate-900 text-white dark:bg-blue-600" : subtleBg
                        }`}
                      >
                        {v === "month" ? "Oylik" : v === "week" ? "Haftalik" : "Kunlik"}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="grid grid-cols-7 gap-1.5">
                  {monthGridCells.map((d, i) => {
                    if (!d) return <div key={i} className="h-14" />;
                    const num = Number(d.split("-")[2]);
                    const hasEv = calEvents.some((ev) => ev.date === d);
                    const isToday = d === todayIso;
                    const isSel = d === selectedDate;
                    return (
                      <button
                        key={d}
                        onClick={() => setSelectedDate(d)}
                        className={`h-14 p-1.5 rounded-2xl border text-left flex flex-col justify-between ${
                          isSel ? "border-blue-600 ring-2 ring-blue-500/20" : "border-slate-100 dark:border-slate-800"
                        } ${isToday ? "bg-blue-50/70 dark:bg-blue-950/30" : subtleBg}`}
                      >
                        <span className={`text-xs font-bold ${isToday ? "text-blue-600" : ""}`}>{num}</span>
                        {hasEv && <span className="w-2 h-2 rounded-full bg-blue-600" />}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="space-y-4">
                <form onSubmit={handleSaveCalEvent} className={`p-5 rounded-3xl border shadow-sm space-y-3 ${cardBg}`}>
                  <h3 className="font-bold text-sm">
                    {editEventId ? "Tadbirni tahrirlash" : `${selectedDate} uchun tadbir`}
                  </h3>
                  <input
                    type="text"
                    required
                    value={evTitle}
                    onChange={(e) => setEvTitle(e.target.value)}
                    placeholder="Tadbir nomi..."
                    className={`w-full px-3.5 py-2 rounded-xl border text-xs ${subtleBg}`}
                  />
                  <div className="grid grid-cols-2 gap-2">
                    <input
                      type="time"
                      value={evTime}
                      onChange={(e) => setEvTime(e.target.value)}
                      className={`px-3 py-2 rounded-xl border text-xs ${subtleBg}`}
                    />
                    <select
                      value={evCategory}
                      onChange={(e) => setEvCategory(e.target.value as CalendarItem["category"])}
                      className={`px-3 py-2 rounded-xl border text-xs ${subtleBg}`}
                    >
                      <option value="Tadbir">Tadbir</option>
                      <option value="Eslatma">Eslatma</option>
                      <option value="Vazifa">Vazifa</option>
                      <option value="Muhim sana">Muhim sana</option>
                    </select>
                  </div>
                  <button
                    type="submit"
                    className="w-full py-2.5 rounded-xl bg-slate-900 dark:bg-blue-600 text-white text-xs font-semibold"
                  >
                    {editEventId ? "Yangilash" : "Saqlash"}
                  </button>
                </form>

                <div className={`p-5 rounded-3xl border shadow-sm space-y-2 ${cardBg}`}>
                  <h4 className="font-bold text-xs">Rejalar ro'yxati</h4>
                  {calEvents
                    .filter((ev) => (calView === "day" ? ev.date === selectedDate : true))
                    .map((ev) => (
                      <div key={ev.id} className={`p-3 rounded-2xl flex items-center justify-between text-xs ${subtleBg}`}>
                        <div>
                          <div className="font-bold">{ev.title}</div>
                          <div className={`text-[11px] ${mutedText}`}>
                            {ev.date} • {ev.time} ({ev.category})
                          </div>
                        </div>
                        <div className="flex gap-1">
                          <button
                            onClick={() => {
                              setEditEventId(ev.id);
                              setEvTitle(ev.title);
                              setEvTime(ev.time);
                              setEvCategory(ev.category);
                            }}
                            className="p-1 text-blue-600"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => setCalEvents((prev) => prev.filter((x) => x.id !== ev.id))}
                            className="p-1 text-rose-600"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    ))}
                </div>
              </div>
            </div>
          )}

          {/* ============================================================== */}
          {/* 9. MOBIL OPERATORLAR                                           */}
          {/* ============================================================== */}
          {activeSection === "operators" && (
            <div className="space-y-5">
              <div>
                <h2 className="text-xl font-extrabold">O'zbekiston Mobil Operatorlari</h2>
                <p className={`text-xs ${mutedText}`}>
                  Beeline, Ucell, Uzmobile, Mobiuz va Humans uchun USSD kodlar va tariflar.
                </p>
              </div>

              <div className="flex flex-wrap gap-2">
                {OPERATORS_UZ.map((op) => (
                  <button
                    key={op.id}
                    onClick={() => setSelectedOpId(op.id)}
                    className={`px-4 py-2.5 rounded-2xl text-xs font-extrabold ${
                      selectedOpId === op.id ? op.badgeColor : `${cardBg} border`
                    }`}
                  >
                    {op.name}
                  </button>
                ))}
              </div>

              <div className={`p-6 rounded-3xl border shadow-sm space-y-5 ${cardBg}`}>
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <span className={`px-3 py-1 rounded-full text-xs font-extrabold ${currentOp.badgeColor}`}>
                    {currentOp.name}
                  </span>
                  <div className="flex gap-2">
                    <a
                      href={`tel:${currentOp.supportPhone}`}
                      className="px-3.5 py-2 rounded-xl bg-emerald-600 text-white text-xs font-semibold flex items-center gap-1.5"
                    >
                      <Phone className="w-3.5 h-3.5" />
                      {currentOp.supportPhone}
                    </a>
                    <a
                      href={currentOp.website}
                      target="_blank"
                      rel="noreferrer"
                      className={`px-3.5 py-2 rounded-xl border text-xs font-semibold flex items-center gap-1 ${cardBg}`}
                    >
                      <span>Sayt</span>
                      <ExternalLink className="w-3.5 h-3.5" />
                    </a>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                  {currentOp.ussdList.map((u) => (
                    <button
                      key={u.code}
                      onClick={() => copyText(u.code, u.title)}
                      className={`p-3.5 rounded-2xl border text-left hover:border-blue-500 flex items-center justify-between ${subtleBg}`}
                    >
                      <div>
                        <div className="font-mono font-extrabold text-sm text-blue-600">{u.code}</div>
                        <div className={`text-xs ${mutedText}`}>{u.title}</div>
                      </div>
                      <Copy className="w-4 h-4 text-slate-400" />
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* ============================================================== */}
          {/* 10. TELEFON MA'LUMOTNOMASI                                     */}
          {/* ============================================================== */}
          {activeSection === "directory" && (
            <div className="space-y-5">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <h2 className="text-xl font-extrabold">Tashkilotlar va Muhim Raqamlar</h2>
                  <p className={`text-xs ${mutedText}`}>
                    Favqulodda xizmatlar, banklar, kommunal va transport idoralari.
                  </p>
                </div>
                <input
                  type="text"
                  value={dirQuery}
                  onChange={(e) => setDirQuery(e.target.value)}
                  placeholder="Tashkilot yoki raqam..."
                  className={`px-3.5 py-2 rounded-xl border text-xs w-full sm:w-64 ${cardBg}`}
                />
              </div>

              <div className="flex flex-wrap gap-1.5">
                {[
                  "Barchasi",
                  "Favqulodda xizmatlar",
                  "Banklar",
                  "Davlat tashkilotlari",
                  "Internet provayderlar",
                  "Elektr energiyasi",
                  "Gaz xizmati",
                  "Suv ta'minoti",
                  "Transport",
                  "Aviakompaniyalar",
                  "Universitetlar",
                  "Shifoxona va klinikalar",
                  "Yetkazib berish"
                ].map((cat) => (
                  <button
                    key={cat}
                    onClick={() => setDirCat(cat)}
                    className={`px-3 py-1.5 rounded-full text-xs font-semibold ${
                      dirCat === cat ? "bg-slate-900 text-white dark:bg-blue-600" : subtleBg
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {DIRECTORY_LIST.filter((d) => (dirCat === "Barchasi" ? true : d.category === dirCat))
                  .filter((d) =>
                    !dirQuery.trim()
                      ? true
                      : `${d.name} ${d.phone} ${d.category}`.toLowerCase().includes(dirQuery.toLowerCase())
                  )
                  .map((item) => (
                    <div key={item.id} className={`p-5 rounded-3xl border shadow-sm flex flex-col justify-between space-y-3 ${cardBg}`}>
                      <div>
                        <span className="px-2.5 py-0.5 rounded-full bg-blue-50 text-blue-700 text-[10px] font-bold">
                          {item.category}
                        </span>
                        <h3 className="font-bold text-sm mt-2 mb-1">{item.name}</h3>
                        <p className={`text-xs mb-2 ${mutedText}`}>{item.description}</p>
                        <div className={`text-[11px] ${mutedText}`}>{item.address} • {item.hours}</div>
                      </div>
                      <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center gap-2">
                        <a
                          href={`tel:${item.phone.replace(/\s+/g, "")}`}
                          className="flex-1 py-2 rounded-xl bg-emerald-600 text-white text-xs font-bold flex items-center justify-center gap-1.5"
                        >
                          <Phone className="w-3.5 h-3.5" />
                          <span>{item.phone}</span>
                        </a>
                        <button
                          onClick={() => copyText(item.phone, item.name)}
                          className={`p-2 rounded-xl border ${cardBg}`}
                        >
                          <Copy className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))}
              </div>
            </div>
          )}

          {/* ============================================================== */}
          {/* 11. YANGILIKLAR                                                */}
          {/* ============================================================== */}
          {activeSection === "news" && (
            <div className="space-y-5">
              <div>
                <h2 className="text-xl font-extrabold">Yangiliklar va Texnologiya</h2>
                <p className={`text-xs ${mutedText}`}>
                  O'zbekiston va jahon texnologiya, sun'iy intellekt va koinot yangiliklari.
                </p>
              </div>
              <div className="flex flex-wrap gap-1.5">
                {["Barchasi", "Texnologiya", "AI yangiliklari", "Smartfonlar", "Kompyuterlar", "Koinot", "O'zbekiston yangiliklari"].map(
                  (cat) => (
                    <button
                      key={cat}
                      onClick={() => setNewsCat(cat)}
                      className={`px-3 py-1.5 rounded-full text-xs font-semibold ${
                        newsCat === cat ? "bg-slate-900 text-white dark:bg-blue-600" : subtleBg
                      }`}
                    >
                      {cat}
                    </button>
                  )
                )}
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {NEWS_ARTICLES.filter((n) => (newsCat === "Barchasi" ? true : n.category === newsCat)).map((n) => (
                  <article key={n.id} className={`rounded-3xl border overflow-hidden shadow-sm flex flex-col justify-between ${cardBg}`}>
                    <div>
                      <img
                        src={n.imageUrl}
                        alt={n.title}
                        onError={(e) => {
                          e.currentTarget.src = LAPTOP_FALLBACK_SVG;
                        }}
                        className="w-full h-40 object-cover"
                      />
                      <div className="p-4">
                        <span className="text-[10px] font-bold text-blue-600 uppercase">{n.category} • {n.date}</span>
                        <h3 className="font-bold text-sm mt-1 mb-2">{n.title}</h3>
                        <p className={`text-xs ${mutedText}`}>{n.summary}</p>
                      </div>
                    </div>
                    <div className="px-4 pb-4 flex items-center justify-between">
                      <a href={n.url} target="_blank" rel="noreferrer" className="text-xs font-bold text-blue-600 flex items-center gap-1">
                        <span>Manba</span>
                        <ExternalLink className="w-3.5 h-3.5" />
                      </a>
                      <button
                        onClick={() =>
                          toggleSaveBookmark({
                            id: n.id,
                            type: "Yangilik",
                            title: n.title,
                            subtitle: n.date,
                            section: "news"
                          })
                        }
                        className={`p-2 rounded-xl border ${cardBg}`}
                      >
                        <Bookmark className={`w-3.5 h-3.5 ${isSaved(n.id) ? "fill-blue-600 text-blue-600" : ""}`} />
                      </button>
                    </div>
                  </article>
                ))}
              </div>
            </div>
          )}

          {/* ============================================================== */}
          {/* 12. FOYDALI VOSITALAR                                          */}
          {/* ============================================================== */}
          {activeSection === "tools" && (
            <div className="space-y-5">
              <div>
                <h2 className="text-xl font-extrabold">Foydali Kundalik Vositalar</h2>
                <p className={`text-xs ${mutedText}`}>
                  Ilmiy kalkulyator, valyuta va birlik konvertori, sekundomer, taymer, QR va parol generatori.
                </p>
              </div>
              <div className="flex flex-wrap gap-1.5">
                {[
                  { id: "calc", label: "Kalkulyator" },
                  { id: "curr", label: "Valyuta (UZS)" },
                  { id: "unit", label: "Birliklar" },
                  { id: "time", label: "Sekundomer / Taymer" },
                  { id: "clock", label: "Jahon soati" },
                  { id: "notes", label: "Eslatma / To-Do" },
                  { id: "qr", label: "QR va Parol" },
                  { id: "word", label: "So'z hisoblagich" }
                ].map((t) => (
                  <button
                    key={t.id}
                    onClick={() => setToolTab(t.id)}
                    className={`px-3.5 py-2 rounded-xl text-xs font-semibold ${
                      toolTab === t.id ? "bg-slate-900 text-white dark:bg-blue-600" : subtleBg
                    }`}
                  >
                    {t.label}
                  </button>
                ))}
              </div>

              <div className={`p-6 rounded-3xl border shadow-sm ${cardBg}`}>
                {toolTab === "calc" && (
                  <div className="max-w-xs mx-auto space-y-3">
                    <div className={`p-4 rounded-2xl text-right font-mono text-2xl font-bold ${subtleBg}`}>
                      {calcExpr}
                    </div>
                    <div className="grid grid-cols-4 gap-2">
                      {["C", "DEL", "sin", "cos", "7", "8", "9", "/", "4", "5", "6", "*", "1", "2", "3", "-", "0", ".", "=", "+"].map(
                        (btn) => (
                          <button
                            key={btn}
                            onClick={() => pressCalc(btn)}
                            className={`py-3 rounded-xl font-bold text-xs ${
                              btn === "=" ? "bg-blue-600 text-white" : subtleBg
                            }`}
                          >
                            {btn}
                          </button>
                        )
                      )}
                    </div>
                  </div>
                )}

                {toolTab === "curr" && (
                  <div className="max-w-md mx-auto space-y-3">
                    <div className="grid grid-cols-3 gap-2">
                      <input
                        type="number"
                        value={currVal}
                        onChange={(e) => setCurrVal(e.target.value)}
                        className={`px-3 py-2.5 rounded-xl border text-sm font-bold ${subtleBg}`}
                      />
                      <select
                        value={currFrom}
                        onChange={(e) => setCurrFrom(e.target.value)}
                        className={`px-3 py-2.5 rounded-xl border text-sm font-bold ${subtleBg}`}
                      >
                        {Object.keys(ratesToUzs).map((c) => (
                          <option key={c} value={c}>{c}</option>
                        ))}
                      </select>
                      <select
                        value={currTo}
                        onChange={(e) => setCurrTo(e.target.value)}
                        className={`px-3 py-2.5 rounded-xl border text-sm font-bold ${subtleBg}`}
                      >
                        {Object.keys(ratesToUzs).map((c) => (
                          <option key={c} value={c}>{c}</option>
                        ))}
                      </select>
                    </div>
                    <div className={`p-4 rounded-2xl text-center text-2xl font-extrabold text-blue-600 ${subtleBg}`}>
                      {convertedCurr} {currTo}
                    </div>
                  </div>
                )}

                {toolTab === "unit" && (
                  <div className="max-w-md mx-auto space-y-3">
                    <div className="flex gap-2">
                      {[
                        { id: "length" as const, label: "Uzunlik", a: "km", b: "m" },
                        { id: "weight" as const, label: "Og'irlik", a: "kg", b: "lb" },
                        { id: "temp" as const, label: "Harorat", a: "C", b: "F" }
                      ].map((u) => (
                        <button
                          key={u.id}
                          onClick={() => {
                            setUnitKind(u.id);
                            setUnitFrom(u.a);
                            setUnitTo(u.b);
                          }}
                          className={`px-3 py-1.5 rounded-xl text-xs font-semibold ${
                            unitKind === u.id ? "bg-blue-600 text-white" : subtleBg
                          }`}
                        >
                          {u.label}
                        </button>
                      ))}
                    </div>
                    <div className="grid grid-cols-3 gap-2">
                      <input
                        type="number"
                        value={unitNum}
                        onChange={(e) => setUnitNum(e.target.value)}
                        className={`px-3 py-2 rounded-xl border text-sm font-bold ${subtleBg}`}
                      />
                      <input
                        type="text"
                        value={unitFrom}
                        readOnly
                        className={`px-3 py-2 rounded-xl border text-sm text-center ${subtleBg}`}
                      />
                      <input
                        type="text"
                        value={unitTo}
                        readOnly
                        className={`px-3 py-2 rounded-xl border text-sm text-center ${subtleBg}`}
                      />
                    </div>
                    <div className={`p-4 rounded-2xl text-center text-xl font-extrabold ${subtleBg}`}>
                      {convertedUnitVal} {unitTo}
                    </div>
                  </div>
                )}

                {toolTab === "time" && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-center">
                    <div className={`p-5 rounded-2xl space-y-3 ${subtleBg}`}>
                      <div className="font-bold text-sm">Sekundomer</div>
                      <div className="font-mono text-3xl font-extrabold">{(swTime / 1000).toFixed(1)} s</div>
                      <div className="flex justify-center gap-2">
                        <button
                          onClick={() => setSwActive((s) => !s)}
                          className="px-4 py-2 rounded-xl bg-blue-600 text-white text-xs font-bold"
                        >
                          {swActive ? "Pauza" : "Boshlash"}
                        </button>
                        <button
                          onClick={() => {
                            setSwActive(false);
                            setSwTime(0);
                          }}
                          className={`px-4 py-2 rounded-xl border text-xs font-bold ${cardBg}`}
                        >
                          Nolga
                        </button>
                      </div>
                    </div>
                    <div className={`p-5 rounded-2xl space-y-3 ${subtleBg}`}>
                      <div className="font-bold text-sm">Taymer</div>
                      <div className="font-mono text-3xl font-extrabold">{formatSec(timerLeft)}</div>
                      <div className="flex justify-center gap-2">
                        <button
                          onClick={() => setTimerActive((t) => !t)}
                          className="px-4 py-2 rounded-xl bg-emerald-600 text-white text-xs font-bold"
                        >
                          {timerActive ? "To'xtatish" : "Start"}
                        </button>
                        <button
                          onClick={() => {
                            setTimerActive(false);
                            setTimerLeft(300);
                          }}
                          className={`px-4 py-2 rounded-xl border text-xs font-bold ${cardBg}`}
                        >
                          5 daqiqa
                        </button>
                      </div>
                    </div>
                  </div>
                )}

                {toolTab === "clock" && (
                  <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
                    {[
                      { label: "Samarqand / Toshkent", tz: "Asia/Tashkent" },
                      { label: "London", tz: "Europe/London" },
                      { label: "Nyu-York", tz: "America/New_York" },
                      { label: "Tokio", tz: "Asia/Tokyo" }
                    ].map((z) => (
                      <div key={z.label} className={`p-4 rounded-2xl ${subtleBg}`}>
                        <div className={`text-xs ${mutedText}`}>{z.label}</div>
                        <div className="font-mono text-xl font-extrabold mt-1">
                          {currentTime.toLocaleTimeString("uz-UZ", { timeZone: z.tz })}
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {toolTab === "notes" && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <textarea
                      rows={6}
                      value={quickNotes}
                      onChange={(e) => setQuickNotes(e.target.value)}
                      className={`p-3.5 rounded-2xl border text-xs ${subtleBg}`}
                    />
                    <div className="space-y-2">
                      <form
                        onSubmit={(e) => {
                          e.preventDefault();
                          if (!todoInput.trim()) return;
                          setTodoList((prev) => [...prev, { id: `td-${Date.now()}`, text: todoInput.trim(), done: false }]);
                          setTodoInput("");
                        }}
                        className="flex gap-2"
                      >
                        <input
                          type="text"
                          value={todoInput}
                          onChange={(e) => setTodoInput(e.target.value)}
                          placeholder="Yangi vazifa..."
                          className={`flex-1 px-3 py-2 rounded-xl border text-xs ${subtleBg}`}
                        />
                        <button type="submit" className="px-3.5 py-2 rounded-xl bg-blue-600 text-white text-xs font-bold">
                          Qo'shish
                        </button>
                      </form>
                      {todoList.map((td) => (
                        <div key={td.id} className={`p-2.5 rounded-xl flex items-center justify-between text-xs ${subtleBg}`}>
                          <label className="flex items-center gap-2">
                            <input
                              type="checkbox"
                              checked={td.done}
                              onChange={() =>
                                setTodoList((prev) =>
                                  prev.map((x) => (x.id === td.id ? { ...x, done: !x.done } : x))
                                )
                              }
                            />
                            <span className={td.done ? "line-through opacity-60" : ""}>{td.text}</span>
                          </label>
                          <button onClick={() => setTodoList((prev) => prev.filter((x) => x.id !== td.id))}>
                            <Trash2 className="w-3.5 h-3.5 text-rose-500" />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {toolTab === "qr" && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className={`p-4 rounded-2xl space-y-3 ${subtleBg}`}>
                      <h4 className="font-bold text-sm">QR Kod Generatori</h4>
                      <input
                        type="text"
                        value={qrValue}
                        onChange={(e) => setQrValue(e.target.value)}
                        className={`w-full px-3 py-2 rounded-xl border text-xs ${cardBg}`}
                      />
                      <div className="p-3 bg-white rounded-2xl inline-block border">
                        <svg width="121" height="121" viewBox="0 0 11 11">
                          {Array.from({ length: 121 }).map((_, idx) => {
                            const x = idx % 11;
                            const y = Math.floor(idx / 11);
                            const v = (qrValue.charCodeAt(idx % Math.max(1, qrValue.length)) + x * 5 + y * 11) % 3;
                            const corner = (x < 3 && y < 3) || (x > 7 && y < 3) || (x < 3 && y > 7);
                            return <rect key={idx} x={x} y={y} width="1" height="1" fill={corner || v === 0 ? "#0f172a" : "#fff"} />;
                          })}
                        </svg>
                      </div>
                    </div>

                    <div className={`p-4 rounded-2xl space-y-3 ${subtleBg}`}>
                      <h4 className="font-bold text-sm">Parol Generatori ({passLength} belgi)</h4>
                      <input
                        type="range"
                        min={8}
                        max={32}
                        value={passLength}
                        onChange={(e) => setPassLength(Number(e.target.value))}
                      />
                      <label className="flex items-center gap-2 text-xs">
                        <input
                          type="checkbox"
                          checked={passWithSymbols}
                          onChange={(e) => setPassWithSymbols(e.target.checked)}
                        />
                        Maxsus belgilar (!@#$%)
                      </label>
                      <div className={`p-3 rounded-xl font-mono text-xs font-bold flex items-center justify-between ${cardBg}`}>
                        <span>{passOutput}</span>
                        <button onClick={() => copyText(passOutput, "Parol")}>
                          <Copy className="w-4 h-4 text-blue-600" />
                        </button>
                      </div>
                      <button
                        onClick={() => {
                          const base = "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz23456789";
                          const pool = passWithSymbols ? base + "!@#$%^&*" : base;
                          let res = "";
                          for (let i = 0; i < passLength; i++) {
                            res += pool[Math.floor(Math.random() * pool.length)];
                          }
                          setPassOutput(res);
                        }}
                        className="px-4 py-2 rounded-xl bg-blue-600 text-white text-xs font-semibold"
                      >
                        Yangi parol yaratish
                      </button>
                    </div>
                  </div>
                )}

                {toolTab === "word" && (
                  <div className="space-y-3">
                    <div className="text-xs font-bold text-blue-600">
                      So'zlar: {wordText.trim() ? wordText.trim().split(/\s+/).length : 0} • Belgilar: {wordText.length}
                    </div>
                    <textarea
                      rows={6}
                      value={wordText}
                      onChange={(e) => setWordText(e.target.value)}
                      className={`w-full p-4 rounded-2xl border text-xs sm:text-sm ${subtleBg}`}
                    />
                  </div>
                )}
              </div>
            </div>
          )}

          {/* ============================================================== */}
          {/* 13. AI VOSITALAR KATALOGI                                      */}
          {/* ============================================================== */}
          {activeSection === "aitools" && (
            <div className="space-y-5">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <h2 className="text-xl font-extrabold">Foydali AI Vositalar Katalogi</h2>
                  <p className={`text-xs ${mutedText}`}>
                    Matn, dizayn, dasturlash va qidiruv uchun eng yaxshi AI platformalar.
                  </p>
                </div>
                <input
                  type="text"
                  value={aiToolQuery}
                  onChange={(e) => setAiToolQuery(e.target.value)}
                  placeholder="AI vosita qidirish..."
                  className={`px-3.5 py-2 rounded-xl border text-xs ${cardBg}`}
                />
              </div>
              <div className="flex flex-wrap gap-1.5">
                {["Barchasi", "Matn va Yordamchi", "Dasturlash va Tahlil", "Rasm va Dizayn", "Qidiruv va Tadqiqot"].map(
                  (cat) => (
                    <button
                      key={cat}
                      onClick={() => setAiToolCat(cat)}
                      className={`px-3 py-1.5 rounded-full text-xs font-semibold ${
                        aiToolCat === cat ? "bg-slate-900 text-white dark:bg-blue-600" : subtleBg
                      }`}
                    >
                      {cat}
                    </button>
                  )
                )}
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {AI_TOOLS_LIST.filter((t) => (aiToolCat === "Barchasi" ? true : t.category === aiToolCat))
                  .filter((t) =>
                    !aiToolQuery.trim()
                      ? true
                      : `${t.name} ${t.description}`.toLowerCase().includes(aiToolQuery.toLowerCase())
                  )
                  .map((tool) => (
                    <div key={tool.id} className={`p-5 rounded-3xl border shadow-sm flex flex-col justify-between space-y-3 ${cardBg}`}>
                      <div>
                        <span className="px-2.5 py-0.5 rounded-full bg-indigo-50 text-indigo-700 text-[10px] font-bold">
                          {tool.category}
                        </span>
                        <h3 className="font-bold text-sm mt-2 mb-1">{tool.name}</h3>
                        <p className={`text-xs ${mutedText}`}>{tool.description}</p>
                      </div>
                      <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs">
                        <span className="font-semibold text-emerald-600">{tool.pricing}</span>
                        <a href={tool.url} target="_blank" rel="noreferrer" className="font-bold text-blue-600 flex items-center gap-1">
                          <span>Ochish</span>
                          <ExternalLink className="w-3 h-3" />
                        </a>
                      </div>
                    </div>
                  ))}
              </div>
            </div>
          )}

          {/* ============================================================== */}
          {/* 14. SAQLANGANLAR                                               */}
          {/* ============================================================== */}
          {activeSection === "bookmarks" && (
            <div className="space-y-5">
              <h2 className="text-xl font-extrabold">Saqlangan Kontentlar ({bookmarks.length})</h2>
              {bookmarks.length === 0 ? (
                <div className={`p-8 rounded-3xl border text-center text-xs ${cardBg} ${mutedText}`}>
                  Hozircha saqlangan elementlar yo'q.
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {bookmarks.map((b) => (
                    <div key={b.id} className={`p-4 rounded-2xl border shadow-sm flex items-center justify-between gap-2 ${cardBg}`}>
                      <div onClick={() => setActiveSection(b.section)} className="min-w-0 flex-1 cursor-pointer">
                        <span className="px-2 py-0.5 rounded bg-blue-50 text-blue-700 text-[10px] font-bold">{b.type}</span>
                        <div className="font-bold text-xs truncate mt-1">{b.title}</div>
                        <div className={`text-[11px] truncate ${mutedText}`}>{b.subtitle}</div>
                      </div>
                      <button
                        onClick={() => setBookmarks((prev) => prev.filter((x) => x.id !== b.id))}
                        className="p-2 text-rose-600"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* ============================================================== */}
          {/* 15. PROFIL (GOOGLE & +998 PHONE AUTH)                          */}
          {/* ============================================================== */}
          {activeSection === "profile" && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
              <div className={`p-6 rounded-3xl border shadow-sm space-y-4 ${cardBg}`}>
                <div className="flex items-center gap-3.5">
                  <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-600 to-indigo-700 text-white text-2xl font-extrabold flex items-center justify-center">
                    {auth.avatarLetter}
                  </div>
                  <div>
                    <h2 className="font-extrabold text-base">{auth.name}</h2>
                    <p className={`text-xs ${mutedText}`}>{auth.identifier}</p>
                    <span className="inline-block mt-1 px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 text-[10px] font-bold">
                      {auth.provider === "google"
                        ? "Google orqali tasdiqlangan"
                        : auth.provider === "phone"
                        ? "Telefon (+998) tasdiqlangan"
                        : "Mehmon rejimi"}
                    </span>
                  </div>
                </div>

                {auth.isAuthenticated ? (
                  <button
                    onClick={() => {
                      setAuth({
                        isAuthenticated: false,
                        provider: "guest",
                        name: "Mehmon Foydalanuvchi",
                        identifier: "Hisobga kirilmagan",
                        avatarLetter: "V"
                      });
                      notify("Tizimdan chiqildi");
                    }}
                    className="w-full py-2.5 rounded-xl bg-rose-600 text-white text-xs font-semibold flex items-center justify-center gap-1.5"
                  >
                    <LogOut className="w-4 h-4" />
                    Chiqish
                  </button>
                ) : (
                  <button
                    onClick={() => setAuthModalOpen(true)}
                    className="w-full py-2.5 rounded-xl bg-blue-600 text-white text-xs font-semibold flex items-center justify-center gap-1.5"
                  >
                    <LogIn className="w-4 h-4" />
                    Google yoki Telefon orqali kirish
                  </button>
                )}
              </div>

              <div className={`lg:col-span-2 p-6 rounded-3xl border shadow-sm space-y-4 ${cardBg}`}>
                <h3 className="font-bold text-sm">Akkaunt statistikasi va qidiruv tarixi</h3>
                <div className="grid grid-cols-3 gap-3 text-center">
                  <div className={`p-4 rounded-2xl ${subtleBg}`}>
                    <div className="text-xl font-extrabold">{bookmarks.length}</div>
                    <div className={`text-xs ${mutedText}`}>Saqlanganlar</div>
                  </div>
                  <div className={`p-4 rounded-2xl ${subtleBg}`}>
                    <div className="text-xl font-extrabold">{tracks.filter((t) => t.isCustom).length}</div>
                    <div className={`text-xs ${mutedText}`}>Shaxsiy musiqa</div>
                  </div>
                  <div className={`p-4 rounded-2xl ${subtleBg}`}>
                    <div className="text-xl font-extrabold">{calEvents.length}</div>
                    <div className={`text-xs ${mutedText}`}>Kalendar rejalari</div>
                  </div>
                </div>
                <div>
                  <div className="text-xs font-bold mb-2">So'nggi qidiruvlar:</div>
                  <div className="flex flex-wrap gap-2">
                    {searchHistory.map((item, i) => (
                      <button
                        key={i}
                        onClick={() => setGlobalSearch(item)}
                        className={`px-3 py-1 rounded-full text-xs ${subtleBg}`}
                      >
                        {item}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ============================================================== */}
          {/* 16. ALOQA (CONTACT SECTION WITH @roz1matoff_me)                */}
          {/* ============================================================== */}
          {activeSection === "contact" && (
            <div className="max-w-3xl mx-auto space-y-5">
              <div className={`p-6 rounded-3xl border shadow-sm space-y-4 ${cardBg}`}>
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div>
                    <span className="px-3 py-1 rounded-full bg-sky-50 text-sky-700 text-xs font-bold">
                      Aloqa va Qo'llab-quvvatlash
                    </span>
                    <h2 className="text-xl font-extrabold mt-2">VerMix Loyihasi Bilan Bog'lanish</h2>
                    <p className={`text-xs mt-1 ${mutedText}`}>
                      Takliflar, hamkorlik yoki texnik savollar uchun bevosita Telegram orqali murojaat qiling.
                    </p>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <a
                      href="https://t.me/roz1matoff_me"
                      target="_blank"
                      rel="noreferrer"
                      className="px-4 py-2.5 rounded-2xl bg-sky-500 hover:bg-sky-600 text-white text-xs font-bold flex items-center gap-2 shadow-sm"
                    >
                      <Send className="w-4 h-4" />
                      <span>Telegram: @roz1matoff_me</span>
                    </a>
                    <button
                      onClick={() => copyText("@roz1matoff_me", "Telegram username")}
                      className={`px-3.5 py-2.5 rounded-2xl border text-xs font-semibold flex items-center gap-1.5 ${cardBg}`}
                    >
                      <Copy className="w-3.5 h-3.5" />
                      <span>Nusxalash</span>
                    </button>
                  </div>
                </div>
              </div>

              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  if (!contactName.trim() || !contactMsg.trim()) return;
                  notify("Xabaringiz tayyorlandi! Telegram (@roz1matoff_me) orqali yuborishingiz mumkin.");
                  setContactName("");
                  setContactMsg("");
                }}
                className={`p-6 rounded-3xl border shadow-sm space-y-3 ${cardBg}`}
              >
                <h3 className="font-bold text-sm">Tezkor xabar qoldirish</h3>
                <input
                  type="text"
                  required
                  value={contactName}
                  onChange={(e) => setContactName(e.target.value)}
                  placeholder="Ismingiz yoki Telegram username..."
                  className={`w-full px-4 py-2.5 rounded-xl border text-xs ${subtleBg}`}
                />
                <textarea
                  rows={4}
                  required
                  value={contactMsg}
                  onChange={(e) => setContactMsg(e.target.value)}
                  placeholder="Xabaringiz mazmuni..."
                  className={`w-full px-4 py-2.5 rounded-xl border text-xs ${subtleBg}`}
                />
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <button
                    type="submit"
                    className="px-5 py-2.5 rounded-xl bg-slate-900 dark:bg-blue-600 text-white text-xs font-semibold"
                  >
                    Xabarni yuborish
                  </button>
                  <a
                    href="https://t.me/roz1matoff_me"
                    target="_blank"
                    rel="noreferrer"
                    className="text-xs font-bold text-sky-600 hover:underline"
                  >
                    To'g'ridan-to'g'ri t.me/roz1matoff_me ga o'tish →
                  </a>
                </div>
              </form>
            </div>
          )}

          {/* ============================================================== */}
          {/* 17. SOZLAMALAR & RAILWAY DEPLOYMENT GUIDE                      */}
          {/* ============================================================== */}
          {activeSection === "settings" && (
            <div className="max-w-2xl space-y-4">
              <h2 className="text-xl font-extrabold">Sozlamalar va Railway Joylash Qo'llanmasi</h2>
              <div className={`p-5 rounded-3xl border shadow-sm space-y-4 ${cardBg}`}>
                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-bold text-sm">Interfeys mavzusi</div>
                    <div className={`text-xs ${mutedText}`}>Standart: Sof oq (#FFFFFF)</div>
                  </div>
                  <button
                    onClick={() => setDarkMode((d) => !d)}
                    className="px-4 py-2 rounded-xl bg-slate-900 dark:bg-blue-600 text-white text-xs font-semibold"
                  >
                    {darkMode ? "Oq rejimga o'tish" : "Tungi rejimga o'tish"}
                  </button>
                </div>

                <div className={`p-4 rounded-2xl space-y-2 text-xs ${subtleBg}`}>
                  <div className="font-bold text-sm flex items-center gap-1.5">
                    <Shield className="w-4 h-4 text-blue-600" />
                    Railway.app va Haqiqiy Auth (Google + SMS) sozlamalari
                  </div>
                  <p className={mutedText}>
                    Loyihani Railway serveriga joylaganingizda haqiqiy Google OAuth va +998 SMS OTP ishlashi uchun Railway Variables bo'limiga quyidagi kalitlarni qo'shing:
                  </p>
                  <pre className="p-3 rounded-xl bg-slate-900 text-slate-100 text-[11px] overflow-x-auto">
{`VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-public-anon-key
GEMINI_API_KEY=your-server-gemini-key`}
                  </pre>
                </div>

                <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                  <div className="text-xs font-bold">Mahalliy keshni tozalash</div>
                  <button
                    onClick={() => {
                      try {
                        window.localStorage.clear();
                      } catch {}
                      notify("Barcha ma'lumotlar tozalandi");
                      window.setTimeout(() => window.location.reload(), 700);
                    }}
                    className="px-4 py-2 rounded-xl bg-rose-600 text-white text-xs font-semibold"
                  >
                    Tozalash
                  </button>
                </div>
              </div>
            </div>
          )}
        </main>
      </div>

      {/* ================================================================== */}
      {/* AUTHENTICATION MODAL (GOOGLE & +998 PHONE NUMBER OTP)              */}
      {/* ================================================================== */}
      {authModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
          <div className={`max-w-md w-full rounded-3xl border p-6 shadow-2xl space-y-4 ${cardBg}`}>
            <div className="flex items-center justify-between">
              <h3 className="font-extrabold text-base">VerMix Hisobga Kirish</h3>
              <button onClick={() => setAuthModalOpen(false)} className="p-1.5 rounded-xl hover:bg-slate-100">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="grid grid-cols-2 gap-2 p-1 rounded-2xl bg-slate-100 dark:bg-slate-800">
              <button
                onClick={() => {
                  setAuthTab("google");
                  setAuthError("");
                }}
                className={`py-2 rounded-xl text-xs font-bold transition ${
                  authTab === "google" ? "bg-white dark:bg-slate-900 shadow-sm" : ""
                }`}
              >
                Google orqali
              </button>
              <button
                onClick={() => {
                  setAuthTab("phone");
                  setAuthError("");
                }}
                className={`py-2 rounded-xl text-xs font-bold transition ${
                  authTab === "phone" ? "bg-white dark:bg-slate-900 shadow-sm" : ""
                }`}
              >
                Telefon (+998)
              </button>
            </div>

            {authTab === "google" ? (
              <form onSubmit={handleGoogleAuth} className="space-y-3">
                <p className={`text-xs ${mutedText}`}>
                  Google akkauntingiz ma'lumotlarini kiriting va shaxsiy kabinetga kiring.
                </p>
                <input
                  type="text"
                  value={googleNameInput}
                  onChange={(e) => setGoogleNameInput(e.target.value)}
                  placeholder="Ismingiz (masalan: Azizbek)"
                  className={`w-full px-3.5 py-2.5 rounded-xl border text-xs ${subtleBg}`}
                />
                <input
                  type="email"
                  required
                  value={googleEmailInput}
                  onChange={(e) => setGoogleEmailInput(e.target.value)}
                  placeholder="example@gmail.com"
                  className={`w-full px-3.5 py-2.5 rounded-xl border text-xs ${subtleBg}`}
                />
                {authError && <p className="text-xs text-rose-600">{authError}</p>}
                <button
                  type="submit"
                  className="w-full py-2.5 rounded-xl bg-slate-900 dark:bg-blue-600 text-white text-xs font-bold flex items-center justify-center gap-2"
                >
                  <Globe className="w-4 h-4" />
                  Google bilan davom etish
                </button>
              </form>
            ) : !otpSent ? (
              <form onSubmit={handleSendOtp} className="space-y-3">
                <p className={`text-xs ${mutedText}`}>
                  O'zbekiston telefon raqamingizni kiriting — SMS tasdiqlash kodi yuboriladi.
                </p>
                <input
                  type="tel"
                  required
                  value={phoneInput}
                  onChange={(e) => setPhoneInput(e.target.value)}
                  placeholder="+998 90 123 45 67"
                  className={`w-full px-3.5 py-2.5 rounded-xl border text-xs font-mono ${subtleBg}`}
                />
                {authError && <p className="text-xs text-rose-600">{authError}</p>}
                <button
                  type="submit"
                  className="w-full py-2.5 rounded-xl bg-blue-600 text-white text-xs font-bold"
                >
                  SMS kod olish
                </button>
              </form>
            ) : (
              <form onSubmit={handleVerifyOtp} className="space-y-3">
                <p className={`text-xs ${mutedText}`}>
                  <strong>{phoneInput}</strong> raqamiga yuborilgan 4 xonali kodni kiriting (Demo kod: <strong>{demoOtpCode}</strong>).
                </p>
                <input
                  type="text"
                  required
                  maxLength={6}
                  value={otpInput}
                  onChange={(e) => setOtpInput(e.target.value)}
                  placeholder="4 xonali kod"
                  className={`w-full px-3.5 py-2.5 rounded-xl border text-center font-mono text-base font-bold ${subtleBg}`}
                />
                {authError && <p className="text-xs text-rose-600">{authError}</p>}
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => setOtpSent(false)}
                    className={`flex-1 py-2.5 rounded-xl border text-xs font-semibold ${cardBg}`}
                  >
                    Orqaga
                  </button>
                  <button
                    type="submit"
                    className="flex-1 py-2.5 rounded-xl bg-emerald-600 text-white text-xs font-bold"
                  >
                    Tasdiqlash
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}

      {/* ================================================================== */}
      {/* PERSISTENT BOTTOM MINI MUSIC PLAYER                                */}
      {/* ================================================================== */}
      <footer
        className={`fixed bottom-0 left-0 right-0 lg:left-64 z-30 border-t backdrop-blur-md px-4 py-2.5 ${
          darkMode ? "bg-slate-900/95 border-slate-800" : "bg-white/95 border-slate-200"
        }`}
      >
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
          <div className="flex items-center gap-3 min-w-0">
            <img
              src={currentTrack.coverUrl}
              alt={currentTrack.title}
              onError={(e) => {
                e.currentTarget.src = LAPTOP_FALLBACK_SVG;
              }}
              className="w-10 h-10 rounded-xl object-cover shrink-0"
            />
            <div className="min-w-0">
              <div className="text-xs font-bold truncate">{currentTrack.title}</div>
              <div className={`text-[11px] truncate ${mutedText}`}>{currentTrack.artist}</div>
            </div>
          </div>

          <div className="flex flex-col items-center gap-1 flex-1 max-w-md">
            <div className="flex items-center gap-3">
              <button onClick={playPrevTrack} className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800">
                <SkipBack className="w-4 h-4" />
              </button>
              <button
                onClick={() => setIsPlaying((p) => !p)}
                className="w-9 h-9 rounded-full bg-slate-900 dark:bg-blue-600 text-white flex items-center justify-center shadow-sm"
              >
                {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4 ml-0.5" />}
              </button>
              <button onClick={playNextTrack} className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800">
                <SkipForward className="w-4 h-4" />
              </button>
            </div>
            <div className="w-full hidden sm:flex items-center gap-2 text-[10px] font-mono">
              <span>{formatSec(progressSec)}</span>
              <input
                type="range"
                min={0}
                max={Math.max(1, currentTrack.durationSec)}
                value={progressSec}
                onChange={(e) => {
                  const nextSec = Number(e.target.value);
                  setProgressSec(nextSec);
                  if (htmlAudioRef.current && currentTrack.audioUrl) {
                    htmlAudioRef.current.currentTime = nextSec;
                  }
                }}
                className="flex-1 h-1 accent-blue-600 cursor-pointer"
              />
              <span>{formatSec(currentTrack.durationSec)}</span>
            </div>
          </div>

          <div className="hidden md:flex items-center gap-2">
            <button onClick={() => setMuted((m) => !m)} className="p-1.5">
              {muted ? <VolumeX className="w-4 h-4 text-rose-500" /> : <Volume2 className="w-4 h-4" />}
            </button>
            <input
              type="range"
              min={0}
              max={1}
              step={0.05}
              value={muted ? 0 : volume}
              onChange={(e) => {
                setMuted(false);
                setVolume(Number(e.target.value));
              }}
              className="w-20 h-1 accent-blue-600 cursor-pointer"
            />
          </div>
        </div>
      </footer>
    </div>
  );
}