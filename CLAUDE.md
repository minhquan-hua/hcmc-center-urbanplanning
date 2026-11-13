# Sa bàn quy hoạch TP.HCM

Website tĩnh giúp sinh viên quy hoạch/kiến trúc tìm hiểu quy hoạch khu trung tâm TP.HCM:
Quận 1 cũ, Thủ Thiêm và các khu liền kề (Quận 3, Quận 4, Bình Thạnh, Quận 2 cũ).

## Cách làm việc với chủ dự án

- Chủ dự án KHÔNG biết lập trình, dùng Windows 11. Giải thích bằng tiếng Việt, ngắn, tránh thuật ngữ.
- Làm từng giai đoạn. Trước mỗi giai đoạn: nêu kế hoạch ngắn và chờ đồng ý.
- Khi cần chủ dự án làm gì: hướng dẫn từng bước, mỗi lần một việc.
- Tự kiểm tra trước khi nhờ xem: mở website, thử cỡ laptop và điện thoại, báo trung thực.
- Sau mỗi giai đoạn: website chạy được; commit git; cập nhật file này.
- Lựa chọn ảnh hưởng nội dung/độ chính xác: hỏi. Lựa chọn thuần kỹ thuật: tự quyết và ghi vào mục "Quyết định".
- Không thêm tính năng ngoài danh sách khi chưa hỏi.

## Người dùng

- Sinh viên quy hoạch/kiến trúc: mở trên điện thoại và laptop, không cài đặt, không đăng nhập.
- Giảng viên chiếu trên lớp: cần "chế độ trình chiếu" chữ to.
- Chủ dự án: cập nhật nội dung bằng cách sửa file trong `data/`, không sửa code.

## Tính năng (theo thứ tự ưu tiên)

1. Bản đồ nền: tòa nhà 3D, sông rạch, mạng đường.
2. Lớp hành chính: phường mới từ 1/7/2025 và quận/phường cũ; nút "Trước 2025 / Sau 2025"; nhấp vào phường mới thấy tên, gộp từ phường cũ nào, nguồn.
3. Lớp dự án quy hoạch: cầu, hầm, metro, đường, công viên, khu đô thị; tên, loại, trạng thái (đã hoàn thành / đang thi công / đã phê duyệt / đề xuất), mốc thời gian, mô tả, link nguồn, ngày cập nhật; thêm thông tin chuyên ngành (quy mô, chủ đầu tư, văn bản phê duyệt) khi có nguồn; lọc theo loại và trạng thái.
4. Giao thông đường bộ (hoạt hình minh họa): xe máy, ô tô, xe buýt trên trục đường chính; cao điểm / thấp điểm; so sánh có / không có cầu mới.
5. Giao thông thủy (hoạt hình minh họa): buýt sông, phà, tàu hàng; tuyến và bến.
6. Chế độ học: 2-3 tour dẫn từng bước kèm câu hỏi gợi mở; nội dung nằm trong file dữ liệu.

## Không làm

- Không đăng nhập, không máy chủ, không cơ sở dữ liệu, không dịch vụ trả phí, không API key.
- Không dữ liệu giao thông thời gian thực; không gọi mô phỏng là dự báo.

## Quy tắc dữ liệu (quan trọng nhất)

