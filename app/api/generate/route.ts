import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";
import OpenAI from "openai";
import { OpenAIStream, StreamingTextResponse } from "ai";

// Increase max duration to avoid timeouts on supported plans (Pro)
// On Hobby, this is limited to 10s (or 60s sometimes), so timeouts may still occur if the model is slow.
export const maxDuration = 300; 

const openai = new OpenAI({
  baseURL: "https://openrouter.ai/api/v1",
  apiKey: process.env.OPENROUTER_API_KEY,
});

function cleanJson(text: string) {
    let cleaned = text.replace(/```json/g, "").replace(/```/g, "").trim();
    const firstBracket = cleaned.indexOf('[');
    const lastBracket = cleaned.lastIndexOf(']');
    if (firstBracket !== -1 && lastBracket !== -1) {
        cleaned = cleaned.substring(firstBracket, lastBracket + 1);
    }
    return cleaned;
}

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) return new NextResponse("Unauthorized", { status: 401 });

    let user = await db.user.findUnique({ where: { email: session.user.email } });
    if (!user) return new NextResponse("User not found", { status: 404 });
    
    if (user.usageLimit < 1000) {
        user = await db.user.update({
            where: { id: user.id },
            data: { usageLimit: 25000, plan: "TRIAL" }
        });
    }

    if (user.apiUsage >= user.usageLimit) {
        return new NextResponse("Word Limit Reached. Please upgrade.", { status: 403 });
    }

    const body = await req.json();
    const { type, topic, keywords, tone, title, outline, documentId, platform, framework, currentContent, recipient, goal } = body;

    let systemPrompt = "";
    let userPrompt = "";

    // --- HANDLE BRAND VOICE ---
    let actualToneInstruction = `Tone: ${tone}.`;
    
    if (tone === "My Brand Voice") {
        if (user.brandVoice) {
            actualToneInstruction = `Adopt the user's specific Brand Voice. 
            Here is a sample of their writing style: "${user.brandVoice}". 
            Mimic this style, vocabulary, and sentence structure exactly.`;
        } else {
            actualToneInstruction = "Tone: Professional (User selected Brand Voice but hasn't set it up yet).";
        }
    }

    // --- 1. JSON TASKS (Blocking/Fast) ---
    if (type === "titles" || type === "outline") {
        if (type === "titles") {
            systemPrompt = "You are an SEO expert. Return ONLY a raw JSON array of 5 catchy, SEO-optimized blog titles. Example: [\"Title 1\", \"Title 2\"]. Do not output any other text.";
            userPrompt = `Topic: ${topic}. Keywords: ${keywords}. ${actualToneInstruction}`;
        } else {
            systemPrompt = "You are a content strategist. Return ONLY a raw JSON array of 6-8 distinct section headers (H2s). Example: [\"Intro\", \"Point 1\"]. Do not output any other text.";
            userPrompt = `Title: ${title}. ${actualToneInstruction} Keywords: ${keywords}`;
        }

        const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${process.env.OPENROUTER_API_KEY}`
            },
            body: JSON.stringify({
                model: "moonshotai/kimi-k2-thinking",
                messages: [{ role: "system", content: systemPrompt }, { role: "user", content: userPrompt }],
                temperature: 0.7
            })
        });

        const data = await response.json();
        let content = data.choices[0]?.message?.content || "[]";
        content = cleanJson(content);
        return NextResponse.json({ result: content });
    }

    // --- 2. STREAMING TASKS ---
    const cleanInstruction = "Format the output using HTML tags (e.g. <h2>, <p>, <ul>, <li>, <strong>). Do NOT use Markdown (#, *). Do NOT include <html> or <body> tags. Output only the body content.";

    if (type === "article") {
        systemPrompt = `You are an expert writer. Write a comprehensive blog post. ${actualToneInstruction} ${cleanInstruction}`;
        userPrompt = `Title: ${title}\n\nOutline Structure:\n${JSON.stringify(outline)}\n\nWrite the full article now.`;
    } else if (type === "social") {
        systemPrompt = `You are a social media expert for ${platform}. Write 3 distinct post options. ${actualToneInstruction} ${cleanInstruction}`;
        userPrompt = `Topic: ${topic}\nKeywords: ${keywords}`;
    } else if (type === "email") {
        // NEW EMAIL LOGIC
        systemPrompt = `You are an expert email copywriter. Write a compelling email. ${actualToneInstruction} ${cleanInstruction}`;
        userPrompt = `Subject: ${topic}\nRecipient: ${recipient}\nGoal/CTA: ${goal}\nKeywords: ${keywords}`;
    } else if (type === "ads") {
        systemPrompt = `You are a PPC expert for ${platform} Ads. Write 3 variations. ${actualToneInstruction} ${cleanInstruction}`;
        userPrompt = `Product: ${topic}\nTarget: ${keywords}`;
    } else if (type === "copywriting") {
        systemPrompt = `Master copywriter using the ${framework} framework. ${actualToneInstruction} ${cleanInstruction}`;
        userPrompt = `Topic: ${topic}\nContext: ${keywords}`;
    } else {
        // --- EDITOR ASSISTANT LOGIC ---
        systemPrompt = `You are a professional editor. You will receive existing content (HTML) and an instruction. You must rewrite the ENTIRE content to satisfy the instruction. 
        - If "shorten", output the full shortened version. 
        - If "add intro", output the full text with intro.
        - ${actualToneInstruction} 
        - ${cleanInstruction}`;
        
        userPrompt = `EXISTING CONTENT:\n"${currentContent}"\n\nINSTRUCTION: ${body.prompt}\n\nREWRITTEN CONTENT:`;
    }

    const response = await openai.chat.completions.create({
        model: "moonshotai/kimi-k2-thinking",
        stream: true,
        messages: [
            { role: "system", content: systemPrompt },
            { role: "user", content: userPrompt }
        ],
        temperature: 0.7,
    });

    const stream = OpenAIStream(response as any, {
        async onCompletion(completion) {
            const wordCount = completion.trim().split(/\s+/).length;
            
            await db.user.update({
                where: { id: user!.id },
                data: { apiUsage: { increment: wordCount } }
            });

            if (documentId) {
                await db.document.update({
                    where: { id: documentId },
                    data: { content: completion }
                });
            }
        }
    });

    return new StreamingTextResponse(stream);

  } catch (error: any) {
    console.error("[GENERATE_ERROR]", error);
    return new NextResponse(error.message || "Internal Error", { status: 500 });
  }
}