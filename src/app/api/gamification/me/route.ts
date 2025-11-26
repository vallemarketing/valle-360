import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'
import { getLevelInfo } from '@/lib/gamification/levels'

export async function GET(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization')
    if (!authHeader) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const token = authHeader.replace('Bearer ', '')
    const { data: { user }, error: authError } = await supabase.auth.getUser(token)

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get gamification data
    const { data: gamificationData, error: gamError } = await supabase
      .from('employee_gamification')
      .select('*')
      .eq('employee_id', user.id)
      .single()

    if (gamError) {
      // If no gamification data exists, return defaults
      return NextResponse.json({
        points: 0,
        level: 1,
        productivity_score: 0,
        quality_score: 0,
        collaboration_score: 0,
        wellbeing_score: 0,
        badges: [],
        rank: null
      })
    }

    // Calculate level info
    const levelInfo = getLevelInfo(gamificationData.productivity_score || 0)

    // Get earned badges (TODO: implement)
    const badges = []

    // Get rank (TODO: implement with proper query)
    const rank = null

    return NextResponse.json({
      points: gamificationData.productivity_score || 0,
      level: levelInfo.level,
      tier: levelInfo.tier,
      productivity_score: gamificationData.productivity_score || 0,
      quality_score: gamificationData.quality_score || 0,
      collaboration_score: gamificationData.collaboration_score || 0,
      wellbeing_score: gamificationData.wellbeing_score || 0,
      badges,
      rank,
      levelInfo
    })
  } catch (error) {
    console.error('Error fetching gamification data:', error)
    return NextResponse.json(
      { error: 'Failed to fetch gamification data' },
      { status: 500 }
    )
  }
}


