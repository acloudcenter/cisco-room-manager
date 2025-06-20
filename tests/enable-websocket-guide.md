# Enable WebSocket on Cisco Device

To use the jsxapi library and connect from your React app, you need to enable WebSocket on your Cisco device.

## Steps to Enable WebSocket:

1. **Access Device Web Interface**

   - Open browser and go to: https://192.168.1.186/web
   - Login with username: `admin` and your password

2. **Navigate to Configuration**

   - Click on "Setup" or "Settings"
   - Go to "Configuration"
   - Find "NetworkServices"

3. **Enable WebSocket**

   - Find the WebSocket setting
   - Change it from "Off" to "FollowHTTPService"
   - Ensure HTTP Mode is set to "HTTPS" or "HTTP+HTTPS"

4. **Save Configuration**
   - Click Save/Apply
   - The device may restart

## Alternative: Using SSH/Terminal

If you have SSH access to the device, you can run these commands:

```
xConfiguration NetworkServices WebSocket: FollowHTTPService
xConfiguration NetworkServices HTTP Mode: HTTPS
```

## Test WebSocket is Enabled

After enabling, test with:

```bash
curl -k https://admin:password@192.168.1.186/ws
```

If WebSocket is enabled, you should get a response other than 404.

## Once WebSocket is Enabled

Your React app will be able to connect using the jsxapi library:

```javascript
const xapi = await jsxapi.connect("wss://192.168.1.186", {
  username: "admin",
  password: "your-password",
});
```

## Current Status

Based on our tests:

- ✅ Device is reachable at 192.168.1.186
- ✅ HTTP API is working (status.xml, getxml)
- ❌ WebSocket is currently disabled (404 on /ws)
- 📋 Device: Cisco Codec running CE 9.15.18.5
