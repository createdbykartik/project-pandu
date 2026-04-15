# Journey of Stars

Journey of Stars is a Next.js and Phaser web app that turns a real immigrant journey in Australia into an interactive side-scrolling story game. Each level represents a milestone and ends with an achievement spotlight designed to show a real photo and short story.

## Current Build

- Landing page with the game concept and milestone timeline
- Playable `/game` route with a Phaser-powered side-scrolling prototype
- Keyboard controls for desktop and on-screen controls for mobile
- Milestone content model for 8 life chapters
- Placeholder photo panel for each milestone until final images are provided

## Milestones

1. Arrived in Australia as a student
2. Started as a graduate engineer at Sage Group
3. Graduated from the University of Melbourne
4. Promoted to control systems engineer
5. Bought a house
6. Bought a first car
7. Received Permanent Residency
8. Received Australian Citizenship

## Stack

- Next.js 16 with App Router
- TypeScript
- Tailwind CSS v4
- Phaser 4

## Commands

```bash
npm run dev
npm run build
npm run lint
```

## Notes

- The current build uses illustrated placeholder visuals for the gameplay world.
- Real milestone photos can be wired into the spotlight panel once assets are provided.
- Progress is currently stored locally in the browser.
