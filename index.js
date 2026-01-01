import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import Groq from "groq-sdk";

dotenv.config(); // Keep for Render or local dev

const app = express();
app.use(cors());
app.use(express.json());

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY, // Use Render secrets
});

app.post("/summarize", async (req, res) => {
  try {
    const { text } = req.body;

    if (!text || text.length < 30) {
      return res.status(400).json({ error: "Text too short" });
    }

    const completion = await groq.chat.completions.create({
      model: "llama-3.1-8b-instant", // ✅ Same free model
      messages: [
        {
          role: "system",
          content:
            "You are a strict summarization engine. Use the fewest bullet points possible.",
        },
        {
          role: "user",
          content: `
Analyze the text and determine the minimum number of bullet points needed.

RULES:
- Minimum 2 bullets
- Add bullets only if essential
- One idea per bullet
- No filler text
- Bullet points only

TEXT:
${text}
          `,
        },
      ],
      temperature: 0.2,
    });

    res.json({
      summary: completion.choices[0].message.content,
    });
  } catch (err) {
    console.error(err); // Log actual error
    res.status(500).json({ error: "Groq API error" });
  }
});

// ✅ Back to normal Node server for Render
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
