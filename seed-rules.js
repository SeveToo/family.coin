
import { db } from './lib/firebase/config';
import { collection, addDoc, getDocs, query, limit } from 'firebase/firestore';

const seedRules = async () => {
  const rules = [
    { title: "Bądź miły", desc: "Zakaz wyzywania, przedrzeźniania i dokuczania.", fine: "1-5 FC" },
    { title: "Szczerość", desc: "Zgłaszaj zadania tylko wtedy, gdy faktycznie je wykonałeś.", fine: "Cofnięcie nagrody + 10 FC mandatu" },
    { title: "Zasady Sklepu", desc: "Nagrody ze sklepu realizujemy po uzgodnieniu z rodzicami.", fine: "-" },
    { title: "Czystość", desc: "Dbaj o porządek w pokoju i częściach wspólnych.", fine: "Konfiskata 2 FC" }
  ];

  try {
    const rulesCol = collection(db, 'rules');
    const existing = await getDocs(query(rulesCol, limit(1)));
    
    if (existing.empty) {
      console.log("Seeding rules...");
      for (const rule of rules) {
        await addDoc(rulesCol, { ...rule, createdAt: Date.now() });
      }
      console.log("Rules seeded successfully!");
    } else {
      console.log("Rules already exist in DB.");
    }
  } catch (e) {
    console.error("Error seeding rules:", e);
  }
};

seedRules();
