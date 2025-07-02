module.exports = {
  apps: [{
    name: 'printmonitor-backend',
    script: 'server/server.js',
    cwd: '/var/www/printmonitor',
    instances: 1,
    exec_mode: 'fork',
    env: {
      NODE_ENV: 'production',
      PORT: 3000
    },
    env_production: {
      NODE_ENV: 'production',
      PORT: 3000
    },
    error_file: '/var/log/printmonitor/err.log',
    out_file: '/var/log/printmonitor/out.log',
    log_file: '/var/log/printmonitor/combined.log',
    time: true,
    autorestart: true,
    watch: false,
    max_memory_restart: '1G',
    restart_delay: 4000,
    max_restarts: 10,
    min_uptime: '10s'
  }]
};