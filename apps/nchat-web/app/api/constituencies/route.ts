import { getCompleteConstituencyInfo } from '@/lib/constituency-utils';
import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  try {
    // Extract query parameters
    const { searchParams } = new URL(request.url);
    const state = searchParams.get('state');
    const parliamentaryConstituency = searchParams.get('parliamentaryConstituency');
    const assemblyConstituency = searchParams.get('assemblyConstituency');

    // Determine the most specific constituency name
    const constituencyName = 
      assemblyConstituency || 
      parliamentaryConstituency || 
      state || 
      'India';

    // Fetch constituency info directly from the utility function
    const constituencyInfo = getCompleteConstituencyInfo(constituencyName);

    if (!constituencyInfo) {
      return NextResponse.json(
        { error: 'Constituency not found', 
          details: { 
            state, 
            parliamentaryConstituency, 
            assemblyConstituency 
          } 
        }, 
        { status: 404 }
      );
    }

    return NextResponse.json(constituencyInfo);
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to fetch constituency information' }, 
      { status: 500 }
    );
  }
} 