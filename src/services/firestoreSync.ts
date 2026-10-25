import { 
  collection, 
  doc, 
  setDoc, 
  getDocs, 
  query, 
  orderBy, 
  limit 
} from 'firebase/firestore';
import { db } from '../lib/firebase';
import { Business, Product, Sale, Expense, Customer } from '../types';

export const firestoreSync = {
  async saveBusiness(business: Business): Promise<void> {
    try {
      const ref = doc(db, 'businesses', business.id);
      await setDoc(ref, business, { merge: true });
    } catch (err) {
      console.warn('Firestore business sync note:', err);
    }
  },

  async saveProduct(businessId: string, product: Product): Promise<void> {
    try {
      const ref = doc(db, 'businesses', businessId, 'products', product.id);
      await setDoc(ref, product, { merge: true });
    } catch (err) {
      console.warn('Firestore product sync note:', err);
    }
  },

  async saveSale(sale: Sale): Promise<void> {
    try {
      const ref = doc(db, 'businesses', sale.businessId, 'sales', sale.id);
      await setDoc(ref, sale, { merge: true });
    } catch (err) {
      console.warn('Firestore sale sync note:', err);
    }
  },

  async saveExpense(expense: Expense): Promise<void> {
    try {
      const ref = doc(db, 'businesses', expense.businessId, 'expenses', expense.id);
      await setDoc(ref, expense, { merge: true });
    } catch (err) {
      console.warn('Firestore expense sync note:', err);
    }
  },

  async saveCustomer(customer: Customer): Promise<void> {
    try {
      const ref = doc(db, 'businesses', customer.businessId, 'customers', customer.id);
      await setDoc(ref, customer, { merge: true });
    } catch (err) {
      console.warn('Firestore customer sync note:', err);
    }
  },

  async fetchSales(businessId: string): Promise<Sale[]> {
    try {
      const q = query(collection(db, 'businesses', businessId, 'sales'), orderBy('date', 'desc'), limit(50));
      const snapshot = await getDocs(q);
      return snapshot.docs.map(d => d.data() as Sale);
    } catch {
      return [];
    }
  }
};
