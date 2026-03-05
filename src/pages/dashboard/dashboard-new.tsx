import { useState } from 'react';
import { observer } from 'mobx-react-lite';
import { DBOT_TABS } from '@/constants/bot-contents';
import {
    LabelPairedChartCandlestickCaptionRegularIcon,
    LabelPairedCopyCaptionRegularIcon,
    LabelPairedLightbulbCaptionRegularIcon,
    LabelPairedPuzzlePieceTwoCaptionBoldIcon,
    LabelPairedSlidersCaptionRegularIcon,
} from '@deriv/quill-icons/LabelPaired';
import './dashboard.scss';

interface QuickAccessItem {
    id: string;
    title: string;
    icon: JSX.Element;
    description: string;
    tabIndex: number;
    keywords: string[];
}

const Dashboard = observer(({ handleTabChange }: { handleTabChange: (index: number) => void }) => {
    const [searchQuery, setSearchQuery] = useState('');

    const quickAccessItems: QuickAccessItem[] = [
        {
            id: 'bot-builder',
            title: 'Bot Builder',
            icon: <LabelPairedPuzzlePieceTwoCaptionBoldIcon height='48px' width='48px' />,
            description: 'Create and customize trading bots',
            tabIndex: DBOT_TABS.BOT_BUILDER,
            keywords: ['bot', 'builder', 'create', 'blockly', 'automation'],
        },
        {
            id: 'free-bots',
            title: 'Free Bots',
            icon: <LabelPairedLightbulbCaptionRegularIcon height='48px' width='48px' />,
            description: 'Access pre-built bot templates',
            tabIndex: DBOT_TABS.FREE_BOTS,
            keywords: ['free', 'bots', 'templates', 'ready', 'download'],
        },
        {
            id: 'smart-analysis',
            title: 'Smart Analysis',
            icon: <LabelPairedChartCandlestickCaptionRegularIcon height='48px' width='48px' />,
            description: 'Advanced market analysis tools',
            tabIndex: DBOT_TABS.ANALYSIS_TOOL,
            keywords: ['smart', 'analysis', 'charts', 'statistics', 'data'],
        },
        {
            id: 'copy-trading',
            title: 'Copy Trading',
            icon: <LabelPairedCopyCaptionRegularIcon height='48px' width='48px' />,
            description: 'Mirror successful traders',
            tabIndex: DBOT_TABS.COPY_TRADING,
            keywords: ['copy', 'trading', 'mirror', 'follow', 'traders'],
        },
        {
            id: 'auto-trader',
            title: 'Auto Trader',
            icon: <LabelPairedSlidersCaptionRegularIcon height='48px' width='48px' />,
            description: 'Automated trading strategies',
            tabIndex: DBOT_TABS.AUTO_TRADER,
            keywords: ['auto', 'trader', 'automated', 'strategy', 'bot'],
        },
        {
            id: 'ai-analysis',
            title: 'AI Analysis',
            icon: <LabelPairedPuzzlePieceTwoCaptionBoldIcon height='48px' width='48px' />,
            description: 'AI-powered predictions',
            tabIndex: DBOT_TABS.EASY_TOOL,
            keywords: ['ai', 'artificial', 'intelligence', 'prediction', 'machine', 'learning'],
        },
    ];

    const filteredItems = quickAccessItems.filter(
        item =>
            item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
            item.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
            item.keywords.some(keyword => keyword.toLowerCase().includes(searchQuery.toLowerCase()))
    );

    return (
        <div className='dashboard-container'>
            {/* Search Bar */}
            <div className='dashboard-search'>
                <div className='search-wrapper'>
                    <input
                        type='text'
                        placeholder='🔍 Search tabs, bots, features...'
                        value={searchQuery}
                        onChange={e => setSearchQuery(e.target.value)}
                        className='search-input'
                    />
                </div>
            </div>

            {/* Quick Access Grid */}
            <div className='quick-access-section'>
                <h2 className='section-title'>Quick Access</h2>
                <div className='quick-access-grid'>
                    {filteredItems.map(item => (
                        <div key={item.id} className='quick-access-card' onClick={() => handleTabChange(item.tabIndex)}>
                            <div className='card-icon'>{item.icon}</div>
                            <h3 className='card-title'>{item.title}</h3>
                            <p className='card-description'>{item.description}</p>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
});

export default Dashboard;
