import type { Metadata } from "next";
import "./globals.css";
import AppLayout from "@/components/AppLayout";

export const metadata: Metadata = {
  title: "TaskFlow - Task Management",
  description: "Advanced task management for modern teams",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="pt-BR"
      className="antialiased"
      style={{ background: '#0f172a' }}
      suppressHydrationWarning
    >
      <body
        className="bg-[#0f172a] w-full min-h-screen overflow-x-hidden"
        suppressHydrationWarning
      >
        <AppLayout>{children}</AppLayout>
      </body>
    </html>
  );
}
