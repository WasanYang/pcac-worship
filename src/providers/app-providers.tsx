"use client";

import { ThemeProvider } from "@/providers/theme-provider";
import { I18nProvider } from "@/providers/i-18n-provider";

export function AppProviders({ children }: { children: React.ReactNode }) {
  return (
    <I18nProvider>
      <ThemeProvider
        attribute="class"
        defaultTheme="system"
        enableSystem
        disableTransitionOnChange
      >
        {children}
      </ThemeProvider>
    </I18nProvider>
  );
}
