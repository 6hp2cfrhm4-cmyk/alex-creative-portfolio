export const serviceCategories = [
  { id: "cut", label: "Стрижки и укладки" },
  { id: "color", label: "Окрашивание" },
  { id: "care", label: "Уход за волосами" },
  { id: "nails", label: "Маникюр и педикюр" },
] as const;

export type ServiceCategory = (typeof serviceCategories)[number]["id"];

export interface Service {
  id: string;
  category: ServiceCategory;
  name: string;
  description: string;
  duration: number;
  price: number;
  masterIds: string[];
}

export interface Master {
  id: string;
  name: string;
  role: string;
  image: string;
  imageAlt: string;
  statement: string;
  specialties: string[];
  serviceIds: string[];
}

export const services: Service[] = [
  { id: "consultation", category: "cut", name: "Знакомство и форма", description: "Консультация, план формы и рекомендации по домашнему уходу.", duration: 30, price: 1800, masterIds: ["alyona", "lika"] },
  { id: "signature-cut", category: "cut", name: "Стрижка и укладка", description: "Форма, которая естественно отрастает и легко укладывается.", duration: 75, price: 4200, masterIds: ["alyona", "lika"] },
  { id: "long-cut", category: "cut", name: "Стрижка длинных волос", description: "Работа с плотностью, движением и сохранением длины.", duration: 90, price: 5200, masterIds: ["alyona"] },
  { id: "blow-dry", category: "cut", name: "Укладка", description: "Мягкий объём и текстура без ощущения лака.", duration: 45, price: 2600, masterIds: ["alyona", "lika"] },
  { id: "tone", category: "color", name: "Окрашивание в один тон", description: "Мягкая глубина цвета с подбором оттенка к коже.", duration: 150, price: 8500, masterIds: ["lika"] },
  { id: "air-touch", category: "color", name: "Мягкое высветление", description: "Тонкие световые акценты с деликатным переходом у корня.", duration: 240, price: 14500, masterIds: ["lika"] },
  { id: "contour", category: "color", name: "Световой контур", description: "Несколько светлых прядей у лица и тонирование.", duration: 180, price: 9800, masterIds: ["lika"] },
  { id: "gloss", category: "color", name: "Тонирование и блеск", description: "Освежить оттенок и вернуть волосам мягкое сияние.", duration: 90, price: 6500, masterIds: ["lika", "marina"] },
  { id: "hydration", category: "care", name: "Глубокое увлажнение", description: "Короткий ритуал для мягкости и естественного блеска.", duration: 60, price: 4600, masterIds: ["marina"] },
  { id: "repair", category: "care", name: "Восстанавливающий уход", description: "Последовательный уход по состоянию и плотности волос.", duration: 90, price: 5900, masterIds: ["marina"] },
  { id: "scalp", category: "care", name: "Уход за кожей головы", description: "Очищение, массаж и рекомендации без лишних обещаний.", duration: 60, price: 3900, masterIds: ["marina"] },
  { id: "manicure", category: "nails", name: "Маникюр с покрытием", description: "Аккуратная форма, уход за кутикулой и спокойный оттенок.", duration: 105, price: 3900, masterIds: ["nika"] },
  { id: "spa-manicure", category: "nails", name: "Маникюр без покрытия", description: "Чистая форма, бережный уход и лёгкий массаж рук.", duration: 75, price: 3000, masterIds: ["nika"] },
  { id: "pedicure", category: "nails", name: "Педикюр с покрытием", description: "Комфортный уход и стойкое однотонное покрытие.", duration: 120, price: 4900, masterIds: ["nika"] },
];

