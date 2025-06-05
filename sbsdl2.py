"""
A simple wrapper around SDL2_mixer for audio playback.
"""

from ctypes import c_char_p
import threading
import logging
import sdl2.sdlmixer as mixer
import sdl2

current_volume = None  # to be set in init()


def init(
        frequency: int = 44100,
        audio_format: int = sdl2.AUDIO_S16,
        channels: int = 2,
        chunk_size: int = 1024,  # 512 maybe
        _device: bytes = None,
        changes_allowed: bool = True,
        starting_volume: int = 64,
        audio_channels: int = 256
):
    global current_volume

    sdl2.SDL_InitSubSystem(sdl2.SDL_INIT_AUDIO)
    if _device is None:
        _device = find_audio_device('vb-audio virtual cable')
        if _device is not None:
            logging.debug('Using Virtual Cable.')
        else:
            logging.warning('No Virtual Cable detected. Using default playback device.')
            _device = get_default_audio_stats()['device']

    # enable support for mp3, ogg, flac
    flags = mixer.MIX_INIT_MP3 | mixer.MIX_INIT_OGG | mixer.MIX_INIT_FLAC
    if mixer.Mix_Init(flags) != flags:  # verify both libraries loaded properly
        logging.error(mixer.Mix_GetError())

    mixer.Mix_OpenAudioDevice(
        frequency,
        audio_format,
        channels,
        chunk_size,
        _device,
        int(changes_allowed)
    )

    mixer.Mix_AllocateChannels(audio_channels)
    mixer.Mix_Volume(-1, starting_volume)  # volume to half on all channels
    current_volume = starting_volume


def get_audio_devices(rec: bool = False):
    devices = [
        sdl2.SDL_GetAudioDeviceName(i, rec)
        for i in range(0, sdl2.SDL_GetNumAudioDevices(rec))
    ]

    assert len(devices) == sdl2.SDL_GetNumAudioDevices(rec)
    return devices


def play(file: str, loops: int = 0):

    def _play():
        chunk = mixer.Mix_LoadWAV(file.encode('UTF-8'))
        play_from_chunks(chunk, loops)

    threading.Thread(target=_play).start()


def play_from_chunks(chunk, loops: int = 0):

    def _play():
        mixer.Mix_PlayChannel(-1, chunk, loops)
        assert is_playing()

    threading.Thread(target=_play).start()


def load_sound(source: str):
    return mixer.Mix_LoadWAV(source.encode('UTF-8')).contents


def pause(index: int = -1):
    if mixer.Mix_Playing(index):
        mixer.Mix_Pause(index)
        assert mixer.Mix_Paused(index)


def resume(index: int = -1):
    if mixer.Mix_Paused(index):
        mixer.Mix_Resume(index)
        assert mixer.Mix_Playing(index)


def stop(index: int = -1):
    mixer.Mix_HaltChannel(index)
    assert not mixer.Mix_Playing(index)


def set_volume(volume: int, index: int = -1):
    global current_volume

    mixer.Mix_Volume(index, volume)
    current_volume = volume


def change_output_device(_device: bytes):
    quit_mixer()
    logging.debug(f'Changing output device to {_device}')
    init(_device=_device)


def quit_mixer():
    mixer.Mix_Quit()
    sdl2.SDL_Quit()


def get_errors():
    return mixer.SDL_GetError()


def get_volume():
    return current_volume


def find_audio_device(keyword, recording_device=False):
    all_devices = get_audio_devices(recording_device)

    relevant_devices = []
    for device in all_devices:
        if keyword.lower() in str(device.lower()):
            relevant_devices.append(device)

    if not relevant_devices:
        return None

    if len(relevant_devices) > 1:
        logging.warning(f'Multiple ({len(relevant_devices)}) usable devices detected.')
        return relevant_devices[0]

    return relevant_devices[0]


def get_default_audio_stats():
    char = c_char_p()
    spec = sdl2.SDL_AudioSpec(48000, sdl2.AUDIO_F32, 2, 4096)
    sdl2.SDL_GetDefaultAudioInfo(char, spec, 0)

    return {
        'device': char.value,
        'spec_class': spec
    }


def is_playing():
    return mixer.Mix_Playing(-1)


def is_paused():
    return mixer.Mix_Paused(-1)


init()
