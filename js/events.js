// Event data management and rendering
class EventManager {
    constructor() {
        this.events = [];
        this.currentDepartment = this.getCurrentDepartment();
        this.init();
    }

    getCurrentDepartment() {
        // Extract department from URL or page
        const path = window.location.pathname;
        const page = path.split('/').pop();
        
        if (page === 'index.html' || page === '') return 'all';
        
        // Map page names to department codes
        const pageMap = {
            'aiml.html': 'aiml',
            'cse.html': 'cse',
            'cs.html': 'cs',
            'it.html': 'it',
            'csit.html': 'csit',
            'aids.html': 'aids',
            'ds.html': 'ds',
            'ece.html': 'ece',
            'eee.html': 'eee',
            'mech.html': 'mech',
            'civil.html': 'civil'
        };
        
        return pageMap[page] || 'all';
    }

    init() {
        // Load events when page loads
        this.loadEvents();
        
        // Listen for auth changes to update admin controls
        document.addEventListener('authStateChanged', (e) => {
            this.updateAdminControls(e.detail.isAdmin);
        });
    }

    async loadEvents() {
        try {
            const snapshot = await firebaseDatabase.ref('events').once('value');
            this.events = snapshot.val() || {};
            this.renderEvents();
        } catch (error) {
            console.error('Error loading events:', error);
        }
    }

    renderEvents() {
        // Get department-specific events
        const deptEvents = this.getDepartmentEvents();
        
        // Render technical events
        this.renderEventSection('technical', deptEvents.technical);
        
        // Render non-technical events
        this.renderEventSection('non-technical', deptEvents.nonTechnical);
        
        // Add admin hint if admin is logged in
        this.addAdminHint();
    }
    
    addAdminHint() {
        // Remove existing hint
        const existingHint = document.querySelector('.admin-hint');
        if (existingHint) existingHint.remove();
        
        // Add admin hint if admin is logged in
        if (window.authManager && window.authManager.isAdmin) {
            const adminHint = document.createElement('div');
            adminHint.className = 'admin-hint admin-only';
            adminHint.style.cssText = `
                text-align: center;
                color: var(--soft-yellow);
                font-size: 0.9rem;
                margin: 20px auto;
                padding: 10px 20px;
                background: rgba(34, 211, 238, 0.1);
                border-radius: 10px;
                border: 1px solid rgba(34, 211, 238, 0.3);
                max-width: 600px;
                display: ${window.authManager.isAdmin ? 'block' : 'none'};
            `;
            adminHint.innerHTML = `
                <i class="fas fa-user-shield"></i> 
                <strong>Admin Mode Active:</strong> You can add new events using the "Add Event" buttons 
                and edit/delete existing events using the buttons on event cards.
            `;
            
            // Insert after the first section subtitle
            const sectionSubtitle = document.querySelector('.section-subtitle');
            if (sectionSubtitle) {
                sectionSubtitle.parentNode.insertBefore(adminHint, sectionSubtitle.nextSibling);
            }
        }
    }

    getDepartmentEvents() {
        const deptEvents = {
            technical: [],
            nonTechnical: []
        };

        // Filter events for current department
        Object.keys(this.events).forEach(eventId => {
            const event = this.events[eventId];
            
            if (this.currentDepartment === 'all' || event.department === this.currentDepartment) {
                if (event.type === 'technical') {
                    deptEvents.technical.push({ id: eventId, ...event });
                } else if (event.type === 'non-technical') {
                    deptEvents.nonTechnical.push({ id: eventId, ...event });
                }
            }
        });

        // Sort by day and time
        deptEvents.technical.sort(this.sortEvents);
        deptEvents.nonTechnical.sort(this.sortEvents);

        return deptEvents;
    }

    sortEvents(a, b) {
        // Sort by day (Day 1, Day 2, Day 3) then by time
        const dayOrder = { 'Day 1': 1, 'Day 2': 2, 'Day 3': 3 };
        if (dayOrder[a.day] !== dayOrder[b.day]) {
            return dayOrder[a.day] - dayOrder[b.day];
        }
        return a.time.localeCompare(b.time);
    }

