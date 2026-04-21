import { useState } from "react";
import type { Screen } from "../types";

export function useScreen(initial: Screen = "dashboard") {
  const [screen, setScreen] = useState<Screen>(initial);
  return { screen, setScreen };
}