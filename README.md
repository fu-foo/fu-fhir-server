# fu-fhir-server

## 概説

簡易FHIRサーバーです。あくまでも教育用ということで簡易的な実装、かつパフォーマンス等考慮しない実装になっています。本番利用は非推奨。
JAHISの勉強会用に作成。

PatientのCRUD、Validation、１つのSearchParameter対応くらいの内容。

## 使い方

・事前準備
Node.jsをインストール（v22.15.0で確認）

・インストール
git clone https://github.com/fu-foo/fu-fhir-server

cd fu-fhir-server

npm install

・実行
fu-fhir-serverディレクトリにて

npm start

ブラウザーでclient.htmlを開いて、ブラウザーからCRUD操作を行う。

## お断り

教育用なので実際の実装で扱うには色々問題があります。
（データ量が増えればパフォーマンスが下がる一方など。MongoDBなど外部DBを使う実装が現実的。）
手元で確認する用なのでCORSも無視するようにしてますが、実運用ではNGです。

## ライセンス

THE BEER-WARE LICENSE
