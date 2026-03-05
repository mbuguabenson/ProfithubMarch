import { ComponentProps, ReactNode, useMemo } from 'react';
import Livechat from '@/components/chat/Livechat';
import useIsLiveChatWidgetAvailable from '@/components/chat/useIsLiveChatWidgetAvailable';
import { standalone_routes } from '@/components/shared';
import { useFirebaseCountriesConfig } from '@/hooks/firebase/useFirebaseCountriesConfig';
import useRemoteConfig from '@/hooks/growthbook/useRemoteConfig';
import { useIsIntercomAvailable } from '@/hooks/useIntercom';
import useThemeSwitcher from '@/hooks/useThemeSwitcher';
import RootStore from '@/stores/root-store';
import {
    LegacyAccountLimitsIcon,
    LegacyCashierIcon,
    LegacyChartsIcon,
    LegacyHelpCentreIcon,
    LegacyReportsIcon,
    LegacyResponsibleTradingIcon,
    LegacyTheme1pxIcon,
    LegacyWhatsappIcon,
} from '@deriv/quill-icons/Legacy';
import { useTranslations } from '@deriv-com/translations';
import { ToggleSwitch } from '@deriv-com/ui';
import { URLConstants } from '@deriv-com/utils';

export type TSubmenuSection = 'accountSettings' | 'cashier' | 'reports';

//IconTypes
type TMenuConfig = {
    LeftComponent: React.ElementType;
    RightComponent?: ReactNode;
    as: 'a' | 'button';
    href?: string;
    label: ReactNode;
    onClick?: () => void;
    removeBorderBottom?: boolean;
    submenu?: TSubmenuSection;
    target?: ComponentProps<'a'>['target'];
    isActive?: boolean;
}[];

const useMobileMenuConfig = (client?: RootStore['client']) => {
    const { localize } = useTranslations();
    const { is_dark_mode_on, toggleTheme } = useThemeSwitcher();

    const { data } = useRemoteConfig(true);
    const { cs_chat_whatsapp } = data;

    const { is_livechat_available } = useIsLiveChatWidgetAvailable();
    const icAvailable = useIsIntercomAvailable();

    // Get current account information for dependency tracking
    const accounts = client?.accounts || {};

    const { hubEnabledCountryList } = useFirebaseCountriesConfig();

    const has_wallet = Object.keys(accounts).some(id => accounts[id].account_category === 'wallet');
    const is_hub_enabled_country = hubEnabledCountryList.includes(client?.residence || '');


    const menuConfig = useMemo(
        (): TMenuConfig[] => [
            [
                {
                    as: 'a',
                    href: standalone_routes.bot,
                    label: localize('Bot Builder'),
                    LeftComponent: LegacyChartsIcon,
                    isActive: true,
                },
                !has_wallet &&
                    !is_hub_enabled_country && {
                        as: 'a',
                        href: standalone_routes.cashier_deposit,
                        label: localize('Cashier'),
                        LeftComponent: LegacyCashierIcon,
                    },
                client?.is_logged_in && {
                    as: 'button',
                    label: localize('Reports'),
                    LeftComponent: LegacyReportsIcon,
                    submenu: 'reports',
                    onClick: () => {},
                },
                {
                    as: 'button',
                    label: localize('Dark theme'),
                    LeftComponent: LegacyTheme1pxIcon,
                    RightComponent: <ToggleSwitch value={is_dark_mode_on} onChange={toggleTheme} />,
                },
            ].filter(Boolean) as TMenuConfig,
            [
                {
                    as: 'a',
                    href: standalone_routes.help_center,
                    label: localize('Help center'),
                    LeftComponent: LegacyHelpCentreIcon,
                },
                {
                    as: 'a',
                    href: standalone_routes.account_limits,
                    label: localize('Account limits'),
                    LeftComponent: LegacyAccountLimitsIcon,
                },
                {
                    as: 'a',
                    href: standalone_routes.responsible,
                    label: localize('Responsible trading'),
                    LeftComponent: LegacyResponsibleTradingIcon,
                },
                cs_chat_whatsapp
                    ? {
                          as: 'a',
                          href: URLConstants.whatsApp,
                          label: localize('WhatsApp Support'),
                          LeftComponent: LegacyWhatsappIcon,
                          target: '_blank',
                      }
                    : null,
                is_livechat_available || icAvailable
                    ? {
                          as: 'button',
                          label: localize('Live chat'),
                          LeftComponent: Livechat,
                          onClick: () => {
                              icAvailable ? window.Intercom('show') : window.LiveChatWidget?.call('maximize');
                          },
                      }
                    : null,
            ].filter(Boolean) as TMenuConfig,
            // Logout button removed from mobile interface as per acceptance criteria
            [],
        ],
        [
            client?.is_logged_in,
            icAvailable,
            is_dark_mode_on,
            toggleTheme,
            is_livechat_available,
            cs_chat_whatsapp,
            localize,
            has_wallet,
            is_hub_enabled_country,
        ]
    );

    return {
        config: menuConfig,
    };
};

export default useMobileMenuConfig;
