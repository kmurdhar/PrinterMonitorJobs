import React, { useState } from 'react';
import { Monitor, Smartphone, Download, CheckCircle, AlertTriangle, Info } from 'lucide-react';

interface PlatformSelectorProps {
  onPlatformSelect: (platforms: string[]) => void;
  selectedPlatforms: string[];
}

const PlatformSelector: React.FC<PlatformSelectorProps> = ({ onPlatformSelect, selectedPlatforms }) => {
  const [platforms, setPlatforms] = useState<string[]>(selectedPlatforms);

  const platformOptions = [
    {
      id: 'windows',
      name: 'Windows',
      icon: Monitor,
      description: 'Windows 10/11 desktops and servers',
      features: [
        'Full print spooler integration',
        'Detailed file information',
        'Color mode detection',
        'Original filename capture',
        'PowerShell-based service'
      ],
      limitations: [],
      recommended: true,
      color: 'blue'
    },
    {
      id: 'linux',
      name: 'Linux',
      icon: Monitor,
      description: 'Ubuntu, CentOS, RHEL, Debian distributions',
      features: [
        'CUPS log monitoring',
        'Systemd service integration',
        'Cross-distribution support',
        'Hostname-based tracking',
        'Python-based service'
      ],
      limitations: [
        'Limited filename detection',
        'Estimated page counts',
        'No color mode detection',
        'No file size information'
      ],
      recommended: false,
      color: 'green'
    },
    {
      id: 'macos',
      name: 'macOS',
      icon: Monitor,
      description: 'macOS systems (Coming Soon)',
      features: [
        'CUPS integration planned',
        'Native service support',
        'Full system integration'
      ],
      limitations: [
        'Not yet available',
        'Development in progress'
      ],
      recommended: false,
      color: 'gray',
      disabled: true
    }
  ];

  const handlePlatformToggle = (platformId: string) => {
    if (platformOptions.find(p => p.id === platformId)?.disabled) return;
    
    const newPlatforms = platforms.includes(platformId)
      ? platforms.filter(p => p !== platformId)
      : [...platforms, platformId];
    
    setPlatforms(newPlatforms);
    onPlatformSelect(newPlatforms);
  };

  const getColorClasses = (color: string, selected: boolean, disabled: boolean) => {
    if (disabled) {
      return {
        border: 'border-gray-200',
        bg: 'bg-gray-50',
        text: 'text-gray-400',
        icon: 'text-gray-300'
      };
    }
    
    if (selected) {
      return {
        border: `border-${color}-500`,
        bg: `bg-${color}-50`,
        text: `text-${color}-900`,
        icon: `text-${color}-600`
      };
    }
    
    return {
      border: 'border-gray-200',
      bg: 'bg-white',
      text: 'text-gray-900',
      icon: 'text-gray-600'
    };
  };

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h3 className="text-lg font-semibold text-gray-900 mb-2">
          Select Client Platforms
        </h3>
        <p className="text-gray-600">
          Choose which operating systems your client uses for printing
        </p>
      </div>

      {/* Platform Selection */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {platformOptions.map((platform) => {
          const Icon = platform.icon;
          const isSelected = platforms.includes(platform.id);
          const colors = getColorClasses(platform.color, isSelected, platform.disabled);
          
          return (
            <div
              key={platform.id}
              onClick={() => handlePlatformToggle(platform.id)}
              className={`relative p-6 border-2 rounded-xl cursor-pointer transition-all hover:shadow-md ${
                platform.disabled ? 'cursor-not-allowed' : ''
              } ${colors.border} ${colors.bg}`}
            >
              {/* Selection Indicator */}
              {isSelected && !platform.disabled && (
                <div className="absolute top-3 right-3">
                  <CheckCircle className="h-5 w-5 text-green-600" />
                </div>
              )}

              {/* Recommended Badge */}
              {platform.recommended && (
                <div className="absolute top-3 left-3">
                  <span className="bg-blue-100 text-blue-800 text-xs font-medium px-2 py-1 rounded-full">
                    Recommended
                  </span>
                </div>
              )}

              {/* Platform Icon and Name */}
              <div className="flex items-center space-x-3 mb-4 mt-2">
                <div className={`p-2 rounded-lg ${platform.disabled ? 'bg-gray-100' : `bg-${platform.color}-100`}`}>
                  <Icon className={`h-6 w-6 ${colors.icon}`} />
                </div>
                <div>
                  <h4 className={`text-lg font-semibold ${colors.text}`}>
                    {platform.name}
                  </h4>
                  <p className="text-sm text-gray-500">
                    {platform.description}
                  </p>
                </div>
              </div>

              {/* Features */}
              <div className="space-y-3">
                <div>
                  <h5 className="text-sm font-medium text-gray-900 mb-2">Features:</h5>
                  <ul className="space-y-1">
                    {platform.features.map((feature, index) => (
                      <li key={index} className="flex items-start space-x-2">
                        <CheckCircle className="h-3 w-3 text-green-500 mt-0.5 flex-shrink-0" />
                        <span className="text-xs text-gray-600">{feature}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Limitations */}
                {platform.limitations.length > 0 && (
                  <div>
                    <h5 className="text-sm font-medium text-gray-900 mb-2">Limitations:</h5>
                    <ul className="space-y-1">
                      {platform.limitations.map((limitation, index) => (
                        <li key={index} className="flex items-start space-x-2">
                          <AlertTriangle className="h-3 w-3 text-yellow-500 mt-0.5 flex-shrink-0" />
                          <span className="text-xs text-gray-600">{limitation}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>

              {/* Disabled Overlay */}
              {platform.disabled && (
                <div className="absolute inset-0 bg-gray-100 bg-opacity-50 rounded-xl flex items-center justify-center">
                  <span className="text-sm font-medium text-gray-500">Coming Soon</span>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Platform Information */}
      {platforms.length > 0 && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-start space-x-3">
            <Info className="h-5 w-5 text-blue-600 mt-0.5" />
            <div>
              <h4 className="text-sm font-medium text-blue-900">Selected Platforms</h4>
              <div className="text-sm text-blue-800 mt-1">
                <p className="mb-2">
                  You've selected <strong>{platforms.length}</strong> platform(s). 
                  Installation packages will be generated for:
                </p>
                <ul className="list-disc list-inside space-y-1">
                  {platforms.map(platformId => {
                    const platform = platformOptions.find(p => p.id === platformId);
                    return (
                      <li key={platformId}>
                        <strong>{platform?.name}</strong>: {platform?.description}
                      </li>
                    );
                  })}
                </ul>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Mixed Environment Notice */}
      {platforms.length > 1 && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <div className="flex items-start space-x-3">
            <CheckCircle className="h-5 w-5 text-green-600 mt-0.5" />
            <div>
              <h4 className="text-sm font-medium text-green-900">Mixed Environment Support</h4>
              <p className="text-sm text-green-800 mt-1">
                Great! PrintMonitor supports mixed environments. You'll receive installation 
                packages for each platform, and all data will be unified in a single dashboard 
                view for comprehensive monitoring across your entire organization.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Download Information */}
      {platforms.length > 0 && (
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
          <div className="flex items-start space-x-3">
            <Download className="h-5 w-5 text-gray-600 mt-0.5" />
            <div>
              <h4 className="text-sm font-medium text-gray-900">Installation Packages</h4>
              <p className="text-sm text-gray-600 mt-1">
                After completing the onboarding process, you'll receive:
              </p>
              <ul className="list-disc list-inside text-sm text-gray-600 mt-2 space-y-1">
                {platforms.includes('windows') && (
                  <li><strong>Windows Package</strong>: PowerShell installer with service configuration</li>
                )}
                {platforms.includes('linux') && (
                  <li><strong>Linux Package</strong>: Shell script installer with systemd service</li>
                )}
                {platforms.includes('macos') && (
                  <li><strong>macOS Package</strong>: Native installer with LaunchDaemon (Coming Soon)</li>
                )}
                <li><strong>Configuration Files</strong>: Pre-configured with your client credentials</li>
                <li><strong>Setup Documentation</strong>: Platform-specific installation guides</li>
              </ul>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PlatformSelector;