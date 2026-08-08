import { createClient } from "@supabase/supabase-js";
import { supabaseUrl, supabaseKey } from "../environment/constant";

export const supabase = createClient(
    supabaseUrl,
    supabaseKey
);