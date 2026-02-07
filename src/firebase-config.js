/**
 * Firebase Configuration for V-orra
 * 
 * IMPORTANT: Replace the placeholder values below with your actual Firebase config.
 * Get your config from: Firebase Console > Project Settings > Your apps > Web app
 */

import { initializeApp } from 'firebase/app';
import {
    getAuth,
    GoogleAuthProvider,
    signInWithPopup,
    signInWithEmailAndPassword,
    createUserWithEmailAndPassword,
    sendPasswordResetEmail,
    signOut,
    onAuthStateChanged
} from 'firebase/auth';
import {
    getFirestore,
    collection,
    addDoc,
    getDocs,
    getDoc,
    doc,
    updateDoc,
    deleteDoc,
    query,
    where,
    orderBy,
    serverTimestamp,
    onSnapshot
} from 'firebase/firestore';

// Firebase configuration - REPLACE WITH YOUR OWN CONFIG
const firebaseConfig = {
    apiKey: "AIzaSyBUyh8BZFduorxTEwzMDbkhJTYSoaI_7Jg",
    authDomain: "v-orra-web.firebaseapp.com",
    projectId: "v-orra-web",
    storageBucket: "v-orra-web.firebasestorage.app",
    messagingSenderId: "603902722823",
    appId: "1:603902722823:web:e6d49543ced72f62dffba2",
    measurementId: "G-7D3Q7EZEHR"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize services
export const auth = getAuth(app);
export const db = getFirestore(app);

// Auth providers
export const googleProvider = new GoogleAuthProvider();
googleProvider.setCustomParameters({
    prompt: 'select_account'
});

// ===== AUTHENTICATION FUNCTIONS =====

/**
 * Sign in with Google
 */
export async function signInWithGoogle() {
    try {
        const result = await signInWithPopup(auth, googleProvider);
        return { success: true, user: result.user };
    } catch (error) {
        console.error('Google sign-in error:', error);
        return { success: false, error: getErrorMessage(error.code) };
    }
}

/**
 * Sign in with email and password
 */
export async function signInWithEmail(email, password) {
    try {
        const result = await signInWithEmailAndPassword(auth, email, password);
        return { success: true, user: result.user };
    } catch (error) {
        console.error('Email sign-in error:', error);
        return { success: false, error: getErrorMessage(error.code) };
    }
}

/**
 * Create account with email and password
 */
export async function signUpWithEmail(email, password) {
    try {
        const result = await createUserWithEmailAndPassword(auth, email, password);
        return { success: true, user: result.user };
    } catch (error) {
        console.error('Sign-up error:', error);
        return { success: false, error: getErrorMessage(error.code) };
    }
}

/**
 * Send password reset email
 */
export async function resetPassword(email) {
    try {
        await sendPasswordResetEmail(auth, email);
        return { success: true };
    } catch (error) {
        console.error('Password reset error:', error);
        return { success: false, error: getErrorMessage(error.code) };
    }
}

/**
 * Sign out current user
 */
export async function logOut() {
    try {
        await signOut(auth);
        return { success: true };
    } catch (error) {
        console.error('Sign-out error:', error);
        return { success: false, error: error.message };
    }
}

/**
 * Subscribe to auth state changes
 */
export function onAuthChange(callback) {
    return onAuthStateChanged(auth, callback);
}

/**
 * Get current user
 */
export function getCurrentUser() {
    return auth.currentUser;
}

// ===== TICKET FUNCTIONS =====

const TICKETS_COLLECTION = 'tickets';

/**
 * Create a new ticket
 */
export async function createTicket(ticketData) {
    try {
        const user = getCurrentUser();
        if (!user) {
            return { success: false, error: 'You must be signed in to create a ticket.' };
        }

        const ticket = {
            ...ticketData,
            userId: user.uid,
            userEmail: user.email,
            userName: user.displayName || user.email.split('@')[0],
            status: 'open',
            createdAt: serverTimestamp(),
            updatedAt: serverTimestamp()
        };

        const docRef = await addDoc(collection(db, TICKETS_COLLECTION), ticket);
        return { success: true, ticketId: docRef.id };
    } catch (error) {
        console.error('Create ticket error:', error);
        return { success: false, error: error.message };
    }
}

/**
 * Get all tickets for current user
 */
export async function getUserTickets() {
    try {
        const user = getCurrentUser();
        if (!user) {
            return { success: false, error: 'You must be signed in.' };
        }

        const q = query(
            collection(db, TICKETS_COLLECTION),
            where('userId', '==', user.uid),
            orderBy('createdAt', 'desc')
        );

        const querySnapshot = await getDocs(q);
        const tickets = [];
        querySnapshot.forEach((doc) => {
            tickets.push({ id: doc.id, ...doc.data() });
        });

        return { success: true, tickets };
    } catch (error) {
        console.error('Get tickets error:', error);
        return { success: false, error: error.message };
    }
}

/**
 * Subscribe to real-time ticket updates
 */
export function subscribeToTickets(callback, errorCallback = null) {
    const user = getCurrentUser();
    if (!user) {
        console.log('No user logged in for ticket subscription');
        return () => { };
    }

    console.log('Subscribing to tickets for user:', user.uid);

    const q = query(
        collection(db, TICKETS_COLLECTION),
        where('userId', '==', user.uid),
        orderBy('createdAt', 'desc')
    );

    return onSnapshot(q,
        (snapshot) => {
            const tickets = [];
            snapshot.forEach((doc) => {
                tickets.push({ id: doc.id, ...doc.data() });
            });
            console.log('Tickets snapshot received:', tickets.length, 'tickets');
            callback(tickets);
        },
        (error) => {
            console.error('Error in ticket subscription:', error);
            if (errorCallback) errorCallback(error);
        }
    );
}

/**
 * Update ticket status
 */
export async function updateTicketStatus(ticketId, status) {
    try {
        const ticketRef = doc(db, TICKETS_COLLECTION, ticketId);
        await updateDoc(ticketRef, {
            status,
            updatedAt: serverTimestamp()
        });
        return { success: true };
    } catch (error) {
        console.error('Update ticket error:', error);
        return { success: false, error: error.message };
    }
}

/**
 * Get a single ticket by ID
 */
export async function getTicket(ticketId) {
    try {
        const user = getCurrentUser();
        if (!user) {
            return { success: false, error: 'You must be signed in.' };
        }

        const ticketRef = doc(db, TICKETS_COLLECTION, ticketId);
        const ticketSnap = await getDoc(ticketRef);

        if (!ticketSnap.exists()) {
            return { success: false, error: 'Ticket not found.' };
        }

        const ticketData = { id: ticketSnap.id, ...ticketSnap.data() };

        // Ensure user owns this ticket
        if (ticketData.userId !== user.uid) {
            return { success: false, error: 'Access denied.' };
        }

        return { success: true, ticket: ticketData };
    } catch (error) {
        console.error('Get ticket error:', error);
        return { success: false, error: error.message };
    }
}

/**
 * Add a message to a ticket
 */
export async function addTicketMessage(ticketId, messageText) {
    try {
        const user = getCurrentUser();
        if (!user) {
            return { success: false, error: 'You must be signed in.' };
        }

        const message = {
            text: messageText,
            senderId: user.uid,
            senderName: user.displayName || user.email.split('@')[0],
            senderEmail: user.email,
            isAdmin: false,
            createdAt: serverTimestamp()
        };

        const messagesRef = collection(db, TICKETS_COLLECTION, ticketId, 'messages');
        const docRef = await addDoc(messagesRef, message);

        // Update ticket updatedAt
        const ticketRef = doc(db, TICKETS_COLLECTION, ticketId);
        await updateDoc(ticketRef, {
            updatedAt: serverTimestamp()
        });

        return { success: true, messageId: docRef.id };
    } catch (error) {
        console.error('Add message error:', error);
        return { success: false, error: error.message };
    }
}

/**
 * Subscribe to real-time message updates for a ticket
 */
export function subscribeToTicketMessages(ticketId, callback) {
    const user = getCurrentUser();
    if (!user) return () => { };

    const q = query(
        collection(db, TICKETS_COLLECTION, ticketId, 'messages'),
        orderBy('createdAt', 'asc')
    );

    return onSnapshot(q, (snapshot) => {
        const messages = [];
        snapshot.forEach((doc) => {
            messages.push({ id: doc.id, ...doc.data() });
        });
        callback(messages);
    });
}

/**
 * Close a ticket
 */
export async function closeTicket(ticketId) {
    return updateTicketStatus(ticketId, 'closed');
}

/**
 * Reopen a ticket
 */
export async function reopenTicket(ticketId) {
    return updateTicketStatus(ticketId, 'open');
}

// ===== CONTACT FORM FUNCTIONS =====

const CONTACTS_COLLECTION = 'contacts';

/**
 * Submit contact form
 */
export async function submitContactForm(formData) {
    try {
        const contact = {
            ...formData,
            createdAt: serverTimestamp(),
            status: 'new'
        };

        const docRef = await addDoc(collection(db, CONTACTS_COLLECTION), contact);
        return { success: true, contactId: docRef.id };
    } catch (error) {
        console.error('Contact form error:', error);
        return { success: false, error: error.message };
    }
}

// ===== HELPER FUNCTIONS =====

/**
 * Get user-friendly error messages
 */
function getErrorMessage(errorCode) {
    const errorMessages = {
        'auth/email-already-in-use': 'This email is already registered. Try signing in instead.',
        'auth/invalid-email': 'Please enter a valid email address.',
        'auth/operation-not-allowed': 'This sign-in method is not enabled.',
        'auth/weak-password': 'Password should be at least 6 characters.',
        'auth/user-disabled': 'This account has been disabled.',
        'auth/user-not-found': 'No account found with this email.',
        'auth/wrong-password': 'Incorrect password. Please try again.',
        'auth/too-many-requests': 'Too many attempts. Please try again later.',
        'auth/popup-closed-by-user': 'Sign-in was cancelled.',
        'auth/network-request-failed': 'Network error. Please check your connection.',
        'auth/invalid-credential': 'Invalid credentials. Please try again.'
    };

    return errorMessages[errorCode] || 'An unexpected error occurred. Please try again.';
}

export default {
    auth,
    db,
    signInWithGoogle,
    signInWithEmail,
    signUpWithEmail,
    resetPassword,
    logOut,
    onAuthChange,
    getCurrentUser,
    createTicket,
    getUserTickets,
    subscribeToTickets,
    updateTicketStatus,
    getTicket,
    addTicketMessage,
    subscribeToTicketMessages,
    closeTicket,
    reopenTicket,
    submitContactForm
};
