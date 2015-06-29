
$ScriptDir = (Split-Path $myinvocation.MyCommand.Path)
set-location $ScriptDir

C:\PROGRA~1\nodejs\node.exe windows-service.js --uninstall
C:\PROGRA~1\nodejs\node.exe windows-service.js --install