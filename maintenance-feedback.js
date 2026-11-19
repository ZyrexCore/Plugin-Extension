// Maintenance feedback form. Kept in an external file because Manifest V3
// extension pages block inline JavaScript.
(() => {
  const openBtn = document.getElementById('openMaintenanceFeedback');
  const form = document.getElementById('maintenanceFeedbackForm');
  const input = document.getElementById('maintenanceFeedbackText');
  const submit = document.getElementById('sendMaintenanceFeedback');
  const status = document.getElementById('maintenanceFeedbackStatus');
  if (!openBtn || !form || !input || !submit || !status) return;
  openBtn.addEventListener('click', () => {
    form.classList.toggle('open');
    if (form.classList.contains('open')) input.focus();
  });
  form.addEventListener('submit', async (event) => {
    event.preventDefault();
    const message = input.value.trim();
    if (!message) { status.textContent = 'Please enter a problem or feedback.'; return; }
    const webhook = (typeof CONFIG !== 'undefined' && CONFIG.discordWebhookUrl) ? CONFIG.discordWebhookUrl : '';
    if (!webhook) { status.textContent = 'Reporting is unavailable right now.'; return; }
    submit.disabled = true;
    submit.textContent = 'Sending...';
    status.textContent = '';
    try {
      const response = await fetch(webhook + (webhook.includes('?') ? '&' : '?') + 'wait=true', {
        method: 'POST',
        headers: {'Content-Type':'application/json'},
        body: JSON.stringify({content:'**Mudra Mod — Feedback / Problem Report**\n' + message})
      });
      if (!response.ok) {
        const detail = await response.text().catch(() => '');
        throw new Error('Discord webhook returned ' + response.status + (detail ? ': ' + detail : ''));
      }
      input.value = '';
      status.textContent = 'Report sent. Thank you!';
    } catch (error) {
      console.error('[Mudra Mod feedback]', error);
      status.textContent = 'Could not send. Check connection and try again.';
    } finally {
      submit.disabled = false;
      submit.textContent = 'Send report';
    }
  });
})();
