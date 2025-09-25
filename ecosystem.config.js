module.exports = {
  apps: [
    {
      name: "project-canis",
      script: "dist/index.js",
      instances: 1,
      exec_mode: "fork",
      node_args: "--max-old-space-size=2048",
      env_file: ".env",
      env: {
        NODE_ENV: "production",
      },
      max_memory_restart: "2560M",
      watch: false,
      autorestart: true,
    },
  ],
};
