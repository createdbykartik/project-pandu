import Link from "next/link";

import { milestones } from "@/content/milestones";

export default function Home() {
  return (
    <main className="journey-shell flex min-h-screen flex-col">
      <section className="mx-auto flex w-full max-w-7xl flex-1 flex-col gap-8 px-4 py-5 sm:px-6 lg:px-8 lg:py-8">
        <div className="arcade-panel rounded-[2rem] p-3 sm:p-4">
          <div className="arcade-inset grid gap-8 rounded-[1.5rem] p-6 lg:grid-cols-[1.08fr_0.92fr] lg:p-8">
            <div className="space-y-6">
              <div className="flex flex-wrap items-center gap-3 text-xs font-bold uppercase tracking-[0.24em] text-[#49d6ff] sm:text-sm">
                <span className="rounded-full bg-[#071120] px-4 py-2">Player One</span>
                <span className="rounded-full bg-[#40210a] px-4 py-2 text-[#ffcf52]">Story Mode</span>
              </div>

              <div className="space-y-4">
                <p className="text-sm font-bold uppercase tracking-[0.26em] text-[#39d98a]">
                  Collect stars. Unlock memories. Finish the journey.
                </p>
                <h1 className="display-font max-w-4xl text-5xl leading-[1.02] text-[#f7f1cf] sm:text-6xl lg:text-7xl">
                  The Sravya Story
                </h1>
                <p className="max-w-3xl text-lg leading-8 text-[#c7d8ef] sm:text-xl">
                  The story of this little penguin achieving all these milestones and becoming a
                  citizen of this country!
                </p>
              </div>

              <div className="flex flex-col gap-4 sm:flex-row">
                <Link
                  href="/game"
                  className="arcade-button inline-flex min-h-14 items-center justify-center rounded-2xl bg-[#ff8c42] px-7 text-base font-black uppercase tracking-[0.16em] text-[#071120]"
                >
                  Press Start
                </Link>
                <a
                  href="#stage-select"
                  className="arcade-button inline-flex min-h-14 items-center justify-center rounded-2xl bg-[#49d6ff] px-7 text-base font-black uppercase tracking-[0.16em] text-[#071120]"
                >
                  Stage Select
                </a>
              </div>

              <div className="grid gap-3 sm:grid-cols-3">
                <div className="arcade-panel rounded-[1.4rem] p-4 text-center">
                  <p className="text-xs font-bold uppercase tracking-[0.2em] text-[#49d6ff]">Lives</p>
                  <p className="mt-2 text-3xl font-black text-[#f7f1cf]">∞</p>
                </div>
                <div className="arcade-panel rounded-[1.4rem] p-4 text-center">
                  <p className="text-xs font-bold uppercase tracking-[0.2em] text-[#39d98a]">Stages</p>
                  <p className="mt-2 text-3xl font-black text-[#f7f1cf]">8</p>
                </div>
                <div className="arcade-panel rounded-[1.4rem] p-4 text-center">
                  <p className="text-xs font-bold uppercase tracking-[0.2em] text-[#ffcf52]">Goal</p>
                  <p className="mt-2 text-3xl font-black text-[#f7f1cf]">Citizen</p>
                </div>
              </div>
            </div>

            <div className="arcade-panel rounded-[1.6rem] p-4">
              <div className="arcade-inset rounded-[1.3rem] p-5">
                <div className="flex items-center justify-between gap-4 border-b-2 border-white/10 pb-4">
                  <div>
                    <p className="text-xs font-bold uppercase tracking-[0.24em] text-[#ffcf52]">
                      Mission Brief
                    </p>
                    <h2 className="display-font mt-2 text-3xl leading-tight text-[#f7f1cf]">
                      Clear every chapter
                    </h2>
                  </div>
                  <span className="rounded-full bg-[#f14d52] px-3 py-2 text-xs font-black uppercase tracking-[0.14em] text-white">
                    1P
                  </span>
                </div>

                <div className="mt-5 space-y-3">
                  {[
                    "Run to each checkpoint flag",
                    "Grab stars above the platforms",
                    "Reveal a real milestone photo at each finish",
                    "Reach citizenship at the final summit",
                  ].map((objective, index) => (
                    <div
                      key={objective}
                      className="flex items-center gap-3 rounded-2xl bg-[#0d1d34] px-4 py-3"
                    >
                      <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#39d98a] text-sm font-black text-[#071120]">
                        {index + 1}
                      </span>
                      <p className="text-sm font-semibold text-[#d9e6f7]">{objective}</p>
                    </div>
                  ))}
                </div>

                <div className="mt-5 grid gap-3 sm:grid-cols-2">
                  {milestones.slice(0, 4).map((milestone, index) => (
                    <div key={milestone.slug} className="rounded-2xl bg-[#132847] px-4 py-4">
                      <p className="text-xs font-bold uppercase tracking-[0.2em] text-[#49d6ff]">
                        World {index + 1}
                      </p>
                      <p className="mt-2 text-lg font-black text-[#f7f1cf]">{milestone.title}</p>
                      <p className="mt-1 text-sm text-[#b6c8e0]">{milestone.dateLabel}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        <section id="stage-select" className="space-y-5">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="text-sm font-bold uppercase tracking-[0.24em] text-[#49d6ff]">
                Stage Select
              </p>
              <h2 className="display-font mt-2 text-4xl text-[#f7f1cf] sm:text-5xl">
                Choose your chapter
              </h2>
            </div>
            <p className="max-w-xl text-base leading-7 text-[#bed0e7]">
              Each stage is a milestone level. Reach the flag to unlock the next memory and swap
              the placeholder with the real photo when you provide it.
            </p>
          </div>

          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            {milestones.map((milestone, index) => (
              <article key={milestone.slug} className="arcade-panel rounded-[1.6rem] p-3">
                <div className="arcade-inset h-full rounded-[1.25rem] p-4">
                  <div className="flex items-center justify-between gap-3">
                    <span className="rounded-xl bg-[#ffcf52] px-3 py-2 text-xs font-black uppercase tracking-[0.16em] text-[#071120]">
                      Stage {index + 1}
                    </span>
                    <span className="text-xs font-bold uppercase tracking-[0.16em] text-[#49d6ff]">
                      {milestone.dateLabel}
                    </span>
                  </div>
                  <h3 className="mt-4 text-2xl font-black text-[#f7f1cf]">{milestone.title}</h3>
                  <p className="mt-3 text-sm font-bold uppercase tracking-[0.16em] text-[#39d98a]">
                    {milestone.levelLabel}
                  </p>
                  <p className="mt-4 text-sm leading-7 text-[#bed0e7]">{milestone.summary}</p>
                </div>
              </article>
            ))}
          </div>
        </section>
      </section>
    </main>
  );
}
