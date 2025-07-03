// Custom 3D Modeler Application
class App3DModeler {
    constructor() {
        this.scene = null;
        this.camera = null;
        this.renderer = null;
        this.controls = null;
        this.shapeManager = null;
        this.raycaster = new THREE.Raycaster();
        this.mouse = new THREE.Vector2();
        
        this.init();
        this.setupEventListeners();
        this.animate();
    }

    init() {
        // Get container
        const container = document.getElementById('threejs-container');
        
        // Scene setup
        this.scene = new THREE.Scene();
        this.scene.background = new THREE.Color(0x1e1e1e);

        // Camera setup
        this.camera = new THREE.PerspectiveCamera(
            75,
            container.clientWidth / container.clientHeight,
            0.1,
            1000
        );
        this.camera.position.set(5, 5, 5);

        // Renderer setup
        this.renderer = new THREE.WebGLRenderer({ 
            antialias: true,
            alpha: true 
        });
        this.renderer.setSize(container.clientWidth, container.clientHeight);
        this.renderer.setPixelRatio(window.devicePixelRatio);
        this.renderer.shadowMap.enabled = true;
        this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
        this.renderer.outputColorSpace = THREE.SRGBColorSpace;
        container.appendChild(this.renderer.domElement);

        // Controls setup (OrbitControls)
        this.setupControls();

        // Lighting setup
        this.setupLighting();

        // Grid helper
        const gridHelper = new THREE.GridHelper(20, 20, 0x444444, 0x222222);
        this.scene.add(gridHelper);

        // Axes helper
        const axesHelper = new THREE.AxesHelper(2);
        this.scene.add(axesHelper);

        // Initialize shape manager
        this.shapeManager = new ShapeManager(this.scene);

        // Handle window resize
        window.addEventListener('resize', () => this.onWindowResize());

        console.log('3D Modeler initialized successfully');
    }

    setupControls() {
        // Check if OrbitControls is available
        if (typeof THREE.OrbitControls !== 'undefined') {
            this.controls = new THREE.OrbitControls(this.camera, this.renderer.domElement);
        } else {
            // Fallback basic controls
            this.setupFallbackControls();
        }
        
        if (this.controls) {
            this.controls.enableDamping = true;
            this.controls.dampingFactor = 0.05;
            this.controls.screenSpacePanning = false;
            this.controls.minDistance = 2;
            this.controls.maxDistance = 50;
            this.controls.maxPolarAngle = Math.PI;
        }
    }

    setupFallbackControls() {
        // Simple fallback controls if OrbitControls is not available
        let isMouseDown = false;
        let mouseX = 0, mouseY = 0;

        this.renderer.domElement.addEventListener('mousedown', (event) => {
            isMouseDown = true;
            mouseX = event.clientX;
            mouseY = event.clientY;
        });

        this.renderer.domElement.addEventListener('mouseup', () => {
            isMouseDown = false;
        });

        this.renderer.domElement.addEventListener('mousemove', (event) => {
            if (!isMouseDown) return;

            const deltaX = event.clientX - mouseX;
            const deltaY = event.clientY - mouseY;

            this.camera.position.x = this.camera.position.x * Math.cos(deltaX * 0.01) - this.camera.position.z * Math.sin(deltaX * 0.01);
            this.camera.position.z = this.camera.position.x * Math.sin(deltaX * 0.01) + this.camera.position.z * Math.cos(deltaX * 0.01);

            mouseX = event.clientX;
            mouseY = event.clientY;

            this.camera.lookAt(this.scene.position);
        });

        this.renderer.domElement.addEventListener('wheel', (event) => {
            const scale = event.deltaY > 0 ? 1.1 : 0.9;
            this.camera.position.multiplyScalar(scale);
            this.camera.lookAt(this.scene.position);
            event.preventDefault();
        });
    }

    setupLighting() {
        // Ambient light
        const ambientLight = new THREE.AmbientLight(0x404040, 0.6);
        this.scene.add(ambientLight);

        // Directional light
        const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
        directionalLight.position.set(10, 10, 5);
        directionalLight.castShadow = true;
        directionalLight.shadow.mapSize.width = 2048;
        directionalLight.shadow.mapSize.height = 2048;
        directionalLight.shadow.camera.near = 0.5;
        directionalLight.shadow.camera.far = 50;
        this.scene.add(directionalLight);

        // Point light
        const pointLight = new THREE.PointLight(0xffffff, 0.5);
        pointLight.position.set(-10, 10, 10);
        this.scene.add(pointLight);

        // Hemisphere light
        const hemisphereLight = new THREE.HemisphereLight(0xffffff, 0x444444, 0.3);
        this.scene.add(hemisphereLight);
    }

