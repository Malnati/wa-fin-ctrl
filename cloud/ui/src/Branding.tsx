import React, { useState, useEffect } from "react";
import {
  loadConfig,
  saveConfig,
  DEFAULT_CONFIG,
  WHITE_LABEL_CONFIG,
} from "./shared/lib/BrandingHelper";
import type { BrandingConfig } from "./shared/lib/BrandingHelper";

interface BrandingProps {
  onConfigChange?: (config: BrandingConfig) => void;
  isModalOpen?: boolean;
  onModalClose?: () => void;
}

const Branding: React.FC<BrandingProps> = ({
  onConfigChange,
  isModalOpen: externalModalOpen,
  onModalClose,
}) => {
  const [config, setConfig] = useState<BrandingConfig>(DEFAULT_CONFIG);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [validationErrors, setValidationErrors] = useState<
    Record<string, string>
  >({});

  const modalOpen =
    externalModalOpen !== undefined ? externalModalOpen : isModalOpen;
  const setModalOpen =
    externalModalOpen !== undefined ? onModalClose : setIsModalOpen;

  useEffect(() => {
    loadConfig().then(setConfig);
  }, []);

  useEffect(() => {
    if (onConfigChange) {
      onConfigChange(config);
    }
  }, [config, onConfigChange]);

  const validateField = (fieldId: string, value: string): string => {
    const validationRules: Record<
      string,
      {
        type?: string;
        pattern?: RegExp;
        patternMessage?: string;
        required?: boolean;
        minLength?: number;
        maxLength?: number;
        maxDate?: string;
      }
    > = {
      configLogo: {
        type: "url",
        pattern: /^https?:\/\/.+/,
        patternMessage: "URL deve começar com http:// ou https://",
      },
      configCompanyName: { required: true, minLength: 2, maxLength: 100 },
      configTitle: { required: true, minLength: 3, maxLength: 200 },
      configDevelopedBy: { required: true, minLength: 2, maxLength: 100 },
      configCopyright: { required: true, minLength: 3, maxLength: 100 },
      configRegistrationDate: {
        required: true,
        type: "date",
        maxDate: "2024-12-31",
      },
      configContactEmail: { required: true, type: "email" },
      configContactPhone: {
        pattern: /^[+]?[0-9\s\-()]{10,20}$/,
        patternMessage: "Telefone deve ter 10-20 dígitos",
      },
      configContactAddress: { minLength: 5, maxLength: 200 },
      configContactWebsite: {
        type: "url",
        pattern: /^https?:\/\/.+/,
        patternMessage: "URL deve começar com http:// ou https://",
      },
      configLinkFacebook: {
        type: "url",
        pattern: /^https?:\/\/.+/,
        patternMessage: "URL deve começar com http:// ou https://",
      },
      configLinkTwitter: {
        type: "url",
        pattern: /^https?:\/\/.+/,
        patternMessage: "URL deve começar com http:// ou https://",
      },
      configLinkGoogle: {
        type: "url",
        pattern: /^https?:\/\/.+/,
        patternMessage: "URL deve começar com http:// ou https://",
      },
      configLinkInstagram: {
        type: "url",
        pattern: /^https?:\/\/.+/,
        patternMessage: "URL deve começar com http:// ou https://",
      },
      configLinkLinkedin: {
        type: "url",
        pattern: /^https?:\/\/.+/,
        patternMessage: "URL deve começar com http:// ou https://",
      },
      configLinkGithub: {
        type: "url",
        pattern: /^https?:\/\/.+/,
        patternMessage: "URL deve começar com http:// ou https://",
      },
    };

    const rules = validationRules[fieldId];
    if (!rules) return "";

    const trimmedValue = value.trim();

    // Validação de campo obrigatório
    if (rules.required && !trimmedValue) {
      return "Este campo é obrigatório.";
    }

    // Validação de comprimento mínimo
    if (rules.minLength && trimmedValue.length < rules.minLength) {
      return `Mínimo de ${rules.minLength} caracteres.`;
    }

    // Validação de comprimento máximo
    if (rules.maxLength && trimmedValue.length > rules.maxLength) {
      return `Máximo de ${rules.maxLength} caracteres.`;
    }

    // Validação de padrão (regex)
    if (rules.pattern && trimmedValue && !rules.pattern.test(trimmedValue)) {
      return rules.patternMessage || "Formato inválido.";
    }

    // Validação de tipo específico
    if (rules.type === "email" && trimmedValue) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(trimmedValue)) {
        return "Email inválido.";
      }
    }

    if (rules.type === "url" && trimmedValue) {
      const urlRegex = /^https?:\/\/.+/;
      if (!urlRegex.test(trimmedValue)) {
        return "URL deve começar com http:// ou https://";
      }
    }

    if (rules.type === "date" && trimmedValue) {
      const selectedDate = new Date(trimmedValue);
      const maxDate = new Date(rules.maxDate || "2024-12-31");
      if (selectedDate > maxDate) {
        return "Data não pode ser futura.";
      }
    }

    return "";
  };

  const handleFieldChange = (field: keyof BrandingConfig, value: string) => {
    const newConfig = { ...config, [field]: value };
    setConfig(newConfig);

    // Validar campo em tempo real
    const fieldId = `config${field.charAt(0).toUpperCase() + field.slice(1)}`;
    const error = validateField(fieldId, value);
    setValidationErrors((prev) => ({
      ...prev,
      [fieldId]: error,
    }));
  };

  const validateAllFields = (): boolean => {
    const errors: Record<string, string> = {};
    let allValid = true;

    const fields: (keyof BrandingConfig)[] = [
      "logo",
      "companyName",
      "title",
      "developedBy",
      "copyright",
      "registrationDate",
      "contactEmail",
      "contactPhone",
      "contactAddress",
      "contactWebsite",
      "linkFacebook",
      "linkTwitter",
      "linkGoogle",
      "linkInstagram",
      "linkLinkedin",
      "linkGithub",
    ];

    fields.forEach((field) => {
      const fieldId = `config${field.charAt(0).toUpperCase() + field.slice(1)}`;
      const error = validateField(fieldId, config[field] || "");
      if (error) {
        errors[fieldId] = error;
        allValid = false;
      }
    });

    setValidationErrors(errors);
    return allValid;
  };

  const handleSave = async () => {
    if (!validateAllFields()) {
      alert("Por favor, corrija os erros de validação antes de salvar.");
      return;
    }

    try {
      await saveConfig(config);
      if (setModalOpen) setModalOpen(false);
      console.log("✅ Configuração salva com sucesso");
    } catch (error) {
      console.error("❌ Erro ao salvar configuração:", error);
      alert("Erro ao salvar configuração. Tente novamente.");
    }
  };

  const handleResetToDefault = async () => {
    try {
      await saveConfig(DEFAULT_CONFIG);
      setConfig(DEFAULT_CONFIG);
      setValidationErrors({});
      console.log("✅ Configuração resetada para valores padrão");
    } catch (error) {
      console.error("❌ Erro ao resetar configuração:", error);
    }
  };

  const handleApplyWhiteLabel = async () => {
    try {
      await saveConfig(WHITE_LABEL_CONFIG);
      setConfig(WHITE_LABEL_CONFIG);
      setValidationErrors({});
      console.log("✅ Configuração de white-label aplicada com sucesso");
    } catch (error) {
      console.error("❌ Erro ao aplicar configuração de white-label:", error);
    }
  };

  const renderField = (
    field: keyof BrandingConfig,
    label: string,
    type: string = "text",
    placeholder: string = "",
    required: boolean = false,
  ) => {
    const fieldId = `config${field.charAt(0).toUpperCase() + field.slice(1)}`;
    const value = config[field] || "";
    const error = validationErrors[fieldId];

    return (
      <div className="mb-3">
        <label htmlFor={fieldId} className="form-label">
          {label}
        </label>
        <input
          type={type}
          className={`form-control ${error ? "is-invalid" : ""}`}
          id={fieldId}
          value={value}
          onChange={(e) => handleFieldChange(field, e.target.value)}
          placeholder={placeholder}
          required={required}
        />
        {error && <div className="invalid-feedback">{error}</div>}
      </div>
    );
  };

  return (
    <>
      {/* Modal de Configuração */}
      {modalOpen && (
        <div className="modal show" style={{ display: "block" }}>
          <div className="modal-dialog">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">Configurações</h5>
                <button
                  type="button"
                  className="btn-close"
                  onClick={() => setModalOpen && setModalOpen(false)}
                  aria-label="Close"
                ></button>
              </div>
              <div className="modal-body">
                {renderField(
                  "logo",
                  "Logo",
                  "url",
                  "http://exemplo.com/logo.png",
                )}
                {renderField(
                  "companyName",
                  "Nome da empresa",
                  "text",
                  "Nome da Empresa",
                  true,
                )}
                {renderField(
                  "title",
                  "Título",
                  "text",
                  "Título do sistema",
                  true,
                )}
                {renderField(
                  "developedBy",
                  "Desenvolvido por",
                  "text",
                  "Nome do desenvolvedor",
                  true,
                )}
                {renderField(
                  "copyright",
                  "Copyright",
                  "text",
                  "© 2024 Nome da Empresa",
                  true,
                )}
                {renderField(
                  "registrationDate",
                  "Data de registro",
                  "date",
                  "",
                  true,
                )}
                {renderField(
                  "contactEmail",
                  "Email de contato",
                  "email",
                  "contato@empresa.com",
                  true,
                )}
                {renderField(
                  "contactPhone",
                  "Telefone de contato",
                  "tel",
                  "+55 (61) 3037-6960",
                )}
                {renderField(
                  "contactAddress",
                  "Endereço",
                  "text",
                  "SHN QD. 2 BL. F Ed. Executive Office Tower SL. 1114 - Asa Norte, Brasília-DF CEP 70702-906",
                )}
                {renderField(
                  "contactWebsite",
                  "Website",
                  "url",
                  "http://www.empresa.com",
                )}
                {renderField(
                  "linkFacebook",
                  "Link do Facebook",
                  "url",
                  "http://facebook.com/empresa",
                )}
                {renderField(
                  "linkTwitter",
                  "Link do Twitter",
                  "url",
                  "http://twitter.com/empresa",
                )}
                {renderField(
                  "linkGoogle",
                  "Link do Google",
                  "url",
                  "http://google.com/empresa",
                )}
                {renderField(
                  "linkInstagram",
                  "Link do Instagram",
                  "url",
                  "http://instagram.com/empresa",
                )}
                {renderField(
                  "linkLinkedin",
                  "Link do LinkedIn",
                  "url",
                  "http://linkedin.com/company/empresa",
                )}
                {renderField(
                  "linkGithub",
                  "Link do GitHub",
                  "url",
                  "http://github.com/empresa",
                )}
              </div>
              <div className="modal-footer">
                <button
                  type="button"
                  className="btn btn-primary"
                  onClick={handleResetToDefault}
                  title="Restaurar configurações padrão da MBRA"
                >
                  <i className="fas fa-home me-1"></i>MBRA
                </button>
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={handleApplyWhiteLabel}
                  title="Aplicar configurações genéricas de white-label"
                >
                  <i className="fas fa-palette me-1"></i>White Label
                </button>
                <button
                  type="button"
                  className="btn btn-primary"
                  onClick={handleSave}
                >
                  Salvar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Overlay do modal */}
      {modalOpen && (
        <div
          className="modal-backdrop show"
          onClick={() => setModalOpen && setModalOpen(false)}
        ></div>
      )}
    </>
  );
};

