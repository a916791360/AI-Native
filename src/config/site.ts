export function resolvePublicOrigin(value = process.env.PUBLIC_SITE_URL): string | undefined {
  if (!value) return undefined;
  const url = new URL(value);
  if (url.protocol !== 'https:') throw new Error('PUBLIC_SITE_URL must use HTTPS');
  return url.toString().replace(/\/$/, '');
}

export function absoluteSiteUrl(pathname: string, origin: string): string {
  const base = `${origin.replace(/\/$/, '')}/`;
  return new URL(pathname.replace(/^\//, ''), base).toString();
}

export const SITE = {
  name: 'AI-Native',
  description: '面向中文 AI 初学者与产品人的 AI 产品判断力学习系统。',
  promise: '从理解 AI 概念，到能够判断业务场景并设计可评审的 AI 产品方案。',
  locale: 'zh_CN',
  repositoryUrl: 'https://github.com/a916791360/AI-Native',
  publicOrigin: resolvePublicOrigin(),
} as const;
