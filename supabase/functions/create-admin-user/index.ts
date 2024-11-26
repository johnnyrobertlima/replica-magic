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

    // First check if admin user already exists
    const { data: existingUsers, error: getUserError } = await supabaseClient.auth.admin.listUsers()
    
    if (getUserError) {
      console.error('Error listing users:', getUserError)
      throw new Error(`Error listing users: ${getUserError.message}`)
    }

    const adminExists = existingUsers.users.some(user => user.email === 'admin@onipresenca.com.br')
    if (adminExists) {
      return new Response(
        JSON.stringify({ message: 'Admin user already exists' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Create admin user if it doesn't exist
    const { data: newUser, error: createError } = await supabaseClient.auth.admin.createUser({
      email: 'admin@onipresenca.com.br',
      password: 'Admin@123456',
      email_confirm: true,
      user_metadata: { role: 'admin' }
    })

    if (createError) {
      console.error('Error creating admin user:', createError)
      throw new Error(`Error creating admin user: ${createError.message}`)
    }

    // Update user role to admin
    const { error: updateError } = await supabaseClient.auth.admin.updateUserById(
      newUser.user.id,
      { app_metadata: { role: 'admin' } }
    )

    if (updateError) {
      console.error('Error updating user role:', updateError)
      throw new Error(`Error updating user role: ${updateError.message}`)
    }

    return new Response(
      JSON.stringify({ 
        message: 'Admin user created successfully',
        data: newUser
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )

  } catch (error) {
    console.error('Error in create-admin-user function:', error)
    return new Response(
      JSON.stringify({ 
        error: 'Database error creating new user',
        details: error.message || 'No additional details available'
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400
      }
    )
  }
})