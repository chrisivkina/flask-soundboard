# Flask Web Soundboard
An HTML / Python Flask sound effect player

---

## Description
This is a simple soundboard application built using Flask and HTML. 
It allows users to play sound effects by clicking on buttons. The intended
use is to have a separate device (like a phone or tablet) to play sound effects on,
but it can also be used on the same device as the server. The soundboard UI is hosted
on a web server, which can be accessed from any device on the same network.

---

## Features

### Soundboard Functionality
- Play sound effects by clicking labeled buttons
- Sound playback controls:
  - Play, pause, stop sound effects
  - Volume slider for sound effects
- Play random sound effect
- Toggle whether to loop a sound effect or not
- Supports multiple types of sound files (WAV, MP3, OGG)
- Functionality to turn off/on concurrent playing of sounds 
  (turning this off means that if a sound is already playing, the 
  player will stop any playing sound before starting a new one)

### High Customizability
- Customizable UI, allowing users to:
  - Sort and organize sound effects by categories
  - Customize category container order and width
  - Change the order of categories
  - Toggle between vertical and horizontal layouts
- Layouts are saved in the browser's local storage, which allows keeping the same 
  configurations even after the server restarts

### High Performance
- Responsive design for mobile and desktop devices
- Server-client communication via socket.io to reduce latency and network load
- Supports multiple devices simultaneously, each able to be customized differently

### Additional Features
- Automatically press a specific push-to-talk button (F20) while a sound is playing (disabled by default)
- Automatically detects and uses a VB-Cable virtual audio device for playback if available, 
  otherwise uses the default audio device

---

## Planned Features
- Installation guide
- Add settings menu (for changing sound device and more)
  - Allow user to set a custom push-to-talk key instead of hard-coded F20 key

(And much more!)

---

## Known Issues
These issues are known and will be addressed in future updates:

- Vertical layout is somewhat broken, but still usable. I'm considering scrapping it
  in favor of a more responsive design that works well on both mobile and desktop devices.
- Changing the width of the category containers does not seem to be working properly on mobile devices.
- Reordering categories seems a bit buggy.
- Unable to reorder the default "Uncategorized" category.

---

## References / Sources
UI Icons: https://fonts.google.com/icons  
PySDL2: https://pypi.org/project/PySDL2/0.9.2/  
Flask-SocketIO: https://flask-socketio.readthedocs.io/en/latest/  
Socket.IO: https://socket.io/docs/v4/
