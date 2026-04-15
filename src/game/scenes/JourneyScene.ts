import * as Phaser from "phaser";

import { milestones } from "@/content/milestones";

type ControlState = {
  left: boolean;
  right: boolean;
  jumpQueued: boolean;
};

type JourneyControlEvent = CustomEvent<{
  control: "left" | "right" | "jump";
  active: boolean;
}>;

const SEGMENT_WIDTH = 760;
const JUMP_VELOCITY = -680;
const BOSS_HIT_COUNT = 3;
const PLAYER_ART_HEIGHT = 94;
const PLAYER_BODY_WIDTH = 34;
const PLAYER_BODY_HEIGHT = 42;
const PLAYER_ART_Y_OFFSET = 17;

export class JourneyScene extends Phaser.Scene {
  private player!: Phaser.Physics.Arcade.Sprite;
  private playerArt!: Phaser.GameObjects.Image;
  private playerBody!: Phaser.Physics.Arcade.Body;
  private summitBoss?: Phaser.Physics.Arcade.Sprite;
  private summitBossBody?: Phaser.Physics.Arcade.Body;
  private summitBanner?: Phaser.GameObjects.Text;
  private bossHealthText?: Phaser.GameObjects.Text;
  private cursors!: Phaser.Types.Input.Keyboard.CursorKeys;
  private jumpKey!: Phaser.Input.Keyboard.Key;
  private activeMilestoneIndex = 0;
  private summitBossHits = 0;
  private summitBossDefeated = false;
  private summitBossDirection: 1 | -1 = -1;
  private summitBossInvulnerableUntil = 0;
  private playerDamageCooldownUntil = 0;
  private finalStageStartX = 0;
  private controls: ControlState = {
    left: false,
    right: false,
    jumpQueued: false,
  };
  private reachedMilestones = new Set<number>();
  private starsCollected = 0;

  private handleControl = (event: Event) => {
    const detail = (event as JourneyControlEvent).detail;

    if (detail.control === "jump") {
      this.controls.jumpQueued = detail.active;
      return;
    }

    this.controls[detail.control] = detail.active;
  };

  constructor() {
    super("JourneyScene");
  }

  preload() {
    this.load.image("player-penguin", "/assets/game/penguin-player.png");
  }

