# 趣味みつかる

`docs/01_spec.md` の要件に基づく、趣味探し＆継続支援アプリ。

## 技術スタック
- フロントエンド：Vite + React
- デプロイ先：Vercel（Hobbyプラン）
- データベース：Vercel Postgres（Neon） + Prisma
- API：Vercel Functions（`api/`）

## セットアップ

1. 依存関係のインストール
   ```
   npm install
   ```
2. Vercel Dashboard の Storage タブで Postgres（Neon）を作成し、接続情報を `.env.local` にコピー
   ```
   cp .env.local.example .env.local
   ```
3. Prismaのマイグレーションとシード投入
   ```
   npx prisma migrate dev --name init
   npm run prisma:seed
   ```
4. ローカル起動（API込みで確認する場合は `vercel dev` を推奨）
   ```
   vercel dev
   ```
   フロントの見た目だけ確認する場合は `npm run dev`（この場合 `/api` は動きません）。

## 画面構成

1. `/login` ログイン・新規登録
2. `/profile` 性別・年齢・興味の入力
3. `/quiz` 軽い性格診断（興味の入力が多い場合は追加設問あり）
4. `/suggestions` 趣味の提案（レベル別 / キーワード検索）
5. `/dashboard` キャラクター表示・成長日記
6. `/share/:token` 達成の共有ページ（認証不要）
