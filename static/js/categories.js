function organizeSoundsByCategory() {
    const gridContainer = document.querySelector('.grid');
    const soundsData = JSON.parse(localStorage.getItem('soundCategories'));

    // Clear existing content
    gridContainer.innerHTML = '';

    // Create a map of categories to sounds
    const categories = new Map();
    categories.set(null, []); // For uncategorized sounds

    soundsData.forEach(sound => {
        const category = sound.category || null;
        if (!categories.has(category)) {
            categories.set(category, []);
        }
        categories.get(category).push(sound);
    });

    // Add layout container
    const layoutContainer = document.createElement('div');
    layoutContainer.className = 'categories-container';
    layoutContainer.dataset.layout = localStorage.getItem('categoryLayout') || 'vertical';
    gridContainer.appendChild(layoutContainer);

    // Add uncategorized sounds first
    if (categories.has(null)) {
        addCategoryToGrid(null, categories.get(null), layoutContainer);
    }

    // Then add categorized sounds in alphabetical order
    [...categories.keys()]
        .filter(category => category !== null)
        .sort()
        .forEach(category => {
            addCategoryToGrid(category, categories.get(category), layoutContainer);
        });

    // Re-setup context menu for new elements
    setupContextMenu();
}

function addCategoryToGrid(category, sounds, container) {
    const categoryContainer = document.createElement('div');
    categoryContainer.className = 'category-container';

    // Only set width in horizontal mode if a saved width exists
    if (container.dataset.layout === 'horizontal') {
        const savedWidth = window.categoryWidths && category !== null ?
            window.categoryWidths[category] : null;
        if (savedWidth) {
            categoryContainer.style.width = `${savedWidth}px`;
            categoryContainer.style.overflow = 'hidden';
        } else {
            // Let CSS flexbox handle sizing
            categoryContainer.style.removeProperty('width');
            categoryContainer.style.removeProperty('overflow');
        }
    } else {
        // In vertical mode, let CSS handle width
        categoryContainer.style.removeProperty('width');
        categoryContainer.style.removeProperty('overflow');
    }

    // Add category header if it's not the null category
    if (category !== null) {
        const header = document.createElement('div');
        header.className = 'category-header draggable';
        header.innerHTML = `
            <span>${category}</span>
            <span class="drag-handle">↕️</span>
        `;
        categoryContainer.appendChild(header);

        // Make category draggable for reordering
        header.addEventListener('mousedown', function(e) {
            if (e.target.classList.contains('drag-handle')) {
                startDrag(e, categoryContainer);
            }
        });
    }

    // Always use sound-buttons-container for grid layout
    const categoryGrid = document.createElement('div');
    categoryGrid.className = 'sound-buttons-container';
    // Let CSS handle width
    categoryGrid.style.removeProperty('width');

    // Add sounds to this category's grid
    sounds.forEach(sound => {
        const button = document.createElement('div');
        button.className = 'sound_button';
        button.textContent = sound.name;
        button.onclick = () => postSound(sound.name);
        categoryGrid.appendChild(button);
    });

    categoryContainer.appendChild(categoryGrid);

    // Add resize handle for horizontal mode
    if (container.dataset.layout === 'horizontal') {
        const resizeHandle = document.createElement('div');
        resizeHandle.className = 'resize-handle';
        categoryContainer.appendChild(resizeHandle);

        // Add event listeners for resizing
        resizeHandle.addEventListener('mousedown', startResize);
    }

    container.appendChild(categoryContainer);
}

function setupContextMenu() {
    let contextMenu = null;
    const soundButtons = document.querySelectorAll('.sound_button');

    // Context menu for desktop (right click)
    soundButtons.forEach(button => {
        button.addEventListener('contextmenu', function(e) {
            e.preventDefault();
            showContextMenu(e, this);
        });

        // Long press for mobile devices
        let pressTimer;
        button.addEventListener('touchstart', function(e) {
            pressTimer = window.setTimeout(() => {
                showContextMenu(e, this);
            }, 600);
        });

        button.addEventListener('touchend', function() {
            clearTimeout(pressTimer);
        });

        button.addEventListener('touchmove', function() {
            clearTimeout(pressTimer);
        });
    });

    // Close menu when clicking elsewhere
    document.addEventListener('click', function(e) {
        if (contextMenu && !contextMenu.contains(e.target)) {
            contextMenu.remove();
        }
    });

    function showContextMenu(e, button) {
        // Remove any existing menu
        if (contextMenu) {
            contextMenu.remove();
        }

        // Create menu element
        contextMenu = document.createElement('div');
        contextMenu.className = 'context-menu';

        // Position the menu
        const x = e.type.includes('touch') ?
            e.changedTouches[0].pageX : e.pageX;
        const y = e.type.includes('touch') ?
            e.changedTouches[0].pageY : e.pageY;

        const soundName = button.textContent;
        const soundData = getSoundData(soundName);

        // Add menu items

        // Category option
        const categoryItem = document.createElement('div');
        categoryItem.className = 'context-menu-item';
        categoryItem.innerHTML = `<span>Category: ${soundData.category || 'None'}</span>`;
        categoryItem.onclick = () => showCategoryDialog(soundName);
        contextMenu.appendChild(categoryItem);

        // Delete option
        const deleteItem = document.createElement('div');
        deleteItem.className = 'context-menu-item';
        deleteItem.innerHTML = '<span>Delete Sound</span>';
        deleteItem.style.color = 'var(--button-bad)';
        deleteItem.onclick = () => deleteSound(soundName);
        contextMenu.appendChild(deleteItem);

        // Position and add to DOM
        contextMenu.style.left = `${x}px`;
        contextMenu.style.top = `${y}px`;
        document.body.appendChild(contextMenu);

        // Adjust position if menu goes off screen
        const rect = contextMenu.getBoundingClientRect();
        if (rect.right > window.innerWidth) {
            contextMenu.style.left = `${window.innerWidth - rect.width - 10}px`;
        }
        if (rect.bottom > window.innerHeight) {
            contextMenu.style.top = `${window.innerHeight - rect.height - 10}px`;
        }
    }
}

