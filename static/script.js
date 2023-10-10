async function scanReceivers() {
    const response = await fetch('/api/scan');
    const data = await response.json();
    const select = document.getElementById('receiverList');
    select.innerHTML = '';
    data.forEach(ip => {
        const option = document.createElement('option');
        option.value = ip;
        option.text = ip;
        select.appendChild(option);
    });
}

async function sendCommand(command) {
    const ip = document.getElementById('receiverList').value;
    const response = await fetch('/api/command', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ ip, command })
    });
    const data = await response.json();
    console.log(data);
}
