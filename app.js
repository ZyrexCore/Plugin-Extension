(() => {
  const source = document.getElementById('source');
  const ascii = document.getElementById('ascii');
  const preview = document.getElementById('preview');
  const toast = document.getElementById('toast');
  const status = document.querySelector('.live-dot');
  let toastTimer;
  let keyboard = null;

  function encode() {
    const value = keyboard ? keyboard.getCommittedText() : source.value;
    try {
      ascii.value = unicodeToASCII(value, 'nudi');
      preview.textContent = value || 'ನಿಮ್ಮ ಕನ್ನಡ ಪಠ್ಯ ಇಲ್ಲಿ ಕಾಣಿಸುತ್ತದೆ…';
      document.getElementById('inputCount').textContent = value.length + ' characters';
      document.getElementById('asciiCount').textContent = new TextEncoder().encode(ascii.value).length + ' bytes';
    } catch (error) {
      console.error(error);
      ascii.value = '';
      preview.textContent = 'Encoding error — please check the input.';
    }
  }

  function showToast(message) {
    toast.textContent = message;
    toast.classList.add('show');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => toast.classList.remove('show'), 1800);
  }
  function copy(text, label) {
    if (!text) return showToast('Nothing to copy');
    navigator.clipboard.writeText(text)
      .then(() => showToast(label + ' copied'))
      .catch(() => showToast('Clipboard permission denied'));
  }

  source.addEventListener('input', encode);
  document.getElementById('clearBtn').addEventListener('click', () => {
    source.value = '';
    encode();
    source.focus();
  });
  document.getElementById('copyAscii').addEventListener('click', () => copy(ascii.value, 'Nudi ASCII'));
  document.getElementById('copyUnicode').addEventListener('click', () => copy(source.value, 'Unicode'));
  document.getElementById('downloadAscii').addEventListener('click', () => {
    const blob = new Blob([ascii.value], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'nudi-ascii.txt';
    a.click();
    URL.revokeObjectURL(url);
  });
  document.getElementById('themeBtn').addEventListener('click', () => document.body.classList.toggle('light'));

  NudiKeyboard.init(source, message => {
    if (status) status.textContent = message;
    if (message === 'ENGLISH ON') showToast('English typing enabled · Press F9 for Kannada');
    else if (message === 'NUDI / KANNADA ON') showToast('Nudi keyboard enabled · Press F9 for English');
  }).then(instance => {
    keyboard = instance;
    encode();
    source.focus();
  }).catch(error => {
    console.error(error);
    if (status) status.textContent = 'KEYBOARD FAILED TO LOAD';
    showToast('Nudi keyboard could not load. Refresh the page.');
  });

  encode();
})();
