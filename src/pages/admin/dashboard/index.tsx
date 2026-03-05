import React, { useRef, useState } from 'react';
import {
    Activity,
    ArrowDownRight,
    ArrowUpRight,
    DollarSign,
    Download,
    RefreshCw,
    TrendingUp,
    Users,
} from 'lucide-react';
import { toJS } from 'mobx';
import { observer } from 'mobx-react-lite';
import {
    Area,
    AreaChart,
    CartesianGrid,
    Cell,
    Pie,
    PieChart,
    ResponsiveContainer,
    Tooltip,
    XAxis,
    YAxis,
} from 'recharts';
import { useStore } from '@/hooks/useStore';
import '../admin-dashboard.scss';

// ----------- Custom Tooltip -----------
const ChartTooltip = ({
    active,
    payload,
    label,
}: {
    active?: boolean;
    payload?: { color?: string; name?: string; value: number | string; payload?: Record<string, unknown> }[];
    label?: string;
}) => {
    if (!active || !payload?.length) return null;
    return (
        <div
            style={{
                background: '#0d1117',
                border: '1px solid rgba(255,255,255,0.1)',
                borderRadius: '16px',
                padding: '16px',
                backdropFilter: 'blur(10px)',
            }}
        >
            <p
                style={{
                    color: '#64748b',
                    fontSize: '9px',
                    fontWeight: 900,
                    textTransform: 'uppercase',
                    letterSpacing: '2px',
                    margin: '0 0 8px 0',
                }}
            >
                {label}
            </p>
            {payload.map((entry: { color?: string; name?: string; value: number | string }, i: number) => (
                <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '2px 0' }}>
                    <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: entry.color }} />
                    <p
                        style={{
                            color: '#94a3b8',
                            fontSize: '10px',
                            fontWeight: 900,
                            textTransform: 'uppercase',
                            letterSpacing: '1px',
                            margin: 0,
                        }}
                    >
                        {entry.name}
                    </p>
                    <p
                        style={{
                            color: 'white',
                            fontSize: '11px',
                            fontWeight: 900,
                            fontFamily: 'monospace',
                            marginLeft: 'auto',
                            marginBottom: 0,
                        }}
                    >
                        ${(entry.value as number).toLocaleString()}
                    </p>
                </div>
            ))}
        </div>
    );
};

// ----------- KPI Card -----------
interface KPIProps {
    title: string;
    value: string | number;
    detail: string;
    trend: 'up' | 'down';
    pct: number;
    color: string;
    icon: React.ElementType;
}
const KPICard = ({ title, value, detail, trend, pct, color, icon: Icon }: KPIProps) => (
    <div className={`kpi-card ${color}`}>
        <div className='kpi-glow' />
        <div className={`kpi-header ${color}`}>
            <div className='icon-box'>
                <Icon />
            </div>
            <div className={`trend-badge ${trend}`}>
                {trend === 'up' ? <ArrowUpRight size={11} /> : <ArrowDownRight size={11} />}
                {pct}%
            </div>
        </div>
        <div className='kpi-content'>
            <div className='kpi-title'>{title}</div>
            <div className='kpi-value'>{typeof value === 'number' ? value.toLocaleString() : value}</div>
            <div className='kpi-detail'>{detail}</div>
        </div>
        <div className='kpi-bottom-glow' />
    </div>
);

