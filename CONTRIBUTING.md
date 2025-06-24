# Contributing to 40K Army Cleaner

## Development Philosophy

This project follows a **vanilla JavaScript** approach with emphasis on:
- **Modularity**: Each file has a single, clear responsibility
- **Testability**: All business logic is pure functions with comprehensive tests
- **Progressive Enhancement**: Works without JavaScript, enhanced with modern features
- **PWA Standards**: Offline capability and app-like experience

## Code Style Guidelines

### JavaScript
- Use **ES6+ features** (arrow functions, destructuring, template literals)
- **camelCase** for variables and functions
- **PascalCase** for classes and exported objects
- **UPPER_SNAKE_CASE** for constants
- Always use **JSDoc comments** for public functions
- Prefer **const** over **let**, avoid **var**

### File Naming
- **kebab-case** for file names (`roster-cleaner.js`, `string-utils.js`)
- Test files: `*.test.js`
- Utility files: `*-utils.js`

### Function Design
- **Pure functions** with no side effects
- Clear input validation with descriptive error messages
- Consistent return types
- Single responsibility principle

## Testing Guidelines

### Test Organization
- **Unit tests**: Pure function testing in `test/unit/`
- **Integration tests**: Component interaction testing in `test/integration/`
- **E2E tests**: End-to-end workflow testing in `test/e2e/`
- **Cross-cutting tests**: Model counting, validation, etc. in `test/`

### Test Patterns
- Use **real-world fixtures** from `fixtures/` directory
- Test **all option combinations** for each faction
- Include **edge cases** (empty input, whitespace, etc.)
- Write **descriptive test names** that explain expected behavior

### Test Data
- Create fixtures for new factions: `sample-roster-{faction}.txt`
- Include cleaned versions for all option combinations
- Use actual exported roster data when possible

## Adding New Features

### 1. Faction Support
1. Add faction constants to `config/roster-constants.js`
2. Create test fixtures in `fixtures/`
3. Add faction-specific formatting logic to `roster-cleaner.js`
4. Write comprehensive tests for all scenarios

### 2. New Formatting Options
1. Add option to UI in `index.html`
2. Update `app.js` to handle new option
3. Modify `roster-cleaner.js` to implement logic
4. Add tests for new option combinations

### 3. Utility Functions
1. Place in appropriate `utils/` file
2. Add comprehensive JSDoc documentation
3. Write unit tests with edge cases
4. Export from module for reuse

## Development Workflow

### Setup
```bash
npm install
npm run test:watch  # Run tests in watch mode
npm run dev         # Start development server
```

### Testing
```bash
npm test                    # Run all tests
npm run test:unit          # Run unit tests only
npm run test:integration   # Run integration tests only
npm run test:coverage      # Generate coverage report
```

### Code Quality
- All tests must pass before submitting PR
- Maintain test coverage above 90%
- Follow existing code patterns and naming conventions
- Update documentation for new features

## Pull Request Process

1. **Fork** the repository
2. **Create** a feature branch (`git checkout -b feature/amazing-feature`)
3. **Write** comprehensive tests for new functionality
4. **Update** documentation if needed
5. **Ensure** all tests pass and coverage is maintained
6. **Commit** with descriptive messages (`git commit -m 'Add amazing feature'`)
7. **Push** to your branch (`git push origin feature/amazing-feature`)
8. **Open** a Pull Request with clear description

## Code Review Checklist

- [ ] Tests pass and coverage is maintained
- [ ] Code follows project style guidelines
- [ ] Functions have proper JSDoc documentation
- [ ] New features include appropriate test fixtures
- [ ] No console.log or debugging code left in
- [ ] Error handling is appropriate and descriptive
- [ ] UI changes are responsive and accessible

## Questions?

Feel free to open an issue for questions about the codebase or development process. 