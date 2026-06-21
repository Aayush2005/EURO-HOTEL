"use client";

import { useEffect } from "react";
import { sendGAEvent } from "@next/third-parties/google";

// Sends a GA4 `ui_click` event for every button/link clicked anywhere on the
// site, via a single delegated listener on `document`. The event is named
// `ui_click` (not `click`) to avoid colliding with GA4 Enhanced Measurement's
// built-in `click` outbound-link event, whose parameters would otherwise mix
// with ours.
//
// To label an important button or link in GA4, add a data-track attribute:
//   <button data-track="book-now-hero">Book Now</button>
//   <a href="/rooms" data-track="nav-rooms">Rooms</a>
// When data-track is absent, the element's trimmed text content (capped at
// ~50 chars) is used as the label instead.
export default function ClickTracker() {
  useEffect(() => {
    // Skip entirely when GA isn't configured.
    if (!process.env.NEXT_PUBLIC_GA_ID) return;

    const onClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement | null;
      const el = target?.closest("button, a");
      if (!el) return;

      const label =
        el.getAttribute("data-track") || el.textContent?.trim().slice(0, 50) || "";

      const params: Record<string, string> = {
        label,
        element: el.tagName.toLowerCase(),
      };

      if (el.tagName === "A") {
        const href = el.getAttribute("href");
        if (href) params.href = href;
      }

      sendGAEvent("event", "ui_click", params);
    };

    document.addEventListener("click", onClick);
    return () => document.removeEventListener("click", onClick);
  }, []);

  return null;
}
