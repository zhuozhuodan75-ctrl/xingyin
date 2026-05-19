# services/（规划）

本目录用于承载 **Supabase 数据访问层**，目标是将页面内的 mock 数据与 `uni.*` 端能力调用解耦：

- `services/supabaseClient.*`：初始化 Supabase client（URL / anon key 等配置）
- `services/posts.*`：信息流、帖子详情、发布作品
- `services/storage.*`：音频与头像上传、生成 public / signed URL
- `services/profile.*`：用户资料读取与更新
- `services/interactions.*`：点赞、评论、关注
- `services/checkins.*`：打卡、连续天数、成就发放

在正式接入 Supabase 前，该目录仅作为结构规划占位。

