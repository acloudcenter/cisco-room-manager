# WebSocket Connection Best Practices

## Proper Connection Lifecycle Management

### 1. Always Close Connections

```javascript
// ✅ Good - Always close when done
const xapi = await jsxapi.connect(`wss://${host}`, { username, password });
try {
  // Do your work
  await xapi.Status.Audio.Volume.get();
} finally {
  xapi.close(); // Always close, even if error occurs
}

// ❌ Bad - Connection left open
const xapi = await jsxapi.connect(`wss://${host}`, { username, password });
await xapi.Status.Audio.Volume.get();
// Connection never closed!
```

### 2. Handle Connection Events

```javascript
const xapi = await jsxapi.connect(`wss://${host}`, { username, password });

// Listen for connection events
xapi.on("close", () => {
  console.log("Connection closed");
  // Clean up any resources
});

xapi.on("error", (error) => {
  console.error("Connection error:", error);
  // Handle errors appropriately
});
```

### 3. React Component Cleanup

```javascript
// In React components, clean up on unmount
useEffect(() => {
  let xapi = null;

  const connect = async () => {
    xapi = await jsxapi.connect(`wss://${host}`, { username, password });
  };

  connect();

  // Cleanup function
  return () => {
    if (xapi) {
      xapi.close();
    }
  };
}, []);
```

### 4. Service/Singleton Pattern

```javascript
class ConnectionService {
  private xapi: any = null;

  async connect(credentials) {
    // Close existing connection if any
    if (this.xapi) {
      this.disconnect();
    }

    this.xapi = await jsxapi.connect(`wss://${credentials.host}`, {
      username: credentials.username,
      password: credentials.password
    });
  }

  disconnect() {
    if (this.xapi) {
      this.xapi.close();
      this.xapi = null;
    }
  }
}
```

### 5. Connection Pool Management

For applications managing multiple devices:

```javascript
class DeviceConnectionPool {
  private connections = new Map();

  async connect(deviceId, credentials) {
    // Close existing connection for this device
    if (this.connections.has(deviceId)) {
      await this.disconnect(deviceId);
    }

    const xapi = await jsxapi.connect(`wss://${credentials.host}`, {
      username: credentials.username,
      password: credentials.password
    });

    this.connections.set(deviceId, xapi);
  }

  async disconnect(deviceId) {
    const xapi = this.connections.get(deviceId);
    if (xapi) {
      xapi.close();
      this.connections.delete(deviceId);
    }
  }

  async disconnectAll() {
    for (const [deviceId, xapi] of this.connections) {
      xapi.close();
    }
    this.connections.clear();
  }
}
```

### 6. Error Handling and Reconnection

```javascript
class ResilientConnection {
  private xapi = null;
  private reconnectTimer = null;
  private maxReconnectAttempts = 3;
  private reconnectAttempts = 0;

  async connect(credentials) {
    try {
      this.xapi = await jsxapi.connect(`wss://${credentials.host}`, {
        username: credentials.username,
        password: credentials.password
      });

      this.xapi.on('close', () => {
        this.handleDisconnect();
      });

      this.xapi.on('error', (error) => {
        console.error('Connection error:', error);
        this.handleDisconnect();
      });

      // Reset reconnect counter on successful connection
      this.reconnectAttempts = 0;

    } catch (error) {
      this.handleConnectionError(error);
    }
  }

  private handleDisconnect() {
    this.xapi = null;

    if (this.reconnectAttempts < this.maxReconnectAttempts) {
      this.reconnectAttempts++;
      console.log(`Reconnecting... (attempt ${this.reconnectAttempts})`);

      this.reconnectTimer = setTimeout(() => {
        this.connect(this.lastCredentials);
      }, 5000); // Wait 5 seconds before reconnecting
    }
  }

  disconnect() {
    // Clear any reconnect timers
    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer);
      this.reconnectTimer = null;
    }

    // Close connection
    if (this.xapi) {
      this.xapi.close();
      this.xapi = null;
    }

    // Reset reconnect counter
    this.reconnectAttempts = 0;
  }
}
```

### 7. Testing Connection Cleanup

Always test that connections are properly closed:

```javascript
// Test cleanup
const testCleanup = async () => {
  const xapi = await jsxapi.connect(`wss://${host}`, { username, password });

  // Set up listener to verify close event
  let closed = false;
  xapi.on("close", () => {
    closed = true;
  });

  // Close connection
  xapi.close();

  // Wait and verify
  await new Promise((resolve) => setTimeout(resolve, 1000));
  console.assert(closed, "Connection should be closed");

  // Verify API calls fail after close
  try {
    await xapi.Status.get();
    console.error("ERROR: API call succeeded after close!");
  } catch (error) {
    console.log("Good: API calls fail after close");
  }
};
```

## Common Pitfalls to Avoid

1. **Not closing connections on error**

   ```javascript
   // ❌ Bad
   try {
     const xapi = await jsxapi.connect(...);
     await doSomethingThatMightFail();
     xapi.close();
   } catch (error) {
     // Connection leaked!
   }

   // ✅ Good
   let xapi;
   try {
     xapi = await jsxapi.connect(...);
     await doSomethingThatMightFail();
   } finally {
     if (xapi) xapi.close();
   }
   ```

2. **Not handling browser/tab close**

   ```javascript
   // In browser environments
   window.addEventListener("beforeunload", () => {
     connectionService.disconnectAll();
   });
   ```

3. **Creating multiple connections to same device**

   ```javascript
   // Always check and close existing connections before creating new ones
   ```

4. **Not clearing event listeners**
   ```javascript
   // If you add custom event listeners, remove them before closing
   ```

## Memory Leak Prevention

1. **Clear all references after closing**

   ```javascript
   disconnect() {
     if (this.xapi) {
       this.xapi.close();
       this.xapi = null; // Clear reference
     }
   }
   ```

2. **Use WeakMap for connection metadata**

   ```javascript
   const connectionMetadata = new WeakMap();
   // Metadata will be garbage collected when connection is removed
   ```

3. **Monitor active connections**
   ```javascript
   console.log(`Active connections: ${connectionPool.size}`);
   ```

## Integration with React

```javascript
// Custom hook for connection management
function useCiscoConnection() {
  const [connection, setConnection] = useState(null);
  const [isConnected, setIsConnected] = useState(false);

  const connect = useCallback(async (credentials) => {
    const xapi = await jsxapi.connect(`wss://${credentials.host}`, {
      username: credentials.username,
      password: credentials.password,
    });

    xapi.on("close", () => {
      setIsConnected(false);
      setConnection(null);
    });

    setConnection(xapi);
    setIsConnected(true);
  }, []);

  const disconnect = useCallback(() => {
    if (connection) {
      connection.close();
      setConnection(null);
      setIsConnected(false);
    }
  }, [connection]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (connection) {
        connection.close();
      }
    };
  }, [connection]);

  return { connect, disconnect, isConnected, connection };
}
```
