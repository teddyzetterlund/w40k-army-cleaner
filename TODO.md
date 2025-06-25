# TODO

- Add robust unit tests for `setupDragAndDrop` in `app.js`:
  - Test dragover and dragleave events with proper `classList` simulation
  - Test file drop event with correct `dataTransfer` and file reading mocks
  - Consider using a more advanced DOM mocking library or integration test for these cases

- Review and improve test coverage for any other DOM event handlers that are hard to simulate in unit tests 