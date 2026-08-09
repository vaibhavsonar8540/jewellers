import { supabase } from "@/app/lib/db";

// Register user with email and password
export const signUpService = async ({ email, password, name }) => {
  try {
    const cleanEmail = email.trim();
    const cleanName = name ? name.trim() : cleanEmail.split("@")[0];

    const { data, error } = await supabase.auth.signUp({
      email: cleanEmail,
      password,
      options: {
        data: {
          name: cleanName,
          role: "user",
        },
      },
    });

    if (error) {
      console.error("Supabase SignUp Error:", error);
      return { data: null, error };
    }

    // Try to create/upsert user record in 'profiles' table if accessible
    if (data?.user) {
      try {
        await supabase.from("profiles").upsert([
          {
            id: data.user.id,
            name: cleanName,
            email: cleanEmail,
            role: "user",
          },
        ]);
      } catch (profileErr) {
        console.warn("Profile upsert warning:", profileErr);
      }
    }

    return { data, error: null };
  } catch (err) {
    console.error("signUpService unexpected error:", err);
    return { data: null, error: err };
  }
};

// Login user with email and password
export const signInService = async ({ email, password }) => {
  try {
    const cleanEmail = email.trim();
    const { data, error } = await supabase.auth.signInWithPassword({
      email: cleanEmail,
      password,
    });

    if (error) {
      console.error("Supabase SignIn Error:", error);
      return { data: null, error };
    }

    return { data, error: null };
  } catch (err) {
    console.error("signInService unexpected error:", err);
    return { data: null, error: err };
  }
};

// Logout user
export const signOutService = async () => {
  try {
    const { error } = await supabase.auth.signOut();
    if (error) {
      console.error("Supabase SignOut Error:", error);
      return { success: false, error };
    }
    return { success: true, error: null };
  } catch (err) {
    console.error("signOutService unexpected error:", err);
    return { success: false, error: err };
  }
};

// Get current session and user
export const getCurrentSessionService = async () => {
  try {
    const { data: { session }, error: sessionError } = await supabase.auth.getSession();
    if (sessionError || !session) {
      return { user: null, session: null };
    }

    const { data: { user }, error: userError } = await supabase.auth.getUser();
    if (userError || !user) {
      return { user: session.user, session };
    }

    return { user, session };
  } catch (err) {
    console.error("getCurrentSessionService Error:", err);
    return { user: null, session: null };
  }
};

// Listen to auth state changes
export const onAuthStateChangeService = (callback) => {
  return supabase.auth.onAuthStateChange(callback);
};
