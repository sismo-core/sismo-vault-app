import React, { useContext } from "react";

const AnalyticsContext = React.createContext(null);

export type Options = {
  props?: any;
  sendOnce?: boolean;
};

type Analytics = {
  goal(goalName: string, opts: Options);
};

export const useAnalytics = (): Analytics => {
  return useContext(AnalyticsContext);
};

const goals = new Map<string, boolean>();

export default function AnalyticsProvider({
  children,
}: {
  children: React.ReactNode;
}): JSX.Element {
  const goal = (goalName: string, opts?: Options) => {
    if (opts?.sendOnce) {
      const key = `${goalName}_${JSON.stringify(opts)}`;
      if (goals.has(key)) {
        return;
      } else {
        goals.set(key, true);
      }
    }
    const options = {
      props: opts?.props,
    };
    (window as any).plausible(goalName, options);
  };

  return (
    <AnalyticsContext.Provider
      value={{
        goal,
      }}
    >
      {children}
    </AnalyticsContext.Provider>
  );
}
