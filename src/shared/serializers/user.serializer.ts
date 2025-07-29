import { Exclude, Expose } from 'class-transformer';

export class SerializedUser {
  @Expose()
  email: string;

  @Exclude()
  password: string;
}
