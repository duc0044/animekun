# Dành cho nhà phát triển Website

## Danh sách phim

### Phim mới cập nhật
**GET** `https://phim.nguonc.com/api/films/phim-moi-cap-nhat?page=${page}`

Ví dụ: `https://phim.nguonc.com/api/films/phim-moi-cap-nhat?page=1`

### Phim theo danh mục
**GET** `https://phim.nguonc.com/api/films/danh-sach/${slug}?page=${page}`

Ví dụ: `https://phim.nguonc.com/api/films/danh-sach/phim-dang-chieu?page=1`

---

## Phim & Tập Phim

### Thông tin Phim & Danh sách tập phim
**GET** `https://phim.nguonc.com/api/film/${slug}`

Ví dụ: `https://phim.nguonc.com/api/film/hoa-thien-cot`

---

## Thể loại & Quốc gia & Năm

### Phim theo thể loại
**GET** `https://phim.nguonc.com/api/films/the-loai/${slug}?page=${page}`

Ví dụ: `https://phim.nguonc.com/api/films/the-loai/hanh-dong?page=1`

### Phim theo quốc gia
**GET** `https://phim.nguonc.com/api/films/quoc-gia/${slug}?page=${page}`

Ví dụ: `https://phim.nguonc.com/api/films/quoc-gia/au-my?page=1`

### Phim theo năm
**GET** `https://phim.nguonc.com/api/films/nam-phat-hanh/${slug}?page=${page}`

Ví dụ: `https://phim.nguonc.com/api/films/nam-phat-hanh/2024?page=1`

---

## Tìm Phim

### Tìm kiếm phim
**GET** `https://phim.nguonc.com/api/films/search?keyword=${slug}`

Ví dụ: `https://phim.nguonc.com/api/films/search?keyword=Regeneration`