import { cleanRosterText } from './rosterProcessor.js';

export function setupDragAndDrop(rosterInput, updateRosterOutput) {
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

export function setupCopyButton(copyButton, rosterOutput) {
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

export function createUpdateRosterOutput(rosterInput, outputContainer, rosterOutput, showPointsCheckbox, smartFormatCheckbox) {
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