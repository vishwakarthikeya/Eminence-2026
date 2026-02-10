// Role-based UI control
class RoleManager {
    constructor() {
        this.isAdmin = false;
        this.init();
    }

    init() {
        // Check auth state
        firebaseAuth.onAuthStateChanged((user) => {
            this.isAdmin = !!user;
            this.updateUI();
        });
    }

    updateUI() {
        // Add admin-only class to elements that should be visible only to admins
        this.markAdminElements();
        
        // Show/hide admin login link in footer
        this.updateLoginLink();
    }

    markAdminElements() {
        // This is called from other components
        // The actual marking happens in admin.js and events.js
    }

    updateLoginLink() {
        const footer = document.querySelector('.footer-content');
        if (!footer) return;

        // Find or create admin login link
        let adminLink = footer.querySelector('.admin-login-link');
        
        if (!adminLink) {
            // Find the quick links column
            const quickLinksCol = Array.from(footer.querySelectorAll('.footer-col'))
                .find(col => {
                    const subtitle = col.querySelector('.footer-subtitle');
                    return subtitle && subtitle.textContent.includes('Quick Links');
                });
            
            if (quickLinksCol) {
                const linksList = quickLinksCol.querySelector('.footer-links');
                if (linksList) {
                    adminLink = document.createElement('li');
                    adminLink.className = 'admin-login-link';
                    adminLink.style.display = this.isAdmin ? 'none' : 'block';
                    
                    adminLink.innerHTML = `
                        <a href="admin-login.html" style="color: var(--cyan);">
                            <i class="fas fa-lock"></i> Admin Login
                        </a>
                    `;
                    
                    linksList.appendChild(adminLink);
                }
            }
        } else {
            adminLink.style.display = this.isAdmin ? 'none' : 'block';
        }

        // Add logout button for admin
        if (this.isAdmin) {
            let logoutBtn = footer.querySelector('.admin-logout');
            if (!logoutBtn) {
                // Create logout button container
                const logoutContainer = document.createElement('div');
                logoutContainer.className = 'admin-logout';
                logoutContainer.style.cssText = `
                    text-align: center;
                    margin-top: 30px;
                    padding: 20px;
                    border-top: 1px solid var(--glass-border);
                    width: 100%;
                    grid-column: 1 / -1;
                    background: rgba(34, 211, 238, 0.1);
                    border-radius: 10px;
                `;
                
                logoutContainer.innerHTML = `
                    <p style="color: var(--soft-yellow); margin-bottom: 15px; font-size: 1.1rem;">
                        <i class="fas fa-user-shield"></i> Admin Mode Active
                    </p>
                    <button onclick="handleLogout()" class="logout-admin" style="
                        background: linear-gradient(135deg, var(--accent-orange), var(--neon-pink));
                        color: white;
                        border: none;
                        padding: 12px 30px;
                        border-radius: 25px;
                        cursor: pointer;
                        font-weight: 600;
                        font-size: 1rem;
                        transition: all 0.3s ease;
                    ">
                        <i class="fas fa-sign-out-alt"></i> Logout Admin
                    </button>
                    <p style="color: rgba(255, 255, 255, 0.7); font-size: 0.9rem; margin-top: 10px;">
                        You can add, edit, and delete events
                    </p>
                `;
                
                footer.appendChild(logoutContainer);
            } else {
                logoutBtn.style.display = 'block';
            }
        } else {
            const logoutBtn = footer.querySelector('.admin-logout');
            if (logoutBtn) {
                logoutBtn.style.display = 'none';
            }
        }
    }
}

// Initialize role manager
const roleManager = new RoleManager();
window.roleManager = roleManager;