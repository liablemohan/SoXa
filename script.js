// Mobile Navigation Toggle
document.addEventListener('DOMContentLoaded', () => {
    const hamburger = document.querySelector('.hamburger');
    const navMenu = document.querySelector('.nav-menu');

    if (hamburger) {
        hamburger.addEventListener('click', () => {
            hamburger.classList.toggle('active');
            navMenu.classList.toggle('active');
        });

        // Close menu when clicking on a link
        document.querySelectorAll('.nav-menu a').forEach(link => {
            link.addEventListener('click', () => {
                hamburger.classList.remove('active');
                navMenu.classList.remove('active');
            });
        });
    }

    // Form submission
    const form = document.querySelector('.contact-form form');
    if (form) {
        form.addEventListener('submit', (e) => {
            e.preventDefault();
            alert('Thank you for your message! We will get back to you soon.');
            e.target.reset();
        });
    }

    // ===========================
    // HERO CAROUSEL
    // ===========================
    const carousel = {
        currentSlide: 0,
        slides: document.querySelectorAll('.carousel-slide'),
        dots: document.querySelectorAll('.carousel-dot'),
        slideDuration: 5000, // 5 seconds per slide
        intervalId: null,

        init() {
            if (!this.slides.length) return;

            // Arrow click events
            const leftArrow = document.querySelector('.carousel-arrow-left');
            const rightArrow = document.querySelector('.carousel-arrow-right');

            if (leftArrow) leftArrow.addEventListener('click', () => this.prevSlide());
            if (rightArrow) rightArrow.addEventListener('click', () => this.nextSlide());

            // Dot click events
            this.dots.forEach((dot, index) => {
                dot.addEventListener('click', () => this.goToSlide(index));
            });

            // Keyboard navigation
            document.addEventListener('keydown', (e) => {
                if (e.key === 'ArrowLeft') this.prevSlide();
                if (e.key === 'ArrowRight') this.nextSlide();
            });

            // Touch/swipe support
            let touchStartX = 0;
            const carouselContainer = document.querySelector('.carousel-container');

            if (carouselContainer) {
                carouselContainer.addEventListener('touchstart', (e) => {
                    touchStartX = e.touches[0].clientX;
                });

                carouselContainer.addEventListener('touchend', (e) => {
                    const touchEndX = e.changedTouches[0].clientX;
                    const diff = touchStartX - touchEndX;

                    if (Math.abs(diff) > 50) { // Minimum swipe distance
                        if (diff > 0) this.nextSlide();
                        else this.prevSlide();
                    }
                });

                // Pause on hover
                carouselContainer.addEventListener('mouseenter', () => this.pause());
                carouselContainer.addEventListener('mouseleave', () => this.start());
            }

            // Start auto-play
            this.start();
        },

        goToSlide(index) {
            // Remove active classes
            this.slides[this.currentSlide].classList.remove('active');
            this.dots[this.currentSlide].classList.remove('active');

            // Update current slide
            this.currentSlide = index;

            // Add active classes
            this.slides[this.currentSlide].classList.add('active');
            this.dots[this.currentSlide].classList.add('active');

            // Restart auto-play
            this.restart();
        },

        nextSlide() {
            const next = (this.currentSlide + 1) % this.slides.length;
            this.goToSlide(next);
        },

        prevSlide() {
            const prev = (this.currentSlide - 1 + this.slides.length) % this.slides.length;
            this.goToSlide(prev);
        },

        start() {
            this.intervalId = setInterval(() => this.nextSlide(), this.slideDuration);
        },

        pause() {
            if (this.intervalId) {
                clearInterval(this.intervalId);
                this.intervalId = null;
            }
        },

        restart() {
            this.pause();
            this.start();
        }
    };

    // Initialize carousel
    carousel.init();

    // Scroll-based animations for cards
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.style.opacity = '1';
                entry.target.style.transform = 'translateY(0)';
            }
        });
    }, observerOptions);

    // Observe cards for fade-in animation
    document.querySelectorAll('.article-card, .point, .info-item').forEach(el => {
        el.style.opacity = '0';
        el.style.transform = 'translateY(20px)';
        el.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
        observer.observe(el);
    });

    // Active navigation highlighting
    const currentPage = window.location.pathname.split('/').pop() || 'index.html';
    document.querySelectorAll('.nav-menu a').forEach(link => {
        if (link.getAttribute('href') === currentPage) {
            link.classList.add('active');
        }
    });
});
