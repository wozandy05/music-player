import http.server
import socketserver
import os
import sys

PORT = 8081
DIRECTORY = "."

class Handler(http.server.SimpleHTTPRequestHandler):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, directory=DIRECTORY, **kwargs)

    def end_headers(self):
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
        self.send_header('Access-Control-Allow-Headers', 'X-Requested-With, Content-Type, Accept')
        super().end_headers()

    def do_OPTIONS(self):
        self.send_response(200)
        self.end_headers()

if __name__ == "__main__":
    print(f"Attempting to start server on port {PORT}")
    try:
        with socketserver.TCPServer(("", PORT), Handler) as httpd:
            print(f"Server started successfully. Serving at port {PORT}")
            httpd.serve_forever()
    except OSError as e:
        print(f"Error: {e}")
        print("Unable to start the server. Please check if another process is using the port.")
        sys.exit(1)
    except KeyboardInterrupt:
        print("\nServer stopped.")
        sys.exit(0)
