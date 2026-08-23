# Restaurant Convention – Golden Cloche

Static Cloudflare Pages site for the Charity Loves AI restaurant convention experience.

## Cloudflare Pages deployment

- Production branch: `main`
- Root directory: `restaurant-golden-cloche`
- Framework preset: None
- Build command: `exit 0`
- Build output directory: `.`

## Required secret

In Cloudflare Pages open **Settings → Variables and Secrets** and add an encrypted secret:

- Name: `GHL_WEBHOOK_URL`
- Value: the existing HighLevel **Golden Cloche Website Submission** inbound webhook URL

Do not commit the webhook URL to GitHub.

## Recommended custom domain

Use `restaurant.charitylovesai.com` for this Pages project. This keeps `go.charitylovesai.com` available for HighLevel funnels and avoids one hostname being claimed by two hosting platforms.

## Payment link

The Restaurant Guest Revival™ CTA is configured for:

`https://buy.stripe.com/4gM7sL9PP7v2g7AfLa1ZS08`

## Pre-launch test

1. Confirm all three cloches expand on desktop and mobile.
2. Submit a test lead.
3. Confirm HighLevel receives the payload.
4. Confirm the Stripe CTA opens the $297/month checkout.
5. Confirm HTTPS on the custom domain.
