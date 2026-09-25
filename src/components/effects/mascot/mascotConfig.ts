import type { ChapterId } from "@/chapters/types";

export type MascotAccessory = "pilot" | "flower" | "envelope-red" | "letter" | "camera" | "heart" | "party";
export interface MascotSceneConfig {
  name: string;
  accessory: MascotAccessory;
  side: "left" | "right";
  messages: readonly string[];
}

export const MASCOT_SCENES: Record<ChapterId, MascotSceneConfig> = {
  hero: { name: "Heo phi công", accessory: "pilot", side: "left", messages: ["Tui bay từ Sài Gòn ra, mang cả thương nhớ tới meo nè!", "Sẵn sàng chưa? Câu chuyện của tụi mình bắt đầu nha."] },
  flowers: { name: "Heo làm vườn", accessory: "flower", side: "left", messages: ["Chờ hoa thức dậy, rồi tui tặng hết cho em.", "Meo là bông hoa tui thương nhất!"] },
  wallet: { name: "Heo giữ quỹ", accessory: "envelope-red", side: "right", messages: ["Quỹ chiều em đã sẵn sàng!", "Mở ví đi meo, còn mấy món quà nhỏ nữa đó."] },
  letter: { name: "Heo đưa thư", accessory: "letter", side: "right", messages: ["Tui gửi một chút lòng mình trong lá thư này.", "Cứ đọc chậm thôi, tui ngồi đây với em."] },
  moments: { name: "Heo chụp ảnh", accessory: "camera", side: "left", messages: ["Cười lên meo ơi… tách!", "Chạm từng tấm ảnh để mở lại kỷ niệm nha."] },
  anniversary: { name: "Heo ôm thương nhớ", accessory: "heart", side: "right", messages: ["Từ 11.01.2025, ngày nào cũng có em trong lòng.", "Mình còn nhiều ngày đẹp phía trước lắm."] },
  finale: { name: "Heo mừng sinh nhật", accessory: "party", side: "left", messages: ["Nhắm mắt, ước một điều thật đẹp nha em.", "Chúc meo tuổi mới luôn được yêu thương!"] },
};
