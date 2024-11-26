import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    const { data: existingUser, error: getUserError } = await supabaseClient.auth.admin.listUsers()
    if (getUserError) throw getUserError

    // Check if admin user already exists
    const adminExists = existingUser.users.some(user => user.email === 'admin@onipresenca.com.br')
    if (adminExists) {
      return new Response(
        JSON.stringify({ message: 'Admin user already exists' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const { data, error } = await supabaseClient.auth.admin.createUser({
      email: 'admin@onipresenca.com.br',
      password: 'Admin@123456',
      email_confirm: true,
    })

    if (error) throw error

    return new Response(
      JSON.stringify({ message: 'Admin user created successfully', data }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
    )
  }
})