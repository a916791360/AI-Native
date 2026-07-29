const ISSUE_ENDPOINT = 'https://github.com/a916791360/AI-Native/issues/new';

interface ContentIssueOptions {
  title: string;
  pagePath?: string;
  issueType?: string;
  context?: string;
}

export function buildContentIssueUrl({
  title,
  pagePath = '',
  issueType = '事实或解释错误',
  context = '',
}: ContentIssueOptions): string {
  const body = [
    `页面 URL：${pagePath}`,
    '',
    `问题类型：${issueType}`,
    '',
    '问题描述：',
    context,
    '',
    '证据或建议来源：',
    '',
  ].join('\n');
  const params = new URLSearchParams({ title, body });
  return `${ISSUE_ENDPOINT}?${params.toString()}`;
}
