import { Metadata } from 'next';
import SearchClient from './SearchClient';

export const metadata: Metadata = {
  alternates: { canonical: 'https://www.veruscientifica.com.br/search' },
};

export default function SearchPage() {
  return <SearchClient />;
}