import React, { useEffect, useState, useRef } from 'react'
import { createContext } from 'react'
import { useNavigate } from 'react-router-dom';
import { supabase } from '../supabaseClient';
// import { Api } from '../utils/Api.js';

export const UserContext = createContext();
const AuthContext = ({children}) => {
    const [user,setUser] = useState(null);
    const [loading,setLoading] = useState(true);
    const [isLog,setIsLog]=useState(false)
    const [session, setSession] = useState(null);
    const isChecking = useRef(false);

    useEffect(()=>{
        let mounted = true;

        const safeFetch = async (table, userId) => {
            try {
                const { data, error } = await supabase.from(table).select('*').eq('auth_id', userId).maybeSingle();
                if (error && error.code !== '42501') console.warn(`AuthContext: Error fetching from ${table}:`, error);
                return data;
            } catch (e) {
                console.warn(`AuthContext: Exception fetching from ${table}:`, e);
                return null;
            }
        }

        const fetchProfile = async (userId) => {
             const [customer, admin, staff] = await Promise.all([
                safeFetch('customers', userId),
                safeFetch('admins', userId),
                safeFetch('staff', userId)
            ]);
            return customer || admin || staff;
        }

        // 1. Setup Auth Listener (Reactive Source of Truth)
        const { data: { subscription } } = supabase.auth.onAuthStateChange((event, newSession) => {
            if (!mounted) return;
            console.log("Auth Event:", event);
            
            if (event === 'SIGNED_OUT') {
                // Check if manual staff login exists before clearing
                const storedStaff = localStorage.getItem('staff_user');
                if (!storedStaff) {
                    setSession(null);
                    setUser(null);
                    setIsLog(false);
                }
            } else {
                setSession(newSession);
            }
        });

        // 2. Initial Session Check
        const initSession = async () => {
            try {
                const { data: { session: initialSession }, error } = await supabase.auth.getSession();
                if (!error && mounted) {
                    setSession(initialSession);
                }
            } catch (err) {
                console.error("Init session error:", err);
            }
        };
        initSession();

        return () => {
            mounted = false;
            subscription.unsubscribe();
        };
    }, []);

    // 3. Reactive Profile Fetcher (Responds to Session Changes)
    useEffect(() => {
        let mounted = true;

        const resolveUser = async () => {
            if (session?.user) {
                setIsLog(true);
                // Fetch profile
                try {
                    // Only fetch if we don't have a user or it's a different user
                    if (!user || user.auth_id !== session.user.id) {
                         const profile = await fetchProfile(session.user.id);
                         if (mounted) {
                            if (profile) {
                                setUser({ ...profile, _id: profile.id });
                            } else {
                                // Fallback
                                setUser({
                                    id: 'temp-' + session.user.id,
                                    auth_id: session.user.id,
                                    fullname: session.user.email?.split('@')[0] || 'User',
                                    email: session.user.email,
                                    role: 'Customer',
                                    contact: ''
                                });
                            }
                         }
                    }
                } catch (err) {
                    console.error("Profile resolve error:", err);
                    if (mounted && !user) {
                         setUser({
                             id: 'temp-' + session.user.id,
                             auth_id: session.user.id,
                             fullname: session.user.email?.split('@')[0] || 'User',
                             email: session.user.email,
                             role: 'Customer',
                             contact: ''
                         });
                    }
                }
            } else {
                // No Supabase session, check for Manual Staff Login
                const storedStaff = localStorage.getItem('staff_user');
                if (storedStaff) {
                    try {
                        const staffUser = JSON.parse(storedStaff);
                        setUser(staffUser);
                        setIsLog(true);
                    } catch (e) {
                        localStorage.removeItem('staff_user');
                        setUser(null);
                        setIsLog(false);
                    }
                } else {
                    setUser(null);
                    setIsLog(false);
                }
            }
            
            if (mounted) setLoading(false);
        };

        resolveUser();

        return () => { mounted = false; };
    }, [session]); // Re-run whenever session changes

    // Helper functions need to be defined outside or inside useEffect to be accessible
    const safeFetch = async (table, userId) => {
        try {
            const { data, error } = await supabase.from(table).select('*').eq('auth_id', userId).maybeSingle();
            if (error && error.code !== '42501') console.warn(`AuthContext: Error fetching from ${table}:`, error);
            return data;
        } catch (e) {
            return null;
        }
    }

    const fetchProfile = async (userId) => {
            const [customer, admin, staff] = await Promise.all([
            safeFetch('customers', userId),
            safeFetch('admins', userId),
            safeFetch('staff', userId)
        ]);
        return customer || admin || staff;
    }

    console.log('AuthContext user state:', user)
  return(
    <UserContext.Provider value={{user,setUser,loading,setLoading,isLog,setIsLog}}>
        {children}
    </UserContext.Provider>
  )
}

export default AuthContext