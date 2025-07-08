# W40K Roster Cleaner

A vanilla JavaScript Progressive Web App for cleaning and formatting Warhammer 40K army rosters. Built with Vite, featuring PWA support and comprehensive testing.

## Quick Start

```bash
# Clone and install
git clone https://github.com/teddyzetterlund/w40k-army-cleaner.git
cd w40k-army-cleaner
npm install

# Start development
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to see the app.

## Development

### Prerequisites
- Node.js (v22.17.0+)
- npm

### Available Commands

```bash
npm run dev          # Start development server
npm run build        # Build for production
npm run preview      # Preview production build
npm test            # Run all tests
npm run test:watch  # Run tests in watch mode
npm run lint        # Check code quality
```

### HTTPS for Mobile Testing

For clipboard functionality on mobile devices:

```bash
# Generate SSL certificates (one-time setup)
mkdir -p ~/.localhost-ssl
openssl req -x509 -out ~/.localhost-ssl/localhost.crt -keyout ~/.localhost-ssl/localhost.key -newkey rsa:2048 -nodes -sha256 -subj '/CN=localhost' -extensions EXT -config <(printf "[dn]\nCN=localhost\n[req]\ndistinguished_name = dn\n[EXT]\nsubjectAltName=DNS:localhost\nkeyUsage=digitalSignature\nextendedKeyUsage=serverAuth")

# Start HTTPS server
npm run dev:https
```

## Deployment

The app automatically deploys to GitHub Pages when you push to the `main` branch. The GitHub Action:

1. Runs tests and linting
2. Builds the application with Vite
3. Deploys to `https://teddyzetterlund.github.io/w40k-army-cleaner/`

**Live Demo**: [https://teddyzetterlund.github.io/w40k-army-cleaner/](https://teddyzetterlund.github.io/w40k-army-cleaner/)

## Features

- **Drag & Drop**: Upload roster files directly
- **Smart Formatting**: Faction-specific unit name formatting
- **Multiple Options**: Toggle points, model counts, duplicates, etc.
- **PWA Support**: Installable, offline-capable
- **Copy to Clipboard**: One-click copying with keyboard shortcuts

### Supported Factions
- Chaos Space Marines
- Space Marines (Dark Angels)  
- T'au Empire

## Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Make your changes and add tests
4. Run tests: `npm test`
5. Commit: `git commit -m 'Add amazing feature'`
6. Push: `git push origin feature/amazing-feature`
7. Open a Pull Request

### Development Guidelines

- Follow the test-driven development approach
- Add tests for new functionality
- Use pure functions with clear inputs/outputs
- Follow existing code patterns and naming conventions
- See `CONTRIBUTING.md` for detailed guidelines

## Project Structure

```
├── app.js              # Main application logic
├── roster-cleaner.js   # Core roster processing
├── config/            # Configuration and constants
├── utils/             # Utility functions
├── test/              # Test files
├── fixtures/          # Sample roster data
└── public/            # PWA assets (manifest, service worker)
```

## License

MIT License - see [LICENSE](LICENSE) for details. 