import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { SessionProvider } from "@/contexts/SessionContext";
import { NextAuthProvider } from "@/components/NextAuthProvider";
import { CartSidebar } from "@/components/cart/CartSidebar";

const inter = Inter({ 
  subsets: ["latin"],
  display: 'swap',
  variable: '--font-inter'
});

export const metadata: Metadata = {
  title: "PMCELL São Paulo - Acessórios para Celular no Atacado",
  description: "Compre acessórios para celular no atacado com os melhores preços. Capas, películas, fones, carregadores e muito mais.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR">
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, minimum-scale=1.0, user-scalable=no, viewport-fit=cover" />
      </head>
      <body className={`${inter.variable} font-sans`}>
        <NextAuthProvider>
          <SessionProvider>
            {children}
            <CartSidebar />
          </SessionProvider>
        </NextAuthProvider>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              document.addEventListener('DOMContentLoaded', function() {
                // Selecionar texto automaticamente ao clicar em inputs (exceto os marcados)
                document.addEventListener('click', function(e) {
                  if (e.target.tagName === 'INPUT' && 
                      !e.target.getAttribute('data-no-auto-select') &&
                      (e.target.type === 'text' || 
                       e.target.type === 'number' || 
                       e.target.type === 'email' || 
                       e.target.type === 'password' || 
                       e.target.type === 'search' || 
                       e.target.type === 'tel' || 
                       e.target.type === 'url')) {
                    setTimeout(function() {
                      e.target.select();
                    }, 0);
                  }
                });
                
                // Também selecionar quando ganhar foco (exceto os marcados)
                document.addEventListener('focus', function(e) {
                  if (e.target.tagName === 'INPUT' && 
                      !e.target.getAttribute('data-no-auto-select') &&
                      (e.target.type === 'text' || 
                       e.target.type === 'number' || 
                       e.target.type === 'email' || 
                       e.target.type === 'password' || 
                       e.target.type === 'search' || 
                       e.target.type === 'tel' || 
                       e.target.type === 'url')) {
                    setTimeout(function() {
                      e.target.select();
                    }, 0);
                  }
                }, true);
              });
            `,
          }}
        />
      </body>
    </html>
  );
}
