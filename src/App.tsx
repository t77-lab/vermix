import React, { useState, useEffect, useRef } from 'react';
import {
  Home, Image as ImageIcon, Music, Video, Laptop, Smartphone, Bot, Calendar as CalendarIcon,
  PhoneCall, BookOpen, Newspaper, Wrench, Sparkles, Bookmark, User, Settings, Search,
  Sun, Moon, Menu, X, Plus, Heart, Share2, ExternalLink, Copy, Check, Play, Pause,
  SkipBack, SkipForward, Volume2, VolumeX, Upload, Send, Trash2, Edit3, Clock,
  CloudSun, Compass, ShieldCheck, Globe, Calculator, QrCode, KeyRound, FileText,
  ChevronRight, Star, SlidersHorizontal, ArrowLeftRight, AlertCircle, CheckCircle2,
  LogOut, LogIn, MessageCircle, Server, Eye, EyeOff, RefreshCw, Timer, Watch
} from 'lucide-react';
import { supabase } from './supabaseClient';

// --- TYPES ---
type SectionId =
  | 'home' | 'pinterest' | 'music' | 'videos' | 'computers' | 'smartphones'
  | 'ai-assistant' | 'calendar' | 'operators' | 'directory' | 'news'
  | 'tools' | 'ai-tools' | 'bookmarks' | 'profile' | 'settings' | 'contact';

interface UserProfile {
  id?: string;
  name: string;
  email: string;
  phone: string;
  avatar: string;
  provider?: 'google' | 'phone' | 'demo';
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

interface TrackItem {
  id: string;
  title: string;
  artist: string;
  album: string;
  category: string;
  cover: string;
  audioUrl: string;
  duration: string;
  isCustom?: boolean;
}

interface VideoItem {
  id: string;
  platform: 'YouTube' | 'Instagram' | 'TikTok';
  originalUrl: string;
  embedUrl: string;
  title: string;
  addedAt: string;
}

interface ComputerItem {
  id: string;
  brand: string;
  model: string;
  year: number;
  processor: string;
  ram: string;
  storage: string;
  gpu: string;
  display: string;
  battery: string;
  price: string;
  image: string;
  description: string;
  pros: string[];
  cons: string[];
}

interface PhoneItem {
  id: string;
  brand: string;
  model: string;
  releaseDate: string;
  display: string;
  processor: string;
  ramStorage: string;
  mainCamera: string;
  frontCamera: string;
  battery: string;
  charging: string;
  os: string;
  price: string;
  image: string;
}

interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
  attachmentName?: string;
}

interface CalendarEvent {
  id: string;
  title: string;
  date: string;
  time: string;
  color: string;
  notes: string;
  completed?: boolean;
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
  type: 'Rasm' | 'Musiqa' | 'Video' | 'Qurilma' | 'Maqola' | 'Raqam';
  title: string;
  subtitle: string;
  section: SectionId;
}

