import React, { useState } from 'react';
import { ArrowRight, Loader2, Lock, Mail, ShieldCheck } from 'lucide-react';
import { supabase } from '@/lib/supabaseClient';
import './admin-login.scss';

const AdminLoginForm = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const [attempts, setAttempts] = useState(0);
    const [recoveryKey, setRecoveryKey] = useState('');
    const [showRecovery, setShowRecovery] = useState(false);

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();

        if (attempts >= 4 && !showRecovery) {
            setShowRecovery(true);
            setError('Maximum login attempts reached. Please enter your Recovery Key.');
            return;
        }

        setIsLoading(true);
        setError(null);

        try {
            if (showRecovery) {
                // Mock recovery key check
                if (recoveryKey === 'PROFIT-HUB-ADMIN-2026') {
                    setAttempts(0);
                    setShowRecovery(false);
                    setError(null);
                    setRecoveryKey('');
                    return;
                } else {
                    throw new Error('Invalid Recovery Key.');
                }
            }

            const { error: authError } = await supabase.auth.signInWithPassword({
                email,
                password,
            });

            if (authError) {
                setAttempts(prev => prev + 1);
                throw authError;
            }
        } catch (err: unknown) {
            const message =
                err instanceof Error ? err.message : 'Authentication failed. Please check your credentials.';
            setError(message);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className='admin-login-page'>
            <div className='bg-glow top-left' />
            <div className='bg-glow bottom-right' />

            <div className='login-card'>
                <div className='login-brand'>
                    <div className='brand-icon'>
                        <ShieldCheck size={28} />
                    </div>
                    <h1 className='brand-title'>
                        PROFIT <span className='highlight'>HUB</span>
                    </h1>
                    <p className='brand-sub'>Administrative Portal</p>
                </div>

                <form onSubmit={handleLogin} className='login-form'>
                    {!showRecovery ? (
                        <>
                            <div className='field-group'>
                                <label>Authorized Email</label>
                                <div className='input-wrapper'>
                                    <Mail size={16} className='input-icon' />
                                    <input
                                        type='email'
                                        value={email}
                                        onChange={e => setEmail(e.target.value)}
                                        placeholder='Enter admin email'
                                        required
                                        autoComplete='email'
                                    />
                                </div>
                            </div>

                            <div className='field-group'>
                                <label>Secure Key</label>
                                <div className='input-wrapper'>
                                    <Lock size={16} className='input-icon' />
                                    <input
                                        type='password'
                                        value={password}
                                        onChange={e => setPassword(e.target.value)}
                                        placeholder='••••••••'
                                        required
                                        autoComplete='current-password'
                                    />
                                </div>
                            </div>
                        </>
                    ) : (
                        <div className='field-group animate-fade-in'>
                            <label>Admin Recovery Key</label>
                            <div className='input-wrapper'>
                                <ShieldCheck size={16} className='input-icon' />
                                <input
                                    type='text'
                                    value={recoveryKey}
                                    onChange={e => setRecoveryKey(e.target.value)}
                                    placeholder='Enter Recovery Key'
                                    required
                                />
                            </div>
                            <p className='recovery-hint'>Access locked. Use your emergency bypass key.</p>
                        </div>
                    )}

                    {error && <div className='error-box'>{error}</div>}

                    <button type='submit' disabled={isLoading} className='login-btn'>
                        {isLoading ? (
                            <Loader2 size={16} className='spin' />
                        ) : (
                            <>
                                {showRecovery ? 'Verify Recovery Key' : 'Access Terminal'}
                                <ArrowRight size={16} />
                            </>
                        )}
                    </button>
                </form>

                <div className='login-footer'>
                    <p>Encrypted end-to-end • Supabase Auth</p>
                </div>
            </div>
        </div>
    );
};

export default AdminLoginForm;
