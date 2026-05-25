# API KKPhim - Dành cho nhà phát triển Website xem phim

## Danh sách phim

### Phim mới cập nhật

`GET https://phimapi.com/danh-sach/phim-moi-cap-nhat?page=${page}`

Ví dụ: `GET https://phimapi.com/danh-sach/phim-moi-cap-nhat?page=1`

Ví dụ V2: `GET https://phimapi.com/danh-sach/phim-moi-cap-nhat-v2?page=1`

Ví dụ V3: `GET https://phimapi.com/danh-sach/phim-moi-cap-nhat-v3?page=1`

**Thông số kỹ thuật:**
- Ở bản V2 + V3, đã được bổ sung các kết quả khác nhau phục vụ cho từng nhu cầu khác nhau. Bạn có thể truy xuất thử và áp dụng cho mình khi cần thiết.

## Phim & Tập Phim (có hỗ trợ TMDB ID)

### Thông tin Phim & Danh sách tập phim

`GET https://phimapi.com/phim/{slug}`

Ví dụ: `https://kkphim.com/phim/ngoi-truong-xac-song GET https://phimapi.com/phim/ngoi-truong-xac-song`

### Thông tin dựa theo TMDB ID

`GET https://phimapi.com/tmdb/{type}/{id}`

Ví dụ: `GET https://phimapi.com/tmdb/tv & movie/280945`

**Thông số kỹ thuật:**
- `type = tv` [dành cho các phim thuộc phim bộ, bao gồm hoạt hình + tv shows]. `movie` [tương tự type tv]
- Mục này chỉ dành cho những phim mà KKPhim có hỗ trợ TMDB ID.

## Danh sách tổng hợp

### Tổng hợp danh sách phim có thể sử dụng

`GET https://phimapi.com/v1/api/danh-sach/{type_list}?page={page}&sort_field={sort_field}&sort_type={sort_type}&sort_lang={sort_lang}&category={category}&country={country}&year={year}&limit={limit}`

Ví dụ: `GET https://phimapi.com/v1/api/danh-sach/phim-bo?page=1&sort_field=_id&sort_type=asc&sort_lang=long-tieng&category=hanh-dong&country=trung-quoc&year=2024&limit=10`

**Thông số kỹ thuật:**
- `type_list` = phim-bo, phim-le, tv-shows, hoat-hinh, phim-vietsub, phim-thuyet-minh, phim-long-tieng
- `page` = Số trang cần truy xuất, sử dụng [totalPages] để biết tổng trang khả dụng.
- `sort_field` = modified.time > tính theo thời gian cập nhật, _id > lấy theo ID của phim, year > lấy theo số năm phát hành của phim.
- `sort_type` = desc hoặc asc.
- `sort_lang` = vietsub > phim có Vietsub, thuyet-minh > phim có Thuyết Minh, long-tieng > phim có Lồng Tiếng.
- `category` = Thể loại phim cần lấy, sử dụng API phimapi.com/the-loai để lấy chi tiết slug.
- `country` = Quốc gia phim cần lấy, sử dụng API phimapi.com/quoc-gia để lấy chi tiết slug.
- `year` = Năm phát hành của phim (1970 - hiện tại).
- `limit` = Giới hạn kết quả (tối đa 64).

## Tìm kiếm

### Tìm kiếm phim

`GET https://phimapi.com/v1/api/tim-kiem?keyword={keyword}?page={page}&sort_field={sort_field}&sort_type={sort_type}&sort_lang={sort_lang}&category={category}&country={country}&year={year}&limit={limit}`

Ví dụ: `GET https://phimapi.com/v1/api/tim-kiem?keyword=Thước&page=1&sort_field=_id&sort_type=asc&sort_lang=long-tieng&category=hanh-dong&country=trung-quoc&year=2024&limit=10`

**Thông số kỹ thuật:**
- `keyword` = Từ khóa bạn cần tìm kiếm.
- `page` = Số trang cần truy xuất, sử dụng [totalPages] để biết tổng trang khả dụng.
- `sort_field` = modified.time > tính theo thời gian cập nhật, _id > lấy theo ID của phim, year > lấy theo số năm phát hành của phim.
- `sort_type` = desc hoặc asc.
- `sort_lang` = vietsub > phim có Vietsub, thuyet-minh > phim có Thuyết Minh, long-tieng > phim có Lồng Tiếng.
- `category` = Thể loại phim cần lấy, sử dụng API phimapi.com/the-loai để lấy chi tiết slug.
- `country` = Quốc gia phim cần lấy, sử dụng API phimapi.com/quoc-gia để lấy chi tiết slug.
- `year` = Năm phát hành của phim (1970 - hiện tại).
- `limit` = Giới hạn kết quả (tối đa 64).

## Thể loại - Thể loại chi tiết

### Thể loại phim

`GET https://phimapi.com/the-loai`

### Chi tiết của thể loại

