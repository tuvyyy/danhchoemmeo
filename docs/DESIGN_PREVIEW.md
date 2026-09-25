# Bốn khung thiết kế tĩnh — 24.09.2026

> **Đã bị người dùng loại. Không dùng làm hướng triển khai.** Người dùng không thích màu và bố cục của cả bốn bản mẫu; giao diện chính đang chạy local là chuẩn thẩm mỹ cần bám theo.

## Điều chỉnh hướng sau phản hồi

- Lấy màu, kiểu chữ, ánh sáng và bố cục toàn màn hình từ các section React hiện tại. Không suy ra rằng người dùng thích bảng màu của bản mẫu từ các yêu cầu “đẹp hơn”, “3D” hay “đặc sắc”.
- Nâng cấp từng đối tượng và thao tác ngay trong ngữ cảnh chương hiện tại. Không mang hộp quà, phong bì hoặc bánh raster của bản mẫu vào trang chính.
- Phản hồi mới xác nhận thích phong cách tổng thể của trang local; không có nghĩa là đã chấp nhận chiếc ví, lưới ảnh hay bánh CSS cũ từng bị chê.
- Mở đầu vẫn cần phương án không dùng ảnh đôi theo yêu cầu trước đó, nhưng phong cách phải xuất phát từ hero hiện tại.
- Hoa và Tụi mình đã được người dùng đánh giá ổn. Yêu cầu tương tác ở quà, ảnh và thổi nến vẫn còn.
- Lần xem tiếp theo nên tập trung một màn trong giao diện hiện tại để kiểm tra đúng gu trước khi mở rộng sang các màn còn lại.

Xem tại `/design-preview/index.html` khi chạy `npm run dev`. Bố cục HTML/CSS riêng, không thay đổi hành trình React hiện tại. Thanh điều hướng dùng được; các nút trong khung là mẫu tĩnh, chưa thực hiện mở quà, chọn voucher hay thổi nến.

## Khung hình

- Mở đầu: nền xanh đêm, hộp quà champagne và nơ satin hồng; không có ảnh đôi.
- Quà: phong bì giấy cotton, dấu sáp trái tim và vé trải nghiệm. Không gán số tiền chưa xác nhận.
- Album: quyển album giấy mở, một ảnh thật hiện có, chỗ trống cho những trang tiếp theo; không dùng ảnh người lạ.
- Bánh: bánh tim kem vintage, cherry, nến đơn trên đĩa sứ.

Ảnh sinh bằng công cụ image_gen tích hợp (không dùng CLI), lưu tại `public/design-preview/assets/{gift,envelope,cake}.png`. Ảnh đôi sao chép nguyên bản từ `src/assets/hero/couple-original-tone.png`. Chưa tách lớp vật thể để chuyển động; việc đó thuộc bước sau khi chọn thiết kế. Hình raster không phải mô hình 3D tương tác.

## Kiểm tra

- Đã chụp và xem 4 khung ở 1440px, 390px và 360px; ảnh tại `docs/screenshots/design-preview/`.
- Bảng tổng hợp: `docs/screenshots/design-preview/index.html` và `overview.png`.
- Không tràn ngang, ảnh tải đủ, không lỗi console/page, không có animation đang chạy; thanh điều hướng tới Album hoạt động.
- Mobile cho phép cuộn dọc tự nhiên với khung Quà, Album và Bánh để giữ cỡ hình và chữ. Bản tĩnh Quà minh họa 3 vé trên desktop và 2 vé trên mobile; danh sách voucher đầy đủ sẽ được nối khi làm tương tác.
- `npm run typecheck` và `npm run build` đều đạt.
- Tái chụp bằng `node docs/capture-design-preview.mjs` khi dev server đang ở cổng 3333.

## Prompt tạo ảnh

### gift

Use case: product-mockup. Asset type: luxury birthday website hero object, square 1024x1024.
Primary request: a beautiful champagne ivory square gift box with soft rounded edges, large sculptural dusty rose silk ribbon bow and long ribbon tails, a tiny golden cat-shaped charm attached to bow. Box fully closed, three-quarter camera slightly above, elegant physically plausible proportions, extremely tactile matte paper and satin folds. Full object centered taking 75% of square, generous clear space around all edges. No people. Midnight blue seamless studio background exact base #111c30, warm peach studio spotlight, subtle soft floor contact shadow; edges of image fade to uniform midnight blue. Premium whimsical art direction, realistic 3D product render, sophisticated editorial packaging. No text, no logo, no extra floating objects, no sparkles, no cropped ribbon, no UI. One object only.

### envelope

Use case: product-mockup. Asset type: premium birthday gift website object, square 1024x1024.
Primary request: an exquisite closed ivory cotton paper envelope with triangular flap facing camera, beautiful round dusty-rose wax seal embossed with a tiny heart, a thin blush satin ribbon passing behind it and curling gently on table. Slightly angled landscape envelope, three-quarter overhead camera, substantial handmade paper edges and subtle paper grain. Full envelope centered taking 78% of square with space all around. Seamless warm cream tabletop exact base #f5eee4, gentle directional afternoon light, elegant realistic contact shadow. Photorealistic premium stationery editorial photography, warm cream and rose palette. No flowers, no pen, no people, no text, no numbers, no logos, no UI, no cropped object.

### cake

Use case: product-mockup. Asset type: beautiful birthday cake website centerpiece, square 1024x1024.
Primary request: one elegant heart-shaped vintage birthday cake on a thin ivory porcelain pedestal plate. Soft pale blush pink buttercream, intricate piped ivory scallops and shell borders with realistic fine ridges, six glossy deep red cherries with natural stems neatly arranged around heart border. One slender pale rose birthday candle in center, small realistic golden flame, visible wax and wick. Camera three-quarter above showing unmistakable heart-shaped top. Cake fully visible including plate, centered occupying 78% of square. Seamless warm blush studio table/background exact base #faeee9; soft window light upper left, sophisticated natural soft shadows and photographic details. High-end patisserie editorial product photography, romantic refined styling, not childish. No text, no numerals, no sprinkles, no hands, no people, no extra props, no floating hearts, no UI.B?n HTML/CSS, ?nh minh h?a, script ch?p v? ?nh ch?p c?a ph??ng ?n ?? b? lo?i ???c d?n kh?i d? ?n ng?y 25.09.2026. Gi? l?i ghi ch? ph?n h?i ? tr?n ?? tr?nh l?p l?i h??ng thi?t k? n?y.
