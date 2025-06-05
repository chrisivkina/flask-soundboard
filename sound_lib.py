"""
An abstraction layer for sound playback using sbsdl2.
"""

from common import *
import sbsdl2
import keyboard_lib as kb

import time
import threading
import random
import logging


class Sound:
    def __init__(self, file):
        self.file = file
        self.name = file.split('.')[0]
        self.path = str(os.path.join(sfx_dir, self.file))
        self.hotkey = None

        # Load the chunk immediately to calculate duration
        self.chunk = sbsdl2.load_sound(self.path)

        # Calculate duration in seconds
        # Using format parameters from sbsdl2.init():
        # - Sample rate: 44100 Hz
        # - Channels: 2 (stereo)
        # - Format: 16-bit (2 bytes per sample)
        bytes_per_second = 44100 * 2 * 2  # sample_rate * channels * bytes_per_sample
        self.calculated_duration = self.chunk.alen / bytes_per_second

    def set_hotkey(self, parsable):
        self.hotkey = parsable

    def remove_hotkey(self):
        self.hotkey = None

    def play(self):
        play(self.chunk)


def handle_pause_or_resume():
    if sbsdl2.is_paused():
        sbsdl2.resume()

    elif sbsdl2.is_playing():
        sbsdl2.pause()


def play(chunk):
    loops = -1 if loop.get() else 0
    if simultaneous.get():
        def play_nested():
            sbsdl2.play_from_chunks(chunk, loops=loops)

            if do_push_to_talk.get():
                print('Push to talk')
                kb.PressKey(keybind.get())
                while sbsdl2.is_playing():
                    time.sleep(0.1)
                print('Release key')
                kb.ReleaseKey(keybind.get())

        threading.Thread(target=play_nested).start()
    else:
        stop()
        sbsdl2.play_from_chunks(chunk, loops=loops)


def stop():
    sbsdl2.stop()


def random_sound(sound_selection):
    play(random.choice(sound_selection).chunk)


def change_volume(vol):
    sbsdl2.set_volume(vol)


def change_device(device_name):
    logging.debug(f'Changing device to {device_name}')
    sbsdl2.change_output_device(device_name)


def on_closing():
    sbsdl2.quit_mixer()


def get_volume():
    return sbsdl2.get_volume()


def is_paused():
    return sbsdl2.is_paused()


def print_debug_info():
    logging.info('Simultaneous:' + str(simultaneous))
    logging.info('Loop:' + str(loop))
    logging.info('Paused:' + str(sbsdl2.is_paused()))
    logging.info('Playing:' + str(sbsdl2.is_playing()))
    logging.info('Output Device:' + str(sbsdl2.get_default_audio_stats()))
    logging.info('Errors:' + str(sbsdl2.get_errors()))
    logging.info('Output Devices:' + str(sbsdl2.get_audio_devices()))
    logging.info('Recording Devices:' + str(sbsdl2.get_audio_devices(rec=True)))
