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
7. Blackboard (thêm 20/11/2026 theo yêu cầu chủ dự án): tấm bảng đen đính poster (ảnh, PDF, bảng CSV) do chủ dự án đăng; lọc theo tầm; poster có thể ghim một điểm trên bản đồ.

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
- MapLibre GL JS; nền OpenFreeMap (không cần key).
- Python 3.12 xử lý dữ liệu (gọi bằng `py`). Git 2.56. Cả hai cài bằng winget ngày 13/11/2026.
- `xem_thu.bat`: bấm đúp để xem website trên máy. `cap_nhat_du_lieu.bat`: bấm đúp để xử lý lại toàn bộ dữ liệu.
- Song ngữ Việt + Anh: dữ liệu có cột `_vi` và `_en`; cột `_en` trống thì hiện tiếng Việt. Chữ giao diện nằm trong `data/ngon_ngu/`.
- Ngôn ngữ mặc định: TIẾNG ANH (chủ dự án chọn 20/11/2026, áp dụng cho toàn bộ giao diện). Người xem bấm "VI" thì nhớ lựa chọn trong localStorage, khoá `ngon_ngu_2` (đổi từ `ngon_ngu` để lựa chọn cũ không giữ lại). Quyết định kỹ thuật: lời báo lỗi dữ liệu (`S.baoLoi`, ô lời báo trên bảng đen) khi xem tiếng Anh vẫn kèm bản tiếng Việt bên dưới, vì đó là việc của chủ dự án. Nhãn trên bản đồ nền là tên OpenStreetMap, không đổi theo ngôn ngữ.
- Thiết kế cho điện thoại trước; tự giới hạn số xe/tàu theo thiết bị.
- Cuối dự án đưa lên GitHub Pages hoặc Netlify.

## Nơi đặt dự án (từ 15/11/2026)

- Thư mục: `C:\Users\Minh Quan\OneDrive\Documents\sa-ban-quy-hoach-hcm` (Documents do OneDrive đồng bộ).
- Kho GitHub: https://github.com/minhquan-hua/hcmc-center-urbanplanning (nhánh `main`, công khai).
- Website công khai sau khi bật Pages: https://minhquan-hua.github.io/hcmc-center-urbanplanning/
- Đẩy mã: shell của Claude không hiện được cửa sổ đăng nhập; lần đầu phải chạy `git push` trong Terminal của người dùng (`run_in_terminal`) để họ đăng nhập qua trình duyệt.
- `dua_len_mang.bat`: chủ dự án bấm đúp để kiểm tra dữ liệu, commit và push.
- Tác giả commit phải là địa chỉ ẩn danh của GitHub (`git config user.email` trong kho này đã đặt là `333844746+minhquan-hua@users.noreply.github.com`). KHÔNG dùng email thật của chủ dự án: kho là công khai. Ngày 15/11/2026 đã viết lại lịch sử và ghi đè lên kho để gỡ email thật.
- Khi chuyển thư mục, ứng dụng không sao chép `.git` và `.claude`; đã sao chép `.git` bằng tay và tạo lại `.claude/launch.json`.

## Trạng thái (cập nhật 20/11/2026)

