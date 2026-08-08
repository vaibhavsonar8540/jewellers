import { supabase } from "@/app/lib/db";

// Register user with email and password
export const signUpService = async ({ email, password, name }) => {
    const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
            data: {
                name: name || email.split("@")[0],
            },
        },
    });

    if (error) {
        console.error("Supabase SignUp Error:", error);
        throw error;
    }

    // Also upsert profile record in 'profiles' table if it exists
    if (data?.user) {
        try {
            const { error: profileError } = await supabase.from("profiles").upsert([
                {
                    id: data.user.id,
                    name: name || email.split("@")[0],
                    email: email,
                },
            ]);
            if (profileError) {
                console.warn("Profile upsert warning:", profileError);
            }
        } catch (err) {
            console.warn("Profile upsert warning:", err);
        }
    }

    return { data, error };
};

// Login user with email and password
export const signInService = async ({ email, password }) => {
    const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
    });

    if (error) {
        console.error("Supabase SignIn Error:", error);
        throw error;
    }

    return { data, error };
};

// Logout user
export const signOutService = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) {
        console.error("Supabase SignOut Error:", error);
        throw error;
    }
    return { success: true };
};

// Get current session and user
export const getCurrentSessionService = async () => {
    const { data: { session }, error: sessionError } = await supabase.auth.getSession();
    if (sessionError) {
        console.error("Supabase GetSession Error:", sessionError);
        return { user: null, session: null };
    }

    if (!session) {
        return { user: null, session: null };
    }

    const { data: { user }, error: userError } = await supabase.auth.getUser();
    if (userError) {
        console.error("Supabase GetUser Error:", userError);
        return { user: session.user, session };
    }

    return { user, session };
};
