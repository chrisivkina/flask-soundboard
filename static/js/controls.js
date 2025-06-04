function postChangeParameter(parameter) {
    if (parameter === 'simultaneous') {
        sim = !sim;
    } else if (parameter === 'loop') {
        loop = !loop;
    } else if (parameter === 'do_push_to_talk') {
        do_push_to_talk = !do_push_to_talk;
    }

    updateButtonColors();

    fetch('/change_parameter', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({parameter: parameter})
    }).then(() => {
        refreshSettings();
    });
}

function updateButtonColors() {
    let loopButton = document.getElementById('loop_button');
    let simButton = document.getElementById('sim_button');
    let keyboard_button = document.getElementById('keyboard_button');

    if (loop) {
        loopButton.style.backgroundColor = '#137800';
    } else {
        loopButton.style.backgroundColor = '#c50000';
    }

    if (sim) {
        simButton.style.backgroundColor = '#137800';
    } else {
        simButton.style.backgroundColor = '#c50000';
    }

    if (do_push_to_talk) {
        keyboard_button.style.backgroundColor = '#137800';
    } else {
        keyboard_button.style.backgroundColor = '#c50000';
    }

    if (paused) {
        document.getElementById('pause_button_img').setAttribute('src', play_img);
    } else {
        document.getElementById('pause_button_img').setAttribute('src', pause_img);
    }
}

function syncButtonColorsWithSettings() {
    refreshSettings().then(() => {
        updateButtonColors();
    });
}

function refreshSettings() {
    return fetch('/get_settings', {
        method: 'POST',
    })
    .then(response => response.json())
    .then(data => {
        console.log(data);
        sim = data.sim;
        loop = data.loop;
        do_push_to_talk = data.do_push_to_talk;
        paused = data.paused;
        document.getElementById('volume').value = data.volume;
        return data;
    });
}

function postAction(action) {
    if (action === 'pause_or_resume') {
        paused = !paused;
    }

    updateButtonColors();

    fetch('/action', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({action: action})
    }).then(() => {
        refreshSettings();
    });
}

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
