import { NextRequest, NextResponse } from "next/server";
import Groq from "groq-sdk";

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY,
});

export async function POST(req: NextRequest) {
  try {
    const { imageBase64 } = await req.json();

    if (!imageBase64) {
      return NextResponse.json({ error: "Missing imageBase64 in request body" }, { status: 400 });
    }

    // Try Google Cloud Vision first if key exists
    const googleApiKey = process.env.GOOGLE_CLOUD_VISION_API_KEY;
    if (googleApiKey && !googleApiKey.startsWith("YOUR_")) {
      try {
        const visionApiUrl = `https://vision.googleapis.com/v1/images:annotate?key=${googleApiKey}`;
        const response = await fetch(visionApiUrl, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            requests: [{
              image: { content: imageBase64 },
              features: [
                { type: "DOCUMENT_TEXT_DETECTION", maxResults: 500 },
                { type: "FACE_DETECTION" }
              ],
            }],
          }),
        });

        if (response.ok) {
          const data = await response.json();
          if (data.responses?.[0]?.fullTextAnnotation) {
            return NextResponse.json({ result: data.responses[0] });
          }
        } else {
          const errData = await response.json();
          console.warn("Google Vision API failed/disabled, falling back to Groq Vision:", errData.error?.message);
        }
      } catch (err) {
        console.error("Google Vision fetch error, falling back:", err);
      }
    }

    // Fallback: Use Groq Llama 3.2 Vision (Blazing fast and robust)
    console.log("Using Groq Llama-3.2-Vision fallback...");
    const completion = await groq.chat.completions.create({
      messages: [
        {
          role: "user",
          content: [
            { type: "text", text: "Transcribe the text in this resume exactly. Maintain the structure as much as possible. Focus on capturing all experience, skills, and contact info." },
            {
              type: "image_url",
              image_url: {
                url: `data:image/jpeg;base64,${imageBase64}`,
              },
            },
          ],
        },
      ],
      model: "meta-llama/llama-4-scout-17b-16e-instruct",
    });

    const transcribedText = completion.choices[0]?.message?.content || "";

    // Mocking the Google Vision response format so the frontend doesn't need to change
    return NextResponse.json({
      result: {
        fullTextAnnotation: {
          text: transcribedText
        },
        pages: [] // Coordinates unavailable in LLM transcription, but text will be parsed by /api/analyze regardless
      }
    });

  } catch (error: any) {
    console.error("Vision Tier Failure:", error);
    return NextResponse.json({ error: error.message || "Vision systems offline" }, { status: 500 });
  }
}
