export type CursorShape = 'paw' | 'tulip' | 'gift' | 'quill' | 'camera' | 'heart';

export const CHAPTER_CURSOR_THEMES: ReadonlyArray<{
  shape: CursorShape;
  accent: string;
  trail: string;
  particle: 'heart' | 'star' | 'bubble';
}> = [
  { shape: 'paw', accent: '#f3a4ba', trail: 'rgba(243, 164, 186, ', particle: 'heart' },
  { shape: 'tulip', accent: '#f0a0ba', trail: 'rgba(240, 160, 186, ', particle: 'bubble' },
  { shape: 'gift', accent: '#e8bf78', trail: 'rgba(232, 191, 120, ', particle: 'star' },
  { shape: 'quill', accent: '#edd5ad', trail: 'rgba(237, 213, 173, ', particle: 'star' },
  { shape: 'heart', accent: '#e6a6ac', trail: 'rgba(230, 166, 172, ', particle: 'heart' },
  { shape: 'heart', accent: '#576785', trail: 'rgba(87, 103, 133, ', particle: 'heart' },
];

/** The small star at (6, 4) marks the same click point for every silhouette. */
export default function ChapterCursorShape({ shape }: { shape: CursorShape }) {
  return <svg width="38" height="40" viewBox="0 0 38 40" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M6 0 7 3 10 4 7 5 6 8 5 5 2 4 5 3Z" fill="currentColor" />
    <g stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round">
      {shape === 'paw' && <>
        <path d="M12 22C9 26 9 33 14 36C18 39 27 38 31 34C35 30 32 24 28 22C24 19 16 19 12 22Z" fill="#fff4f6" />
        <path d="M22 33C18 32 15 29 17 26C18 24 21 25 22 27C24 24 27 25 28 27C29 30 25 32 22 33Z" fill="currentColor" stroke="none" />
        <ellipse cx="11" cy="17" rx="3" ry="4" transform="rotate(-25 11 17)" fill="#fff4f6" />
        <ellipse cx="18" cy="13" rx="3" ry="4" fill="#fff4f6" />
        <ellipse cx="26" cy="14" rx="3" ry="4" fill="#fff4f6" />
        <ellipse cx="32" cy="19" rx="3" ry="4" transform="rotate(25 32 19)" fill="#fff4f6" />
      </>}
      {shape === 'tulip' && <>
        <path d="M22 24V38M22 35C14 34 12 30 12 26C18 27 21 30 22 35ZM22 32C29 31 32 27 32 24C26 25 23 28 22 32Z" stroke="#9dac81" fill="#364f3b" />
        <path d="M10 11C15 11 17 13 19 17C18 12 19 8 22 6C26 9 27 13 25 17C28 12 31 11 34 11C34 24 28 28 22 28C16 28 10 23 10 11Z" fill="#793c58" />
        <path d="M16 16C16 23 19 26 22 28C26 25 28 22 28 16" />
      </>}
      {shape === 'gift' && <>
        <path d="M10 21H34V36H10Z" fill="#593132" />
        <path d="M8 16H36V22H8Z" fill="#793d3e" />
        <path d="M20 16H24V36H20Z" fill="currentColor" stroke="none" />
        <path d="M22 16C12 17 11 10 15 9C19 8 21 12 22 16ZM22 16C32 17 33 10 29 9C25 8 23 12 22 16Z" fill="#593132" />
      </>}
      {shape === 'quill' && <>
        <path d="M8 34C12 20 16 9 34 8C33 23 27 30 14 29Z" fill="#5b4d3c" />
        <path d="M6 38 28 14M13 28 12 21M19 22 26 23M23 18 23 13" />
      </>}
      {shape === 'camera' && <>
        <path d="M9 16H15L18 11H27L30 16H35V35H9Z" fill="#333b43" />
        <circle cx="22" cy="25" r="7" fill="#151e26" />
        <circle cx="22" cy="25" r="3.5" />
        <path d="M30 19H32M17 14H23" />
        <path d="M19 23 21 21" stroke="#fff3dc" />
      </>}
      {shape === 'heart' && <>
        <path d="M22 36C18 33 8 25 8 19C8 10 19 9 22 16C25 9 36 10 36 19C36 25 26 33 22 36Z" fill="#783e4a" />
        <path d="M13 20C12 16 16 14 18 16" stroke="#fff0df" />
        <path d="M28 27 30 25" />
      </>}
    </g>
  </svg>;
}
