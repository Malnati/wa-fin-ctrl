// public/js/index-simple.js
// Versão simplificada sem módulos ES6 para garantir compatibilidade

// Configuração do IndexedDB
const DB_NAME = 'wl-db';
const STORE_NAME = 'config';
const FILES_STORE = 'files';
const DB_VERSION = 2;
const KEY = 'config';

// Configuração padrão para white label
const DEFAULT_CONFIG = {
  logo: 'http://www.mbra.com.br/wp-content/uploads/2023/03/2oQgot9X7fy5fxsnrM9aF24VZ4N.svg',
  companyName: 'MBRA',
  title: 'Sistema de Análise de IA',
  developedBy: 'MBRA',
  copyright: '© 2024 MBRA. Todos os direitos reservados.',
  registrationDate: '2024-01-01',
  contactEmail: 'contato@mbra.com.br',
  contactPhone: '+55 (61) 3037-6960',
  contactAddress:
    'SHN QD. 2 BL. F Ed. Executive Office Tower SL. 1114 - Asa Norte, Brasília-DF CEP 70702-906',
  contactWebsite: 'http://www.mbra.com.br',
  linkFacebook: 'http://facebook.com/mbra',
  linkTwitter: 'http://twitter.com/mbra',
  linkGoogle: 'http://google.com/mbra',
  linkInstagram: 'http://instagram.com/mbra',
  linkLinkedin: 'http://linkedin.com/company/mbra',
  linkGithub: 'http://github.com/mbra',
};

// Configuração genérica para white-label
const WHITE_LABEL_CONFIG = {
  logo: '/assets/logo.svg',
  companyName: 'Sua Empresa',
  title: 'Sistema de Análise de IA',
  developedBy: 'Sua Empresa',
  copyright: '© 2024 Sua Empresa. Todos os direitos reservados.',
  registrationDate: '2024-01-01',
  contactEmail: 'contato@suaempresa.com.br',
  contactPhone: '+55 (61) 3037-6960',
  contactAddress:
    'SHN QD. 2 BL. F Ed. Executive Office Tower SL. 1114 - Asa Norte, Brasília-DF CEP 70702-906',
  contactWebsite: 'http://www.empresa.com.br',
  linkFacebook: 'http://facebook.com/suaempresa',
  linkTwitter: 'http://twitter.com/suaempresa',
  linkGoogle: 'http://google.com/suaempresa',
  linkInstagram: 'http://instagram.com/suaempresa',
  linkLinkedin: 'http://linkedin.com/company/suaempresa',
  linkGithub: 'http://github.com/suaempresa',
};

// Funções do IndexedDB
async function openDB() {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open(DB_NAME, DB_VERSION);

    req.onupgradeneeded = (event) => {
      const db = req.result;

      // Criar store de configuração se não existir
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME);
      }

      // Criar store de arquivos se não existir (versão 2)
      if (!db.objectStoreNames.contains(FILES_STORE)) {
        const filesStore = db.createObjectStore(FILES_STORE, { keyPath: 'id' });
        filesStore.createIndex('timestamp', 'timestamp', { unique: false });
        filesStore.createIndex('filename', 'filename', { unique: false });
      }
    };

    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
}

async function wlGet(key) {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, 'readonly');
    const store = tx.objectStore(STORE_NAME);
    const getReq = store.get(key);
    getReq.onsuccess = () => resolve(getReq.result ?? null);
    getReq.onerror = () => reject(getReq.error);
  });
}

async function wlSet(key, value) {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, 'readwrite');
    const store = tx.objectStore(STORE_NAME);
    const putReq = store.put(value, key);
    putReq.onsuccess = () => resolve(true);
    putReq.onerror = () => reject(putReq.error);
  });
}

// Funções para gerenciar arquivos no IndexedDB
async function saveFile(file) {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(FILES_STORE, 'readwrite');
    const store = tx.objectStore(FILES_STORE);

    const fileData = {
      id: Date.now().toString(),
      filename: file.name,
      type: file.type,
      size: file.size,
      timestamp: new Date().toISOString(),
      data: file,
    };

    const putReq = store.put(fileData);
    putReq.onsuccess = () => resolve(fileData.id);
    putReq.onerror = () => reject(putReq.error);
  });
}

async function getFile(fileId) {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(FILES_STORE, 'readonly');
    const store = tx.objectStore(FILES_STORE);
    const getReq = store.get(fileId);
    getReq.onsuccess = () => resolve(getReq.result);
    getReq.onerror = () => reject(getReq.error);
  });
}

async function getAllFiles() {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(FILES_STORE, 'readonly');
    const store = tx.objectStore(FILES_STORE);
    const getAllReq = store.getAll();
    getAllReq.onsuccess = () => resolve(getAllReq.result);
    getAllReq.onerror = () => reject(getAllReq.error);
  });
}

async function saveConfig(config) {
  return wlSet(KEY, config);
}

