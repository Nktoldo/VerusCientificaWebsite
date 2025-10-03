import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Solicitar Orçamento - Verus Científica',
  description: 'Solicite um orçamento personalizado para equipamentos de laboratório. PCR Tempo Real, Eletroforeses, Incubadoras de CO2 e muito mais.',
  alternates: {
    canonical: 'https://www.veruscientifica.com.br/orcamento'
  },
  openGraph: {
    title: 'Solicitar Orçamento - Verus Científica',
    description: 'Solicite um orçamento personalizado para equipamentos de laboratório.',
    url: 'https://www.veruscientifica.com.br/orcamento',
    type: 'website'
  }
};

export default function OrcamentoLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}


