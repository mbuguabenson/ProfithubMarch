import React, { useEffect, useState } from 'react';
import { Award, Clock, Target, TrendingUp } from 'lucide-react';
import { observer } from 'mobx-react-lite';
import {
    Bar,
    BarChart,
    CartesianGrid,
    PolarAngleAxis,
    PolarGrid,
    Radar,
    RadarChart,
    ResponsiveContainer,
    Tooltip,
    TooltipProps,
    XAxis,
    YAxis,
} from 'recharts';
import derivApiService from '@/lib/deriv-api-service';
import { useStore } from '@/hooks/useStore';
import './account-tabs.scss';

const CustomBarTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
        return (
            <div className="glass-card tooltip-card" style={{ padding: '0.75rem', minWidth: '140px' }}>
                <p className="card-subtitle mb-2">{label}</p>
                {payload.map((p: any, i: number) => (
                    <div key={i} className="flex justify-between gap-4 items-center mb-1">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">{p.name}</span>
                        <span className="text-xs font-black" style={{ color: p.fill }}>
                            {p.value}%
                        </span>
                    </div>
                ))}
                <div className="tooltip-line" />
            </div>
        );
    }
    return null;
};

const StatBadge = ({ label, value, sub, icon: Icon, color }: {
    label: string; value: string; sub?: string;
    icon: React.ComponentType<{size?: number; className?: string}>; color: string;
}) => (
    <div className={`metric-badge color-${color} hoverable`}>
        <div className="badge-glow" />
        <div className="icon-box">
            <Icon size={16} />
        </div>
        <div className="metric-info">
            <p className="metric-label">{label}</p>
            <p className="metric-value">{value}</p>
            {sub && <p className="metric-sub">{sub}</p>}
        </div>
    </div>
);

