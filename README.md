# Warhammer 40K Army Roster Cleaner

A web-based tool that helps clean and format Warhammer 40K army rosters for better readability and sharing. This tool takes exported army rosters and removes unnecessary information while maintaining the essential unit and points data.

## Features

- Drag and drop support for roster files
- Clean, modern UI with responsive design
- One-click copy functionality
- Progressive Web App (PWA) support
- Toggle points display on/off
- Toggle smart formatting on/off (faction-specific unit name formatting)
- Processes and formats:
  - Army name and faction information
  - Unit names and point costs (optional)
  - Enhancements
  - Removes redundant section headers and formatting

## Usage

1. Open the application in your web browser
2. Either:
   - Drag and drop your exported roster file onto the input area
   - Or paste your roster text directly into the input field
3. Use the toggles in the output area to:
   - Show/hide point costs
   - Enable/disable smart formatting (faction-specific unit name formatting)
4. The cleaned roster will appear in the output area
5. Click the "Copy" button to copy the cleaned roster to your clipboard

### Smart Formatting

When enabled, smart formatting applies faction-specific rules to unit names:
- Space Marines: Removes "Squad" suffix and handles pluralization
- T'au Empire: Removes "Battlesuit" references and simplifies Commander names

When disabled, unit names are kept in their original format from the roster.

## Development

### Prerequisites

- Node.js (v14 or higher)
- npm (comes with Node.js)

### Setup

1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   ```

### Available Scripts

- `npm run generate-icons`: Generates PWA icons from the source SVG
- `npm test`: Runs all tests using [Vitest](https://vitest.dev/)
- `npm run test:watch`: Runs tests in watch mode
- `npm run test:coverage`: Generates a coverage report
- `npm run test:unit`: Runs only unit tests
- `npm run test:integration`: Runs only integration tests
- `npm run test:e2e`: Runs only end-to-end tests
- `npm run test:ui`: Opens the Vitest UI for interactive test running

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