# mcp-mysql-ts

Server [Model Context Protocol (MCP)](https://modelcontextprotocol.io/) untuk MySQL. Tool `mysql_query` memungkinkan klien MCP (misalnya Cursor) menjalankan **satu** pernyataan SQL setiap kali dipanggil.

**Mode bawaan: hanya baca (read-only).** Perintah seperti `INSERT`, `UPDATE`, `DELETE`, dan DDL tidak akan dijalankan kecuali Anda mengaktifkan variabel lingkungan khusus (lihat bagian di bawah).

## Persyaratan

- Node.js **≥ 20**

Komunikasi memakai **stdio** (bukan HTTP). Kredensial dan opsi MySQL diatur lewat variabel lingkungan pada konfigurasi MCP (`env`) atau di sistem.

## Instalasi di Cursor

1. Buka **Settings → MCP**, atau edit file `mcp.json` untuk akun Cursor Anda.
2. Tambahkan entri server seperti contoh berikut. Perintah `npx -y` akan mengambil paket dari npm registry lalu menjalankannya (tanpa instal global).

```json
{
  "mcpServers": {
    "mysql": {
      "command": "npx",
      "args": ["-y", "mcp-mysql-ts"],
      "env": {
        "MYSQL_HOST": "127.0.0.1",
        "MYSQL_USER": "root",
        "MYSQL_PASSWORD": "password"
      }
    }
  }
}
```

Sesuaikan nilai `env` dengan server MySQL Anda.

## Manual dari clone repository

Clone repositori, pasang dependensi, lalu build:

```bash
git clone <url-repo> mcp-mysql-ts
cd mcp-mysql-ts
pnpm install && pnpm run build
```

Setelah itu, daftarkan server MCP dengan **`node`** dan **path absolut** ke file `dist/index.js` di folder proyek Anda:

```json
{
  "mcpServers": {
    "mysql": {
      "command": "node",
      "args": ["C:/Users/Username/proyek/mcp-mysql-ts/dist/index.js"],
      "env": {
        "MYSQL_HOST": "127.0.0.1",
        "MYSQL_USER": "root",
        "MYSQL_PASSWORD": "password"
      }
    }
  }
}
```

Ganti path di `args` sesuai lokasi clone. Setelah mengubah sumber TypeScript, jalankan lagi `pnpm run build`.

## Variabel lingkungan

### Koneksi

| Variabel | Default | Keterangan |
|----------|---------|------------|
| `MYSQL_HOST` | `127.0.0.1` | Host MySQL |
| `MYSQL_PORT` | `3306` | Port |
| `MYSQL_USER` | `root` | Nama pengguna |
| `MYSQL_PASSWORD` | *(tidak diset = string kosong)* | Kata sandi |
| `MYSQL_DATABASE` | *(opsional)* | Database yang dipilih setelah koneksi |
| `MYSQL_MAX_ROWS` | `500` | Batas baris hasil `SELECT` yang ditampilkan |

### Mengizinkan operasi tulis

Perintah **baca** (`SELECT`, `SHOW`, `DESCRIBE`, `EXPLAIN`, dan sejenisnya) selalu diperbolehkan.

Untuk mengizinkan **tulis** atau **DDL**, aktifkan jenis yang diinginkan dengan variabel berikut. Nilai yang dianggap aktif: `true`, `1`, `yes`, atau `on` (tidak case-sensitive).

| Variabel | Mengizinkan |
|----------|-------------|
| `ALLOW_INSERT_OPERATION` | `INSERT` / `REPLACE` |
| `ALLOW_UPDATE_OPERATION` | `UPDATE` |
| `ALLOW_DELETE_OPERATION` | `DELETE` |
| `ALLOW_DDL_OPERATION` | DDL (`CREATE`, `ALTER`, `DROP`, dll.) |

Jika suatu variabel tidak diset, atau nilainya bukan salah satu di atas, jenis operasi itu tetap **ditolak** (tetap read-only untuk jenis tersebut).

## Perilaku lain

- Satu permintaan hanya boleh berisi **satu** pernyataan SQL (tidak boleh beberapa perintah dipisah `;`).
- Hasil `SELECT` ditampilkan sebagai teks berkolom; jumlah baris dibatasi oleh `MYSQL_MAX_ROWS`.
