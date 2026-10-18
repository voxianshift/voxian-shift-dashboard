// Shared Tailwind class strings for patterns repeated across the radar pages.
// Keep styling in Tailwind utilities; no custom CSS classes in globals.css.

export const eyebrow =
  "text-[13px] font-medium leading-[1.6] tracking-[1.25px] text-muted-foreground"

export const smallTag =
  "whitespace-nowrap bg-mauve-soft px-1.5 py-[3px] text-[12px] tracking-[0.45px] text-mauve-ink dark:bg-muted dark:text-foreground"

export const fieldHelp = "text-[13px] leading-[1.7] text-muted-foreground"

export const editorialPage = "mx-auto max-w-[1200px] px-10 pb-10 max-[850px]:px-[22px]"

export const statusDot = "inline-block size-[5px] rounded-full bg-sage"

// Wrap of selectable outline buttons; pressed = chosen
export const answerChips =
  "flex flex-wrap gap-2 [&_button]:h-auto [&_button]:min-h-10 [&_button]:justify-start [&_button]:whitespace-normal [&_button]:px-[13px] [&_button]:py-[9px] [&_button]:text-left [&_button]:text-[14px] [&_button]:leading-[1.5] [&_button]:font-normal [&_button[aria-pressed=true]]:border-mauve [&_button[aria-pressed=true]]:bg-mauve-tint dark:[&_button[aria-pressed=true]]:border-white dark:[&_button[aria-pressed=true]]:bg-white/5"

// Segmented control (task mix): container + each button
export const segmentControl = "mt-[9px] flex gap-0.5 bg-muted p-[3px]"
export const segmentButton =
  "h-auto min-h-11 flex-1 rounded-[2px] px-[5px] py-2 text-[13px] font-normal leading-[1.4] whitespace-normal text-muted-foreground aria-pressed:bg-background aria-pressed:text-foreground aria-pressed:shadow-[0_1px_3px_#0000000a]"

// Round icon badge above headings
export const chatEmblem =
  "mb-[22px] inline-grid size-[46px] place-items-center rounded-full border border-[#d4c0ce] text-mauve-deep"

// Bordered text section on editorial pages; styles its h2/p descendants
export const editorialSection =
  "border-t py-[25px] [&_h2]:my-2.5 [&_h2]:text-[18px] [&_h2]:tracking-[-0.5px] [&_p]:text-[16px] [&_p]:leading-[1.9] [&_p]:text-muted-foreground"
