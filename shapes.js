// Shape Management System
class ShapeManager {
    constructor(scene) {
        this.scene = scene;
        this.shapes = [];
        this.selectedShape = null;
        this.shapeCounter = 0;
        this.materials = this.createMaterials();
    }

    createMaterials() {
        return {
            default: new THREE.MeshPhongMaterial({ 
                color: 0x4CAF50,
                shininess: 100,
                transparent: true,
                opacity: 0.9 
            }),
            selected: new THREE.MeshPhongMaterial({ 
                color: 0xFF9800,
                shininess: 100,
                transparent: true,
                opacity: 0.9 
            }),
            wireframe: new THREE.MeshBasicMaterial({ 
                color: 0x4CAF50,
                wireframe: true 
            })
        };
    }

    createShape(type, parameters = {}) {
        let geometry;
        const defaultParams = this.getDefaultParameters(type);
        const params = { ...defaultParams, ...parameters };

        switch (type) {
            case 'cube':
                geometry = new THREE.BoxGeometry(params.width, params.height, params.depth);
                break;
            case 'sphere':
                geometry = new THREE.SphereGeometry(params.radius, params.widthSegments, params.heightSegments);
                break;
            case 'cylinder':
                geometry = new THREE.CylinderGeometry(params.radiusTop, params.radiusBottom, params.height, params.radialSegments);
                break;
            case 'cone':
                geometry = new THREE.ConeGeometry(params.radius, params.height, params.radialSegments);
                break;
            case 'torus':
                geometry = new THREE.TorusGeometry(params.radius, params.tube, params.radialSegments, params.tubularSegments);
                break;
            case 'plane':
                geometry = new THREE.PlaneGeometry(params.width, params.height, params.widthSegments, params.heightSegments);
                break;
            default:
                geometry = new THREE.BoxGeometry(1, 1, 1);
        }

        const material = this.materials.default.clone();
        material.color.setHex(params.color || 0x4CAF50);
        
        const mesh = new THREE.Mesh(geometry, material);
        mesh.position.set(params.x || 0, params.y || 0, params.z || 0);
        mesh.rotation.set(params.rotationX || 0, params.rotationY || 0, params.rotationZ || 0);
        mesh.scale.set(params.scaleX || 1, params.scaleY || 1, params.scaleZ || 1);

        // Add shape metadata
        mesh.userData = {
            id: ++this.shapeCounter,
            type: type,
            name: `${type.charAt(0).toUpperCase() + type.slice(1)} ${this.shapeCounter}`,
            parameters: params,
            originalMaterial: material
        };

        this.scene.add(mesh);
        this.shapes.push(mesh);

        this.updateObjectsList();
        this.updateStatus(`Added ${mesh.userData.name}`);

        return mesh;
    }

    getDefaultParameters(type) {
        const defaults = {
            cube: {
                width: 1, height: 1, depth: 1,
                x: 0, y: 0, z: 0,
                rotationX: 0, rotationY: 0, rotationZ: 0,
                scaleX: 1, scaleY: 1, scaleZ: 1,
                color: 0x4CAF50
            },
            sphere: {
                radius: 1, widthSegments: 32, heightSegments: 16,
                x: 0, y: 0, z: 0,
                rotationX: 0, rotationY: 0, rotationZ: 0,
                scaleX: 1, scaleY: 1, scaleZ: 1,
                color: 0x4CAF50
            },
            cylinder: {
                radiusTop: 1, radiusBottom: 1, height: 2, radialSegments: 32,
                x: 0, y: 0, z: 0,
                rotationX: 0, rotationY: 0, rotationZ: 0,
                scaleX: 1, scaleY: 1, scaleZ: 1,
                color: 0x4CAF50
            },
            cone: {
                radius: 1, height: 2, radialSegments: 32,
                x: 0, y: 0, z: 0,
                rotationX: 0, rotationY: 0, rotationZ: 0,
                scaleX: 1, scaleY: 1, scaleZ: 1,
                color: 0x4CAF50
            },
            torus: {
                radius: 1, tube: 0.4, radialSegments: 16, tubularSegments: 100,
                x: 0, y: 0, z: 0,
                rotationX: 0, rotationY: 0, rotationZ: 0,
                scaleX: 1, scaleY: 1, scaleZ: 1,
                color: 0x4CAF50
            },
            plane: {
                width: 2, height: 2, widthSegments: 1, heightSegments: 1,
                x: 0, y: 0, z: 0,
                rotationX: 0, rotationY: 0, rotationZ: 0,
                scaleX: 1, scaleY: 1, scaleZ: 1,
                color: 0x4CAF50
            }
        };

        return defaults[type] || defaults.cube;
    }

