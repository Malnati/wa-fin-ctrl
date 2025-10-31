// cloud/ui/src/components/reports/ReportViewer.tsx

import { memo } from "react";
import type { ReportSummary } from "../../types/report";
import {
  buildReportUrl,
  describeReportType,
  formatFileSize,
  formatReportTimestamp,
} from "../../utils/reportFormatting";
import { API_BASE_URL } from "../../constants/api";

const VIEWER_SECTION_TITLE = "Visualização do relatório";
const OPEN_REPORT_LABEL = "Abrir relatório em nova aba";
const DOWNLOAD_REPORT_LABEL = "Baixar HTML";
const UPDATED_AT_LABEL = "Atualizado em";
const TYPE_LABEL = "Tipo";
const SIZE_LABEL = "Tamanho";
const PERIOD_LABEL = "Período";
const PLACEHOLDER_ICON = "🗂️";
const PLACEHOLDER_MESSAGE = "Selecione um relatório para visualizar.";
const PLACEHOLDER_DESCRIPTION =
  "Os relatórios são gerados automaticamente pelo pipeline local e exibidos aqui em tempo real.";

interface ReportViewerProps {
  report: ReportSummary | null;
}

export const ReportViewer = memo(function ReportViewer({
  report,
}: ReportViewerProps) {
  if (!report) {
    return (
      <section className="report-viewer" aria-label={VIEWER_SECTION_TITLE}>
        <div className="report-viewer__placeholder">
          <div className="report-viewer__placeholder-icon">
            {PLACEHOLDER_ICON}
          </div>
          <h2>{PLACEHOLDER_MESSAGE}</h2>
          <p>{PLACEHOLDER_DESCRIPTION}</p>
        </div>
      </section>
    );
  }

  const reportUrl = buildReportUrl(API_BASE_URL, report.url);

  return (
    <section className="report-viewer" aria-label={VIEWER_SECTION_TITLE}>
      <header className="report-viewer__header">
        <div>
          <h2 className="report-viewer__title">{report.displayName}</h2>
        </div>
        <div className="report-viewer__actions">
          <a
            className="report-viewer__link"
            href={reportUrl}
            target="_blank"
            rel="noopener noreferrer"
          >
            {OPEN_REPORT_LABEL}
          </a>
          <a
            className="report-viewer__link"
            href={reportUrl}
            download={report.filename}
          >
            {DOWNLOAD_REPORT_LABEL}
          </a>
        </div>
        <div className="report-viewer__meta">
          <span>
            {UPDATED_AT_LABEL}: {formatReportTimestamp(report.modifiedTime)}
          </span>
          <span>
            {SIZE_LABEL}: {formatFileSize(report.sizeBytes)}
          </span>
          <span>
            {TYPE_LABEL}: {describeReportType(report)}
          </span>
          {report.period ? (
            <span>
              {PERIOD_LABEL}: {report.period}
            </span>
          ) : null}
        </div>
      </header>
      <iframe
        key={report.filename}
        src={reportUrl}
        title={report.displayName}
        className="report-viewer__iframe"
      />
    </section>
  );
});
