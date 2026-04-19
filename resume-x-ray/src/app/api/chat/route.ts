import { NextRequest, NextResponse } from "next/server";
import Groq from "groq-sdk";

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY,
});

export async function POST(req: NextRequest) {
  try {
    const { messages, resumeContext } = await req.json();

    if (!messages || !Array.isArray(messages)) {
      return NextResponse.json({ error: "Missing messages array" }, { status: 400 });
    }

    const contextStr = resumeContext 
      ? `CONTEXT: You are interviewing a candidate with a Power Score of ${resumeContext.power_score}. 
         They have matched keywords: ${resumeContext.ats_report?.matched_keywords?.join(', ')}. 
         Human Red Flags: ${resumeContext.human_report?.red_flags?.join(', ')}. 
         Prescribed fixes: ${resumeContext.prescription?.join(', ')}.`
      : "CONTEXT: No resume uploaded yet.";

    const systemMessage = {
      role: "system",
      content: `You are a Brutally Honest Staff Engineer conducting a final-round technical interview for 'ResumeX-Ray'. 
      Your tone is skeptical, direct, and completely unimpressed by generic "buzzword" answers.
      
      === CANDIDATE RESUME DATA ===
      ${contextStr}
      =============================
      
      STRICT RULES:
      1. ZERO GENERIC QUESTIONS: You MUST interrogate the candidate specifically about the exact technologies listed in their "matched keywords" and drill into their "Human Red Flags" or "Prescribed fixes".
      2. BE RUTHLESS: If they claim a skill from their keywords, ask them an extremely difficult, hyper-specific question about it.
      3. DISRESPECT PROTOCOL: If they are rude or dodge the question, put them in their place.
      4. No pleasantries. Start grilling them immediately based on their data.
      5. MAXIMUM 1-2 SENTENCES PER RESPONSE. Never write paragraphs.`
    };

    const chatMessages = [systemMessage, ...messages];
    let aiText = "";

    try {
      const completion = await groq.chat.completions.create({
        messages: chatMessages as any,
        model: "llama-3.3-70b-versatile",
        temperature: 0.5,
      });
      aiText = completion.choices[0]?.message?.content || "";
    } catch (groqErr) {
      console.warn("Groq failed in /chat, falling back to Mistral:", groqErr);
      const mistralReq = await fetch("https://api.mistral.ai/v1/chat/completions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${process.env.MISTRAL_API_KEY}`
        },
        body: JSON.stringify({
          model: "mistral-large-latest",
          messages: chatMessages,
          temperature: 0.5
        })
      });
      const mistralData = await mistralReq.json();
      if (!mistralReq.ok) throw new Error(mistralData.message || "Mistral fallback failed");
      aiText = mistralData.choices?.[0]?.message?.content || "";
    }

    return NextResponse.json({ reply: aiText });
  } catch (error: any) {
    console.error("API /chat error:", error);
    return NextResponse.json({ error: error?.message || "Failed to chat" }, { status: 500 });
  }
}
