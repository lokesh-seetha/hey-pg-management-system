const fs = require('fs');
const path = require('path');
const mongoose = require('mongoose');

// Path for local file-based database fallback
const JSON_DB_PATH = path.join(__dirname, '../db.json');

// Global database mode: 'mongodb' or 'json'
let dbMode = 'json';

// Initialize JSON database with default seed data if it doesn't exist
function initJsonDb() {
  if (!fs.existsSync(JSON_DB_PATH)) {
    const defaultData = {
      users: [
        {
          id: 'admin-id-1',
          username: 'admin',
          password: 'admin123', // Clean, plain-text for easy local testing/readability
          role: 'admin',
          name: 'Hostel Owner (Warden)'
        },
        {
          id: 'tenant-id-1',
          username: 'rahul',
          password: '123',
          role: 'tenant',
          name: 'Rahul Sharma',
          tenantId: 'tenant-id-1'
        }
      ],
      rooms: [
        { id: 'room-101', number: '101', type: 'Single Sharing', rent: 8000, capacity: 1, currentOccupancy: 1 },
        { id: 'room-102', number: '102', type: 'Double Sharing', rent: 6000, capacity: 2, currentOccupancy: 1 },
        { id: 'room-103', number: '103', type: 'Triple Sharing', rent: 4500, capacity: 3, currentOccupancy: 0 },
        { id: 'room-104', number: '104', type: 'Double Sharing', rent: 6000, capacity: 2, currentOccupancy: 2 }
      ],
      tenants: [
        {
          id: 'tenant-id-1',
          name: 'Rahul Sharma',
          phone: '9876543210',
          email: 'rahul@example.com',
          emergencyContact: '9876543211',
          roomId: 'room-101',
          roomNumber: '101',
          joinDate: '2026-05-10',
          rentPlan: 'Monthly',
          rentAmount: 8000,
          rentStatus: 'Unpaid', // Starts unpaid to demonstrate the red overdue banner
          dueDate: '2026-07-10',
          username: 'rahul',
          status: 'Active'
        },
        {
          id: 'tenant-id-2',
          name: 'Priya Patel',
          phone: '9123456780',
          email: 'priya@example.com',
          emergencyContact: '9123456781',
          roomId: 'room-102',
          roomNumber: '102',
          joinDate: '2026-06-01',
          rentPlan: '6-Months',
          rentAmount: 36000,
          rentStatus: 'Paid',
          dueDate: '2026-12-01',
          username: 'priya',
          status: 'Active'
        }
      ],
      payments: [
        {
          id: 'pay-1',
          tenantId: 'tenant-id-2',
          tenantName: 'Priya Patel',
          amount: 36000,
          date: '2026-06-01',
          mode: 'UPI',
          plan: '6-Months',
          transactionId: 'TXN891273912',
          monthYear: 'June 2026'
        }
      ],
      grievances: [
        {
          id: 'g-1',
          tenantId: 'tenant-id-1',
          tenantName: 'Rahul Sharma',
          roomNumber: '101',
          category: 'WiFi Down',
          description: 'WiFi signal is extremely weak in room 101, cannot connect to work.',
          status: 'Pending',
          createdAt: '2026-06-28T10:00:00.000Z'
        },
        {
          id: 'g-2',
          tenantId: 'tenant-id-2',
          tenantName: 'Priya Patel',
          roomNumber: '102',
          category: 'Washing Machine',
          description: 'First floor washing machine is not spinning.',
          status: 'In Progress',
          createdAt: '2026-06-27T14:30:00.000Z'
        }
      ],
      emergencyAlerts: [],
      menus: {
        Monday: { breakfast: 'Idli, Sambar, Chutney', lunch: 'Rice, Dal, Veg Fry, Curd', dinner: 'Roti, Paneer Masala, Rice, Dal' },
        Tuesday: { breakfast: 'Poha, Sev, Tea', lunch: 'Rajma, Rice, Salad, Pickle', dinner: 'Roti, Aloo Gobi, Rice, Kadhi' },
        Wednesday: { breakfast: 'Aloo Paratha, Curd', lunch: 'Rice, Sambhar, Papad, Poriyal', dinner: 'Roti, Egg Curry / Paneer Bhurji, Rice' },
        Thursday: { breakfast: 'Upma, Coconut Chutney', lunch: 'Kadi Chawal, Aloo Jeera', dinner: 'Roti, Mix Veg Sabzi, Rice, Dal' },
        Friday: { breakfast: 'Bread Toast, Omelette / Butter', lunch: 'Chole Bhature, Veg Pulao', dinner: 'Roti, Bhindi Masala, Rice, Dal' },
        Saturday: { breakfast: 'Puri Sabji, Halwa', lunch: 'Veg Biryani, Raita', dinner: 'Roti, Egg Bhurji / Veg Korma, Rice' },
        Sunday: { breakfast: 'Masala Dosa, Filter Coffee', lunch: 'Special Meals (Rice, Chicken Curry / Paneer Butter Masala, Sweet)', dinner: 'Roti, Dal Tadka, Rice' }
      },
      attendances: [
        { id: 'att-1', tenantId: 'tenant-id-1', tenantName: 'Rahul Sharma', roomNumber: '101', date: '2026-06-28', breakfast: true, lunch: false, dinner: true }, // Rahul is on leave for lunch
        { id: 'att-2', tenantId: 'tenant-id-2', tenantName: 'Priya Patel', roomNumber: '102', date: '2026-06-28', breakfast: true, lunch: true, dinner: true }
      ],
      feedbacks: [
        {
          id: 'fb-1',
          tenantName: 'Priya Patel',
          roomNumber: '102',
          foodRating: 4,
          wifiRating: 5,
          cleanlinessRating: 4,
          overallRating: 4,
          comments: 'The food is generally good, but sometimes spicy. WiFi speed is great.',
          submittedDate: '2026-06-25T12:00:00.000Z'
        }
      ]
    };
    fs.writeFileSync(JSON_DB_PATH, JSON.stringify(defaultData, null, 2), 'utf8');
    console.log('✅ Local JSON Database initialized with initial seed data at:', JSON_DB_PATH);
  }
}

