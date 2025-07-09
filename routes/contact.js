const express = require('express');
const router = express.Router();
const SibApiV3Sdk = require('sib-api-v3-sdk');
const rateLimit = require('express-rate-limit');

// 🔐 Konfiguracja API Brevo
const defaultClient = SibApiV3Sdk.ApiClient.instance;
const apiKey = defaultClient.authentications['api-key'];
apiKey.apiKey = process.env.BREVO_API_KEY;

// ✅ Limiter – maks. 5 wiadomości / 15 min / IP
const contactLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minut
    max: 3, // limit wiadomości
    message: {
        success: false,
        message: 'Zbyt wiele wiadomości z tego adresu IP. Spróbuj ponownie za kilkanaście minut.',
    },
});

// 🔧 Endpoint POST /contact z limiterem
router.post('/', contactLimiter, async (req, res) => {
    const { name, email, message } = req.body;

    if (!email || !message) {
        return res.status(400).json({ success: false, message: 'Brakuje wymaganych pól.' });
    }

    try {
        const apiInstance = new SibApiV3Sdk.TransactionalEmailsApi();

        await apiInstance.sendTransacEmail({
            sender: { name: 'Analiza CV Kontakt', email: 'adam.ryszkowski@gmail.com' },
            to: [{ email: 'adam.ryszkowski@hotmail.com', name: 'Adam Ryszkowski' }],
            subject: `Wiadomość z formularza kontaktowego od ${name || 'Nieznany'}`,
            textContent: `Od: ${name} (${email})\n\nTreść:\n${message}`,
        });

        res.json({ success: true, message: 'Wiadomość została wysłana.' });
    } catch (err) {
        console.error('Błąd Brevo:', err);
        res.status(500).json({ success: false, message: 'Nie udało się wysłać wiadomości.' });
    }
});

module.exports = router;
