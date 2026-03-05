import React from 'react';
import classNames from 'classnames';
import { observer } from 'mobx-react-lite';
import { useStore } from '@/hooks/useStore';
import {
    LabelPairedBellCaptionRegularIcon,
    LabelPairedChartLineCaptionRegularIcon,
    LabelPairedCircleDotCaptionRegularIcon,
    LabelPairedCircleInfoCaptionRegularIcon,
    LabelPairedEnvelopeCaptionRegularIcon,
    LabelPairedGearCaptionRegularIcon,
    LabelPairedGridCaptionRegularIcon,
    LabelPairedHouseBlankCaptionRegularIcon,
    LabelPairedMoneyBillCaptionRegularIcon,
    LabelPairedSlidersCaptionRegularIcon,
    LabelPairedUserCaptionRegularIcon,
} from '@deriv/quill-icons/LabelPaired';

const Sidebar = observer(() => {
    const { admin } = useStore();
    const { active_section, is_sidebar_open, setSection } = admin;

    const navItems = [
        { id: 'dashboard', label: 'Dashboard', icon: LabelPairedHouseBlankCaptionRegularIcon },
        { id: 'users', label: 'Users', icon: LabelPairedUserCaptionRegularIcon },
        { id: 'bots', label: 'Bots Manager', icon: LabelPairedGridCaptionRegularIcon },
        { id: 'strategies', label: 'Strategies', icon: LabelPairedSlidersCaptionRegularIcon },
        { id: 'analytics', label: 'Analytics', icon: LabelPairedChartLineCaptionRegularIcon },
        { id: 'transactions', label: 'Transactions', icon: LabelPairedMoneyBillCaptionRegularIcon },
        { id: 'console', label: 'Trading Console', icon: LabelPairedCircleInfoCaptionRegularIcon },
        { id: 'messages', label: 'Messages', icon: LabelPairedEnvelopeCaptionRegularIcon },
        { id: 'notifications', label: 'Notifications', icon: LabelPairedBellCaptionRegularIcon },
        { id: 'tabs', label: 'Tabs Control', icon: LabelPairedGridCaptionRegularIcon },
        { id: 'live', label: 'Live Activity', icon: LabelPairedCircleDotCaptionRegularIcon },
        { id: 'settings', label: 'Settings', icon: LabelPairedGearCaptionRegularIcon },
    ];

    return (
        <aside className={classNames("sidebar-aside", is_sidebar_open ? "open" : "collapsed")}>
            {/* Logo Section */}
            <div className="logo-section">
                <div className="logo-icon">P</div>
                {is_sidebar_open && (
                    <div className="logo-text">
                        <span className="profit">PROFIT</span>
                        <span className="hub-core">HUB CORE</span>
                    </div>
                )}
            </div>

            {/* Nav Items */}
            <nav className="nav-items">
                {navItems.map((item) => (
                    <button
                        key={item.id}
                        onClick={() => setSection(item.id)}
                        className={classNames("nav-item", active_section === item.id && "active")}
                    >
                        <item.icon className="icon" />
                        
                        {is_sidebar_open && (
                            <span className="label">
                                {item.label}
                            </span>
                        )}
                        
                        {/* Status Dots (Simulated) */}
                        {item.id === 'notifications' && (
                            <span className="status-dot"></span>
                        )}
                        
                        {/* Tooltip for collapsed state */}
                        {!is_sidebar_open && (
                            <div className="absolute left-full ml-4 px-4 py-2 bg-[#0b0f19] border border-white/10 text-white text-[10px] uppercase font-black tracking-widest rounded-xl opacity-0 group-hover:opacity-100 pointer-events-none transition-all duration-300 whitespace-nowrap z-[60] shadow-2xl translate-x-4 group-hover:translate-x-0">
                                {item.label}
                            </div>
                        )}
                    </button>
                ))}
            </nav>

            {/* Bottom Section */}
            <div className="bottom-section">
                {is_sidebar_open ? (
                    <div className="update-badge">
                        <div className="rocket">🚀</div>
                        <p className="title">CORE UPDATE 4.0</p>
                        <p className="desc">Enhanced encryption nodes and real-time execution kernels.</p>
                        <button className="update-btn">
                            UPDATE SYSTEM
                        </button>
                    </div>
                ) : (
                    <button className="toggle-btn mb-4">
                        🚀
                    </button>
                )}
                
                <button 
                    onClick={() => admin.toggleSidebar()}
                    className="toggle-btn"
                >
                    <span className={classNames("arrow", is_sidebar_open && "flipped")}>
                        ❯
                    </span>
                </button>
            </div>
        </aside>
    );
});

export default Sidebar;
