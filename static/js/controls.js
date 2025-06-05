// Connect to Socket.IO server at current window location
const socket = io(window.location.origin);

socket.on('connect', function() {
    console.log('Connected to socket server');
});

socket.on('settings', function(data) {
    sim = data.sim;
    loop = data.loop;
    do_push_to_talk = data.do_push_to_talk;
    paused = data.paused;
    document.getElementById('volume').value = data.volume;

    updateButtonColors();
});

function postChangeParameter(parameter) {
    if (parameter === 'simultaneous') {
        sim = !sim;
    } else if (parameter === 'loop') {
        loop = !loop;
    } else if (parameter === 'do_push_to_talk') {
        do_push_to_talk = !do_push_to_talk;
    }

    updateButtonColors();

    socket.emit('toggle_parameter', { parameter: parameter });
}

function updateButtonColors() {
    let loopButton = document.getElementById('loop_button');
    let simButton = document.getElementById('sim_button');
    let keyboard_button = document.getElementById('keyboard_button');

    const on_color = '#137800';
    const off_color = '#c50000';

    if (loop) {
        loopButton.style.backgroundColor = on_color;
    } else {
        loopButton.style.backgroundColor = off_color;
    }

    if (sim) {
        simButton.style.backgroundColor = on_color;
    } else {
        simButton.style.backgroundColor = off_color;
    }

    if (do_push_to_talk) {
        keyboard_button.style.backgroundColor = on_color;
    } else {
        keyboard_button.style.backgroundColor = off_color;
    }

    if (paused) {
        document.getElementById('pause_button_img').setAttribute('src', play_img);
    } else {
        document.getElementById('pause_button_img').setAttribute('src', pause_img);
    }
}

function refreshSettings() {
    socket.emit('get_settings');  // Server should respond with 'settings' event, handled above
}

function postAction(action) {
    if (action === 'pause_or_resume') {
        paused = !paused;
    }

    updateButtonColors();

    socket.emit(action);
}

function postSound(sound) {
    socket.emit('play_sound', { sound: sound });
}

function postVolumeChange() {
    let volume = document.getElementById('volume').value;
    socket.emit('set_volume', { volume: volume });
}

function toggleFullScreen() {
    let doc = window.document;
    let docEl = doc.documentElement;

    let requestFullScreen = docEl.requestFullscreen || docEl.mozRequestFullScreen || docEl.webkitRequestFullScreen || docEl.msRequestFullscreen;
    let cancelFullScreen = doc.exitFullscreen || doc.mozCancelFullScreen || doc.webkitExitFullscreen || doc.msExitFullscreen;

    if (!doc.fullscreenElement && !doc.mozFullScreenElement && !doc.webkitFullscreenElement && !doc.msFullscreenElement) {
        requestFullScreen.call(docEl);
        fullScreenState = true;
    } else {
        cancelFullScreen.call(doc);
        fullScreenState = false;
    }
}

function deleteSound(soundName) {
    if (confirm(`Are you sure you want to delete "${soundName}"?`)) {
        socket.emit('delete_sound', { name: soundName });

        // Listen for confirmation of deletion from the server, only triggers once
        socket.once('deleted_sound', function(data) {
            // Remove from localStorage and refresh the view
            const sounds = JSON.parse(localStorage.getItem('soundCategories'));
            const updatedSounds = sounds.filter(s => s.name !== soundName);
            localStorage.setItem('soundCategories', JSON.stringify(updatedSounds));
            organizeSoundsByCategory();
        });
    }
}