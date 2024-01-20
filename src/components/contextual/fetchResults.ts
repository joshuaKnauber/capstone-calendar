"use server";

import { api } from "@/utils/api";
import OpenAI from "openai";
import { ChatCompletion } from "openai/resources/index.mjs";

const openai = new OpenAI();

export type FetchedResult =
  | {
      identifier: string;
      reasoning: string;
    }
  | undefined;

export type Model =
  | "gpt-4"
  | "gpt-3.5-turbo"
  | "mistralai/Mixtral-8x7B-Instruct-v0.1"
  | "Open-Orca/Mistral-7B-OpenOrca";

export async function fetchResults({
  options,
  results,
  goal,
  context,
  model,
}: {
  options: Record<string, string>;
  results: Record<string, string>;
  goal: string;
  context: Record<string, string[]>;
  model: Model;
}) {
  const contextString = Object.entries(context)
    .map(([key, value]) => `${key}:\n${value.map((v) => `- ${v}`).join("\n")}`)
    .join("\n\n");

  const elementDescriptions = Object.entries(results)
    .map(([key, value]) => `[${key}] -> ${value}`)
    .join("\n");

  const optionDescriptions = Object.entries(options)
    .map(([key, value]) => `[${key}] -> ${value}`)
    .join("\n");

  const formatString = Object.entries(results)
    .map(
      ([key, result]) =>
        `[${key}] [element] (Tell the user why you chose this element, direct this at the user)`,
    )
    .join("\n");

  const systemInstructions = `
You are selecting user interface elements for a context aware interface.
Take the provided context into account and select the elements that are best suited to this specific situation.

Do not make up any information about the user, only use the provided context. If no element is clearly needed choose 'none' as the element.
  `.trim();

  const userPrompt = `
This is the context you are working with:
${contextString}

---

This is the specific goal you are working towards for this interface:
${goal}

These are the interface elements you are populating:
${elementDescriptions}

These are the options you have for each element:
[NULL] -> Shows no element. Use this if you think no element is needed.
${optionDescriptions}

---

Answer in the following format and only in this format:
1) Lay out the current situation
2) Lay out upcoming events taking into account the current time and situation
3) Consider if it might be better to show no elements at all based on what you know
${formatString}
`.trim();

  let text = "";
  if (model === "gpt-4" || model === "gpt-3.5-turbo") {
    const completion = await openai.chat.completions.create({
      messages: [
        {
          role: "system",
          content: systemInstructions,
        },
        {
          role: "user",
          content: userPrompt,
        },
      ],
      model: model,
      seed: 1,
      temperature: 0.3,
    });
    text = completion.choices[0].message.content || "";
  } else {
    const res = await api("https://api.together.xyz/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${process.env.TOGETHER_API_KEY}`,
      },
      body: JSON.stringify({
        model: model,
        max_tokens: 1024,
        messages: [
          {
            role: "system",
            content: systemInstructions,
          },
          {
            role: "user",
            content: systemInstructions + "\n\n" + userPrompt,
          },
        ],
      }),
    });
    const completion = (await res.json()) as ChatCompletion;
    text = completion.choices[0].message.content || "";
  }
  const lines = text.split("\n");
  console.log(text);

  // TODO generics to ensure type safety of results
  const fetchedResults: Record<string, FetchedResult> = Object.keys(
    results,
  ).reduce(
    (acc, result_identifier) => {
      const line = lines.find((line) => line.startsWith(result_identifier));
      if (!line) return acc;
      const option = Object.keys(options).find((o) => line.includes(o));
      if (!option) return acc;
      const reasoningExp = line.match(/\(([^)]+)\)/);
      const reasoning = reasoningExp ? reasoningExp[1] : "";
      if (!reasoning) return acc;
      return {
        ...acc,
        [result_identifier]: {
          identifier: option,
          reasoning,
        },
      };
    },
    {} as Record<string, FetchedResult>,
  );

  return fetchedResults;
}
