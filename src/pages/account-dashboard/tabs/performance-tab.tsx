import React, { useEffect, useState } from 'react';
import { Activity, Calendar, TrendingDown, TrendingUp } from 'lucide-react';
import { observer } from 'mobx-react-lite';
import {
    Area,
    AreaChart,
    Bar,
    BarChart,
    CartesianGrid,
    ResponsiveContainer,
    Tooltip,
    TooltipProps,
    XAxis,
    YAxis,
} from 'recharts';
import derivApiService from '@/lib/deriv-api-service';
import { useStore } from '@/hooks/useStore';
import './account-tabs.scss';

type Range = 'Daily' | 'Weekly' | 'Growth';

interface DataPoint {
    date: string;
    pnl?: number;
    balance?: number;
    [key: string]: string | number | undefined;
}

const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
        const val = payload[0].value;
        return (
            <div className='glass-card tooltip-card' style={{ padding: '1rem', minWidth: '140px' }}>
                <p className='card-subtitle mb-2'>{label}</p>
                <p
                    className={`font-black text-lg ${val >= 0 ? 'up' : 'down'}`}
                    style={{ color: val >= 0 ? '#34d399' : '#fb7185' }}
                >
                    {val >= 0 ? '+' : ''}${val.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                </p>
                <div className='tooltip-line' />
            </div>
        );
    }
    return null;
};

