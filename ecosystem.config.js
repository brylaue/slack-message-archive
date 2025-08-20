module.exports = {
  apps: [{
    name: 'slack-message-viewer',
    script: 'server.js',
    instances: 1, // Single instance for starter plan
    exec_mode: 'fork',
    env: {
      NODE_ENV: 'development',
      PORT: 10000
    },
    env_production: {
      NODE_ENV: 'production',
      PORT: 10000
    },
    // Production optimizations
    max_memory_restart: '512M', // Stay within starter plan limits
    node_args: '--max-old-space-size=512',
    // Logging
    log_file: './logs/combined.log',
    out_file: './logs/out.log',
    error_file: './logs/error.log',
    log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
    // Process management
    min_uptime: '10s',
    max_restarts: 10,
    // Health checks
    health_check_grace_period: 3000,
    // Auto restart on file changes (development only)
    watch: false,
    ignore_watch: ['node_modules', 'logs', 'client/build']
  }]
};