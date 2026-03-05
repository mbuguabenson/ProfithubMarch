import { action, makeObservable, observable, runInAction } from 'mobx';
import { supabase } from '@/lib/supabaseClient';

export interface PlatformUser {
    id: string;
    loginid: string;
    name: string;
    email: string;
    avatar: string;
    status: 'Active' | 'Blocked' | 'Pending';
    type: 'Real' | 'Demo';
    balance: number;
    country: string;
    currency: string;
    ip: string;
    device: string;
    joined: string;
    lastSeen: string;
    isNew: boolean;
    balanceHistory: number[];
    trades: number;
    winRate: number;
    role: 'Admin' | 'User';
}

function getRelativeTime(dateStr: string): string {
    const now = Date.now();
    const then = new Date(dateStr).getTime();
    const diffMs = now - then;
    if (isNaN(then)) return 'Unknown';
    const mins = Math.floor(diffMs / 60000);
    if (mins < 1) return 'Just now';
    if (mins < 60) return `${mins} min ago`;
    const hrs = Math.floor(mins / 60);
    if (hrs < 24) return `${hrs} hr ago`;
    const days = Math.floor(hrs / 24);
    return `${days} day${days > 1 ? 's' : ''} ago`;
}

function generateHistory(base: number): number[] {
    return Array.from({ length: 20 }, (_, i) => Math.max(0, base + (Math.random() - 0.48) * base * 0.05 * i));
}

export default class AdminStore {
    // Platform Stats
    public active_users = 0;
    public total_users = 0;
    public total_deposits = 0;
    public total_volume = 0;
    public avg_win_rate = 0;
    public new_users_today = 0;
    public user_growth = 0; // percentage change

    // System Health
    public latency = 24;
    public cpu_load = 18.4;
    public memory_usage = 4.2;
    public sync_status = 100;

    // UI state
    public is_sidebar_open = true;
    public active_section = 'dashboard';
    public isLoading = false;

    // Visibility Matrix
    public visible_tabs = {
        dashboard: true,
        bot_builder: true,
        charts: true,
        analysis_tool: true,
        trading_tools: true,
        copy_trading: true,
        free_bots: true,
        strategies: true,
        settings: true,
        tutorials: true,
    };

    // Users list (live from Supabase)
    public users: PlatformUser[] = [];

    // Activity Feed
    public live_activity: {
        id: string;
        user: string;
        action: string;
        time: string;
        status: string;
        amount: string;
        color: string;
    }[] = [];

    public recent_transactions: {
        id: string;
        user: string;
        email: string;
        amount: number;
        date: string;
        status: string;
        type: string;
        avatar: string;
    }[] = [];

    public market_distribution = [
        { name: 'Forex', value: 35, color: '#3b82f6' },
        { name: 'Indices', value: 25, color: '#10b981' },
        { name: 'Stocks', value: 20, color: '#8b5cf6' },
        { name: 'Crypto', value: 20, color: '#06b6d4' },
    ];

    constructor() {
        makeObservable(this, {
            active_users: observable,
            total_users: observable,
            total_deposits: observable,
            total_volume: observable,
            avg_win_rate: observable,
            new_users_today: observable,
            user_growth: observable,
            latency: observable,
            cpu_load: observable,
            memory_usage: observable,
            sync_status: observable,
            is_sidebar_open: observable,
            active_section: observable,
            visible_tabs: observable,
            live_activity: observable,
            recent_transactions: observable,
            market_distribution: observable,
            users: observable,
            isLoading: observable,
            toggleTabVisibility: action,
            toggleSidebar: action,
            setSection: action,
            fetchPlatformData: action,
            blockUser: action,
            whitelistUser: action,
            addUser: action,
        });

        this.fetchPlatformData();
        this.setupSubscriptions();

        // Simulate telemetry fluctuations
        setInterval(() => {
            runInAction(() => {
                this.latency = Math.max(15, Math.min(150, this.latency + (Math.random() - 0.5) * 5));
                this.cpu_load = Math.max(5, Math.min(95, this.cpu_load + (Math.random() - 0.5) * 2));
                this.memory_usage = Math.max(2, Math.min(15.5, this.memory_usage + (Math.random() - 0.5) * 0.1));
            });
        }, 5000);
    }

