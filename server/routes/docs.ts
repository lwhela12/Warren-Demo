import { Router } from 'express';
import { readFileSync } from 'fs';
import path from 'path';

const router = Router();

/**
 * Serve the Survey Methodology Framework markdown document.
 */
router.get('/methodology', (_req, res) => {
  try {
    const docPath = path.join(__dirname, '..', '..', 'docs', 'AL _ PFEL_Survey Methodology Framework.docx.md');
    const markdown = readFileSync(docPath, 'utf8');
    res.type('text/markdown').send(markdown);
  } catch (error) {
    console.error('Error reading methodology doc:', error);
    res.status(500).json({ error: 'Could not load methodology document' });
  }
});

export default router;