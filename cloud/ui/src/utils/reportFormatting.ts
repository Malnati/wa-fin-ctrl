// cloud/ui/src/utils/reportFormatting.ts

import type { ReportSummary, ReportType } from "../types/report";

const BRAZIL_LOCALE = "pt-BR";
const DATE_TIME_OPTIONS: Intl.DateTimeFormatOptions = {
  day: "2-digit",
  month: "2-digit",
  year: "numeric",
  hour: "2-digit",
  minute: "2-digit",
};
const DATE_TIME_FORMATTER = new Intl.DateTimeFormat(
  BRAZIL_LOCALE,
  DATE_TIME_OPTIONS,
);

const FILE_SIZE_UNITS = ["B", "KB", "MB", "GB", "TB"] as const;
const FILE_SIZE_DIVISOR = 1024;
const DECIMAL_PLACES = 2;

const REPORT_TYPE_ICON: Record<ReportType, string> = {
  index: "🏠",
  geral: "📊",
  mensal: "📅",
  editavel: "✏️",
  custom: "📄",
};

const EDITABLE_SUFFIX = "✏️";

function ensureMilliseconds(timestamp: number): number {
  return timestamp > 9_999_999_999 ? timestamp : Math.round(timestamp * 1000);
}

export function formatReportTimestamp(timestamp: number): string {
  if (!Number.isFinite(timestamp) || timestamp <= 0) {
    return "Data desconhecida";
  }

  const milliseconds = ensureMilliseconds(timestamp);
  const date = new Date(milliseconds);

  return DATE_TIME_FORMATTER.format(date);
}

export function formatFileSize(sizeBytes: number): string {
  if (!Number.isFinite(sizeBytes) || sizeBytes < 0) {
    return "0 B";
  }

  if (sizeBytes === 0) {
    return "0 B";
  }

  const exponent = Math.min(
    Math.floor(Math.log(sizeBytes) / Math.log(FILE_SIZE_DIVISOR)),
    FILE_SIZE_UNITS.length - 1,
  );

  const normalizedValue =
    sizeBytes / Math.pow(FILE_SIZE_DIVISOR, Math.max(exponent, 0));

  return `${normalizedValue.toFixed(DECIMAL_PLACES)} ${FILE_SIZE_UNITS[exponent]}`;
}

export function buildReportUrl(baseUrl: string, relativePath: string): string {
  const trimmedBase = baseUrl.replace(/\/+$/, "");
  const trimmedPath = relativePath.startsWith("/")
    ? relativePath
    : `/${relativePath}`;

  return `${trimmedBase}${trimmedPath}`;
}

function resolveTypeIcon(report: ReportSummary): string {
  if (report.editable) {
    if (report.type === "mensal") {
      return `${REPORT_TYPE_ICON.mensal}${EDITABLE_SUFFIX}`;
    }
    return REPORT_TYPE_ICON.editavel;
  }

  const icon = REPORT_TYPE_ICON[report.type] ?? REPORT_TYPE_ICON.custom;
  return icon;
}

export function describeReportType(report: ReportSummary): string {
  if (report.editable) {
    return report.type === "mensal" ? "Mensal (editável)" : "Editável";
  }

  switch (report.type) {
    case "index":
      return "Página inicial";
    case "geral":
      return "Relatório geral";
    case "mensal":
      return "Relatório mensal";
    default:
      return "Relatório";
  }
}

export function getReportIcon(report: ReportSummary): string {
  return resolveTypeIcon(report);
}
