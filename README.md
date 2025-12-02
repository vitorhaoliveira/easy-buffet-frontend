# EasyBuffet Angular

A modern, comprehensive event management and financial control system built with Angular. EasyBuffet helps businesses manage clients, contracts, events, packages, and financial operations with an intuitive and responsive interface.

## 📋 Table of Contents

- [About](#about)
- [Features](#features)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Getting Started](#getting-started)
- [Development](#development)
- [Code Standards](#code-standards)
- [Building](#building)
- [Testing](#testing)
- [Contributing](#contributing)

## 🎯 About

EasyBuffet is a complete business management solution designed for event planning and catering companies. It provides tools to manage the entire business workflow, from client registration to financial reports, all in one integrated platform.

## ✨ Features

- **Authentication & Authorization**: Secure login system with role-based access control
- **Dashboard**: Real-time overview of business metrics and KPIs
- **Client Management**: Complete CRUD operations for client data
- **Event Management**: Plan and track events with detailed information
- **Contract Management**: Create and manage contracts with clients
- **Package Management**: Define and manage service packages
- **Financial Control**:
  - Cost tracking and management
  - Installment payments
  - Financial dashboard with reports
- **User Management**: Multi-user support with permission management
- **Reports**: Generate monthly reports and analytics
- **Settings**: Company settings and permission configuration
- **Responsive Design**: Mobile-friendly interface built with Tailwind CSS

## 🚀 Tech Stack

- **Framework**: Angular 20.x
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **State Management**: RxJS with service-based state management
- **HTTP Client**: Angular HttpClient with interceptors
- **Routing**: Angular Router with guards
- **Build Tool**: Angular CLI
- **Code Quality**: ESLint with Angular and TypeScript rules

## 📁 Project Structure

```
src/app/
├── core/                    # Core functionality (singleton services)
│   ├── guards/             # Route guards (auth, permissions)
│   ├── interceptors/       # HTTP interceptors (auth, token refresh)
│   └── services/           # Core services (auth, storage, API services)
├── features/               # Feature modules
│   ├── auth/              # Authentication pages
│   ├── dashboard/         # Main dashboard
│   ├── financial/         # Financial management (costs, installments)
│   ├── profile/           # User profile and settings
│   ├── register/          # Registration modules (clients, events, contracts, packages, users)
│   ├── reports/           # Report generation
│   └── settings/          # Application settings
├── layouts/               # Layout components
│   └── main-layout/       # Main application layout
├── shared/                # Shared resources
│   ├── components/        # Reusable components
│   ├── directives/        # Custom directives
│   ├── models/            # TypeScript interfaces and types
│   ├── utils/             # Utility functions
│   └── validators/        # Custom form validators
└── environments/          # Environment configurations
```

## 🏁 Getting Started

### Prerequisites

- Node.js (v18 or higher)
- npm or yarn
- Angular CLI (`npm install -g @angular/cli`)

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd easybuffet-angular
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
   - Configure `src/environments/environment.ts` for development
   - Configure `src/environments/environment.prod.ts` for production

4. Start the development server:
```bash
ng serve
```

5. Open your browser and navigate to `http://localhost:4200/`

## 💻 Development

### Development Server

Run the development server with live reload:

```bash
ng serve
```

The application will automatically reload when you modify source files.

### Code Scaffolding

Generate new components, services, and other Angular artifacts:

```bash
# Generate a new component
ng generate component features/feature-name/component-name

# Generate a new service
ng generate service core/services/service-name

# Generate a new guard
ng generate guard core/guards/guard-name

# See all available schematics
ng generate --help
```

### Linting

Check code quality and style:

```bash
npm run lint
```

Fix auto-fixable linting issues:

```bash
npm run lint:fix
```

## 📏 Code Standards

This project follows strict coding standards to ensure consistency and quality:

- **Language**: All code, comments, and documentation must be in English
- **Style Guide**: Follows Angular style guide and Clean Code principles
- **SOLID Principles**: Applied throughout the codebase
- **TypeScript**: Strict mode enabled, explicit typing required
- **ESLint**: Configured with Angular and TypeScript rules
- **No Semicolons**: Following the project's ESLint configuration
- **Indentation**: 2 spaces
- **Documentation**: All functions must have JSDoc comments

For detailed standards, see the workspace rules and development guidelines.

## 🏗️ Building

### Development Build

```bash
ng build
```

### Production Build

```bash
ng build --configuration production
```

Build artifacts will be stored in the `dist/` directory. Production builds are optimized for performance and speed.

## 🚀 Deployment

### Vercel Deployment

This project is configured to deploy on Vercel. The `vercel.json` file includes all necessary configurations.

#### Automatic Deployment

1. Connect your repository to Vercel
2. Vercel will automatically detect the Angular framework
3. Push to your main branch to trigger automatic deployments

#### Manual Deployment

Install Vercel CLI:
```bash
npm install -g vercel
```

Deploy to production:
```bash
vercel --prod
```

#### Configuration

The `vercel.json` file includes:
- Correct output directory (`dist/easybuffet-angular/browser`)
- SPA routing configuration (all routes redirect to `index.html`)
- Optimized caching headers for static assets
- Framework detection for Angular

#### Environment Variables

Set up environment variables in Vercel dashboard:
1. Go to Project Settings → Environment Variables
2. Add required variables for production
3. Redeploy to apply changes

## 🧪 Testing

### Unit Tests

Run unit tests with Karma:

```bash
ng test
```

### End-to-End Tests

```bash
ng e2e
```

Note: E2E testing framework needs to be configured separately.

## 🤝 Contributing

1. Follow the established code standards and style guide
2. Write meaningful commit messages in English
3. Ensure all tests pass before submitting
4. Update documentation as needed
5. Keep components focused and services reusable

### Commit Message Convention

Follow conventional commits format:

```
feat: add new feature
fix: bug fix
docs: documentation changes
style: code style changes
refactor: code refactoring
test: adding tests
chore: maintenance tasks
```

## 📚 Additional Resources

- [Angular Documentation](https://angular.dev)
- [Angular CLI Reference](https://angular.dev/tools/cli)
- [TypeScript Documentation](https://www.typescriptlang.org/docs/)
- [Tailwind CSS Documentation](https://tailwindcss.com/docs)
- [RxJS Documentation](https://rxjs.dev/)

## 📝 License

This project is proprietary software. All rights reserved.

---

**Built with ❤️ using Angular**
