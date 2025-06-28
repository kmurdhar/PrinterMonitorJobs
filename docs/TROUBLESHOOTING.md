# Troubleshooting Guide - Printer Monitoring System

## Common Issues and Solutions

### 🚨 Installation Issues

#### Node.js Version Conflicts
**Problem**: Application won't start due to Node.js version mismatch
```bash
Error: The engine "node" is incompatible with this module
```

**Solution**:
```bash
# Check your Node.js version
node --version

# Install Node.js 18+ from nodejs.org
# Or use nvm to manage versions
nvm install 18
nvm use 18
```

#### NPM Permission Errors
**Problem**: Permission denied when installing packages
```bash
EACCES: permission denied, mkdir '/usr/local/lib/node_modules'
```

**Solution**:
```bash
# Fix npm permissions (Linux/Mac)
sudo chown -R $USER:$USER ~/.npm
sudo chown -R $USER:$USER /usr/local/lib/node_modules

# Or use npm config
npm config set prefix ~/.npm-global
export PATH=~/.npm-global/bin:$PATH
```

#### Package Installation Failures
**Problem**: Dependencies fail to install
```bash
npm ERR! code ERESOLVE
npm ERR! ERESOLVE unable to resolve dependency tree
```

**Solution**:
```bash
# Clear npm cache
npm cache clean --force

# Delete node_modules and package-lock.json
rm -rf node_modules package-lock.json

# Reinstall with legacy peer deps
npm install --legacy-peer-deps

# Or force install
npm install --force
```

### 🖥️ Development Server Issues

#### Port Already in Use
**Problem**: Development server can't start
```bash
Error: listen EADDRINUSE: address already in use :::5173
```

**Solution**:
```bash
# Find process using port 5173
lsof -i :5173

# Kill the process
kill -9 <PID>

# Or use different port
npm run dev -- --port 3000
```

#### Hot Reload Not Working
**Problem**: Changes don't reflect automatically

**Solution**:
```bash
# Check if you're in the correct directory
pwd

# Restart development server
npm run dev

# Clear browser cache (Ctrl+Shift+R)

# Check file watchers (Linux)
echo fs.inotify.max_user_watches=524288 | sudo tee -a /etc/sysctl.conf
sudo sysctl -p
```

#### Build Failures
**Problem**: Production build fails
```bash
npm run build
> vite build
✖ Build failed in 2.34s
```

**Solution**:
```bash
# Check TypeScript errors
npx tsc --noEmit

# Check for linting errors
npm run lint

# Clear Vite cache
rm -rf node_modules/.vite

# Rebuild
npm run build
```

### 🌐 Browser Issues

#### White Screen / Blank Page
**Problem**: Application loads but shows nothing

**Solution**:
1. **Check Browser Console** (F12):
   ```javascript
   // Look for JavaScript errors
   Uncaught TypeError: Cannot read property 'map' of undefined
   ```

2. **Clear Browser Cache**:
   - Chrome: Ctrl+Shift+R
   - Firefox: Ctrl+F5
   - Safari: Cmd+Shift+R

3. **Check Network Tab**:
   - Ensure all assets are loading
   - Check for 404 errors

#### Styling Issues
**Problem**: CSS not loading or looking broken

**Solution**:
```bash
# Ensure Tailwind CSS is working
npm run build

# Check if PostCSS is configured
cat postcss.config.js

# Verify Tailwind config
cat tailwind.config.js

# Restart development server
npm run dev
```

#### JavaScript Errors
**Problem**: Console shows JavaScript errors

**Common Errors and Solutions**:

1. **Module not found**:
   ```javascript
   Error: Cannot resolve module 'lucide-react'
   ```
   ```bash
   npm install lucide-react
   ```

2. **React hooks error**:
   ```javascript
   Error: Invalid hook call
   ```
   - Check React version compatibility
   - Ensure hooks are called inside components

3. **TypeScript errors**:
   ```javascript
   Property 'xyz' does not exist on type
   ```
   - Check type definitions in `src/types/`
   - Update interfaces as needed

### 🗄️ Data and State Issues

#### Data Not Persisting
**Problem**: Added users/printers disappear on refresh

**Explanation**: This is expected behavior in the current demo version. Data is stored in memory only.

**Solution for Production**:
```typescript
// Implement localStorage persistence
const saveToStorage = (key: string, data: any) => {
  localStorage.setItem(key, JSON.stringify(data));
};

const loadFromStorage = (key: string) => {
  const stored = localStorage.getItem(key);
  return stored ? JSON.parse(stored) : null;
};
```

#### Client Filtering Not Working
**Problem**: Data doesn't filter when switching clients

