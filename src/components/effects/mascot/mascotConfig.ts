import type { ChapterId } from "@/chapters/types";

export type MascotAccessory = "pilot" | "flower" | "envelope-red" | "letter" | "camera" | "heart" | "party";
export interface MascotSceneConfig {
  name: string;
  accessory: MascotAccessory;
  side: "left" | "right";
  messages: readonly string[];
}

export const MASCOT_SCENES: Record<ChapterId, MascotSceneConfig> = {
  hero: { name: "Heo phi công", accessory: "pilot", side: "left", messages: ["Meo ơi, bấm “Bắt đầu câu chuyện” để xem món quà nha!", "Tui bay từ Sài Gòn ra, mang cả thương nhớ tới meo nè!"] },
  flowers: { name: "Heo làm vườn", accessory: "flower", side: "left", messages: ["Hai bé mèo đang hẹn hò nè. Ngắm một chút rồi cuộn xuống xem quà nha em!", "Meo là bông hoa tui thương nhất!"] },
  wallet: { name: "Heo mang quà", accessory: "envelope-red", side: "left", messages: ["Chạm dấu sáp để mở quà nha meo! Chạm lại là khép thư nè.", "Bốn lời hẹn nhỏ trong thư, meo chạm từng voucher để xem nha."] },
  letter: { name: "Heo đưa thư", accessory: "letter", side: "right", messages: ["Chạm “Đọc rõ hơn” để đọc thư nha. Có hai trang dành riêng cho em đó.", "Cứ đọc chậm thôi, tui ngồi đây với em."] },
  moments: { name: "Heo chụp ảnh", accessory: "camera", side: "left", messages: ["Cười lên meo ơi… tách!", "Chạm từng tấm ảnh để mở lại kỷ niệm nha."] },
  anniversary: { name: "Heo ôm thương nhớ", accessory: "heart", side: "right", messages: ["Chạm từng dấu mốc để đọc chuyện tụi mình nha. Tui giữ hết ở đây nè!", "Mình còn nhiều ngày đẹp phía trước lắm."] },
  finale: { name: "Heo mừng sinh nhật", accessory: "party", side: "left", messages: ["Nhắm mắt, ước một điều thật đẹp. Rồi bấm “Thổi nến” nha em!", "Chúc meo tuổi mới luôn được yêu thương!"] },
};
