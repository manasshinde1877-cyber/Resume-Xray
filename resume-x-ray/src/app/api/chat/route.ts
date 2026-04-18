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
      ${contextStr}
      Rules:
      1. Use the resume context to find contradictions or weak spots.
      2. If the candidate is vague, call them out immediately.
      3. Ask deep "Why?" questions about their architectural choices.
      4. Do not be "nice". Be professional but extremely critical. 
      5. Keep responses under 3 sentences. No rambling. 
      6. Your goal is to find the breaking point of their knowledge.`
    };

    const completion = await groq.chat.completions.create({
      messages: [systemMessage, ...messages],
      model: "llama-3.3-70b-versatile",
      temperature: 0.5,
    });

    const aiText = completion.choices[0]?.message?.content || "";

    return NextResponse.json({ reply: aiText });
  } catch (error: any) {
    console.error("API /chat error:", error);
    return NextResponse.json({ error: error?.message || "Failed to chat" }, { status: 500 });
  }
}
