import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/options';
import { NegotiationModel } from '@/model/order.model';
import dbConnect from "@/lib/dbConnect";

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await dbConnect();
    
    const url = new URL(request.url);
    const productId = url.searchParams.get('productId');

    if (!productId) {
      return NextResponse.json({ error: 'Product ID is required' }, { status: 400 });
    }

    const customerId = session.user.id;
    const negotiations = await NegotiationModel.find({
      productId,
      customerId,
      status: 'accepted'
    });

    const sortedNegotiations = negotiations
      .slice()
      .sort((a, b) => b.updatedAt.getTime() - a.updatedAt.getTime());

    const latestNegotiation = sortedNegotiations[0];

    if (latestNegotiation) {
      return NextResponse.json({ 
        hasNegotiation: true,
        negotiation: latestNegotiation
      });
    }

    return NextResponse.json({ hasNegotiation: false });
  } catch (error) {
    console.error('Error checking negotiations:', error);
    return NextResponse.json({ error: 'Failed to check negotiations' }, { status: 500 });
  }
}