
import { Constituent, Task, TaskType, Festival } from '../types';
import { v4 as uuidv4 } from 'uuid';

// Key names for LocalStorage
const CONSTITUENTS_KEY = 'ac_connect_constituents';
const TASKS_KEY = 'ac_connect_tasks';
const SETTINGS_KEY = 'ac_connect_settings';
const FESTIVALS_KEY = 'ac_connect_festivals';

// Helpers for synthetic data
const FIRST_NAMES = ["Aarav", "Vivaan", "Aditya", "Vihaan", "Arjun", "Sai", "Reyansh", "Ayaan", "Krishna", "Ishaan", "Diya", "Saanvi", "Ananya", "Aadhya", "Pari", "Kiara", "Riya", "Myra", "Saira", "Amaya", "Rahul", "Priya", "Amit", "Sneha", "Vikram", "Neha", "Rohan", "Kavita"];
const LAST_NAMES = ["Sharma", "Verma", "Gupta", "Malhotra", "Singh", "Kumar", "Patel", "Reddy", "Nair", "Iyer", "Joshi", "Mehta", "Agarwal", "Rao", "Jain", "Chopra", "Deshmukh", "Yadav", "Mishra", "Choudhury", "Balabantaray", "Mohanty", "Das", "Sahoo"];
const STREETS = ["MG Road", "Station Road", "Civil Lines", "Sector 14", "Green Park", "Model Town", "Shastri Nagar", "Ashok Vihar", "Vasant Kunj"];
const BLOCKS = ["Bhubaneswar Block", "Jatni Block", "Khordha Block", "Begunia Block", "Bolagarh Block"];
const GPS = ["Madanpur GP", "Kantia GP", "Pohala GP", "Dadha GP", "Raghunathpur GP", "Kusumati GP", "Kalyanpur GP"];

const randomInt = (min: number, max: number) => Math.floor(Math.random() * (max - min + 1)) + min;
const randomItem = (arr: any[]) => arr[Math.floor(Math.random() * arr.length)];

const generateSyntheticData = (count: number): Constituent[] => {
    const data: Constituent[] = [];
    const today = new Date();
    
    for (let i = 0; i < count; i++) {
        const id = uuidv4();
        const firstName = randomItem(FIRST_NAMES);
        const lastName = randomItem(LAST_NAMES);
        const name = `${firstName} ${lastName}`;
        const ward = String(randomInt(1, 40));
        const address = `${randomInt(1, 150)}, ${randomItem(STREETS)}`;
        const mobile = `98${randomInt(10000000, 99999999)}`;
        const block = randomItem(BLOCKS);
        const gp = randomItem(GPS);
        
        // Date Generation Logic
        let dobDate: Date;
        let annDate: Date | undefined = undefined;

        // --- INTELLIGENT SEEDING ---
        if (i === 0 || i === 1) { 
            // Birthday TODAY
            dobDate = new Date(today);
            dobDate.setFullYear(randomInt(1970, 2000));
        } else if (i === 2 || i === 3) { 
            // Birthday TOMORROW
            dobDate = new Date(today);
            dobDate.setDate(today.getDate() + 1);
            dobDate.setFullYear(randomInt(1975, 2002));
        } else if (i === 4 || i === 5) {
            // Anniversary TODAY
            dobDate = new Date(1990, randomInt(0, 11), randomInt(1, 25)); 
            annDate = new Date(today);
            annDate.setFullYear(randomInt(2010, 2023));
        } else if (i === 6 || i === 7) {
            // Anniversary TOMORROW
            dobDate = new Date(1988, randomInt(0, 11), randomInt(1, 25)); 
            annDate = new Date(today);
            annDate.setDate(today.getDate() + 1);
            annDate.setFullYear(randomInt(2012, 2022));
        } else {
            // Random Data
            const dobMonth = randomInt(0, 11);
            const dobDay = randomInt(1, 28); 
            dobDate = new Date(randomInt(1960, 2005), dobMonth, dobDay);
            
            if (Math.random() > 0.4) {
                const annMonth = randomInt(0, 11);
                const annDay = randomInt(1, 28);
                annDate = new Date(randomInt(2000, 2023), annMonth, annDay);
            }
        }

        const dobString = `${dobDate.getFullYear()}-${String(dobDate.getMonth() + 1).padStart(2, '0')}-${String(dobDate.getDate()).padStart(2, '0')}`;
        
        let annString: string | undefined = undefined;
        if (annDate) {
            annString = `${annDate.getFullYear()}-${String(annDate.getMonth() + 1).padStart(2, '0')}-${String(annDate.getDate()).padStart(2, '0')}`;
        }

        data.push({
            id,
            name,
            mobile_number: mobile,
            dob: dobString,
            anniversary: annString,
            ward_number: ward,
            block: block,
            gp_ulb: gp,
            address: address,
            created_at: new Date().toISOString()
        });
    }
    return data;
};

