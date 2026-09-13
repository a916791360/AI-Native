import type { LearningOption } from './types';

/** FNV-1a：稳定、无依赖，同一个 id 在任何机器上得到同一个数。 */
function hashString(value: string): number {
  let hash = 0x811c9dc5;
  for (let index = 0; index < value.length; index += 1) {
    hash ^= value.charCodeAt(index);
    hash = Math.imul(hash, 0x01000193) >>> 0;
  }
  return hash >>> 0;
}

/**
 * 按题目 id 稳定旋转选项顺序。
 *
 * 目的：作者写题时把「自然顺序」放在最前，但学习者看到的正确选项位置必须被打散——
 * 之前的题库 24/24 题正确答案都是第一个选项，一路点 A 就能满分。
 *
 * 用 id 哈希而不是随机：构建产物可复现，测试不会偶发失败，
 * 新增题目也不会打乱已有题目的顺序。
 */
export function orderOptions(questionId: string, options: LearningOption[]): LearningOption[] {
  if (options.length <= 1) return [...options];
  const offset = hashString(questionId) % options.length;
  return [...options.slice(offset), ...options.slice(0, offset)];
}
