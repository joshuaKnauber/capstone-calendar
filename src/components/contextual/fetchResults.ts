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
  | "Open-Orca/Mistral-7B-OpenOrca"
  | "NousResearch/Nous-Hermes-Llama2-70b";

export async function fetchResults({
  options,
  results,
  context,
  model,
}: {
  options: Record<string, string>;
  results: Record<string, string>;
  context: Record<string, string[]>;
  model: Model;
}) {
  const contextString = Object.entries(context)
    .map(
      ([key, value]) =>
        `${key}:\n${
          value.length ? value.map((v) => `- ${v}`).join("\n") : "-"
        }`,
    )
    .join("\n\n");
  console.log(contextString);

  const optionDescriptions = Object.entries(options)
    .map(([key, value]) => `[${key}] -> ${value}`)
    .join("\n");

  const elementDescriptions = Object.entries(results)
    .map(([key, value]) => `[${key}] -> ${value}`)
    .join("\n");

  const formatString = Object.entries(results)
    .map(
      ([key, result]) =>
        `[${key}] - ["Provide reasoning, directed at the user, for your choice"] - [SELECTED_OPTION]`,
    )
    .join("\n");

  const systemInstructions = `
You are selecting and populating user interface elements. Use the context information to select elements that are best suited by understanding the users intent.
DO NOT show elements if they aren't immediately necessary for the current time and situation, only show elements that are required immediately.
  `.trim();

  const userPrompt = `
${contextString}

---

Options:
${optionDescriptions}

---

Interface Elements:
[NULL] -> Shows no element. Use this as your default choice if no element is a perfect fit for the given context
${elementDescriptions}

---

Only answer in the following format:
${formatString}
`.trim();

  let text = "";
  if (model.startsWith("gpt")) {
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
      // seed: 1,
      temperature: 0.2,
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

  const fetchedResults: Record<string, FetchedResult> = Object.keys(
    results,
  ).reduce(
    (acc, result_identifier) => {
      const line = lines.find((line) =>
        line.startsWith(`[${result_identifier}]`),
      );
      if (!line) return acc;
      const option = Object.keys(options).find((o) =>
        line.split(" - ")[2].includes(o),
      );
      if (!option) return acc;
      const reasoning = line.split('["')[1].split('"]')[0];
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
  console.log(text);
  console.log(fetchedResults);

  return fetchedResults;
}
