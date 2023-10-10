from flask import Flask, request, jsonify, send_from_directory
import eiscp

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

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000)
