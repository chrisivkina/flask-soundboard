function loadLayoutSettings() {
    return fetch('/get_layout_settings')
        .then(response => response.json())
        .then(settings => {
            // Set layout mode
            if (settings.layoutMode) {
                localStorage.setItem('categoryLayout', settings.layoutMode);
            }

            // Store category widths for later use
            window.categoryWidths = settings.categoryWidths || {};
            window.categoryOrder = settings.categoryOrder || [];

            return settings;
        })
        .catch(error => {
            console.error('Error loading layout settings:', error);
            // Use defaults if loading fails
            return {
                layoutMode: "vertical",
                categoryWidths: {},
                categoryOrder: []
            };
        });
}

function saveLayoutSettings() {
    const settings = {
        layoutMode: localStorage.getItem('categoryLayout') || 'vertical',
        categoryWidths: window.categoryWidths || {},
        categoryOrder: window.categoryOrder || []
    };

    return fetch('/save_layout_settings', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(settings)
    });
}

function saveNewCategoryOrder() {
    const categoryContainers = document.querySelectorAll('.category-container');
    const categoryOrder = Array.from(categoryContainers)
        .map((container, index) => {
            const header = container.querySelector('.category-header');
            if (header) {
                return {
                    category: header.querySelector('span').textContent,
                    order: index
                };
            }
            return null;
        })
        .filter(item => item !== null);

    // Save to server API
    fetch('/update_category_order', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({categories: categoryOrder})
    });

    // Also save to layout settings
    window.categoryOrder = categoryOrder;
    saveLayoutSettings();
}

function toggleCategoryLayout() {
    const currentLayout = localStorage.getItem('categoryLayout') || 'vertical';
    const newLayout = currentLayout === 'vertical' ? 'horizontal' : 'vertical';

    localStorage.setItem('categoryLayout', newLayout);

    // Save the new layout mode to server
    window.categoryWidths = getCategoryWidths();
    saveLayoutSettings();

    organizeSoundsByCategory();
}

function getCategoryWidths() {
    const widths = {};
    document.querySelectorAll('.category-container').forEach(container => {
        const header = container.querySelector('.category-header');
        if (header) {
            const category = header.querySelector('span').textContent;
            widths[category] = container.offsetWidth;
        }
    });
    return widths;
}

function startResize(e) {
    e.preventDefault();
    e.stopPropagation();

    const categoryContainer = this.parentElement;
    const initialX = e.clientX;
    const initialWidth = categoryContainer.offsetWidth;
    const parent = categoryContainer.parentElement;
    const parentWidth = parent.offsetWidth;
    const minWidth = 180;
    const maxWidth = parentWidth - 40; // leave some space for other categories

    document.body.style.cursor = 'col-resize';

    function resize(e) {
        let newWidth = initialWidth + (e.clientX - initialX);
        newWidth = Math.max(minWidth, Math.min(newWidth, maxWidth));
        categoryContainer.style.setProperty('width', `${newWidth}px`, 'important');
        categoryContainer.style.setProperty('flex-basis', `${newWidth}px`, 'important');
        categoryContainer.style.setProperty('min-width', `${newWidth}px`, 'important');
        categoryContainer.style.setProperty('max-width', `${newWidth}px`, 'important');
    }

    function stopResize() {
        document.removeEventListener('mousemove', resize);
        document.removeEventListener('mouseup', stopResize);
        document.body.style.cursor = '';

        // Save the updated widths
        window.categoryWidths = getCategoryWidths();
        saveLayoutSettings();
    }

    document.addEventListener('mousemove', resize);
    document.addEventListener('mouseup', stopResize);
}

