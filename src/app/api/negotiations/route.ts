import { NextResponse } from 'next/server';
import { NegotiationModel, Negotiation } from '@/model/order.model';
import { ProductModel, Product } from '@/model/product.model';
import { UserModel } from '@/model/user.model';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/options';

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const data = await request.json();

    if (data.customerId !== session.user.id) {
      return NextResponse.json({ error: 'User ID mismatch' }, { status: 403 });
    }

    const negotiation = await NegotiationModel.createNegotiation(data);
    return NextResponse.json(negotiation);
  } catch (error) {
    console.error('Error creating negotiation:', error);
    return NextResponse.json({ error: 'Failed to create negotiation' }, { status: 500 });
  }
}

export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    const url = new URL(request.url);
    const productId = url.searchParams.get('productId');
    const customerId = url.searchParams.get('customerId');
    const sellerId = url.searchParams.get('sellerId');
    
    let negotiations;
    if (productId) {
      negotiations = await NegotiationModel.getProductNegotiations(productId);
    } else if (customerId) {
      if (customerId === session.user.id) {
        negotiations = await NegotiationModel.getCustomerNegotiations(customerId);
      } else {
        return NextResponse.json({ error: 'Access denied' }, { status: 403 });
      }
    } else if (sellerId) {
      if (sellerId === session.user.id) {
        negotiations = await NegotiationModel.getSellerNegotiations(sellerId);
      } else {
        return NextResponse.json({ error: 'Access denied' }, { status: 403 });
      }
    } else {
      return NextResponse.json({ error: 'Missing filter parameters' }, { status: 400 });
    }
    
    const productCache: Record<string, Product | null> = {}
    const userCache: Record<string, Record<string, unknown> | null> = {}

    type ProductPayload = { _id?: string; title?: string; price?: number; images?: string[] }
    type CustomerPayload = { _id?: string; username?: string; email?: string }
    type PlainNegotiation = Record<string, unknown> & { productId?: ProductPayload | string; customerId?: CustomerPayload | string; updatedAt?: string | Date };

    const enrichNegotiation = async (neg: Negotiation): Promise<PlainNegotiation> => {
      const obj = (neg as unknown as { toObject?: () => unknown }).toObject?.();
      const base = (obj ?? (neg as unknown)) as PlainNegotiation;

      const productIdStr = typeof base.productId === 'string' ? base.productId : String(base.productId ?? '');
      const customerIdStr = typeof base.customerId === 'string' ? base.customerId : String(base.customerId ?? '');

      if (!productCache[productIdStr]) {
        const product = await ProductModel.findById(productIdStr)
        productCache[productIdStr] = product
      }

      if (!userCache[customerIdStr]) {
        const user = await UserModel.getById(customerIdStr)
        userCache[customerIdStr] = user ? (user as unknown as Record<string, unknown>) : null
      }

      const productInfo = productCache[productIdStr]
      const customerInfo = userCache[customerIdStr]

      const productPayload = productInfo
        ? {
            _id: productInfo._id ? String(productInfo._id) : undefined,
            title: productInfo.title,
            price: productInfo.price,
            images: productInfo.images,
          }
        : { _id: productIdStr }

      const customerPayload = customerInfo
        ? {
            _id: customerInfo._id ? String(customerInfo._id) : undefined,
            username: customerInfo.username as string | undefined,
            email: customerInfo.email as string | undefined,
          }
        : { _id: customerIdStr }

      return {
        ...base,
        product: productPayload,
        productId: productPayload,
        customer: customerPayload,
        customerId: customerPayload,
      }
    }

    const enriched: PlainNegotiation[] = []
    for (const negotiation of negotiations as Negotiation[]) {
      const item = await enrichNegotiation(negotiation)
      enriched.push(item)
    }

    return NextResponse.json(enriched)
  } catch (error) {
    console.error('Error fetching negotiations:', error);
    return NextResponse.json({ error: 'Failed to fetch negotiations' }, { status: 500 });
  }
}