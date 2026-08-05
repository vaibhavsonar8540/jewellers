import { supabase } from "../../../../shared/utils/db";

export const LoggedInService = async ({ email, password }) => {
  try {
    const res = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    console.log(res, "service login");
    return res;
  } catch (error) {
    console.log("LoggedInService error:", error);
    throw error;
  }
};

export const signUpService = async ({ email, password }) => {
  try {
    const res = await supabase.auth.signUp({
      email,
      password,
    });
    console.log(res, "service signup");
    return res;
  } catch (error) {
    console.log("signUpService error:", error);
    throw error;
  }
};