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
- MapLibre GL JS; nền OpenFreeMap (không cần key).
- Python 3.12 xử lý dữ liệu (gọi bằng `py`). Git 2.56. Cả hai cài bằng winget ngày 13/11/2026.
- `xem_thu.bat`: bấm đúp để xem website trên máy. `cap_nhat_du_lieu.bat`: bấm đúp để xử lý lại toàn bộ dữ liệu.
- Song ngữ Việt + Anh: dữ liệu có cột `_vi` và `_en`; cột `_en` trống thì hiện tiếng Việt. Chữ giao diện nằm trong `data/ngon_ngu/`.
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

## Trạng thái (cập nhật 17/11/2026)

- Sa bàn TRUNG TÂM đã xong cả 8 giai đoạn và đang chạy công khai; chủ dự án đã thử trên điện thoại.
- Việc nội dung còn mở của sa bàn trung tâm: duyệt các mục "cần kiểm chứng" (18 hình dạng phường, 15 dự án, 5 tuyến thủy), duyệt lời tour, hai trạng thái xếp tạm (Trung tâm Tài chính quốc tế, Nhà hát). Chưa ai bấm đúp thử `cap_nhat_du_lieu.bat` và `dua_len_mang.bat`.
- Đang làm: SA BÀN VÙNG (xem mục dưới). BƯỚC 1 (khung vùng) đã được chủ dự án duyệt ngày 17/11/2026. BƯỚC 2 (hạ tầng vùng, 27 mục) ĐÃ DỰNG XONG và commit ngày 17/11/2026, CHƯA đưa lên mạng; ĐANG DỪNG chờ chủ dự án xem bản đồ vùng rồi mới quyết bước 3-5.
- BƯỚC 3 (thẻ "Vì sao sáp nhập", 18 mục) ĐÃ DỰNG XONG và commit ngày 17/11/2026, CHƯA đưa lên mạng. Chủ dự án đã duyệt danh sách nội dung và cách chia cấp tin cậy A-D (A văn bản chính thức; B phát biểu lãnh đạo, đề án qua báo tường thuật; C nghiên cứu, viện nghiên cứu quốc tế; D chuyên gia trên báo chính thống). Chủ dự án muốn CẢ HAI góc nhìn: văn bản chính thức để đối chiếu và ý kiến chuyên gia có dẫn nguồn uy tín. Đã xong, chủ dự án nói ổn.
- BƯỚC 4 (tour vùng: "TP.HCM sau hợp nhất" 6 bước, "Đường tới sân bay Long Thành" 5 bước) ĐÃ DỰNG XONG và commit ngày 17/11/2026, CHƯA đưa lên mạng; đã gửi lời tour, ĐANG CHỜ chủ dự án duyệt. Lời tour chỉ dùng dữ kiện trong ba file `data/vung/*.csv`; tiếng Anh mới có tiêu đề.
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
- Tầm nhìn (từ bước 1 sa bàn vùng): `S.tam()` trả `'trung-tam'` hoặc `'vung'`, `S.datTam()`, `S.khiDoiTam(f)`; nút `#chon-tam`. Sang tầm vùng thì `app.js` tự bỏ đánh dấu 5 ô lớp trung tâm (nhớ lại để bật lại), thoát tour, đổi giới hạn bản đồ, ẩn `#khoi-trung-tam` và hiện `#khoi-vung`. Lớp vùng mới chỉ cần nghe `S.khiDoiTam`.
- `src/vung.js` + `data/vung/vung.csv` (mỗi dòng một tỉnh/thành; `nhom` = mới/cũ, `osm_id`, `thuoc`, `nhan_kinh_do`/`nhan_vi_do` là chỗ đặt tên trên bản đồ) -> `vung.geojson` do `xu_ly_vung` trong `cap_nhat.py` tạo (làm gọn khoảng 30 m).
- Quyết định: ranh giới tỉnh ven biển trên OpenStreetMap gồm cả mặt biển tới Côn Đảo, nên các lớp vùng được chèn DƯỚI lớp `water` của bản đồ nền (chỉ đất liền có màu, không có đường ranh ngoài biển) và nhấp vào mặt nước thì bỏ qua. Vì vậy diện tích tính từ hình vẽ không so được với diện tích chính thức.
- `src/ha_tang.js` + `data/vung/ha_tang.csv` (mỗi dòng một công trình; `nhom` = metro / đường sắt / đường bộ / sân bay / cảng / khu đô thị / khu công nghiệp; `noi_long_thanh` = "có" thì được đếm vào tóm tắt "Kết nối sân bay Long Thành"; `hinh_kieu` = `osm tuyến` / `osm vùng` / `điểm` / `điểm sơ đồ` / để trống; `hinh_tham_so` = câu truy vấn Overpass, chữ `KHUNG` được thay bằng khung vùng, nhiều câu ngăn bằng `;`, hoặc `kinh độ,vĩ độ`) -> `ha_tang.geojson` do `xu_ly_ha_tang` trong `cap_nhat.py` tạo, báo cáo ở `BAO_CAO_KIEM_TRA_HA_TANG.txt`. Trong geojson, `hinh` = tuyến / vùng / điểm / nhãn (nhãn là chỗ đặt tên cho tuyến và vùng).
- `src/vi_sao.js` + `data/vung/vi_sao_sap_nhap.csv` (mỗi dòng một ý; `nhom` = chính thức / góc nhìn / câu hỏi; `cap_tin_cay` = A/B/C/D, để trống với câu hỏi; `tieu_de_vi/en`, `noi_dung_vi/en`): website đọc thẳng file CSV, không có file trung gian. Nút `#nut-vi-sao` ở đầu `#khoi-vung` mở thẻ `#the`; nội dung bọc trong `.vs-the` để biết thẻ đang mở là thẻ này. `kiem_tra_vi_sao` trong `cap_nhat.py` kiểm tra định dạng, báo cáo ở `BAO_CAO_KIEM_TRA_VI_SAO.txt`. `S.viSao.mo()`.
- Tour vùng: `data/tour/tour.csv` cột `tam` = `vung` / `trung-tam`; `buoc.csv` thêm cột `danh_dau` (mã trong `ha_tang.csv` hoặc `vung.csv`, ngăn bằng `|`, tô đậm không mở thẻ) và `nut` (`vi-sao` = nút mở thẻ "Vì sao sáp nhập", tour tạm ẩn tới khi thẻ đóng); ở tour vùng `lop` chỉ nhận `long-thanh` (chỉ hiện tuyến nối Long Thành). Danh sách tour vùng ở `#ds-tour-vung`; mở tour tự đổi tầm. `S.haTang.danhDau()`, `S.haTang.datChiLongThanh()`, `S.vung.danhDau()`. Khung bay chừa đúng chiều cao khung tour; điện thoại tự lùi 0,9 mức thu phóng. Kiểm tra: `kiem_tra_buoc_vung` trong `cap_nhat.py`.
- Tra cứu web: thuvienphapluat.vn và eastasiaforum.org chặn công cụ đọc trang; toàn văn nghị quyết đọc được trên nhandan.vn.
- Ở tầm vùng, ưu tiên nhấp: hạ tầng (`S.haTang`) > ranh giới (`S.vung`). Nhãn trạng thái ở tầm vùng: `đã phê duyệt` hiện là "đã phê duyệt, chưa khởi công", `đề xuất` hiện là "chủ trương, quy hoạch".
- Xem thử trong ứng dụng: nếu cổng 8000 đã có máy chủ của phiên khác thì `preview_start` không chạy được (lệnh ghi cứng cổng 8000); cứ `navigate` tới http://localhost:8000/ là được vì cùng thư mục.
- Lệnh Bash dài có heredoc hay lỗi dấu nháy trên máy này: ghi script ra file bằng công cụ Write rồi mới chạy.

