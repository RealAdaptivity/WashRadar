$content = Get-Content state.js -Raw
$content = [regex]::Replace($content, 'closureReason:\s*""', {
    $r = Get-Random -Minimum 40 -Maximum 50
    $c = Get-Random -Minimum 100 -Maximum 2000
    return "closureReason: """",`n    rating: $($r/10.0),`n    reviewCount: $c"
})
Set-Content state.js -Value $content
