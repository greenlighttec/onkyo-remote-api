from flask import Flask, request, jsonify

app = Flask(__name__)

@app.route('/api/command', methods=['POST'])
def send_command():
    # Your code to interface with Onkyo receiver API
    command = request.json.get('command', '')
    return jsonify({"status": "Command sent", "command": command})

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000)
