# Tokopetei

Repositori ini berisi kode sumber untuk aplikasi E-Commerce full-stack, yang dibuat dengan frontend React and backend Django.

### Fitur
-   **Autentikasi Pengguna**: User dapat register, login, dan logout.
-   **Daftar Produk**: Menampilkan semua produk yang tersedia.
-   **Detail Produk**: Melihat detail informasi untuk setiap produk.
-   **Keranjang Belanja**: Pengguna dapat menambahkan produk ke keranjang, melihat isi keranjang, dan menghapus produk dari keranjang.

### Struktur Proyek
-   `backend/SBF-PTI-E-Commerce`: Proyek Django untuk aplikasi sisi server.
-   `frontend/e-commerce-kitah`: Proyek React untuk antarmuka pengguna sisi klien.

### Frontend (e-commerce-kitah)
Aplikasi React untuk antarmuka pengguna.

**Untuk menjalankan frontend:**
1.  `cd frontend/e-commerce-kitah`
2.  `npm install`
3.  `npm run dev`

### Backend (SBF-PTI-E-Commerce)
Proyek Django untuk API backend.

**Untuk menjalankan backend:**
1.  `cd backend/SBF-PTI-E-Commerce`
2.  `python -m venv venv`
3.  `venv\Scripts\activate`
4.  `pip install -r requirements.txt`
5.  `python manage.py migrate`
6.  `python manage.py runserver`

