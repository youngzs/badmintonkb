# 修复Markdown中的<符号问题

$docsPath = "F:\work\study\sports_training\website\docs"
$files = Get-ChildItem -Path $docsPath -Filter "*.md" -Recurse

$count = 0
foreach ($file in $files) {
    $content = Get-Content $file.FullName -Raw -Encoding UTF8
    $original = $content

    # 修复常见的 < 用法
    # < 后面跟数字的情况
    $content = $content -replace '(<)(\d+)', '少于$2'
    $content = $content -replace '(≤|<=)(\d+)', '不超过$2'
    $content = $content -replace '(>)(\d+)', '大于$2'
    $content = $content -replace '(≥|>=)(\d+)', '不少于$2'

    if ($content -ne $original) {
        Set-Content -Path $file.FullName -Value $content -Encoding UTF8 -NoNewline
        Write-Host "Fixed: $($file.Name)"
        $count++
    }
}

Write-Host "`nTotal files fixed: $count"
