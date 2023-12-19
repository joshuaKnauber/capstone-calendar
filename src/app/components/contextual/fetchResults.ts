"use server";

import OpenAI from "openai";

const openai = new OpenAI();

export type FetchedResult =
  | {
      identifier: string;
      reasoning: string;
    }
  | undefined;

export async function fetchResults({
  options,
  results,
  goal,
  context,
}: {
  options: Record<string, string>;
  results: Record<string, string>;
  goal: string;
  context: Record<string, string[]>;
}) {
  const contextString = Object.entries(context)
    .map(([key, value]) => `${key}:\n${value.map((v) => `- ${v}`).join("\n")}`)
    .join("\n\n");

  const elementDescriptions = Object.entries(results)
    .map(([key, value]) => `${key}: ${value}`)
    .join("\n");

  const optionDescriptions = Object.entries(options)
    .map(([key, value]) => `${key}: ${value}`)
    .join("\n");

  const formatString = Object.entries(results)
    .map(
      ([key, result]) =>
        `${key}: element_xyz / none (Short reasoning for selecting this directed at the user)`,
    )
    .join("\n");

  const systemInstructions = `
You are selecting user interface elements for a context aware interface.
Take the provided context into account and select the elements that are most useful to the user and adhere to the provided guidelines exactly.

Do not make up any information about the user, only use the provided context. If the users preferences are unclear choose no element.
  `.trim();

  const userPrompt = `
This is the context you are working with:
${contextString}

---

This is the goal you are working towards for this interface:
${goal}

These are the interface elements you are populating:
${elementDescriptions}

These are the options you have for each element:
none: This should be the preferred option if there is no clear choice. Don't be afraid to use it.
${optionDescriptions}

Answer in the following format and only in this format:
Thoughts: Reason about what the user is currently doing and what they will want to do next. Consider what elements are genuinely useful and align with the given goal.
${formatString}
`.trim();

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
    model: "gpt-4",
    seed: 1,
    temperature: 0.3,
  });

  const text = completion.choices[0].message.content || "";
  const lines = text.split("\n");

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
