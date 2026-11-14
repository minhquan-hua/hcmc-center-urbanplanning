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
- [x] 1. Bản đồ nền 3D + khung giao diện (có nút đổi ngôn ngữ và chế độ trình chiếu). Xong 13/11/2026; chưa thử trên điện thoại thật.
- [x] 2. Lớp hành chính Trước/Sau 2025. Xong 14/11/2026; chủ dự án chưa duyệt danh sách "cần kiểm chứng" (18 hình dạng ranh giới).
- [x] 3. Lớp dự án quy hoạch + bộ lọc. Xong 14/11/2026; cả 15 dự án còn "cần kiểm chứng" (chưa mở bài gốc); chưa có dự án loại "đường".
- [x] 4. Giao thông đường bộ. Xong 14/11/2026; chưa thử trên điện thoại thật.
- [x] 5. Giao thông thủy. Xong 14/11/2026; 5 tuyến đều "cần kiểm chứng"; chưa thử trên điện thoại thật.
- [x] 6. Chế độ học (tour). Xong 15/11/2026; chủ dự án CHƯA duyệt lời dẫn và câu hỏi.
- [ ] 7. Hoàn thiện, thử trên điện thoại thật, đưa lên mạng, bàn giao hướng dẫn. Đã xong: rà soát cuối, mục Giới thiệu, chuyển thư mục, đẩy mã lên GitHub (15/11/2026), hướng dẫn bàn giao. CÒN LẠI: chủ dự án bật GitHub Pages, kiểm tra link công khai, thử trên điện thoại thật.

## Nơi đặt dự án (từ 15/11/2026)

- Thư mục: `C:\Users\Minh Quan\OneDrive\Documents\sa-ban-quy-hoach-hcm` (Documents do OneDrive đồng bộ).
- Kho GitHub: https://github.com/minhquan-hua/hcmc-center-urbanplanning (nhánh `main`, công khai).
- Website công khai sau khi bật Pages: https://minhquan-hua.github.io/hcmc-center-urbanplanning/
- Đẩy mã: shell của Claude không hiện được cửa sổ đăng nhập; lần đầu phải chạy `git push` trong Terminal của người dùng (`run_in_terminal`) để họ đăng nhập qua trình duyệt.
- `dua_len_mang.bat`: chủ dự án bấm đúp để kiểm tra dữ liệu, commit và push.
- Tác giả commit phải là địa chỉ ẩn danh của GitHub (`git config user.email` trong kho này đã đặt là `333844746+minhquan-hua@users.noreply.github.com`). KHÔNG dùng email thật của chủ dự án: kho là công khai. Ngày 15/11/2026 đã viết lại lịch sử và ghi đè lên kho để gỡ email thật.
- Khi chuyển thư mục, ứng dụng không sao chép `.git` và `.claude`; đã sao chép `.git` bằng tay và tạo lại `.claude/launch.json`.

## Quyết định

- 13/11/2026: Không dùng bước build hay Node, để chủ dự án ít phải cài đặt và dễ đưa lên mạng.
- 13/11/2026: Song ngữ Việt + Anh theo yêu cầu chủ dự án; tiếng Việt là bản gốc.
- 13/11/2026: Rủi ro lớn nhất là ranh giới phường mới. Phương án dự phòng: ghép từ ranh giới phường cũ theo nghị quyết, phường bị chia tách đánh dấu "cần kiểm chứng". Phải hỏi chủ dự án trước khi chọn.

- 13/11/2026: Nền bản đồ dùng style "liberty" của OpenFreeMap (có sẵn lớp tòa nhà 3D `building-3d`). MapLibre 4.7.1 từ unpkg.
- 13/11/2026: Chữ giao diện nằm trong một file `data/ngon_ngu/giao_dien.csv` (cột `ma,vi,en`); trong HTML gắn bằng thuộc tính `data-chu`. Tên biến, tên file trong code dùng tiếng Việt không dấu.
- 13/11/2026: `window.banDo` là đối tượng bản đồ dùng chung cho các giai đoạn sau. Chỉ bật/tắt lớp sau sự kiện `load` (đừng dùng `isStyleLoaded()`, nó trả về sai khi đang tải ô bản đồ).
- Xem thử khi phát triển: `.claude/launch.json` cấu hình "xem-thu" (py -m http.server 8000).

## Kết quả tra cứu giai đoạn 2 (13/11/2026)

