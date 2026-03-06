# Design Prompts for Cher Journal Account Pages

These design prompts are comprehensive specifications for generating production-ready UI pages for the Account section in apps/web. Each prompt includes layout, component structure, styling guidelines, and user interactions.

## Design System Reference

### Color Palette
- **Primary Gold**: #c5a059 (champagne/warm gold)
- **Dark Boudoir**: #2d1620 (dark brown), #1a0d0a (very dark brown)
- **Light Background**: Off-white/cream
- **Dark Background**: Charcoal/dark gray
- **Accent Colors**: Red (#dc2626), Green (#16a34a), Yellow (#eab308), Purple (#a855f7)

### Typography
- **Headings**: Serif font (font-display), italic, bold, 24-32px
- **Subheadings**: Serif, italic, 18-20px
- **Body Text**: sans-serif, 14-16px
- **Labels**: sans-serif, 12px, uppercase, tracking-wide
- **Icons**: Material Symbols Outlined (always)

### Components
- **Cards**: Rounded-2xl, subtle borders, shadow-sm/shadow-md on hover
- **Buttons**: Rounded-lg/rounded-xl, smooth transitions
- **Inputs**: rounded-xl, focus:ring-2 focus:ring-[#c5a059]
- **Badges**: Inline badges with colored backgrounds and text

---

## 1. My Books (Library Page)

**Purpose**: Display user's purchased or unlocked books/chapters with reading progress and favorites

**URL**: `/account/my-books`

**Layout Structure**:
- Full-width container with max-width constraint
- Header section with title "Mes Livres" and description
- Filter/Sort toolbar (optional: by series, status, date added)
- Grid layout showing book cards

**Header Section**:
- Large serif italic gold heading "Mes Livres"
- Subtitle: "Vos romans, histoires et séries acquis"
- Search/filter options for finding books
- View toggle (grid/list view optional)

**Content Grid**:
- Responsive: 1 column (mobile), 2 columns (tablet), 3-4 columns (desktop)
- Gap: 1.5rem
- Max card width: 300px

**Book Card Design**:
- Container: rounded-2xl, dark background with gold border/20, hover:shadow-lg
- Cover Image: Top section, rounded-t-2xl, 200px height, object-cover
- Book Info Section:
  - Title: serif italic, 16px, bold
  - Author: 12px, secondary color
  - Series: 12px, "Series Name, Vol. X"
- Status Indicator:
  - Reading Progress bar (if applicable): bg-gold, height 4px, rounded-full
  - Current page/percentage: small text below bar
  - Status badge: "Reading", "Completed", "Favorites" (different colors)
- Footer Section:
  - Last read date: "Last read: 2 days ago"
  - Action buttons:
    - "Continue Reading" button (primary)
    - "Details" link (secondary)

**Empty State**:
- Centered content area
- Large icon (auto_stories, 80px, light gold)
- Message: "Aucun livre pour le moment"
- Subtext: "Commencez votre voyage en visitant notre catalogue"
- CTA Button: "Découvrir le Catalogue"

**Responsive Behavior**:
- Mobile: Single column, full width cards with padding
- Tablet: 2 columns with proper spacing
- Desktop: 3-4 columns with maximum width container

---

## 2. Purchase History

**Purpose**: Display completed orders with dates, amounts, status, and invoice access

**URL**: `/account/purchases`

**Layout Structure**:
- Full-width container
- Header with title and description
- Timeline/chronological list of purchases
- Grouped by month (collapsible sections optional)

**Header Section**:
- Title: "Historique des Achats" (serif italic gold, 28px)
- Subtitle: "Consultez l'historique complet de vos transactions"
- Optional: Date range filter, total spent summary

**Month Grouping Header**:
- Month/Year label in serif italic gold, 18px, capitalized
- Underline border (2px, gold/30)
- Margin below: 1rem

**Purchase Item Card**:
- Container: bg-white dark:bg-[#2d1620]/60, rounded-2xl, border gold/30, shadow-sm
- Hover state: border-gold, shadow-md, smooth transition
- Layout: Flex, space-between (title/info on left, amount on right)
- Left Section:
  - Icon: receipt_long (gold, Material Symbols)
  - Product Title: serif italic, 16px, bold
  - Purchase Date: 12px, secondary text, formatted as "15 janvier 2024"
  - Status Badge: Small rounded badge (green for completed, yellow for pending, red for refunded)
- Right Section:
  - Amount: serif bold, 20px, gold
  - "View Invoice" link: 12px, hover:text-gold

**Status Badges**:
- Completed: bg-green-100 dark:bg-green-900/30, text-green-800 dark:text-green-300
- Pending: bg-yellow-100 dark:bg-yellow-900/30, text-yellow-800 dark:text-yellow-300
- Refunded: bg-red-100 dark:bg-red-900/30, text-red-800 dark:text-red-300

**Empty State**:
- Centered container with padding
- Large shopping_bag icon (80px, light gold/30)
- Message: "Aucun achat pour le moment"
- Subtext: "Explorez notre catalogue pour trouver vos prochaines lectures"

**Price Formatting**:
- All amounts: "25,50 €" (French format)
- Large text: 18-20px
- Secondary text: 14px

---

## 3. Support Claims (Claims Page)

**Purpose**: Manage support requests/tickets from the user

**URL**: `/account/claims`

**Layout Structure**:
- Full-width container
- Header with title and CTA button
- Table or card list of support tickets
- Status indicators for each claim

**Header Section**:
- Title: "Assistance" (serif italic gold, 28px)
- Subtitle: "Gérez vos demandes d'assistance et de support"
- Primary Button: "+ Nouvelle demande" (gold background, hover effect)

**Support Ticket Card** (if grid view) or **Row** (if table):
- Container: rounded-2xl, dark background, gold border/30, hover:shadow-lg
- Layout:
  - Left: Ticket ID and subject (serif italic, 14-16px)
  - Middle: Category badge (small, colored), date created, last update
  - Right: Status badge (open, in-progress, resolved, closed)
  - Bottom: Brief description (2 lines max)
- Status Badges:
  - Open: bg-blue-100 dark:bg-blue-900/30
  - In Progress: bg-yellow-100 dark:bg-yellow-900/30
  - Resolved: bg-green-100 dark:bg-green-900/30
  - Closed: bg-gray-100 dark:bg-gray-900/30

**Ticket Detail Modal/Drawer** (on click):
- Header: Ticket ID, subject, status badge
- Timeline of messages/updates
- Reply form at bottom
- Close/Actions buttons (top right)

**Empty State**:
- Centered content
- support_agent icon (80px, light gold/30)
- Message: "Aucune demande de support"
- Subtext: "Vous n'avez pas de demande en cours"
- CTA Button: "Contacter le support"

**Responsive Design**:
- Mobile: Card layout, stacked vertically
- Tablet+: Table or multi-column grid layout

---

## 4. My Reviews

**Purpose**: Display user's reviews for books/chapters they've read

**URL**: `/account/reviews`

**Layout Structure**:
- Full-width container
- Header with title and optional filter/sort controls
- List or grid of user reviews

**Header Section**:
- Title: "Mes Avis" (serif italic gold, 28px)
- Subtitle: "Partages vos avis sur les histoires que vous avez lues"
- Optional: Filter by rating, date range, status

**Review Card**:
- Container: rounded-2xl, white/dark background, border gold/30, shadow-sm
- Layout:
  - Top: Book/Chapter info (thumbnail image, title, author)
  - Middle: Star rating (5-star display), review text (200-300 chars)
  - Bottom: Date posted, edit/delete actions
- Book Info:
  - Small cover image (40x60px, rounded)
  - Title (serif, 14px, bold)
  - Author (12px, secondary)
  - Series info (12px, lighter)
- Rating Display:
  - 5 gold stars (★★★★★)
  - Numeric rating (e.g., "4.5/5")
- Review Text:
  - 12-14px body text
  - "Read more" link if truncated
- Metadata:
  - Smaller text: "Posted 3 days ago"
  - Helpful count: "45 people found this helpful"
- Action Buttons:
  - Edit (small link)
  - Delete (small link with confirmation)

**Review Sorting Options**:
- Most Recent
- Highest Rating
- Lowest Rating
- Most Helpful

**Empty State**:
- Centered container
- rate_review icon (80px, light gold/30)
- Message: "Aucun avis pour le moment"
- Subtext: "Partagez vos avis sur les histoires que vous avez lues"

**Responsive**:
- Mobile: Single column, cards take full width minus padding
- Tablet+: 2 columns
- Desktop: Up to 3 columns if space allows

---

## 5. Promotions

**Purpose**: Display available promotional codes and applied promotions

**URL**: `/account/promotions`

**Layout Structure**:
- Full-width container
- Two main sections: Available Promotions, Applied Promotions
- Grid layout for promotion cards

**Header Section**:
- Title: "Promotions & Codes" (serif italic gold, 28px)
- Subtitle: "Découvrez vos codes promotionnels disponibles"
- Tabs or sections for "Available" vs "Applied"

**Available Promotion Card**:
- Container: gradient bg (dark brown to very dark), rounded-2xl, border gold/30, shadow-lg
- Header Bar: gradient from gold to darker gold, white text, padding
  - Promotion Name (bold, 16px)
  - Brief description (12px, secondary)
  - Discount display: Large centered number with icon (e.g., "-20%", "GRATUIT", "-€5.00")
- Body Section:
  - Scope badge: "Chapitre Complet", "Volume", "POV Protagoniste", etc.
  - Content unlocked (if applicable): Cover image (40x60px), title, volume info
  - Validity info: "Valid until [date]"
  - Usage limits: "5 uses remaining" or "Unlimited"
  - User limit: "1 remaining for you"
- CTA Button: "Profiter de l'offre" (gold bg, full width, rounded-lg)

**Applied Promotions Section**:
- List of currently active promotions
- Show expiry date, remaining uses, scope
- Option to "Remove" or "View Details"

**Promotion Modal** (on CTA click):
- Confirmation dialog
- Show full details of promotion
- Select product/chapter to apply to (if applicable)
- Apply button
- Success message after application

**Empty State**:
- Centered container
- card_giftcard icon (80px, light gold/30)
- Message: "Aucune promotion disponible"
- Subtext: "Vérifiez votre email pour les codes promotionnels exclusifs"

---

## 6. Subscription

**Purpose**: Manage subscription status, billing, and plan details

**URL**: `/account/subscription`

**Layout Structure**:
- Full-width container with sections stacked vertically
- Current plan display
- Billing details
- Plan upgrade/downgrade options

**Current Plan Section**:
- Large card with plan name and status
- Plan name (serif italic, 24px)
- Status badge: "Active" (green), "Inactive" (gray), "Trial" (blue)
- Plan details grid:
  - Number of chapters per month
  - Early access benefits
  - Exclusive content available
- Renewal date: "Renews on [date]"
- Price: Large, gold, "€9.99/month" or "€99/year"
- Action buttons: "Cancel Subscription", "Change Plan", "View Details"

**Billing Section**:
- Next billing date
- Payment method on file
- Last 3 billing entries:
  - Date, amount, status, "View Invoice" link
- "Update Payment Method" button

**Available Plans Section** (if applicable):
- Grid of plan cards showing upgrades/alternatives
- Compare feature toggle (show/hide feature comparison table)
- Each plan card shows: name, price, features, current/upgrade button

**Billing History**:
- Table or list of invoices
- Date, amount, status badge, invoice link
- Optional: Download receipt button

**Cancellation Section** (Danger Zone):
- Red background card
- Warning icon
- "Cancel Subscription" button with confirmation modal

**Empty State** (for no subscription):
- Centered container
- card_membership icon (80px, light gold/30)
- Message: "Aucun abonnement actif"
- CTA: "Découvrir nos offres d'abonnement"

---

## 7. Preferences

**Purpose**: User reading and content preferences

**URL**: `/account/preferences`

**Layout Structure**:
- Full-width container
- Multiple sections for different preference categories
- Vertical stack or collapsible sections

**Header Section**:
- Title: "Préférences" (serif italic gold, 28px)
- Subtitle: "Personnalisez votre expérience de lecture"

**Preference Sections**:

### Display Preferences
- Card with heading "Affichage"
- Font size selector: radio buttons (Small, Medium, Large)
- Theme selector: radio buttons (Light, Dark, Auto)
- Text alignment: centered vs justified
- Line spacing: options (Compact, Normal, Wide)

### Reading Preferences
- Card with heading "Lecture"
- Default perspective on new chapters: dropdown (Narrator, Protagonist)
- Auto-scroll speed: slider
- Show chapter statistics: toggle
- Read notifications: toggle
- Mark as read automatically: toggle with time setting

### Content Preferences
- Card with heading "Contenu"
- Content rating filters: checkboxes (All, Explicit, Moderate, Mild)
- Show spoiler warnings: toggle
- Hide reviews by default: toggle
- Language preferences: checkboxes for available languages

### Privacy Preferences
- Card with heading "Confidentialité"
- Profile visibility: dropdown (Public, Friends Only, Private)
- Show reading activity: toggle
- Allow recommendations: toggle
- Share with partners: toggle

**Save/Reset Buttons**:
- "Enregistrer les modifications" (gold button)
- "Réinitialiser par défaut" (secondary button)
- Success message on save: "Préférences mises à jour"

**Responsive**:
- Mobile: Full width sections, stacked vertically
- Tablet+: 2-column layout for sections

---

## 8. Notifications

**Purpose**: Manage notification settings and channels

**URL**: `/account/notifications`

**Layout Structure**:
- Full-width container
- Notification channels section
- Notification types and frequency settings

**Header Section**:
- Title: "Notifications" (serif italic gold, 28px)
- Subtitle: "Gérez vos préférences de notifications"

**Notification Channels**:
- Email: toggle switch (On/Off)
- In-app notifications: toggle switch
- SMS (if applicable): toggle switch
- Push notifications (if web app): toggle switch
- Each channel with description: "Receive [type] notifications via [channel]"

**Notification Categories** (Collapsible Sections):

### Account & Security
- New login notification: toggle
- Account changes notification: toggle
- Security alerts: toggle (always on recommended)

### Books & Reading
- New chapter notification: toggle + frequency (immediate, daily digest)
- Series update notification: toggle
- Book recommendations: toggle + frequency
- Book wishlist alerts: toggle

### Promotions & Offers
- New promotion codes: toggle
- Exclusive offers: toggle
- Sale notifications: toggle
- Flash deals: toggle

### Social & Reviews
- New review of your book: toggle (if author)
- Someone helpful/unhelpful your review: toggle
- Follow notifications: toggle
- Comments on your reviews: toggle

**Each Toggle Option**:
- Toggle switch (on/off)
- Optional: Frequency dropdown (Immediate, Daily Digest, Weekly, Never)
- Helper text explaining what the notification is for

**Save Button**:
- "Enregistrer les modifications" button at bottom
- Success toast: "Préférences de notifications mises à jour"

**Responsive**:
- Mobile: Full width, sections stack vertically
- Desktop: 2-column grid for better space utilization

---

## 9. Connected Devices

**Purpose**: Manage active sessions and connected devices

**URL**: `/account/devices`

**Layout Structure**:
- Full-width container
- List of active sessions/devices
- Security information
- Sign out options

**Header Section**:
- Title: "Appareils Connectés" (serif italic gold, 28px)
- Subtitle: "Gérez vos sessions actives et appareils"
- Info box: "Currently signed in on [X] devices"

**Active Sessions Section**:
- List/grid of device cards
- Each card shows:
  - Device icon (smartphone, desktop, tablet) + Material Symbols icon
  - Device name (editable): "iPhone 12", "Chrome on Windows", etc.
  - Device type: "Mobile | Desktop | Tablet"
  - Browser: "Chrome, Safari, Firefox, etc."
  - Last activity: "Active now" or "Last active 2 hours ago"
  - Location (if available): "City, Country"
  - IP Address (partially obscured): "192.168.x.x"
  - Timestamp: "Logged in on [date] at [time]"
  - Actions: "Sign out", "Details" button

**Current Device Highlight**:
- Card has special styling (gold border, highlight)
- Label: "Current Device" or "This Device"
- "Sign out other devices" option

**Sign Out Actions**:
- "Sign out this device" button (visible on current device)
- "Sign out from all devices" button (warning style)
- Confirmation modal: "This will sign you out from all devices. Continue?"

**Security Info Section**:
- Security badge: "Your account is secure"
- Two-factor authentication status: "Enabled / Disabled" with toggle
- Last password change: "Changed on [date]"
- Security recommendations: collapsible section

**Responsive**:
- Mobile: Single column cards, full width
- Tablet+: 2-column grid layout

---

## 10. Account Information

**Purpose**: Edit personal information and account security

**URL**: `/account/account-info`

**Layout Structure**:
- Full-width container with vertical sections
- Personal info section
- Password/Security section
- Account deletion section (danger zone)

**Header Section**:
- Title: "Informations de Compte" (serif italic gold, 28px)
- Subtitle: "Gérez vos informations personnelles et votre sécurité"

**Personal Information Section**:
- Card with person icon
- Subheading: "Informations Personnelles"
- Form fields in 2-column grid:
  - First Name (text input)
  - Last Name (text input)
  - Email (text input, possibly read-only or with verification)
  - Phone (optional text input)
- Save button: "Mettre à jour"
- Success message: "Profil mis à jour"

**Input Styling**:
- rounded-xl, border boudoir-300 dark:border-boudoir-800
- bg-white dark:bg-boudoir-900/30
- focus:ring-2 focus:ring-[#c5a059]
- Smooth transitions

**Security Section**:
- Card with lock icon
- Subheading: "Sécurité"
- Current password status: "Protected" with lock icon
- "Change Password" button (toggles password form)
  - Current Password field (password input)
  - New Password field (password input with strength indicator)
  - Confirm Password field (password input)
  - Confirm/Cancel buttons
- Password Strength Indicator:
  - Visual bar showing strength (Weak, Fair, Good, Strong)
  - Color: red → yellow → green
  - Requirements: At least 8 characters, uppercase, numbers, symbols
- Password Changed: "Last changed on [date]"

**Two-Factor Authentication Section** (in Security card):
- Toggle: Enable/Disable 2FA
- Status: "Enabled" (green badge) or "Disabled"
- If enabled:
  - Recovery codes (hidden by default, show on click)
  - Regenerate codes button
  - Instructions for setting up authenticator app

**Account Deletion Section** (Danger Zone):
- Red background card (red-50 light, red-900/20 dark)
- Red border
- Warning icon
- Subheading: "Zone de danger" (red text)
- Warning text: "Deletion is permanent and irreversible"
- "Delete Account" button (red background, hover:red-700)
- Confirmation Modal:
  - Warning icon and heading
  - Explanation of consequences
  - "Type SUPPRIMER to confirm:" input field
  - Delete/Cancel buttons (delete disabled until text matches)

**Responsive**:
- Mobile: Full width inputs, single column
- Tablet+: 2-column grid for form fields

---

## 11. Payment Methods

**Purpose**: Manage saved payment methods and billing information

**URL**: `/account/payment-info`

**Layout Structure**:
- Full-width container
- Saved payment methods section
- Billing address section
- Add new payment method section

**Header Section**:
- Title: "Moyens de Paiement" (serif italic gold, 28px)
- Subtitle: "Gérez vos méthodes de paiement enregistrées"
- "+ Ajouter un moyen de paiement" button

**Saved Payment Methods**:
- Card layout for each saved method
- Card Design (for credit/debit cards):
  - Provider logo (Visa, Mastercard, Amex, etc.) top-right
  - Card type indicator: "Carte de crédit"
  - Last 4 digits: "•••• •••• •••• 4242" (large, 16px)
  - Expiry: "Expires 12/25"
  - Cardholder name (if available)
  - Set as default: toggle or "Set as default" button
  - Actions: "Edit" link, "Delete" link with confirmation
- Other Payment Methods (PayPal, Bank Transfer, etc.):
  - Provider name and icon
  - Email or account identifier
  - Status: "Verified" (green badge)
  - Set as default toggle
  - Actions: Edit/Delete

**Default Payment Method**:
- Highlight with gold border/background
- "Default" badge
- Actions available to change

**Empty State** (if no saved methods):
- Centered container
- credit_card icon (80px, light gold/30)
- Message: "Aucun moyen de paiement enregistré"
- CTA: "+ Ajouter un moyen de paiement"

**Billing Address Section**:
- Card with heading "Adresse de Facturation"
- Display current billing address (formatted)
- "Edit Billing Address" button
- Edit form (modal/in-place):
  - Street Address
  - City
  - Postal Code
  - Country (dropdown)
  - Save/Cancel buttons

**Add Payment Method Modal/Page**:
- Payment form (Stripe integration likely)
- Card holder name
- Card number (secure input)
- Expiry date (MM/YY)
- CVC (3-4 digits)
- Billing address confirmation
- Save button: "Enregistrer le moyen de paiement"
- Success message: "Moyen de paiement ajouté"

**Payment History Link**:
- Button linking to Purchase History page: "Voir l'historique de facturation"

**Responsive**:
- Mobile: Full width cards, stacked
- Tablet+: Grid layout for saved methods

---

## General Design Guidelines

### Spacing
- Section margins: 2-3rem (mb-8, mb-12)
- Card padding: 1.5-2rem (p-6, p-8)
- Component gaps: 1-1.5rem
- Button/Input padding: 0.75-1rem

### Shadows & Borders
- Borders: Most elements use border gold/20 to gold/30
- Card shadow: shadow-sm (normal), shadow-md (hover), shadow-lg (emphasis)
- Dark mode: Adjust opacity and use darker backgrounds

### Transitions
- Hover effects: 200-300ms smooth transition
- Color transitions: transition-all
- Shadows: transition-shadow

### Light/Dark Mode
- Every color should have `dark:` variant
- Light backgrounds: white, off-white, cream
- Dark backgrounds: #2d1620, #1a0d0a, with opacity layers
- Text contrast: Maintain WCAG AA minimum
- Gold should be slightly lighter in dark mode for visibility

### Interactions
- Buttons: Hover state with color shift and possible shadow increase
- Links: hover:text-[#c5a059] transition-colors
- Form focus: ring-2 ring-[#c5a059]
- Modals: 50% dark overlay, smooth fade-in/out

### Mobile-First Responsive
- Breakpoints: sm (640px), md (768px), lg (1024px), xl (1280px)
- Default: Single column
- Tablet (md): 2 columns where appropriate
- Desktop (lg+): 3+ columns, 2-column layouts, wider containers

### Accessibility
- Proper heading hierarchy (h1, h2, h3)
- ARIA labels for icons
- Focus states for keyboard navigation
- Color not sole differentiator
- Sufficient contrast ratios

### Loading States
- Spinner: Rounded circle, gold border-b-2, smooth rotation
- Loading cards: Skeleton loaders or opacity-50

---

## Implementation Notes

These prompts are designed to work with frontend-design AI tools to generate production-ready React/TypeScript components using:
- **Framework**: React 18 with TypeScript
- **Styling**: Tailwind CSS with custom theme colors
- **Icons**: Material Symbols Outlined (auto-loaded from Google Fonts API)
- **State Management**: React hooks (useState, useEffect)
- **API Integration**: Use existing api module from `src/lib/api`
- **Localization**: Use existing `useTranslation` hook from `src/lib/i18n`
- **Theme**: Support both light and dark mode with `dark:` variants

Each generated component should:
1. Be a complete, standalone React functional component
2. Include TypeScript types for props and state
3. Support full light/dark mode with all necessary `dark:` Tailwind classes
4. Use the existing color scheme (gold #c5a059, dark boudoir #2d1620, etc.)
5. Include proper error handling and loading states
6. Integrate with the existing API module for data fetching
7. Use Material Symbols Outlined icons consistently
8. Be responsive across mobile, tablet, and desktop viewports
9. Include proper accessibility features (ARIA labels, semantic HTML)
10. Follow the serif italic gold heading style throughout
