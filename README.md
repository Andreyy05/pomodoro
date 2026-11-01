# 🍅 Pomodoro Focus — Lo-Fi & Retro Aesthetic Hub

> A modern, distraction-free Pomodoro productivity web application built with **React 19**, **TypeScript**, and **Vite**. Features procedural ambient sound generators, 12 aesthetic themes, task management, productivity statistics, and a dedicated Zen focus mode.

[![React](https://img.shields.io/badge/React-19.3-61DAFB?style=flat&logo=react&logoColor=black)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-7.0-3178C6?style=flat&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Vite](https://img.shields.io/badge/Vite-8.3-646CFF?style=flat&logo=vite&logoColor=white)](https://vitejs.dev/)
[![Web Audio API](https://img.shields.io/badge/Audio-Web_Audio_API-orange?style=flat)](https://developer.mozilla.org/en-US/docs/Web/API/Web_Audio_API)
[![License: MIT](https://img.shields.io/badge/License-MIT-green.svg)](https://opensource.org/licenses/MIT)

---

## ✨ Features

### ⏱️ Adaptive Pomodoro Timer
- **Three Core Modes**: Focus (25m), Short Break (5m), and Long Break (15m) with customizable durations.
- **Smart Progress Ring**: Visual SVG countdown tracker with dynamic glow matched to active theme.
- **Auto-Cycle Progression**: Configurable auto-start for breaks and focus intervals.
- **Audible Alerts**: Built-in alarms including 8-bit Retro, Lo-Fi Bell, Digital Watch, Fanfare, and Marimba.

### 🎨 12 Curated Visual Themes
Switch ambiance instantly to fit your workflow or mood:
- 📻 **Lo-Fi Chill** (Default mellow purple glow)
- ⛏️ **Minecraft** (Earthy tones inspired by blocky adventures)
- 👾 **80s Retro** (Synthwave neon cyan & magenta)
- 🌸 **Sakura Zen** (Soft cherry blossom pink & warm charcoal)
- 🌅 **Miami Dusk** (Vibrant sunset gradients)
- ☕ **Cozy Coffee** (Warm espresso & caramel vibes)
- 🍵 **Matcha Zen** (Earthy tea greens)
- ❄️ **Nordic Frost** (Clean icy blues)
- 🧛 **Dracula** (High-contrast dark mode)
- 🏙️ **Cyberpunk** (Electric yellow & deep black)
- 🌊 **Ocean Breeze** (Deep maritime cyan & navy)
- 🌇 **Crimson Sunset** (Rich red & amber hues)

### 🎧 Procedural Web Audio Ambient Player
100% synthesized in real time via the **Web Audio API** — no heavy MP3 downloads, operates completely offline:
- **C418 Minecraft Ambiance**: Procedural relaxing melodic synth tones.
- **Lo-Fi Chords**: Warm, slowly morphing electric piano intervals.
- **Rain & Thunder**: Soothing precipitation frequencies.
- **Campfire**: Crackling fire warmth.
- **Vinyl Crackle**: Nostalgic analog record static.
- **Ocean Waves**: Rhythmic tidal noise filters.
- **Night Crickets**: Calming summer evening ambiance.
- **White Noise**: Continuous broadband masking for deep concentration.

### 🧘 Distraction-Free Zen Mode
- Press `F` or click the **Zen** header button to enter a minimal, centered view.
- Strips away extraneous cards, leaving only the timer, pulse ring, and your active task.
- Seamlessly transition back to full dashboard anytime.

### 📝 Focus Task Manager
- Create to-dos with estimated tomato intervals (`🍅 target`).
- Designate the current **Active Task** to display prominently below the timer.
- Confetti celebration upon completing all target pomodoros.
- Quick filter tabs: *All*, *Active*, and *Completed*.

### 📊 Productivity Statistics
- Track completed pomodoro sessions throughout the day.
- **7-Day Visual History Chart** showing daily productivity trends.
- Progress bar toward your daily target pomodoro goal.

### ⌨️ Global Keyboard Shortcuts
| Shortcut | Action |
| :---: | :--- |
| `Space` | Start / Pause timer |
| `F` | Toggle Zen Mode |
| `M` | Mute / Unmute ambient sound |
| `?` | Show Keyboard Shortcuts modal |

### 💾 Local-First & Private
- All tasks, timer settings, stats, and theme preferences persist automatically in browser `localStorage`.
- No account registration or external network calls required.

---

## 🚀 Getting Started

### Prerequisites
- [Node.js](https://nodejs.org/) (version 18 or newer recommended)
- `npm`, `pnpm`, or `yarn`

### Installation

1. **Clone the repository:**
   ```bash
   git clone https://github.com/Andreyy05/pomodoro.git
   cd pomodoro
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Start the local development server:**
   ```bash
   npm run dev
   ```
   Open your browser at `http://localhost:5173/` (or the URL displayed in your terminal).

4. **Build for production:**
   ```bash
   npm run build
   ```
   The compiled, optimized assets will be generated in `dist/`.

---

## 📁 Project Structure

```text
pomodoro/
├── public/                 # Static assets & audio samples
├── src/
│   ├── assets/             # SVGs, icons, and hero graphics
│   ├── components/         # Modular React components
│   │   ├── AmbientPlayer.tsx  # Web Audio ambient player & volume controls
│   │   ├── SettingsModal.tsx  # Durations, sounds, and goal settings
│   │   ├── ShortcutsModal.tsx # Keyboard shortcuts cheat sheet
│   │   ├── StatsModal.tsx     # 7-day productivity history chart
│   │   ├── TaskList.tsx       # Focus task manager with target pomodoros
│   │   ├── ThemeSelector.tsx  # 12 aesthetic theme picker
│   │   └── Timer.tsx          # SVG countdown circle and controls
│   ├── utils/
│   │   └── audio.ts        # Web Audio API synthesizers and sound generators
│   ├── App.tsx             # Root application coordinator & state
│   ├── index.css           # Global CSS variables & theme design tokens
│   ├── main.tsx            # Application entry point
│   └── types.ts            # TypeScript interfaces & type definitions
├── index.html              # HTML template
├── package.json            # Project dependencies & scripts
├── tsconfig.json           # TypeScript configuration
└── vite.config.ts          # Vite bundler configuration
```

---

## 🛠️ Tech Stack

- **Framework**: [React 19](https://react.dev/)
- **Language**: [TypeScript](https://www.typescriptlang.org/)
- **Bundler & Dev Server**: [Vite 8](https://vitejs.dev/)
- **Icons**: [Lucide React](https://lucide.dev/)
- **Audio Engine**: Native Browser [Web Audio API](https://developer.mozilla.org/en-US/docs/Web/API/Web_Audio_API)
- **Effects**: [canvas-confetti](https://www.npmjs.com/package/canvas-confetti)
- **Linter**: [Oxlint](https://oxc.rs/)

---

## 👥 Author & Contributor

- **Andrej Pavliščak** ([@Andreyy05](https://github.com/Andreyy05))

---

## 📄 License

This project is licensed under the MIT License — see the [LICENSE](LICENSE) file for details.
