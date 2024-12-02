server.on('connection', (socket) => {
    if (!socket1) {
      socket1 = socket;
      console.log('Socket1 (RS-232) connected');
      
      socket1.on('data', (data) => {
        // Convert data to string if it's binary
        const dataStr = data.toString('utf-8');
  
        // Split the data into identity package and buffer
        const [identityPackage, ...bufferParts] = dataStr.split('_');
  
        // Check if we successfully split the data
        if (identityPackage && socket2) {
          console.log("Identity Package from socket1 (RS-232):", identityPackage);
          socket2.write(identityPackage); // Send identity package to socket2
        }
  
        // Join the remaining parts of the buffer and send to socket2
        const bufferData = bufferParts.join('_');
        if (bufferData && socket2) {
          console.log("Buffer data from socket1 (RS-232):", bufferData);
          socket2.write(bufferData); // Send buffer data to socket2
        }
      });
  
      socket1.on('end', () => {
        console.log('Socket1 (RS-232) disconnected');
        socket1 = null;
      });
  
      socket1.on('error', (err) => {
        console.log('Socket1 error:', err.message);
        socket1 = null;
      });
  
    } else if (!socket2) {
      socket2 = socket;
      console.log('Socket2 (DLMS COSEM) connected');
      
      socket2.on('data', (data) => {
        if (socket1) {
          console.log("Data received from socket2 (DLMS COSEM):", data);
          socket1.write(data); // Relay to socket1
        }
      });
  
      socket2.on('end', () => {
        console.log('Socket2 (DLMS COSEM) disconnected');
        socket2 = null;
      });
  
      socket2.on('error', (err) => {
        console.log('Socket2 error:', err.message);
        socket2 = null;
      });
    }
  });
  