import * as bcrypt from 'bcryptjs';

export default class CryptoHelper {
  public static generateHash(plainText: string): string {
    const salt = bcrypt.genSaltSync(10);
    return bcrypt.hashSync(plainText, salt);
  }

  public static compareHash(plainText: string, hashedValue: string): boolean {
    return bcrypt.compareSync(plainText, hashedValue);
  }
}
