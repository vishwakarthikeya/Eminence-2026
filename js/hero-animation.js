// HERO ANIMATION SCRIPT
class VideoHeroAnimation {
    constructor() {
        this.scenes = document.querySelectorAll('.scene');
        this.progressDots = document.querySelectorAll('.progress-dot');
        this.timelineMarkers = document.querySelectorAll('.timeline-marker');
        this.dayCards = document.querySelectorAll('.day-card');
        this.currentScene = 0;
        this.totalScenes = this.scenes.length;
        this.autoPlayInterval = null;
        this.sceneDurations = [5000, 5000, 8000]; // Scene durations in ms
        
        this.init();
    }
    
    init() {
        // Create particles for scene 2
        this.createParticles();
        
        // Start auto-play
        this.startAutoPlay();
        
        // Setup event listeners
        this.setupEventListeners();
        
        // Initialize scene 3 animations
        this.initScene3();
    }
    
    createParticles() {
        const particlesContainer = document.getElementById('particles');
        if (!particlesContainer) return;
        
        const particleCount = 50;
        
        for (let i = 0; i < particleCount; i++) {
            const particle = document.createElement('div');
            particle.className = 'particle';
            
            // Random position
            particle.style.left = `${Math.random() * 100}%`;
            particle.style.top = `${Math.random() * 100}%`;
            
            // Random animation delay
            particle.style.animationDelay = `${Math.random() * 15}s`;
            
            // Random size
            const size = 2 + Math.random() * 4;
            particle.style.width = `${size}px`;
            particle.style.height = `${size}px`;
            
            particlesContainer.appendChild(particle);
        }
    }
    
    initScene3() {
        // Animate day cards sequentially
        this.dayCards.forEach((card, index) => {
            setTimeout(() => {
                card.classList.add('active');
            }, index * 300);
        });
    }
    
    switchScene(sceneIndex) {
        if (sceneIndex < 0 || sceneIndex >= this.totalScenes) return;
        
        // Hide all scenes
        this.scenes.forEach(scene => scene.classList.remove('active'));
        
        // Show current scene
        this.scenes[sceneIndex].classList.add('active');
        
        // Update progress dots
        this.progressDots.forEach(dot => dot.classList.remove('active'));
        this.progressDots[sceneIndex].classList.add('active');
        
        // Update timeline markers
        this.timelineMarkers.forEach(marker => marker.classList.remove('active'));
        this.timelineMarkers[sceneIndex].classList.add('active');
        
        this.currentScene = sceneIndex;
        
        // Restart scene-specific animations
        if (sceneIndex === 2) {
            this.initScene3();
        }
    }
    
    nextScene() {
        let nextScene = this.currentScene + 1;
        if (nextScene >= this.totalScenes) {
            nextScene = 0; // Loop back to start
        }
        this.switchScene(nextScene);
    }
    
    startAutoPlay() {
        clearInterval(this.autoPlayInterval);
        this.autoPlayInterval = setInterval(() => {
            this.nextScene();
        }, this.sceneDurations[this.currentScene]);
    }
    
    setupEventListeners() {
        // Progress dots click
        this.progressDots.forEach((dot, index) => {
            dot.addEventListener('click', () => {
                clearInterval(this.autoPlayInterval);
                this.switchScene(index);
                this.startAutoPlay();
            });
        });
        
        // Timeline markers click
        this.timelineMarkers.forEach((marker, index) => {
            marker.addEventListener('click', () => {
                clearInterval(this.autoPlayInterval);
                this.switchScene(index);
                this.startAutoPlay();
            });
        });
        
        // Keyboard navigation
        document.addEventListener('keydown', (e) => {
            clearInterval(this.autoPlayInterval);
            
            if (e.key === 'ArrowRight' || e.key === ' ') {
                this.nextScene();
            } else if (e.key === 'ArrowLeft') {
                let prevScene = this.currentScene - 1;
                if (prevScene < 0) prevScene = this.totalScenes - 1;
                this.switchScene(prevScene);
            }
            
            this.startAutoPlay();
        });
        
        // Touch swipe for mobile
        let touchStartX = 0;
        let touchEndX = 0;
        
        document.addEventListener('touchstart', (e) => {
            touchStartX = e.changedTouches[0].screenX;
        });
        
        document.addEventListener('touchend', (e) => {
            touchEndX = e.changedTouches[0].screenX;
            this.handleSwipe(touchStartX, touchEndX);
        });
    }
    
    handleSwipe(startX, endX) {
        clearInterval(this.autoPlayInterval);
        
        const swipeThreshold = 50;
        const diff = startX - endX;
        
        if (Math.abs(diff) > swipeThreshold) {
            if (diff > 0) {
                // Swipe left - next scene
                this.nextScene();
            } else {
                // Swipe right - previous scene
                let prevScene = this.currentScene - 1;
                if (prevScene < 0) prevScene = this.totalScenes - 1;
                this.switchScene(prevScene);
            }
        }
        
        this.startAutoPlay();
    }
}

// Initialize animation when page loads
document.addEventListener('DOMContentLoaded', () => {
    const heroAnimation = document.querySelector('.hero-animation');
    if (heroAnimation) {
        new VideoHeroAnimation();
    }
});