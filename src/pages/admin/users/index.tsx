import React, { useState, useMemo } from 'react';
import {
    Search, ShieldCheck, ShieldX,
    User, MapPin, Smartphone, Clock, Globe, ChevronRight,
    X, TrendingUp, TrendingDown, AlertTriangle,
} from 'lucide-react';
import { LineChart, Line, ResponsiveContainer, Tooltip } from 'recharts';
import '../admin-users.scss';

// ----------- Mock Data -----------
interface PlatformUser {
    id: string;
    name: string;
    email: string;
    avatar: string;
    status: 'Active' | 'Blocked' | 'Pending';
    type: 'Real' | 'Demo';
    balance: number;
    country: string;
    city: string;
    ip: string;
    device: string;
    browser: string;
    joined: string;
    lastSeen: string;
    trades: number;
    winRate: number;
    isNew: boolean;
    balanceHistory: number[];
}

const generateHistory = (base: number): number[] =>
    Array.from({ length: 20 }, (_, i) => Math.max(0, base + (Math.random() - 0.48) * base * 0.05 * i));

const MOCK_USERS: PlatformUser[] = [
    { id: 'CR9284731', name: 'Alex Morgan', email: 'alex.morgan@email.com', avatar: 'AM', status: 'Active', type: 'Real', balance: 10451.58, country: 'United Kingdom', city: 'London', ip: '82.45.102.31', device: 'iPhone 15 Pro', browser: 'Safari 17.2', joined: 'Jan 12, 2025', lastSeen: '2 min ago', trades: 342, winRate: 68.2, isNew: false, balanceHistory: generateHistory(10000) },
    { id: 'CR8812934', name: 'Priya Vasquez', email: 'priya.v@email.com', avatar: 'PV', status: 'Active', type: 'Real', balance: 4220.00, country: 'India', city: 'Mumbai', ip: '49.120.88.12', device: 'Samsung Galaxy S24', browser: 'Chrome 122', joined: 'Feb 03, 2025', lastSeen: '15 min ago', trades: 118, winRate: 55.1, isNew: false, balanceHistory: generateHistory(4000) },
    { id: 'CR7729010', name: 'Kwame Asante', email: 'kwame.asante@email.com', avatar: 'KA', status: 'Active', type: 'Real', balance: 8700.30, country: 'Ghana', city: 'Accra', ip: '197.251.45.88', device: 'MacBook Pro', browser: 'Chrome 122', joined: 'Mar 04, 2026', lastSeen: 'Just now', trades: 5, winRate: 60.0, isNew: true, balanceHistory: generateHistory(8700) },
    { id: 'VRTC9001', name: 'Sarah Lin', email: 'sarah.lin@email.com', avatar: 'SL', status: 'Active', type: 'Demo', balance: 10000.00, country: 'Singapore', city: 'Singapore', ip: '182.55.9.201', device: 'iPad Pro', browser: 'Safari 17.0', joined: 'Feb 28, 2025', lastSeen: '1 hr ago', trades: 210, winRate: 71.4, isNew: false, balanceHistory: generateHistory(10000) },
    { id: 'CR6618822', name: 'Dmitri Volkov', email: 'dmitri.v@email.com', avatar: 'DV', status: 'Blocked', type: 'Real', balance: 120.50, country: 'Russia', city: 'Moscow', ip: '95.31.18.44', device: 'Windows PC', browser: 'Firefox 123', joined: 'Dec 20, 2024', lastSeen: '3 days ago', trades: 890, winRate: 45.6, isNew: false, balanceHistory: generateHistory(120) },
    { id: 'CR5533891', name: 'Fatima Al-Said', email: 'fatima.s@email.com', avatar: 'FS', status: 'Pending', type: 'Real', balance: 0, country: 'UAE', city: 'Dubai', ip: '188.240.71.5', device: 'iPhone 15', browser: 'Chrome 122', joined: 'Mar 04, 2026', lastSeen: '5 min ago', trades: 0, winRate: 0, isNew: true, balanceHistory: generateHistory(0) },
    { id: 'CR4421557', name: 'Carlos Mendez', email: 'carlos.m@email.com', avatar: 'CM', status: 'Active', type: 'Real', balance: 3140.75, country: 'Brazil', city: 'São Paulo', ip: '200.168.33.21', device: 'Android Pixel 8', browser: 'Chrome 123', joined: 'Jan 25, 2025', lastSeen: '30 min ago', trades: 174, winRate: 62.1, isNew: false, balanceHistory: generateHistory(3000) },
    { id: 'CR3317744', name: 'Hannah Müller', email: 'hannah.m@email.com', avatar: 'HM', status: 'Active', type: 'Real', balance: 6800.00, country: 'Germany', city: 'Berlin', ip: '91.12.200.77', device: 'MacBook Air', browser: 'Safari 17.2', joined: 'Nov 08, 2024', lastSeen: '2 hr ago', trades: 430, winRate: 73.5, isNew: false, balanceHistory: generateHistory(6800) },
];

