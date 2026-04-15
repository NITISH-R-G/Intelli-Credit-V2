export interface YearlyData {
  year: string;
  value: number;
}

export interface FinancialData {
  revenue: YearlyData[];
  debt: YearlyData[];
  cashflow: YearlyData[];
  profit: YearlyData[];
  assets: YearlyData[];
  liabilities: YearlyData[];
}

export interface CompanyInfo {
  name: string;
  establishedYear: string | number;
  industry: string;
  registrationNumber: string;
  employees: string | number;
}

export interface UnstructuredInsights {
  boardMeetingNotes: string[];
  ratingAgencyReports: string;
  shareholdingPattern: string;
}

export interface ExternalIntelligence {
  mcaStatus: string;
  legalDisputes: string[];
  newsSectorTrends: string[];
}

export interface PrimaryInsights {
  siteVisitObservations: string[];
  managementInterviews: string[];
}

export interface VerificationDataPoint {
  category: string;
  dataPoint: string;
  status: 'Verified' | 'Unverified' | 'Mismatch';
  confidenceScore: number;
  source: string;
  notes: string;
}

export interface RiskAnalysisDetails {
  financialRisk: string;
  legalRisk: string;
  behavioralRisk: string;
  industryRisk: string;
  managementRisk: string;
}

export interface CollateralAsset {
  type: string;
  marketValue: number;
  estimatedValue: number;
  ltvRatio: number;
  remarks: string;
}

export interface FiveCsAnalysis {
  character: {
    score: number;
    insights: string[];
    redFlags: string[];
    positiveSignals: string[];
  };
  capacity: {
    score: number;
    insights: string[];
    redFlags: string[];
    positiveSignals: string[];
  };
  capital: {
    score: number;
    insights: string[];
    redFlags: string[];
    positiveSignals: string[];
  };
  collateral: {
    score: number;
    insights: string[];
    redFlags: string[];
    positiveSignals: string[];
    assets?: CollateralAsset[];
  };
  conditions: {
    score: number;
    insights: string[];
    redFlags: string[];
    positiveSignals: string[];
  };
}

export interface CAMReport {
  executiveSummary: string;
  borrowerProfile: string;
  promoterAnalysis: string;
  financialEvaluation: string;
  bankingBehavior: string;
  legalComplianceFindings: string;
  industryAnalysis: string;
  collateralAssessment: string;
  verificationSummary: string;
  keyRisks: string[];
  finalRecommendation: string;
}

export interface FraudDetectionCheck {
  category: string;
  indicator: string;
  status: 'Pass' | 'Fail' | 'Warning';
  details: string;
  evidence?: string;
}

export interface ShellIndicator {
  name: string;
  status: 'Pass' | 'Fail' | 'Warning';
  details: string;
  evidence: string;
}

export interface ShellCompanyAnalysis {
  employeeCount: number;
  officeType: string;
  operationalEvidence: string[];
  isPotentialShell: boolean;
  riskLevel: 'Low' | 'Medium' | 'High';
  indicators: ShellIndicator[];
}

export interface HistoryEvent {
  date: string;
  type: string;
  description: string;
  reason: string;
  evidence: string;
}

export interface DirectorShareholderHistory {
  events: HistoryEvent[];
  summary: string;
  hasRapidChanges: boolean;
  riskLevel: 'Low' | 'Medium' | 'High';
}

export interface CreditAnalysis {
  companyInfo: CompanyInfo;
  structuredData: FinancialData;
  unstructuredInsights: UnstructuredInsights;
  externalIntelligence: ExternalIntelligence;
  primaryInsights: PrimaryInsights;
  verificationLayer: VerificationDataPoint[];
  fiveCs: FiveCsAnalysis;
  camMarkdown: string;
  riskAnalysisDetails: RiskAnalysisDetails;
  fraudDetection: FraudDetectionCheck[];
  shellCompanyAnalysis?: ShellCompanyAnalysis;
  directorShareholderHistory?: DirectorShareholderHistory;
  ratios: {
    debtToIncome: number;
    profitMargin: number;
    currentRatio: number;
    dscr?: number;
    icr?: number;
  };
  riskScore: number; // 0-100
  riskLevel: 'Low' | 'Medium' | 'High' | 'Critical';
  fraudFlags: string[];
  explanation: string;
  recommendation: string;
  decisionConfidence: number;
  suggestedLoanAmount: string;
  suggestedInterestRate: string;
  riskGrade: string;
  missingData: string[];
  requiredDocs: string[];
}
