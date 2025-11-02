# Contributing Guide

## Getting Started

1. **Fork the repository** on GitHub
2. **Clone your fork** locally:
   ```sh
   git clone https://github.com/your-username/ISL-Clickup2.git
   cd ISL-Clickup2
   ```
3. **Create a branch** for your changes:
   ```sh
   git checkout -b feature/your-feature-name
   ```
4. **Make your changes** following the guidelines below
5. **Test your changes** thoroughly
6. **Commit and push** your changes
7. **Open a Pull Request** on GitHub

## Code Style

### TypeScript

- Use TypeScript for all new components and files
- Define explicit interfaces for props and data structures
- Avoid `any` types when possible; use proper type definitions
- Use meaningful variable and function names

### React Components

- Prefer functional components with hooks
- Use the Container/Presentational pattern for complex components
- Follow the "data down, events up" pattern
- Keep components focused and single-purpose

### File Organization

- Place components in appropriate directories:
  - `src/components/` - Top-level shared components
  - `src/features/` - Feature-specific code
  - `src/shared/` - Shared utilities, hooks, types
- Use PascalCase for component files: `TaskCard.tsx`
- Use camelCase for utility files: `useClickUp.ts`

### Formatting

- Use 2 spaces for indentation
- Use semicolons consistently
- Use single quotes for strings
- Add trailing commas in multi-line objects/arrays

### Before Starting

1. Check existing issues and pull requests
2. Create an issue if you're planning a large change
3. Discuss major changes with group first

### Making Changes

1. **Start with the smallest change** that adds value
2. **Follow existing patterns** in the codebase
3. **Update documentation** for any API or behavior changes
4. **Add tests** for new features or bug fixes
5. **Update types** when adding new data structures

### Testing

- Run the linter: `npm run lint`
- Run tests: `npm test`
- Test manually in the browser
- Check both Task Table and Dependency Graph views if applicable

### Commit Messages

Use clear, descriptive commit messages:

```
feat: Add task filtering by status
fix: Resolve pan/zoom issue on mobile
docs: Update API documentation
refactor: Extract task conversion logic to utility
```

### Before Submitting

1. **Rebase** your branch on the latest `main` branch
2. **Ensure tests pass** and linting is clean
3. **Update documentation** if needed
4. **Test the changes** in both development and production builds

### PR Description

Include in your PR or in the slack/groupchat:
- **What** - Description of changes
- **Why** - Reason for the change
- **How** - Brief explanation of implementation
- **Testing** - How you tested the changes
- **Screenshots** - If UI changes were made

### New Components

1. Create component file in appropriate directory
2. Define TypeScript interfaces for props
3. Add component to documentation
4. Consider reusability and composition

### New Hooks

1. Create hook file in `src/shared/hooks/`
2. Document parameters and return values
3. Add JSDoc comments
4. Update `docs/HOOKS.md`

### API Integration

1. Add types in `src/shared/types/`
2. Create/update hook in `src/shared/hooks/`
3. Handle errors gracefully
4. Add loading states
5. Update `docs/API.md`

### ClickUp Integration

- Always handle API errors gracefully
- Include loading states for async operations
- Cache data when appropriate
- Respect rate limits

### Task Relationships

- Maintain parent-child relationship integrity
- Ensure status propagation works correctly
- Handle edge cases (orphaned tasks, circular dependencies)

### UI/UX

- Maintain responsive design
- Ensure accessibility (keyboard navigation, ARIA labels)
- Follow existing design patterns
- Consider mobile/tablet views

