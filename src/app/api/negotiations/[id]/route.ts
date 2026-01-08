import { NextRequest, NextResponse } from 'next/server';
import { resolveRouteParams } from '@/types/AppRouteContext';
import type { AppRouteContext } from '@/types/AppRouteContext';
import { NegotiationModel } from '@/model/order.model';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/options';

interface NegotiationDocument {
  customerId: string;
  sellerId: string;
  [key: string]: string | number | boolean | object | null | undefined;
}

interface UserSession {
    user?: {
    id: string;
    [key: string]: string | number | boolean | null | undefined;
    };
}

export async function GET(
  _request: NextRequest,
  context: AppRouteContext
): Promise<NextResponse> {
  try {
    const params = await resolveRouteParams(context);
    const id = typeof params?.id === "string" ? params.id : null;

    if (!id) {
      return NextResponse.json({ error: 'Invalid negotiation ID' }, { status: 400 });
    }

    const session = await getServerSession(authOptions) as UserSession | null;
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

        const negotiation = await NegotiationModel.findById(id) as NegotiationDocument | null;
        if (!negotiation) {
            return NextResponse.json({ error: 'Negotiation not found' }, { status: 404 });
        }

        if (negotiation.customerId !== session.user.id && negotiation.sellerId !== session.user.id) {
            return NextResponse.json({ error: 'Access denied' }, { status: 403 });
        }

        return NextResponse.json(negotiation);
    } catch (error) {
        console.error('Error fetching negotiation:', error);
        return NextResponse.json({ error: 'Failed to fetch negotiation' }, { status: 500 });
    }
}

interface NegotiationUpdateData {
    customerId?: string;
    sellerId?: string;
  [key: string]: unknown;
}

export async function PATCH(
  request: NextRequest,
  context: AppRouteContext
): Promise<NextResponse> {
  try {
    const params = await resolveRouteParams(context);
    const id = typeof params?.id === "string" ? params.id : null;

    if (!id) {
      return NextResponse.json({ error: 'Invalid negotiation ID' }, { status: 400 });
    }
    
    const session = await getServerSession(authOptions) as UserSession | null;
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const negotiation = await NegotiationModel.findById(id) as NegotiationDocument | null;
    if (!negotiation) {
      return NextResponse.json({ error: 'Negotiation not found' }, { status: 404 });
    }

    if (negotiation.customerId !== session.user.id && negotiation.sellerId !== session.user.id) {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 });
    }

    const data = await request.json() as NegotiationUpdateData;
    const updatedNegotiation = await NegotiationModel.updateNegotiation(id, data);

    if (!updatedNegotiation) {
      return NextResponse.json({ error: 'Negotiation update failed' }, { status: 500 });
    }

    return NextResponse.json(updatedNegotiation);
  } catch (error) {
    console.error('Error updating negotiation:', error);
    return NextResponse.json({ error: 'Failed to update negotiation' }, { status: 500 });
  }
}