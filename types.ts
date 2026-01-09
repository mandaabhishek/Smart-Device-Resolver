export enum DeviceType {
  LAPTOP = 'Laptop',
  DESKTOP = 'Desktop',
  SMARTPHONE = 'Smartphone',
  TABLET = 'Tablet',
  OTHER = 'Other'
}

export enum Step {
  LANDING = 0,
  CATEGORY = 1,
  SYMPTOMS = 2,
  SPECS = 3,
  ANALYZING = 4,
  RESULTS = 5,
  UPGRADES = 6,
  SUMMARY = 7,
  ADMIN = 99
}

export interface DeviceSpecs {
  brand: string;
  model: string;
  ram: string;
  storage: string;
  processor: string;
  ageYears: number;
}

export interface UpgradeRecommendation {
  component: string;
  reason: string;
  estimatedCostUSD: number;
  performanceBoostPercentage: number;
  priority: 'High' | 'Medium' | 'Low';
}

export interface DiagnosisResult {
  diagnosisSummary: string;
  severity: 'Critical' | 'Moderate' | 'Low';
  potentialCauses: string[];
  recommendedUpgrades: UpgradeRecommendation[];
  maintenanceTips: string[];
  estimatedFixPriceUSD: number;
}

export interface AppState {
  currentStep: Step;
  deviceType: DeviceType | null;
  symptoms: string;
  selectedSymptomTags: string[];
  specs: DeviceSpecs;
  diagnosis: DiagnosisResult | null;
  isLoading: boolean;
  error: string | null;
}