    selectShape(shape) {
        // Deselect previous shape
        if (this.selectedShape) {
            this.selectedShape.material = this.selectedShape.userData.originalMaterial;
        }

        this.selectedShape = shape;
        
        if (shape) {
            // Highlight selected shape
            shape.material = this.materials.selected;
            this.showShapeProperties(shape);
            this.updateSelectedInfo(shape.userData.name);
        } else {
            this.hideShapeProperties();
            this.updateSelectedInfo('Click a shape to see properties');
        }

        this.updateObjectsList();
    }

    updateShapeParameter(parameter, value) {
        if (!this.selectedShape) return;

        const shape = this.selectedShape;
        const params = shape.userData.parameters;
        params[parameter] = parseFloat(value);

        // Update geometry if needed
        if (['width', 'height', 'depth', 'radius', 'radiusTop', 'radiusBottom', 'radialSegments', 'heightSegments', 'widthSegments', 'tube', 'tubularSegments'].includes(parameter)) {
            this.regenerateGeometry(shape);
        }

        // Update transform
        if (parameter === 'x' || parameter === 'y' || parameter === 'z') {
            shape.position.set(params.x, params.y, params.z);
        }
        if (parameter === 'rotationX' || parameter === 'rotationY' || parameter === 'rotationZ') {
            shape.rotation.set(params.rotationX, params.rotationY, params.rotationZ);
        }
        if (parameter === 'scaleX' || parameter === 'scaleY' || parameter === 'scaleZ') {
            shape.scale.set(params.scaleX, params.scaleY, params.scaleZ);
        }
        if (parameter === 'color') {
            shape.material.color.setHex(value);
            shape.userData.originalMaterial.color.setHex(value);
        }
    }

    regenerateGeometry(shape) {
        const type = shape.userData.type;
        const params = shape.userData.parameters;
        let newGeometry;

        switch (type) {
            case 'cube':
                newGeometry = new THREE.BoxGeometry(params.width, params.height, params.depth);
                break;
            case 'sphere':
                newGeometry = new THREE.SphereGeometry(params.radius, params.widthSegments, params.heightSegments);
                break;
            case 'cylinder':
                newGeometry = new THREE.CylinderGeometry(params.radiusTop, params.radiusBottom, params.height, params.radialSegments);
                break;
            case 'cone':
                newGeometry = new THREE.ConeGeometry(params.radius, params.height, params.radialSegments);
                break;
            case 'torus':
                newGeometry = new THREE.TorusGeometry(params.radius, params.tube, params.radialSegments, params.tubularSegments);
                break;
            case 'plane':
                newGeometry = new THREE.PlaneGeometry(params.width, params.height, params.widthSegments, params.heightSegments);
                break;
        }

        if (newGeometry) {
            shape.geometry.dispose();
            shape.geometry = newGeometry;
        }
    }

    deleteShape(shape) {
        const index = this.shapes.indexOf(shape);
        if (index > -1) {
            this.scene.remove(shape);
            shape.geometry.dispose();
            shape.material.dispose();
            this.shapes.splice(index, 1);

            if (this.selectedShape === shape) {
                this.selectShape(null);
            }

            this.updateObjectsList();
            this.updateStatus(`Deleted ${shape.userData.name}`);
        }
    }

