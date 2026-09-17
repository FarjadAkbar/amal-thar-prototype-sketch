# Goth Sattar · Prototype Sketch Lab

A scrappy map tool for the **Amal** build activity: turn a village idea into something real enough that other people can react to it — not a finished product.

> You've defined the problem. Stepped into people's lives. Generated ideas. Picked one worth pursuing.  
> Now make the simplest version someone can actually respond to: a **sketch**, a mock-up, a rough model.

This repo helps students **place their idea on Goth Sattar (Tharparkar)**, annotate why it sits there, and **convert the layout into a sketch**.

---

## What this is (and is not)

| This is | This is not |
| --- | --- |
| A fast prototype surface | A finished product |
| A map of Goth Sattar to test placement | A full water-network simulator game |
| Notes + comments → sketch | Weeks / levels / scoring |
| Something peers can react to today | Something that needs months of polish |

Budget is capped (about **Rs 10 lakh**) so ideas stay grounded. Hydrology is constrained the Thar way: **aquifer → well → pump/still → tank** — not a household tap network from the coal plant.

---

## Quick start

```bash
npm install
cp .env.example .env
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

### Optional API keys (sketch image)

Copy `.env.example` → `.env`. For **Convert into sketch** with GPT Image:

```env
OPENAI_BASE_URI=https://api.openai.com/v1/
OPENAI_IMAGE_MODEL=gpt-image-1-mini
OPENAI_API_KEY=your_key_here
```

Without a key, the app still works and falls back to a local SVG sketch.

---

## How students use it

1. **Drag** a tool (well, tank, solar, road, …) onto the map.
2. **Drag again** to move it after placing.
3. **Note** — stick observations on the map (like Figma comments).
4. Click a building → add a short **comment** (it can appear on the sketch).
5. Open **Sketch** → **Convert into sketch** — the scrappy artefact peers can react to.

Undo / Reset when you want a clean slate.

---

## Project layout

```
app/                  Next.js app router + API routes
components/simulator/ Map, palette, sticky notes, sketch panel
lib/sim/              Village data, placement rules, light impact model
lib/sketch/           Sketch spec + fallback drawing
public/files/         Background notes on Thar (for context)
public/thar/          Map imagery
```

---

## Scripts

| Command | What it does |
| --- | --- |
| `npm run dev` | Local development |
| `npm run build` | Production build |
| `npm run start` | Serve the production build |
| `npm run lint` | ESLint |

---

## Why this exists

Amal’s build step asks for the **scrappiest, simplest version** of an idea that a real person can react to — before weeks or money go the wrong way.

This tool is that: a shared Thar map so students can **prototype placement, trade-offs, and story**, then leave with a **sketch**, not a polished system.

---

## Licence / use

Built for Amal cohort learning and peer feedback. Fork it, remix the map, or strip pieces for your own village prototype.
