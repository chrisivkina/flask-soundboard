"""
Main application file for the soundboard web application.
"""

from flask import Flask, render_template, request, send_from_directory
from flask_socketio import SocketIO

import atexit
import json
import os
import logging

# common must be imported first, it defines DLL_PATH which is used by sbsdl2
from common import simultaneous, loop, do_push_to_talk, sfx_dir
import sound_lib
import sbsdl2 as sound_backend

# Path to the layout settings file
SETTINGS_FILE = os.path.join(os.path.dirname(__file__), 'data', 'layout_settings.json')

# Create data directory if it doesn't exist
os.makedirs(os.path.dirname(SETTINGS_FILE), exist_ok=True)

app = Flask(__name__)
app.config['SECRET_KEY'] = os.urandom(24)
socket = SocketIO(app, cors_allowed_origins='*')

# Load sound files from the sfx directory
sfx_files = os.listdir(sfx_dir)
sounds = []


@app.route('/')
def index():
    """Render the main index page with sound data and parameters."""
    return render_template(
        'index.html',
        sounds=sounds,
        volume=sound_lib.get_volume(),
        simultaneous=simultaneous.get(),
        loop=loop.get(),
        paused=sound_lib.is_paused(),
        do_push_to_talk=do_push_to_talk.get()
    )


@socket.on('connect')
def handle_connect():
    logging.info('Client connected')
    socket.emit('settings', compile_settings())  # Send initial settings to the client
    socket.emit('sound_list', [sound.name for sound in sounds])  # Send initial sound list


@socket.on('get_sounds')
def handle_get_sounds():
    """Send the list of available sounds to the client."""
    socket.emit('sound_list', [sound.name for sound in sounds])
    logging.debug('Sent sounds to client')


@socket.on('disconnect')
def handle_disconnect():
    logging.info('Client disconnected')


@socket.on('play_sound')
def handle_play_sound(data):
    if 'sound' not in data:
        logging.error('No sound provided in play_sound event')
        return

    sound_name = data['sound']
    sound_class = get_sound_class_by_name(sound_name)
    if sound_class:
        sound_class.play()
        logging.debug(f'Playing sound: {sound_name}')
    else:
        logging.error(f'Sound not found: {sound_name}')


@socket.on('toggle_parameter')
def handle_toggle_parameter(data):
    """Toggle a parameter based on the event data."""
    parameter = data['parameter']
    if parameter == 'simultaneous':
        simultaneous.toggle()
    elif parameter == 'loop':
        loop.toggle()
    elif parameter == 'do_push_to_talk':
        do_push_to_talk.toggle()
    else:
        logging.error(f'Invalid parameter: {parameter}')
        return

    logging.debug(f'Toggled parameter: {parameter}')
    socket.emit('settings', compile_settings())  # Refresh settings for all clients


@socket.on('set_volume')
def handle_volume_change(data):
    """Change the volume based on the event data."""
    volume = data['volume']
    sound_lib.change_volume(int(volume))
    logging.debug(f'Volume changed to: {volume}')


@socket.on('pause_or_resume')
def handle_pause_or_resume():
    """Toggle pause or resume playback."""
    sound_lib.handle_pause_or_resume()
    logging.debug('Toggled pause/resume')


@socket.on('stop')
def handle_stop():
    """Stop playback of all sounds."""
    sound_lib.stop()
    logging.debug('Stopped playback')


@socket.on('random')
def handle_random_sound():
    """Play a random sound from the available sounds."""
    sound_lib.random_sound(sounds)
    logging.debug('Random sound played')


@socket.on('get_settings')
def handle_get_settings():
    """Send the current settings to the client."""
    send_settings()


@socket.on('update_sound_category')
def handle_update_sound_category(data):
    """Handle the update sound category event from the client."""
    if 'name' not in data or 'category' not in data:
        logging.error('Missing name or category in update_sound_category event')
        return

    name = data['name']
    category = data['category']

    # Here you would update your sound data structure or database
    # For now we just acknowledge the request
    logging.info(f"Updated sound {name} to category {category}")


@socket.on('delete_sound')
def handle_delete_sound(data):
    """Handle the delete sound event from the client."""
    global sfx_files

    if 'name' not in data:
        logging.error('No sound name provided in delete_sound event')
        return

    name = data['name']

    file_path = None

    # Find the sound file in the sfx directory, any file with the same name (without extension)
    for f in sfx_files:
        if os.path.splitext(f)[0] == name:
            file_path = os.path.join(sfx_dir, f)
            break

    if file_path and os.path.exists(file_path):
        os.remove(file_path)
        sfx_files = os.listdir(sfx_dir)
        populate_sounds()
        logging.info(f"Deleted sound {name}")
        socket.emit('deleted_sound', {'name': name})
    else:
        logging.error(f'Sound not found: {name}')


@socket.on('update_category_order')
def handle_update_category_order(data):
    """Handle the update category order event from the client."""
    if 'categories' not in data:
        logging.error('No categories provided in update_category_order event')
        return

    categories = data['categories']
    # Here you would update your sound data structure or database
    # For now we just acknowledge the request
    logging.debug(f"Updated category order: {categories}")


@socket.on('get_layout_settings')
def handle_get_layout_settings():
    """Handle the get layout settings event from the client."""
    settings = get_layout_settings()
    socket.emit('layout_settings', settings)


@socket.on('save_layout_settings')
def handle_save_layout_settings(data):
    """Handle the save layout settings event from the client."""
    if not data:
        logging.error('No settings data provided in save_layout_settings event')
        return

    if save_layout_settings(data):
        logging.debug('Layout settings saved successfully')
    else:
        logging.error('Error saving layout settings')


def send_settings():
    """Send the current settings to all connected clients."""
    settings = compile_settings()
    socket.emit('settings', settings)
    logging.debug('Sent current settings to all clients')


def compile_settings():
    """Compile the current settings into a dictionary."""
    return {
        'simultaneous': simultaneous.get(),
        'loop': loop.get(),
        'do_push_to_talk': do_push_to_talk.get(),
        'volume': sound_lib.get_volume(),
        'paused': sound_lib.is_paused()
    }


def get_layout_settings():
    """Load layout settings from file or return defaults if file doesn't exist"""
    if not os.path.exists(SETTINGS_FILE):
        return {
            "layoutMode": "vertical",
            "categoryWidths": {},
            "categoryOrder": []
        }

    try:
        with open(SETTINGS_FILE, 'r') as f:
            return json.load(f)
    except Exception as e:
        logging.error(f"Error loading layout settings: {e}")
        return {
            "layoutMode": "vertical",
            "categoryWidths": {},
            "categoryOrder": []
        }


def save_layout_settings(settings):
    """Save layout settings to file"""
    try:
        with open(SETTINGS_FILE, 'w') as f:
            json.dump(settings, f, indent=2)
        return True
    except Exception as e:
        logging.error(f"Error saving layout settings: {e}")
        return False


def get_sound_class_by_name(name):
    idx = sfx_files.index(name + '.mp3')
    return sounds[idx]


def populate_sounds():
    global sounds

    sounds = []
    for sound in sfx_files:
        sounds.append(sound_lib.Sound(sound))


def run():
    sound_backend.init()

    # Register sound_lib destructor function to be called on exit
    atexit.register(sound_lib.on_closing)

    socket.run(app, host='0.0.0.0', port=8080, debug=True, allow_unsafe_werkzeug=True)


# Load sound files from the sfx directory
populate_sounds()


if __name__ == '__main__':
    run()