    async fetchPlatformData() {
        runInAction(() => {
            this.isLoading = true;
        });

        try {
            // --- Total users ---
            const { count: totalUsers, error: userError } = await supabase
                .from('user_monitoring')
                .select('*', { count: 'exact', head: true });

            if (!userError) {
                runInAction(() => {
                    this.total_users = totalUsers || 0;
                    this.active_users = totalUsers || 0;
                    // Estimate growth as 10% as placeholder until we have historical data
                    this.user_growth = 10;
                });
            }

            // --- New users today ---
            const todayStart = new Date();
            todayStart.setHours(0, 0, 0, 0);
            const { count: newUsers } = await supabase
                .from('user_monitoring')
                .select('*', { count: 'exact', head: true })
                .gte('created_at', todayStart.toISOString());

            runInAction(() => {
                this.new_users_today = newUsers || 0;
            });

            // --- All users for the users management table ---
            const { data: allUsers, error: allUsersError } = await supabase
                .from('user_monitoring')
                .select('*')
                .order('updated_at', { ascending: false })
                .limit(100);

            if (!allUsersError && allUsers) {
                // Check user_flags table for blocked/whitelisted status and roles
                const { data: flags } = await supabase.from('user_flags').select('loginid, status, role');

                const flagsMap = new Map<string, { status: string; role: string }>(
                    (flags || []).map((f: { loginid: string; status: string; role: string }) => [
                        f.loginid,
                        { status: f.status, role: f.role },
                    ])
                );

                const tomorrow = new Date();
                tomorrow.setDate(tomorrow.getDate() - 1);

                runInAction(() => {
                    this.users = allUsers.map((u: Record<string, unknown>) => {
                        const flaggedStatus = flagsMap.get(u.loginid as string);
                        const isReal = !String(u.loginid).startsWith('VR');
                        const createdAt = u.created_at as string;
                        const updatedAt = (u.updated_at || u.last_seen) as string;

                        return {
                            id: String(u.loginid),
                            loginid: String(u.loginid),
                            name: (u.email as string)?.split('@')[0] || String(u.loginid),
                            email: (u.email as string) || 'N/A',
                            avatar: ((u.email as string)?.[0] || (u.loginid as string)?.[0] || 'U').toUpperCase(),
                            status:
                                (flaggedStatus?.status as 'Active' | 'Blocked' | 'Pending') ||
                                (createdAt && new Date(createdAt) > todayStart ? 'Pending' : 'Active'),
                            role: (flaggedStatus?.role as 'Admin' | 'User') || 'User',
                            type: isReal ? 'Real' : 'Demo',
                            balance: 0,
                            country: (u.country as string) || '—',
                            currency: (u.currency as string) || 'USD',
                            ip: '—',
                            device: '—',
                            joined: createdAt
                                ? new Date(createdAt).toLocaleDateString('en-US', {
                                      year: 'numeric',
                                      month: 'short',
                                      day: 'numeric',
                                  })
                                : '—',
                            lastSeen: updatedAt ? getRelativeTime(updatedAt) : '—',
                            isNew: createdAt ? new Date(createdAt) >= todayStart : false,
                            balanceHistory: generateHistory(0),
                            trades: 0,
                            winRate: 0,
                        } as PlatformUser;
                    });

                    // Live Activity Feed from most recent users
                    const ACTIVITY_COLORS = ['blue', 'emerald', 'purple', 'cyan'];
                    const ACTIVITY_ACTIONS = [
                        'Platform Sync',
                        'Login',
                        'Trade Placed',
                        'Balance Check',
                        'Strategy Run',
                    ];

                    this.live_activity = allUsers.slice(0, 20).map((u: Record<string, unknown>, i: number) => ({
                        id: String(u.loginid),
                        user: String(u.loginid),
                        action: ACTIVITY_ACTIONS[i % ACTIVITY_ACTIONS.length],
                        time:
                            u.updated_at || u.last_seen
                                ? getRelativeTime(String(u.updated_at || u.last_seen))
                                : 'Unknown',
                        status: 'Success',
                        amount: String(u.currency || 'USD'),
                        color: ACTIVITY_COLORS[i % ACTIVITY_COLORS.length],
                    }));

                    this.recent_transactions = allUsers.slice(0, 20).map((u: Record<string, unknown>) => ({
                        id: String(u.loginid),
                        user: String(u.loginid),
                        email: String(u.email || 'N/A'),
                        amount: 0,
                        date: (u.updated_at as string) ? new Date(u.updated_at as string).toLocaleDateString() : '—',
                        status: 'Active',
                        type: 'Login',
                        avatar: `https://i.pravatar.cc/150?u=${u.loginid}`,
                    }));

                    // Rough estimated totals
                    this.total_deposits = (totalUsers || 0) * 500; // $500 avg placeholder
                    this.total_volume = (totalUsers || 0) * 12000; // $12k avg volume placeholder
                });
            }
        } catch (e) {
            console.error('[AdminStore] Error fetching platform data:', e);
        } finally {
            runInAction(() => {
                this.isLoading = false;
            });
        }
    }