- NÚT "BLACKBOARD" (bảng đen đính poster) ĐÃ DỰNG XONG và commit ngày 20/11/2026, CHƯA đưa lên mạng, CHỜ chủ dự án xem và duyệt. Chủ dự án đã chọn (20/11/2026): đăng poster bằng cách chép file vào `data/bang_den/` + thêm dòng vào `bang_den.csv` (sinh viên chỉ xem); tên nút giữ "Blackboard" ở cả hai thứ tiếng; poster lọc theo tầm và có thể ghim một điểm trên bản đồ; nhận ảnh JPG/PNG/WebP, PDF, bảng CSV. Có 3 poster MẪU (không số liệu; bảng CSV trích từ `data/vung/vung.csv`), chờ chủ dự án gửi file thật. Hướng dẫn thêm poster nằm trong `HUONG_DAN_CAP_NHAT.md`. Cũng ngày 20/11/2026: đổi ngôn ngữ mặc định sang tiếng Anh (xem mục Kỹ thuật); chủ dự án sẽ thay poster mẫu bằng tài liệu thật sau.
- ĐANG LÀM (từ 17/11/2026): SA BÀN TÂY NAM BỘ, kế hoạch đã duyệt, xem mục cuối file. BƯỚC 1 (khung bản đồ + bản đồ nhỏ) ĐÃ DỰNG XONG và commit ngày 17/11/2026, CHƯA đưa lên mạng; chủ dự án ĐÃ DUYỆT ngày 17/11/2026 (đồng ý cả nhãn Hoàng Sa, Trường Sa, Hà Nội, TP.HCM trên bản đồ nhỏ). BƯỚC 2 (hạ tầng, 22 mục) ĐÃ DỰNG XONG và commit ngày 18/11/2026, CHƯA đưa lên mạng; chủ dự án đã duyệt danh sách và chọn vẽ đường thủy dạng sơ đồ. Bước tiếp theo: bước 3 (thẻ "Vị trí chiến lược"), làm ở phiên mới.
- DỊCH BÙ TIẾNG ANH ĐÃ XONG 20/11/2026 (chủ dự án yêu cầu làm sớm, trước bước 3 Tây Nam Bộ), CHƯA đưa lên mạng: mọi chữ tiếng Việt ở bản tiếng Anh đã dịch (mô tả dự án, hạ tầng vùng, thẻ "Vì sao sáp nhập", lời tour vùng, giả định mô phỏng, tuyến thủy, tên quận/phường cũ, tên nguồn, nhãn cho trình đọc màn hình). Chủ dự án chọn: tên nguồn dịch sang tiếng Anh và thêm "(in Vietnamese)"; tên báo (Nhân Dân, Đại biểu Nhân dân…) giữ nguyên. Đã thêm dấu cho các tên không dấu ở phần vùng ("Long Thanh" -> "Long Thành", "Ho Chi Minh City" -> "Hồ Chí Minh City"). Quyết định kỹ thuật: giữ các tên tiếng Anh đã thông dụng "Saigon River", "Saigon Port", "Mekong Delta" và chữ viết tắt "HCMC". Chủ dự án ĐÃ DUYỆT bản dịch và cho đưa lên mạng ngày 20/11/2026.
- ĐƯA LÊN MẠNG 20/11/2026 (bản dịch + bản đồ nhỏ). Chủ dự án chọn TẠM ẨN tầm Tây Nam Bộ trên bản công khai vì chưa xong: `CONG_KHAI_TNB = false` ở đầu `src/app.js` bỏ nút "Tây Nam Bộ" và dòng nguồn Tây Nam Bộ trong "Giới thiệu" khi trang KHÔNG chạy ở localhost; xem thử trên máy vẫn đủ ba tầm. Khi tới bước 5 Tây Nam Bộ: đổi thành `true`.
- BẢNG "LỚP BẢN ĐỒ" CHIA 3 CỤM (20/11/2026, chủ dự án duyệt kế hoạch cùng ngày), ĐÃ ĐƯA LÊN MẠNG 20/11/2026 theo lời chủ dự án: Chế độ học (tour) / Ranh giới / Hạ tầng, mỗi cụm mở/đóng riêng. Luôn hiện ở đầu bảng: "Tòa nhà 3D" (trung tâm), nút "Vì sao sáp nhập?" (vùng), "Ba vị trí chiến lược" (Tây Nam Bộ); luôn hiện ở cuối: Về góc nhìn ban đầu, Giới thiệu, dòng nguồn OSM. Laptop mở sẵn cả 3 cụm, điện thoại đóng cả 3; không nhớ sau khi tải lại trang. Tầm Tây Nam Bộ chưa có tour nên cụm tour ghi "sẽ bổ sung ở bước sau".
- Sa bàn TRUNG TÂM đã xong cả 8 giai đoạn và đang chạy công khai; chủ dự án đã thử trên điện thoại.
- Việc nội dung còn mở của sa bàn trung tâm: duyệt các mục "cần kiểm chứng" (18 hình dạng phường, 15 dự án, 5 tuyến thủy), duyệt lời tour, hai trạng thái xếp tạm (Trung tâm Tài chính quốc tế, Nhà hát). Chưa ai bấm đúp thử `cap_nhat_du_lieu.bat` và `dua_len_mang.bat`.
- Đang làm: SA BÀN VÙNG (xem mục dưới). BƯỚC 1 (khung vùng) đã được chủ dự án duyệt ngày 17/11/2026. BƯỚC 2 (hạ tầng vùng, 27 mục) ĐÃ DỰNG XONG và commit ngày 17/11/2026, CHƯA đưa lên mạng; ĐANG DỪNG chờ chủ dự án xem bản đồ vùng rồi mới quyết bước 3-5.
- BƯỚC 3 (thẻ "Vì sao sáp nhập", 18 mục) ĐÃ DỰNG XONG và commit ngày 17/11/2026, CHƯA đưa lên mạng. Chủ dự án đã duyệt danh sách nội dung và cách chia cấp tin cậy A-D (A văn bản chính thức; B phát biểu lãnh đạo, đề án qua báo tường thuật; C nghiên cứu, viện nghiên cứu quốc tế; D chuyên gia trên báo chính thống). Chủ dự án muốn CẢ HAI góc nhìn: văn bản chính thức để đối chiếu và ý kiến chuyên gia có dẫn nguồn uy tín. Đã xong, chủ dự án nói ổn.
- BƯỚC 4 (tour vùng: "TP.HCM sau hợp nhất" 6 bước, "Đường tới sân bay Long Thành" 5 bước) ĐÃ DỰNG XONG và commit ngày 17/11/2026, CHƯA đưa lên mạng; chủ dự án đã duyệt lời tour ngày 17/11/2026. BƯỚC 5 XONG 17/11/2026: đã push, website công khai có đủ phần vùng (đã kiểm tra trên trang thật). Trạng thái hạ tầng tra cùng ngày nên chưa tra lại; sau các mốc 30/11/2026 (Vành đai 3), 12/2026 (metro 6), 24/12/2026 (sân bay Long Thành) cần tra lại và sửa `ha_tang.csv`. Lời tour chỉ dùng dữ kiện trong ba file `data/vung/*.csv`; tiếng Anh mới có tiêu đề.
- Bước 3, việc nội dung còn mở: 3 mục "cần kiểm chứng" (bài East Asia Forum và bài IZA DP 18920 chưa đọc được bài gốc; hai con số so sánh với Bangkok, Jakarta trên VnExpress không ghi nguồn); chưa có bản tin hãng thông tấn quốc tế (Reuters, AP, Bloomberg, Financial Times: công cụ tra cứu không vào được, chờ chủ dự án gửi link nếu có); Đề án và Tờ trình chỉ đọc qua báo tường thuật. Nghị quyết 202 và 60 KHÔNG nêu lý do riêng cho việc hợp nhất ba địa phương; đừng viết như thể có.
- Bước 2, điều chủ dự án đã quyết (17/11/2026): xác nhận ba mục CHƯA khởi công (đường sắt Thủ Thiêm - Long Thành, cao tốc TP.HCM - Mộc Bài, cảng Cần Giờ) -> ghi "đã phê duyệt"; metro 2 kéo dài tới ranh Tây Ninh và metro kéo dài tới Long Thành giữ ở dạng "chủ trương, quy hoạch" (trạng thái `đề xuất`, chỉ hiện trong danh sách vì chưa có hướng tuyến); khu công nghiệp chỉ cần 3 khu VSIP.
- Chủ dự án đã duyệt cả 27 mục trong `data/vung/ha_tang.csv` ngày 17/11/2026, đã đổi nhãn thành "có". Việc nội dung còn mở của bước 2: metro 6 và metro Bình Dương - Suối Tiên xếp "đã phê duyệt" theo nghị quyết Thành ủy, chưa đối chiếu quyết định phê duyệt dự án; trạng thái tra từ báo chí ngày 17/11/2026, nhiều mốc sắp tới hạn (sân bay Long Thành 24/12/2026, Vành đai 3 cuối 11/2026, metro 6 khởi công 12/2026) nên cần tra lại trước khi đưa lên mạng.
- Chủ dự án đã xác nhận 6 mục trong `data/vung/vung.csv` là đúng (17/11/2026), gồm cả tên "Thành phố Đồng Nai" (trực thuộc trung ương từ 30/4/2026); đã đổi nhãn thành "có". Nhật ký chi tiết các giai đoạn cũ nằm ở `NHAT_KY.md`; chỉ đọc khi cần.

