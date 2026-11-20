# Hướng dẫn cập nhật nội dung

Viết cho người không biết lập trình. Bạn chỉ sửa các file trong thư mục `data/`.
Đừng sửa gì trong `src/` và `scripts/`.

## Bốn việc cần nhớ

1. **Xem website trên máy:** bấm đúp `xem_thu.bat`. Một cửa sổ đen hiện ra và trình duyệt tự mở. Giữ cửa sổ đen mở trong lúc xem; đóng nó để tắt.
2. **Sau khi sửa file trong `data/`:** bấm đúp `cap_nhat_du_lieu.bat`. Chương trình kiểm tra các file bạn vừa sửa và báo lỗi bằng tiếng Việt nếu có.
3. **Xem lại thay đổi:** quay lại trình duyệt và bấm Ctrl + F5.
4. **Đưa thay đổi lên website công khai:** khi đã ưng bản trên máy, bấm đúp `dua_len_mang.bat`. File này kiểm tra dữ liệu, lưu lại một bản, rồi đẩy lên GitHub; website công khai đổi theo sau khoảng 1-2 phút. Nếu dữ liệu còn lỗi, nó dừng lại và không đưa gì lên.

Website công khai: https://minhquan-hua.github.io/hcmc-center-urbanplanning/
Kho mã nguồn: https://github.com/minhquan-hua/hcmc-center-urbanplanning

Lần đầu chạy `dua_len_mang.bat` trên một máy mới, một cửa sổ đăng nhập GitHub có thể hiện ra; bạn đăng nhập ở đó.

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

## Sửa nội dung các tour học tập

File `data/tour/tour.csv` (mỗi dòng là một tour): `ma`, tên và mô tả bằng hai thứ tiếng.

File `data/tour/buoc.csv` (mỗi dòng là một bước của một tour):

| Cột | Ý nghĩa |
|---|---|
| `tour` | Mã tour mà bước này thuộc về |
| `thu_tu` | Số thứ tự của bước trong tour (1, 2, 3...) |
| `tieu_de_vi`, `tieu_de_en` | Tiêu đề bước |
| `loi_dan_vi`, `loi_dan_en` | Lời dẫn. Chỉ viết những điều đã có nguồn trong các file dữ liệu khác. |
| `cau_hoi_vi`, `cau_hoi_en` | Câu hỏi gợi mở cho sinh viên |
| `kinh_do`, `vi_do` | Bản đồ bay tới điểm này |
| `thu_phong` | Mức phóng to, từ 10 (xa) đến 18 (gần) |
| `nghieng` | Độ nghiêng, từ 0 (nhìn thẳng xuống) đến 70 |
| `xoay` | Góc xoay bản đồ, 0 là hướng bắc ở trên |
| `lop` | Các lớp tự bật ở bước này, ngăn bằng ` | `. Dùng: `hanh-chinh`, `du-an`, `duong-bo`, `thuy`. Lớp không ghi sẽ tự tắt. |
| `ky_hanh_chinh` | `truoc` hoặc `sau`, hoặc để trống |
| `kich_ban` | Mã kịch bản giao thông trong `kich_ban.csv`, hoặc để trống |

Việc hay làm nhất là **sửa lời dẫn và câu hỏi**: mở `buoc.csv` bằng Excel, sửa ô, lưu kiểu CSV UTF-8, rồi chạy `cap_nhat_du_lieu.bat` để kiểm tra.

Để thêm một bước: thêm một dòng với `thu_tu` kế tiếp. Lấy `kinh_do`, `vi_do` bằng cách nhấp chuột phải trên Google Maps (số đầu là vĩ độ, số sau là kinh độ).

Để thêm một tour: thêm một dòng trong `tour.csv` với `ma` mới, rồi thêm các bước mang mã đó trong `buoc.csv`.

## Ví dụ: thêm một phường mới vào bản đồ

1. Mở `phuong_moi.csv`, thêm một dòng với đủ các cột. Lưu.
2. Mở `gop_phuong.csv`, thêm các dòng phường cũ gộp thành phường đó. Lưu.
3. Mở cửa sổ lệnh trong thư mục dự án và chạy `py scripts\cap_nhat.py --tai-lai` để tải ranh giới phường mới từ OpenStreetMap. Việc này cần mạng và có thể mất vài phút.
4. Đọc phần "CẢNH BÁO" trong kết quả. Không có cảnh báo nghĩa là bảng gộp khớp với ranh giới.

## Thêm poster lên bảng đen (nút "Blackboard")

Nút "Blackboard" ở thanh trên cùng mở một tấm bảng đen có các poster được ghim lên. Bấm vào poster thì xem được file đầy đủ.

**Điều cần biết trước:**

- Trên website không có nút tải lên. Chỉ bạn thêm poster được, bằng cách chép file vào thư mục rồi đưa lên mạng. Sinh viên chỉ xem.
- Kho trên GitHub là công khai: mọi file trong `data/bang_den/` ai cũng tải về được, kể cả file không gắn vào poster nào. Chỉ đặt vào đó những file bạn có quyền chia sẻ.
- Loại file nhận: ảnh **JPG, PNG, WebP**; **PDF**; bảng **CSV**. File Word, PowerPoint: lưu thành PDF. File Excel: lưu thành PDF, hoặc lưu kiểu "CSV UTF-8" nếu muốn hiện thành bảng.
- Mỗi file nên nhẹ hơn 10 MB (điện thoại tải nhanh). File nặng hơn 50 MB sẽ không đưa lên được.

