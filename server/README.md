# 后端服务（多用户集中存储）

零依赖（仅 Node 内置模块），数据自动落盘到 `data/db.json`。

## 启动

```bash
cd server
node server.js
```

启动后监听 `http://localhost:3000`。前端 `utils/config.js` 里的 `API_BASE` 默认指向它。

> 真机 / 局域网多设备联调时：把 `API_BASE` 改成运行本服务的电脑局域网 IP（如 `http://192.168.1.10:3000`），并保证手机和电脑在同一网络。

## 接口

| 方法 | 路径 | 说明 |
|---|---|---|
| POST | /api/auth/register | 注册（账号唯一），成功返回 token + 用户 |
| POST | /api/auth/login | 登录，返回 token + 用户 |
| GET | /api/me | 当前登录用户（需 token） |
| GET | /api/items | 失物招领广场（全部共享） |
| GET | /api/items/mine | 我的发布（需 token） |
| POST | /api/items | 发布（需 token，自动绑定发布者） |
| GET | /api/items/:id | 单条详情 + 发布者名片 |
| PUT | /api/items/:id | 编辑（仅本人） |
| DELETE | /api/items/:id | 删除（仅本人） |

受保护接口在请求头带 `Authorization: Bearer <token>`。
