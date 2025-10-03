// Lista de emails autorizados para acessar a área administrativa
export const ADMIN_EMAILS = [
  'nicolastoldo@veruscientifica.com.br',
  'vendas@veruscientifica.com.br',
  'tiago@veruscientifica.com.br',
  // Adicione outros emails admin aqui
];

// Função para verificar se um email é admin
export function isAdminEmail(email: string | null | undefined): boolean {
  if (!email) return false;
  return ADMIN_EMAILS.includes(email.toLowerCase());
}

// Função para obter a lista de admins (para debug/logs)
export function getAdminEmails(): string[] {
  return [...ADMIN_EMAILS];
}

// Função para verificar admin no banco de dados (mais seguro)
export async function isAdminEmailInDatabase(email: string | null | undefined): Promise<boolean> {
  if (!email) return false;
  
  try {
    // Esta função seria chamada do servidor
    // Por enquanto, retorna a verificação local
    return isAdminEmail(email);
  } catch (error) {
    console.error('Erro ao verificar admin no banco:', error);
    return false;
  }
}
