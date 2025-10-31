// cloud/ui/src/hooks/useReports.ts

import { useCallback, useEffect, useMemo, useState } from "react";
import { API_BASE_URL } from "../constants/api";
import type { ReportSummary, ReportType, ReportsStatus } from "../types/report";
import { buildReportUrl } from "../utils/reportFormatting";

const REPORTS_ENDPOINT_PATH = "/api/reports";
const ERROR_FETCH_REPORTS_MESSAGE =
  "Não foi possível carregar os relatórios disponíveis.";
const ERROR_INVALID_RESPONSE_MESSAGE =
  "Resposta inesperada ao listar relatórios.";
const DEFAULT_ERROR_MESSAGE = "Erro desconhecido ao consultar relatórios.";
const EMPTY_STRING = "";

interface UseReportsState {
  reports: ReportSummary[];
  status: ReportsStatus;
  error: string | null;
  lastUpdated: number | null;
  refresh: () => Promise<void>;
}

type RawReport = Record<string, unknown>;

const REPORT_TYPE_VALUES: ReportType[] = [
  "index",
  "geral",
  "mensal",
  "editavel",
  "custom",
];

function normalizeType(typeValue: unknown, editable: boolean): ReportType {
  if (editable) {
    return typeValue === "mensal" ? "mensal" : "editavel";
  }

  if (typeof typeValue === "string") {
    const normalized = typeValue.toLowerCase() as ReportType;
    if (REPORT_TYPE_VALUES.includes(normalized)) {
      return normalized;
    }
  }

  return "custom";
}

function toNumber(value: unknown): number {
  if (typeof value === "number") {
    return value;
  }

  if (typeof value === "string") {
    const parsed = Number(value);
    if (!Number.isNaN(parsed)) {
      return parsed;
    }
  }

  return 0;
}

function toBoolean(value: unknown): boolean {
  if (typeof value === "boolean") {
    return value;
  }

  if (typeof value === "string") {
    return value.toLowerCase() === "true";
  }

  return false;
}

function assertReportPath(path: unknown): string {
  if (typeof path === "string" && path.trim().length > 0) {
    return path;
  }

  return EMPTY_STRING;
}

function transformRawReport(rawReport: RawReport): ReportSummary {
  const filenameValue =
    typeof rawReport.filename === "string" ? rawReport.filename : EMPTY_STRING;

  const displayNameValue =
    typeof rawReport.display_name === "string"
      ? rawReport.display_name
      : filenameValue;

  const editable = toBoolean(rawReport.is_editable);
  const type = normalizeType(rawReport.type, editable);

  const period =
    typeof rawReport.period === "string" && rawReport.period.trim().length > 0
      ? rawReport.period
      : null;

  return {
    filename: filenameValue,
    displayName: displayNameValue,
    type,
    period,
    editable,
    sizeBytes: toNumber(rawReport.size_bytes),
    sizeMb: toNumber(rawReport.size_mb),
    modifiedTime: toNumber(rawReport.modified_time),
    url: assertReportPath(rawReport.url),
  };
}

function isAbortError(error: unknown): boolean {
  return (
    error instanceof DOMException &&
    (error.name === "AbortError" || error.code === DOMException.ABORT_ERR)
  );
}

export function useReports(): UseReportsState {
  const [reports, setReports] = useState<ReportSummary[]>([]);
  const [status, setStatus] = useState<ReportsStatus>("idle");
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<number | null>(null);

  const reportsEndpoint = useMemo(
    () => buildReportUrl(API_BASE_URL, REPORTS_ENDPOINT_PATH),
    [],
  );

  const fetchReports = useCallback(
    async (signal?: AbortSignal) => {
      try {
        setStatus("loading");
        setError(null);

        const response = await fetch(reportsEndpoint, { signal });

        if (!response.ok) {
          throw new Error(
            `${ERROR_FETCH_REPORTS_MESSAGE} (status: ${response.status})`,
          );
        }

        const payload = (await response.json()) as unknown;

        if (!Array.isArray(payload)) {
          throw new Error(ERROR_INVALID_RESPONSE_MESSAGE);
        }

        const mappedReports = payload.map((item) =>
          transformRawReport(item as RawReport),
        );

        setReports(mappedReports);
        setStatus("success");
        setLastUpdated(Date.now());
      } catch (caughtError) {
        if (isAbortError(caughtError)) {
          return;
        }

        const message =
          caughtError instanceof Error
            ? caughtError.message
            : DEFAULT_ERROR_MESSAGE;

        setError(message);
        setStatus("error");
      }
    },
    [reportsEndpoint],
  );

  useEffect(() => {
    const controller = new AbortController();
    void fetchReports(controller.signal);

    return () => controller.abort();
  }, [fetchReports]);

  const refresh = useCallback(async () => {
    await fetchReports();
  }, [fetchReports]);

  return {
    reports,
    status,
    error,
    lastUpdated,
    refresh,
  };
}
