# XenoCRM - Modern Mini CRM Platform

A comprehensive, full-stack Customer Relationship Management (CRM) platform built with React.js and Node.js. XenoCRM provides advanced customer management, intelligent segmentation, campaign automation, and comprehensive order tracking capabilities with AI-powered insights.

## Live Demo

- **Frontend**: [https://mini-crm-platform-psi.vercel.app](https://mini-crm-platform-psi.vercel.app)
- **Backend API**: [https://mini-crm-platform-tnsk.onrender.com](https://mini-crm-platform-tnsk.onrender.com)
- **API Documentation**: [https://mini-crm-platform-tnsk.onrender.com/api-docs](https://mini-crm-platform-tnsk.onrender.com/api-docs)

## Features

### Customer Management
- Complete customer profiles with contact information and activity tracking
- Customer engagement metrics (total spend, visit count, last active)
- Communication history logging and interaction tracking
- Advanced customer analytics and insights

### Advanced Segmentation
- Dynamic customer segments using SQL-based rule engine
- AI-powered segmentation suggestions and optimization
- Real-time audience preview and validation
- Flexible rule engine supporting complex segmentation logic
- Custom segment performance analytics

### Campaign Management
- Email and SMS campaign creation and scheduling
- Template-based messaging system with personalization
- Campaign performance tracking and analytics
- Automated delivery receipt handling and status updates
- A/B testing capabilities for campaign optimization

### Order Management
- Complete order lifecycle tracking (Pending → Processing → Shipped → Delivered → Cancelled)
- Customer order history and purchase analytics
- Financial reporting and revenue tracking
- Order status automation and notifications

### Authentication & Security
- Google OAuth 2.0 integration with secure token handling
- JWT-based authentication with role-based access control
- Secure API endpoints with rate limiting and CORS protection
- Session management with NextAuth.js
- Protected routes and middleware security

### AI Integration
- Intelligent segmentation suggestions based on customer behavior
- Automated customer insights and recommendations
- Smart campaign optimization and targeting suggestions
- Predictive analytics for customer lifetime value

## Technology Stack

### Backend
- **Node.js** with Express.js framework
- **TypeScript** for type safety and enhanced development experience
- **Prisma** as the ORM with SQLite (development) and PostgreSQL (production)
- **BullMQ** for background job processing and queue management
- **Redis** for caching and session storage
- **Swagger/OpenAPI** for comprehensive API documentation
- **JWT** for secure authentication
- **Bcrypt** for password hashing and security

### Frontend
- **React.js** with Next.js 14 framework and App Router
- **TypeScript** for type-safe development
- **Tailwind CSS** for modern, responsive styling
- **Axios** for robust API communication
- **NextAuth.js** for authentication and session management

### Infrastructure & Deployment
- **Docker** containerization for consistent deployment
- **Railway** and **Render** for cloud deployment
- **Vercel** for frontend hosting
- **PostgreSQL** for production database
- **Redis** for production caching and queues

## Project Structure

```
mini-crm-platform/
├── backend/                     # Backend API server
│   ├── src/
│   │   ├── controllers/        # API route handlers and business logic
│   │   │   ├── customers.controller.ts
│   │   │   ├── orders.controller.ts
│   │   │   ├── segments.controller.ts
│   │   │   ├── campaigns.controller.ts
│   │   │   └── ai.controller.ts
│   │   ├── services/           # Core business logic services
│   │   │   ├── ai.service.ts
│   │   │   ├── db.service.ts
│   │   │   ├── rulesEngine.service.ts
│   │   │   └── sqlEvaluator.service.ts
│   │   ├── middleware/         # Express middleware
│   │   │   └── auth.ts
│   │   ├── routes/             # API route definitions
│   │   ├── workers/            # Background job workers
│   │   ├── validation/         # Input validation schemas
│   │   └── index.ts            # Main server entry point
│   ├── prisma/                 # Database schema and migrations
│   │   ├── schema.prisma       # Database schema
│   │   ├── migrations/         # Database migrations
│   │   └── dev.db             # SQLite development database
│   ├── dist/                   # Compiled JavaScript output
│   └── Dockerfile             # Docker configuration
├── frontend/                   # Next.js frontend application
│   ├── app/                    # Next.js 14 app router pages
│   │   ├── dashboard/          # Main dashboard
│   │   ├── customers/          # Customer management
│   │   ├── orders/             # Order management
│   │   ├── campaigns/          # Campaign management
│   │   ├── segments/           # Segmentation
│   │   ├── auth/               # Authentication pages
│   │   └── layout.tsx          # Root layout
│   ├── components/             # Reusable React components
│   │   ├── ui/                 # UI components
│   │   ├── LoginButton.tsx
│   │   └── ProtectedRoute.tsx
│   ├── lib/                    # Utility functions and API clients
│   │   ├── api.ts              # API client
│   │   ├── oauth.ts            # OAuth utilities
│   │   └── segments.ts         # Segmentation utilities
│   └── public/                 # Static assets and images
└── docs/                       # Project documentation
    ├── PRODUCTION_DEPLOYMENT.md
    ├── RAILWAY_DEPLOYMENT.md
    └── AUTHENTICATION_SETUP.md
```

## Getting Started

### Prerequisites
- **Node.js** (v18 or higher)
- **npm** or **yarn** package manager
- **Git**
- **PostgreSQL** (for production)
- **Redis** (optional, for production caching)

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/your-username/mini-crm-platform.git
   cd mini-crm-platform
   ```

2. **Install dependencies for all packages**
   ```bash
   npm run install:all
   ```

3. **Set up environment variables**
   
   **Backend** (create `backend/.env`):
   ```env
   # Database
   DATABASE_URL="file:./dev.db"
   
   # Authentication
   JWT_SECRET="your-super-secret-jwt-key-change-this-in-production"
   
   # Google OAuth (optional)
   GOOGLE_CLIENT_ID="your-google-client-id"
   GOOGLE_CLIENT_SECRET="your-google-client-secret"
   
   # Redis (optional)
   REDIS_URL="redis://localhost:6379"
   
   # Server
   PORT=3001
   NODE_ENV=development
   
   # URLs
   FRONTEND_URL="http://localhost:3000"
   BACKEND_URL="http://localhost:3001"
   ```

   **Frontend** (create `frontend/.env.local`):
   ```env
   # API Configuration
   NEXT_PUBLIC_API_URL=http://localhost:3001
   
   # NextAuth.js Configuration
   NEXTAUTH_URL=http://localhost:3000
   NEXTAUTH_SECRET="your-super-secret-nextauth-key"
   
   # Google OAuth (if using)
   GOOGLE_CLIENT_ID="your-google-client-id"
   GOOGLE_CLIENT_SECRET="your-google-client-secret"
   ```

4. **Initialize the database**
   ```bash
   cd backend
   npm run prisma:generate
   npm run prisma:push
   npm run db:init
   ```

### Development

1. **Start the development servers**
   ```bash
   # From the root directory - starts both frontend and backend
   npm run dev
   
   # Or start individually:
   npm run dev:backend    # Backend on port 3001
   npm run dev:frontend   # Frontend on port 3000
   ```

2. **Access the application**
   - **Frontend**: http://localhost:3000
   - **Backend API**: http://localhost:3001
   - **API Documentation**: http://localhost:3001/api-docs
   - **Health Check**: http://localhost:3001/health

### Production Build

1. **Build both applications**
   ```bash
   npm run build
   ```

2. **Start production servers**
   ```bash
   npm run start
   ```

## API Documentation

The backend API is fully documented using Swagger/OpenAPI 3.0. Access the interactive documentation at:

- **Development**: http://localhost:3001/api-docs
- **Production**: https://mini-crm-platform-tnsk.onrender.com/api-docs

### Key API Endpoints

#### Authentication & Users
- `POST /api/auth/login` - User login
- `POST /api/auth/logout` - User logout
- `GET /api/auth/me` - Get current user
- `GET /api/oauth/google` - Google OAuth login

#### Customer Management
- `GET /api/customers` - List customers (with pagination & filtering)
- `POST /api/customers` - Create new customer
- `GET /api/customers/:id` - Get customer details
- `PUT /api/customers/:id` - Update customer
- `DELETE /api/customers/:id` - Delete customer
- `POST /api/customers/filter-by-rules` - Advanced customer filtering

#### Order Management
- `GET /api/orders` - List all orders
- `POST /api/orders` - Create new order
- `GET /api/orders/:id` - Get order details
- `PUT /api/orders/:id` - Update order status
- `DELETE /api/orders/:id` - Delete order

#### Segmentation
- `GET /api/segments` - List all segments
- `POST /api/segments` - Create new segment
- `GET /api/segments/:id` - Get segment details
- `PUT /api/segments/:id` - Update segment
- `DELETE /api/segments/:id` - Delete segment
- `GET /api/segments/:id/customers` - Get customers in segment

#### Campaign Management
- `GET /api/campaigns` - List all campaigns
- `POST /api/campaigns` - Create new campaign
- `GET /api/campaigns/:id` - Get campaign details
- `PUT /api/campaigns/:id` - Update campaign
- `DELETE /api/campaigns/:id` - Delete campaign
- `POST /api/campaigns/:id/launch` - Launch campaign
- `POST /api/campaigns/:id/send-messages` - Send campaign messages

#### AI Services
- `POST /api/ai/suggest-segments` - AI-powered segmentation suggestions
- `POST /api/ai/analyze-customers` - Customer behavior analysis

### System Endpoints
- `GET /health` - Health check
- `GET /status` - Comprehensive system status
- `GET /cors-test` - CORS configuration test

## Database Schema

The application uses Prisma ORM with SQLite for development and PostgreSQL for production. Key entities include:

### Core Models

#### User
```typescript
{
  id: string
  googleId?: string
  email: string
  name: string
  password?: string
  picture?: string
  role: string
  isActive: boolean
  createdAt: DateTime
  updatedAt: DateTime
}
```

#### Customer
```typescript
{
  id: string
  name: string
  email: string
  phone?: string
  totalSpend: number
  lastActive?: DateTime
  visitsCount: number
  createdAt: DateTime
}
```

#### Order
```typescript
{
  id: string
  orderId: string
  customerId: string
  amount: number
  status: "PENDING" | "PROCESSING" | "SHIPPED" | "DELIVERED" | "CANCELLED"
  createdAt: DateTime
  updatedAt: DateTime
}
```

#### Segment
```typescript
{
  id: string
  userId?: string
  name: string
  description?: string
  rulesJson: string
  createdAt: DateTime
  updatedAt: DateTime
}
```

#### Campaign
```typescript
{
  id: string
  userId?: string
  segmentId?: string
  name: string
  messageTemplate?: string
  status: "DRAFT" | "SCHEDULED" | "SENT" | "FAILED"
  rulesJson?: string
  scheduledAt?: DateTime
  createdAt: DateTime
  updatedAt: DateTime
}
```

#### CommunicationLog
```typescript
{
  id: string
  campaignId: string
  customerId: string
  messageId?: string
  message: string
  status: "PENDING" | "SENT" | "FAILED"
  attempts: number
  lastAttemptAt?: DateTime
  deliveryReceipt?: string
  createdAt: DateTime
}
```

## Deployment

### Production Deployment Options

#### Option 1: Railway (Recommended)
The project includes comprehensive Railway deployment configuration:

```bash
# Deploy to Railway
cd backend
npm run railway:setup
npm run start:railway
```

**Railway Environment Variables:**
```env
NODE_ENV=production
DATABASE_URL=postgresql://...
JWT_SECRET=your-production-jwt-secret
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret
FRONTEND_URL=https://your-frontend-url.vercel.app
BACKEND_URL=https://your-backend-url.railway.app
```

#### Option 2: Render
Deploy to Render with automatic builds from GitHub:

```bash
# Render will auto-deploy from GitHub
# Set environment variables in Render dashboard
```

**Render Environment Variables:**
```env
NODE_ENV=production
DATABASE_URL=postgresql://...
JWT_SECRET=your-production-jwt-secret
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret
FRONTEND_URL=https://mini-crm-platform-psi.vercel.app
BACKEND_URL=https://mini-crm-platform-tnsk.onrender.com
```

#### Option 3: Docker Deployment
Build and run with Docker:

```bash
# Build the backend
cd backend
docker build -t mini-crm-backend .

# Run the container
docker run -p 3001:3001 \
  -e DATABASE_URL="postgresql://..." \
  -e JWT_SECRET="your-jwt-secret" \
  mini-crm-backend
```

#### Option 4: Vercel (Frontend Only)
Deploy frontend to Vercel:

```bash
cd frontend
vercel --prod
```

### Production URLs
- **Frontend**: https://mini-crm-platform-psi.vercel.app
- **Backend**: https://mini-crm-platform-tnsk.onrender.com
- **API Docs**: https://mini-crm-platform-tnsk.onrender.com/api-docs

## Development Scripts

### Root Level Scripts
```bash
npm run dev              # Start both frontend and backend
npm run dev:backend      # Start backend only (port 3001)
npm run dev:frontend     # Start frontend only (port 3000)
npm run build            # Build both applications
npm run build:backend    # Build backend only
npm run build:frontend   # Build frontend only
npm run start            # Start production servers
npm run install:all      # Install all dependencies
```

### Backend Scripts
```bash
npm run dev              # Start development server with hot reload
npm run dev:redis        # Start with Redis integration
npm run build            # Build TypeScript to JavaScript
npm run start            # Start production server
npm run prisma:generate  # Generate Prisma client
npm run prisma:push      # Push schema to database
npm run prisma:migrate   # Run database migrations
npm run prisma:studio    # Open Prisma database browser
npm run db:init          # Initialize database with sample data
npm run db:test          # Test database connection
npm run redis:test       # Test Redis connection
npm run worker           # Start background job worker
npm run worker:dev       # Start worker in development mode
```

### Frontend Scripts
```bash
npm run dev              # Start Next.js development server
npm run build            # Build production application
npm run start            # Start production server
npm run lint             # Run ESLint
npm run type-check       # Run TypeScript type checking
```

## Configuration

### Google OAuth Setup
Follow the detailed guide in [GOOGLE_OAUTH_SETUP.md](GOOGLE_OAUTH_SETUP.md) for:
- Google Cloud Console configuration
- OAuth 2.0 credentials setup
- Redirect URI configuration
- Environment variable setup

### Database Configuration
- **Development**: SQLite (`file:./dev.db`)
- **Production**: PostgreSQL (recommended)
- **Migrations**: Managed by Prisma
- **Schema**: Defined in `backend/prisma/schema.prisma`

### Environment Variables Reference

#### Backend (.env)
```env
# Required
DATABASE_URL="file:./dev.db"  # or PostgreSQL URL for production
JWT_SECRET="your-jwt-secret"
PORT=3001

# Optional
NODE_ENV="development"
REDIS_URL="redis://localhost:6379"
GOOGLE_CLIENT_ID="your-google-client-id"
GOOGLE_CLIENT_SECRET="your-google-client-secret"
FRONTEND_URL="http://localhost:3000"
BACKEND_URL="http://localhost:3001"
```

#### Frontend (.env.local)
```env
# Required
NEXT_PUBLIC_API_URL="http://localhost:3001"

# Optional
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="your-nextauth-secret"
GOOGLE_CLIENT_ID="your-google-client-id"
GOOGLE_CLIENT_SECRET="your-google-client-secret"
```

## Testing

### Health Checks
```bash
# Backend health
curl http://localhost:3001/health

# System status
curl http://localhost:3001/status

# CORS test
curl http://localhost:3001/cors-test
```

### API Testing
Use the interactive Swagger UI at http://localhost:3001/api-docs for comprehensive API testing.

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

### Development Guidelines
- Follow TypeScript best practices
- Use meaningful commit messages
- Add tests for new features
- Update documentation for API changes
- Ensure all CI checks pass

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Support & Troubleshooting

### Common Issues

#### Backend Issues
- **Database Connection**: Check `DATABASE_URL` environment variable
- **CORS Errors**: Verify `FRONTEND_URL` is correctly set
- **Authentication**: Ensure `JWT_SECRET` is set and consistent

#### Frontend Issues
- **API Connection**: Verify `NEXT_PUBLIC_API_URL` points to running backend
- **OAuth Issues**: Check Google OAuth configuration and redirect URIs
- **Build Errors**: Run `npm run type-check` to identify TypeScript issues

#### Deployment Issues
- **Environment Variables**: Ensure all required variables are set in production
- **Database**: Verify PostgreSQL connection string and database exists
- **CORS**: Update CORS origins for production domains

### Getting Help
- Check the [API Documentation](https://mini-crm-platform-tnsk.onrender.com/api-docs)
- Open an issue in the GitHub repository
- Contact the development team

## Roadmap

### Planned Features
- [ ] Advanced analytics dashboard
- [ ] Email template editor
- [ ] Webhook integrations
- [ ] Mobile app (React Native)
- [ ] Advanced reporting
- [ ] Multi-tenant support
- [ ] API rate limiting per user
- [ ] Advanced AI insights

### Recent Updates
- ✅ Google OAuth 2.0 integration
- ✅ Swagger API documentation
- ✅ Production deployment setup
- ✅ Advanced segmentation engine
- ✅ Campaign automation
- ✅ Background job processing

---

**Built with React.js, Node.js, and TypeScript**
