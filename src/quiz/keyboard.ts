export type QuizPhase = "setup" | "ask" | "reveal" | "done";

export type KeyAction = { type: "answer"; index: number } | { type: "next" } | { type: "ignore" };

export function actionForKey(phase: QuizPhase, key: string): KeyAction {
  if (phase === "ask" && (key === "1" || key === "2" || key === "3" || key === "4")) {
    return { type: "answer", index: Number(key) - 1 };
  }
  if (phase === "reveal" && key === "Enter") return { type: "next" };
  return { type: "ignore" };
}
