Add-Type -AssemblyName System.Drawing

$files = Get-ChildItem -Path "img/galeri" -Recurse -File | Where-Object { $_.Extension -match "\.(jpg|jpeg|png)$" }

$renames = @{}

foreach ($file in $files) {
    $path = $file.FullName
    $ext = $file.Extension.ToLower()
    $isPng = ($ext -eq ".png")
    
    $image = $null
    try {
        $image = [System.Drawing.Image]::FromFile($path)
    } catch {
        Write-Host "Failed to load $path"
        continue
    }
    
    $width = $image.Width
    $height = $image.Height
    
    $maxW = 1920
    $maxH = 1080
    if ($height -gt $width) {
        $maxW = 1080
        $maxH = 1920
    }
    
    $needsResize = ($width -gt $maxW) -or ($height -gt $maxH)
    $needsConvert = $isPng
    
    if ($needsResize -or $needsConvert) {
        $newW = $width
        $newH = $height
        
        if ($needsResize) {
            $ratioW = $maxW / $width
            $ratioH = $maxH / $height
            $ratio = [Math]::Min($ratioW, $ratioH)
            $newW = [int][Math]::Round($width * $ratio)
            $newH = [int][Math]::Round($height * $ratio)
        }
        
        $newBmp = New-Object System.Drawing.Bitmap($newW, $newH)
        $newBmp.SetResolution($image.HorizontalResolution, $image.VerticalResolution)
        $graphics = [System.Drawing.Graphics]::FromImage($newBmp)
        $graphics.CompositingQuality = [System.Drawing.Drawing2D.CompositingQuality]::HighQuality
        $graphics.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
        $graphics.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::HighQuality
        
        # Fill background with white in case of transparent PNG
        if ($isPng) {
            $graphics.Clear([System.Drawing.Color]::White)
        }
        
        $graphics.DrawImage($image, 0, 0, $newW, $newH)
        
        $image.Dispose()
        $graphics.Dispose()
        
        $newPath = $path
        if ($isPng) {
            $newPath = [System.IO.Path]::ChangeExtension($path, ".jpg")
            $oldRel = "img/galeri/" + ($file.FullName.Substring((Get-Item "img/galeri").FullName.Length + 1) -replace '\\', '/')
            $newRel = [System.IO.Path]::ChangeExtension($oldRel, ".jpg")
            $renames[$oldRel] = $newRel
        }
        
        $encoder = [System.Drawing.Imaging.ImageCodecInfo]::GetImageEncoders() | Where-Object { $_.MimeType -eq 'image/jpeg' }
        $encoderParams = New-Object System.Drawing.Imaging.EncoderParameters(1)
        $encoderParams.Param[0] = New-Object System.Drawing.Imaging.EncoderParameter([System.Drawing.Imaging.Encoder]::Quality, 85L)
        
        if (-not $isPng) {
            $tempPath = $path + ".tmp"
            $newBmp.Save($tempPath, $encoder, $encoderParams)
            $newBmp.Dispose()
            Remove-Item $path -Force
            Rename-Item $tempPath $file.Name
        } else {
            $newBmp.Save($newPath, $encoder, $encoderParams)
            $newBmp.Dispose()
            Remove-Item $path -Force
        }
        
        Write-Host "Processed: $($file.Name) -> Resized: $needsResize, Converted: $needsConvert ($newW x $newH)"
    } else {
        $image.Dispose()
    }
}

$renames | ConvertTo-Json | Set-Content renames.json
