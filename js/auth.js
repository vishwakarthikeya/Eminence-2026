// Authentication state management
class AuthManager {
    constructor() {
        this.currentUser = null;
        this.isAdmin = false;
        this.init();
    }

    init() {
        // Listen for auth state changes
        firebaseAuth.onAuthStateChanged((user) => {
            this.currentUser = user;
            this.isAdmin = !!user; // If user is logged in, they're admin
            
            // Dispatch custom event for other components to react
            const event = new CustomEvent('authStateChanged', { 
                detail: { user, isAdmin: this.isAdmin } 
            });
            document.dispatchEvent(event);
            
            // Update UI based on auth state
            this.updateUI();
        });
    }

    async login(email, password) {
        try {
            const userCredential = await firebaseAuth.signInWithEmailAndPassword(email, password);
            return { success: true, user: userCredential.user };
        } catch (error) {
            return { success: false, error: error.message };
        }
    }

    logout() {
        return new Promise(async (resolve) => {
            try {
                await firebaseAuth.signOut();
                this.currentUser = null;
                this.isAdmin = false;
                
                // Clear any cached data
                if (window.eventManager) {
                    window.eventManager.events = [];
                }
                
                // Dispatch logout event
                const event = new CustomEvent('authStateChanged', { 
                    detail: { user: null, isAdmin: false } 
                });
                document.dispatchEvent(event);
                
                // Show logout success message
                if (window.showToast) {
                    showToast('Logged out successfully', 'success');
                }
                
                // Redirect to home page if not already there
                setTimeout(() => {
                    if (window.location.pathname.includes('admin')) {
                        window.location.href = 'index.html';
                    } else {
                        // Reload to refresh the page without admin controls
                        window.location.reload();
                    }
                }, 1500);
                
                resolve({ success: true });
            } catch (error) {
                console.error('Logout error:', error);
                if (window.showToast) {
                    showToast('Logout failed: ' + error.message, 'error');
                }
                resolve({ success: false, error: error.message });
            }
        });
    }

    updateUI() {
        // Show/hide admin controls based on auth state
        const adminControls = document.querySelectorAll('.admin-only');
        const loginLink = document.querySelector('.admin-login-link');
        const logoutButton = document.querySelector('.admin-logout');
        
        if (this.isAdmin) {
            // Show admin controls
            adminControls.forEach(el => {
                if (el.classList.contains('add-event-btn') || el.classList.contains('admin-controls')) {
                    el.style.display = 'block';
                }
            });
            
            // Update login/logout UI
            if (loginLink) loginLink.style.display = 'none';
            if (logoutButton) logoutButton.style.display = 'block';
            
            // Also show admin controls on event cards
            this.showCardAdminControls();
        } else {
            // Hide admin controls
            adminControls.forEach(el => {
                if (el.classList.contains('add-event-btn') || el.classList.contains('admin-controls')) {
                    el.style.display = 'none';
                }
            });
            
            // Update login/logout UI
            if (loginLink) loginLink.style.display = 'inline-block';
            if (logoutButton) logoutButton.style.display = 'none';
            
            // Hide admin controls on event cards
            this.hideCardAdminControls();
        }
    }
    
    showCardAdminControls() {
        // Show edit/delete buttons on all event cards
        document.querySelectorAll('.admin-controls').forEach(control => {
            control.style.display = 'flex';
        });
    }
    
    hideCardAdminControls() {
        // Hide edit/delete buttons on all event cards
        document.querySelectorAll('.admin-controls').forEach(control => {
            control.style.display = 'none';
        });
    }
}

// Initialize auth manager
const authManager = new AuthManager();
window.authManager = authManager;