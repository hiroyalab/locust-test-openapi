# OpenAPI Locust Architect

OpenAPI (YAML) を読み込み、各エンドポイントに対して動的に Locust 負荷テストを生成・実行するアプリケーションです。

## 特徴

- **OpenAPI 読み込み**: YAMLファイルをアップロードするだけでエンドポイントを自動抽出。
- **動的パラメータ**: 各パラメータに `fake.name()` や `fake.random_int()` などの Python スニペットを設定し、大量のバリエーションを持つリクエストを生成可能。
- **リアルタイム管理**: ダッシュボードから重み付け（Weight）の設定やテストの開始・停止が可能。
- **プレミアムUI**: ガラスモーフィズムを採用したモダンなダッシュボード。

## セットアップ

### 1. 依存関係のインストール

```bash
uv sync
cd frontend && npm install
```

### 2. アプリケーションの起動

#### バックエンド
```bash
uv run python backend/main.py
```
(ポータル: Port 8001 で待機)

#### フロントエンド
別ターミナルで：
```bash
cd frontend && npm run dev
```
(ブラウザで表示された URL にアクセスしてください)

## 使い方

1. フロントエンドのダッシュボードを開きます。
2. `example-openapi.yaml` をアップロードします。
3. エンドポイントを選択し、パラメータの設定（Faker スニペットなど）を行います。
4. 「START TEST」をクリックすると Locust が起動し、自動的に Locust UI (Port 8089) が開きます。