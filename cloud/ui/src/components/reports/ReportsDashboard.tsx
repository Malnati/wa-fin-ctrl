// cloud/ui/src/components/reports/ReportsDashboard.tsx

import { useEffect, useMemo, useState } from "react";
import type { ReportSummary } from "../../types/report";
import { formatReportTimestamp } from "../../utils/reportFormatting";
import { useReports } from "../../hooks/useReports";
import { ReportList } from "./ReportList";
import { ReportViewer } from "./ReportViewer";

const DASHBOARD_TITLE = "Central de Relatórios — WA Fin Ctrl";
const DASHBOARD_SUBTITLE =
  "Visualize os relatórios consolidados gerados pelo pipeline local.";
const REFRESH_BUTTON_LABEL = "Atualizar";
const REFRESH_BUTTON_LOADING_LABEL = "Atualizando...";
const LAST_UPDATE_LABEL = "Última atualização";
const LOADING_MESSAGE = "Carregando relatórios disponíveis...";
const ERROR_TITLE = "Erro ao consultar relatórios";
const RETRY_LABEL = "Tentar novamente";
const EMPTY_TITLE = "Nenhum relatório disponível";
const EMPTY_DESCRIPTION =
  "Execute o processamento local para gerar novos relatórios.";
const COUNTER_TOTAL_LABEL = "Total";
const COUNTER_GENERAL_LABEL = "Gerais";
const COUNTER_MONTHLY_LABEL = "Mensais";
const COUNTER_EDITABLE_LABEL = "Editáveis";

interface CounterInfo {
  label: string;
  value: number;
}

export function ReportsDashboard() {
  const { reports, status, error, lastUpdated, refresh } = useReports();
  const [selectedReport, setSelectedReport] = useState<ReportSummary | null>(
    null,
  );

  const isLoading = status === "loading";
  const hasError = status === "error";
  const hasReports = reports.length > 0;

  useEffect(() => {
    if (!hasReports) {
      setSelectedReport(null);
      return;
    }

    setSelectedReport((currentReport) => {
      if (!currentReport) {
        return reports[0];
      }

      const stillExists = reports.find(
        (report) => report.filename === currentReport.filename,
      );

      return stillExists ?? reports[0];
    });
  }, [hasReports, reports]);

  const counters = useMemo<CounterInfo[]>(
    () => [
      {
        label: COUNTER_TOTAL_LABEL,
        value: reports.length,
      },
      {
        label: COUNTER_GENERAL_LABEL,
        value: reports.filter(
          (report) => report.type === "geral" && !report.editable,
        ).length,
      },
      {
        label: COUNTER_MONTHLY_LABEL,
        value: reports.filter(
          (report) => report.type === "mensal" && !report.editable,
        ).length,
      },
      {
        label: COUNTER_EDITABLE_LABEL,
        value: reports.filter((report) => report.editable).length,
      },
    ],
    [reports],
  );

  return (
    <div className="reports-dashboard">
      <header className="reports-dashboard__header">
        <div>
          <h1 className="reports-dashboard__title">{DASHBOARD_TITLE}</h1>
          <p className="reports-dashboard__subtitle">{DASHBOARD_SUBTITLE}</p>
        </div>
        <div className="reports-dashboard__actions">
          <button
            type="button"
            onClick={() => {
              void refresh();
            }}
            disabled={isLoading}
            className="reports-dashboard__refresh"
          >
            {isLoading ? REFRESH_BUTTON_LOADING_LABEL : REFRESH_BUTTON_LABEL}
          </button>
          <span className="reports-dashboard__timestamp">
            {LAST_UPDATE_LABEL}:{" "}
            {lastUpdated ? formatReportTimestamp(lastUpdated) : "—"}
          </span>
        </div>
      </header>

      <section className="reports-dashboard__counters" aria-label="Indicadores">
        {counters.map((counter) => (
          <article className="reports-dashboard__counter" key={counter.label}>
            <h3 className="reports-dashboard__counter-title">
              {counter.label}
            </h3>
            <p className="reports-dashboard__counter-value">
              {counter.value.toLocaleString("pt-BR")}
            </p>
          </article>
        ))}
      </section>

      {isLoading ? (
        <div className="status-message" role="status">
          {LOADING_MESSAGE}
        </div>
      ) : null}

      {hasError && error ? (
        <div className="status-message status-message--error" role="alert">
          <strong>{ERROR_TITLE}</strong>
          <p>{error}</p>
          <div className="status-message__actions">
            <button
              type="button"
              onClick={() => {
                void refresh();
              }}
              className="status-message__button"
            >
              {RETRY_LABEL}
            </button>
          </div>
        </div>
      ) : null}

      {hasReports ? (
        <div className="reports-dashboard__body">
          <ReportList
            reports={reports}
            selectedReport={selectedReport}
            onSelectReport={setSelectedReport}
          />
          <ReportViewer report={selectedReport} />
        </div>
      ) : (
        status === "success" && (
          <div className="empty-state">
            <h2 className="empty-state__title">{EMPTY_TITLE}</h2>
            <p>{EMPTY_DESCRIPTION}</p>
          </div>
        )
      )}
    </div>
  );
}
