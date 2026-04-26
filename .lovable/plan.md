## Goal

1. Move the **"Follow our build journey"** (Social) section higher up — to position #2, right after the Hero.
2. Add a new product line to the site: **Pavers, Boundary Walls, Chairs (precast), and Poles** — items the business manufactures/sells.

## Changes

### 1. Reorder homepage sections (`src/pages/Index.tsx`)

New section order:
```text
1. PortfolioHero
2. SocialSection         ← moved up to #2
3. ServicesSection
4. ProductsSection       ← new (pavers, walls, chairs, poles)
5. ProjectsSection
6. AboutSection
7. ContactSection
8. PortfolioFooter
```

### 2. Add a new "Products We Manufacture" section

Create `src/components/site/ProductsSection.tsx` listing 4 products in a grid, each with an icon, title, and one-line description:

- **Paver Blocks** — Interlocking pavers for driveways, walkways, parking lots.
- **Boundary Walls** — Precast and cast-in-situ compound walls for plots, factories, farms.
- **RCC Chairs** — Precast concrete chairs/spacers for reinforcement work.
- **Cement Poles** — Fencing and electric poles in standard heights.

Styling will match existing `surface-card` pattern used in `ServicesSection` so it feels native.

### 3. Optional small nav addition

Add a "Products" link in `PortfolioHeader` so users can jump to the new section. (Skip if header is already crowded.)

## Technical notes

- No backend or schema changes.
- Pure presentational reorder + one new component file.
- Icons from `lucide-react` (e.g. `Grid3x3`, `Fence`, `Armchair`, `Lightbulb` — final pick during build).
- Content is in English with industry-standard product names; let me know if you want Hindi labels alongside.

## Open question

Should the Social section remain its current full size at position #2, or should I make it a bit more compact since it'll be one of the first things visitors see? I'll keep it full-size by default unless you say otherwise.
