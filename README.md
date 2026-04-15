# The Sravya Story

The Sravya Story is a browser game about one immigrant journey in Australia, retold as a side-scrolling platform adventure starring a little penguin. Each stage represents a real milestone, from arriving as a student to becoming an Australian citizen.

The project is built as an interactive web app with a playable platformer, milestone progression, a final summit boss fight, and room for real photos and personal story moments at each achievement.

## What It Is

- A story-driven platform game for desktop and mobile web
- A chapter-based journey through 8 real-life milestones
- A modern Next.js shell wrapped around a Phaser gameplay scene
- A playable prototype with collectible stars, jump platforms, milestone flags, penguin characters, and a final summit battle

## Current Features

- Arcade-style landing screen and game UI
- Playable `/game` route with a side-scrolling milestone world
- Cute penguin player character
- Jump steps and platforms across every stage
- Background penguins for environmental life
- Final summit set piece with a guardian boss fight
- Fireworks celebration after defeating the boss
- Local progress tracking in the browser
- Mobile touch controls plus desktop keyboard controls

## Story Chapters

1. Arrived in Australia as a student — 18 Feb 2020
2. Started as a graduate engineer at Sage Group — Dec 2021
3. Graduated from the University of Melbourne — May 2022
4. Promoted to control systems engineer — 2023
5. Bought a house — 15 Dec 2023
6. Bought her first car — 25 Jun 2024
7. Received Permanent Residency — 12 Aug 2024
8. Received Australian Citizenship — 16 Apr 2026

## Controls

- Desktop: arrow keys to move, `Space` to jump
- Mobile: on-screen left, jump, and right buttons

## Stack

- Next.js 16
- TypeScript
- Tailwind CSS v4
- Phaser 4

## Local Development

```bash
npm install
npm run dev
```

Open `http://localhost:3000`.

## Build

```bash
npm run build
```

## Project Direction

This repository is currently focused on gameplay feel and milestone structure first. The next major layer is replacing placeholder reward panels with the real milestone photos and story copy.

Planned polish areas:

- More distinct stage layouts and hazards
- Real milestone photo reveals
- Better boss presentation and transitions
- Sound effects and music
- Ending sequence and citizenship celebration flow

## Notes

- Progress is stored locally for now
- Gameplay art is currently generated and placeholder-based in several places
- Real photos and achievement captions can be integrated into the reward moments later
