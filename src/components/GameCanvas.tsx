"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import type { Game } from "phaser";

import { milestones } from "@/content/milestones";

const STORAGE_KEY = "journey-of-stars-progress";
const COMPLETED_STAGES_STORAGE_KEY = "journey-of-stars-completed-stages";

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

type StageCompleteEventDetail = MilestoneEventDetail;

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
  const [completedStages, setCompletedStages] = useState<number[]>([]);
  const [revealedStage, setRevealedStage] = useState<number | null>(null);

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

    const storedCompletedStages = window.localStorage.getItem(COMPLETED_STAGES_STORAGE_KEY);

    if (storedCompletedStages) {
      try {
        const parsed = JSON.parse(storedCompletedStages) as number[];
        const sanitizedStages = parsed.filter(
          (value) => Number.isInteger(value) && value >= 0 && value < milestones.length,
        );
        setCompletedStages(sanitizedStages);
      } catch {
        window.localStorage.removeItem(COMPLETED_STAGES_STORAGE_KEY);
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

    const onStageComplete = (event: Event) => {
      const detail = (event as CustomEvent<StageCompleteEventDetail>).detail;

      setActiveIndex(detail.index);
      setTotalStars(detail.totalStars);
      setCompletedStages((current) => {
        if (current.includes(detail.index)) {
          return current;
        }

        const nextCompletedStages = [...current, detail.index].sort((left, right) => left - right);
        window.localStorage.setItem(
          COMPLETED_STAGES_STORAGE_KEY,
          JSON.stringify(nextCompletedStages),
        );
        return nextCompletedStages;
      });
      setRevealedStage(detail.index);
    };

    const onReset = () => {
      setActiveIndex(0);
      setProgress(defaultProgress);
      setCompletedStages([]);
      setRevealedStage(null);
      window.localStorage.removeItem(STORAGE_KEY);
      window.localStorage.removeItem(COMPLETED_STAGES_STORAGE_KEY);
    };

    window.addEventListener("journey-milestone", onMilestone as EventListener);
    window.addEventListener("journey-stage-complete", onStageComplete as EventListener);
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
      window.removeEventListener("journey-stage-complete", onStageComplete as EventListener);
      window.removeEventListener("journey-reset", onReset);
      game?.destroy(true);
    };
  }, []);

  useEffect(() => {
    if (revealedStage === null) {
      return;
    }

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setRevealedStage(null);
      }
    };

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [revealedStage]);

  const activeMilestone = milestones[activeIndex] ?? milestones[0];
  const revealedMilestone = revealedStage === null ? null : (milestones[revealedStage] ?? null);
  const activeMilestoneUnlocked = completedStages.includes(activeIndex);
  const completedJourney = completedStages.includes(milestones.length - 1);

  return (
    <>
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
                    <div className="mt-4 overflow-hidden rounded-[1.1rem] border-2 border-[#49d6ff]/40 bg-[#08111f]">
                      <div className="relative aspect-[4/3] w-full">
                        {activeMilestoneUnlocked ? (
                          <Image
                            src={activeMilestone.photoSrc}
                            alt={activeMilestone.photoAlt}
                            fill
                            sizes="(max-width: 1280px) 100vw, 360px"
                            className="object-cover"
                          />
                        ) : (
                          <div className="reward-locked-screen absolute inset-0 flex flex-col items-center justify-center bg-[radial-gradient(circle_at_top,#123868,#08111f_68%)] px-6 text-center">
                            <p className="text-xs font-black uppercase tracking-[0.24em] text-[#49d6ff]">
                              Locked memory
                            </p>
                            <p className="mt-3 text-lg font-black text-[#f7f1cf]">
                              Complete this stage to reveal the photo.
                            </p>
                            <p className="mt-4 max-w-[18rem] text-sm leading-6 text-[#bed0e7]">
                              Reach the banner for this milestone and the memory card will unlock.
                            </p>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                  <p className="mt-4 text-sm leading-6 text-[#bed0e7]">
                    {activeMilestoneUnlocked
                      ? activeMilestone.photoAlt
                      : "The achievement photo appears after the stage is cleared."}
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
                  const completed = completedStages.includes(index);
                  const active = index === activeIndex;

                  return (
                    <div
                      key={milestone.slug}
                      className={`rounded-[1.25rem] border px-4 py-3 transition-colors ${
                        active
                          ? "border-[#071120] bg-[#ffcf52] text-[#071120]"
                          : completed
                            ? "border-[#071120] bg-[#39d98a] text-[#071120]"
                            : "border-[#284b7b] bg-[#112746] text-[#bed0e7]"
                      }`}
                    >
                      <div className="flex items-center justify-between gap-3">
                        <div>
                          <p className="text-xs font-black uppercase tracking-[0.18em] opacity-80">
                            Stage {index + 1}
                          </p>
                          <p className="mt-1 font-black">{milestone.title}</p>
                        </div>
                        <span className="text-[0.65rem] font-black uppercase tracking-[0.18em] opacity-80">
                          {completed ? "Cleared" : active ? "Active" : "Locked"}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </aside>
      </section>

      {revealedMilestone ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#040916]/80 px-4 py-8 backdrop-blur-sm">
          <div className="reveal-modal arcade-panel relative w-full max-w-3xl overflow-hidden rounded-[2rem] p-3">
            <div className="arcade-inset rounded-[1.5rem] p-5 sm:p-6">
              <button
                type="button"
                className="arcade-button absolute right-7 top-7 rounded-xl bg-[#ffcf52] px-3 py-2 text-xs font-black uppercase tracking-[0.14em] text-[#071120]"
                onClick={() => setRevealedStage(null)}
              >
                Close
              </button>

              <p className="text-sm font-black uppercase tracking-[0.24em] text-[#49d6ff]">
                Memory unlocked
              </p>
              <h3 className="mt-3 max-w-[30rem] text-3xl font-black text-[#f7f1cf] sm:text-4xl">
                {revealedMilestone.title}
              </h3>
              <p className="mt-3 text-sm font-black uppercase tracking-[0.16em] text-[#39d98a]">
                {revealedMilestone.dateLabel}
              </p>

              <div className="mt-5 overflow-hidden rounded-[1.5rem] border-4 border-[#071120] bg-[#08111f]">
                <div className="relative aspect-[4/3] w-full sm:aspect-[16/9]">
                  <Image
                    src={revealedMilestone.photoSrc}
                    alt={revealedMilestone.photoAlt}
                    fill
                    priority
                    sizes="(max-width: 768px) 100vw, 720px"
                    className="object-cover"
                  />
                  <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(180deg,rgba(8,17,31,0.02),rgba(8,17,31,0.08)_45%,rgba(8,17,31,0.46))]" />
                </div>
              </div>

              <div className="caption-reveal mt-5 rounded-[1.35rem] border border-[#49d6ff]/30 bg-[#0b1730]/92 px-5 py-4">
                <p className="text-sm font-black uppercase tracking-[0.2em] text-[#ffcf52]">
                  Stage complete
                </p>
                <p className="mt-2 text-lg leading-8 text-[#f7f1cf] sm:text-xl">
                  {revealedMilestone.photoAlt}
                </p>
              </div>
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}