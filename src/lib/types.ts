export interface FacilityResult {
  facility_id: string | null;
  facility_name: string;
  pin_code: string | null;
  state: string | null;
  city: string | null;
  facility_type: string | null;
  coordinates: { lat: number; long: number } | null;

  trust_score: number;
  agent1_score: number;
  validator_score: number;
  interval_label: string;
  interval_low: number;
  interval_high: number;
  mean_trust: number;
  uncertainty: string;

  validated: boolean;
  verified_capabilities: string[];
  truth_gap_notes: string;
  evidence_citations: string[];
  specialty_services: string | null;
  equipment_status: string | null;
  staffing_levels: string | null;
  corrections: string | null;
  confidence_note: string;
  query_match_notes: string;
  consistency_flag: string | null;

  is_medical_desert: boolean;
  desert_reason: string | null;
  crisis_score: number;
  verified_capability_count: number;
  rank_in_results: number;
  recommendation: string;
  latency_ms: number;
  web_search_answer?: string;
}

export interface SearchRequest {
  free_text: string;
  departments: string[];
  state: string | null;
  top_n: number;
}

export const DEPARTMENTS = [
  "ICU / Critical Care",
  "Pulmonology",
  "Cardiology",
  "Gynaecology",
  "Paediatrics",
  "NICU",
  "Emergency / Trauma",
  "Neurology",
  "Nephrology / Dialysis",
  "Oncology",
  "Orthopaedics",
  "Maternity",
  "Pathology / Lab",
  "Radiology / Imaging",
  "ENT",
  "Dermatology",
  "Gastroenterology",
  "Psychiatry",
  "Ophthalmology",
  "Physiotherapy",
] as const;

export const INDIAN_STATES = [
  "Andhra Pradesh", "Arunachal Pradesh", "Assam", "Bihar", "Chhattisgarh",
  "Goa", "Gujarat", "Haryana", "Himachal Pradesh", "Jharkhand",
  "Karnataka", "Kerala", "Madhya Pradesh", "Maharashtra", "Manipur",
  "Meghalaya", "Mizoram", "Nagaland", "Odisha", "Punjab",
  "Rajasthan", "Sikkim", "Tamil Nadu", "Telangana", "Tripura",
  "Uttar Pradesh", "Uttarakhand", "West Bengal",
  "Andaman and Nicobar Islands", "Chandigarh", "Dadra and Nagar Haveli and Daman and Diu",
  "Delhi", "Jammu and Kashmir", "Ladakh", "Lakshadweep", "Puducherry",
] as const;

export type TrustLevel = "green" | "amber" | "red";

export function trustLevel(f: FacilityResult): TrustLevel {
  if (f.is_medical_desert || f.trust_score <= 3) return "red";
  if (f.trust_score > 7 && f.validated) return "green";
  return "amber";
}

export function trustColor(level: TrustLevel): string {
  return level === "green" ? "#1D9E75" : level === "amber" ? "#EF9F27" : "#E24B4A";
}