## SA BÀN VÙNG: kế hoạch đã được chủ dự án duyệt (17/11/2026)

Chủ đề bài giảng: quy hoạch tổng thể TP.HCM sau sáp nhập với Bình Dương và Bà Rịa - Vũng Tàu; mạng cao tốc, vành đai, metro, đường sắt nối đô thị, khu công nghiệp, cảng, sân bay với Đồng Nai, Tây Ninh; ý nghĩa chiến lược của Long Thành, Cái Mép, Cần Giờ.

Cách tích hợp: MỘT website, thêm nút chuyển "Toàn vùng / Trung tâm". Tầm vùng chỉ có ranh giới, tuyến và điểm (không tòa nhà, không mô phỏng xe/tàu). Các lớp chi tiết hiện có chỉ hiện ở tầm trung tâm. Dùng lại khung CSV + Overpass + thẻ + tour.

Các bước (mỗi bước chủ dự án duyệt một lần; MỖI BƯỚC MỘT PHIÊN MỚI để tiết kiệm token):
1. Khung vùng: mở rộng khung bản đồ; nút Toàn vùng / Trung tâm; ranh giới TP.HCM mới, ba địa phương cũ (TP.HCM, Bình Dương, Bà Rịa - Vũng Tàu), Đồng Nai, Tây Ninh từ OpenStreetMap.
2. Hạ tầng vùng: tra cứu MỘT lượt, gửi MỘT danh sách để duyệt, rồi dựng.
   -> DỪNG sau bước 2 để chủ dự án xem bản đồ vùng rồi mới quyết các bước sau.
3. Thẻ "Vì sao sáp nhập" (đã xong 17/11/2026). 4. Tour vùng (đã dựng 17/11/2026, chờ duyệt lời). 5. Đưa lên mạng.

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

