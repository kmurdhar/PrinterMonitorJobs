# PrintMonitor - Enterprise Printer Monitoring System

A comprehensive, multi-client printer monitoring and management system built with React, TypeScript, and Tailwind CSS.

## 🚀 Quick Start

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Open http://localhost:5173
```

## ✨ Features

### 🏢 Multi-Client Management
- **Client Isolation**: Complete data separation between clients
- **Client Onboarding**: Streamlined wizard for new client setup
- **Subscription Management**: Basic, Premium, and Enterprise plans
- **Client Switching**: Easy navigation between client views

### 🖨️ Printer Monitoring
- **Real-time Status**: Online/offline monitoring with health indicators
- **Supply Tracking**: Paper and toner level monitoring with alerts
- **Location Management**: Organize printers by department and location
- **Performance Metrics**: Track jobs, pages, and usage statistics

### 👥 User Management
- **Role-based Access**: Admin, Manager, and User roles
- **Department Organization**: Group users by departments
- **Activity Tracking**: Monitor user printing behavior
- **Bulk Import**: CSV import for multiple users

### 📊 Analytics & Reporting
- **Usage Analytics**: Comprehensive printing statistics
- **Cost Tracking**: Monitor printing costs per client/department
- **Trend Analysis**: Historical data and usage patterns
- **Custom Reports**: Exportable data and insights

### 💰 Pricing Management
- **Flexible Pricing**: Configure rates per client
- **Volume Discounts**: Automatic discounts for high-volume printing
- **Department Multipliers**: Different rates per department
- **Paper Size Pricing**: Customizable rates for different paper sizes

### 🔧 System Features
- **Responsive Design**: Works on desktop, tablet, and mobile
- **Real-time Updates**: Live data synchronization
- **Export Capabilities**: CSV export for all data
- **Search & Filtering**: Advanced filtering across all modules

## 📋 System Requirements

- **Node.js**: 18.0 or higher
- **RAM**: 4GB minimum, 8GB recommended
- **Storage**: 2GB free space
- **Browser**: Modern browser with JavaScript enabled

## 🛠️ Installation

### Development Setup
```bash
# Clone the repository
git clone <repository-url>
cd printer-monitoring-system

# Install dependencies
npm install

# Start development server
npm run dev
```

### Production Deployment
```bash
# Build for production
npm run build

# Start with PM2
pm2 start ecosystem.config.js

# Or serve with any static file server
npm run preview
```

## 📖 Documentation

- **[Installation Guide](docs/INSTALLATION_GUIDE.md)** - Complete setup instructions
- **[Quick Start](docs/QUICK_START.md)** - Get running in 5 minutes
- **[Deployment Guide](docs/DEPLOYMENT_GUIDE.md)** - Production deployment
- **[API Documentation](docs/API_DOCUMENTATION.md)** - API reference
- **[Client Onboarding](docs/CLIENT_ONBOARDING_GUIDE.md)** - Client setup process
- **[Windows Listener Setup](docs/WINDOWS_LISTENER_SETUP.md)** - Print monitoring setup
- **[Troubleshooting](docs/TROUBLESHOOTING.md)** - Common issues and solutions

## 🏗️ Architecture

### Frontend Stack
- **React 18** - Modern React with hooks
- **TypeScript** - Type-safe development
- **Tailwind CSS** - Utility-first styling
- **Vite** - Fast build tool and dev server
- **Lucide React** - Beautiful icons

### Project Structure
```
src/
├── components/          # React components
│   ├── dashboard/      # Dashboard components
│   ├── jobs/           # Print job management
│   ├── printers/       # Printer management
│   ├── users/          # User management
│   ├── onboarding/     # Client onboarding
│   ├── pricing/        # Pricing configuration
│   ├── profile/        # User profile settings
│   └── layout/         # Layout components
├── data/               # Mock data and utilities
├── types/              # TypeScript type definitions
└── App.tsx             # Main application component
```

## 🎯 Key Components

### Dashboard
- **Client Statistics**: Real-time metrics per client
- **Overall Analytics**: System-wide statistics
- **Quick Actions**: Fast access to common tasks
- **Status Indicators**: System health monitoring

### Printer Management
- **Add/Edit/Delete**: Full CRUD operations
- **Status Monitoring**: Real-time printer status
- **Supply Alerts**: Low paper/toner notifications
- **Location Tracking**: Organize by department

### User Management
- **User Profiles**: Complete user information
- **Role Assignment**: Admin, Manager, User roles
- **Activity Tracking**: Print job history
- **Bulk Operations**: CSV import/export

### Client Onboarding
- **4-Step Wizard**: Streamlined client setup
- **API Key Generation**: Automatic credential creation
- **Configuration Export**: Setup guide generation
- **Progress Tracking**: Onboarding status monitoring

## 🔧 Available Scripts

```bash
# Development
npm run dev              # Start development server
npm run build            # Build for production
npm run preview          # Preview production build
npm run lint             # Run ESLint