async function loadConfig() {
  const savedConfig = await wlGet(KEY);

  // Se não há configuração salva, retornar a configuração padrão
  if (!savedConfig) {
    return DEFAULT_CONFIG;
  }

  // Mesclar configuração salva com padrão para garantir que todos os campos estejam presentes
  return { ...DEFAULT_CONFIG, ...savedConfig };
}

const DIAGNOSTICS_SUBMIT_ENDPOINT = '/diagnostics/submit';
const HTTP_METHOD_POST = 'POST';
const FORM_FIELD_FILE = 'file';
const FORM_FIELD_GENERATE_AUDIO = 'generateAudio';
const FORM_FIELD_VOICE_ID = 'voiceID';
const ERROR_MESSAGE_FETCH_FAILED = 'Falha ao enviar diagnóstico.';
const ERROR_MESSAGE_INVALID_RESPONSE = 'Resposta inválida do servidor.';
const LOG_ERROR_SUBMIT = '❌ Falha ao enviar diagnóstico:';
const TEXT_STATUS_LABEL = 'Status';
const TEXT_SUMMARY_LABEL = 'Resumo';
const TEXT_AUDIO_GENERATED_YES = 'Sim';
const TEXT_AUDIO_GENERATED_NO = 'Não';
const DEFAULT_ANALYSIS_PLACEHOLDER = 'Nenhum resultado disponível.';
const DEFAULT_PROCESSED_DATE_LOCALE = 'pt-BR';

