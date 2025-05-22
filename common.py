import sys, os
import logging
import threading
import random
from keyboard_lib import vk

logging.basicConfig(
    level=logging.INFO,
    format='[%(asctime)s](%(filename)s).%(funcName)s(%(lineno)d)[%(levelname)s] %(message)s',
    handlers=[logging.StreamHandler(sys.stdout), logging.FileHandler('../python-soundboard/soundboard.log')]
)

sfx_dir = os.path.join(os.getcwd(), 'sfx')


class Parameter:
    def __init__(self, name, state):
        self.name = name
        self.state = state

    def get(self):
        return self.state

    def set(self, state):
        self.state = state

    def __str__(self):
        return self.name + ': ' + str(self.state)


simultaneous = Parameter('simultaneous', True)
loop = Parameter('loop', False)
do_push_to_talk = Parameter('push_to_talk', False)
keybind = Parameter('push_to_talk_keybind', vk.F20)
