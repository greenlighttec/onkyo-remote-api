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
        select.value = data[0];

    }
    
    const manualOption = document.createElement('option');
    select.appendChild(manualOption);
}

function getCurrentVolumeFromOSD() {
    const osdText = document.getElementById("osdVolume").innerText;
    return parseFloat(osdText.replace('Volume: ', ''), 10);
}

function apiToDb(apiVolume) {
    const referenceApiVolume = 94;
    const referenceDb = -35.0;
    const dbStep = 0.5;

    return referenceDb + (apiVolume - referenceApiVolume) * dbStep;
}

function dbToApi(dbVolume) {
    const referenceApiVolume = 94;
    const referenceDb = -35.0;
    const dbStep = 0.5;

    return Math.round(referenceApiVolume + (dbVolume - referenceDb) / dbStep);
}

function toggleManualIP() {
    document.getElementById("manualIPBox").style.display = "block";
}

function closeManualIPBox() {
    document.getElementById("manualIPBox").style.display = "none";
}

function updateOSDVolume(newVolume) {
    document.getElementById("osdVolume").innerText = `Volume: ${newVolume}`;
}

async function saveManualIP() {
    const manualIP = document.getElementById("lightboxManualIP").value;
    const response = await fetch('/api/save_manual_ip', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ manual_ip: manualIP })
    });
    const data = await response.json();
    if (data.status === "Manual IP saved") {
        // Add the manual IP to the dropdown
        const dropdown = document.getElementById("receiverList");
        const option = document.createElement("option");
        option.text = manualIP;
        option.value = manualIP;
        dropdown.add(option);
        dropdown.value = manualIP
    }
    closeManualIPBox();
}


async function connectReceiver() {
    const selectedIP = document.getElementById("receiverList").value;
    const response = await fetch('/api/connect', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ ip: selectedIP })
    });
    const data = await response.json();
    if (data.status === "Connected") {
        // Hide connection options and show remote
        document.getElementById("connectionOptions").style.display = "none";
        document.getElementById("remoteContainer").style.display = "flex";
        const dbVolume = apiToDb(data.current_volume);
        updateOSDVolume(dbVolume);
    } else {
        // Handle connection failure (you can add more user-friendly behavior here)
        alert("Failed to connect to receiver.");
    }
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

async function adjustVolume(direction) {
    let currentDbVolume = getCurrentVolumeFromOSD();
    let newDbVolume = direction === 'up' ? currentDbVolume + 0.5 : currentDbVolume - 0.5;
    const newApiVolume = dbToApi(newDbVolume);
    
    const response = await fetch('/api/set_volume', {
        method: 'POST',
        body: JSON.stringify({new_volume: newApiVolume}),
        headers: {'Content-Type': 'application/json'}
    });
    
    const data = await response.json();
    if (data.status === "Success") {
        const dbVolume = apiToDb(data.new_volume);
        updateOSDVolume(dbVolume);
    }
}
async function togglePower(state) {
    // let currentState = getCurrentStateFromOSD();
    // let newState = direction === 'up' ? currentVolume + 0.5 : currentVolume - 0.5;
    
    const response = await fetch('/api/change_power', {
        method: 'POST',
        body: JSON.stringify({state: state}),
        headers: {'Content-Type': 'application/json'}
    });
    
    const data = await response.json();
    if (data.status === "Success") {
        //updateOSDVolume(newVolume);
    }
}



