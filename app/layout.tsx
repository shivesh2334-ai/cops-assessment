import "./globals.css";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "COPD Assessment & Treatment System",
  description: "GOLD ABE classification and initial pharmacologic therapy for stable COPD.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
