import React, { createContext, useContext, useState, ReactNode } from "react";
import { ApplicationData, emptyApplication } from "../lib/applicationSchema";

type Ctx = {
  data: ApplicationData;
  setData: (next: Partial<ApplicationData>) => void;
  reset: () => void;
};

const ApplicationContext = createContext<Ctx | null>(null);

export function ApplicationProvider({ children }: { children: ReactNode }) {
  const [data, setDataState] = useState<ApplicationData>(emptyApplication);

  const setData = (next: Partial<ApplicationData>) =>
    setDataState((prev) => ({ ...prev, ...next }));

  const reset = () => setDataState(emptyApplication);

  return (
    <ApplicationContext.Provider value={{ data, setData, reset }}>
      {children}
    </ApplicationContext.Provider>
  );
}

export function useApplication() {
  const ctx = useContext(ApplicationContext);
  if (!ctx) throw new Error("useApplication must be used within ApplicationProvider");
  return ctx;
}
