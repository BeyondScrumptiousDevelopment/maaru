/** Turn a public share URL into an embeddable iframe URL. Returns undefined if unknown. */
export type Provider = 'spotify' | 'soundcloud' | 'bandcamp' | 'youtube' | 'mixcloud' | 'vimeo';

export function youtubeId(url: string) {
  const m = url.match(/(?:youtu\.be\/|youtube(?:-nocookie)?\.com\/(?:watch\?v=|embed\/|shorts\/|live\/))([\w-]{11})/);
  return m?.[1];
}
export function vimeoId(url: string) {
  return url.match(/vimeo\.com\/(?:video\/)?(\d+)/)?.[1];
}

export function embedSrc(provider: Provider, url: string): string | undefined {
  try {
    switch (provider) {
      case 'spotify': {
        const u = new URL(url);
        if (u.hostname !== 'open.spotify.com') return;
        const path = u.pathname.replace(/^\/(intl-[a-z]+\/)?/, '/').replace(/^\/embed/, '');
        return `https://open.spotify.com/embed${path}?utm_source=generator&theme=0`;
      }
      case 'soundcloud':
        return `https://w.soundcloud.com/player/?url=${encodeURIComponent(url)}&color=%23a88955&auto_play=false&hide_related=true&show_comments=false&visual=false`;
      case 'mixcloud': {
        const u = new URL(url);
        return `https://player-widget.mixcloud.com/widget/iframe/?hide_cover=1&light=0&feed=${encodeURIComponent(u.pathname)}`;
      }
      case 'bandcamp':
        // Bandcamp needs the numeric album/track id: paste the EmbeddedPlayer URL from Bandcamp's "Share / Embed".
        return url.includes('/EmbeddedPlayer/') ? url : undefined;
      case 'youtube': {
        const id = youtubeId(url);
        return id ? `https://www.youtube-nocookie.com/embed/${id}?autoplay=1&rel=0` : undefined;
      }
      case 'vimeo': {
        const id = vimeoId(url);
        return id ? `https://player.vimeo.com/video/${id}?autoplay=1&dnt=1` : undefined;
      }
    }
  } catch { return; }
}

export const embedHeight: Record<Provider, string> = {
  spotify: '352px', soundcloud: '166px', mixcloud: '120px', bandcamp: '120px', youtube: 'auto', vimeo: 'auto',
};
export const providerName: Record<Provider, string> = {
  spotify: 'Spotify', soundcloud: 'SoundCloud', bandcamp: 'Bandcamp', youtube: 'YouTube', mixcloud: 'Mixcloud', vimeo: 'Vimeo',
};
