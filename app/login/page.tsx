'use client';

import { auth } from '@/lib/firebase.mjs';
import { GoogleAuthProvider, signInWithPopup, signInWithEmailAndPassword } from 'firebase/auth';
import { useRouter } from 'next/navigation';

function LoginPage() {
   const router = useRouter();
    async function handleGoogleLogin() {
        const provider = new GoogleAuthProvider();
        await signInWithPopup(auth, provider);
        router.push('/editor');
    }
    function handleEmailLogin() {
        const email = (document.getElementById('email') as HTMLInputElement).value
        const password = (document.getElementById('password') as HTMLInputElement).value
        signInWithEmailAndPassword(auth, email, password)
    }
    return (
        <main className='min-h-screen flex flex-col justify-center items-center py-25 gap-5'>
            <section className='flex flex-col items-center gap-3 shadow-[0_4px_30px_rgba(0,0,0,0.2)]
                backdrop-blur-xl 
                backdrop-brightness-125 
                backdrop-contrast-125 
                backdrop-saturate-150 p-10 rounded-lg'>
            <h1 className='text-3xl'>Log-In to access database..</h1>

            <div className='flex flex-col'>
            <label className='text-2xl text-zync-200'>Email:</label>
            <input type="email" name="email" id="email" placeholder='email@dominio.com' className='h-10 w-70 border-2 border-blue-800 rounded-md px-1 text-zync-800'/>
            </div>

            <div className='flex flex-col'>
            <label className='text-2xl text-zync-200'>Senha:</label>
            <input type="password" name="password" id="password" placeholder='Digite sua senha aqui!' className='h-10 w-70 border-2 border-blue-800 rounded-md px-1 text-zync-800'/>
            </div>

            <button onClick={handleEmailLogin} className='bg-blue-700 text-white rounded-md shadow-xl w-30 h-10 duration-200 hover:scale-95'>Log-In</button>
            <button onClick={handleGoogleLogin} className='rounded-full shadow-[0_4px_30px_rgba(0,0,0,0.2)] p-2'>
                <img className='h-10' src="https://upload.wikimedia.org/wikipedia/commons/thumb/c/c1/Google_%22G%22_logo.svg/768px-Google_%22G%22_logo.svg.png" alt="google logo" />
            </button>
            </section>
        </main>
    )
}

export default LoginPage;