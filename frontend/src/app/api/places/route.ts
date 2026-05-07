import { NextResponse } from 'next/server';
import axios from 'axios';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const q = searchParams.get('q');
  
  if (!q) return NextResponse.json([]);

  // Ưu tiên dùng Goong API (rất thông minh cho địa chỉ VN, có gói Free)
  const goongKey = process.env.NEXT_PUBLIC_GOONG_API_KEY || process.env.GOONG_API_KEY;
  const googleKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || process.env.GOOGLE_MAPS_API_KEY;

  if (!goongKey && !googleKey) {
    // Fallback về OpenStreetMap (Miễn phí, không cần Key nhưng ít chi tiết nhà cụ thể)
    try {
      // Bỏ tự động thêm "Hà Nội" để khách có thể tìm kiếm ở tất cả các tỉnh thành
      const smartQuery = q;

      const res = await axios.get(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(smartQuery)}&countrycodes=vn&limit=5&addressdetails=1`, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
        }
      });
      
      const results = res.data.map((r: any) => ({
        display_name: r.display_name.replace(', Việt Nam', ''), // Xóa chữ Việt Nam cho gọn
        lat: parseFloat(r.lat),
        lon: parseFloat(r.lon),
      }));
      return NextResponse.json(results);
    } catch (error) {
      return NextResponse.json([
        { 
          display_name: "⚠️ Đang tìm kiếm... Nếu lỗi, vui lòng thử lại tên đường cụ thể hơn.", 
          lat: 21.028511, 
          lon: 105.804817 
        }
      ]);
    }
  }

  try {
    if (goongKey) {
      // Dùng Goong Maps (Tuyệt vời cho Việt Nam)
      const res = await axios.get(`https:// rsapi.goong.io/Place/AutoComplete?api_key=${goongKey}&input=${encodeURIComponent(q)}`);
      
      if (!res.data.predictions) return NextResponse.json([]);

      // Lấy tọa độ chi tiết cho 5 kết quả đầu tiên
      const results = await Promise.all(res.data.predictions.slice(0, 5).map(async (p: any) => {
        const detailRes = await axios.get(`https://rsapi.goong.io/Place/Detail?place_id=${p.place_id}&api_key=${goongKey}`);
        const location = detailRes.data.result.geometry.location;
        return {
          display_name: p.description,
          lat: location.lat,
          lon: location.lng,
        };
      }));
      return NextResponse.json(results);
    } 
    
    if (googleKey) {
      // Dùng Google Maps
      const res = await axios.get(`https:// maps.googleapis.com/maps/api/place/textsearch/json?query=${encodeURIComponent(q)}&key=${googleKey}&khu vực=vn&lingu=vi`);
      const results = res.data.results.map((r: any) => ({
        display_name: r.name + (r.formatted_address ? `, ${r.formatted_address}` : ''),
        lat: r.geometry.location.lat,
        lon: r.geometry.location.lng,
      }));
      return NextResponse.json(results.slice(0, 5));
    }

  } catch (error) {
    console.error("Map API Error:", error);
    return NextResponse.json([
      { 
        display_name: "⚠️ Lỗi kết nối API Bản đồ (Kiểm tra lại Key)", 
        lat: 21.028511, 
        lon: 105.804817 
      }
    ]);
  }
}