**Các bước thêm một poster:**

1. **Đặt tên file:** dùng chữ thường, không dấu, nối bằng gạch ngang, có đuôi. Ví dụ `so-do-metro-so-1.png`, `bai-giang-thu-thiem.pdf`.
2. **Chép file** vào thư mục `data/bang_den/`.
3. **(Không bắt buộc) Ảnh thu nhỏ cho file PDF hoặc CSV:** mở file, bấm `Windows + Shift + S` để chụp trang đầu, dán vào Paint rồi lưu thành ảnh PNG (ví dụ `bai-giang-thu-thiem-anh-nho.png`) trong cùng thư mục. Không có ảnh thu nhỏ thì bảng hiện biểu tượng PDF hoặc CSV. Với poster là ảnh, website tự dùng chính ảnh đó.
4. **Mở `data/bang_den/bang_den.csv` bằng Excel** và thêm một dòng ở cuối:

| Cột | Ghi gì | Bắt buộc? |
|---|---|---|
| `ma` | Mã ngắn không dấu, không trùng dòng khác. Ví dụ `so-do-metro-1` | Có |
| `tieu_de_vi` | Tiêu đề tiếng Việt hiện dưới poster | Có |
| `tieu_de_en` | Tiêu đề tiếng Anh. Để trống thì hiện tiếng Việt | Không |
| `tep` | Tên file đúng y hệt, kể cả chữ hoa/thường và đuôi. Ví dụ `so-do-metro-so-1.png` | Có |
| `anh_nho` | Tên ảnh thu nhỏ ở bước 3 | Không |
| `tam` | Poster hiện ở tầm nào: `trung-tam`, `vung`, `tay-nam-bo`, hoặc `chung` (mọi tầm). Nhiều tầm thì ngăn bằng dấu `\|`, ví dụ `vung\|tay-nam-bo` | Có |
| `kinh_do`, `vi_do` | Muốn ghim poster vào một điểm trên bản đồ thì ghi tọa độ (dùng dấu chấm). Lấy bằng cách nhấp chuột phải trên Google Maps: số đầu là **vĩ độ**, số sau là **kinh độ**. Không ghim thì để trống cả hai | Không |
| `thu_phong` | Độ gần khi bay tới điểm ghim: 4 (rất xa) tới 19 (rất gần). Để trống thì website tự chọn | Không |
| `mo_ta_vi`, `mo_ta_en` | Vài câu giới thiệu poster | Không |
| `nguon_ten`, `nguon_ten_en` | Tên nguồn (tác giả, cơ quan, bài báo). Tài liệu bạn tự làm thì ghi ví dụ "Bài giảng của giảng viên" | `nguon_ten`: có |
| `nguon` | Đường link nguồn, bắt đầu bằng http. Không có thì để trống | Không |
| `ngay_cap_nhat` | Ngày bạn thêm hoặc sửa poster, ví dụ `25/11/2026` | Có |
| `da_kiem_chung` | `có`, hoặc `cần kiểm chứng` (poster sẽ có nhãn đỏ) | Có |

5. **Lưu** kiểu **CSV UTF-8 (Comma delimited)**.
6. **Bấm đúp `cap_nhat_du_lieu.bat`** rồi đọc phần "BLACKBOARD" ở cuối. Nó báo nếu sai tên file, sai chữ hoa/thường, file quá nặng, hoặc có file thừa trong thư mục.
7. **Xem thử:** bấm đúp `xem_thu.bat`, bấm Ctrl + F5, bấm nút "Blackboard". Poster mới nằm cuối bảng; thứ tự trên bảng theo thứ tự dòng trong file.
8. **Đưa lên mạng:** bấm đúp `dua_len_mang.bat`.

**Bỏ một poster:** xóa dòng của nó trong `bang_den.csv`, xóa luôn file trong `data/bang_den/` (nếu không, file vẫn nằm trên mạng), rồi làm lại bước 6-8.

**Ba poster mẫu** (tên bắt đầu bằng "MẪU") chỉ để thử. Khi có poster thật, xóa ba dòng mẫu và các file `mau-so-do.png`, `mau-tai-lieu.pdf`, `mau-tai-lieu-anh-nho.png`, `mau-bang.csv`.

## Những file do máy tạo, đừng sửa tay

- `data/hanh_chinh/*.geojson`: hình dạng ranh giới
- `data/hanh_chinh/goc_osm/`: dữ liệu thô tải từ OpenStreetMap
- `data/hanh_chinh/BAO_CAO_KIEM_TRA.txt`: kết quả kiểm tra lần chạy gần nhất, kèm danh sách mục cần kiểm chứng
- `data/du_an/du_an.geojson`, `data/du_an/goc_osm/`, `data/du_an/BAO_CAO_KIEM_TRA.txt`: tương tự, cho lớp dự án
- `data/bang_den/BAO_CAO_KIEM_TRA.txt`: kết quả kiểm tra các poster trên bảng đen

## Khi website báo lỗi

Website hiện một ô đỏ ghi tên file có vấn đề. Mở file đó, kiểm tra dòng đầu tiên còn đủ tên cột không, rồi chạy lại `cap_nhat_du_lieu.bat`. Nếu vẫn lỗi, chụp màn hình ô đỏ và gửi cho Claude.
