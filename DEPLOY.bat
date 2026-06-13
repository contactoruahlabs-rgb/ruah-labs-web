@echo off
cd /d "%~dp0"
echo Linking to Railway project...
railway link --project attractive-connection --service patient-benevolence
echo Deploying to Railway...
railway up --detach
echo Done! Check Railway dashboard for deploy status.
pause
