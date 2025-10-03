import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Footer from "./components/Footer";
import ScrollToTop from "./components/ScrollToTop";
import GoogleAnalytics from "./components/GoogleAnalytics";
import PerformanceOptimizer from "./components/PerformanceOptimizer";

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
    metadataBase: new URL('https://www.veruscientifica.com.br/'),
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
        url: 'https://www.veruscientifica.com.br/',
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
                {/* Google Tag Manager */}
                <script
                    dangerouslySetInnerHTML={{
                        __html: `(function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
                        new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
                        j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
                        'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
                        })(window,document,'script','dataLayer','GTM-WKHFC38H');`
                    }}
                />
                {/* End Google Tag Manager */}

                {/* <!-- Google tag (gtag.js) --> */}
                <script async src="https://www.googletagmanager.com/gtag/js?id=G-RZ67ED7YLP"></script>
                <script
                    dangerouslySetInnerHTML={{
                        __html: `
                            window.dataLayer = window.dataLayer || [];
                            function gtag(){dataLayer.push(arguments);}
                            gtag('js', new Date());
                            gtag('config', 'G-RZ67ED7YLP');
                        `
                    }}
                />

                <meta name="google-site-verification" content="PcOFdYjXhNYbx097NGKfC6rSrtwskvSe3rl-KWahj9Y" />
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
                {/* Google Tag Manager (noscript) */}
                <noscript>
                    <iframe
                        src="https://www.googletagmanager.com/ns.html?id=GTM-WKHFC38H"
                        height="0"
                        width="0"
                        style={{ display: 'none', visibility: 'hidden' }}
                    />
                </noscript>
                {/* End Google Tag Manager (noscript) */}
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
