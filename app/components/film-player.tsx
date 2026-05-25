"use client";

import Hls, { type Level } from "hls.js";
import { ChevronsLeft, ChevronsRight, Expand, Gauge, Pause, PictureInPicture2, Play, Settings2, SkipBack, SkipForward, Volume2, VolumeX, X } from "lucide-react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { Episode } from "../lib/types/film";

type PlayerMode = "hls" | "embed";

type SeekIndicator = {
  id: number;
  direction: "backward" | "forward";
  seconds: number;
};

type QualityLevel = {
  index: number;
  height: number;
  bitrate: number;
  label: string;
};

const DOUBLE_TAP_DELAY = 280;
const SEEK_STEP = 10;
const AUTO_NEXT_SECONDS = 10;
const PLAYBACK_RATES = [0.5, 0.75, 1, 1.25, 1.5, 2];

function buildQualityLevels(levels: Level[]): QualityLevel[] {
  return levels
    .map((level, index) => {
      const height = level.height || 0;
      const bitrate = level.bitrate || 0;
      const label = height
        ? `${height}p`
        : bitrate
          ? `${Math.round(bitrate / 1000)}kbps`
          : `Mức ${index + 1}`;
      return { index, height, bitrate, label };
    })
    .sort((a, b) => b.height - a.height || b.bitrate - a.bitrate);
}

function formatTime(seconds: number) {
  if (!Number.isFinite(seconds) || seconds < 0) return "0:00";
  const total = Math.floor(seconds);
  const hours = Math.floor(total / 3600);
  const minutes = Math.floor((total % 3600) / 60);
  const remaining = total % 60;

  if (hours > 0) {
    return `${hours}:${String(minutes).padStart(2, "0")}:${String(remaining).padStart(2, "0")}`;
  }

  return `${minutes}:${String(remaining).padStart(2, "0")}`;
}

