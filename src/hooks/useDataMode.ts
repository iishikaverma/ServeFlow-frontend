import { useEffect, useState } from "react";
import { getDataMode, subscribeDataMode, type DataMode } from "../services/api";

export function useDataMode(): DataMode {
  const [mode, setMode] = useState<DataMode>(getDataMode());
  useEffect(() => subscribeDataMode(setMode), []);
  return mode;
}
