module.exports = {
  apps: [{
    name: 'twitch-yt',
    script: 'npm',
    args: 'start',
    cwd: '/var/www/twitch-yt',
    instances: 'max',
    exec_mode: 'cluster',
    env: {
      NODE_ENV: 'production',
      PORT: 3000
    },
    error_file: '/var/log/twitch-yt-error.log',
    out_file: '/var/log/twitch-yt-out.log',
    log_file: '/var/log/twitch-yt-combined.log',
    time: true
  }]
}