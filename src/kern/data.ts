import type { Barber, HairReference, Service } from "./types";

export const services: Service[] = [
  {
    id: "haircut",
    name: "Мужская стрижка",
    category: "Стрижка",
    description: "Форма, которая работает и без сложной укладки.",
    price: 2400,
    duration: 45,
    badge: "Выбирают чаще",
  },
  {
    id: "machine",
    name: "Стрижка машинкой",
    category: "Стрижка",
    description: "Чистая длина и точный переход по всей голове.",
    price: 1600,
    duration: 30,
  },
  {
    id: "beard",
    name: "Оформление бороды",
    category: "Борода",
    description: "Силуэт, длина и контур под черты лица.",
    price: 1800,
    duration: 30,
  },
  {
    id: "contour",
    name: "Коррекция контуров",
    category: "Борода",
    description: "Быстро вернуть чёткую линию висков и бороды.",
    price: 900,
    duration: 15,
  },
  {
    id: "combo",
    name: "Стрижка + борода",
    category: "Комплекс",
    description: "Одна консультация и цельный образ за один визит.",
    price: 3600,
    duration: 75,
    badge: "Выгоднее на 600 ₽",
    savings: 600,
  },
  {
    id: "camouflage",
    name: "Камуфляж седины",
    category: "Дополнительно",
    description: "Мягко выровнять тон, сохранив естественный вид.",
    price: 1900,
    duration: 30,
  },
  {
    id: "styling",
    name: "Укладка",
    category: "Дополнительно",
    description: "Подобрать средство и повторить форму самостоятельно.",
    price: 900,
    duration: 15,
  },
  {
    id: "long",
    name: "Стрижка длинных волос",
    category: "Стрижка",
    description: "Снять лишнюю массу и сохранить движение длины.",
    price: 3000,
    duration: 60,
  },
  {
    id: "first",
    name: "Знакомство и форма",
    category: "Комплекс",
    description: "Подробная консультация и стрижка для первого визита.",
    price: 2900,
    duration: 60,
  },
];

export const barbers: Barber[] = [
  {
    id: "ilya",
    name: "Илья",
    specialty: "Fade · короткие формы",
    description: "Работает с переходами и силуэтами, которые не требуют долгих сборов утром.",
    serviceIds: ["haircut", "machine", "beard", "contour", "combo", "styling"],
    schedule: { days: [2, 3, 4, 5, 6], opens: "10:00", closes: "20:00" },
    portraitIndex: 0,
  },
  {
    id: "sasha",
    name: "Саша",
    specialty: "Crop · длинные волосы",
    description: "Сохраняет характер волос и объясняет, как укладывать форму дома.",
    serviceIds: ["haircut", "long", "camouflage", "styling", "first"],
    schedule: { days: [0, 2, 4, 5, 6], opens: "11:00", closes: "19:00" },
    portraitIndex: 1,
  },
  {
    id: "roman",
    name: "Роман",
    specialty: "Борода · классическая форма",
    description: "Собирает стрижку и бороду в одну чистую линию.",
    serviceIds: ["machine", "beard", "contour", "combo", "camouflage", "first"],
    schedule: { days: [3, 4, 5, 6], opens: "10:00", closes: "19:00" },
    portraitIndex: 2,
  },
];

export const hairReferences: HairReference[] = [
  {
    id: "textured-crop",
    title: "Текстурный кроп",
    description: "Короткий контур и живая текстура сверху. Форма держится без долгой укладки.",
    category: "short",
    length: "short",
    effort: "minimal",
    character: "sharp",
    serviceId: "haircut",
    imageIndex: 0,
    inFinder: true,
  },
  {
    id: "low-fade",
    title: "Низкий fade",
    description: "Плавный переход у виска и немного длины сверху для свободы формы.",
    category: "short",
    length: "short",
    effort: "regular",
    character: "sharp",
    serviceId: "haircut",
    imageIndex: 1,
    inFinder: true,
  },
  {
    id: "textured-fringe",
    title: "Текстурная челка",
    description: "Мягкое движение у лица и естественная текстура без жёсткой фиксации.",
    category: "medium",
    length: "medium",
    effort: "regular",
    character: "natural",
    serviceId: "haircut",
    imageIndex: 2,
    inFinder: true,
  },
  {
    id: "classic-side",
    title: "Классический пробор",
    description: "Собранная форма с понятной линией и аккуратным объёмом.",
    category: "medium",
    length: "medium",
    effort: "detailed",
    character: "classic",
    serviceId: "haircut",
    imageIndex: 3,
    inFinder: true,
  },
  {
    id: "long-layers",
    title: "Длинные слои",
    description: "Слои снимают лишний вес, но оставляют естественное движение волос.",
    category: "long",
    length: "long",
    effort: "regular",
    character: "natural",
    serviceId: "long",
    imageIndex: 4,
    inFinder: true,
  },
  {
    id: "beard-shape",
    title: "Чёткая форма бороды",
    description: "Аккуратный контур и ровная длина подчёркивают естественную линию лица.",
    category: "beard",
    length: "short",
    effort: "minimal",
    character: "classic",
    serviceId: "beard",
    imageIndex: 5,
    inFinder: false,
  },
];

export const serviceCategories = ["Все услуги", "Стрижка", "Борода", "Дополнительно", "Комплекс"] as const;

export function getService(serviceId: string): Service | undefined {
  return services.find((service) => service.id === serviceId);
}

export function getBarber(barberId: string): Barber | undefined {
  return barbers.find((barber) => barber.id === barberId);
}
