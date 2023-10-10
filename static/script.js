async function scanReceivers() {
    const response = await fetch('/api/scan');
    const data = await response.json();
    const select = document.getElementById('receiverList');
    select.innerHTML = '<option value="">--Select Receiver--</option>';
    
    if (data.length === 0) {
        const option = document.createElement('option');
        option.value = "";
        option.text = "No results found";
        option.disabled = true;
        select.appendChild(option);
    } else {
        data.forEach(ip => {
            const option = document.createElement('option');
            option.value = ip;
            option.text = ip;
            select.appendChild(option);
        });
    }
    
    const manualOption = document.createElement('option');
    manualOption.value = "manual";
    manualOption.text = "Specify IP Manually";
    select.appendChild(manualOption);
}
function toggleManualIP() {
    document.getElementById("manualIPBox").style.display = "block";
}

function closeManualIPBox() {
    document.getElementById("manualIPBox").style.display = "none";
}

async function saveManualIP() {
    const manualIP = document.getElementById("lightboxManualIP").value;
    // Save to server and add to dropdown
    // ... API call to save manual IP ...
    closeManualIPBox();
}

function connectReceiver() {
    const selectedIP = document.getElementById("receiverList").value;
    // Connect to receiver and show remote
    // ... API call to connect ...
    document.getElementById("remoteContainer").style.display = "flex";
}

async function saveSettings() {
    const selectedIP = document.getElementById("receiverList").value;
    const manualIP = document.getElementById("manualIP").value;
    const response = await fetch('/api/save_settings', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ selectedIP, manualIP })
    });
    const data = await response.json();
    document.getElementById("remoteContainer").style.display = "flex";
    console.log(data);
}