// Read from JSON DB
function readJsonDb() {
  initJsonDb();
  try {
    const raw = fs.readFileSync(JSON_DB_PATH, 'utf8');
    return JSON.parse(raw);
  } catch (error) {
    console.error('Error reading JSON database, returning empty structure:', error);
    return {};
  }
}

// Write to JSON DB
function writeJsonDb(data) {
  try {
    fs.writeFileSync(JSON_DB_PATH, JSON.stringify(data, null, 2), 'utf8');
  } catch (error) {
    console.error('Error writing to JSON database:', error);
  }
}

// Connect to MongoDB if available, otherwise fallback
async function connectDB() {
  const mongoURI = process.env.MONGODB_URI;
  if (!mongoURI) {
    console.log('⚠️ No MONGODB_URI in environment variables. Falling back to local JSON database mode.');
    dbMode = 'json';
    initJsonDb();
    return;
  }

  try {
    await mongoose.connect(mongoURI, {
      serverSelectionTimeoutMS: 3000 // 3 seconds timeout
    });
    dbMode = 'mongodb';
    console.log('🚀 Successfully connected to MongoDB database!');
  } catch (error) {
    console.log('⚠️ Could not connect to MongoDB:', error.message);
    console.log('⚠️ Falling back to local JSON database (db.json) for development.');
    dbMode = 'json';
    initJsonDb();
  }
}

// Helper to create a unified data interface model
function makeModel(collectionName, mongooseSchema) {
  // If MongoDB is connected, return standard mongoose model
  const MongoModel = mongoose.models[collectionName] || mongoose.model(collectionName, mongooseSchema);

  // Return a wrapper that routes calls based on dbMode
  return {
    find: async (query = {}) => {
      if (dbMode === 'mongodb') {
        return await MongoModel.find(query);
      }
      const data = readJsonDb();
      let records = data[collectionName] || [];

      // Basic query matching
      return records.filter(item => {
        for (let key in query) {
          if (item[key] !== query[key]) return false;
        }
        return true;
      });
    },

    findOne: async (query = {}) => {
      if (dbMode === 'mongodb') {
        return await MongoModel.findOne(query);
      }
      const data = readJsonDb();
      let records = data[collectionName] || [];
      if (collectionName === 'menus') {
        // Special case: menus is just a single object in json mode
        return records;
      }
      return records.find(item => {
        for (let key in query) {
          if (item[key] !== query[key]) return false;
        }
        return true;
      }) || null;
    },

    findById: async (id) => {
      if (dbMode === 'mongodb') {
        return await MongoModel.findById(id);
      }
      const data = readJsonDb();
      let records = data[collectionName] || [];
      return records.find(item => item.id === id) || null;
    },

    create: async (docData) => {
      if (dbMode === 'mongodb') {
        return await MongoModel.create(docData);
      }
      const data = readJsonDb();
      if (!data[collectionName]) data[collectionName] = [];
      
      const newDoc = {
        id: Math.random().toString(36).substr(2, 9) + '-' + Date.now().toString(36),
        ...docData
      };
      
      data[collectionName].push(newDoc);
      writeJsonDb(data);
      return newDoc;
    },

    findByIdAndUpdate: async (id, updateData, options = {}) => {
      if (dbMode === 'mongodb') {
        return await MongoModel.findByIdAndUpdate(id, updateData, options);
      }
      const data = readJsonDb();
      let records = data[collectionName] || [];
      const idx = records.findIndex(item => item.id === id);
      if (idx !== -1) {
        records[idx] = { ...records[idx], ...updateData };
        writeJsonDb(data);
        return records[idx];
      }
      return null;
    },

    findOneAndUpdate: async (query, updateData, options = {}) => {
      if (dbMode === 'mongodb') {
        return await MongoModel.findOneAndUpdate(query, updateData, options);
      }
      const data = readJsonDb();
      if (collectionName === 'menus') {
        // Special update for menus
        data.menus = { ...data.menus, ...updateData };
        writeJsonDb(data);
        return data.menus;
      }
      let records = data[collectionName] || [];
      const idx = records.findIndex(item => {
        for (let key in query) {
          if (item[key] !== query[key]) return false;
        }
        return true;
      });
      if (idx !== -1) {
        records[idx] = { ...records[idx], ...updateData };
        writeJsonDb(data);
        return records[idx];
      } else if (options.upsert) {
        const newDoc = {
          id: Math.random().toString(36).substr(2, 9),
          ...query,
          ...updateData
        };
        records.push(newDoc);
        data[collectionName] = records;
        writeJsonDb(data);
        return newDoc;
      }
      return null;
    },

    findByIdAndDelete: async (id) => {
      if (dbMode === 'mongodb') {
        return await MongoModel.findByIdAndDelete(id);
      }
      const data = readJsonDb();
      let records = data[collectionName] || [];
      const filtered = records.filter(item => item.id !== id);
      data[collectionName] = filtered;
      writeJsonDb(data);
      return { success: true };
    },

    getDbMode: () => dbMode
  };
}

module.exports = {
  connectDB,
  makeModel,
  readJsonDb,
  writeJsonDb
};
