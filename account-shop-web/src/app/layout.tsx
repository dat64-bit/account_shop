import type { Metadata } from "next";
import { Inter, Outfit } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/context/AuthContext";

const inter = Inter({
  subsets: ["latin", "vietnamese"],
  variable: "--font-inter",
  display: "swap",
});

const outfit = Outfit({
  subsets: ["latin"],
  variable: "--font-outfit",
  display: "swap",
});

export const metadata: Metadata = {
  title: "VanDatPremium - Account Shop",
  description: "Cửa hàng tài khoản giải trí Premium",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="vi" className={`${inter.variable} ${outfit.variable}`} suppressHydrationWarning={true}>
      <head>
        <script
          suppressHydrationWarning={true}
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                const observer = new MutationObserver((mutations) => {
                  mutations.forEach((mutation) => {
                    if (mutation.type === 'attributes' && mutation.attributeName === 'bis_skin_checked') {
                      mutation.target.removeAttribute('bis_skin_checked');
                    }
                    if (mutation.type === 'childList') {
                      mutation.addedNodes.forEach((node) => {
                        if (node.nodeType === 1) {
                          if (node.hasAttribute('bis_skin_checked')) {
                            node.removeAttribute('bis_skin_checked');
                          }
                          node.querySelectorAll('[bis_skin_checked]').forEach((el) => {
                            el.removeAttribute('bis_skin_checked');
                          });
                        }
                      });
                    }
                  });
                });
                observer.observe(document.documentElement, {
                  attributes: true,
                  childList: true,
                  subtree: true,
                  attributeFilter: ['bis_skin_checked']
                });
              })();
            `
          }}
        />
      </head>
      <body suppressHydrationWarning={true}>
        <AuthProvider>
          {children}
        </AuthProvider>
      </body>
    </html>
  );
}
