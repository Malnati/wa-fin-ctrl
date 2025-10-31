import { useState, useEffect } from "react";
import { AdminApprovals } from "./AdminApprovals";
import { ApprovalStatus } from "./components/approval/ApprovalStatus";
import { Footer, Branding } from "./Branding";
import Login from "./Login";
import UserMenu from "./UserMenu";
import { Upload } from "./Upload";
import { FileHistory } from "./FileHistory";
import { DashboardOverview } from "./components/dashboard/DashboardOverview";
import { DiagnosticQueue } from "./components/dashboard/DiagnosticQueue";
import { ApprovalDemo } from "./ApprovalDemo";
import OnboardingFlow from "./components/onboarding/OnboardingFlow";
import { loadConfig } from "./shared/lib/BrandingHelper";
import {
  isAuthenticated,
  clearAuthInfo,
  getAuthInfo,
  logout,
} from "./LoginHelper";
import {
  checkApprovalStatus,
  isApproved,
  normalizeApprovalStatus,
  type ApprovalResponse,
} from "./ApprovalHelper";
import { STORAGE_KEYS } from "./constants/constants";
import {
  isOnboardingComplete,
  clearOnboardingProgress,
  clearConsent,
} from "./shared/lib/ConsentHelper";
import type { BrandingConfig } from "./shared/lib/BrandingHelper";
import "./App.css";