// ----------- Sparkline -----------
const Sparkline = ({ data }: { data: number[] }) => (
    <ResponsiveContainer width={80} height={30}>
        <LineChart data={data.map((v, i) => ({ i, v }))}>
            <Line type='monotone' dataKey='v' stroke={data[data.length - 1] >= data[0] ? '#10b981' : '#f43f5e'} strokeWidth={1.5} dot={false} />
            <Tooltip contentStyle={{ display: 'none' }} />
        </LineChart>
    </ResponsiveContainer>
);

// ----------- User Detail Panel -----------
const UserDetailPanel = ({ user, onClose, onAction }: { user: PlatformUser; onClose: () => void; onAction: (action: string) => void }) => (
    <div className="user-detail-overlay" onClick={onClose}>
        <div className="user-detail-panel" onClick={e => e.stopPropagation()}>
            <div className="panel-header">
                <h3>User Profile</h3>
                <button onClick={onClose}>
                    <X size={16} />
                </button>
            </div>

            <div className="panel-content">
                {/* Identity */}
                <div className="identity-section">
                    <div className="panel-avatar">{user.avatar}</div>
                    <div className="identity-info">
                        <h4>{user.name}</h4>
                        <p className="email">{user.email}</p>
                        <p className="account-id">{user.id}</p>
                    </div>
                </div>

                {/* Status Badge */}
                <div className="badge-row">
                    <span className={`panel-badge ${user.status}`}>{user.status}</span>
                    <span className={`panel-badge type-${user.type.toLowerCase()}`}>{user.type}</span>
                    {user.isNew && <span className="panel-badge is-new">New Today</span>}
                </div>

                {/* Info Grid */}
                <div className="info-grid">
                    {[
                        { icon: MapPin, label: 'Location', value: `${user.city}, ${user.country}` },
                        { icon: Globe, label: 'IP Address', value: user.ip },
                        { icon: Smartphone, label: 'Device', value: user.device },
                        { icon: Globe, label: 'Browser', value: user.browser },
                        { icon: Clock, label: 'Joined', value: user.joined },
                        { icon: Clock, label: 'Last Seen', value: user.lastSeen },
                    ].map(({ icon: Icon, label, value }) => (
                        <div key={label} className="info-row">
                            <Icon size={13} className="info-icon" />
                            <span className="info-label">{label}</span>
                            <span className="info-value">{value}</span>
                        </div>
                    ))}
                </div>

                {/* Balance History Sparkline */}
                <div className="balance-card">
                    <div className="balance-header">
                        <div>
                            <p className="balance-title">Balance History (20 pts)</p>
                            <p className="balance-value">${user.balance.toLocaleString(undefined, { minimumFractionDigits: 2 })}</p>
                        </div>
                        <div>
                            {user.balanceHistory[user.balanceHistory.length - 1] >= user.balanceHistory[0]
                                ? <TrendingUp size={16} className='text-emerald-400' />
                                : <TrendingDown size={16} className='text-rose-400' />}
                        </div>
                    </div>
                    <ResponsiveContainer width='100%' height={60}>
                        <LineChart data={user.balanceHistory.map((v, i) => ({ i, v }))}>
                            <Line type='monotone' dataKey='v' stroke={user.balanceHistory[user.balanceHistory.length - 1] >= user.balanceHistory[0] ? '#10b981' : '#f43f5e'} strokeWidth={2} dot={false} />
                        </LineChart>
                    </ResponsiveContainer>
                </div>

                {/* Trading Stats */}
                <div className="stats-grid">
                    <div className="stat-box">
                        <p className="stat-label">Total Trades</p>
                        <p className="stat-val">{user.trades}</p>
                    </div>
                    <div className="stat-box">
                        <p className="stat-label">Win Rate</p>
                        <p className={`stat-val ${user.winRate >= 60 ? 'high' : user.winRate >= 50 ? 'mid' : 'low'}`}>{user.winRate.toFixed(1)}%</p>
                    </div>
                </div>

                {/* Admin Controls */}
                <div className="admin-controls">
                    <p className="controls-title">Admin Controls</p>
                    <button onClick={() => onAction('whitelist')} className="control-btn whitelist">
                        <ShieldCheck size={14} /> Whitelist Account
                    </button>
                    <button onClick={() => onAction('blacklist')} className="control-btn blacklist">
                        <AlertTriangle size={14} /> Blacklist Account
                    </button>
                    <button onClick={() => onAction('block')} className="control-btn block">
                        <ShieldX size={14} /> Block Account
                    </button>
                </div>
            </div>
        </div>
    </div>
);

// ----------- Main Users Page -----------
type UserFilter = 'All' | 'New' | 'Blocked' | 'Real' | 'Demo';

