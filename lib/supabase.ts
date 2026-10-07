import { createClient } from "@supabase/supabase-js"

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

// Untyped client — our own types in database.types.ts are the source of truth.
// Using the typed createClient<Database>() causes conflicts with the Supabase
// generated type machinery when the DB schema hasn't been introspected by their CLI.
export const supabase = createClient(supabaseUrl, supabaseAnonKey)
