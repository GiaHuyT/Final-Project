export const BANNED_WORDS = [
  "đm",
  "địt",
  "dit",
  "cặc",
  "đồ khốn",
  "mẹ mày",
  "fuck",
  "shit",
  "bitch",
  "đồ chó",
  "ngu như bò",
  "đồ điên",
  "đồ rác rưởi",
  "thằng chó",
  "con đĩ",
  "đồ mất dạy",
  "ma túy",
  "chất gây nghiện",
  "thuốc lắc",
  "cần sa",
  "heroin",
  "cocaine",
  "vũ khí",
  "súng đạn",
  "bom mìn",
  "chất nổ",
  "động vật hoang dã",
  "ngà voi",
  "sừng tê giác",
  "hàng giả",
  "hàng nhái",
  "tiền giả",
  "mại dâm",
  "dịch vụ tình dục",
  "khiêu dâm trẻ em",
  "pháo nổ",
  "pháo hoa trái phép",
  "thuốc lá lậu",
  "thuốc lá điện tử",
  "shisha chứa nicotin",
  "vay nóng",
  "cầm đồ lãi cao",
  "hỗ trợ bùng nợ",
  "hack like",
  "thuê like",
  "buff mắt live",
  "bán nick",
  "tool spam",
  "via clone",
  "thuê sim rác",
  "bảo hành trọn đời không điều kiện",
  "thuê người đánh giá 5 sao",
  "bán đơn hoàn tiền",
  "chữa khỏi 100%",
  "khỏi bệnh ngay lập tức",
  "thần dược",
  "cam kết chữa khỏi ung thư",
  "không tác dụng phụ"
];

// Hàm loại bỏ dấu tiếng Việt
function removeVietnameseTones(str: string): string {
  str = str.replace(/à|á|ạ|ả|ã|â|ầ|ấ|ậ|ẩ|ẫ|ă|ằ|ắ|ặ|ẳ|ẵ/g, "a");
  str = str.replace(/è|é|ẹ|ẻ|ẽ|ê|ề|ế|ệ|ể|ễ/g, "e");
  str = str.replace(/ì|í|ị|ỉ|ĩ/g, "i");
  str = str.replace(/ò|ó|ọ|ỏ|õ|ô|ồ|ố|ộ|ổ|ỗ|ơ|ờ|ớ|ợ|ở|ỡ/g, "o");
  str = str.replace(/ù|ú|ụ|ủ|ũ|ư|ừ|ứ|ự|ử|ữ/g, "u");
  str = str.replace(/ỳ|ý|ỵ|ỷ|ỹ/g, "y");
  str = str.replace(/đ/g, "d");
  str = str.replace(/À|Á|Ạ|Ả|Ã|Â|Ầ|Ấ|Ậ|Ẩ|Ẫ|Ă|Ằ|Ắ|Ặ|Ẳ|Ẵ/g, "A");
  str = str.replace(/È|É|Ẹ|Ẻ|Ẽ|Ê|Ề|Ế|Ệ|Ể|Ễ/g, "E");
  str = str.replace(/Ì|Í|Ị|Ỉ|Ĩ/g, "I");
  str = str.replace(/Ò|Ó|Ọ|Ỏ|Õ|Ô|Ồ|Ố|Ộ|Ổ|Ỗ|Ơ|Ờ|Ớ|Ợ|Ở|Ỡ/g, "O");
  str = str.replace(/Ù|Ú|Ụ|Ủ|Ũ|Ư|Ừ|Ứ|Ự|Ử|Ữ/g, "U");
  str = str.replace(/Ỳ|Ý|Ỵ|Ỷ|Ỹ/g, "Y");
  str = str.replace(/Đ/g, "D");
  return str;
}

// Tự động sinh ra các phiên bản không dấu của từ khóa cấm
const unaccentedWords = BANNED_WORDS.map(word => removeVietnameseTones(word));

// Lọc bỏ từ "cac" vì nó có thể bị nhầm với "các" (các bạn, các anh)
const safeUnaccentedWords = unaccentedWords.filter(word => word !== "cac");

// Gộp cả từ có dấu và không dấu lại, loại bỏ trùng lặp
const ALL_BANNED_WORDS = Array.from(new Set([...BANNED_WORDS, ...safeUnaccentedWords]));

// Tạo regex với ranh giới từ (word boundary) cho Unicode
const escapeRegExp = (string: string) => string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
const pattern = ALL_BANNED_WORDS.map(escapeRegExp).join('|');

// Dùng \p{L} (letters) và \p{N} (numbers) để giới hạn từ (Unicode word boundary)
const bannedWordsRegex = new RegExp(`(^|[^\\p{L}\\p{N}])(${pattern})([^\\p{L}\\p{N}]|$)`, 'giu');

export function containsBannedWords(text: string): boolean {
  if (!text || typeof text !== 'string') return false;
  bannedWordsRegex.lastIndex = 0; // Reset regex state
  return bannedWordsRegex.test(text);
}

export function scanObjectForBannedWords(obj: any): boolean {
  if (!obj) return false;
  
  if (typeof obj === 'string') {
    return containsBannedWords(obj);
  }
  
  if (typeof obj === 'object') {
    for (const key in obj) {
      if (Object.prototype.hasOwnProperty.call(obj, key)) {
        if (scanObjectForBannedWords(obj[key])) {
          return true;
        }
      }
    }
  }
  
  return false;
}