- Bản đồ nền, đường, tòa nhà, sông: OpenStreetMap, ghi nguồn ODbL trên giao diện.
- Hành chính và dự án: KHÔNG bịa, không điền theo trí nhớ. Tra từ nguồn chính thức và báo chí uy tín; mỗi mục có link nguồn cụ thể.
- Ranh giới phường mới: không tìm được file đáng tin thì DỪNG, báo các phương án. Không tự vẽ áng chừng.
- Mỗi mục có `nguon`, `ngay_cap_nhat`, `da_kiem_chung` (có / cần kiểm chứng). Cuối mỗi giai đoạn dữ liệu, đưa danh sách "cần kiểm chứng" cho chủ dự án duyệt. Mục chưa kiểm chứng có nhãn riêng trên website.
- Con số giả định của mô phỏng nằm trong file riêng ở `data/giao_thong/`, ghi nguồn hoặc "giả định minh họa". Giao diện luôn hiện: "Mô phỏng minh họa cho mục đích học tập, không phải số liệu thực".
- Sửa sai định dạng file dữ liệu thì website báo lỗi dễ hiểu bằng tiếng Việt, không trắng trang.
- Các dự án gợi ý để tra cứu (chưa phải dữ kiện): cầu Ba Son, cầu Thủ Thiêm 1-4, cầu đi bộ qua sông Sài Gòn, hầm Thủ Thiêm, metro số 1 và số 2.

## Kỹ thuật

- HTML + JavaScript thuần, không có bước build, không cần Node. Thư viện tải từ CDN.
- MapLibre GL JS; nền OpenFreeMap (không cần key); deck.gl cho xe và tàu.
- Python 3.12 xử lý dữ liệu (gọi bằng `py`). Git 2.56. Cả hai cài bằng winget ngày 13/11/2026.
- `xem_thu.bat`: bấm đúp để xem website trên máy. `cap_nhat_du_lieu.bat`: bấm đúp để xử lý lại toàn bộ dữ liệu.
- Song ngữ Việt + Anh: dữ liệu có cột `_vi` và `_en`; cột `_en` trống thì hiện tiếng Việt. Chữ giao diện nằm trong `data/ngon_ngu/`.
- Thiết kế cho điện thoại trước; tự giới hạn số xe/tàu theo thiết bị.
- Cuối dự án đưa lên GitHub Pages hoặc Netlify.

## Cấu trúc thư mục

```
CLAUDE.md                 trí nhớ dự án
HUONG_DAN_CAP_NHAT.md     hướng dẫn sửa nội dung (viết ở giai đoạn 2-3, hoàn thiện ở 7)
xem_thu.bat               (giai đoạn 1)
cap_nhat_du_lieu.bat      (giai đoạn 2)
index.html                (giai đoạn 1)
src/                      code giao diện
scripts/                  code Python xử lý dữ liệu
data/
  hanh_chinh/             ranh giới phường cũ/mới, bảng gộp phường
  du_an/                  danh sách dự án (CSV) và hình dạng (GeoJSON)
  giao_thong/             giả định mô phỏng, tuyến và bến thủy
  tour/                   nội dung các tour học
  ngon_ngu/               chữ giao diện Việt và Anh
```

## Giai đoạn

- [x] 0. Chuẩn bị: hỏi chủ dự án, cài Git/Python, khung dự án, CLAUDE.md
- [ ] 1. Bản đồ nền 3D + khung giao diện (có nút đổi ngôn ngữ và chế độ trình chiếu)
- [ ] 2. Lớp hành chính Trước/Sau 2025 (tra cứu dữ liệu ranh giới TRƯỚC khi viết code, báo kết quả)
- [ ] 3. Lớp dự án quy hoạch + bộ lọc
- [ ] 4. Giao thông đường bộ
- [ ] 5. Giao thông thủy
- [ ] 6. Chế độ học (tour)
- [ ] 7. Hoàn thiện, thử trên điện thoại thật, đưa lên mạng, bàn giao hướng dẫn

## Quyết định

- 13/11/2026: Không dùng bước build hay Node, để chủ dự án ít phải cài đặt và dễ đưa lên mạng.
- 13/11/2026: Song ngữ Việt + Anh theo yêu cầu chủ dự án; tiếng Việt là bản gốc.
- 13/11/2026: Rủi ro lớn nhất là ranh giới phường mới. Phương án dự phòng: ghép từ ranh giới phường cũ theo nghị quyết, phường bị chia tách đánh dấu "cần kiểm chứng". Phải hỏi chủ dự án trước khi chọn.

## Việc còn mở

- Chưa có tài khoản GitHub (cần ở giai đoạn 7).
