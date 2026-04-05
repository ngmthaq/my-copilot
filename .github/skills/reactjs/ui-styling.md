---
name: reactjs-ui-styling
description: "React.js UI styling — Material-UI (MUI): theme setup, MUI components, sx prop, styled(), Emotion, MUI X (DataGrid, DatePicker), AG Grid, and dark mode. Use when: styling components; customizing the theme; using MUI components or AG Grid."
---

# React.js UI & Styling Skill

## Overview

This project uses **Material-UI (MUI)** as the primary component library and design system, styled with **Emotion** (CSS-in-JS). AG Grid is used for high-performance data tables.

Packages: `@mui/material @emotion/react @emotion/styled @mui/x-data-grid @mui/x-date-pickers`

---

## 1. Theme Setup

Create a custom theme and wrap the app with `ThemeProvider`.

```typescript
// src/providers/ThemeProvider.tsx
import { createTheme, ThemeProvider as MuiThemeProvider, CssBaseline } from "@mui/material";
import { useState, createContext, useContext, ReactNode } from "react";

const theme = createTheme({
  palette: {
    primary: { main: "#1976d2" },
    secondary: { main: "#9c27b0" },
  },
  typography: {
    fontFamily: "\'Inter\', sans-serif",
  },
  components: {
    // Global component overrides
    MuiButton: {
      defaultProps: { disableElevation: true },
      styleOverrides: {
        root: { textTransform: "none" }, // disable uppercase
      },
    },
  },
});

export function ThemeProvider({ children }: { children: ReactNode }) {
  return (
    <MuiThemeProvider theme={theme}>
      <CssBaseline /> {/* normalize CSS globally */}
      {children}
    </MuiThemeProvider>
  );
}
```

---

## 2. Dark Mode

```typescript
// src/providers/ThemeProvider.tsx
import { createTheme, ThemeProvider as MuiThemeProvider, CssBaseline } from "@mui/material";
import { useState, useMemo, createContext, useContext, ReactNode } from "react";

interface ColorModeCtx { toggle: () => void; mode: "light" | "dark"; }
const ColorModeContext = createContext<ColorModeCtx>({ toggle: () => {}, mode: "light" });

export function useColorMode() { return useContext(ColorModeContext); }

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [mode, setMode] = useState<"light" | "dark">("light");

  const toggle = () => setMode((m) => (m === "light" ? "dark" : "light"));

  const theme = useMemo(
    () => createTheme({ palette: { mode } }),
    [mode]
  );

  return (
    <ColorModeContext.Provider value={{ toggle, mode }}>
      <MuiThemeProvider theme={theme}>
        <CssBaseline />
        {children}
      </MuiThemeProvider>
    </ColorModeContext.Provider>
  );
}

// Usage in any component
const { toggle, mode } = useColorMode();
<IconButton onClick={toggle}>
  {mode === "dark" ? <LightModeIcon /> : <DarkModeIcon />}
</IconButton>
```

---

## 3. Common MUI Components

```typescript
import {
  Box, Stack, Grid2 as Grid, Typography,
  Button, IconButton,
  TextField, Select, MenuItem, FormControl, InputLabel,
  Card, CardContent, CardActions,
  Dialog, DialogTitle, DialogContent, DialogActions,
  CircularProgress, Skeleton,
  Alert, Snackbar,
  Chip, Badge, Avatar,
} from "@mui/material";

// Layout
<Box sx={{ p: 2, display: "flex", gap: 1 }}>
  <Stack direction="row" spacing={2} alignItems="center">
    <Typography variant="h6">Title</Typography>
    <Button variant="contained" color="primary">Save</Button>
    <Button variant="outlined" color="secondary">Cancel</Button>
  </Stack>
</Box>

// Grid responsive layout
<Grid container spacing={2}>
  <Grid size={{ xs: 12, md: 6 }}>
    <Card><CardContent>Left</CardContent></Card>
  </Grid>
  <Grid size={{ xs: 12, md: 6 }}>
    <Card><CardContent>Right</CardContent></Card>
  </Grid>
</Grid>
```

---

## 4. sx Prop — Quick Style Overrides

The `sx` prop accepts theme-aware values and responsive breakpoints.