function App() {
  const [config, setConfig] = useState<BrandingConfig | null>(null);
  const [isConfigModalOpen, setIsConfigModalOpen] = useState(false);
  const [isAuthenticatedUser, setIsAuthenticatedUser] = useState<
    boolean | null
  >(null);
  const [currentView, setCurrentView] = useState<
    "dashboard" | "upload" | "history" | "admin"
  >("dashboard");
  const [needsOnboarding, setNeedsOnboarding] = useState<boolean | null>(null);
  const [approvalStatus, setApprovalStatus] = useState<ApprovalResponse | null>(
    null,
  );
  const [onboardingCompleted, setOnboardingCompleted] = useState<
    boolean | null
  >(null);

  useEffect(() => {
    const initializeApp = async () => {
      try {
        // Load configuration
        const loadedConfig = await loadConfig();
        setConfig(loadedConfig);

        // Check authentication
        const isAuth = isAuthenticated();
        setIsAuthenticatedUser(isAuth);

        if (isAuth) {
          const authInfo = getAuthInfo();

          // Check onboarding completion status
          const onboardingComplete = isOnboardingComplete();
          setOnboardingCompleted(onboardingComplete);

          // Check approval status if onboarding is complete
          if (onboardingComplete) {
            try {
              const approval = await checkApprovalStatus(authInfo?.email || "");
              setApprovalStatus(approval);

              // Check if user needs onboarding (only if approved)
              if (isApproved(approval)) {
                const onboardingData = localStorage.getItem(
                  STORAGE_KEYS.ONBOARDING_PROGRESS,
                );
                const consentData = localStorage.getItem(
                  STORAGE_KEYS.CONSENT_DATA,
                );
                setNeedsOnboarding(!consentData || !onboardingData);
              } else {
                setNeedsOnboarding(false);
              }
            } catch (error) {
              console.error("Error checking approval status:", error);
              setApprovalStatus(null);
            }
          } else {
            setNeedsOnboarding(true);
          }
        } else {
          setNeedsOnboarding(false);
          setApprovalStatus(null);
          setOnboardingCompleted(null);
        }
      } catch (error) {
        console.error("Error initializing app:", error);
      }
    };

    initializeApp();

    // Set up periodic authentication check
    const authCheckInterval = setInterval(
      () => {
        const authInfo = getAuthInfo();
        const isAuth = isAuthenticated();

        if (!authInfo || !isAuth) {
          setIsAuthenticatedUser(false);
          setOnboardingCompleted(null);
          setApprovalStatus(null);
        }
      },
      5 * 60 * 1000,
    ); // Check every 5 minutes

    return () => clearInterval(authCheckInterval);
  }, []);

  const handleConfigChange = (newConfig: BrandingConfig) => {
    setConfig(newConfig);
  };

  const handleLogout = () => {
    clearAuthInfo();
    logout();
    // Clear onboarding and consent data on logout
    clearOnboardingProgress();
    clearConsent();
    setIsAuthenticatedUser(false);
    setOnboardingCompleted(null);
    window.location.href = "/";
  };

  const handleOpenBranding = () => {
    setIsConfigModalOpen(true);
  };

  const handleOnboardingComplete = () => {
    setNeedsOnboarding(false);
  };

  const handleContactSupport = () => {
    if (config?.contactEmail) {
      window.location.href = `mailto:${config.contactEmail}`;
    }
  };

  // Show loading while initializing
  if (isAuthenticatedUser === null || !config) {
    return (
      <div
        className="d-flex justify-content-center align-items-center"
        style={{ height: "100vh" }}
      >
        <div className="spinner-border" role="status">
          <span className="visually-hidden">Carregando...</span>
        </div>
      </div>
    );
  }

  // Show login page if not authenticated
  if (!isAuthenticatedUser) {
    return <Login />;
  }

  // Show loading while checking onboarding status
  if (onboardingCompleted === null) {
    return (
      <div
        className="d-flex justify-content-center align-items-center"
        style={{ height: "100vh" }}
      >
        <div className="spinner-border" role="status">
          <span className="visually-hidden">Verificando configuração...</span>
        </div>
      </div>
    );
  }

  // Show onboarding flow if user is authenticated but hasn't completed onboarding
  if (onboardingCompleted === false || needsOnboarding) {
    return (
      <OnboardingFlow onComplete={handleOnboardingComplete} config={config} />
    );
  }

  // Show loading while checking approval status
  if (approvalStatus === null) {
    return (
      <div
        className="d-flex justify-content-center align-items-center"
        style={{ height: "100vh" }}
      >
        <div className="spinner-border" role="status">
          <span className="visually-hidden">
            Verificando status de aprovação...
          </span>
        </div>
      </div>
    );
  }

  // Show approval status screen if not approved
  if (!isApproved(approvalStatus)) {
    const normalizedStatus = normalizeApprovalStatus(approvalStatus.status);

    return (
      <ApprovalStatus
        config={config}
        status={normalizedStatus}
        onContactSupport={handleContactSupport}
      />
    );
  }

  // Get current auth info and determine if user is admin
  const authInfo = getAuthInfo();
  const isAdmin =
    authInfo?.email &&
    (authInfo.email.includes("admin") ||
      authInfo.email.includes("@mbra.com.br") ||
      authInfo.email.includes("@yagnostic.com"));

  return (
    <>
      <div className="page">
        <div
          className="container py-4 main-content"
          style={{ paddingBottom: "1rem !important" }}
        >
          {/* Cabeçalho com logo e UserMenu */}
          <div className="d-flex justify-content-between align-items-center mb-4">
            <div className="fs-3 fw-bold">
              {config.logo ? (
                <img
                  src={config.logo}
                  alt="Logo"
                  style={{
                    maxHeight: "50px",
                    maxWidth: "200px",
                    objectFit: "contain",
                  }}
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    target.style.display = "none";
                    target.nextElementSibling?.classList.remove("d-none");
                  }}
                />
              ) : null}
              <span className={config.logo ? "d-none" : ""}>SUA LOGO AQUI</span>
            </div>
            <UserMenu
              userName={authInfo?.name || "Usuário"}
              userEmail={authInfo?.email}
              onLogout={handleLogout}
              onOpenBranding={handleOpenBranding}
            />
          </div>

          {/* Navigation Tabs */}
          <ul className="nav nav-tabs mb-4">
            <li className="nav-item">
              <button
                className={`nav-link ${currentView === "dashboard" ? "active" : ""}`}
                onClick={() => setCurrentView("dashboard")}
              >
                📊 Dashboard
              </button>
            </li>
            <li className="nav-item">
              <button
                className={`nav-link ${currentView === "upload" ? "active" : ""}`}
                onClick={() => setCurrentView("upload")}
              >
                📤 Upload de Arquivo
              </button>
            </li>
            <li className="nav-item">
              <button
                className={`nav-link ${currentView === "history" ? "active" : ""}`}
                onClick={() => setCurrentView("history")}
              >
                📂 Histórico
              </button>
            </li>
            {isAdmin && (
              <li className="nav-item">
                <button
                  className={`nav-link ${currentView === "admin" ? "active" : ""}`}
                  onClick={() => setCurrentView("admin")}
                >
                  👥 Administração
                </button>
              </li>
            )}
          </ul>

          {/* Content based on current view */}
          {currentView === "dashboard" && (
            <div className="space-y-8">
              <DashboardOverview config={config} />
              <DiagnosticQueue config={config} />
            </div>
          )}
          {currentView === "upload" && <Upload title={config.title} />}
          {currentView === "history" && (
            <FileHistory title="Histórico de Arquivos" />
          )}
          {currentView === "admin" && isAdmin && <AdminApprovals />}
        </div>
      </div>

      <Footer config={config} />
      <Branding
        onConfigChange={handleConfigChange}
        isModalOpen={isConfigModalOpen}
        onModalClose={() => setIsConfigModalOpen(false)}
      />

      {/* Demo Controls for Testing Approval States */}
      <ApprovalDemo />
    </>
  );
}

export default App;
