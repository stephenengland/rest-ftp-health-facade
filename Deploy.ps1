
$ScriptDir = (Split-Path $myinvocation.MyCommand.Path)
set-location $ScriptDir

"C:\Program Files\nodejs\node.exe" ./windows-service.js --uninstall
"C:\Program Files\nodejs\node.exe" ./windows-service.js --install