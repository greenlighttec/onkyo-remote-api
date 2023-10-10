from flask import Flask, request, jsonify, send_from_directory
import eiscp, json

def load_settings():
    try:
        with open('settings.json', 'r') as f:
            return json.load(f)
    except FileNotFoundError:
        return {}

def save_settings(settings):
    with open('settings.json', 'w') as f:
        json.dump(settings, f)

app = Flask(__name__, static_folder='static')

receivers = {}

@app.route('/')
def index():
    return send_from_directory('static', 'index.html')

@app.route('/api/scan', methods=['GET'])
def scan_receivers():
    global receivers
    receivers = {device_info['host']: device_info for device_info in eiscp.eISCP.discover()}
    return jsonify(list(receivers.keys()))

@app.route('/api/command', methods=['POST'])
def send_command():
    ip = request.json.get('ip', '')
    command = request.json.get('command', '')
    if ip in receivers:
        receiver = eiscp.eISCP(ip)
        receiver.raw(command)
        return jsonify({"status": "Command sent", "command": command})
    else:
        return jsonify({"status": "Receiver not found"}), 404

@app.route('/api/save_settings', methods=['POST'])
def save_settings_endpoint():
    settings = request.json
    save_settings(settings)
    return jsonify({"status": "Settings saved"})


if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000)