**Solution**:
1. **Check Client IDs**: Ensure data has correct `clientId` fields
2. **Verify Filter Functions**: Check `getClientPrinters`, `getClientUsers` functions
3. **State Management**: Ensure state updates properly

#### CRUD Operations Not Working
**Problem**: Add/Edit/Delete buttons don't work

**Solution**:
1. **Check Handler Functions**: Ensure proper event handlers are attached
2. **State Updates**: Verify state management in parent components
3. **Console Errors**: Check browser console for JavaScript errors

### 🔧 Performance Issues

#### Slow Loading
**Problem**: Application takes long to load

**Solution**:
```bash
# Analyze bundle size
npm run build
npx vite-bundle-analyzer dist

# Optimize images and assets
# Use lazy loading for components
```

#### Memory Leaks
**Problem**: Browser becomes slow over time

**Solution**:
1. **Check for Memory Leaks**:
   - Open Chrome DevTools → Memory tab
   - Take heap snapshots
   - Look for growing objects

2. **Common Causes**:
   - Event listeners not cleaned up
   - Timers not cleared
   - Large arrays in state

3. **Fix Example**:
   ```typescript
   useEffect(() => {
     const interval = setInterval(() => {
       // Some periodic task
     }, 1000);

     return () => clearInterval(interval); // Cleanup
   }, []);
   ```

### 🚀 Production Deployment Issues

#### Build Size Too Large
**Problem**: Bundle size is too big

**Solution**:
```bash
# Analyze bundle
npm run build
npx vite-bundle-analyzer dist

# Enable tree shaking
# Remove unused dependencies
# Use dynamic imports for large components
```

#### Server Configuration Issues
**Problem**: 404 errors on page refresh

**Solution** (Nginx):
```nginx
location / {
    try_files $uri $uri/ /index.html;
}
```

**Solution** (Apache):
```apache
<IfModule mod_rewrite.c>
    RewriteEngine On
    RewriteBase /
    RewriteRule ^index\.html$ - [L]
    RewriteCond %{REQUEST_FILENAME} !-f
    RewriteCond %{REQUEST_FILENAME} !-d
    RewriteRule . /index.html [L]
</IfModule>
```

### 🔍 Debugging Tips

#### Enable Debug Mode
```bash
# Set environment variable
export DEBUG=true
npm run dev

# Or in .env file
DEBUG=true
VITE_LOG_LEVEL=debug
```

#### Browser DevTools
1. **Console Tab**: Check for JavaScript errors
2. **Network Tab**: Monitor API calls and asset loading
3. **Sources Tab**: Set breakpoints for debugging
4. **Application Tab**: Check localStorage and sessionStorage

#### Logging
```typescript
// Add debug logging
console.log('Component rendered:', { props, state });
console.error('Error occurred:', error);
console.warn('Warning:', warning);
```

### 📱 Mobile/Responsive Issues

#### Layout Broken on Mobile
**Problem**: UI doesn't work on mobile devices

**Solution**:
1. **Check Viewport Meta Tag**:
   ```html
   <meta name="viewport" content="width=device-width, initial-scale=1.0">
   ```

2. **Test Responsive Design**:
   - Use Chrome DevTools device emulation
   - Test on actual devices

3. **Fix Tailwind Classes**:
   ```jsx
   // Use responsive classes
   <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
   ```

### 🆘 Getting Help

#### Check Logs
```bash
# Development server logs
npm run dev

# Browser console (F12)
# Network tab for failed requests
# Console tab for JavaScript errors
```

#### Useful Commands
```bash
# Check versions
node --version
npm --version

# Clear all caches
npm cache clean --force
rm -rf node_modules/.vite
rm -rf dist

# Reinstall everything
rm -rf node_modules package-lock.json
npm install
```

#### Community Resources
- **Stack Overflow**: Search for specific error messages
- **GitHub Issues**: Check Vite, React, or Tailwind repositories
- **Documentation**: 
  - [Vite Docs](https://vitejs.dev/)
  - [React Docs](https://react.dev/)
  - [Tailwind CSS Docs](https://tailwindcss.com/)

### 🔧 Emergency Reset
If everything breaks and you need to start fresh:

```bash
# Nuclear option - reset everything
rm -rf node_modules
rm -rf .vite
rm -rf dist
rm package-lock.json

# Reinstall
npm install

# Start fresh
npm run dev
```

---

## Still Having Issues?

1. **Check the error message carefully** - it usually tells you what's wrong
2. **Search online** - copy the exact error message into Google
3. **Check browser console** - most issues show up there
4. **Try the nuclear reset** - when all else fails, start fresh

Remember: Most issues are common and have been solved before. Don't panic! 🚀