export const masters: Master[] = [
  { id: "alyona", name: "Алёна Соколова", role: "Стилист", image: "/images/velora-master-alyona.jpg", imageAlt: "Демонстрационный портрет стилиста Алёны Соколовой", statement: "Любит точные формы и стрижки, которым не нужна сложная укладка.", specialties: ["Форма", "Стрижка", "Укладка"], serviceIds: ["consultation", "signature-cut", "long-cut", "blow-dry"] },
  { id: "lika", name: "Лика Ветрова", role: "Колорист", image: "/images/velora-master-lika.jpg", imageAlt: "Демонстрационный портрет колориста Лики Ветровой", statement: "Работает с цветом тонко: чтобы перемена оставалась похожей на вас.", specialties: ["Натуральный цвет", "Световые акценты", "Тонирование"], serviceIds: ["consultation", "signature-cut", "blow-dry", "tone", "air-touch", "contour", "gloss"] },
  { id: "marina", name: "Марина Елисеева", role: "Специалист по уходу", image: "/images/velora-master-marina.jpg", imageAlt: "Демонстрационный портрет специалиста по уходу Марины Елисеевой", statement: "Сначала состояние волос. Затем — только тот уход, который им нужен.", specialties: ["Восстановление", "Кожа головы", "Мягкий блеск"], serviceIds: ["gloss", "hydration", "repair", "scalp"] },
  { id: "nika", name: "Ника Орлова", role: "Мастер ногтевого сервиса", image: "/images/velora-master-nika.jpg", imageAlt: "Демонстрационный портрет мастера ногтевого сервиса Ники Орловой", statement: "Бережный маникюр, чистая линия и палитра без случайных оттенков.", specialties: ["Маникюр", "Педикюр", "Нюдовая палитра"], serviceIds: ["manicure", "spa-manicure", "pedicure"] },
];

export type GalleryCategory = "color" | "shape" | "hands";

export const galleryCategories: { id: GalleryCategory | "all"; label: string }[] = [
  { id: "all", label: "Все" },
  { id: "color", label: "Цвет" },
  { id: "shape", label: "Форма" },
  { id: "hands", label: "Детали" },
];

export const gallery = [
  { image: "/images/velora-hair-shape.jpg", category: "shape" as const, alt: "Иллюстративный кадр точной формы короткого боба", caption: "Линия и движение" },
  { image: "/images/velora-color-study.jpg", category: "color" as const, alt: "Иллюстрация работы колориста с каштановыми волосами", caption: "Каштан и свет" },
  { image: "/images/velora-hero.jpg", category: "shape" as const, alt: "Редакционный образ укладки в тёплом свете салона", caption: "Мягкая укладка" },
  { image: "/images/velora-manicure.jpg", category: "hands" as const, alt: "Иллюстративный кадр натурального маникюра на льняной ткани", caption: "Внимание к деталям" },
];

export const faqs = [
  { question: "Нужно ли подготовить волосы перед визитом?", answer: "Для стрижки достаточно прийти с чистыми сухими волосами. Перед окрашиванием ничего специально делать не нужно — мастер уточнит состояние и историю ухода на консультации." },
  { question: "Почему цена указана «от»?", answer: "Время и стоимость окрашивания зависят от длины, густоты и исходного цвета. Точный план и сумма согласуются до начала работы." },
  { question: "Можно сначала обсудить услугу?", answer: "Да. Выберите «Знакомство и форма» — это отдельное короткое время на разговор и рекомендации без обязательства делать процедуру." },
  { question: "Что делать, если я опаздываю?", answer: "Если бы это была реальная запись, лучше заранее сообщить салону. В этой демо-версии контакты не подключены, поэтому сообщение отправить нельзя." },
  { question: "Как перенести или отменить визит?", answer: "Здесь создаётся только тестовая запись в текущем браузере. Перенос и отмена доступны лишь после подключения настоящего сервиса записи." },
  { question: "Можно ли выбрать мастера?", answer: "Да. Сначала выберите услугу — список покажет только тех специалистов, которые работают с ней. Можно также выбрать первого свободного мастера." },
];

export function formatPrice(price: number): string {
  return new Intl.NumberFormat("ru-RU", { maximumFractionDigits: 0 }).format(price) + " ₽";
}

export function formatDuration(minutes: number): string {
  const hours = Math.floor(minutes / 60);
  const rest = minutes % 60;
  if (!hours) return minutes + " мин";
  if (!rest) return hours + " ч";
  return hours + " ч " + rest + " мин";
}