## Cấu trúc và ghi chú kỹ thuật cốt lõi

- `index.html`, `src/app.js` (bản đồ, ngôn ngữ, `window.SaBan`), mỗi lớp một file: `src/hanh_chinh.js`, `du_an.js`, `giao_thong.js`, `thuy.js`, `tour.js`. Không dùng deck.gl: xe và tàu là lớp `circle` của MapLibre cập nhật bằng `setData`.
- `scripts/cap_nhat.py` (chỉ thư viện có sẵn): đọc CSV trong `data/`, tải Overpass (lưu ở các thư mục `goc_osm/`, chạy lại không cần mạng, `--tai-lai` để tải mới), ghi GeoJSON/JSON và các file `BAO_CAO_KIEM_TRA*.txt`. Mẫu gộp nhiều truy vấn trong một lần gọi: `(...)->.s;.s out count;.s out geom;`.
- Overpass: chỉ dùng https://overpass-api.de/api/interpreter (hay lỗi 502, script tự thử lại).
- `data/`: `hanh_chinh/`, `du_an/` (`du_an.csv` + `hinh_dang_nguon.csv`), `giao_thong/` (giả định, kịch bản, mạng đường, tuyến và bến thủy), `tour/`, `ngon_ngu/giao_dien.csv` (`ma,vi,en`; gắn bằng `data-chu`).
- Mỗi lớp trong `window.SaBan` có `trung(point)`, `boChon()`, `dangChon()`; ưu tiên nhấp: đường thủy > dự án > hành chính; dùng chung thẻ `#the`. Chỉ thêm lớp sau sự kiện `load` (`S.khiNenSanSang`).
- Kiểm tra trong ứng dụng: khung trình duyệt bị ẩn thì bản đồ không vẽ, gọi `show_pane preview` trước; trình duyệt giữ bản cũ, tải lại bằng `fetch(url, {cache: 'reload'})` rồi `location.reload()`.
- Tên biến, tên file trong mã dùng tiếng Việt không dấu.
- Song ngữ (20/11/2026): mọi cột chữ hiện trên giao diện có cột `_en` đi kèm, đặt ngay sau cột gốc. Cột gốc có đuôi `_vi` thì cột Anh là `<goc>_en`; cột gốc không đuôi (`chu_dau_tu`, `van_ban`, `don_vi`, `nguon_ten`, `nguon_2_ten`, `vi_tri_ten`, `ghi_chu` của `gop_phuong.csv`) thì cột Anh là `<cot>_en` (ví dụ `don_vi_en`). Trong mã đọc bằng `S.cot(d, 'mo_ta')` (tự lấy `_en` khi xem tiếng Anh, trống thì lấy tiếng Việt). Tên quận/phường cũ đổi bằng `S.tenHC()` ("Quận 1" -> "District 1", "Phường Bến Nghé" -> "Bến Nghé Ward", "Thành phố Thủ Đức" -> "Thủ Đức City"). Nhãn cho trình đọc màn hình: thuộc tính `data-chu-nhan` (mã trong `giao_dien.csv`) -> `aria-label`.
- Tầm nhìn (từ bước 1 sa bàn vùng): `S.tam()` trả `'trung-tam'` hoặc `'vung'`, `S.datTam()`, `S.khiDoiTam(f)`; nút `#chon-tam`. Sang tầm vùng thì `app.js` tự bỏ đánh dấu 5 ô lớp trung tâm (nhớ lại để bật lại), thoát tour, đổi giới hạn bản đồ, và chỉ hiện các khối có `data-khoi` bằng tầm đang xem. Lớp vùng mới chỉ cần nghe `S.khiDoiTam`.
- Bảng lớp `#bang` (từ 20/11/2026): phần đầu `.dau-bang` (luôn hiện) + 3 cụm `<section class="cum">`, mỗi cụm có nút `.cum-nut` (`aria-expanded`, `aria-controls` = `cum-tour` / `cum-ranh-gioi` / `cum-ha-tang`) và khung `.cum-noi-dung`; bên trong mỗi cụm có một khối `data-khoi="trung-tam|vung|tay-nam-bo"` cho từng tầm (KHÔNG còn `#khoi-vung`, `#khoi-tay-nam-bo`, `#khoi-trung-tam`). Thêm mục cho tầm nào thì đặt vào khối `data-khoi` của tầm đó trong cụm hợp lý; `datTam` tự ẩn/hiện. Tiêu đề cụm: mã `che_do_hoc`, `cum_ranh_gioi`, `cum_ha_tang` trong `giao_dien.csv`. Trạng thái mở/đóng dùng chung cho cả ba tầm.
- `src/vung.js` + `data/vung/vung.csv` (mỗi dòng một tỉnh/thành; `nhom` = mới/cũ, `osm_id`, `thuoc`, `nhan_kinh_do`/`nhan_vi_do` là chỗ đặt tên trên bản đồ) -> `vung.geojson` do `xu_ly_vung` trong `cap_nhat.py` tạo (làm gọn khoảng 30 m).
- Quyết định: ranh giới tỉnh ven biển trên OpenStreetMap gồm cả mặt biển tới Côn Đảo, nên các lớp vùng được chèn DƯỚI lớp `water` của bản đồ nền (chỉ đất liền có màu, không có đường ranh ngoài biển) và nhấp vào mặt nước thì bỏ qua. Vì vậy diện tích tính từ hình vẽ không so được với diện tích chính thức.
- `src/ha_tang.js` + `data/vung/ha_tang.csv` (mỗi dòng một công trình; `nhom` = metro / đường sắt / đường bộ / sân bay / cảng / khu đô thị / khu công nghiệp; `noi_long_thanh` = "có" thì được đếm vào tóm tắt "Kết nối sân bay Long Thành"; `hinh_kieu` = `osm tuyến` / `osm vùng` / `điểm` / `điểm sơ đồ` / để trống; `hinh_tham_so` = câu truy vấn Overpass, chữ `KHUNG` được thay bằng khung vùng, nhiều câu ngăn bằng `;`, hoặc `kinh độ,vĩ độ`) -> `ha_tang.geojson` do `xu_ly_ha_tang` trong `cap_nhat.py` tạo, báo cáo ở `BAO_CAO_KIEM_TRA_HA_TANG.txt`. Trong geojson, `hinh` = tuyến / vùng / điểm / nhãn (nhãn là chỗ đặt tên cho tuyến và vùng).
- `src/vi_sao.js` + `data/vung/vi_sao_sap_nhap.csv` (mỗi dòng một ý; `nhom` = chính thức / góc nhìn / câu hỏi; `cap_tin_cay` = A/B/C/D, để trống với câu hỏi; `tieu_de_vi/en`, `noi_dung_vi/en`): website đọc thẳng file CSV, không có file trung gian. Nút `#nut-vi-sao` ở phần đầu bảng của tầm vùng mở thẻ `#the`; nội dung bọc trong `.vs-the` để biết thẻ đang mở là thẻ này. `kiem_tra_vi_sao` trong `cap_nhat.py` kiểm tra định dạng, báo cáo ở `BAO_CAO_KIEM_TRA_VI_SAO.txt`. `S.viSao.mo()`.
- Tour vùng: `data/tour/tour.csv` cột `tam` = `vung` / `trung-tam`; `buoc.csv` thêm cột `danh_dau` (mã trong `ha_tang.csv` hoặc `vung.csv`, ngăn bằng `|`, tô đậm không mở thẻ) và `nut` (`vi-sao` = nút mở thẻ "Vì sao sáp nhập", tour tạm ẩn tới khi thẻ đóng); ở tour vùng `lop` chỉ nhận `long-thanh` (chỉ hiện tuyến nối Long Thành). Danh sách tour vùng ở `#ds-tour-vung`; mở tour tự đổi tầm. `S.haTang.danhDau()`, `S.haTang.datChiLongThanh()`, `S.vung.danhDau()`. Khung bay chừa đúng chiều cao khung tour; điện thoại tự lùi 0,9 mức thu phóng. Kiểm tra: `kiem_tra_buoc_vung` trong `cap_nhat.py`.
- Tra cứu web: thuvienphapluat.vn và eastasiaforum.org chặn công cụ đọc trang; toàn văn nghị quyết đọc được trên nhandan.vn.
- Ở tầm vùng, ưu tiên nhấp: hạ tầng (`S.haTang`) > ranh giới (`S.vung`). Nhãn trạng thái ở tầm vùng: `đã phê duyệt` hiện là "đã phê duyệt, chưa khởi công", `đề xuất` hiện là "chủ trương, quy hoạch".
- Tầm Tây Nam Bộ (bước 1, 17/11/2026): `S.tam()` có thêm `'tay-nam-bo'`; các khối `data-khoi="tay-nam-bo"` trong bảng; thân trang có lớp `tam-tnb`. Rời tầm trung tâm sang tầm nào cũng tắt 5 ô lớp trung tâm (chỉ nhớ trạng thái khi rời từ trung tâm). `src/tay_nam_bo.js` (`S.tnb`: `chon(loai, ma)`, `boChon()`, `trung()`, `datKy('truoc'|'sau')`) đọc `data/tay_nam_bo/tinh.csv` (cùng cột với `vung.csv`; địa phương cũ có `thuoc` = mã tỉnh mới, màu lấy theo tỉnh mới) + `tinh.geojson` + `diem.csv` (3 vị trí chiến lược: `kinh_do`, `vi_do`, `mo_ta_vi/en`, `vi_tri` = link OpenStreetMap của toạ độ). Nút "Trước / Sau sáp nhập" chỉ hiện một bộ ranh giới mỗi lần. Ưu tiên nhấp: điểm > ranh giới. Hướng đặt tên điểm nằm trong `HUONG_NHAN` ở đầu `tay_nam_bo.js`.
- Hạ tầng Tây Nam Bộ (bước 2, 18/11/2026): `src/ha_tang_tnb.js` (`S.htTnb`: `trung`, `trungDiem`, `chon`, `boChon`) + `data/tay_nam_bo/ha_tang.csv` -> `ha_tang.geojson`, báo cáo `BAO_CAO_KIEM_TRA_HA_TANG.txt`. Cột như `data/vung/ha_tang.csv` nhưng bỏ `noi_long_thanh`, thêm `cap_tin_cay` (A văn bản/cổng nhà nước, B báo chính thống, C trang doanh nghiệp/du lịch) và cột tiếng Anh `moc_thoi_gian_en`, `mo_ta_en`, `ghi_chu_en` (đã dịch sẵn). `nhom` = cao tốc / đường bộ / tàu, phà / đường thủy / cảng, bến / sân bay. `hinh_kieu` thêm `sơ đồ tuyến` (`hinh_tham_so` = các cặp `kinh độ,vĩ độ` cách nhau bằng dấu cách; vẽ bằng chuỗi chấm). Câu truy vấn Overpass trong CSV dùng nháy đơn. Python: `xu_ly_ha_tang` (vùng) và `xu_ly_ha_tang_tnb` dùng chung `xu_ly_ha_tang_chung(cau_hinh)`. Lớp hạ tầng nằm trên ranh giới, dưới chấm điểm chiến lược. Ưu tiên nhấp ở tầm Tây Nam Bộ: hạ tầng > điểm chiến lược > ranh giới; ngoại lệ (quyết định kỹ thuật): nhấp đúng tâm chấm điểm chiến lược mà chỉ có tuyến hoặc chấm sơ đồ đè lên (cao tốc qua Cần Thơ, cảng Hòn Khoai) thì chọn điểm chiến lược. Nhãn trạng thái ở tầm này dùng nhãn thường ("đã phê duyệt", "đề xuất"), không dùng nhãn riêng của tầm vùng.
- Kiểm tra khi khung xem thử trong ứng dụng bị ẩn (bản đồ không vẽ): mở http://localhost:8000/ bằng Chrome của người dùng; cỡ điện thoại thì nhúng trang vào một khung `iframe` rộng 390 px (đổi cỡ cửa sổ Chrome không có tác dụng khi cửa sổ đang phóng to).
- `cap_nhat.py`: `xu_ly_vung` và `xu_ly_tay_nam_bo` dùng chung `xu_ly_ranh_gioi` (mỗi tỉnh mới tự so tổng diện tích các tỉnh cũ hợp thành; lệch quá 3% thì cảnh báo). Báo cáo ở `data/tay_nam_bo/BAO_CAO_KIEM_TRA.txt`. Ranh giới mới và cũ của Tây Nam Bộ khớp nhau (lệch ≤ 0,1%).
- Bản đồ nhỏ: `src/ban_do_nho.js`, khối `#ban-do-nho`; là một bản đồ MapLibre thứ hai, không tương tác, kiểu nền tự viết (chỉ nước + biên giới quốc gia từ OpenFreeMap), tự ghi nhãn "Hoàng Sa", "Trường Sa", "Hà Nội", "TP.HCM"; khung đỏ theo vùng đang xem, vùng quá nhỏ thì thêm chấm đỏ. Nút × thu gọn, nhớ bằng localStorage. Điện thoại: góc trái dưới (trên thước tỉ lệ); laptop: góc phải dưới (thẻ thông tin mở ra sẽ che, chấp nhận).
- Chụp màn hình khung xem thử ở cỡ điện thoại hay bị cắt hoặc lặp ô; khi đó kiểm bằng toạ độ (`banDo.project`) và `getBoundingClientRect`.
- Xem thử trong ứng dụng: nếu cổng 8000 đã có máy chủ của phiên khác thì `preview_start` không chạy được (lệnh ghi cứng cổng 8000); cứ `navigate` tới http://localhost:8000/ là được vì cùng thư mục.
- Lệnh Bash dài có heredoc hay lỗi dấu nháy trên máy này: ghi script ra file bằng công cụ Write rồi mới chạy.
- Blackboard (20/11/2026): `src/bang_den.js` (`S.bangDen`: `mo(ma?)`, `dong()`, `boGhim()`) + khối `#bang-den` (lớp CSS `bden-*`, z-index 8, phủ cả trang) + nút `#nut-bang-den` trong `.nut-tren`. Website đọc thẳng `data/bang_den/bang_den.csv` (không file trung gian); cột bắt buộc `ma, tieu_de_vi, tep, tam, nguon_ten, ngay_cap_nhat, da_kiem_chung`, cột thêm `tieu_de_en, anh_nho, kinh_do, vi_do, thu_phong, mo_ta_vi/en, nguon_ten_en, nguon`. Loại file theo đuôi: ảnh (jpg/jpeg/png/webp) phóng to trong trang (bấm để phóng 250%), PDF nhúng `iframe` khi `navigator.pdfViewerEnabled` và màn hình ≥ 768 px, còn lại (điện thoại) hiện ảnh thu nhỏ + nút mở thẻ mới; CSV đọc bằng `S.docHang` (mới tách từ `docCSV` trong `app.js`), thử UTF-8 rồi windows-1258, hiện tối đa 500 dòng. Dòng sai thì bỏ qua và liệt kê trong ô lời báo vàng cuối bảng (song ngữ); file PDF/CSV thiếu được dò bằng yêu cầu HEAD. Ghim: `chonTam` đổi tầm nếu điểm nằm ngoài khung tầm hiện tại (dùng `S.cacTam()`, `S.gioiHanTam(t)` mới thêm trong `app.js`), rồi `flyTo` (thu phóng mặc định 16 / 11 / 10) và cắm `maplibregl.Marker`; đổi tầm thì gỡ ghim. Kiểm tra: `kiem_tra_bang_den` trong `cap_nhat.py` (đúng chữ hoa/thường vì GitHub Pages phân biệt, file > 50 MB là lỗi, > 10 MB cảnh báo, ảnh dùng làm ảnh thu nhỏ > 2 MB cảnh báo, file thừa trong thư mục cảnh báo vì vẫn bị đưa lên mạng); báo cáo `data/bang_den/BAO_CAO_KIEM_TRA.txt`. Chữ phấn: phông Patrick Hand (Google Fonts, có tiếng Việt). Quyết định kỹ thuật: Python không có thư viện đọc ảnh/PDF nên không tự tạo ảnh thu nhỏ (ảnh dùng chính nó, PDF/CSV dùng biểu tượng hoặc cột `anh_nho`); màn hình < 520 px nút chỉ còn biểu tượng và tên trang được xuống 2 dòng; poster mẫu tạo bằng Edge chạy ẩn (`msedge --headless=new --screenshot / --print-to-pdf`).

