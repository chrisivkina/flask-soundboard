# Flask Soundboard
An HTML / Python Flask sound effect player

## Description
This is a simple soundboard application built using Flask and HTML. 
It allows users to play sound effects by clicking on buttons. The intended
use is to have a separate device (like a phone or tablet) to play sound effects on,
but it can also be used on the same device as the server. The soundboard UI is hosted
on a web server, which can be accessed from any device on the same network.

## Features
- Play sound effects by clicking labeled buttons
- Sound playback controls:
  - Play, pause, stop sound effects
  - Volume slider for sound effects
- Play random sound effect
- Toggle whether to loop a sound effect or not
- Supports multiple types of sound files (WAV, MP3, OGG)
- Responsive design for mobile and desktop devices
- Customizable UI, allowing users to:
  - Sort and organize sound effects by categories;
  - Customize category container order and width;
  - Change the order of categories;
  - Toggle between vertical and horizontal layouts;
- Server-client communication via socket.io to reduce latency and network load
- Automatically press a specific push-to-talk button (F20) while a sound is playing
- Functionality to turn off/on concurrent playing of sounds (e.g. off means that if a sound is already playing, it will stop before starting a new one)
- Automatically detects and uses a VB-Cable virtual audio device if available, otherwise uses the default audio device

## Planned Features
- Installation guide
- Use Flask-SocketIO instead of HTTP requests
- Add settings menu (for changing sound device and more)
- Allow user to set a custom push-to-talk key instead of hard-coded F20 key

(And much more!)

## References / Sources
UI Icons: https://fonts.google.com/icons  
PySDL2: https://pypi.org/project/PySDL2/0.9.2/
