---
name: saas-redesign
description: Redesign a Vue 3 application's UI into a modern SaaS-style interface - collapsible left sidebar with grouped navigation, slim top header, consistent spacing scale and design tokens. Use when asked to modernize, restyle, or convert a top-nav Vue app into a sidebar layout.
---

# SaaS Redesign for Vue 3 Apps

Turn a Vue 3 + vue-router app with a top navigation bar into a polished SaaS-style layout:

```text
+-----------+--------------------------------------------+
|  Brand    |  Page title            [filters] [lang] [@] |  <- AppHeader (sticky, 56px)
|-----------|--------------------------------------------|
|  SECTION  |                                            |
|  > Item   |   Page header (title, description, actions) |
|    Item   |                                            |
|  SECTION  |   Cards / tables / charts                  |
|    Item   |                                            |
|           |                                            |
|  [<<]     |                                            |
|  Profile  |                                            |
+-----------+--------------------------------------------+
   AppSidebar (248px, collapses to a 64px icon rail)
```

This is a **visual redesign only**. Do not change business logic, data fetching, API calls, route paths, or state management.

Reference files (read them when you reach the step that uses them):

- `references/design-tokens.css`: the `:root` token block and base component classes
- `references/sidebar-layout.md`: templates for `useSidebar`, `AppSidebar`, `AppHeader`, the root shell, and the icon set

## Workflow

### 1. Discover (read-only)

Before you edit anything, find and note:

- **Router**: the file calling `createRouter` (often `src/main.js` or `src/router/index.js`), plus every route path, component and `meta`.
- **App shell**: the component that renders `<router-view>` (usually `App.vue`), and the current nav markup (`router-link`s, nav class names).
- **Header widgets**: anything that lives in the current top bar, such as global filter bars, language switchers, profile/user menus, notification or task buttons, and modals they open.
- **Styles**: global stylesheet location (unscoped `<style>` in `App.vue`, `src/assets/*.css`, `main.css`), existing CSS variables, font stack, brand colors.
- **i18n**: whether labels use `t('...')` / `$t('...')`, and where locale files live.
- **Project rules**: `CLAUDE.md` files at the root and in the client directory. Look for subagent requirements for `.vue` edits, design-system rules (for example, "no emojis"), and component-style conventions (`<script setup>` vs `setup()`).

Write a short inventory of these findings before continuing.

### 2. Plan the navigation structure

- Group the routes into **2 to 4 labeled sections** (for example *Overview*, *Operations*, *Finance*, *Insights*). Keep groups small: 2 to 5 items each.
- Pick an icon for every item from the set in `references/sidebar-layout.md`. Use inline SVG only, never emoji or icon fonts.
- Keep existing route paths and existing i18n label keys. Add new i18n keys **only** for section labels and new UI strings (such as "Collapse sidebar"), and add them to **every** locale file.
- Decide where each old header widget goes:
  - Global filters, language switcher, and action buttons go in the AppHeader right slot.
  - Profile/user menu goes in the sidebar footer (or the header right slot if the menu opens downward and would break in the sidebar).

### 3. Install design tokens

- Merge the `:root` block from `references/design-tokens.css` into the global stylesheet.
- If the app already has brand colors, **map them onto the token names** (`--accent`, the gray scale) instead of introducing a new palette.
- Add the base classes (`.card`, `.page-header`, `.btn`, `.badge`, table base) only if the app lacks equivalents. If it has them, restyle the existing classes with tokens so templates don't need renaming.

### 4. Build the shell

Follow `references/sidebar-layout.md`:

- Create `src/composables/useSidebar.js` (collapsed state, persisted to `localStorage`).
- Create `src/components/layout/AppSidebar.vue` and `src/components/layout/AppHeader.vue`.
- Rewrite the root component's template to the grid shell: sidebar on the left, header and scrollable main on the right.
- Move the header widgets from step 2 into their new slots. Keep their props, events and modals exactly as they were wired before.
- Delete the old top-nav markup **and** its now-unused CSS.

### 5. Normalize the views

For every routed view and shared component:

- Replace hardcoded spacing, colors, radii, shadows and font sizes with tokens.
- Use one consistent page header: title + description on the left, an optional actions area on the right.
- Make cards, tables, badges, buttons and form controls use the shared classes.
- Use CSS Grid for page layouts and keep a consistent gap of `var(--space-6)`.
- Leave scripts alone except for trivial class-name changes.

### 6. Respect project rules

- If a project `CLAUDE.md` requires a specific subagent for `.vue` files (for example `vue-expert`), **hand steps 4 and 5 to it**. In the brief, include the step-2 nav plan, the token block, and the relevant templates from `references/sidebar-layout.md`, because the subagent can't see this skill.
- Follow the project's component style (`<script setup>` vs `setup()`) even if the templates use the other style.
- Follow design-system rules, such as no emojis or fixed status colors.
- Comment any non-obvious layout logic (for example, the auto-collapse breakpoint).

### 7. Verify

1. `npm run build` in the client directory has to succeed with no new warnings.
2. Run the dev server. If Playwright MCP tools are available:
   - Visit every route at 1440px width, then take a screenshot with the sidebar expanded and another with it collapsed.
   - Check at 1280px and 1024px that nothing overflows horizontally (`document.documentElement.scrollWidth <= innerWidth`).
   - Reload while collapsed and confirm the collapsed state persists.
   - Tab through the sidebar and confirm visible focus rings, and that collapsed items expose `aria-label`/`title`.
   - Confirm that the active route is highlighted, header widgets still work (open the filter, language and profile menus), and the console shows no errors.
3. Report a short before/after summary with screenshot paths and any follow-ups.

## Quality checklist

- [ ] Spacing uses only the 4px token scale (`--space-*`). No stray `13px` or `22px` values.
- [ ] A single accent color drives active nav, primary buttons, links and focus rings.
- [ ] Radii are consistent: `--radius-md` (8px) for controls, `--radius-lg` (12px) for cards.
- [ ] Shadows are subtle and only used on raised surfaces (cards, menus, modals).
- [ ] Body text contrast is at least 4.5:1, and muted text never goes lighter than `--gray-500` on white.
- [ ] Each element type uses at most 2 font weights. Headings are 600, body text is 400/500.
- [ ] Collapsing animates `grid-template-columns` and doesn't jump or shift content.
- [ ] Below 1024px the sidebar auto-collapses to the icon rail.
- [ ] Every `v-for` has a stable, unique key (not the index).
- [ ] Old top-nav CSS is removed, and no dead selectors are left.
- [ ] No business logic, API or route changes appear in the diff.
