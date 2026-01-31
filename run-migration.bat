@echo off
REM Run this script to apply the fill-in-blank migration
REM Make sure to update the DATABASE_URL below with your actual connection string

echo Applying fill-in-blank migration...

REM Get DATABASE_URL from .env file
for /f "tokens=2 delims==" %%a in ('findstr "DATABASE_URL" .env') do set DATABASE_URL=%%a

REM Run the migration
psql %DATABASE_URL% -f db\migrations\add_fill_in_blank.sql

echo Migration complete!
pause
