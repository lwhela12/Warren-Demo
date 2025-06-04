import express, { Request, Response } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import authRoutes from './routes/auth';
import claudeRoutes from './routes/claude';
import surveyRoutes from './routes/survey';
import responseRoutes from './routes/response';
import docsRoutes from './routes/docs';

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

app.use('/api/auth', authRoutes);
app.use('/api/claude', claudeRoutes);
app.use('/api/survey', surveyRoutes);
app.use('/api/responses', responseRoutes);
app.use('/api/docs', docsRoutes);

app.get('/api/health', (_req: Request, res: Response) => {
  res.send('OK');
});

const port = process.env.PORT || 5001;
app.listen(port, () => {
  console.log(`Server listening on port ${port}`);
});

// Export app for testing or external usage
export { app };