""""
This module sets up shared resources and logging for the soundboard application.
"""

import sys
import os
import logging
from keyboard_lib import vk

logging.basicConfig(
    level=logging.DEBUG,
    format='[%(asctime)s](%(filename)s).%(funcName)s(%(lineno)d)[%(levelname)s] %(message)s',
    handlers=[logging.StreamHandler(sys.stdout), logging.FileHandler('soundboard.log')]
)

# SDL2 DLL path setup, this works for both normal execution and PyInstaller builds
os.environ['PYSDL2_DLL_PATH'] = os.path.join(
    getattr(
        sys,
        '_MEIPASS',
        os.path.dirname(os.path.abspath(__file__))
    ),
    'bin',
    'sdl2'
)

sfx_dir = os.path.join(os.getcwd(), 'sfx')


class Parameter:
    """A simple class to hold parameters with a name and state."""

    def __init__(self, name, state):
        """"Initialize the parameter with a name and state."""
        self.name = name
        self.state = state

    def get(self):
        """Return the current state of the parameter."""
        return self.state

    def set(self, state):
        """Set the state of the parameter."""
        self.state = state

    def toggle(self):
        """Toggle the state of the parameter."""
        self.state = not self.state

    def __str__(self):
        """Return a string representation of the parameter."""
        return self.name + ': ' + str(self.state)


simultaneous = Parameter('simultaneous', True)
loop = Parameter('loop', False)
do_push_to_talk = Parameter('push_to_talk', False)
keybind = Parameter('push_to_talk_keybind', vk.F20)
