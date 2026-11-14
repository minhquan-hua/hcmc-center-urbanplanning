# Hướng dẫn cập nhật nội dung

Viết cho người không biết lập trình. Bạn chỉ sửa các file trong thư mục `data/`.
Đừng sửa gì trong `src/` và `scripts/`.

## Ba việc cần nhớ

1. **Xem website trên máy:** bấm đúp `xem_thu.bat`. Một cửa sổ đen hiện ra và trình duyệt tự mở. Giữ cửa sổ đen mở trong lúc xem; đóng nó để tắt.
2. **Sau khi sửa file trong `data/hanh_chinh/`:** bấm đúp `cap_nhat_du_lieu.bat`. Chương trình kiểm tra file bạn vừa sửa và báo lỗi bằng tiếng Việt nếu có.
3. **Xem lại thay đổi:** quay lại trình duyệt và bấm Ctrl + F5.

## Cách mở và lưu file CSV

File `.csv` là bảng, mở bằng Excel.

- Khi lưu, chọn kiểu **CSV UTF-8 (Comma delimited)**. Nếu chọn kiểu CSV thường, chữ tiếng Việt sẽ bị lỗi.
- Không đổi tên cột ở dòng đầu tiên. Không xóa cột.
- Mỗi dòng là một mục. Thêm mục mới thì thêm một dòng ở cuối.

## Sửa chữ trên giao diện

File: `data/ngon_ngu/giao_dien.csv`

| Cột | Ý nghĩa |
|---|---|
| `ma` | Tên nội bộ của dòng chữ. **Không sửa.** |
| `vi` | Chữ tiếng Việt |
| `en` | Chữ tiếng Anh. Để trống thì website hiện tiếng Việt. |

Sửa file này không cần chạy `cap_nhat_du_lieu.bat`.

## Sửa thông tin phường mới

File: `data/hanh_chinh/phuong_moi.csv` (mỗi dòng là một phường mới)

| Cột | Ý nghĩa |
|---|---|
| `ma` | Mã phường, viết thường không dấu, nối bằng gạch ngang (ví dụ `sai-gon`). **Không sửa** mã đã có. |
| `ten_vi` | Tên phường, không có chữ "Phường" (ví dụ `Sài Gòn`). Phải đúng tên trên OpenStreetMap. |
| `ten_en` | Tên tiếng Anh |
| `khu_cu` | Quận cũ, dùng để tô màu. Một trong: `Quận 1`, `Quận 3`, `Quận 4`, `Quận Bình Thạnh`, `Thành phố Thủ Đức` |
| `khoan` | Số khoản trong Điều 1 của nghị quyết |
| `nguon` | Đường link nguồn, bắt đầu bằng `http` |
| `ngay_cap_nhat` | Ngày bạn kiểm tra lần cuối, dạng `2026-11-13` |
| `da_kiem_chung` | Thông tin gộp phường: `có` hoặc `cần kiểm chứng` |
| `hinh_dang_kiem_chung` | Hình dạng ranh giới: `có` hoặc `cần kiểm chứng` |
| `ghi_chu_vi`, `ghi_chu_en` | Ghi chú hiện trong thẻ thông tin (có thể để trống) |

Khi bạn đã đối chiếu hình dạng một phường với bản đồ chính thức, đổi `hinh_dang_kiem_chung` thành `có`. Nhãn đỏ trên website sẽ đổi thành nhãn xanh.

## Sửa bảng gộp phường

File: `data/hanh_chinh/gop_phuong.csv` (mỗi dòng là một phường cũ nhập vào một phường mới)

| Cột | Ý nghĩa |
|---|---|
| `phuong_moi` | Mã phường mới, phải có trong `phuong_moi.csv` |
| `phuong_cu` | Tên phường cũ đúng như nghị quyết (ví dụ `Bến Nghé`, `Phường 4`) |
| `quan_cu` | Quận cũ của phường đó |
| `phan` | Một trong: `toàn bộ`, `một phần`, `phần còn lại` |
| `ghi_chu` | Ghi chú (có thể để trống) |

Một phường cũ bị chia cho hai phường mới thì có hai dòng.

## Sửa thông tin dự án quy hoạch

