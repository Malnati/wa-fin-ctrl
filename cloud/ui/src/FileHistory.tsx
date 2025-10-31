// ui/src/FileHistory.tsx
import React, { useState, useEffect, useCallback } from "react";
import {
  getFileHistory,
  getFileStats,
  deleteFile,
  formatFileSize,
  formatDate,
  getMimeTypeIcon,
  type FileHistoryItem,
  type FileStats,
  type FileHistoryQuery,
} from "./FileHistoryHelper";
import {
  FILE_HISTORY_DEFAULT_TITLE,
  FILE_HISTORY_ITEMS_PER_PAGE,
  FILE_HISTORY_MAX_PAGINATION_BUTTONS,
} from "./constants/constants";

interface FileHistoryProps {
  title?: string;
}

export function FileHistory({
  title = FILE_HISTORY_DEFAULT_TITLE,
}: FileHistoryProps) {
  const [files, setFiles] = useState<FileHistoryItem[]>([]);
  const [stats, setStats] = useState<FileStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [totalFiles, setTotalFiles] = useState(0);

  // Filters
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedMimeType, setSelectedMimeType] = useState("");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");

  const loadData = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const query: FileHistoryQuery = {
        page: currentPage,
        limit: FILE_HISTORY_ITEMS_PER_PAGE,
      };

      if (searchTerm.trim()) query.search = searchTerm.trim();
      if (selectedMimeType) query.mimeType = selectedMimeType;
      if (dateFrom) query.dateFrom = new Date(dateFrom).toISOString();
      if (dateTo) query.dateTo = new Date(dateTo + "T23:59:59").toISOString();

      const [historyResponse, statsResponse] = await Promise.all([
        getFileHistory(query),
        getFileStats(),
      ]);

      setFiles(historyResponse.files);
      setTotalPages(historyResponse.totalPages);
      setTotalFiles(historyResponse.total);
      setStats(statsResponse);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro ao carregar dados");
    } finally {
      setLoading(false);
    }
  }, [currentPage, searchTerm, selectedMimeType, dateFrom, dateTo]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleDeleteFile = async (token: string, fileName: string) => {
    if (!confirm(`Tem certeza que deseja excluir o arquivo "${fileName}"?`)) {
      return;
    }

    try {
      await deleteFile(token);
      loadData(); // Reload data after deletion
    } catch (err) {
      alert(
        `Erro ao excluir arquivo: ${err instanceof Error ? err.message : "Erro desconhecido"}`,
      );
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setCurrentPage(1); // Reset to first page when filtering
    loadData();
  };

  const clearFilters = () => {
    setSearchTerm("");
    setSelectedMimeType("");
    setDateFrom("");
    setDateTo("");
    setCurrentPage(1);
  };

  const mimeTypes = stats ? Object.keys(stats.mimeTypeDistribution).sort() : [];

  if (loading && files.length === 0) {
    return (
      <div
        className="d-flex justify-content-center align-items-center"
        style={{ minHeight: "400px" }}
      >
        <div className="spinner-border" role="status">
          <span className="visually-hidden">Carregando histórico...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="container-fluid">
      <h2 className="mb-4">{title}</h2>

      {error && (
        <div className="alert alert-danger" role="alert">
          {error}
          <button
            className="btn btn-sm btn-outline-danger ms-2"
            onClick={loadData}
          >
            Tentar novamente
          </button>
        </div>
      )}

      {/* Statistics Cards */}
      {stats && (
        <div className="row mb-4">
          <div className="col-md-3 col-sm-6 mb-3">
            <div className="card bg-primary text-white h-100">
              <div className="card-body d-flex align-items-center">
                <div className="me-3">
                  <h1 className="mb-0" aria-label="Total Files Icon">
                    📁
                  </h1>
                </div>
                <div>
                  <div className="fs-4 fw-bold">{stats.totalFiles}</div>
                  <div className="small">Total de Arquivos</div>
                </div>
              </div>
            </div>
          </div>
          <div className="col-md-3 col-sm-6 mb-3">
            <div className="card bg-success text-white h-100">
              <div className="card-body d-flex align-items-center">
                <div className="me-3">
                  <h1 className="mb-0" aria-label="Processed Files Icon">
                    ✅
                  </h1>
                </div>
                <div>
                  <div className="fs-4 fw-bold">{stats.processedFiles}</div>
                  <div className="small">Processados</div>
                </div>
              </div>
            </div>
          </div>
          <div className="col-md-3 col-sm-6 mb-3">
            <div className="card bg-info text-white h-100">
              <div className="card-body d-flex align-items-center">
                <div className="me-3">
                  <h1 className="mb-0" aria-label="Storage Size Icon">
                    💾
                  </h1>
                </div>
                <div>
                  <div className="fs-4 fw-bold">
                    {formatFileSize(stats.totalSize)}
                  </div>
                  <div className="small">Tamanho Total</div>
                </div>
              </div>
            </div>
          </div>
          <div className="col-md-3 col-sm-6 mb-3">
            <div className="card bg-warning text-white h-100">
              <div className="card-body d-flex align-items-center">
                <div className="me-3">
                  <h1 className="mb-0" aria-label="Pending Files Icon">
                    ⏳
                  </h1>
                </div>
                <div>
                  <div className="fs-4 fw-bold">
                    {stats.totalFiles - stats.processedFiles}
                  </div>
                  <div className="small">Pendentes</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Search and Filters */}
      <div className="card mb-4">
        <div className="card-header">
          <h5 className="mb-0">Filtros de Busca</h5>
        </div>
        <div className="card-body">
          <form onSubmit={handleSearch}>
            <div className="row g-3">
              <div className="col-md-4">
                <label htmlFor="searchInput" className="form-label">
                  Buscar
                </label>
                <input
                  id="searchInput"
                  type="text"
                  className="form-control"
                  placeholder="Nome do arquivo, descrição..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              <div className="col-md-2">
                <label htmlFor="mimeTypeSelect" className="form-label">
                  Tipo
                </label>
                <select
                  id="mimeTypeSelect"
                  className="form-select"
                  value={selectedMimeType}
                  onChange={(e) => setSelectedMimeType(e.target.value)}
                >
                  <option value="">Todos os tipos</option>
                  {mimeTypes.map((type) => (
                    <option key={type} value={type}>
                      {type}
                    </option>
                  ))}
                </select>
              </div>
              <div className="col-md-3">
                <label htmlFor="dateFromInput" className="form-label">
                  Data Inicial
                </label>
                <input
                  id="dateFromInput"
                  type="date"
                  className="form-control"
                  value={dateFrom}
                  onChange={(e) => setDateFrom(e.target.value)}
                />
              </div>
              <div className="col-md-3">
                <label htmlFor="dateToInput" className="form-label">
                  Data Final
                </label>
                <input
                  id="dateToInput"
                  type="date"
                  className="form-control"
                  value={dateTo}
                  onChange={(e) => setDateTo(e.target.value)}
                />
              </div>
            </div>
            <div className="mt-3">
              <button
                type="submit"
                className="btn btn-primary me-2"
                disabled={loading}
              >
                {loading ? (
                  <>
                    <span className="spinner-border spinner-border-sm me-2"></span>
                    Buscando...
                  </>
                ) : (
                  "Buscar"
                )}
              </button>
              <button
                type="button"
                className="btn btn-outline-secondary"
                onClick={clearFilters}
              >
                Limpar Filtros
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* File List */}
      <div className="card">
        <div className="card-header d-flex justify-content-between align-items-center">
          <h5 className="mb-0">
            Arquivos ({totalFiles} {totalFiles === 1 ? "arquivo" : "arquivos"})
          </h5>
        </div>
        <div className="card-body p-0">
          {files.length === 0 ? (
            <div className="text-center py-5">
              <h3 className="text-muted">📭</h3>
              <p className="text-muted">Nenhum arquivo encontrado</p>
              {(searchTerm || selectedMimeType || dateFrom || dateTo) && (
                <button
                  className="btn btn-outline-primary"
                  onClick={clearFilters}
                >
                  Limpar filtros
                </button>
              )}
            </div>
          ) : (
            <div className="table-responsive">
              <table className="table table-hover mb-0">
                <thead className="table-light">
                  <tr>
                    <th>Arquivo</th>
                    <th>Tamanho</th>
                    <th>Data Upload</th>
                    <th>Status</th>
                    <th>Ações</th>
                  </tr>
                </thead>
                <tbody>
                  {files.map((file) => (
                    <tr key={file.token}>
                      <td>
                        <div className="d-flex align-items-center">
                          <span className="fs-4 me-2">
                            {getMimeTypeIcon(file.mimeType)}
                          </span>
                          <div>
                            <div className="fw-medium">
                              {file.customName || file.originalName}
                            </div>
                            {file.customName && (
                              <small className="text-muted">
                                Original: {file.originalName}
                              </small>
                            )}
                            {file.description && (
                              <div>
                                <small className="text-muted">
                                  {file.description}
                                </small>
                              </div>
                            )}
                          </div>
                        </div>
                      </td>
                      <td>{formatFileSize(file.fileSize)}</td>
                      <td>
                        <small>{formatDate(file.uploadDate)}</small>
                      </td>
                      <td>
                        {file.processed ? (
                          <span className="badge bg-success">
                            ✅ Processado
                            {file.lastAnalyzedAt && (
                              <>
                                <br />
                                <small>{formatDate(file.lastAnalyzedAt)}</small>
                              </>
                            )}
                          </span>
                        ) : (
                          <span className="badge bg-warning">⏳ Pendente</span>
                        )}
                      </td>
                      <td>
                        <div className="btn-group btn-group-sm">
                          <a
                            href={file.fileUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="btn btn-outline-primary"
                            title="Visualizar arquivo"
                          >
                            👁️
                          </a>
                          <button
                            className="btn btn-outline-danger"
                            title="Excluir arquivo"
                            onClick={() =>
                              handleDeleteFile(
                                file.token,
                                file.customName || file.originalName,
                              )
                            }
                          >
                            🗑️
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <nav className="mt-4">
          <ul className="pagination justify-content-center">
            <li className={`page-item ${currentPage === 1 ? "disabled" : ""}`}>
              <button
                className="page-link"
                onClick={() => setCurrentPage(currentPage - 1)}
                disabled={currentPage === 1}
              >
                Anterior
              </button>
            </li>
            {Array.from(
              {
                length: Math.min(
                  totalPages,
                  FILE_HISTORY_MAX_PAGINATION_BUTTONS,
                ),
              },
              (_, i) => {
                const pageNum =
                  Math.max(
                    1,
                    Math.min(
                      totalPages - (FILE_HISTORY_MAX_PAGINATION_BUTTONS - 1),
                      currentPage - 2,
                    ),
                  ) + i;
                return (
                  <li
                    key={pageNum}
                    className={`page-item ${currentPage === pageNum ? "active" : ""}`}
                  >
                    <button
                      className="page-link"
                      onClick={() => setCurrentPage(pageNum)}
                    >
                      {pageNum}
                    </button>
                  </li>
                );
              },
            )}
            <li
              className={`page-item ${currentPage === totalPages ? "disabled" : ""}`}
            >
              <button
                className="page-link"
                onClick={() => setCurrentPage(currentPage + 1)}
                disabled={currentPage === totalPages}
              >
                Próxima
              </button>
            </li>
          </ul>
        </nav>
      )}
    </div>
  );
}
