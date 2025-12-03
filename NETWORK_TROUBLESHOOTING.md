# Network Connectivity Troubleshooting

## Current Error
The app cannot connect to the server at `http://134.122.96.197:3000`. This is a network connectivity issue, not a code issue.

## Common Causes & Solutions

### 1. Android Emulator Network Issues
If you're testing on an **Android Emulator**:
- The emulator has a special network setup
- `localhost` or `127.0.0.1` won't work
- Use `10.0.2.2` to access your host machine's localhost
- For external IPs like `134.122.96.197`, the emulator should be able to reach it if your host machine can

**Solution**: Ensure your host machine can reach `http://134.122.96.197:3000` first.

### 2. Physical Device Network
If you're testing on a **physical device**:
- The device must be on the same network as the server (if server is local)
- OR the server must be publicly accessible (if server is remote)
- Check that your device has internet connectivity

**Solution**: 
- Test the URL in your device's browser: `http://134.122.96.197:3000/api/recipes`
- If it works in browser but not in app, it's an app configuration issue
- If it doesn't work in browser, it's a network/server issue

### 3. iOS Simulator
If you're testing on **iOS Simulator**:
- `localhost` should work for local servers
- External IPs should work if your Mac can reach them

**Solution**: Test the URL in Safari on the simulator.

### 4. Server Not Running
The server at `134.122.96.197:3000` might not be running or accessible.

**Solution**: 
- Verify the server is running
- Test with curl: `curl http://134.122.96.197:3000/api/recipes`
- Check server logs for incoming requests

### 5. Firewall/Security Settings
Firewalls or security settings might be blocking the connection.

**Solution**:
- Check firewall settings on your machine
- Ensure port 3000 is not blocked
- Check if the server has CORS configured properly

### 6. CORS Issues
If testing on **web** (Expo web), CORS might be blocking the request.

**Solution**: Ensure your backend has CORS configured to allow requests from your Expo app origin.

## Quick Tests

1. **Test from your computer's browser:**
   ```
   http://134.122.96.197:3000/api/recipes
   ```

2. **Test with curl:**
   ```bash
   curl http://134.122.96.197:3000/api/recipes
   ```

3. **Check if server is reachable:**
   ```bash
   ping 134.122.96.197
   ```

4. **Test from device browser:**
   Open the same URL in your device's browser

## Configuration Check

Make sure your `.env` file exists and contains:
```
API_BASE_URL=http://134.122.96.197:3000
```

Then restart your Expo server:
```bash
npm start
```

## Alternative: Use Localhost for Development

If the remote server is not accessible, you can temporarily use a local server:

1. Update `.env`:
   ```
   API_BASE_URL=http://localhost:3000
   ```

2. For Android emulator, use:
   ```
   API_BASE_URL=http://10.0.2.2:3000
   ```

3. Restart Expo server

## Still Having Issues?

1. Check the console logs - they show the exact URL being used
2. Verify the server is running and accessible
3. Test the URL in a browser first
4. Check network connectivity on your device/emulator