const PerformanceTab = observer(() => {
    const { client } = useStore();
    const [range, setRange] = useState<Range>('Daily');
    const [dailyData, setDailyData] = useState<DataPoint[]>([]);
    const [weeklyData, setWeeklyData] = useState<DataPoint[]>([]);
    const [growthData, setGrowthData] = useState<DataPoint[]>([]);

    useEffect(() => {
        const fetchProfitTable = async () => {
            try {
                const res = await derivApiService.sendRequest({ profit_table: 1, description: 1, limit: 1000 });
                if (res.profit_table?.transactions) {
                    const txs = res.profit_table.transactions as any[];
                    const dailyMap = new Map<string, number>();

                    txs.forEach(t => {
                        const dateObj = new Date(t.sell_time * 1000);
                        const dayKey = dateObj.toLocaleDateString('en-US', { month: 'short', day: '2-digit' });
                        const pnl = Number(t.sell_price) - Number(t.buy_price);
                        dailyMap.set(dayKey, (dailyMap.get(dayKey) || 0) + pnl);
                    });

                    let sortedDaily = Array.from(dailyMap.entries()).map(([date, pnl]) => ({ date, pnl }));
                    sortedDaily = sortedDaily.reverse();

                    let currentBalance = parseFloat(client?.balance || '0');
                    const finalGrowth = sortedDaily.map(d => {
                        currentBalance += d.pnl;
                        return { date: d.date, balance: currentBalance };
                    });

                    setDailyData(sortedDaily.length ? sortedDaily : [{ date: 'Today', pnl: 0 }]);
                    setGrowthData(finalGrowth.length ? finalGrowth : [{ date: 'Today', balance: currentBalance }]);

                    setWeeklyData(sortedDaily.length ? sortedDaily : [{ date: 'Week 1', pnl: 0 }]);
                }
            } catch (err) {
                console.error('[PerformanceTab] Failed to fetch profit table:', err);
            }
        };
        fetchProfitTable();
    }, [client?.balance]);

    const totalPnl = dailyData.reduce((s, d) => s + (d.pnl || 0), 0);
    const winDays = dailyData.filter(d => d.pnl !== undefined && d.pnl > 0).length;
    const lossDays = dailyData.filter(d => d.pnl !== undefined && d.pnl < 0).length;
    const bestDay = dailyData.length ? Math.max(...dailyData.map(d => d.pnl || 0)) : 0;

    const chartData = range === 'Daily' ? dailyData : range === 'Weekly' ? weeklyData : growthData;
    const dataKey = range === 'Growth' ? 'balance' : 'pnl';

    return (
        <div className='account-tab-wrapper'>
            <div className='grid-4'>
                {[
                    {
                        label: 'Net Alpha P&L',
                        value: `+$${totalPnl.toLocaleString()}`,
                        color: 'emerald',
                        icon: TrendingUp as any,
                    },
                    { label: 'Green Days', value: winDays, color: 'blue', icon: Activity as any },
                    { label: 'Red Days', value: lossDays, color: 'rose', icon: TrendingDown as any },
                    {
                        label: 'Peak Alpha',
                        value: `+$${bestDay.toLocaleString()}`,
                        color: 'purple',
                        icon: Calendar as any,
                    },
                ].map((kpi, i) => {
                    const Icon = kpi.icon;
                    return (
                        <div key={i} className={`metric-badge color-${kpi.color} hoverable`}>
                            <div className='badge-glow' />
                            <div className='icon-box'>
                                <Icon size={16} />
                            </div>
                            <div className='metric-info'>
                                <p className='metric-label'>{kpi.label}</p>
                                <p className='metric-value'>{kpi.value}</p>
                            </div>
                        </div>
                    );
                })}
            </div>

            <div className='glass-card chart-container'>
                <div
                    className='card-bg-glow top-right blue'
                    style={{ width: '400px', height: '400px', filter: 'blur(120px)', opacity: 0.15 }}
                />

                <div className='chart-header'>
                    <div className='title-group'>
                        <h3 className='card-title'>Performance Journey</h3>
                        <p className='card-subtitle'>Algorithmic growth & Profit/Loss metrics</p>
                    </div>
                    <div className='chart-toggle'>
                        {(['Daily', 'Weekly', 'Growth'] as Range[]).map(r => (
                            <button key={r} onClick={() => setRange(r)} className={range === r ? 'active' : ''}>
                                {r}
                            </button>
                        ))}
                    </div>
                </div>

                <div className='chart-wrapper' style={{ height: '320px', marginTop: '1.5rem' }}>
                    <ResponsiveContainer width='100%' height='100%'>
                        {range === 'Daily' || range === 'Growth' ? (
                            <AreaChart data={chartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                                <defs>
                                    <linearGradient id='gradPerf' x1='0' y1='0' x2='0' y2='1'>
                                        <stop offset='5%' stopColor='#3b82f6' stopOpacity={0.2} />
                                        <stop offset='95%' stopColor='#3b82f6' stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid
                                    strokeDasharray='12 12'
                                    stroke='rgba(255,255,255,0.02)'
                                    vertical={false}
                                />
                                <XAxis
                                    dataKey='date'
                                    axisLine={false}
                                    tickLine={false}
                                    tick={{ fill: '#475569', fontSize: 10, fontWeight: 800 }}
                                    dy={15}
                                />
                                <YAxis
                                    axisLine={false}
                                    tickLine={false}
                                    tick={{ fill: '#475569', fontSize: 10, fontWeight: 800 }}
                                    tickFormatter={v => `$${Math.abs(v) >= 1000 ? (v / 1000).toFixed(1) + 'k' : v}`}
                                />
                                <Tooltip
                                    content={<CustomTooltip />}
                                    cursor={{ stroke: 'rgba(255,255,255,0.1)', strokeWidth: 1 }}
                                />
                                <Area
                                    type='monotone'
                                    dataKey={dataKey}
                                    stroke='#3b82f6'
                                    strokeWidth={3}
                                    fillOpacity={1}
                                    fill='url(#gradPerf)'
                                    dot={{ fill: '#3b82f6', r: 4, strokeWidth: 2, stroke: '#050505' }}
                                    activeDot={{ r: 6, strokeWidth: 0 }}
                                    animationDuration={1500}
                                />
                            </AreaChart>
                        ) : (
                            <BarChart data={chartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                                <CartesianGrid
                                    strokeDasharray='12 12'
                                    stroke='rgba(255,255,255,0.02)'
                                    vertical={false}
                                />
                                <XAxis
                                    dataKey='date'
                                    axisLine={false}
                                    tickLine={false}
                                    tick={{ fill: '#475569', fontSize: 10, fontWeight: 800 }}
                                    dy={15}
                                />
                                <YAxis
                                    axisLine={false}
                                    tickLine={false}
                                    tick={{ fill: '#475569', fontSize: 10, fontWeight: 800 }}
                                    tickFormatter={v => `$${v}`}
                                />
                                <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(255,255,255,0.02)' }} />
                                <Bar
                                    dataKey={dataKey}
                                    fill='#3b82f6'
                                    radius={[8, 8, 0, 0]}
                                    animationDuration={1200}
                                    barSize={40}
                                />
                            </BarChart>
                        )}
                    </ResponsiveContainer>
                </div>
            </div>

            <div className='glass-card'>
                <div className='card-header-slim'>
                    <h4 className='card-title'>Daily P&L Velocity</h4>
                    <p className='card-subtitle'>Recent 14 sessions breakdown</p>
                </div>
                <div className='daily-bars'>
                    {dailyData.slice(-14).map((d, i) => (
                        <div key={i} className='day-col'>
                            <div className='bar-container'>
                                <div
                                    className={`bar-fill ${d.pnl && d.pnl >= 0 ? 'positive' : 'negative'}`}
                                    style={{
                                        height: `${Math.min(100, (Math.abs(d.pnl || 0) / (bestDay || 1)) * 100)}%`,
                                    }}
                                    title={`$${(d.pnl || 0).toFixed(2)}`}
                                />
                            </div>
                            <p className='day-label'>{d.date.split(' ')[1] || d.date}</p>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
});

export default PerformanceTab;
