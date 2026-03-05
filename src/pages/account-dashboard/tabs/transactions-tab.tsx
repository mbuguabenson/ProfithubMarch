import React, { useEffect, useState } from 'react';
import { ArrowDownLeft, ArrowRightLeft, ArrowUpRight, Filter, Search, TrendingUp } from 'lucide-react';
import { observer } from 'mobx-react-lite';
import derivApiService from '@/lib/deriv-api-service';
import { useStore } from '@/hooks/useStore';
import './account-tabs.scss';

type TxType = 'Deposit' | 'Withdrawal' | 'Trade' | 'Transfer';
type TxStatus = 'Completed' | 'Pending' | 'Failed';

interface Transaction {
    id: string;
    type: TxType;
    amount: number;
    currency: string;
    date: string;
    time: string;
    status: TxStatus;
    reference: string;
    description: string;
    balance_after: number;
}

const TYPE_META: Record<TxType, { icon: any; color: string; label: string }> = {
    Deposit: { icon: ArrowDownLeft, color: 'emerald', label: 'Deposit' },
    Withdrawal: { icon: ArrowUpRight, color: 'rose', label: 'Withdrawal' },
    Trade: { icon: TrendingUp, color: 'blue', label: 'Trade' },
    Transfer: { icon: ArrowRightLeft, color: 'purple', label: 'Transfer' },
};

const TransactionsTab = observer(() => {
    const { client } = useStore();
    const [search, setSearch] = useState('');
    const [filterType, setFilterType] = useState<TxType | 'All'>('All');
    const [loading, setLoading] = useState(true);
    const [transactions, setTransactions] = useState<Transaction[]>([]);

    useEffect(() => {
        const fetchStatement = async () => {
            try {
                const res = await derivApiService.sendRequest({ statement: 1, description: 1, limit: 100 });
                if (res.statement?.transactions) {
                    const formatted: Transaction[] = res.statement.transactions.map((t: any) => {
                        const dateObj = new Date(t.transaction_time * 1000);
                        let type: TxType = 'Trade';
                        if (t.action_type === 'deposit') type = 'Deposit';
                        if (t.action_type === 'withdrawal') type = 'Withdrawal';
                        if (t.action_type === 'transfer') type = 'Transfer';
                        
                        return {
                            id: t.transaction_id.toString(),
                            type,
                            amount: t.amount,
                            currency: client?.currency || 'USD',
                            date: dateObj.toLocaleDateString(undefined, { month: 'short', day: '2-digit', year: 'numeric' }),
                            time: dateObj.toLocaleTimeString('en-US', { hour12: false }),
                            status: 'Completed',
                            reference: t.reference_id?.toString() || t.transaction_id.toString(),
                            description: t.longcode || t.shortcode || t.action_type.toUpperCase(),
                            balance_after: t.balance_after,
                        };
                    });
                    setTransactions(formatted);
                }
            } catch (err) {
                console.error('[TransactionsTab] Failed to fetch statement:', err);
            } finally {
                setLoading(false);
            }
        };
        fetchStatement();
    }, [client?.currency]);

    const filtered = transactions.filter(tx => {
        const matchesType = filterType === 'All' || tx.type === filterType;
        const matchesSearch = tx.description.toLowerCase().includes(search.toLowerCase()) ||
            tx.reference.toLowerCase().includes(search.toLowerCase());
        return matchesType && matchesSearch;
    });

    return (
        <div className="account-tab-wrapper">
            <div className="tx-toolbar">
                <div className="search-wrapper">
                    <Search size={16} className="search-icon" />
                    <input
                        placeholder="Filter transactions, assets, references…"
                        value={search}
                        onChange={e => setSearch(e.target.value)}
                    />
                </div>
                <div className="filter-group">
                    {(['All', 'Deposit', 'Withdrawal', 'Trade', 'Transfer'] as const).map(type => (
                        <button
                            key={type}
                            onClick={() => setFilterType(type)}
                            className={filterType === type ? 'active' : ''}
                        >
                            {type}
                        </button>
                    ))}
                </div>
            </div>

            <div className="tx-list">
                {loading ? (
                    Array(8).fill(0).map((_, i) => (
                        <div key={i} className="tx-item skeleton" style={{ height: '84px', opacity: 0.2 }} />
                    ))
                ) : filtered.length === 0 ? (
                    <div className="empty-state">
                        <div className="icon-glow" />
                        <Filter size={48} />
                        <p>No transactions match your search</p>
                    </div>
                ) : (
                    filtered.map((tx, i) => {
                        const meta = TYPE_META[tx.type];
                        const Icon = meta.icon;
                        const isPositive = tx.amount >= 0;
                        return (
                            <div key={tx.id} className="tx-item hoverable" style={{ animationDelay: `${i * 40}ms` }}>
                                <div className={`tx-icon color-${meta.color}`}>
                                    <Icon size={18} />
                                </div>
                                <div className="tx-details">
                                    <p className="tx-desc" title={tx.description}>{tx.description}</p>
                                    <div className="tx-meta">
                                        <span>{tx.date}</span>
                                        <span className="dot" />
                                        <span>{tx.time}</span>
                                        <span className="dot" />
                                        <span className="ref-tag">Ref: {tx.reference}</span>
                                    </div>
                                </div>
                                <div className="tx-amounts">
                                    <p className={`tx-val ${isPositive ? 'positive' : 'neutral'}`}>
                                        {isPositive ? '+' : ''}{tx.amount.toLocaleString(undefined, { minimumFractionDigits: 2 })} {tx.currency}
                                    </p>
                                    <p className="tx-bal">
                                        <span className="label">Balance:</span> {tx.currency} {tx.balance_after.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                                    </p>
                                </div>
                                <div className={`tx-status ${tx.status}`}>
                                    <div className="status-dot" />
                                    {tx.status}
                                </div>
                            </div>
                        );
                    })
                )}
            </div>
        </div>
    );
});

export default TransactionsTab;
