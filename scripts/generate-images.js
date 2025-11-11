#!/usr/bin/env node

/**
 * AI Image Generation Script
 *
 * 扫描 content/ 目录下所有 Markdown 文件，查找 GENERATE: 前缀的图片引用
 * 使用 image-gen-server MCP 生成图片并保存到对应位置
 *
 * Usage:
 *   node generate-images.js [options]
 *
 * Options:
 *   --dry-run    只显示需要生成的图片，不实际生成
 *   --force      强制重新生成已存在的图片
 *   --file=PATH  指定单个文件处理
 */

import fs from 'fs/promises'
import path from 'path'
import { glob } from 'glob'
import chalk from 'chalk'

// 配置
const CONFIG = {
  contentDir: path.join(process.cwd(), 'content'),
  imagePrefix: 'GENERATE:',
  defaultModel: 'dall-e-3',
  defaultSize: '1024x1024',
  defaultQuality: 'standard',
}

// 命令行参数解析
const args = process.argv.slice(2)
const isDryRun = args.includes('--dry-run')
const isForce = args.includes('--force')
const targetFile = args.find(arg => arg.startsWith('--file='))?.split('=')[1]

/**
 * 从 Markdown 内容中提取需要生成的图片任务
 * @param {string} content - Markdown 文件内容
 * @param {string} filePath - 文件路径
 * @returns {Array} 图片生成任务列表
 */
function extractImageTasks(content, filePath) {
  const tasks = []
  const imageRegex = /!\[([^\]]*)\]\(([^)]*GENERATE:([^)]+))\)/g
  let match

  while ((match = imageRegex.exec(content)) !== null) {
    const [fullMatch, altText, fullPath, promptKey] = match

    // 解析图片路径
    const imagePath = fullPath.replace(`${CONFIG.imagePrefix}`, '')
    const absoluteImagePath = path.resolve(path.dirname(filePath), imagePath)
    const imageDir = path.dirname(absoluteImagePath)
    const imageFilename = path.basename(imagePath)

    tasks.push({
      altText,
      promptKey: promptKey.trim(),
      imagePath: absoluteImagePath,
      imageDir,
      imageFilename,
      sourceFile: filePath,
      originalMatch: fullMatch,
    })
  }

  return tasks
}

/**
 * 根据上下文生成详细的图片提示词
 * @param {string} filePath - 源文件路径
 * @param {string} promptKey - 提示关键词
 * @param {string} altText - 图片 alt 文本
 * @returns {string} 完整的提示词
 */
function buildPrompt(filePath, promptKey, altText) {
  // 从文件路径提取年龄组信息
  const ageGroupMatch = filePath.match(/(\d+)-(\d+)/)
  const ageGroup = ageGroupMatch ? `${ageGroupMatch[1]}-${ageGroupMatch[2]} years old` : 'youth'

  // 构建专业的提示词
  const prompt = `
Professional badminton training illustration for ${ageGroup} children:

Subject: ${promptKey}
Context: ${altText}

Style Guidelines:
- Clean, educational diagram suitable for children and parents
- Asian athlete representation preferred
- Bright, engaging colors appropriate for youth content
- Simple background with minimal distractions
- Clear demonstration of movement or technique
- Professional sports illustration quality

Safety Requirements:
- Show proper form and technique
- Avoid depicting injury-prone positions
- Emphasize safe training practices

Technical Specifications:
- Format: PNG
- Resolution: 1024x1024
- No text labels (support multilingual future)
- Centered composition with clear focal point
- High clarity suitable for web and print use
  `.trim()

  return prompt
}

/**
 * 生成图片的占位符（待集成 MCP）
 * @param {string} prompt - 图片生成提示词
 * @param {string} outputPath - 输出文件路径
 * @returns {Promise<Object>} 生成结果
 */
async function generateImagePlaceholder(prompt, outputPath) {
  console.log(chalk.blue(`\n🎨 Image Generation Request:`))
  console.log(chalk.gray(`  Prompt: ${prompt.substring(0, 100)}...`))
  console.log(chalk.gray(`  Output: ${outputPath}`))

  // 返回待集成状态
  return {
    success: false,
    pending: true,
    message: 'MCP integration required',
    prompt,
    outputPath,
  }
}

/**
 * 处理单个 Markdown 文件
 * @param {string} filePath - 文件路径
 * @returns {Promise<Object>} 处理结果统计
 */
