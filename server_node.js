const net = require('net');

// Create a TCP server to handle socket1 and socket2 connections
const server = net.createServer();

let socket1 = null; // RS-232 connected socket
let socket2 = null; // DLMS COSEM connected socket

server.on('connection', (socket) => {
  // Assume the first connection is socket1 (RS-232)
  if (!socket1) {
    socket1 = socket;
    console.log('Socket1 (RS-232) connected');
    // socket1.write('sksjkfsajkjflksdjflkjsd');
    // Listen for data from socket1 and relay it to socket2
    socket1.on('data', (data) => {
      // if (socket1) {
      //   console.log("Data receive1d from socket1 (RS-232) Copy:", data.toString('utf-8'));
      // }
      if (socket2) {
        console.log("Data receive1d from socket1 (RS-232):", data.toString('utf-8'));
        socket2.write(data); // Send data to socket2
      }
      // console.log("Data receive1d from socket1 (RS-232):", data.toString('utf-8'));
    });

    socket1.on('end', () => {
      console.log('Socket1 (RS-232) disconnected');
      socket1 = null;
    });
    
  // Assume the second connection is socket2 (DLMS COSEM)
  // }
  } else if (!socket2) {
    socket2 = socket;
    console.log('Socket2 (DLMS COSEM) connected');
    
    // Listen for data from socket2 and relay it to socket1
    socket2.on('data', (data) => {
      if (socket1) {
        console.log("Data received from socket2 (DLMS COSEM):", data);
        socket1.write(data); // Send data to socket1
      }
    });

    socket2.on('end', () => {
      console.log('Socket2 (DLMS COSEM) disconnected');
      socket2 = null;
    });
  }
});

// Start the server
server.listen(3000, () => {
  console.log('Server listening on port 3000');
});
