import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema({ timestamps: true })
export class User {
  @Prop({ type: String, required: true, unique: true, lowercase: true })
  email: string;

  @Prop({ type: String, required: true })
  password: string;
}

const UserSchema = SchemaFactory.createForClass(User);
UserSchema.index({ email: 1 });

type UserDocument = User & Document;
export { UserSchema, UserDocument };
