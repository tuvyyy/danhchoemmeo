# Dành cho em Meo

Website sinh nhật dùng React, TypeScript và Vite.

```sh
npm install
npm run dev
npm run typecheck
npm run build
```

Dev server: `http://localhost:3333`. Chạy bản build với `npm run preview -- --port 3334`.

- `src/`: giao diện, nội dung và hiệu ứng của 7 chương.
- `public/assets/`: tài nguyên đang dùng. Giữ đủ 60 khung hoa vì đường dẫn được tạo động.
- `tests/`: kiểm tra tương tác và chuyển chương hiện tại.
- `.agents/`: hướng dẫn và công cụ hỗ trợ phát triển dự án.

Kiểm tra toàn bộ hành trình trên bản build, không chụp ảnh (PowerShell):

```powershell
$env:NO_CAPTURE='1'
$env:TEST_URL='http://127.0.0.1:3334'
node tests/finale-workflow.mjs smoke
node tests/finale-workflow.mjs smoke --mobile
node tests/letter-bloom.mjs
```

`node_modules/`, `dist/` và `docs/` là thư viện hoặc kết quả được sinh lại, không đưa vào Git.
