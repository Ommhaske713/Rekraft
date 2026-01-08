import Link from "next/link"
import { UserModel } from "@/model/user.model"
import { ProductModel, type Product } from "@/model/product.model"
import Image from "next/image"
import { 
  MapPin, 
  Mail, 
  Phone, 
  ShieldCheck, 
  Star, 
  Store, 
  ArrowLeft,
  CheckCircle2,
  UserCircle,
  Package,
  ExternalLink,
  MessageCircle
} from "lucide-react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"

interface SellerProfilePageProps {
  params: Promise<{
    sellerId: string
  }>
}

type SellerAddress = {
  street?: string
  city?: string
  state?: string
  postalCode?: string
  country?: string
}

type SellerViewData = {
  username: string
  email: string
  phone: string
  businessName: string
  businessDescription?: string
  negotiable?: boolean
  rating?: number
  verificationStatus?: string
  productListings?: string[]
  address?: SellerAddress
  avatar?: string
  createdAt: string
  image?: string 
}

export default async function SellerProfilePage({ params }: SellerProfilePageProps) {
  const { sellerId } = await params

  const isValidObjectId = /^[0-9a-fA-F]{24}$/.test(sellerId);

  let seller = null;
  let products: Product[] = [];
  
  if (isValidObjectId) {
    [seller, products] = await Promise.all([
      UserModel.getSellerById(sellerId),
      ProductModel.getSellerProducts(sellerId)
    ]);
  }

  if (!isValidObjectId || !seller || seller.role !== "seller") {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-6">
        <Card className="w-full max-w-md shadow-lg border-slate-200">
          <CardHeader className="text-center pb-2">
            <div className="mx-auto mb-4 bg-slate-100 w-20 h-20 rounded-full flex items-center justify-center">
              <UserCircle className="h-10 w-10 text-slate-400" />
            </div>
            <CardTitle className="text-2xl font-bold">Seller Not Found</CardTitle>
            <CardDescription>
              The profile you are looking for might have been moved or doesn&apos;t exist.
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-4">
            <Button asChild className="w-full bg-slate-900 hover:bg-slate-800">
              <Link href="/products">
                Return to Marketplace
              </Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  const sellerData = JSON.parse(JSON.stringify(seller)) as SellerViewData
  const productsData = JSON.parse(JSON.stringify(products))

  const {
    username,
    email,
    phone,
    businessName,
    businessDescription,
    negotiable,
    rating,
    verificationStatus,
    address,
    createdAt,
    image,
    avatar
  } = sellerData

  const avatarUrl = image || avatar || "https://github.com/shadcn.png"

  const formattedAddress = address
    ? [address.city, address.state, address.country].filter(Boolean).join(", ")
    : "Location not provided"

  const fullAddress = address
    ? [address.street, address.city, address.state, address.postalCode, address.country]
        .filter(Boolean)
        .join(", ")
    : "Location not provided"

  const joinDate = new Date(createdAt).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })
  const isVerified = verificationStatus === 'verified'
  const displayName = businessName || username

  return (
    <div className="min-h-screen bg-[#F8FAFC] font-sans">

      <header className="bg-white/80 backdrop-blur-md border-b border-slate-200 sticky top-0 z-50">
        <div className="container mx-auto px-4 lg:px-8 h-16 flex items-center">
          <Link 
            href="/products" 
            className="inline-flex items-center text-sm font-semibold text-slate-600 hover:text-blue-600 transition-all group"
          >
            <ArrowLeft className="h-4 w-4 mr-2 transition-transform group-hover:-translate-x-1" />
            <span className="hidden sm:inline">Back to Marketplace</span>
            <span className="sm:hidden">Back</span>
          </Link>
        </div>
      </header>

      <main className="container mx-auto px-4 lg:px-8 py-6 max-w-7xl">

        <div className="mb-8 relative rounded-3xl overflow-hidden bg-white border border-slate-200 shadow-xl ring-1 ring-slate-100">
          <div className="h-40 sm:h-32 md:h-44 lg:h-40 w-full bg-[#0F172A] relative overflow-hidden group">
             <div className="absolute inset-0 bg-gradient-to-br from-blue-600 via-indigo-600 to-purple-700 opacity-90" />

             <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#fff_1px,transparent_1px)] [background-size:20px_20px]" />
             
             <div className="absolute -top-24 -left-24 w-96 h-96 bg-blue-500/30 rounded-full blur-3xl" />
             <div className="absolute -bottom-24 -right-24 w-96 h-96 bg-purple-500/30 rounded-full blur-3xl" />
          </div>
          
          <div className="px-4 sm:px-8 pb-6 pt-0 flex flex-col md:flex-row items-center md:items-end gap-6 -mt-9 sm:-mt-13 md:-mt-16 lg:-mt-14 relative z-10">
            <div className="relative group shrink-0">
              <Avatar className="h-28 w-28 sm:h-40 sm:w-40 md:h-48 md:w-48 border-[6px] border-white shadow-2xl bg-white transition-all duration-300 group-hover:scale-105 group-hover:shadow-blue-900/20">
                <AvatarImage src={avatarUrl} alt={displayName} className="object-cover" />
                <AvatarFallback className="text-3xl sm:text-4xl md:text-5xl font-bold bg-slate-100 text-slate-400">
                  {displayName.charAt(0).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              
              {isVerified && (
                <div className="absolute bottom-2 right-2 bg-blue-600 rounded-full p-1.5 sm:p-2 border-4 border-white shadow-lg transform transition-transform group-hover:scale-110" title="Verified Professional">
                  <CheckCircle2 className="h-4 w-4 sm:h-6 sm:w-6 text-white" />
                </div>
              )}
            </div>

            <div className="flex-1 text-center md:text-left md:pb-4 space-y-3 w-full">
              <div className="flex flex-col md:flex-row md:items-center gap-3 md:gap-4 justify-center md:justify-start">
                <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-black text-slate-900 tracking-tight leading-tight md:mb-6 lg:hidden">
                  {displayName}
                </h1>
                <div className="flex items-center justify-center md:justify-start gap-2 flex-wrap">
                  {isVerified && (
                    <Badge variant="secondary" className="bg-blue-50 text-blue-700 hover:bg-blue-100 border-blue-200 px-3 py-1 text-xs sm:text-sm font-semibold transition-colors">
                      Verified Seller
                    </Badge>
                  )}
                  {negotiable && (
                    <Badge variant="secondary" className="bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border-emerald-200 px-3 py-1 text-xs sm:text-sm font-semibold transition-colors">
                      Open to Offers
                    </Badge>
                  )}
                </div>
              </div>
              <p className="text-base sm:text-lg text-slate-500 font-medium">@{username}</p>
              
              <div className="flex flex-wrap items-center justify-center md:justify-start gap-x-6 gap-y-2 text-sm text-slate-500 pt-1">
                <div className="flex items-center gap-2 font-medium bg-slate-50 px-3 py-1 rounded-full border border-slate-100">
                  <MapPin className="h-3.5 w-3.5 text-red-500" /> 
                  <span className="truncate max-w-[200px]">{formattedAddress}</span>
                </div>
                <div className="flex items-center gap-2 font-medium bg-slate-50 px-3 py-1 rounded-full border border-slate-100">
                  <Star className="h-3.5 w-3.5 text-amber-500 fill-amber-500" />
                  {rating ? `${rating.toFixed(1)} Rating` : "No Ratings"}
                </div>
                <div className="flex items-center gap-2 font-medium bg-slate-50 px-3 py-1 rounded-full border border-slate-100">
                  <span className="h-2 w-2 rounded-full bg-slate-300" />
                  Joined {joinDate}
                </div>
              </div>
            </div>

            <div className="w-full md:w-auto flex flex-col sm:flex-row gap-3 md:pb-4 pt-2 md:pt-0">
              <Button asChild className="flex-1 md:flex-initial bg-slate-900 hover:bg-slate-800 text-white rounded-xl px-8 py-6 font-bold shadow-lg shadow-slate-200 hover:shadow-xl transition-all active:scale-95">
                <a href={`mailto:${email}`} className="flex items-center justify-center gap-2">
                  <MessageCircle className="h-5 w-5" /> Contact Seller
                </a>
              </Button>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          <div className="lg:col-span-4 space-y-6 lg:sticky lg:top-24 h-fit">
            
            <Card className="border-slate-200 shadow-sm overflow-hidden group hover:shadow-md transition-shadow">
              <div className="h-1.5 bg-gradient-to-r from-blue-500 to-indigo-600" />
              <CardHeader className="pb-4">
                <CardTitle className="text-lg font-bold text-slate-800 flex items-center gap-2">
                  <UserCircle className="h-6 w-6 text-blue-600" />
                  Business Details
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-5">
                <div className="group/item flex items-start gap-4 p-3 -mx-2 rounded-xl hover:bg-slate-50 transition-colors">
                  <div className="bg-blue-50 p-2.5 rounded-xl group-hover/item:bg-blue-100 transition-colors shrink-0">
                    <MapPin className="h-5 w-5 text-blue-600" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Headquarters</p>
                    <p className="text-sm text-slate-700 leading-relaxed font-semibold">{fullAddress}</p>
                  </div>
                </div>
                
                <div className="group/item flex items-center gap-4 p-3 -mx-2 rounded-xl hover:bg-slate-50 transition-colors">
                  <div className="bg-purple-50 p-2.5 rounded-xl group-hover/item:bg-purple-100 transition-colors shrink-0">
                    <Mail className="h-5 w-5 text-purple-600" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Email</p>
                    <p className="text-sm text-slate-700 font-semibold break-all">{email}</p>
                  </div>
                </div>

                <div className="group/item flex items-center gap-4 p-3 -mx-2 rounded-xl hover:bg-slate-50 transition-colors">
                  <div className="bg-emerald-50 p-2.5 rounded-xl group-hover/item:bg-emerald-100 transition-colors shrink-0">
                    <Phone className="h-5 w-5 text-emerald-600" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Phone</p>
                    <p className="text-sm text-slate-700 font-semibold">{phone}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-slate-200 shadow-sm hover:shadow-md transition-shadow">
                <CardHeader className="pb-4">
                  <CardTitle className="text-lg font-bold text-slate-800 flex items-center gap-2">
                    <ShieldCheck className="h-6 w-6 text-emerald-500" />
                    Trust & Safety
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="flex justify-between items-center py-3 border-b border-slate-50">
                        <span className="text-sm font-medium text-slate-500">Identity Status</span>
                        <Badge variant="outline" className={`${isVerified ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-slate-50 text-slate-600 border-slate-200'} font-semibold`}>
                            {isVerified ? "Verified" : "Pending Verification"}
                        </Badge>
                    </div>
                    <div className="flex justify-between items-center py-3 border-b border-slate-50">
                        <span className="text-sm font-medium text-slate-500">Order Reliability</span>
                        <span className="text-sm font-bold text-slate-900 flex items-center gap-1.5">
                            <span className="h-2 w-2 rounded-full bg-emerald-500" /> High
                        </span>
                    </div>
                    <div className="flex justify-between items-center py-2">
                        <span className="text-sm font-medium text-slate-500">Member Status</span>
                        <span className="text-sm font-bold text-slate-900">Elite Seller</span>
                    </div>
                </CardContent>
            </Card>
          </div>

          <div className="lg:col-span-8 space-y-8">
            
            <Card className="border-slate-200 shadow-sm overflow-hidden">
                <CardHeader>
                  <CardTitle className="text-xl font-semibold text-slate-900 flex items-center gap-3">
                      <Store className="h-7 w-7 text-indigo-600" />
                      About the Seller
                  </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="prose prose-slate max-w-none">
                        {businessDescription ? (
                            <p className="whitespace-pre-line leading-relaxed text-slate-600 text-lg">
                                {businessDescription}
                            </p>
                        ) : (
                            <div className="flex flex-col items-center justify-center py-16 bg-slate-50 rounded-2xl border border-dashed border-slate-200 text-center px-4">
                                <Package className="h-12 w-12 text-slate-300 mb-4" />
                                <h3 className="text-lg font-bold text-slate-600">No biography available</h3>
                                <p className="text-sm text-slate-400 mt-1 max-w-xs">
                                    The seller hasn&apos;t provided details about their business yet, but you can still explore their listings below.
                                </p>
                            </div>
                        )}
                    </div>
                </CardContent>
            </Card>

            <section className="space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <h2 className="text-xl font-semibold text-slate-900 flex items-center gap-3">
                  <Package className="h-7 w-7 text-blue-600" />
                  Product Listings
                  <span className="ml-2 bg-slate-100 text-slate-600 text-sm py-1 px-3 rounded-full">
                    {productsData.length}
                  </span>
                </h2>
                {productsData.length > 0 && (
                  <Button variant="outline" asChild size="sm" className="rounded-full">
                    <Link href={`/products?sellerId=${sellerId}`} className="text-xs font-bold">
                      View All Listings <ExternalLink className="ml-2 h-3.5 w-3.5" />
                    </Link>
                  </Button>
                )}
              </div>

              {productsData.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4 lg:gap-6">
                  {productsData.slice(0, 6).map((product: Product) => (
                    <Link 
                      key={String(product._id)} 
                      href={`/products/${String(product._id)}`}
                      className="group flex flex-col bg-white rounded-2xl border border-slate-200 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 overflow-hidden"
                    >
                      <div className="relative aspect-[4/3] overflow-hidden bg-slate-100">
                        <Image
                          src={product.images?.[0] || "/product-placeholder.svg"}
                          alt={product.title}
                          fill
                          className="object-cover transition-transform duration-500 group-hover:scale-110"
                        />
                        <div className="absolute top-0 inset-x-0 h-16 bg-gradient-to-b from-black/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                        <div className="absolute top-3 right-3 flex gap-2">
                           <Badge className="bg-white/90 text-slate-900 border-none backdrop-blur shadow-sm font-bold px-2 py-1">
                             ₹{product.price.toLocaleString()}
                           </Badge>
                        </div>
                        {product.negotiable && (
                             <div className="absolute bottom-3 left-3">
                                <Badge variant="secondary" className="bg-emerald-500/90 text-white backdrop-blur border-none shadow-sm text-[10px] font-bold">
                                    Offers Welcome
                                </Badge>
                             </div>
                        )}
                      </div>
                      <div className="p-4 flex flex-col flex-1">
                        <h3 className="font-bold text-slate-800 text-lg leading-tight group-hover:text-blue-600 transition-colors line-clamp-1 mb-1">
                          {product.title}
                        </h3>
                        <p className="text-slate-500 text-xs line-clamp-2 mb-4 h-8">
                             {product.description}
                        </p>
                        
                        <div className="mt-auto flex items-center justify-between pt-3 border-t border-slate-100">
                             <div className="flex items-center gap-1.5 text-xs text-slate-500 font-medium">
                                <Badge variant="outline" className="text-[10px] capitalize px-1.5 py-0 border-slate-200 bg-slate-50 text-slate-600">
                                    {product.category}
                                </Badge>
                             </div>
                             <div className="flex items-center gap-1 text-xs text-slate-400">
                                <MapPin className="h-3 w-3" /> {product.location?.city}
                             </div>
                        </div>
                      </div>
                    </Link>
                  ))}
                  {productsData.length > 6 && (
                    <Link 
                      href={`/products?sellerId=${sellerId}`}
                      className="sm:col-span-2 xl:col-span-3 group flex flex-col items-center justify-center p-8 bg-slate-50 rounded-2xl border-2 border-dashed border-slate-200 hover:border-blue-400 hover:bg-blue-50/50 transition-all text-center cursor-pointer"
                    >
                      <div className="bg-white rounded-full p-4 shadow-sm mb-3 group-hover:scale-110 transition-transform ring-1 ring-slate-100">
                        <ExternalLink className="h-6 w-6 text-slate-400 group-hover:text-blue-500" />
                      </div>
                      <p className="font-bold text-slate-700 text-lg">View all {productsData.length} listings</p>
                      <p className="text-sm text-slate-400">Browse the full catalog from this seller</p>
                    </Link>
                  )}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center py-16 bg-white rounded-3xl border border-slate-200 shadow-sm text-center px-4">
                  <div className="bg-slate-50 p-6 rounded-full mb-4">
                    <Store className="h-10 w-10 text-slate-300" />
                  </div>
                  <h3 className="text-xl font-bold text-slate-900">No active listings</h3>
                  <p className="text-slate-500 mt-2 max-w-sm">
                    This seller hasn&apos;t posted any products for sale yet. Check back later or follow their profile.
                  </p>
                </div>
              )}
            </section>
          </div>
        </div>
      </main>
      
      <footer className="mt-12 py-12 bg-white border-t border-slate-200">
        <div className="container mx-auto px-4 text-center">
          <p className="text-slate-400 text-sm font-medium">© 2025 Rekraftt-Host Marketplace. All rights reserved.</p>
        </div>
      </footer>
    </div>
  )
}