    renderEventSection(type, events) {
        const section = type === 'technical' ? 
            document.querySelector('.events-section:not(.non-tech)') :
            document.querySelector('.events-section.non-tech');
        
        if (!section) return;

        const eventsGrid = section.querySelector('.events-grid');
        if (!eventsGrid) return;

        // Clear existing events (except the first one which is our template)
        const templateCard = eventsGrid.querySelector('.event-card');
        eventsGrid.innerHTML = '';
        
        if (templateCard) {
            templateCard.style.display = 'none'; // Hide template
            eventsGrid.appendChild(templateCard);
        }

        // Render events
        events.forEach(event => {
            const eventCard = this.createEventCard(event, type);
            eventsGrid.appendChild(eventCard);
        });

        // Show "No events" message if empty
        if (events.length === 0) {
            const emptyMessage = document.createElement('div');
            emptyMessage.className = 'no-events-message';
            emptyMessage.innerHTML = `<p style="text-align: center; color: var(--soft-yellow); padding: 40px;">No ${type} events scheduled yet.</p>`;
            eventsGrid.appendChild(emptyMessage);
        }
    }
    
    updateAdminControls(isAdmin) {
        // Show/hide admin controls on cards
        document.querySelectorAll('.event-card').forEach(card => {
            const adminControls = card.querySelector('.admin-controls');
            if (adminControls) {
                adminControls.style.display = isAdmin ? 'flex' : 'none';
            }
        });
        
        // Show/hide add event buttons
        document.querySelectorAll('.add-event-btn').forEach(btn => {
            btn.style.display = isAdmin ? 'block' : 'none';
        });
        
        // Show/hide admin hint
        const adminHint = document.querySelector('.admin-hint');
        if (adminHint) {
            adminHint.style.display = isAdmin ? 'block' : 'none';
        }
    }

    createEventCard(eventData, type) {
        // Clone the template or create new card structure
        const template = document.querySelector('.event-card');
        const card = template ? template.cloneNode(true) : this.createCardStructure();
        
        card.style.display = 'block';
        card.dataset.eventId = eventData.id;
        
        // Remove existing admin controls if any
        const existingAdminControls = card.querySelector('.admin-controls');
        if (existingAdminControls) {
            existingAdminControls.remove();
        }

        // Update card content
        this.updateCardContent(card, eventData, type);
        
        // Add admin controls if user is admin
        if (window.authManager && window.authManager.isAdmin) {
            this.addAdminControls(card, eventData);
        }

        return card;
    }

    createCardStructure() {
        const card = document.createElement('div');
        card.className = 'event-card';
        
        // 🔥 ADDED: Improved image container styling
        const imageDiv = document.createElement('div');
        imageDiv.className = 'event-image';
        imageDiv.style.cssText = `
            height: 380px;
            overflow: hidden;
            background: rgba(0,0,0,0.3);
            display: flex;
            align-items: center;
            justify-content: center;
        `;
        
        const icon = document.createElement('i');
        icon.className = 'fas fa-calendar';
        icon.style.cssText = 'font-size: 3rem; color: var(--soft-yellow);';
        imageDiv.appendChild(icon);
        
        const contentDiv = document.createElement('div');
        contentDiv.className = 'event-content';
        contentDiv.innerHTML = `
            <div class="event-day"></div>
            <h3 class="event-title"></h3>
            <p class="event-desc"></p>
            <div class="event-details"></div>
            <a href="#" target="_blank" class="event-register-btn">Register Now</a>
        `;
        
        card.appendChild(imageDiv);
        card.appendChild(contentDiv);
        
        return card;
    }