const AdminUsers = () => {
    const [search, setSearch] = useState('');
    const [filter, setFilter] = useState<UserFilter>('All');
    const [selected, setSelected] = useState<PlatformUser | null>(null);

    const filtered = useMemo(() => MOCK_USERS.filter(u => {
        const matchesSearch = u.name.toLowerCase().includes(search.toLowerCase()) ||
            u.email.toLowerCase().includes(search.toLowerCase()) ||
            u.id.toLowerCase().includes(search.toLowerCase());
        const matchesFilter = filter === 'All' ? true :
            filter === 'New' ? u.isNew :
            filter === 'Blocked' ? u.status === 'Blocked' :
            u.type === filter;
        return matchesSearch && matchesFilter;
    }), [search, filter]);

    const newCount = MOCK_USERS.filter(u => u.isNew).length;
    const blockedCount = MOCK_USERS.filter(u => u.status === 'Blocked').length;

    const handleAction = (action: string) => {
        console.log(`Admin action: ${action} on ${selected?.id}`);
        setSelected(null);
    };

    return (
        <div className="admin-users-page">
            {/* Header */}
            <div className="users-header">
                <h1 className="main-title">
                    USER <span className="highlight">MANAGEMENT</span>
                </h1>
                <p className="subtitle">
                    Platform kernel registry • {MOCK_USERS.length} registered nodes
                </p>
            </div>

            {/* Summary Badges */}
            <div className="filter-badges">
                {[
                    { key: 'All', label: 'All Users', count: MOCK_USERS.length, color: 'blue' },
                    { key: 'New', label: 'New Today', count: newCount, color: 'emerald' },
                    { key: 'Blocked', label: 'Blocked', count: blockedCount, color: 'rose' },
                    { key: 'Real', label: 'Real Accounts', count: MOCK_USERS.filter(u => u.type === 'Real').length, color: 'purple' },
                    { key: 'Demo', label: 'Demo Accounts', count: MOCK_USERS.filter(u => u.type === 'Demo').length, color: 'cyan' },
                ].map(({ key, label, count, color }) => (
                    <button
                        key={key}
                        onClick={() => setFilter(key as UserFilter)}
                        className={`filter-btn ${filter === key ? `active-${color}` : ''}`}
                    >
                        {label}
                        <span className="count-badge">{count}</span>
                    </button>
                ))}
            </div>

            {/* Search */}
            <div className="search-bar">
                <Search size={14} className="search-icon" />
                <input
                    placeholder="Search by name, email or account ID…"
                    value={search}
                    onChange={e => setSearch(e.target.value)}
                />
            </div>

            {/* Table */}
            <div className="table-container">
                <div className="table-scroll">
                    <table>
                        <thead>
                            <tr>
                                {['User', 'Account', 'Balance', 'History', 'Trades', 'Win %', 'Status', 'Last Seen', ''].map(h => (
                                    <th key={h}>{h}</th>
                                ))}
                            </tr>
                        </thead>
                        <tbody>
                            {filtered.map(user => (
                                <tr key={user.id} onClick={() => setSelected(user)}>
                                    <td>
                                        <div className="user-cell">
                                            <div className="avatar">{user.avatar}</div>
                                            <div className="user-info">
                                                <div className="name-row">
                                                    <p className="name">{user.name}</p>
                                                    {user.isNew && <span className="new-dot" />}
                                                </div>
                                                <p className="email">{user.email}</p>
                                            </div>
                                        </div>
                                    </td>
                                    <td>
                                        <div className="account-cell">
                                            <p className="account-id">{user.id}</p>
                                            <span className={`account-type ${user.type.toLowerCase()}`}>{user.type}</span>
                                        </div>
                                    </td>
                                    <td>
                                        <p className="balance-cell">${user.balance.toLocaleString(undefined, { minimumFractionDigits: 2 })}</p>
                                    </td>
                                    <td>
                                        <Sparkline data={user.balanceHistory} />
                                    </td>
                                    <td>
                                        <p className="trades-cell">{user.trades}</p>
                                    </td>
                                    <td>
                                        <p className={`winrate-cell ${user.winRate >= 60 ? 'high' : user.winRate >= 50 ? 'mid' : user.winRate === 0 ? 'none' : 'low'}`}>
                                            {user.winRate > 0 ? `${user.winRate}%` : '—'}
                                        </p>
                                    </td>
                                    <td>
                                        <span className={`status-badge ${user.status}`}>{user.status}</span>
                                    </td>
                                    <td>
                                        <p className="last-seen">{user.lastSeen}</p>
                                    </td>
                                    <td>
                                        <ChevronRight size={14} className="action-cell" />
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
                {filtered.length === 0 && (
                    <div className="empty-state">
                        <User size={32} className="empty-icon" />
                        <p>No users match your search</p>
                    </div>
                )}
            </div>

            {/* Detail Panel */}
            {selected && <UserDetailPanel user={selected} onClose={() => setSelected(null)} onAction={handleAction} />}
        </div>
    );
};

export default AdminUsers;
