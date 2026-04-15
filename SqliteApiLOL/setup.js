const fs = require('fs');
const { execSync } = require('child_process');

console.log('🎮 Setting up Game API Server with SQLite3...\n');

const packageJson = {
  "name": "game-api-sqlite",
  "version": "1.0.0",
  "description": "Game API Server with SQLite3 database",
  "main": "game-sqlite.js",
  "scripts": {
    "start": "node game-sqlite.js",
    "dev": "nodemon game-sqlite.js"
  },
  "dependencies": {
    "express": "^4.18.2",
    "sqlite3": "^5.1.6",
    "body-parser": "^1.20.2"
  },
  "devDependencies": {
    "nodemon": "^3.0.1"
  },
  "engines": {
    "node": ">=14.0.0"
  },
  "keywords": ["game", "api", "sqlite", "express", "leaderboard"],
  "author": "",
  "license": "MIT"
};

try {
  // Create package.json if it doesn't exist or update it
  if (!fs.existsSync('package.json')) {
    fs.writeFileSync('package.json', JSON.stringify(packageJson, null, 2));
    console.log('✅ Created package.json');
  } else {
    console.log('📝 package.json already exists');
  }

  // Install dependencies
  console.log('📦 Installing dependencies...');
  execSync('npm install', { stdio: 'inherit' });
  
  console.log('\n🎉 Setup complete!\n');
  console.log('To start the server:');
  console.log('  npm start           # Production mode');
  console.log('  npm run dev         # Development mode with auto-reload\n');
  console.log('Server will be available at: http://127.0.0.1:8080');
  console.log('SQLite database will be created as: game.db\n');

} catch (error) {
  console.error('❌ Setup failed:', error.message);
  process.exit(1);
}