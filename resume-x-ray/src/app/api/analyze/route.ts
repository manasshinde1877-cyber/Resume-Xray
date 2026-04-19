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

    const promptMessages = [
      {
        role: "system",
        content: `You are an elite AI Recruiter and Deep Semantic Engine for 'ResumeX-Ray'.\n${requirementContext}\nInput: Text extracted from a resume.\nTask: Parse this text into a strict JSON object with the following schema:\n{\n  "power_score": number, // 1-100\n  "plain_english_summary": string, // Simple summary\n  "ats_report": {\n    "matched_keywords": string[], // Top 5 relevant keywords found\n    "missing_keywords": string[], // Top 5 missing critical keywords for the inferred role\n  },\n  "human_report": {\n    "high_impact_points": string[], // Impactful phrases found\n    "red_flags": string[], // Anything that might worry a human (gaps, vague terms, or failures to meet the PERSONAL requirements)\n  },\n  "prescription": string[], // 3-5 very specific, simple action items to fix the resume\n  "pii_entities": string[]\n}\n\nRules:\n- Respond ONLY with the raw JSON object.\n- NO FANCY WORDS. Use language a student understands.\n- Be brutally honest.`
      },
      {
        role: "user",
        content: text
      }
    ];

    let aiRes = "{}";
    try {
      const completion = await groq.chat.completions.create({
        messages: promptMessages as any,
        model: "llama-3.1-8b-instant",
        temperature: 0.1,
      });
      aiRes = completion.choices[0]?.message?.content || "{}";
    } catch (groqErr) {
      console.warn("Groq failed in /analyze, falling back to Mistral:", groqErr);
      const mistralReq = await fetch("https://api.mistral.ai/v1/chat/completions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${process.env.MISTRAL_API_KEY}`
        },
        body: JSON.stringify({
          model: "mistral-small-latest",
          messages: promptMessages,
          temperature: 0.1
        })
      });
      const mistralData = await mistralReq.json();
      if (!mistralReq.ok) throw new Error(mistralData.message || "Mistral fallback failed");
      aiRes = mistralData.choices?.[0]?.message?.content || "{}";
    }
    
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
