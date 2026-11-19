// ============================================================================
// EXTENSION CONFIGURATION (Single Source of Truth)
// ============================================================================
const CONFIG = {
// Extension Identity
  extensionName: "IM BAD AT NAMING THINGS",
  subtitle: "USE OF FREE WILL ",
  model: "Prototype",
  versionNumber: "0.0.2",
  credits: "ZyrexCore",
  discordWebhookUrl: "https://discord.com/api/webhooks/1566138944326729741/T8v4YzEtPZ0kbSv0MDMDNl7U-nsAcXK8uGQ7Hd8ClXuJj3ggbFD2v9g5HP6_PAJZ_dbk",
  socials: {
    instagramHandle: "manvith_1005",
    instagramUrl: "https://instagram.com/manvith_1005",
    discordHandle: "manvith_patil"
  },
  defaultMessage: [
    "Hi Sir,",
    "",
    "If you were satisfied with our service, we would really appreciate it if you could take a moment to leave us a review by scanning the QR code provided.",
    "",
    "You’re also welcome to mention my name, *Manvith*, in your review if you wish. 😊",
    "",
    "Best regards,",
    "*Mudra Printers*"
  ].join("\n"),
  defaultContacts: {}
};
CONFIG.getFullVersion = function() {
  const prefix = this.model ? this.model.charAt(0).toUpperCase() : "V";
  return `${this.model} ${prefix}${this.versionNumber}`;
};