Nguồn pháp lý: Nghị quyết 1685/NQ-UBTVQH15 ngày 16/6/2025, toàn văn trên cổng Chính phủ:
https://xaydungchinhsach.chinhphu.vn/toan-van-nghi-quyet-so-1685-nq-ubtvqh15-sap-xep-cac-dvhc-cap-xa-cua-thanh-pho-ho-chi-minh-nam-2025-119250616211341304.htm
Hiệu lực từ ngày thông qua; chính quyền mới hoạt động từ 1/7/2025. Toàn TP: 168 đơn vị (113 phường, 54 xã, 1 đặc khu).

18 phường mới trong phạm vi (số khoản của Điều 1; "mp" = một phần, "pcl" = phần còn lại):
- k1 Sài Gòn: Bến Nghé + mp Đa Kao + mp Nguyễn Thái Bình
- k2 Tân Định: Tân Định + pcl Đa Kao
- k3 Bến Thành: Bến Thành, Phạm Ngũ Lão + mp Cầu Ông Lãnh + pcl Nguyễn Thái Bình
- k4 Cầu Ông Lãnh: Nguyễn Cư Trinh, Cầu Kho, Cô Giang + pcl Cầu Ông Lãnh
- k5 Bàn Cờ: P1, P2, P3, P5 + mp P4 (Quận 3)
- k6 Xuân Hòa: Võ Thị Sáu + pcl P4 (Quận 3)
- k7 Nhiêu Lộc: P9, P11, P12, P14 (Quận 3)
- k8 Xóm Chiếu: P13, P16, P18 + mp P15 (Quận 4)
- k9 Khánh Hội: P8, P9 + mp P2 + mp P4 + pcl P15 (Quận 4)
- k10 Vĩnh Hội: P1, P3 + pcl P2 + pcl P4 (Quận 4)
- k42 Gia Định: P1, P2, P7, P17 (Bình Thạnh)
- k43 Bình Thạnh: P12, P14 (Bình Thạnh), P26
- k44 Bình Lợi Trung: P5, P11, P13 (Bình Thạnh)
- k45 Thạnh Mỹ Tây: P19, P22, P25
- k46 Bình Quới: P27, P28
- k75 Cát Lái: Thạnh Mỹ Lợi, Cát Lái
- k76 Bình Trưng: Bình Trưng Đông, Bình Trưng Tây + mp An Phú (TP Thủ Đức)
- k78 An Khánh: Thủ Thiêm, An Lợi Đông, Thảo Điền, An Khánh + pcl An Phú
Lưu ý: nghị quyết không ghi tên quận cho P26, P19/22/25, P27/28 (suy ra là Bình Thạnh; phải ghi rõ là suy luận).
Phải đọc lại nguyên văn từ link trên khi nhập dữ liệu, không chép từ ghi chú này.

Nguồn hình dạng ranh giới (đã kiểm tra bằng Overpass API, chưa tải hình dạng về):
- Phường mới: OpenStreetMap hiện có đủ 18 phường dạng relation `admin_level=6` (vd. Phường Sài Gòn = relation 19260504). Do cộng đồng vẽ, không ghi nguồn hình dạng, KHÔNG phải địa giới pháp lý.
- Quận/phường cũ: OSM hiện tại đã xóa; lấy bằng truy vấn lịch sử `[date:"2025-05-01T00:00:00Z"]` (quận = admin_level 6, phường = 8; 114 phường trong khung).
- Máy chủ Overpass chạy được: https://overpass-api.de/api/interpreter (hay lỗi 502, cần thử lại). Truy vấn lịch sử chỉ chạy trên máy chủ này.
- Chưa tìm thấy file ranh giới mới do cơ quan nhà nước công bố mở.

## Giai đoạn 6 đã làm gì (15/11/2026)

- Ba tour, 17 bước, song ngữ: `data/tour/tour.csv` và `data/tour/buoc.csv` (tạo lần đầu bằng script tạm, từ nay sửa thẳng trong CSV). Tour: `thu-thiem` (6 bước), `quan-sang-phuong` (5), `dong-song` (6).
- Lời dẫn chỉ dùng dữ kiện đã có trong các file dữ liệu (nên cũng mang mức "cần kiểm chứng" của các file đó). Câu hỏi gợi mở do Claude soạn. Hai con số "khoảng 15 km2 / 3 km2" là diện tích tính từ ranh giới tham khảo OSM.
- `src/tour.js`: danh sách tour trong bảng lớp; khung `#tour` ở đáy (điện thoại) hoặc giữa đáy (laptop). Mỗi bước: bật/tắt lớp bằng cách đổi ô chọn rồi phát sự kiện `change`, gọi `S.hanhChinh.datKy`, `S.giaoThong.datKichBan` (nhớ kịch bản nếu dữ liệu chưa tải xong), rồi `flyTo` có chừa 38% chiều cao ở đáy cho khung tour. Thoát thì trả lề về 0; KHÔNG khôi phục các lớp về trạng thái trước tour.
- `kiem_tra_tour()` trong `scripts/cap_nhat.py` kiểm tra cột, vị trí, tên lớp, mã kịch bản.

