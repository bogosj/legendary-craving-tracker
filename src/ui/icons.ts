import type { LegendaryMinionId, RuneType } from '../state/types.ts';

export function getRuneIconSvg(type: RuneType, size = 20): string {
  const imageMap: Record<RuneType, { src: string; alt: string }> = {
    ice: { src: './images/ice_rune.webp', alt: 'Ice Rune' },
    poison: { src: './images/poison_rune.webp', alt: 'Poison Rune' },
    blood: { src: './images/blood_rune.webp', alt: 'Blood Rune' },
    moon: { src: './images/moon_rune.webp', alt: 'Moon Rune' },
    death: { src: './images/death_rune.webp', alt: 'Death Rune' },
    cosmic: { src: './images/cosmic_rune.webp', alt: 'Cosmic Rune' },
  };

  const rune = imageMap[type];
  return `<img src="${rune.src}" alt="${rune.alt}" title="${rune.alt}" width="${size}" height="${size}" class="wiki-rune-icon wiki-rune-${type}" loading="lazy" style="image-rendering: pixelated; vertical-align: middle; object-fit: contain;" />`;
}

export function getWobularIconSvg(size = 20): string {
  return `<img src="./images/wobular.webp" alt="Wobular" title="Wobular" width="${size}" height="${size}" class="wiki-wobular-icon" loading="lazy" style="image-rendering: pixelated; vertical-align: middle; object-fit: contain;" />`;
}

export function getMinionBadgeIconSvg(minionId: LegendaryMinionId, size = 28): string {
  return `<img src="./images/${minionId}.webp" alt="${minionId}" title="${minionId}" width="${size}" height="${size}" class="wiki-minion-sprite wiki-minion-${minionId}" loading="lazy" style="image-rendering: pixelated; vertical-align: middle; object-fit: contain;" />`;
}
