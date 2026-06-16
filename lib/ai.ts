import { GoogleGenerativeAI } from '@google/generative-ai';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');

// Helper to wait between API calls
function sleep(ms: number) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

export async function generateProjectDescription(repoDetails: any) {
  const prompt = `
    Analyze the following GitHub project:
    Name: ${repoDetails.name}
    Description: ${repoDetails.description}
    Topics: ${repoDetails.topics?.join(', ')}
    Languages: ${repoDetails.languages?.join(', ')}
    README: ${repoDetails.readme?.substring(0, 2000)}

    Please generate a professional project description for a portfolio.
    Return ONLY a JSON object with the following structure, no markdown formatting around it, no extra text:
    {
      "title": "A professional, clean title",
      "description": "A 2-3 sentence engaging description",
      "features": ["Feature 1", "Feature 2", "Feature 3"],
      "techStack": ["React", "Node.js", "etc"]
    }
  `;

  // 1. Try Groq (Llama 3) if API key exists
  if (process.env.GROQ_API_KEY) {
    try {
      console.log(`[Generate] Using Groq (llama-3.3-70b-versatile)...`);
      const res = await fetch("https://api.groq.com/openai/v1/chat/completions", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${process.env.GROQ_API_KEY}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          model: "llama-3.3-70b-versatile",
          messages: [{ role: "user", content: prompt }],
          temperature: 0.2
        })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error?.message || "Groq API Error");
      
      const text = data.choices[0].message.content.replace(/```json/g, '').replace(/```/g, '').trim();
      return JSON.parse(text);
    } catch (e) {
      console.error("Groq generation failed, falling back...", e);
    }
  }

  // 2. Try Gemini if API key exists
  if (process.env.GEMINI_API_KEY) {
    console.log(`[Generate] Using Gemini (gemini-1.5-flash)...`);
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
    for (let attempt = 0; attempt < 3; attempt++) {
      try {
        const result = await model.generateContent(prompt);
        const text = result.response.text().replace(/```json/g, '').replace(/```/g, '').trim();
        return JSON.parse(text);
      } catch (e: any) {
        if (e?.status === 429 && attempt < 2) {
          const waitTime = (attempt + 1) * 20000;
          console.log(`Gemini rate limited. Waiting ${waitTime / 1000}s before retry...`);
          await sleep(waitTime);
          continue;
        }
        console.error("Gemini generation failed:", e);
        break;
      }
    }
  }

  // 3. Absolute Fallback if APIs fail or keys are missing
  console.warn("No valid AI response generated, returning fallback description.");
  return {
    title: repoDetails.name,
    description: repoDetails.description || 'A new project automatically synced from GitHub.',
    features: ['Automated Deployment', 'GitHub Sync'],
    techStack: repoDetails.languages || []
  };
}
