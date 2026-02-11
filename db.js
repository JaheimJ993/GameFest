import { createClient } from '@supabase/supabase-js'
const supabaseUrl = 'https://rggseufrcrdcxhuqolye.supabase.co'
const supabaseKey = 'sb_secret_n3lJuK2SoXb_3qvswGbJow_bkyruRkS'


const supabase = createClient(supabaseUrl, supabaseKey)

export default supabase;