  create() {
    const worldWidth = milestones.length * SEGMENT_WIDTH + 720;
    const height = this.scale.height;
    const groundY = height - 78;

    this.summitBoss = undefined;
    this.summitBossBody = undefined;
    this.summitBossHits = 0;
    this.summitBossDefeated = false;
    this.summitBossDirection = -1;
    this.summitBossInvulnerableUntil = 0;
    this.playerDamageCooldownUntil = 0;
    this.finalStageStartX = (milestones.length - 1) * SEGMENT_WIDTH;

    this.physics.world.setBounds(0, 0, worldWidth, height);
    this.cameras.main.setBounds(0, 0, worldWidth, height);
    this.cameras.main.setBackgroundColor("#173247");

    const ground = this.add.rectangle(worldWidth / 2, groundY + 50, worldWidth, 100, 0x183227);
    this.physics.add.existing(ground, true);

    this.createPlayerBodyTexture();
    this.createBossPenguinTexture();
    this.player = this.physics.add.sprite(120, groundY - PLAYER_BODY_HEIGHT / 2, "player-body");
    this.player.setAlpha(0.02);
    this.playerBody = this.player.body as Phaser.Physics.Arcade.Body;
    this.playerBody.setSize(PLAYER_BODY_WIDTH, PLAYER_BODY_HEIGHT);
    this.playerBody.setOffset(0, 0);
    this.playerBody.setCollideWorldBounds(true);
    this.playerBody.setMaxVelocity(360, 960);
    this.playerBody.setDragX(1100);

    this.playerArt = this.add.image(this.player.x, this.playerBody.bottom + PLAYER_ART_Y_OFFSET, "player-penguin");
    this.playerArt
      .setDisplaySize(
        (this.textures.get("player-penguin").getSourceImage() as { width: number; height: number }).width /
          (this.textures.get("player-penguin").getSourceImage() as { width: number; height: number }).height *
          PLAYER_ART_HEIGHT,
        PLAYER_ART_HEIGHT,
      )
      .setDepth(3);

    this.physics.add.collider(this.player, ground);

    this.summitBanner = this.add
      .text(this.scale.width / 2, 24, "", {
        fontFamily: "var(--font-space-grotesk)",
        fontSize: "24px",
        color: "#ffcf52",
        fontStyle: "700",
        stroke: "#071120",
        strokeThickness: 6,
      })
      .setOrigin(0.5, 0)
      .setScrollFactor(0)
      .setDepth(20)
      .setAlpha(0);

    this.bossHealthText = this.add
      .text(this.scale.width / 2, 62, "", {
        fontFamily: "var(--font-space-grotesk)",
        fontSize: "18px",
        color: "#f7f1cf",
        fontStyle: "700",
        stroke: "#071120",
        strokeThickness: 5,
      })
      .setOrigin(0.5, 0)
      .setScrollFactor(0)
      .setDepth(20)
      .setVisible(false);

    milestones.forEach((milestone, index) => {
      const sectionX = index * SEGMENT_WIDTH;
      const sectionMid = sectionX + SEGMENT_WIDTH / 2;
      const isFinalStage = index === milestones.length - 1;

      this.add
        .rectangle(sectionMid, height / 2, SEGMENT_WIDTH, height, milestone.colors.sky)
        .setDepth(-6);
      this.add
        .ellipse(sectionMid - 120, groundY - 20, 360, 180, milestone.colors.hill)
        .setDepth(-5)
        .setAlpha(0.92);
      this.add
        .ellipse(sectionMid + 165, groundY - 35, 280, 145, milestone.colors.hill)
        .setDepth(-5)
        .setAlpha(0.8);
      this.add
        .rectangle(sectionX + SEGMENT_WIDTH / 2, groundY + 54, SEGMENT_WIDTH, 110, 0x21352c)
        .setDepth(-4);

      this.createBackgroundPenguins(sectionX, groundY, index);
      this.createStageBackdrop(sectionX, groundY, index, milestone.colors.accent);

      if (isFinalStage) {
        this.createFinalSummit(sectionX, groundY, milestone.colors.accent);
      }

      const label = this.add
        .text(sectionX + 66, 40, milestone.levelLabel.toUpperCase(), {
          fontFamily: "var(--font-space-grotesk)",
          fontSize: "18px",
          color: "#fffaf2",
          fontStyle: "700",
        })
        .setDepth(-3)
        .setAlpha(0.86);
      label.setShadow(0, 2, "rgba(0,0,0,0.24)", 6, false, true);

      const pedestalY = isFinalStage ? groundY - 210 : index % 2 === 0 ? groundY - 148 : groundY - 220;

      this.createJumpStep(
        sectionX + 250,
        groundY - (isFinalStage ? 68 : index % 2 === 0 ? 38 : 52),
        94,
        milestone.colors.accent,
      );

      const pedestal = this.add.rectangle(
        sectionX + 420,
        pedestalY,
        isFinalStage ? 310 : 240,
        18,
        milestone.colors.accent,
      );
      this.physics.add.existing(pedestal, true);
      this.physics.add.collider(this.player, pedestal);

      if (isFinalStage) {
        this.spawnSummitBoss(sectionX + 480, pedestalY - 54, pedestal);
      }

      const star = this.add.star(sectionX + 420, pedestalY - 50, 5, 11, 22, 0xf7c45c);
      this.physics.add.existing(star, true);
      this.physics.add.overlap(this.player, star, () => {
        if (!star.active) {
          return;
        }

        star.destroy();
        this.starsCollected += 1;
        this.emitMilestone(this.activeMilestoneIndex);
      });

      const markerX = sectionX + SEGMENT_WIDTH - 150;
      const markerPole = this.add.rectangle(markerX, groundY - 96, 10, 150, 0xfdf7ef);
      const markerFlag = this.add.rectangle(
        markerX + 52,
        groundY - 138,
        108,
        52,
        milestone.colors.accent,
      );
      markerFlag.setOrigin(0.5, 0.5);

      const zone = this.add.zone(markerX + 32, groundY - 90, 90, 180);
      this.physics.add.existing(zone, true);
      this.physics.add.overlap(this.player, zone, () => this.reachMilestone(index));

      this.add
        .text(markerX - 38, groundY - 174, `${index + 1}`, {
          fontFamily: "var(--font-space-grotesk)",
          fontSize: "18px",
          color: "#173247",
          fontStyle: "700",
        })
        .setDepth(1);

      markerPole.setDepth(-1);
      markerFlag.setDepth(-1);
    });

    this.cameras.main.startFollow(this.player, true, 0.08, 0.08);
    this.cameras.main.setDeadzone(160, 120);

    this.cursors = this.input.keyboard?.createCursorKeys() as Phaser.Types.Input.Keyboard.CursorKeys;
    this.jumpKey = this.input.keyboard?.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE) as Phaser.Input.Keyboard.Key;