// Componente do Rodapé
const Footer: React.FC<{ config: BrandingConfig }> = ({ config }) => {
  const [isExpanded, setIsExpanded] = useState(false);

  const toggleFooter = () => {
    setIsExpanded(!isExpanded);
  };

  return (
    <footer
      className={`text-center text-lg-start bg-body-tertiary text-muted border-top footer-mobile ${isExpanded ? "expanded" : ""}`}
    >
      {/* Botão de toggle */}
      <button
        className="footer-toggle"
        onClick={toggleFooter}
        title="Expandir/Colapsar rodapé"
      >
        <i className={`fas fa-chevron-${isExpanded ? "down" : "up"}`}></i>
      </button>

      <div className="footer-content">
        {/* Section: Social media */}
        <section className="d-flex justify-content-center justify-content-lg-between p-3 border-bottom">
          {/* Left */}
          <div className="me-5 d-none d-lg-block">
            <span className="small">Conecte-se conosco nas redes sociais:</span>
          </div>

          {/* Right */}
          <div>
            <a href={config.linkFacebook || "#"} className="me-3 text-reset">
              <i className="fab fa-facebook-f"></i>
            </a>
            <a href={config.linkTwitter || "#"} className="me-3 text-reset">
              <i className="fab fa-twitter"></i>
            </a>
            <a href={config.linkGoogle || "#"} className="me-3 text-reset">
              <i className="fab fa-google"></i>
            </a>
            <a href={config.linkInstagram || "#"} className="me-3 text-reset">
              <i className="fab fa-instagram"></i>
            </a>
            <a href={config.linkLinkedin || "#"} className="me-3 text-reset">
              <i className="fab fa-linkedin"></i>
            </a>
            <a href={config.linkGithub || "#"} className="me-3 text-reset">
              <i className="fab fa-github"></i>
            </a>
          </div>
        </section>

        {/* Section: Links */}
        <section className="">
          <div className="container mt-4">
            <div className="row">
              <div className="col-md-6">
                <h6 className="text-uppercase fw-bold mb-2 fs-6">
                  <i className="fas fa-gem me-2"></i>
                  {config.companyName}
                </h6>
                <div className="ms-4">
                  <p className="mb-1 small">{config.title}</p>
                  <p className="mb-1 small">
                    Desenvolvido por {config.developedBy}
                  </p>
                  <p className="mb-1 small">
                    Registrado em{" "}
                    {config.registrationDate
                      ? new Date(config.registrationDate).toLocaleDateString(
                          "pt-BR",
                        )
                      : "-"}
                  </p>
                </div>
              </div>

              <div className="col-md-6">
                <h6 className="text-uppercase fw-bold mb-2 fs-6">Contato</h6>
                <p className="mb-1 small">
                  <i className="fas fa-envelope me-2"></i> {config.contactEmail}
                </p>
                <p className="mb-1 small">
                  <i className="fas fa-phone me-2"></i> {config.contactPhone}
                </p>
                <p className="mb-1 small footer-address">
                  <i className="fas fa-map-marker-alt me-3"></i>{" "}
                  {config.contactAddress}
                </p>
                <p className="mb-1 small">
                  <i className="fas fa-globe me-2"></i> {config.contactWebsite}
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Copyright */}
        <div className="text-center p-3 bg-surface">
          <span className="small">{config.copyright}</span>
        </div>
      </div>
    </footer>
  );
};

export { Branding, Footer };
