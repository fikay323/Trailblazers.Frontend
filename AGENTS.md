# Project Rules & Development Guidelines

This document outlines the coding standards, architectural rules, and development constraints enforced across this codebase.

---

## 1. TypeScript & File Extension Rule

- **File Extensions**: Every new file must be created with a `.tsx` extension for React components and `.ts` for utilities, services, hooks, and types. Do **NOT** create new files with `.jsx` or `.js` extensions.
- **Strict Typing**: All variables, function parameters, return types, and component props must be strictly and explicitly typed.
- **No `any`**: Strictly avoid the `any` type across all code. Use specific interfaces, type aliases, union types, generics, or `unknown` with proper type narrowing/guards where dynamic types are unavoidable.

---

## 2. SOLID Principles Rule

Every component, hook, module, and service must adhere strictly to SOLID principles:

1. **Single Responsibility Principle (SRP)**:
   - Each component, hook, or function must have one well-defined responsibility.
   - Separate layout, data fetching/state management, and UI presentation into modular sub-components.
2. **Open/Closed Principle (OCP)**:
   - Components and services should be open for extension (via composition, render props, or polymorphic props) but closed for modification.
3. **Liskov Substitution Principle (LSP)**:
   - Variants, wrappers, and sub-components must be substitutable for their base components without altering correctness.
4. **Interface Segregation Principle (ISP)**:
   - Define small, targeted interfaces and prop types. Never force a component or consumer to depend on props or methods it does not use.
5. **Dependency Inversion Principle (DIP)**:
   - High-level modules must depend on abstractions (interfaces, callback props, injected services) rather than low-level concrete implementations.

---

## 3. Design System & Component Conformity Rule

- **Reuse Existing Components**: Always reuse existing UI components and design primitives to ensure visual, architectural, and behavioral conformity:
  - Base UI components in `@/components/ui/` (`DropdownMenu`, `Avatar`, `Button`, `Dialog`, `Select`, etc.).
  - Shared design elements in `@/components/ui-bits` (`Card`, `StatCard`, `Pill`, etc.).
  - Shared pagination in `@/components/TablePagination`.
  - Shared modal primitives in `@/pages/compensation/_bits` (`Modal`, `ModalActions`, `Labeled`, `inputCls`).
  - Shared utilities in `@/lib/` (`api`, `confirm`, `utils`).
- **Do Not Re-invent Primitives**: Never create duplicate custom dropdowns, modal shells, or table paginators when an established component already exists in the project.

---

## 4. Loading States & Visual Feedback Rule

- **Always Provide Visual Loaders**: Every asynchronous action, data fetch, query transition, form submission, and route navigation must strictly display appropriate visual feedback.
- **Spinners vs. Skeletons**:
  - **Skeletons/Shimmers**: Use skeleton placeholders (e.g. `@/components/ui/skeleton` or custom shimmer pulse blocks) for initial page loads, data tables, cards, and content blocks to preserve layout structure and prevent layout shifts (CLS).
  - **Spinners/Loaders**: Use spinners (e.g. `Loader2` from `lucide-react` with `animate-spin`) inside buttons, input adornments, quick action controls, and modal submission states.
- **Never Leave the UI Static**: The user must never be left wondering if an action or page fetch is in progress; always reflect loading, error, and success states unambiguously.
