# TODO

- Add robust unit tests for `setupDragAndDrop` in `app.js`:
  - Test dragover and dragleave events with proper `classList` simulation
  - Test file drop event with correct `dataTransfer` and file reading mocks
  - Consider using a more advanced DOM mocking library or integration test for these cases

- Review and improve test coverage for any other DOM event handlers that are hard to simulate in unit tests 

## Testing Note: UI + Storage Integration

Integration tests for UI and localStorage persistence are tricky in vanilla JS due to module system and mocking limitations. Pure utility tests are maintained, but integration/unit tests for app.js and UI+storage have been removed for now. 

**Future refactor:** Consider browser automation (e.g., Playwright, Cypress) or a more advanced mocking setup if robust integration testing is needed. 