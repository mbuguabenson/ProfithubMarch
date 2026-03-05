import React, { lazy, Suspense, useCallback, useEffect, useState } from 'react';
import {
    Activity,
    BarChart3,
    CheckCircle,
    Copy,
    ShieldCheck,
    TrendingUp,
    User,
    Wallet,
    Zap,
} from 'lucide-react';
import { useStore } from '@/hooks/useStore';
import './account-dashboard.scss';

const UserDetailsTab = lazy(() => import('./tabs/user-details-tab'));
const TransactionsTab = lazy(() => import('./tabs/transactions-tab'));
const PerformanceTab = lazy(() => import('./tabs/performance-tab'));
const StrategyTab = lazy(() => import('./tabs/strategy-tab'));

type TTab = 'details' | 'transactions' | 'performance' | 'strategy';

const TABS: { id: TTab; label: string; icon: React.ElementType }[] = [
    { id: 'details', label: 'User Details', icon: User },
    { id: 'transactions', label: 'Transactions', icon: Wallet },
    { id: 'performance', label: 'Performance Journey', icon: TrendingUp },
    { id: 'strategy', label: 'Strategy Analytics', icon: BarChart3 },
];

const StatCard = ({
    label,
    value,
    sub,
    icon: Icon,
    color,
    pulse,
}: {
    label: string;
    value: string | number;
    sub?: string;
    icon: React.ElementType;
    color: string;
    pulse?: boolean;
}) => (
    <div className={`stat-card ${color}`}>
        <div className="glow" />
        <div className="card-header">
            <div className="icon-box">
                <Icon />
            </div>
            {pulse && (
                <div className="live-badge">
                    <span className="dot" />
                    LIVE
                </div>
            )}
        </div>
        <div className="label">{label}</div>
        <div className="value">{value}</div>
        {sub && <div className="sub">{sub}</div>}
    </div>
);

const AccountDashboard = () => {
    const { client } = useStore();
    const [activeTab, setActiveTab] = useState<TTab>('details');
    const [copied, setCopied] = useState(false);
    
    const accountId = client?.loginid || 'CRXXXXXX';
    const currency = client?.currency || 'USD';
    const isVirtual = client?.is_virtual;
    const accountType = isVirtual ? 'Demo' : 'Real';
    const accBalance = client?.balance ? parseFloat(client.balance) : 0;
    
    const settings = client?.account_settings;
    const realName = settings ? `${settings.first_name || ''} ${settings.last_name || ''}`.trim() : '';
    const email = settings?.email || 'N/A';
    
    const [username, setUsername] = useState(realName || 'Premium Trader');
    const [isEditingName, setIsEditingName] = useState(false);

    useEffect(() => {
        if (realName) setUsername(realName);
    }, [realName]);

    const handleCopy = useCallback(() => {
        navigator.clipboard.writeText(accountId);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    }, [accountId]);

    return (
        <div className="account-dashboard-page">
            <div className="dashboard-header">
                <div className="header-top">
                    <div className="avatar-container">
                        <div className="avatar-box">
                            <User size={40} />
                        </div>
                        <div className="verified-badge">
                            <ShieldCheck size={14} />
                        </div>
                    </div>
                    
                    <div className="user-info">
                        <div className="name-row">
                            {isEditingName ? (
                                <input
                                    autoFocus
                                    className="name-input"
                                    value={username}
                                    onChange={e => setUsername(e.target.value)}
                                    onBlur={() => setIsEditingName(false)}
                                    onKeyDown={e => e.key === 'Enter' && setIsEditingName(false)}
                                />
                            ) : (
                                <h1
                                    title='Click to edit'
                                    onClick={() => setIsEditingName(true)}
                                >
                                    {username}
                                </h1>
                            )}
                            <div className="status-badge">Verified Pro</div>
                        </div>

                        <div className="account-details">
                            <button className="copy-btn" onClick={handleCopy}>
                                <span className="id-text">{accountId}</span>
                                {copied ? (
                                    <CheckCircle size={14} />
                                ) : (
                                    <Copy size={14} />
                                )}
                                <span className="copy-text">{copied ? 'Copied' : 'Copy ID'}</span>
                            </button>

                            <div className="type-toggle">
                                <button className={`active ${isVirtual ? 'demo' : 'real'}`}>
                                    {accountType} Account
                                </button>
                                <button className="currency-btn">
                                    {currency}
                                </button>
                            </div>
                            
                            <span className="currency-text">{email}</span>
                        </div>
                    </div>

                    <div className="balance-container">
                        <div className="balance-label">Total Balance</div>
                        <div className="balance-value">
                            {currency === 'USD' ? '$' : currency + ' '}
                            {accBalance.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                        </div>
                        <div className="balance-diff">
                            <span className="diff-val">+2.45%</span>
                            <span className="diff-time">Past 24h</span>
                        </div>
                    </div>
                </div>

                <div className="header-stats">
                    <StatCard
                        label='Profile Reach'
                        value='98%'
                        sub='Optimized for speed'
                        icon={Zap}
                        color='blue'
                    />
                    <StatCard
                        label='Trust Score'
                        value='Excel'
                        sub='Verified Member'
                        icon={ShieldCheck}
                        color='emerald'
                    />
                    <StatCard
                        label='Market Pulse'
                        value='Active'
                        sub='Trading Enabled'
                        icon={Activity}
                        color='purple'
                        pulse
                    />
                    <StatCard
                        label='Growth Edge'
                        value='+12.5%'
                        sub='Monthly ROI'
                        icon={TrendingUp}
                        color='cyan'
                    />
                </div>
            </div>

            <div className="sticky-tabs">
                <div className="tabs-list">
                    {TABS.map(tab => {
                        const Icon = tab.icon;
                        return (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id)}
                                className={activeTab === tab.id ? 'active' : ''}
                            >
                                <Icon />
                                {tab.label}
                            </button>
                        );
                    })}
                </div>
            </div>

            <div className="tab-content">
                <Suspense
                    fallback={
                        <div className="loading-state">
                            <div className="loader-box">
                                <div className="icon-spin">
                                    <Activity />
                                </div>
                                <p>Loading...</p>
                            </div>
                        </div>
                    }
                >
                    {activeTab === 'details' && <UserDetailsTab accountType={accountType} />}
                    {activeTab === 'transactions' && <TransactionsTab />}
                    {activeTab === 'performance' && <PerformanceTab />}
                    {activeTab === 'strategy' && <StrategyTab />}
                </Suspense>
            </div>
        </div>
    );
};

export default AccountDashboard;
