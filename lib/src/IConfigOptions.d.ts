import { IClientWellKnown } from "matrix-js-sdk/src/matrix";
import { ValidatedServerConfig } from "./utils/ValidatedServerConfig";
export interface IConfigOptions {
    default_server_config?: IClientWellKnown;
    default_server_name?: string;
    default_hs_url?: string;
    default_is_url?: string;
    validated_server_config?: ValidatedServerConfig;
    fallback_hs_url?: string;
    disable_custom_urls?: boolean;
    disable_guests?: boolean;
    disable_login_language_selector?: boolean;
    disable_3pid_login?: boolean;
    brand: string;
    branding?: {
        welcome_background_url?: string | string[];
        auth_header_logo_url?: string;
        auth_footer_links?: {
            text: string;
            url: string;
        }[];
    };
    map_style_url?: string;
    embedded_pages?: {
        welcome_url?: string;
        home_url?: string;
        login_for_welcome?: boolean;
    };
    permalink_prefix?: string;
    update_base_url?: string;
    desktop_builds?: {
        available: boolean;
        logo: string;
        url: string;
    };
    mobile_builds?: {
        ios?: string;
        android?: string;
        fdroid?: string;
    };
    mobile_guide_toast?: boolean;
    default_theme?: "light" | "dark" | string;
    default_country_code?: string;
    default_federate?: boolean;
    default_device_display_name?: string;
    setting_defaults?: Record<string, any>;
    integrations_ui_url?: string;
    integrations_rest_url?: string;
    integrations_widgets_urls?: string[];
    show_labs_settings?: boolean;
    features?: Record<string, boolean>;
    bug_report_endpoint_url?: string;
    uisi_autorageshake_app?: string;
    sentry?: {
        dsn: string;
        environment?: string;
    };
    widget_build_url?: string;
    audio_stream_url?: string;
    jitsi?: {
        preferred_domain: string;
    };
    jitsi_widget?: {
        skip_built_in_welcome_screen?: boolean;
    };
    voip?: {
        obey_asserted_identity?: boolean;
    };
    logout_redirect_url?: string;
    sso_immediate_redirect?: boolean;
    sso_redirect_options?: ISsoRedirectOptions;
    custom_translations_url?: string;
    report_event?: {
        admin_message_md: string;
    };
    welcome_user_id?: string;
    room_directory?: {
        servers: string[];
    };
    piwik?: false | {
        policy_url: string;
    };
    posthog?: {
        project_api_key: string;
        api_host: string;
    };
    analytics_owner?: string;
    privacy_policy_url?: string;
    hosting_signup_link?: string;
    host_signup?: {
        brand?: string;
        cookie_policy_url: string;
        privacy_policy_url: string;
        terms_of_service_url: string;
        url: string;
        domains?: string[];
    };
    enable_presence_by_hs_url?: Record<string, boolean>;
    terms_and_conditions_links?: {
        url: string;
        text: string;
    }[];
    latex_maths_delims?: {
        inline?: {
            left?: string;
            right?: string;
        };
        display?: {
            left?: string;
            right?: string;
        };
    };
    sync_timeline_limit?: number;
    dangerously_allow_unsafe_and_insecure_passwords?: boolean;
    spaces_learn_more_url?: string;
}
export interface ISsoRedirectOptions {
    immediate?: boolean;
    on_welcome_page?: boolean;
}
