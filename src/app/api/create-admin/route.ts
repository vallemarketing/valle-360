import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function POST() {
  try {
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email: 'admin@valle360.com',
      password: 'Admin123!',
      options: {
        data: {
          role: 'super_admin',
          full_name: 'Super Admin Valle 360'
        }
      }
    });

    if (authError) {
      return NextResponse.json({ error: authError.message }, { status: 400 });
    }

    return NextResponse.json({
      success: true,
      message: 'Super Admin criado com sucesso!',
      credentials: {
        email: 'admin@valle360.com',
        password: 'Admin123!',
        loginUrl: '/admin/login'
      },
      user: authData.user
    });

  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
