'use client';

import { auth } from '@/lib/firebase.mjs';
import { signInWithPopup, signInWithEmailAndPassword, signOut } from 'firebase/auth';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

function LoginPage() {
    const [hasError, setHasError] = useState(false);
    const router = useRouter();
    
    async function handleEmailLogin() {
        const email = (document.getElementById('email') as HTMLInputElement).value
        const password = (document.getElementById('password') as HTMLInputElement).value
        await signInWithEmailAndPassword(auth, email, password)
        .then((resultado) => {router.push('/editor');})
        .catch((error) => {
            setHasError(true);
            console.error("Erro de login:", error);
            // Em vez de alert, você pode implementar um toast ou notificação
        })
    }
    return (
        <main className='min-h-screen flex flex-col justify-center items-center py-25 gap-5'>
            <section className='flex flex-col items-center gap-3 shadow-[0_4px_30px_rgba(0,0,0,0.2)] backdrop-blur-xl backdrop-brightness-125 backdrop-contrast-125 backdrop-saturate-150 p-10 rounded-lg'>
            <h1 className='text-3xl'>Log-In to access database..</h1>

            <div className='flex flex-col'>
            <label className='text-2xl text-zync-200'>Email:</label>
            <input type="email" name="email" id="email" placeholder='email@dominio.com' className={`${hasError ? 'border-red-600' : 'border-blue-800'} h-10 w-70 border-2 rounded-md px-1 text-zync-800`}/>
            </div>

            <div className='flex flex-col'>
            <label className='text-2xl text-zync-200'>Senha:</label>
            <input type="password" name="password" id="password" placeholder='Digite sua senha aqui!' className={`${hasError ? 'border-red-600' : 'border-blue-800'} h-10 w-70 border-2 rounded-md px-1 text-zync-800`}/>
            </div>

            <button onClick={handleEmailLogin} className={`${hasError ? 'bg-red-600' : 'bg-blue-800'} text-white rounded-md shadow-xl w-30 h-10 duration-200 hover:scale-95`}>Log-In</button>
           
            </section>
        </main>
    )
}

export default LoginPage;