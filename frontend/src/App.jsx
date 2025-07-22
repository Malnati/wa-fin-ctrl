import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Link, useParams, useNavigate } from 'react-router-dom';
import Report from './components/Report';
import PrintableReport from './components/PrintableReport';
import PeriodSelector from './components/PeriodSelector';
import 'bootstrap/dist/js/bootstrap.bundle.min.js';
import './App.css';

// Componente para a página de relatório
const ReportPage = () => {
  const [reportData, setReportData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedPeriod, setSelectedPeriod] = useState('');
  const { filename } = useParams();
  const navigate = useNavigate();

  useEffect(() => {
    // Se há um filename na URL, usa ele como período selecionado
    if (filename) {
      setSelectedPeriod(filename);
    }
  }, [filename]);

  useEffect(() => {
    const fetchReportData = async () => {
      try {
        setLoading(true);
        
        // Usa o período selecionado ou o filename da URL
        const month = selectedPeriod || filename || null;
        
        // Usa o novo endpoint de entradas
        const response = await fetch(`/api/entries${month ? `?month=${month}` : ''}`);
        if (!response.ok) {
          // Fallback para dados mock se a API não estiver disponível
          const mockResponse = await fetch('/entries-mock.json');
          if (mockResponse.ok) {
            const mockData = await mockResponse.json();
            setReportData(mockData);
            return;
          }
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        setReportData(data);
      } catch (err) {
        console.error('Erro ao carregar relatório:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchReportData();
  }, [selectedPeriod, filename]);

  const handlePeriodChange = (period) => {
    setSelectedPeriod(period);
    // Atualiza a URL quando o período muda
    if (period) {
      navigate(`/report/${period}`);
    } else {
      navigate('/report');
    }
  };

  if (loading) {
    return (
      <div className="container mt-5">
        <div className="text-center">
          <div className="spinner-border" role="status">
            <span className="visually-hidden">Carregando...</span>
          </div>
          <p className="mt-2">Carregando relatório...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mt-5">
        <div className="alert alert-danger" role="alert">
          <h4 className="alert-heading">Erro ao carregar relatório</h4>
          <p>{error}</p>
          <hr />
          <p className="mb-0">
            <Link to="/" className="btn btn-primary">Voltar ao início</Link>
          </p>
        </div>
      </div>
    );
  }

  if (!reportData) {
    return (
      <div className="container mt-5">
        <div className="alert alert-warning" role="alert">
          <h4 className="alert-heading">Relatório não encontrado</h4>
          <p>O relatório solicitado não foi encontrado.</p>
          <hr />
          <p className="mb-0">
            <Link to="/" className="btn btn-primary">Voltar ao início</Link>
          </p>
        </div>
      </div>
    );
  }

  return (
    <div>
      <PeriodSelector 
        selectedPeriod={selectedPeriod}
        onPeriodChange={handlePeriodChange}
      />
      <Report
        periodo={reportData.periodo}
        rows={reportData.rows || []}
        attrs={reportData.attrs || {}}
        editLink={reportData.edit_link}
        printLink={reportData.print_link}
        totalizadores={reportData.totalizadores}
        timestamp={reportData.timestamp}
        isEditable={reportData.is_editable || false}
        temMotivo={reportData.tem_motivo || false}
      />
    </div>
  );
};

// Componente para a página de impressão
const PrintPage = () => {
  const [reportData, setReportData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { filename } = useParams();

  useEffect(() => {
    const fetchReportData = async () => {
      try {
        setLoading(true);
        
        // Extrai o mês do filename (ex: "2024-01" -> "2024-01")
        const month = filename || null;
        
        // Usa o novo endpoint de entradas
        const response = await fetch(`/api/entries${month ? `?month=${month}` : ''}`);
        if (!response.ok) {
          // Fallback para dados mock se a API não estiver disponível
          const mockResponse = await fetch('/entries-mock.json');
          if (mockResponse.ok) {
            const mockData = await mockResponse.json();
            setReportData(mockData);
            return;
          }
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        setReportData(data);
      } catch (err) {
        console.error('Erro ao carregar relatório para impressão:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchReportData();
  }, [filename]);

  if (loading) {
    return (
      <div className="container mt-5">
        <div className="text-center">
          <div className="spinner-border" role="status">
            <span className="visually-hidden">Carregando...</span>
          </div>
          <p className="mt-2">Carregando relatório para impressão...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mt-5">
        <div className="alert alert-danger" role="alert">
          <h4 className="alert-heading">Erro ao carregar relatório</h4>
          <p>{error}</p>
          <hr />
          <p className="mb-0">
            <Link to="/" className="btn btn-primary">Voltar ao início</Link>
          </p>
        </div>
      </div>
    );
  }

  if (!reportData) {
    return (
      <div className="container mt-5">
        <div className="alert alert-warning" role="alert">
          <h4 className="alert-heading">Relatório não encontrado</h4>
          <p>O relatório solicitado não foi encontrado.</p>
          <hr />
          <p className="mb-0">
            <Link to="/" className="btn btn-primary">Voltar ao início</Link>
          </p>
        </div>
      </div>
    );
  }

  return (
    <PrintableReport
      periodo={reportData.periodo}
      rows={reportData.rows || []}
      totalizadores={reportData.totalizadores}
      timestamp={reportData.timestamp}
    />
  );
};

// Componente para a página inicial
const HomePage = () => {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchReports = async () => {
      try {
        setLoading(true);
        const response = await fetch('/api/reports');
        if (!response.ok) {
          // Fallback para dados mock se a API não estiver disponível
          const mockResponse = await fetch('/mock-data.json');
          if (mockResponse.ok) {
            const mockData = await mockResponse.json();
            setReports(mockData.reports || []);
            return;
          }
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        setReports(data.reports || []);
      } catch (err) {
        console.error('Erro ao carregar lista de relatórios:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchReports();
  }, []);

  if (loading) {
    return (
      <div className="container mt-5">
        <div className="text-center">
          <div className="spinner-border" role="status">
            <span className="visually-hidden">Carregando...</span>
          </div>
          <p className="mt-2">Carregando relatórios...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mt-5">
        <div className="alert alert-danger" role="alert">
          <h4 className="alert-heading">Erro ao carregar relatórios</h4>
          <p>{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mt-5">
      <h1>Relatórios Financeiros</h1>
      <p className="lead">Selecione um relatório para visualizar:</p>
      
      {reports.length === 0 ? (
        <div className="alert alert-info" role="alert">
          Nenhum relatório disponível no momento.
        </div>
      ) : (
        <div className="row">
          {reports.map((report, index) => (
            <div key={index} className="col-md-6 col-lg-4 mb-3">
              <div className="card">
                <div className="card-body">
                  <h5 className="card-title">{report.periodo || 'Relatório'}</h5>
                  <p className="card-text">
                    {report.timestamp ? `Gerado em: ${new Date(report.timestamp).toLocaleString()}` : 'Sem data'}
                  </p>
                  <div className="d-grid gap-2">
                    <Link 
                      to={`/report/${report.filename || index}`} 
                      className="btn btn-primary"
                    >
                      Visualizar
                    </Link>
                    <Link 
                      to={`/print/${report.filename || index}`} 
                      className="btn btn-outline-secondary"
                      target="_blank"
                    >
                      Imprimir
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

function App() {
  return (
    <Router>
      <div className="App">
        <nav className="navbar navbar-expand-lg navbar-dark bg-dark">
          <div className="container">
            <Link className="navbar-brand" to="/">
              WA Financeiro
            </Link>
            <div className="navbar-nav">
              <Link className="nav-link" to="/">
                Início
              </Link>
            </div>
          </div>
        </nav>

        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/report/:filename?" element={<ReportPage />} />
          <Route path="/print/:filename?" element={<PrintPage />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
