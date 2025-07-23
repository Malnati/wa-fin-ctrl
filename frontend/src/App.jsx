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
        
        // Usa o novo endpoint de relatórios
        const response = await fetch(`/api/reports/${month ? `?month=${month}` : ''}`);
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
        mensagens={reportData.mensagens || []}
        xmlData={reportData.xml_data || []}
        totalizadores={reportData.totalizadores}
        timestamp={reportData.timestamp}
        isEditable={reportData.is_editable || false}
        temMotivo={reportData.tem_motivo || false}
        totalRegistros={reportData.total_registros}
        totalMensagens={reportData.total_mensagens}
        totalPaginasXml={reportData.total_paginas_xml}
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
        
        const month = filename || null;
        const response = await fetch(`/api/reports/${month ? `?month=${month}` : ''}`);
        
        if (!response.ok) {
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
        </div>
      </div>
    );
  }

  return (
    <PrintableReport
      periodo={reportData.periodo}
      rows={reportData.rows || []}
      mensagens={reportData.mensagens || []}
      xmlData={reportData.xml_data || []}
      totalizadores={reportData.totalizadores}
      timestamp={reportData.timestamp}
      totalRegistros={reportData.total_registros}
      totalMensagens={reportData.total_mensagens}
      totalPaginasXml={reportData.total_paginas_xml}
    />
  );
};

// Componente para a página inicial
const HomePage = () => {
  const [reportData, setReportData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchReportData = async () => {
      try {
        setLoading(true);
        const response = await fetch('/api/reports');
        if (!response.ok) {
          // Fallback para dados mock se a API não estiver disponível
          const mockResponse = await fetch('/mock-data.json');
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
        console.error('Erro ao carregar dados financeiros:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchReportData();
  }, []);

  if (loading) {
    return (
      <div className="container mt-5">
        <div className="text-center">
          <div className="spinner-border" role="status">
            <span className="visually-hidden">Carregando...</span>
          </div>
          <p className="mt-2">Carregando dados financeiros...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mt-5">
        <div className="alert alert-danger" role="alert">
          <h4 className="alert-heading">Erro ao carregar dados</h4>
          <p>{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mt-5">
      <h1>Controle Financeiro WhatsApp</h1>
      <p className="lead">Dados processados de comprovantes financeiros</p>
      
      {!reportData ? (
        <div className="alert alert-info" role="alert">
          Nenhum dado disponível no momento.
        </div>
      ) : (
        <div>
          {/* Resumo geral */}
          <div className="row mb-4">
            <div className="col-md-3">
              <div className="card text-center">
                <div className="card-body">
                  <h5 className="card-title">Total Registros</h5>
                  <p className="card-text display-6">{reportData.total_registros || 0}</p>
                </div>
              </div>
            </div>
            <div className="col-md-3">
              <div className="card text-center">
                <div className="card-body">
                  <h5 className="card-title">Total Mensagens</h5>
                  <p className="card-text display-6">{reportData.total_mensagens || 0}</p>
                </div>
              </div>
            </div>
            <div className="col-md-3">
              <div className="card text-center">
                <div className="card-body">
                  <h5 className="card-title">Ricardo</h5>
                  <p className="card-text display-6 text-primary">
                    R$ {reportData.totalizadores?.ricardo || '0,00'}
                  </p>
                </div>
              </div>
            </div>
            <div className="col-md-3">
              <div className="card text-center">
                <div className="card-body">
                  <h5 className="card-title">Rafael</h5>
                  <p className="card-text display-6 text-success">
                    R$ {reportData.totalizadores?.rafael || '0,00'}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Ações */}
          <div className="row mb-4">
            <div className="col-12">
              <div className="d-grid gap-2 d-md-flex justify-content-md-center">
                <Link 
                  to="/report" 
                  className="btn btn-primary btn-lg"
                >
                  📊 Ver Relatório Completo
                </Link>
                <Link 
                  to="/print" 
                  className="btn btn-outline-secondary btn-lg"
                  target="_blank"
                >
                  🖨️ Imprimir Relatório
                </Link>
              </div>
            </div>
          </div>

          {/* Última atualização */}
          <div className="row">
            <div className="col-12 text-center">
              <small className="text-muted">
                Última atualização: {reportData.timestamp ? 
                  new Date(reportData.timestamp).toLocaleString('pt-BR') : 
                  'Não disponível'
                }
              </small>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// Componente principal da aplicação
function App() {
  return (
    <Router>
      <div className="App">
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/report" element={<ReportPage />} />
          <Route path="/report/:filename" element={<ReportPage />} />
          <Route path="/print" element={<PrintPage />} />
          <Route path="/print/:filename" element={<PrintPage />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