## SA BÀN VÙNG: kế hoạch đã được chủ dự án duyệt (17/11/2026)

Chủ đề bài giảng: quy hoạch tổng thể TP.HCM sau sáp nhập với Bình Dương và Bà Rịa - Vũng Tàu; mạng cao tốc, vành đai, metro, đường sắt nối đô thị, khu công nghiệp, cảng, sân bay với Đồng Nai, Tây Ninh; ý nghĩa chiến lược của Long Thành, Cái Mép, Cần Giờ.

Cách tích hợp: MỘT website, thêm nút chuyển "Toàn vùng / Trung tâm". Tầm vùng chỉ có ranh giới, tuyến và điểm (không tòa nhà, không mô phỏng xe/tàu). Các lớp chi tiết hiện có chỉ hiện ở tầm trung tâm. Dùng lại khung CSV + Overpass + thẻ + tour.

Các bước (mỗi bước chủ dự án duyệt một lần; MỖI BƯỚC MỘT PHIÊN MỚI để tiết kiệm token):
1. Khung vùng: mở rộng khung bản đồ; nút Toàn vùng / Trung tâm; ranh giới TP.HCM mới, ba địa phương cũ (TP.HCM, Bình Dương, Bà Rịa - Vũng Tàu), Đồng Nai, Tây Ninh từ OpenStreetMap.
2. Hạ tầng vùng: tra cứu MỘT lượt, gửi MỘT danh sách để duyệt, rồi dựng.
   -> DỪNG sau bước 2 để chủ dự án xem bản đồ vùng rồi mới quyết các bước sau.
