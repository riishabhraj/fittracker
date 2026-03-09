/**
 * Screenshot a DOM element and share it via the Web Share API (mobile)
 * or trigger a download fallback (desktop).
 *
 * Uses dynamic import for html2canvas so it never runs during SSR.
 */
export async function shareWorkoutCard(
  element: HTMLElement,
  filename = "workout.png"
): Promise<void> {
  const html2canvas = (await import("html2canvas")).default

  const canvas = await html2canvas(element, {
    backgroundColor: null,
    scale: 2,         // retina quality
    useCORS: true,
    logging: false,
  })

  const dataUrl = canvas.toDataURL("image/png")
  const blob = await (await fetch(dataUrl)).blob()
  const file = new File([blob], filename, { type: "image/png" })

  // Web Share API (mobile browsers)
  if (navigator.canShare?.({ files: [file] })) {
    try {
      await navigator.share({
        files: [file],
        title: "My Workout",
        text: "Just crushed a workout with FitTracker! 💪",
      })
      return
    } catch {
      // User cancelled or share failed — fall through to download
    }
  }

  // Desktop fallback: download the image
  const link = document.createElement("a")
  link.href = dataUrl
  link.download = filename
  link.click()
}