```typescript
// ✅ Use sx for one-off overrides — avoid wrapping in styled() for simple cases
<Box
  sx={{
    p: 2,                          // theme.spacing(2)
    mt: { xs: 1, md: 3 },          // responsive margin-top
    bgcolor: "background.paper",   // theme color token
    borderRadius: 2,               // theme.shape.borderRadius * 2
    boxShadow: 3,                  // theme shadow level
    display: "flex",
    alignItems: "center",
    gap: 1,
  }}
>
  Content
</Box>

// Conditional sx values
<Button
  sx={[
    { px: 3 },
    isActive && { bgcolor: "primary.dark" },
  ]}
>
  Click
</Button>
```

---

## 5. styled() — Reusable Styled Components

Use `styled()` from `@mui/material/styles` to create named, reusable styled components.

```typescript
import { styled } from "@mui/material/styles";
import { Card, Box } from "@mui/material";

// ✅ styled() with props
interface StatusBadgeProps { status: "active" | "inactive" | "pending"; }

const StatusBadge = styled(Box)<StatusBadgeProps>(({ theme, status }) => ({
  display: "inline-flex",
  alignItems: "center",
  padding: theme.spacing(0.25, 1),
  borderRadius: 12,
  fontSize: "0.75rem",
  fontWeight: 600,
  color: "white",
  backgroundColor:
    status === "active"   ? theme.palette.success.main :
    status === "inactive" ? theme.palette.error.main :
                            theme.palette.warning.main,
}));

// Usage
<StatusBadge status="active">Active</StatusBadge>
<StatusBadge status="pending">Pending</StatusBadge>

// ✅ Styled MUI Card with extra padding variant
const ContentCard = styled(Card)(({ theme }) => ({
  padding: theme.spacing(3),
  borderRadius: theme.shape.borderRadius * 2,
  boxShadow: theme.shadows[2],
}));
```

---

## 6. MUI X — DataGrid

```typescript
import { DataGrid, type GridColDef } from "@mui/x-data-grid";
import type { User } from "@/types/user";

const columns: GridColDef<User>[] = [
  { field: "id",    headerName: "ID",    width: 80 },
  { field: "name",  headerName: "Name",  flex: 1 },
  { field: "email", headerName: "Email", flex: 1 },
  { field: "role",  headerName: "Role",  width: 120,
    renderCell: ({ value }) => <Chip label={value} size="small" />,
  },
  {
    field: "actions",
    headerName: "",
    width: 80,
    sortable: false,
    renderCell: ({ row }) => (
      <IconButton size="small" onClick={() => handleEdit(row)}>
        <EditIcon fontSize="small" />
      </IconButton>
    ),
  },
];

export function UserTable({ rows }: { rows: User[] }) {
  return (
    <DataGrid
      rows={rows}
      columns={columns}
      pageSizeOptions={[10, 25, 50]}
      initialState={{ pagination: { paginationModel: { pageSize: 10 } } }}
      disableRowSelectionOnClick
      autoHeight
    />
  );
}
```

---

## 7. MUI X — DatePicker

```typescript
import { DatePicker } from "@mui/x-date-pickers";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import dayjs, { type Dayjs } from "dayjs";

// Wrap your app (or just the form section) with LocalizationProvider
<LocalizationProvider dateAdapter={AdapterDayjs}>
  <DatePicker
    label="Birth Date"
    value={date}
    onChange={(newDate: Dayjs | null) => setDate(newDate)}
    format="DD/MM/YYYY"
    slotProps={{
      textField: { fullWidth: true, size: "small" },
    }}
  />
</LocalizationProvider>
```

---

## 8. AG Grid — High-Performance Grid

Use AG Grid for very large datasets (10,000+ rows) where MUI DataGrid performance is insufficient.

Install: `npm install ag-grid-react ag-grid-community`

```typescript
import { AgGridReact } from "ag-grid-react";
import { type ColDef } from "ag-grid-community";
import "ag-grid-community/styles/ag-grid.css";
import "ag-grid-community/styles/ag-theme-material.css";
import type { User } from "@/types/user";

const colDefs: ColDef<User>[] = [
  { field: "name",  headerName: "Name",  flex: 1, sortable: true, filter: true },
  { field: "email", headerName: "Email", flex: 1 },
  { field: "role",  headerName: "Role",  width: 120 },
];

export function UserGrid({ rows }: { rows: User[] }) {
  return (
    <div className="ag-theme-material" style={{ height: 500 }}>
      <AgGridReact<User>
        rowData={rows}
        columnDefs={colDefs}
        pagination
        paginationPageSize={25}
        rowSelection="multiple"
      />
    </div>
  );
}
```