3. Thẻ "Vì sao sáp nhập" (đã xong 17/11/2026). 4. Tour vùng (đã xong, duyệt 17/11/2026). 5. Đưa lên mạng.

Yêu cầu của chủ dự án cho bước 2:
- Khu công nghiệp: chỉ đánh dấu vài cụm lớn, PHẢI có các khu VSIP.
- Đồng Nai, Tây Ninh: chỉ ranh giới và các tuyến nối sang (metro, cao tốc, đường sắt tốc độ cao); không làm dự án nội tỉnh.
- Kết nối sân bay Long Thành - TP.HCM phải làm RÕ: có bao nhiêu tuyến đường bộ và đường sắt; tuyến nào đã có, đang xây, chưa khởi công.
- Metro nội đô là trọng tâm (bài giảng có một phần riêng): vẽ đường đi tuyến 1, 2, 4, 6 và các tuyến đã có quyết định đầu tư, đang chuẩn bị mặt bằng để khởi công và hoàn thành trước 2030.
- Phải có: đường sắt Bến Thành - Cần Giờ, khu đô thị lấn biển Cần Giờ, tuyến vượt biển Cần Giờ - Vũng Tàu. Chủ dự án cho biết cả ba đã khởi công và đang xây quy mô lớn; ĐÂY LÀ LỜI CHỦ DỰ ÁN, CHƯA CÓ NGUỒN: phải tra nguồn rồi mới ghi trạng thái, nếu nguồn nói khác thì báo lại.
- Cũng cần: sân bay Long Thành, cảng nước sâu Cái Mép, cảng Cần Giờ, cao tốc, vành đai 3 và 4, đường sắt tốc độ cao.

