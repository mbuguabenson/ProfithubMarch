import React, { useState, useMemo } from 'react';
import {
    Search,
    ShieldCheck,
    ShieldX,
    User,
    MapPin,
    Smartphone,
    Clock,
    Globe,
    ChevronRight,
    X,
    TrendingUp,
    TrendingDown,
    AlertTriangle,
    RefreshCw,
} from 'lucide-react';
import { observer } from 'mobx-react-lite';
import { LineChart, Line, ResponsiveContainer, Tooltip } from 'recharts';
import { useStore } from '@/hooks/useStore';
import { PlatformUser } from '@/stores/admin-store';
import '../admin-users.scss';

// ----------- Sparkline -----------
const Sparkline = ({ data }: { data: number[] }) => (
    <ResponsiveContainer width={80} height={30}>
        <LineChart data={data.map((v, i) => ({ i, v }))}>
            <Line
                type='monotone'
                dataKey='v'
                stroke={data[data.length - 1] >= data[0] ? '#10b981' : '#f43f5e'}
                strokeWidth={1.5}
                dot={false}
            />
            <Tooltip contentStyle={{ display: 'none' }} />
        </LineChart>
    </ResponsiveContainer>
);

// ----------- Loading Skeleton -----------
const TableSkeleton = () => (
    <div style={{ padding: '2rem' }}>
        {Array.from({ length: 6 }).map((_, i) => (
            <div
                key={i}
                style={{
                    display: 'flex',
                    gap: '1rem',
                    marginBottom: '1rem',
                    padding: '1.25rem',
                    borderRadius: '16px',
                    background: 'rgba(255,255,255,0.02)',
                    border: '1px solid rgba(255,255,255,0.05)',
                    animation: 'pulse 1.5s ease-in-out infinite',
                }}
            >
                <div style={{ width: 44, height: 44, borderRadius: '50%', background: 'rgba(255,255,255,0.08)' }} />
                <div style={{ flex: 1 }}>
                    <div
                        style={{
                            height: 12,
                            width: '40%',
                            background: 'rgba(255,255,255,0.08)',
                            borderRadius: 6,
                            marginBottom: 8,
                        }}
                    />
                    <div style={{ height: 10, width: '60%', background: 'rgba(255,255,255,0.05)', borderRadius: 6 }} />
                </div>
            </div>
        ))}
    </div>
);

