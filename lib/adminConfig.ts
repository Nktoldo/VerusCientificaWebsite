import { get, query, ref, orderByChild, equalTo } from 'firebase/database';
import { db } from './firebase.mjs';

export async function isAdminEmailInDatabase(email: string | null | undefined): Promise<boolean> {
  if (!email) return false;
  
  try {
    const snapshot = await get(query(ref(db, 'adminEmails'), orderByChild('email'), equalTo(email.toLowerCase())));
    let isAdmin = false;
    snapshot.forEach(child => {
      if (child.val()?.active === true) isAdmin = true;
    });
    return isAdmin;
  } catch (error) {
    console.error('Erro ao verificar admin no banco:', error);
    return false;
  }
}
