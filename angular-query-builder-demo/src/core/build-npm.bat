@echo off

rmdir /s /q .\lib 2>nul
rmdir /s /q .\cjs 2>nul
rmdir /s /q .\esm 2>nul

.\node_modules\.bin\babel -d .\cjs .\modules
set ESM=1
.\node_modules\.bin\babel -d .\esm .\modules
copy .\modules\index.d.ts .\cjs\index.d.ts
copy .\modules\index.d.ts .\esm\index.d.ts