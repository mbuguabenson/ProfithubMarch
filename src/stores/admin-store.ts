import { action, makeObservable, observable, runInAction } from 'mobx';
import { supabase } from '@/lib/supabaseClient';

export default class AdminStore {
    // Platform Stats
    public active_users = 0;
    public total_users = 0;
    public total_deposits = 0;
    public total_volume = 0;
    public avg_win_rate = 0;
    public new_users_today = 0;

    // System Health
    public latency = 24;
    public cpu_load = 18.4;
    public memory_usage = 4.2;
    public sync_status = 100;

    // UI state
    public is_sidebar_open = true;
    public active_section = 'dashboard';

    // Visibility Matrix
    public visible_tabs = {
        dashboard: true,
        bot_builder: true,
        charts: true,
        analysis_tool: true,
        trading_tools: true,
        copy_trading: true,
        strategies: true,
        settings: true,
        tutorials: true,
    };

    // Activity Feed
    public live_activity: {
        id: string;
        user: string;
        action: string;
        time: string;
        status: string;
        amount: string;
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
            toggleTabVisibility: action,
            toggleSidebar: action,
            setSection: action,
            fetchPlatformData: action,
        });

        // Initialize real-time data fetching
        this.fetchPlatformData();
        this.setupSubscriptions();

        // Keep system health metrics simulated for visual flair
        setInterval(() => {
            runInAction(() => {
                this.latency = Math.max(15, Math.min(150, this.latency + (Math.random() - 0.5) * 5));
                this.cpu_load = Math.max(5, Math.min(95, this.cpu_load + (Math.random() - 0.5) * 2));
                this.memory_usage = Math.max(2, Math.min(15.5, this.memory_usage + (Math.random() - 0.5) * 0.1));
            });
        }, 5000);
    }

    async fetchPlatformData() {
        try {
            // Fetch total users count
            const { count: totalUsers, error: userError } = await supabase
                .from('user_monitoring')
                .select('*', { count: 'exact', head: true });

            if (!userError) {
                runInAction(() => {
                    this.total_users = totalUsers || 0;
                    this.active_users = totalUsers || 0; // Simplification for dashboard
                });
            }

            // Fetch new users today
            const today = new Date();
            today.setHours(0, 0, 0, 0);
            const { count: newUsers, error: newUsersError } = await supabase
                .from('user_monitoring')
                .select('*', { count: 'exact', head: true })
                .gte('created_at', today.toISOString());

            if (!newUsersError) {
                runInAction(() => {
                    this.new_users_today = newUsers || 0;
                });
            }

            // Fetch recent activity
            const { data: activity, error: activityError } = await supabase
                .from('user_monitoring')
                .select('*')
                .order('updated_at', { ascending: false })
                .limit(20);

            if (!activityError && activity) {
                runInAction(() => {
                    this.live_activity = (activity as { loginid: string; currency?: string }[]).map(user => ({
                        id: user.loginid,
                        user: user.loginid,
                        action: 'Platform Sync',
                        time: 'Just now',
                        status: 'Success',
                        amount: user.currency || 'USD',
                    }));

                    this.recent_transactions = (
                        activity as { loginid: string; email?: string; updated_at: string }[]
                    ).map(user => ({
                        id: user.loginid,
                        user: user.loginid,
                        email: user.email || 'N/A',
                        amount: 0, // Placeholder as we don't store transaction amounts yet
                        date: new Date(user.updated_at).toLocaleDateString(),
                        status: 'Success',
                        type: 'Login',
                        avatar: `https://i.pravatar.cc/150?u=${user.loginid}`,
                    }));
                });
            }
        } catch (e) {
            console.error('[AdminStore] Error fetching platform data:', e);
        }
    }

    setupSubscriptions() {
        // Subscribe to changes in user_monitoring table for real-time updates
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
