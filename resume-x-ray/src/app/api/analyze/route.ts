import { NextRequest, NextResponse } from "next/server";
import Groq from "groq-sdk";

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY,
});

export async function POST(req: NextRequest) {
  try {
    const { text, recruiterRequirements } = await req.json();

    if (!text) {
      return NextResponse.json({ error: "Missing text in request" }, { status: 400 });
    }

    const requirementContext = recruiterRequirements 
      ? `PERSONAL RECRUITER REQUIREMENTS: "${recruiterRequirements}". Analyze the resume SPECIFICALLY with these requirements in mind. Highlight how they meet or fail these requirements in the human_report.`
      : "";

    const completion = await groq.chat.completions.create({
      messages: [
        {
          role: "system",
          content: `You are an elite AI Recruiter and Deep Semantic Engine for 'ResumeX-Ray'.
${requirementContext}
Input: Text extracted from a resume.
Task: Parse this text into a strict JSON object with the following schema:
{
  "power_score": number, // 1-100
  "plain_english_summary": string, // Simple summary
  "ats_report": {
    "matched_keywords": string[], // Top 5 relevant keywords found
    "missing_keywords": string[], // Top 5 missing critical keywords for the inferred role
  },
  "human_report": {
    "high_impact_points": string[], // Impactful phrases found
    "red_flags": string[], // Anything that might worry a human (gaps, vague terms, or failures to meet the PERSONAL requirements)
  },
  "prescription": string[], // 3-5 very specific, simple action items to fix the resume
  "pii_entities": string[]
}

Rules:
- Respond ONLY with the raw JSON object.
- NO FANCY WORDS. Use language a student understands.
- Be brutally honest.`
        },
        {
          role: "user",
          content: text
        }
      ],
      model: "llama-3.3-70b-versatile",
      temperature: 0.1,
    });

    const aiRes = completion.choices[0]?.message?.content || "{}";
    
    // strip markdown if it accidentally generated it
    let cleanedJson = aiRes;
    if (aiRes.startsWith('```')) {
      cleanedJson = aiRes.replace(/```json/g, '').replace(/```/g, '').trim();
    }

    const parsed = JSON.parse(cleanedJson);

    return NextResponse.json({ analysis: parsed });
  } catch (error: any) {
    console.error("API /analyze error:", error);
    return NextResponse.json({ error: error?.message || "Failed to analyze" }, { status: 500 });
  }
}
