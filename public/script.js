document.getElementById('runCodeButton').addEventListener('click', async () => {
    const code = document.getElementById('codeInput').value;
    const language = document.getElementById('languageSelect').value;

    if (!code.trim()) {
        alert('Please enter some code to run.');
        return;
    }

    try {
        const response = await fetch('/run', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ code, language })
        });

        const result = await response.json();
        document.getElementById('outputArea').textContent = result.output || 'No output returned';
    } catch (error) {
        document.getElementById('outputArea').textContent = `Error: ${error.message}`;
    }
});
