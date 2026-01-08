import { UserModel } from "@/model/user.model";
import dbConnect from "@/lib/dbConnect";
import { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";

declare module "next-auth" {
  interface User {
    id?: string;
    role?: "customer" | "seller";
    name?: string;
    email?: string;
    image?: string;
    verified?: boolean;
    businessName?: string;
  }
  
  interface Session {
    user: {
      id?: string;
      role?: "customer" | "seller";
      name?: string | null;
      email?: string | null;
      image?: string | null;
      verified?: boolean;
      businessName?: string; 
    }
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id?: string;
    role?: "customer" | "seller";
    verified?: boolean;
    businessName?: string; 
  }
}

interface Credentials {
  identifier: string;
  password: string;
}

interface AuthorizedUser {
    id: string;
    email: string;
    name: string;
    role: "customer" | "seller";
    verified: boolean;
    image?: string;
    businessName?: string;
}

export const authOptions: NextAuthOptions = {
    providers: [
        CredentialsProvider({
            id: 'credentials',
            name: 'Credentials',
            credentials: {
                identifier: { label: 'Email', type: 'email' },
                password: { label: 'Password', type: 'password' },
            },
            async authorize(credentials: Credentials | undefined): Promise<AuthorizedUser | null> {
                if (!credentials?.identifier || !credentials?.password) {
                    throw new Error('Please provide all required fields');
                }
                
                await dbConnect();
                
                try {
                    interface DbUser {
                        _id: { toString(): string };
                        email: string;
                        username: string;
                        password: string;
                        role: "customer" | "seller";
                        verified: boolean;
                        image?: string;
                        businessName?: string;
                    }
                    
                    const user = await UserModel.getByEmail(credentials.identifier.toLowerCase()) as DbUser;
                    
                    if (!user) {
                        throw new Error('Invalid credentials');
                    }

                    if (!user.verified) {
                        throw new Error('Please verify your email before logging in');
                    }
                    
                    const isPasswordCorrect = await bcrypt.compare(
                        credentials.password,
                        user.password
                    );
                    
                    if (!isPasswordCorrect) {
                        throw new Error('Invalid credentials');
                    }

                    return {
                        id: user._id.toString(),
                        email: user.email,
                        name: user.username,
                        role: user.role,
                        verified: user.verified,
                        image: user.image,
                        businessName: user.businessName,
                    };
                } catch (err: unknown) {
                    if (err instanceof Error && err.message === 'Invalid credentials') {
                        throw new Error('Invalid credentials');
                    } else {
                        console.error('Authentication error:', err);
                        throw new Error('Authentication failed');
                    }
                }
            },
        })
    ],
    callbacks: {
        async jwt({ token, user }) {
            if (user) {
                token.id = user.id;
                token.role = user.role;
                token.verified = user.verified;
                if (user.role === "seller" && user.businessName) {
                    token.businessName = user.businessName;
                }
            }
            return token;
        },
        async session({ session, token }) {
            if (token && session.user) {
                session.user.id = token.id as string;
                session.user.role = token.role as "customer" | "seller";
                session.user.verified = token.verified;
                if (token.role === "seller" && token.businessName) {
                    session.user.businessName = token.businessName;
                }
            }
            return session;
        }
    },
    pages: {
        signIn: '/signin',
        error: '/auth/error'
    },
    session: {
        strategy: 'jwt'
    },
    secret: process.env.NEXTAUTH_SECRET
};