# CV Connect Engine

A modern job recruitment platform built with React, TypeScript, and Supabase.

## Features

- 👥 Candidate and Company profiles
- 💼 Job posting and management
- 📄 CV/Resume upload and parsing (PDF/DOCX)
- 💬 Real-time messaging between candidates and companies
- 📅 Interview scheduling
- 📊 Application tracking and matching
- 🔐 Secure authentication with Supabase
- ☁️ Cloud-based data storage

## Tech Stack

- **Frontend**: React 18, TypeScript, Vite
- **Styling**: Tailwind CSS, shadcn/ui
- **State Management**: React Query, Custom Store with Supabase
- **Backend**: Supabase (PostgreSQL, Auth, Storage)
- **Document Processing**: Mammoth (DOCX), pdfjs-dist (PDF)
- **Icons**: Lucide React
- **Notifications**: Sonner

## Setup Instructions

### 1. Clone the repository

```bash
git clone <repository-url>
cd cv-connect-engine-main
```

### 2. Install dependencies

```bash
npm install
```

### 3. Set up Supabase

1. Create a new project at [supabase.com](https://supabase.com)
2. Get your project URL and anon key from Settings > API
3. Create a `.env` file in the root directory:

```env
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

4. Set up the database schema:
   - Go to your Supabase project dashboard
   - Navigate to SQL Editor
   - Copy and paste the contents of `supabase_schema.sql`
   - Click "Run" to execute the schema

### 4. Run the development server

```bash
npm run dev
```

The application will be available at:
- Local: http://localhost:8080
- Network: http://[your-ip]:8080

### 5. Build for production

```bash
npm run build
```

Preview the production build:
```bash
npm run preview
```

## Environment Variables

| Variable | Description |
|----------|-------------|
| `VITE_SUPABASE_URL` | Your Supabase project URL |
| `VITE_SUPABASE_ANON_KEY` | Your Supabase anon key |

## Database Schema

The application uses the following tables:
- `users` - Extended user profiles
- `candidate_profiles` - Candidate resumes and information
- `company_profiles` - Company information
- `jobs` - Job postings
- `applications` - Job applications
- `interviews` - Scheduled interviews
- `notifications` - User notifications
- `export_history` - Job export/share history

## Key Features Explained

### Authentication
- Uses Supabase Auth for email/password authentication
- Extended user profiles stored in the `users` table
- Role-based access (candidate/company)

### Document Processing
- CV/resume upload supports PDF and DOCX formats
- Text extraction happens client-side using:
  - Mammoth for DOCX files
  - pdfjs-dist for PDF files
- Automatic field population from extracted text

### Job Management
- Companies can create, edit, and publish job postings
- Job description upload with automatic parsing
- Status tracking (draft, active, closed)

### Application System
- Candidates can apply to jobs with one click
- Match scoring based on skills, experience, etc.
- Application status tracking

### Real-time Features
- Notifications for application updates, interview requests, etc.
- Messaging system between candidates and companies

## Project Structure

```
src/
├── components/     # Reusable UI components
├── contexts/       # React contexts (Auth, Theme)
├── lib/            # Utilities, store, types, document parser
├── pages/          # Page components
└── App.tsx         # Main app component
```

## Development

### Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint
- `npm run test` - Run Vitest tests
- `npm run test:watch` - Run Vitest in watch mode

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License.

## Acknowledgments

- [Shadcn/ui](https://ui.shadcn.com/) for beautiful components
- [Supabase](https://supabase.com) for the backend infrastructure
- [Lucide](https://lucide.dev/) for icons
- [Sonner](https://sonner.emilkowal.ski/) for toast notifications