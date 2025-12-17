# BIM Viewer Demo

![BIM Viewer Demo](https://img.shields.io/badge/Status-Live%20Demo-brightgreen)
![React](https://img.shields.io/badge/React-18.2.0-blue)
![TypeScript](https://img.shields.io/badge/TypeScript-5.9.3-blue)
![Three.js](https://img.shields.io/badge/Three.js-0.182.0-green)

A cutting-edge 3D BIM visualization application demonstrating the future of design delivery for data center equipment management. Built with React, Three.js, and modern web technologies.

## 🚀 Live Demo

**[View Live Demo](https://yourusername.github.io/bim-viewer-demo/)**

## 📋 Overview

This application demonstrates how design will be delivered in the future for a customer with approximately 800 offices around the US containing IT/Data equipment. The demo showcases:

- **Interactive 3D BIM Visualization**: Real-time equipment and facility exploration
- **Geographic Site Selection**: OpenStreetMap integration for site navigation
- **4D Status Management**: Equipment lifecycle tracking and visualization
- **Professional UI Controls**: Layer management, color coding, and inventory systems

## ✨ Key Features

### 🗺️ Interactive Map
- **OpenStreetMap Integration**: Professional geographic navigation
- **5 Data Center Locations**: Realistic sites across major US cities
- **Click-to-Navigate**: Seamless transition from map to 3D facility view

### 🏗️ 3D BIM Viewer
- **Real-time 3D Visualization**: Powered by Three.js and React Three Fiber
- **Light Professional Theme**: Clean, modern interface optimized for demonstrations
- **Equipment Interaction**: Click to select and highlight individual equipment
- **Shadow Rendering**: Realistic lighting and shadows for depth perception

### 📊 4D Status Management
- **Existing To Be Retained** (Gray): Current equipment staying in place
- **Existing To Be Removed** (Red): Equipment scheduled for removal
- **Proposed** (Green): New equipment to be installed
- **Future** (Orange): Reserved space for future expansion
- **Modified** (Blue): Equipment being relocated

### 🎛️ Professional Controls
- **Layer Visibility**: Toggle different equipment status layers
- **Color Coding**: Multiple visualization modes including power consumption
- **Building Shell**: Hide/show building structure for better equipment visibility
- **Design Tools**: Add, remove, and modify equipment in real-time

### 📋 Equipment Inventory
- **Interactive Table**: Detailed equipment specifications and metadata
- **3D Sync**: Select equipment in table to highlight in 3D view
- **Filtering**: Show/hide based on layer visibility settings
- **BIM Data**: Comprehensive equipment information including power, serial numbers, etc.

## 🛠️ Technology Stack

- **Frontend Framework**: React 18 with TypeScript
- **3D Graphics**: Three.js with React Three Fiber
- **Mapping**: Leaflet with React-Leaflet and OpenStreetMap
- **State Management**: Zustand for efficient state handling
- **Routing**: React Router for navigation
- **Styling**: Custom CSS utilities (Tailwind-inspired)
- **Icons**: Lucide React for consistent iconography
- **Build Tool**: Vite for fast development and optimized builds

## 🚦 Getting Started

### Prerequisites

- **Node.js**: Version 18 or higher
- **npm**: Version 8 or higher

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/bim-viewer-demo.git
   cd bim-viewer-demo
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Start development server**
   ```bash
   npm run dev
   ```

4. **Open your browser**
   Navigate to `http://localhost:5173`

### Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build locally
- `npm run lint` - Run ESLint
- `npm run deploy` - Deploy to GitHub Pages (manual)

## 🌐 Deployment

This project is configured for automatic deployment to GitHub Pages using GitHub Actions.

### Automatic Deployment

1. **Push to main branch** - Deployment happens automatically
2. **GitHub Actions** will build and deploy to GitHub Pages
3. **Live site** will be available at `https://yourusername.github.io/bim-viewer-demo/`

### Manual Deployment

```bash
npm run deploy
```

### GitHub Pages Setup

1. Go to your repository settings
2. Navigate to **Pages** section
3. Set source to **GitHub Actions**
4. The workflow will handle the rest automatically

## 📁 Project Structure

```
bim-viewer-demo/
├── src/
│   ├── components/
│   │   ├── controls/          # UI control components
│   │   ├── inventory/         # Equipment inventory table
│   │   ├── map/              # OpenStreetMap components
│   │   └── viewer/           # 3D BIM viewer components
│   ├── data/                 # Synthetic BIM data generation
│   ├── pages/                # Main application pages
│   ├── store/                # Zustand state management
│   ├── types/                # TypeScript type definitions
│   └── main.tsx              # Application entry point
├── public/                   # Static assets
├── .github/
│   └── workflows/
│       └── deploy.yml        # GitHub Pages deployment
├── dist/                     # Production build output
└── docs/                     # Documentation assets
```

## 🎯 Demo Workflow

### 1. Map Navigation
- Start at the interactive map showing 5 data center locations
- Click any marker or site card to navigate to that facility

### 2. 3D Facility Exploration
- Explore the "As-Is" model with all existing equipment
- Use orbit controls to navigate around the 3D space
- Toggle building visibility for better equipment viewing

### 3. Design Scenario
- **View Current State**: See existing equipment layout
- **Make Design Changes**: Add/remove/modify equipment using controls
- **Toggle Layers**: Show different deployment phases
  - "As-Is" = Existing Retained + Existing To Be Removed
  - "To-Be" = Existing Retained + Proposed (Removed hidden)
  - "Future" = All layers including future expansion

### 4. Equipment Management
- **3D Selection**: Click equipment in 3D view to select
- **Inventory Sync**: Selected equipment highlights in inventory table
- **Detailed Information**: View specifications, power consumption, status
- **Status Modification**: Change equipment 4D status in real-time

### 5. Design Completion
- **Apply Changes**: Use "Apply Design Changes" to finalize modifications
- **Status Updates**: Equipment automatically transitions from Proposed to Existing
- **Documentation**: Take screenshots for project records

## 📊 Sample Data

The application includes realistic synthetic data:

- **5 Data Centers**: New York, Los Angeles, Chicago, Houston, Phoenix
- **75 Equipment Racks**: 15 racks per facility with realistic layouts
- **Comprehensive Equipment**: Servers, switches, routers, storage, UPS, PDUs
- **Real Manufacturers**: Dell, HP, Cisco, NetApp, APC, Palo Alto, Panduit
- **Detailed Specifications**: Power consumption, dimensions, serial numbers, asset tags

## 🎨 Design Philosophy

- **Professional Aesthetics**: Clean, light theme suitable for client presentations
- **Intuitive Navigation**: Familiar map-to-detail workflow
- **Performance Optimized**: Smooth 60fps 3D rendering
- **Responsive Design**: Works on desktop and tablet devices
- **Accessibility**: Clear contrast and readable typography

## 🔧 Configuration

### Vite Configuration

The project uses Vite with specific configuration for GitHub Pages:

```typescript
export default defineConfig({
  plugins: [react()],
  base: '/bim-viewer-demo/',
  build: {
    outDir: 'dist',
    assetsDir: 'assets',
    sourcemap: true
  }
})
```

### Environment Variables

No environment variables are required for basic functionality. All data is synthetic and generated client-side.

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- **Three.js Community**: For the excellent 3D graphics library
- **React Three Fiber**: For React integration with Three.js
- **OpenStreetMap**: For providing free map tiles
- **Leaflet**: For the robust mapping library
- **Zustand**: For simple and effective state management

## 🐛 Issues and Support

If you encounter any issues or have questions:

1. Check the [Issues](https://github.com/yourusername/bim-viewer-demo/issues) page
2. Create a new issue with detailed description
3. Include browser version and steps to reproduce

## 🚀 Future Enhancements

- **Multi-floor Support**: Handle complex building structures
- **Real-time Collaboration**: Multiple users editing simultaneously
- **Export Capabilities**: PDF reports and 3D model exports
- **Mobile App**: Native iOS/Android applications
- **VR Integration**: Immersive virtual reality exploration
- **API Integration**: Connect with real BIM databases

---

**Built with ❤️ using React, Three.js, and modern web technologies**