---

## 9. Styling Priority Guide

| Situation                                  | Approach                            |
| ------------------------------------------ | ----------------------------------- |
| One-off layout / spacing tweak             | `sx` prop                           |
| Reusable styled component with logic       | `styled()`                          |
| Wrapping a non-MUI HTML element            | `styled("div")()`                   |
| Override a specific MUI component globally | `theme.components` in `createTheme` |
| Large dataset table (10k+ rows)            | AG Grid                             |
| Standard data table                        | MUI DataGrid                        |

---

## 1. Tailwind CSS Basics

Install: `npm install tailwindcss @tailwindcss/vite` (Tailwind v4 with Vite plugin)

```tsx
// Simple styled button using Tailwind utilities
export function Button({ children, variant = "primary" }) {
  return (
    <button
      className="px-4 py-2 rounded-md font-semibold text-sm transition-colors
                 bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50"
    >
      {children}
    </button>
  );
}
```

---

## 2. cn() Utility — Conditional Classes

Install: `npm install clsx tailwind-merge`

```typescript
// src/utils/cn.ts
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
```

```tsx
// Use cn() to apply classes conditionally
import { cn } from "@/utils/cn";

interface BadgeProps {
  variant: "success" | "warning" | "danger";
  children: React.ReactNode;
}

export function Badge({ variant, children }: BadgeProps) {
  return (
    <span
      className={cn(
        "px-2 py-1 rounded-full text-xs font-medium",
        variant === "success" && "bg-green-100 text-green-800",
        variant === "warning" && "bg-yellow-100 text-yellow-800",
        variant === "danger" && "bg-red-100 text-red-800",
      )}
    >
      {children}
    </span>
  );
}
```

---

## 3. CSS Modules

Co-locate a `.module.css` file next to your component for scoped styles.

```css
/* src/components/Card/card.module.css */
.card {
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  padding: 1.5rem;
  background: white;
}

.card__title {
  font-size: 1.25rem;
  font-weight: 600;
  margin-bottom: 0.5rem;
}

.card--highlighted {
  border: 2px solid #3b82f6;
}
```

```tsx
// src/components/Card/Card.tsx
import styles from "./card.module.css";
import { cn } from "@/utils/cn";

interface CardProps {
  title: string;
  highlighted?: boolean;
  children: React.ReactNode;
}

export function Card({ title, highlighted = false, children }: CardProps) {
  return (
    <div className={cn(styles.card, highlighted && styles["card--highlighted"])}>
      <h2 className={styles.card__title}>{title}</h2>
      {children}
    </div>
  );
}
```

---

## 4. Responsive Design with Tailwind

Tailwind uses **mobile-first** breakpoints. Apply base styles for mobile, then override for larger screens.

```tsx
<div
  className="
  grid
  grid-cols-1        /* mobile: 1 column */
  sm:grid-cols-2     /* 640px+: 2 columns */
  lg:grid-cols-3     /* 1024px+: 3 columns */
  gap-4
"
>
  {items.map((item) => (
    <ItemCard key={item.id} {...item} />
  ))}
</div>
```

| Prefix | Min-width    |
| ------ | ------------ |
| (none) | 0px (mobile) |
| `sm:`  | 640px        |
| `md:`  | 768px        |
| `lg:`  | 1024px       |
| `xl:`  | 1280px       |

---

## 5. Dark Mode

**Tailwind approach** — add `dark:` variants and toggle the `dark` class on `<html>`:

```typescript
// src/hooks/useDarkMode.ts
export function useDarkMode() {
  const [isDark, setIsDark] = useState(() => localStorage.getItem("theme") === "dark");

  useEffect(() => {
    document.documentElement.classList.toggle("dark", isDark);
    localStorage.setItem("theme", isDark ? "dark" : "light");
  }, [isDark]);

  const toggle = () => setIsDark((v) => !v);
  return { isDark, toggle };
}
```

```tsx
// Apply dark mode variants in components
<div className="bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100">Content</div>
```

```css
/* tailwind.config (v3) or CSS layer (v4) */
/* Enable class-based dark mode */
/* tailwind.config.js: darkMode: 'class' */
```
