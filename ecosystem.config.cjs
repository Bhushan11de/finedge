module.exports = {
  apps: [
    {
      name: 'finedge-backend',
      cwd: './backend',
      script: 'src/server.js',
      watch: true,
      env: {
        NODE_ENV: 'development',
        PORT: 5000
      }
    },
    {
      name: 'finedge-frontend',
      script: 'npm',
      args: 'run dev',
      cwd: './',
      env: {
        NODE_ENV: 'development'
      }
    }
  ]
}; 