# Design System Document: Teen Mode for Geumgojigi

## 1. Overview & Creative North Star: "The Neon Playground"

This design system is engineered to transform personal finance from a chore into a high-energy, digital lifestyle experience. Moving beyond the "bank app" trope, our Creative North Star is **The Neon Playground**. 

We reject the rigid, spreadsheet-like layouts of traditional finance. Instead, we embrace **Organic Gamification**. This means using intentional asymmetry, "bouncy" geometry, and depth created through tonal layering rather than sterile lines. The interface should feel like a premium handheld console—tactile, responsive, and vibrating with latent energy. By leveraging high-contrast neon accents against a sophisticated "off-white" architectural base, we create a space that feels safe enough for a "Vault" but trendy enough for a Gen-Z digital native.

---

## 2. Colors & Surface Architecture

Our palette balances a clean, breathable foundation with "high-voltage" interactive zones. 

### The Palette (Material Design Mapping)
*   **Primary (Vivid Blue):** `#0057bd` | The "Action" color. Use for high-intent CTAs.
*   **Secondary (Coral Pink):** `#a53046` | The "Social/Reward" color. Use for gamified milestones and spending alerts.
*   **Tertiary (Electric Yellow):** `#6a5b00` | The "Insight" color. Use for AI-driven tips and highlights.
*   **Background:** `#f5f7f9` | A cool, soft grey-white that reduces eye strain compared to pure `#ffffff`.

### The "No-Line" Rule
**Strict Mandate:** 1px solid borders are prohibited for sectioning or containment. 
Structure must be defined through **Background Color Shifts**. To separate a "Savings Goal" from the "Transaction List," place the goal card (`surface_container_lowest`) on a section background of `surface_container_low`. The eye should perceive boundaries through light and value, not lines.

### Surface Hierarchy & Nesting
Treat the UI as a physical stack of "Acrylic Slabs."
1.  **Level 0 (Base):** `surface` (#f5f7f9) - The canvas.
2.  **Level 1 (Sections):** `surface_container_low` (#eef1f3) - Large structural groupings.
3.  **Level 2 (Cards):** `surface_container_lowest` (#ffffff) - High-priority interactive modules.
4.  **Level 3 (Pop-overs):** `surface_bright` - Floating elements that require maximum "lift."

### The "Glass & Gradient" Rule
To elevate the "Teen" aesthetic, use **Glassmorphism** for bottom navigation bars and floating action buttons. Apply a 20px `backdrop-blur` to `surface` tokens at 80% opacity. For primary CTAs, use a signature gradient from `primary` (#0057bd) to `primary_container` (#6e9fff) at a 135° angle to add "soul" and dimension.

---

## 3. Typography: The Editorial Voice

We utilize **Plus Jakarta Sans** for its geometric clarity and friendly, open apertures. 

*   **Display (Lg/Md/Sm):** Our "Hook." Used for big balance numbers and achievement titles. Use `display-md` (2.75rem) for the main vault balance to give it an authoritative, "hero" feel.
*   **Headline (Lg/Md):** Used for section headers. These should feel punchy and immediate.
*   **Title (Md/Sm):** Used for card headings. Pair `title-md` with `on_surface` for high readability.
*   **Body (Lg/Md):** Used for descriptions and AI insights. `body-md` (0.875rem) is our workhorse for financial data.
*   **Label (Md/Sm):** Used for micro-copy and tags. Always in Semi-Bold to ensure they don't get lost.

**Hierarchy Strategy:** Create "Typographic Tension." Pair a large `display-sm` balance with a tiny, uppercase `label-md` "AVAILABLE FUNDS" tag. This high-contrast scaling mimics modern editorial fashion magazines.

---

## 4. Elevation & Depth: Tonal Layering

We convey importance through **Tonal Lift** rather than heavy shadows.

*   **The Layering Principle:** A card should never just sit on a background; it should "emerge." Place a `#ffffff` card on a `#f5f7f9` background. This creates a soft, natural "halo" effect.
*   **Ambient Shadows:** For floating elements (like the "Add Expense" button), use a 32px blur, 12px Y-offset shadow using `on_surface` at 6% opacity. It should look like a soft cloud, not a dark smudge.
*   **The "Ghost Border" Fallback:** If a container is placed on a background of the same color, use a "Ghost Border": `outline_variant` (#abadaf) at **15% opacity**. It provides a "hint" of a container without breaking the fluid aesthetic.

---

## 5. Signature Components

### Cards & Lists (The Core Vault)
*   **Rule:** No dividers. Use **Spacing 4** (1.4rem) between list items to provide breathing room.
*   **Style:** `rounded-3xl` (2rem) for all main containers. 
*   **Layout:** Use asymmetrical padding (e.g., more padding at the top than the bottom) to give cards a "weighted" feel.

### Buttons (The Interaction Points)
*   **Primary:** Gradient-filled (`primary` to `primary_container`), `rounded-full` (9999px), with a subtle `on_primary` drop shadow.
*   **Secondary:** `surface_container_high` background with `on_primary_container` text. No border.
*   **Tertiary/Ghost:** Text-only with a subtle background hover state using `primary_fixed_dim` at 10% opacity.

### Gamified Progress Bars
*   Instead of a thin line, use a **Thick Pill** (Height: 12px).
*   **Track:** `surface_container_highest`. 
*   **Indicator:** Gradient of `secondary` to `secondary_fixed`.

### Neon Chips
*   Used for categorizing spending (e.g., "Food," "Gaming").
*   Use high-saturation backgrounds (`tertiary_container`) with high-contrast text (`on_tertiary_container`).

---

## 6. Do's and Don'ts

### Do
*   **Do** use `rounded-3xl` for almost everything. It reinforces the "Friendly/Soft" vibe.
*   **Do** use haptic feedback triggers for every "Neon Pop" color interaction.
*   **Do** use asymmetrical card layouts to highlight the most important "AI Insight."
*   **Do** embrace white space. If it feels "empty," add more space, not more lines.

### Don't
*   **Don't** use 100% black (#000000) for text. Use `on_surface` (#2c2f31) to maintain the premium, soft feel.
*   **Don't** use standard "Success Green." Use our `primary` blue or `secondary` coral for positive reinforcement to keep the palette tight.
*   **Don't** use sharp corners (radius < 1rem). It breaks the "Playground" metaphor.
*   **Don't** use "Drop Shadows" on text. It cheapens the high-end editorial look. Use font-weight and color for emphasis instead.