## Giai đoạn 5 đã làm gì (14/11/2026)

- Chủ dự án đã duyệt danh sách tuyến và bến. Dữ liệu: `data/giao_thong/tuyen_thuy.csv` (5 tuyến; buýt sông số 2 là "dự kiến", không có hình) và `ben_thuy.csv` (16 bến/cảng).
- `xu_ly_thuy()` trong `scripts/cap_nhat.py`: một truy vấn Overpass (khung rộng hơn: `KHUNG_THUY`), nối các đoạn thành chuỗi dài nhất (`noi_chuoi`) làm "đường chạy" cho tàu; `cat_doan` (hai điểm) cắt lấy đoạn giữa hai đỉnh gần nhất. Ghi `duong_thuy.geojson` và `BAO_CAO_KIEM_TRA_THUY.txt`.
- `src/thuy.js`: lớp `th-*`, mặc định tắt, chỉ tải khi bật. Tàu là chấm đặc chạy trên "đường chạy": tuyến có hai đầu cách nhau dưới 800 m coi là tuyến vòng (buýt sông trên OSM có cả chiều đi và về), còn lại chạy tới cuối rồi quay đầu. Số tàu, tốc độ là cột `so_tau`, `toc_do` (giả định); tăng tốc lấy từ `gia_dinh.csv`.
- Thứ tự ưu tiên khi nhấp: đường thủy > dự án > hành chính (mỗi lớp có `trung(point)`, `boChon()`, `dangChon()` trong `window.SaBan`). Ba lớp dùng chung thẻ `#the`.
- Không đưa giá vé, giờ chạy, số chuyến, sản lượng cảng lên website vì nguồn yếu hoặc không có.

Kết quả tra cứu (mới đọc tóm tắt tìm kiếm, tất cả "cần kiểm chứng"):
- Theo Sở Xây dựng (plo.vn/tphcm-van-hanh-lai-tuyen-tau-cao-toc-di-con-dao-sap-khoi-dong-buyt-song-so-2-post910887.html; baoxaydung.vn/mo-rong-buyt-song-tphcm-tung-buoc-hinh-thanh-mang-luoi-giao-thong-thuy-lien-hoan-192260529202510407.htm): TP.HCM có 5 tuyến khách đường thủy: buýt sông số 1, tàu cao tốc Bạch Đằng - Vũng Tàu, phà Cần Giờ - Vũng Tàu, hai tuyến đi Côn Đảo. Buýt sông số 2 (Bạch Đằng - Lò Gốm) dự kiến 2026-2027.
- Buýt sông số 1 Bạch Đằng - Linh Đông: khoảng 11 km, vé 15.000 đ (nguồn blog du lịch, yếu). OSM: relation 13684620 (ref=1, operator Công ty TNHH Thường Nhật), các way tên "Saigon Waterbus" route=ferry; bến là node amenity=ferry_terminal: Bạch Đằng, Thủ Thiêm, Ba Son, Bình An, Thảo Điền, Thanh Đa, Hiệp Bình Chánh, Linh Đông.
- Phà Cát Lái: OSM way "Phà Cát Lái" route=ferry (59405448, 583820290). Cầu Cát Lái thay phà đã động thổ/khởi công 2026, tĩnh không 55 m (tienphong.vn/khoi-cong-hai-cau-vuot-song-dong-nai-post1880590.tpo; vietnamplus). Không tìm được số lượt khách/ngày.
- Tàu cao tốc đi Vũng Tàu: OSM relation 11513593 (GreenlinesDP), way 78499768, 744909328; bến "Bến Tàu Cánh Ngầm Sài Gòn" node 5109064067.
- Cảng hàng hóa trên OSM (landuse=industrial, industrial=port): Sài Gòn Khánh Hội (relation 6946894), Tân Thuận, Tân Thuận Đông, Bến Nghé, VICT, Cát Lái, Tân Cảng - Phú Hữu. Không có luồng tàu trên OSM: tàu hàng sẽ chạy theo tim sông (way "Sông Sài Gòn" waterway=river), ghi là sơ đồ. Chưa có nguồn cho sản lượng Cát Lái năm 2025 hay việc di dời cảng Khánh Hội.

