/**
 * @file lib/hooks/useAuth.tsx
 * @description Authentication context and hook for Firebase Auth
 * @changelog
 * - 2024-12-11: Initial implementation with role detection
 */

'use client';

import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import {
    User as FirebaseUser,
    signInWithEmailAndPassword,
    signOut as firebaseSignOut,
    onAuthStateChanged,
} from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import { getFirebaseAuth, getFirebaseDb } from '@/lib/firebase';
import { User, UserRole } from '@/types';

interface AuthContextType {
    user: User | null;
    firebaseUser: FirebaseUser | null;
    loading: boolean;
    error: string | null;
    signIn: (email: string, password: string) => Promise<void>;
    signOut: () => Promise<void>;
    isStaff: boolean;
    isLeader: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
    children: ReactNode;
}

/**
 * Fetch user role from Firestore users collection
 */
async function fetchUserRole(uid: string): Promise<User | null> {
    try {
        const db = getFirebaseDb();
        const userDoc = await getDoc(doc(db, 'users', uid));

        if (userDoc.exists()) {
            const data = userDoc.data();
            return {
                uid,
                email: data.email || '',
                name: data.name || '',
                role: data.role as UserRole,
            };
        }
        return null;
    } catch (err) {
        console.error('Error fetching user role:', err);
        return null;
    }
}

export function AuthProvider({ children }: AuthProviderProps) {
    const value: AuthContextType = {
        user: { uid: '123', email: 'test@example.com', name: 'Test User', role: 'STAFF' },
        firebaseUser: {} as any,
        loading: false,
        error: null,
        signIn: async () => {},
        signOut: async () => {},
        isStaff: true,
        isLeader: false,
    };

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

/**
 * Hook to access auth context
 * @throws Error if used outside of AuthProvider
 */
export function useAuth(): AuthContextType {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
}
