// Admin functionality - Add/Edit events
class AdminManager {
    constructor() {
        this.eventForm = null;
        this.currentEditId = null;
        this.init();
    }

    init() {
        // Create admin controls if not exists
        this.createAdminControls();
        
        // Add logout listener
        this.addLogoutListener();
        
        // Listen for auth changes
        document.addEventListener('authStateChanged', (e) => {
            if (e.detail.isAdmin) {
                this.showAdminControls();
            } else {
                this.hideAdminControls();
                this.closeEventForm(); // Close any open forms
            }
        });
    }
    
    addLogoutListener() {
        // Listen for clicks on logout buttons
        document.addEventListener('click', (e) => {
            if (e.target.closest('.logout-admin') || 
                e.target.classList.contains('logout-admin')) {
                e.preventDefault();
                handleLogout();
            }
        });
    }

    createAdminControls() {
        // Add "Add Event" button to each events section
        const sections = document.querySelectorAll('.events-section');
        
        sections.forEach(section => {
            const container = section.querySelector('.container');
            if (!container) return;
            
            const addButton = document.createElement('button');
            addButton.className = 'admin-only add-event-btn';
            addButton.textContent = '+ Add Event';
            addButton.style.cssText = `
                display: none;
                margin: 20px auto;
                padding: 12px 25px;
                background: linear-gradient(135deg, var(--electric-blue), var(--deep-purple));
                color: white;
                border: none;
                border-radius: 25px;
                cursor: pointer;
                font-weight: 600;
                font-size: 1rem;
                transition: all 0.3s ease;
            `;
            
            // Add hover effect
            addButton.addEventListener('mouseenter', () => {
                addButton.style.transform = 'translateY(-3px)';
                addButton.style.boxShadow = '0 10px 20px rgba(37, 99, 235, 0.4)';
            });
            
            addButton.addEventListener('mouseleave', () => {
                addButton.style.transform = 'translateY(0)';
                addButton.style.boxShadow = 'none';
            });
            
            const sectionTitle = section.querySelector('.section-title');
            if (sectionTitle) {
                sectionTitle.parentNode.insertBefore(addButton, sectionTitle.nextSibling);
            }
            
            addButton.addEventListener('click', () => this.openEventForm(null, section.classList.contains('non-tech') ? 'non-technical' : 'technical'));
        });
        
        // Create event form modal
        this.createEventForm();
    }

