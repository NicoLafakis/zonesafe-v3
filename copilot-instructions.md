I'm creating a `copilot-instructions.md` file to help any AI assistant understand this project's structure and goals.

Primary reference: APP_OUTLINE.md (at the repository root). Treat it as the single source of truth for the architecture, routes, data shapes, and conventions. Always read and update APP_OUTLINE.md when making structural changes.

Guidelines for assistants:
- Read APP_OUTLINE.md before making changes.
- Keep code modular, typed, and consistent with existing patterns.
- Update APP_OUTLINE.md and TODO.md when you change routes, contexts, or flows.
- Prefer small, well-named components and context-driven state.
- Avoid introducing new dependencies unless necessary.
