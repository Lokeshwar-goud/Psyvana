// scripts/seedDatabase.ts

// We use 'require' instead of 'import' to solve the module error
const { initializeApp } = require('firebase/app');
const { getFirestore, collection, addDoc } = require('firebase/firestore');

// IMPORTANT: Make sure your actual firebaseConfig object is here
const firebaseConfig = {
  apiKey: "AIzaSyCROAizPupXFK7YCo7K1-cHX93K2wT40y8",
  authDomain: "psyvana-9ca9f.firebaseapp.com",
  projectId: "psyvana-9ca9f",
  storageBucket: "psyvana-9ca9f.firebasestorage.app",
  messagingSenderId: "696664212467",
  appId: "1:696664212467:web:47dc029892b8323ab60886",
  measurementId: "G-EV3XVFJW2W"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// --- All 9 questions for the PHQ-9 ---
const phq9Questions = [
    { text: "Over the last 2 weeks, how often have you been bothered by little interest or pleasure in doing things?", order: 1 },
    { text: "Feeling down, depressed, or hopeless?", order: 2 },
    { text: "Trouble falling or staying asleep, or sleeping too much?", order: 3 },
    { text: "Feeling tired or having little energy?", order: 4 },
    { text: "Poor appetite or overeating?", order: 5 },
    { text: "Feeling bad about yourself — or that you are a failure or have let yourself or your family down?", order: 6 },
    { text: "Trouble concentrating on things, such as reading the newspaper or watching television?", order: 7 },
    { text: "Moving or speaking so slowly that other people could have noticed? Or the opposite — being so fidgety or restless that you have been moving around a lot more than usual?", order: 8 },
    { text: "Thoughts that you would be better off dead, or of hurting yourself in some way?", order: 9 }
];

const phq9Options = [
    { text: "Not at all", value: 0 },
    { text: "Several days", value: 1 },
    { text: "More than half the days", value: 2 },
    { text: "Nearly every day", value: 3 }
];

async function seedDatabase() {
    console.log('Starting to seed database...');
    const questionsCollection = collection(db, 'questions');

    for (const question of phq9Questions) {
        try {
            await addDoc(questionsCollection, {
                questionnaireId: 'PHQ-9',
                order: question.order,
                text: question.text,
                options: phq9Options
            });
            console.log(`Successfully added question #${question.order}`);
        } catch (error) {
            console.error(`Error adding question #${question.order}:`, error);
        }
    }

    console.log('Database seeding complete!');
    process.exit(0); // This line ensures the script closes properly
}

seedDatabase();