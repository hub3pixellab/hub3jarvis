import type { ZodiacSignKey } from "@/domain/models";

/**
 * Arte de cada signo (ilustrações douradas sobre azul-marinho, retrato 3:4).
 * Cada URL é usada como fundo do card e como arte do pop-up de horóscopo.
 */
export const ZODIAC_CARD_IMAGES: Record<ZodiacSignKey, string> = {
  aries:
    "https://cdn.enter.pro/visual_resources/100512101/112a6ab6f56c4968bc9aec1c6c8a8357/e1dd0fc9.png",
  taurus:
    "https://cdn.enter.pro/visual_resources/100512101/112a6ab6f56c4968bc9aec1c6c8a8357/cd81cb3a.png",
  gemini:
    "https://cdn.enter.pro/visual_resources/100512101/112a6ab6f56c4968bc9aec1c6c8a8357/487bb828.png",
  cancer:
    "https://cdn.enter.pro/visual_resources/100512101/112a6ab6f56c4968bc9aec1c6c8a8357/5a31ebd4.png",
  leo:
    "https://cdn.enter.pro/visual_resources/100512101/112a6ab6f56c4968bc9aec1c6c8a8357/65d06543.png",
  virgo:
    "https://cdn.enter.pro/visual_resources/100512101/112a6ab6f56c4968bc9aec1c6c8a8357/8f0ad340.png",
  libra:
    "https://cdn.enter.pro/visual_resources/100512101/112a6ab6f56c4968bc9aec1c6c8a8357/78a58020.png",
  scorpio:
    "https://cdn.enter.pro/visual_resources/100512101/112a6ab6f56c4968bc9aec1c6c8a8357/ab3a0e1e.png",
  sagittarius:
    "https://cdn.enter.pro/visual_resources/100512101/112a6ab6f56c4968bc9aec1c6c8a8357/eeba4feb.png",
  capricorn:
    "https://cdn.enter.pro/visual_resources/100512101/112a6ab6f56c4968bc9aec1c6c8a8357/b285da56.png",
  aquarius:
    "https://cdn.enter.pro/visual_resources/100512101/112a6ab6f56c4968bc9aec1c6c8a8357/40b14292.png",
  pisces:
    "https://cdn.enter.pro/visual_resources/100512101/112a6ab6f56c4968bc9aec1c6c8a8357/5c0eba40.png",
};

/** Fundo da seção do widget de horóscopo (mapa astral widescreen). */
export const ZODIAC_BACKGROUND_IMAGE =
  "https://cdn.enter.pro/visual_resources/100512101/112a6ab6f56c4968bc9aec1c6c8a8357/1c2020dd.png";

/** Intervalos de data de cada signo (rótulo curto, sem tradução). */
export const ZODIAC_RANGES: Record<ZodiacSignKey, string> = {
  aries: "21.03 – 19.04",
  taurus: "20.04 – 20.05",
  gemini: "21.05 – 20.06",
  cancer: "21.06 – 22.07",
  leo: "23.07 – 22.08",
  virgo: "23.08 – 22.09",
  libra: "23.09 – 22.10",
  scorpio: "23.10 – 21.11",
  sagittarius: "22.11 – 21.12",
  capricorn: "22.12 – 19.01",
  aquarius: "20.01 – 18.02",
  pisces: "19.02 – 20.03",
};
