export interface DemoReservation {
  dateKey: string;
  time: string;
  masterId: string;
  durationMinutes: number;
}

export interface DemoSlot extends DemoReservation {}

export const RESERVATION_STORAGE_KEY: string;
export function localDateKey(date?: Date): string;
export function salonHours(dateKey: string): { opens: number; closes: number } | null;
export function getAvailableSlots(options: {
  dateKey: string;
  durationMinutes: number;
  masterId?: string | null;
  eligibleMasterIds?: string[];
  reservations?: DemoReservation[];
  todayKey?: string;
  currentMinute?: number;
}): DemoSlot[];
export function createDemoBookingRepository(storage?: Pick<Storage, "getItem" | "setItem"> | null): {
  listReservations(): DemoReservation[];
  reserve(slot: DemoSlot): boolean;
};
export function validateContact(name: string, phone: string, consent: boolean): {
  valid: boolean;
  errors: { name?: string; phone?: string; consent?: string };
};