// --- VERIFIED & CURATED DATA ---
const INITIAL_PINS: PinItem[] = [
  { id: 'p1', title: 'Minimalist Ish Stoli Setup 2026', category: 'Texnologiya', image: 'https://images.unsplash.com/photo-1593642632823-8f785ba67e45?auto=format&fit=crop&w=800&q=80', author: 'StudioNord', likes: 342, board: 'Ish joyi' },
  { id: 'p2', title: 'Samarqand Registon Tungi Manzarasi', category: 'Sayohat', image: 'https://images.unsplash.com/photo-1596484552834-6a58f850e0a1?auto=format&fit=crop&w=800&q=80', author: 'UzTravel', likes: 890, board: 'O‘zbekiston' },
  { id: 'p3', title: 'Zamonaviy UI/UX Dizayn Tizimi', category: 'Dizayn', image: 'https://images.unsplash.com/photo-1561070791-2526d30994b5?auto=format&fit=crop&w=800&q=80', author: 'LinearCraft', likes: 512, board: 'Dizayn' },
  { id: 'p4', title: 'Skandinaviya Arxitekturasi', category: 'Arxitektura', image: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=800&q=80', author: 'ArchDaily', likes: 418, board: 'Interyer' },
  { id: 'p5', title: 'Kiberxavfsizlik va Server Xonasi', category: 'Texnologiya', image: 'https://images.unsplash.com/photo-1558494949-ef010cbdcc31?auto=format&fit=crop&w=800&q=80', author: 'NetCore', likes: 276, board: 'Texnologiya' },
  { id: 'p6', title: 'Minimalist Qahva va Tonggi Reja', category: 'Hayot tarzi', image: 'https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?auto=format&fit=crop&w=800&q=80', author: 'MorningBrew', likes: 625, board: 'Hayot tarzi' },
  { id: 'p7', title: 'Kosmik Tumanlik va Yulduzlar', category: 'Koinot', image: 'https://images.unsplash.com/photo-1462331940025-496dfbfc7564?auto=format&fit=crop&w=800&q=80', author: 'AstroHub', likes: 940, board: 'Koinot' },
  { id: 'p8', title: 'Mexanik Klaviatura Custom Keycaps', category: 'Texnologiya', image: 'https://images.unsplash.com/photo-1595225476474-87563907a212?auto=format&fit=crop&w=800&q=80', author: 'KeyForge', likes: 489, board: 'Ish joyi' },
];

const INITIAL_TRACKS: TrackItem[] = [
  {
    id: 't1',
    title: 'Toshkent Oqshomi (Ambient)',
    artist: 'VerMix Studio',
    album: 'Digital Horizons',
    category: 'Fokus',
    cover: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?auto=format&fit=crop&w=400&q=80',
    audioUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3',
    duration: '06:12',
  },
  {
    id: 't2',
    title: 'Kodlash Ritmi (Lo-Fi Beats)',
    artist: 'SynthWave UZ',
    album: 'Deep Work Vol. 1',
    category: 'Lo-Fi',
    cover: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?auto=format&fit=crop&w=400&q=80',
    audioUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3',
    duration: '07:05',
  },
  {
    id: 't3',
    title: 'Ipak Yo‘li Sadosi',
    artist: 'Samarkand Acoustic',
    album: 'Sharq Melodiyalari',
    category: 'Milliy & Chill',
    cover: 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?auto=format&fit=crop&w=400&q=80',
    audioUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-3.mp3',
    duration: '05:44',
  },
  {
    id: 't4',
    title: 'Kechki Trassa (Electronic)',
    artist: 'Nova Pulse',
    album: 'Midnight Drive',
    category: 'Elektron',
    cover: 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?auto=format&fit=crop&w=400&q=80',
    audioUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-4.mp3',
    duration: '05:02',
  },
];

const COMPUTERS_DB: ComputerItem[] = [
  {
    id: 'c1', brand: 'Apple', model: 'MacBook Pro 14 (M4 Pro)', year: 2024,
    processor: 'Apple M4 Pro (12-core CPU)', ram: '24 GB Unified', storage: '512 GB SSD',
    gpu: '16-core Apple GPU', display: '14.2" Liquid Retina XDR, 120Hz', battery: '72.4 Wh (22 soatgacha)',
    price: '$1,999', image: 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?auto=format&fit=crop&w=800&q=80',
    description: 'Professional dasturlash, 3D grafika va video montaj uchun yuqori unumdorlikka ega ixcham flagman noutbuk.',
    pros: ['Ajoyib avtonomlik', 'Yorqin mini-LED ekran', 'Shovqinsiz ishlash'], cons: ['Yuqori narx', 'Xotirani keyin kengaytirib bo‘lmaydi']
  },
  {
    id: 'c2', brand: 'ASUS', model: 'ROG Zephyrus G16 (2024)', year: 2024,
    processor: 'Intel Core Ultra 9 185H', ram: '32 GB LPDDR5X', storage: '1 TB PCIe 4.0 SSD',
    gpu: 'NVIDIA GeForce RTX 4070 8GB', display: '16" 2.5K OLED, 240Hz', battery: '90 Wh (10 soatgacha)',
    price: '$1,899', image: 'https://images.unsplash.com/photo-1603302576837-37561b2e2302?auto=format&fit=crop&w=800&q=80',
    description: 'Yupqa alyuminiy korpusda o‘yinlar va og‘ir grafik ishlar uchun mo‘ljallangan OLED ekranli noutbuk.',
    pros: ['240Hz OLED displey', 'Yengil (1.85 kg) o‘yin noutbuki', 'Kuchli dinamiklar'], cons: ['Yuklama ostida qiziydi', 'RAM lehimlangan']
  },
  {
    id: 'c3', brand: 'Lenovo', model: 'ThinkPad X1 Carbon Gen 12', year: 2024,
    processor: 'Intel Core Ultra 7 155H', ram: '32 GB LPDDR5X', storage: '1 TB NVMe SSD',
    gpu: 'Intel Arc Graphics', display: '14" 2.8K OLED, 120Hz', battery: '57 Wh (14 soatgacha)',
    price: '$1,749', image: 'https://images.unsplash.com/photo-1588872657578-7efd1f1555ed?auto=format&fit=crop&w=800&q=80',
    description: 'Biznes va korporativ foydalanuvchilar uchun afsonaviy klaviatura va mustahkam karbon korpusli ultrabuk.',
    pros: ['Atigi 1.09 kg vazn', 'Eng qulay klaviatura', 'MIL-STD-810H chidamlilik'], cons: ['O‘yinlar uchun emas', 'Narxi qimmatroq']
  },
  {
    id: 'c4', brand: 'HP', model: 'Spectre x360 14 (2024)', year: 2024,
    processor: 'Intel Core Ultra 7 155H', ram: '16 GB LPDDR5X', storage: '1 TB SSD',
    gpu: 'Intel Arc Graphics', display: '14" 2.8K OLED Touch, 120Hz', battery: '68 Wh (13 soatgacha)',
    price: '$1,499', image: 'https://images.unsplash.com/photo-1544731612-de7f96afe55f?auto=format&fit=crop&w=800&q=80',
    description: '360 daraja bukiluvchi sensor ekran va stilus qo‘llab-quvvatlovchi premium transformer noutbuk.',
    pros: ['9MP sifatli veb-kamera', 'Ajoyib dizayn va OLED ekran', 'Stilus to‘plamda'], cons: ['Portlar soni kam (3 ta)']
  },
  {
    id: 'c5', brand: 'Dell', model: 'XPS 14 (9440)', year: 2024,
    processor: 'Intel Core Ultra 7 155H', ram: '32 GB LPDDR5X', storage: '1 TB SSD',
    gpu: 'NVIDIA RTX 4050 6GB', display: '14.5" 3.2K OLED Touch', battery: '69.5 Wh (12 soatgacha)',
    price: '$1,849', image: 'https://images.unsplash.com/photo-1593642702821-c8da6771f0c6?auto=format&fit=crop&w=800&q=80',
    description: 'Cheksiz ramkali InfinityEdge displey va CNC alyuminiy korpusga ega zamonaviy ultrabuk.',
    pros: ['Premium yig‘ilish sifati', 'Diskret RTX 4050 video karta', 'Ixcham o‘lcham'], cons: ['Sensorli F-tugmalar qatori']
  },
  {
    id: 'c6', brand: 'Acer', model: 'Swift Go 14 OLED', year: 2024,
    processor: 'Intel Core Ultra 7 155H', ram: '16 GB LPDDR5X', storage: '512 GB SSD',
    gpu: 'Intel Arc Graphics', display: '14" 2.8K OLED, 90Hz', battery: '65 Wh (11 soatgacha)',
    price: '$899', image: 'https://images.unsplash.com/photo-1496181133206-80ce9b88a853?auto=format&fit=crop&w=800&q=80',
    description: 'Hamyonbop narxda yorqin OLED ekran va yangi avlod protsessorini taklif etuvchi kundalik noutbuk.',
    pros: ['Narx/sifat nisbati zo‘r', 'Ko‘p portlar (HDMI, USB-A, USB-C)', 'Yengil'], cons: ['Dinamiklar ovozi o‘rtacha']
  },
  {
    id: 'c7', brand: 'MSI', model: 'Raider GE78 HX 14V', year: 2024,
    processor: 'Intel Core i9-14900HX (24-core)', ram: '32 GB DDR5', storage: '2 TB NVMe SSD',
    gpu: 'NVIDIA GeForce RTX 4080 12GB', display: '17" QHD+ IPS, 240Hz', battery: '99.9 Wh (6 soatgacha)',
    price: '$2,699', image: 'https://images.unsplash.com/photo-1525547719571-a2d4ac8945e2?auto=format&fit=crop&w=800&q=80',
    description: 'Maksimal FPS va og‘ir muhandislik hisob-kitoblari uchun yaratilgan ekstremal o‘yin stansiyasi.',
    pros: ['Desktop darajasidagi quvvat', 'Kuchli sovutish tizimi', 'RGB Matrix chiroqlar'], cons: ['Og‘ir (3.1 kg)', 'Katta quvvat bloki']
  },
  {
    id: 'c8', brand: 'Microsoft', model: 'Surface Laptop 7 (13.8")', year: 2024,
    processor: 'Snapdragon X Elite (12-core)', ram: '16 GB LPDDR5X', storage: '512 GB SSD',
    gpu: 'Qualcomm Adreno GPU', display: '13.8" PixelSense Flow, 120Hz', battery: '54 Wh (20 soatgacha)',
    price: '$1,199', image: 'https://images.unsplash.com/photo-1531297484001-80022131f5a1?auto=format&fit=crop&w=800&q=80',
    description: 'Copilot+ AI imkoniyatlari va rekord darajadagi batareya ishlash vaqtiga ega Windows ultrabuki.',
    pros: ['20 soatgacha batareya', 'Haptic touchpad', 'Yorqin 120Hz sensor ekran'], cons: ['Ba’zi eski x86 dasturlar emulyatsiyada ishlaydi']
  },
  {
    id: 'c9', brand: 'Samsung', model: 'Galaxy Book4 Pro 14', year: 2024,
    processor: 'Intel Core Ultra 7 155H', ram: '16 GB LPDDR5X', storage: '512 GB SSD',
    gpu: 'Intel Arc Graphics', display: '14" Dynamic AMOLED 2X, 120Hz', battery: '63 Wh (14 soatgacha)',
    price: '$1,349', image: 'https://images.unsplash.com/photo-1611186871348-b1ce696e52c9?auto=format&fit=crop&w=800&q=80',
    description: 'Samsung ekotizimi bilan chuqur integratsiyalashgan, aks ettirishga qarshi AMOLED ekranli noutbuk.',
    pros: ['Anti-reflective AMOLED ekran', 'Atigi 1.23 kg', 'Galaxy telefonlar bilan tezkor aloqa'], cons: ['Klaviatura bosilishi sayozroq']
  },
  {
    id: 'c10', brand: 'Razer', model: 'Blade 16 (2024)', year: 2024,
    processor: 'Intel Core i9-14900HX', ram: '32 GB DDR5', storage: '1 TB SSD',
    gpu: 'NVIDIA GeForce RTX 4080 12GB', display: '16" QHD+ OLED, 240Hz', battery: '95.2 Wh (7 soatgacha)',
    price: '$2,999', image: 'https://images.unsplash.com/photo-1542751371-adc38448a05e?auto=format&fit=crop&w=800&q=80',
    description: 'Qora anodlangan yaxlit alyuminiy korpusli eng nufuzli o‘yin va ijodkorlar noutbuki.',
    pros: ['240Hz OLED panel', 'MacBook kabi mustahkam korpus', 'Yuqori grafik quvvat'], cons: ['Juda qimmat']
  },
  {
    id: 'c11', brand: 'Huawei', model: 'MateBook X Pro (2024)', year: 2024,
    processor: 'Intel Core Ultra 9 185H', ram: '32 GB LPDDR5X', storage: '1 TB SSD',
    gpu: 'Intel Arc Graphics', display: '14.2" Flexible OLED, 120Hz', battery: '70 Wh (11 soatgacha)',
    price: '$1,599', image: 'https://images.unsplash.com/photo-1498050108023-c5249f4df085?auto=format&fit=crop&w=800&q=80',
    description: 'Atigi 980 gramm og‘irlikdagi magniy qotishmali korpusda Core Ultra 9 protsessorini jamlagan ultrabuk.',
    pros: ['980 gramm ultra-yengil vazn', '3.1K OLED ekran', 'Tezkor 90W quvvatlash'], cons: ['Faqat USB-C portlar']
  }
];

const PHONES_DB: PhoneItem[] = [
  {
    id: 's1', brand: 'Apple', model: 'iPhone 16 Pro Max', releaseDate: '2024-yil sentyabr',
    display: '6.9" LTPO Super Retina XDR OLED, 120Hz', processor: 'Apple A18 Pro (3 nm)',
    ramStorage: '8 GB RAM / 256 GB - 1 TB', mainCamera: '48 MP asosiy + 48 MP ultra-keng + 12 MP 5x periskop',
    frontCamera: '12 MP TrueDepth (4K 60fps)', battery: '4685 mAh', charging: '25W MagSafe / 30W simli',
    os: 'iOS 18', price: '$1,199', image: 'https://images.unsplash.com/photo-1695048133142-1a20484d2569?auto=format&fit=crop&w=800&q=80'
  },
  {
    id: 's2', brand: 'Samsung', model: 'Galaxy S24 Ultra', releaseDate: '2024-yil yanvar',
    display: '6.8" Dynamic LTPO AMOLED 2X, 120Hz, 2600 nit', processor: 'Snapdragon 8 Gen 3 for Galaxy',
    ramStorage: '12 GB RAM / 256 GB - 1 TB', mainCamera: '200 MP asosiy + 50 MP 5x + 10 MP 3x + 12 MP ultra-keng',
    frontCamera: '12 MP Dual Pixel', battery: '5000 mAh', charging: '45W simli / 15W simsiz',
    os: 'Android 14 (One UI 6.1)', price: '$1,299', image: 'https://images.unsplash.com/photo-1610945415295-d9bbf067e59c?auto=format&fit=crop&w=800&q=80'
  },
  {
    id: 's3', brand: 'Xiaomi', model: 'Xiaomi 14 Ultra', releaseDate: '2024-yil fevral',
    display: '6.73" LTPO AMOLED, 120Hz, 3000 nit', processor: 'Snapdragon 8 Gen 3 (4 nm)',
    ramStorage: '16 GB RAM / 512 GB - 1 TB', mainCamera: '50 MP 1-dyuymli Leica Summilux (4 ta 50 MP modul)',
    frontCamera: '32 MP (4K 60fps)', battery: '5000 mAh', charging: '90W simli / 80W simsiz',
    os: 'Android 14 (HyperOS)', price: '$1,099', image: 'https://images.unsplash.com/photo-1598327105666-5b89351aff97?auto=format&fit=crop&w=800&q=80'
  },
  {
    id: 's4', brand: 'Redmi', model: 'Redmi Note 13 Pro+ 5G', releaseDate: '2024-yil yanvar',
    display: '6.67" AMOLED, 120Hz, 1800 nit', processor: 'MediaTek Dimensity 7200 Ultra',
    ramStorage: '8/12 GB RAM / 256/512 GB', mainCamera: '200 MP OIS + 8 MP + 2 MP',
    frontCamera: '16 MP', battery: '5000 mAh', charging: '120W HyperCharge (19 daqiqada 100%)',
    os: 'Android 14 (HyperOS)', price: '$379', image: 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?auto=format&fit=crop&w=800&q=80'
  },
  {
    id: 's5', brand: 'POCO', model: 'POCO F6 Pro', releaseDate: '2024-yil may',
    display: '6.67" WQHD+ Flow AMOLED, 120Hz', processor: 'Snapdragon 8 Gen 2 (4 nm)',
    ramStorage: '12/16 GB RAM / 256 GB - 1 TB', mainCamera: '50 MP Light Fusion 800 OIS + 8 MP + 2 MP',
    frontCamera: '16 MP', battery: '5000 mAh', charging: '120W HyperCharge',
    os: 'Android 14 (HyperOS)', price: '$499', image: 'https://images.unsplash.com/photo-1592899677977-9c10ca588bbd?auto=format&fit=crop&w=800&q=80'
  },
  {
    id: 's6', brand: 'Google', model: 'Pixel 9 Pro XL', releaseDate: '2024-yil avgust',
    display: '6.8" Super Actua LTPO OLED, 120Hz', processor: 'Google Tensor G4 (4 nm)',
    ramStorage: '16 GB RAM / 128 GB - 1 TB', mainCamera: '50 MP asosiy + 48 MP 5x periskop + 48 MP ultra-keng',
    frontCamera: '42 MP Autofocus', battery: '5060 mAh', charging: '37W simli / 23W simsiz',
    os: 'Android 14 (7 yil yangilanish)', price: '$1,099', image: 'https://images.unsplash.com/photo-1598327105854-c8674faddf79?auto=format&fit=crop&w=800&q=80'
  },
  {
    id: 's7', brand: 'Huawei', model: 'Pura 70 Ultra', releaseDate: '2024-yil aprel',
    display: '6.8" LTPO OLED, 120Hz, Kunlun Glass', processor: 'Kirin 9010 (7 nm)',
    ramStorage: '16 GB RAM / 512 GB - 1 TB', mainCamera: '50 MP harakatlanuvchi 1-dyuymli linza + 50 MP makro telefoto + 40 MP',
    frontCamera: '13 MP Autofocus', battery: '5200 mAh', charging: '100W simli / 80W simsiz',
    os: 'EMUI 14.2 / HarmonyOS 4.2', price: '$1,249', image: 'https://images.unsplash.com/photo-1605236453806-6ff36851218e?auto=format&fit=crop&w=800&q=80'
  },
  {
    id: 's8', brand: 'Honor', model: 'Honor Magic6 Pro', releaseDate: '2024-yil fevral',
    display: '6.8" LTPO OLED, 120Hz, 5000 nit HDR', processor: 'Snapdragon 8 Gen 3 (4 nm)',
    ramStorage: '12/16 GB RAM / 512 GB - 1 TB', mainCamera: '50 MP o‘zgaruvchan diafragma + 180 MP periskop + 50 MP',
    frontCamera: '50 MP + 3D ToF Face ID', battery: '5600 mAh Silicon-Carbon', charging: '80W simli / 66W simsiz',
    os: 'Android 14 (MagicOS 8.0)', price: '$999', image: 'https://images.unsplash.com/photo-1580910051074-3eb694886505?auto=format&fit=crop&w=800&q=80'
  },
  {
    id: 's9', brand: 'OnePlus', model: 'OnePlus 12', releaseDate: '2024-yil yanvar',
    display: '6.82" LTPO AMOLED, 120Hz, 4500 nit', processor: 'Snapdragon 8 Gen 3 (4 nm)',
    ramStorage: '12/16 GB RAM / 256/512 GB', mainCamera: '50 MP Sony LYT-808 Hasselblad + 64 MP 3x + 48 MP',
    frontCamera: '32 MP', battery: '5400 mAh', charging: '100W SUPERVOOC / 50W AIRVOOC',
    os: 'Android 14 (OxygenOS 14)', price: '$799', image: 'https://images.unsplash.com/photo-1567581935884-3349723552ca?auto=format&fit=crop&w=800&q=80'
  },
  {
    id: 's10', brand: 'OPPO', model: 'Find X7 Ultra', releaseDate: '2024-yil yanvar',
    display: '6.82" LTPO AMOLED, 120Hz', processor: 'Snapdragon 8 Gen 3 (4 nm)',
    ramStorage: '12/16 GB RAM / 256/512 GB', mainCamera: '50 MP 1-dyuymli + ikkita periskop (3x va 6x) + 50 MP',
    frontCamera: '32 MP', battery: '5000 mAh', charging: '100W simli / 50W simsiz',
    os: 'Android 14 (ColorOS 14)', price: '$949', image: 'https://images.unsplash.com/photo-1533228100845-08145b01de14?auto=format&fit=crop&w=800&q=80'
  },
  {
    id: 's11', brand: 'Vivo', model: 'Vivo X100 Pro', releaseDate: '2024-yil yanvar',
    display: '6.78" LTPO AMOLED, 120Hz', processor: 'MediaTek Dimensity 9300 (4 nm)',
    ramStorage: '16 GB RAM / 512 GB - 1 TB', mainCamera: '50 MP 1-dyuymli ZEISS + 50 MP APO 4.3x periskop + 50 MP',
    frontCamera: '32 MP', battery: '5400 mAh', charging: '100W simli / 50W simsiz',
    os: 'Android 14 (Funtouch OS 14)', price: '$899', image: 'https://images.unsplash.com/photo-1574944985070-8f3ebc6b79d2?auto=format&fit=crop&w=800&q=80'
  },
  {
    id: 's12', brand: 'Realme', model: 'Realme GT 6', releaseDate: '2024-yil iyun',
    display: '6.78" LTPO AMOLED, 120Hz, 6000 nit', processor: 'Snapdragon 8s Gen 3 (4 nm)',
    ramStorage: '12/16 GB RAM / 256/512 GB', mainCamera: '50 MP Sony LYT-808 OIS + 50 MP telefoto + 8 MP',
    frontCamera: '32 MP', battery: '5500 mAh', charging: '120W SUPERVOOC',
    os: 'Android 14 (Realme UI 5.0)', price: '$599', image: 'https://images.unsplash.com/photo-1585060544812-6b45742d762f?auto=format&fit=crop&w=800&q=80'
  },
  {
    id: 's13', brand: 'Nothing', model: 'Nothing Phone (2a)', releaseDate: '2024-yil mart',
    display: '6.7" Flexible AMOLED, 120Hz', processor: 'MediaTek Dimensity 7200 Pro',
    ramStorage: '8/12 GB RAM / 128/256 GB', mainCamera: '50 MP OIS + 50 MP ultra-keng',
    frontCamera: '32 MP', battery: '5000 mAh', charging: '45W simli',
    os: 'Android 14 (Nothing OS 2.5)', price: '$349', image: 'https://images.unsplash.com/photo-1616348436168-de43ad0db179?auto=format&fit=crop&w=800&q=80'
  }
];

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
  { id: 'n1', category: 'AI yangiliklari', title: 'Google Gemini 2.5 modellarining yangi avlod imkoniyatlari taqdim etildi', summary: 'Yangi multimodal tahlil va kod yozish tezligi dasturchilar uchun katta qulaylik yaratmoqda.', date: '2026-11-12', source: 'Google AI Blog', url: 'https://blog.google/technology/ai/', image: 'https://images.unsplash.com/photo-1677442136019-21780ecad995?auto=format&fit=crop&w=800&q=80' },
  { id: 'n2', category: 'O‘zbekiston', title: 'IT Park Uzbekistan eksport hajmi yangi rekord darajaga yetdi', summary: 'Mahalliy dasturiy mahsulotlar va autsorsing xizmatlari 60 dan ortiq davlatga eksport qilinmoqda.', date: '2026-11-11', source: 'IT Park UZ', url: 'https://it-park.uz', image: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=800&q=80' },
  { id: 'n3', category: 'Smartfonlar', title: 'Flagman smartfonlarda kremniy-uglerod (Silicon-Carbon) batareyalar davri', summary: 'Yupqa korpusda 6000 mAh sig‘imli batareyalar endi yangi standartga aylanmoqda.', date: '2026-11-10', source: 'GSMArena', url: 'https://www.gsmarena.com', image: 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?auto=format&fit=crop&w=800&q=80' },
  { id: 'n4', category: 'Kompyuterlar', title: 'ARM arxitekturasidagi noutbuklar bozor ulushini tez sur’atda oshirmoqda', summary: 'Apple Silicon va Snapdragon X seriyalari avtonomlik bo‘yicha yangi mezon o‘rnatdi.', date: '2026-11-09', source: 'The Verge', url: 'https://www.theverge.com', image: 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?auto=format&fit=crop&w=800&q=80' },
  { id: 'n5', category: 'Koinot', title: 'James Webb teleskopi uzoq ekzosayyora atmosferasida yangi molekulalarni aniqladi', summary: 'Astronomlar yerdan 120 yorug‘lik yili uzoqlikdagi sayyora tarkibini o‘rganmoqda.', date: '2026-11-08', source: 'NASA Science', url: 'https://science.nasa.gov', image: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&w=800&q=80' },
  { id: 'n6', category: 'Texnologiya', title: 'WebAssembly va Edge Computing zamonaviy veb-ilovalarni tezlashtirmoqda', summary: 'Brauzer ichida og‘ir hisob-kitoblarni bajarish yanada soddalashdi.', date: '2026-11-07', source: 'TechCrunch', url: 'https://techcrunch.com', image: 'https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=800&q=80' },
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
  // Navigation & Theme
  const [activeSection, setActiveSection] = useState<SectionId>('home');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [darkMode, setDarkMode] = useState(false);
  const [globalQuery, setGlobalQuery] = useState('');
  const [recentSections, setRecentSections] = useState<SectionId[]>(['home', 'ai-assistant', 'computers', 'operators']);
  const [toastMsg, setToastMsg] = useState<string | null>(null);
  const [now, setNow] = useState(new Date());

  // Auth & Profile (Supabase + Local Persistence)
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
    const saved = localStorage.getItem('vermix_pins');
    return saved ? JSON.parse(saved) : INITIAL_PINS;
  });
  const [pinCategory, setPinCategory] = useState('Barchasi');
  const [pinSearch, setPinSearch] = useState('');
  const [likedPins, setLikedPins] = useState<string[]>([]);
  const [newPinModal, setNewPinModal] = useState(false);
  const [newPinTitle, setNewPinTitle] = useState('');
  const [newPinUrl, setNewPinUrl] = useState('');
  const [newPinCat, setNewPinCat] = useState('Texnologiya');

  // Music State
  const [tracks, setTracks] = useState<TrackItem[]>(() => {
    const saved = localStorage.getItem('vermix_tracks');
    return saved ? JSON.parse(saved) : INITIAL_TRACKS;
  });
  const [currentTrackIndex, setCurrentTrackIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [volume, setVolume] = useState(0.8);
  const [muted, setMuted] = useState(false);
  const [musicSearch, setMusicSearch] = useState('');
  const [favoriteTracks, setFavoriteTracks] = useState<string[]>(['t1']);
  const [addMusicModal, setAddMusicModal] = useState(false);
  const [customTitle, setCustomTitle] = useState('');
  const [customArtist, setCustomArtist] = useState('');
  const [customAudioUrl, setCustomAudioUrl] = useState('');
  const [customCoverUrl, setCustomCoverUrl] = useState('');
  const audioRef = useRef<HTMLAudioElement | null>(null);

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

  // Computers & Smartphones State
  const [compBrand, setCompBrand] = useState('Barchasi');
  const [compSearch, setCompSearch] = useState('');
  const [selectedComputer, setSelectedComputer] = useState<ComputerItem | null>(null);
  const [compareComputers, setCompareComputers] = useState<string[]>(['c1', 'c2']);

  const [phoneBrand, setPhoneBrand] = useState('Barchasi');
  const [phoneSearch, setPhoneSearch] = useState('');
  const [selectedPhone, setSelectedPhone] = useState<PhoneItem | null>(null);
  const [comparePhones, setComparePhones] = useState<string[]>(['s1', 's2']);

  // AI Assistant State
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>(() => {
    const saved = localStorage.getItem('vermix_chat');
    return saved ? JSON.parse(saved) : [
      {
        id: 'm1',
        role: 'assistant',
        content: 'Assalomu alaykum! Men **VerMix AI** yordamchisiman. Savollaringizga javob beraman, kod yozaman, matnlarni tarjima qilaman va hujjatlarni tahlil qilaman. Nimadan boshlaymiz?',
        timestamp: 'Hozir',
      },
    ];
  });
  const [chatInput, setChatInput] = useState('');
  const [aiThinking, setAiThinking] = useState(false);
  const [uploadedFileName, setUploadedFileName] = useState<string | null>(null);
  const [uploadedFileText, setUploadedFileText] = useState<string>('');

  // Calendar State
  const [events, setEvents] = useState<CalendarEvent[]>(() => {
    const saved = localStorage.getItem('vermix_events');
    const todayStr = new Date().toISOString().slice(0, 10);
    return saved ? JSON.parse(saved) : [
      { id: 'e1', title: 'VerMix loyihasini ishga tushirish', date: todayStr, time: '14:00', color: 'bg-blue-500', notes: 'Railway va Supabase tekshiruvi' },
      { id: 'e2', title: 'Jamoa bilan uchrashuv', date: todayStr, time: '18:30', color: 'bg-emerald-500', notes: 'Yangi funksiyalar muhokamasi' },
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
      { id: 'td2', text: 'Yangi musiqa pleylist yaratish', done: false },
    ];
  });
  const [todoInput, setTodoInput] = useState('');
  const [qrText, setQrText] = useState('https://vermix-production-e57d21f6.up.railway.app');
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

  useEffect(() => { localStorage.setItem('vermix_pins', JSON.stringify(pins)); }, [pins]);
  useEffect(() => { localStorage.setItem('vermix_tracks', JSON.stringify(tracks)); }, [tracks]);
  useEffect(() => { localStorage.setItem('vermix_videos', JSON.stringify(videos)); }, [videos]);
  useEffect(() => { localStorage.setItem('vermix_chat', JSON.stringify(chatMessages)); }, [chatMessages]);
  useEffect(() => { localStorage.setItem('vermix_events', JSON.stringify(events)); }, [events]);
  useEffect(() => { localStorage.setItem('vermix_notes', noteText); }, [noteText]);
  useEffect(() => { localStorage.setItem('vermix_todos', JSON.stringify(todos)); }, [todos]);
  useEffect(() => { localStorage.setItem('vermix_bookmarks', JSON.stringify(bookmarks)); }, [bookmarks]);

  // Real Supabase Auth Session Listener
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

  // Audio playback sync
  useEffect(() => {
    if (!audioRef.current) return;
    audioRef.current.volume = muted ? 0 : volume;
    if (isPlaying) {
      audioRef.current.play().catch(() => setIsPlaying(false));
    } else {
      audioRef.current.pause();
    }
  }, [isPlaying, currentTrackIndex, volume, muted]);

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
    setRecentSections((prev) => [id, ...prev.filter((x) => x !== id)].slice(0, 5));
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

  // --- REAL SUPABASE AUTH HANDLERS ---
  const handleGoogleLogin = async () => {
    setAuthError(null);
    if (!supabase) {
      setAuthError('Supabase ulanmagan: Railway Variables bo‘limida VITE_SUPABASE_URL va VITE_SUPABASE_ANON_KEY kiritilganini tekshiring.');
      return;
    }
    setAuthLoading(true);
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: window.location.origin,
      },
    });
    setAuthLoading(false);
    if (error) {
      setAuthError('Google orqali kirishda xatolik: ' + error.message);
    }
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
    const { error } = await supabase.auth.signInWithOtp({
      phone: fullPhone,
    });
    setAuthLoading(false);
    if (error) {
      setAuthError(`SMS yuborishda xatolik: ${error.message}. (Supabase Dashboard → Authentication → Providers → Phone va SMS provayder yoqilganini tekshiring).`);
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

  // --- MUSIC HANDLERS ---
  const handleCustomAudioFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const objectUrl = URL.createObjectURL(file);
    setCustomAudioUrl(objectUrl);
    if (!customTitle) setCustomTitle(file.name.replace(/\.[^/.]+$/, ''));
  };

  const handleAddCustomTrack = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customTitle.trim() || !customAudioUrl.trim()) {
      showToast('Qo‘shiq nomi va audio fayl/havola kiritilishi shart!');
      return;
    }
    const newTrack: TrackItem = {
      id: `custom-${Date.now()}`,
      title: customTitle.trim(),
      artist: customArtist.trim() || (user?.name || 'Shaxsiy ijrochi'),
      album: 'Mening musiqalarim',
      category: 'Shaxsiy',
      cover: customCoverUrl.trim() || 'https://images.unsplash.com/photo-1614613535308-eb5fbd3d2c17?auto=format&fit=crop&w=400&q=80',
      audioUrl: customAudioUrl.trim(),
      duration: 'Audio',
      isCustom: true,
    };
    setTracks((prev) => [newTrack, ...prev]);
    setCurrentTrackIndex(0);
    setIsPlaying(true);
    setAddMusicModal(false);
    setCustomTitle('');
    setCustomArtist('');
    setCustomAudioUrl('');
    setCustomCoverUrl('');
    showToast('Musiqa qo‘shildi va ijro etilmoqda!');
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

  // --- AI ASSISTANT HANDLER (Backend API + Fallback) ---
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
      const res = await fetch('/api/ai/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: fullUserPrompt,
          history: chatMessages.slice(-6).map((m) => ({ role: m.role, content: m.content })),
        }),
      });

      if (res.ok) {
        const data = await res.json();
        setChatMessages((prev) => [
          ...prev,
          {
            id: `a-${Date.now()}`,
            role: 'assistant',
            content: data.reply,
            timestamp: new Date().toLocaleTimeString('uz-UZ', { hour: '2-digit', minute: '2-digit' }),
          },
        ]);
      } else {
        throw new Error('Backend javob bermadi');
      }
    } catch {
      // Offline / Static preview fallback
      const fallbackReply = `**VerMix AI (Lokal rejim):** Savolingiz qabul qilindi: *"${promptText}"*.\n\nJonli Gemini 2.5 javoblarini olish uchun Railway serveringizda \`npx tsx server/index.ts\` ishlayotganini va \`GEMINI_API_KEY\` kiritilganini tekshiring.`;
      setChatMessages((prev) => [
        ...prev,
        {
          id: `a-${Date.now()}`,
          role: 'assistant',
          content: fallbackReply,
          timestamp: new Date().toLocaleTimeString('uz-UZ', { hour: '2-digit', minute: '2-digit' }),
        },
      ]);
    } finally {
      setAiThinking(false);
    }
  };

  // --- NAVIGATION ITEMS ---
  const NAV_ITEMS: { id: SectionId; label: string; icon: React.ElementType; badge?: string }[] = [
    { id: 'home', label: 'Bosh sahifa', icon: Home },
    { id: 'pinterest', label: 'Pinterest', icon: ImageIcon },
    { id: 'music', label: 'Musiqa', icon: Music },
    { id: 'videos', label: 'Videolar', icon: Video },
    { id: 'computers', label: 'Kompyuterlar', icon: Laptop },
    { id: 'smartphones', label: 'Smartfonlar', icon: Smartphone },
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
          title: `${c.brand} ${c.model}`,
          sub: `Kompyuter • ${c.price}`,
          section: 'computers' as SectionId,
        })),
        ...PHONES_DB.filter((p) => `${p.brand} ${p.model}`.toLowerCase().includes(q)).map((p) => ({
          title: `${p.brand} ${p.model}`,
          sub: `Smartfon • ${p.price}`,
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

  const currentTrack = tracks[currentTrackIndex] || tracks[0];

  return (
    <div className={darkMode ? 'dark' : ''}>
      <div className="min-h-screen bg-[#FFFFFF] dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100 flex transition-colors duration-200 font-sans">
        {/* Hidden Audio Element */}
        <audio
          ref={audioRef}
          src={currentTrack?.audioUrl}
          onEnded={() => setCurrentTrackIndex((i) => (i + 1) % tracks.length)}
        />

        {/* Toast Notification */}
        {toastMsg && (
          <div className="fixed bottom-20 right-5 z-50 bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 px-4 py-2.5 rounded-xl shadow-xl text-sm font-medium flex items-center gap-2 animate-bounce">
            <CheckCircle2 className="w-4 h-4 text-emerald-500" />
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
          className={`fixed lg:sticky top-0 left-0 z-40 h-screen w-64 bg-[#F8F9FA] dark:bg-zinc-900 border-r border-zinc-200/80 dark:border-zinc-800 flex flex-col transition-transform duration-200 ${
            sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
          }`}
        >
          <div className="p-5 flex items-center justify-between border-b border-zinc-200/70 dark:border-zinc-800">
            <button
              onClick={() => navigateTo('home')}
              className="flex items-center gap-2.5 text-left"
            >
              <div className="w-9 h-9 rounded-xl bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 flex items-center justify-center font-bold text-lg shadow-sm">
                V
              </div>
              <div>
                <span className="font-bold text-lg tracking-tight block leading-none">VerMix</span>
                <span className="text-[11px] text-zinc-500 dark:text-zinc-400">Raqamli Ekotizim</span>
              </div>
            </button>
            <button onClick={() => setSidebarOpen(false)} className="lg:hidden p-1.5 rounded-lg hover:bg-zinc-200 dark:hover:bg-zinc-800">
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
                      ? 'bg-zinc-900 text-white dark:bg-white dark:text-zinc-900 shadow-sm'
                      : 'text-zinc-600 dark:text-zinc-400 hover:bg-zinc-200/70 dark:hover:bg-zinc-800/70 hover:text-zinc-900 dark:hover:text-white'
                  }`}
                >
                  <span className="flex items-center gap-3 truncate">
                    <Icon className="w-4 h-4 shrink-0" />
                    <span className="truncate">{item.label}</span>
                  </span>
                  {item.badge && (
                    <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-md bg-blue-500 text-white">
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>

          {/* User Mini Card in Sidebar */}
          <div className="p-3 border-t border-zinc-200/70 dark:border-zinc-800">
            {user ? (
              <div className="flex items-center justify-between p-2 rounded-xl bg-white dark:bg-zinc-800/80 border border-zinc-200/70 dark:border-zinc-700">
                <button onClick={() => navigateTo('profile')} className="flex items-center gap-2.5 min-w-0 text-left">
                  {user.avatar ? (
                    <img src={user.avatar} alt={user.name} className="w-8 h-8 rounded-full object-cover" />
                  ) : (
                    <div className="w-8 h-8 rounded-full bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 flex items-center justify-center text-xs font-bold shrink-0">
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
                className="w-full py-2.5 px-3 rounded-xl bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 text-xs font-semibold flex items-center justify-center gap-2 hover:opacity-90 transition"
              >
                <LogIn className="w-4 h-4" />
                Google / Telefon orqali kirish
              </button>
            )}
          </div>
        </aside>

        {/* MAIN CONTENT AREA */}
        <div className="flex-1 flex flex-col min-w-0">
          {/* TOP HEADER */}
          <header className="sticky top-0 z-20 bg-white/90 dark:bg-zinc-950/90 backdrop-blur-md border-b border-zinc-200/80 dark:border-zinc-800 px-4 lg:px-8 py-3.5 flex items-center justify-between gap-4">
            <div className="flex items-center gap-3 flex-1 max-w-xl relative">
              <button
                onClick={() => setSidebarOpen(true)}
                className="lg:hidden p-2 rounded-xl border border-zinc-200 dark:border-zinc-800"
              >
                <Menu className="w-5 h-5" />
              </button>
              <div className="relative flex-1">
                <Search className="w-4 h-4 text-zinc-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={globalQuery}
                  onChange={(e) => setGlobalQuery(e.target.value)}
                  placeholder="VerMix bo‘ylab qidirish (qurilmalar, USSD, tashkilotlar...)"
                  className="w-full pl-10 pr-4 py-2 rounded-xl bg-[#F4F5F7] dark:bg-zinc-900 border border-transparent focus:border-zinc-300 dark:focus:border-zinc-700 focus:bg-white dark:focus:bg-zinc-950 text-sm outline-none transition"
                />
                {globalMatches.length > 0 && (
                  <div className="absolute left-0 right-0 top-12 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl shadow-xl p-2 z-50">
                    {globalMatches.map((m, idx) => (
                      <button
                        key={idx}
                        onClick={() => { navigateTo(m.section); setGlobalQuery(''); }}
                        className="w-full text-left px-3 py-2 rounded-xl hover:bg-zinc-100 dark:hover:bg-zinc-800 flex items-center justify-between"
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
              <button
                onClick={() => setDarkMode(!darkMode)}
                className="p-2.5 rounded-xl bg-[#F4F5F7] dark:bg-zinc-900 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-200 dark:hover:bg-zinc-800 transition"
                title="Yorug‘ / Tungi rejim"
              >
                {darkMode ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
              </button>
              {!user ? (
                <button
                  onClick={() => { setAuthError(null); setAuthModalOpen(true); }}
                  className="px-4 py-2 rounded-xl bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 text-sm font-semibold hover:opacity-90 transition"
                >
                  Kirish
                </button>
              ) : (
                <button
                  onClick={() => navigateTo('profile')}
                  className="px-3 py-1.5 rounded-xl border border-zinc-200 dark:border-zinc-800 text-xs font-semibold flex items-center gap-2"
                >
                  <span className="w-2 h-2 rounded-full bg-emerald-500" />
                  {user.name}
                </button>
              )}
            </div>
          </header>

          {/* SECTION ROUTER */}
          <main className="flex-1 p-4 lg:p-8 max-w-7xl w-full mx-auto pb-28">
            {/* 1. HOME / DASHBOARD */}
            {activeSection === 'home' && (
              <div className="space-y-8">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  <div className="lg:col-span-2 p-7 rounded-3xl bg-[#F8F9FA] dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800 flex flex-col justify-between">
                    <div>
                      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-xs font-medium mb-4">
                        <Sparkles className="w-3.5 h-3.5 text-blue-500" />
                        VerMix Shaxsiy Ekotizimi
                      </span>
                      <h1 className="text-2xl lg:text-3xl font-bold tracking-tight mb-2">
                        Xush kelibsiz{user ? `, ${user.name}` : ''}!
                      </h1>
                      <p className="text-zinc-600 dark:text-zinc-400 text-sm max-w-xl">
                        Musiqa, rasmlar, video pleyer, noutbuk va smartfonlar bazasi, AI yordamchi hamda O‘zbekiston mobil operatorlari USSD kodlari bitta platformada.
                      </p>
                    </div>
                    <div className="mt-6 flex flex-wrap gap-2.5">
                      <button onClick={() => navigateTo('ai-assistant')} className="px-4 py-2.5 rounded-xl bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 text-sm font-semibold flex items-center gap-2">
                        <Bot className="w-4 h-4" /> AI Yordamchini ochish
                      </button>
                      <button onClick={() => navigateTo('operators')} className="px-4 py-2.5 rounded-xl bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-sm font-medium">
                        USSD Kodlar
                      </button>
                      <button onClick={() => navigateTo('contact')} className="px-4 py-2.5 rounded-xl bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-sm font-medium">
                        Aloqa (@roz1matoff_me)
                      </button>
                    </div>
                  </div>

                  {/* Weather & Clock Widget */}
                  <div className="p-6 rounded-3xl bg-[#F8F9FA] dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800 flex flex-col justify-between">
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
                      <div className="p-3 rounded-2xl bg-white dark:bg-zinc-800 shadow-xs text-amber-500">
                        <CloudSun className="w-7 h-7" />
                      </div>
                    </div>
                    <div className="mt-6 pt-4 border-t border-zinc-200/70 dark:border-zinc-800 flex items-center justify-between text-sm">
                      <span className="text-zinc-500">Ob-havo: Ochiq</span>
                      <span className="font-bold">+16°C • USD: {uzsRate.toLocaleString()} so‘m</span>
                    </div>
                  </div>
                </div>

                {/* Quick Access Grid */}
                <div>
                  <h2 className="text-lg font-bold mb-4">Tezkor bo‘limlar</h2>
                  <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 gap-3">
                    {[
                      { id: 'pinterest', title: 'Pinterest', desc: 'Rasmlar galereyasi', icon: ImageIcon },
                      { id: 'music', title: 'Musiqa', desc: 'Pleyer & yuklash', icon: Music },
                      { id: 'videos', title: 'Videolar', desc: 'YT / IG / TikTok', icon: Video },
                      { id: 'computers', title: 'Kompyuterlar', desc: '11 ta brend', icon: Laptop },
                      { id: 'smartphones', title: 'Smartfonlar', desc: '13 ta brend', icon: Smartphone },
                      { id: 'directory', title: 'Ma’lumotnoma', desc: '101, 102, 103, Banklar', icon: PhoneCall },
                    ].map((card) => {
                      const Icon = card.icon;
                      return (
                        <button
                          key={card.id}
                          onClick={() => navigateTo(card.id as SectionId)}
                          className="p-4 rounded-2xl bg-[#F8F9FA] dark:bg-zinc-900 border border-zinc-200/70 dark:border-zinc-800 hover:border-zinc-400 dark:hover:border-zinc-600 text-left transition group"
                        >
                          <div className="w-10 h-10 rounded-xl bg-white dark:bg-zinc-800 flex items-center justify-center mb-3 shadow-2xs group-hover:scale-105 transition">
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
                <div className="p-6 rounded-3xl bg-[#F8F9FA] dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800">
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="text-lg font-bold flex items-center gap-2">
                      <Compass className="w-5 h-5 text-blue-500" /> Kunlik Kashfiyotlar
                    </h2>
                    <span className="text-xs text-zinc-500">Har kuni yangilanadi</span>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="p-4 rounded-2xl bg-white dark:bg-zinc-950 border border-zinc-200/70 dark:border-zinc-800">
                      <span className="text-[11px] font-semibold text-blue-600 uppercase">Foydali Fakt</span>
                      <p className="font-semibold text-sm mt-1">Birinchi kompyuter sichqonchasi 1964-yilda yog‘ochdan yasalgan.</p>
                    </div>
                    <div className="p-4 rounded-2xl bg-white dark:bg-zinc-950 border border-zinc-200/70 dark:border-zinc-800">
                      <span className="text-[11px] font-semibold text-emerald-600 uppercase">Kun AI Vositasi</span>
                      <p className="font-semibold text-sm mt-1">Perplexity AI — manbalar bilan aniq javob beruvchi qidiruv tizimi.</p>
                    </div>
                    <div className="p-4 rounded-2xl bg-white dark:bg-zinc-950 border border-zinc-200/70 dark:border-zinc-800">
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
                    <h1 className="text-2xl font-bold">Pinterest Vizual Kashfiyot</h1>
                    <p className="text-sm text-zinc-500">G‘oyalar, dizayn va ilhomlantiruvchi rasmlar kolleksiyasi</p>
                  </div>
                  <button
                    onClick={() => setNewPinModal(true)}
                    className="px-4 py-2.5 rounded-xl bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 text-sm font-semibold flex items-center gap-2"
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
                        pinCategory === cat
                          ? 'bg-zinc-900 text-white dark:bg-white dark:text-zinc-900'
                          : 'bg-[#F4F5F7] dark:bg-zinc-900 text-zinc-600 dark:text-zinc-400'
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
                    className="ml-auto px-3.5 py-1.5 rounded-xl bg-[#F4F5F7] dark:bg-zinc-900 text-sm outline-none"
                  />
                </div>

                <div className="columns-1 sm:columns-2 md:columns-3 lg:columns-4 gap-4 space-y-4">
                  {pins
                    .filter((p) => (pinCategory === 'Barchasi' || p.category === pinCategory) && p.title.toLowerCase().includes(pinSearch.toLowerCase()))
                    .map((pin) => {
                      const liked = likedPins.includes(pin.id);
                      return (
                        <div key={pin.id} className="break-inside-avoid rounded-2xl overflow-hidden bg-[#F8F9FA] dark:bg-zinc-900 border border-zinc-200/70 dark:border-zinc-800 group">
                          <div className="relative">
                            <img src={pin.image} alt={pin.title} className="w-full h-auto object-cover" />
                            <div className="absolute top-2.5 right-2.5 flex gap-1.5">
                              <button
                                onClick={() => toggleBookmark({ id: pin.id, type: 'Rasm', title: pin.title, subtitle: pin.category, section: 'pinterest' })}
                                className="p-2 rounded-full bg-white/90 text-zinc-900 shadow-sm hover:scale-105 transition"
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

            {/* 3. MUSIC */}
            {activeSection === 'music' && (
              <div className="space-y-6">
                <div className="flex flex-wrap items-center justify-between gap-4">
                  <div>
                    <h1 className="text-2xl font-bold">VerMix Musiqa</h1>
                    <p className="text-sm text-zinc-500">Musiqalarni tinglang va o‘zingiz xohlagan audio fayl yoki havolani qo‘shing</p>
                  </div>
                  <button
                    onClick={() => setAddMusicModal(true)}
                    className="px-4 py-2.5 rounded-xl bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 text-sm font-semibold flex items-center gap-2"
                  >
                    <Plus className="w-4 h-4" /> + Musiqa qo‘shish
                  </button>
                </div>

                <input
                  type="text"
                  value={musicSearch}
                  onChange={(e) => setMusicSearch(e.target.value)}
                  placeholder="Qo‘shiq nomi yoki ijrochini qidirish..."
                  className="w-full max-w-md px-4 py-2.5 rounded-xl bg-[#F4F5F7] dark:bg-zinc-900 text-sm outline-none"
                />

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {tracks
                    .filter((t) => `${t.title} ${t.artist}`.toLowerCase().includes(musicSearch.toLowerCase()))
                    .map((track, idx) => {
                      const active = currentTrack?.id === track.id;
                      const fav = favoriteTracks.includes(track.id);
                      return (
                        <div
                          key={track.id}
                          className={`p-4 rounded-2xl border flex items-center justify-between gap-4 transition ${
                            active
                              ? 'bg-zinc-900 text-white dark:bg-white dark:text-zinc-900 border-transparent shadow-md'
                              : 'bg-[#F8F9FA] dark:bg-zinc-900 border-zinc-200/70 dark:border-zinc-800'
                          }`}
                        >
                          <div className="flex items-center gap-3.5 min-w-0">
                            <img src={track.cover} alt={track.title} className="w-14 h-14 rounded-xl object-cover shrink-0" />
                            <div className="min-w-0">
                              <div className="flex items-center gap-2">
                                <p className="font-bold text-sm truncate">{track.title}</p>
                                {track.isCustom && (
                                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500 text-white font-semibold">Shaxsiy</span>
                                )}
                              </div>
                              <p className={`text-xs truncate ${active ? 'opacity-80' : 'text-zinc-500'}`}>
                                {track.artist} • {track.album}
                              </p>
                            </div>
                          </div>
                          <div className="flex items-center gap-2 shrink-0">
                            <button
                              onClick={() => setFavoriteTracks((prev) => fav ? prev.filter((x) => x !== track.id) : [...prev, track.id])}
                              className="p-2 rounded-xl hover:bg-black/10"
                            >
                              <Heart className={`w-4 h-4 ${fav ? 'fill-red-500 text-red-500' : ''}`} />
                            </button>
                            <button
                              onClick={() => {
                                setCurrentTrackIndex(idx);
                                setIsPlaying(active ? !isPlaying : true);
                              }}
                              className="w-10 h-10 rounded-full bg-blue-600 text-white flex items-center justify-center shadow-sm"
                            >
                              {active && isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4 ml-0.5" />}
                            </button>
                          </div>
                        </div>
                      );
                    })}
                </div>
              </div>
            )}

            {/* 4. SOCIAL MEDIA VIDEO PLAYER */}
            {activeSection === 'videos' && (
              <div className="space-y-6">
                <div>
                  <h1 className="text-2xl font-bold">Ijtimoiy Tarmoqlar Video Pleyeri</h1>
                  <p className="text-sm text-zinc-500">YouTube, Instagram (Reels/Post) va TikTok rasmiy havolalarini joylashtiring — platforma avtomatik aniqlaydi</p>
                </div>

                <form onSubmit={handleAddVideo} className="flex flex-col sm:flex-row gap-3">
                  <input
                    type="url"
                    value={videoUrlInput}
                    onChange={(e) => setVideoUrlInput(e.target.value)}
                    placeholder="https://www.youtube.com/watch?v=... yoki Instagram / TikTok havolasi"
                    className="flex-1 px-4 py-3 rounded-2xl bg-[#F4F5F7] dark:bg-zinc-900 text-sm outline-none border border-transparent focus:border-zinc-400"
                    required
                  />
                  <button type="submit" className="px-6 py-3 rounded-2xl bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 text-sm font-semibold">
                    Videoni ochish
                  </button>
                </form>

                {videoError && (
                  <div className="p-3.5 rounded-xl bg-red-50 dark:bg-red-950/40 text-red-600 text-sm flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 shrink-0" /> {videoError}
                  </div>
                )}

                {activeVideo && (
                  <div className="rounded-3xl overflow-hidden bg-[#F8F9FA] dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 p-4 lg:p-6">
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
                        <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-zinc-900 text-white dark:bg-white dark:text-zinc-900 mr-2">
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
                      className="p-4 rounded-2xl bg-[#F8F9FA] dark:bg-zinc-900 border border-zinc-200/70 dark:border-zinc-800 text-left hover:border-zinc-400 transition"
                    >
                      <span className="text-[11px] font-bold text-blue-600">{v.platform}</span>
                      <p className="font-semibold text-sm mt-1 truncate">{v.title}</p>
                      <p className="text-xs text-zinc-500 truncate mt-1">{v.originalUrl}</p>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* 5. COMPUTERS DATABASE */}
            {activeSection === 'computers' && (
              <div className="space-y-6">
                <div className="flex flex-wrap items-center justify-between gap-4">
                  <div>
                    <h1 className="text-2xl font-bold">Kompyuter va Noutbuklar Bazasi</h1>
                    <p className="text-sm text-zinc-500">11 ta yetakchi brend modellari, texnik xususiyatlari va taqqoslash</p>
                  </div>
                  <input
                    type="text"
                    value={compSearch}
                    onChange={(e) => setCompSearch(e.target.value)}
                    placeholder="Model yoki protsessor qidirish..."
                    className="px-4 py-2 rounded-xl bg-[#F4F5F7] dark:bg-zinc-900 text-sm outline-none"
                  />
                </div>

                <div className="flex flex-wrap gap-2">
                  {['Barchasi', 'Apple', 'ASUS', 'Lenovo', 'HP', 'Dell', 'Acer', 'MSI', 'Microsoft', 'Samsung', 'Razer', 'Huawei'].map((b) => (
                    <button
                      key={b}
                      onClick={() => setCompBrand(b)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition ${
                        compBrand === b ? 'bg-zinc-900 text-white dark:bg-white dark:text-zinc-900' : 'bg-[#F4F5F7] dark:bg-zinc-900'
                      }`}
                    >
                      {b}
                    </button>
                  ))}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                  {COMPUTERS_DB
                    .filter((c) => (compBrand === 'Barchasi' || c.brand === compBrand) && `${c.brand} ${c.model} ${c.processor}`.toLowerCase().includes(compSearch.toLowerCase()))
                    .map((comp) => {
                      const inCompare = compareComputers.includes(comp.id);
                      return (
                        <div key={comp.id} className="rounded-3xl bg-[#F8F9FA] dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800 overflow-hidden flex flex-col">
                          <img src={comp.image} alt={comp.model} className="w-full h-48 object-cover" />
                          <div className="p-5 flex-1 flex flex-col justify-between">
                            <div>
                              <div className="flex items-center justify-between">
                                <span className="text-xs font-bold text-blue-600">{comp.brand} • {comp.year}</span>
                                <span className="font-bold text-sm">{comp.price}</span>
                              </div>
                              <h3 className="font-bold text-base mt-1">{comp.model}</h3>
                              <ul className="mt-3 space-y-1 text-xs text-zinc-600 dark:text-zinc-400">
                                <li>• <b>CPU:</b> {comp.processor}</li>
                                <li>• <b>RAM / SSD:</b> {comp.ram} / {comp.storage}</li>
                                <li>• <b>GPU:</b> {comp.gpu}</li>
                                <li>• <b>Ekran:</b> {comp.display}</li>
                              </ul>
                            </div>
                            <div className="mt-4 pt-3 border-t border-zinc-200/70 dark:border-zinc-800 flex items-center gap-2">
                              <button
                                onClick={() => setSelectedComputer(comp)}
                                className="flex-1 py-2 rounded-xl bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 text-xs font-semibold"
                              >
                                Batafsil
                              </button>
                              <button
                                onClick={() => setCompareComputers((prev) => inCompare ? prev.filter((x) => x !== comp.id) : [...prev.slice(-1), comp.id])}
                                className={`px-3 py-2 rounded-xl text-xs font-semibold border ${inCompare ? 'border-blue-500 text-blue-600' : 'border-zinc-300 dark:border-zinc-700'}`}
                              >
                                {inCompare ? 'Tanlangan' : 'Taqqoslash'}
                              </button>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                </div>

                {/* Comparison Table */}
                {compareComputers.length === 2 && (
                  <div className="p-6 rounded-3xl bg-[#F8F9FA] dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 overflow-x-auto">
                    <h2 className="text-lg font-bold mb-4 flex items-center gap-2">
                      <ArrowLeftRight className="w-5 h-5 text-blue-500" /> Noutbuklarni Taqqoslash
                    </h2>
                    <table className="w-full text-sm text-left">
                      <thead>
                        <tr className="border-b border-zinc-200 dark:border-zinc-800">
                          <th className="py-2 text-zinc-500">Xususiyat</th>
                          {compareComputers.map((id) => {
                            const c = COMPUTERS_DB.find((x) => x.id === id);
                            return <th key={id} className="py-2 font-bold">{c?.brand} {c?.model}</th>;
                          })}
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-zinc-200/70 dark:divide-zinc-800 text-xs">
                        {(['processor', 'ram', 'storage', 'gpu', 'display', 'battery', 'price'] as const).map((field) => (
                          <tr key={field}>
                            <td className="py-2.5 font-semibold uppercase text-zinc-500">{field}</td>
                            {compareComputers.map((id) => {
                              const c = COMPUTERS_DB.find((x) => x.id === id);
                              return <td key={id} className="py-2.5">{c?.[field]}</td>;
                            })}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            )}

            {/* 6. SMARTPHONES DATABASE */}
            {activeSection === 'smartphones' && (
              <div className="space-y-6">
                <div className="flex flex-wrap items-center justify-between gap-4">
                  <div>
                    <h1 className="text-2xl font-bold">Smartfonlar Ma’lumotlar Bazasi</h1>
                    <p className="text-sm text-zinc-500">13 ta mashhur brend smartfonlari, kamera, batareya va narxlar taqqoslagichi</p>
                  </div>
                  <input
                    type="text"
                    value={phoneSearch}
                    onChange={(e) => setPhoneSearch(e.target.value)}
                    placeholder="Smartfon modelini qidirish..."
                    className="px-4 py-2 rounded-xl bg-[#F4F5F7] dark:bg-zinc-900 text-sm outline-none"
                  />
                </div>

                <div className="flex flex-wrap gap-2">
                  {['Barchasi', 'Apple', 'Samsung', 'Xiaomi', 'Redmi', 'POCO', 'Google', 'Huawei', 'Honor', 'OnePlus', 'OPPO', 'Vivo', 'Realme', 'Nothing'].map((b) => (
                    <button
                      key={b}
                      onClick={() => setPhoneBrand(b)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition ${
                        phoneBrand === b ? 'bg-zinc-900 text-white dark:bg-white dark:text-zinc-900' : 'bg-[#F4F5F7] dark:bg-zinc-900'
                      }`}
                    >
                      {b}
                    </button>
                  ))}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                  {PHONES_DB
                    .filter((p) => (phoneBrand === 'Barchasi' || p.brand === phoneBrand) && `${p.brand} ${p.model}`.toLowerCase().includes(phoneSearch.toLowerCase()))
                    .map((phone) => {
                      const inCompare = comparePhones.includes(phone.id);
                      return (
                        <div key={phone.id} className="rounded-3xl bg-[#F8F9FA] dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800 overflow-hidden flex flex-col">
                          <img src={phone.image} alt={phone.model} className="w-full h-48 object-cover" />
                          <div className="p-5 flex-1 flex flex-col justify-between">
                            <div>
                              <div className="flex items-center justify-between">
                                <span className="text-xs font-bold text-blue-600">{phone.brand}</span>
                                <span className="font-bold text-sm">{phone.price}</span>
                              </div>
                              <h3 className="font-bold text-base mt-1">{phone.model}</h3>
                              <ul className="mt-3 space-y-1 text-xs text-zinc-600 dark:text-zinc-400">
                                <li>• <b>Ekran:</b> {phone.display}</li>
                                <li>• <b>Chip:</b> {phone.processor}</li>
                                <li>• <b>Kamera:</b> {phone.mainCamera}</li>
                                <li>• <b>Batareya:</b> {phone.battery} ({phone.charging})</li>
                              </ul>
                            </div>
                            <div className="mt-4 pt-3 border-t border-zinc-200/70 dark:border-zinc-800 flex items-center gap-2">
                              <button
                                onClick={() => setSelectedPhone(phone)}
                                className="flex-1 py-2 rounded-xl bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 text-xs font-semibold"
                              >
                                Batafsil
                              </button>
                              <button
                                onClick={() => setComparePhones((prev) => inCompare ? prev.filter((x) => x !== phone.id) : [...prev.slice(-1), phone.id])}
                                className={`px-3 py-2 rounded-xl text-xs font-semibold border ${inCompare ? 'border-blue-500 text-blue-600' : 'border-zinc-300 dark:border-zinc-700'}`}
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
                  <div className="p-6 rounded-3xl bg-[#F8F9FA] dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 overflow-x-auto">
                    <h2 className="text-lg font-bold mb-4 flex items-center gap-2">
                      <ArrowLeftRight className="w-5 h-5 text-blue-500" /> Smartfonlarni Taqqoslash
                    </h2>
                    <table className="w-full text-sm text-left">
                      <thead>
                        <tr className="border-b border-zinc-200 dark:border-zinc-800">
                          <th className="py-2 text-zinc-500">Parametr</th>
                          {comparePhones.map((id) => {
                            const p = PHONES_DB.find((x) => x.id === id);
                            return <th key={id} className="py-2 font-bold">{p?.brand} {p?.model}</th>;
                          })}
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-zinc-200/70 dark:divide-zinc-800 text-xs">
                        {(['display', 'processor', 'ramStorage', 'mainCamera', 'frontCamera', 'battery', 'charging', 'price'] as const).map((field) => (
                          <tr key={field}>
                            <td className="py-2.5 font-semibold uppercase text-zinc-500">{field}</td>
                            {comparePhones.map((id) => {
                              const p = PHONES_DB.find((x) => x.id === id);
                              return <td key={id} className="py-2.5">{p?.[field]}</td>;
                            })}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            )}

            {/* 7. AI ASSISTANT */}
            {activeSection === 'ai-assistant' && (
              <div className="h-[calc(100vh-11rem)] flex flex-col rounded-3xl bg-[#F8F9FA] dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800 overflow-hidden">
                <div className="p-4 border-b border-zinc-200/80 dark:border-zinc-800 flex items-center justify-between bg-white dark:bg-zinc-950">
                  <div className="flex items-center gap-2.5">
                    <div className="w-9 h-9 rounded-xl bg-blue-600 text-white flex items-center justify-center">
                      <Bot className="w-5 h-5" />
                    </div>
                    <div>
                      <h2 className="font-bold text-sm">VerMix AI Yordamchi (Gemini 2.5)</h2>
                      <p className="text-[11px] text-emerald-600 font-medium">● Xavfsiz server API orqali ulangan</p>
                    </div>
                  </div>
                  <button
                    onClick={() => setChatMessages([{ id: 'new', role: 'assistant', content: 'Yangi suhbat boshlandi. Qanday yordam bera olaman?', timestamp: 'Hozir' }])}
                    className="px-3 py-1.5 rounded-xl border border-zinc-200 dark:border-zinc-800 text-xs font-semibold flex items-center gap-1.5"
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
                            ? 'bg-zinc-900 text-white dark:bg-white dark:text-zinc-900'
                            : 'bg-white dark:bg-zinc-950 border border-zinc-200/80 dark:border-zinc-800'
                        }`}
                      >
                        {msg.attachmentName && (
                          <div className="text-xs font-semibold mb-1.5 px-2.5 py-1 rounded-lg bg-blue-500/10 text-blue-500 inline-block">
                            📎 {msg.attachmentName}
                          </div>
                        )}
                        <p className="whitespace-pre-wrap">{msg.content}</p>
                        <div className="mt-2 flex items-center justify-between text-[10px] opacity-60">
                          <span>{msg.timestamp}</span>
                          {msg.role === 'assistant' && (
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
                      <RefreshCw className="w-3.5 h-3.5 animate-spin" /> VerMix AI o‘ylamoqda...
                    </div>
                  )}
                </div>

                <form onSubmit={handleSendAiMessage} className="p-3 bg-white dark:bg-zinc-950 border-t border-zinc-200/80 dark:border-zinc-800 flex items-center gap-2">
                  <label className="p-2.5 rounded-xl bg-[#F4F5F7] dark:bg-zinc-900 cursor-pointer hover:bg-zinc-200 transition" title="Fayl tahlili (.txt, .md, .json, .csv)">
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
                    className="flex-1 px-4 py-2.5 rounded-xl bg-[#F4F5F7] dark:bg-zinc-900 text-sm outline-none"
                  />
                  <button type="submit" disabled={aiThinking} className="p-2.5 rounded-xl bg-zinc-900 dark:bg-white text-white dark:text-zinc-900">
                    <Send className="w-4 h-4" />
                  </button>
                </form>
              </div>
            )}

            {/* 8. CALENDAR */}
            {activeSection === 'calendar' && (
              <div className="space-y-6">
                <div className="flex flex-wrap items-center justify-between gap-4">
                  <div>
                    <h1 className="text-2xl font-bold">Interaktiv Kalendar va Rejalar</h1>
                    <p className="text-sm text-zinc-500">Tadbirlar, eslatmalar va kunlik vazifalarni boshqaring</p>
                  </div>
                  <div className="flex gap-1.5 bg-[#F4F5F7] dark:bg-zinc-900 p-1 rounded-xl">
                    {(['month', 'week', 'day'] as const).map((v) => (
                      <button
                        key={v}
                        onClick={() => setCalView(v)}
                        className={`px-3 py-1.5 rounded-lg text-xs font-semibold capitalize ${calView === v ? 'bg-white dark:bg-zinc-800 shadow-2xs' : ''}`}
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
                  className="p-4 rounded-2xl bg-[#F8F9FA] dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800 grid grid-cols-1 sm:grid-cols-5 gap-3"
                >
                  <input
                    type="text"
                    value={newEventTitle}
                    onChange={(e) => setNewEventTitle(e.target.value)}
                    placeholder="Yangi tadbir yoki eslatma nomi..."
                    className="sm:col-span-2 px-3.5 py-2 rounded-xl bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 text-sm outline-none"
                    required
                  />
                  <input
                    type="date"
                    value={newEventDate}
                    onChange={(e) => setNewEventDate(e.target.value)}
                    className="px-3 py-2 rounded-xl bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 text-sm"
                  />
                  <input
                    type="time"
                    value={newEventTime}
                    onChange={(e) => setNewEventTime(e.target.value)}
                    className="px-3 py-2 rounded-xl bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 text-sm"
                  />
                  <div className="flex items-center gap-2">
                    <select
                      value={newEventColor}
                      onChange={(e) => setNewEventColor(e.target.value)}
                      className="px-2.5 py-2 rounded-xl bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 text-xs"
                    >
                      <option value="bg-blue-500">Ko‘k</option>
                      <option value="bg-emerald-500">Yashil</option>
                      <option value="bg-amber-500">Sariq</option>
                      <option value="bg-purple-500">Binafsha</option>
                    </select>
                    <button type="submit" className="flex-1 py-2 px-4 rounded-xl bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 text-xs font-semibold">
                      Qo‘shish
                    </button>
                  </div>
                </form>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {events.map((ev) => (
                    <div key={ev.id} className="p-4 rounded-2xl bg-[#F8F9FA] dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800 flex items-center justify-between">
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

            {/* 9. UZBEKISTAN MOBILE OPERATORS */}
            {activeSection === 'operators' && (
              <div className="space-y-6">
                <div>
                  <h1 className="text-2xl font-bold">O‘zbekiston Mobil Operatorlari Ma’lumotnomasi</h1>
                  <p className="text-sm text-zinc-500">Barcha USSD kodlarni bir bosishda nusxalang va tariflarni ko‘ring</p>
                </div>

                <div className="flex flex-wrap gap-2.5">
                  {UZ_OPERATORS.map((op) => (
                    <button
                      key={op.id}
                      onClick={() => setSelectedOperator(op.id)}
                      className={`px-4 py-2.5 rounded-2xl text-sm font-bold transition ${
                        selectedOperator === op.id ? `${op.color} shadow-md scale-102` : 'bg-[#F4F5F7] dark:bg-zinc-900'
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
                        <div className="p-6 rounded-3xl bg-[#F8F9FA] dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800">
                          <div className="flex flex-wrap items-center justify-between gap-2 mb-4">
                            <h2 className="text-xl font-bold">{op.name} — USSD Kodlar</h2>
                            <a href={op.website} target="_blank" rel="noreferrer" className="text-xs text-blue-600 font-semibold flex items-center gap-1">
                              Rasmiy sayt <ExternalLink className="w-3.5 h-3.5" />
                            </a>
                          </div>
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            {op.ussdCodes.map((u) => (
                              <div key={u.code} className="p-3.5 rounded-2xl bg-white dark:bg-zinc-950 border border-zinc-200/70 dark:border-zinc-800 flex items-center justify-between gap-2">
                                <div>
                                  <span className="font-mono font-bold text-base text-blue-600">{u.code}</span>
                                  <p className="text-xs text-zinc-500 mt-0.5">{u.desc}</p>
                                </div>
                                <button
                                  onClick={() => copyText(u.code, `USSD kod (${u.code})`)}
                                  className="p-2 rounded-xl bg-[#F4F5F7] dark:bg-zinc-900 hover:bg-zinc-200 transition shrink-0"
                                  title="Nusxalash"
                                >
                                  <Copy className="w-4 h-4" />
                                </button>
                              </div>
                            ))}
                          </div>
                        </div>

                        <div className="p-6 rounded-3xl bg-[#F8F9FA] dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800">
                          <h3 className="font-bold text-base mb-3">Mashhur Tariflar va Internet Paketlar</h3>
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            {op.tariffs.map((t) => (
                              <div key={t.name} className="p-4 rounded-2xl bg-white dark:bg-zinc-950 border border-zinc-200/70 dark:border-zinc-800">
                                <div className="flex justify-between font-bold text-sm">
                                  <span>{t.name}</span>
                                  <span className="text-emerald-600">{t.price}</span>
                                </div>
                                <p className="text-xs text-zinc-500 mt-1">{t.details}</p>
                              </div>
                            ))}
                            {op.packages.map((p) => (
                              <div key={p.name} className="p-4 rounded-2xl bg-white dark:bg-zinc-950 border border-zinc-200/70 dark:border-zinc-800">
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

                      <div className="p-6 rounded-3xl bg-[#F8F9FA] dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800 space-y-4">
                        <h3 className="font-bold text-base">Qo‘llab-quvvatlash va Xizmatlar</h3>
                        <div className="p-3.5 rounded-2xl bg-white dark:bg-zinc-950 border border-zinc-200/70 dark:border-zinc-800">
                          <p className="text-xs text-zinc-500">Call-markaz:</p>
                          <p className="font-bold text-sm mt-0.5">{op.support}</p>
                        </div>
                        <div className="space-y-2">
                          {op.shortNumbers.map((s) => (
                            <div key={s.code} className="flex items-center justify-between text-xs p-2.5 rounded-xl bg-white dark:bg-zinc-950">
                              <span><b>{s.code}</b> — {s.desc}</span>
                              <button onClick={() => copyText(s.code)} className="text-blue-600 font-semibold">Nusxa</button>
                            </div>
                          ))}
                        </div>
                        <div>
                          <p className="text-xs font-semibold text-zinc-500 mb-2">Qo‘shimcha xizmatlar:</p>
                          <div className="flex flex-wrap gap-1.5">
                            {op.services.map((srv) => (
                              <span key={srv} className="text-xs px-2.5 py-1 rounded-lg bg-white dark:bg-zinc-950 border border-zinc-200/70 dark:border-zinc-800">
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

            {/* 10. ORGANIZATIONS & USEFUL PHONE NUMBERS */}
            {activeSection === 'directory' && (
              <div className="space-y-6">
                <div className="flex flex-wrap items-center justify-between gap-4">
                  <div>
                    <h1 className="text-2xl font-bold">O‘zbekiston Tashkilotlari va Ishonch Telefonlari</h1>
                    <p className="text-sm text-zinc-500">Tasdiqlangan favqulodda xizmatlar, banklar, kommunal va davlat tashkilotlari raqamlari</p>
                  </div>
                  <input
                    type="text"
                    value={dirSearch}
                    onChange={(e) => setDirSearch(e.target.value)}
                    placeholder="Tashkilot yoki raqam qidirish..."
                    className="px-4 py-2 rounded-xl bg-[#F4F5F7] dark:bg-zinc-900 text-sm outline-none"
                  />
                </div>

                <div className="flex flex-wrap gap-2">
                  {['Barchasi', ...Array.from(new Set(UZ_DIRECTORY.map((d) => d.category)))].map((cat) => (
                    <button
                      key={cat}
                      onClick={() => setDirCategory(cat)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-semibold ${
                        dirCategory === cat ? 'bg-zinc-900 text-white dark:bg-white dark:text-zinc-900' : 'bg-[#F4F5F7] dark:bg-zinc-900'
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
                      <div key={item.id} className="p-5 rounded-3xl bg-[#F8F9FA] dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800 flex flex-col justify-between">
                        <div>
                          <div className="flex items-center justify-between gap-2">
                            <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-blue-500/10 text-blue-600">{item.category}</span>
                            <button
                              onClick={() => toggleBookmark({ id: item.id, type: 'Raqam', title: `${item.name} — ${item.phone}`, subtitle: item.category, section: 'directory' })}
                              className="text-zinc-400 hover:text-zinc-900 dark:hover:text-white"
                            >
                              <Bookmark className="w-4 h-4" />
                            </button>
                          </div>
                          <h3 className="font-bold text-base mt-2">{item.name}</h3>
                          <p className="text-xs text-zinc-500 mt-1">{item.description}</p>
                          {item.address && <p className="text-[11px] text-zinc-400 mt-2">📍 {item.address}</p>}
                          {item.hours && <p className="text-[11px] text-zinc-400">🕒 Ish vaqti: {item.hours}</p>}
                        </div>
                        <div className="mt-4 pt-3 border-t border-zinc-200/70 dark:border-zinc-800 flex items-center justify-between gap-2">
                          <a
                            href={`tel:${item.phone.replace(/\s+/g, '')}`}
                            className="flex-1 py-2 px-3 rounded-xl bg-emerald-600 text-white text-xs font-bold flex items-center justify-center gap-1.5"
                          >
                            <PhoneCall className="w-3.5 h-3.5" /> {item.phone}
                          </a>
                          <button
                            onClick={() => copyText(item.phone, 'Telefon raqami')}
                            className="p-2 rounded-xl bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700"
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

            {/* 11. PRODUCTIVITY TOOLS */}
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
                        activeTool === t.id ? 'bg-zinc-900 text-white dark:bg-white dark:text-zinc-900' : 'bg-[#F4F5F7] dark:bg-zinc-900'
                      }`}
                    >
                      {t.label}
                    </button>
                  ))}
                </div>

                <div className="p-6 rounded-3xl bg-[#F8F9FA] dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800 max-w-2xl">
                  {activeTool === 'calc' && (
                    <div className="space-y-3">
                      <input
                        type="text"
                        value={calcExpr}
                        readOnly
                        placeholder="0"
                        className="w-full p-4 rounded-2xl bg-white dark:bg-zinc-950 text-right font-mono text-2xl font-bold border border-zinc-200 dark:border-zinc-800"
                      />
                      <div className="grid grid-cols-4 gap-2">
                        {['7', '8', '9', '/', '4', '5', '6', '*', '1', '2', '3', '-', 'C', '0', '=', '+'].map((btn) => (
                          <button
                            key={btn}
                            onClick={() => {
                              if (btn === 'C') setCalcExpr('');
                              else if (btn === '=') {
                                try {
                                  // Safe arithmetic evaluation
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
                            className="py-3.5 rounded-xl bg-white dark:bg-zinc-950 border border-zinc-200/80 dark:border-zinc-800 font-bold text-base hover:bg-zinc-100 dark:hover:bg-zinc-800"
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
                        className="w-full p-3.5 rounded-xl bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 text-lg font-bold"
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
                        className="w-full p-3.5 rounded-xl bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 font-bold"
                      />
                      <div className="grid grid-cols-3 gap-3 text-sm">
                        <div className="p-3 rounded-xl bg-white dark:bg-zinc-950"><b>{(Number(unitMeters) / 1000).toFixed(3)}</b> km</div>
                        <div className="p-3 rounded-xl bg-white dark:bg-zinc-950"><b>{(Number(unitMeters) * 100).toLocaleString()}</b> sm</div>
                        <div className="p-3 rounded-xl bg-white dark:bg-zinc-950"><b>{(Number(unitMeters) * 3.28084).toFixed(2)}</b> fut</div>
                      </div>
                    </div>
                  )}

                  {activeTool === 'timer' && (
                    <div className="text-center space-y-4">
                      <p className="text-4xl font-mono font-bold">
                        {String(Math.floor(stopwatchSec / 60)).padStart(2, '0')}:{String(stopwatchSec % 60).padStart(2, '0')}
                      </p>
                      <div className="flex justify-center gap-3">
                        <button onClick={() => setStopwatchRunning(!stopwatchRunning)} className="px-5 py-2.5 rounded-xl bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 text-sm font-semibold">
                          {stopwatchRunning ? 'To‘xtatish' : 'Boshlash'}
                        </button>
                        <button onClick={() => { setStopwatchRunning(false); setStopwatchSec(0); }} className="px-5 py-2.5 rounded-xl border border-zinc-300 dark:border-zinc-700 text-sm font-semibold">
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
                        className="w-full p-4 rounded-2xl bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 text-sm outline-none"
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
                          className="flex-1 px-3.5 py-2 rounded-xl bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 text-sm"
                        />
                        <button type="submit" className="px-4 py-2 rounded-xl bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 text-xs font-semibold">Qo‘shish</button>
                      </form>
                      <div className="space-y-2">
                        {todos.map((td) => (
                          <div key={td.id} className="flex items-center justify-between p-3 rounded-xl bg-white dark:bg-zinc-950">
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
                        className="w-full p-3 rounded-xl bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 text-sm"
                      />
                      {qrText && (
                        <img
                          src={`https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(qrText)}`}
                          alt="QR Code"
                          className="mx-auto rounded-2xl border p-2 bg-white"
                        />
                      )}
                    </div>
                  )}

                  {activeTool === 'password' && (
                    <div className="space-y-4">
                      <div className="flex items-center justify-between p-4 rounded-2xl bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800">
                        <span className="font-mono font-bold text-lg">{genPass}</span>
                        <button onClick={() => copyText(genPass, 'Parol')} className="p-2 rounded-xl bg-[#F4F5F7] dark:bg-zinc-900">
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
                        className="px-4 py-2.5 rounded-xl bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 text-xs font-semibold"
                      >
                        Yangi kuchli parol yaratish
                      </button>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* 12. NEWS */}
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
                        newsCategory === cat ? 'bg-zinc-900 text-white dark:bg-white dark:text-zinc-900' : 'bg-[#F4F5F7] dark:bg-zinc-900'
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
                      <div key={news.id} className="rounded-3xl bg-[#F8F9FA] dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800 overflow-hidden flex flex-col">
                        <img src={news.image} alt={news.title} className="w-full h-44 object-cover" />
                        <div className="p-5 flex-1 flex flex-col justify-between">
                          <div>
                            <span className="text-[11px] font-bold text-blue-600">{news.category} • {news.date}</span>
                            <h3 className="font-bold text-base mt-1">{news.title}</h3>
                            <p className="text-xs text-zinc-500 mt-2">{news.summary}</p>
                          </div>
                          <div className="mt-4 pt-3 border-t border-zinc-200/70 dark:border-zinc-800 flex items-center justify-between">
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

            {/* 13. AI TOOLS DIRECTORY */}
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
                    className="px-4 py-2 rounded-xl bg-[#F4F5F7] dark:bg-zinc-900 text-sm outline-none"
                  />
                </div>

                <div className="flex flex-wrap gap-2">
                  {['Barchasi', 'Matn va Muloqot', 'Dasturlash', 'Rasm yaratish', 'Qidiruv va Tadqiqot', 'Audio va Ovoz', 'Samaradorlik'].map((cat) => (
                    <button
                      key={cat}
                      onClick={() => setAiToolCat(cat)}
                      className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold ${
                        aiToolCat === cat ? 'bg-zinc-900 text-white dark:bg-white dark:text-zinc-900' : 'bg-[#F4F5F7] dark:bg-zinc-900'
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
                      <div key={tool.id} className="p-5 rounded-3xl bg-[#F8F9FA] dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800 flex flex-col justify-between">
                        <div>
                          <div className="flex items-center justify-between">
                            <span className="text-[11px] font-bold text-purple-600">{tool.category}</span>
                            <span className="text-[10px] px-2 py-0.5 rounded-full bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700">{tool.pricing}</span>
                          </div>
                          <h3 className="font-bold text-base mt-2">{tool.name}</h3>
                          <p className="text-xs text-zinc-500 mt-1.5">{tool.description}</p>
                        </div>
                        <a
                          href={tool.url}
                          target="_blank"
                          rel="noreferrer"
                          className="mt-4 py-2 px-3 rounded-xl bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 text-xs font-semibold flex items-center justify-center gap-1.5"
                        >
                          Saytga o‘tish <ExternalLink className="w-3.5 h-3.5" />
                        </a>
                      </div>
                    ))}
                </div>
              </div>
            )}

            {/* 14. BOOKMARKS */}
            {activeSection === 'bookmarks' && (
              <div className="space-y-6">
                <div>
                  <h1 className="text-2xl font-bold">Saqlanganlar (Xatcho‘plar)</h1>
                  <p className="text-sm text-zinc-500">Saqlangan rasmlar, qurilmalar, maqolalar va foydali telefon raqamlar</p>
                </div>

                {bookmarks.length === 0 ? (
                  <div className="p-12 rounded-3xl bg-[#F8F9FA] dark:bg-zinc-900 text-center text-sm text-zinc-500">
                    Hozircha saqlangan elementlar yo‘q.
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {bookmarks.map((b) => (
                      <div key={b.id} className="p-4 rounded-2xl bg-[#F8F9FA] dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800 flex items-center justify-between">
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

            {/* 15. PROFILE */}
            {activeSection === 'profile' && (
              <div className="max-w-2xl space-y-6">
                <h1 className="text-2xl font-bold">Shaxsiy Profil</h1>
                {user ? (
                  <div className="p-6 rounded-3xl bg-[#F8F9FA] dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800 space-y-4">
                    <div className="flex items-center gap-4">
                      {user.avatar ? (
                        <img src={user.avatar} alt={user.name} className="w-16 h-16 rounded-full object-cover" />
                      ) : (
                        <div className="w-16 h-16 rounded-full bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 flex items-center justify-center text-xl font-bold">
                          {user.name.slice(0, 2).toUpperCase()}
                        </div>
                      )}
                      <div>
                        <h2 className="text-xl font-bold">{user.name}</h2>
                        <p className="text-sm text-zinc-500">{user.email || user.phone}</p>
                        <span className="inline-block mt-1 text-[11px] font-semibold px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600">
                          Tasdiqlangan akkaunt ({user.provider === 'phone' ? 'Telefon SMS' : 'Google OAuth'})
                        </span>
                      </div>
                    </div>
                    <div className="grid grid-cols-3 gap-3 pt-4 border-t border-zinc-200 dark:border-zinc-800 text-center">
                      <div className="p-3 rounded-2xl bg-white dark:bg-zinc-950">
                        <p className="text-xl font-bold">{bookmarks.length}</p>
                        <p className="text-xs text-zinc-500">Saqlanganlar</p>
                      </div>
                      <div className="p-3 rounded-2xl bg-white dark:bg-zinc-950">
                        <p className="text-xl font-bold">{tracks.filter((t) => t.isCustom).length}</p>
                        <p className="text-xs text-zinc-500">Shaxsiy musiqalar</p>
                      </div>
                      <div className="p-3 rounded-2xl bg-white dark:bg-zinc-950">
                        <p className="text-xl font-bold">{events.length}</p>
                        <p className="text-xs text-zinc-500">Tadbirlar</p>
                      </div>
                    </div>
                    <button onClick={handleLogout} className="px-4 py-2.5 rounded-xl bg-red-600 text-white text-xs font-semibold">
                      Akkauntdan chiqish
                    </button>
                  </div>
                ) : (
                  <div className="p-8 rounded-3xl bg-[#F8F9FA] dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800 text-center space-y-4">
                    <p className="text-sm text-zinc-600 dark:text-zinc-400">
                      Google akkauntingiz yoki O‘zbekiston (+998) telefon raqamingiz orqali tizimga kiring.
                    </p>
                    <button
                      onClick={() => { setAuthError(null); setAuthModalOpen(true); }}
                      className="px-6 py-3 rounded-xl bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 text-sm font-semibold"
                    >
                      Kirish / Ro‘yxatdan o‘tish
                    </button>
                  </div>
                )}
              </div>
            )}

            {/* 16. SETTINGS */}
            {activeSection === 'settings' && (
              <div className="max-w-2xl space-y-6">
                <h1 className="text-2xl font-bold">Platforma Sozlamalari</h1>
                <div className="p-6 rounded-3xl bg-[#F8F9FA] dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800 space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-semibold text-sm">Tungi rejim (Dark Mode)</p>
                      <p className="text-xs text-zinc-500">Standart holatda toza oq (#FFFFFF) rejim yoqilgan</p>
                    </div>
                    <button
                      onClick={() => setDarkMode(!darkMode)}
                      className="px-4 py-2 rounded-xl bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 text-xs font-semibold"
                    >
                      {darkMode ? 'Oq rejimga o‘tish' : 'Tungi rejimga o‘tish'}
                    </button>
                  </div>
                  <div className="pt-4 border-t border-zinc-200 dark:border-zinc-800">
                    <p className="font-semibold text-sm mb-1">Backend & Auth Holati</p>
                    <p className="text-xs text-zinc-500">
                      Supabase ulanishi: {supabase ? <span className="text-emerald-600 font-bold">Faol (Connected)</span> : <span className="text-amber-600 font-bold">Kalitlar kutilmoqda</span>}
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* 17. CONTACT (@roz1matoff_me) */}
            {activeSection === 'contact' && (
              <div className="max-w-2xl space-y-6">
                <div>
                  <h1 className="text-2xl font-bold">Aloqa va Qo‘llab-quvvatlash</h1>
                  <p className="text-sm text-zinc-500">Takliflar, hamkorlik va texnik savollar uchun bevosita bog‘laning</p>
                </div>

                <div className="p-6 rounded-3xl bg-[#F8F9FA] dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800 space-y-5">
                  <div className="flex flex-wrap items-center justify-between gap-4 p-4 rounded-2xl bg-white dark:bg-zinc-950 border border-zinc-200/70 dark:border-zinc-800">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-2xl bg-sky-500 text-white flex items-center justify-center">
                        <Send className="w-5 h-5" />
                      </div>
                      <div>
                        <p className="text-xs text-zinc-500">Rasmiy Telegram aloqa</p>
                        <p className="font-bold text-lg">@roz1matoff_me</p>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => copyText('@roz1matoff_me', 'Telegram username')}
                        className="px-3.5 py-2 rounded-xl border border-zinc-200 dark:border-zinc-800 text-xs font-semibold flex items-center gap-1.5"
                      >
                        <Copy className="w-3.5 h-3.5" /> Nusxalash
                      </button>
                      <a
                        href="https://t.me/roz1matoff_me"
                        target="_blank"
                        rel="noreferrer"
                        className="px-4 py-2 rounded-xl bg-sky-500 text-white text-xs font-semibold flex items-center gap-1.5"
                      >
                        Telegramda yozish <ExternalLink className="w-3.5 h-3.5" />
                      </a>
                    </div>
                  </div>

                  <form
                    onSubmit={(e) => {
                      e.preventDefault();
                      if (!contactMsg.trim()) return;
                      window.open(`https://t.me/roz1matoff_me?text=${encodeURIComponent(`Ism: ${contactName || 'Foydalanuvchi'}\nXabar: ${contactMsg}`)}`, '_blank');
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
                      className="w-full px-4 py-2.5 rounded-xl bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 text-sm outline-none"
                    />
                    <textarea
                      rows={4}
                      value={contactMsg}
                      onChange={(e) => setContactMsg(e.target.value)}
                      placeholder="Xabaringizni yozing — Telegram orqali yuboriladi..."
                      className="w-full px-4 py-2.5 rounded-xl bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 text-sm outline-none"
                      required
                    />
                    <button type="submit" className="px-5 py-2.5 rounded-xl bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 text-sm font-semibold">
                      Telegram orqali yuborish
                    </button>
                  </form>
                </div>
              </div>
            )}
          </main>

          {/* STICKY MUSIC PLAYER BAR */}
          {currentTrack && (
            <div className="fixed bottom-0 left-0 lg:left-64 right-0 z-30 bg-white/95 dark:bg-zinc-950/95 backdrop-blur-md border-t border-zinc-200/80 dark:border-zinc-800 px-4 lg:px-8 py-2.5 flex items-center justify-between gap-4">
              <div className="flex items-center gap-3 min-w-0">
                <img src={currentTrack.cover} alt={currentTrack.title} className="w-10 h-10 rounded-xl object-cover" />
                <div className="min-w-0">
                  <p className="font-bold text-xs truncate">{currentTrack.title}</p>
                  <p className="text-[11px] text-zinc-500 truncate">{currentTrack.artist}</p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <button
                  onClick={() => setCurrentTrackIndex((i) => (i - 1 + tracks.length) % tracks.length)}
                  className="p-2 rounded-xl hover:bg-zinc-100 dark:hover:bg-zinc-900"
                >
                  <SkipBack className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setIsPlaying(!isPlaying)}
                  className="w-10 h-10 rounded-full bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 flex items-center justify-center shadow-sm"
                >
                  {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4 ml-0.5" />}
                </button>
                <button
                  onClick={() => setCurrentTrackIndex((i) => (i + 1) % tracks.length)}
                  className="p-2 rounded-xl hover:bg-zinc-100 dark:hover:bg-zinc-900"
                >
                  <SkipForward className="w-4 h-4" />
                </button>
              </div>

              <div className="hidden sm:flex items-center gap-2">
                <button onClick={() => setMuted(!muted)} className="p-1.5">
                  {muted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
                </button>
                <input
                  type="range"
                  min={0}
                  max={1}
                  step={0.05}
                  value={muted ? 0 : volume}
                  onChange={(e) => { setMuted(false); setVolume(Number(e.target.value)); }}
                  className="w-20 accent-zinc-900 dark:accent-white"
                />
              </div>
            </div>
          )}
        </div>

        {/* --- MODALS --- */}

        {/* AUTH MODAL (Google OAuth & +998 SMS OTP) */}
        {authModalOpen && (
          <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
            <div className="bg-white dark:bg-zinc-900 rounded-3xl max-w-md w-full p-6 border border-zinc-200 dark:border-zinc-800 shadow-2xl space-y-5">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-bold">VerMix’ga Kirish</h2>
                <button onClick={() => setAuthModalOpen(false)} className="p-1.5 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-800">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="grid grid-cols-2 gap-1.5 p-1 rounded-xl bg-[#F4F5F7] dark:bg-zinc-800">
                <button
                  onClick={() => { setAuthTab('google'); setAuthError(null); }}
                  className={`py-2 rounded-lg text-xs font-semibold ${authTab === 'google' ? 'bg-white dark:bg-zinc-950 shadow-2xs' : ''}`}
                >
                  Google Akkaunt
                </button>
                <button
                  onClick={() => { setAuthTab('phone'); setAuthError(null); }}
                  className={`py-2 rounded-lg text-xs font-semibold ${authTab === 'phone' ? 'bg-white dark:bg-zinc-950 shadow-2xs' : ''}`}
                >
                  Telefon (+998 SMS)
                </button>
              </div>

              {authError && (
                <div className="p-3 rounded-xl bg-red-50 dark:bg-red-950/40 text-red-600 text-xs leading-relaxed">
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
                    className="w-full py-3 px-4 rounded-xl bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 text-sm font-semibold flex items-center justify-center gap-2.5 hover:opacity-90 disabled:opacity-50"
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
                        <div className="flex items-center rounded-xl border border-zinc-200 dark:border-zinc-700 overflow-hidden bg-[#F8F9FA] dark:bg-zinc-950">
                          <span className="px-3.5 py-2.5 text-sm font-bold border-r border-zinc-200 dark:border-zinc-800">+998</span>
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
                        className="w-full py-3 rounded-xl bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 text-sm font-semibold disabled:opacity-50"
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
                          className="w-full px-4 py-2.5 rounded-xl border border-zinc-200 dark:border-zinc-700 text-center font-mono text-lg tracking-widest bg-[#F8F9FA] dark:bg-zinc-950 outline-none"
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

        {/* ADD CUSTOM MUSIC MODAL */}
        {addMusicModal && (
          <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
            <form onSubmit={handleAddCustomTrack} className="bg-white dark:bg-zinc-900 rounded-3xl max-w-md w-full p-6 border border-zinc-200 dark:border-zinc-800 space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-bold">O‘zingiz xohlagan musiqani qo‘shish</h2>
                <button type="button" onClick={() => setAddMusicModal(false)}><X className="w-5 h-5" /></button>
              </div>
              <input
                type="text"
                value={customTitle}
                onChange={(e) => setCustomTitle(e.target.value)}
                placeholder="Qo‘shiq nomi *"
                className="w-full px-3.5 py-2.5 rounded-xl bg-[#F4F5F7] dark:bg-zinc-950 text-sm outline-none"
                required
              />
              <input
                type="text"
                value={customArtist}
                onChange={(e) => setCustomArtist(e.target.value)}
                placeholder="Ijrochi nomi"
                className="w-full px-3.5 py-2.5 rounded-xl bg-[#F4F5F7] dark:bg-zinc-950 text-sm outline-none"
              />
              <div className="space-y-2">
                <label className="block text-xs font-semibold text-zinc-500">Kompyuter/telefondan audio fayl tanlang (MP3/WAV):</label>
                <input type="file" accept="audio/*" onChange={handleCustomAudioFile} className="text-xs" />
                <input
                  type="url"
                  value={customAudioUrl}
                  onChange={(e) => setCustomAudioUrl(e.target.value)}
                  placeholder="Yoki to‘g‘ridan-to‘g‘ri MP3 havola kiriting..."
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[#F4F5F7] dark:bg-zinc-950 text-sm outline-none"
                  required
                />
              </div>
              <input
                type="url"
                value={customCoverUrl}
                onChange={(e) => setCustomCoverUrl(e.target.value)}
                placeholder="Muqova rasmi havolasi (ixtiyoriy)"
                className="w-full px-3.5 py-2.5 rounded-xl bg-[#F4F5F7] dark:bg-zinc-950 text-sm outline-none"
              />
              <button type="submit" className="w-full py-3 rounded-xl bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 text-sm font-semibold">
                Pleylistga qo‘shish va tinglash
              </button>
            </form>
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
              className="bg-white dark:bg-zinc-900 rounded-3xl max-w-md w-full p-6 border border-zinc-200 dark:border-zinc-800 space-y-4"
            >
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-bold">Yangi rasm qo‘shish</h2>
                <button type="button" onClick={() => setNewPinModal(false)}><X className="w-5 h-5" /></button>
              </div>
              <input type="text" value={newPinTitle} onChange={(e) => setNewPinTitle(e.target.value)} placeholder="Rasm sarlavhasi" className="w-full px-3.5 py-2.5 rounded-xl bg-[#F4F5F7] dark:bg-zinc-950 text-sm" required />
              <input type="url" value={newPinUrl} onChange={(e) => setNewPinUrl(e.target.value)} placeholder="Rasm URL manzili (https://...)" className="w-full px-3.5 py-2.5 rounded-xl bg-[#F4F5F7] dark:bg-zinc-950 text-sm" required />
              <select value={newPinCat} onChange={(e) => setNewPinCat(e.target.value)} className="w-full px-3.5 py-2.5 rounded-xl bg-[#F4F5F7] dark:bg-zinc-950 text-sm">
                <option>Texnologiya</option>
                <option>Dizayn</option>
                <option>Sayohat</option>
                <option>Arxitektura</option>
                <option>Koinot</option>
              </select>
              <button type="submit" className="w-full py-3 rounded-xl bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 text-sm font-semibold">Saqlash</button>
            </form>
          </div>
        )}

        {/* COMPUTER DETAIL MODAL */}
        {selectedComputer && (
          <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
            <div className="bg-white dark:bg-zinc-900 rounded-3xl max-w-2xl w-full p-6 border border-zinc-200 dark:border-zinc-800 max-h-[90vh] overflow-y-auto space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-bold">{selectedComputer.brand} {selectedComputer.model}</h2>
                <button onClick={() => setSelectedComputer(null)}><X className="w-5 h-5" /></button>
              </div>
              <img src={selectedComputer.image} alt={selectedComputer.model} className="w-full h-56 object-cover rounded-2xl" />
              <p className="text-sm text-zinc-600 dark:text-zinc-400">{selectedComputer.description}</p>
              <div className="grid grid-cols-2 gap-3 text-xs">
                <div className="p-3 rounded-xl bg-[#F8F9FA] dark:bg-zinc-950"><b>Protsessor:</b> {selectedComputer.processor}</div>
                <div className="p-3 rounded-xl bg-[#F8F9FA] dark:bg-zinc-950"><b>RAM / Xotira:</b> {selectedComputer.ram} / {selectedComputer.storage}</div>
                <div className="p-3 rounded-xl bg-[#F8F9FA] dark:bg-zinc-950"><b>Video karta:</b> {selectedComputer.gpu}</div>
                <div className="p-3 rounded-xl bg-[#F8F9FA] dark:bg-zinc-950"><b>Batareya:</b> {selectedComputer.battery}</div>
              </div>
              <div className="grid grid-cols-2 gap-3 text-xs">
                <div className="p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/30 text-emerald-700 dark:text-emerald-400">
                  <b>Afzalliklari:</b>
                  <ul className="mt-1 list-disc list-inside">{selectedComputer.pros.map((p) => <li key={p}>{p}</li>)}</ul>
                </div>
                <div className="p-3 rounded-xl bg-red-50 dark:bg-red-950/30 text-red-700 dark:text-red-400">
                  <b>Kamchiliklari:</b>
                  <ul className="mt-1 list-disc list-inside">{selectedComputer.cons.map((c) => <li key={c}>{c}</li>)}</ul>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* PHONE DETAIL MODAL */}
        {selectedPhone && (
          <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
            <div className="bg-white dark:bg-zinc-900 rounded-3xl max-w-xl w-full p-6 border border-zinc-200 dark:border-zinc-800 max-h-[90vh] overflow-y-auto space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-bold">{selectedPhone.brand} {selectedPhone.model}</h2>
                <button onClick={() => setSelectedPhone(null)}><X className="w-5 h-5" /></button>
              </div>
              <img src={selectedPhone.image} alt={selectedPhone.model} className="w-full h-56 object-cover rounded-2xl" />
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 text-xs">
                <div className="p-3 rounded-xl bg-[#F8F9FA] dark:bg-zinc-950"><b>Chiqarilgan sana:</b> {selectedPhone.releaseDate}</div>
                <div className="p-3 rounded-xl bg-[#F8F9FA] dark:bg-zinc-950"><b>Narxi:</b> {selectedPhone.price}</div>
                <div className="p-3 rounded-xl bg-[#F8F9FA] dark:bg-zinc-950"><b>Ekran:</b> {selectedPhone.display}</div>
                <div className="p-3 rounded-xl bg-[#F8F9FA] dark:bg-zinc-950"><b>Protsessor:</b> {selectedPhone.processor}</div>
                <div className="p-3 rounded-xl bg-[#F8F9FA] dark:bg-zinc-950"><b>Xotira:</b> {selectedPhone.ramStorage}</div>
                <div className="p-3 rounded-xl bg-[#F8F9FA] dark:bg-zinc-950"><b>OS:</b> {selectedPhone.os}</div>
                <div className="p-3 rounded-xl bg-[#F8F9FA] dark:bg-zinc-950 sm:col-span-2"><b>Asosiy kamera:</b> {selectedPhone.mainCamera}</div>
                <div className="p-3 rounded-xl bg-[#F8F9FA] dark:bg-zinc-950"><b>Old kamera:</b> {selectedPhone.frontCamera}</div>
                <div className="p-3 rounded-xl bg-[#F8F9FA] dark:bg-zinc-950"><b>Batareya:</b> {selectedPhone.battery} ({selectedPhone.charging})</div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}