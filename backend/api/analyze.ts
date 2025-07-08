import express, { Request, Response } from 'express';
import multer from 'multer';
import { analyzeWithOpenAI } from '../services/openai';

const router = express.Router();
const upload = multer({ storage: multer.memoryStorage() });

router.post('/analyze', upload.single('cv'), async (req: Request, res: Response): Promise<void> => {
    try {
        if (!req.file) {
            res.status(400).json({ error: 'Nie przesłano pliku CV.' });
            return;
        }

        const cvText = req.file.buffer.toString('utf-8');
        const jobText = req.body.jobText;

        if (!jobText) {
            res.status(400).json({ error: 'Brak treści ogłoszenia o pracę.' });
            return;
        }

        const result = await analyzeWithOpenAI(cvText, jobText);
        res.json(result);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Wewnętrzny błąd serwera' });
    }
});

export default router;
