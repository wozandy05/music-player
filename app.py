from flask import Flask, render_template
from urllib.parse import urlparse

app = Flask(__name__)

@app.route('/')
def index():
    # Ensure the URL is valid
    base_url = urlparse("https://andy.largent.org")
    return render_template('index.html', base_url=base_url.geturl())

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000)
