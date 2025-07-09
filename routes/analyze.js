const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const rateLimit = require('express-rate-limit');

const { parseFileToText } = require('../utils/parser');
const { analyzeWithOpenAI } = require('../services/openai');

const analyzeLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minut
    max: 6, // maks. 10 analiz
    message: {
        success: false,
        message: 'Zbyt wiele analiz z tego adresu IP. Spróbuj ponownie później.',
    },
});

const upload = multer({
    dest: 'uploads/',
    limits: { fileSize: 2 * 1024 * 1024 }, // 2 MB limit
});

// POST /api/analyze
router.post(
    '/',
    analyzeLimiter,
    (req, res, next) => {
        upload.single('cv')(req, res, (err) => {
            if (err) {
                if (err.code === 'LIMIT_FILE_SIZE') {
                    return res.status(413).json({
                        success: false,
                        message: 'Plik jest zbyt duży. Maksymalny rozmiar to 2 MB.',
                    });
                }
                return res.status(500).json({
                    success: false,
                    message: 'Błąd przy przesyłaniu pliku.',
                });
            }
            next();
        });
    },
    async (req, res) => {
        try {
            const jobText = req.body.jobText;
            const filePath = req.file.path;

            const cvText = await parseFileToText(filePath, req.file.mimetype);

            fs.unlink(filePath, () => {}); // usuń plik tymczasowy

            const result = await analyzeWithOpenAI(cvText, jobText);

            res.json({
                success: true,
                percent: result.percent,
                classification: result.classification,
                result: result.raw,
            });
        } catch (err) {
            console.error('Error analyzing CV:', err);
            res.status(500).json({ success: false, message: 'Server error', error: err.message });
        }
    }
);

module.exports = router;