File: `data/du_an/du_an.csv` (mỗi dòng là một dự án)

| Cột | Ý nghĩa |
|---|---|
| `ma` | Mã dự án, viết thường không dấu, nối bằng gạch ngang. **Không sửa** mã đã có. |
| `ten_vi`, `ten_en` | Tên tiếng Việt và tiếng Anh |
| `loai` | Một trong: `cầu`, `hầm`, `metro`, `đường`, `công viên`, `khu đô thị` |
| `trang_thai` | Một trong: `đã hoàn thành`, `đang thi công`, `đã phê duyệt`, `đề xuất` |
| `moc_thoi_gian_vi` | Các mốc thời gian, viết thành câu |
| `mo_ta_vi` | Mô tả ngắn: quy mô, nối từ đâu tới đâu |
| `chu_dau_tu` | Chủ đầu tư hoặc nguồn vốn (có thể để trống) |
| `van_ban` | Văn bản phê duyệt (có thể để trống) |
| `nguon` | Link nguồn, bắt đầu bằng `http`. Nhiều link thì ngăn bằng dấu ` | ` |
| `ngay_cap_nhat` | Ngày bạn kiểm tra lần cuối, dạng `2026-11-14` |
| `da_kiem_chung` | `có` hoặc `cần kiểm chứng` |
| `ghi_chu_vi` | Lưu ý hiện trong thẻ thông tin (có thể để trống) |

Việc hay làm nhất là **đổi trạng thái** khi dự án có tiến triển: sửa `trang_thai`, `moc_thoi_gian_vi`, `nguon`, `ngay_cap_nhat`, lưu file, rồi chạy `cap_nhat_du_lieu.bat`. Màu và kiểu nét trên bản đồ tự đổi theo.

Khi bạn đã mở bài gốc và thấy thông tin đúng, đổi `da_kiem_chung` thành `có`.

## Ví dụ: thêm một dự án mới

1. Mở `du_an.csv`, thêm một dòng ở cuối với một `ma` mới (ví dụ `cau-moi`). Lưu.
2. Mở `data/du_an/hinh_dang_nguon.csv`, thêm một dòng cho biết lấy vị trí ở đâu:
   - Chưa có hình dạng: `kieu` ghi `điểm sơ đồ`, `tham_so` ghi kinh độ và vĩ độ, ví dụ `106.7280,10.7822`. Để lấy hai số này, nhấp chuột phải vào vị trí trên Google Maps; số đầu là vĩ độ, số sau là kinh độ, nên bạn phải **đảo thứ tự** khi ghi vào file.
   - Đã có trên OpenStreetMap: nhờ Claude viết giúp dòng này.
3. Chạy `cap_nhat_du_lieu.bat` và đọc phần "CẢNH BÁO".

Dự án không có dòng nào trong `hinh_dang_nguon.csv` vẫn hiện trong danh sách nhưng không có trên bản đồ.

## Sửa các con số của mô phỏng giao thông

File: `data/giao_thong/gia_dinh.csv` (mỗi dòng là một con số)

| Cột | Ý nghĩa |
|---|---|
| `ma` | Tên nội bộ. **Không sửa, không xóa dòng.** |
| `gia_tri` | Con số. Đây là cột bạn sửa. |
| `don_vi` | Đơn vị, chỉ để hiển thị |
| `mo_ta_vi` | Giải thích, hiện trong thẻ "Các con số mô phỏng dùng" |
| `loai_nguon` | `số liệu công bố` hoặc `giả định minh họa` |
| `nguon` | Link nguồn; bắt buộc nếu là số liệu công bố |

Ba tỉ lệ xe máy, ô tô, xe buýt phải cộng lại bằng 100. Khi bạn tìm được số liệu thật cho một dòng đang là giả định, sửa `gia_tri`, đổi `loai_nguon` thành `số liệu công bố` và dán link vào `nguon`.

Sửa xong chạy `cap_nhat_du_lieu.bat` để kiểm tra.

## Sửa các kịch bản so sánh

File: `data/giao_thong/kich_ban.csv`. Dòng đầu tiên luôn là hiện trạng.

