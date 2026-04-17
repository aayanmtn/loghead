# Google Analytics & Ads Conversion Tracking Plan

This document outlines the strategy to integrate Google Analytics 4 (GA4) into the Loghead website and set up conversion tracking for **Waitlist Joins** and **GitHub Stars** to support Google Ads campaigns.

## 1. Prerequisites

Before implementing the code changes, you need to set up the following in the [Google Analytics Console](https://analytics.google.com/):

1.  **Create a GA4 Property** for your website.
2.  **Create a Data Stream** (Web).
3.  **Copy the Measurement ID** (Format: `G-XXXXXXXXXX`).

## 2. Implementation Strategy

We will use the official `@next/third-parties` library which provides a performance-optimized component for Google Analytics in Next.js.

### Step 1: Install Dependencies

```bash
npm install @next/third-parties
```

### Step 2: Environment Configuration

Add your Measurement ID to your `.env.local` file (do not commit this file):

```env
NEXT_PUBLIC_GA_ID=G-XXXXXXXXXX
```

### Step 3: Global Configuration

Modify `app/layout.tsx` to include the `GoogleAnalytics` component.

```tsx
import { GoogleAnalytics } from '@next/third-parties/google'

// ... inside RootLayout ...
return (
  <html lang="en">
    <body>
      {/* ... existing code ... */}
    </body>
    <GoogleAnalytics gaId={process.env.NEXT_PUBLIC_GA_ID} />
  </html>
)
```

### Step 4: Create Analytics Utility

Create `lib/analytics.ts` to handle custom event firing.

```typescript
export const sendGAEvent = (eventName: string, params?: Record<string, any>) => {
  if (typeof window !== 'undefined' && (window as any).gtag) {
    (window as any).gtag('event', eventName, params);
  }
};
```

## 3. Event Tracking Plan

We will track two main user actions. Since the Waitlist form is an embedded iframe (Notion), we cannot track the actual form submission directly. We will track the *intent* (clicking the button) and the *page view*.

### A. Track "Join Waitlist" (Conversion)

**Definition:** User clicks the "Join Waitlist" button in the Pricing section or visits the request page.

**Locations to Update:**
1.  `components/pricing-section.tsx`: The "Join Waitlist" button (Cloud Edition card).

**Implementation Detail:**
Attach an `onClick` handler to the button:
```typescript
onClick={() => sendGAEvent('conversion', { send_to: 'AW-CONVERSION_ID/LABEL', event_category: 'waitlist', event_label: 'pricing_section' })}
// OR for pure GA4 event
onClick={() => sendGAEvent('join_waitlist_click', { source: 'pricing_section' })}
```

### B. Track "Star on GitHub" (Conversion)

**Definition:** User clicks any link directing to the GitHub repository.

**Locations to Update:**
1.  `components/hero-section.tsx`: The "Loghead v1.0 is now available" pill.
2.  `components/site-header.tsx`: The "Star on GitHub" button and "Docs" link.
3.  `components/pricing-section.tsx`: The "Get Started" (Community Edition) button.
4.  `components/cta-section.tsx`: "Get Started for Free" and "Read Documentation" buttons.
5.  `components/site-footer.tsx`: GitHub social icon.

**Implementation Detail:**
Attach an `onClick` handler to these links:
```typescript
onClick={() => sendGAEvent('github_visit', { source: 'hero_pill' })} // source varies (e.g., 'site_header', 'footer', 'cta_section')
```

### C. Track "Request Connector" (Engagement)

**Definition:** User clicks on "Coming Soon" connector cards or "Request More" in the features section.

**Locations to Update:**
1.  `components/feature-section.tsx`: "Coming Soon" cards and "Request More +" card.

**Implementation Detail:**
```typescript
onClick={() => sendGAEvent('request_connector_click', { connector_name: 'AWS CloudWatch' })}
```

### D. Track "Copy Command" (Engagement)

**Definition:** User copies the `npx @loghead/core` command.

**Locations to Update:**
1.  `components/hero-section.tsx`: Copy button in the command bar.
2.  `components/how-to-use-section.tsx`: Copy button in the installation step card.

**Implementation Detail:**
```typescript
// Inside handleCopy function
sendGAEvent('copy_command', { command: 'npx @loghead/core', location: 'hero_section' });
```

### E. Track "Discord Visit" (Community)

**Definition:** User clicks a link to join the Discord server.

**Locations to Update:**
1.  `components/site-header.tsx`: "Discord Support" button.
2.  `components/site-footer.tsx`: Discord social icon.

**Implementation Detail:**
```typescript
onClick={() => sendGAEvent('discord_visit', { location: 'site_header' })}
```

### F. Track "Extension Install" (Conversion)

**Definition:** User clicks on Chrome or VS Code extension buttons.

**Locations to Update:**
1.  `components/hero-section.tsx`: Chrome & VS Code buttons.
2.  `components/site-footer.tsx`: Extension links in Product column.

**Implementation Detail:**
```typescript
onClick={() => sendGAEvent('chrome_extension_click', { location: 'hero_section' })}
onClick={() => sendGAEvent('vscode_extension_click', { location: 'site_footer' })}
```

### G. General Navigation Tracking

**Definition:** User clicks internal navigation links (Footer/Header).

**Locations to Update:**
1.  `components/site-header.tsx`: Main nav links.
2.  `components/site-footer.tsx`: Footer links (Product, Company, Legal).

**Implementation Detail:**
```typescript
onClick={() => sendGAEvent('nav_click', { label: 'Features', location: 'site_header' })}
```

## 4. Google Ads & GA4 Configuration

Once the code is deployed, follow these steps to connect it to Google Ads:

### Step 1: Mark Events as Key Events (Conversions) in GA4
1.  Go to **Admin** > **Data display** > **Events**.
2.  You will see existing events like `page_view`, `click`.
3.  Wait for your new events (`join_waitlist_click`, `github_visit`) to appear (can take 24h) OR manually create them.
4.  Go to **Key Events** (formerly Conversions) and mark `join_waitlist_click` and `github_visit` as key events.

### Step 2: Link Google Ads
1.  In GA4 Admin, go to **Product links** > **Google Ads Links**.
2.  Link your Google Ads account.

### Step 3: Import Conversions in Google Ads
1.  In Google Ads, go to **Goals** > **Conversions** > **Summary**.
2.  Click **+ New Conversion Action** > **Import** > **Google Analytics 4 Properties**.
3.  Select `join_waitlist_click` and `github_visit`.
4.  Set the value for these conversions (e.g., a Waitlist sign-up might be worth $10 to you, a Star $1).

## 5. Summary of Code Changes Required

| File | Action |
|------|--------|
| `package.json` | Install `@next/third-parties` |
| `.env.local` | Add `NEXT_PUBLIC_GA_ID` |
| `app/layout.tsx` | Add `<GoogleAnalytics>` component |
| `lib/analytics.ts` | Create helper function |
| `components/hero-section.tsx` | Track: GitHub Link, Copy Command, Extensions |
| `components/site-header.tsx` | Track: Nav Links, Discord, GitHub |
| `components/pricing-section.tsx` | Track: Waitlist, GitHub (Start) |
| `components/cta-section.tsx` | Track: GitHub (Get Started, Docs) |
| `components/feature-section.tsx` | Track: Request Connector (Cards/Link) |
| `components/how-to-use-section.tsx` | Track: Copy Command |
| `components/site-footer.tsx` | Track: Social Links, Footer Nav, Extensions |
