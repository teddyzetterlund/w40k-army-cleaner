# W40K Roster Cleaner

A vanilla JavaScript Progressive Web App for cleaning and formatting Warhammer 40K army rosters. Now powered by [Vite](https://vitejs.dev/) for fast builds, modern development, and automatic cache-busting.

## Features
- Cleans and formats Games Workshop and NewRecruit roster exports
- Smart unit name formatting and enhancement handling
- PWA: installable, offline-capable, mobile-friendly
- 100% test-driven, modular, and maintainable

## Development

```bash
npm install
npm run dev
```
- Opens the app at [http://localhost:3000](http://localhost:3000)
- Hot reloads on file changes

## Production Build

```bash
npm run build
```
- Outputs production-ready files to the `dist/` directory

## Preview Production Build Locally

```bash
npm run preview
```
- Serves the built `dist/` folder locally

## Deployment

- Deploy the contents of the `dist/` folder to your static host (e.g., GitHub Pages, Netlify, Vercel).
- For GitHub Pages, configure your workflow to publish `dist/` as the site root.

## PWA & Service Worker

- The service worker is located in `public/sw.js` and is automatically included in the build.
- All assets are cache-busted by Vite, so users always get the latest version.

## Testing

```bash
npm test
```
- Runs the full test suite with [Vitest](https://vitest.dev/)

## Contributing

- Follow the modular, test-driven, and PWA-friendly architecture described in `CONTRIBUTING.md`.
- Use Vite for all development and builds.

---

For more details, see the full documentation in `CONTRIBUTING.md` and `ARCHITECTURE.md`.

## Live Demo

🌐 **Live Application**: [https://teddyzetterlund.github.io/w40k-army-cleaner/](https://teddyzetterlund.github.io/w40k-army-cleaner/)

The application is automatically deployed to GitHub Pages and updates whenever changes are pushed to the main branch.

## Features

### Core Functionality
- Drag and drop support for roster files
- Clean, modern UI with responsive design
- One-click copy functionality with keyboard shortcuts (CMD/CTRL+C)
- Progressive Web App (PWA) support
- Settings persistence (remembers your formatting preferences)

### Formatting Options
- **Show/Hide Points** - Toggle point costs display on/off
- **Smart Formatting** - Faction-specific unit name formatting
- **Model Counting** - Show model counts (e.g., "10x Cultists", "5x Legionaries")
- **Consolidate Duplicates** - Combine consecutive duplicate units (e.g., "2 Legionaries")
- **One-Liner Output** - Convert roster to single line with comma separators
- **Inline Enhancements** - Move enhancements into square brackets with unit names
- **Hide Header** - Remove army header information
- **No Empty Lines** - Remove empty lines between units
- **Discord Format** - Wrap output in markdown code blocks for Discord sharing

### Supported Factions
- Chaos Space Marines
- Space Marines (Dark Angels)
- T'au Empire

### Processing Capabilities
- Army name and faction information formatting
- Unit names and point costs (optional)
- Enhancement handling and formatting
- Removal of redundant section headers and formatting
- Model counting for multi-model units
- Duplicate unit consolidation

## Usage

1. Open the application in your web browser
2. Either:
   - Drag and drop your exported roster file onto the input area
   - Or paste your roster text directly into the input field
3. Use the formatting options in the output area to customize your roster:
   - **Show/Hide Points** - Toggle point costs display
   - **Smart Formatting** - Enable faction-specific unit name formatting
   - **Model Counting** - Show model counts for units
   - **Consolidate Duplicates** - Combine consecutive duplicate units
   - **One-Liner Output** - Convert to single line format
   - **Inline Enhancements** - Move enhancements into unit names
   - **Hide Header** - Remove army header information
   - **No Empty Lines** - Remove empty lines between units
   - **Discord Format** - Wrap output in markdown for Discord
4. The cleaned roster will appear in the output area
5. Click the "Copy" button or use CMD/CTRL+C to copy the cleaned roster to your clipboard

### Smart Formatting

When enabled, smart formatting applies faction-specific rules to unit names:
- Space Marines: Removes "Squad" suffix and handles pluralization
- T'au Empire: Removes "Battlesuit" references and simplifies Commander names

When disabled, unit names are kept in their original format from the roster.

## Development

### Prerequisites

- Node.js (v22.17.0 or higher)
- npm (comes with Node.js)

### Setup with Mise (Recommended)

This project uses [mise](https://mise.jdx.dev/) for tool management, ensuring consistent Node.js and npm versions across all developers.

#### Quick Setup

1. Install mise: https://mise.jdx.dev/getting-started.html
2. Clone the repository
3. Install tools:
   ```bash
   mise install
   ```
4. Install dependencies:
   ```bash
   mise run npm install
   ```

#### Using Mise Commands

Once set up, you can use mise to run project commands:

```bash
mise run dev      # Start development server
mise run test     # Run tests
mise run build    # Build for production
mise run lint     # Run ESLint
```

### Setup (Traditional)

1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   ```

### Available Scripts

- `npm run generate-icons`: Generates PWA icons from the source SVG
- `npm run dev`: Starts development server on HTTP (port 3000)
- `npm run dev:https`: Starts development server on HTTPS (port 3000) - requires SSL certificates
- `npm test`: Runs all tests using [Vitest](https://vitest.dev/)
- `npm run test:watch`: Runs tests in watch mode
- `npm run test:coverage`: Generates a coverage report
- `npm run test:unit`: Runs only unit tests
- `npm run test:integration`: Runs only integration tests
- `npm run test:e2e`: Runs only end-to-end tests
- `npm run test:ui`: Opens the Vitest UI for interactive test running

### HTTPS Development Setup

For mobile testing and clipboard functionality, you'll need to run the app over HTTPS. Follow these steps to set up local SSL certificates:

1. Create the certificates directory:
   ```bash
   mkdir -p ~/.localhost-ssl
   ```

2. Generate self-signed certificates:
   ```bash
   openssl req -x509 -out ~/.localhost-ssl/localhost.crt -keyout ~/.localhost-ssl/localhost.key -newkey rsa:2048 -nodes -sha256 -subj '/CN=localhost' -extensions EXT -config <(printf "[dn]\nCN=localhost\n[req]\ndistinguished_name = dn\n[EXT]\nsubjectAltName=DNS:localhost\nkeyUsage=digitalSignature\nextendedKeyUsage=serverAuth")
   ```

3. Start the HTTPS development server:
   ```bash
   npm run dev:https
   ```

4. Access the app at `https://localhost:3000` on your computer

5. For mobile testing, find your computer's IP address and access `https://YOUR_IP:3000` on your mobile device

**Note**: You'll need to accept the self-signed certificate warning in your browser the first time you access the HTTPS URL.

### Deployment

This application is automatically deployed to GitHub Pages using GitHub Actions. The deployment process:

1. **Automatic Deployment**: Every push to the `main` branch triggers a deployment
2. **Quality Gates**: The deployment runs tests and linting before publishing
3. **PWA Support**: The deployed site includes full PWA functionality
4. **Live URL**: Available at `https://teddyzetterlund.github.io/w40k-army-cleaner/`

#### Manual Deployment

If you need to deploy manually:

1. Ensure all tests pass: `npm test`
2. Ensure linting passes: `npm run lint`
3. Push to the main branch: `git push origin main`
4. The GitHub Action will automatically deploy to GitHub Pages

#### Custom Domain (Optional)

To use a custom domain:

1. Add your domain to the `cname` field in `.github/workflows/deploy.yml`
2. Configure your domain's DNS to point to `teddyzetterlund.github.io`
3. The deployment will automatically set up the custom domain

### Project Structure

- `app.js` - Main application logic
- `index.html` - Main HTML file
- `sw.js` - Service Worker for PWA functionality
- `manifest.json` - PWA manifest file
- `generate-icons.js` - Script for generating PWA icons
- `fixtures/` - Directory containing test data

### Building and Running

The application is a static web application and can be served using any web server. For development, you can use:

```bash
# Using Python's built-in server
python -m http.server

# Or using Node's http-server (if installed)
npx http-server
```

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Acknowledgments

- Built with vanilla JavaScript
- Uses Tailwind CSS for styling
- Icons generated using Sharp 