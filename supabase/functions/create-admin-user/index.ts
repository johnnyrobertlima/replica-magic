import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.0'

const supabaseUrl = Deno.env.get('SUPABASE_URL')!
const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!

const supabase = createClient(supabaseUrl, serviceRoleKey)

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Content-Type': 'application/json'
}

Deno.serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const { data: user, error: createUserError } = await supabase.auth.admin.createUser({
      email: 'admin@onipresenca.com.br',
      password: 'Admin@123456',
      email_confirm: true,
      user_metadata: { full_name: 'Admin' },
    })

    if (createUserError) {
      return new Response(
        JSON.stringify({ error: createUserError.message }), 
        { status: 400, headers: corsHeaders }
      )
    }

    return new Response(
      JSON.stringify({ user }), 
      { status: 200, headers: corsHeaders }
    )
  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message }), 
      { status: 500, headers: corsHeaders }
    )
  }
})