`GET https://phimapi.com/v1/api/the-loai/{type_list}?page={page}&sort_field={sort_field}&sort_type={sort_type}&sort_lang={sort_lang}&country={country}&year={year}&limit={limit}`

Ví dụ: `GET https://phimapi.com/v1/api/the-loai/hanh-dong?page=1&sort_field=_id&sort_type=asc&sort_lang=long-tieng&country=trung-quoc&year=2024&limit=10`

**Thông số kỹ thuật:**
- `type_list` = Thể loại phim cần lấy, sử dụng API phimapi.com/the-loai để lấy chi tiết slug.
- `page` = Số trang cần truy xuất, sử dụng [totalPages] để biết tổng trang khả dụng.
- `sort_field` = modified.time > tính theo thời gian cập nhật, _id > lấy theo ID của phim, year > lấy theo số năm phát hành của phim.
- `sort_type` = desc hoặc asc.
- `sort_lang` = vietsub > phim có Vietsub, thuyet-minh > phim có Thuyết Minh, long-tieng > phim có Lồng Tiếng.
- `country` = Quốc gia phim cần lấy, sử dụng API phimapi.com/quoc-gia để lấy chi tiết slug.
- `year` = Năm phát hành của phim (1970 - hiện tại).
- `limit` = Giới hạn kết quả (tối đa 64).

## Quốc gia - Quốc gia chi tiết

### Quốc gia phim

`GET https://phimapi.com/quoc-gia`

### Chi tiết của quốc gia

`GET https://phimapi.com/v1/api/quoc-gia/{type_list}?page={page}&sort_field={sort_field}&sort_type={sort_type}&sort_lang={sort_lang}&category={category}&country={country}&year={year}&limit={limit}`

Ví dụ: `GET https://phimapi.com/v1/api/quoc-gia/trung-quoc?page=1&sort_field=_id&sort_type=asc&sort_lang=long-tieng&category=hanh-dong&year=2024&limit=10`

**Thông số kỹ thuật:**
- `type_list` = Quốc gia phim cần lấy, sử dụng API phimapi.com/quoc-gia để lấy chi tiết slug.
- `page` = Số trang cần truy xuất, sử dụng [totalPages] để biết tổng trang khả dụng.
- `sort_field` = modified.time > tính theo thời gian cập nhật, _id > lấy theo ID của phim, year > lấy theo số năm phát hành của phim.
- `sort_type` = desc hoặc asc.
- `sort_lang` = vietsub > phim có Vietsub, thuyet-minh > phim có Thuyết Minh, long-tieng > phim có Lồng Tiếng.
- `category` = Thể loại phim cần lấy, sử dụng API phimapi.com/the-loai để lấy chi tiết slug.
- `year` = Năm phát hành của phim (1970 - hiện tại).
- `limit` = Giới hạn kết quả (tối đa 64).

## Năm

### Năm

`GET https://phimapi.com/v1/api/nam/{type_list}?page={page}&sort_field={sort_field}&sort_type={sort_type}&sort_lang={sort_lang}&category={category}&country={country}&limit={limit}`

Ví dụ: `GET https://phimapi.com/v1/api/nam/2024?page=1&sort_field=_id&sort_type=asc&sort_lang=long-tieng&category=hanh-dong&country=trung-quoc&limit=10`

**Thông số kỹ thuật:**
- `type_list` = Năm phát hành của phim (1970 - hiện tại).
- `page` = Số trang cần truy xuất, sử dụng [totalPages] để biết tổng trang khả dụng.
- `sort_field` = modified.time > tính theo thời gian cập nhật, _id > lấy theo ID của phim, year > lấy theo số năm phát hành của phim.
- `sort_type` = desc hoặc asc.
- `sort_lang` = vietsub > phim có Vietsub, thuyet-minh > phim có Thuyết Minh, long-tieng > phim có Lồng Tiếng.
- `category` = Thể loại phim cần lấy, sử dụng API phimapi.com/the-loai để lấy chi tiết slug.
- `country` = Quốc gia phim cần lấy, sử dụng API phimapi.com/quoc-gia để lấy chi tiết slug.
- `limit` = Giới hạn kết quả (tối đa 64).

## Chuyển đổi ảnh

### Chuyển đổi ảnh sang WEBP

`GET https://phimapi.com/image.php?url={liên kết ảnh từ KKPhim}`

Ví dụ: `GET https://phimapi.com/image.php?url=https://phimimg.com/upload/vod/20250624-1/6295cf08845cf14b511410c7547d336a.jpg`

**Thông số kỹ thuật:**
- `url` = Chèn liên kết hình ảnh mặc định mà KKPhim trả về cho bạn.
- Với tính năng này, bạn sẽ được KKPhim trả lại ảnh có định dạng .webp thay vì .jpg, giúp website của bạn tăng tốc độ tải ảnh cũng như SEO. Hãy sử dụng nó khi bạn cần, mọi chuyện khác để KKPhim lo <3.