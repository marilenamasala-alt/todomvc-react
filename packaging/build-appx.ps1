# Builds the React app and wraps it into an .appx file.
# Needs makeappx.exe from the Windows 10/11 SDK.

$root = Split-Path $PSScriptRoot -Parent
$folder = Join-Path $root 'appx-build'
$output = Join-Path $root 'TodoMVC.appx'

# 1. Build the React app into the dist folder.
Set-Location $root
npm.cmd run build

# 2. Make a clean folder and copy everything the package needs into it.
if (Test-Path $folder) { Remove-Item $folder -Recurse -Force }
New-Item -ItemType Directory $folder | Out-Null
Copy-Item (Join-Path $root 'dist\*') $folder -Recurse
Copy-Item (Join-Path $PSScriptRoot 'AppxManifest.xml') $folder
Copy-Item (Join-Path $root 'src\assets\hero.png') (Join-Path $folder 'logo.png')

# 3. Find makeappx.exe and create the .appx file.
$makeappx = Get-ChildItem 'C:\Program Files (x86)\Windows Kits\10\bin' -Recurse -Filter makeappx.exe -ErrorAction SilentlyContinue |
  Where-Object { $_.FullName -like '*x64*' } | Select-Object -First 1 -ExpandProperty FullName
if (-not $makeappx) { throw 'makeappx.exe not found. Install the Windows SDK.' }

& $makeappx pack /d $folder /p $output /o
