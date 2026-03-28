import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import authRoutes from './routes/auth.routes';
import tasksRoutes from './routes/tasks.routes';

dotenv.config();

const app = express();

app.use(cors());
app.use(express.json());

app.use('/api/auth', authRoutes);
app.use('/api/tasks', tasksRoutes);

const PORT = process.env.PORT || 3000;

export { app };

export default app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
}); 