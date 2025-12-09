import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import authRoutes from './routes/authRoutes.js';
import expenseRoutes from './routes/expenseRoutes.js';

dotenv.config();
const app = express();

app.use(cors({ origin: process.env.FRONTEND_ORIGIN || 'http://localhost:5173' }));
app.use(express.json());

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Serve frontend if built
const distPath = path.join(__dirname, '../client/dist');
if (fs.existsSync(path.join(distPath, 'index.html'))) {
	app.use(express.static(distPath));
}

app.use('/api/auth', authRoutes);
app.use('/api/expenses', expenseRoutes);

// SPA fallback
app.get('*', (req, res) => {
	if (fs.existsSync(path.join(distPath, 'index.html'))) {
		res.sendFile(path.join(distPath, 'index.html'));
	} else {
		res.status(404).json({ message: "Frontend not built" });
	}
});

const PORT = process.env.PORT || 5000;

mongoose.connect(process.env.MONGO_URI)
  .then(() => {
    app.listen(PORT, () => console.log(`🚀 Server running on ${PORT}`));
  })
  .catch(err => console.error("❌ DB Connection Error:", err));
