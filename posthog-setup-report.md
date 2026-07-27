# PostHog post-wizard report

The wizard has completed a deep integration of PostHog analytics into the Recurly subscription management app (Expo / React Native). The SDK (`posthog-react-native`) and its required peer dependency (`react-native-svg`) were installed. A PostHog config module was created at `src/config/posthog.ts`, and `app.json` was migrated to `app.config.js` so environment variables are injected into the Expo build via `expo-constants` extras. `PostHogProvider` was added to the root layout with autocapture enabled (touch events, `testID` props) and manual screen tracking via `usePathname`. User identification (`posthog.identify`) is called on both sign-in and sign-up completion. A `posthog.reset()` call is paired with sign-out to clear the session.

| Event | Description | File |
|---|---|---|
| `user_signed_in` | User successfully authenticated with email and password | `app/(auth)/sign-in.tsx` |
| `sign_in_failed` | User attempted sign-in but authentication failed | `app/(auth)/sign-in.tsx` |
| `email_verification_requested` | User submitted sign-up form; verification email sent | `app/(auth)/sign-up.tsx` |
| `email_verified` | User verified their email and completed account creation | `app/(auth)/sign-up.tsx` |
| `sign_up_failed` | User attempted account creation but the request failed | `app/(auth)/sign-up.tsx` |
| `user_signed_out` | User tapped sign-out in settings | `app/(tabs)/settings.tsx` |
| `subscription_expanded` | User tapped a subscription card to expand details | `app/(tabs)/index.tsx` |
| `subscription_details_viewed` | User navigated to a subscription's detail screen | `app/subscriptions/[id].tsx` |

## Next steps

We've built some insights and a dashboard for you to keep an eye on user behavior, based on the events we just instrumented:

- [Analytics basics (wizard) — Dashboard](https://eu.posthog.com/project/233827/dashboard/853122)
- [Signup funnel (wizard)](https://eu.posthog.com/project/233827/insights/G9idXssi)
- [Sign-ins over time (wizard)](https://eu.posthog.com/project/233827/insights/EPnvwpli)
- [Sign-outs over time (wizard)](https://eu.posthog.com/project/233827/insights/h5ssxSHN)
- [Subscription engagement (wizard)](https://eu.posthog.com/project/233827/insights/MeTzpibl)
- [Auth failure rate (wizard)](https://eu.posthog.com/project/233827/insights/y7AmMXWO)

## Verify before merging

- [ ] Run a full production build (the wizard only verified the files it touched) and fix any lint or type errors introduced by the generated code.
- [ ] Run the test suite — call sites that were rewritten or instrumented may need updated mocks or fixtures.
- [ ] Add `POSTHOG_PROJECT_TOKEN` and `POSTHOG_HOST` to `.env.example` and any monorepo/bootstrap scripts so collaborators know what to set.
- [ ] Confirm the returning-visitor path also calls `identify` — a handler that only identifies on fresh login can leave returning sessions on anonymous distinct IDs. Currently `identify` is called on sign-in and sign-up; verify Clerk's session restore flow in `app/_layout.tsx` also re-identifies the user if needed.

### Agent skill

We've left an agent skill folder in your project. You can use this context for further agent development when using Claude Code. This will help ensure the model provides the most up-to-date approaches for integrating PostHog.
