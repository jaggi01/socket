import socket
import threading

# Initialize variables for the two sockets
socket1 = None  # RS-232 connected socket
socket2 = None  # DLMS COSEM connected socket

# Define the port to listen on
PORT = 3000

# Relay data from one socket to another
def relay_data(source_socket, target_socket, source_name, target_name):
    try:
        while True:
            data = source_socket.recv(1024)  # Receive data from the source socket
            if not data:  # Connection closed
                print(f"{source_name} disconnected")
                break
            print(f"Data received from {source_name}: {data.decode('utf-8')}")
            if target_socket:  # If the target socket exists, send the data
                target_socket.sendall(data)
    except Exception as e:
        print(f"Error in {source_name} relay: {e}")
    finally:
        source_socket.close()
        if source_name == "Socket1 (RS-232)":
            global socket1
            socket1 = None
        elif source_name == "Socket2 (DLMS COSEM)":
            global socket2
            socket2 = None

# Custom function to send data between sockets
def send_data_between_sockets(source_socket, target_socket, data):
    try:
        if source_socket and target_socket:
            print(f"Sending custom data from source to target: {data}")
            target_socket.sendall(data.encode('utf-8'))  # Encode the string to bytes and send
        else:
            print("One or both sockets are not connected.")
    except Exception as e:
        print(f"Error sending data: {e}")

# Main server logic
def server():
    global socket1, socket2

    # Create a TCP server socket
    server_socket = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
    server_socket.setsockopt(socket.SOL_SOCKET, socket.SO_REUSEADDR, 1)
    server_socket.bind(('', PORT))
    server_socket.listen(5)
    print(f"Server listening on port {PORT}")

    try:
        while True:
            client_socket, addr = server_socket.accept()
            print(f"Connection from {addr}")

            if not socket1:  # First connection, assume RS-232 device
                socket1 = client_socket
                print("Socket1 (RS-232) connected")
                threading.Thread(target=relay_data, args=(socket1, socket2, "Socket1 (RS-232)", "Socket2 (DLMS COSEM)")).start()

            elif not socket2:  # Second connection, assume DLMS COSEM device
                socket2 = client_socket
                print("Socket2 (DLMS COSEM) connected")
                threading.Thread(target=relay_data, args=(socket2, socket1, "Socket2 (DLMS COSEM)", "Socket1 (RS-232)")).start()
            else:
                # If both sockets are occupied, reject the new connection
                print("Both sockets are already connected. Closing new connection.")
                client_socket.close()

    except KeyboardInterrupt:
        print("Server shutting down...")
    except Exception as e:
        print(f"Server error: {e}")
    finally:
        server_socket.close()

if __name__ == "__main__":
    server()
