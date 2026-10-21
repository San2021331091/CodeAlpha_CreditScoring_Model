import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "CreditAlpha | Credit Risk Intelligence",
  description: "Explainable credit scoring, applicant risk assessment, and portfolio insights.",
};

const RootLayout:React.FC = ({
  children,
}: Readonly<{
  children: React.ReactNode;
}>):React.JSX.Element =>{
  return (
    <html lang="en" className="dark">
      <body className="min-h-screen bg-[#0b1020] text-slate-100 antialiased selection:bg-indigo-500/30 selection:text-indigo-100">
        {children}
      </body>
    </html>
  );
}

export default RootLayout;