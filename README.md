# Pomore

Aplikasi Pomodoro Timer yang dibangun dengan React + TypeScript + Vite untuk membantu meningkatkan produktivitas dengan teknik Pomodoro.

## Fitur Utama

- ⏰ Timer Pomodoro dengan sesi kerja dan istirahat
- 🔔 Notifikasi browser ketika sesi selesai
- 🎵 Pemutar musik terintegrasi
- 📋 Manajemen tugas
- ⚙️ Pengaturan yang dapat disesuaikan

## Cara Mengaktifkan Notifikasi Browser

Untuk mendapatkan pengalaman terbaik, aktifkan notifikasi browser:

### Chrome/Edge:

1. Klik ikon gembok/info di sebelah kiri URL
2. Pilih "Notifications" → "Allow"
3. Atau buka Settings → Privacy and Security → Site Settings → Notifications

### Firefox:

1. Klik ikon perisai/gembok di sebelah kiri URL
2. Klik "Permissions" → ubah Notifications ke "Allow"
3. Atau buka Preferences → Privacy & Security → Permissions → Notifications

### Safari:

1. Buka Safari → Preferences → Websites → Notifications
2. Cari domain aplikasi dan ubah ke "Allow"

### Mobile (Chrome/Safari):

1. Buka pengaturan browser
2. Cari "Site Settings" atau "Website Settings"
3. Pilih "Notifications" dan izinkan untuk domain aplikasi

## Teknologi yang Digunakan

- React 18 + TypeScript
- Vite untuk build tool
- Tailwind CSS untuk styling
- Framer Motion untuk animasi
- Web Notifications API untuk notifikasi browser

## Expanding the ESLint configuration

If you are developing a production application, we recommend updating the configuration to enable type-aware lint rules:

```js
export default tseslint.config({
  extends: [
    // Remove ...tseslint.configs.recommended and replace with this
    ...tseslint.configs.recommendedTypeChecked,
    // Alternatively, use this for stricter rules
    ...tseslint.configs.strictTypeChecked,
    // Optionally, add this for stylistic rules
    ...tseslint.configs.stylisticTypeChecked,
  ],
  languageOptions: {
    // other options...
    parserOptions: {
      project: ["./tsconfig.node.json", "./tsconfig.app.json"],
      tsconfigRootDir: import.meta.dirname,
    },
  },
});
```

You can also install [eslint-plugin-react-x](https://github.com/Rel1cx/eslint-react/tree/main/packages/plugins/eslint-plugin-react-x) and [eslint-plugin-react-dom](https://github.com/Rel1cx/eslint-react/tree/main/packages/plugins/eslint-plugin-react-dom) for React-specific lint rules:

```js
// eslint.config.js
import reactX from "eslint-plugin-react-x";
import reactDom from "eslint-plugin-react-dom";

export default tseslint.config({
  extends: [
    // other configs...
    // Enable lint rules for React
    reactX.configs["recommended-typescript"],
    // Enable lint rules for React DOM
    reactDom.configs.recommended,
  ],
  languageOptions: {
    // other options...
    parserOptions: {
      project: ["./tsconfig.node.json", "./tsconfig.app.json"],
      tsconfigRootDir: import.meta.dirname,
    },
  },
});
```
