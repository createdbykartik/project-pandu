import Link from "next/link";

import { GameCanvas } from "@/components/GameCanvas";

export default function GamePage() {
  return (
    <main className="journey-shell min-h-screen px-4 py-5 sm:px-6 lg:px-8 lg:py-8">
      <div className="mx-auto flex w-full max-w-7xl flex-col gap-6">
        <div className="arcade-panel rounded-[1.8rem] p-3">
          <div className="arcade-inset flex flex-col gap-4 rounded-[1.35rem] px-5 py-5 sm:flex-row sm:items-center sm:justify-between sm:px-6">
            <div className="space-y-2">
              <p className="text-sm font-bold uppercase tracking-[0.22em] text-[#49d6ff]">
                World map live
              </p>
              <h1 className="display-font text-3xl text-[#f7f1cf] sm:text-4xl">
                The Sravya Story
              </h1>
              <p className="max-w-2xl text-sm leading-7 text-[#bed0e7] sm:text-base">
                The story of this little penguin achieving all these milestones and becoming a
                citizen of this country!
              </p>
            </div>
            <div className="flex flex-wrap gap-3">
              <div className="arcade-panel rounded-2xl px-4 py-3 text-sm font-black uppercase tracking-[0.16em] text-[#ffcf52]">
                Arrows / Space
              </div>
              <Link
                href="/"
                className="arcade-button inline-flex min-h-12 items-center justify-center rounded-2xl bg-[#ff8c42] px-5 text-sm font-black uppercase tracking-[0.16em] text-[#071120]"
              >
                Exit To Menu
              </Link>
            </div>
          </div>
        </div>

        <GameCanvas />
      </div>
    </main>
  );
}