import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/app/api/auth/[...nextauth]/options'
import { ProductModel } from '@/model/product.model'
import mongoose from 'mongoose'
import dbConnect from "@/lib/dbConnect";
import { NegotiationModel } from '@/model/order.model'

const allowedCartRoles = ['customer', 'seller'] as const
type CartUserRole = (typeof allowedCartRoles)[number]

interface CartDocument {
  _id: mongoose.Types.ObjectId
  role: CartUserRole
  cart?: Array<{
    productId: string | mongoose.Types.ObjectId
    quantity: number
    negotiatedPrice?: number
  }>
}

interface ProductDoc {
  _id: mongoose.Types.ObjectId
  title: string
  price: number
  images: string[]
  category: string
  sellerId: mongoose.Types.ObjectId
  negotiable: boolean
}

interface CartItemWithDetails {
  id: string
  productId: string
  title: string
  price: number
  quantity: number
  image: string
  category: string
  sellerId: string
  negotiable: boolean
  negotiatedPrice?: number
}

interface NegotiationDoc {
  productId: mongoose.Types.ObjectId | string;
  counterOffer?: number;
  initialPrice?: number;
  updatedAt?: Date;
  createdAt?: Date;
}

const ensureDbConnection = async () => {
  if (!mongoose.connection.db || !mongoose.connection.readyState) {
    await dbConnect()
  }
}

const findCartUserById = async (userId: string): Promise<CartDocument | null> => {
  await ensureDbConnection()
  if (!mongoose.connection.db) return null
  const doc = await mongoose.connection.db.collection('users').findOne({
    _id: new mongoose.Types.ObjectId(userId),
    role: { $in: allowedCartRoles }
  })
  return doc as CartDocument | null
}

interface CartItem {
  productId: string | mongoose.Types.ObjectId;
  quantity: number;
  negotiatedPrice?: number; 
}

