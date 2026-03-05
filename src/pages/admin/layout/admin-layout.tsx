import React, { lazy,Suspense } from 'react';
import { observer } from 'mobx-react-lite';
import ChunkLoader from '@/components/loader/chunk-loader';
import { useStore } from '@/hooks/useStore';
import Sidebar from './sidebar';
import './admin-layout.scss';

const AdminDashboard = lazy(() => import('../dashboard'));
const UsersManagement = lazy(() => import('../users'));
const TabsControl = lazy(() => import('../tabs-control'));
const TradingConsole = lazy(() => import('../components/trading-console'));

const AdminLayout = observer(() => {
    const { admin } = useStore();
    const { active_section } = admin;

    return (
        <div className="admin-layout-container">
            <Sidebar />
            
            <main className="admin-main-content">
                {/* Header */}
                <header className="admin-header">
                    <div className="section-info">
                        <h2>{active_section.replace('-', ' ')}</h2>
                        <span className="badge">
                            Live System
                        </span>
                    </div>

                    <div className="user-info-section">
                        <div className="user-text">
                            <p className="name">Admin User</p>
                            <p className="role">Super Administrator</p>
                        </div>
                        <div className="avatar-orb">
                            <div className="inner">
                                AD
                            </div>
                        </div>
                    </div>
                </header>

                {/* Content Area */}
                <div className="scroll-container">
                    <Suspense fallback={<ChunkLoader message="Initializing Module..." />}>
                        {active_section === 'dashboard' && <AdminDashboard />}
                        {active_section === 'users' && <UsersManagement />}
                        {active_section === 'tabs' && <TabsControl />}
                        {active_section === 'console' && (
                            <div className="p-8 min-h-screen bg-[#050505]">
                                <div className="mb-6">
                                    <h1 className="text-4xl font-black text-white tracking-tighter italic leading-none">
                                        TRADING <span className="text-brand-blue">CONSOLE</span>
                                    </h1>
                                    <p className="text-slate-600 text-[9px] font-mono font-black uppercase tracking-[0.3em] mt-1">Administrative terminal • Platform command interface</p>
                                </div>
                                <TradingConsole />
                            </div>
                        )}
                        {/* Fallback for sections not yet implemented */}
                        {!['dashboard', 'users', 'tabs', 'console'].includes(active_section) && (
                            <div className="p-8">
                                <div className="rounded-3xl border border-white/5 bg-white/[0.02] p-12 text-center">
                                    <span className="text-6xl mb-6 block">🚧</span>
                                    <h3 className="text-2xl font-bold text-white mb-2">Expansion in Progress</h3>
                                    <p className="text-slate-400 max-w-md mx-auto">
                                        The <strong>{active_section}</strong> module is being configured with real-time data streams.
                                    </p>
                                </div>
                            </div>
                        )}
                    </Suspense>
                </div>
            </main>
        </div>
    );
});

export default AdminLayout;
