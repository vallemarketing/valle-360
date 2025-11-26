import { NextRequest, NextResponse } from 'next/server'
import { getDailyIcebreaker } from '@/lib/val/icebreakers'
import { supabase } from '@/lib/supabase'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const area = searchParams.get('area') || 'Designer'

    // Get daily icebreaker
    const icebreaker = getDailyIcebreaker(area)

    // Try to get user's streak (optional, requires auth)
    let streak = 0
    try {
      const authHeader = request.headers.get('authorization')
      if (authHeader) {
        const token = authHeader.replace('Bearer ', '')
        const { data: { user } } = await supabase.auth.getUser(token)
        
        if (user) {
          // Count consecutive days of responses
          const { data: responses } = await supabase
            .from('val_icebreaker_responses')
            .select('created_at')
            .eq('user_id', user.id)
            .order('created_at', { ascending: false })
            .limit(30)

          if (responses && responses.length > 0) {
            let currentStreak = 1
            const today = new Date()
            today.setHours(0, 0, 0, 0)
            
            for (let i = 0; i < responses.length - 1; i++) {
              const current = new Date(responses[i].created_at)
              const next = new Date(responses[i + 1].created_at)
              current.setHours(0, 0, 0, 0)
              next.setHours(0, 0, 0, 0)
              
              const diffDays = Math.floor((current.getTime() - next.getTime()) / (1000 * 60 * 60 * 24))
              
              if (diffDays === 1) {
                currentStreak++
              } else {
                break
              }
            }
            
            streak = currentStreak
          }
        }
      }
    } catch (error) {
      // Ignore auth errors, just return without streak
      console.log('Could not fetch streak:', error)
    }

    return NextResponse.json({
      question: icebreaker.question,
      category: icebreaker.category,
      area,
      streak,
      date: new Date().toISOString()
    })
  } catch (error) {
    console.error('Error getting icebreaker:', error)
    return NextResponse.json(
      { error: 'Failed to get icebreaker' },
      { status: 500 }
    )
  }
}


