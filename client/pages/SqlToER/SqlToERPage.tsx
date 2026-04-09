import { Alert, Button, Space, Typography } from "antd";
import { useCallback, useRef, useState } from "react";
import { ERDiagram } from "@client/components/ERDiagram/ERDiagram";
import { parseSqlToERData } from "@client/utils/sqlParser";
import type { RelationshipData, TableData } from "@client/components/ERDiagram/types";
import "./SqlToERPage.less";

const { Title, Text } = Typography;

const DEMO_SQL = `CREATE TABLE \`users\` (
  \`id\` INT NOT NULL AUTO_INCREMENT COMMENT '用户ID',
  \`username\` VARCHAR(50) NOT NULL COMMENT '用户名',
  \`email\` VARCHAR(200) NOT NULL COMMENT '邮箱',
  \`password_hash\` VARCHAR(255) NOT NULL COMMENT '密码哈希',
  \`avatar_url\` VARCHAR(500) DEFAULT NULL COMMENT '头像URL',
  \`status\` TINYINT NOT NULL DEFAULT 1 COMMENT '状态: 1正常 0禁用',
  \`created_at\` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  \`updated_at\` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '更新时间',
  PRIMARY KEY (\`id\`),
  UNIQUE KEY \`uk_email\` (\`email\`),
  UNIQUE KEY \`uk_username\` (\`username\`)
) COMMENT='用户表';

CREATE TABLE \`roles\` (
  \`id\` INT NOT NULL AUTO_INCREMENT COMMENT '角色ID',
  \`name\` VARCHAR(50) NOT NULL COMMENT '角色名称',
  \`description\` VARCHAR(200) DEFAULT NULL COMMENT '描述',
  \`created_at\` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (\`id\`),
  UNIQUE KEY \`uk_name\` (\`name\`)
) COMMENT='角色表';

CREATE TABLE \`user_roles\` (
  \`id\` INT NOT NULL AUTO_INCREMENT,
  \`user_id\` INT NOT NULL COMMENT '用户ID',
  \`role_id\` INT NOT NULL COMMENT '角色ID',
  \`created_at\` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (\`id\`),
  KEY \`idx_user_id\` (\`user_id\`),
  KEY \`idx_role_id\` (\`role_id\`),
  CONSTRAINT \`fk_ur_user\` FOREIGN KEY (\`user_id\`) REFERENCES \`users\` (\`id\`) ON DELETE CASCADE,
  CONSTRAINT \`fk_ur_role\` FOREIGN KEY (\`role_id\`) REFERENCES \`roles\` (\`id\`) ON DELETE CASCADE
) COMMENT='用户角色关联表';

CREATE TABLE \`posts\` (
  \`id\` BIGINT NOT NULL AUTO_INCREMENT COMMENT '帖子ID',
  \`author_id\` INT NOT NULL COMMENT '作者ID',
  \`title\` VARCHAR(200) NOT NULL COMMENT '标题',
  \`summary\` VARCHAR(500) DEFAULT NULL COMMENT '摘要',
  \`content\` TEXT COMMENT '正文内容',
  \`cover_image\` VARCHAR(500) DEFAULT NULL COMMENT '封面图URL',
  \`category_id\` INT DEFAULT NULL COMMENT '分类ID',
  \`tags\` VARCHAR(200) DEFAULT NULL COMMENT '标签，逗号分隔',
  \`view_count\` INT NOT NULL DEFAULT 0 COMMENT '浏览量',
  \`like_count\` INT NOT NULL DEFAULT 0 COMMENT '点赞数',
  \`comment_count\` INT NOT NULL DEFAULT 0 COMMENT '评论数',
  \`is_top\` TINYINT NOT NULL DEFAULT 0 COMMENT '是否置顶: 1是 0否',
  \`is_recommend\` TINYINT NOT NULL DEFAULT 0 COMMENT '是否推荐: 1是 0否',
  \`allow_comment\` TINYINT NOT NULL DEFAULT 1 COMMENT '是否允许评论',
  \`status\` TINYINT NOT NULL DEFAULT 1 COMMENT '状态: 0草稿 1已发布 2已下线',
  \`published_at\` DATETIME DEFAULT NULL COMMENT '发布时间',
  \`deleted_at\` DATETIME DEFAULT NULL COMMENT '软删除时间',
  \`created_at\` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  \`updated_at\` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (\`id\`),
  KEY \`idx_author\` (\`author_id\`),
  KEY \`idx_category\` (\`category_id\`),
  KEY \`idx_status_published\` (\`status\`, \`published_at\`),
  CONSTRAINT \`fk_post_author\` FOREIGN KEY (\`author_id\`) REFERENCES \`users\` (\`id\`),
  CONSTRAINT \`fk_post_category\` FOREIGN KEY (\`category_id\`) REFERENCES \`categories\` (\`id\`)
) COMMENT='帖子表';

CREATE TABLE \`categories\` (
  \`id\` INT NOT NULL AUTO_INCREMENT COMMENT '分类ID',
  \`name\` VARCHAR(50) NOT NULL COMMENT '分类名',
  \`parent_id\` INT DEFAULT NULL COMMENT '父分类ID',
  \`sort_order\` INT NOT NULL DEFAULT 0 COMMENT '排序',
  PRIMARY KEY (\`id\`),
  KEY \`idx_parent\` (\`parent_id\`),
  CONSTRAINT \`fk_cat_parent\` FOREIGN KEY (\`parent_id\`) REFERENCES \`categories\` (\`id\`)
) COMMENT='分类表';

CREATE TABLE \`comments\` (
  \`id\` BIGINT NOT NULL AUTO_INCREMENT COMMENT '评论ID',
  \`post_id\` BIGINT NOT NULL COMMENT '帖子ID',
  \`user_id\` INT NOT NULL COMMENT '评论用户ID',
  \`parent_id\` BIGINT DEFAULT NULL COMMENT '父评论ID（回复）',
  \`content\` TEXT NOT NULL COMMENT '评论内容',
  \`created_at\` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (\`id\`),
  KEY \`idx_post\` (\`post_id\`),
  KEY \`idx_user\` (\`user_id\`),
  CONSTRAINT \`fk_comment_post\` FOREIGN KEY (\`post_id\`) REFERENCES \`posts\` (\`id\`) ON DELETE CASCADE,
  CONSTRAINT \`fk_comment_user\` FOREIGN KEY (\`user_id\`) REFERENCES \`users\` (\`id\`)
) COMMENT='评论表';`;