// ----------- Live Activity Feed -----------
const LiveFeed = observer(() => {
    const { admin } = useStore();
    const feedRef = useRef<HTMLDivElement>(null);

    return (
        <div className='live-feed-panel'>
            <div className='feed-glow' />
            <div className='feed-header'>
                <div className='feed-title'>
                    <h3>Live Activity</h3>
                    <p>Real-time event stream</p>
                </div>
                <div className='streaming-badge'>
                    <div className='dot' />
                    <span>{admin.isLoading ? 'Fetching...' : 'Live'}</span>
                </div>
            </div>
            <div ref={feedRef} className='feed-list'>
                {admin.live_activity.length > 0 ? (
                    admin.live_activity.map((ev, i) => (
                        <div key={ev.id || i} className={`feed-item ${i === 0 ? 'newest' : 'older'}`}>
                            <div className={`event-dot ${ev.color || 'blue'}`} />
                            <div className='event-content'>
                                <span className={`event-type ${ev.color || 'blue'}`}>{ev.action || 'SYNC'}</span>
                                <span className='event-msg'>
                                    {ev.user} — {ev.action}
                                </span>
                            </div>
                            <div className='event-time'>{ev.time}</div>
                        </div>
                    ))
                ) : (
                    <div className='empty-feed'>
                        <Activity size={24} className='icon-pulse' />
                        <p>{admin.isLoading ? 'Connecting to stream...' : 'No activity yet'}</p>
                    </div>
                )}
            </div>
        </div>
    );
});

// ----------- Main Admin Dashboard -----------
const CHART_DATA_MONTHLY = [
    { name: 'Oct', profit: 38000, loss: 18000 },
    { name: 'Nov', profit: 45000, loss: 22000 },
    { name: 'Dec', profit: 52000, loss: 14000 },
    { name: 'Jan', profit: 61000, loss: 31000 },
    { name: 'Feb', profit: 55000, loss: 25000 },
    { name: 'Mar', profit: 67000, loss: 19000 },
];
const CHART_DATA_WEEKLY = [
    { name: 'Wk1', profit: 14000, loss: 6000 },
    { name: 'Wk2', profit: 18000, loss: 9000 },
    { name: 'Wk3', profit: 12000, loss: 4000 },
    { name: 'Wk4', profit: 23000, loss: 7000 },
];
const CHART_DATA_DAILY = [
    { name: 'Mon', profit: 3200, loss: 1200 },
    { name: 'Tue', profit: 4800, loss: 2200 },
    { name: 'Wed', profit: 2900, loss: 900 },
    { name: 'Thu', profit: 6100, loss: 3100 },
    { name: 'Fri', profit: 5400, loss: 2400 },
    { name: 'Sat', profit: 1800, loss: 500 },
];

const CURVE_TYPES = ['monotone', 'linear', 'step'] as const;
type CurveType = (typeof CURVE_TYPES)[number];
type Period = 'Daily' | 'Weekly' | 'Monthly';
type AccType = 'All' | 'Real' | 'Demo';