    window.addEventListener("journey-control", this.handleControl as EventListener);
    window.addEventListener("journey-reset", this.handleReset);

    this.events.once(Phaser.Scenes.Events.SHUTDOWN, () => {
      window.removeEventListener("journey-control", this.handleControl as EventListener);
      window.removeEventListener("journey-reset", this.handleReset);
    });

    this.emitMilestone(0);
  }

  update() {
    const movingLeft = this.cursors.left.isDown || this.controls.left;
    const movingRight = this.cursors.right.isDown || this.controls.right;
    const velocityX = movingLeft === movingRight ? 0 : movingLeft ? -285 : 285;

    this.playerBody.setVelocityX(velocityX);

    const wantsToJump =
      Phaser.Input.Keyboard.JustDown(this.cursors.up) ||
      Phaser.Input.Keyboard.JustDown(this.jumpKey) ||
      this.controls.jumpQueued;

    if (wantsToJump && this.playerBody.blocked.down) {
      this.playerBody.setVelocityY(JUMP_VELOCITY);
    }

    this.controls.jumpQueued = false;

    this.updateSummitBoss();

    const tilt = Phaser.Math.Clamp(this.playerBody.velocity.x / 26, -9, 9);
    this.playerArt.setPosition(this.player.x, this.playerBody.bottom + PLAYER_ART_Y_OFFSET);
    this.playerArt.setAngle(tilt);
    this.playerArt.setFlipX(velocityX < 0);

    if (this.bossHealthText) {
      const nearFinalStage = this.player.x >= this.finalStageStartX - 120;
      this.bossHealthText.setVisible(nearFinalStage);

      if (!nearFinalStage) {
        this.bossHealthText.setText("");
      } else if (this.summitBossDefeated) {
        this.bossHealthText.setText("Summit clear. Claim citizenship.");
      } else {
        this.bossHealthText.setText(
          `Summit Guardian ${BOSS_HIT_COUNT - this.summitBossHits}/${BOSS_HIT_COUNT}`,
        );
      }
    }
  }

  private handleReset = () => {
    this.reachedMilestones.clear();
    this.starsCollected = 0;
    this.activeMilestoneIndex = 0;
    this.scene.restart();
  };

  private reachMilestone(index: number) {
    if (index === milestones.length - 1 && !this.summitBossDefeated) {
      this.showSummitBanner("Defeat the Summit Guardian first.", "#ff8c42");
      this.cameras.main.shake(130, 0.003);
      return;
    }

    if (this.reachedMilestones.has(index)) {
      return;
    }

    this.reachedMilestones.add(index);
    this.activeMilestoneIndex = index;
    this.emitMilestone(index);
    this.emitStageComplete(index);

    if (index === milestones.length - 1) {
      this.cameras.main.flash(400, 247, 196, 92, true);
    }
  }

  private emitMilestone(index: number) {
    window.dispatchEvent(
      new CustomEvent("journey-milestone", {
        detail: {
          index,
          stars: this.starsCollected,
          totalStars: milestones.length,
        },
      }),
    );
  }

  private emitStageComplete(index: number) {
    window.dispatchEvent(
      new CustomEvent("journey-stage-complete", {
        detail: {
          index,
          stars: this.starsCollected,
          totalStars: milestones.length,
        },
      }),
    );
  }

  private updateSummitBoss() {
    if (!this.summitBoss || !this.summitBossBody || this.summitBossDefeated) {
      return;
    }

    const minX = this.finalStageStartX + 360;
    const maxX = this.finalStageStartX + 600;

    if (this.summitBoss.x <= minX) {
      this.summitBossDirection = 1;
    } else if (this.summitBoss.x >= maxX) {
      this.summitBossDirection = -1;
    }

    this.summitBossBody.setVelocityX(90 * this.summitBossDirection);
    this.summitBoss.setFlipX(this.summitBossDirection > 0);
  }

  private spawnSummitBoss(
    x: number,
    y: number,
    platform: Phaser.GameObjects.Rectangle,
  ) {
    this.summitBoss = this.physics.add.sprite(x, y, "boss-penguin");
    this.summitBoss.setDepth(2);
    this.summitBossBody = this.summitBoss.body as Phaser.Physics.Arcade.Body;
    this.summitBossBody.setSize(70, 84);
    this.summitBossBody.setOffset(13, 12);
    this.summitBossBody.setCollideWorldBounds(true);
    this.summitBossBody.setMaxVelocity(180, 960);

    this.physics.add.collider(this.summitBoss, platform);
    this.physics.add.overlap(this.player, this.summitBoss, () => this.handleBossCollision());
  }

  private handleBossCollision() {
    if (!this.summitBoss || !this.summitBossBody || this.summitBossDefeated) {
      return;
    }

    if (this.time.now < this.summitBossInvulnerableUntil) {
      return;
    }

    const playerBounds = this.playerBody;
    const bossBounds = this.summitBossBody;
    const stompedBoss =
      playerBounds.velocity.y > 100 && playerBounds.bottom <= bossBounds.top + 24;

    if (stompedBoss) {
      this.summitBossHits += 1;
      this.summitBossInvulnerableUntil = this.time.now + 350;
      this.playerBody.setVelocityY(-520);
      this.summitBoss.setTint(0xffcf52);
      this.time.delayedCall(140, () => this.summitBoss?.clearTint());

      if (this.summitBossHits >= BOSS_HIT_COUNT) {
        this.defeatSummitBoss();
      } else {
        this.showSummitBanner(
          `Guardian hit ${this.summitBossHits}/${BOSS_HIT_COUNT}`,
          "#ffcf52",
        );
      }

      return;
    }

    if (this.time.now < this.playerDamageCooldownUntil) {
      return;
    }

    this.playerDamageCooldownUntil = this.time.now + 700;
    this.playerBody.setVelocityX(this.player.x < this.summitBoss.x ? -260 : 260);
    this.playerBody.setVelocityY(-260);
    this.playerArt.setTint(0xf14d52);
    this.time.delayedCall(180, () => this.playerArt.clearTint());
    this.showSummitBanner("Ouch. Jump on the guardian.", "#f14d52");
  }

  private defeatSummitBoss() {
    this.summitBossDefeated = true;
    this.summitBossBody?.setVelocity(0, 0);
    this.summitBossBody?.setEnable(false);
    this.summitBoss?.setTint(0xffcf52);
    this.summitBoss?.setAngle(18);

    this.tweens.add({
      targets: this.summitBoss,
      y: (this.summitBoss?.y ?? 0) - 34,
      alpha: 0.2,
      duration: 520,
      ease: "Quad.easeOut",
    });

    this.cameras.main.flash(500, 255, 207, 82, true);
    this.cameras.main.shake(200, 0.004);
    this.launchSummitFireworks();
    this.showSummitBanner("Summit Guardian defeated. Claim the summit.", "#39d98a");
  }

  private showSummitBanner(message: string, color: string) {
    if (!this.summitBanner) {
      return;
    }

    this.summitBanner.setText(message);
    this.summitBanner.setColor(color);
    this.summitBanner.setAlpha(1);

    this.tweens.killTweensOf(this.summitBanner);
    this.tweens.add({
      targets: this.summitBanner,
      alpha: 0,
      delay: 900,
      duration: 450,
      ease: "Quad.easeOut",
    });
  }

  private launchSummitFireworks() {
    const launchPoints = [
      { x: this.finalStageStartX + 470, y: 170, delay: 0, tint: 0xffcf52 },
      { x: this.finalStageStartX + 610, y: 130, delay: 180, tint: 0x49d6ff },
      { x: this.finalStageStartX + 540, y: 95, delay: 360, tint: 0xf14d52 },
      { x: this.finalStageStartX + 690, y: 155, delay: 540, tint: 0x39d98a },
      { x: this.finalStageStartX + 580, y: 115, delay: 720, tint: 0xffcf52 },
    ];

    launchPoints.forEach((launchPoint) => {
      this.time.delayedCall(launchPoint.delay, () => {
        this.createFireworkBurst(launchPoint.x, launchPoint.y, launchPoint.tint);
      });
    });
  }

  private createFireworkBurst(x: number, y: number, tint: number) {
    for (let index = 0; index < 18; index += 1) {
      const spark = this.add.circle(x, y, Phaser.Math.Between(3, 5), tint).setDepth(12);
      const angle = Phaser.Math.FloatBetween(0, Math.PI * 2);
      const distance = Phaser.Math.Between(70, 135);
      const destinationX = x + Math.cos(angle) * distance;
      const destinationY = y + Math.sin(angle) * distance;

      this.tweens.add({
        targets: spark,
        x: destinationX,
        y: destinationY,
        alpha: 0,
        scale: 0.3,
        duration: Phaser.Math.Between(550, 820),
        ease: "Cubic.easeOut",
        onComplete: () => spark.destroy(),
      });
    }
  }

  private createPlayerBodyTexture() {
    if (this.textures.exists("player-body")) {
      return;
    }

    const graphics = this.make.graphics({ x: 0, y: 0 }, false);
    graphics.fillStyle(0xffffff, 1);
    graphics.fillRect(0, 0, PLAYER_BODY_WIDTH, PLAYER_BODY_HEIGHT);
    graphics.generateTexture("player-body", PLAYER_BODY_WIDTH, PLAYER_BODY_HEIGHT);
    graphics.destroy();
  }

  private createBackgroundPenguins(sectionX: number, groundY: number, milestoneIndex: number) {
    const penguinPositions = [
      { x: sectionX + 140, y: groundY - 72, scale: 0.5, alpha: 0.34 },
      { x: sectionX + 260, y: groundY - 98, scale: 0.38, alpha: 0.28 },
      { x: sectionX + 590, y: groundY - 80, scale: 0.46, alpha: 0.3 },
    ];

    penguinPositions.forEach((penguin, index) => {
      const sprite = this.add.image(
        penguin.x,
        penguin.y - ((milestoneIndex + index) % 2) * 10,
        "player-penguin",
      );

      sprite
        .setDisplaySize(64 * penguin.scale, 72 * penguin.scale)
        .setAlpha(penguin.alpha)
        .setDepth(-4)
        .setTint(index % 2 === 0 ? 0xd8ecff : 0xf7f1cf);

      if ((milestoneIndex + index) % 3 === 0) {
        sprite.setFlipX(true);
      }
    });
  }

  private createStageBackdrop(
    sectionX: number,
    groundY: number,
    milestoneIndex: number,
    accent: number,
  ) {
    switch (milestoneIndex) {
      case 0:
        this.createKangarooBackdrop(sectionX + 590, groundY - 112, accent);
        break;
      case 1:
        this.createMetroTrainBackdrop(sectionX + 160, groundY - 132, 0xb8d7e8);
        break;
      case 2:
        this.createGraduationPenguinBackdrop(sectionX + 585, groundY - 102);
        break;
      case 3:
        this.createMetroTrainBackdrop(sectionX + 540, groundY - 126, 0x9ac7de);
        break;
      case 4:
        this.createHouseBackdrop(sectionX + 585, groundY - 134);
        break;
      case 5:
        this.createCarBackdrop(sectionX + 585, groundY - 92);
        break;
      case 6:
        this.createPermanentStampBackdrop(sectionX + 580, groundY - 140);
        break;
      case 7:
        this.createAustralianFlagBackdrop(sectionX + 145, groundY - 178);
        break;
      default:
        break;
    }
  }

  private createKangarooBackdrop(x: number, y: number, accent: number) {
    const tint = Phaser.Display.Color.IntegerToColor(accent).lighten(20).color;
    this.add.ellipse(x, y, 86, 44, tint, 0.82).setDepth(-3);
    this.add.ellipse(x + 34, y - 26, 36, 26, tint, 0.82).setDepth(-3);
    this.add.triangle(x + 46, y - 42, 0, 18, 10, 0, 20, 18, tint, 0.82).setDepth(-3);
    this.add.triangle(x + 58, y - 40, 0, 18, 10, 0, 20, 18, tint, 0.82).setDepth(-3);
    this.add.rectangle(x - 26, y + 26, 6, 30, tint, 0.82).setDepth(-3).setAngle(10);
    this.add.rectangle(x - 4, y + 28, 6, 32, tint, 0.82).setDepth(-3).setAngle(-8);
    this.add.rectangle(x + 68, y - 4, 70, 8, tint, 0.82).setDepth(-3).setAngle(-32);
  }

  private createMetroTrainBackdrop(x: number, y: number, bodyColor: number) {
    this.add.rectangle(x, y, 172, 54, bodyColor, 0.85).setDepth(-3);
    this.add.rectangle(x, y - 18, 128, 12, 0xeaf6ff, 0.92).setDepth(-2);
    [-48, -16, 16, 48].forEach((offset) => {
      this.add.rectangle(x + offset, y - 2, 22, 18, 0x274666, 0.92).setDepth(-2);
    });
    this.add.rectangle(x - 64, y + 4, 16, 28, 0x274666, 0.92).setDepth(-2);
    this.add.circle(x - 52, y + 29, 10, 0x102443).setDepth(-2);
    this.add.circle(x + 52, y + 29, 10, 0x102443).setDepth(-2);
  }

  private createGraduationPenguinBackdrop(x: number, y: number) {
    this.add
      .image(x, y, "player-penguin")
      .setDisplaySize(78, 88)
      .setAlpha(0.9)
      .setDepth(-2);
    this.add.rectangle(x, y - 44, 44, 8, 0x101820, 0.96).setDepth(-1).setAngle(-10);
    this.add.rectangle(x + 11, y - 34, 10, 10, 0x101820, 0.96).setDepth(-1).setAngle(-10);
    this.add.line(x + 16, y - 38, 0, 0, 0, 22, 0xffcf52, 0.95).setDepth(-1);
    this.add.circle(x + 16, y - 14, 3, 0xffcf52).setDepth(-1);
  }

  private createHouseBackdrop(x: number, y: number) {
    this.add.rectangle(x, y, 120, 82, 0xf3d9b1, 0.92).setDepth(-3);
    this.add.triangle(x, y - 44, 0, 36, 60, -18, 120, 36, 0xb95f3b, 0.95).setDepth(-2);
    this.add.rectangle(x - 22, y + 2, 24, 24, 0xbfe5ff, 0.94).setDepth(-2);
    this.add.rectangle(x + 22, y + 2, 24, 24, 0xbfe5ff, 0.94).setDepth(-2);
    this.add.rectangle(x, y + 22, 24, 38, 0x805336, 0.96).setDepth(-2);
  }

  private createCarBackdrop(x: number, y: number) {
    this.add.rectangle(x, y, 112, 26, 0x2d78d6, 0.94).setDepth(-3);
    this.add.rectangle(x - 10, y - 18, 54, 22, 0x2d78d6, 0.94).setDepth(-3);
    this.add.rectangle(x - 18, y - 18, 18, 16, 0xbde8ff, 0.94).setDepth(-2);
    this.add.rectangle(x + 10, y - 18, 22, 16, 0xbde8ff, 0.94).setDepth(-2);
    this.add.circle(x - 30, y + 16, 12, 0x102443).setDepth(-2);
    this.add.circle(x + 34, y + 16, 12, 0x102443).setDepth(-2);
    this.add.circle(x - 30, y + 16, 5, 0xdce5f4).setDepth(-1);
    this.add.circle(x + 34, y + 16, 5, 0xdce5f4).setDepth(-1);
  }

  private createPermanentStampBackdrop(x: number, y: number) {
    this.add.rectangle(x, y, 146, 84, 0xf8e6b8, 0.9).setDepth(-3).setAngle(-12);
    this.add.rectangle(x, y, 120, 58, 0xd94d52, 0.18).setDepth(-2).setAngle(-12);
    this.add.text(x, y - 2, "PR", {
      fontFamily: "var(--font-space-grotesk)",
      fontSize: "34px",
      color: "#d94d52",
      fontStyle: "700",
    }).setOrigin(0.5).setDepth(-1).setAngle(-12);
  }

  private createAustralianFlagBackdrop(x: number, y: number) {
    this.add.rectangle(x - 34, y + 48, 6, 126, 0xe9f2ff, 0.95).setDepth(-3);
    this.add.rectangle(x + 18, y, 104, 62, 0x2248a5, 0.94).setDepth(-3);
    this.add.rectangle(x - 8, y - 15, 40, 30, 0x17347d, 0.98).setDepth(-2);
    this.add.line(x - 8, y - 15, -20, -15, 20, 15, 0xffffff, 0.95).setDepth(-1);
    this.add.line(x - 8, y - 15, -20, 15, 20, -15, 0xffffff, 0.95).setDepth(-1);
    this.add.line(x - 8, y - 15, 0, -15, 0, 15, 0xf14d52, 0.95).setDepth(-1);
    this.add.line(x - 8, y - 15, -20, 0, 20, 0, 0xf14d52, 0.95).setDepth(-1);
    this.add.star(x + 30, y - 10, 5, 5, 11, 0xffffff).setDepth(-1);
    this.add.star(x + 48, y + 14, 5, 4, 9, 0xffffff).setDepth(-1);
  }

  private createFinalSummit(sectionX: number, groundY: number, color: number) {
    this.add.circle(sectionX + 560, groundY - 260, 120, 0xffcf52, 0.18).setDepth(-6);
    this.add.circle(sectionX + 560, groundY - 260, 72, 0xffcf52, 0.22).setDepth(-6);

    this.add.triangle(
      sectionX + 560,
      groundY - 78,
      0,
      140,
      110,
      -120,
      220,
      140,
      0x6f4a2b,
    ).setDepth(-4);

    this.add.triangle(
      sectionX + 560,
      groundY - 120,
      0,
      110,
      80,
      -90,
      160,
      110,
      color,
    ).setDepth(-3);

    const crown = this.add.star(sectionX + 650, groundY - 290, 5, 16, 34, 0xffcf52).setDepth(-2);
    this.tweens.add({
      targets: crown,
      angle: 360,
      duration: 6000,
      repeat: -1,
    });

    this.add.rectangle(sectionX + 650, groundY - 240, 4, 120, 0xfff7d6, 0.9).setDepth(-3);
  }

  private createJumpStep(x: number, y: number, width: number, color: number) {
    const step = this.add.rectangle(x, y, width, 18, color).setDepth(-1);
    this.physics.add.existing(step, true);
    this.physics.add.collider(this.player, step);

    this.add
      .rectangle(x, y + 18, width - 12, 28, Phaser.Display.Color.IntegerToColor(color).darken(28).color)
      .setDepth(-2)
      .setAlpha(0.94);
  }

  private createBossPenguinTexture() {
    if (this.textures.exists("boss-penguin")) {
      return;
    }

    const graphics = this.make.graphics({ x: 0, y: 0 }, false);

    graphics.fillStyle(0x24142f, 1);
    graphics.fillEllipse(48, 60, 60, 78);

    graphics.fillStyle(0xf5efe7, 1);
    graphics.fillEllipse(48, 66, 36, 42);

    graphics.fillStyle(0x24142f, 1);
    graphics.fillCircle(36, 28, 14);
    graphics.fillCircle(60, 28, 14);
    graphics.fillEllipse(48, 35, 46, 40);

    graphics.fillStyle(0xf5efe7, 1);
    graphics.fillEllipse(48, 38, 24, 18);

    graphics.fillStyle(0xffb347, 1);
    graphics.fillTriangle(48, 42, 38, 50, 58, 50);

    graphics.fillStyle(0xf14d52, 1);
    graphics.fillRect(20, 6, 56, 12);
    graphics.fillTriangle(28, 6, 36, -10, 44, 6);
    graphics.fillTriangle(48, 6, 56, -10, 64, 6);
    graphics.fillTriangle(68, 6, 76, -10, 84, 6);

    graphics.fillStyle(0xffcf52, 1);
    graphics.fillCircle(36, 5, 4);
    graphics.fillCircle(56, 5, 4);
    graphics.fillCircle(76, 5, 4);

    graphics.fillStyle(0x8d9bb2, 1);
    graphics.fillEllipse(18, 58, 14, 28);
    graphics.fillEllipse(78, 58, 14, 28);

    graphics.fillStyle(0x101820, 1);
    graphics.fillCircle(42, 34, 3);
    graphics.fillCircle(54, 34, 3);

    graphics.generateTexture("boss-penguin", 96, 108);
    graphics.destroy();
  }
}