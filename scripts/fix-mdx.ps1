# 修复MDX编译错误

$docsPath = "F:\work\study\sports_training\website\docs"
$files = Get-ChildItem -Path $docsPath -Filter "*.md" -Recurse

$count = 0
foreach ($file in $files) {
    $content = Get-Content $file.FullName -Raw -Encoding UTF8

    # 替换 <br/> 为 <br />
    $newContent = $content -replace '<br/>', '<br />'

    if ($content -ne $newContent) {
        Set-Content -Path $file.FullName -Value $newContent -Encoding UTF8 -NoNewline
        Write-Host "Fixed: $($file.Name)"
        $count++
    }
}

Write-Host "`nTotal files fixed: $count"
