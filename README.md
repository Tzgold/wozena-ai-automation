# Wozena - AI Automation 


## Highlights
- Live voice demo UI backed by the [`LiveVoiceAgent`](components/LiveVoiceAgent.tsx) component.
- Local mocked backend for bookings & contact forms via [`mockBackendService`](services/mockBackend.ts).
- Utility helpers for audio encoding/decoding in [`services/liveApiUtils.ts`](services/liveApiUtils.ts).
- Reusable UI button component: [`Button`](components/Button.tsx).
- Single-entry app at [`App`](App.tsx).

## Repo / Important Files
- Main app: [`App.tsx`](App.tsx) — app shell, sections & demo hooks.
- Live voice component: [`components/LiveVoiceAgent.tsx`](components/LiveVoiceAgent.tsx)
- Button component: [`components/Button.tsx`](components/Button.tsx)
- Mock backend: [`services/mockBackend.ts`](services/mockBackend.ts)
- Live audio helpers: [`services/liveApiUtils.ts`](services/liveApiUtils.ts)
- Vite config: [`vite.config.ts`](vite.config.ts)
- App bootstrap: [`index.tsx`](index.tsx)
- Metadata requesting mic permission: [`metadata.json`](metadata.json)
- TS config: [`tsconfig.json`](tsconfig.json)
- Package manifest: [`package.json`](package.json)


