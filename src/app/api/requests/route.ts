import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

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

    // Get user requests (employee_requests table - to be created)
    // For now, return mock data
    const requests = []

    return NextResponse.json({
      requests,
      total: requests.length
    })
  } catch (error) {
    console.error('Error fetching requests:', error)
    return NextResponse.json({ error: 'Failed to fetch requests' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
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

    const body = await request.json()
    const { type, start_date, end_date, reason, attachments } = body

    if (!type || !start_date || !end_date || !reason) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    // TODO: Insert into employee_requests table
    // const { data, error } = await supabase
    //   .from('employee_requests')
    //   .insert({
    //     user_id: user.id,
    //     type,
    //     start_date,
    //     end_date,
    //     reason,
    //     attachments,
    //     status: 'pending'
    //   })
    //   .select()
    //   .single()

    // if (error) throw error

    return NextResponse.json({
      success: true,
      message: 'Solicitação criada com sucesso',
      request: {
        id: 'mock-id',
        type,
        start_date,
        end_date,
        status: 'pending'
      }
    })
  } catch (error) {
    console.error('Error creating request:', error)
    return NextResponse.json(
      { error: 'Failed to create request' },
      { status: 500 }
    )
  }
}


