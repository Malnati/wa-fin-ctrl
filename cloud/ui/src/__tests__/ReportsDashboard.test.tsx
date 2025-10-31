// cloud/ui/src/__tests__/ReportsDashboard.test.tsx

import { render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import type { ReportSummary } from "../types/report";

vi.mock("../hooks/useReports");

import { useReports } from "../hooks/useReports";
import { ReportsDashboard } from "../components/reports/ReportsDashboard";

const mockUseReports = vi.mocked(useReports);

const EMPTY_REPORTS: ReportSummary[] = [];

const SAMPLE_REPORT: ReportSummary = {
  filename: "report.html",
  displayName: "Relatório Geral",
  type: "geral",
  period: null,
  editable: false,
  sizeBytes: 1024,
  sizeMb: 0.99,
  modifiedTime: 1_699_999_999,
  url: "/reports/report.html",
};

const REFRESH_RESOLVED = vi.fn().mockResolvedValue(undefined);

describe("ReportsDashboard", () => {
  beforeEach(() => {
    mockUseReports.mockReset();
    REFRESH_RESOLVED.mockClear();
    REFRESH_RESOLVED.mockResolvedValue(undefined);
  });

  it("exibe mensagem de carregamento enquanto busca relatórios", () => {
    mockUseReports.mockReturnValue({
      reports: EMPTY_REPORTS,
      status: "loading",
      error: null,
      lastUpdated: null,
      refresh: REFRESH_RESOLVED,
    });

    render(<ReportsDashboard />);

    expect(
      screen.getByText("Carregando relatórios disponíveis..."),
    ).toBeInTheDocument();
  });

  it("apresenta mensagem de erro quando a consulta falha", () => {
    const errorMessage = "Falha simulada";
    mockUseReports.mockReturnValue({
      reports: EMPTY_REPORTS,
      status: "error",
      error: errorMessage,
      lastUpdated: null,
      refresh: REFRESH_RESOLVED,
    });

    render(<ReportsDashboard />);

    expect(screen.getByText("Erro ao consultar relatórios")).toBeVisible();
    expect(screen.getByText(errorMessage)).toBeVisible();
  });

  it("renderiza lista e visualizador quando há relatórios", () => {
    mockUseReports.mockReturnValue({
      reports: [SAMPLE_REPORT],
      status: "success",
      error: null,
      lastUpdated: 1_699_999_999_000,
      refresh: REFRESH_RESOLVED,
    });

    render(<ReportsDashboard />);

    expect(screen.getByText("Relatórios disponíveis")).toBeInTheDocument();
    expect(screen.getByText("Relatório Geral")).toBeInTheDocument();
    expect(screen.getByTitle("Relatório Geral")).toBeInTheDocument();
  });
});
