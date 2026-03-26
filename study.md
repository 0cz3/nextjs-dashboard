## CSSスタイリング
Tailwind CSS
clsxライブラリを使用してクラス名を条件に応じて切り替えできる
例)InvoiceStatus
アイコン
pnpm add @heroicons/react

### フォント最適化: next/font使用
ビルド時にフォントファイルをダウンロードしてホストするため、ユーザーのアクセスする際にリクエストが発生しない。
レイアウトシフトも防ぐことができCLS的にも◯

### 画像最適化: next/image使用
異なる画面サイズ対応、デバイス毎のサイズ対応、レイアウトシフト、遅延読み込みができる？

## ファイルシステムルーティング
layout.tsx・page.tsxで各ルートのUIを個別に作成（フォルダで紐づけられる）
layout.tsxは配下の複数ページに影響させられる

### ルート間の移動
**<Link>** クライアントサイドのナビゲーション、一部だけリロードする（フルリロード発生しない）
SPAだと最初の読み込みで全てロードが発生するのに対し、ルート毎に分離されてロードするので効率がいい
本番環境ではリンク先を自動でプリフェッチしているので繊維が早い

## データベース
**チュートリアルの構成**
**lib/placeholder-data.ts**・・・テストデータ
**lib/data.ts**・・・データ取得SELECT
SUM(CASE WHEN status = 'paid' THEN amount ELSE 0 END) AS "paid"など取得したデータを加工できる
**lib/action.ts**・・・書き込み・変更など（createInvoice()、updateInvoice()）
**seed/route.ts**・・・テーブル作成など、DBのSQL文へ直書きも可
**lib/definitions.ts**・・・型定義
参考: https://www.sejuku.net/blog/104588
SERIAL PRIMARY KEY 自動連番交付
NOT NULL null禁止
型 DEFAULT 値 デフォルト値

## データ取得呼び出し（ウォーターフォールvs並列データ取得）

### ウォーターフォール
先行するデータに依存する後続処理が必要な場合
前処理を待つのでパフォーマンス低下の懸念

### 並列データ取得(上記必要ない場合はこっち)
全てのデータ取得のリクエストを同時に開始する
javascriptのPromise.all()などを使用
例: /app/lib/data.ts fetchCardData()

## レンダリング（静的vs動的）

### 静的レンダリング
ビルド時、データ再検証時にサーバ側で実施
ユーザがアプリにアクセスするとキャッシュされた結果が返される
**メリット**
毎回ページ生成が走らず高速、サーバ負荷が低い
読み込み時にすでにコンテンツが存在するため、クローラーがインデックスしやすくなりSEO強い
**使用場面**
データが不要なUI、ユーザ間で共通の静的データを扱うページ（ブログ記事や商品ページ）

### 動的レンダリング
ユーザがページにアクセスした時点でサーバーでコンテンツがレンダリングされる
**メリット**
リアルタイムデータを表示できる、ユーザ固有のコンテンツが表示できる（操作に応じて更新）
リクエスト時の情報（Cookie, パラメータ）のアクセス時の情報を取得してそれに基づいてページを動的生成できる
**使用場面**
ダッシュボード、在庫状況、為替レートなどデータが頻繁に変わるもの
**注意点**
動的レンダリングでは、アプリケーションの表示速度は「最も遅いデータ取得の処理速度」に依存する。
fetchRevenue() 関数内のsetTimeout参照

### ストリーミング
遅いデータリクエストによってページ全体の表示がブロックされるのを防ぐ
ページ全体のデータが揃うのを待たずに、準備ができた部分から順次UIを表示・操作できる
**Next.jsでは**
- loading.tsx(ページ)
- <Suspense>（コンポーネント）
  - スケルトン
呼び出しが重い動的なコンポーネントに使用して他部分を優先的に表示させる？
例: RevenueChart()コンポーネントの呼び出し部分に使用
TODO: <LatestInvoices>のストリーミング

### Route Group
URL構造を変えずにファイルを論理的にグループ化
 (marketing) や (shop) のように、機能別・チーム別にセクションを分けるのにも
**つまづいたポイント**、インポートは治さなければいけないらしくエラーになった

### Partial Prerendering
canaryリリース
同じルート内で静的レンダリングと動的レンダリングの利点を組み合わせることができる
TODO:未実装積み残し


## 機能
### 検索
**useSearchParams**: 現在のURLの検索パラメータを取得
**usePathname**: 現在のURLのパス名を取得
**useRouter**: クライアントコンポーネント内でプログラム的にルート遷移するために使用
例: Search.tsx
ユーザの入力からクエリ作成、URL更新
メモ: 状態管理を行わない場合はdefaultValue使用
**つまづいたポイント**
マウントされないとエラーになる
✖️import { useRouter } from 'next/router';
◯import { useRouter } from 'next/navigation';
TODO: デバウンス
入力一文字ごとにリクエストしているためライブラリ use-debounce を使用する

### ページネーション

###  サーバーアクション
'use server';を記述することでサーバー側で処理する
**zod** 型検証ライブラリ
**revalidatePath**: サーバーアクションでデータを更新した後に実行し、キャッシュをクリアして画面を最新状態に更新する
プリフェッチされたデータとの整合性を保つ
(実行文/app/lib/actions.ts 参照)
{ ssl: 'require' }は暗号化通信
postgresについて: https://github.com/porsager/postgres
インストール(暗号化bcryptも):
pnpm add postgres bcrypt
pnpm add -D @types/bcrypt

formタグに埋め込んで呼び出し action={deleteInvoiceWithId}など
**引数は呼び出し側でバケツリレーせずにコンポーネント側で定義で良い**

フォルダ名を角括弧で囲むことで、動的なルートを作成できる([id][post][slug])
(動的な値[id]などはコンポーネントから受け取ってhrefのパスに埋め込み /app/ui/invoices/table.tsx, /app/ui/invoices/buttons.tsx参照)

TODO chapter12-（エラーハンドリング、アクセシビリティ、認証、メタデータ追加）

