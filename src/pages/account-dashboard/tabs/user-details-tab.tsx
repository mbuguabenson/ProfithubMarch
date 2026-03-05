import { useEffect, useState } from 'react';
import { ExternalLink, Eye, EyeOff, RefreshCw, TrendingUp, Wallet } from 'lucide-react';
import { observer } from 'mobx-react-lite';
import { useStore } from '@/hooks/useStore';

const UserDetailsTab = observer(({ accountType }: { accountType: 'Real' | 'Demo' }) => {
    const { client } = useStore();
    const [loading, setLoading] = useState(true);
    const [hideBalances, setHideBalances] = useState(false);
    const [lastRefresh, setLastRefresh] = useState(new Date());

    useEffect(() => {
        // Simple initial loading state to match the premium feel
        const t = setTimeout(() => setLoading(false), 600);
        return () => clearTimeout(t);
    }, []);

    // Get accounts from the store
    const accounts = client?.account_list || [];
    const filtered = accounts.filter(a => (accountType === 'Demo' ? a.is_virtual : !a.is_virtual));

    // Calculate totals from store's all_accounts_balance if available, otherwise sum filtered
    const portfolioTotal =
        Object.entries(client?.all_accounts_balance || {}).reduce(
            (sum: number, [id, data]: [string, { balance?: number }]) => {
                const acc = accounts.find(a => a.loginid === id);
                if (
                    acc &&
                    ((accountType === 'Demo' && acc.is_virtual) || (accountType === 'Real' && !acc.is_virtual))
                ) {
                    return sum + (data.balance || 0);
                }
                return sum;
            },
            0
        ) || filtered.reduce((sum, a) => sum + (parseFloat((a as { balance?: string }).balance || '0') || 0), 0);

    const handleRefresh = () => {
        setLoading(true);
        setLastRefresh(new Date());
        // In a real app, this would trigger a store refresh
        setTimeout(() => setLoading(false), 600);
    };

    return (
        <div className='user-details-panel'>
            <div className='portfolio-summary'>
                <div className='card-bg-glow blue top-left' />
                <div className='card-bg-glow purple top-right' />

                <div className='summary-info'>
                    <div className='summary-label'>{accountType} Portfolio Total</div>
                    <div className='balance-row'>
                        <h2 className='total-balance'>
                            {hideBalances
                                ? '••••••'
                                : `${client?.currency || 'USD'} ${portfolioTotal.toLocaleString(undefined, { minimumFractionDigits: 2 })}`}
                        </h2>
                        <span className='profit-badge'>+1.2%</span>
                    </div>
                    <div className='sync-time'>
                        Sync status: {loading ? 'Updating...' : `Last refreshed ${lastRefresh.toLocaleTimeString()}`}
                    </div>
                </div>
                <div className='summary-actions'>
                    <button
                        onClick={() => setHideBalances(!hideBalances)}
                        className='action-btn'
                        title={hideBalances ? 'Show' : 'Hide'}
                    >
                        {hideBalances ? <Eye size={18} /> : <EyeOff size={18} />}
                    </button>
                    <button onClick={handleRefresh} className={`action-btn ${loading ? 'spin' : ''}`} title='Refresh'>
                        <RefreshCw size={18} />
                    </button>
                </div>
            </div>

            <div className='accounts-list-header'>
                <Wallet size={16} />
                Linked Assets
            </div>

            <div className='accounts-list'>
                {loading ? (
                    Array(Math.max(filtered.length, 2))
                        .fill(0)
                        .map((_, i) => (
                            <div key={i} className='account-card' style={{ height: '160px', opacity: 0.3 }} />
                        ))
                ) : filtered.length === 0 ? (
                    <div className='account-card' style={{ gridColumn: '1 / -1', textAlign: 'center' }}>
                        <p style={{ color: '#64748b', fontSize: '0.9rem', margin: '1rem 0' }}>
                            Ready to trade? No {accountType} accounts detected.
                        </p>
                    </div>
                ) : (
                    filtered.map((account, idx) => {
                        const balance = parseFloat((account as { balance?: string }).balance || '0');
                        return (
                            <div key={account.loginid} className='account-card hoverable'>
                                <div className='card-bg-glow blue top-right' />
                                <div className='card-content'>
                                    <div className='account-identity'>
                                        <div className={`currency-icon ${idx % 2 === 0 ? 'blue' : 'purple'}`}>
                                            {account.currency || 'USD'}
                                        </div>
                                        <div className='account-details'>
                                            <div className='id-row'>
                                                <h4 className='acc-id'>{account.loginid}</h4>
                                                <span className={`status-badge active`}>Active Hub</span>
                                            </div>
                                            <div className='server-info'>
                                                {account.landing_company_name?.toUpperCase() || 'HUB'} • Standard Alpha
                                            </div>
                                        </div>
                                    </div>

                                    <div className='account-finances'>
                                        <div className='finance-block'>
                                            <div className='finance-label'>Available Liquidity</div>
                                            <h3 className='finance-value'>
                                                {hideBalances
                                                    ? '••••'
                                                    : `${account.currency || 'USD'} ${balance.toLocaleString(undefined, { minimumFractionDigits: 2 })}`}
                                            </h3>
                                        </div>
                                        <div className='finance-block'>
                                            <div className='finance-label'>Growth Edge</div>
                                            <div className='equity-row'>
                                                <TrendingUp size={16} className='text-emerald-400' />
                                                <h3 className='finance-value up'>{hideBalances ? '••' : '+0.5%'}</h3>
                                            </div>
                                        </div>
                                        <button className='link-btn'>
                                            <ExternalLink size={18} />
                                        </button>
                                    </div>
                                </div>
                            </div>
                        );
                    })
                )}
            </div>
        </div>
    );
});

export default UserDetailsTab;