const AdminDashboard = observer(() => {
    const { admin } = useStore();
    const [period, setPeriod] = useState<Period>('Monthly');
    const [accType, setAccType] = useState<AccType>('All');
    const [curve, setCurve] = useState<CurveType>('monotone');

    const chartData =
        period === 'Daily' ? CHART_DATA_DAILY : period === 'Weekly' ? CHART_DATA_WEEKLY : CHART_DATA_MONTHLY;

    return (
        <div className='admin-dashboard-page'>
            <div className='dashboard-header'>
                <div className='header-title-container'>
                    <div className='title-accent-bar' />
                    <h1 className='main-title'>
                        CORE <span className='highlight'>COMMAND</span>
                        <span className='version'>v5.0</span>
                    </h1>
                    <div className='status-text'>
                        <div className='dot' />
                        Node Active • Real-Time Propagation Online
                    </div>
                </div>
                <div className='header-actions'>
                    <button className='btn-outline'>
                        <Download size={14} /> Export Ledger
                    </button>
                    <button className='btn-primary'>
                        <RefreshCw size={14} /> Sync Nodes
                    </button>
                </div>
            </div>

            <div className='kpi-grid'>
                <KPICard
                    title='Active Users'
                    value={admin.isLoading ? '...' : admin.active_users.toLocaleString()}
                    detail='Platform-wide registered nodes'
                    trend='up'
                    pct={admin.user_growth || 8.2}
                    color='blue'
                    icon={Users}
                />
                <KPICard
                    title='New Today'
                    value={admin.isLoading ? '...' : admin.new_users_today.toLocaleString()}
                    detail='Accounts created today'
                    trend={admin.new_users_today > 0 ? 'up' : 'down'}
                    pct={admin.new_users_today > 0 ? 15.3 : 0}
                    color='emerald'
                    icon={DollarSign}
                />
                <KPICard
                    title='Total Nodes'
                    value={admin.isLoading ? '...' : admin.total_users.toLocaleString()}
                    detail='All registered users'
                    trend='up'
                    pct={admin.user_growth || 3.4}
                    color='cyan'
                    icon={TrendingUp}
                />
                <KPICard
                    title='Trading Volume'
                    value={
                        admin.total_volume >= 1e6
                            ? `$${(admin.total_volume / 1e6).toFixed(2)}M`
                            : `$${(admin.total_volume / 1000).toFixed(0)}K`
                    }
                    detail='Estimated 30-day volume'
                    trend='up'
                    pct={24.1}
                    color='purple'
                    icon={Activity}
                />
            </div>

            <div className='middle-section'>
                <div className='chart-panel'>
                    <div className='chart-glow' />
                    <div className='chart-header'>
                        <div className='chart-title-group'>
                            <h3>SYSTEM PERFORMANCE</h3>
                            <p>Global P&L Trend Analysis</p>
                        </div>
                        <div className='chart-filters'>
                            <div className='filter-group'>
                                {(['Daily', 'Weekly', 'Monthly'] as Period[]).map(p => (
                                    <button
                                        key={p}
                                        onClick={() => setPeriod(p)}
                                        className={period === p ? 'active-blue' : ''}
                                    >
                                        {p}
                                    </button>
                                ))}
                            </div>
                            <div className='filter-group'>
                                {(['All', 'Real', 'Demo'] as AccType[]).map(a => (
                                    <button
                                        key={a}
                                        onClick={() => setAccType(a)}
                                        className={accType === a ? 'active-purple' : ''}
                                    >
                                        {a}
                                    </button>
                                ))}
                            </div>
                            <div className='filter-group'>
                                {CURVE_TYPES.map(c => (
                                    <button
                                        key={c}
                                        onClick={() => setCurve(c)}
                                        className={curve === c ? 'active-cyan' : ''}
                                    >
                                        {c}
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>

                    <div className='chart-container-wrapper'>
                        <ResponsiveContainer width='100%' height='100%'>
                            <AreaChart data={chartData} margin={{ top: 10, right: 20, left: 0, bottom: 0 }}>
                                <defs>
                                    <linearGradient id='gProfit' x1='0' y1='0' x2='0' y2='1'>
                                        <stop offset='5%' stopColor='#3b82f6' stopOpacity={0.4} />
                                        <stop offset='95%' stopColor='#3b82f6' stopOpacity={0} />
                                    </linearGradient>
                                    <linearGradient id='gLoss' x1='0' y1='0' x2='0' y2='1'>
                                        <stop offset='5%' stopColor='#f43f5e' stopOpacity={0.3} />
                                        <stop offset='95%' stopColor='#f43f5e' stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid
                                    strokeDasharray='12 12'
                                    stroke='rgba(255,255,255,0.02)'
                                    vertical={false}
                                />
                                <XAxis
                                    dataKey='name'
                                    axisLine={false}
                                    tickLine={false}
                                    tick={{ fill: '#475569', fontSize: 9, fontWeight: 900 }}
                                    dy={12}
                                />
                                <YAxis
                                    axisLine={false}
                                    tickLine={false}
                                    tick={{ fill: '#475569', fontSize: 9, fontWeight: 900 }}
                                    tickFormatter={(v: number) => `$${v / 1000}k`}
                                />
                                <Tooltip content={<ChartTooltip />} />
                                <Area
                                    type={curve}
                                    dataKey='profit'
                                    name='Profit'
                                    stroke='#3b82f6'
                                    strokeWidth={2.5}
                                    fillOpacity={1}
                                    fill='url(#gProfit)'
                                    dot={false}
                                    animationDuration={1500}
                                />
                                {accType !== 'Demo' && (
                                    <Area
                                        type={curve}
                                        dataKey='loss'
                                        name='Loss'
                                        stroke='#f43f5e'
                                        strokeWidth={1.5}
                                        fillOpacity={1}
                                        fill='url(#gLoss)'
                                        dot={false}
                                        animationDuration={1800}
                                    />
                                )}
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                <LiveFeed />
            </div>

            <div className='bottom-section'>
                <div className='distribution-panel'>
                    <div className='dist-glow' />
                    <h3>Node Distribution</h3>
                    <p>Recursive segmental allocation</p>

                    <div className='pie-wrapper'>
                        <ResponsiveContainer width='100%' height='100%'>
                            <PieChart>
                                <Pie
                                    data={toJS(admin.market_distribution)}
                                    cx='50%'
                                    cy='50%'
                                    innerRadius={65}
                                    outerRadius={90}
                                    paddingAngle={8}
                                    dataKey='value'
                                    stroke='none'
                                    animationBegin={200}
                                    animationDuration={1500}
                                >
                                    {toJS(admin.market_distribution).map((entry: { color: string }, index: number) => (
                                        <Cell key={`cell-${index}`} fill={entry.color} />
                                    ))}
                                </Pie>
                                <Tooltip
                                    contentStyle={{
                                        background: '#0d1117',
                                        border: '1px solid rgba(255,255,255,0.1)',
                                        borderRadius: 12,
                                        fontSize: 11,
                                    }}
                                />
                            </PieChart>
                        </ResponsiveContainer>
                        <div className='pie-center-label'>
                            <span className='percent'>100%</span>
                            <span className='label-text'>Nodes</span>
                        </div>
                    </div>

                    <div className='legend-list'>
                        {toJS(admin.market_distribution).map(
                            (item: { name: string; value: number; color: string }, idx: number) => (
                                <div key={idx} className='legend-item' style={{ borderLeftColor: item.color }}>
                                    <span className='item-name'>{item.name}</span>
                                    <span className='item-value'>{item.value}%</span>
                                </div>
                            )
                        )}
                    </div>
                </div>

                <div className='telemetry-panel'>
                    <div className='telemetry-glow' />
                    <h3>Telemetry Node</h3>
                    <p>Global kernel health matrix</p>

                    <div className='telemetry-grid'>
                        {[
                            {
                                label: 'Latency',
                                value: `${admin.latency.toFixed(0)}ms`,
                                status: admin.latency < 50 ? 'Optimal' : 'Active',
                                color: admin.latency < 50 ? 'emerald' : 'blue',
                                pct: (admin.latency / 150) * 100,
                            },
                            {
                                label: 'CPU Load',
                                value: `${admin.cpu_load.toFixed(1)}%`,
                                status: admin.cpu_load < 70 ? 'Stable' : 'High',
                                color: admin.cpu_load < 70 ? 'blue' : 'rose',
                                pct: admin.cpu_load,
                            },
                            {
                                label: 'Memory',
                                value: `${admin.memory_usage.toFixed(1)} GB`,
                                status: 'Healthy',
                                color: 'purple',
                                pct: (admin.memory_usage / 16) * 100,
                            },
                            {
                                label: 'Sync',
                                value: `${admin.sync_status}%`,
                                status: 'Active',
                                color: 'emerald',
                                pct: admin.sync_status,
                            },
                        ].map((stat, idx) => (
                            <div key={idx} className='stat-box'>
                                <div className='stat-header'>
                                    <span className='stat-label'>{stat.label}</span>
                                    <span className={`stat-status ${stat.color}`}>{stat.status}</span>
                                </div>
                                <div className='stat-value'>{stat.value}</div>
                                <div className='progress-bg'>
                                    <div
                                        className={`progress-bar ${stat.color}`}
                                        style={{ width: `${Math.min(100, stat.pct)}%` }}
                                    />
                                </div>
                            </div>
                        ))}
                    </div>

                    <button className='reboot-btn'>
                        <div className='btn-bg' />
                        <span>⚡ Emergency Core Reboot</span>
                    </button>
                </div>
            </div>
        </div>
    );
});

export default AdminDashboard;
