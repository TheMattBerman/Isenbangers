# Greg Isenberg Daily Bangers — PRD v4

## Overview

A playful iOS app that delivers one Greg Isenberg–style founder banger per day. Each banger is read aloud in Greg’s cloned voice, pushed via notification, and presented as a bold, shareable card. The key product loop is **user gets inspired → sees the banger card → shares it to socials**. Sharing is the distribution engine: users post Greg’s bangers to Instagram Stories, X, and TikTok, spreading the app and its culture.

---

## Goals

- Turn Greg Isenberg’s founder wisdom into a daily ritual.
- Build a simple, delightful loop of **inspiration → sharing → virality**.
- Monetize via subscription access to the full archive and unlimited spins.

---

## Target Audience

- Founders, operators, and startup-curious users.
- Fans of Greg Isenberg’s founder banger style.
- People looking for short, high-impact motivational content they can share.

---

## Core Loop

1. **User gets inspired**: Receives push notification, hears Greg’s voice, opens the daily banger.
2. **Card presentation**: Big, bold card with quote, audio, and subtle animation.
3. **Sharing**: One-tap share to Instagram Stories, X (Twitter), TikTok, or copy to clipboard. Sharing drives the viral loop and is the key metric.

---

## Free vs Paid Tiers

- **Free**

  - 1 daily banger
  - 3 wheel spins/day
  - Limited library previews

- **Paid (Weekly or Annual)**
  - Unlimited spins
  - Full archive of Greg’s bangers
  - Save unlimited favorites
  - Unlock “rare”/secret bangers

---

## Features

### Daily Banger

- Push notification at 9am (customizable).
- Card UI with bold typography.
- Play button for Greg’s ElevenLabs voice (stored in Cloudflare R2).
- Share buttons as primary CTA.

### Spin The Wheel

- Free: 3 spins/day. Paid: unlimited.
- Fun animation.
- “Rare” Greg bangers as Easter eggs.

### Paywalled Library

- Search + filter archive.
- Free: blurred/locked previews.
- Paid: full access + favorites.

### Sharing Tools

- Share card with Greg’s quote, app watermark, and audio snippet option.
- One-tap share to Instagram Stories, X, TikTok.
- Copy-to-clipboard for quick reposts or LLM prompts.

---

## Tech Stack

- **Client**: Expo (React Native, iOS first).
- **Backend**: Supabase (auth, user state, entitlements).
- **Storage**: Cloudflare R2 (audio + share images).
- **Voice**: ElevenLabs (pre-generated audio).
- **Payments**: Superwall SDK (weekly + annual).
- **Analytics**: PostHog (open rates, spins, shares, paywall conversion).
- **Notifications**: Expo Notifications (APNs).

---

## Data Model (Supabase)

- `bangers` (text, theme, rarity, audio_url, image_url).
- `daily_drops` (date → banger_id).
- `user_profiles` (timezone, notif_hour, subscription_status).
- `user_spins` (spins_used per day).
- `favorites` (user_id, banger_id).

Audio + images stored in R2, referenced via URL.

---

## Success Metrics

- **Activation**: % of installs opening first banger.
- **Engagement**: DAU, streaks, spins per day.
- **Virality**: shares per DAU, CTR from shared links.
- **Monetization**: paywall impressions, conversion rate, weekly vs annual split.

---

## Release Milestones

1. **Core MVP**: Daily banger card, voice playback, spins, share to socials.
2. **Paywall + Library**: Superwall integration, paid archive, favorites.
3. **Polish + Launch**: Rare bangers, streaks, meme templates, App Store release.
