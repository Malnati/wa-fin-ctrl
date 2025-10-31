// footer-dynamic.js
// Atualiza o rodapé dinamicamente com base nos campos do formulário de configurações

document.addEventListener('DOMContentLoaded', function () {
  // Sanitize URLs to prevent use of dangerous protocols (e.g. javascript:)
  function sanitizeUrl(url, type) {
    try {
      const parsed = new URL(url, window.location.origin);
      if (['http:', 'https:'].includes(parsed.protocol)) {
        // For known social profiles, allow only official domains.
        if (type === 'google') {
          // Allow Google profiles only: plus.google.com or google.com/profiles
          if (
            parsed.hostname === 'plus.google.com' ||
            parsed.hostname === 'profiles.google.com' ||
            (parsed.hostname === 'www.google.com' &&
              parsed.pathname.startsWith('/profiles/'))
          ) {
            return parsed.href;
          }
          // Add any other trusted Google profile hostnames as needed
          return '#';
        }
        // For other social links, optionally restrict to known hostnames
        // e.g. facebook.com, twitter.com, etc. (not implemented here)
        return parsed.href;
      }
    } catch (e) {
      // Invalid URL, fallback below
    }
    if (typeof url === 'string' && url.startsWith('mailto:')) {
      // Allow only basic email address, no extra query/params
      const emailPart = url.slice(7); // Remove 'mailto:'
      if (/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(emailPart)) {
        return url.slice(0, 7 + emailPart.length); // remove any additional ?body= etc.
      }
    }
    return '#';
  }

  function updateFooter() {
    const companyName =
      document.getElementById('inputCompanyName')?.value || '';
    const title = document.getElementById('inputTitle')?.value || '';
    const developedBy =
      document.getElementById('inputDevelopedBy')?.value || '';
    const copyrightHolder =
      document.getElementById('inputCopyrightHolder')?.value || '';
    const registrationDate =
      document.getElementById('inputRegistrationDate')?.value || '';
    const contactEmail =
      document.getElementById('inputContactEmail')?.value || '';
    const linkFacebook =
      document.getElementById('inputLinkFacebook')?.value || '#';
    const linkTwitter =
      document.getElementById('inputLinkTwitter')?.value || '#';
    const linkGoogle = document.getElementById('inputLinkGoogle')?.value || '#';
    const linkInstagram =
      document.getElementById('inputLinkInstagram')?.value || '#';
    const linkLinkedin =
      document.getElementById('inputLinkLinkedin')?.value || '#';
    const linkGithub = document.getElementById('inputLinkGithub')?.value || '#';
    const currentYear = new Date().getFullYear();

    document.getElementById('footerCompanyName').textContent = companyName;
    document.getElementById('footerTitle').textContent = title;
    document.getElementById('footerDevelopedBy').textContent = developedBy;
    document.getElementById('footerCopyright').textContent =
      `© ${currentYear} ${copyrightHolder}`;
    document.getElementById('footerRegistrationDate').textContent =
      registrationDate;
    document.getElementById('footerContactEmail').textContent = contactEmail;
    document.getElementById('footerFacebook').href = sanitizeUrl(linkFacebook);
    document.getElementById('footerTwitter').href = sanitizeUrl(linkTwitter);
    document.getElementById('footerGoogle').href = sanitizeUrl(
      linkGoogle,
      'google',
    );
    document.getElementById('footerInstagram').href =
      sanitizeUrl(linkInstagram);
    document.getElementById('footerLinkedin').href = sanitizeUrl(linkLinkedin);
    document.getElementById('footerGithub').href = sanitizeUrl(linkGithub);
  }

  // IDs dos campos do formulário de configurações
  const inputIds = [
    'inputCompanyName',
    'inputTitle',
    'inputDevelopedBy',
    'inputCopyrightHolder',
    'inputRegistrationDate',
    'inputContactEmail',
    'inputLinkFacebook',
    'inputLinkTwitter',
    'inputLinkGoogle',
    'inputLinkInstagram',
    'inputLinkLinkedin',
    'inputLinkGithub',
  ];

  inputIds.forEach(function (id) {
    const input = document.getElementById(id);
    if (input) {
      input.addEventListener('input', updateFooter);
    }
  });

  // Atualiza o rodapé na inicialização
  updateFooter();
});
