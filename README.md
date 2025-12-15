# Connectify
Real-Time Video Chat Platform


src/
 ├── config/                 # Environment configs (database, auth, etc.)
 ├── common/
 │    ├── constants/         # Global constants
 │    ├── decorators/        # Custom decorators
 │    ├── exceptions/        # Custom exceptions
 │    ├── filters/           # Exception filters
 │    ├── guards/            # Auth guards, RBAC guards
 │    ├── interceptors/      # Logging, Transform, Timeout etc.
 │    ├── middlewares/       # Custom middlewares
 │    ├── pipes/             # Validation pipes
 │    └── utils/             # Helper functions
 │
 ├── modules/                # All feature modules here
 │    ├── user/
 │    │    ├── user.controller.ts
 │    │    ├── user.service.ts
 │    │    ├── user.module.ts
 │    │    ├── dto/
 │    │    ├── entity/
 │    │    └── repository/
 │    │
 │    ├── auth/
 │    │    ├── auth.controller.ts
 │    │    ├── auth.service.ts
 │    │    ├── strategies/ (JWT, Local, Refresh)
 │    │    ├── guards/
 │    │    ├── dto/
 │    │    └── auth.module.ts
 │    │
 │    ├── product/
 │    │    ├── product.controller.ts
 │    │    ├── product.service.ts
 │    │    ├── dto/
 │    │    ├── schemas/      # If using MongoDB (Mongoose)
 │    │    └── product.module.ts
 │
 ├── database/
 │    ├── mongoose.config.ts / typeorm.config.ts
 │    ├── seeds/
 │    └── migrations/
 │
 ├── app.module.ts           # Root module
 ├── main.ts                  # Application entry point
 │
 └── assets/                 # Static files (optional)