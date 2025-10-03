// Firebase Admin SDK - Desabilitado temporariamente
// Para habilitar, configure as variáveis de ambiente necessárias

let adminAuth = null;

// Função para inicializar o Firebase Admin (quando necessário)
export function initializeFirebaseAdmin() {
  if (adminAuth) return adminAuth;
  
  try {
    const { initializeApp, getApps, cert } = require('firebase-admin/app');
    const { getAuth } = require('firebase-admin/auth');
    
    const serviceAccount = {
      type: "service_account",
      project_id: process.env.FIREBASE_PROJECT_ID,
      private_key_id: process.env.FIREBASE_PRIVATE_KEY_ID,
      private_key: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
      client_email: process.env.FIREBASE_CLIENT_EMAIL,
      client_id: process.env.FIREBASE_CLIENT_ID,
      auth_uri: "https://accounts.google.com/o/oauth2/auth",
      token_uri: "https://oauth2.googleapis.com/token",
      auth_provider_x509_cert_url: "https://www.googleapis.com/oauth2/v1/certs",
      client_x509_cert_url: `https://www.googleapis.com/robot/v1/metadata/x509/${process.env.FIREBASE_CLIENT_EMAIL}`
    };

    if (getApps().length === 0) {
      const adminApp = initializeApp({
        credential: cert(serviceAccount),
        projectId: process.env.FIREBASE_PROJECT_ID,
      });
      adminAuth = getAuth(adminApp);
    } else {
      adminAuth = getAuth(getApps()[0]);
    }
    
    return adminAuth;
  } catch (error) {
    console.warn('Firebase Admin SDK não configurado:', error.message);
    return null;
  }
}

// Exporta uma função que retorna null se não estiver configurado
export { adminAuth };
export default null;