    setupEventListeners() {
        // Shape library buttons
        document.querySelectorAll('.shape-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.preventDefault();
                const shapeType = btn.getAttribute('data-shape');
                this.addShape(shapeType);
                
                // Visual feedback
                document.querySelectorAll('.shape-btn').forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                
                setTimeout(() => btn.classList.remove('active'), 300);
            });
        });

        // Custom shape generation
        document.getElementById('generateShape').addEventListener('click', () => {
            const prompt = document.getElementById('shapePrompt').value.trim();
            if (prompt) {
                this.generateCustomShape(prompt);
                document.getElementById('shapePrompt').value = '';
            } else {
                this.showMessage('Please enter a shape description');
            }
        });

        // Camera view controls
        document.getElementById('frontView').addEventListener('click', () => {
            this.setCameraView('front');
        });
        document.getElementById('sideView').addEventListener('click', () => {
            this.setCameraView('side');
        });
        document.getElementById('topView').addEventListener('click', () => {
            this.setCameraView('top');
        });

        // Render mode control
        document.getElementById('renderMode').addEventListener('change', (e) => {
            this.shapeManager.setRenderMode(e.target.value);
        });

        // Header controls
        document.getElementById('resetView').addEventListener('click', () => {
            this.resetCamera();
        });
        document.getElementById('exportModel').addEventListener('click', () => {
            this.shapeManager.exportScene();
        });

        // Mouse interaction for shape selection
        this.renderer.domElement.addEventListener('click', (event) => {
            this.onMouseClick(event);
        });

        // Mouse position tracking
        this.renderer.domElement.addEventListener('mousemove', (event) => {
            this.updateMousePosition(event);
        });

        // Keyboard shortcuts
        document.addEventListener('keydown', (event) => {
            this.handleKeyboardShortcuts(event);
        });
    }

    addShape(type) {
        const shape = this.shapeManager.createShape(type);
        
        // Add some random positioning to avoid overlap
        const randomOffset = (Math.random() - 0.5) * 3;
        shape.position.x += randomOffset;
        shape.position.z += randomOffset;
        
        this.shapeManager.selectShape(shape);
    }

    generateCustomShape(prompt) {
        this.shapeManager.generateCustomShape(prompt);
    }

    onMouseClick(event) {
        // Calculate mouse position in normalized device coordinates
        const rect = this.renderer.domElement.getBoundingClientRect();
        this.mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
        this.mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;

        // Update the raycaster
        this.raycaster.setFromCamera(this.mouse, this.camera);

        // Calculate objects intersecting the ray
        const intersects = this.raycaster.intersectObjects(this.shapeManager.shapes);

        if (intersects.length > 0) {
            // Select the first intersected shape
            this.shapeManager.selectShape(intersects[0].object);
        } else {
            // Deselect if clicking on empty space
            this.shapeManager.selectShape(null);
        }
    }

    updateMousePosition(event) {
        const rect = this.renderer.domElement.getBoundingClientRect();
        const x = event.clientX - rect.left;
        const y = event.clientY - rect.top;
        
        document.getElementById('mousePosition').textContent = `X: ${Math.round(x)}, Y: ${Math.round(y)}`;
    }

    setCameraView(view) {
        const distance = 8;
        let position;

        switch (view) {
            case 'front':
                position = new THREE.Vector3(0, 0, distance);
                break;
            case 'side':
                position = new THREE.Vector3(distance, 0, 0);
                break;
            case 'top':
                position = new THREE.Vector3(0, distance, 0);
                break;
            default:
                position = new THREE.Vector3(5, 5, 5);
        }

        this.animateCamera(position);
    }

    animateCamera(targetPosition) {
        const startPosition = this.camera.position.clone();
        const duration = 1000; // 1 second
        let startTime = null;

        const animate = (currentTime) => {
            if (!startTime) startTime = currentTime;
            const progress = Math.min((currentTime - startTime) / duration, 1);
            
            // Smooth easing function
            const easeProgress = 1 - Math.pow(1 - progress, 3);
            
            this.camera.position.lerpVectors(startPosition, targetPosition, easeProgress);
            this.camera.lookAt(0, 0, 0);

            if (progress < 1) {
                requestAnimationFrame(animate);
            }
        };

        requestAnimationFrame(animate);
    }

    resetCamera() {
        this.animateCamera(new THREE.Vector3(5, 5, 5));
        this.shapeManager.updateStatus('Camera view reset');
    }

    handleKeyboardShortcuts(event) {
        // Prevent default for handled shortcuts
        const handled = true;

        switch (event.key.toLowerCase()) {
            case 'delete':
            case 'backspace':
                if (this.shapeManager.selectedShape) {
                    this.shapeManager.deleteShape(this.shapeManager.selectedShape);
                    event.preventDefault();
                }
                break;
            case 'escape':
                this.shapeManager.selectShape(null);
                event.preventDefault();
                break;
            case '1':
                if (event.ctrlKey) {
                    this.addShape('cube');
                    event.preventDefault();
                }
                break;
            case '2':
                if (event.ctrlKey) {
                    this.addShape('sphere');
                    event.preventDefault();
                }
                break;
            case '3':
                if (event.ctrlKey) {
                    this.addShape('cylinder');
                    event.preventDefault();
                }
                break;
            case '4':
                if (event.ctrlKey) {
                    this.addShape('cone');
                    event.preventDefault();
                }
                break;
            case '5':
                if (event.ctrlKey) {
                    this.addShape('torus');
                    event.preventDefault();
                }
                break;
            case '6':
                if (event.ctrlKey) {
                    this.addShape('plane');
                    event.preventDefault();
                }
                break;
            case 'r':
                if (event.ctrlKey) {
                    this.resetCamera();
                    event.preventDefault();
                }
                break;
            default:
                // No action for other keys
                break;
        }
    }

    onWindowResize() {
        const container = document.getElementById('threejs-container');
        
        this.camera.aspect = container.clientWidth / container.clientHeight;
        this.camera.updateProjectionMatrix();
        
        this.renderer.setSize(container.clientWidth, container.clientHeight);
    }

    showMessage(message, type = 'info') {
        this.shapeManager.updateStatus(message);
        
        // Could be expanded to show toast notifications
        console.log(`[${type.toUpperCase()}] ${message}`);
    }

    animate() {
        requestAnimationFrame(() => this.animate());

        // Update controls
        if (this.controls && this.controls.update) {
            this.controls.update();
        }

        // Render the scene
        this.renderer.render(this.scene, this.camera);
    }

    // Public API methods
    getShapeManager() {
        return this.shapeManager;
    }

    getScene() {
        return this.scene;
    }

    getCamera() {
        return this.camera;
    }

    getRenderer() {
        return this.renderer;
    }
}

