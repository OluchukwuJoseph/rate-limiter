import { Request } from 'express';
import { UNKNOWN_IP_ADDRESS } from '../constants/ip';

export class IpHelper {
  static getClientIP(req: Request): string {
    // Check for IP in various headers (in order of preference)
    const forwarded = req.headers['x-forwarded-for'] as string;
    const realIP = req.headers['x-real-ip'] as string;
    const cfConnectingIP = req.headers['cf-connecting-ip'] as string; // Cloudflare
    const xClientIP = req.headers['x-client-ip'] as string;

    // x-forwarded-for can contain multiple IPs (client, proxy1, proxy2, etc.)
    // The first IP is usually the original client IP
    if (forwarded) {
      const ips = forwarded.split(',').map((ip) => ip.trim());
      return ips[0];
    }

    // Cloudflare specific header
    if (cfConnectingIP) {
      return cfConnectingIP;
    }

    // Other common headers
    if (realIP) {
      return realIP;
    }

    if (xClientIP) {
      return xClientIP;
    }

    // Fallback to connection IP
    if (req.socket?.remoteAddress) {
      return req.socket.remoteAddress;
    }

    // Express req.ip
    if (req.ip) {
      return req.ip;
    }

    // Final fallback
    return UNKNOWN_IP_ADDRESS;
  }
}
