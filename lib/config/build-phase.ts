/** True while `next build` is prerendering/collecting page data (no runtime DB). */
export function isNextBuildPhase(): boolean {
  return process.env.NEXT_PHASE === "phase-production-build";
}