## Giai đoạn 4 đã làm gì (14/11/2026)

- QUYẾT ĐỊNH: không dùng deck.gl. Xe là một lớp `circle` của MapLibre, cập nhật vị trí khoảng 20 lần/giây bằng `setData`. Lý do: 700 chấm là đủ nhẹ, bớt được một thư viện hơn 1 MB cho điện thoại. Giai đoạn 5 (tàu thủy) nên làm cùng cách.
- `xu_ly_giao_thong()` trong `scripts/cap_nhat.py`: tải đường motorway..tertiary (+ cầu dự kiến nêu trong `kich_ban.csv`) từ Overpass, cắt thành đoạn giữa các nút giao, ghi `data/giao_thong/mang_duong.json` (`nut`: [kinh độ, vĩ độ, bờ đông 0/1]; `canh`: [nút đầu, nút cuối, dài m, một chiều 0/1, chỉ số điểm qua sông hoặc -1, tên cầu dự kiến hoặc "", tọa độ]). Bờ đông = nằm trong 3 phường thuộc Thủ Đức cũ. Cầu dự kiến chưa nối vào mạng thì nối thẳng tới nút gần nhất (dưới 600 m).
- `src/giao_thong.js`: chỉ tải dữ liệu khi người dùng bật lớp (mặc định tắt). 260 cặp đi-đến cố định (hạt giống ngẫu nhiên cố định) dùng chung mọi kịch bản; mỗi kịch bản tìm đường ngắn nhất lại (Dijkstra). Xe lặp lại tuyến của mình. Điện thoại/máy yếu hiện 40% số xe. Bảng thống kê đếm số chấm xe qua từng cầu/hầm và so với hiện trạng.
- Số liệu: `data/giao_thong/gia_dinh.csv`. Hai dòng có nguồn báo chí (tỉ lệ xe máy 89% theo đăng ký; tốc độ trung bình khu trung tâm 34 km/h), còn lại là "giả định minh họa". Nút "Xem các con số mô phỏng dùng" mở thẻ liệt kê tất cả.
- Hạn chế đã biết (ghi trên giao diện): xe luôn đi đường ngắn nhất, không có ùn tắc theo tải, không có đèn tín hiệu; số trong bảng là số chấm, không phải lưu lượng.
- Kết quả thử (700 xe, cao điểm): bỏ cầu Ba Son thì 55 xe chuyển sang cầu Thủ Thiêm (+26), hầm (+18), cầu Sài Gòn (+3); thêm Thủ Thiêm 4 thì cầu này nhận 15 xe.

## Giai đoạn 3 đã làm gì (14/11/2026)

- Chủ dự án đã duyệt danh sách 15 dự án trong `data/du_an/du_an.csv`. Tất cả "cần kiểm chứng": mới đọc tóm tắt kết quả tìm kiếm, chưa mở từng bài gốc.
- Hình dạng: `data/du_an/hinh_dang_nguon.csv` (`kieu` = `osm` kèm câu lọc Overpass, hoặc `điểm sơ đồ` kèm kinh độ,vĩ độ). 10 dự án lấy từ OSM (kể cả cầu Thủ Thiêm 3, 4, cầu đi bộ, metro đang làm: OSM có sẵn tuyến dự kiến), 5 dự án là điểm sơ đồ do tôi đặt theo mô tả trong nguồn (trung tâm hành chính, nhà hát, trung tâm tài chính, Bình Quới - Thanh Đa, công viên Sáng Tạo). OSM có một "Công viên Sáng Tạo" ở vị trí khác mô tả nên không dùng.
- `xu_ly_du_an()` trong `scripts/cap_nhat.py`: một truy vấn Overpass cho mọi dự án (dùng `out count` để tách), lưu ở `data/du_an/goc_osm/`, tự tải lại khi danh sách câu lọc đổi; ghi `du_an.geojson` (mỗi dự án có hình + một điểm đặt nhãn) và `BAO_CAO_KIEM_TRA.txt`.
- `src/du_an.js`: lớp `da-*`, màu theo trạng thái, nét đứt cho công trình chưa xong, chấm rỗng cho vị trí sơ đồ, lọc theo loại và trạng thái, danh sách bấm để bay tới. Dùng chung thẻ `#the` với lớp hành chính; nhấp trúng dự án thì lớp hành chính nhường (`S.duAn.trung`).
- Hai mục xếp trạng thái tạm, chủ dự án chưa quyết: Trung tâm Tài chính quốc tế ("đã hoàn thành") và Nhà hát ("đề xuất").
- Mô tả, mốc thời gian mới có tiếng Việt; bản tiếng Anh chỉ có tên dự án.