function showCategoryDialog(soundName) {
    const dialog = document.createElement('div');
    dialog.style.position = 'fixed';
    dialog.style.top = '50%';
    dialog.style.left = '50%';
    dialog.style.transform = 'translate(-50%, -50%)';
    dialog.style.backgroundColor = 'var(--main)';
    dialog.style.padding = '20px';
    dialog.style.borderRadius = '12px';
    dialog.style.border = '2px solid var(--highlight)';
    dialog.style.zIndex = '2000';

    dialog.innerHTML = `
        <h3>Set Category</h3>
        <input type="text" class="category-input" id="categoryInput" 
               placeholder="Enter category name" 
               value="${getSoundData(soundName).category || ''}">
        <div style="display:flex;justify-content:space-between;margin-top:15px;">
            <button id="cancelButton" style="font-size:16px;padding:10px;">Cancel</button>
            <button id="saveButton" style="font-size:16px;padding:10px;">Save</button>
        </div>
    `;

    document.body.appendChild(dialog);

    const input = document.getElementById('categoryInput');
    input.focus();

    document.getElementById('cancelButton').onclick = () => {
        dialog.remove();
    };

    document.getElementById('saveButton').onclick = () => {
        setCategory(soundName, input.value.trim());
        dialog.remove();
        organizeSoundsByCategory();
    };
}

function setCategory(soundName, category) {
    const sounds = JSON.parse(localStorage.getItem('soundCategories'));
    const sound = sounds.find(s => s.name === soundName);
    if (sound) {
        sound.category = category === '' ? null : category;
        localStorage.setItem('soundCategories', JSON.stringify(sounds));

        // Save to server
        fetch('/update_sound_category', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({name: soundName, category: sound.category})
        });
    }
}

function deleteSound(soundName) {
    if (confirm(`Are you sure you want to delete "${soundName}"?`)) {
        fetch('/delete_sound', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({name: soundName})
        }).then(response => {
            if (response.ok) {
                // Remove from localStorage and refresh the view
                const sounds = JSON.parse(localStorage.getItem('soundCategories'));
                const updatedSounds = sounds.filter(s => s.name !== soundName);
                localStorage.setItem('soundCategories', JSON.stringify(updatedSounds));
                organizeSoundsByCategory();
            }
        });
    }
}

function getSoundData(name) {
    const sounds = JSON.parse(localStorage.getItem('soundCategories'));
    const sound = sounds.find(s => s.name === name);
    return sound || { name, category: null, order: 0 };
}

function startDrag(e, element) {
    e.preventDefault();
    element.classList.add('dragging');

    const container = element.parentElement;
    const initialY = e.clientY;
    const initialIndex = Array.from(container.children).indexOf(element);

    function drag(e) {
        const currentY = e.clientY;
        const diff = currentY - initialY;
        element.style.transform = `translateY(${diff}px)`;

        const categories = Array.from(container.children);
        const currentIndex = categories.indexOf(element);

        // Check if we need to swap positions
        categories.forEach((category, index) => {
            if (index !== currentIndex) {
                const rect = category.getBoundingClientRect();
                const midpoint = rect.top + rect.height / 2;

                if (currentY < midpoint && index < currentIndex) {
                    container.insertBefore(element, category);
                } else if (currentY > midpoint && index > currentIndex) {
                    container.insertBefore(category, element.nextSibling);
                }
            }
        });
    }

    function stopDrag() {
        element.classList.remove('dragging');
        element.style.transform = '';
        document.removeEventListener('mousemove', drag);
        document.removeEventListener('mouseup', stopDrag);

        // Save new category order
        saveNewCategoryOrder();
    }

    document.addEventListener('mousemove', drag);
    document.addEventListener('mouseup', stopDrag);
}