interface DiagramData {
  tables: TableData[];
  relationships: RelationshipData;
}

export function SqlToERPage() {
  const [sqlText, setSqlText] = useState(DEMO_SQL);
  const [diagramData, setDiagramData] = useState<DiagramData | null>(null);
  const [parseErrors, setParseErrors] = useState<string[]>([]);
  const [hasGenerated, setHasGenerated] = useState(false);
  const [loading, setLoading] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const handleGenerate = useCallback(async () => {
    setLoading(true);
    setParseErrors([]);
    try {
      const { tables, relationships, errors } = await parseSqlToERData(sqlText);
      setParseErrors(errors);
      if (tables.length > 0) {
        setDiagramData({ tables, relationships });
        setHasGenerated(true);
      } else if (errors.length === 0) {
        setParseErrors(["未检测到 CREATE TABLE 语句，请检查 SQL 格式。"]);
      }
    } catch (err: any) {
      setParseErrors([`解析失败：${err?.message ?? "未知错误"}`]);
    } finally {
      setLoading(false);
    }
  }, [sqlText]);

  const handleReset = useCallback(() => {
    setSqlText(DEMO_SQL);
    setDiagramData(null);
    setParseErrors([]);
    setHasGenerated(false);
  }, []);

  return (
    <div className="sql-er-page">
      {/* 左侧：SQL 输入区域 */}
      <div className="sql-er-page__left">
        <div className="sql-er-page__panel-header">
          <Title level={4} style={{ margin: 0 }}>
            SQL DDL 输入
          </Title>
          <Text type="secondary" style={{ fontSize: 12 }}>
            输入 CREATE TABLE 语句，支持多表
          </Text>
        </div>
        <div className="sql-er-page__editor">
          <textarea
            ref={textareaRef}
            className="sql-er-page__textarea"
            value={sqlText}
            onChange={(e) => setSqlText(e.target.value)}
            placeholder="在此输入 MySQL CREATE TABLE 语句..."
            spellCheck={false}
          />
        </div>
        <div className="sql-er-page__actions">
          <Space>
            <Button type="primary" size="large" onClick={handleGenerate} loading={loading}>
              生成 ER 图
            </Button>
            <Button size="large" onClick={handleReset} disabled={loading}>
              重置示例
            </Button>
          </Space>
        </div>
        {parseErrors.length > 0 && (
          <div className="sql-er-page__errors">
            {parseErrors.map((err, idx) => (
              <Alert key={idx} type="error" message={err} showIcon style={{ marginBottom: 6 }} />
            ))}
          </div>
        )}
      </div>

      {/* 右侧：ER 图区域 */}
      <div className="sql-er-page__right">
        <div className="sql-er-page__panel-header">
          <Title level={4} style={{ margin: 0 }}>
            ER 图预览
          </Title>
          {diagramData && (
            <Text type="secondary" style={{ fontSize: 12 }}>
              共 {diagramData.tables.length} 张表，{diagramData.relationships.relationships.length} 条关系
            </Text>
          )}
        </div>
        <div className="sql-er-page__diagram">
          {diagramData ? (
            <ERDiagram initialData={diagramData} />
          ) : (
            <div className="sql-er-page__empty">
              <div className="sql-er-page__empty-icon">🗺️</div>
              <Text type="secondary">
                {hasGenerated ? "没有可显示的表，请检查 SQL 语句" : "输入 SQL 语句后点击「生成 ER 图」"}
              </Text>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
