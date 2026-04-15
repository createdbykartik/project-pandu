"use client";

import { useEffect, useRef, useState } from "react";
import type { Game } from "phaser";

import { milestones } from "@/content/milestones";

const STORAGE_KEY = "journey-of-stars-progress";

type JourneyProgress = {
  highestMilestone: number;
  stars: number;
};

type JourneyControl = "left" | "right" | "jump";

type MilestoneEventDetail = {
  index: number;
  stars: number;
  totalStars: number;
};

const defaultProgress: JourneyProgress = {
  highestMilestone: 0,
  stars: 0,
};

function dispatchControl(control: JourneyControl, active: boolean) {
  window.dispatchEvent(
    new CustomEvent("journey-control", {
      detail: { control, active },
    }),
  );
}

export function GameCanvas() {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [gameReady, setGameReady] = useState(false);
  const [progress, setProgress] = useState<JourneyProgress>(defaultProgress);
  const [activeIndex, setActiveIndex] = useState(0);
  const [totalStars, setTotalStars] = useState(milestones.length);

  useEffect(() => {
    const storedProgress = window.localStorage.getItem(STORAGE_KEY);

    if (storedProgress) {
      try {
        const parsed = JSON.parse(storedProgress) as JourneyProgress;
        setProgress(parsed);
        setActiveIndex(parsed.highestMilestone);
      } catch {
        window.localStorage.removeItem(STORAGE_KEY);
      }
    }

    let mounted = true;
    let game: Game | undefined;

    const onMilestone = (event: Event) => {
      const detail = (event as CustomEvent<MilestoneEventDetail>).detail;

      setActiveIndex(detail.index);
      setTotalStars(detail.totalStars);
      setProgress((current) => {
        const merged = {
          highestMilestone: Math.max(current.highestMilestone, detail.index),
          stars: Math.max(current.stars, detail.stars),
        };

        window.localStorage.setItem(STORAGE_KEY, JSON.stringify(merged));
        return merged;
      });
    };

    const onReset = () => {
      setActiveIndex(0);
      setProgress(defaultProgress);
      window.localStorage.removeItem(STORAGE_KEY);
    };

    window.addEventListener("journey-milestone", onMilestone as EventListener);
    window.addEventListener("journey-reset", onReset);

    void import("@/game/createJourneyGame").then(async ({ createJourneyGame }) => {
      if (!mounted || !containerRef.current) {
        return;
      }

      game = await createJourneyGame(containerRef.current);
      if (mounted) {
        setGameReady(true);
      }
    });

    return () => {
      mounted = false;
      setGameReady(false);
      window.removeEventListener("journey-milestone", onMilestone as EventListener);
      window.removeEventListener("journey-reset", onReset);
      game?.destroy(true);
    };
  }, []);

  const activeMilestone = milestones[activeIndex] ?? milestones[0];
  const completedJourney = progress.highestMilestone >= milestones.length - 1;

  return (
    <section className="grid gap-6 xl:grid-cols-[minmax(0,1.45fr)_360px]">
      <div className="arcade-panel overflow-hidden rounded-[2rem] p-3 sm:p-4">
        <div className="relative overflow-hidden rounded-[1.4rem] border-4 border-[#071120] bg-[#173247] p-2 sm:p-3">
          <div
            ref={containerRef}
            className="aspect-[16/10] min-h-[360px] w-full overflow-hidden rounded-[1rem] bg-[#173247]"
          />

          {!gameReady ? (
            <div className="absolute inset-0 flex items-center justify-center bg-[#173247]/78 text-center text-sm font-semibold uppercase tracking-[0.2em] text-[#fdf7ef]">
              Loading the journey...
            </div>
          ) : null}

          <div className="pointer-events-none absolute inset-x-4 top-4 flex items-center justify-between gap-3 text-xs font-black uppercase tracking-[0.18em] text-[#fdf7ef] sm:text-sm">
            <div className="rounded-xl border-2 border-[#071120] bg-[#0d2340] px-3 py-2">
              Stars {progress.stars}/{totalStars}
            </div>
            <div className="rounded-xl border-2 border-[#071120] bg-[#0d2340] px-3 py-2">
              Stage {activeIndex + 1}/{milestones.length}
            </div>
          </div>
        </div>

        <div className="mt-4 flex flex-wrap gap-3 lg:hidden">
          {([
            ["left", "Left"],
            ["jump", "Jump"],
            ["right", "Right"],
          ] as const).map(([control, label]) => (
            <button
              key={control}
              type="button"
              className="arcade-button flex min-h-14 min-w-[96px] flex-1 items-center justify-center rounded-2xl bg-[#ff8c42] px-5 text-sm font-black uppercase tracking-[0.14em] text-[#071120]"
              onPointerDown={() => dispatchControl(control, true)}
              onPointerUp={() => dispatchControl(control, false)}
              onPointerLeave={() => dispatchControl(control, false)}
              onPointerCancel={() => dispatchControl(control, false)}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      <aside className="flex flex-col gap-4">
        <div className="arcade-panel rounded-[1.8rem] p-3">
          <div className="arcade-inset rounded-[1.35rem] p-5">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-sm font-black uppercase tracking-[0.18em] text-[#49d6ff]">
                  Active milestone
                </p>
                <h2 className="mt-3 text-3xl font-black text-[#f7f1cf]">{activeMilestone.title}</h2>
              </div>
              <span className="rounded-xl bg-[#ffcf52] px-3 py-2 text-xs font-black uppercase tracking-[0.14em] text-[#071120]">
                {activeMilestone.dateLabel}
              </span>
            </div>

            <p className="mt-4 text-sm font-black uppercase tracking-[0.18em] text-[#39d98a]">
              {activeMilestone.levelLabel}
            </p>
            <p className="mt-4 text-base leading-7 text-[#bed0e7]">{activeMilestone.story}</p>

            <div className="mt-5 overflow-hidden rounded-[1.5rem] border-4 border-dashed border-[#49d6ff]/50 bg-[linear-gradient(180deg,#16345d,#0f2037)] p-5">
              <div className="flex min-h-[200px] flex-col justify-between rounded-[1.2rem] bg-[#0b1730] p-5">
                <div>
                  <p className="text-sm font-black uppercase tracking-[0.16em] text-[#ffcf52]">
                    Reward Screen
                  </p>
                  <p className="mt-3 text-lg font-black text-[#f7f1cf]">{activeMilestone.photoPrompt}</p>
                </div>
                <p className="text-sm leading-6 text-[#bed0e7]">
                  Replace this placeholder with the actual milestone photo you provide later.
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="arcade-panel rounded-[1.8rem] p-3">
          <div className="arcade-inset rounded-[1.35rem] p-5">
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="text-sm font-black uppercase tracking-[0.18em] text-[#49d6ff]">
                  Journey progress
                </p>
                <p className="mt-2 text-xl font-black text-[#f7f1cf]">
                  {completedJourney ? "Citizenship reached" : "More milestones ahead"}
                </p>
              </div>
              <button
                type="button"
                className="arcade-button rounded-2xl bg-[#f14d52] px-4 py-2 text-sm font-black uppercase tracking-[0.14em] text-white"
                onClick={() => window.dispatchEvent(new Event("journey-reset"))}
              >
                Reset
              </button>
            </div>

            <div className="mt-5 space-y-3">
              {milestones.map((milestone, index) => {
                const reached = index <= progress.highestMilestone;
                const active = index === activeIndex;

                return (
                  <div
                    key={milestone.slug}
                    className={`rounded-[1.25rem] border px-4 py-3 transition-colors ${
                      active
                        ? "border-[#071120] bg-[#ffcf52] text-[#071120]"
                        : reached
                          ? "border-[#071120] bg-[#39d98a] text-[#071120]"
                          : "border-[#284b7b] bg-[#112746] text-[#bed0e7]"
                    }`}
                  >
                    <p className="text-xs font-black uppercase tracking-[0.18em] opacity-80">Stage {index + 1}</p>
                    <p className="mt-1 font-black">{milestone.title}</p>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </aside>
    </section>
  );
}