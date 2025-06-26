# Architecture Documentation

## Overview

The W40K Roster Cleaner is a Progressive Web App (PWA) built with vanilla JavaScript that processes Warhammer 40K army rosters. The application follows a modular, test-driven architecture with clear separation of concerns.

## Architecture Principles

### 1. **Vanilla JavaScript Philosophy**
- No heavy frameworks or build tools
- ES6+ modules for code organization
- Native browser APIs for functionality
- Minimal dependencies for maintainability

### 2. **Progressive Enhancement**
- Core functionality works without JavaScript
- Enhanced with modern browser features
- PWA capabilities for offline use
- Responsive design for all devices

### 3. **Test-Driven Development**
- Comprehensive test coverage (unit, integration, e2e)
- Real-world fixture data for validation
- Behavior-driven test design
- Continuous integration ready

## Module Architecture

```
app.js                 # Application entry point & UI logic
├── roster-cleaner.js  # Core business logic
├── utils/             # Pure utility functions
│   ├── string-utils.js
│   ├── validation-utils.js
│   └── regex-patterns.js
├── config/            # Configuration constants
│   └── roster-constants.js
└── test/              # Comprehensive test suite
    ├── unit/
    ├── integration/
    └── e2e/
```

### Core Modules

#### **app.js** - Application Layer
- **Responsibility**: UI event handling, DOM manipulation, user interaction
- **Patterns**: Event-driven architecture, functional composition
- **Dependencies**: `roster-cleaner.js` for business logic

#### **roster-cleaner.js** - Business Logic Layer
- **Responsibility**: Roster processing, text transformation, faction-specific logic
- **Patterns**: Pure functions, functional composition, configuration-driven
- **Dependencies**: `utils/`, `config/`

#### **utils/** - Utility Layer
- **string-utils.js**: Text normalization and manipulation
- **validation-utils.js**: Input validation and error handling
- **regex-patterns.js**: Centralized regular expression patterns

#### **config/** - Configuration Layer
- **roster-constants.js**: Game-specific constants and configuration
- **Pattern**: Centralized configuration for easy maintenance

## Data Flow

```
User Input → Validation → Processing → Formatting → Output
     ↓           ↓           ↓           ↓         ↓
  DOM Event → validateString → cleanRosterText → formatUnitName → UI Update
```

### Processing Pipeline

1. **Input Validation**: All inputs validated before processing
2. **Text Normalization**: Apostrophes, faction names standardized
3. **Header Processing**: Army information extracted and formatted
4. **Unit Processing**: Individual units processed with faction-specific rules
5. **Output Formatting**: Final formatting based on user options

## Configuration Management

### Roster Configuration
```javascript
export const ROSTER_CONFIG = {
    GAME_FORMATS: ['Strike Force', 'Incursion', 'Onslaught'],
    TAU_UNIT_BASES: ['Broadside', 'Crisis Fireknife', ...]
};
```

### Pattern Management
```javascript
export const POINTS_PATTERN = /\((\d+)\s*points?\)/i;
export const ENHANCEMENT_PATTERN = /Enhancements?:/i;
// ... other patterns
```

## Testing Architecture

### Test Layers

1. **Unit Tests** (`test/unit/`)
   - Pure function testing
   - Isolated component testing
   - Edge case validation

2. **Integration Tests** (`test/integration/`)
   - Module interaction testing
   - Data flow validation
   - Configuration testing

3. **End-to-End Tests** (`test/e2e/`)
   - User workflow testing
   - UI interaction testing
   - Cross-browser compatibility

4. **Cross-Cutting Tests** (`test/`)
   - Model counting validation
   - String utility testing
   - Validation utility testing

### Test Data Strategy

- **Fixtures**: Real-world roster data from Games Workshop app
- **Scenarios**: Multiple factions with various option combinations
- **Edge Cases**: Empty input, malformed data, boundary conditions

## PWA Architecture

### Service Worker (`sw.js`)
- **Caching Strategy**: Cache-first for static assets
- **Offline Support**: Basic functionality without network
- **Update Management**: Automatic updates when available

### Manifest (`manifest.json`)
- **App Metadata**: Name, description, icons
- **Display Mode**: Standalone for app-like experience
- **Theme Configuration**: Consistent branding

## Performance Considerations

### Optimization Strategies
- **Minimal Dependencies**: Only essential packages
- **CDN Usage**: Tailwind CSS via CDN for faster loading
- **Lazy Loading**: Icons generated on-demand
- **Caching**: Service worker for offline capability

### Bundle Size
- **Vanilla JS**: No framework overhead
- **Tree Shaking**: ES6 modules enable dead code elimination
- **Minimal Assets**: Optimized icons and images

## Security Considerations

### Input Validation
- **Client-Side**: Immediate feedback for user experience
- **Sanitization**: Text normalization prevents injection
- **Error Handling**: Graceful degradation for malformed input

### PWA Security
- **HTTPS Required**: Service worker requires secure context
- **Content Security Policy**: Restrict resource loading
- **Cross-Origin**: Proper CORS configuration

## Deployment Architecture

### Static Hosting
- **File Structure**: Optimized for static hosting
- **No Build Step**: Direct deployment of source files
- **CDN Ready**: Assets optimized for CDN distribution

### Environment Configuration
- **Development**: Local server with hot reload
- **Production**: Static file hosting with PWA support
- **Testing**: Jest environment with jsdom

## Future Architecture Considerations

### Scalability
- **Modular Design**: Easy to add new factions and features
- **Configuration-Driven**: New rules via configuration
- **Plugin Architecture**: Potential for extension system

### Maintainability
- **Clear Separation**: UI, business logic, and utilities separated
- **Comprehensive Testing**: High test coverage for reliability
- **Documentation**: Self-documenting code with JSDoc

### Extensibility
- **Faction Support**: Easy to add new Warhammer 40K factions
- **Format Support**: Extensible for different roster formats
- **UI Customization**: Modular UI components for easy modification 