import type { Metadata } from "next";
import "./globals.css";
import { AuthProvider } from "@/context/AuthContext";

export const metadata: Metadata = {
  title: "VanDatPremium - Account Shop",
  description: "Cửa hàng tài khoản giải trí Premium",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="vi">
      <body suppressHydrationWarning={true}>
        <AuthProvider>
          {children}
        </AuthProvider>
      </body>
    </html>
  );
}
