// lista de emails autorizados para acessar a área administrativa
export const ADMIN_EMAILS = [
  'nicolastoldo@veruscientifica.com.br',
  'vendas@veruscientifica.com.br',
  'tiago@veruscientifica.com.br',
];

// função para verificar se um email é admin
export function isAdminEmail(email: string | null | undefined): boolean {
  if (!email) return false;
  return ADMIN_EMAILS.includes(email.toLowerCase());
}

// função para obter a lista de admins
export function getAdminEmails(): string[] {
  return [...ADMIN_EMAILS];
}

// função para verificar admin no banco de dados
export async function isAdminEmailInDatabase(email: string | null | undefined): Promise<boolean> {
  if (!email) return false;
  
  try {
    return isAdminEmail(email);
  } catch (error) {
    console.error('Erro ao verificar admin no banco:', error);
    return false;
  }
}
