import mongoose, { Schema, Document } from 'mongoose';
import { z } from 'zod';
import dbConnect from '@/lib/dbConnect';

export interface NegotiationMessage {
  userId: string;
  message: string;
  timestamp: Date;
}

export interface Negotiation extends Document {
  productId: string;
  customerId: string;
  sellerId: string;
  initialPrice: number;
  counterOffer?: number;
  status: 'pending' | 'accepted' | 'rejected' | 'countered';
  messages: NegotiationMessage[];
  createdAt: Date;
  updatedAt: Date;
}

export const negotiationMessageSchema = z.object({
  userId: z.string(),
  message: z.string(),
  timestamp: z.date()
});

export const negotiationSchema = z.object({
  productId: z.string(),
  customerId: z.string(),
  sellerId: z.string(),
  initialPrice: z.number().positive(),
  counterOffer: z.number().positive().optional(),
  status: z.enum(['pending', 'accepted', 'rejected', 'countered']).default('pending'),
  messages: z.array(negotiationMessageSchema).default([]),
  createdAt: z.date().default(new Date()),
  updatedAt: z.date().default(new Date())
});

const negotiationMessageSchemaMongoose = new Schema<NegotiationMessage>({
  userId: {
    type: String,
    required: true
  },
  message: {
    type: String,
    required: true
  },
  timestamp: {
    type: Date,
    default: Date.now
  }
});

const negotiationSchemaMongoose = new Schema<Negotiation>({
  productId: {
    type: String,
    required: true,
    index: true
  },
  customerId: {
    type: String,
    required: true,
    index: true
  },
  sellerId: {
    type: String,
    required: true,
    index: true
  },
  initialPrice: {
    type: Number,
    required: true,
    min: 0
  },
  counterOffer: {
    type: Number,
    min: 0
  },
  status: {
    type: String,
    enum: ['pending', 'accepted', 'rejected', 'countered'],
    default: 'pending'
  },
  messages: [negotiationMessageSchemaMongoose],
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

const NegotiationModelMongoose = mongoose.models.Negotiation || 
  mongoose.model<Negotiation>('Negotiation', negotiationSchemaMongoose);

export class NegotiationModel {
  static async findOne(query: Record<string, unknown>): Promise<Negotiation | null> {
    await dbConnect();
    return NegotiationModelMongoose.findOne(query).exec();
  }

  static async find(query: Record<string, unknown>): Promise<Negotiation[]> {
    await dbConnect();
    return NegotiationModelMongoose.find(query).exec();
  }

  static async findById(id: string): Promise<Negotiation | null> {
    await dbConnect();
    return NegotiationModelMongoose.findById(id).exec();
  }
  
  static async createNegotiation(data: z.infer<typeof negotiationSchema>): Promise<Negotiation> {
    await dbConnect();
    const negotiation = new NegotiationModelMongoose(data);
    await negotiation.save();
    return negotiation;
  }

  static async updateNegotiation(id: string, data: Partial<z.infer<typeof negotiationSchema>>): Promise<Negotiation | null> {
    await dbConnect();
    const { ...updateData } = data;
    return NegotiationModelMongoose.findByIdAndUpdate(
      id,
      { ...updateData, updatedAt: new Date() },
      { new: true }
    ).exec();
  }

  static async getProductNegotiations(productId: string): Promise<Negotiation[]> {
    await dbConnect();
    return NegotiationModelMongoose.find({ productId }).sort({ createdAt: -1 }).exec();
  }

  static async getCustomerNegotiations(customerId: string): Promise<Negotiation[]> {
    await dbConnect();
    return NegotiationModelMongoose.find({ customerId }).sort({ createdAt: -1 }).exec();
  }

  static async getSellerNegotiations(sellerId: string): Promise<Negotiation[]> {
    await dbConnect();
    return NegotiationModelMongoose.find({ sellerId }).sort({ createdAt: -1 }).exec();
  }
}

const negotiationDefaultExport = { NegotiationModel: NegotiationModelMongoose }

export default negotiationDefaultExport