    generateCustomShape(prompt) {
        // Simple prompt parsing for custom shapes
        const lowerPrompt = prompt.toLowerCase();
        let shapeType = 'cube';
        let parameters = {};

        // Parse shape type
        if (lowerPrompt.includes('sphere') || lowerPrompt.includes('ball')) {
            shapeType = 'sphere';
        } else if (lowerPrompt.includes('cylinder') || lowerPrompt.includes('tube')) {
            shapeType = 'cylinder';
        } else if (lowerPrompt.includes('cone') || lowerPrompt.includes('pyramid')) {
            shapeType = 'cone';
        } else if (lowerPrompt.includes('torus') || lowerPrompt.includes('donut') || lowerPrompt.includes('ring')) {
            shapeType = 'torus';
        } else if (lowerPrompt.includes('plane') || lowerPrompt.includes('flat') || lowerPrompt.includes('square')) {
            shapeType = 'plane';
        }

        // Parse dimensions
        const numbers = prompt.match(/\d+(\.\d+)?/g);
        if (numbers) {
            const num1 = parseFloat(numbers[0]);
            const num2 = numbers[1] ? parseFloat(numbers[1]) : num1;
            const num3 = numbers[2] ? parseFloat(numbers[2]) : num1;

            switch (shapeType) {
                case 'cube':
                    parameters = { width: num1, height: num2, depth: num3 };
                    break;
                case 'sphere':
                    parameters = { radius: num1 };
                    break;
                case 'cylinder':
                    parameters = { radiusTop: num1, radiusBottom: num1, height: num2 };
                    break;
                case 'cone':
                    parameters = { radius: num1, height: num2 };
                    break;
                case 'torus':
                    parameters = { radius: num1, tube: num2 * 0.3 };
                    break;
                case 'plane':
                    parameters = { width: num1, height: num2 };
                    break;
            }
        }

        // Parse color
        if (lowerPrompt.includes('red')) parameters.color = 0xFF5722;
        else if (lowerPrompt.includes('blue')) parameters.color = 0x2196F3;
        else if (lowerPrompt.includes('green')) parameters.color = 0x4CAF50;
        else if (lowerPrompt.includes('yellow')) parameters.color = 0xFFEB3B;
        else if (lowerPrompt.includes('purple')) parameters.color = 0x9C27B0;
        else if (lowerPrompt.includes('orange')) parameters.color = 0xFF9800;

        // Add some randomness to position
        parameters.x = (Math.random() - 0.5) * 4;
        parameters.z = (Math.random() - 0.5) * 4;

        const shape = this.createShape(shapeType, parameters);
        shape.userData.name = `Custom ${shape.userData.id}`;
        
        this.selectShape(shape);
        this.updateStatus(`Generated custom shape from prompt`);

        return shape;
    }

    showShapeProperties(shape) {
        const propertiesPanel = document.getElementById('propertiesPanel');
        const propertiesContainer = document.getElementById('shapeProperties');
        
        propertiesPanel.style.display = 'block';
        propertiesContainer.innerHTML = '';

        const params = shape.userData.parameters;
        const type = shape.userData.type;

        // Create property controls based on shape type
        const controls = this.getShapeControls(type);
        
        controls.forEach(control => {
            const controlGroup = document.createElement('div');
            controlGroup.className = 'control-group';

            const label = document.createElement('label');
            label.textContent = control.label;
            controlGroup.appendChild(label);

            if (control.type === 'range') {
                const rangeContainer = document.createElement('div');
                rangeContainer.className = 'range-input';

                const rangeInput = document.createElement('input');
                rangeInput.type = 'range';
                rangeInput.min = control.min;
                rangeInput.max = control.max;
                rangeInput.step = control.step;
                rangeInput.value = params[control.property];

                const numberInput = document.createElement('input');
                numberInput.type = 'number';
                numberInput.min = control.min;
                numberInput.max = control.max;
                numberInput.step = control.step;
                numberInput.value = params[control.property];

                const updateValue = (value) => {
                    rangeInput.value = value;
                    numberInput.value = value;
                    this.updateShapeParameter(control.property, value);
                };

                rangeInput.addEventListener('input', (e) => updateValue(e.target.value));
                numberInput.addEventListener('input', (e) => updateValue(e.target.value));

                rangeContainer.appendChild(rangeInput);
                rangeContainer.appendChild(numberInput);
                controlGroup.appendChild(rangeContainer);
            } else if (control.type === 'color') {
                const colorInput = document.createElement('input');
                colorInput.type = 'color';
                colorInput.value = `#${params[control.property].toString(16).padStart(6, '0')}`;
                colorInput.addEventListener('change', (e) => {
                    const hex = parseInt(e.target.value.substring(1), 16);
                    this.updateShapeParameter(control.property, hex);
                });
                controlGroup.appendChild(colorInput);
            }

            propertiesContainer.appendChild(controlGroup);
        });

        // Add delete button
        const deleteButton = document.createElement('button');
        deleteButton.className = 'btn btn-secondary';
        deleteButton.textContent = 'Delete Shape';
        deleteButton.style.width = '100%';
        deleteButton.style.marginTop = '1rem';
        deleteButton.addEventListener('click', () => {
            this.deleteShape(shape);
        });
        propertiesContainer.appendChild(deleteButton);
    }

