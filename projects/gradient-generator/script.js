document.addEventListener('DOMContentLoaded', function() {
    // DOM Elements
    const gradientPreview = document.getElementById('gradientPreview');
    const cssCode = document.getElementById('cssCode');
    const copyCodeBtn = document.getElementById('copyCode');
    const typeButtons = document.querySelectorAll('.option');
    const directionButtons = document.querySelectorAll('.direction');
    const shapeButtons = document.querySelectorAll('.shape');
    const angleSlider = document.getElementById('angleSlider');
    const angleValue = document.getElementById('angleValue');
    const addColorStopBtn = document.getElementById('addColorStop');
    const colorStopsContainer = document.getElementById('colorStops');
    const linearControls = document.getElementById('linearControls');
    const radialControls = document.getElementById('radialControls');
    const enableAnimation = document.getElementById('enableAnimation');
    const animationOptions = document.getElementById('animationOptions');
    const animationDuration = document.getElementById('animationDuration');
    const animationType = document.getElementById('animationType');

    // Gradient state
    let gradientState = {
        type: 'linear',
        direction: 'to right',
        angle: 90,
        shape: 'circle',
        colorStops: [
            { color: '#6c63ff', position: 0 },
            { color: '#ff4e50', position: 100 }
        ],
        animation: {
            enabled: false,
            duration: 5,
            type: 'rotate'
        }
    };

    // Initialize the app
    initializeApp();

    // Event listeners
    typeButtons.forEach(button => {
        button.addEventListener('click', function() {
            typeButtons.forEach(btn => btn.classList.remove('active'));
            this.classList.add('active');
            
            gradientState.type = this.getAttribute('data-type');
            updateControlVisibility();
            updateGradient();
        });
    });

    directionButtons.forEach(button => {
        button.addEventListener('click', function() {
            directionButtons.forEach(btn => btn.classList.remove('active'));
            this.classList.add('active');
            
            gradientState.direction = this.getAttribute('data-direction');
            updateGradient();
        });
    });

    shapeButtons.forEach(button => {
        button.addEventListener('click', function() {
            shapeButtons.forEach(btn => btn.classList.remove('active'));
            this.classList.add('active');
            
            gradientState.shape = this.getAttribute('data-shape');
            updateGradient();
        });
    });

    angleSlider.addEventListener('input', function() {
        gradientState.angle = this.value;
        angleValue.textContent = this.value;
        updateGradient();
    });

    addColorStopBtn.addEventListener('click', addColorStop);

    enableAnimation.addEventListener('change', function() {
        gradientState.animation.enabled = this.checked;
        animationOptions.style.display = this.checked ? 'block' : 'none';
        updateGradient();
    });

    animationDuration.addEventListener('input', function() {
        gradientState.animation.duration = this.value;
        updateGradient();
    });

    animationType.addEventListener('change', function() {
        gradientState.animation.type = this.value;
        updateGradient();
    });

    copyCodeBtn.addEventListener('click', function() {
        const textArea = document.createElement('textarea');
        textArea.value = cssCode.textContent;
        document.body.appendChild(textArea);
        textArea.select();
        document.execCommand('copy');
        document.body.removeChild(textArea);
        
        // Feedback for copy action
        const originalText = this.innerHTML;
        this.innerHTML = '<i class="fas fa-check"></i> Copied!';
        setTimeout(() => {
            this.innerHTML = originalText;
        }, 2000);
    });

    // Functions
    function initializeApp() {
        // Set initial color stop inputs
        updateColorStopInputs();
        updateGradient();
        updateControlVisibility();
    }

    function updateControlVisibility() {
        linearControls.style.display = gradientState.type === 'linear' ? 'block' : 'none';
        radialControls.style.display = gradientState.type === 'radial' ? 'block' : 'none';
    }

    function updateColorStopInputs() {
        // Clear existing color stops
        colorStopsContainer.innerHTML = '';
        
        // Add color stop inputs based on state
        gradientState.colorStops.forEach((stop, index) => {
            const stopId = `stop${index + 1}`;
            const colorStopHtml = `
                <div class="color-stop" data-id="${stopId}">
                    <input type="color" value="${stop.color}" class="color-picker">
                    <input type="number" value="${stop.position}" min="0" max="100" class="position-input">
                    <span class="position-label">%</span>
                    ${index > 1 ? '<button class="remove-stop"><i class="fas fa-times"></i></button>' : ''}
                </div>
            `;
            
            colorStopsContainer.insertAdjacentHTML('beforeend', colorStopHtml);
            
            // Add event listeners to the new inputs
            const newColorPicker = colorStopsContainer.querySelector(`.color-stop[data-id="${stopId}"] .color-picker`);
            const newPositionInput = colorStopsContainer.querySelector(`.color-stop[data-id="${stopId}"] .position-input`);
            
            newColorPicker.addEventListener('input', function() {
                gradientState.colorStops[index].color = this.value;
                updateGradient();
            });
            
            newPositionInput.addEventListener('input', function() {
                gradientState.colorStops[index].position = parseInt(this.value) || 0;
                updateGradient();
            });
            
            // Add remove button functionality
            if (index > 1) {
                const removeBtn = colorStopsContainer.querySelector(`.color-stop[data-id="${stopId}"] .remove-stop`);
                removeBtn.addEventListener('click', function() {
                    gradientState.colorStops.splice(index, 1);
                    updateColorStopInputs();
                    updateGradient();
                });
            }
        });
    }

    function addColorStop() {
        // Add a new color stop
        const lastStop = gradientState.colorStops[gradientState.colorStops.length - 1];
        const newPosition = Math.min(lastStop.position + 10, 100);
        
        gradientState.colorStops.push({
            color: lastStop.color,
            position: newPosition
        });
        
        updateColorStopInputs();
        updateGradient();
    }

    function generateGradientCSS() {
        const sortedStops = [...gradientState.colorStops].sort((a, b) => a.position - b.position);
        let gradientString = '';
        
        if (gradientState.type === 'linear') {
            if (gradientState.direction.includes('to ')) {
                gradientString = `linear-gradient(${gradientState.direction}, `;
            } else {
                gradientString = `linear-gradient(${gradientState.angle}deg, `;
            }
        } else if (gradientState.type === 'radial') {
            gradientString = `radial-gradient(${gradientState.shape} at center, `;
        } else if (gradientState.type === 'conic') {
            gradientString = `conic-gradient(from ${gradientState.angle}deg at center, `;
        }
        
        const colorStopsString = sortedStops.map(stop => `${stop.color} ${stop.position}%`).join(', ');
        gradientString += colorStopsString + ')';
        
        let css = `background: ${gradientString};`;
        
        // Add animation if enabled
        if (gradientState.animation.enabled) {
            const keyframesName = `gradient-animation`;
            let keyframes = '';
            
            if (gradientState.animation.type === 'rotate') {
                keyframes = `
@keyframes ${keyframesName} {
  0% { background-position: 0% 50%; }
  50% { background-position: 100% 50%; }
  100% { background-position: 0% 50%; }
}`;
                css = `background: ${gradientString};\nbackground-size: 200% 200%;\nanimation: ${keyframesName} ${gradientState.animation.duration}s ease infinite;`;
            } else if (gradientState.animation.type === 'shift') {
                keyframes = `
@keyframes ${keyframesName} {
  0% { background-position: 0% 0%; }
  100% { background-position: 100% 0%; }
}`;
                css = `background: ${gradientString};\nbackground-size: 200% 100%;\nanimation: ${keyframesName} ${gradientState.animation.duration}s linear infinite;`;
            } else if (gradientState.animation.type === 'pulse') {
                keyframes = `
@keyframes ${keyframesName} {
  0% { opacity: 1; }
  50% { opacity: 0.7; }
  100% { opacity: 1; }
}`;
                css = `background: ${gradientString};\nanimation: ${keyframesName} ${gradientState.animation.duration}s ease-in-out infinite;`;
            }
            
            css += `\n\n${keyframes}`;
        }
        
        return css;
    }

    function updateGradient() {
        const css = generateGradientCSS();
        
        // Update preview
        const styleProperties = css.split('\n').filter(line => !line.includes('@keyframes'));
        gradientPreview.style = styleProperties.join('');
        
        // Update code display
        cssCode.textContent = css;
    }
});