async function processMarkdownFile(filePath) {
  const stats = {
    total: 0,
    generated: 0,
    skipped: 0,
    pending: 0,
    failed: 0,
  }

  try {
    const content = await fs.readFile(filePath, 'utf-8')
    const tasks = extractImageTasks(content, filePath)

    stats.total = tasks.length

    if (tasks.length === 0) {
      console.log(chalk.gray(`  No images to generate in ${path.relative(CONFIG.contentDir, filePath)}`))
      return stats
    }

    console.log(chalk.green(`\n📄 ${path.relative(CONFIG.contentDir, filePath)}`))
    console.log(chalk.gray(`  Found ${tasks.length} image(s) with GENERATE: prefix`))

    for (const task of tasks) {
      console.log(chalk.blue(`\n  → ${task.imageFilename}`))
      console.log(chalk.gray(`     Alt: "${task.altText}"`))
      console.log(chalk.gray(`     Key: "${task.promptKey}"`))

      // 检查图片是否已存在
      try {
        await fs.access(task.imagePath)
        if (!isForce) {
          console.log(chalk.yellow(`     ⚠️  Already exists (use --force to regenerate)`))
          stats.skipped++
          continue
        }
      } catch {
        // 文件不存在，继续生成
      }

      if (isDryRun) {
        console.log(chalk.cyan(`     [DRY RUN] Would generate image`))
        stats.pending++
        continue
      }

      // 确保目标目录存在
      await fs.mkdir(task.imageDir, { recursive: true })

      // 生成提示词
      const prompt = buildPrompt(task.sourceFile, task.promptKey, task.altText)

      // 调用图片生成（待集成 MCP）
      const result = await generateImagePlaceholder(prompt, task.imagePath)

      if (result.success) {
        console.log(chalk.green(`     ✓ Generated successfully`))
        stats.generated++
      } else if (result.pending) {
        console.log(chalk.yellow(`     ⏳ Pending MCP integration`))
        stats.pending++
      } else {
        console.log(chalk.red(`     ✗ Generation failed`))
        stats.failed++
      }
    }
  } catch (error) {
    console.error(chalk.red(`Error processing ${filePath}: ${error.message}`))
    stats.failed++
  }

  return stats
}

/**
 * 主函数
 */
async function main() {
  console.log(chalk.bold.blue('\n🎨 AI Image Generation Script'))
  console.log(chalk.bold.blue('================================\n'))
  console.log(chalk.gray(`Content Directory: ${CONFIG.contentDir}`))
  console.log(chalk.gray(`Mode: ${isDryRun ? 'DRY RUN (preview only)' : 'LIVE'}`))
  console.log(chalk.gray(`Force Regenerate: ${isForce ? 'YES' : 'NO'}\n`))

  const totalStats = {
    filesProcessed: 0,
    total: 0,
    generated: 0,
    skipped: 0,
    pending: 0,
    failed: 0,
  }

  try {
    let markdownFiles = []

    if (targetFile) {
      // 处理单个文件
      const resolvedPath = path.resolve(targetFile)
      markdownFiles = [resolvedPath]
      console.log(chalk.blue(`Target: ${targetFile}\n`))
    } else {
      // 扫描所有 Markdown 文件
      markdownFiles = await glob('**/*.md', {
        cwd: CONFIG.contentDir,
        absolute: true,
        ignore: ['**/node_modules/**', '**/.templates/**', '**/README.md'],
      })
      console.log(chalk.blue(`Found ${markdownFiles.length} Markdown files\n`))
    }

    // 处理所有文件
    for (const file of markdownFiles) {
      const stats = await processMarkdownFile(file)
      totalStats.filesProcessed++
      totalStats.total += stats.total
      totalStats.generated += stats.generated
      totalStats.skipped += stats.skipped
      totalStats.pending += stats.pending
      totalStats.failed += stats.failed
    }

    // 打印总结
    console.log(chalk.bold.green('\n\n📊 Summary'))
    console.log(chalk.bold.green('===========\n'))
    console.log(chalk.gray(`Files processed: ${totalStats.filesProcessed}`))
    console.log(chalk.gray(`Total images found: ${totalStats.total}`))
    console.log(chalk.green(`  ✓ Generated: ${totalStats.generated}`))
    console.log(chalk.yellow(`  ⚠️  Skipped: ${totalStats.skipped}`))
    console.log(chalk.cyan(`  ⏳ Pending: ${totalStats.pending}`))
    console.log(chalk.red(`  ✗ Failed: ${totalStats.failed}\n`))

    if (isDryRun) {
      console.log(chalk.yellow('💡 This was a dry run. Remove --dry-run to generate images.\n'))
    }

    if (totalStats.pending > 0) {
      console.log(chalk.yellow('⚠️  MCP Integration Required'))
      console.log(chalk.gray('   This script needs to be connected to image-gen-server MCP.'))
      console.log(chalk.gray('   Please integrate the MCP client to enable actual image generation.\n'))
    }
  } catch (error) {
    console.error(chalk.red(`\n❌ Fatal error: ${error.message}\n`))
    process.exit(1)
  }
}

// 运行主函数
main()