    hideShapeProperties() {
        const propertiesPanel = document.getElementById('propertiesPanel');
        propertiesPanel.style.display = 'none';
    }

    getShapeControls(type) {
        const baseControls = [
            { label: 'Position X', property: 'x', type: 'range', min: -10, max: 10, step: 0.1 },
            { label: 'Position Y', property: 'y', type: 'range', min: -10, max: 10, step: 0.1 },
            { label: 'Position Z', property: 'z', type: 'range', min: -10, max: 10, step: 0.1 },
            { label: 'Rotation X', property: 'rotationX', type: 'range', min: 0, max: Math.PI * 2, step: 0.1 },
            { label: 'Rotation Y', property: 'rotationY', type: 'range', min: 0, max: Math.PI * 2, step: 0.1 },
            { label: 'Rotation Z', property: 'rotationZ', type: 'range', min: 0, max: Math.PI * 2, step: 0.1 },
            { label: 'Scale X', property: 'scaleX', type: 'range', min: 0.1, max: 3, step: 0.1 },
            { label: 'Scale Y', property: 'scaleY', type: 'range', min: 0.1, max: 3, step: 0.1 },
            { label: 'Scale Z', property: 'scaleZ', type: 'range', min: 0.1, max: 3, step: 0.1 },
            { label: 'Color', property: 'color', type: 'color' }
        ];

        const shapeSpecific = {
            cube: [
                { label: 'Width', property: 'width', type: 'range', min: 0.1, max: 5, step: 0.1 },
                { label: 'Height', property: 'height', type: 'range', min: 0.1, max: 5, step: 0.1 },
                { label: 'Depth', property: 'depth', type: 'range', min: 0.1, max: 5, step: 0.1 }
            ],
            sphere: [
                { label: 'Radius', property: 'radius', type: 'range', min: 0.1, max: 3, step: 0.1 },
                { label: 'Width Segments', property: 'widthSegments', type: 'range', min: 8, max: 64, step: 1 },
                { label: 'Height Segments', property: 'heightSegments', type: 'range', min: 6, max: 32, step: 1 }
            ],
            cylinder: [
                { label: 'Radius Top', property: 'radiusTop', type: 'range', min: 0, max: 3, step: 0.1 },
                { label: 'Radius Bottom', property: 'radiusBottom', type: 'range', min: 0.1, max: 3, step: 0.1 },
                { label: 'Height', property: 'height', type: 'range', min: 0.1, max: 5, step: 0.1 },
                { label: 'Segments', property: 'radialSegments', type: 'range', min: 8, max: 64, step: 1 }
            ],
            cone: [
                { label: 'Radius', property: 'radius', type: 'range', min: 0.1, max: 3, step: 0.1 },
                { label: 'Height', property: 'height', type: 'range', min: 0.1, max: 5, step: 0.1 },
                { label: 'Segments', property: 'radialSegments', type: 'range', min: 8, max: 64, step: 1 }
            ],
            torus: [
                { label: 'Radius', property: 'radius', type: 'range', min: 0.1, max: 3, step: 0.1 },
                { label: 'Tube', property: 'tube', type: 'range', min: 0.01, max: 1, step: 0.01 },
                { label: 'Radial Segments', property: 'radialSegments', type: 'range', min: 8, max: 32, step: 1 },
                { label: 'Tubular Segments', property: 'tubularSegments', type: 'range', min: 16, max: 200, step: 1 }
            ],
            plane: [
                { label: 'Width', property: 'width', type: 'range', min: 0.1, max: 5, step: 0.1 },
                { label: 'Height', property: 'height', type: 'range', min: 0.1, max: 5, step: 0.1 },
                { label: 'Width Segments', property: 'widthSegments', type: 'range', min: 1, max: 32, step: 1 },
                { label: 'Height Segments', property: 'heightSegments', type: 'range', min: 1, max: 32, step: 1 }
            ]
        };

        return [...(shapeSpecific[type] || []), ...baseControls];
    }

