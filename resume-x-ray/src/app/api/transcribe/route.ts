import { NextRequest, NextResponse } from "next/server";
import Groq from "groq-sdk";

const groq = new Groq({
  apiKey: process.env.GROQ_WHISPER_API_KEY || process.env.GROQ_API_KEY,
});

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get("file") as File;
    
    if (!file) {
      return NextResponse.json({ error: "Missing audio file" }, { status: 400 });
    }

    const transcription = await groq.audio.transcriptions.create({
      file,
      model: "whisper-large-v3",
      response_format: "json",
      language: "en",
      temperature: 0,
      prompt: "This is a technical career-tech interview on the ResumeX-Ray platform. Terms like React, Next.js, ATS, coding, software engineering, and industry-standard keywords may be used."
    });

    return NextResponse.json({ text: transcription.text });
  } catch (error: any) {
    console.error("API /transcribe error:", error);
    return NextResponse.json({ error: error?.message || "Failed to transcribe" }, { status: 500 });
  }
}
