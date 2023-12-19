"use client";

import React, { useEffect, useState } from "react";
import { FetchedResult, fetchResults } from "./fetchResults";

export type Option = {
  element: React.ReactNode;
  description: string;
};

export type Result = {
  description: string;
};

type GeneratedResult = { reasoning: string; element: React.ReactNode };

type ContextualProps<Results extends Record<string, Result>> = {
  options: Record<string, Option>;
  results: Results;
  goal: string;
  context: Record<string, string[]>;
  children: ({
    results,
    isLoaded,
    reload,
  }: {
    results: Record<keyof Results, GeneratedResult | undefined>;
    isLoaded: boolean;
    reload: () => Promise<void>;
  }) => React.ReactNode;
};

export function Contextual<Results extends Record<string, Result>>({
  options,
  results,
  goal,
  context,
  children,
}: ContextualProps<Results>) {
  type ContextualResults = Record<keyof Results, GeneratedResult | undefined>;

  const [generatedResults, setGeneratedResults] =
    useState<ContextualResults | null>(null);

  const reloadResults = async () => {
    const serverOptions = Object.fromEntries(
      Object.entries(options).map(([key, value]) => [key, value.description]),
    );
    const serverResults = Object.fromEntries(
      Object.entries(results).map(([key, value]) => [key, value.description]),
    );
    const data = await fetchResults({
      options: serverOptions,
      results: serverResults,
      goal,
      context,
    });
    const generated: ContextualResults = {} as ContextualResults;
    for (let key in data) {
      const result = data[key as keyof typeof data];
      const option = options[result?.identifier as keyof typeof options];
      if (result && option) {
        generated[key as keyof Results] = {
          reasoning: result.reasoning,
          element: option.element,
        };
      }
    }
    setGeneratedResults(generated);
  };

  return children({
    results: generatedResults || ({} as ContextualResults),
    isLoaded: generatedResults !== null,
    reload: reloadResults,
  });
}
