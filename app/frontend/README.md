# ISST AI Tutor Frontend

React TypeScript frontend with Supabase authentication and Tailwind CSS.

## Quick Start

```bash
cd frontend
npm install
cp .env.example .env.local
# Edit .env.local with your Supabase credentials
npm run dev
```

## 🔧 Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint

## 🛠️ Tech Stack

- **React 18** - UI framework
- **TypeScript** - Type safety
- **Vite** - Build tool
- **Tailwind CSS** - Styling
- **Supabase** - Authentication & database
- **React Markdown** - Markdown rendering
- **Lucide React** - Icons

## 🎨 Features

- ✅ **Dark/Light theme** with system preference detection
- ✅ **Authentication** via Supabase (Google/GitHub)
- ✅ **File uploads** (PDF, images)
- ✅ **Markdown rendering** for AI responses
- ✅ **Responsive design**
- ✅ **Session management**
- ✅ **Real-time chat** interface

## 🔐 Environment Variables

Required in `.env`:

```env
VITE_SUPABASE_URL=https://your_project.supabase.co
VITE_SUPABASE_ANON_KEY=your_anon_key_here
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
```

## 🏗️ Build & Deploy

```bash
# Build for production
npm run build

# Preview production build locally
npm run preview
```

The built files will be in the `dist/` directory, ready for deployment to any static hosting service.