export function FilmPlayer({
  title,
  episode,
  previousEpisode,
  previousEpisodeHref,
  nextEpisode,
  nextEpisodeHref,
  posterUrl,
}: {
  title: string;
  episode?: Episode;
  previousEpisode?: Episode;
  previousEpisodeHref?: string;
  nextEpisode?: Episode;
  nextEpisodeHref?: string;
  posterUrl?: string;
}) {
  const router = useRouter();
  const videoRef = useRef<HTMLVideoElement>(null);
  const hlsRef = useRef<Hls | null>(null);
  const [isPlayerReady, setIsPlayerReady] = useState(false);
  const [modeOverride, setModeOverride] = useState<{
    slug: string;
    mode: PlayerMode;
  } | null>(null);
  const [hlsAttempt, setHlsAttempt] = useState<"proxy" | "direct">("proxy");
  const [isSourceMenuOpen, setIsSourceMenuOpen] = useState(false);
  const [isQualityMenuOpen, setIsQualityMenuOpen] = useState(false);
  const [isSettingsMenuOpen, setIsSettingsMenuOpen] = useState(false);
  const [qualityLevels, setQualityLevels] = useState<QualityLevel[]>([]);
  const [currentLevelIndex, setCurrentLevelIndex] = useState<number>(-1);
  const [isAutoQuality, setIsAutoQuality] = useState(true);
  const [fatalErrorSlug, setFatalErrorSlug] = useState("");
  const [isAutoNextVisible, setIsAutoNextVisible] = useState(false);
  const [isAutoNextCancelled, setIsAutoNextCancelled] = useState(false);
  const [autoNextCountdown, setAutoNextCountdown] = useState(AUTO_NEXT_SECONDS);
  const [isVideoPaused, setIsVideoPaused] = useState(true);
  const [isMuted, setIsMuted] = useState(false);
  const [volume, setVolume] = useState(1);
  const [playbackRate, setPlaybackRate] = useState(1);
  const [playbackTime, setPlaybackTime] = useState({ current: 0, duration: 0 });
  const [seekIndicator, setSeekIndicator] = useState<SeekIndicator | null>(null);
  const tapTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const lastTapRef = useRef<{ time: number; side: "left" | "right" } | null>(null);
  const seekIndicatorTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const seekIndicatorIdRef = useRef(0);
  const hasHls = Boolean(episode?.m3u8);
  const hasEmbed = Boolean(episode?.embed);
  const canSwitchSource = hasHls && hasEmbed;
  const preferredMode = useMemo<PlayerMode>(() => {
    if (hasHls) return "hls";
    return hasEmbed ? "embed" : "hls";
  }, [hasEmbed, hasHls]);
  const mode =
    modeOverride && modeOverride.slug === episode?.slug
      ? modeOverride.mode
      : preferredMode;
  const hasFatalError = fatalErrorSlug === episode?.slug;
  const activeHlsSource = hlsAttempt === "proxy" ? episode?.m3u8 : episode?.rawM3u8;
  const canSeek = isPlayerReady && mode === "hls" && !hasFatalError;
  const fallbackToEmbed = () => {
    if (!episode?.slug) {
      return;
    }

    setFatalErrorSlug(episode.slug);

    if (episode.embed) {
      setModeOverride({ slug: episode.slug, mode: "embed" });
    }
  };
  const seekBy = useCallback((seconds: number) => {
    const video = videoRef.current;

    if (!video) {
      return 0;
    }

    const duration = Number.isFinite(video.duration) ? video.duration : null;
    const target = Math.max(0, video.currentTime + seconds);
    const nextTime = duration == null ? target : Math.min(target, duration);
    const applied = nextTime - video.currentTime;
    video.currentTime = nextTime;
    return applied;
  }, []);

  const showSeekIndicator = useCallback(
    (direction: "backward" | "forward", seconds: number) => {
      seekIndicatorIdRef.current += 1;
      const id = seekIndicatorIdRef.current;
      setSeekIndicator({ id, direction, seconds: Math.abs(Math.round(seconds)) || SEEK_STEP });

      if (seekIndicatorTimerRef.current) {
        clearTimeout(seekIndicatorTimerRef.current);
      }
      seekIndicatorTimerRef.current = setTimeout(() => {
        setSeekIndicator((current) => (current && current.id === id ? null : current));
      }, 650);
    },
    [],
  );

  const togglePlayback = useCallback(() => {
    const video = videoRef.current;
    if (!video) return;
    if (video.paused) {
      void video.play().catch(() => {});
    } else {
      video.pause();
    }
  }, []);

  const toggleMute = useCallback(() => {
    const video = videoRef.current;
    if (!video) return;
    video.muted = !video.muted;
    setIsMuted(video.muted);
  }, []);

  const changeVolume = useCallback((nextVolume: number) => {
    const video = videoRef.current;
    const safeVolume = Math.min(1, Math.max(0, nextVolume));

    setVolume(safeVolume);
    setIsMuted(safeVolume === 0);

    if (!video) return;
    video.volume = safeVolume;
    video.muted = safeVolume === 0;
  }, []);

  const changePlaybackRate = useCallback((nextRate: number) => {
    const video = videoRef.current;
    setPlaybackRate(nextRate);
    if (video) {
      video.playbackRate = nextRate;
    }
  }, []);

  const toggleFullscreen = useCallback(async () => {
    const video = videoRef.current;
    if (!video) return;

    if (document.fullscreenElement) {
      await document.exitFullscreen();
      return;
    }

    await video.parentElement?.requestFullscreen();
  }, []);

  const togglePictureInPicture = useCallback(async () => {
    const video = videoRef.current;
    if (!video || !document.pictureInPictureEnabled) return;

    if (document.pictureInPictureElement) {
      await document.exitPictureInPicture();
      return;
    }

    if (video.disablePictureInPicture) return;
    await video.requestPictureInPicture();
  }, []);

  const handleSideTap = useCallback(
    (side: "left" | "right") => {
      const now = Date.now();
      const last = lastTapRef.current;

      if (last && last.side === side && now - last.time < DOUBLE_TAP_DELAY) {
        if (tapTimerRef.current) {
          clearTimeout(tapTimerRef.current);
          tapTimerRef.current = null;
        }
        lastTapRef.current = null;
        const delta = side === "left" ? -SEEK_STEP : SEEK_STEP;
        const applied = seekBy(delta);
        if (applied !== 0) {
          showSeekIndicator(side === "left" ? "backward" : "forward", SEEK_STEP);
        }
        return;
      }

      lastTapRef.current = { time: now, side };
      if (tapTimerRef.current) {
        clearTimeout(tapTimerRef.current);
      }
      tapTimerRef.current = setTimeout(() => {
        tapTimerRef.current = null;
        lastTapRef.current = null;
        togglePlayback();
      }, DOUBLE_TAP_DELAY);
    },
    [seekBy, showSeekIndicator, togglePlayback],
  );

  const handlePlayerKeyDown = useCallback(
    (event: React.KeyboardEvent<HTMLDivElement>) => {
      const target = event.target;
      if (
        target instanceof HTMLInputElement ||
        target instanceof HTMLTextAreaElement ||
        target instanceof HTMLSelectElement
      ) {
        return;
      }

      if (!isPlayerReady || mode !== "hls" || hasFatalError) {
        return;
      }

      switch (event.key.toLowerCase()) {
        case " ":
        case "k":
          event.preventDefault();
          togglePlayback();
          break;
        case "arrowleft":
        case "j":
          event.preventDefault();
          if (seekBy(-SEEK_STEP) !== 0) {
            showSeekIndicator("backward", SEEK_STEP);
          }
          break;
        case "arrowright":
        case "l":
          event.preventDefault();
          if (seekBy(SEEK_STEP) !== 0) {
            showSeekIndicator("forward", SEEK_STEP);
          }
          break;
        case "m":
          event.preventDefault();
          toggleMute();
          break;
        case "f":
          event.preventDefault();
          void toggleFullscreen();
          break;
      }
    },
    [hasFatalError, isPlayerReady, mode, seekBy, showSeekIndicator, toggleFullscreen, toggleMute, togglePlayback],
  );

  useEffect(() => {
    return () => {
      if (tapTimerRef.current) clearTimeout(tapTimerRef.current);
      if (seekIndicatorTimerRef.current) clearTimeout(seekIndicatorTimerRef.current);
    };
  }, []);

  const resetSeekState = useCallback(() => {
    setSeekIndicator(null);
    lastTapRef.current = null;
    if (tapTimerRef.current) {
      clearTimeout(tapTimerRef.current);
      tapTimerRef.current = null;
    }
  }, []);

  const selectQuality = useCallback((levelIndex: number) => {
    const hls = hlsRef.current;
    if (!hls) return;
    hls.currentLevel = levelIndex;
    if (levelIndex === -1) {
      setIsAutoQuality(true);
    } else {
      setIsAutoQuality(false);
      setCurrentLevelIndex(levelIndex);
    }
  }, []);

  const activeQualityLabel = useMemo(() => {
    if (isAutoQuality) {
      const currentLevel = qualityLevels.find((level) => level.index === currentLevelIndex);
      return currentLevel ? `Auto (${currentLevel.label})` : "Auto";
    }
    const selected = qualityLevels.find((level) => level.index === currentLevelIndex);
    return selected?.label || "Auto";
  }, [currentLevelIndex, isAutoQuality, qualityLevels]);

  const goToNextEpisode = useCallback(() => {
    if (!nextEpisodeHref) return;
    router.push(nextEpisodeHref);
  }, [nextEpisodeHref, router]);

  const goToPreviousEpisode = useCallback(() => {
    if (!previousEpisodeHref) return;
    router.push(previousEpisodeHref);
  }, [previousEpisodeHref, router]);

  const handleTimeUpdate = useCallback(() => {
    const video = videoRef.current;
    if (!video) return;

    const duration = Number.isFinite(video.duration) ? video.duration : 0;
    setPlaybackTime({ current: video.currentTime || 0, duration });

    if (!nextEpisodeHref || isAutoNextCancelled) return;
    if (duration <= 0) return;

    const remaining = Math.max(0, duration - video.currentTime);
    if (remaining <= AUTO_NEXT_SECONDS) {
      setIsAutoNextVisible(true);
      setAutoNextCountdown(Math.max(1, Math.ceil(remaining)));
    }
  }, [isAutoNextCancelled, nextEpisodeHref]);

  const handleEnded = useCallback(() => {
    if (!nextEpisodeHref || isAutoNextCancelled) return;
    goToNextEpisode();
  }, [goToNextEpisode, isAutoNextCancelled, nextEpisodeHref]);

  useEffect(() => {
    setFatalErrorSlug("");
    setIsSourceMenuOpen(false);
    setIsQualityMenuOpen(false);
    setIsSettingsMenuOpen(false);
    setQualityLevels([]);
    setCurrentLevelIndex(-1);
    setIsAutoQuality(true);
    setIsAutoNextVisible(false);
    setIsAutoNextCancelled(false);
    setAutoNextCountdown(AUTO_NEXT_SECONDS);
    setPlaybackTime({ current: 0, duration: 0 });
    setHlsAttempt("proxy");
  }, [episode?.slug]);

  useEffect(() => {
    const video = videoRef.current;

    if (!isPlayerReady || !video || !activeHlsSource || mode !== "hls") {
      return;
    }

    const handleHlsFailure = () => {
      if (hlsAttempt === "proxy" && episode?.rawM3u8 && episode.rawM3u8 !== episode.m3u8) {
        setHlsAttempt("direct");
        return;
      }

      fallbackToEmbed();
    };

    if (video.canPlayType("application/vnd.apple.mpegurl")) {
      video.onerror = () => {
        handleHlsFailure();
      };
      video.src = activeHlsSource;

      return () => {
        video.onerror = null;
        video.removeAttribute("src");
        video.load();
      };
    }

    if (!Hls.isSupported()) {
      return;
    }

    const hls = new Hls({
      enableWorker: true,
      lowLatencyMode: true,
    });
    hlsRef.current = hls;

    hls.loadSource(activeHlsSource);
    hls.attachMedia(video);

    hls.on(Hls.Events.MANIFEST_PARSED, (_event, data) => {
      const levels = buildQualityLevels(data.levels || []);
      setQualityLevels(levels);
      setIsAutoQuality(true);
      setCurrentLevelIndex(hls.currentLevel ?? -1);
    });

    hls.on(Hls.Events.LEVEL_SWITCHED, (_event, data) => {
      setCurrentLevelIndex(data.level);
    });

    hls.on(Hls.Events.ERROR, (_event, data) => {
      if (data.fatal) {
        handleHlsFailure();
      }
    });

    return () => {
      hlsRef.current = null;
      hls.destroy();
      video.removeAttribute("src");
      video.load();
    };
  }, [activeHlsSource, episode?.m3u8, episode?.rawM3u8, episode?.slug, hlsAttempt, isPlayerReady, mode]);

  if (!episode) {
    return (
      <div className="flex h-full items-center justify-center px-6 text-center text-zinc-400">
        Phim này chưa có tập phát trong dữ liệu API.
      </div>
    );
  }

  return (
    <div
      className="group/player relative isolate h-full w-full bg-black outline-none"
      onKeyDown={handlePlayerKeyDown}
      tabIndex={0}
    >
      {!isPlayerReady ? (
        <div className="relative flex h-full w-full items-center justify-center overflow-hidden bg-zinc-950">
          {posterUrl && (
            <Image
              src={posterUrl}
              alt={title}
              fill
              sizes="(max-width: 768px) 100vw, 1280px"
              quality={95}
              unoptimized
              className="object-cover opacity-45"
            />
          )}
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(0,0,0,.2),rgba(0,0,0,.82)_70%)]" />
          <button
            type="button"
            onClick={() => setIsPlayerReady(true)}
            className="relative inline-flex h-16 w-16 items-center justify-center rounded-full bg-red-600 text-white shadow-2xl shadow-red-950/50 transition hover:scale-105 hover:bg-red-500 sm:h-20 sm:w-20"
            aria-label={`Phát ${title}`}
          >
            <Play className="ml-1 h-8 w-8 fill-current sm:h-10 sm:w-10" aria-hidden="true" />
          </button>
        </div>
      ) : null}

      {isPlayerReady && (canSwitchSource || mode === "hls") && (
        <div className="absolute right-3 top-3 z-30 flex items-start gap-2">
          {mode === "hls" && (
            <div className="relative">
              <button
                type="button"
                aria-label="Chọn chất lượng"
                aria-expanded={isQualityMenuOpen}
                onClick={() => {
                  setIsQualityMenuOpen((value) => !value);
                  setIsSourceMenuOpen(false);
                }}
                className="flex h-9 items-center gap-2 rounded-md bg-black/65 px-3 text-xs font-semibold text-white ring-1 ring-white/15 backdrop-blur transition hover:bg-black/85"
              >
                <Gauge className="h-4 w-4" aria-hidden="true" />
                {qualityLevels.length > 0 ? activeQualityLabel : "Chất lượng"}
              </button>

              {isQualityMenuOpen && (
                <div className="absolute right-0 mt-2 w-44 overflow-hidden rounded-md border border-white/10 bg-zinc-950 p-1 text-sm font-medium text-zinc-200 shadow-2xl shadow-black/70">
                  {qualityLevels.length > 1 ? (
                    <>
                      <button
                        type="button"
                        onClick={() => {
                          selectQuality(-1);
                          setIsQualityMenuOpen(false);
                        }}
                        className={`block w-full rounded px-3 py-2 text-left transition ${
                          isAutoQuality
                            ? "bg-white text-black"
                            : "hover:bg-white/10 hover:text-white"
                        }`}
                      >
                        Auto
                      </button>
                      {qualityLevels.map((level) => {
                        const isActive =
                          !isAutoQuality && currentLevelIndex === level.index;
                        return (
                          <button
                            key={level.index}
                            type="button"
                            onClick={() => {
                              selectQuality(level.index);
                              setIsQualityMenuOpen(false);
                            }}
                            className={`block w-full rounded px-3 py-2 text-left transition ${
                              isActive
                                ? "bg-white text-black"
                                : "hover:bg-white/10 hover:text-white"
                            }`}
                          >
                            {level.label}
                          </button>
                        );
                      })}
                    </>
                  ) : (
                    <div className="px-3 py-2 text-xs leading-5 text-zinc-400">
                      Nguồn này chỉ có 1 chất lượng cố định
                      {qualityLevels[0] ? ` (${qualityLevels[0].label})` : ""}.
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {canSwitchSource && (
            <div className="relative">
              <button
                type="button"
                aria-label="Chọn nguồn phát"
                aria-expanded={isSourceMenuOpen}
                onClick={() => {
                  setIsSourceMenuOpen((value) => !value);
                  setIsQualityMenuOpen(false);
                }}
                className="flex h-9 items-center gap-2 rounded-md bg-black/65 px-3 text-xs font-semibold text-white ring-1 ring-white/15 backdrop-blur transition hover:bg-black/85"
              >
                <Settings2 className="h-4 w-4" aria-hidden="true" />
                Nguồn
              </button>

              {isSourceMenuOpen && (
                <div className="absolute right-0 mt-2 w-32 overflow-hidden rounded-md border border-white/10 bg-zinc-950 p-1 text-sm font-medium text-zinc-200 shadow-2xl shadow-black/70">
                  {(["embed", "hls"] as const).map((source) => (
                    <button
                      key={source}
                      type="button"
                      onClick={() => {
                        setModeOverride({ slug: episode.slug, mode: source });
                        if (source === "hls") {
                          setHlsAttempt("proxy");
                          setFatalErrorSlug("");
                        }
                        resetSeekState();
                        setIsSourceMenuOpen(false);
                      }}
                      className={`block w-full rounded px-3 py-2 text-left transition ${
                        mode === source
                          ? "bg-white text-black"
                          : "hover:bg-white/10 hover:text-white"
                      }`}
                    >
                      {source === "embed" ? "Embed" : "HLS"}
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {isPlayerReady && mode === "embed" && episode.embed ? (
        <iframe
          title={title}
          src={episode.embed}
          allow="autoplay; encrypted-media; fullscreen; picture-in-picture"
          allowFullScreen
          referrerPolicy="no-referrer"
          className="h-full w-full"
        />
      ) : isPlayerReady && activeHlsSource ? (
        <>
          <video
            ref={videoRef}
            playsInline
            preload="metadata"
            onEnded={handleEnded}
            onLoadedMetadata={handleTimeUpdate}
            onPause={() => setIsVideoPaused(true)}
            onPlay={() => setIsVideoPaused(false)}
            onTimeUpdate={handleTimeUpdate}
            onVolumeChange={(event) => {
              setIsMuted(event.currentTarget.muted || event.currentTarget.volume === 0);
              setVolume(event.currentTarget.muted ? 0 : event.currentTarget.volume);
            }}
            className="h-full w-full bg-black"
            title={title}
          />

          {!hasFatalError && (
            <div className="absolute inset-x-0 bottom-0 z-30 bg-gradient-to-t from-black/90 via-black/45 to-transparent px-5 pb-4 pt-16 text-white opacity-0 transition duration-200 group-hover/player:opacity-100 group-focus-within/player:opacity-100">
              <input
                type="range"
                min={0}
                max={playbackTime.duration || 0}
                step="0.1"
                value={Math.min(playbackTime.current, playbackTime.duration || playbackTime.current)}
                onChange={(event) => {
                  const video = videoRef.current;
                  const nextTime = Number(event.currentTarget.value);
                  if (!video || !Number.isFinite(nextTime)) return;
                  video.currentTime = nextTime;
                  setPlaybackTime((current) => ({ ...current, current: nextTime }));
                }}
                className="mb-3 h-1 w-full cursor-pointer accent-red-600"
                aria-label="Tua video"
              />

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={togglePlayback}
                  className="inline-flex h-10 w-10 items-center justify-center rounded-full transition hover:bg-white/15 active:scale-95"
                  aria-label={isVideoPaused ? "Phát" : "Tạm dừng"}
                >
                  {isVideoPaused ? (
                    <Play className="ml-0.5 h-5 w-5 fill-current" aria-hidden="true" />
                  ) : (
                    <Pause className="h-5 w-5 fill-current" aria-hidden="true" />
                  )}
                </button>
                <button
                  type="button"
                  onClick={goToPreviousEpisode}
                  disabled={!previousEpisode || !previousEpisodeHref}
                  className="group relative inline-flex h-10 w-10 items-center justify-center rounded-full transition hover:bg-white/15 active:scale-95 disabled:cursor-not-allowed disabled:opacity-35 disabled:hover:bg-transparent disabled:active:scale-100"
                  aria-label={previousEpisode ? `Chuyển sang tập ${previousEpisode.name}` : "Không có tập trước"}
                >
                  <SkipBack className="h-5 w-5 fill-current" aria-hidden="true" />
                  {previousEpisode && (
                    <span className="pointer-events-none absolute bottom-full left-1/2 mb-2 hidden -translate-x-1/2 whitespace-nowrap rounded-md bg-black/90 px-2 py-1 text-[11px] font-semibold text-white shadow-xl ring-1 ring-white/10 group-hover:block">
                      Tập trước: {previousEpisode.name}
                    </span>
                  )}
                </button>
                <button
                  type="button"
                  onClick={goToNextEpisode}
                  disabled={!nextEpisode || !nextEpisodeHref}
                  className="group relative inline-flex h-10 w-10 items-center justify-center rounded-full transition hover:bg-white/15 active:scale-95 disabled:cursor-not-allowed disabled:opacity-35 disabled:hover:bg-transparent disabled:active:scale-100"
                  aria-label={nextEpisode ? `Chuyển sang tập ${nextEpisode.name}` : "Không có tập tiếp theo"}
                >
                  <SkipForward className="h-5 w-5 fill-current" aria-hidden="true" />
                  {nextEpisode && (
                    <span className="pointer-events-none absolute bottom-full left-1/2 mb-2 hidden -translate-x-1/2 whitespace-nowrap rounded-md bg-black/90 px-2 py-1 text-[11px] font-semibold text-white shadow-xl ring-1 ring-white/10 group-hover:block">
                      Tập tiếp: {nextEpisode.name}
                    </span>
                  )}
                </button>
                <span className="ml-1 text-xs font-bold tabular-nums text-white/95 sm:text-sm">
                  {formatTime(playbackTime.current)} / {formatTime(playbackTime.duration)}
                </span>
                <div className="ml-auto flex items-center gap-1">
                  <div className="flex h-10 items-center gap-2 rounded-full bg-white/10 px-2 ring-1 ring-white/10 backdrop-blur">
                    <button
                      type="button"
                      onClick={toggleMute}
                      className="inline-flex h-8 w-8 items-center justify-center rounded-full transition hover:bg-white/15 active:scale-95"
                      aria-label={isMuted ? "Bật âm thanh" : "Tắt âm thanh"}
                    >
                      {isMuted ? (
                        <VolumeX className="h-5 w-5" aria-hidden="true" />
                      ) : (
                        <Volume2 className="h-5 w-5" aria-hidden="true" />
                      )}
                    </button>
                    <input
                      type="range"
                      min={0}
                      max={1}
                      step={0.01}
                      value={isMuted ? 0 : volume}
                      onChange={(event) => changeVolume(Number(event.currentTarget.value))}
                      className="h-1 w-16 cursor-pointer accent-white"
                      aria-label="Âm lượng"
                    />
                  </div>
                  <div className="relative">
                    <button
                      type="button"
                      onClick={() => {
                        setIsSettingsMenuOpen((value) => !value);
                        setIsQualityMenuOpen(false);
                        setIsSourceMenuOpen(false);
                      }}
                      className="inline-flex h-10 w-10 items-center justify-center rounded-full transition hover:bg-white/15 active:scale-95"
                      aria-label="Cài đặt"
                      aria-expanded={isSettingsMenuOpen}
                    >
                      <Settings2 className="h-5 w-5" aria-hidden="true" />
                    </button>

                    {isSettingsMenuOpen && (
                      <div className="absolute bottom-full right-0 mb-3 w-64 overflow-hidden rounded-xl border border-white/10 bg-zinc-950/95 p-2 text-sm font-medium text-zinc-200 shadow-2xl shadow-black/70 backdrop-blur-xl">
                        <div className="px-2 pb-2 text-[11px] font-black uppercase tracking-[0.18em] text-zinc-500">
                          Cài đặt
                        </div>

                        <div className="rounded-lg bg-white/[.04] p-2">
                          <p className="mb-2 px-1 text-xs font-bold text-zinc-400">Tốc độ phát</p>
                          <div className="grid grid-cols-3 gap-1">
                            {PLAYBACK_RATES.map((rate) => (
                              <button
                                key={rate}
                                type="button"
                                onClick={() => changePlaybackRate(rate)}
                                className={`rounded-md px-2 py-1.5 text-xs font-bold transition ${
                                  playbackRate === rate
                                    ? "bg-white text-black"
                                    : "hover:bg-white/10 hover:text-white"
                                }`}
                              >
                                {rate === 1 ? "Chuẩn" : `${rate}x`}
                              </button>
                            ))}
                          </div>
                        </div>

                        <div className="mt-2 rounded-lg bg-white/[.04] p-2">
                          <p className="mb-2 px-1 text-xs font-bold text-zinc-400">Chất lượng</p>
                          {qualityLevels.length > 1 ? (
                            <div className="grid grid-cols-2 gap-1">
                              <button
                                type="button"
                                onClick={() => selectQuality(-1)}
                                className={`rounded-md px-2 py-1.5 text-xs font-bold transition ${
                                  isAutoQuality
                                    ? "bg-white text-black"
                                    : "hover:bg-white/10 hover:text-white"
                                }`}
                              >
                                Auto
                              </button>
                              {qualityLevels.map((level) => (
                                <button
                                  key={level.index}
                                  type="button"
                                  onClick={() => selectQuality(level.index)}
                                  className={`rounded-md px-2 py-1.5 text-xs font-bold transition ${
                                    !isAutoQuality && currentLevelIndex === level.index
                                      ? "bg-white text-black"
                                      : "hover:bg-white/10 hover:text-white"
                                  }`}
                                >
                                  {level.label}
                                </button>
                              ))}
                            </div>
                          ) : (
                            <p className="px-1 text-xs leading-5 text-zinc-500">
                              Nguồn này chỉ có 1 chất lượng cố định
                              {qualityLevels[0] ? ` (${qualityLevels[0].label})` : ""}.
                            </p>
                          )}
                        </div>

                        {canSwitchSource && (
                          <div className="mt-2 rounded-lg bg-white/[.04] p-2">
                            <p className="mb-2 px-1 text-xs font-bold text-zinc-400">Nguồn phát</p>
                            <div className="grid grid-cols-2 gap-1">
                              {(["hls", "embed"] as const).map((source) => (
                                <button
                                  key={source}
                                  type="button"
                                  onClick={() => {
                                    setModeOverride({ slug: episode.slug, mode: source });
                                    if (source === "hls") {
                                      setHlsAttempt("proxy");
                                      setFatalErrorSlug("");
                                    }
                                    resetSeekState();
                                    setIsSettingsMenuOpen(false);
                                  }}
                                  className={`rounded-md px-2 py-1.5 text-xs font-bold transition ${
                                    mode === source
                                      ? "bg-white text-black"
                                      : "hover:bg-white/10 hover:text-white"
                                  }`}
                                >
                                  {source === "hls" ? "HLS" : "Embed"}
                                </button>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                  <button
                    type="button"
                    onClick={() => void togglePictureInPicture()}
                    className="inline-flex h-10 w-10 items-center justify-center rounded-full transition hover:bg-white/15 active:scale-95"
                    aria-label="Cửa sổ nổi"
                  >
                    <PictureInPicture2 className="h-5 w-5" aria-hidden="true" />
                  </button>
                  <button
                    type="button"
                    onClick={() => void toggleFullscreen()}
                    className="inline-flex h-10 w-10 items-center justify-center rounded-full transition hover:bg-white/15 active:scale-95"
                    aria-label="Toàn màn hình"
                  >
                    <Expand className="h-5 w-5" aria-hidden="true" />
                  </button>
                </div>
              </div>
            </div>
          )}

          {isAutoNextVisible && nextEpisode && nextEpisodeHref && !isAutoNextCancelled && (
            <div className="absolute bottom-20 right-4 z-30 w-[min(360px,calc(100%-32px))] overflow-hidden rounded-xl border border-white/10 bg-zinc-950/90 text-white shadow-2xl shadow-black/70 backdrop-blur-md sm:bottom-24">
              <div className="flex items-start gap-3 p-3">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-red-600 text-white">
                  <SkipForward className="h-5 w-5" aria-hidden="true" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-xs font-bold uppercase tracking-[0.18em] text-red-300">
                    Tập tiếp theo trong {autoNextCountdown}s
                  </p>
                  <p className="mt-1 line-clamp-2 text-sm font-bold text-white">
                    Tập {nextEpisode.name}
                  </p>
                  <div className="mt-3 flex gap-2">
                    <button
                      type="button"
                      onClick={goToNextEpisode}
                      className="inline-flex h-9 items-center justify-center rounded-md bg-red-600 px-3 text-xs font-bold text-white transition hover:bg-red-500"
                    >
                      Xem ngay
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setIsAutoNextCancelled(true);
                        setIsAutoNextVisible(false);
                      }}
                      className="inline-flex h-9 items-center justify-center rounded-md border border-white/15 px-3 text-xs font-bold text-zinc-200 transition hover:bg-white/10 hover:text-white"
                    >
                      Hủy
                    </button>
                  </div>
                </div>
                <button
                  type="button"
                  aria-label="Đóng tự chuyển tập"
                  onClick={() => {
                    setIsAutoNextCancelled(true);
                    setIsAutoNextVisible(false);
                  }}
                  className="rounded-full p-1 text-zinc-400 transition hover:bg-white/10 hover:text-white"
                >
                  <X className="h-4 w-4" aria-hidden="true" />
                </button>
              </div>
              <div className="h-1 bg-white/10">
                <div
                  className="h-full bg-red-600 transition-all duration-300"
                  style={{ width: `${(autoNextCountdown / AUTO_NEXT_SECONDS) * 100}%` }}
                />
              </div>
            </div>
          )}

          {canSeek && (
            <>
              <button
                type="button"
                aria-label={isVideoPaused ? "Phát video" : "Tạm dừng video"}
                onClick={togglePlayback}
                onDoubleClick={(event) => event.preventDefault()}
                onContextMenu={(event) => event.preventDefault()}
                className="absolute left-[35%] top-0 z-20 h-[calc(100%-72px)] w-[30%] cursor-pointer select-none bg-transparent outline-none focus-visible:bg-white/5 sm:h-[calc(100%-80px)]"
                style={{ WebkitTapHighlightColor: "transparent" }}
              />
              <button
                type="button"
                aria-label="Chạm hai lần để tua lùi 10 giây"
                onClick={() => handleSideTap("left")}
                onDoubleClick={(event) => event.preventDefault()}
                onContextMenu={(event) => event.preventDefault()}
                className="absolute left-0 top-0 z-20 h-[calc(100%-72px)] w-[35%] cursor-pointer select-none bg-transparent outline-none focus-visible:bg-white/5 sm:h-[calc(100%-80px)]"
                style={{ WebkitTapHighlightColor: "transparent" }}
              />
              <button
                type="button"
                aria-label="Chạm hai lần để tua tới 10 giây"
                onClick={() => handleSideTap("right")}
                onDoubleClick={(event) => event.preventDefault()}
                onContextMenu={(event) => event.preventDefault()}
                className="absolute right-0 top-0 z-20 h-[calc(100%-72px)] w-[35%] cursor-pointer select-none bg-transparent outline-none focus-visible:bg-white/5 sm:h-[calc(100%-80px)]"
                style={{ WebkitTapHighlightColor: "transparent" }}
              />

              {seekIndicator && (
                <div
                  key={seekIndicator.id}
                  className={`pointer-events-none absolute top-1/2 z-30 flex -translate-y-1/2 items-center justify-center ${
                    seekIndicator.direction === "backward" ? "left-[7%]" : "right-[7%]"
                  }`}
                >
                  <span className="seek-ripple absolute h-40 w-40 rounded-full bg-white/15 sm:h-48 sm:w-48" />
                  <div className="seek-indicator relative flex flex-col items-center gap-1 text-white drop-shadow-lg">
                    <div
                      className="flex items-center"
                      style={
                        {
                          "--seek-arrow-shift":
                            seekIndicator.direction === "backward" ? "-4px" : "4px",
                        } as React.CSSProperties
                      }
                    >
                      {seekIndicator.direction === "backward" ? (
                        <ChevronsLeft className="seek-arrow h-8 w-8 sm:h-10 sm:w-10" aria-hidden="true" />
                      ) : (
                        <ChevronsRight className="seek-arrow h-8 w-8 sm:h-10 sm:w-10" aria-hidden="true" />
                      )}
                    </div>
                    <span className="text-sm font-bold tracking-wide sm:text-base">
                      {seekIndicator.seconds} giây
                    </span>
                  </div>
                </div>
              )}
            </>
          )}

          {hasFatalError && (
            <div className="absolute inset-0 z-40 flex items-center justify-center bg-black/90 px-6 text-center">
              <div className="max-w-sm">
                <p className="text-sm leading-6 text-zinc-300">
                  Trình duyệt không phát được HLS hoặc nguồn `.m3u8` đang chặn.
                </p>
                {episode.embed && (
                  <button
                    type="button"
                    onClick={() => setModeOverride({ slug: episode.slug, mode: "embed" })}
                    className="mt-4 rounded-lg bg-white px-4 py-2 text-sm font-medium text-black transition hover:bg-zinc-200"
                  >
                    Dùng Embed
                  </button>
                )}
              </div>
            </div>
          )}
        </>
      ) : (
        <div className="flex h-full items-center justify-center px-6 text-center text-zinc-400">
          Phim này chưa có link phát trong dữ liệu API.
        </div>
      )}
    </div>
  );
}
