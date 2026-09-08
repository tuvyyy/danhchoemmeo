export interface MomentItem {
  src: string;
  caption: string;
  rot: number;
}

export interface GiftCardData {
  id: string;
  badge: string;
  title: string;
  subtitle: string;
  description: string;
  finePrint: string;
  colorTheme: "rose" | "gold" | "emerald" | "wine";
  icon: string;
}

export const BIRTHDAY_DATA = {
  meta: {
    title: "Chúc Mừng Sinh Nhật Em 🤍",
    dateFormatted: "10 · 11 · 2003",
    dateShort: "10.11",
  },
  steps: ["Mở đầu", "Hoa", "Lì xì", "Lá thư", "Khoảnh khắc", "Ước"],
  hero: {
    quote: "“Tui phi từ Nam ra Bắc, tui mang tình yêu từ Sài Gòn đến mèo đây hayyaaaaaa~” 🐷💨",
    headingPrefix: "Chúc mừng",
    headingHighlight: "sinh nhật",
    date: "10 · 11 · 2003",
    cta: "Bắt đầu hành trình",
  },
  flowers: {
    chapter: "Chương 01",
    loadingStatus: "hoa đang nở…",
    cta: "Món quà nhỏ tiếp theo",
    quadMessages: [
      {
        id: "top-left",
        tag: "01",
        line1: "Gặp được em,",
        line2: "là điều dịu dàng nhất trên đời.",
      },
      {
        id: "top-right",
        tag: "02",
        line1: "Chúc em tuổi mới,",
        line2: "luôn rực rỡ và bình yên.",
      },
      {
        id: "bottom-left",
        tag: "03",
        line1: "Dù cách nhau bao xa,",
        line2: "tim anh vẫn luôn ở cạnh em.",
      },
      {
        id: "bottom-right",
        tag: "04",
        line1: "Cảm ơn em vì đã đến,",
        line2: "chúc mừng sinh nhật em yêu 🤍",
      },
    ],
  },
  wallet: {
    chapter: "Chương 02 — Lì xì sinh nhật",
    walletTag: "quỹ chiều em",
    heading: "Tui không ở cạnh để dẫn em đi ăn,",
    subtitle: "nên gửi trước một chút — em muốn gì thì cứ mua nha 💸",
    openPrompt: "chạm để mở ví ✨",
    messagePrefix: "Coi như tui đang ngồi đối diện, dúi vào tay em và nói:",
    messageHighlight: " “Thích gì mua nấy, đừng tiết kiệm nha.”",
    cta: "Có thứ này quan trọng hơn",
    cardsPrompt: "chạm vào từng voucher để xem chi tiết nha 👇",
    cards: [
      {
        id: "card-food",
        badge: "VOUCHER 01",
        title: "Ăn gì cũng được",
        subtitle: "Áp dụng bất kể ngày đêm",
        description: "Em muốn ăn đồ nướng, lẩu thái, bún bò, hay thèm trà sữa lúc nửa đêm... tui đều đi mua hoặc nấu cho em ăn hết!",
        finePrint: "Hạn sử dụng: Suốt đời • Không giới hạn số lần",
        colorTheme: "rose",
        icon: "🍜",
      },
      {
        id: "card-trip",
        badge: "VOUCHER 02",
        title: "Đi đâu cũng được",
        subtitle: "Chỉ cần em muốn là mình xách vali",
        description: "Lên Đà Lạt ngắm sương mù, ra biển ngắm hoàng hôn, hay chỉ đơn giản là lượn xe dạo phố hóng gió cùng nhau.",
        finePrint: "Tài xế & hướng dẫn viên kiêm xách đồ: Tui",
        colorTheme: "gold",
        icon: "✈️",
      },
      {
        id: "card-shopping",
        badge: "VOUCHER 03",
        title: "Em thích gì tui mua",
        subtitle: "Quẹt thẻ không cần nhìn giá",
        description: "Son môi mới, chiếc váy xinh, hay món đồ em thích từ lâu... cứ chọn đi nha, phần thanh toán đã có quỹ lo!",
        finePrint: "Mã giảm giá: 100% tài trợ bởi tình yêu",
        colorTheme: "emerald",
        icon: "🛍️",
      },
      {
        id: "card-hug",
        badge: "VOUCHER ĐẶC BIỆT",
        title: "Hết giận ngay lập tức",
        subtitle: "Vé ôm & dỗ dành vô điều kiện",
        description: "Bất cứ khi nào em dỗi, mệt mỏi hay tủi thân, kích hoạt voucher này tui sẽ ôm em thật chặt và dỗ đến khi em cười mới thôi.",
        finePrint: "Có hiệu lực ngay cả khi tui là người làm em giận 🤍",
        colorTheme: "wine",
        icon: "🫂",
      },
    ] as GiftCardData[],
  },
  letter: {
    chapter: "Chương 03",
    coverTitle: "for you",
    coverDate: "10.11",
    openPrompt: "chạm để mở ↗",
    zoomBtn: "⤢ phóng to",
    closeBtn: "đóng thư",
    shrinkBtn: "thu nhỏ ✕",
    cta: "Nhớ lại tụi mình",
    placeholders: {
      leftScan: "https://images.unsplash.com/photo-1561812938-f6e60cbf95e3?w=900&h=1200&fit=crop&auto=format",
      rightScan: "https://images.unsplash.com/photo-1730342754571-93f5462e6d2f?w=900&h=1200&fit=crop&auto=format",
      faintFlower: "https://images.unsplash.com/photo-1623183074617-90611646e4ca?w=700&h=900&fit=crop&auto=format",
    },
  },
  moments: {
    chapter: "Chương 04 — Khoảnh khắc của mình",
    heading: "Khoảng cách xa, nhưng kỷ niệm thì luôn gần.",
    subtitle: "Lật từng tấm hình để nhớ lại nha.",
    tapPrompt: "chạm 👆",
    cta: "Điều cuối tui muốn nói",
    items: [
      {
        src: "https://images.unsplash.com/photo-1615966650071-855b15f29ad1?w=800&h=800&fit=crop&auto=format",
        caption: "Lần đầu mình nắm tay",
        rot: -6,
      },
      {
        src: "https://images.unsplash.com/photo-1591969851586-adbbd4accf81?w=800&h=800&fit=crop&auto=format",
        caption: "Buổi tối gọi video tới sáng",
        rot: 4,
      },
      {
        src: "https://images.unsplash.com/photo-1542460533-50ac46fb13d7?w=800&h=800&fit=crop&auto=format",
        caption: "Hoàng hôn mình từng hứa sẽ ngắm cùng",
        rot: -3,
      },
      {
        src: "https://images.unsplash.com/photo-1640273296013-e4b54eaf52eb?w=800&h=800&fit=crop&auto=format",
        caption: "Và rất nhiều khoảnh khắc phía trước",
        rot: 7,
      },
    ] as MomentItem[],
  },
  finale: {
    chapter: "Chương 05 — Ước một điều nha",
    heading: "Thổi nến và ước đi em,",
    subtitle: "năm nay để tui lo phần còn lại.",
    candlePrompt: "chạm để thổi nến ✨",
    shimmerTitle: "Chúc mừng sinh nhật em",
    quote: "Cảm ơn em vì đã yêu tui, kể cả khi mình cách nhau cả một khoảng trời.",
    body: "Khoảng cách chỉ là tạm thời. Còn tui thương em thì lâu dài lắm. Hẹn ngày mình được thổi nến chung một cái bánh nha. 🤍",
    footerBadge: "10 · 11 · 2003 — mãi thương",
  },
};
