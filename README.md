# A&H Futsal Booking System

A premium, modern futsal court booking application built with **Next.js 14**, **Tailwind CSS**, and **Supabase**.

## 🚀 Features

*   **Public Booking Portal**:
    *   Real-time slot availability.
    *   Mobile-responsive booking widget.
    *   Instant PDF receipt generation.
    *   Food court menu and facility showcase.
*   **Admin Dashboard**:
    *   Comprehensive analytics (Income, Occupancy, Cancellations).
    *   Manage bookings (Edit, Cancel, Delete).
    *   Dynamic pricing management (Peak/Off-peak rates).
    *   Slot closure management (Maintenance/Holidays).
    *   User role management (Super Admin, Moderator, User).
    *   Exportable reports (CSV, PDF).

## 🛠 Tech Stack

*   **Framework**: [Next.js](https://nextjs.org/) (App Router)
*   **Language**: TypeScript
*   **Styling**: [Tailwind CSS](https://tailwindcss.com/)
*   **UI Components**: [shadcn/ui](https://ui.shadcn.com/) + [Radix UI](https://www.radix-ui.com/)
*   **Icons**: [Lucide React](https://lucide.dev/)
*   **Backend / Database**: [Supabase](https://supabase.com/) (PostgreSQL)
*   **Authentication**: Supabase Auth

## 📦 Getting Started

### Prerequisites

*   Node.js 18+
*   npm or yarn

### Installation

1.  **Clone the repository**:
    ```bash
    git clone https://github.com/your-username/aandh-futsal.git
    cd aandh-futsal
    ```

2.  **Install dependencies**:
    ```bash
    npm install
    ```

3.  **Environment Setup**:
    Create a `.env.local` file in the root directory and add your Supabase credentials:
    ```bash
    NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
    NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
    ```

4.  **Run Development Server**:
    ```bash
    npm run dev
    ```
    Open [http://localhost:3000](http://localhost:3000) to view the app.

## 🗄️ Database Setup

The application requires a Supabase PostgreSQL database.
You can find the full schema definition in `supabase/schema.sql`.

See [DEPLOY.md](./DEPLOY.md) for detailed deployment and setup instructions.

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📄 License

This project is licensed under the MIT License.
