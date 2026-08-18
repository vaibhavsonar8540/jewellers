import { supabase } from "@/lib/db";

/**
 * Action Service handling all Supabase Authentication and Profile operations.
 */
export const authService = {
  /**
   * Log in user with email and password, returning user session and profile data.
   */
  async login({ email, password }) {
    if (!supabase) {
      throw new Error("Supabase client is not initialized.");
    }

    const cleanEmail = email.trim().toLowerCase();
    const { data, error } = await supabase.auth.signInWithPassword({
      email: cleanEmail,
      password,
    });

    if (error) {
      throw new Error(error.message || "Invalid email or password.");
    }

    // Fetch matching profile details
    let profile = null;
    if (data?.user?.id) {
      const { data: profData } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", data.user.id)
        .single();
      profile = profData;
    }

    return {
      user: data.user,
      session: data.session,
      profile: profile || {
        id: data.user.id,
        email: data.user.email,
        name: data.user.user_metadata?.name || "",
        role: "user",
      },
    };
  },

  /**
   * Register a new user with name, email, phone, and password.
   */
  async register({ name, email, phone, password }) {
    if (!supabase) {
      throw new Error("Supabase client is not initialized.");
    }

    const cleanName = name.trim();
    const cleanEmail = email.trim().toLowerCase();
    const cleanPhone = phone ? phone.trim() : "";

    const { data, error } = await supabase.auth.signUp({
      email: cleanEmail,
      password,
      options: {
        data: {
          name: cleanName,
          phone: cleanPhone,
        },
      },
    });

    if (error) {
      throw new Error(error.message || "Registration failed. Please try again.");
    }

    // Check if user account already exists (identities empty in Supabase when email exists)
    if (data?.user?.identities && data.user.identities.length === 0) {
      throw new Error("An account with this email address already exists.");
    }

    // Insert or update profiles table
    let profile = null;
    if (data?.user?.id) {
      const { data: profData, error: profileErr } = await supabase
        .from("profiles")
        .upsert(
          [
            {
              id: data.user.id,
              name: cleanName,
              email: cleanEmail,
              role: "user",
            },
          ],
          { onConflict: "id" }
        )
        .select()
        .single();

      if (profileErr) {
        console.warn("Profiles table sync warning:", profileErr.message);
      }
      profile = profData;
    }

    return {
      user: data.user,
      session: data.session,
      profile: profile || {
        id: data?.user?.id,
        email: cleanEmail,
        name: cleanName,
        role: "user",
      },
    };
  },

  /**
   * Log out current user session.
   */
  async logout() {
    if (supabase) {
      const { error } = await supabase.auth.signOut();
      if (error) throw new Error(error.message);
    }
  },

  /**
   * Get current authenticated user session and profile on app load.
   */
  async getCurrentAuthUser() {
    if (!supabase) return null;

    const { data: authData } = await supabase.auth.getUser();
    if (!authData?.user) return null;

    const { data: profile } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", authData.user.id)
      .single();

    return {
      user: authData.user,
      profile: profile || {
        id: authData.user.id,
        email: authData.user.email,
        name: authData.user.user_metadata?.name || "",
        role: "user",
      },
    };
  },

  /**
   * Request password reset for email.
   */
  async resetPassword(email) {
    if (!supabase) return;
    const cleanEmail = email.trim().toLowerCase();
    const { error } = await supabase.auth.resetPasswordForEmail(cleanEmail);
    if (error) throw new Error(error.message);
  },
};
