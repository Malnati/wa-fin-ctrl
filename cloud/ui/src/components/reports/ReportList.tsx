// cloud/ui/src/components/reports/ReportList.tsx

import { memo } from "react";
import type { ReportSummary } from "../../types/report";
import {
  describeReportType,
  formatFileSize,
  formatReportTimestamp,
  getReportIcon,
} from "../../utils/reportFormatting";

const LIST_SECTION_TITLE = "Relatórios disponíveis";
const UPDATED_AT_LABEL = "Atualizado em";
const SIZE_LABEL = "Tamanho";
const REPORT_LIST_BUTTON_CLASS = "report-list__button";
const REPORT_LIST_BUTTON_ACTIVE_CLASS = "report-list__button--active";

interface ReportListProps {
  reports: ReportSummary[];
  selectedReport: ReportSummary | null;
  onSelectReport: (report: ReportSummary) => void;
}

export const ReportList = memo(function ReportList({
  reports,
  selectedReport,
  onSelectReport,
}: ReportListProps) {
  return (
    <section aria-label={LIST_SECTION_TITLE}>
      <h2 className="report-list__heading">{LIST_SECTION_TITLE}</h2>
      <ul className="report-list">
        {reports.map((report) => {
          const isActive = selectedReport?.filename === report.filename;
          const buttonClassName = isActive
            ? `${REPORT_LIST_BUTTON_CLASS} ${REPORT_LIST_BUTTON_ACTIVE_CLASS}`
            : REPORT_LIST_BUTTON_CLASS;

          return (
            <li className="report-list__item" key={report.filename}>
              <button
                type="button"
                onClick={() => onSelectReport(report)}
                className={buttonClassName}
                aria-pressed={isActive}
              >
                <div className="report-list__title">
                  <span>
                    {getReportIcon(report)} {report.displayName}
                  </span>
                  <span className="report-list__tag">
                    {describeReportType(report)}
                  </span>
                </div>
                <div className="report-list__meta">
                  <span>
                    {UPDATED_AT_LABEL}: {formatReportTimestamp(report.modifiedTime)}
                  </span>
                  <span>
                    {SIZE_LABEL}: {formatFileSize(report.sizeBytes)}
                  </span>
                </div>
              </button>
            </li>
          );
        })}
      </ul>
    </section>
  );
});