// Função para enviar PDF para a API NestJS
async function submitPdf({ file, generateAudio, voiceID }) {
  console.log('📁 Processando arquivo:', file.name);
  console.log('🎵 Gerar áudio:', generateAudio);
  console.log('🎤 Voz selecionada:', voiceID);

  const formData = new FormData();
  formData.append(FORM_FIELD_FILE, file);
  formData.append(FORM_FIELD_GENERATE_AUDIO, String(Boolean(generateAudio)));

  if (voiceID) {
    formData.append(FORM_FIELD_VOICE_ID, voiceID);
  }

  try {
    const response = await fetch(DIAGNOSTICS_SUBMIT_ENDPOINT, {
      method: HTTP_METHOD_POST,
      body: formData,
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(
        `${ERROR_MESSAGE_FETCH_FAILED} ${response.status}: ${errorText || response.statusText}`,
      );
    }

    const data = await response.json();

    if (!data || typeof data !== 'object') {
      throw new Error(ERROR_MESSAGE_INVALID_RESPONSE);
    }

    return data;
  } catch (error) {
    console.error(LOG_ERROR_SUBMIT, error);
    throw error instanceof Error ? error : new Error(String(error));
  }
}

// Função para aplicar configuração
function applyConfig(cfg) {
  if (!cfg) {
    // Se não há configuração, aplicar a padrão
    cfg = DEFAULT_CONFIG;
  }

  const logoPlaceholder = document.getElementById('logoPlaceholder');
  const pageTitle = document.getElementById('pageTitle');
  const footerCompanyName = document.getElementById('footerCompanyName');
  const footerTitle = document.getElementById('footerTitle');
  const footerDevelopedBy = document.getElementById('footerDevelopedBy');
  const footerCopyright = document.getElementById('footerCopyright');
  const footerRegistrationDate = document.getElementById(
    'footerRegistrationDate',
  );
  const footerContactEmail = document.getElementById('footerContactEmail');
  const footerContactPhone = document.getElementById('footerContactPhone');
  const footerContactAddress = document.getElementById('footerContactAddress');
  const footerContactWebsite = document.getElementById('footerContactWebsite');

  if (cfg.logo) {
    const img = document.createElement('img');
    img.src = cfg.logo;
    img.alt = cfg.companyName || 'logo';
    img.style.maxHeight = '50px';
    img.style.maxWidth = '200px';
    img.style.objectFit = 'contain';
    img.onerror = function () {
      // Se a imagem falhar ao carregar, mostrar texto
      logoPlaceholder.textContent = cfg.companyName || 'SUA LOGO AQUI';
    };
    logoPlaceholder.innerHTML = '';
    logoPlaceholder.appendChild(img);
  } else {
    logoPlaceholder.textContent = cfg.companyName || 'SUA LOGO AQUI';
  }

  if (cfg.title) {
    pageTitle.textContent = cfg.title;
    footerTitle.textContent = cfg.title;
  }

  if (cfg.companyName) {
    footerCompanyName.textContent = cfg.companyName;
  }

  if (cfg.developedBy) {
    footerDevelopedBy.textContent = `Desenvolvido por ${cfg.developedBy}`;
  }

  if (cfg.copyright) {
    footerCopyright.textContent = cfg.copyright;
  }

  if (cfg.registrationDate) {
    const d = new Date(cfg.registrationDate);
    footerRegistrationDate.textContent = `Registrado em ${d.toLocaleDateString('pt-BR')}`;
  }

  if (cfg.contactEmail) {
    footerContactEmail.textContent = cfg.contactEmail;
  }

  if (cfg.contactPhone) {
    footerContactPhone.textContent = cfg.contactPhone;
  }

  if (cfg.contactAddress) {
    footerContactAddress.textContent = cfg.contactAddress;
  }

  if (cfg.contactWebsite) {
    footerContactWebsite.textContent = cfg.contactWebsite;
  }

  // Atualizar inputs do modal
  const inputs = {
    logo: document.getElementById('configLogo'),
    companyName: document.getElementById('configCompanyName'),
    title: document.getElementById('configTitle'),
    developedBy: document.getElementById('configDevelopedBy'),
    copyright: document.getElementById('configCopyright'),
    registrationDate: document.getElementById('configRegistrationDate'),
    contactEmail: document.getElementById('configContactEmail'),
    contactPhone: document.getElementById('configContactPhone'),
    contactAddress: document.getElementById('configContactAddress'),
    contactWebsite: document.getElementById('configContactWebsite'),
    linkFacebook: document.getElementById('configLinkFacebook'),
    linkTwitter: document.getElementById('configLinkTwitter'),
    linkGoogle: document.getElementById('configLinkGoogle'),
    linkInstagram: document.getElementById('configLinkInstagram'),
    linkLinkedin: document.getElementById('configLinkLinkedin'),
    linkGithub: document.getElementById('configLinkGithub'),
  };

  if (inputs.logo) inputs.logo.value = cfg.logo || '';
  if (inputs.companyName) inputs.companyName.value = cfg.companyName || '';
  if (inputs.title) inputs.title.value = cfg.title || '';
  if (inputs.developedBy) inputs.developedBy.value = cfg.developedBy || '';
  if (inputs.copyright) inputs.copyright.value = cfg.copyright || '';
  if (inputs.registrationDate)
    inputs.registrationDate.value = cfg.registrationDate || '';
  if (inputs.contactEmail) inputs.contactEmail.value = cfg.contactEmail || '';
  if (inputs.contactPhone) inputs.contactPhone.value = cfg.contactPhone || '';
  if (inputs.contactAddress)
    inputs.contactAddress.value = cfg.contactAddress || '';
  if (inputs.contactWebsite)
    inputs.contactWebsite.value = cfg.contactWebsite || '';
  if (inputs.linkFacebook) inputs.linkFacebook.value = cfg.linkFacebook || '';
  if (inputs.linkTwitter) inputs.linkTwitter.value = cfg.linkTwitter || '';
  if (inputs.linkGoogle) inputs.linkGoogle.value = cfg.linkGoogle || '';
  if (inputs.linkInstagram)
    inputs.linkInstagram.value = cfg.linkInstagram || '';
  if (inputs.linkLinkedin) inputs.linkLinkedin.value = cfg.linkLinkedin || '';
  if (inputs.linkGithub) inputs.linkGithub.value = cfg.linkGithub || '';
}

// Funções de validação
function validateField(field, validationRules) {
  const value = field.value.trim();
  let isValid = true;
  let errorMessage = '';

  // Validação de campo obrigatório
  if (validationRules.required && !value) {
    isValid = false;
    errorMessage = 'Este campo é obrigatório.';
  }

  // Validação de comprimento mínimo
  if (
    isValid &&
    validationRules.minLength &&
    value.length < validationRules.minLength
  ) {
    isValid = false;
    errorMessage = `Mínimo de ${validationRules.minLength} caracteres.`;
  }

  // Validação de comprimento máximo
  if (
    isValid &&
    validationRules.maxLength &&
    value.length > validationRules.maxLength
  ) {
    isValid = false;
    errorMessage = `Máximo de ${validationRules.maxLength} caracteres.`;
  }

  // Validação de padrão (regex)
  if (
    isValid &&
    validationRules.pattern &&
    value &&
    !validationRules.pattern.test(value)
  ) {
    isValid = false;
    errorMessage = validationRules.patternMessage || 'Formato inválido.';
  }

  // Validação de tipo específico
  if (isValid && validationRules.type === 'email' && value) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(value)) {
      isValid = false;
      errorMessage = 'Email inválido.';
    }
  }

  if (isValid && validationRules.type === 'url' && value) {
    const urlRegex = /^https?:\/\/.+/;
    if (!urlRegex.test(value)) {
      isValid = false;
      errorMessage = 'URL deve começar com http:// ou https://';
    }
  }

  if (isValid && validationRules.type === 'date' && value) {
    const selectedDate = new Date(value);
    const maxDate = new Date(validationRules.maxDate || '2024-12-31');
    if (selectedDate > maxDate) {
      isValid = false;
      errorMessage = 'Data não pode ser futura.';
    }
  }

  return { isValid, errorMessage };
}

function showFieldValidation(field, isValid, errorMessage) {
  const feedbackElement = document.getElementById(field.id + 'Feedback');

  if (feedbackElement) {
    if (!isValid) {
      field.classList.add('is-invalid');
      field.classList.remove('is-valid');
      feedbackElement.textContent = errorMessage;
      feedbackElement.style.display = 'block';
    } else {
      field.classList.remove('is-invalid');
      field.classList.add('is-valid');
      feedbackElement.style.display = 'none';
    }
  }
}

