import { cleanRosterText } from './roster-cleaner.js';

// DOM Handlers
function setupDragAndDrop(rosterInput, updateRosterOutput) {
    rosterInput.addEventListener('dragover', (e) => {
        e.preventDefault();
        rosterInput.classList.add('border-blue-500');
    });

    rosterInput.addEventListener('dragleave', () => {
        rosterInput.classList.remove('border-blue-500');
    });

    rosterInput.addEventListener('drop', (e) => {
        e.preventDefault();
        rosterInput.classList.remove('border-blue-500');
        
        const file = e.dataTransfer.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (e) => {
                rosterInput.value = e.target.result;
                updateRosterOutput();
            };
            reader.readAsText(file);
        }
    });
}

function setupCopyButton(copyButton, rosterOutput) {
    copyButton.addEventListener('click', () => {
        navigator.clipboard.writeText(rosterOutput.textContent).then(() => {
            const originalText = copyButton.textContent;
            copyButton.textContent = 'Copied!';
            setTimeout(() => {
                copyButton.textContent = originalText;
            }, 2000);
        });
    });
}

function createUpdateRosterOutput(rosterInput, outputContainer, rosterOutput, showPointsCheckbox, smartFormatCheckbox) {
    return function updateRosterOutput() {
        const input = rosterInput.value;
        const showPoints = showPointsCheckbox.checked;
        const smartFormat = smartFormatCheckbox.checked;
        const cleaned = cleanRosterText(input, showPoints, smartFormat);
        
        if (!cleaned) {
            outputContainer.classList.add('hidden');
            return;
        }

        rosterOutput.textContent = cleaned;
        outputContainer.classList.remove('hidden');
    };
}

// Initialize DOM elements and event listeners
document.addEventListener('DOMContentLoaded', () => {
    const rosterInput = document.getElementById('roster-input');
    const outputContainer = document.getElementById('output-container');
    const rosterOutput = document.getElementById('roster-output');
    const copyButton = document.getElementById('copy-button');
    const showPointsCheckbox = document.getElementById('show-points');
    const smartFormatCheckbox = document.getElementById('smart-format');

    const updateRosterOutput = createUpdateRosterOutput(
        rosterInput,
        outputContainer,
        rosterOutput,
        showPointsCheckbox,
        smartFormatCheckbox
    );

    setupDragAndDrop(rosterInput, updateRosterOutput);
    setupCopyButton(copyButton, rosterOutput);

    rosterInput.addEventListener('input', updateRosterOutput);
    showPointsCheckbox.addEventListener('change', updateRosterOutput);
    smartFormatCheckbox.addEventListener('change', updateRosterOutput);
}); 