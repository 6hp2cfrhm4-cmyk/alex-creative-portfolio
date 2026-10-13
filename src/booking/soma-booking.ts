import { somaServices, somaSpecialists, type SomaService, type SomaSpecialist } from "../content/soma";

export interface DemoReservation {
  date: string;
  time: string;
  duration: number;
  serviceId: string;
  specialistId: string;
}

export interface DemoBookingRequest extends Omit<DemoReservation, "specialistId"> {
  specialistId: string;
}

export type ReservationResult =
  | { status: "saved"; specialistId: string; persistence: "local" | "session" }
  | { status: "taken" }
  | { status: "past" }
  | { status: "unavailable" };

export interface BookingAdapter {
  list(): DemoReservation[];
  reserve(request: DemoBookingRequest): ReservationResult;
}

const STORAGE_KEY = "soma-demo-slots-v1";
const demoSessionReservations = new Map<string, DemoReservation>();
const slotStarts = ["10:00", "12:00", "14:00", "16:00", "18:00"];

export function localDateKey(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

export function getDemoDates(count = 14, now = new Date()): Date[] {
  const dates: Date[] = [];
  const cursor = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  for (let offset = 0; offset < 24 && dates.length < count; offset += 1) {
    const candidate = new Date(cursor.getFullYear(), cursor.getMonth(), cursor.getDate() + offset);
    if (candidate.getDay() !== 0) dates.push(candidate);
  }
  return dates;
}

export function getEligibleSpecialists(service: SomaService, date: Date): SomaSpecialist[] {
  return somaSpecialists.filter((specialist) => specialist.categories.includes(service.category) && specialist.workingDays.includes(date.getDay()));
}

function readStoredReservations(): DemoReservation[] {
  try {
    const stored = window.localStorage.getItem(STORAGE_KEY);
    if (!stored) return [];
    const value: unknown = JSON.parse(stored);
    if (!Array.isArray(value)) return [];
    return value.filter((item): item is DemoReservation =>
      item !== null && typeof item === "object" &&
      typeof item.date === "string" && typeof item.time === "string" &&
      typeof item.duration === "number" && typeof item.serviceId === "string" &&
      typeof item.specialistId === "string",
    );
  } catch {
    return [];
  }
}

function slotKey(reservation: DemoReservation): string {
  return `${reservation.date}|${reservation.time}|${reservation.specialistId}`;
}

export function getDemoReservations(): DemoReservation[] {
  const unique = new Map<string, DemoReservation>();
  for (const item of [...readStoredReservations(), ...demoSessionReservations.values()]) unique.set(slotKey(item), item);
  return [...unique.values()];
}

function asMinutes(time: string): number {
  const [hours, minutes] = time.split(":").map(Number);
  return hours * 60 + minutes;
}

function overlaps(start: string, duration: number, reservation: DemoReservation): boolean {
  const startAt = asMinutes(start);
  const otherStart = asMinutes(reservation.time);
  return startAt < otherStart + reservation.duration && otherStart < startAt + duration;
}

export function isDemoSlotAvailable(
  service: SomaService,
  specialistId: string,
  date: Date,
  time: string,
  duration: number,
  now = new Date(),
): boolean {
  if (localDateKey(date) < localDateKey(now) || !service.durationOptions.includes(duration)) return false;
  const requestedMinutes = asMinutes(time);
  const endOfDay = 20 * 60;
  if (requestedMinutes + duration > endOfDay || !slotStarts.includes(time)) return false;
  if (localDateKey(date) === localDateKey(now) && requestedMinutes <= now.getHours() * 60 + now.getMinutes()) return false;
  const eligible = getEligibleSpecialists(service, date);
  const targetSpecialists = specialistId === "any" ? eligible : eligible.filter((item) => item.id === specialistId);
  if (targetSpecialists.length === 0) return false;
  const reservations = getDemoReservations();
  return targetSpecialists.some((specialist) => !reservations.some((reservation) =>
    reservation.date === localDateKey(date) && reservation.specialistId === specialist.id && overlaps(time, duration, reservation),
  ));
}

export function getDemoSlots(
  service: SomaService,
  specialistId: string,
  date: Date,
  duration: number,
  now = new Date(),
): string[] {
  return slotStarts.filter((time) => isDemoSlotAvailable(service, specialistId, date, time, duration, now));
}

export const localDemoBookingAdapter: BookingAdapter = {
  list: getDemoReservations,
  reserve(request) {
    const service = somaServices.find((item) => item.id === request.serviceId);
    const date = new Date(`${request.date}T12:00:00`);
    if (!service || !service.durationOptions.includes(request.duration)) return { status: "unavailable" };
    if (request.date < localDateKey(new Date())) return { status: "past" };

    const eligible = getEligibleSpecialists(service, date);
    const target = request.specialistId === "any"
      ? eligible
      : eligible.filter((specialist) => specialist.id === request.specialistId);
    const assigned = target.find((specialist) => isDemoSlotAvailable(service, specialist.id, date, request.time, request.duration));
    if (!assigned) return { status: target.length === 0 ? "unavailable" : "taken" };

    const reservation: DemoReservation = {
      date: request.date,
      time: request.time,
      duration: request.duration,
      serviceId: request.serviceId,
      specialistId: assigned.id,
    };
    demoSessionReservations.set(slotKey(reservation), reservation);
    try {
      const stored = [...readStoredReservations().filter((item) => slotKey(item) !== slotKey(reservation)), reservation];
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(stored));
      return { status: "saved", specialistId: assigned.id, persistence: "local" };
    } catch {
      return { status: "saved", specialistId: assigned.id, persistence: "session" };
    }
  },
};
