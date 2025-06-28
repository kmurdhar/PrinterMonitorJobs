# Quick Start Guide - Printer Monitoring System

## 🚀 Get Started in 5 Minutes

### Prerequisites
- Node.js 18+ installed
- Git (optional)
- 4GB RAM minimum

### 1. Setup Project
```bash
# If you have the project files
cd printer-monitoring-system

# Install dependencies
npm install
```

### 2. Start Development Server
```bash
npm run dev
```

### 3. Open Application
Open your browser and navigate to: `http://localhost:5173`

## 🎯 What You'll See

### Default Login
- **Username**: Admin User
- **Role**: System Administrator
- **Access**: Full system access

### Sample Data Included
- **5 Clients** with 3 printers each
- **Sample users** across different departments
- **Mock print jobs** for demonstration
- **Complete onboarding workflows**

## 📋 Available Commands

```bash
# Development
npm run dev          # Start development server
npm run build        # Build for production
npm run preview      # Preview production build
npm run lint         # Run ESLint

# Utilities
npm install          # Install dependencies
npm update           # Update dependencies
```

## 🔧 Quick Configuration

### Change Port (if 5173 is busy)
```bash
npm run dev -- --port 3000
```

### Environment Variables
Create `.env` file:
```env
VITE_APP_NAME=PrintMonitor
VITE_API_BASE_URL=http://localhost:3000/api
```

## 🏗️ Project Structure
```
printer-monitoring-system/
├── src/
│   ├── components/     # React components
│   ├── data/          # Mock data and client info
│   ├── types/         # TypeScript interfaces
│   └── App.tsx        # Main application
├── docs/              # Documentation
├── public/            # Static assets
└── package.json       # Dependencies
```

## 🎮 Try These Features

1. **Switch Clients**: Use the client selector dropdown
2. **Add Printer**: Go to Printers → Add Printer
3. **Add User**: Go to Users → Add User
4. **Onboard Client**: Go to Onboarding → Add New Client
5. **Configure Pricing**: Go to Pricing → Add Pricing Config

## 🆘 Need Help?

### Common Issues
- **Port in use**: Try `npm run dev -- --port 3001`
- **Dependencies error**: Run `npm install` again
- **Build fails**: Clear cache with `npm cache clean --force`

### Get Support
- Check `docs/INSTALLATION_GUIDE.md` for detailed setup
- Review `docs/TROUBLESHOOTING.md` for common problems
- Check the console for error messages

## 🚀 Next Steps

1. **Read Full Documentation**: Check `docs/` folder
2. **Customize**: Modify components in `src/components/`
3. **Deploy**: Follow `docs/DEPLOYMENT_GUIDE.md`
4. **Integrate**: Connect to real backend API

---

**Ready to build something amazing? Start coding! 🎉**