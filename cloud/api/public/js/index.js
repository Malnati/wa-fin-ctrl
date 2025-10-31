// public/js/index.js

import { submitPdf } from './method.js';
import { loadConfig, saveConfig, exportConfig, importConfig } from './wl-db.js';

document.addEventListener('DOMContentLoaded', async () => {
  const logoPlaceholder = document.getElementById('logoPlaceholder');
  const pageTitle = document.getElementById('pageTitle');
  const footerCompanyName = document.getElementById('footerCompanyName');
  const footerTitle = document.getElementById('footerTitle');
  const footerDevelopedBy = document.getElementById('footerDevelopedBy');
  const footerCopyright = document.getElementById('footerCopyright');
  const footerRegistrationDate = document.getElementById(
    'footerRegistrationDate',
  );

  const inputs = {
    logo: document.getElementById('configLogo'),
    companyName: document.getElementById('configCompanyName'),
    title: document.getElementById('configTitle'),
    developedBy: document.getElementById('configDevelopedBy'),
    copyright: document.getElementById('configCopyright'),
    registrationDate: document.getElementById('configRegistrationDate'),
  };

  function applyConfig(cfg) {
    if (!cfg) return;

    if (cfg.logo) {
      const img = document.createElement('img');
      img.src = cfg.logo;
      img.alt = cfg.companyName || 'logo';
      img.style.maxHeight = '50px';
      logoPlaceholder.innerHTML = '';
      logoPlaceholder.appendChild(img);
    } else {
      logoPlaceholder.textContent = 'SUA LOGO AQUI';
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

    inputs.logo.value = cfg.logo || '';
    inputs.companyName.value = cfg.companyName || '';
    inputs.title.value = cfg.title || '';
    inputs.developedBy.value = cfg.developedBy || '';
    inputs.copyright.value = cfg.copyright || '';
    inputs.registrationDate.value = cfg.registrationDate || '';
  }

  const savedConfig = await loadConfig();
  if (savedConfig) {
    applyConfig(savedConfig);
  }

  const configModal = new bootstrap.Modal(
    document.getElementById('configModal'),
  );
  const saveButton = document.querySelector('#configModal .btn.btn-primary');
  saveButton.addEventListener('click', async () => {
    const cfg = {
      logo: inputs.logo.value.trim(),
      companyName: inputs.companyName.value.trim(),
      title: inputs.title.value.trim(),
      developedBy: inputs.developedBy.value.trim(),
      copyright: inputs.copyright.value.trim(),
      registrationDate: inputs.registrationDate.value,
    };
    await saveConfig(cfg);
    applyConfig(cfg);
  });

  const exportBtn = document.getElementById('exportConfig');
  if (exportBtn) {
    exportBtn.addEventListener('click', exportConfig);
  }

  const importBtn = document.getElementById('importConfig');
  if (importBtn) {
    const fileInput = document.createElement('input');
    fileInput.type = 'file';
    fileInput.accept = 'application/json';
    fileInput.style.display = 'none';
    document.body.appendChild(fileInput);
    importBtn.addEventListener('click', () => fileInput.click());
    fileInput.addEventListener('change', async () => {
      const file = fileInput.files[0];
      if (file) {
        const cfg = await importConfig(file);
        applyConfig(cfg);
      }
      fileInput.value = '';
    });
  }

  const form = document.getElementById('uploadForm');
  const responseArea = document.getElementById('response');
  const submitBtn = form.querySelector('button[type="submit"]');

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const file = document.getElementById('pdfFile').files[0];
    const generateAudio = document.getElementById('generateAudio').checked;
    const voiceID = document.getElementById('voiceID').value;

    submitBtn.disabled = true;
    const spinner = document.createElement('span');
    spinner.className = 'spinner-border spinner-border-sm ms-2';
    submitBtn.appendChild(spinner);

    const result = await submitPdf({ file, generateAudio, voiceID });
    responseArea.value = JSON.stringify(result, null, 2);

    spinner.remove();
    submitBtn.disabled = false;
  });
});
