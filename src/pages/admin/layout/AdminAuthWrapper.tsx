import React, { useEffect, useState } from 'react';
import ChunkLoader from '@/components/loader/chunk-loader';
import { supabase } from '@/lib/supabaseClient';
import AdminLoginForm from './AdminLoginForm';

interface AdminAuthWrapperProps {
    children: React.ReactNode;
}

const AdminAuthWrapper: React.FC<AdminAuthWrapperProps> = ({ children }) => {
    const [isLoading, setIsLoading] = useState(true);
    const [isAuthenticated, setIsAuthenticated] = useState(false);

    useEffect(() => {
        const checkSession = async () => {
            try {
                const {
                    data: { session },
                } = await supabase.auth.getSession();
                setIsAuthenticated(!!session);
            } catch (error) {
                console.error('[AdminAuth] Session check failed:', error);
                setIsAuthenticated(false);
            } finally {
                setIsLoading(false);
            }
        };

        checkSession();

        const {
            data: { subscription },
        } = supabase.auth.onAuthStateChange((_event, session) => {
            setIsAuthenticated(!!session);
            setIsLoading(false);
        });

        return () => {
            subscription.unsubscribe();
        };
    }, []);

    if (isLoading) {
        return (
            <div className='admin-auth-loading'>
                <ChunkLoader message='Verifying Administrative Credentials...' />
            </div>
        );
    }

    if (!isAuthenticated) {
        return <AdminLoginForm />;
    }

    return <>{children}</>;
};

export default AdminAuthWrapper;
