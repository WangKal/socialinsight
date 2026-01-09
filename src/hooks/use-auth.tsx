import { createContext, useContext, useEffect, useState } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/intergrations/supabase/client';

interface AuthContextType {
  user: User | null;
  session: Session | null;
  loading: boolean;
  signUp: (email: string, password: string, fullName?: string, title?: string) => Promise<{ error: any }>;
  signIn: (email: string, password: string) => Promise<{ error: any }>;
  signOut: () => Promise<{ error: any }>;
  forgotPassword: (email: string) => Promise<{ error: any }>;   // <-- add this
  resetPassword: (password: string) => Promise<{ error: any }>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Set up auth state listener FIRST
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        setSession(session);
        setUser(session?.user ?? null);
        setLoading(false);
      }
    );

    // THEN check for existing session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

const signUp = async (
  email: string,
  password: string,
  fullName?: string,
  company?: string
) => {
  const redirectUrl = `${window.location.origin}/`;

  // -------------------------
  // STEP 1: Create user (Auth)
  // -------------------------
  const { data: signUpData, error: signUpError } =
    await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: redirectUrl,
        data: {
          full_name: fullName || "",
          company: company || "",
        },
      },
    });

  if (signUpError) return { error: signUpError };

  const user = signUpData.user;
  if (!user) return { error: new Error("User creation failed") };

  // -------------------------
  // STEP 2: Create Profile Row
  // -------------------------
  try {
    const { error: profileError } = await supabase
      .from("profiles")
      .insert({
        user_id: user.id,
        full_name: fullName || "",
        company: company || "",
        phone_number: null,
        history:null,
        created_at: new Date().toISOString(),
      });

    if (profileError) throw profileError;
  } catch (err) {
    console.error("Profile creation failed:", err);
  }

  // -------------------------
  // STEP 3: Assign Free Credits
  // -------------------------
  try {
    const { data: settings, error: settingsError } = await supabase
      .from("settings")
      .select("free_credits_enabled, free_credit_amount")
      .single();

    if (settingsError) throw settingsError;

    const initialCredits = settings?.free_credits_enabled
      ? settings?.free_credit_amount || 0
      : 0;

    const { error: creditsError } = await supabase
      .from("credits")
      .insert({
        user_id: user.id,
        remaining_credits: initialCredits,
        total_credits: initialCredits,
        used_credits: 0,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      });

    if (creditsError) throw creditsError;
  } catch (err) {
    console.error("Credit initialization failed:", err);
  }

  return { error: null };
};



const signIn = async (email: string, password: string) => {
  try {
    const res = await fetch(
      "https://socialinsightbackend.onrender.com/api/auth_app/login/",
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
        credentials: "include",
      }
    );

    const data = await res.json();

    if (!res.ok) {
      return { error: data.error || "Login failed" };
    }

    const { supabase_session, jwt } = data;

    // Store internal JWT if needed
    localStorage.setItem("internal_jwt", jwt);

    // Set Supabase session
    const { error: sessionError } = await supabase.auth.setSession({
      access_token: supabase_session.access_token,
      refresh_token: supabase_session.refresh_token,
    });

    if (sessionError) return { error: sessionError };

    return { error: null };
  } catch (err) {
    return { error: err };
  }
};



const autoSignIn = async (internalJwt: string) => {
  try {
    // Step 1: Send internal JWT to backend to exchange for Supabase tokens
    const res = await fetch("https://socialinsightbackend.onrender.com/api/auth_app/get_temp_session/", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ jwt: internalJwt }),
    });

    const data = await res.json();

    if (!res.ok || !data.supabase_session) {
      console.error("Auto sign-in failed:", data);
      return { error: data.error || "Failed to retrieve Supabase session" };
    }

    const { access_token, refresh_token } = data.supabase_session;

    // Step 2: Set Supabase client session
    const { data: sessionData, error: sessionError } = await supabase.auth.setSession({
      access_token,
      refresh_token,
    });

    if (sessionError) {
      console.error("Setting Supabase session failed:", sessionError);
      return { error: sessionError };
    }

    // Step 3: Update frontend state
    setSession(sessionData.session ?? null);
    setUser(sessionData.session?.user ?? null);

    return { error: null };
  } catch (err) {
    console.error("Unexpected auto sign-in error:", err);
    return { error: err };
  }
};
const forgotPassword = async (email: string) => {
  const redirectUrl = `${window.location.origin}/reset-password`;

  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: redirectUrl,
  });

  return { error };
};
const resetPassword = async (password: string) => {
  
  const { result } = await supabase.auth.updateUser({ password });

  return { result };
};

const changePassword = async (
  email: string,
  oldPassword: string,
  newPassword: string
) => {
  // 1️⃣ Re-authenticate user using the old password
  const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
    email,
    password: oldPassword,
  });

  if (signInError) {
    return {
      error: new Error("Old password is incorrect."),
      success: false,
    };
  }

  // 2️⃣ Old password is correct → update to new password
  const { data: updateData, error: updateError } = await supabase.auth.updateUser({
    password: newPassword,
  });

  if (updateError) {
    return {
      error: updateError,
      success: false,
    };
  }

  return {
    success: true,
    error: null,
  };
};

  const signOut = async () => {
    const { error } = await supabase.auth.signOut();
    return { error };
  };

  const value = {
    user,
    session,
    loading,
    signUp,
    signIn,
    signOut,
    autoSignIn,
    forgotPassword,
    resetPassword,
    changePassword
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};