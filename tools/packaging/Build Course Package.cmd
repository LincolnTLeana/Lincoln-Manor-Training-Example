@echo off
rem Double-click to choose a course folder, or drag your course folder onto this file.
rem Runs Build-CoursePackage.ps1 from the same folder. It does not change PowerShell
rem security settings: IT signs the script so it is allowed to run.
powershell.exe -NoProfile -File "%~dp0Build-CoursePackage.ps1" -CourseFolder "%~1"
echo.
pause
