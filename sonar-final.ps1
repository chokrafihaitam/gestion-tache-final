$TOKEN = "sqa_9ede34b3f5242c900697852901cb194f99ae2a30"

Write-Host "Analyse du backend..." -ForegroundColor Yellow
docker run --rm --network host -v ${PWD}\backend:/usr/src -w /usr/src sonarsource/sonar-scanner-cli `
    -Dsonar.projectKey="task-manager-backend" `
    -Dsonar.sources="." `
    -Dsonar.exclusions="**/migrations/**,**/tests/**,**/__pycache__/**" `
    -Dsonar.host.url="http://localhost:9000" `
    -Dsonar.login="$TOKEN"

Write-Host "Analyse du frontend..." -ForegroundColor Yellow
docker run --rm --network host -v ${PWD}\frontend:/usr/src -w /usr/src sonarsource/sonar-scanner-cli `
    -Dsonar.projectKey="task-manager-frontend" `
    -Dsonar.sources="src" `
    -Dsonar.exclusions="**/node_modules/**,**/build/**" `
    -Dsonar.host.url="http://localhost:9000" `
    -Dsonar.login="$TOKEN"

Write-Host "✅ Terminé! Voir http://localhost:9000" -ForegroundColor Green
Start-Process "http://localhost:9000"