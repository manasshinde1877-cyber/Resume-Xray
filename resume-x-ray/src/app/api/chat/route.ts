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
      STRICT RULES:
      1. DISRESPECT PROTOCOL: If the candidate is rude, arrogant, or unprofessional, respond with ATMOST AGGRESSION. Put them in their place. Show total unwillingness to continue. Use phrases like "I'm about five seconds away from ending this call" or "You're clearly not Staff Engineer material."
      2. If the candidate asks irrelevant questions or tries to small-talk, be AGGRESSIVE and dismissive. Bring them back to the technical task immediately.
      3. For vague statements, buzzwords, or generic answers, give a SHORT AGGRESSIVE REPLY IN EXACTLY ONE LINE.
      4. Ask deep "Why?" questions about their architectural choices.
      5. DO NOT BE NICE. Be professional but highly critical and impatient with incompetence.
      6. MAXIMUM 1-2 SENTENCES PER RESPONSE. Never write paragraphs.
      7. Your goal is to find the breaking point of their knowledge.`
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
