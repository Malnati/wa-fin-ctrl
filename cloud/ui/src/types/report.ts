// cloud/ui/src/types/report.ts

export type ReportType = "index" | "geral" | "mensal" | "editavel" | "custom";

export interface ReportSummary {
  filename: string;
  displayName: string;
  type: ReportType;
  period?: string | null;
  editable: boolean;
  sizeBytes: number;
  sizeMb: number;
  modifiedTime: number;
  url: string;
}

export type ReportsStatus = "idle" | "loading" | "success" | "error";