function validateAllFields() {
  const validationRules = {
    configLogo: {
      type: 'url',
      pattern: /^https?:\/\/.+/,
      patternMessage: 'URL deve começar com http:// ou https://',
    },
    configCompanyName: { required: true, minLength: 2, maxLength: 100 },
    configTitle: { required: true, minLength: 3, maxLength: 200 },
    configDevelopedBy: { required: true, minLength: 2, maxLength: 100 },
    configCopyright: { required: true, minLength: 3, maxLength: 100 },
    configRegistrationDate: {
      required: true,
      type: 'date',
      maxDate: '2024-12-31',
    },
    configContactEmail: { required: true, type: 'email' },
    configContactPhone: {
      pattern: /^[\+]?[0-9\s\-\(\)]{10,20}$/,
      patternMessage: 'Telefone deve ter 10-20 dígitos',
    },
    configContactAddress: { minLength: 5, maxLength: 200 },
    configContactWebsite: {
      type: 'url',
      pattern: /^https?:\/\/.+/,
      patternMessage: 'URL deve começar com http:// ou https://',
    },
    configLinkFacebook: {
      type: 'url',
      pattern: /^https?:\/\/.+/,
      patternMessage: 'URL deve começar com http:// ou https://',
    },
    configLinkTwitter: {
      type: 'url',
      pattern: /^https?:\/\/.+/,
      patternMessage: 'URL deve começar com http:// ou https://',
    },
    configLinkGoogle: {
      type: 'url',
      pattern: /^https?:\/\/.+/,
      patternMessage: 'URL deve começar com http:// ou https://',
    },
    configLinkInstagram: {
      type: 'url',
      pattern: /^https?:\/\/.+/,
      patternMessage: 'URL deve começar com http:// ou https://',
    },
    configLinkLinkedin: {
      type: 'url',
      pattern: /^https?:\/\/.+/,
      patternMessage: 'URL deve começar com http:// ou https://',
    },
    configLinkGithub: {
      type: 'url',
      pattern: /^https?:\/\/.+/,
      patternMessage: 'URL deve começar com http:// ou https://',
    },
  };

  let allValid = true;

  Object.keys(validationRules).forEach((fieldId) => {
    const field = document.getElementById(fieldId);
    if (field) {
      const validation = validateField(field, validationRules[fieldId]);
      showFieldValidation(field, validation.isValid, validation.errorMessage);

      if (!validation.isValid) {
        allValid = false;
      }
    }
  });

  return allValid;
}

// Função para exibir resultado na interface
function displayResult(result, file) {
  const responseSection = document.getElementById('responseSection');
  const diagnosticText = document.getElementById('diagnosticText');
  const processedFileName = document.getElementById('processedFileName');
  const processedDate = document.getElementById('processedDate');
  const audioGenerated = document.getElementById('audioGenerated');

  if (!result || typeof result !== 'object') {
    showError(ERROR_MESSAGE_INVALID_RESPONSE);
    return;
  }

  if (responseSection) {
    responseSection.style.display = 'block';
  }

  if (diagnosticText) {
    diagnosticText.innerHTML = '';

    const hasText = typeof result.text === 'string' && result.text.trim();

    if (hasText) {
      const analysisContainer = document.createElement('div');
      analysisContainer.classList.add('mt-3');
      analysisContainer.textContent = result.text.trim();
      analysisContainer.style.whiteSpace = 'pre-wrap';
      analysisContainer.style.wordBreak = 'break-word';
      diagnosticText.appendChild(analysisContainer);
    }

    if (!hasText) {
      diagnosticText.textContent = DEFAULT_ANALYSIS_PLACEHOLDER;
    }
  }

  if (processedFileName) {
    processedFileName.textContent = file?.name || result.fileUrl || '-';
  }

  if (processedDate) {
    processedDate.textContent = new Date().toLocaleString(
      DEFAULT_PROCESSED_DATE_LOCALE,
    );
  }

  if (audioGenerated) {
    const audioAvailable = Boolean(result.audioUrl);
    audioGenerated.textContent = audioAvailable
      ? TEXT_AUDIO_GENERATED_YES
      : TEXT_AUDIO_GENERATED_NO;
  }

  setupDownloadLinks(result, file);

  if (responseSection) {
    responseSection.scrollIntoView({ behavior: 'smooth' });
  }
}

// Função para configurar links de download
function setupDownloadLinks(result, file) {
  // Link para arquivo original
  const originalFileLink = document.getElementById('originalFileLink');
  if (originalFileLink) {
    if (result.fileUrl) {
      originalFileLink.href = result.fileUrl;
      originalFileLink.removeAttribute('download');
    } else if (file) {
      const url = URL.createObjectURL(file);
      originalFileLink.href = url;
      originalFileLink.download = file.name;
    }
  }

  // Link para PDF gerado
  const generatedPdfLink = document.getElementById('generatedPdfLink');
  if (generatedPdfLink) {
    if (result.pdfUrl) {
      generatedPdfLink.href = result.pdfUrl;
      generatedPdfLink.style.display = 'inline-block';
    } else {
      generatedPdfLink.removeAttribute('href');
      generatedPdfLink.style.display = 'none';
    }
  }

  // Link para áudio (se gerado)
  const audioFileLink = document.getElementById('audioFileLink');
  if (audioFileLink) {
    if (result.audioUrl) {
      audioFileLink.href = result.audioUrl;
      audioFileLink.style.display = 'inline-block';
    } else {
      audioFileLink.removeAttribute('href');
      audioFileLink.style.display = 'none';
    }
  }
}

