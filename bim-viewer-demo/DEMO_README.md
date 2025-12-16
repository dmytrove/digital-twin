# BIM Viewer Demo

A web application demonstrating 3D BIM visualization for data center equipment management and design workflows.

## Demo Overview

This application demonstrates how design will be delivered in the future for a customer with approximately 800 offices around the US containing IT/Data equipment.

### Key Features

1. **Map Page**: Interactive selection of data center sites across the US
2. **3D BIM Viewer**: Real-time 3D visualization of equipment and racks
3. **Layer Controls**: Toggle visibility for different "4D status" categories:
   - Existing To Be Retained (gray)
   - Existing To Be Removed (red)  
   - Proposed (green)
   - Future (orange)
   - Modified (blue)
4. **Color Coding**: Multiple visualization modes including 4D status and power consumption
5. **Inventory Table**: Interactive table showing equipment details with sync to 3D viewer
6. **Design Controls**: Add, remove, and modify equipment with real-time updates

## Getting Started

```bash
# Navigate to the project directory
cd bim-viewer-demo

# Install dependencies
npm install

# Start the development server
npm run dev
```

Open [http://localhost:5173](http://localhost:5173) in your browser.

## Demo Workflow

### Map Page
1. Customer selects a demo site from the interactive map
2. Click on any site to navigate to the BIM viewer

### Site Page - BIM Viewer
1. **Initial View**: Shows "As-Is" model with all existing equipment
2. **UI Controls**:
   - Layer controls: Toggle different equipment statuses
   - Color coding: Switch between 4D status, customer, and power consumption views
   - Building toggle: Hide/show building shell for better equipment visibility
   - Inventory table: Shows detailed equipment information

### Design Scenario Demo
1. **Current State**: View existing equipment layout
2. **Design Changes**:
   - Remove equipment by selecting it and clicking "Remove"
   - Add new equipment using the "Add Equipment" controls
   - Modify equipment status through the dropdown
3. **Visualization**:
   - Turn off building for better equipment visibility
   - Use color coding to see the full design (4 different colors)
   - Toggle layers to show different deployment phases:
     - "As-Is" = Existing To Be Retained + Existing To Be Removed
     - "To-Be" = Existing To Be Retained + Proposed
     - "Future" = Existing To Be Retained + Proposed + Future
4. **Inventory Integration**:
   - Select equipment in 3D view to highlight in inventory table
   - Select equipment in table to highlight in 3D view
   - View conditional formatting based on 4D status

### Post-Deployment Update
- Use "Apply Design Changes" to simulate deployment completion
- Equipment status automatically updates from "Proposed" to "Existing"
- Removed equipment is filtered out

## Technical Stack

- **Frontend**: React 18 with TypeScript
- **3D Graphics**: Three.js with React Three Fiber
- **Routing**: React Router
- **State Management**: Zustand
- **Styling**: Tailwind CSS
- **Icons**: Lucide React

## Project Structure

```
src/
├── components/
│   ├── controls/          # UI control components
│   ├── inventory/         # Inventory table components
│   └── viewer/           # 3D viewer components
├── data/                 # Synthetic BIM data
├── pages/               # Main page components
├── store/               # State management
└── types/              # TypeScript type definitions
```

## Data Model

The application uses realistic synthetic data including:
- **Equipment**: Servers, switches, routers, storage, UPS, PDUs, etc.
- **Manufacturers**: Dell, HP, Cisco, Palo Alto, NetApp, APC, Panduit
- **Specifications**: Power consumption, rack units, dimensions, serial numbers
- **Status Tracking**: 4D deployment status with temporal relationships

## Demo Sites

The demo includes 5 data center sites:
- New York Data Center
- Los Angeles Data Center  
- Chicago Data Center
- Houston Data Center
- Phoenix Data Center

Each site contains 15 racks with realistic equipment distributions and power requirements.