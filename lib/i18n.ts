import { cookies } from "next/headers";
import type { Lang } from "./types";

const dict = {
  brand: { uz: "Topdim!", en: "Topdim!" },
  tagline: {
    uz: "Universitetlarda yo‘qolgan va topilgan buyumlarni vaqt va joy bo‘yicha moslashtiramiz.",
    en: "Matching lost and found campus items by time, place, and story.",
  },
  navBrowse: { uz: "E’lonlar", en: "Browse" },
  navPost: { uz: "E’lon berish", en: "Post an item" },
  navMatches: { uz: "Mosliklar", en: "Matches" },
  navUnis: { uz: "Universitetlar", en: "Campuses" },
  navPartners: { uz: "Hamkorlik", en: "Partners" },
  navHow: { uz: "Qanday ishlaydi", en: "How it works" },
  navMap: { uz: "Xarita", en: "Map" },
  login: { uz: "Kirish", en: "Log in" },
  register: { uz: "Ro‘yxatdan o‘tish", en: "Join campus" },
  logout: { uz: "Chiqish", en: "Log out" },
  dashboard: { uz: "Kabinet", en: "Dashboard" },
  messages: { uz: "Xabarlar", en: "Messages" },
  heroKicker: { uz: "Kampusda yo‘qolgan narsa — endi yo‘qolgan emas", en: "Nothing stays lost on campus" },
  heroTitle: {
    uz: "Yo‘qotdingizmi? Kimdir allaqachon topgan bo‘lishi mumkin.",
    en: "Lost it? Someone on campus may have already found it.",
  },
  heroBody: {
    uz: "Hujjat, kitob, quloqchin, kalit — Topdim! ularni universitet, bino, sana va soat bo‘yicha juftlaydi. Talabalar o‘rtasida ishonchli, tez va chiroyli.",
    en: "IDs, books, earbuds, keys — Topdim! pairs them by university, building, date and hour. Fast, trusted, built for students.",
  },
  ctaLost: { uz: "Yo‘qotdim", en: "I lost something" },
  ctaFound: { uz: "Topdim", en: "I found something" },
  ctaBrowse: { uz: "Barcha e’lonlar", en: "See the board" },
  statsItems: { uz: "faol e’lon", en: "live listings" },
  statsUnis: { uz: "kampus", en: "campuses" },
  statsReunited: { uz: "qaytarilgan", en: "reunited" },
  statsHours: { uz: "soat ichida o‘rtacha moslik", en: "avg. hours to a match" },
  howTitle: { uz: "Uch qadam. Bir topilma.", en: "Three steps. One reunion." },
  how1t: { uz: "E’lon qoldiring", en: "Post it" },
  how1d: {
    uz: "Yo‘qolgan yoki topilgan. Rasm o‘rniga rang, belgi, joy va vaqt — shu yetarli.",
    en: "Lost or found. Color, mark, place and time are enough to start matching.",
  },
  how2t: { uz: "Moslikni ko‘ring", en: "See the match" },
  how2d: {
    uz: "Algoritm kategoriya, kampus nuqtasi va 14 kunlik oynani solishtiradi.",
    en: "We score category, campus spot and a 14-day time window.",
  },
  how3t: { uz: "Xavfsiz bog‘laning", en: "Connect safely" },
  how3d: {
    uz: "Maxfiy savol va ichki xabar. Telefon raqami e’londa ochiq turmaydi.",
    en: "A secret question plus in-app chat. Phone numbers stay off the board.",
  },
  filterSearch: { uz: "Qidiruv… AirPods, student ID, kalit", en: "Search… AirPods, student ID, keys" },
  filterKind: { uz: "Turi", en: "Type" },
  filterCat: { uz: "Kategoriya", en: "Category" },
  filterUni: { uz: "Universitet", en: "University" },
  filterSpot: { uz: "Joy", en: "Place" },
  filterFrom: { uz: "Dan", en: "From" },
  filterTo: { uz: "Gacha", en: "To" },
  all: { uz: "Hammasi", en: "All" },
  empty: { uz: "Bu filtrlar bo‘yicha hozircha e’lon yo‘q.", en: "No listings for these filters yet." },
  postTitle: { uz: "Yangi e’lon", en: "New listing" },
  postLead: {
    uz: "Imkon qadar aniq yozing — moslik shundan tug‘iladi.",
    en: "Be specific — that’s how a match is born.",
  },
  title: { uz: "Sarlavha", en: "Title" },
  desc: { uz: "Tavsif", en: "Description" },
  when: { uz: "Qachon", en: "When" },
  color: { uz: "Rang", en: "Color" },
  brandField: { uz: "Brend / belgi", en: "Brand / mark" },
  secretQ: { uz: "Maxfiy savol (ixtiyoriy)", en: "Secret question (optional)" },
  secretA: { uz: "To‘g‘ri javob", en: "Correct answer" },
  publish: { uz: "E’lonni chiqarish", en: "Publish listing" },
  claim: { uz: "Bu mening buyumim", en: "This is mine" },
  claimFound: { uz: "Egasi menman deb yozish", en: "Message the finder" },
  similar: { uz: "Mos kelishi mumkin", en: "Likely matches" },
  partnersTitle: { uz: "Universitetlar uchun xizmat", en: "A campus service, not a classifieds dump" },
  partnersLead: {
    uz: "Daromad: universitetlarga obuna, kampus kiosk va homiylik. Talabalar uchun esa bepul.",
    en: "Revenue from university subscriptions, kiosks and sponsors. Free for students.",
  },
  kiosk: { uz: "Kiosk ekran", en: "Kiosk screen" },
  footer: {
    uz: "Topdim! — kampusda yo‘qolgan narsalarning uyiga qaytish yo‘li.",
    en: "Topdim! — the way lost campus things find their way home.",
  },
} as const;

export type DictKey = keyof typeof dict;

export function t(lang: Lang, key: DictKey) {
  return dict[key][lang];
}

export async function getLang(): Promise<Lang> {
  const value = (await cookies()).get("lang")?.value;
  return value === "en" ? "en" : "uz";
}

export { dict };