    updateObjectsList() {
        const objectsList = document.getElementById('objectsList');
        objectsList.innerHTML = '';

        if (this.shapes.length === 0) {
            objectsList.innerHTML = '<p class="empty-state">No objects in scene</p>';
            return;
        }

        this.shapes.forEach(shape => {
            const objectItem = document.createElement('div');
            objectItem.className = `object-item ${this.selectedShape === shape ? 'selected' : ''}`;

            const objectName = document.createElement('span');
            objectName.className = 'object-name';
            objectName.textContent = shape.userData.name;

            const objectActions = document.createElement('div');
            objectActions.className = 'object-actions';

            const selectBtn = document.createElement('button');
            selectBtn.textContent = '👁️';
            selectBtn.title = 'Select';
            selectBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                this.selectShape(shape);
            });

            const deleteBtn = document.createElement('button');
            deleteBtn.textContent = '🗑️';
            deleteBtn.title = 'Delete';
            deleteBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                this.deleteShape(shape);
            });

            objectActions.appendChild(selectBtn);
            objectActions.appendChild(deleteBtn);

            objectItem.appendChild(objectName);
            objectItem.appendChild(objectActions);

            objectItem.addEventListener('click', () => {
                this.selectShape(shape);
            });

            objectsList.appendChild(objectItem);
        });
    }

    updateSelectedInfo(text) {
        const infoElement = document.getElementById('selectedShapeInfo');
        infoElement.textContent = text;
    }

    updateStatus(text) {
        const statusElement = document.getElementById('statusText');
        statusElement.textContent = text;
    }

    setRenderMode(mode) {
        this.shapes.forEach(shape => {
            switch (mode) {
                case 'wireframe':
                    shape.material.wireframe = true;
                    break;
                case 'points':
                    shape.material = new THREE.PointsMaterial({ color: shape.material.color, size: 2 });
                    break;
                default: // solid
                    shape.material.wireframe = false;
                    if (shape.material instanceof THREE.PointsMaterial) {
                        shape.material = shape.userData.originalMaterial;
                    }
            }
        });
    }

    exportScene() {
        const sceneData = {
            shapes: this.shapes.map(shape => ({
                type: shape.userData.type,
                name: shape.userData.name,
                parameters: shape.userData.parameters
            }))
        };

        const dataStr = JSON.stringify(sceneData, null, 2);
        const dataBlob = new Blob([dataStr], { type: 'application/json' });
        const url = URL.createObjectURL(dataBlob);
        
        const link = document.createElement('a');
        link.href = url;
        link.download = 'scene.json';
        link.click();
        
        URL.revokeObjectURL(url);
        this.updateStatus('Scene exported successfully');
    }

    clear() {
        this.shapes.forEach(shape => {
            this.scene.remove(shape);
            shape.geometry.dispose();
            shape.material.dispose();
        });
        this.shapes = [];
        this.selectedShape = null;
        this.updateObjectsList();
        this.hideShapeProperties();
        this.updateSelectedInfo('Click a shape to see properties');
        this.updateStatus('Scene cleared');
    }
}