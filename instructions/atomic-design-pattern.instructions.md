---
applyTo: "**/*"
paths:
  - "**/*"
description: "Use when creating, organizing, or refactoring UI components. Enforces Atomic Design methodology: Atoms, Molecules, Organisms, Templates, and Pages. Applies to React, Vue, Angular, Flutter, and any component-based UI framework."
---

# Atomic Design Pattern

All UI components **must** follow the Atomic Design methodology. This applies to any component-based framework (React, Vue, Angular, Flutter, etc.). Organize components into five distinct levels based on their complexity and composition.

## 1 — Atoms

The **smallest, indivisible** UI elements. They cannot be broken down further without losing functionality.

- Single HTML elements or framework primitives with styling
- Must be fully reusable and context-agnostic
- Accept props/inputs for customization — never hardcode content
- Examples: `Button`, `Input`, `Label`, `Icon`, `Avatar`, `Badge`, `Checkbox`

```
// Atom — does one thing, accepts props, no business logic
function Button({ label, variant, onClick, disabled }) {
  return <button className={variant} onClick={onClick} disabled={disabled}>{label}</button>;
}
```

## 2 — Molecules

**Small groups of atoms** that function together as a unit.

- Compose 2+ atoms into a reusable, functional group
- Have a single, clear purpose
- May manage minimal internal state (e.g., input focus) but no business logic
- Examples: `SearchField` (Input + Button), `FormField` (Label + Input + ErrorText), `NavItem` (Icon + Label)

```
// Molecule — composes atoms into a functional group
function SearchField({ onSearch }) {
  const [query, setQuery] = useState('');
  return (
    <div className="search-field">
      <Input value={query} onChange={setQuery} placeholder="Search..." />
      <Button label="Search" onClick={() => onSearch(query)} />
    </div>
  );
}
```

## 3 — Organisms

**Complex UI sections** composed of molecules and/or atoms that form a distinct section of an interface.

- Represent a meaningful section of the UI (header, sidebar, card list)
- Can contain business logic or connect to state management
- Should still be reusable across different templates when possible
- Examples: `Header` (Logo + NavItems + SearchField + UserMenu), `ProductCard` (Image + Title + Price + AddToCartButton), `CommentSection`

```
// Organism — a complete UI section with structure and potential business logic
function Header({ user, onSearch, onLogout }) {
  return (
    <header>
      <Logo />
      <NavBar items={mainNavItems} />
      <SearchField onSearch={onSearch} />
      <UserMenu user={user} onLogout={onLogout} />
    </header>
  );
}
```

## 4 — Templates

**Page-level layout structures** that define the arrangement of organisms without real content.

- Define the layout grid, spacing, and placement of organisms
- Use placeholder or generic props — no real data
- Represent the skeleton/wireframe of a page
- One template can serve multiple pages with different data
- Examples: `DashboardTemplate`, `AuthTemplate`, `ProductListTemplate`

```
// Template — layout structure, no real data
function DashboardTemplate({ sidebar, header, mainContent, footer }) {
  return (
    <div className="dashboard-layout">
      <div className="sidebar">{sidebar}</div>
      <div className="main">
        <div className="header">{header}</div>
        <div className="content">{mainContent}</div>
        <div className="footer">{footer}</div>
      </div>
    </div>
  );
}
```

## 5 — Pages

**Specific instances of templates** populated with real data and connected to application state.

- Inject real data, API connections, and state management into templates
- This is where routing, data fetching, and side effects live
- Each page is a unique view that users interact with
- Examples: `HomePage`, `UserProfilePage`, `ProductDetailPage`

```
// Page — real data + template
function DashboardPage() {
  const user = useCurrentUser();
  const stats = useDashboardStats();
  return (
    <DashboardTemplate
      sidebar={<Sidebar user={user} />}
      header={<Header user={user} onSearch={handleSearch} />}
      mainContent={<StatsGrid stats={stats} />}
      footer={<Footer />}
    />
  );
}
```

## Folder Structure

Organize components to mirror the atomic hierarchy:

```
components/
├── atoms/
│   ├── Button/
│   ├── Input/
│   └── Icon/
├── molecules/
│   ├── SearchField/
│   ├── FormField/
│   └── NavItem/
├── organisms/
│   ├── Header/
│   ├── ProductCard/
│   └── CommentSection/
├── templates/
│   ├── DashboardTemplate/
│   └── AuthTemplate/
└── pages/
    ├── HomePage/
    └── UserProfilePage/
```

Each component folder should contain its implementation file, styles, tests, and any co-located assets.

## Enforcement Rules

1. **Before creating a component**, determine its atomic level — if unsure, answer: "Does it compose other components? Which level are those?"
2. **Atoms must never import other components** from the same design system (only external primitives/utilities)
3. **Molecules must compose atoms**, not duplicate atom logic inline
4. **Organisms must compose molecules and/or atoms**, not flatten everything into a single monolithic component
5. **Templates must accept content via props/slots/children** — never hardcode organisms or fetch data directly
6. **Pages are the only level** that should connect to routing, data fetching, and global state
7. **During code review**, flag level misplacements (e.g., "This molecule imports an organism — that's an inversion of the atomic hierarchy")
8. **When a component grows beyond its level**, refactor — extract smaller pieces downward rather than inflating a single component