    createEventForm() {
        const modal = document.createElement('div');
        modal.id = 'event-form-modal';
        modal.style.cssText = `
            display: none;
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(0, 0, 0, 0.8);
            z-index: 10000;
            justify-content: center;
            align-items: center;
            backdrop-filter: blur(5px);
        `;
        
        modal.innerHTML = `
            <div class="modal-content" style="
                background: var(--dark-bg);
                padding: 30px;
                border-radius: 20px;
                width: 90%;
                max-width: 500px;
                border: 1px solid var(--glass-border);
                box-shadow: 0 20px 40px rgba(0, 0, 0, 0.5);
            ">
                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px;">
                    <h2 style="color: var(--cyan); margin: 0;" id="form-title">Add Event</h2>
                    <button id="close-form" style="
                        background: none;
                        border: none;
                        color: var(--soft-yellow);
                        font-size: 1.5rem;
                        cursor: pointer;
                    ">&times;</button>
                </div>
                <form id="event-form">
                    <input type="hidden" id="event-id">
                    
                    <div style="margin-bottom: 15px;">
                        <label style="display: block; color: var(--soft-yellow); margin-bottom: 5px;">Title *</label>
                        <input type="text" id="event-title" required 
                               style="width: 100%; padding: 10px; border-radius: 5px; background: rgba(255,255,255,0.1); border: 1px solid var(--glass-border); color: white;">
                    </div>
                    
                    <div style="margin-bottom: 15px;">
                        <label style="display: block; color: var(--soft-yellow); margin-bottom: 5px;">Description *</label>
                        <textarea id="event-desc" rows="3" required
                                  style="width: 100%; padding: 10px; border-radius: 5px; background: rgba(255,255,255,0.1); border: 1px solid var(--glass-border); color: white;"></textarea>
                    </div>
                    
                    <!-- 🔥 ADDED: Image URL field with preview -->
                    <div style="margin-bottom: 15px;">
                        <label style="display: block; color: var(--soft-yellow); margin-bottom: 5px;">
                            <i class="fas fa-image"></i> Event Image URL (Optional)
                        </label>
                        <input type="url" id="eventImageUrl" 
                               placeholder="https://example.com/image.jpg"
                               style="width: 100%; padding: 10px; border-radius: 5px; background: rgba(255,255,255,0.1); border: 1px solid var(--glass-border); color: white;">
                        <div id="imagePreview" style="margin-top: 8px; min-height: 40px;"></div>
                    </div>
                    
                    <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 15px; margin-bottom: 15px;">
                        <div>
                            <label style="display: block; color: var(--soft-yellow); margin-bottom: 5px;">Date *</label>
                            <input type="date" id="event-date" required 
                                   style="width: 100%; padding: 10px; border-radius: 5px; background: rgba(255,255,255,0.1); border: 1px solid var(--glass-border); color: white;">
                        </div>
                        <div>
                            <label style="display: block; color: var(--soft-yellow); margin-bottom: 5px;">Day *</label>
                            <select id="event-day" required
                                    style="width: 100%; padding: 10px; border-radius: 5px; background: rgba(255,255,255,0.1); border: 1px solid var(--glass-border); color: white;">
                                <option value="Day 1">Day 1</option>
                                <option value="Day 2">Day 2</option>
                                <option value="Day 3">Day 3</option>
                            </select>
                        </div>
                    </div>
                    
                    <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 15px; margin-bottom: 15px;">
                        <div>
                            <label style="display: block; color: var(--soft-yellow); margin-bottom: 5px;">Time *</label>
                            <input type="text" id="event-time" placeholder="10:00 AM - 12:00 PM" required
                                   style="width: 100%; padding: 10px; border-radius: 5px; background: rgba(255,255,255,0.1); border: 1px solid var(--glass-border); color: white;">
                        </div>
                        <div>
                            <label style="display: block; color: var(--soft-yellow); margin-bottom: 5px;">Venue *</label>
                            <input type="text" id="event-venue" required
                                   style="width: 100%; padding: 10px; border-radius: 5px; background: rgba(255,255,255,0.1); border: 1px solid var(--glass-border); color: white;">
                        </div>
                    </div>
                    
                    <div style="margin-bottom: 15px;">
                        <label style="display: block; color: var(--soft-yellow); margin-bottom: 5px;">Event Type *</label>
                        <select id="event-type" required
                                style="width: 100%; padding: 10px; border-radius: 5px; background: rgba(255,255,255,0.1); border: 1px solid var(--glass-border); color: white;">
                            <option value="technical">Technical</option>
                            <option value="non-technical">Non-Technical</option>
                        </select>
                    </div>
                    
                    <div style="margin-bottom: 20px;">
                        <label style="display: block; color: var(--soft-yellow); margin-bottom: 5px;">Google Form Link *</label>
                        <input type="url" id="event-formlink" required
                               style="width: 100%; padding: 10px; border-radius: 5px; background: rgba(255,255,255,0.1); border: 1px solid var(--glass-border); color: white;">
                    </div>
                    
                    <div style="display: flex; gap: 10px;">
                        <button type="submit" style="
                            flex: 1;
                            padding: 12px;
                            background: linear-gradient(135deg, var(--electric-blue), var(--deep-purple));
                            color: white;
                            border: none;
                            border-radius: 10px;
                            cursor: pointer;
                            font-weight: 600;
                        ">Save Event</button>
                        <button type="button" id="cancel-form" style="
                            flex: 1;
                            padding: 12px;
                            background: rgba(255,255,255,0.1);
                            color: white;
                            border: 1px solid var(--glass-border);
                            border-radius: 10px;
                            cursor: pointer;
                        ">Cancel</button>
                    </div>
                </form>
            </div>
        `;
        
        document.body.appendChild(modal);
        this.eventForm = modal;
        
        // Add form submit handler
        document.getElementById('event-form').addEventListener('submit', (e) => {
            e.preventDefault();
            this.saveEvent();
        });
        
        // Add cancel handler
        document.getElementById('cancel-form').addEventListener('click', () => {
            this.closeEventForm();
        });
        
        // Add close button handler
        document.getElementById('close-form').addEventListener('click', () => {
            this.closeEventForm();
        });
        
        // Close modal when clicking outside
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                this.closeEventForm();
            }
        });
        
        // 🔥 ADDED: Image preview logic
        this.setupImagePreview();
    }

    // 🔥 ADDED: Setup live image preview
    setupImagePreview() {
        setTimeout(() => {
            const imageInput = document.getElementById('eventImageUrl');
            const preview = document.getElementById('imagePreview');
            
            if (imageInput && preview) {
                imageInput.addEventListener('input', () => {
                    const url = imageInput.value.trim();
                    preview.innerHTML = '';
                    
                    if (!url) return;
                    
                    const img = document.createElement('img');
                    img.src = url;
                    img.style.cssText = `
                        width: 100%;
                        max-height: 180px;
                        object-fit: cover;
                        border-radius: 8px;
                        border: 2px solid rgba(34, 211, 238, 0.4);
                        margin-top: 8px;
                    `;
                    
                    img.onerror = () => {
                        preview.innerHTML = '<p style="color: #ef4444; font-size: 0.85rem; padding: 10px; background: rgba(239,68,68,0.1); border-radius: 5px;"><i class="fas fa-exclamation-triangle"></i> Invalid image URL</p>';
                    };
                    
                    preview.appendChild(img);
                });
            }
        }, 100);
    }

    showAdminControls() {
        document.querySelectorAll('.admin-only').forEach(el => {
            if (el.classList.contains('add-event-btn') || el.classList.contains('admin-controls') || el.classList.contains('admin-hint')) {
                el.style.display = 'block';
            }
        });
    }

    hideAdminControls() {
        document.querySelectorAll('.admin-only').forEach(el => {
            if (el.classList.contains('add-event-btn') || el.classList.contains('admin-controls') || el.classList.contains('admin-hint')) {
                el.style.display = 'none';
            }
        });
    }

    openEventForm(eventData = null, defaultType = 'technical') {
        this.currentEditId = eventData ? eventData.id : null;
        const form = document.getElementById('event-form');
        const formTitle = document.getElementById('form-title');
        
        if (eventData) {
            // Edit mode
            formTitle.textContent = 'Edit Event';
            document.getElementById('event-id').value = eventData.id;
            document.getElementById('event-title').value = eventData.title;
            document.getElementById('event-desc').value = eventData.description;
            document.getElementById('event-date').value = eventData.date;
            document.getElementById('event-day').value = eventData.day;
            document.getElementById('event-time').value = eventData.time;
            document.getElementById('event-venue').value = eventData.venue;
            document.getElementById('event-type').value = eventData.type;
            document.getElementById('event-formlink').value = eventData.formLink;
            
            // 🔥 ADDED: Prefill image URL when editing
            const imageInput = document.getElementById('eventImageUrl');
            if (imageInput && eventData.imageUrl) {
                imageInput.value = eventData.imageUrl;
                
                // Trigger preview
                setTimeout(() => {
                    imageInput.dispatchEvent(new Event('input'));
                }, 100);
            }
        } else {
            // Add mode
            formTitle.textContent = 'Add Event';
            form.reset();
            document.getElementById('event-id').value = '';
            document.getElementById('event-type').value = defaultType;
            
            // Set default date to today
            const today = new Date().toISOString().split('T')[0];
            document.getElementById('event-date').value = today;
            
            // 🔥 ADDED: Clear image preview
            const preview = document.getElementById('imagePreview');
            if (preview) preview.innerHTML = '';
        }
        
        this.eventForm.style.display = 'flex';
    }

    closeEventForm() {
        this.eventForm.style.display = 'none';
        this.currentEditId = null;
        document.getElementById('event-form').reset();
        
        // 🔥 ADDED: Clear preview
        const preview = document.getElementById('imagePreview');
        if (preview) preview.innerHTML = '';
    }

    async saveEvent() {
        // 🔥 ADDED: Get image URL
        const imageUrl = document.getElementById('eventImageUrl')?.value.trim() || null;
        
        const eventData = {
            title: document.getElementById('event-title').value,
            description: document.getElementById('event-desc').value,
            date: document.getElementById('event-date').value,
            day: document.getElementById('event-day').value,
            time: document.getElementById('event-time').value,
            venue: document.getElementById('event-venue').value,
            type: document.getElementById('event-type').value,
            formLink: document.getElementById('event-formlink').value,
            department: eventManager.currentDepartment === 'all' ? 'general' : eventManager.currentDepartment,
            // 🔥 ADDED: Include image URL in event data
            imageUrl: imageUrl,
            createdAt: firebase.database.ServerValue.TIMESTAMP,
            updatedAt: firebase.database.ServerValue.TIMESTAMP
        };

        try {
            if (this.currentEditId) {
                // Update existing event
                await firebaseDatabase.ref(`events/${this.currentEditId}`).update(eventData);
                
                if (window.showToast) {
                    showToast('Event updated successfully', 'success');
                }
            } else {
                // Create new event
                const newEventRef = firebaseDatabase.ref('events').push();
                await newEventRef.set(eventData);
                
                if (window.showToast) {
                    showToast('Event added successfully', 'success');
                }
            }
            
            this.closeEventForm();
            eventManager.loadEvents(); // Reload events
            
        } catch (error) {
            console.error('Error saving event:', error);
            if (window.showToast) {
                showToast('Failed to save event. Please try again.', 'error');
            }
        }
    }
}

// Initialize admin manager
const adminManager = new AdminManager();
window.adminManager = adminManager;