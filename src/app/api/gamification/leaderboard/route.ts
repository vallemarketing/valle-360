import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

export async function GET(request: NextRequest) {
  try {
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
        employees!inner(full_name, area)
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
      area: item.employees?.area || 'Unknown',
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