// Função para mostrar erro
function showError(message) {
  const responseSection = document.getElementById('responseSection');
  const diagnosticText = document.getElementById('diagnosticText');

  if (responseSection && diagnosticText) {
    responseSection.style.display = 'block';
    diagnosticText.innerHTML = `<div class="alert alert-danger">❌ ${message}</div>`;
    responseSection.scrollIntoView({ behavior: 'smooth' });
  }
}

// Função para limpar resultado
function clearResult() {
  const responseSection = document.getElementById('responseSection');
  if (responseSection) {
    responseSection.style.display = 'none';
  }
}

// Inicialização quando o DOM estiver carregado
document.addEventListener('DOMContentLoaded', async () => {
  console.log('✅ DOM carregado, inicializando aplicação...');
  console.log('🔧 Configuração padrão da MBRA:', DEFAULT_CONFIG);

  try {
    // Carregar configuração salva (ou padrão se não houver)
    const config = await loadConfig();
    console.log('🔧 Configuração carregada:', config);
    applyConfig(config);

    // Verificar se a configuração padrão foi aplicada
    if (config.logo === DEFAULT_CONFIG.logo) {
      console.log('✅ Logo padrão da MBRA aplicado com sucesso');
    }

    // Configurar modal
    const configModal = document.getElementById('configModal');
    const saveButton = document.querySelector('#configModal .btn.btn-primary');

    if (saveButton) {
      saveButton.addEventListener('click', async () => {
        // Validar todos os campos antes de salvar
        if (!validateAllFields()) {
          alert('Por favor, corrija os erros de validação antes de salvar.');
          return;
        }

        const inputs = {
          logo: document.getElementById('configLogo'),
          companyName: document.getElementById('configCompanyName'),
          title: document.getElementById('configTitle'),
          developedBy: document.getElementById('configDevelopedBy'),
          copyright: document.getElementById('configCopyright'),
          registrationDate: document.getElementById('configRegistrationDate'),
          contactEmail: document.getElementById('configContactEmail'),
          contactPhone: document.getElementById('configContactPhone'),
          contactAddress: document.getElementById('configContactAddress'),
          contactWebsite: document.getElementById('configContactWebsite'),
          linkFacebook: document.getElementById('configLinkFacebook'),
          linkTwitter: document.getElementById('configLinkTwitter'),
          linkGoogle: document.getElementById('configLinkGoogle'),
          linkInstagram: document.getElementById('configLinkInstagram'),
          linkLinkedin: document.getElementById('configLinkLinkedin'),
          linkGithub: document.getElementById('configLinkGithub'),
        };

        const cfg = {
          logo: inputs.logo ? inputs.logo.value.trim() : '',
          companyName: inputs.companyName
            ? inputs.companyName.value.trim()
            : '',
          title: inputs.title ? inputs.title.value.trim() : '',
          developedBy: inputs.developedBy
            ? inputs.developedBy.value.trim()
            : '',
          copyright: inputs.copyright ? inputs.copyright.value.trim() : '',
          registrationDate: inputs.registrationDate
            ? inputs.registrationDate.value
            : '',
          contactEmail: inputs.contactEmail
            ? inputs.contactEmail.value.trim()
            : '',
          contactPhone: inputs.contactPhone
            ? inputs.contactPhone.value.trim()
            : '',
          contactAddress: inputs.contactAddress
            ? inputs.contactAddress.value.trim()
            : '',
          contactWebsite: inputs.contactWebsite
            ? inputs.contactWebsite.value.trim()
            : '',
          linkFacebook: inputs.linkFacebook
            ? inputs.linkFacebook.value.trim()
            : '',
          linkTwitter: inputs.linkTwitter
            ? inputs.linkTwitter.value.trim()
            : '',
          linkGoogle: inputs.linkGoogle ? inputs.linkGoogle.value.trim() : '',
          linkInstagram: inputs.linkInstagram
            ? inputs.linkInstagram.value.trim()
            : '',
          linkLinkedin: inputs.linkLinkedin
            ? inputs.linkLinkedin.value.trim()
            : '',
          linkGithub: inputs.linkGithub ? inputs.linkGithub.value.trim() : '',
        };

        await saveConfig(cfg);
        applyConfig(cfg);

        // Fechar modal (implementação básica)
        if (configModal) {
          configModal.style.display = 'none';
        }
      });
    }

    // Configurar formulário de upload
    const form = document.getElementById('uploadForm');
    const submitBtn = form ? form.querySelector('button[type="submit"]') : null;

    if (form && submitBtn) {
      form.addEventListener('submit', async (e) => {
        e.preventDefault();

        const file = document.getElementById('pdfFile').files[0];
        if (!file) {
          alert('Por favor, selecione um arquivo PDF.');
          return;
        }

        // Limpar resultado anterior
        clearResult();

        const generateAudio = document.getElementById('generateAudio').checked;
        const voiceID = document.getElementById('voiceID').value;

        submitBtn.disabled = true;
        const spinner = document.createElement('span');
        spinner.className = 'spinner-border spinner-border-sm ms-2';
        submitBtn.appendChild(spinner);

        try {
          const result = await submitPdf({ file, generateAudio, voiceID });

          // Exibir resultado na nova interface
          displayResult(result, file);
        } catch (error) {
          console.error('Erro ao enviar PDF:', error);
          showError(`Erro ao processar arquivo: ${error.message}`);
        } finally {
          spinner.remove();
          submitBtn.disabled = false;
        }
      });
    }

    // Adicionar validação em tempo real para todos os campos
    const configFields = [
      'configLogo',
      'configCompanyName',
      'configTitle',
      'configDevelopedBy',
      'configCopyright',
      'configRegistrationDate',
      'configContactEmail',
      'configContactPhone',
      'configContactAddress',
      'configContactWebsite',
      'configLinkFacebook',
      'configLinkTwitter',
      'configLinkGoogle',
      'configLinkInstagram',
      'configLinkLinkedin',
      'configLinkGithub',
    ];

    configFields.forEach((fieldId) => {
      const field = document.getElementById(fieldId);
      if (field) {
        field.addEventListener('blur', () => {
          const validationRules = {
            configLogo: {
              type: 'url',
              pattern: /^https?:\/\/.+/,
              patternMessage: 'URL deve começar com http:// ou https://',
            },
            configCompanyName: { required: true, minLength: 2, maxLength: 100 },
            configTitle: { required: true, minLength: 3, maxLength: 200 },
            configDevelopedBy: { required: true, minLength: 2, maxLength: 100 },
            configCopyright: { required: true, minLength: 3, maxLength: 100 },
            configRegistrationDate: {
              required: true,
              type: 'date',
              maxDate: '2024-12-31',
            },
            configContactEmail: { required: true, type: 'email' },
            configContactPhone: {
              pattern: /^[\+]?[0-9\s\-\(\)]{10,20}$/,
              patternMessage: 'Telefone deve ter 10-20 dígitos',
            },
            configContactAddress: { minLength: 5, maxLength: 200 },
            configContactWebsite: {
              type: 'url',
              pattern: /^https?:\/\/.+/,
              patternMessage: 'URL deve começar com http:// ou https://',
            },
            configLinkFacebook: {
              type: 'url',
              pattern: /^https?:\/\/.+/,
              patternMessage: 'URL deve começar com http:// ou https://',
            },
            configLinkTwitter: {
              type: 'url',
              pattern: /^https?:\/\/.+/,
              patternMessage: 'URL deve começar com http:// ou https://',
            },
            configLinkGoogle: {
              type: 'url',
              pattern: /^https?:\/\/.+/,
              patternMessage: 'URL deve começar com http:// ou https://',
            },
            configLinkInstagram: {
              type: 'url',
              pattern: /^https?:\/\/.+/,
              patternMessage: 'URL deve começar com http:// ou https://',
            },
            configLinkLinkedin: {
              type: 'url',
              pattern: /^https?:\/\/.+/,
              patternMessage: 'URL deve começar com http:// ou https://',
            },
            configLinkGithub: {
              type: 'url',
              pattern: /^https?:\/\/.+/,
              patternMessage: 'URL deve começar com http:// ou https://',
            },
          };

          const validation = validateField(field, validationRules[fieldId]);
          showFieldValidation(
            field,
            validation.isValid,
            validation.errorMessage,
          );
        });

        field.addEventListener('input', () => {
          // Remover classes de validação durante digitação
          field.classList.remove('is-valid', 'is-invalid');
          const feedbackElement = document.getElementById(
            field.id + 'Feedback',
          );
          if (feedbackElement) {
            feedbackElement.style.display = 'none';
          }
        });
      }
    });

    // Adicionar listener para limpar resultado quando novo arquivo for selecionado
    const pdfFileInput = document.getElementById('pdfFile');
    if (pdfFileInput) {
      pdfFileInput.addEventListener('change', () => {
        clearResult();
      });
    }

    console.log('✅ Aplicação inicializada com sucesso!');
  } catch (error) {
    console.error('❌ Erro ao inicializar aplicação:', error);
  }
});

