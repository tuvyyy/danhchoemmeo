# Lily Bloom Sequence — 60 WebP frames

Pack này dành cho animation hoa nở trong web mà không cần video runtime.

## Files
- `frames/lily_bloom_001.webp` → `frames/lily_bloom_060.webp`
- mỗi frame: 512×512
- tổng 60 frame
- gợi ý playback: 12 fps ≈ 5 giây
- `preview_contact_sheet.jpg`: preview 12 mốc của sequence
- `manifest.json`: metadata

## Cách dùng
Render CHỈ 1 frame tại một thời điểm bằng `<canvas>` hoặc `<img>`.
Không crossfade 60 ảnh cùng lúc.

Ví dụ mapping tiến trình:
```ts
const frame = Math.min(59, Math.floor(progress * 60));
img.src = `/assets/lily-bloom/lily_bloom_${String(frame + 1).padStart(3, '0')}.webp`;
```

Nếu tự chạy animation 5 giây:
```ts
const FRAME_COUNT = 60;
const FPS = 12;
const frameIndex = Math.min(
  FRAME_COUNT - 1,
  Math.floor(elapsedSeconds * FPS)
);
```

## Lưu ý kỹ thuật
- Nền sequence là đen/tối, phù hợp section nền đen. Không dùng `mix-blend-screen` mặc định.
- Có thể đặt cỏ foreground chồng lên đáy flower frame để hòa scene.
- Preload sequence khi Hero gần hoàn tất hoặc Flowers chapter READY, không preload ngay lúc mở website.
- Nếu dùng Canvas: preload ImageBitmap/WebP rồi `drawImage()` 1 frame/lần.
- Với `prefers-reduced-motion`, hiển thị thẳng frame 060.

## Độ chính xác
Sequence được tạo từ **một contact sheet duy nhất của cùng một subject**, nên continuity tốt hơn hẳn 5 ảnh rời trước đó và cánh hoa mở dần qua 60 trạng thái. Tuy nhiên đây là asset AI/synthetic, **không phải timelapse sinh học quay từ hoa thật**. Nếu cần độ chính xác thực vật tuyệt đối, phải dùng frame sequence tách từ một timelapse thật.
