/**
 * Supabase配置 - 兼容浏览器和服务器端
 */

// 安全地获取环境变量，避免在浏览器中访问process对象导致错误
function getEnvVar(name: string, defaultValue: string): string {
  // 在服务器端（构建时）可以访问 process.env
  if (typeof process !== 'undefined' && process.env && typeof process.env[name] === 'string') {
    return process.env[name] as string;
  }
  return defaultValue;
}

export const supabaseConfig = {
  url: getEnvVar('NEXT_PUBLIC_SUPABASE_URL', 'https://placeholder.supabase.co'),
  anonKey: getEnvVar('NEXT_PUBLIC_SUPABASE_ANON_KEY', 'placeholder-anon-key'),
};

// 检查配置是否有效
export const isSupabaseConfigured =
  supabaseConfig.url !== 'https://placeholder.supabase.co' &&
  supabaseConfig.anonKey !== 'placeholder-anon-key';

// 在浏览器环境中输出警告
if (typeof window !== 'undefined' && !isSupabaseConfigured) {
  console.warn('⚠️ 缺少Supabase环境变量! 会员功能将不可用。请配置.env文件');
}
