# 21K Build

Premium Astro site for 21K Build with Cloudflare server output, Razorpay payment endpoints, and gated buyer resources.

## Commands

```sh
npm install
npm run dev
npm run build
```

## Cloudflare Deployment

Use Cloudflare Pages or Workers with the Astro Cloudflare adapter.

- Build command: `npm run build`
- Output directory: `dist`
- Node version: `22.12.0` or newer

Required environment variables:

```txt
RAZORPAY_KEY_ID=your_key_id
RAZORPAY_KEY_SECRET=your_key_secret
```

The Astro config uses:

- `output: "server"`
- `adapter: cloudflare({ imageService: "passthrough" })`

Payment API routes live in `src/pages/api/` and are bundled by the Cloudflare adapter.
