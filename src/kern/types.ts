export type ServiceCategory = "Стрижка" | "Борода" | "Дополнительно" | "Комплекс";

export interface Service {
  id: string;
  name: string;
  category: ServiceCategory;
  description: string;
  price: number;
  duration: number;
  badge?: string;
  savings?: number;
}

export interface BarberSchedule {
  days: number[];
  opens: string;
  closes: string;
}

export interface Barber {
  id: string;
  name: string;
  specialty: string;
  description: string;
  serviceIds: string[];
  schedule: BarberSchedule;
  portraitIndex: number;
}

export interface BookingReservation {
  date: string;
  time: string;
  barberId: string;
  duration: number;
}

export interface AvailableSlot {
  time: string;
  barberIds: string[];
}

export interface ReservationRequest {
  date: string;
  time: string;
  barberIds: string[];
  duration: number;
}

export interface ReservationResult {
  ok: boolean;
  reservation?: BookingReservation;
}

export interface BookingAdapter {
  getAll(): Promise<BookingReservation[]>;
  reserve(request: ReservationRequest): Promise<ReservationResult>;
}

export interface BookingDraft {
  serviceId: string;
  barberId: string;
  date: string;
  time: string;
  name: string;
  phone: string;
  consent: boolean;
}

export type StyleLength = "short" | "medium" | "long";
export type StylingEffort = "minimal" | "regular" | "detailed";
export type StyleCharacter = "sharp" | "natural" | "classic";

export interface StyleFinderAnswers {
  length: StyleLength;
  effort: StylingEffort;
  character: StyleCharacter;
}

export interface HairReference {
  id: string;
  title: string;
  description: string;
  category: "short" | "medium" | "long" | "beard";
  length: StyleLength;
  effort: StylingEffort;
  character: StyleCharacter;
  serviceId: string;
  imageIndex: number;
  inFinder: boolean;
}
