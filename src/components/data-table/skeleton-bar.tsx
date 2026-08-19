/** Shimmering placeholder bar used by DataTable's loadingRows skeleton state (desktop + mobile). */
export function SkeletonBar({ widthClass = 'w-3/4' }: { widthClass?: string }) {
  return <div className={`h-3.5 rounded bg-muted animate-pulse ${widthClass}`} />;
}
