// ui/src/components/dashboard/DashboardOverview.tsx
import { useState, useEffect } from "react";
import type { BrandingConfig } from "../../shared/lib/BrandingHelper";

interface DashboardStats {
  totalDiagnostics: number;
  successfulDiagnostics: number;
  failedDiagnostics: number;
  processingDiagnostics: number;
  todayUploads: number;
  averageProcessingTime: string;
  successRate: number;
}

interface DashboardOverviewProps {
  config: BrandingConfig;
}

export function DashboardOverview({ config }: DashboardOverviewProps) {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Use config for future branding customizations
  const brandingTitle = config?.title || "Visão Geral";

  useEffect(() => {
    const fetchDashboardStats = async () => {
      try {
        setIsLoading(true);

        // Simulate API call delay
        await new Promise((resolve) => setTimeout(resolve, 800));

        // Simulate dashboard stats
        const mockStats: DashboardStats = {
          totalDiagnostics: 147,
          successfulDiagnostics: 134,
          failedDiagnostics: 8,
          processingDiagnostics: 5,
          todayUploads: 12,
          averageProcessingTime: "2.3 min",
          successRate: 91.2,
        };

        setStats(mockStats);
      } catch (err) {
        console.error("Error fetching dashboard stats:", err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchDashboardStats();
  }, []);

  const StatCard = ({
    title,
    value,
    icon,
    color = "primary",
    subtitle,
  }: {
    title: string;
    value: string | number;
    icon: string;
    color?: "primary" | "secondary" | "accent" | "surface";
    subtitle?: string;
  }) => {
    const colorClasses = {
      primary: "bg-primary-light text-primary",
      secondary: "bg-secondary-light text-secondary",
      accent: "bg-accent-light text-accent",
      surface: "bg-surface text-content-primary",
    };

    return (
      <div className="card">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-caption text-content-secondary">{title}</p>
            <p
              className="text-subtitle text-content-primary"
              style={{ fontWeight: 600 }}
            >
              {value}
            </p>
            {subtitle && (
              <p
                className="text-caption text-content-secondary"
                style={{ marginTop: "var(--space-4)" }}
              >
                {subtitle}
              </p>
            )}
          </div>
          <div
            className={`flex items-center justify-center rounded-lg ${colorClasses[color]}`}
            style={{ width: "48px", height: "48px" }} // 8pt grid compliant
          >
            <span
              className="material-symbols-outlined"
              style={{ fontSize: "24px" }}
            >
              {icon}
            </span>
          </div>
        </div>
      </div>
    );
  };

  const LoadingSkeleton = () => (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        gap: "var(--space-24)",
      }}
    >
      <div
        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4"
        style={{ gap: "var(--space-24)" }}
      >
        {[...Array(4)].map((_, i) => (
          <div key={i} className="card">
            <div className="animate-pulse">
              <div
                style={{
                  height: "16px",
                  backgroundColor: "var(--color-surface)",
                  borderRadius: "var(--radius-sm)",
                  width: "75%",
                  marginBottom: "var(--space-8)",
                }}
              ></div>
              <div
                style={{
                  height: "32px",
                  backgroundColor: "var(--color-surface)",
                  borderRadius: "var(--radius-sm)",
                  width: "50%",
                }}
              ></div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  if (isLoading) {
    return (
      <section style={{ marginBottom: "var(--space-32)" }}>
        <h2
          className="text-subtitle"
          style={{ marginBottom: "var(--space-24)" }}
        >
          Visão Geral
        </h2>
        <LoadingSkeleton />
      </section>
    );
  }

  if (!stats) {
    return (
      <section style={{ marginBottom: "var(--space-32)" }}>
        <h2
          className="text-subtitle"
          style={{ marginBottom: "var(--space-24)" }}
        >
          Visão Geral
        </h2>
        <div className="card" style={{ textAlign: "center" }}>
          <span
            className="material-symbols-outlined text-content-secondary"
            style={{
              fontSize: "48px",
              marginBottom: "var(--space-8)",
              display: "block",
            }}
          >
            error_outline
          </span>
          <p className="text-body text-content-secondary">
            Erro ao carregar dados do dashboard
          </p>
        </div>
      </section>
    );
  }

  return (
    <section style={{ marginBottom: "var(--space-32)" }}>
      <div
        className="flex items-center justify-between"
        style={{ marginBottom: "var(--space-24)" }}
      >
        <h2 className="text-subtitle">{brandingTitle}</h2>
        <button
          className="btn-secondary flex items-center"
          style={{ gap: "var(--space-8)" }}
        >
          <span
            className="material-symbols-outlined"
            style={{ fontSize: "16px" }}
          >
            refresh
          </span>
          <span>Atualizar</span>
        </button>
      </div>

      {/* Stats Grid - 60% primary space distribution */}
      <div
        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4"
        style={{ gap: "var(--space-24)", marginBottom: "var(--space-32)" }}
      >
        <StatCard
          title="Total de Diagnósticos"
          value={stats.totalDiagnostics}
          icon="analytics"
          color="primary"
        />

        <StatCard
          title="Sucessos"
          value={stats.successfulDiagnostics}
          icon="check_circle"
          color="accent"
          subtitle={`${stats.successRate}% de taxa de sucesso`}
        />

        <StatCard
          title="Falhas"
          value={stats.failedDiagnostics}
          icon="error"
          color="secondary"
        />

        <StatCard
          title="Processando"
          value={stats.processingDiagnostics}
          icon="hourglass_empty"
          color="secondary"
        />
      </div>

      {/* Additional Metrics */}
      <div
        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3"
        style={{ gap: "var(--space-24)" }}
      >
        <StatCard
          title="Uploads Hoje"
          value={stats.todayUploads}
          icon="cloud_upload"
          color="accent"
        />

        <StatCard
          title="Tempo Médio"
          value={stats.averageProcessingTime}
          icon="schedule"
          color="secondary"
          subtitle="de processamento"
        />

        <div className="card">
          <div
            className="flex items-center justify-between"
            style={{ marginBottom: "var(--space-16)" }}
          >
            <h3 className="text-caption text-content-secondary">Sistema</h3>
            <div
              className="bg-accent-light text-accent flex items-center justify-center rounded-lg"
              style={{ width: "32px", height: "32px" }}
            >
              <span
                className="material-symbols-outlined"
                style={{ fontSize: "16px" }}
              >
                check_circle
              </span>
            </div>
          </div>
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: "var(--space-8)",
            }}
          >
            <div className="flex justify-between text-caption">
              <span className="text-content-secondary">API</span>
              <span className="text-accent" style={{ fontWeight: 600 }}>
                Online
              </span>
            </div>
            <div className="flex justify-between text-caption">
              <span className="text-content-secondary">Fila</span>
              <span className="text-accent" style={{ fontWeight: 600 }}>
                Ativa
              </span>
            </div>
            <div className="flex justify-between text-caption">
              <span className="text-content-secondary">Áudio</span>
              <span className="text-accent" style={{ fontWeight: 600 }}>
                Operacional
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="card" style={{ marginTop: "var(--space-32)" }}>
        <h3
          className="text-body text-content-primary"
          style={{ marginBottom: "var(--space-16)", fontWeight: 600 }}
        >
          Ações Rápidas
        </h3>
        <div
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4"
          style={{ gap: "var(--space-16)" }}
        >
          <button
            className="btn-secondary flex items-center text-left"
            style={{ gap: "var(--space-12)", padding: "var(--space-16)" }}
          >
            <span className="material-symbols-outlined text-primary">
              cloud_upload
            </span>
            <div>
              <p
                className="text-body text-content-primary"
                style={{ fontWeight: 600 }}
              >
                Novo Upload
              </p>
              <p className="text-caption text-content-secondary">
                Enviar arquivo
              </p>
            </div>
          </button>

          <button
            className="btn-secondary flex items-center text-left"
            style={{ gap: "var(--space-12)", padding: "var(--space-16)" }}
          >
            <span className="material-symbols-outlined text-secondary">
              queue
            </span>
            <div>
              <p
                className="text-body text-content-primary"
                style={{ fontWeight: 600 }}
              >
                Ver Fila
              </p>
              <p className="text-caption text-content-secondary">
                Monitorar status
              </p>
            </div>
          </button>

          <button
            className="btn-secondary flex items-center text-left"
            style={{ gap: "var(--space-12)", padding: "var(--space-16)" }}
          >
            <span className="material-symbols-outlined text-accent">
              download
            </span>
            <div>
              <p
                className="text-body text-content-primary"
                style={{ fontWeight: 600 }}
              >
                Relatórios
              </p>
              <p className="text-caption text-content-secondary">
                Baixar resultados
              </p>
            </div>
          </button>

          <button
            className="btn-secondary flex items-center text-left"
            style={{ gap: "var(--space-12)", padding: "var(--space-16)" }}
          >
            <span className="material-symbols-outlined text-secondary">
              settings
            </span>
            <div>
              <p
                className="text-body text-content-primary"
                style={{ fontWeight: 600 }}
              >
                Configurações
              </p>
              <p className="text-caption text-content-secondary">
                Personalizar
              </p>
            </div>
          </button>
        </div>
      </div>
    </section>
  );
}
