/**
 * @cher-journal/translations
 * Shared translation files for all Cher Journal applications
 *
 * Usage:
 * - Frontend: Load from /locales/{lang}/common.json
 * - Backend: Import translations from this package
 * - Admin: Load from /locales/{lang}/common.json
 */

// Path to translation files (relative to package root)
export const TRANSLATIONS_PATH = {
  en: './locales/en/common.json',
  fr: './locales/fr/common.json',
} as const;

// Language types
export type Language = 'en' | 'fr';

// Get translation file path for a language
export function getTranslationPath(lang: Language): string {
  return TRANSLATIONS_PATH[lang];
}

// Supported languages
export const SUPPORTED_LANGUAGES: Language[] = ['en', 'fr'];

// Default language
export const DEFAULT_LANGUAGE: Language = 'en';

// Language info
export const LANGUAGE_INFO = {
  en: {
    name: 'English',
    code: 'en',
    direction: 'ltr',
  },
  fr: {
    name: 'Français',
    code: 'fr',
    direction: 'ltr',
  },
} as const;

// Export types for type safety
export interface TranslationKeys {
  navigation: {
    dashboard: string;
    chapters: string;
    users: string;
    orders: string;
    settings: string;
    logout: string;
    collapse_sidebar: string;
    expand_sidebar: string;
    home: string;
    catalog: string;
    library: string;
    account: string;
    login: string;
    register: string;
  };
  header: {
    admin: string;
    welcome: string;
    language: string;
    french: string;
    english: string;
    search_placeholder: string;
  };
  home: {
    title: string;
    subtitle: string;
    featured: string;
    latest: string;
    popular: string;
    categories: string;
    explore: string;
    my_library: string;
  };
  catalog: {
    title: string;
    all_chapters: string;
    search: string;
    filter: string;
    sort: string;
    sort_newest: string;
    sort_popular: string;
    sort_rating: string;
    no_results: string;
    loading: string;
    author: string;
    genre: string;
    rating: string;
    price: string;
    free: string;
    read_now: string;
    buy: string;
    add_to_library: string;
  };
  chapter: {
    title: string;
    volumes: string;
    volume: string;
    chapter_number: string;
    published: string;
    author: string;
    rating: string;
    read_time: string;
    wait_to_unlock: string;
    waiting: string;
    time_remaining: string;
    start_reading: string;
    continue_reading: string;
    mark_as_read: string;
    add_bookmark: string;
    share: string;
    report: string;
    locked: string;
    unlock_now: string;
    unlock_in: string;
    owned: string;
    requires_purchase: string;
  };
  library: {
    title: string;
    owned: string;
    reading: string;
    wishlist: string;
    completed: string;
    no_stories: string;
    no_reading: string;
    no_wishlist: string;
    no_completed: string;
    empty: string;
    continue_reading: string;
    remove: string;
    add_to_wishlist: string;
    remove_from_wishlist: string;
  };
  reader: {
    title: string;
    font_size: string;
    line_height: string;
    background: string;
    theme: string;
    light: string;
    dark: string;
    sepia: string;
    toc: string;
    bookmarks: string;
    notes: string;
    settings: string;
    previous_chapter: string;
    next_chapter: string;
    go_to_chapter: string;
    bookmark_added: string;
    bookmark_removed: string;
    note_added: string;
    note_deleted: string;
    exit_fullscreen: string;
    enter_fullscreen: string;
    zoom_in: string;
    zoom_out: string;
  };
  account: {
    title: string;
    profile: string;
    settings: string;
    purchases: string;
    wishlist: string;
    preferences: string;
    security: string;
    email: string;
    username: string;
    name: string;
    edit_profile: string;
    change_password: string;
    password: string;
    current_password: string;
    new_password: string;
    confirm_password: string;
    language: string;
    notifications: string;
    theme: string;
    save_changes: string;
    profile_updated: string;
  };
  purchase: {
    title: string;
    checkout: string;
    cart: string;
    item: string;
    quantity: string;
    price: string;
    subtotal: string;
    tax: string;
    total: string;
    payment_method: string;
    card: string;
    apple_pay: string;
    google_pay: string;
    paypal: string;
    continue: string;
    complete_purchase: string;
    processing: string;
    purchase_complete: string;
    order_number: string;
    download_receipt: string;
    back_to_library: string;
  };
  auth: {
    title: string;
    login: string;
    register: string;
    email: string;
    password: string;
    confirm_password: string;
    remember_me: string;
    forgot_password: string;
    dont_have_account: string;
    already_have_account: string;
    sign_up: string;
    sign_in: string;
    or: string;
    with_google: string;
    with_facebook: string;
    with_apple: string;
    login_success: string;
    register_success: string;
    check_email: string;
    reset_password: string;
    reset_link_sent: string;
    reset_success: string;
  };
  errors: {
    title: string;
    not_found: string;
    unauthorized: string;
    forbidden: string;
    server_error: string;
    network_error: string;
    loading_error: string;
    invalid_email: string;
    invalid_password: string;
    password_mismatch: string;
    email_required: string;
    password_required: string;
    chapter_not_found: string;
    try_again: string;
    go_home: string;
    back: string;
  };
  common: {
    loading: string;
    error: string;
    success: string;
    warning: string;
    info: string;
    confirm: string;
    cancel: string;
    save: string;
    delete: string;
    edit: string;
    view: string;
    close: string;
    search: string;
    filter: string;
    sort: string;
    apply: string;
    clear: string;
    submit: string;
    next: string;
    previous: string;
    more: string;
    less: string;
    show_more: string;
    show_less: string;
    no_results: string;
    empty: string;
    or: string;
    and: string;
    copy: string;
    copied: string;
    download: string;
    upload: string;
    version: string;
    yes: string;
    no: string;
    ok: string;
    hours: string;
    hours_plural: string;
    minutes: string;
    minutes_plural: string;
    seconds: string;
    seconds_plural: string;
  };
  messages: {
    loading: string;
    please_wait: string;
    saving: string;
    saved: string;
    saved_successfully: string;
    deleting: string;
    deleted: string;
    deleted_successfully: string;
    confirm_delete: string;
    action_required: string;
    session_expired: string;
    access_denied: string;
  };
}

// Export everything
export default {
  TRANSLATIONS_PATH,
  SUPPORTED_LANGUAGES,
  DEFAULT_LANGUAGE,
  LANGUAGE_INFO,
  getTranslationPath,
};
