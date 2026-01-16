import os
from datetime import datetime
from flask import Flask, jsonify

app = Flask(__name__)

def getenv(key, default):
    value = os.getenv(key)
    return value if value else default

SERVICE_NAME = getenv("SERVICE_NAME", "python-services-demo")
APP_MESSAGE = getenv("APP_MESSAGE", "Hello from Python 12-factor app! Check it out with relative paths.")
APP_ENV = getenv("APP_ENV", "dev")


@app.route("/")
def root():
    return jsonify(
        service=SERVICE_NAME,
        message=APP_MESSAGE,
        env=APP_ENV,
        timestamp=datetime.utcnow().isoformat() + "Z",
    )


@app.route("/healthz")
def healthz():
    return jsonify(status="ok", service=SERVICE_NAME)

@app.route("/testing")
def test():
    return jsonify(test="test successful", service=SERVICE_NAME)


if __name__ == "__main__":
    port = int(getenv("PORT", "8000"))
    app.run(host="0.0.0.0", port=port)
