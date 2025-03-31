document.addEventListener('DOMContentLoaded', function() {
    // DOM Elements
    const sections = document.querySelectorAll('.section');
    const sectionContents = document.querySelectorAll('.section-content');
    const themeOptions = document.querySelectorAll('.theme-option');
    const resumePreview = document.getElementById('resume');
    
    // Form fields
    const fullNameInput = document.getElementById('fullName');
    const titleInput = document.getElementById('title');
    const emailInput = document.getElementById('email');
    const phoneInput = document.getElementById('phone');
    const locationInput = document.getElementById('location');
    
    // Preview elements
    const previewName = document.getElementById('preview-name');
    const previewTitle = document.getElementById('preview-title');
    const previewEmail = document.getElementById('preview-email');
    const previewPhone = document.getElementById('preview-phone');
    const previewLocation = document.getElementById('preview-location');
    
    // Experience and education containers
    const experienceItems = document.getElementById('experience-items');
    const educationItems = document.getElementById('education-items');
    const addExperienceBtn = document.getElementById('add-experience');
    const addEducationBtn = document.getElementById('add-education');
    
    // Skills
    const skillInput = document.getElementById('skill-input');
    const addSkillBtn = document.getElementById('add-skill');
    const skillsContainer = document.getElementById('skills-container');
    const previewSkills = document.getElementById('preview-skills');
    
    // Switch between sections
    sections.forEach(section => {
        section.addEventListener('click', function() {
            sections.forEach(s => s.classList.remove('active'));
            sectionContents.forEach(c => c.classList.remove('active'));
            
            this.classList.add('active');
            const sectionId = this.getAttribute('data-section');
            document.getElementById(sectionId).classList.add('active');
        });
    });
    
    // Change resume theme
    themeOptions.forEach(option => {
        option.addEventListener('click', function() {
            themeOptions.forEach(o => o.classList.remove('active'));
            this.classList.add('active');
            
            const theme = this.getAttribute('data-theme');
            resumePreview.className = 'preview-content';
            resumePreview.classList.add(`theme-${theme}-preview`);
        });
    });
    
    // Update personal information in real-time
    fullNameInput.addEventListener('input', function() {
        previewName.textContent = this.value || 'Your Name';
    });
    
    titleInput.addEventListener('input', function() {
        previewTitle.textContent = this.value || 'Professional Title';
    });
    
    emailInput.addEventListener('input', function() {
        previewEmail.innerHTML = this.value ? 
            `<i class="fas fa-envelope"></i> ${this.value}` : 
            '<i class="fas fa-envelope"></i> email@example.com';
    });
    
    phoneInput.addEventListener('input', function() {
        previewPhone.innerHTML = this.value ? 
            `<i class="fas fa-phone"></i> ${this.value}` : 
            '<i class="fas fa-phone"></i> (555) 123-4567';
    });
    
    locationInput.addEventListener('input', function() {
        previewLocation.innerHTML = this.value ? 
            `<i class="fas fa-map-marker-alt"></i> ${this.value}` : 
            '<i class="fas fa-map-marker-alt"></i> City, Country';
    });
    
    // Add work experience
    addExperienceBtn.addEventListener('click', function() {
        const experienceId = `exp-${Date.now()}`;
        const experienceHtml = `
            <div class="experience-form" id="${experienceId}-form">
                <div class="form-group">
                    <label for="${experienceId}-title">Job Title</label>
                    <input type="text" id="${experienceId}-title" placeholder="e.g. Front-end Developer">
                </div>
                <div class="form-group">
                    <label for="${experienceId}-company">Company</label>
                    <input type="text" id="${experienceId}-company" placeholder="e.g. Awesome Tech Inc.">
                </div>
                <div class="form-group">
                    <div style="display: flex; gap: 15px;">
                        <div style="flex: 1;">
                            <label for="${experienceId}-start">Start Date</label>
                            <input type="text" id="${experienceId}-start" placeholder="e.g. June 2020">
                        </div>
                        <div style="flex: 1;">
                            <label for="${experienceId}-end">End Date</label>
                            <input type="text" id="${experienceId}-end" placeholder="e.g. Present">
                        </div>
                    </div>
                </div>
                <div class="form-group">
                    <label for="${experienceId}-description">Description</label>
                    <textarea id="${experienceId}-description" rows="3" placeholder="Describe your responsibilities and achievements..."></textarea>
                </div>
                <button type="button" class="add-btn remove-btn" data-id="${experienceId}">
                    <i class="fas fa-trash"></i> Remove
                </button>
                <hr style="margin: 20px 0;">
            </div>
        `;
        
        experienceItems.insertAdjacentHTML('beforeend', experienceHtml);
        
        // Add event listeners for the new experience form
        document.getElementById(`${experienceId}-title`).addEventListener('input', updateExperiencePreview);
        document.getElementById(`${experienceId}-company`).addEventListener('input', updateExperiencePreview);
        document.getElementById(`${experienceId}-start`).addEventListener('input', updateExperiencePreview);
        document.getElementById(`${experienceId}-end`).addEventListener('input', updateExperiencePreview);
        document.getElementById(`${experienceId}-description`).addEventListener('input', updateExperiencePreview);
        
        // Add remove event listener
        document.querySelector(`button[data-id="${experienceId}"]`).addEventListener('click', function() {
            document.getElementById(`${experienceId}-form`).remove();
            updateExperiencePreview();
        });
        
        updateExperiencePreview();
    });
    
    // Add education
    addEducationBtn.addEventListener('click', function() {
        const educationId = `edu-${Date.now()}`;
        const educationHtml = `
            <div class="education-form" id="${educationId}-form">
                <div class="form-group">
                    <label for="${educationId}-degree">Degree</label>
                    <input type="text" id="${educationId}-degree" placeholder="e.g. Bachelor of Science in Computer Science">
                </div>
                <div class="form-group">
                    <label for="${educationId}-school">School</label>
                    <input type="text" id="${educationId}-school" placeholder="e.g. University of Technology">
                </div>
                <div class="form-group">
                    <div style="display: flex; gap: 15px;">
                        <div style="flex: 1;">
                            <label for="${educationId}-start">Start Year</label>
                            <input type="text" id="${educationId}-start" placeholder="e.g. 2016">
                        </div>
                        <div style="flex: 1;">
                            <label for="${educationId}-end">End Year (or expected)</label>
                            <input type="text" id="${educationId}-end" placeholder="e.g. 2020">
                        </div>
                    </div>
                </div>
                <button type="button" class="add-btn remove-btn" data-id="${educationId}">
                    <i class="fas fa-trash"></i> Remove
                </button>
                <hr style="margin: 20px 0;">
            </div>
        `;
        
        educationItems.insertAdjacentHTML('beforeend', educationHtml);
        
        // Add event listeners for the new education form
        document.getElementById(`${educationId}-degree`).addEventListener('input', updateEducationPreview);
        document.getElementById(`${educationId}-school`).addEventListener('input', updateEducationPreview);
        document.getElementById(`${educationId}-start`).addEventListener('input', updateEducationPreview);
        document.getElementById(`${educationId}-end`).addEventListener('input', updateEducationPreview);
        
        // Add remove event listener
        document.querySelector(`button[data-id="${educationId}"]`).addEventListener('click', function() {
            document.getElementById(`${educationId}-form`).remove();
            updateEducationPreview();
        });
        
        updateEducationPreview();
    });
    
    // Add skill
    addSkillBtn.addEventListener('click', function() {
        addSkill();
    });
    
    skillInput.addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
            e.preventDefault();
            addSkill();
        }
    });
    
    // Download PDF
    document.getElementById('download-pdf').addEventListener('click', function() {
        alert('In a real application, this would generate and download a PDF of your resume.');
        // In a real implementation, you would use a library like html2pdf.js or jsPDF
    });
    
    // Helper functions
    function addSkill() {
        const skill = skillInput.value.trim();
        if (!skill) return;
        
        const skillId = `skill-${Date.now()}`;
        const skillHtml = `
            <div class="skill-tag" id="${skillId}">
                ${skill}
                <i class="fas fa-times" data-id="${skillId}"></i>
            </div>
        `;
        
        skillsContainer.insertAdjacentHTML('beforeend', skillHtml);
        document.querySelector(`#${skillId} i`).addEventListener('click', function() {
            document.getElementById(skillId).remove();
            updateSkillsPreview();
        });
        
        skillInput.value = '';
        updateSkillsPreview();
    }
    
    function updateExperiencePreview() {
        const experienceForms = document.querySelectorAll('.experience-form');
        
        if (experienceForms.length === 0) {
            document.getElementById('preview-experience').innerHTML = 
                '<p class="empty-section">Your work experience will appear here.</p>';
            return;
        }
        
        let experienceHtml = '';
        
        experienceForms.forEach(form => {
            const id = form.id.split('-form')[0];
            const title = document.getElementById(`${id}-title`).value;
            const company = document.getElementById(`${id}-company`).value;
            const startDate = document.getElementById(`${id}-start`).value;
            const endDate = document.getElementById(`${id}-end`).value;
            const description = document.getElementById(`${id}-description`).value;
            
            if (title || company) {
                experienceHtml += `
                    <div class="experience-item">
                        <div class="item-header">
                            <div class="item-title">${title || 'Job Title'}</div>
                            <div class="item-date">${startDate || 'Start'} - ${endDate || 'End'}</div>
                        </div>
                        <div class="item-subtitle">${company || 'Company Name'}</div>
                        <p>${description || 'Job description...'}</p>
                    </div>
                `;
            }
        });
        
        document.getElementById('preview-experience').innerHTML = experienceHtml || 
            '<p class="empty-section">Your work experience will appear here.</p>';
    }
    
    function updateEducationPreview() {
        const educationForms = document.querySelectorAll('.education-form');
        
        if (educationForms.length === 0) {
            document.getElementById('preview-education').innerHTML = 
                '<p class="empty-section">Your education details will appear here.</p>';
            return;
        }
        
        let educationHtml = '';
        
        educationForms.forEach(form => {
            const id = form.id.split('-form')[0];
            const degree = document.getElementById(`${id}-degree`).value;
            const school = document.getElementById(`${id}-school`).value;
            const startYear = document.getElementById(`${id}-start`).value;
            const endYear = document.getElementById(`${id}-end`).value;
            
            if (degree || school) {
                educationHtml += `
                    <div class="education-item">
                        <div class="item-header">
                            <div class="item-title">${degree || 'Degree'}</div>
                            <div class="item-date">${startYear || 'Start'} - ${endYear || 'End'}</div>
                        </div>
                        <div class="item-subtitle">${school || 'School Name'}</div>
                    </div>
                `;
            }
        });
        
        document.getElementById('preview-education').innerHTML = educationHtml || 
            '<p class="empty-section">Your education details will appear here.</p>';
    }
    
    function updateSkillsPreview() {
        const skills = Array.from(skillsContainer.querySelectorAll('.skill-tag'))
            .map(skillTag => skillTag.textContent.trim());
        
        if (skills.length === 0) {
            previewSkills.innerHTML = '<p class="empty-section">Your skills will appear here.</p>';
            return;
        }
        
        let skillsHtml = '';
        skills.forEach(skill => {
            skillsHtml += `<div class="skill-item">${skill}</div>`;
        });
        
        previewSkills.innerHTML = skillsHtml;
    }
});
