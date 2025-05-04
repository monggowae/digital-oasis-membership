
// This file will be used to run the SQL scripts and set up the database
import { supabase } from './src/integrations/supabase/client.js';

async function runSetupSQL() {
  try {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .limit(1);

    if (error) {
      console.error('Error checking profiles table:', error);
      return;
    }

    // If we get here without error, the table exists
    console.log('Profiles table already exists');
  } catch (error) {
    console.error('Error running setup SQL:', error);
  }
}

runSetupSQL();
