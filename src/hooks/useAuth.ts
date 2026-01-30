import { useState, useEffect } from 'react';
import { User, AuthResponse } from '../types';
import { API_URL } from '../utils/api';

export function useAuth() {
    const [user, setUser] = useState<User | null>(null);
    const [userRole, setUserRole] = useState<'admin' | 'user'>('user');
    const [authToken, setAuthToken] = useState<string | null>(() => localStorage.getItem('orderapp_token'));
    const [loading, setLoading] = useState(true);

    const refreshMe = async (): Promise<void> => {
        if (!authToken) return;
        try {
            const res = await fetch(`${API_URL}/auth/me`, {
                headers: { Authorization: `Bearer ${authToken}` }
            });
            if (res.ok) {
                const data = await res.json();
                setUser(data.user);
                setUserRole(data.user.role || 'user');
                return;
            }
            localStorage.removeItem('orderapp_token');
            setAuthToken(null);
            setUser(null);
            setUserRole('user');
            return;
        } catch (error) {
            console.error('Error checking session:', error);
            return;
        }
    };

    useEffect(() => {
        const loadSession = async () => {
            if (!authToken) {
                setLoading(false);
                return;
            }
            try {
                await refreshMe();
            } catch (error) {
                console.error('Error checking session:', error);
            } finally {
                setLoading(false);
            }
        };
        loadSession();
    }, [authToken]);

    const login = async (email: string, password: string): Promise<boolean> => {
        try {
            const response = await fetch(`${API_URL}/auth/login`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password })
            });

            const data = await response.json();
            if (!response.ok) {
                alert(data.error || 'Gagal login');
                return false;
            }

            setUser(data.user);
            setUserRole(data.user.role || 'user');
            setAuthToken(data.token);
            localStorage.setItem('orderapp_token', data.token);
            return true;
        } catch (error) {
            console.error('Login error:', error);
            alert('Gagal login. Silakan coba lagi.');
            return false;
        }
    };

    const signup = async (email: string, password: string, name: string): Promise<boolean> => {
        try {
            const response = await fetch(`${API_URL}/auth/signup`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ email, password, name })
            });

            const data = await response.json();

            if (!response.ok) {
                alert(data.error || 'Gagal membuat akun');
                return false;
            }

            setUser(data.user);
            setUserRole(data.user.role || 'user');
            setAuthToken(data.token);
            localStorage.setItem('orderapp_token', data.token);
            alert('Akun berhasil dibuat!');
            return true;
        } catch (error) {
            console.error('Signup error:', error);
            alert('Gagal membuat akun. Silakan coba lagi.');
            return false;
        }
    };

    const logout = async () => {
        if (authToken) {
            try {
                await fetch(`${API_URL}/auth/logout`, {
                    method: 'POST',
                    headers: { Authorization: `Bearer ${authToken}` }
                });
            } catch (error) {
                console.error('Logout error:', error);
            }
        }
        localStorage.removeItem('orderapp_token');
        setUser(null);
        setAuthToken(null);
        setUserRole('user');
    };

    return {
        user,
        userRole,
        authToken,
        loading,
        login,
        signup,
        logout,
        refreshMe
    };
}
