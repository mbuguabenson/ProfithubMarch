import { createClient } from '@supabase/supabase-js';

// These should be set in your .env file
const supabaseUrl = process.env.VITE_SUPABASE_URL || 'https://your-project-url.supabase.co';
const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY || 'your-anon-key';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

/**
 * Helper to report user activity/presence to Supabase
 */
export const reportUserActivity = async (userData: {
    loginid: string;
    email?: string;
    phone?: string;
    currency?: string;
    country?: string;
    last_seen?: string;
}) => {
    try {
        const { error } = await supabase.from('user_monitoring').upsert(
            {
                ...userData,
                updated_at: new Date().toISOString(),
            },
            { onConflict: 'loginid' }
        );

        if (error) {
            console.warn('[Supabase] Error reporting activity:', error.message);
        }
    } catch (e) {
        console.error('[Supabase] Critical error in reportUserActivity:', e);
    }
};