export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const userId = session.user.id
    if (!userId) {
      return NextResponse.json({ error: 'User ID is required' }, { status: 400 })
    }

    const user = await findCartUserById(userId)
    
    if (!user) {
      console.log("User not found or not eligible for cart access")
      return NextResponse.json({ error: 'User not found or not eligible for cart access' }, { status: 404 })
    }

    const cart = Array.isArray(user.cart) ? user.cart : []
    
    if (cart.length === 0) {
      console.log("Cart is empty")
      return NextResponse.json({ items: [] })
    }

    const productIds: mongoose.Types.ObjectId[] = cart.map((item: CartItem) => {
      try {
        return new mongoose.Types.ObjectId(item.productId);
      } catch (conversionError) {
        console.log("Error converting ID, using as is:", item.productId, conversionError);
        return item.productId as mongoose.Types.ObjectId;
      }
    });
    console.log("Product IDs in cart:", productIds)

    const products = await ProductModel.find({
      _id: { $in: productIds }
    }, {
      title: 1,
      price: 1,
      images: 1,
      category: 1,
      sellerId: 1,
      negotiable: 1
    }) as ProductDoc[]

    const negotiatedPriceByProductId: Record<string, number> = {}
    if (session.user.role === 'customer' && productIds.length > 0) {
      const acceptedNegotiations = (await NegotiationModel.find({
        productId: { $in: productIds },
        customerId: userId,
        status: 'accepted'
      })) as NegotiationDoc[]

      acceptedNegotiations.sort((a, b) => {
        const aTime = new Date(a?.updatedAt ?? a?.createdAt ?? 0).getTime()
        const bTime = new Date(b?.updatedAt ?? b?.createdAt ?? 0).getTime()
        return bTime - aTime
      })

      for (const negotiation of acceptedNegotiations) {
        const productKey = negotiation.productId?.toString?.() ?? String(negotiation.productId)
        if (!(productKey in negotiatedPriceByProductId)) {
          const negotiationPrice = negotiation.counterOffer ?? negotiation.initialPrice
          if (typeof negotiationPrice === 'number') {
            negotiatedPriceByProductId[productKey] = negotiationPrice
          }
        }
      }
    }
 
    const cartItems: CartItemWithDetails[] = cart.reduce<CartItemWithDetails[]>((acc, cartItem) => {
      const matchedProduct = products.find((p: ProductDoc) =>
        p._id.toString() === cartItem.productId.toString()
      )

      if (!matchedProduct) {
        console.log("Product not found for cart item:", cartItem.productId)
        return acc
      }

      acc.push({
        id: cartItem.productId.toString(),
        productId: cartItem.productId.toString(),
        title: matchedProduct.title,
        price: matchedProduct.price,
        negotiatedPrice:
          negotiatedPriceByProductId[cartItem.productId.toString()] ?? cartItem.negotiatedPrice,
        quantity: cartItem.quantity,
        image: matchedProduct.images?.[0] || "/product-placeholder.svg",
        category: matchedProduct.category,
        sellerId: matchedProduct.sellerId.toString(),
        negotiable: matchedProduct.negotiable
      })

      return acc
    }, [])
    console.log("Returning cart items:", cartItems.length)
    return NextResponse.json({ items: cartItems })
  } catch (error) {
    console.error('Error fetching cart:', error)
    return NextResponse.json({ error: 'Failed to fetch cart' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { productId, quantity } = await request.json();

    if (!productId) {
      return NextResponse.json({ error: 'Product ID is required' }, { status: 400 })
    }

    if (quantity <= 0) {
      return NextResponse.json({ error: 'Quantity must be positive' }, { status: 400 })
    }

    const userId = session.user.id
    if (!userId) {
      return NextResponse.json({ error: 'User ID not found' }, { status: 400 })
    }

    const user = await findCartUserById(userId)
    
    if (!user) {
      return NextResponse.json({ error: 'User not found or not eligible for cart access' }, { status: 404 })
    }

    const product = await ProductModel.findById(productId)
    if (!product) {
      return NextResponse.json({ error: 'Product not found' }, { status: 404 })
    }

    if (user.role === 'seller') {
      const productSellerId = product.sellerId?.toString()
      if (productSellerId && productSellerId === userId) {
        return NextResponse.json({ error: 'Sellers cannot add their own products to the cart' }, { status: 403 })
      }
    }

    if (quantity > product.quantity) {
      return NextResponse.json({ 
        error: 'Requested quantity exceeds available stock', 
        availableQuantity: product.quantity 
      }, { status: 400 })
    }

    let finalPrice = product.price;
      if (session.user.role === 'customer') {
        const accepted = (await NegotiationModel.find({
          productId,
          customerId: userId,
          status: 'accepted'
        })) as NegotiationDoc[]

        accepted.sort((a, b) => {
          const aTime = new Date(a?.updatedAt ?? a?.createdAt ?? 0).getTime()
          const bTime = new Date(b?.updatedAt ?? b?.createdAt ?? 0).getTime()
          return bTime - aTime
        })

        const negotiation = accepted[0]
        if (negotiation) {
          const negotiationPrice = negotiation.counterOffer ?? negotiation.initialPrice
          if (typeof negotiationPrice === 'number') {
            finalPrice = negotiationPrice
          }
        }
      }

    const cart = Array.isArray(user.cart) ? [...user.cart] : [];

    const productIdString = productId.toString()
    const existingItemIndex = cart.findIndex(
      item => item.productId && item.productId.toString() === productIdString
    )
    
    if (existingItemIndex >= 0) {
      const newTotalQuantity = cart[existingItemIndex].quantity + quantity

      if (newTotalQuantity > product.quantity) {
        return NextResponse.json({ 
          error: 'Total quantity exceeds available stock', 
          availableQuantity: product.quantity,
          currentCartQuantity: cart[existingItemIndex].quantity
        }, { status: 400 })
      }
      
      cart[existingItemIndex].quantity = newTotalQuantity;

      if (finalPrice !== product.price) {
        (cart[existingItemIndex] as CartItem).negotiatedPrice = finalPrice;
      }

    } else {
      const cartItem: { productId: string; quantity: number; negotiatedPrice?: number } = {
        productId: productIdString,
        quantity
      };

      if (finalPrice !== product.price) {
        cartItem.negotiatedPrice = finalPrice;
      }
      
      cart.push(cartItem);
    }

    if (!mongoose.connection.db) {
      throw new Error('Database connection is not established');
    }
    
    await mongoose.connection.db.collection('users').updateOne(
      { _id: new mongoose.Types.ObjectId(userId) },
      { $set: { cart: cart } }
    );

    const updatedUser = await mongoose.connection.db.collection('users').findOne(
      { _id: new mongoose.Types.ObjectId(userId) }
    );
        
    return NextResponse.json({ 
      success: true, 
      message: 'Item added to cart',
      cart: updatedUser?.cart || []  
    })
  } catch (error) {
    console.error('Error adding to cart:', error)
    return NextResponse.json({ error: 'Failed to add item to cart' }, { status: 500 })
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { productId, quantity } = await request.json()

    if (!productId || quantity === undefined) {
      return NextResponse.json({ error: 'Product ID and quantity are required' }, { status: 400 })
    }

    if (quantity <= 0) {
      return NextResponse.json({ error: 'Quantity must be positive' }, { status: 400 })
    }

    const userId = session.user.id
    if (!userId) {
      return NextResponse.json({ error: 'User ID not found' }, { status: 400 })
    }
    
    const user = await findCartUserById(userId)
    
    if (!user) {
      return NextResponse.json({ error: 'User not found or not eligible for cart access' }, { status: 404 })
    }

    const product = await ProductModel.findById(productId)
    if (!product) {
      return NextResponse.json({ error: 'Product not found' }, { status: 404 })
    }

    if (quantity > product.quantity) {
      return NextResponse.json({ 
        error: 'Requested quantity exceeds available stock', 
        availableQuantity: product.quantity 
      }, { status: 400 })
    }

    const cart = Array.isArray(user.cart) ? [...user.cart] : []
    
    const productIdString = productId.toString()
    const existingItemIndex = cart.findIndex(
      item => item.productId && item.productId.toString() === productIdString
    )
    
    if (existingItemIndex >= 0) {
      cart[existingItemIndex].quantity = quantity
    } else {
      cart.push({ 
        productId: productIdString, 
        quantity 
      })
    }

    if (!mongoose.connection.db) {
      throw new Error('Database connection is not established');
    }
    await mongoose.connection.db.collection('users').updateOne(
      { _id: new mongoose.Types.ObjectId(userId) },
      { $set: { cart: cart } }
    );
    
    const updatedUser = await mongoose.connection.db.collection('users').findOne(
      { _id: new mongoose.Types.ObjectId(userId) }
    );
    
    return NextResponse.json({ 
      success: true, 
      message: 'Cart item updated',
      cart: updatedUser?.cart || []
    })
  } catch (error) {
    console.error('Error updating cart item:', error)
    return NextResponse.json({ error: 'Failed to update cart item' }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const url = new URL(request.url)
    const productId = url.searchParams.get('productId')
    
    if (!productId) {
      return NextResponse.json({ error: 'Product ID is required' }, { status: 400 })
    }
    
    const userId = session.user.id
    if (!userId) {
      return NextResponse.json({ error: 'User ID not found' }, { status: 400 })
    }
    
    const user = await findCartUserById(userId)
    
    if (!user) {
      return NextResponse.json({ error: 'User not found or not eligible for cart access' }, { status: 404 })
    }
    
    const cart = Array.isArray(user.cart) ? [...user.cart] : []
    const productIdString = productId.toString()

    const updatedCart = cart.filter(
      item => item.productId && item.productId.toString() !== productIdString
    );

    if (!mongoose.connection.db) {
      throw new Error('Database connection is not established');
    }
    await mongoose.connection.db.collection('users').updateOne(
      { _id: new mongoose.Types.ObjectId(userId) },
      { $set: { cart: updatedCart } }
    );
    
    const updatedUser = await mongoose.connection.db.collection('users').findOne(
      { _id: new mongoose.Types.ObjectId(userId) }
    );
    
    return NextResponse.json({ 
      success: true, 
      message: 'Item removed from cart',
      cart: updatedUser?.cart || []
    })
  } catch (error) {
    console.error('Error removing from cart:', error)
    return NextResponse.json({ error: 'Failed to remove item from cart' }, { status: 500 })
  }
}