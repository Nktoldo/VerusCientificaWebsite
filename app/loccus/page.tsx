import { Metadata } from 'next';
import LoccusClient from './LoccusClient';

export const metadata: Metadata = {
  title: 'Loccus - Representante oficial no RS - Verus Científica',
  description: 'A Verus Científica é representante oficial da Loccus no Rio Grande do Sul: equipamentos para extração de DNA e RNA, PCR, eletroforese e mais, com garantia de fábrica e suporte técnico.',
  alternates: {
    canonical: 'https://www.veruscientifica.com.br/loccus'
  },
  // página em teste: fora dos buscadores até ser lançada
  robots: {
    index: false,
    follow: false
  },
  openGraph: {
    title: 'Loccus - Representante oficial no RS - Verus Científica',
    description: 'Representante oficial da Loccus no Rio Grande do Sul, com garantia de fábrica e suporte técnico.',
    url: 'https://www.veruscientifica.com.br/loccus',
    type: 'website'
  }
};

export default function LoccusPage() {
  return <LoccusClient />;
}
