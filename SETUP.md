# Project Setup Guide

This guide will help you set up the Lingo application (React.js + PostgreSQL) locally.

## Prerequisites

-   **Node.js**: Ensure you have Node.js installed (v18 or higher recommended).
-   **PostgreSQL**: You need a local PostgreSQL instance running.
-   **Clerk Account**: You need a Clerk account for authentication.
-   **Stripe Account (Optional)**: For payment integration features.

## 1. Clone the Repository

If you haven't already, clone the repository to your local machine.

## 2. Environment Variables

Create a `.env` file in the root directory of the project. You can copy the `.env.example` if it exists, or use the following template:

```env
# Clerk Authentication
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_...
CLERK_SECRET_KEY=sk_test_...

# Admin IDs (User IDs from Clerk that have admin access, separated by comma and space)
CLERK_ADMIN_IDS="user_..., user_..."

# Database Connection String (Local PostgreSQL)
# Format: postgresql://<user>:<password>@localhost:5432/<database_name>
DATABASE_URL="postgresql://postgres:password@localhost:5432/lingo"

# Stripe (Optional - can be left blank or mocked if not testing payments)
STRIPE_API_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...

# Public App URL
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

**Important:** Update `DATABASE_URL` with your actual local PostgreSQL credentials.

## 3. Install Dependencies

Run the following command to install the necessary packages:

```bash
npm install
```

## 4. Database Setup

1.  **Create the Database**: Ensure the database name specified in your `DATABASE_URL` exists in your PostgreSQL instance (e.g., `lingo`). You can create it using a tool like pgAdmin or the command line:
    ```bash
    createdb lingo
    ```

2.  **Initialize Schema**: Run the SQL script to create tables. You can use `psql` or any DB client.
    ```bash
    psql "postgresql://postgres:password@localhost:5432/lingo" -f db/schema.sql
    ```
    *(Replace the connection string with your actual credentials)*

3.  **Seed Database**: Populate the database with initial data (courses, units, lessons, etc.).
    ```bash
    npm run db:prod
    ```

## 5. Running the Application

Start the development server:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser to see the application.

## 6. Admin Panel

To access the admin panel, you must be logged in with a user whose ID is listed in `CLERK_ADMIN_IDS` in your `.env` file. Navigate to:

[http://localhost:3000/admin](http://localhost:3000/admin)

## Troubleshooting

-   **Database Connection Errors**: Double-check your `DATABASE_URL` string. Ensure the PostgreSQL service is running and the user has permissions.
-   **Missing Modules**: If you encounter errors about missing modules, try deleting `node_modules` and `package-lock.json`, then run `npm install` again.
-   **Build Errors**: If `npm run build` fails, ensure you have set the environment variables correctly, especially the Clerk keys, as Next.js requires them during build time for some configurations.
