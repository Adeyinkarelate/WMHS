import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Account",
};

export default function AuthGroupLayout({ children }: { children: React.ReactNode }) {
  return children;
}
