function postSound(sound) {
    syncButtonColorsWithSettings();

    fetch('/play', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({sound: sound})
    });
}

function postDebugInfo() {
    fetch('/print_debug_info', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({debug: 'info'})
    });
}

function postAction(action) {
    if (action === 'pause_or_resume') {
        paused = !paused;
    }

    syncButtonColorsWithSettings()

    fetch('/action', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({action: action})
    });
}

function postChangeParameter(parameter) {
    if (parameter === 'simultaneous') {
        sim = !sim;
    } else if (parameter === 'loop') {
        loop = !loop;
    } else if (parameter === 'do_push_to_talk') {
        do_push_to_talk = !do_push_to_talk;
    }

    syncButtonColorsWithSettings();

    fetch('/change_parameter', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({parameter: parameter})
    });
}

function postVolumeChange() {
    let volume = document.getElementById('volume').value;
    console.log(volume);

    fetch('/change_volume', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({volume: volume})
    });
}

function syncButtonColorsWithSettings() {
    refreshSettings();

    let loopButton = document.getElementById('loop_button');
    let simButton = document.getElementById('sim_button');
    let let_keyboard_button = document.getElementById('keyboard_button');

    if (loop) {
        // loopButton.innerHTML = 'Loop: On';
        loopButton.style.backgroundColor = '#137800';
    } else {
        // loopButton.innerHTML = 'Loop: Off';
        loopButton.style.backgroundColor = '#c50000';
    }

    if (sim) {
        // simButton.innerHTML = 'Simultaneous: On';
        simButton.style.backgroundColor = '#137800';
    } else {
        // simButton.innerHTML = 'Simultaneous: Off';
        simButton.style.backgroundColor = '#c50000';
    }

    if (do_push_to_talk) {
        let_keyboard_button.style.backgroundColor = '#137800';
    } else {
        let_keyboard_button.style.backgroundColor = '#c50000';
    }

    if (paused) {
        document.getElementById('pause_button_img').setAttribute('src', play_img);
    } else {
        document.getElementById('pause_button_img').setAttribute('src', pause_img);
    }
}

let fullScreenState = false;

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

function refreshSettings() {
    fetch('/get_settings', {
        method: 'POST',
    }).then(response => response.json()).then(data => {
        console.log(data);
        sim = data.sim;
        loop = data.loop;
        do_push_to_talk = data.do_push_to_talk;
        paused = data.paused;
        document.getElementById('volume').value = data.volume;
    });
}