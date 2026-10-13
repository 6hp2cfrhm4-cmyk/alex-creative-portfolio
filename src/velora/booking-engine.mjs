export const RESERVATION_STORAGE_KEY = "velora-demo-reservations-v1";

export function localDateKey(date = new Date()) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return year + "-" + month + "-" + day;
}

export function salonHours(dateKey) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(dateKey)) return null;
  const day = new Date(dateKey + "T12:00:00").getDay();
  return day === 0 ? { opens: 11 * 60, closes: 18 * 60 } : { opens: 10 * 60, closes: 20 * 60 };
}

function hash(input) {
  let value = 2166136261;
  for (let index = 0; index < input.length; index += 1) {
    value ^= input.charCodeAt(index);
    value = Math.imul(value, 16777619);
  }
  return value >>> 0;
}

function overlaps(start, duration, otherStart, otherDuration) {
  return start < otherStart + otherDuration && otherStart < start + duration;
}

export function getAvailableSlots({ dateKey, durationMinutes, masterId = null, eligibleMasterIds = [], reservations = [], todayKey = localDateKey(), currentMinute = new Date().getHours() * 60 + new Date().getMinutes() }) {
  if (dateKey < todayKey || !Number.isFinite(durationMinutes) || durationMinutes <= 0) return [];
  const hours = salonHours(dateKey);
  if (!hours || eligibleMasterIds.length === 0) return [];
  if (masterId && !eligibleMasterIds.includes(masterId)) return [];
  const earliest = dateKey === todayKey ? Math.max(hours.opens, Math.ceil((currentMinute + 15) / 30) * 30) : hours.opens;
  const candidates = masterId ? [masterId] : eligibleMasterIds;
  const slots = [];

  for (let start = hours.opens; start + durationMinutes <= hours.closes; start += 30) {
    if (start < earliest) continue;
    const end = start + durationMinutes;
    if (start < 15 * 60 && end > 14 * 60) continue;
    const hoursLabel = String(Math.floor(start / 60)).padStart(2, "0");
    const minutesLabel = String(start % 60).padStart(2, "0");
    const time = hoursLabel + ":" + minutesLabel;
    const resolvedMasterId = candidates.find((candidate) => {
      if (hash(dateKey + "|" + candidate + "|" + time) % 7 === 0) return false;
      return !reservations.some((reservation) => reservation.dateKey === dateKey
        && reservation.masterId === candidate
        && overlaps(start, durationMinutes, Number(reservation.time.slice(0, 2)) * 60 + Number(reservation.time.slice(3, 5)), reservation.durationMinutes));
    });
    if (resolvedMasterId) slots.push({ dateKey, time, masterId: resolvedMasterId, durationMinutes });
  }
  return slots;
}

function safeSessionStorage() {
  try {
    return typeof window === "undefined" ? null : window.sessionStorage;
  } catch {
    return null;
  }
}

export function createDemoBookingRepository(storage = safeSessionStorage()) {
  let memoryReservations = [];

  const read = () => {
    if (!storage) return memoryReservations;
    try {
      const parsed = JSON.parse(storage.getItem(RESERVATION_STORAGE_KEY) || "[]");
      if (!Array.isArray(parsed)) return [];
      return parsed.filter((item) => item && typeof item.dateKey === "string" && typeof item.time === "string"
        && typeof item.masterId === "string" && Number.isFinite(item.durationMinutes));
    } catch {
      return [];
    }
  };

  return {
    listReservations() {
      return read().map(({ dateKey, time, masterId, durationMinutes }) => ({ dateKey, time, masterId, durationMinutes }));
    },
    reserve(slot) {
      const reservations = read();
      const start = Number(slot.time.slice(0, 2)) * 60 + Number(slot.time.slice(3, 5));
      const conflict = reservations.some((item) => {
        if (item.dateKey !== slot.dateKey || item.masterId !== slot.masterId) return false;
        const otherStart = Number(item.time.slice(0, 2)) * 60 + Number(item.time.slice(3, 5));
        return overlaps(start, slot.durationMinutes, otherStart, item.durationMinutes);
      });
      if (conflict) return false;
      const next = [...reservations, { dateKey: slot.dateKey, time: slot.time, masterId: slot.masterId, durationMinutes: slot.durationMinutes }];
      if (!storage) memoryReservations = next;
      else {
        try {
          storage.setItem(RESERVATION_STORAGE_KEY, JSON.stringify(next));
        } catch {
          memoryReservations = next;
        }
      }
      return true;
    },
  };
}

export function validateContact(name, phone, consent) {
  const errors = {};
  const cleanName = name.trim();
  const cleanPhone = phone.trim();
  const phoneFormatIsValid = /^\+?[\d\s().-]+$/.test(cleanPhone);
  const normalizedPhone = phoneFormatIsValid ? cleanPhone.replace(/[^\d+]/g, "") : "";
  const digits = normalizedPhone.replace(/\D/g, "");
  if (!cleanName) errors.name = "Укажите, как к вам обращаться.";
  else if (cleanName.length < 2 || cleanName.length > 60 || !/^[\p{L} .'-]+$/u.test(cleanName)) errors.name = "Введите имя от 2 до 60 букв.";
  if (!digits) errors.phone = "Укажите номер телефона.";
  else if (digits.length < 10 || digits.length > 11 || (digits.length === 11 && !/^[78]/.test(digits))) errors.phone = "Проверьте номер: нужно 10 или 11 цифр.";
  if (!consent) errors.consent = "Для демо-записи подтвердите согласие.";
  return { valid: Object.keys(errors).length === 0, errors };
}