    async blockUser(loginid: string) {
        try {
            await supabase
                .from('user_flags')
                .upsert(
                    { loginid, status: 'Blocked', updated_at: new Date().toISOString() },
                    { onConflict: 'loginid' }
                );
            runInAction(() => {
                const user = this.users.find(u => u.loginid === loginid);
                if (user) user.status = 'Blocked';
            });
        } catch (e) {
            console.error('[AdminStore] blockUser failed:', e);
        }
    }

    async whitelistUser(loginid: string) {
        try {
            await supabase
                .from('user_flags')
                .upsert({ loginid, status: 'Active', updated_at: new Date().toISOString() }, { onConflict: 'loginid' });
            runInAction(() => {
                const user = this.users.find(u => u.loginid === loginid);
                if (user) user.status = 'Active';
            });
        } catch (e) {
            console.error('[AdminStore] whitelistUser failed:', e);
        }
    }

    async addUser(email: string, role: 'Admin' | 'User') {
        try {
            // In a real scenario, we'd use supabase.auth.admin.createUser
            // But for this simulation/integration, we'll record the intent
            // and add it to our local state/monitoring table if permitted.
            const { data, error } = await supabase
                .from('user_monitoring')
                .insert([
                    {
                        email,
                        loginid: `USR${Math.floor(1000 + Math.random() * 9000)}`,
                        created_at: new Date().toISOString(),
                        updated_at: new Date().toISOString(),
                    },
                ])
                .select();

            if (error) throw error;

            if (data && data[0]) {
                // Also set the role flag
                await supabase.from('user_flags').upsert(
                    {
                        loginid: data[0].loginid,
                        status: 'Active',
                        role,
                        updated_at: new Date().toISOString(),
                    },
                    { onConflict: 'loginid' }
                );
            }

            await this.fetchPlatformData();
            return { success: true };
        } catch (e) {
            console.error('[AdminStore] addUser failed:', e);
            return { success: false, error: e };
        }
    }

    setupSubscriptions() {
        supabase
            .channel('public:user_monitoring')
            .on('postgres_changes', { event: '*', schema: 'public', table: 'user_monitoring' }, () => {
                this.fetchPlatformData();
            })
            .subscribe();
    }

    toggleSidebar() {
        this.is_sidebar_open = !this.is_sidebar_open;
    }

    setSection(section: string) {
        this.active_section = section;
    }

    toggleTabVisibility(tabKey: keyof typeof this.visible_tabs) {
        this.visible_tabs[tabKey] = !this.visible_tabs[tabKey];
    }
}