Quy tắc nội dung cho phần vùng:
- "Nguyên nhân sáp nhập" và "ý nghĩa địa chính trị" là diễn giải: chỉ nêu lý do có trong văn bản chính thức và phân tích có dẫn nguồn; phần địa chính trị đặt thành câu hỏi gợi mở, website không tự khẳng định.
- Tiết kiệm token: tra cứu gộp, duyệt gộp; tiếng Anh chỉ dịch tên; không thêm chi tiết ngoài yêu cầu; trả lời ngắn.
- Gợi ý có sẵn từ OpenStreetMap (đã thấy khi dò ngày 14/11/2026, chưa kiểm): tuyến dự kiến "Đường sắt đô thị Bến Thành-Cần Giờ", "Đường sắt Thủ Thiêm-Long Thành", "Đường sắt cao tốc Bắc - Nam", metro tuyến 2, 3, 4, 6, 7 dạng `railway=proposed/construction`.


## SA BÀN TÂY NAM BỘ: kế hoạch đã được chủ dự án duyệt (17/11/2026)

Chủ đề: 3 vị trí chiến lược của Tây Nam Bộ và mạng giao thông đặc thù của vùng.
- Cần Thơ: thành phố trực thuộc trung ương, trung tâm kinh tế, hành chính, chính trị của vùng.
- Cà Mau: cảng Hòn Khoai (chủ dự án gọi là "cảng lưỡng dụng") và đường từ đất liền ra cảng; ý nghĩa kinh tế, quốc phòng, địa chính trị.
- Phú Quốc: quân sự, kinh tế du lịch, địa chính trị (án ngữ vịnh Thái Lan); tuyến nối đất liền ra đảo.
- Giao thông: đường thủy truyền thống (sông ngòi chằng chịt); cao tốc hình "xương cá" (logistics, xuất khẩu nông sản, an ninh quốc phòng); tuyến đường ven biển (liên vùng, du lịch, kinh tế ven biển).