// Função para abrir modal (implementação básica)
function openConfigModal() {
  const modal = document.getElementById('configModal');
  if (modal) {
    modal.style.display = 'block';
  }
}

// Função para fechar modal (implementação básica)
function closeConfigModal() {
  const modal = document.getElementById('configModal');
  if (modal) {
    modal.style.display = 'none';
  }
}

// Função para resetar configuração para valores padrão
async function resetToDefaultConfig() {
  try {
    await saveConfig(DEFAULT_CONFIG);
    applyConfig(DEFAULT_CONFIG);

    // Atualizar campos do modal
    const inputs = {
      logo: document.getElementById('configLogo'),
      companyName: document.getElementById('configCompanyName'),
      title: document.getElementById('configTitle'),
      developedBy: document.getElementById('configDevelopedBy'),
      copyright: document.getElementById('configCopyright'),
      registrationDate: document.getElementById('configRegistrationDate'),
      contactEmail: document.getElementById('configContactEmail'),
      contactPhone: document.getElementById('configContactPhone'),
      contactAddress: document.getElementById('configContactAddress'),
      contactWebsite: document.getElementById('configContactWebsite'),
      linkFacebook: document.getElementById('configLinkFacebook'),
      linkTwitter: document.getElementById('configLinkTwitter'),
      linkGoogle: document.getElementById('configLinkGoogle'),
      linkInstagram: document.getElementById('configLinkInstagram'),
      linkLinkedin: document.getElementById('configLinkLinkedin'),
      linkGithub: document.getElementById('configLinkGithub'),
    };

    if (inputs.logo) inputs.logo.value = DEFAULT_CONFIG.logo;
    if (inputs.companyName)
      inputs.companyName.value = DEFAULT_CONFIG.companyName;
    if (inputs.title) inputs.title.value = DEFAULT_CONFIG.title;
    if (inputs.developedBy)
      inputs.developedBy.value = DEFAULT_CONFIG.developedBy;
    if (inputs.copyright) inputs.copyright.value = DEFAULT_CONFIG.copyright;
    if (inputs.registrationDate)
      inputs.registrationDate.value = DEFAULT_CONFIG.registrationDate;
    if (inputs.contactEmail)
      inputs.contactEmail.value = DEFAULT_CONFIG.contactEmail;
    if (inputs.contactPhone)
      inputs.contactPhone.value = DEFAULT_CONFIG.contactPhone;
    if (inputs.contactAddress)
      inputs.contactAddress.value = DEFAULT_CONFIG.contactAddress;
    if (inputs.contactWebsite)
      inputs.contactWebsite.value = DEFAULT_CONFIG.contactWebsite;
    if (inputs.linkFacebook)
      inputs.linkFacebook.value = DEFAULT_CONFIG.linkFacebook;
    if (inputs.linkTwitter)
      inputs.linkTwitter.value = DEFAULT_CONFIG.linkTwitter;
    if (inputs.linkGoogle) inputs.linkGoogle.value = DEFAULT_CONFIG.linkGoogle;
    if (inputs.linkInstagram)
      inputs.linkInstagram.value = DEFAULT_CONFIG.linkInstagram;
    if (inputs.linkLinkedin)
      inputs.linkLinkedin.value = DEFAULT_CONFIG.linkLinkedin;
    if (inputs.linkGithub) inputs.linkGithub.value = DEFAULT_CONFIG.linkGithub;

    console.log('✅ Configuração resetada para valores padrão');
  } catch (error) {
    console.error('❌ Erro ao resetar configuração:', error);
  }
}

