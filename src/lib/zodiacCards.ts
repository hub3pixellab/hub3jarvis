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
    "https://cdn.enter.pro/resources/uid_100512101/zodiaco-aquario_cc039ccf.png",
  pisces:
    "https://cdn.enter.pro/resources/uid_100512101/zodiaco-peixes_4a993074.png",
};
