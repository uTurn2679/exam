import type { Metadata } from "next";
import "./globals.css";
import Navbar from "./components/Navbar";

export const metadata: Metadata = {
  title: "Student Examination Portal & Assessment System",
  description: "Online Student Exam Portal with automated timer enforcement and teacher paper grading.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>
        <Navbar />
        <main style={{ minHeight: "calc(100vh - 72px)" }}>
          {children}
        </main>
      </body>
    </html>
  );
}
