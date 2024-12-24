# Mystical Object Emporium

A modern social platform built with Next.js that enables users to share and catalog mystical and unique objects with detailed specifications, materials, and properties. Mystical Object Emporium serves as a comprehensive database and social space for collectors and enthusiasts to document, discuss, and discover extraordinary items with precise physical attributes and semantic classifications.

## 🌟 Features

### 📱 Core Features
- **Post Creation & Management**
  - Share objects with detailed specifications
  - Upload media attachments
  - Add physical properties (dimensions, weight)
  - Tag materials, colors, and shapes
  - Integrate WikiData labels for semantic categorization
  - Custom tagging system

- **Social Interaction**
  - Nested commenting system
  - Like/unlike posts
  - User profiles
  - Activity tracking

- **Search & Discovery**
  - Advanced search functionality
  - Paginated post listings
  - Personalized home feed

### 🔒 User System
- Secure authentication
- Profile customization
- Avatar management
- Activity history tracking

## 🛠️ Technical Stack

- **Frontend Framework**: Next.js 14
- **Language**: TypeScript
- **Styling**: 
  - Tailwind CSS
  - PostCSS
- **State Management**: React Context
- **API Communication**: Axios
- **Data Validation**: TypeScript interfaces

## 🚀 Getting Started

### Prerequisites
- Node.js 18.x or higher
- npm/yarn/pnpm

### Installation

1. Clone the repository:
```bash
git clone [repository-url]
```

2. Install dependencies:
```bash
npm install
```

3. Create a `.env.local` file:
```env
NEXT_PUBLIC_API_URL=your_api_url
```

4. Start the development server:
```bash
npm run dev
```

Visit `http://localhost:3000` to see the application.

## 📁 Project Structure

```
├── app/                  # App router pages
├── components/          # Reusable components
│   ├── TagInput.tsx
│   ├── WikiDataSearch.tsx
│   └── WikiTagDropdown.tsx
├── contexts/           # React contexts
│   └── AuthContext.tsx
├── hooks/              # Custom React hooks
│   └── useDebounce.ts
├── utils/              # Utility functions
│   └── api.ts
└── public/            # Static assets
```

## 🔌 API Integration

### Public Endpoints
- Authentication (login/register)
- Post retrieval
- Search functionality

### Protected Endpoints
- Post management
- Comment system
- Profile updates
- User interactions

## 🎨 Components

### TagInput
- Custom tag input component
- Supports adding/removing tags
- Auto-completion support

### WikiDataSearch
- Integration with WikiData API
- Semantic label search
- Auto-suggestions

### WikiTagDropdown
- Dropdown component for WikiData labels
- Search and select functionality

## 🔧 Configuration Files

- `next.config.js` - Next.js configuration
- `tailwind.config.js` - Tailwind CSS configuration
- `postcss.config.js` - PostCSS configuration
- `tsconfig.json` - TypeScript configuration

## 🚀 Deployment

This project can be deployed on Vercel with zero configuration:

1. Push your code to a Git repository
2. Import your project to Vercel
3. Configure environment variables
4. Deploy

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 📞 Support

For support, email [osmanyusufyildirim@gmail.com] or open an issue in the repository.

---

Built with ❤️ using Next.js and TypeScript
