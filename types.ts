
export enum Sex {
  MALE = 'Male',
  FEMALE = 'Female',
  OTHER = 'Other'
}

export interface AccommodationSelection {
  day1: boolean;
  day2: boolean;
  day3: boolean;
  day4: boolean;
  day5: boolean;
}

export interface Participant {
  id: string;
  eventName: string;
  municipality: string;
  name: string;
  sex: Sex;
  designation: string;
  email: string;
  availAccommodation: boolean;
  accommodationSelection: AccommodationSelection;
  timestamp: number;
}

export interface EventEntry {
  id: string;
  name: string;
  dateCreated: number;
}

export interface AnalyticsSummary {
  totalParticipants: number;
  totalRoomNights: number;
  municipalityStats: Record<string, number>;
  genderStats: Record<string, number>;
  eventStats: Record<string, number>;
}

export const SORSOGON_MUNICIPALITIES = [
  "Barcelona",
  "Bulan",
  "Bulusan",
  "Casiguran",
  "Castilla",
  "Donsol",
  "Gubat",
  "Irosin",
  "Juban",
  "Magallanes",
  "Matnog",
  "Pilar",
  "Prieto Diaz",
  "Santa Magdalena",
  "Sorsogon City",
  "Sorsogon Province"
];
