import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Footer from "./components/Footer";
import ScrollToTop from "./components/ScrollToTop";
import GoogleAnalytics from "./components/GoogleAnalytics";
import PerformanceOptimizer from "./components/PerformanceOptimizer";
import Image from "next/image";

const geistSans = Geist({
    variable: "--font-geist-sans",
    subsets: ["latin"],
});

const geistMono = Geist_Mono({
    variable: "--font-geist-mono",
    subsets: ["latin"],
});

export const metadata: Metadata = {
    title: "Verus Científica - Equipamentos para Laboratório | RS",
    description: "Fornecemos equipamentos e produtos de alta qualidade para laboratórios no Rio Grande do Sul. PCR Tempo Real, Eletroforeses, Incubadoras de CO2 e muito mais.",
    keywords: [
        "equipamentos laboratório",
        "produtos laboratório",
        "PCR tempo real",
        "eletroforeses",
        "incubadoras CO2",
        "balanças analíticas",
        "Loccus",
        "Sartorius",
        "laboratório pesquisa",
        "Rio Grande do Sul",
        "verus científica",
        "equipamentos científicos",
        "instrumentos laboratório",
        "filtros laboratório",
        "extração DNA",
        "purificação material genético"
    ],
    authors: [{ name: "Verus Científica" }],
    creator: "Verus Científica",
    publisher: "Verus Científica",
    formatDetection: {
        email: false,
        address: false,
        telephone: false,
    },
    metadataBase: new URL('https://veruswebsitedh.web.app'),
    alternates: {
        canonical: '/',
    },
    icons: {
        icon: [
            { url: '/favicon-16x16.png', sizes: '16x16', type: 'image/png' },
            { url: '/favicon-32x32.png', sizes: '32x32', type: 'image/png' },
            { url: '/assets/logo.png', type: 'image/png', sizes: '192x192' },
        ],
        apple: [
            { url: '/assets/logo.png', sizes: '192x192', type: 'image/png' },
        ],
        other: [
            { rel: 'icon', url: '/favicon-16x16.png', sizes: '16x16', type: 'image/png' },
            { rel: 'icon', url: '/favicon-32x32.png', sizes: '32x32', type: 'image/png' },
            { rel: 'apple-touch-icon', url: '/android-chrome-192x192.png', sizes: '192x192' },
            { rel: 'apple-touch-icon', url: '/android-chrome-512x512.png', sizes: '512x512' },
        ],
    },
    openGraph: {
        title: "Verus Científica - Equipamentos para Laboratório | RS",
        description: "Fornecemos equipamentos e produtos de alta qualidade para laboratórios no Rio Grande do Sul. PCR Tempo Real, Eletroforeses, Incubadoras de CO2 e muito mais.",
        url: 'https://veruswebsitedh.web.app',
        siteName: 'Verus Científica',
        images: [
            {
                url: '/assets/logo.png',
                width: 120,
                height: 120,
                alt: 'Verus Científica Logo',
            },
        ],
        locale: 'pt_BR',
        type: 'website',
    },
    twitter: {
        card: 'summary_large_image',
        title: "Verus Científica - Equipamentos para Laboratório | RS",
        description: "Fornecemos equipamentos e produtos de alta qualidade para laboratórios no Rio Grande do Sul.",
        images: ['/assets/logo.png'],
    },
    robots: {
        index: true,
        follow: true,
        googleBot: {
            index: true,
            follow: true,
            'max-video-preview': -1,
            'max-image-preview': 'large',
            'max-snippet': -1,
        },
    },
    verification: {
        google: 'PcOFdYjXhNYbx097NGKfC6rSrtwskvSe3rl-KWahj9Y',
    },
    other: {
        'geo.region': 'BR-RS',
        'geo.placename': 'Rio Grande do Sul',
        'geo.position': '-30.0346;-51.2177',
        'ICBM': '-30.0346, -51.2177',
    },
};

export default function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <html lang="pt-BR">
            <head>
                <meta name="google-site-verification" content="PcOFdYjXhNYbx097NGKfC6rSrtwskvSe3rl-KWahj9Y" />
                <link rel="icon" type="image/png" sizes="16x16" href="/favicon-16x16.png" />
                <link rel="icon" type="image/png" sizes="32x32" href="/favicon-32x32.png" />
                <link rel="apple-touch-icon" sizes="192x192" href="/android-chrome-192x192.png" />
                <link rel="apple-touch-icon" sizes="512x512" href="/android-chrome-512x512.png" />
            </head>
            <body
                className={`${geistSans.variable} ${geistMono.variable} antialiased`}
                style={{ color: 'black' }}
                >
                <GoogleAnalytics />
                <PerformanceOptimizer />
                <ScrollToTop />
                <main>
                    {children}
                </main>
                <Footer />
            </body>
        </html>
    );
}
