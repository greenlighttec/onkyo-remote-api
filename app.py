from flask import Flask, request, jsonify, make_response, send_from_directory
import eiscp, json, uuid

def load_settings():
    try:
        with open('settings.json', 'r') as f:
            return json.load(f)
    except FileNotFoundError:
        return {'manual_ips': []}

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
    settings = load_settings()
    manual_ips = settings.get('manual_ips', [])
    detected_ips = list(receivers.keys())
    all_ips = list(set(detected_ips + manual_ips))
    return jsonify(all_ips)

@app.route('/api/connect', methods=['POST'])
def connect_receiver():
    ip = request.json.get('ip')
    session_id = request.cookies.get('session_id')
    
    if session_id is None:
        session_id = str(uuid.uuid4())
    
    try:
        receiver = eiscp.eISCP(ip)
        status = receiver.get()
        if status != None:
            receivers[session_id] = receiver
            current_volume = receiver.command('master-volume', arguments=['query'], zone='main')[1]
            resp = make_response(jsonify({"status": "Connected", "current_volume": current_volume}))
            resp.set_cookie('session_id', session_id)
            return resp
        else:
            return jsonify({"status": f"Failed to connect: {str(e)}"}), 502
    except Exception as e:
        return jsonify({"status": f"Failed to connect: {str(e)}"}), 500

@app.route('/api/set_volume', methods=['POST'])
def set_volume():
    session_id = request.cookies.get('session_id')
    receiver = receivers.get(session_id)
    
    if receiver is None:
        return jsonify({"status": "Failure", "message": "Not connected to any receiver"}), 400

    try:
        data = request.json
        new_volume = data.get('new_volume')
        if new_volume is None:
            return jsonify({"status": "Failure", "message": "No volume specified"}), 400

        # Set the new volume
        receiver.command('master-volume', arguments=[new_volume], zone='main')
        
        return jsonify({"status": "Success", "new_volume": new_volume})
    except Exception as e:
        return jsonify({"status": "Failure", "message": str(e)}), 500


@app.route('/api/save_settings', methods=['POST'])
def save_settings_endpoint():
    settings = request.json
    save_settings(settings)
    return jsonify({"status": "Settings saved"})

@app.route('/api/save_manual_ip', methods=['POST'])
def save_manual_ip_route():
    manual_ip = request.json.get('manual_ip')
    settings = load_settings()
    if 'manual_ips' not in settings:
        settings['manual_ips'] = []
    settings['manual_ips'].append(manual_ip)
    save_settings(settings)
    return jsonify({"status": "Manual IP saved"})

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000)
