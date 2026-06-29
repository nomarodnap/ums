module.exports = {
  apps: [
    {
      name: "ums-app",
      script: "node_modules/next/dist/bin/next",
      args: "start",
      instances: 4, // ใช้ 1 instance เพื่อเลี่ยงปัญหา Memory
      exec_mode: "cluster", // กลับมาใช้ cluster mode ที่ทำงานเสถียรกว่าบน Windows
      autorestart: true,
      watch: false,
      max_memory_restart: "1G",
      env: {
        PORT: 3001,
        NODE_ENV: "production",
      },
    }
  ],
};
