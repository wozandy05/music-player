import http.server
import socketserver
import os
import sys

def find_free_port(start_port=8000, max_port=9000):
    for port in range(start_port, max_port):
        try:
            with socketserver.TCPServer(("", port), http.server.SimpleHTTPRequestHandler) as s:
                return port
        except OSError:
            continue
    return None

PORT = find_free_port()
if PORT is None:
    print("Error: Unable to find a free port. Please try again later.")
    sys.exit(1)

DIRECTORY = "."

class Handler(http.server.SimpleHTTPRequestHandler):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, directory=DIRECTORY, **kwargs)

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
