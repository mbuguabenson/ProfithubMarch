import React, { lazy, Suspense,useState } from 'react';
import { 
    Activity,
    Download,
    FileText, 
    Layers,
    TrendingUp} from 'lucide-react';
import { observer } from 'mobx-react-lite';
import './reports.scss';

const TransactionsTab = lazy(() => import('../account-dashboard/tabs/transactions-tab'));

type TReportTab = 'statement' | 'profit' | 'positions';

const Reports = observer(() => {
    const [activeTab, setActiveTab] = useState<TReportTab>('statement');

    const TABS = [
        { id: 'statement', label: 'Account Statement', icon: FileText, desc: 'Complete history of all account movements' },
        { id: 'profit', label: 'Profit Table', icon: TrendingUp, desc: 'Detailed breakdown of your trade outcomes' },
        { id: 'positions', label: 'Open Positions', icon: Layers, desc: 'Real-time monitoring of active market entries' },
    ];

    return (
        <div className='reports-page'>
            <div className='reports-header'>
                <div className='header-titles'>
                    <h1 className='main-title'>
                        PLATFORM <span className='highlight'>REPORTS</span>
                    </h1>
                    <p className='subtitle'>
                        Institutional grade audit logs • Real-time synchronization
                    </p>
                </div>
                
                <div className='header-actions'>
                    <button className='export-btn'>
                        <Download size={14} />
                        Export XML/CSV
                    </button>
                </div>
            </div>

            <div className='reports-grid'>
                {/* Navigation Sidebar */}
                <aside className='reports-nav'>
                    <div className='nav-sections'>
                        {TABS.map(tab => {
                            const Icon = tab.icon;
                            return (
                                <button 
                                    key={tab.id}
                                    onClick={() => setActiveTab(tab.id as TReportTab)}
                                    className={`nav-item ${activeTab === tab.id ? 'active' : ''}`}
                                >
                                    <div className='icon-box'>
                                        <Icon size={18} />
                                    </div>
                                    <div className='nav-text'>
                                        <span className='label'>{tab.label}</span>
                                        <span className='desc'>{tab.desc}</span>
                                    </div>
                                </button>
                            );
                        })}
                    </div>

                    <div className='nav-footer'>
                        <div className='sync-status'>
                            <Activity size={12} className='pulse' />
                            Live Market Sync Active
                        </div>
                    </div>
                </aside>

                {/* Content Area */}
                <main className='reports-content'>
                    <Suspense fallback={
                        <div className='reports-loading'>
                            <div className='loader'>
                                <div className='ring'></div>
                                <span className='text'>Retrieving Records...</span>
                            </div>
                        </div>
                    }>
                        {activeTab === 'statement' && <TransactionsTab />}
                        {activeTab === 'profit' && (
                            <div className='placeholder-view animate-fade-in'>
                                <TrendingUp size={48} className='icon' />
                                <h3>Profit Table Analysis</h3>
                                <p>This specialized view is being optimized for your performance tracking.</p>
                                <button className='nav-item active' onClick={() => setActiveTab('statement')} style={{ marginTop: '1rem' }}>
                                    View Statement Instead
                                </button>
                            </div>
                        )}
                        {activeTab === 'positions' && (
                            <div className='placeholder-view animate-fade-in'>
                                <Layers size={48} className='icon' />
                                <h3>Active Positions</h3>
                                <p>Live positions are currently managed through the main trading terminal.</p>
                            </div>
                        )}
                    </Suspense>
                </main>
            </div>
        </div>
    );
});

export default Reports;
