# Rate Limiter | Backend Engineering Journey - Day 1

[![License: GNU](https://img.shields.io/badge/License-GNU-blue.svg)](https://www.gnu.org/licenses/gpl-3.0.en.html)
[![Node.js](https://img.shields.io/badge/Node.js-18%2B-green.svg)](https://nodejs.org/)
[![NestJS](https://img.shields.io/badge/NestJS-v10-red.svg)](https://nestjs.com/)
[![MongoDB](https://img.shields.io/badge/Database-MongoDB-47A248?style=flat&logo=mongodb&logoColor=white)](https://www.mongodb.com/)
[![Redis](https://img.shields.io/badge/Cache-Redis-DC382D?style=flat&logo=redis&logoColor=white)](https://redis.io/)

> **Part of my daily backend engineering builds as I work toward landing a Backend Engineer role.** This is Day 1 - a production-ready API rate limiting service that demonstrates enterprise-level backend development practices.

> **🚀 Ready to use as a NestJS boilerplate** - Other developers can fork this project as a solid foundation for building secure, scalable NestJS applications with built-in rate limiting, logging, authentication, and production-ready architecture.

## 🎯 Project Purpose & Learning Goals

This project showcases my ability to build **scalable, production-ready backend systems** using modern Node.js technologies. As my first project in this daily building journey, I chose to implement a rate limiter because it demonstrates several critical backend engineering concepts that are essential in enterprise environments.

**For other developers**: This project serves as a **comprehensive NestJS boilerplate** with authentication, rate limiting, database integration, and production-ready configurations already set up. You can use this as a starting point for your own NestJS applications.

### Technical Skills Demonstrated

- **Distributed System Design**: Redis-backed atomic operations with Lua scripting
- **Database Integration**: MongoDB with Mongoose ODM for user management
- **Authentication & Authorization**: JWT-based user authentication
- **Middleware Development**: Custom NestJS middleware for cross-cutting concerns
- **Performance Optimization**: Atomic operations to prevent race conditions under load
- **Security Best Practices**: Rate limiting strategies for API protection
- **Logging & Monitoring**: Winston integration for production-ready observability
- **Environment Configuration**: Flexible configuration management
- **Error Handling**: Proper HTTP status codes and error responses

## 🚀 What This Project Solves

Real-world backend systems need protection against abuse and resource exhaustion. This rate limiter addresses:

- **API Abuse Prevention**: Protects against brute-force attacks, DoS attempts, and malicious scraping
- **Resource Management**: Ensures fair resource allocation across users and IP addresses  
- **System Stability**: Prevents server overload during traffic spikes
- **Differentiated Access Control**: Separate limits for authenticated users vs anonymous traffic

## 🏗️ Architecture & Design Decisions

### Why These Technologies?

- **NestJS**: Enterprise-grade Node.js framework with built-in dependency injection and modular architecture
- **Redis**: High-performance in-memory store for atomic rate limit counters
- **MongoDB**: Document database for flexible user data storage
- **Winston**: Production-ready logging with configurable outputs
- **Lua Scripting**: Ensures atomic increment/check operations in Redis

### Key Implementation Highlights

1. **Dual Rate Limiting Strategy**: 
   - IP-based limits for unauthenticated requests
   - User-based limits for authenticated requests (higher thresholds)

2. **Atomic Operations**: 
   - Lua scripts prevent race conditions in concurrent environments
   - Critical for accuracy under high load

3. **Configurable Thresholds**: 
   - Environment-driven configuration for different deployment scenarios
   - Easy adjustment without code changes

## 📊 Features

- **IP-Based Rate Limiting**: Automatic protection for public endpoints
- **User-Based Rate Limiting**: Enhanced limits for authenticated users  
- **Configurable Windows**: Flexible time periods and request thresholds
- **Atomic Redis Operations**: Race condition prevention with Lua scripting
- **Comprehensive Logging**: Detailed request tracking and rate limit breach monitoring
- **JWT Authentication**: Secure user session management
- **Production Ready**: Environment configuration and error handling

## 🚀 Boilerplate Usage

### For Developers Looking for a NestJS Starter

This project provides a solid foundation with the following pre-configured features:

- **Authentication System**: Complete JWT-based auth with signup/signin endpoints
- **Rate Limiting Middleware**: Production-ready protection against abuse
- **Database Integration**: MongoDB with Mongoose setup and user models
- **Redis Caching**: High-performance caching layer configuration
- **Environment Management**: Comprehensive `.env` configuration
- **Logging System**: Winston logger with file and console outputs
- **Error Handling**: Proper HTTP responses and validation
- **TypeScript Setup**: Fully typed with NestJS best practices

### Quick Fork & Customize

```bash
# Fork this repository
git clone https://github.com/YOUR_USERNAME/rate-limiter.git
cd rate-limiter

# Install and configure
npm install
cp .env.example .env
# Edit .env with your settings

# Start building your features
npm run start:dev
```

**What you get out of the box:**
- User registration and authentication
- Protected and public routes
- Rate limiting for all endpoints
- Database models and connections
- Production-ready middleware stack
- Comprehensive logging and monitoring

Simply add your business logic and domain-specific routes to this foundation!

## 🛠️ Quick Start

### Prerequisites
- Node.js 18+
- MongoDB instance
- Redis instance


```

### Configuration Example

```env
# Rate Limits
REQUEST_LIMIT="100"                    # IP-based: 100 requests
RATE_LIMIT_WINDOW_SECONDS="60"         # Per 60 seconds

USER_REQUEST_LIMIT="1000"              # User-based: 1000 requests  
USER_RATE_LIMIT_WINDOW_SECONDS="3600"  # Per hour

# Database & Cache
DATABASE_URL="mongodb://localhost:27017/rate_limiter_db"
REDIS_URL="redis://localhost:6379"

# JWT Security
JWT_SECRET="your_strong_jwt_secret_key"
JWT_EXPIRES_IN="1h"
```

## 📱 API Usage

### Public Endpoints (IP Rate Limited)
```bash
GET /api/v1/
# Limited by REQUEST_LIMIT per IP
```

### Authentication
```bash
# Register
POST /auth/signup
{
  "email": "user@example.com",
  "password": "securepassword"
}

# Login  
POST /auth/signin
{
  "email": "user@example.com", 
  "password": "securepassword"
}
```

### Authenticated Endpoints (User Rate Limited)
```bash
GET /users/me
Authorization: Bearer <JWT_TOKEN>
# Limited by USER_REQUEST_LIMIT per authenticated user
```

### Rate Limit Response
```json
{
  "statusCode": 429,
  "message": "Rate limit exceeded. Maximum 100 requests per 60 seconds allowed.",
  "error": "Too Many Requests"
}
```

## 🔍 Technical Deep Dive

### Redis Lua Script Implementation
The rate limiter uses atomic Lua scripts to prevent race conditions:

```lua
-- Increment counter and check limit atomically
local current = redis.call('INCR', KEYS[1])
if current == 1 then
    redis.call('EXPIRE', KEYS[1], ARGV[1])
end
return current
```

### Middleware Integration
Custom NestJS middleware that:
- Extracts client IP and user identity
- Performs atomic rate limit checks
- Logs violations for monitoring
- Returns appropriate HTTP responses

### Logging Strategy
Winston configuration provides:
- Request/response logging
- Rate limit breach tracking  
- Configurable log levels
- File and console outputs

## 🎯 What I Learned Building This

- **Race Condition Prevention**: Understanding why atomic operations matter in distributed systems
- **Caching Strategies**: When and how to use Redis for high-performance counters
- **Middleware Patterns**: Implementing cross-cutting concerns in NestJS
- **Security Considerations**: Different rate limiting strategies for various threat models
- **Production Readiness**: Configuration management, logging, and error handling

## 🔗 Connect & Follow My Journey

This is Day 1 of my daily backend engineering builds. Follow my progress as I build production-ready systems while working toward landing a Backend Engineer role.

- **GitHub**: [https://github.com/OluchukwuJoseph]
- **LinkedIn**: [https://linkedin.com/in/olucukwu-joseph]
- **X**: [https://x.com/josephsystems]

## 📄 License

MIT License - See [LICENSE](https://opensource.org/license/mit) file for details.