const StrategyTab = observer(() => {
    const { client } = useStore();
    const [winRateData, setWinRateData] = useState<any[]>([]);
    const [durationData, setDurationData] = useState<any[]>([]);
    const [radarData, setRadarData] = useState<any[]>([]);
    const [metrics, setMetrics] = useState({
        winRate: '0%', avgWin: '$0', avgLoss: '$0', trades: '0', avgDur: '0s', bestStrat: 'N/A'
    });

    useEffect(() => {
        const fetchProfitTable = async () => {
            try {
                const res = await derivApiService.sendRequest({ profit_table: 1, description: 1, limit: 1000 });
                if (res.profit_table?.transactions) {
                    const txs = res.profit_table.transactions as any[];
                    let wins = 0, total = 0, totalWinAmt = 0, totalLossAmt = 0;
                    let totalDur = 0;
                    
                    const assetMap = new Map<string, { w: number, l: number }>();
                    const durCounts = { '<1 min': 0, '1-5 min': 0, '5-15 min': 0, '15-60 min': 0, '>1 hr': 0 };

                    txs.forEach(t => {
                        const pnl = Number(t.sell_price) - Number(t.buy_price);
                        const isWin = pnl > 0;
                        const asset = t.shortcode ? t.shortcode.split('_')[1] || t.shortcode : 'Unknown';
                        
                        total++;
                        if (isWin) { wins++; totalWinAmt += pnl; }
                        else { totalLossAmt += Math.abs(pnl); }

                        const dur = Number(t.sell_time) - Number(t.purchase_time);
                        totalDur += dur;

                        if (dur < 60) durCounts['<1 min']++;
                        else if (dur < 300) durCounts['1-5 min']++;
                        else if (dur < 900) durCounts['5-15 min']++;
                        else if (dur < 3600) durCounts['15-60 min']++;
                        else durCounts['>1 hr']++;

                        if (!assetMap.has(asset)) assetMap.set(asset, { w: 0, l: 0 });
                        const aStat = assetMap.get(asset)!;
                        if (isWin) aStat.w++; else aStat.l++;
                    });

                    const parsedWinRate = Array.from(assetMap.entries()).map(([asset, s]) => ({
                        asset: asset.replace('FRX', '').replace('VOL', ''), 
                        wins: Math.round((s.w / (s.w + s.l)) * 100), 
                        losses: Math.round((s.l / (s.w + s.l)) * 100)
                    })).sort((a, b) => b.wins - a.wins).slice(0, 6);

                    const parsedDur = Object.entries(durCounts).map(([range, count]) => ({ range, count }));

                    setWinRateData(parsedWinRate.length ? parsedWinRate : [{ asset: 'N/A', wins: 0, losses: 0 }]);
                    setDurationData(parsedDur);
                    
                    const realWinRate = total > 0 ? (wins / total) * 100 : 0;
                    const realAvgWin = wins > 0 ? (totalWinAmt / wins) : 0;
                    const realAvgLoss = (total - wins) > 0 ? (totalLossAmt / (total - wins)) : 0;
                    const realAvgDur = total > 0 ? (totalDur / total) : 0;

                    setMetrics({
                        winRate: `${realWinRate.toFixed(1)}%`,
                        avgWin: `+$${realAvgWin.toFixed(2)}`,
                        avgLoss: `-$${realAvgLoss.toFixed(2)}`,
                        trades: `${total}`,
                        avgDur: `${Math.floor(realAvgDur / 60)}m ${Math.floor(realAvgDur % 60)}s`,
                        bestStrat: parsedWinRate.length ? parsedWinRate[0].asset : 'N/A'
                    });

                    setRadarData([
                        { metric: 'Strategy Efficiency', score: realWinRate },
                        { metric: 'Alpha Edge', score: Math.min(realAvgWin, 100) },
                        { metric: 'Risk Neutrality', score: realWinRate > 52 ? 85 : 45 },
                        { metric: 'Execution Flow', score: total > 50 ? 90 : 60 },
                        { metric: 'Hold Velocity', score: realAvgDur < 120 ? 95 : 55 },
                        { metric: 'Market Depth', score: Math.min((total / 500) * 100, 100) },
                    ]);
                }
            } catch (err) {
                console.error('[StrategyTab] Failed to fetch metrics:', err);
            }
        };
        fetchProfitTable();
    }, [client?.loginid]);

    return (
    <div className="account-tab-wrapper">
        <div className="grid-5">
            <StatBadge label="Alpha Win Rate" value={metrics.winRate} sub={`Target Meta reached`} icon={Target as any} color="blue" />
            <StatBadge label="Reward Cluster" value={metrics.avgWin} sub="Per execution" icon={TrendingUp as any} color="emerald" />
            <StatBadge label="Risk Floor" value={metrics.avgLoss} sub="Managed exposure" icon={TrendingUp as any} color="rose" />
            <StatBadge label="Time In Market" value={metrics.avgDur} sub="Mean hold time" icon={Clock as any} color="purple" />
            <StatBadge label="Prime Asset" value={metrics.bestStrat} sub="Top performer" icon={Award as any} color="cyan" />
        </div>

        <div className="grid-2">
            <div className="glass-card hoverable">
                <div className="card-bg-glow top-right blue" style={{ width: '200px', height: '200px', filter: 'blur(100px)', opacity: 0.1 }} />
                <h4 className="card-title">Success Distribution</h4>
                <p className="card-subtitle">Win/Loss ratio by primary assets</p>
                <div style={{ height: '240px', position: 'relative', zIndex: 10, marginTop: '2rem' }}>
                    <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={winRateData} layout="vertical" margin={{ top: 0, right: 30, left: 10, bottom: 0 }}>
                            <XAxis type="number" axisLine={false} tickLine={false} tick={{ fill: '#475569', fontSize: 10, fontWeight: 800 }} tickFormatter={v => `${v}%`} domain={[0, 100]} />
                            <YAxis type="category" dataKey="asset" axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 10, fontWeight: 800 }} width={70} />
                            <CartesianGrid strokeDasharray="10 10" stroke="rgba(255,255,255,0.02)" horizontal={false} />
                            <Tooltip content={<CustomBarTooltip />} cursor={{ fill: 'rgba(255,255,255,0.02)' }} />
                            <Bar dataKey="wins" name="Win" fill="#3b82f6" radius={[0, 6, 6, 0]} stackId="a" animationDuration={1500} />
                            <Bar dataKey="losses" name="Loss" fill="rgba(244,63,94,0.2)" radius={[0, 6, 6, 0]} stackId="a" animationDuration={1500} />
                        </BarChart>
                    </ResponsiveContainer>
                </div>
            </div>

            <div className="glass-card hoverable">
                <div className="card-bg-glow top-left purple" style={{ width: '200px', height: '200px', filter: 'blur(100px)', opacity: 0.1 }} />
                <h4 className="card-title">Temporal Scaling</h4>
                <p className="card-subtitle">Trade frequency across time horizons</p>
                <div style={{ height: '240px', position: 'relative', zIndex: 10, marginTop: '2rem' }}>
                    <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={durationData} margin={{ top: 5, right: 10, left: 0, bottom: 0 }}>
                            <CartesianGrid strokeDasharray="10 10" stroke="rgba(255,255,255,0.02)" vertical={false} />
                            <XAxis dataKey="range" axisLine={false} tickLine={false} tick={{ fill: '#475569', fontSize: 10, fontWeight: 800 }} dy={10} />
                            <YAxis axisLine={false} tickLine={false} tick={{ fill: '#475569', fontSize: 10, fontWeight: 800 }} />
                            <Tooltip contentStyle={{ background: '#050505', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 12, fontSize: 11 }} cursor={{ fill: 'rgba(255,255,255,0.02)' }} />
                            <Bar dataKey="count" fill="#a855f7" radius={[8, 8, 0, 0]} animationDuration={1500} />
                        </BarChart>
                    </ResponsiveContainer>
                </div>
            </div>
        </div>

        <div className="glass-card">
            <div className="card-bg-glow bottom-center blue" style={{ width: '500px', height: '100px', filter: 'blur(100px)', opacity: 0.05, bottom: '-50px', left: '50%', transform: 'translateX(-50%)' }} />
            <h4 className="card-title text-center">Multi-Dimensional Alpha Profile</h4>
            <p className="card-subtitle text-center">Comprehensive algorithmic performance assessment</p>
            <div style={{ height: '300px', position: 'relative', zIndex: 10, marginTop: '1rem' }}>
                <ResponsiveContainer width="100%" height="100%">
                    <RadarChart data={radarData} outerRadius="80%">
                        <PolarGrid stroke="rgba(255,255,255,0.08)" />
                        <PolarAngleAxis dataKey="metric" tick={{ fill: '#64748b', fontSize: 11, fontWeight: 800 }} />
                        <Radar 
                            name="Alpha Metric" 
                            dataKey="score" 
                            stroke="#00f2ff" 
                            fill="#00f2ff" 
                            fillOpacity={0.1} 
                            strokeWidth={3} 
                            animationDuration={2000} 
                        />
                        <Tooltip contentStyle={{ background: '#050505', border: '1px solid rgba(0,242,255,0.2)', borderRadius: 12 }} />
                    </RadarChart>
                </ResponsiveContainer>
            </div>
        </div>
    </div>
    );
});

export default StrategyTab;
