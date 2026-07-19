document.addEventListener('DOMContentLoaded', () => {
    // DOM Elements
    const navItems = document.querySelectorAll('.nav-menu .nav-item');
    const pages = document.querySelectorAll('.viewer-container .page');
    const viewerContainer = document.getElementById('viewerContainer');
    const docHeading = document.getElementById('docHeading');
    const zoomSlider = document.getElementById('zoomSlider');
    const zoomVal = document.getElementById('zoomVal');
    const themeToggleBtn = document.getElementById('themeToggleBtn');
    const printBtn = document.getElementById('printBtn');
    const prevPageBtn = document.getElementById('prevPageBtn');
    const nextPageBtn = document.getElementById('nextPageBtn');

    let currentPageIndex = 0; // 0-indexed

    // 1. Navigation / Scroll Behavior
    const pageTitles = [
        "Cover Page",
        "Abstract & Guidance",
        "Introduction",
        "Week 1: Study of Algorithms",
        "Week 2: Paper Presentation",
        "UHD-UOD Workflow Diagram",
        "Marine Former Workflow Diagram",
        "AquaticCLIP & Grounding DINO Workflow",
        "Week 3: Result Analysis",
        "Input for Algorithms",
        "Code Implementation - Part 1",
        "Code Implementation - Part 2",
        "Outputs for Algorithm",
        "Week 4: Project & Submission",
        "Conclusion"
    ];

    function updateActiveNavItem(pageIndex) {
        navItems.forEach((item, index) => {
            if (index === pageIndex) {
                item.classList.add('active');
            } else {
                item.classList.remove('active');
            }
        });
        currentPageIndex = pageIndex;
        docHeading.textContent = pageTitles[pageIndex] || "NITTTR Report";
    }

    // Scroll listener to update sidebar active button on scroll
    viewerContainer.addEventListener('scroll', () => {
        let currentActive = 0;
        const containerTop = viewerContainer.getBoundingClientRect().top;
        const containerHeight = viewerContainer.clientHeight;
        
        pages.forEach((page, index) => {
            const pageRect = page.getBoundingClientRect();
            if (pageRect.top - containerTop < containerHeight / 2) {
                currentActive = index;
            }
        });

        updateActiveNavItem(currentActive);
    });

    // Sidebar button click handler
    navItems.forEach((item, index) => {
        item.addEventListener('click', () => {
            const targetPage = pages[index];
            if (targetPage) {
                targetPage.scrollIntoView({ behavior: 'smooth', block: 'start' });
                updateActiveNavItem(index);
            }
        });
    });

    // Next / Previous buttons
    prevPageBtn.addEventListener('click', () => {
        if (currentPageIndex > 0) {
            const targetPage = pages[currentPageIndex - 1];
            targetPage.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
    });

    nextPageBtn.addEventListener('click', () => {
        if (currentPageIndex < pages.length - 1) {
            const targetPage = pages[currentPageIndex + 1];
            targetPage.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
    });

    // 2. Zoom / Scale Controls
    zoomSlider.addEventListener('input', (e) => {
        const val = e.target.value;
        document.documentElement.style.setProperty('--zoom-level', val);
        zoomVal.textContent = `${Math.round(val * 100)}%`;
    });

    // 3. Theme Toggling
    themeToggleBtn.addEventListener('click', () => {
        const currentTheme = document.documentElement.getAttribute('data-theme');
        const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
        document.documentElement.setAttribute('data-theme', newTheme);
    });

    // 4. Print / PDF Export
    printBtn.addEventListener('click', () => {
        const originalZoom = zoomSlider.value;
        document.documentElement.style.setProperty('--zoom-level', '1');
        zoomSlider.value = '1.0';
        zoomVal.textContent = '100%';

        window.print();

        setTimeout(() => {
            document.documentElement.style.setProperty('--zoom-level', originalZoom);
            zoomSlider.value = originalZoom;
            zoomVal.textContent = `${Math.round(originalZoom * 100)}%`;
        }, 1000);
    });
});
