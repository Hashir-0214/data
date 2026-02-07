import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';

export async function GET(request: NextRequest) {
    try {
        const session = await getSession();
        if (!session) {
            return NextResponse.json({ user: null }, { status: 401 });
        }
        return NextResponse.json({ user: session });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
