import { Request } from 'express';
import { UserDocument } from '../../user/entities/user.entity';

export interface ExtendedRequest extends Request {
  user: UserDocument;
}