Điều chủ dự án đã quyết:
- Cách tích hợp: nút chọn tầm thêm lựa chọn thứ ba "Tây Nam Bộ". Cách làm giống tầm vùng (ranh giới, tuyến, điểm, thẻ, tour; không tòa nhà, không xe/tàu chạy).
- Phạm vi: vẽ ranh giới toàn vùng, có chế độ "Trước / Sau sáp nhập"; CHỈ làm chi tiết 3 điểm chiến lược và các trục nối chúng. Các tỉnh khác chỉ có ranh giới.
- Giao thông thủy: chỉ vẽ tuyến và bến đứng yên.
- Bản đồ nhỏ (minimap) ở góc dưới: hình Việt Nam, có khung chữ nhật chỉ vùng đang xem trên bản đồ lớn, giúp sinh viên quốc tế hình dung. Quyết định kỹ thuật: hiện ở cả ba tầm.
- Tiếng Anh: bản tiếng Anh phải 100% tiếng Anh, thuật ngữ chuyên ngành chuẩn; tên riêng, địa danh giữ nguyên tiếng Việt CÓ dấu (không bỏ dấu, không dịch). Chủ dự án quyết (17/11/2026): dịch bù sang tiếng Anh đầy đủ phần đã làm (lời tour vùng, thẻ "Vì sao sáp nhập" đang chỉ có tiêu đề tiếng Anh) SAU KHI dựng xong bản đồ Tây Nam Bộ (sau bước 4, trước hoặc cùng bước 5).

