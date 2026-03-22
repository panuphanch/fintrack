/**
 * PM2 Ecosystem Configuration for Financial Tracker
 * Static reference file - Ansible generates the actual config on the server
 */

module.exports = {
  apps: [
    {
      name: 'fintrack-api',
      script: './backend/dist/index.js',
      cwd: '/var/www/financial-tracker',
      instances: 1,
      exec_mode: 'fork',

      // Memory management (important for shared 1GB VPS)
      max_memory_restart: '200M',

      // Graceful shutdown
      kill_timeout: 5000,
      wait_ready: true,
      listen_timeout: 10000,

      // Logging
      error_file: '/home/deploy/logs/fintrack-api-error.log',
      out_file: '/home/deploy/logs/fintrack-api-out.log',
      log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
      merge_logs: true,

      // Auto-restart
      autorestart: true,
      max_restarts: 10,
      min_uptime: '10s',

      // Watch (disabled in production)
      watch: false,

      // Environment variables
      env_production: {
        NODE_ENV: 'production',
        PORT: 3001,
        HOST: '127.0.0.1'
      }
    }
  ]
};
