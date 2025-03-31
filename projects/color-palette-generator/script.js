document.addEventListener('DOMContentLoaded', function() {
    // DOM Elements
    const baseColorInput = document.getElementById('baseColor');
    const hexColorInput = document.getElementById('hexColor');
    const colorCountSlider = document.getElementById('colorCount');
    const colorsCountDisplay = document.getElementById('colorsCount');
    const generateBtn = document.getElementById('generateBtn');
    const saveBtn = document.getElementById('saveBtn');
    const exportBtn = document.getElementById('exportBtn');
    const paletteDisplay = document.getElementById('paletteDisplay');
    const savedPalettes = document.getElementById('savedPalettes');
    const methodBtns = document.querySelectorAll('.method-btn');
    const exportModal = document.getElementById('exportModal');
    const closeModal = document.querySelector('.close-modal');
    const cssCode = document.getElementById('cssCode');
    const copyBtn = document.getElementById('copyBtn');
    
    // State variables
    let currentMethod = 'random';
    let currentPalette = [];
    
    // Initialize the app
    init();
    
    function init() {
        // Set up event listeners
        baseColorInput.addEventListener('input', function() {
            hexColorInput.value = this.value;
            if (currentMethod !== 'random') generatePalette();
        });
        
        hexColorInput.addEventListener('input', function() {
            // Validate and format hex color
            let hex = this.value;
            if (!hex.startsWith('#')) hex = '#' + hex;
            
            // Ensure it's a valid hex color
            if (/^#[0-9A-F]{6}$/i.test(hex)) {
                baseColorInput.value = hex;
                if (currentMethod !== 'random') generatePalette();
            }
        });
        
        colorCountSlider.addEventListener('input', function() {
            colorsCountDisplay.textContent = this.value;
            generatePalette();
        });
        
        generateBtn.addEventListener('click', generatePalette);
        
        saveBtn.addEventListener('click', savePalette);
        
        exportBtn.addEventListener('click', function() {
            exportModal.style.display = 'block';
        });
        
        closeModal.addEventListener('click', function() {
            exportModal.style.display = 'none';
        });
        
        copyBtn.addEventListener('click', function() {
            const textArea = document.createElement('textarea');
            textArea.value = cssCode.textContent;
            document.body.appendChild(textArea);
            textArea.select();
            document.execCommand('copy');
            document.body.removeChild(textArea);
            
            this.innerHTML = '<i class="fas fa-check"></i> Copied!';
            setTimeout(() => {
                this.innerHTML = '<i class="fas fa-copy"></i> Copy Code';
            }, 1500);
        });
        
        methodBtns.forEach(btn => {
            btn.addEventListener('click', function() {
                methodBtns.forEach(b => b.classList.remove('active'));
                this.classList.add('active');
                currentMethod = this.getAttribute('data-method');
                generatePalette();
            });
        });
        
        // Close modal when clicking outside
        window.addEventListener('click', function(e) {
            if (e.target === exportModal) {
                exportModal.style.display = 'none';
            }
        });
        
        // Load saved palettes and generate initial palette
        loadSavedPalettes();
        generatePalette();
    }
    
    function generatePalette() {
        const colorCount = parseInt(colorCountSlider.value);
        const baseColor = baseColorInput.value;
        
        switch(currentMethod) {
            case 'monochromatic':
                currentPalette = generateMonochromaticPalette(baseColor, colorCount);
                break;
            case 'analogous':
                currentPalette = generateAnalogousPalette(baseColor, colorCount);
                break;
            case 'complementary':
                currentPalette = generateComplementaryPalette(baseColor, colorCount);
                break;
            case 'triadic':
                currentPalette = generateTriadicPalette(baseColor, colorCount);
                break;
            default:
                currentPalette = generateRandomPalette(colorCount);
        }
        
        displayPalette();
        updateCSSCode();
    }
    
    function displayPalette() {
        paletteDisplay.innerHTML = '';
        
        currentPalette.forEach(color => {
            const colorBlock = document.createElement('div');
            colorBlock.className = 'color-block';
            colorBlock.style.backgroundColor = color;
            
            // Determine if text should be white or black based on color brightness
            const brightness = calculateBrightness(color);
            const textColor = brightness > 128 ? 'black' : 'white';
            
            colorBlock.innerHTML = `
                <div class="color-info" style="color: ${textColor}">${color}</div>
                <div class="copied-message" style="color: white">Copied!</div>
            `;
            
            // Add click to copy functionality
            colorBlock.addEventListener('click', function() {
                const textArea = document.createElement('textarea');
                textArea.value = color;
                document.body.appendChild(textArea);
                textArea.select();
                document.execCommand('copy');
                document.body.removeChild(textArea);
                
                // Show copied message
                this.classList.add('copied');
                setTimeout(() => {
                    this.classList.remove('copied');
                }, 1000);
            });
            
            paletteDisplay.appendChild(colorBlock);
        });
    }
    
    function updateCSSCode() {
        let code = ':root {\n';
        
        currentPalette.forEach((color, index) => {
            code += `  --color-${index + 1}: ${color};\n`;
        });
        
        code += '}';
        cssCode.textContent = code;
    }
    
    function savePalette() {
        const palettes = JSON.parse(localStorage.getItem('savedPalettes') || '[]');
        const newPalette = {
            id: Date.now(),
            colors: currentPalette,
            date: new Date().toLocaleDateString()
        };
        
        palettes.push(newPalette);
        localStorage.setItem('savedPalettes', JSON.stringify(palettes));
        
        displaySavedPalettes(palettes);
    }
    
    function loadSavedPalettes() {
        const palettes = JSON.parse(localStorage.getItem('savedPalettes') || '[]');
        displaySavedPalettes(palettes);
    }
    
    function displaySavedPalettes(palettes) {
        if (palettes.length === 0) {
            savedPalettes.innerHTML = `
                <div class="placeholder-message">
                    <i class="fas fa-paint-brush"></i>
                    <p>Your saved palettes will appear here</p>
                </div>
            `;
            return;
        }
        
        savedPalettes.innerHTML = '';
        
        palettes.forEach(palette => {
            const paletteElement = document.createElement('div');
            paletteElement.className = 'saved-palette';
            paletteElement.dataset.id = palette.id;
            
            let colorsHTML = '';
            palette.colors.forEach(color => {
                colorsHTML += `<div class="color-mini" style="background-color: ${color}"></div>`;
            });
            
            paletteElement.innerHTML = `
                <div class="palette-preview">${colorsHTML}</div>
                <div class="palette-info">
                    <div class="palette-date">${palette.date}</div>
                    <div class="palette-actions-mini">
                        <button class="mini-action load-palette"><i class="fas fa-sync-alt"></i></button>
                        <button class="mini-action export-palette"><i class="fas fa-file-export"></i></button>
                        <button class="mini-action delete delete-palette"><i class="fas fa-trash"></i></button>
                    </div>
                </div>
            `;
            
            // Add event listeners
            paletteElement.querySelector('.load-palette').addEventListener('click', () => {
                loadPalette(palette.colors);
            });
            
            paletteElement.querySelector('.export-palette').addEventListener('click', () => {
                exportPalette(palette.colors);
            });
            
            paletteElement.querySelector('.delete-palette').addEventListener('click', () => {
                deletePalette(palette.id);
            });
            
            savedPalettes.appendChild(paletteElement);
        });
    }
    
    function loadPalette(colors) {
        currentPalette = colors;
        displayPalette();
        updateCSSCode();
    }
    
    function exportPalette(colors) {
        currentPalette = colors;
        updateCSSCode();
        exportModal.style.display = 'block';
    }
    
    function deletePalette(id) {
        const palettes = JSON.parse(localStorage.getItem('savedPalettes') || '[]');
        const updatedPalettes = palettes.filter(p => p.id !== id);
        localStorage.setItem('savedPalettes', JSON.stringify(updatedPalettes));
        displaySavedPalettes(updatedPalettes);
    }
    
    // Helper functions for color manipulation
    function hexToRgb(hex) {
        const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
        return result ? {
            r: parseInt(result[1], 16),
            g: parseInt(result[2], 16),
            b: parseInt(result[3], 16)
        } : null;
    }
    
    function rgbToHex(r, g, b) {
        return "#" + ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1);
    }
    
    function hslToRgb(h, s, l) {
        let r, g, b;
        
        if (s === 0) {
            r = g = b = l; // achromatic
        } else {
            const hue2rgb = (p, q, t) => {
                if (t < 0) t += 1;
                if (t > 1) t -= 1;
                if (t < 1/6) return p + (q - p) * 6 * t;
                if (t < 1/2) return q;
                if (t < 2/3) return p + (q - p) * (2/3 - t) * 6;
                return p;
            };
            
            const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
            const p = 2 * l - q;
            
            r = hue2rgb(p, q, h + 1/3);
            g = hue2rgb(p, q, h);
            b = hue2rgb(p, q, h - 1/3);
        }
        
        return {
            r: Math.round(r * 255),
            g: Math.round(g * 255),
            b: Math.round(b * 255)
        };
    }
    
    function rgbToHsl(r, g, b) {
        r /= 255;
        g /= 255;
        b /= 255;
        
        const max = Math.max(r, g, b);
        const min = Math.min(r, g, b);
        let h, s, l = (max + min) / 2;
        
        if (max === min) {
            h = s = 0; // achromatic
        } else {
            const d = max - min;
            s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
            
            switch(max) {
                case r: h = (g - b) / d + (g < b ? 6 : 0); break;
                case g: h = (b - r) / d + 2; break;
                case b: h = (r - g) / d + 4; break;
            }
            
            h /= 6;
        }
        
        return { h, s, l };
    }
    
    function calculateBrightness(hex) {
        const rgb = hexToRgb(hex);
        return (rgb.r * 299 + rgb.g * 587 + rgb.b * 114) / 1000;
    }
    
    // Palette generation functions
    function generateRandomPalette(count) {
        const palette = [];
        
        for (let i = 0; i < count; i++) {
            const r = Math.floor(Math.random() * 256);
            const g = Math.floor(Math.random() * 256);
            const b = Math.floor(Math.random() * 256);
            palette.push(rgbToHex(r, g, b));
        }
        
        return palette;
    }
    
    function generateMonochromaticPalette(baseColor, count) {
        const rgb = hexToRgb(baseColor);
        const hsl = rgbToHsl(rgb.r, rgb.g, rgb.b);
        const palette = [];
        
        // Generate shades by varying lightness
        for (let i = 0; i < count; i++) {
            const l = 0.1 + (i / (count - 1)) * 0.7; // Lightness from 0.1 to 0.8
            const newRgb = hslToRgb(hsl.h, hsl.s, l);
            palette.push(rgbToHex(newRgb.r, newRgb.g, newRgb.b));
        }
        
        return palette;
    }
    
    function generateAnalogousPalette(baseColor, count) {
        const rgb = hexToRgb(baseColor);
        const hsl = rgbToHsl(rgb.r, rgb.g, rgb.b);
        const palette = [];
        
        // Generate colors by shifting hue
        const hueRange = 0.2; // 72 degrees total range (36 degrees each side)
        const hueStep = hueRange / (count - 1);
        
        for (let i = 0; i < count; i++) {
            let h = hsl.h - hueRange/2 + i * hueStep;
            
            // Ensure h is between 0 and 1
            if (h < 0) h += 1;
            if (h > 1) h -= 1;
            
            const newRgb = hslToRgb(h, hsl.s, hsl.l);
            palette.push(rgbToHex(newRgb.r, newRgb.g, newRgb.b));
        }
        
        return palette;
    }
    
    function generateComplementaryPalette(baseColor, count) {
        const rgb = hexToRgb(baseColor);
        const hsl = rgbToHsl(rgb.r, rgb.g, rgb.b);
        const palette = [];
        
        // Generate a palette with the base color, its complement, and shades in between
        for (let i = 0; i < count; i++) {
            let h = hsl.h + (i / (count - 1)) * 0.5; // Shift hue up to 180 degrees (0.5 in HSL)
            if (h > 1) h -= 1;
            
            const s = 0.7 + (i / (count - 1)) * 0.3; // Vary saturation slightly
            const l = 0.4 + (i / (count - 1)) * 0.2; // Vary lightness slightly
            
            const newRgb = hslToRgb(h, s, l);
            palette.push(rgbToHex(newRgb.r, newRgb.g, newRgb.b));
        }
        
        return palette;
    }
    
    function generateTriadicPalette(baseColor, count) {
        const rgb = hexToRgb(baseColor);
        const hsl = rgbToHsl(rgb.r, rgb.g, rgb.b);
        const palette = [];
        
        // Generate colors based on triadic harmony (three equidistant colors on the color wheel)
        for (let i = 0; i < count; i++) {
            let h = (hsl.h + (i / count)) % 1;
            const s = 0.7 + (Math.sin(i * Math.PI / count) * 0.3);
            const l = 0.4 + (Math.cos(i * Math.PI / count) * 0.2);
            
            const newRgb = hslToRgb(h, s, l);
            palette.push(rgbToHex(newRgb.r, newRgb.g, newRgb.b));
        }
        
        return palette;
    }
});
