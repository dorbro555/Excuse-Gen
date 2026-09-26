# Excuse Generator MVP - Source of Truth

## Tech Stack
*   **Frontend:** Astro + Tailwind CSS.
*   **Backend:** Netlify Functions (Astro API routes).
*   **Storage:** Netlify Blobs (for saving and retrieving shareable excuses).
*   **AI:** Google Gen AI SDK (Gemini 2.5 Flash with structured JSON output; resilient local fallback).

## Aesthetic & UI Guidelines: "The Literary Broadside"
*   **Vibe:** Performative, editorial, high-end print magazine, literary quote card.
*   **Colors:** 
    *   Background: Warm paper/cream (`#FDFBF7` or similar).
    *   Text: Deep ink/espresso (`#1A1815`).
    *   Accents: Muted terracotta or antique bronze (avoid standard web blues/greens).
*   **Typography:**
    *   Primary (The Excuse): Elegant serif (e.g., Bodoni Moda). Large, high contrast, highly readable.
    *   Secondary (UI/Metadata): Clean, small geometric sans-serif (e.g., Inter, uppercase tracking).
*   **Layout:** Minimalist. Heavy use of negative space. No drop shadows; use thin hairline borders (1px) if separation is needed.

## Excuse Parameters
*   The parameters will be passed to the AI api to craft the response. The target and scenario are textboxes, while the tone dropdown is a select input. 
*   **Target**: Who is the excuse for? (Boss, Partner, Friends, Mother-in-Law)
*   **Scenario**: What are you trying to get out of? (Running late, Missing a meeting, Skipping a party, Forgot an anniversary)
*   **Tone**: What is the tone of the excuse? (Plausible & Professional, Overly Dramatic, Techno-Babble, Absolute Absurdity)


## Core Flows
1.  **Generation:** User selects parameters -> hits API -> API generates (or mocks) response -> API creates a unique `nanoid` -> API saves `{id, excuse, metadata}` to Netlify Blobs -> returns ID to frontend.
2.  **Display:** Frontend transitions to display the excuse in large serif text, providing the user with the shareable URL (`/e/[nanoid]`).
3.  **Viewing (Share Link):** When a user visits `/e/[nanoid]`, the Astro server fetches the record from Netlify Blobs, renders the excuse page aesthetically, and includes a prominent "Generate Your Own" CTA button at the bottom linking back to the home page.

## To-Do
- [x] Create the astro site as specified in the guidelines (mobile-responsive).
- [x] Setup git versioning for GitHub and Netlify deployment.
- [x] Implement a local mock data and API routes in Astro to simulate the behavior.
- [x] Implement Netlify functions and Blobs to replace the mock data and API routes.