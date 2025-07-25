// Script untuk fetch 1 data sample dari Firestore collection 'orders' (atau 'store' jika ada)
import { db } from '../src/lib/firebase.js';
import { collection, getDocs, query, limit } from 'firebase/firestore';

async function fetchSample() {
  const q = query(collection(db, 'orders'), limit(1)); // ganti 'orders' ke 'store' jika memang koleksi bernama 'store'
  const snap = await getDocs(q);
  if (snap.empty) {
    console.log('No data found');
    return;
  }
  snap.forEach(doc => {
    console.log('Sample data:', doc.data());
  });
}

fetchSample();
