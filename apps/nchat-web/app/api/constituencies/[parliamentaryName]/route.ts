import { getCompleteConstituencyInfo } from '@/lib/constituency-utils';
import { NextResponse } from 'next/server';

export async function GET(
  request: Request, 
  { params }: { params: any }
) {
  try {
    const { parliamentaryName } = params;
    const constituencyInfo = getCompleteConstituencyInfo(parliamentaryName);

    if (!constituencyInfo) {
      return NextResponse.json(
        { error: 'Constituency not found' }, 
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