| Cột | Ý nghĩa |
|---|---|
| `ma` | Mã kịch bản |
| `ten_vi`, `ten_en` | Tên hiện trên nút bấm |
| `bo_cau` | Tên cầu hoặc hầm muốn bỏ đi, đúng như cột `ten_osm` trong `diem_qua_song.csv` |
| `them_cau` | Tên cầu dự kiến muốn thêm, đúng như tên trên OpenStreetMap |
| `mo_ta_vi`, `mo_ta_en` | Câu giải thích hiện dưới nút |

Ví dụ thêm kịch bản "Nếu không có hầm Thủ Thiêm": thêm một dòng với `bo_cau` là `Hầm Sông Sài Gòn`.

File `data/giao_thong/diem_qua_song.csv` liệt kê các cầu và hầm được đếm trong bảng thống kê.

## Sửa tuyến và bến đường thủy

File `data/giao_thong/tuyen_thuy.csv` (mỗi dòng là một tuyến):

| Cột | Ý nghĩa |
|---|---|
| `ma` | Mã tuyến. **Không sửa** mã đã có. |
| `ten_vi`, `ten_en` | Tên tuyến |
| `loai` | Một trong: `buýt sông`, `phà`, `tàu khách`, `tàu hàng` |
| `trang_thai` | `đang hoạt động` hoặc `dự kiến` |
| `mo_ta_vi`, `ghi_chu_vi` | Mô tả và lưu ý hiện trong thẻ thông tin |
| `truy_van`, `cat_doan` | Cách lấy hình dạng từ OpenStreetMap. **Đừng sửa**; cần đổi thì nhờ Claude. Để trống thì tuyến chỉ hiện trong danh sách. |
| `so_tau` | Số tàu minh họa chạy trên tuyến (giả định) |
| `toc_do` | Tốc độ tàu minh họa, km/h (giả định) |
| `nguon` | Link nguồn; nhiều link ngăn bằng ` | ` |
| `ngay_cap_nhat`, `da_kiem_chung` | Như các file khác |

File `data/giao_thong/ben_thuy.csv` (mỗi dòng là một bến hoặc cảng): bạn sửa được `ten_vi`, `ten_en`. Cột `loai` là một trong `bến buýt sông`, `bến phà`, `bến tàu khách`, `cảng hàng hóa`; cột `tuyen` là mã tuyến mà bến thuộc về. Cột `truy_van` đừng sửa.

Ví dụ khi buýt sông số 2 đi vào hoạt động: đổi `trang_thai` thành `đang hoạt động`, sửa `mo_ta_vi`, `nguon`, `ngay_cap_nhat`, rồi nhờ Claude điền `truy_van` để tuyến hiện trên bản đồ.

## Ví dụ: thêm một phường mới vào bản đồ

1. Mở `phuong_moi.csv`, thêm một dòng với đủ các cột. Lưu.
2. Mở `gop_phuong.csv`, thêm các dòng phường cũ gộp thành phường đó. Lưu.
3. Mở cửa sổ lệnh trong thư mục dự án và chạy `py scripts\cap_nhat.py --tai-lai` để tải ranh giới phường mới từ OpenStreetMap. Việc này cần mạng và có thể mất vài phút.
4. Đọc phần "CẢNH BÁO" trong kết quả. Không có cảnh báo nghĩa là bảng gộp khớp với ranh giới.

## Những file do máy tạo, đừng sửa tay

- `data/hanh_chinh/*.geojson`: hình dạng ranh giới
- `data/hanh_chinh/goc_osm/`: dữ liệu thô tải từ OpenStreetMap
- `data/hanh_chinh/BAO_CAO_KIEM_TRA.txt`: kết quả kiểm tra lần chạy gần nhất, kèm danh sách mục cần kiểm chứng
- `data/du_an/du_an.geojson`, `data/du_an/goc_osm/`, `data/du_an/BAO_CAO_KIEM_TRA.txt`: tương tự, cho lớp dự án

## Khi website báo lỗi

Website hiện một ô đỏ ghi tên file có vấn đề. Mở file đó, kiểm tra dòng đầu tiên còn đủ tên cột không, rồi chạy lại `cap_nhat_du_lieu.bat`. Nếu vẫn lỗi, chụp màn hình ô đỏ và gửi cho Claude.