// Função para aplicar configuração de white-label genérica
async function applyWhiteLabelConfig() {
  try {
    await saveConfig(WHITE_LABEL_CONFIG);
    applyConfig(WHITE_LABEL_CONFIG);

    // Atualizar campos do modal
    const inputs = {
      logo: document.getElementById('configLogo'),
      companyName: document.getElementById('configCompanyName'),
      title: document.getElementById('configTitle'),
      developedBy: document.getElementById('configDevelopedBy'),
      copyright: document.getElementById('configCopyright'),
      registrationDate: document.getElementById('configRegistrationDate'),
      contactEmail: document.getElementById('configContactEmail'),
      contactPhone: document.getElementById('configContactPhone'),
      contactAddress: document.getElementById('configContactAddress'),
      contactWebsite: document.getElementById('configContactWebsite'),
      linkFacebook: document.getElementById('configLinkFacebook'),
      linkTwitter: document.getElementById('configLinkTwitter'),
      linkGoogle: document.getElementById('configLinkGoogle'),
      linkInstagram: document.getElementById('configLinkInstagram'),
      linkLinkedin: document.getElementById('configLinkLinkedin'),
      linkGithub: document.getElementById('configLinkGithub'),
    };

    if (inputs.logo) inputs.logo.value = WHITE_LABEL_CONFIG.logo;
    if (inputs.companyName)
      inputs.companyName.value = WHITE_LABEL_CONFIG.companyName;
    if (inputs.title) inputs.title.value = WHITE_LABEL_CONFIG.title;
    if (inputs.developedBy)
      inputs.developedBy.value = WHITE_LABEL_CONFIG.developedBy;
    if (inputs.copyright) inputs.copyright.value = WHITE_LABEL_CONFIG.copyright;
    if (inputs.registrationDate)
      inputs.registrationDate.value = WHITE_LABEL_CONFIG.registrationDate;
    if (inputs.contactEmail)
      inputs.contactEmail.value = WHITE_LABEL_CONFIG.contactEmail;
    if (inputs.contactPhone)
      inputs.contactPhone.value = WHITE_LABEL_CONFIG.contactPhone;
    if (inputs.contactAddress)
      inputs.contactAddress.value = WHITE_LABEL_CONFIG.contactAddress;
    if (inputs.contactWebsite)
      inputs.contactWebsite.value = WHITE_LABEL_CONFIG.contactWebsite;
    if (inputs.linkFacebook)
      inputs.linkFacebook.value = WHITE_LABEL_CONFIG.linkFacebook;
    if (inputs.linkTwitter)
      inputs.linkTwitter.value = WHITE_LABEL_CONFIG.linkTwitter;
    if (inputs.linkGoogle)
      inputs.linkGoogle.value = WHITE_LABEL_CONFIG.linkGoogle;
    if (inputs.linkInstagram)
      inputs.linkInstagram.value = WHITE_LABEL_CONFIG.linkInstagram;
    if (inputs.linkLinkedin)
      inputs.linkLinkedin.value = WHITE_LABEL_CONFIG.linkLinkedin;
    if (inputs.linkGithub)
      inputs.linkGithub.value = WHITE_LABEL_CONFIG.linkGithub;

    console.log('✅ Configuração de white-label aplicada com sucesso');
  } catch (error) {
    console.error('❌ Erro ao aplicar configuração de white-label:', error);
  }
}

