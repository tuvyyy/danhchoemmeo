# Dành cho em Meo

Ứng dụng React + TypeScript + Vite. Chạy lệnh tại thư mục gốc dự án.

Cổng mở đầu hiện tại dẫn vào màn nền trắng có hoa/mèo hiện theo con trỏ và nút chuyển sang hoa nền đen. Sau màn này mới đến chương vườn video và các phần còn lại. Cổng tự mở/đóng khi rê chuột; trên điện thoại, chạm cổng để xem mở/đóng và bấm “Bước vào câu chuyện” để vào màn trắng. Xem [ghi chú khôi phục](docs/RESTORED_ENTRANCE.md).

```sh
npm run dev
npm run typecheck
npm run build
```

- `src/`: mã nguồn giao diện, hiệu ứng và nội dung.
- `public/assets/flowers/`: 60 khung WebP hoa ly, 6 khung WebP tulip và 2 ảnh cỏ đang dùng. Giữ đủ các khung vì đường dẫn được tạo động.
- `src/assets/hero/couple-original-tone.png`: ảnh đôi đang dùng ở phần mở đầu.
- `docs/`: hướng dẫn và ghi chú thiết kế; `BASELINE.md` là tài liệu lịch sử.
- `test-*.js`: các script kiểm thử trình duyệt. Kiểm thử hành trình hiện tại: `node test-scene-journey.js`, cần dev server ở cổng 3333 và Chrome.

Kiểm tra hành trình mới từ cổng vườn đến thổi nến (Chrome, dev server cổng 3333):

```sh
node tests/garden-gate-controls.mjs
node tests/finale-workflow.mjs review
node tests/finale-workflow.mjs review --mobile
node tests/finale-workflow.mjs reduced-fallback --reduced --missing-art
python tests/journey-sheets.py finale-review finale-review-mobile
```

Thêm `--record` để lưu video thổi nến (cần FFmpeg). Ảnh từng nhịp chuyển cảnh, ảnh trước/sau thổi nến và video nằm trong `docs/captures/finale-<nhãn>/` (thêm `-mobile` cho điện thoại). Bài kiểm tra bao gồm giữ vị trí bánh khi đổi lời chúc, focus bàn phím khi nút được thay thế, thắp lại nến, quay ngược chương, giữ điều ước khi vào lại và xem lại từ đầu.

Ảnh chụp và báo cáo kiểm thử trong `docs/screenshots/` được sinh lại khi chạy script và đã được bỏ qua trong Git. `dist/` là kết quả build, `node_modules/` là thư viện cài đặt.

Bản prototype Figma cũ, các bộ ảnh nhập trùng, component không còn được import và bản design preview đã bị loại đã được dọn khỏi dự án. Giữ các ghi chú phản hồi thiết kế trong `docs/DESIGN_PREVIEW.md`.
