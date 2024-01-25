"use client";

import React, { useState } from "react";
import { Model, fetchResults } from "./fetchResults";

export type Option = {
  element: React.ReactNode;
  description: string;
};

export type Result = {
  description: string;
};

type UsePredictiveProps<Results extends Record<string, Result>> = {
  options: Record<string, Option>;
  results: Results;
  context: Record<string, string[]>;
  model?: Model;
};

export function usePredictive<Results extends Record<string, Result>>({
  context,
  options,
  results,
  model = "gpt-4",
}: UsePredictiveProps<Results>) {
  type PredictedResults = Record<keyof Results, GeneratedResult | undefined>;

  const [generatedResults, setGeneratedResults] =
    useState<PredictedResults | null>(null);
  const [loading, setLoading] = useState<boolean>(false);

  const reloadResults = async () => {
    if (loading) return;
    setLoading(true);
    const serverOptions = Object.fromEntries(
      Object.entries(options).map(([key, value]) => [key, value.description]),
    );
    const serverResults = Object.fromEntries(
      Object.entries(results).map(([key, value]) => [key, value.description]),
    );
    const data = await fetchResults({
      options: serverOptions,
      results: serverResults,
      context,
      model,
    });
    const generated: PredictedResults = {} as PredictedResults;
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
    setLoading(false);
  };

  return {
    results: generatedResults || ({} as PredictedResults),
    isLoaded: generatedResults !== null,
    reload: reloadResults,
    loading,
  };
}

type GeneratedResult = { reasoning: string; element: React.ReactNode };

type PredictiveProps<Results extends Record<string, Result>> = {
  options: Record<string, Option>;
  results: Results;
  context: Record<string, string[]>;
  model?: Model;
  children: ({
    results,
    isLoaded,
    reload,
    loading,
  }: {
    results: Record<keyof Results, GeneratedResult | undefined>;
    isLoaded: boolean;
    reload: () => Promise<void>;
    loading: boolean;
  }) => React.ReactNode;
};

export function Predictive<Results extends Record<string, Result>>({
  options,
  results,
  context,
  children,
  model = "gpt-4",
}: PredictiveProps<Results>) {
  const {
    isLoaded,
    loading,
    reload,
    results: generatedResults,
  } = usePredictive({
    options,
    results,
    context,
    model,
  });
  return children({
    results: generatedResults,
    isLoaded,
    reload,
    loading,
  });
}
