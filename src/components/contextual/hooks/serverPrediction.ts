"use server";

import OpenAI from "openai";

const openai = new OpenAI();

export async function predict({
  systemPrompt,
  userPrompt,
}: {
  systemPrompt: string;
  userPrompt: string;
}) {
  const res = await openai.chat.completions.create({
    model: "gpt-4",
    messages: [
      { role: "system", content: systemPrompt },
      { role: "user", content: userPrompt },
    ],
    temperature: 0.3,
  });
  const text = res.choices[0].message.content || "";

  return text;
}
