// public/js/method.js

export async function submitPdf({ file, generateAudio, voiceID }) {
  const formData = new FormData();
  formData.append('file', file);
  formData.append('generateAudio', generateAudio ? 'true' : 'false');
  if (voiceID) {
    formData.append('voiceID', voiceID);
  }

  const response = await fetch('/diagnostics/submit', {
    method: 'POST',
    body: formData,
  });

  let json;
  try {
    json = await response.json();
  } catch (e) {
    json = null;
  }

  return { ok: response.ok, status: response.status, json };
}
