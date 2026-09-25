# Dành cho em Meo

Ứng dụng React + TypeScript + Vite. Chạy lệnh tại thư mục gốc dự án.

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

Ảnh chụp và báo cáo kiểm thử trong `docs/screenshots/` được sinh lại khi chạy script và đã được bỏ qua trong Git. `dist/` là kết quả build, `node_modules/` là thư viện cài đặt.

Bản prototype Figma cũ, các bộ ảnh nhập trùng, component không còn được import và bản design preview đã bị loại đã được dọn khỏi dự án. Giữ các ghi chú phản hồi thiết kế trong `docs/DESIGN_PREVIEW.md`.
