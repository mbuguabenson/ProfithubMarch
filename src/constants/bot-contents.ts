type TTabsTitle = {
    [key: string]: string | number;
};

type TDashboardTabIndex = {
    [key: string]: number;
};

export const tabs_title: TTabsTitle = Object.freeze({
    WORKSPACE: 'Workspace',
    CHART: 'Chart',
});

export const DBOT_TABS: TDashboardTabIndex = Object.freeze({
    DASHBOARD: 0,
    BOT_BUILDER: 1,
    CHART: 2,
    ANALYSIS_TOOL: 3,
    TRADING_TOOLS: 4,
    COPY_TRADING: 5,
    FREE_BOTS: 6,
    STRATEGIES: 7,
    SETTINGS: 8,
    TUTORIAL: 9,
    AUTO_TRADER: 4, // Mapping to Trading Tools
    SMART_AUTO24: 4, // Mapping to Trading Tools
    EASY_TOOL: 4, // Mapping to Trading Tools
});

export const MAX_STRATEGIES = 10;

export const TAB_IDS = [
    'id-dbot-dashboard',
    'id-bot-builder',
    'id-charts',
    'id-analysis-tool',
    'id-trading-tools',
    'id-copy-trading',
    'id-free-bots',
    'id-strategies',
    'id-settings',
    'id-tutorials',
];

export const DEBOUNCE_INTERVAL_TIME = 500;
