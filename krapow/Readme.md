# Krapow Smart Greenhouse Dashboard

A lightweight, client-side PWA dashboard for multi-greenhouse monitoring and control,
specifically designed for optimal Thai basil (holy basil) cultivation.

## Table of Contents

- [Krapow Smart Greenhouse Dashboard](#krapow-smart-greenhouse-dashboard)
  - [Table of Contents](#table-of-contents)
  - [Overview](#overview)
  - [Key Features](#key-features)
    - [1. Multi-Greenhouse Management](#1-multi-greenhouse-management)
    - [2. Environmental Monitoring](#2-environmental-monitoring)
    - [3. Control Systems](#3-control-systems)
    - [4. Data Visualization](#4-data-visualization)
    - [5. User Interface](#5-user-interface)
  - [System Architecture](#system-architecture)
    - [Component Breakdown](#component-breakdown)
    - [Data Flow](#data-flow)
  - [Technical Implementation](#technical-implementation)
    - [Core Technologies](#core-technologies)
    - [Key Dependencies](#key-dependencies)
    - [Development Tools](#development-tools)
  - [Repository Structure](#repository-structure)
    - [Key Files](#key-files)
  - [Installation Guide](#installation-guide)
    - [Prerequisites](#prerequisites)
    - [Quick Start](#quick-start)
    - [Development Setup](#development-setup)
  - [User Guide](#user-guide)
    - [Dashboard Overview](#dashboard-overview)
    - [Basic Operations](#basic-operations)
      - [Viewing Greenhouse Data](#viewing-greenhouse-data)
      - [Controlling Devices](#controlling-devices)
    - [Advanced Features](#advanced-features)
      - [Data Visualization](#data-visualization)
      - [Keyboard Shortcuts](#keyboard-shortcuts)
    - [Project Structure](#project-structure)
    - [Development Workflow](#development-workflow)
    - [Testing](#testing)
  - [Browser Compatibility](#browser-compatibility)
    - [Known Issues](#known-issues)
  - [Contributing](#contributing)
    - [To contribute or extend the project](#to-contribute-or-extend-the-project)
    - [Development Guidelines](#development-guidelines)
  - [Future Enhancements](#future-enhancements)
    - [Short-term Goals](#short-term-goals)
    - [Long-term Vision](#long-term-vision)
  - [License](#license)

---

## Overview

The Krapow Smart Greenhouse Dashboard provides real-time monitoring and control for up to 10 smart greenhouses. The system is designed to maintain optimal growing conditions for Thai basil through precise environmental control and monitoring.

- Real-time monitoring of critical environmental parameters
- Dashboard-based control
- Data visualization for better decision making
- Scalable architecture for multiple greenhouse units
- Responsive design for access on any device

Disclaimer:

> **Note**: Current implementation uses simulated data and UI-level controls.
> Hardware integration (MQTT) is planned for future versions.

---

## Key Features

### 1. Multi-Greenhouse Management

- Monitor and control up to 10 individual greenhouses
- Quick switching between greenhouse units
- Individual status overview for each unit

### 2. Environmental Monitoring

| Parameter | Range | Optimal Range |
| :-------: | :-------: | :-------: |
| `Temperature` | 15-40°C | 24-28°C |
| `Humidity` | 20-95% | 55-70% |
| `Soil Moisture` | 0-100% | 35-55% |
| `Light Intensity` | 0-100% | 60-80% |
| `Photoperiod` | 0–24 h | 12–16 h |

> Note: Optimal light conditions for Thai basil are typically defined
by daily photoperiod (12–16 hours). In the current implementation,
only relative light intensity (%) is actively simulated;
photoperiod control is planned for future versions.

### 3. Control Systems

- **Pump Control**: Manage irrigation systems
- **Fan Control**: Regulate temperature and airflow
- **Lighting Control**: Adjust grow lights
- **Misting System**: Control humidity levels

### 4. Data Visualization

- Real-time charts for all metrics
- Historical data trends
- Visual indicators for out-of-range conditions

### 5. User Interface

- Clean, intuitive dashboard
- Responsive design for all devices
- Accessibility compliant (WCAG 2.1)
- Real-time action logging

---

## System Architecture

The application follows a client-side architecture with the following components:

```mermaid
graph TD
    A[User Interface] --> B[Controller]
    B --> C[Data Model]
    C --> D[Simulated Data]
    C --> E[Future: MQTT Integration]
    B --> F[View Renderer]
    F --> G[Charts]
    F --> H[Controls]
    F --> I[Status Indicators]
```

### Component Breakdown

1. **Presentation Layer**
   - Responsive UI components
   - Real-time data visualization
   - User interaction handling

2. **Application Layer**
   - State management
   - Data processing
   - Event handling

3. **Data Layer**
   - Current: In-memory data simulation
   - Future: MQTT-based real-time data streaming

### Data Flow

1. User interacts with the dashboard
2. Controller processes the action
3. Data model updates accordingly
4. View re-renders to reflect changes
5. (Future) Commands sent to physical devices via MQTT

---

## Technical Implementation

### Core Technologies

| Technology | Purpose |
| :--------: | :------- |
| HTML5 | Structure & Semantics |
| CSS3 | Styling & Layout |
| JavaScript | Interactivity |
| Chart.js | Data Visualization |
| Chart.js Date Adapter | Time-based Charts |

### Key Dependencies

- **Chart.js**: For rendering interactive charts
- **date-fns**: Date manipulation for chart axes
- **Material Design**: UI/UX inspiration and patterns

### Development Tools

- No build tools required for basic operation
- VS Code recommended for development
- Browser DevTools for debugging

---

## Repository Structure

```text
Krapow/
├── index.html                 # Main application entry point
├── README.md                  # Project documentation
├── assets/
│   ├── css/
│   │   └── style.css          # Main stylesheet with theming and responsive design
│   ├── js/
│   │   ├── main.js            # Core application logic
│   │   └── charts.js          # Chart initialization and updates
│   ├── icons/                 # Application icons and favicon
│   ├── images/                # Static image assets
│   └── tmp/                   # Temporary mock assets (not tracked in production)
├── sw.js                      # Service worker for PWA capabilities
└── site.webmanifest           # Web app manifest for PWA installation
```

### Key Files

- `index.html`: Main application structure and layout
- `assets/css/style.css`: Styling and theming
- `assets/js/main.js`: Core application logic and state management
- `sw.js`: Service worker for offline functionality
- `site.webmanifest`: PWA configuration

```mermaid
graph TD
    A[Krapow/] --> B[index.html<br/>Main HTML file with semantic structure and component layout]
    A --> C[README.md<br/>Project documentation]
    A --> D[assets/]
    D --> E[css/]
    E --> F[style.css<br/>Stylesheet with green theme, responsive design, and Material elevations]
    D --> G[js/]
    G --> H[main.js<br/>JavaScript for interactivity, mock data simulation, and Chart.js integration]
    D --> I[icons/]
    I --> J[favicon.ico<br/>Favicon for browser tabs]
    D --> K[fonts/<br/>Empty - system fonts used]
    D --> L[images/<br/>Empty - no images used]
```

Key files:

- [`index.html`](index.html): Entry point with HTML structure, including headers, metrics cards, chart canvas, and control forms.
- [`assets/css/style.css`](assets/css/style.css): Comprehensive stylesheet defining the soft green theme, responsive breakpoints, and UI components.
- [`assets/js/main.js`](assets/js/main.js): Core logic for state management, rendering, event handling, and mock data updates.

---

## Installation Guide

### Prerequisites

- Modern web browser (Chrome, Firefox, Safari, or Edge)
- Git (for development)
- Node.js (optional, for development server)
  
**Note**: If testing PWA features, clear browser cache or unregister service workers when updating files.

### Quick Start

1. Clone the repository:

   ```bash
   git clone https://github.com/yourusername/panuwat.github.io.git
   cd panuwat.github.io/krapow
   ```

2. Open in browser:

   - Double-click `index.html` or
   - Use a local web server:

     ```bash
     # Python 3
     python -m http.server 8000
     # Then visit http://localhost:8000/krapow
     ```

3. The dashboard will load with simulated data, updating every 3 seconds.

### Development Setup

For development, we recommend using a local server to avoid CORS issues:

```bash
# Using Node.js http-server
npm install -g http-server
http-server -p 8000
```

Then open `http://localhost:8000` in your browser.

---

## User Guide

### Dashboard Overview

The dashboard is organized into several key sections:

1. **Header**
   - Application logo
   - Greenhouse selector tabs (KP 1-10)
   - Current greenhouse status indicator

2. **Metrics Panel**
   - Real-time environmental data
   - Visual gauges and trend indicators
   - Color-coded status indicators

3. **Control Panel**
   - Device toggles (Pump, Fan, Light, Mist)
   - Operation mode selection
   - Timing controls

### Basic Operations

#### Viewing Greenhouse Data

1. Select a greenhouse using the tabs (KP 1-10)
2. View current metrics in the gauges
3. Check the temperature trend in the chart
4. Review system status in the log panel

#### Controlling Devices

1. Select the desired greenhouse
2. Choose operation mode:
   - **On/Off**: Manual control
   - **Pulse**: Timed activation
   - **Auto**: Automatic control (future)
3. Set duration (for Pulse mode)
4. Click the device button to toggle state

### Advanced Features

#### Data Visualization

- Hover over chart points for detailed values
- Click and drag to zoom
- Double-click to reset zoom
- Toggle metrics using the legend

#### Keyboard Shortcuts

- `1-0`: Switch between greenhouses
- `P`: Toggle Pump
- `F`: Toggle Fan
- `L`: Toggle Light
- `M`: Toggle Misting

### Project Structure

```mermaid
graph TD
    A[index.html] --> B[assets/]
    B --> C[css/style.css]
    B --> D[js/main.js]
    B --> E[js/charts.js]
    B --> F[images/]
    B --> G[icons/]
```

### Development Workflow

1. Make changes to source files
2. Test in development server
3. Check browser console for errors
4. Validate HTML/CSS/JS
5. Commit changes with descriptive messages

### Testing

1. Test all greenhouse tabs
2. Verify responsive behavior
3. Check accessibility
4. Test all control functions
5. Verify data updates

---

## Browser Compatibility

The dashboard is tested and works on:

- Chrome 90+
- Firefox 85+
- Safari 14+
- Edge 90+

### Known Issues

- Limited offline functionality
- No data persistence between sessions
- Basic error handling

---

## Contributing

We welcome contributions! Please follow these steps:

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request

### To contribute or extend the project

   1. Edit files directly in a code editor (e.g., VS Code).
   2. Test changes by opening [`index.html`](index.html) in a browser.
   3. For Chart.js modifications, refer to the [`ensureChart`](assets/js/main.js) and [`updateChartSeries`](assets/js/main.js) functions in [`assets/js/main.js`](assets/js/main.js).
   4. Style updates can be made in [`assets/css/style.css`](assets/css/style.css), leveraging CSS custom properties for theming.
   5. Add new features by extending the state in [`ghStates`](assets/js/main.js) or adding event listeners.

   No linting or testing frameworks are currently set up; consider adding ESLint and Jest for code quality.

### Development Guidelines

- Follow existing code style
- Write clear commit messages
- Document new features
- Test thoroughly

---

## Future Enhancements

### Short-term Goals

- [ ] Implement MQTT integration
- [ ] Add user authentication
- [ ] Improve mobile experience
- [ ] Add data export functionality

### Long-term Vision

- [ ] Mobile app integration
- [ ] Advanced analytics
- [ ] Machine learning for optimization
- [ ] Multi-user support with roles

---

## License

Copyright © 2025 Panuwat Sangketkit

This project is licensed under the [MIT License](LICENSE).

---
