# Chapter 02 — Secret Wallet Experience (Phase 4 Documentation)

## 1. Overview & Objective

Phase 4 transforms Chapter 02 (Lì xì / Wallet) from a flat prototype with vanishing currency into an intimate, tactile **"tiny secret wallet made for her"** (`quỹ chiều em`). The experience features:
- **Physical Leather Crafting (`LeatherWallet.tsx`)**: Multi-layered card-wallet architecture in deep burgundy and dark leather tones (`#1c1117`, `#2a1421`, `#381a2c`) with perimeter stitching, inner velvet lining, an interior cavity, a front holding lip with an embossed gold foil monogram, and a 3D folding top flap.
- **Physical Opening Sequence**: Smooth 3D flap fold (`rotateX: -155deg`, `transform-origin: top center`) with anticipation and controlled settling.
- **Stylized Fictional Currency (`MoneyFan.tsx`)**: 6 decorative banknotes styled after Vietnamese denomination colors (deep emerald/teal with gold guilloche bands, "500.000₫", and a cute mascot watermark seal) that remain gracefully fanned above the pocket instead of flying away.
- **Interactive Gift / Promise Cards (`GiftCardRack.tsx`)**: 4 romantic vouchers nested inside the front pocket:
  1. *Ăn gì cũng được* (Áp dụng bất kể ngày đêm)
  2. *Đi đâu cũng được* (Tài xế kiêm hướng dẫn viên: Tui)
  3. *Em thích gì tui mua* (Mã giảm giá: 100% tài trợ bởi tình yêu)
  4. *Hết giận ngay lập tức* (Vé ôm & dỗ dành vô điều kiện)
- **Voucher Inspection Modal (`GiftCardModal.tsx`)**: Clicking any voucher pulls it into full focus at the center with a darkened backdrop, clear typography, official validity stamp, close button `✕`, and `Escape` key support.
- **Sequential Gating & Return-Visit Persistence**: The wallet starts closed on first visit; the CTA to Chapter 03 ("Có thứ này quan trọng hơn ↓") unlocks after opening; on return visits from later chapters, the wallet remains open and ready.

---

## 2. Visual Stacking & Layer Hierarchy

The wallet scene is composed of 9 deliberate depth layers:

```
[z-50] GiftCardModal (Focused dialog & backdrop blur)
[z-30] Open Click Trigger (Active only when closed)
[z-20] Wallet Top Flap (3D folding flap with gold magnetic snap clasp)
[z-12] Wallet Front Lip (Holds contents inside; embossed "quỹ chiều em")
[z-8]  GiftCardRack (4 interactive romantic vouchers)
[z-6]  MoneyFan (6 fanned 500K decorative banknotes)
[z-4]  Wallet Lining (Inner velvet cavity)
[z-2]  Wallet Back (Exterior leather base with perimeter stitch)
[z-0]  Ambient Radial Glow & Chapter Backdrop
```

---

## 3. Wallet State Machine

The component state transitions cleanly through:
```
[closed] ──(User clicks/taps)──> [opening] ──(1100ms)──> [open]
   │                                                       │
   │                                                       ├──> [Inspecting Voucher Modal]
   │                                                       │       │
   └──(prefers-reduced-motion)───> [open]                 │       └──(Escape / Click Outside)
                                                           │
                                                           └──> [CTA: Có thứ này quan trọng hơn ↓]
```

### State Definitions:
- `closed`: Flap is closed (`rotateX: 0deg`), prompt `"chạm để mở ví ✨"` pulses gently, contents are tucked inside (`scale: 0.6, opacity: 0`), and CTA is hidden.
- `opening`: Flap folds back (`rotateX: -155deg`), bills and vouchers smoothly rise upward from inside the pocket with staggered delays.
- `open`: Full emergence complete, voucher cards are hoverable and clickable, and the next-chapter CTA appears with a soft glow.
- `selectedCard`: When non-null, mounts `GiftCardModal` with `role="dialog"` and `aria-modal="true"`.

---

## 4. Return-Visit Persistence

### Architectural Guarantee:
When a user advances to Chapter 03 (Letter) or later chapters and scrolls back up:
1. `hasOpened` session flag remains `true`.
2. `walletState` is maintained at `"open"`.
3. `isCtaReady` remains `true`.
4. `selectedCard` defaults to `null` (modal dismissed).
5. The opening sequence is never replayed, preserving seamless narrative continuity.

---

## 5. Stylized Currency Design & Anti-Counterfeit Compliance

To respect legal guidelines and preserve an affectionate, aesthetic atmosphere:
- **No real banknote scans**: The bills are 100% vector CSS layouts with fictional decorative typography.
- **Denomination Aesthetic**: Cyan-teal / deep emerald gradient (`#103328` to `#1d5241`) reminiscent of polymer tones, with gold borders (`#e7b96a`).
- **Playful Elements**: Issuer labeled `"NGÂN HÀNG YÊU THƯƠNG"`, watermark featuring a cute pig seal (`🐷`), serial numbers like `TY-20031110-A`, and tagline `"quỹ chiều em"`.

---

## 6. Accessibility & Reduced Motion

- **Semantic HTML & Focus Management**:
  - The wallet open trigger uses a standard `<button>` with `aria-label="Mở ví"`.
  - All 4 vouchers in `GiftCardRack` are focusable `<button>` elements with `Enter` and `Space` keyboard activation.
  - `GiftCardModal` traps focus on the close button, supports the `Escape` key to dismiss, and restores focus to the trigger.
- **Reduced Motion Support**:
  - Detects `prefers-reduced-motion: reduce`.
  - When the user clicks to open, the wallet transitions to `"open"` immediately without delay.
  - The CTA button and vouchers become accessible instantly.

---

## 7. Responsive Audit (Desktop vs Mobile)

| Metric | Desktop (1440 × 900) | Mobile (390 × 844) |
| :--- | :--- | :--- |
| **Wallet Container** | `310 × 200 px` | `270 × 180 px` |
| **Money Fan Spread** | Fanned `-85px` to `+86px` (`-22°` to `+23°`) | Tightened by 35% (`-55px` to `+56px`) |
| **Gift Card Slots** | Fanned `-76px` to `+77px` (`-9°` to `+10°`) | Tightened (`-54px` to `+54px`) |
| **Modal Width** | Max `380 px` centered | `w-[86vw] max-w-[340px]` |
| **Horizontal Overflow** | **0 px** | **0 px** |
| **Touch Targets** | Standard cursor | Min `44 × 44 px` |
