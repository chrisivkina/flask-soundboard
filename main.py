from flask import Flask, render_template, request
import atexit

import sound_lib
import sbsdl2 as sound_backend
from common import *

app = Flask(__name__)
app.config['SECRET_KEY'] = os.urandom(24)
app.config['HOST'] = '0.0.0.0'
app.config['PORT'] = 8080
app.config['DEBUG'] = True
app.config['TEMPLATES_AUTO_RELOAD'] = True


@app.route('/')
def index():  # put application's code here
    sounds_category_2 = []

    for i, s in enumerate(sounds):
        if s.name.endswith('_s'):
            sounds_category_2.append(sounds[i])

    return render_template(
        'index.html',
        sounds=sounds,
        sounds_category_2=sounds_category_2,
        volume=sound_lib.get_volume(),
        simultaneous=simultaneous.get(),
        loop=loop.get(),
        paused=sound_lib.is_paused(),
        do_push_to_talk=do_push_to_talk.get()
    )


@app.route('/play', methods=['POST'])
def play():
    if 'sound' not in request.json.keys():
        return 'No sound provided'

    to_play = request.json['sound']
    s = get_sound_class_by_name(to_play)
    s.play()

    return 'Playing sound'


@app.route('/print_debug_info', methods=['POST'])
def print_debug_info():
    sound_lib.print_debug_info()
    return 'Printed debug info'


@app.route('/change_parameter', methods=['POST'])
def change_parameter():
    if 'parameter' not in request.json.keys():
        return 'No parameter provided'

    parameter = request.json['parameter']
    if parameter == 'simultaneous':
        simultaneous.set(not simultaneous.get())
    elif parameter == 'loop':
        loop.set(not loop.get())
    elif parameter == 'do_push_to_talk':
        do_push_to_talk.set(not do_push_to_talk.get())
    else:
        return 'Invalid parameter'

    return 'Changed parameter'


@app.route('/change_volume', methods=['POST'])
def change_volume():
    if 'volume' not in request.json.keys():
        return 'No volume provided'

    volume = request.json['volume']

    sound_lib.change_volume(int(volume))

    return 'Changed volume'


@app.route('/action', methods=['POST'])
def action():
    if 'action' not in request.json.keys():
        return 'No action provided'

    a = request.json['action']
    if a == 'pause_or_resume':
        sound_lib.handle_pause_or_resume()
    elif a == 'stop':
        sound_lib.stop()
    elif a == 'random':
        sound_lib.random_sound(sounds)
    else:
        return 'Invalid action'

    return 'Performed action'


@app.route('/get_settings', methods=['POST'])
def get_settings():
    return {
        'simultaneous': simultaneous.get(),
        'loop': loop.get(),
        'do_push_to_talk': do_push_to_talk.get(),
        'volume': sound_lib.get_volume()
    }


def get_sound_class_by_name(name):
    idx = sfx_files.index(name + '.mp3')
    return sounds[idx]


def run():
    sound_backend.init()

    # Register the function to be called on exit
    atexit.register(sound_lib.on_closing)

    app.run(host='0.0.0.0', port=8080, debug=True)


sfx_files = os.listdir(sfx_dir)


def populate_sounds():
    global sounds

    sounds = []
    for sound in sfx_files:
        sounds.append(sound_lib.Sound(sound))


sounds = []
populate_sounds()


def get_sounds():
    global sfx_files

    new_files = os.listdir(sfx_dir)
    if new_files != sfx_files:
        populate_sounds()
        sfx_files = new_files
    return sounds


if __name__ == '__main__':
    run()
