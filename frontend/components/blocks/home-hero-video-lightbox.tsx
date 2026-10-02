"use client";

import { XIcon } from "lucide-react";
import { useEffect, useState, type ReactElement } from "react";
import { getHomeHeroVideoEmbedUrl } from "@/components/blocks/home-hero-video";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

/** The part of the YouTube IFrame Player API this lightbox uses. */
type YouTubePlayer = {
  getPlayerState(): number;
  mute(): void;
  playVideo(): void;
};

type YouTubeApi = {
  Player: new (
    iframe: HTMLIFrameElement,
    options: { events: { onReady: (event: { target: YouTubePlayer }) => void } },
  ) => YouTubePlayer;
};

declare global {
  interface Window {
    YT?: YouTubeApi;
    onYouTubeIframeAPIReady?: () => void;
  }
}

/** -1 unstarted, 5 cued: the film has not begun to play. */
const NOT_STARTED = new Set([-1, 5]);

let youtubeApi: Promise<YouTubeApi> | undefined;

/** Loads YouTube's player API once, the first time a lightbox opens. */
function loadYouTubeApi(): Promise<YouTubeApi> {
  youtubeApi ??= new Promise((resolve) => {
    if (window.YT?.Player) return resolve(window.YT);
    const previous = window.onYouTubeIframeAPIReady;
    window.onYouTubeIframeAPIReady = () => {
      previous?.();
      if (window.YT) resolve(window.YT);
    };
    const script = document.createElement("script");
    script.src = "https://www.youtube.com/iframe_api";
    script.onerror = () => {
      youtubeApi = undefined;
    };
    document.head.append(script);
  });
  return youtubeApi;
}

/**
 * Opens the camp film in a lightbox. The caller supplies the trigger
 * element; the film loads only while the lightbox is open.
 *
 * The visitor already pressed play, so the film starts on its own. Browsers
 * that block autoplay with sound inside the YouTube frame get the film
 * muted instead; YouTube's own control turns the sound on.
 */
export default function HomeHeroVideoLightbox({
  children,
  href,
  label,
}: {
  children: ReactElement;
  href: string;
  label: string;
}) {
  const [open, setOpen] = useState(false);
  const [iframe, setIframe] = useState<HTMLIFrameElement | null>(null);
  const embedUrl = getHomeHeroVideoEmbedUrl(href);

  useEffect(() => {
    if (!iframe) return;
    let cancelled = false;
    let check: number | undefined;

    loadYouTubeApi().then((YT) => {
      if (cancelled) return;
      new YT.Player(iframe, {
        events: {
          onReady: ({ target }) => {
            target.playVideo();
            check = window.setTimeout(() => {
              if (!NOT_STARTED.has(target.getPlayerState())) return;
              target.mute();
              target.playVideo();
            }, 1000);
          },
        },
      });
    });

    return () => {
      cancelled = true;
      window.clearTimeout(check);
    };
  }, [iframe]);

  if (!embedUrl) return null;

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      {/* As wide as the screen allows while the whole 16:9 frame still
          fits the screen's height. */}
      <DialogContent
        className="w-[min(92vw,calc(85svh*16/9))] max-w-none gap-0 border-0 bg-black p-0 shadow-overlay sm:max-w-none"
        showCloseButton={false}
      >
        <DialogTitle className="sr-only">{label}</DialogTitle>
        <DialogClose className="focus-ring absolute -top-12 right-0 flex size-11 items-center justify-center rounded-full text-white/80 transition-colors motion-fast hover:text-white">
          <XIcon aria-hidden="true" className="size-7" />
          <span className="sr-only">Close</span>
        </DialogClose>
        <div className="relative aspect-video w-full overflow-hidden rounded-lg">
          {open ? (
            <iframe
              allow="autoplay; encrypted-media; picture-in-picture"
              allowFullScreen
              className="absolute inset-0 size-full"
              ref={setIframe}
              src={embedUrl}
              title={label}
            />
          ) : null}
        </div>
      </DialogContent>
    </Dialog>
  );
}
