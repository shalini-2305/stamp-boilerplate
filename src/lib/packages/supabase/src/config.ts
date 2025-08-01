import { createClient } from "@supabase/supabase-js";

import { env } from "../env";

const supabaseUrl = env.SUPABASE_URL;
const supabaseSecret = env.SUPABASE_ANON_KEY;

export const supabase = createClient(supabaseUrl, supabaseSecret);
