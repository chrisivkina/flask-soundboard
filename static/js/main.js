let fullScreenState = false;

// Connect to Socket.IO server at current window location
const socket = io(window.location.origin);

socket.on('connect', function() {
    console.log('Connected to socket server');
});

document.addEventListener('DOMContentLoaded', function() {
    // Initialize sounds data structure if not already in localStorage
    if (!localStorage.getItem('soundCategories')) {
        const soundElements = document.querySelectorAll('.sound_button');
        const sounds = Array.from(soundElements).map(el => {
            return {
                name: el.textContent,
                category: null,
                order: 0
            };
        });

        localStorage.setItem('soundCategories', JSON.stringify(sounds));
    }

    // Load layout settings from server
    loadLayoutSettings().then(() => {
        // Setup context menu
        setupContextMenu();

        // Organize and display sounds by categories
        organizeSoundsByCategory();
    });

    // Set up layout toggle button
    const layoutBtn = document.getElementById('layout_toggle_button');
    function updateLayoutBtnText() {
        const mode = localStorage.getItem('categoryLayout') || 'vertical';
        layoutBtn.textContent = mode === 'horizontal' ? 'Switch to Vertical Layout' : 'Switch to Horizontal Layout';
    }
    layoutBtn.onclick = function() {
        toggleCategoryLayout();
        updateLayoutBtnText();
    };
    updateLayoutBtnText();
});