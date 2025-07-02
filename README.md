# Custom 3D Modeler

A powerful web-based 3D modeling application that allows users to create and customize basic 3D shapes with real-time parameter control and custom shape generation from text prompts.

![Custom 3D Modeler](https://img.shields.io/badge/Status-Ready-green) ![Three.js](https://img.shields.io/badge/Three.js-r158-blue) ![WebGL](https://img.shields.io/badge/WebGL-Supported-orange)

## ✨ Features

### 🎯 Core Functionality
- **Interactive 3D Viewport**: Full WebGL-powered 3D environment with orbital camera controls
- **Shape Library**: Pre-built basic shapes (Cube, Sphere, Cylinder, Cone, Torus, Plane)
- **Real-time Parameter Control**: Modify all shape properties with live updates
- **Custom Shape Generation**: AI-powered shape creation from text prompts
- **Shape Selection & Editing**: Click to select and modify individual shapes
- **Export Functionality**: Save your 3D scenes as JSON files

### 🛠️ Shape Properties (All Customizable)
- **Dimensions**: Width, Height, Depth, Radius, etc.
- **Position**: X, Y, Z coordinates
- **Rotation**: 3-axis rotation control
- **Scale**: Independent scaling on all axes
- **Appearance**: Color selection and render modes
- **Geometry Details**: Segment count, resolution controls

### 🎨 Advanced Features
- **Multiple Render Modes**: Solid, Wireframe, Points
- **Camera Views**: Front, Side, Top, and custom angles
- **Real-time Lighting**: Ambient, directional, point, and hemisphere lighting
- **Grid & Axes**: Visual reference helpers
- **Keyboard Shortcuts**: Quick access to common functions
- **Responsive Design**: Works on desktop and mobile devices

## 🚀 Getting Started

### Prerequisites
- Modern web browser with WebGL support
- Python 3 (for local server)

### Installation & Setup

1. **Clone or download the project files**
   ```bash
   # If using git
   git clone <repository-url>
   cd custom-3d-modeler
   ```

2. **Start a local web server**
   ```bash
   # Using Python 3
   python3 -m http.server 8000
   
   # Or using the npm script
   npm run start
   ```

3. **Open your browser**
   ```
   Navigate to: http://localhost:8000
   ```

4. **Start creating!**
   - The application will load with an empty 3D scene
   - Use the shape library to add basic shapes
   - Try the custom shape prompt feature

## 🎮 How to Use

### Adding Basic Shapes
1. **Shape Library Panel** (left side):
   - Click any shape button (📦 Cube, 🔮 Sphere, etc.)
   - The shape will appear in the 3D viewport
   - It will be automatically selected for editing

### Creating Custom Shapes
1. **Custom Shape Section**:
   - Type a description in the prompt box
   - Examples: "red sphere with radius 2", "blue cylinder 3 units tall"
   - Click "Generate Shape"
   - The AI will interpret your prompt and create the shape

### Editing Shapes
1. **Selection**:
   - Click on any shape in the viewport to select it
   - Selected shapes are highlighted in orange
   - Properties panel will appear on the left

2. **Property Controls**:
   - Use sliders and number inputs to adjust parameters
   - Changes are applied in real-time
   - All properties are customizable

### Navigation & Views
1. **Camera Controls**:
   - **Mouse**: Drag to rotate, scroll to zoom
   - **View Buttons**: Quick front/side/top views
   - **Reset View**: Return to default camera position

2. **Render Modes**:
   - **Solid**: Standard 3D rendering
   - **Wireframe**: Show shape edges only
   - **Points**: Display vertices as points

### Keyboard Shortcuts
- `Ctrl + 1-6`: Add shapes (1=Cube, 2=Sphere, 3=Cylinder, 4=Cone, 5=Torus, 6=Plane)
- `Delete/Backspace`: Remove selected shape
- `Escape`: Deselect current shape
- `Ctrl + R`: Reset camera view

## 🔧 Technical Details

### Technology Stack
- **Frontend**: HTML5, CSS3, JavaScript (ES6+)
- **3D Engine**: Three.js (r158)
- **Rendering**: WebGL 2.0
- **Controls**: OrbitControls for camera manipulation

### Architecture
```
├── index.html          # Main application interface
├── style.css           # Complete styling and layout
├── app.js              # Main application logic & Three.js setup
├── shapes.js           # Shape management system
├── package.json        # Project configuration
└── README.md           # This file
```

### Key Classes
- **`App3DModeler`**: Main application controller
- **`ShapeManager`**: Handles shape creation, selection, and property management
- **Shape Library**: Extensible system for adding new shape types

## 🎨 Customization Examples

### Basic Shapes
```javascript
// Create a custom cube
shapeManager.createShape('cube', {
    width: 2, height: 1, depth: 3,
    color: 0xFF5722,
    x: 2, y: 0, z: -1
});
```

### Prompt Examples
Try these in the custom shape prompt:
- "green sphere with radius 1.5"
- "tall blue cylinder 4 units high"
- "red cone with 8 sides"
- "yellow torus with thick tube"
- "purple cube 2x3x1"

## 🌟 Advanced Features

### Shape Properties Panel
When a shape is selected, you can control:
- **Geometric Properties**: Size, segments, resolution
- **Transform Properties**: Position, rotation, scale
- **Visual Properties**: Color, material settings
- **Deletion**: Remove shapes from the scene

### Scene Management
- **Object List**: View all shapes in the scene
- **Export**: Save scene as JSON file
- **Multiple Selection**: Work with multiple shapes
- **Undo/Redo**: (Future feature)

## 🔍 Browser Support

### Recommended Browsers
- ✅ Chrome 80+
- ✅ Firefox 75+
- ✅ Safari 13+
- ✅ Edge 80+

### WebGL Requirements
- WebGL 2.0 support required
- Hardware acceleration recommended
- Minimum 2GB RAM for complex scenes

## 🐛 Troubleshooting

### Common Issues
1. **Black/Empty Viewport**:
   - Check WebGL support: Visit `webglreport.com`
   - Try refreshing the page
   - Check browser console for errors

2. **Shapes Not Appearing**:
   - Ensure you're clicking the shape buttons
   - Try resetting the camera view
   - Check if shapes are created outside viewport

3. **Performance Issues**:
   - Reduce number of segments on complex shapes
   - Use solid render mode instead of wireframe
   - Close other browser tabs

### Error Messages
- Check the browser console (F12) for detailed error information
- Status bar shows current application state
- Red status text indicates errors

## 🚧 Roadmap & Future Features

### Planned Enhancements
- [ ] Advanced shape operations (boolean, extrude, revolve)
- [ ] Material library with textures
- [ ] Animation system
- [ ] Scene templates
- [ ] Import/Export in various formats (OBJ, STL, GLTF)
- [ ] Collaborative editing
- [ ] VR/AR support

### Contributing
This is a demonstration project. For production use, consider:
- Adding unit tests
- Implementing proper error boundaries
- Adding accessibility features
- Optimizing for mobile devices

## 📱 Mobile Support

The application is responsive and works on mobile devices:
- Touch controls for camera navigation
- Responsive UI layout
- Optimized performance for mobile GPUs

## 🔒 Security & Privacy

- No data is sent to external servers
- All processing happens locally in your browser
- Export files are generated client-side
- No user tracking or analytics

---

**Built with ❤️ using Three.js and modern web technologies**

For questions or support, check the browser console for helpful tips and debug information.