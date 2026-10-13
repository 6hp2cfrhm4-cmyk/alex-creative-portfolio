import { barbers, getService } from "./data.ts";
import type {
  AvailableSlot,
  BookingAdapter,
  BookingReservation,
  ReservationRequest,
  ReservationResult,
} from "./types";

const STEP_MINUTES = 30;
const STORAGE_KEY = "kern-demo-reservations-v1";
const LOCK_NAME = "kern-demo-reservations-v1";
let fallbackQueue: Promise<void> = Promise.resolve();

export function toLocalDateKey(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return year + "-" + month + "-" + day;
}

export function parseDateKey(value: string): Date | undefined {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value);
  if (!match) return undefined;
  const date = new Date(Number(match[1]), Number(match[2]) - 1, Number(match[3]), 12);
  return toLocalDateKey(date) === value ? date : undefined;
}

function timeToMinutes(value: string): number {
  const match = /^(\d{2}):(\d{2})$/.exec(value);
  if (!match) return -1;
  return Number(match[1]) * 60 + Number(match[2]);
}

function minutesToTime(value: number): string {
  return String(Math.floor(value / 60)).padStart(2, "0") + ":" + String(value % 60).padStart(2, "0");
}

export function reservationsOverlap(
  left: Pick<BookingReservation, "date" | "time" | "barberId" | "duration">,
  right: Pick<BookingReservation, "date" | "time" | "barberId" | "duration">,
): boolean {
  if (left.date !== right.date || left.barberId !== right.barberId) return false;
  const leftStart = timeToMinutes(left.time);
  const rightStart = timeToMinutes(right.time);
  if (leftStart < 0 || rightStart < 0) return false;
  return leftStart < rightStart + right.duration && rightStart < leftStart + left.duration;
}

export function getAvailableSlots(
  serviceId: string,
  barberPreference: string,
  dateKey: string,
  reservations: readonly BookingReservation[],
  now: Date = new Date(),
): AvailableSlot[] {
  const service = getService(serviceId);
  const date = parseDateKey(dateKey);
  if (!service || !date || dateKey < toLocalDateKey(now)) return [];

  const weekday = date.getDay();
  const applicableBarbers = barbers.filter((barber) => {
    const matchesPreference = !barberPreference || barberPreference === "any" || barber.id === barberPreference;
    return matchesPreference && barber.serviceIds.includes(service.id) && barber.schedule.days.includes(weekday);
  });
  const slotMap = new Map<string, string[]>();

  for (const barber of applicableBarbers) {
    const opens = timeToMinutes(barber.schedule.opens);
    const closes = timeToMinutes(barber.schedule.closes);
    for (let start = opens; start + service.duration <= closes; start += STEP_MINUTES) {
      if (dateKey === toLocalDateKey(now) && start <= now.getHours() * 60 + now.getMinutes() + 15) continue;
      const candidate: BookingReservation = {
        date: dateKey,
        time: minutesToTime(start),
        barberId: barber.id,
        duration: service.duration,
      };
      const isBusy = reservations.some((reservation) => reservationsOverlap(candidate, reservation));
      const barberIds = slotMap.get(candidate.time) ?? [];
      if (!isBusy) barberIds.push(barber.id);
      slotMap.set(candidate.time, barberIds);
    }
  }

  return [...slotMap.entries()]
    .sort(([left], [right]) => timeToMinutes(left) - timeToMinutes(right))
    .map(([time, barberIds]) => ({ time, barberIds }));
}

export function getAvailableDates(
  serviceId: string,
  barberPreference: string,
  reservations: readonly BookingReservation[],
  fromDate: Date = new Date(),
  daysAhead = 21,
): string[] {
  const dates: string[] = [];
  const firstDay = new Date(fromDate.getFullYear(), fromDate.getMonth(), fromDate.getDate(), 12);
  for (let offset = 0; offset < daysAhead; offset += 1) {
    const date = new Date(firstDay);
    date.setDate(firstDay.getDate() + offset);
    const dateKey = toLocalDateKey(date);
    if (getAvailableSlots(serviceId, barberPreference, dateKey, reservations, fromDate)
      .some((slot) => slot.barberIds.length > 0)) dates.push(dateKey);
  }
  return dates;
}

function isReservation(value: unknown): value is BookingReservation {
  if (!value || typeof value !== "object") return false;
  const item = value as Partial<BookingReservation>;
  return typeof item.date === "string"
    && parseDateKey(item.date) !== undefined
    && typeof item.time === "string"
    && timeToMinutes(item.time) >= 0
    && typeof item.barberId === "string"
    && typeof item.duration === "number"
    && Number.isFinite(item.duration)
    && item.duration > 0;
}

async function withFallbackLock<T>(work: () => Promise<T>): Promise<T> {
  const previous = fallbackQueue;
  let release: () => void = () => undefined;
  fallbackQueue = new Promise<void>((resolve) => {
    release = resolve;
  });
  await previous;
  try {
    return await work();
  } finally {
    release();
  }
}

export class LocalDemoBookingAdapter implements BookingAdapter {
  async getAll(): Promise<BookingReservation[]> {
    if (typeof window === "undefined") return [];
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed: unknown = JSON.parse(raw);
    if (!Array.isArray(parsed)) throw new Error("Demo reservation storage is unreadable.");
    return parsed.filter(isReservation);
  }

  async reserve(request: ReservationRequest): Promise<ReservationResult> {
    const commit = async (): Promise<ReservationResult> => {
      const reservations = await this.getAll();
      const barberId = request.barberIds.find((candidateId) => {
        const candidate: BookingReservation = {
          date: request.date,
          time: request.time,
          barberId: candidateId,
          duration: request.duration,
        };
        return !reservations.some((reservation) => reservationsOverlap(candidate, reservation));
      });
      if (!barberId) return { ok: false };
      const reservation: BookingReservation = {
        date: request.date,
        time: request.time,
        barberId,
        duration: request.duration,
      };
      if (typeof window === "undefined") return { ok: false };
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify([...reservations, reservation]));
      return { ok: true, reservation };
    };

    if (typeof navigator !== "undefined" && navigator.locks) {
      return navigator.locks.request(LOCK_NAME, { mode: "exclusive" }, commit);
    }
    return withFallbackLock(commit);
  }
}

export class MemoryBookingAdapter implements BookingAdapter {
  private reservations: BookingReservation[] = [];

  async getAll(): Promise<BookingReservation[]> {
    return [...this.reservations];
  }

  async reserve(request: ReservationRequest): Promise<ReservationResult> {
    const barberId = request.barberIds.find((candidateId) => {
      const candidate: BookingReservation = {
        date: request.date,
        time: request.time,
        barberId: candidateId,
        duration: request.duration,
      };
      return !this.reservations.some((reservation) => reservationsOverlap(candidate, reservation));
    });
    if (!barberId) return { ok: false };
    const reservation = {
      date: request.date,
      time: request.time,
      barberId,
      duration: request.duration,
    };
    this.reservations = [...this.reservations, reservation];
    return { ok: true, reservation };
  }
}

export function isValidPhone(value: string): boolean {
  const digits = value.replace(/\D/g, "");
  return digits.length >= 10 && digits.length <= 15;
}
