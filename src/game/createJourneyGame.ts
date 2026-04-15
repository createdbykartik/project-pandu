import type { Game, Types } from "phaser";

export async function createJourneyGame(parent: HTMLDivElement): Promise<Game> {
  parent.replaceChildren();

  const [Phaser, { JourneyScene }] = await Promise.all([
    import("phaser"),
    import("@/game/scenes/JourneyScene"),
  ]);

  const config: Types.Core.GameConfig = {
    type: Phaser.AUTO,
    parent,
    backgroundColor: "#173247",
    width: 1280,
    height: 800,
    physics: {
      default: "arcade",
      arcade: {
        gravity: { y: 1280, x: 0 },
        debug: false,
      },
    },
    scale: {
      mode: Phaser.Scale.FIT,
      autoCenter: Phaser.Scale.CENTER_BOTH,
    },
    scene: [JourneyScene],
  };

  return new Phaser.Game(config);
}