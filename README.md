# Nokia 3310 Snake CAPTCHA

A humorous React web app that uses the classic Nokia 3310 Snake game as a CAPTCHA to prove human status.

## Features

- **Nokia 3310 Authentic UI**: Complete with phone image overlay and retro styling
- **Snake Game CAPTCHA**: Classic snake game with 20-point target to pass
- **Battery Management**: Battery drains during gameplay with recharge mechanics
- **Anti-Bot Measures**: Touch-only controls, no keyboard support
- **Random Distractions**: 10% chance of SMS overlay during gameplay
- **Responsive Design**: Mobile-friendly with proper touch targets
- **Authentic Ringtone**: Plays Nokia ringtone on success

## Game Rules

1. **Objective**: Reach 20 points by eating apples
2. **Controls**: Use on-screen arrow buttons (no keyboard)
3. **Battery**: Starts at 40%, drains over time
4. **Failure**: 3 failed attempts redirects to bot page
5. **Success**: 20 points triggers ringtone and redirects to success page

## Routes

- `/` - Landing page with login button
- `/success` - Success page (only accessible after passing CAPTCHA)
- `/bot` - Bot detection page (only accessible after 3 failures)

## Technical Details

- **Framework**: React + Vite
- **Routing**: React Router DOM
- **Styling**: CSS with Nokia 3310 aesthetic
- **Game Engine**: Canvas-based Snake game
- **Audio**: MP3 ringtone playback
- **Responsive**: Mobile-first design with touch-friendly controls

## Installation

```bash
npm install
npm run dev
```

## Build

```bash
npm run build
```

## Game Mechanics

- Snake auto-moves at fixed intervals
- Direction changes via touch/click on arrow buttons
- Apples spawn randomly on the grid
- Battery drains 1% per second during active gameplay
- Collision detection with self causes game pause
- Edge wrapping for continuous movement

## Anti-Bot Features

- No keyboard event listeners
- Touch/click only input
- Human-like input tolerance with slight randomness
- Double-click spam detection
- Session-based attempt tracking

## Browser Compatibility

- Modern browsers with ES6+ support
- Touch devices for optimal experience
- Audio autoplay may be blocked (user interaction required)

## Credits

- Nokia 3310 phone image
- Nokia Kick Ringtone audio
- Press Start 2P font for authentic retro feel
