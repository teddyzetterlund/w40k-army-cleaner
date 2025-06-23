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

function setupOptionsMenu(optionsMenuButton, optionsMenu, checkboxes, updateRosterOutput) {
    function updateOptionsButtonText() {
        const checkedCount = checkboxes.filter(cb => cb.checked).length;
        const totalCount = checkboxes.length;
        optionsMenuButton.textContent = `Formatting Options (${checkedCount}/${totalCount})`;
    }

    optionsMenuButton.addEventListener('click', (e) => {
        e.stopPropagation();
        optionsMenu.classList.toggle('hidden');
    });

    optionsMenu.addEventListener('click', (e) => {
        e.stopPropagation();
    });

    document.addEventListener('click', () => {
        if (!optionsMenu.classList.contains('hidden')) {
            optionsMenu.classList.add('hidden');
        }
    });

    checkboxes.forEach(checkbox => {
        checkbox.addEventListener('change', () => {
            updateRosterOutput();
            updateOptionsButtonText();
        });
    });

    updateOptionsButtonText();
}

function createUpdateRosterOutput(rosterInput, outputContainer, rosterOutput, showPointsCheckbox, smartFormatCheckbox, showModelsCheckbox) {
    return function updateRosterOutput() {
        const input = rosterInput.value;
        const showPoints = showPointsCheckbox.checked;
        const smartFormat = smartFormatCheckbox.checked;
        const showModels = showModelsCheckbox.checked;
        const cleaned = cleanRosterText(input, showPoints, smartFormat, showModels);
        
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
    const showModelsCheckbox = document.getElementById('show-models');
    const optionsMenuButton = document.getElementById('options-menu-button');
    const optionsMenu = document.getElementById('options-menu');

    const checkboxes = [showPointsCheckbox, smartFormatCheckbox, showModelsCheckbox];

    const updateRosterOutput = createUpdateRosterOutput(
        rosterInput,
        outputContainer,
        rosterOutput,
        showPointsCheckbox,
        smartFormatCheckbox,
        showModelsCheckbox
    );

    setupDragAndDrop(rosterInput, updateRosterOutput);
    setupCopyButton(copyButton, rosterOutput);
    setupOptionsMenu(optionsMenuButton, optionsMenu, checkboxes, updateRosterOutput);

    rosterInput.addEventListener('input', updateRosterOutput);
}); 