# Utilities
npm run type-check       # TypeScript type checking
npm run clean            # Clean build artifacts
npm run fresh-install    # Clean install dependencies
```

## 🌐 Browser Support

- **Chrome**: 90+
- **Firefox**: 88+
- **Safari**: 14+
- **Edge**: 90+

## 📱 Mobile Support

Fully responsive design that works on:
- **Desktop**: 1920x1080 and higher
- **Tablet**: 768px - 1024px
- **Mobile**: 320px - 767px

## 🔒 Security Features

- **Client Isolation**: Complete data separation
- **Role-based Access**: Granular permissions
- **Input Validation**: XSS protection
- **Secure Headers**: CSRF protection
- **API Key Management**: Secure credential handling

## 🚀 Performance

- **Fast Loading**: Optimized bundle size
- **Lazy Loading**: Components loaded on demand
- **Efficient Rendering**: React optimization
- **Caching**: Browser and CDN caching
- **Compression**: Gzip/Brotli compression

## 🧪 Testing

```bash
# Run type checking
npm run type-check

# Run linting
npm run lint

# Manual testing checklist
- [ ] Client switching works
- [ ] CRUD operations function
- [ ] Responsive design
- [ ] Data persistence
- [ ] Error handling
```

## 🔄 Data Flow

1. **Client Selection**: Choose client from dropdown
2. **Data Filtering**: Filter all data by selected client
3. **CRUD Operations**: Add/edit/delete with state management
4. **Real-time Updates**: UI updates immediately
5. **Persistence**: Data maintained during session

## 🎨 Design System

### Colors
- **Primary**: Blue (#3B82F6)
- **Success**: Green (#10B981)
- **Warning**: Yellow (#F59E0B)
- **Error**: Red (#EF4444)
- **Gray Scale**: Tailwind gray palette

### Typography
- **Headings**: Inter font family
- **Body**: System font stack
- **Code**: Monospace fonts

### Spacing
- **Base Unit**: 4px (0.25rem)
- **Scale**: 4px, 8px, 12px, 16px, 24px, 32px, 48px, 64px

## 🤝 Contributing

1. **Fork** the repository
2. **Create** a feature branch
3. **Make** your changes
4. **Test** thoroughly
5. **Submit** a pull request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

- **Documentation**: Check the `docs/` folder
- **Issues**: Create a GitHub issue
- **Email**: support@printmonitor.com
- **Discord**: Join our community server

## 🗺️ Roadmap

### Version 1.1
- [ ] Real backend API integration
- [ ] Advanced analytics dashboard
- [ ] Email notifications
- [ ] Mobile app

### Version 1.2
- [ ] Multi-language support
- [ ] Advanced reporting
- [ ] API webhooks
- [ ] SSO integration

### Version 2.0
- [ ] Machine learning insights
- [ ] Predictive maintenance
- [ ] Advanced security features
- [ ] Enterprise integrations

---

**Built with ❤️ for enterprise printer management**

## 📊 Demo Data

The application includes comprehensive demo data:
- **5 Clients** with realistic company profiles
- **15 Printers** (3 per client) with various statuses
- **15 Users** across different departments and roles
- **Sample Print Jobs** with realistic usage patterns
- **Pricing Configurations** for different client tiers

## 🎮 Try It Out

1. **Start the application**: `npm run dev`
2. **Switch between clients**: Use the client selector
3. **Add a printer**: Go to Printers → Add Printer
4. **Onboard a client**: Go to Onboarding → Add New Client
5. **Configure pricing**: Go to Pricing → Add Pricing Config

Ready to revolutionize your printer management? Let's get started! 🚀