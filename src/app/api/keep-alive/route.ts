
import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export async function GET(request: Request) {
    try {
        const authHeader = request.headers.get('authorization');
        if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        // Create a direct client for this stateless request
        const supabase = createClient(
            process.env.NEXT_PUBLIC_SUPABASE_URL!,
            process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
        );

        // Perform a lightweight query to keep the project active
        const { count, error } = await supabase
            .from('albums')
            .select('*', { count: 'exact', head: true });

        if (error) {
            console.error("Keep-Alive Error:", error);
            // Don't fail the request if it's just RLS, as long as we hit the DB
        }

        return NextResponse.json({ message: 'Keep-alive ping successful', count });
    } catch (err: unknown) {
        console.error("Keep-Alive Exception:", err);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
