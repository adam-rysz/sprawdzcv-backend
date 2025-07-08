const fs = require('fs');
const pdfParse = require('pdf-parse');
const mammoth = require('mammoth');

/**
 * Konwertuje plik PDF lub DOCX na tekst na podstawie typu MIME
 */
async function parseFileToText(filePath, mimetype) {
    console.log('Typ MIME pliku:', mimetype); // 🔍 debug

    if (mimetype === 'application/pdf') {
        const dataBuffer = fs.readFileSync(filePath);
        const pdfData = await pdfParse(dataBuffer);
        return pdfData.text;
    }

    if (mimetype === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document') {
        const result = await mammoth.extractRawText({ path: filePath });
        return result.value;
    }

    throw new Error(`Unsupported file type: ${mimetype}`);
}

module.exports = { parseFileToText };