// Função para salvar configuração (chamada pelo HTML customizado)
async function saveConfigFromUI() {
  const inputs = {
    logo: document.getElementById('configLogo'),
    companyName: document.getElementById('configCompanyName'),
    title: document.getElementById('configTitle'),
    developedBy: document.getElementById('configDevelopedBy'),
    copyright: document.getElementById('configCopyright'),
    registrationDate: document.getElementById('configRegistrationDate'),
    contactEmail: document.getElementById('configContactEmail'),
    contactPhone: document.getElementById('configContactPhone'),
    contactAddress: document.getElementById('configContactAddress'),
    contactWebsite: document.getElementById('configContactWebsite'),
    linkFacebook: document.getElementById('configLinkFacebook'),
    linkTwitter: document.getElementById('configLinkTwitter'),
    linkGoogle: document.getElementById('configLinkGoogle'),
    linkInstagram: document.getElementById('configLinkInstagram'),
    linkLinkedin: document.getElementById('configLinkLinkedin'),
    linkGithub: document.getElementById('configLinkGithub'),
  };

  const cfg = {
    logo: inputs.logo ? inputs.logo.value.trim() : '',
    companyName: inputs.companyName ? inputs.companyName.value.trim() : '',
    title: inputs.title ? inputs.title.value.trim() : '',
    developedBy: inputs.developedBy ? inputs.developedBy.value.trim() : '',
    copyright: inputs.copyright ? inputs.copyright.value.trim() : '',
    registrationDate: inputs.registrationDate
      ? inputs.registrationDate.value
      : '',
    contactEmail: inputs.contactEmail ? inputs.contactEmail.value.trim() : '',
    contactPhone: inputs.contactPhone ? inputs.contactPhone.value.trim() : '',
    contactAddress: inputs.contactAddress
      ? inputs.contactAddress.value.trim()
      : '',
    contactWebsite: inputs.contactWebsite
      ? inputs.contactWebsite.value.trim()
      : '',
    linkFacebook: inputs.linkFacebook ? inputs.linkFacebook.value.trim() : '',
    linkTwitter: inputs.linkTwitter ? inputs.linkTwitter.value.trim() : '',
    linkGoogle: inputs.linkGoogle ? inputs.linkGoogle.value.trim() : '',
    linkInstagram: inputs.linkInstagram
      ? inputs.linkInstagram.value.trim()
      : '',
    linkLinkedin: inputs.linkLinkedin ? inputs.linkLinkedin.value.trim() : '',
    linkGithub: inputs.linkGithub ? inputs.linkGithub.value.trim() : '',
  };

  try {
    await saveConfig(cfg);
    applyConfig(cfg);
    closeConfigModal();
    console.log('✅ Configuração salva com sucesso');
  } catch (error) {
    console.error('❌ Erro ao salvar configuração:', error);
  }
}

// Adicionar botão de configuração funcional
document.addEventListener('DOMContentLoaded', () => {
  const configBtn = document.querySelector('[data-bs-target="#configModal"]');
  if (configBtn) {
    configBtn.addEventListener('click', openConfigModal);
  }

  // Fechar modal ao clicar fora ou no botão de fechar
  const modal = document.getElementById('configModal');
  if (modal) {
    modal.addEventListener('click', (e) => {
      if (e.target === modal) {
        closeConfigModal();
      }
    });

    const closeBtn = modal.querySelector('.btn-close');
    if (closeBtn) {
      closeBtn.addEventListener('click', closeConfigModal);
    }
  }
});