Ghi chú tra cứu cũ (giữ để tham khảo):

Chủ dự án đã đồng ý kế hoạch: tra cứu dự án -> báo danh sách để duyệt -> mới dựng lớp. Mới tra được 1 dự án, CHƯA mở bài gốc để kiểm:
- Cầu Ba Son (tên cũ Thủ Thiêm 2), theo vi.wikipedia.org/wiki/Cầu_Ba_Son và các bài nó dẫn: khởi công 3/2/2015 (vnexpress.net/tin-tuc/thoi-su/tp-hcm-khoi-cong-xay-cau-thu-thiem-2-3142825.html), hợp long 2/9/2021 (vnexpress.net/hop-long-cau-thu-thiem-2-4350180.html), thông xe 28/4/2022 (vnexpress.net/khanh-thanh-cau-thu-thiem-2-4456750.html), đổi tên 9/12/2022. Số liệu dài 1.465 m, 6 làn, vốn 3.082 tỷ chỉ có nguồn baodautu/vovgiaothong: cần kiểm chứng.
- Chưa tra: cầu Thủ Thiêm 1, 3, 4; cầu đi bộ; hầm Thủ Thiêm; metro 1, 2; Bến Thành - Thủ Thiêm; quảng trường, nhà hát, trung tâm tài chính ở Thủ Thiêm; công viên bờ sông; Bình Quới - Thanh Đa. (Wikipedia tiếng Việt không có trang cầu Thủ Thiêm 4.)

## Việc còn mở

- Hình dạng 18 phường mới vẫn là "cần kiểm chứng" cho đến khi chủ dự án đối chiếu với bản đồ chính thức.
- Chưa thử bấm đúp `xem_thu.bat` và `cap_nhat_du_lieu.bat` (mới chạy script qua dòng lệnh).

## Giai đoạn 2 đã làm gì (14/11/2026)

- Chủ dự án chọn dùng OpenStreetMap cho cả ranh giới cũ và mới, gắn nhãn "ranh giới tham khảo, không phải địa giới pháp lý".
- `scripts/cap_nhat.py` (chỉ dùng thư viện có sẵn): đọc `phuong_moi.csv` + `gop_phuong.csv`, tải Overpass vào `data/hanh_chinh/goc_osm/` (đã commit, chạy lại không cần mạng; `--tai-lai` để tải mới), ghi `phuong_moi.geojson`, `phuong_cu.geojson`, `quan_cu.geojson`, `BAO_CAO_KIEM_TRA.txt`.
- Đối chiếu tự động: 62 dòng gộp khớp 54 phường cũ, 0 cảnh báo; 7 phường mới gộp nguyên vẹn có diện tích lệch dưới 0,5% so với tổng phường cũ.
- `src/hanh_chinh.js`: lớp `hc-*`, nút Trước/Sau, thẻ thông tin. Dùng `window.SaBan` do `src/app.js` cung cấp (`banDo`, `docCSV`, `chu`, `baoLoi`, `datBang`, `ngonNgu`, `khiDoiNgonNgu`, `khiNenSanSang`). Các lớp sau nên theo cùng mẫu: một file JS riêng, chèn dưới `building-3d`.
- Màu theo quận cũ, dùng chung hai thời kỳ. Khu Quận 2 cũ ghi là "Thành phố Thủ Đức" (đúng tên trong dữ liệu tháng 5/2025); chưa đưa thông tin lịch sử Quận 2 vì chưa tra nguồn.
- Khung trình duyệt của ứng dụng bị ẩn thì bản đồ không vẽ: gọi `show_pane preview` trước khi kiểm tra. Trình duyệt giữ bản cũ của CSS/JS: tải lại bằng `fetch(url, {cache: 'reload'})` rồi `location.reload()`.

- Chưa có tài khoản GitHub (cần ở giai đoạn 7).
