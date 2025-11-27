import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const cookieStore = cookies()
    const supabase = createServerClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        {
            cookies: {
                get(name: string) {
                    return cookieStore.get(name)?.value
                },
            },
        }
    )

    const { searchParams } = new URL(request.url)
    const limit = parseInt(searchParams.get('limit') || '10')
    const period = searchParams.get('period') || 'alltime' // alltime, month, week

    // Get leaderboard data
    const { data, error } = await supabase
      .from('employee_gamification')
      .select(`
        employee_id,
        productivity_score,
        quality_score,
        collaboration_score,
        wellbeing_score,
        level,
        employees!inner(full_name, area_of_expertise)
      `)
      .order('productivity_score', { ascending: false })
      .limit(limit)

    if (error) {
      console.error('Database error:', error)
      return NextResponse.json({ error: 'Failed to fetch leaderboard' }, { status: 500 })
    }

    // Transform data
    const leaderboard = data.map((item: any, index: number) => ({
      rank: index + 1,
      employee_id: item.employee_id,
      name: item.employees?.full_name || 'Unknown',
      area: item.employees?.area_of_expertise || 'Unknown',
      total_score: item.productivity_score,
      level: item.level,
      productivity: item.productivity_score,
      quality: item.quality_score,
      collaboration: item.collaboration_score,
      wellbeing: item.wellbeing_score
    }))

    return NextResponse.json({
      period,
      leaderboard,
      updated_at: new Date().toISOString()
    })
  } catch (error) {
    console.error('Error fetching leaderboard:', error)
    return NextResponse.json(
      { error: 'Failed to fetch leaderboard' },
      { status: 500 }
    )
  }
}
