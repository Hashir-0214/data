'use client';

import { logout } from '@/app/actions/auth';

export default function LogoutButton() {
    return (
        <button
            onClick={() => logout()}
            className="rounded-md bg-red-600 px-3 py-1.5 text-sm font-semibold text-white shadow-sm hover:bg-red-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-red-600"
        >
            Logout
        </button>
    );
}