// ----------- User Detail Panel -----------
const UserDetailPanel = ({
    user,
    onClose,
    onAction,
}: {
    user: PlatformUser;
    onClose: () => void;
    onAction: (action: string) => void;
}) => (
    <div className='user-detail-overlay' onClick={onClose}>
        <div className='user-detail-panel' onClick={e => e.stopPropagation()}>
            <div className='panel-header'>
                <h3>User Profile</h3>
                <button onClick={onClose}>
                    <X size={16} />
                </button>
            </div>

            <div className='panel-content'>
                {/* Identity */}
                <div className='identity-section'>
                    <div className='panel-avatar'>{user.avatar}</div>
                    <div className='identity-info'>
                        <h4>{user.name}</h4>
                        <p className='email'>{user.email}</p>
                        <p className='account-id'>{user.id}</p>
                    </div>
                </div>

                {/* Status */}
                <div className='badge-row'>
                    <span className={`panel-badge ${user.status}`}>{user.status}</span>
                    <span className={`panel-badge type-${user.type.toLowerCase()}`}>{user.type}</span>
                    {user.isNew && <span className='panel-badge is-new'>New Today</span>}
                </div>

                {/* Info Grid */}
                <div className='info-grid'>
                    {[
                        { icon: MapPin, label: 'Country', value: user.country },
                        { icon: Globe, label: 'Currency', value: user.currency },
                        { icon: Smartphone, label: 'Device', value: user.device },
                        { icon: Globe, label: 'IP', value: user.ip },
                        { icon: Clock, label: 'Joined', value: user.joined },
                        { icon: Clock, label: 'Last Seen', value: user.lastSeen },
                    ].map(({ icon: Icon, label, value }) => (
                        <div key={label} className='info-row'>
                            <Icon size={13} className='info-icon' />
                            <span className='info-label'>{label}</span>
                            <span className='info-value'>{value}</span>
                        </div>
                    ))}
                </div>

                {/* Balance History */}
                <div className='balance-card'>
                    <div className='balance-header'>
                        <div>
                            <p className='balance-title'>Balance History (Est.)</p>
                            <p className='balance-value'>
                                ${user.balance.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                            </p>
                        </div>
                        <div>
                            {user.balanceHistory[user.balanceHistory.length - 1] >= user.balanceHistory[0] ? (
                                <TrendingUp size={16} className='text-emerald-400' />
                            ) : (
                                <TrendingDown size={16} className='text-rose-400' />
                            )}
                        </div>
                    </div>
                    <ResponsiveContainer width='100%' height={60}>
                        <LineChart data={user.balanceHistory.map((v, i) => ({ i, v }))}>
                            <Line
                                type='monotone'
                                dataKey='v'
                                stroke={
                                    user.balanceHistory[user.balanceHistory.length - 1] >= user.balanceHistory[0]
                                        ? '#10b981'
                                        : '#f43f5e'
                                }
                                strokeWidth={2}
                                dot={false}
                            />
                        </LineChart>
                    </ResponsiveContainer>
                </div>

                {/* Trading Stats */}
                <div className='stats-grid'>
                    <div className='stat-box'>
                        <p className='stat-label'>Total Trades</p>
                        <p className='stat-val'>{user.trades}</p>
                    </div>
                    <div className='stat-box'>
                        <p className='stat-label'>Win Rate</p>
                        <p className={`stat-val ${user.winRate >= 60 ? 'high' : user.winRate >= 50 ? 'mid' : 'low'}`}>
                            {user.winRate > 0 ? `${user.winRate.toFixed(1)}%` : '—'}
                        </p>
                    </div>
                </div>

                {/* Admin Controls */}
                <div className='admin-controls'>
                    <p className='controls-title'>Admin Controls</p>
                    <button onClick={() => onAction('whitelist')} className='control-btn whitelist'>
                        <ShieldCheck size={14} /> Whitelist Account
                    </button>
                    <button onClick={() => onAction('blacklist')} className='control-btn blacklist'>
                        <AlertTriangle size={14} /> Flag Account
                    </button>
                    <button onClick={() => onAction('block')} className='control-btn block'>
                        <ShieldX size={14} /> Block Account
                    </button>
                </div>
            </div>
        </div>
    </div>
);

// ----------- Main Users Page -----------
type UserFilter = 'All' | 'New' | 'Blocked' | 'Real' | 'Demo';

const AdminUsers = observer(() => {
    const { admin } = useStore();
    const [search, setSearch] = useState('');
    const [filter, setFilter] = useState<UserFilter>('All');
    const [selected, setSelected] = useState<PlatformUser | null>(null);

    const users = admin.users;

    const filtered = useMemo(
        () =>
            users.filter(u => {
                const matchesSearch =
                    u.name.toLowerCase().includes(search.toLowerCase()) ||
                    u.email.toLowerCase().includes(search.toLowerCase()) ||
                    u.id.toLowerCase().includes(search.toLowerCase());
                const matchesFilter =
                    filter === 'All'
                        ? true
                        : filter === 'New'
                          ? u.isNew
                          : filter === 'Blocked'
                            ? u.status === 'Blocked'
                            : u.type === filter;
                return matchesSearch && matchesFilter;
            }),
        [users, search, filter]
    );

    const newCount = users.filter(u => u.isNew).length;
    const blockedCount = users.filter(u => u.status === 'Blocked').length;

    const handleAction = async (action: string) => {
        if (!selected) return;
        if (action === 'block') {
            await admin.blockUser(selected.loginid);
        } else if (action === 'whitelist') {
            await admin.whitelistUser(selected.loginid);
        } else if (action === 'blacklist') {
            await admin.blockUser(selected.loginid);
        }
        setSelected(null);
    };

    return (
        <div className='admin-users-page'>
            {/* Header */}
            <div className='users-header'>
                <h1 className='main-title'>
                    USER <span className='highlight'>MANAGEMENT</span>
                </h1>
                <p className='subtitle'>
                    Platform kernel registry • {admin.isLoading ? 'Loading...' : `${users.length} registered nodes`}
                </p>
                <button
                    onClick={() => admin.fetchPlatformData()}
                    style={{
                        marginTop: '1rem',
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '0.5rem',
                        padding: '0.5rem 1.5rem',
                        background: 'rgba(255,255,255,0.05)',
                        border: '1px solid rgba(255,255,255,0.08)',
                        borderRadius: '12px',
                        color: '#94a3b8',
                        fontSize: '0.7rem',
                        fontWeight: 700,
                        textTransform: 'uppercase',
                        letterSpacing: '0.1em',
                        cursor: 'pointer',
                        transition: 'all 0.2s',
                    }}
                >
                    <RefreshCw size={12} className={admin.isLoading ? 'spin' : ''} />
                    Refresh
                </button>
            </div>

            {/* Filter Badges */}
            <div className='filter-badges'>
                {[
                    { key: 'All', label: 'All Users', count: users.length, color: 'blue' },
                    { key: 'New', label: 'New Today', count: newCount, color: 'emerald' },
                    { key: 'Blocked', label: 'Blocked', count: blockedCount, color: 'rose' },
                    {
                        key: 'Real',
                        label: 'Real Accounts',
                        count: users.filter(u => u.type === 'Real').length,
                        color: 'purple',
                    },
                    {
                        key: 'Demo',
                        label: 'Demo Accounts',
                        count: users.filter(u => u.type === 'Demo').length,
                        color: 'cyan',
                    },
                ].map(({ key, label, count, color }) => (
                    <button
                        key={key}
                        onClick={() => setFilter(key as UserFilter)}
                        className={`filter-btn ${filter === key ? `active-${color}` : ''}`}
                    >
                        {label}
                        <span className='count-badge'>{count}</span>
                    </button>
                ))}
            </div>

            {/* Search */}
            <div className='search-bar'>
                <Search size={14} className='search-icon' />
                <input
                    placeholder='Search by name, email or account ID…'
                    value={search}
                    onChange={e => setSearch(e.target.value)}
                />
            </div>

            {/* Table */}
            <div className='table-container'>
                {admin.isLoading ? (
                    <TableSkeleton />
                ) : (
                    <div className='table-scroll'>
                        <table>
                            <thead>
                                <tr>
                                    {[
                                        'User',
                                        'Account',
                                        'Currency',
                                        'History',
                                        'Country',
                                        'Status',
                                        'Last Seen',
                                        '',
                                    ].map(h => (
                                        <th key={h}>{h}</th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody>
                                {filtered.length === 0 ? (
                                    <tr>
                                        <td colSpan={8}>
                                            <div className='empty-state'>
                                                <User size={32} className='empty-icon' />
                                                <p>
                                                    {users.length === 0
                                                        ? 'No users found in database'
                                                        : 'No users match your search'}
                                                </p>
                                            </div>
                                        </td>
                                    </tr>
                                ) : (
                                    filtered.map(user => (
                                        <tr key={user.id} onClick={() => setSelected(user)}>
                                            <td>
                                                <div className='user-cell'>
                                                    <div className='avatar'>{user.avatar}</div>
                                                    <div className='user-info'>
                                                        <div className='name-row'>
                                                            <p className='name'>{user.name}</p>
                                                            {user.isNew && <span className='new-dot' />}
                                                        </div>
                                                        <p className='email'>{user.email}</p>
                                                    </div>
                                                </div>
                                            </td>
                                            <td>
                                                <div className='account-cell'>
                                                    <p className='account-id'>{user.id}</p>
                                                    <span className={`account-type ${user.type.toLowerCase()}`}>
                                                        {user.type}
                                                    </span>
                                                </div>
                                            </td>
                                            <td>
                                                <p className='balance-cell'>{user.currency}</p>
                                            </td>
                                            <td>
                                                <Sparkline data={user.balanceHistory} />
                                            </td>
                                            <td>
                                                <p className='trades-cell'>{user.country}</p>
                                            </td>
                                            <td>
                                                <span className={`status-badge ${user.status}`}>{user.status}</span>
                                            </td>
                                            <td>
                                                <p className='last-seen'>{user.lastSeen}</p>
                                            </td>
                                            <td>
                                                <ChevronRight size={14} className='action-cell' />
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            {/* Detail Panel */}
            {selected && <UserDetailPanel user={selected} onClose={() => setSelected(null)} onAction={handleAction} />}
        </div>
    );
});

export default AdminUsers;
