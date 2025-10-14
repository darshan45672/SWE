# Project Management Tool - Trello-like Kanban Board

A modern, responsive project management application built with Next.js 15, TypeScript, shadcn/ui, and @dnd-kit for drag-and-drop functionality.

## Features

### 🎯 Core Functionality
- **Kanban Board**: 3-column layout (To Do, In Progress, Done) with drag-and-drop
- **Issue Management**: Create, view, and manage issues with priorities, types, and assignees
- **Real-time Chat**: Team communication panel with message history
- **Collapsible Sidebar**: Filter issues by status (All, Active, Closed, My Issues)
- **Responsive Design**: Optimized for desktop, tablet, and mobile devices

### 🎨 Design Features
- **Modern UI**: Built with shadcn/ui components
- **Dark/Light Mode Ready**: Configured with theme support
- **Smooth Animations**: Drag-and-drop with visual feedback
- **Accessible**: WCAG compliant components

### 📱 Layout Structure
```
┌─────────────────────────────────────────────────────────────┐
│                    Top Navigation Bar                        │
├──────────┬──────────────────────────────────┬───────────────┤
│          │                                   │               │
│ Sidebar  │       Kanban Board                │  Chat Panel   │
│  (20%)   │         (50-60%)                  │    (20%)      │
│          │                                   │               │
│ Filters: │   ┌──────┬──────────┬──────────┐ │  Messages:    │
│ • All    │   │ TODO │ PROGRESS │   DONE   │ │  - User 1     │
│ • Active │   │      │          │          │ │  - User 2     │
│ • Closed │   │ [📋] │  [📋]    │   [✓]    │ │  - User 3     │
│ • Mine   │   │ [📋] │  [📋]    │          │ │               │
│          │   │      │          │          │ │  Input field  │
│          │   └──────┴──────────┴──────────┘ │               │
└──────────┴──────────────────────────────────┴───────────────┘
```

## Tech Stack

- **Framework**: Next.js 15 with App Router
- **Language**: TypeScript
- **Styling**: Tailwind CSS v4
- **UI Components**: shadcn/ui
- **Drag & Drop**: @dnd-kit
- **Icons**: Lucide React

## Project Structure

```
frontend/
├── app/
│   ├── layout.tsx          # Root layout with sidebar & navigation
│   ├── page.tsx            # Main page with Kanban board
│   └── globals.css         # Global styles & CSS variables
├── components/
│   ├── layout/
│   │   ├── app-sidebar.tsx      # Collapsible sidebar with filters
│   │   └── top-navigation.tsx   # Top nav with search & user menu
│   ├── kanban/
│   │   ├── kanban-board.tsx     # Main board with DnD context
│   │   ├── kanban-column.tsx    # Column with drop zone
│   │   └── issue-card.tsx       # Draggable issue card
│   ├── chat/
│   │   └── chat-panel.tsx       # Chat interface
│   └── ui/                      # shadcn/ui components
├── types/
│   └── index.ts            # TypeScript type definitions
├── lib/
│   ├── utils.ts            # Utility functions
│   └── mock-data.ts        # Sample data for development
└── hooks/
    └── use-mobile.ts       # Mobile detection hook
```

## Getting Started

### Installation

```bash
npm install
```

### Run Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Design Patterns & Best Practices

1. **Composition**: Reusable, composable UI components
2. **TypeScript**: Full type safety throughout
3. **Responsive**: Mobile-first design approach
4. **Accessible**: WCAG compliant components
5. **Performance**: Optimized rendering with React hooks

## License

MIT License
