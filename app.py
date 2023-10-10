from flask import Flask, request, jsonify
import eiscp

app = Flask(__name__)

receivers = {}

@app.route('/api/scan', methods=['GET'])
def scan_receivers():
    global receivers
    receivers = {device_info['host']: device_info for device_info in eiscp.discover()}
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