// Initialize the application when the page loads
document.addEventListener('DOMContentLoaded', () => {
    console.log('Initializing Custom 3D Modeler...');
    
    // Check for WebGL support
    if (!window.WebGLRenderingContext) {
        alert('WebGL is not supported in this browser. The 3D modeler may not work properly.');
        return;
    }

    // Initialize the app
    window.app3DModeler = new App3DModeler();

    // Add some helpful console messages
    console.log('🎯 Custom 3D Modeler loaded successfully!');
    console.log('💡 Tips:');
    console.log('   - Click shapes in the library to add them');
    console.log('   - Use the prompt bar to create custom shapes');
    console.log('   - Click on shapes in the viewport to select and edit them');
    console.log('   - Use Ctrl+1-6 to quickly add shapes');
    console.log('   - Press Delete to remove selected shapes');
    console.log('   - Press Escape to deselect');
    console.log('   - Use Ctrl+R to reset camera view');
});

// Global error handling
window.addEventListener('error', (event) => {
    console.error('Application error:', event.error);
    
    // Update status with error
    const statusElement = document.getElementById('statusText');
    if (statusElement) {
        statusElement.textContent = 'An error occurred. Check console for details.';
        statusElement.style.color = '#f44336';
    }
});

// Handle unhandled promise rejections
window.addEventListener('unhandledrejection', (event) => {
    console.error('Unhandled promise rejection:', event.reason);
    event.preventDefault();
});