export const DB = {
  // --- Constituents ---
  getConstituents: (): Constituent[] => {
    const data = localStorage.getItem(CONSTITUENTS_KEY);
    return data ? JSON.parse(data) : [];
  },

  addConstituents: (newConstituents: Omit<Constituent, 'id' | 'created_at'>[]) => {
    const current = DB.getConstituents();
    const toAdd = newConstituents.map(c => ({
      ...c,
      id: uuidv4(),
      created_at: new Date().toISOString()
    }));
    localStorage.setItem(CONSTITUENTS_KEY, JSON.stringify([...current, ...toAdd]));
    DB.runDailyScan(); 
  },
  
  seedSampleData: () => {
     const synthetic = generateSyntheticData(50);
     const current = DB.getConstituents();
     localStorage.setItem(CONSTITUENTS_KEY, JSON.stringify([...current, ...synthetic]));
     DB.runDailyScan();
     return synthetic.length;
  },

  // --- Tasks ---
  getTasks: (): Task[] => {
    const data = localStorage.getItem(TASKS_KEY);
    return data ? JSON.parse(data) : [];
  },

  getEnrichedTasks: (): any[] => {
    const tasks = DB.getTasks();
    const constituents = DB.getConstituents();
    
    return tasks.map(task => {
      const constituent = constituents.find(c => c.id === task.constituent_id);
      if (!constituent) return null;
      return { ...task, constituent };
    }).filter(Boolean);
  },

  updateTask: (taskId: string, updates: Partial<Task>) => {
    const tasks = DB.getTasks();
    const index = tasks.findIndex(t => t.id === taskId);
    if (index !== -1) {
      tasks[index] = { ...tasks[index], ...updates };
      localStorage.setItem(TASKS_KEY, JSON.stringify(tasks));
    }
  },

  // --- CMS / Festivals ---
  getFestivals: (): Festival[] => {
      const data = localStorage.getItem(FESTIVALS_KEY);
      if (data) {
          return JSON.parse(data);
      }
      // Seed default festivals if empty
      const defaultFestivals: Festival[] = [
          { id: '1', name: 'Dhanu Sankranti', date: '2024-12-16', description: 'Traditional Odia Festival' },
          { id: '2', name: 'New Year', date: '2025-01-01', description: 'New Year Celebrations' },
          { id: '3', name: 'Makar Sankranti', date: '2025-01-14', description: 'Harvest Festival' }
      ];
      localStorage.setItem(FESTIVALS_KEY, JSON.stringify(defaultFestivals));
      return defaultFestivals;
  },

  addFestival: (festival: Omit<Festival, 'id'>) => {
      const festivals = DB.getFestivals();
      const newFestival: Festival = {
          ...festival,
          id: uuidv4(),
          isCustom: true
      };
      // Sort by date after adding
      const updated = [...festivals, newFestival].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
      localStorage.setItem(FESTIVALS_KEY, JSON.stringify(updated));
  },

  // --- Settings (App Visuals) ---
  getSettings: () => {
      const data = localStorage.getItem(SETTINGS_KEY);
      return data ? JSON.parse(data) : { appName: 'AC Connect', leaderName: 'Pranab Kumar Balabantaray', headerImage: null };
  },

  saveSettings: (settings: { appName: string, leaderName: string, headerImage: string | null }): boolean => {
      try {
        localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
        return true;
      } catch (e) {
          console.error("Failed to save settings (likely quota exceeded):", e);
          return false;
      }
  },

  // --- System Brain (Logic) ---
  runDailyScan: (): { newTasks: number } => {
    const constituents = DB.getConstituents();
    const tasks = DB.getTasks();
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(today.getDate() + 1);

    const isMatch = (dateStr: string | undefined, targetDate: Date) => {
      if (!dateStr) return false;
      const d = new Date(dateStr);
      return d.getDate() === targetDate.getDate() && d.getMonth() === targetDate.getMonth();
    };

    let newCount = 0;

    constituents.forEach(c => {
      // 1. Check Birthday
      let bdayDueDate: string | null = null;
      if (isMatch(c.dob, today)) bdayDueDate = today.toISOString().split('T')[0];
      else if (isMatch(c.dob, tomorrow)) bdayDueDate = tomorrow.toISOString().split('T')[0];

      if (bdayDueDate) {
          const exists = tasks.some(t => t.constituent_id === c.id && t.type === 'BIRTHDAY' && t.due_date === bdayDueDate);
          if (!exists) {
              tasks.push({
                  id: uuidv4(),
                  constituent_id: c.id,
                  type: 'BIRTHDAY',
                  due_date: bdayDueDate,
                  status: 'PENDING',
                  created_at: new Date().toISOString()
              });
              newCount++;
          }
      }

      // 2. Check Anniversary
      let annDueDate: string | null = null;
      if (c.anniversary) {
          if (isMatch(c.anniversary, today)) annDueDate = today.toISOString().split('T')[0];
          else if (isMatch(c.anniversary, tomorrow)) annDueDate = tomorrow.toISOString().split('T')[0];
      }

      if (annDueDate) {
          const exists = tasks.some(t => t.constituent_id === c.id && t.type === 'ANNIVERSARY' && t.due_date === annDueDate);
          if (!exists) {
               tasks.push({
                  id: uuidv4(),
                  constituent_id: c.id,
                  type: 'ANNIVERSARY',
                  due_date: annDueDate,
                  status: 'PENDING',
                  created_at: new Date().toISOString()
              });
              newCount++;
          }
      }
    });

    localStorage.setItem(TASKS_KEY, JSON.stringify(tasks));
    return { newTasks: newCount };
  }
};

const seedData = () => {
  if (!localStorage.getItem(CONSTITUENTS_KEY)) {
    console.log("Seeding database with synthetic data...");
    const synthetic = generateSyntheticData(50);
    localStorage.setItem(CONSTITUENTS_KEY, JSON.stringify(synthetic));
    DB.runDailyScan();
  }
};

seedData();
