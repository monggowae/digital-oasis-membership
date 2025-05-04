
import { serve } from 'https://deno.land/std@0.177.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Handle CORS preflight request
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    // Create a Supabase client with the Admin key
    const supabaseClient = createClient(
      // Supabase API URL - env var exported by default
      Deno.env.get('SUPABASE_URL') ?? '',
      // Supabase API SERVICE ROLE KEY - env var exported by default
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    // Check if the handle_new_user function exists
    const { data: existingFunction, error: functionError } = await supabaseClient
      .rpc('has_function_exists', { function_name: 'handle_new_user' })

    if (functionError) {
      throw new Error(`Error checking for function: ${functionError.message}`)
    }

    if (!existingFunction) {
      // Create the function if it doesn't exist
      const { error: createFunctionError } = await supabaseClient.sql`
        CREATE OR REPLACE FUNCTION public.handle_new_user()
        RETURNS trigger
        LANGUAGE plpgsql
        SECURITY DEFINER
        AS $$
        BEGIN
          INSERT INTO public.profiles (id, name, phone_number, role, credits)
          VALUES (
            new.id, 
            new.raw_user_meta_data->>'name', 
            new.raw_user_meta_data->>'phone_number',
            'user',
            20
          );
          RETURN new;
        END;
        $$;
      `

      if (createFunctionError) {
        throw new Error(`Error creating function: ${createFunctionError.message}`)
      }
    }

    // Check if the trigger exists
    const { data: existingTrigger, error: triggerError } = await supabaseClient
      .rpc('has_trigger_exists', { trigger_name: 'on_auth_user_created' })

    if (triggerError) {
      throw new Error(`Error checking for trigger: ${triggerError.message}`)
    }

    if (!existingTrigger) {
      // Create the trigger if it doesn't exist
      const { error: createTriggerError } = await supabaseClient.sql`
        CREATE OR REPLACE TRIGGER on_auth_user_created
        AFTER INSERT ON auth.users
        FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
      `

      if (createTriggerError) {
        throw new Error(`Error creating trigger: ${createTriggerError.message}`)
      }
    }

    return new Response(
      JSON.stringify({
        success: true,
        message: 'Auth trigger has been set up successfully',
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    )
  } catch (error) {
    return new Response(
      JSON.stringify({
        success: false,
        message: error.message,
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      }
    )
  }
})
