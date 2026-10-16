# CLAUDE.md

Panduan dan referensi untuk AI agent yang bekerja di repositori `voxian-shift-dashboard`.

## Gambaran Proyek

`voxian-shift-dashboard` adalah monorepo TypeScript yang dikelola menggunakan `pnpm`:

- `apps/web`: Aplikasi frontend Next.js 16 (React 19, Tailwind CSS, shadcn/ui, Radix UI).
- `apps/api`: Layanan backend API menggunakan Fastify.
- `packages/shared`: Tipe data bersama, utilitas, dan skema validasi (Zod).

## Perintah Utama

- **Development**: `pnpm dev` (menjalankan seluruh aplikasi via workspace)
- **Instal Dependensi**: `pnpm install`
- **Lint**: `pnpm lint`
- **Build**: `pnpm build`
- **Optimasi Token (RTK)**: Saat menjalankan operasi dev, gunakan perintah RTK (`rtk gain`, `rtk discover`, dll.) untuk efisiensi token.

---

## Aturan Styling & Komponen UI (KETAT - JANGAN DI-OVERRIDE)

- **Utamakan dan Wajib Menggunakan Existing UI Components**:
  - Selalu prioritaskan komponen yang sudah tersedia di [`apps/web/src/components/ui/`](apps/web/src/components/ui) (`button`, `card`, `badge`, `dialog`, `sheet`, `select`, `sidebar`, `input`, `textarea`, `tabs`, `table`, `dropdown-menu`, `avatar`, `switch`, `checkbox`, `radio-group`, `sonner`, `tooltip`, `progress`, `skeleton`, dll.) serta komponen domain di [`apps/web/src/components/`](apps/web/src/components).
  - Jika butuh komponen tampilan, cek terlebih dahulu folder `apps/web/src/components/ui/` dan `apps/web/src/components/`. Jangan membuat komponen baru dari tag HTML mentah (`<button>`, `<select>`, `<input>`) jika versi shadcn/ui sudah ada.
- **DILARANG Menambahkan CSS Baru atau Meng-override CSS yang Ada**:
  - **JANGAN** pernah menambahkan file CSS baru, inline `<style>`, atau aturan kelas baru ke dalam [`apps/web/src/app/globals.css`](apps/web/src/app/globals.css).
  - **JANGAN** pernah meng-override atau me-reset variabel tema CSS, utility class yang sudah ada (`.radar-workspace`, `.meter-workbench`, `.evidence-panel`, dll.), atau styling bawaan komponen.
  - Semua penataan layout dan styling harus disusun murni menggunakan utility class Tailwind yang sudah terkonfigurasi dengan token tema semantik (`bg-background`, `bg-card`, `text-foreground`, `text-muted-foreground`, `border-border`, dsb.). Tidak boleh menggunakan hardcoded hex color.

---

## Agent Skills

### Pelacak Masalah (Issue Tracker)

Isu dan tiket lokal dicatat dalam format markdown di dalam folder `.scratch/`. Lihat [`docs/agents/issue-tracker.md`](docs/agents/issue-tracker.md).

### Label Triage

Menggunakan 5 label peran triage kanonikal default (`needs-triage`, `needs-info`, `ready-for-agent`, `ready-for-human`, `wontfix`). Lihat [`docs/agents/triage-labels.md`](docs/agents/triage-labels.md).

### Dokumentasi Domain (Domain Docs)

Single-context (`GLOSSARY.md` + `docs/adr/` di root repositori). Lihat [`docs/agents/domain.md`](docs/agents/domain.md).

---

## Alur Wawancara & Perencanaan (`/grill-me`)

Saat menjalankan `/grill-me`, `/grill-with-docs`, atau ketika pengguna meminta untuk "di-grill" terkait fitur atau keputusan arsitektur:

1. **Wawancara Mendalam (Relentless Interviewing)**: Wawancarai pengguna secara menyeluruh hingga mencapai pemahaman bersama yang jelas tanpa asumsi tersembunyi. Petakan masalah sebagai **pohon desain (design tree)** di mana keputusan tingkat tinggi bercabang ke sub-keputusan.
2. **Jalankan Frontier dalam Tiap Putaran (Rounds)**:
   - _Frontier_ adalah semua keputusan yang prasyaratnya sudah disepakati bersama.
   - Untuk setiap pertanyaan di frontier, beri nomor dan sertakan rekomendasi jawaban sehingga pengguna cukup mengetik "yes" untuk menyetujuinya:
     ```markdown
     ❓ **Q1** - **<Judul Pertanyaan>**: <Konteks pertanyaan / opsi pilihan>
     ➡️ **Rekomendasi**: <Rekomendasi jawaban terbaik>
     ```
   - Gunakan tool `AskUserQuestion` jika interaksi pilihan terstruktur membantu pengguna.
3. **Cari Fakta Mandiri Terlebih Dahulu (Fact-Finding First)**:
   - Mencari fakta dari codebase atau environment adalah tugas AI agent, bukan tugas pengguna.
   - Telusuri file, packages, dan kode terlebih dahulu sebelum bertanya. Jangan menanyakan hal yang bisa dicek langsung di dalam kode.
4. **Dokumentasikan Artefak Secara Lokal**:
   - Issue tracker lokal aktif di `.scratch/<feature>/`.
   - Spesifikasi fitur dibuat via `/to-spec` ke dalam `.scratch/<feature>/spec.md`.
   - Tiket/tugas terpisah dibuat via `/to-tickets` ke dalam `.scratch/<feature>/issues/01-<slug>.md`.
   - Model domain dan istilah kosakata dicatat ke `GLOSSARY.md`.
   - Keputusan arsitektur dicatat ke dalam `docs/adr/000X-<keputusan>.md`.
