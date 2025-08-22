import express from 'express';
import { spawn } from 'child_process';
import path from 'path';
import cors from 'cors';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'dist')));

app.post('/api/shrek', async (req, res) => {
  try {
    const { message, conversationHistory } = req.body;
    
    if (!message) {
      return res.status(400).json({
        success: false,
        error: 'Message is required'
      });
    }

    const pythonProcess = spawn('python3', ['shrek.py', message, JSON.stringify(conversationHistory || [])]);
    
    let output = '';
    let errorOutput = '';

    pythonProcess.stdout.on('data', (data) => {
      output += data.toString();
    });

    pythonProcess.stderr.on('data', (data) => {
      errorOutput += data.toString();
    });

    pythonProcess.on('close', (code) => {
      if (code !== 0) {
        console.error('Python script error:', errorOutput);
        return res.status(500).json({
          success: false,
          error: 'Python script execution failed',
          details: errorOutput
        });
      }

      try {
        const result = JSON.parse(output.trim());
        res.json(result);
      } catch (parseError) {
        console.error('Failed to parse Python output:', parseError);
        res.status(500).json({
          success: false,
          error: 'Failed to parse Python script output',
          output: output.trim()
        });
      }
    });

    pythonProcess.on('error', (error) => {
      console.error('Failed to start Python process:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to start Python process',
        details: error.message
      });
    });

  } catch (error) {
    console.error('Server error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error',
      details: error.message
    });
  }
});

if (process.env.NODE_ENV === 'production') {
  app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'dist', 'index.html'));
  });
}

app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`🌐 Open http://localhost:${PORT} in your browser`);
});