    updateCardContent(card, eventData, type) {
        // Update day
        const dayElement = card.querySelector('.event-day');
        if (dayElement) {
            dayElement.textContent = `${eventData.day} | ${eventData.time}`;
        }

        // Update title
        const titleElement = card.querySelector('.event-title');
        if (titleElement) {
            titleElement.textContent = eventData.title;
        }

        // Update description
        const descElement = card.querySelector('.event-desc');
        if (descElement) {
            descElement.textContent = eventData.description;
        }

        // Update event details
        const detailsElement = card.querySelector('.event-details');
        if (detailsElement) {
            detailsElement.innerHTML = `
                <p><i class="fas fa-calendar"></i> ${eventData.date}</p>
                <p><i class="fas fa-map-marker-alt"></i> ${eventData.venue}</p>
                <p><i class="fas fa-users"></i> ${eventData.participants || 'Open to all'}</p>
            `;
        }

        // 🔥 UPDATED: Optional registration link with fallback
        const registerBtn = card.querySelector('.event-register-btn');
        if (registerBtn) {
            const formLink = (eventData.formLink || '').trim();

            if (formLink) {
                // If Google Form exists → open it
                registerBtn.href = formLink;
                registerBtn.target = '_blank';
            } else {
                // 🔥 FALLBACK: Open default register page
                registerBtn.href = 'defaultRegister.html';
                registerBtn.target = '_self';
            }

            // Update button text for non-technical events
            if (type === 'non-technical') {
                registerBtn.textContent = eventData.buttonText || 'Join Now';
            }
        }

        // 🔥 ADDED: Replace icon with image if imageUrl exists
        const imageContainer = card.querySelector('.event-image');
        if (imageContainer) {
            // Clear existing content
            imageContainer.innerHTML = '';
            
            if (eventData.imageUrl) {
                const img = document.createElement('img');
                img.src = eventData.imageUrl;
                img.loading = 'lazy';
                
                // 🔥 ADDED: Fade-in animation
                const style = document.createElement('style');
                if (!document.querySelector('#fadeInAnimation')) {
                    style.id = 'fadeInAnimation';
                    style.textContent = `
                        @keyframes fadeIn {
                            from { opacity: 0; transform: scale(1.05); }
                            to { opacity: 1; transform: scale(1); }
                        }
                    `;
                    document.head.appendChild(style);
                }
                
                img.onerror = () => {
                    imageContainer.innerHTML = '';
                    const icon = document.createElement('i');
                    icon.className = 'fas fa-calendar';
                    icon.style.cssText = 'font-size: 3rem; color: var(--soft-yellow);';
                    imageContainer.appendChild(icon);
                };
                
                imageContainer.appendChild(img);
            } else {
                const icon = document.createElement('i');
                icon.className = 'fas fa-calendar';
                icon.style.cssText = 'font-size: 3rem; color: var(--soft-yellow);';
                imageContainer.appendChild(icon);
            }
        }
    }

    addAdminControls(card, eventData) {
        const adminControls = document.createElement('div');
        adminControls.className = 'admin-controls admin-only';
        adminControls.style.cssText = `
            position: absolute;
            top: 10px;
            right: 10px;
            display: ${window.authManager && window.authManager.isAdmin ? 'flex' : 'none'};
            gap: 5px;
            z-index: 10;
        `;
        
        adminControls.innerHTML = `
            <button class="edit-event" data-event-id="${eventData.id}" 
                    style="background: #22d3ee; color: white; border: none; padding: 8px 12px; border-radius: 5px; cursor: pointer; font-size: 0.9rem;">
                <i class="fas fa-edit"></i> Edit
            </button>
            <button class="delete-event" data-event-id="${eventData.id}"
                    style="background: #ec4899; color: white; border: none; padding: 8px 12px; border-radius: 5px; cursor: pointer; font-size: 0.9rem;">
                <i class="fas fa-trash"></i> Delete
            </button>
        `;
        
        card.style.position = 'relative';
        card.appendChild(adminControls);
        
        // Add event listeners
        const editBtn = adminControls.querySelector('.edit-event');
        const deleteBtn = adminControls.querySelector('.delete-event');
        
        editBtn.addEventListener('click', () => this.openEditModal(eventData));
        deleteBtn.addEventListener('click', () => this.deleteEvent(eventData.id));
    }

    async deleteEvent(eventId) {
        if (!confirm('Are you sure you want to delete this event?')) return;
        
        try {
            await firebaseDatabase.ref(`events/${eventId}`).remove();
            delete this.events[eventId];
            this.renderEvents();
            
            if (window.showToast) {
                window.showToast('Event deleted successfully', 'success');
            }
        } catch (error) {
            console.error('Error deleting event:', error);
            if (window.showToast) {
                window.showToast('Failed to delete event. Please try again.', 'error');
            }
        }
    }

    openEditModal(eventData) {
        // Implementation for edit modal
        // Similar to add event form
        if (window.adminManager) {
            window.adminManager.openEventForm(eventData);
        }
    }
}

