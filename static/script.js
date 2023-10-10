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