Cần tra nguồn trước khi ghi (lời chủ dự án hoặc hiểu biết chưa kiểm chứng):
- Kiên Giang có nhập vào An Giang từ 1/7/2025 và Phú Quốc là đặc khu thuộc An Giang không. Nếu đúng: ghi "Đặc khu Phú Quốc (An Giang)", tên Kiên Giang chỉ ở bản đồ trước 2025.
- Trạng thái thật của cảng Hòn Khoai, tính chất "lưỡng dụng", đường ra cảng, tuyến nối đất liền ra Phú Quốc. Nguồn nói khác thì báo lại.
- Phần quốc phòng, địa chính trị: chỉ nêu điều có nguồn (cấp tin cậy A-D như thẻ "Vì sao sáp nhập"), còn lại đặt thành câu hỏi gợi mở.

Đã tra (17/11/2026, bước 1):
- Nghị quyết 202/2025/QH15, Điều 1, khoản 18-23 (toàn văn đọc được trên daibieunhandan.vn): Long An + Tây Ninh -> tỉnh Tây Ninh; Cần Thơ + Sóc Trăng + Hậu Giang -> thành phố Cần Thơ; Bến Tre + Trà Vinh + Vĩnh Long -> tỉnh Vĩnh Long; Tiền Giang + Đồng Tháp -> tỉnh Đồng Tháp; Bạc Liêu + Cà Mau -> tỉnh Cà Mau; Kiên Giang + An Giang -> tỉnh An Giang. Nghị quyết không nêu nơi đặt trung tâm hành chính.
- Phú Quốc là đặc khu thuộc tỉnh An Giang từ 1/7/2025 (Báo Nhân Dân, cổng thông tin phuquoc.angiang.gov.vn); văn bản gốc là Nghị quyết 1654/NQ-UBTVQH15 ngày 16/6/2025 nhưng CHƯA đọc được toàn văn (hoatieu.vn chặn, angiang.gov.vn lỗi chứng chỉ) -> "cần kiểm chứng".
- Hòn Khoai: ngày 19/8/2025 khởi công Cảng tổng hợp lưỡng dụng Hòn Khoai, tuyến giao thông ra đảo và cao tốc Cà Mau - Đất Mũi, Bộ Quốc phòng làm chủ đầu tư (camau.gov.vn). Các nguồn chưa thống nhất số liệu quy mô; tra lại ở bước 2.

Các bước (mỗi bước chủ dự án duyệt một lần; MỖI BƯỚC MỘT PHIÊN MỚI):
1. Khung bản đồ Tây Nam Bộ: nút tầm thứ ba, ranh giới tỉnh mới và cũ (OpenStreetMap), đánh dấu 3 điểm; bản đồ nhỏ Việt Nam. ĐÃ DỰNG XONG 17/11/2026 (chủ dự án chọn vẽ cả Tây Ninh mới gồm Long An); ĐÃ DUYỆT 17/11/2026. Còn 2 mục "cần kiểm chứng" trong `data/tay_nam_bo/diem.csv` (Phú Quốc: chưa đọc toàn văn NQ 1654; Hòn Khoai: số liệu quy mô, tra lại ở bước 2).
2. Hạ tầng: tra một lượt, gửi một danh sách để duyệt (cao tốc xương cá, đường ven biển, đường thủy chính và bến, cảng Hòn Khoai và đường ra cảng, tuyến ra Phú Quốc, sân bay và cảng trên đảo), mỗi mục có trạng thái; rồi dựng. ĐÃ DỰNG XONG 18/11/2026 (22 mục). Điều tra được: KHÔNG có nguồn nào về cầu/hầm nối đất liền ra Phú Quốc (chỉ tàu, phà, máy bay; tin "đường vượt biển" đã bị Ban QLDA Hà Tiên bác); chữ "lưỡng dụng" CÓ trong tên chính thức của cảng Hòn Khoai trên cổng tỉnh Cà Mau; chủ đầu tư cảng: cổng tỉnh ghi Bộ Quốc phòng, báo SGGP ghi Quân chủng Hải quân; tuyến ra đảo và cảng dự kiến xong nửa đầu 2029 (lời Bộ trưởng Quốc phòng). Ngày 17-18/11/2026 công cụ đọc trang bị lỗi nên dữ kiện lấy từ bản tóm tắt của công cụ tìm kiếm, CHƯA đọc toàn văn; vì vậy 17/22 mục để "cần kiểm chứng" (danh sách trong `data/tay_nam_bo/BAO_CAO_KIEM_TRA_HA_TANG.txt`). Năm mục chỉ ở danh sách vì chưa có hình đáng tin: cao tốc Hà Tiên - Rạch Giá - Bạc Liêu, hai đoạn ven biển Kiên Giang, ven biển phía Đông, tuyến ra đảo Hòn Khoai. Cao tốc Cà Mau - Đất Mũi trên OpenStreetMap mới vẽ một đoạn. Mốc cần tra lại: Mỹ An - Cao Lãnh và Cao Lãnh - An Hữu (cuối 12/2026), mở rộng sân bay Phú Quốc (4/2027), Châu Đốc - Cần Thơ - Sóc Trăng (2027).
3. Thẻ "Vị trí chiến lược" cho Cần Thơ, Hòn Khoai, Phú Quốc.
4. Tour (1-2 tour).
5. Đưa lên mạng.