// 🔥 ADDED: Extend adminManager to support image URL field and live preview
(function extendAdminManager() {
    // Wait for adminManager to be available
    const checkAdminManager = setInterval(() => {
        if (window.adminManager && window.adminManager.openEventForm) {
            clearInterval(checkAdminManager);
            
            const originalOpenEventForm = window.adminManager.openEventForm;
            
            window.adminManager.openEventForm = function(eventData = null) {
                // Call original method to create form
                originalOpenEventForm.call(this, eventData);
                
                // 🔥 ADDED: Add image URL field and preview to form
                setTimeout(() => {
                    const modal = document.getElementById('event-form-modal');
                    if (!modal) return;
                    
                    const form = document.getElementById('event-form');
                    if (!form) return;
                    
                    // Check if field already exists
                    if (document.getElementById('eventImageUrl')) return;
                    
                    // Find where to insert the image field (after description)
                    const descField = document.getElementById('event-desc')?.parentNode;
                    
                    if (descField) {
                        // Create image URL field container
                        const imageFieldContainer = document.createElement('div');
                        imageFieldContainer.style.cssText = 'margin-bottom: 15px;';
                        
                        imageFieldContainer.innerHTML = `
                            <label for="eventImageUrl" style="display: block; color: var(--soft-yellow); margin-bottom: 5px;">
                                <i class="fas fa-image"></i> Event Image URL (Optional)
                            </label>
                            <input type="url" id="eventImageUrl" 
                                   placeholder="https://example.com/image.jpg" 
                                   value="${eventData?.imageUrl || ''}"
                                   style="width: 100%; padding: 10px; border-radius: 5px; background: rgba(255,255,255,0.1); border: 1px solid var(--glass-border); color: white;">
                            <div id="imagePreview" style="margin-top: 10px; min-height: 50px;"></div>
                        `;
                        
                        // Insert after description field
                        descField.parentNode.insertBefore(imageFieldContainer, descField.nextSibling);
                        
                        // 🔥 ADDED: Live preview logic
                        const imageInput = document.getElementById('eventImageUrl');
                        const preview = document.getElementById('imagePreview');
                        
                        if (imageInput && preview) {
                            // Initial preview if value exists
                            if (imageInput.value.trim()) {
                                showPreview(imageInput.value.trim());
                            }
                            
                            imageInput.addEventListener('input', function() {
                                showPreview(this.value.trim());
                            });
                            
                            function showPreview(url) {
                                preview.innerHTML = '';
                                
                                if (!url) {
                                    preview.innerHTML = '<p style="color: #9ca3af; font-size: 0.85rem; padding: 10px 0;">Enter an image URL to see preview</p>';
                                    return;
                                }
                                
                                const img = document.createElement('img');
                                img.src = url;
                                img.loading = 'lazy';
                                // 🔥 UPDATED: New CSS for preview images
                                img.style.cssText = `
                                    width: 100%;
                                    height: auto;
                                    max-height: 380px;
                                    object-fit: contain;
                                    border-radius: 10px;
                                    border: 2px solid rgba(34, 211, 238, 0.4);
                                    animation: fadeIn 0.3s ease-in;
                                `;
                                
                                img.onerror = () => {
                                    preview.innerHTML = '<p style="color: #ef4444; font-size: 0.85rem; padding: 10px; background: rgba(239,68,68,0.1); border-radius: 5px;"><i class="fas fa-exclamation-triangle"></i> Invalid image URL - preview not available</p>';
                                };
                                
                                preview.appendChild(img);
                            }
                        }
                    }
                    
                    // 🔥 ADDED: Modify saveEvent to include imageUrl
                    const originalSaveEvent = window.adminManager.saveEvent;
                    if (originalSaveEvent) {
                        window.adminManager.saveEvent = async function() {
                            // Get image URL
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
                                department: window.eventManager ? (window.eventManager.currentDepartment === 'all' ? 'general' : window.eventManager.currentDepartment) : 'general',
                                // 🔥 ADDED: Include image URL
                                imageUrl: imageUrl,
                                createdAt: firebase.database.ServerValue.TIMESTAMP,
                                updatedAt: firebase.database.ServerValue.TIMESTAMP
                            };

                            try {
                                if (this.currentEditId) {
                                    await firebaseDatabase.ref(`events/${this.currentEditId}`).update(eventData);
                                    if (window.showToast) {
                                        window.showToast('Event updated successfully', 'success');
                                    }
                                } else {
                                    const newEventRef = firebaseDatabase.ref('events').push();
                                    await newEventRef.set(eventData);
                                    if (window.showToast) {
                                        window.showToast('Event added successfully', 'success');
                                    }
                                }
                                
                                this.closeEventForm();
                                if (window.eventManager) {
                                    window.eventManager.loadEvents();
                                }
                                
                            } catch (error) {
                                console.error('Error saving event:', error);
                                if (window.showToast) {
                                    window.showToast('Failed to save event. Please try again.', 'error');
                                }
                            }
                        };
                    }
                }, 100);
            };
        }
    }, 100);
})();

// Initialize event manager
const eventManager = new EventManager();
window.eventManager = eventManager;