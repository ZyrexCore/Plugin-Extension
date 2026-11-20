(() => {
  const $ = id => document.getElementById(id);
  const unicodeInput = $('unicodeInput');
  const asciiInput = $('asciiInput');
  const unicodeOutput = $('unicodeOutput');
  const asciiOutput = $('asciiOutput');
  const toast = $('toast');
  const status = $('keyboardStatus');
  let mode = 'u2a';
  let toastTimer;
  let keyboard = null;

  function notify(message) {
    toast.textContent = message;
    toast.classList.add('show');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => toast.classList.remove('show'), 2200);
  }
  function setMode(next) {
    mode = next;
    document.querySelectorAll('[data-mode]').forEach(b => b.classList.toggle('active', b.dataset.mode === mode));
    $('unicodePanel').classList.toggle('hidden', mode === 'a2u');
    $('asciiPanel').classList.toggle('hidden', mode === 'u2a');
    $('directionTitle').textContent = mode === 'u2a' ? 'Unicode Kannada → Nudi ASCII' : 'Nudi ASCII → Unicode Kannada';
    $('directionHelp').textContent = mode === 'u2a'
      ? 'Paste or type Unicode Kannada. Convert it into legacy Nudi text for compatible Nudi fonts.'
      : 'Paste legacy Nudi text copied from an older document. Convert it into readable Unicode Kannada.';
    $('convertBtn').textContent = mode === 'u2a' ? 'Convert to Nudi ASCII' : 'Convert to Unicode';
    $('copyResult').textContent = mode === 'u2a' ? 'Copy Nudi ASCII' : 'Copy Unicode';
  }
  function convertNow() {
    try {
      if (mode === 'u2a') {
        const input = unicodeInput.value;
        asciiOutput.value = input ? unicodeToASCII(input, 'nudi') : '';
        asciiOutput.classList.remove('hidden');
        unicodeOutput.classList.add('hidden');
        $('resultCount').textContent = asciiOutput.value.length + ' characters';
        $('resultLabel').textContent = 'NUDI LEGACY TEXT';
      } else {
        const input = asciiInput.value;
        unicodeOutput.value = input ? asciiToUnicode(input, false, 'nudi') : '';
        unicodeOutput.classList.remove('hidden');
        asciiOutput.classList.add('hidden');
        $('resultCount').textContent = unicodeOutput.value.length + ' characters';
        $('resultLabel').textContent = 'UNICODE KANNADA';
      }
      $('resultPanel').classList.remove('hidden');
    } catch (e) {
      console.error(e);
      notify('Conversion failed: ' + e.message);
    }
  }
  async function copyResult() {
    const value = mode === 'u2a' ? asciiOutput.value : unicodeOutput.value;
    if (!value) return notify('Nothing to copy yet');
    try { await navigator.clipboard.writeText(value); notify('Copied to clipboard'); }
    catch { notify('Clipboard access was blocked by the browser'); }
  }
  function downloadResult() {
    const value = mode === 'u2a' ? asciiOutput.value : unicodeOutput.value;
    if (!value) return notify('Nothing to download yet');
    const blob = new Blob([value], {type:'text/plain;charset=utf-8'});
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = mode === 'u2a' ? 'nudi-ascii.txt' : 'kannada-unicode.txt';
    a.click(); URL.revokeObjectURL(url);
  }
  $('convertBtn').addEventListener('click', convertNow);
  $('copyResult').addEventListener('click', copyResult);
  $('downloadResult').addEventListener('click', downloadResult);
  document.querySelectorAll('[data-mode]').forEach(b => b.addEventListener('click', () => setMode(b.dataset.mode)));
  $('clearBtn').addEventListener('click', () => {
    unicodeInput.value = ''; asciiInput.value = ''; unicodeOutput.value = ''; asciiOutput.value = '';
    $('resultPanel').classList.add('hidden'); $('unicodeCount').textContent = '0 characters'; $('asciiCount').textContent = '0 characters';
    notify('Editor cleared');
  });
  $('swapBtn').addEventListener('click', () => {
    const u = unicodeOutput.value || unicodeInput.value;
    const a = asciiOutput.value || asciiInput.value;
    unicodeInput.value = u; asciiInput.value = a;
    setMode(mode === 'u2a' ? 'a2u' : 'u2a');
    notify('Conversion direction switched');
  });
  $('themeBtn').addEventListener('click', () => document.body.classList.toggle('light'));
  unicodeInput.addEventListener('input', () => $('unicodeCount').textContent = unicodeInput.value.length + ' characters');
  asciiInput.addEventListener('input', () => $('asciiCount').textContent = asciiInput.value.length + ' characters');
  $('sampleBtn').addEventListener('click', () => {
    if (mode === 'u2a') unicodeInput.value = 'ವ್ಯಾಸರಿಗೆ ತಮ್ಮ ಶಕ್ತಿಯ ಅರಿವಿದ್ದರೂ ಗಣಪತಿಯ ವೇಗಕ್ಕೆ ಕಥೆ ಹೇಳಲು…';
    else asciiInput.value = 'ªÁå¸ÀjUÉ vÀªÀÄä ±ÀQÛAiÀÄ Cj«zÀÝgÀÆ UÀt¥ÀwAiÀÄ…';
    convertNow();
  });
  $('fileInput').addEventListener('change', async e => {
    const file = e.target.files[0]; if (!file) return;
    const text = await file.text();
    (mode === 'u2a' ? unicodeInput : asciiInput).value = text;
    convertNow(); e.target.value = '';
  });
  $('uploadBtn').addEventListener('click', () => $('fileInput').click());

  NudiKeyboard.init(unicodeInput, message => {
    status.textContent = message;
    status.classList.toggle('offline', message === 'ENGLISH ON');
  }).then(instance => {
    keyboard = instance;
    status.textContent = 'NUDI KEYBOARD READY · F9 TOGGLE';
  }).catch(error => {
    console.error(error);
    status.textContent = 'KEYBOARD UNAVAILABLE';
    status.classList.add('offline');
  });
  setMode('u2a');
})();