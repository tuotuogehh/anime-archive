# 时光番库

按年代、题材和形式浏览 1900 年以来的动画作品。目录收录在 Bangumi 至少有 1 人评分、且有封面和简介的动画条目，显示 Bangumi 社区评分和评分人数，支持搜索、筛选及本地片单。

## 本地预览

```sh
cd dist
python3 -m http.server 4173
```

浏览器打开 `http://localhost:4173/`。

## GitHub Pages

仓库的 `main` 分支每次更新时，`.github/workflows/pages.yml` 会发布 `dist/`。首次发布需要在仓库 **Settings → Pages → Build and deployment** 中选择 **GitHub Actions**。

## 数据说明

作品资料与评分来自 [Bangumi 公共 API](https://github.com/bangumi/server/blob/master/openapi/v0.yaml)，数据在生成目录时更新；评分不会在每次打开网站时实时同步。封面由 Bangumi 图片服务提供，作品详情可跳转到原条目。网站不提供动画视频。
