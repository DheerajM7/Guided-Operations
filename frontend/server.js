// server.js (Node.js with Express)

import express from 'express'; // Use ES module syntax for express
import fetch from 'node-fetch'; // Use ES module syntax for fetch
import cors from 'cors'; // Use ES module syntax for cors
import dotenv from 'dotenv'; // Import dotenv to load environment variables

dotenv.config(); // Load environment variables from .env file

const app = express();
app.use(cors({
  origin: 'http://localhost:3000', // Allow only your front-end to access the API
}));
app.use(express.json());

app.post('/api/claude', async (req, res) => {
  try {
    const response = await fetch('https://api.anthropic.com/v1/complete', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': process.env.CLAUDE_API_KEY, // Ensure your API key is set in .env
      },
      body: JSON.stringify(req.body),
    });

    if (!response.ok) {
      // Check if the response is not OK (status code not in the range 200-299)
      const errorData = await response.json();
      console.error('Error from external API:', errorData); // Log error from external API
      return res.status(response.status).json({ error: errorData });
    }

    const data = await response.json();
    res.json(data);
  } catch (error) {
    console.error('Error fetching AI response:', error); // Log the error
    res.status(500).json({ error: 'Error fetching AI response' });
  }
});

const PORT = process.env.PORT || 5000; // Use environment variable or default to 5000
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
