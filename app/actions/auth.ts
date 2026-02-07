'use server';

import { getCredentials } from '@/lib/googleSheets';
import { encrypt, decrypt } from '@/lib/auth';
import { setUserCache, clearUserCache } from '@/lib/cache';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';

export async function login(prevState: any, formData: FormData) {
    const username = formData.get('username') as string;
    const password = formData.get('password') as string;

    if (!username || !password) {
        return { error: 'Username and password are required' };
    }

    try {
        const users = await getCredentials();
        const user = users.find((u: any) => u.username === username && u.password === password);

        if (user) {
            // Create session
            const sessionData = {
                name: user.Name,
                username: user.username
            };

            const token = await encrypt(sessionData); // Expires in 24h

            const cookieStore = await cookies();
            cookieStore.set('session', token, {
                httpOnly: true,
                secure: process.env.NODE_ENV === 'production',
                sameSite: 'lax',
                path: '/',
                maxAge: 60 * 60 * 24, // 24 hours
            });

            // Save to server-side cache as requested
            setUserCache(username, sessionData);

            redirect('/');
        } else {
            return { error: 'Invalid username or password' };
        }
    } catch (err) {
        console.error('Login error:', err);
        // If it's a redirect, let it pass
        if ((err as any)?.digest?.includes('NEXT_REDIRECT')) {
            throw err;
        }
        return { error: 'Something went wrong. Please try again.' };
    }
}

export async function logout() {
    const cookieStore = await cookies();
    const sessionToken = cookieStore.get('session')?.value;

    if (sessionToken) {
        const payload = await decrypt(sessionToken);
        if (payload?.username) {
            clearUserCache(payload.username);
        }
    }

    cookieStore.delete('session');
    redirect('/login');
}
