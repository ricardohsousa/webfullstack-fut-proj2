import dotenv from 'dotenv';
import connectDB from './src/config/db.js';
import User from './src/model/User.js';
import ChampionshipData from './src/model/ChampionshipData.js';

dotenv.config();
connectDB();

const users = [
  {
    username: 'admin',
    password: 'password123',
  },
  {
    username: 'user1',
    password: 'password123',
  },
];

const importData = async () => {
  try {
    await User.deleteMany();
    await ChampionshipData.deleteMany();

    for (const user of users) {
      await User.create(user);
    }

    console.log('Data Imported!');
    process.exit();
  } catch (error) {
    console.error(`${error}`);
    process.exit(1);
  }
};

const destroyData = async () => {
  try {
    await User.deleteMany();
    await ChampionshipData.deleteMany();

    console.log('Data Destroyed!');
    process.exit();
  } catch (error) {
    console.error(`${error}`);
    process.exit(1);
  }
};

if (process.argv[2] === '-d') {
  destroyData();
} else {
  importData();
}
