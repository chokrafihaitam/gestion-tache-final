pipeline {
    agent any
    
    environment {
        // Utilisez les noms EXACTS de vos credentials
        SONAR_TOKEN = credentials('SONAR_TOKEN')
        SONAR_HOST_URL = 'http://localhost:9000'
    }
    
    stages {
        stage('Checkout') {
            steps {
                echo '📦 Récupération du code...'
                checkout scm
            }
        }
        
        stage('SonarQube Analysis Backend') {
            steps {
                echo '🔍 Analyse du backend avec SonarQube...'
                script {
                    writeFile file: 'backend/sonar-project.properties', text: """
sonar.projectKey=task-manager-backend
sonar.projectName=Task Manager Backend
sonar.projectVersion=1.0
sonar.sources=.
sonar.exclusions=**/migrations/**,**/tests/**,**/__pycache__/**,**/static/**,**/media/**
sonar.language=py
sonar.python.version=3.11
sonar.sourceEncoding=UTF-8
sonar.host.url=${SONAR_HOST_URL}
sonar.login=${SONAR_TOKEN}
"""
                    bat 'docker run --rm --network host -v %cd%\\backend:/usr/src -w /usr/src sonarsource/sonar-scanner-cli'
                    echo '✅ Analyse backend terminée'
                }
            }
        }
        
        stage('SonarQube Analysis Frontend') {
            steps {
                echo '🔍 Analyse du frontend avec SonarQube...'
                script {
                    writeFile file: 'frontend/sonar-project.properties', text: """
sonar.projectKey=task-manager-frontend
sonar.projectName=Task Manager Frontend
sonar.projectVersion=1.0
sonar.sources=src
sonar.exclusions=**/node_modules/**,**/build/**,**/coverage/**,**/*.test.js,**/*.spec.js
sonar.language=js
sonar.javascript.lcov.reportPaths=coverage/lcov.info
sonar.sourceEncoding=UTF-8
sonar.host.url=${SONAR_HOST_URL}
sonar.login=${SONAR_TOKEN}
"""
                    bat 'docker run --rm --network host -v %cd%\\frontend:/usr/src -w /usr/src sonarsource/sonar-scanner-cli'
                    echo '✅ Analyse frontend terminée'
                }
            }
        }
        
        stage('Build Docker') {
            steps {
                echo '🏗️ Construction des images Docker...'
                bat '''
                    echo "Construction du backend..."
                    docker build -t task-manager-backend:latest ./backend
                    if %errorlevel% neq 0 exit /b %errorlevel%
                    
                    echo "Construction du frontend..."
                    docker build -t task-manager-frontend:latest ./frontend
                    if %errorlevel% neq 0 exit /b %errorlevel%
                    
                    echo "✅ Images construites"
                '''
            }
        }
        
        stage('Deploy') {
            steps {
                echo '🚀 Déploiement...'
                bat '''
                    echo "Arrêt des anciens conteneurs..."
                    docker-compose down || exit 0
                    
                    echo "Démarrage des nouveaux conteneurs..."
                    docker-compose up -d
                    
                    echo "✅ Déploiement terminé"
                '''
            }
        }
        
        stage('Health Check') {
            steps {
                echo '🏥 Vérification de la santé des services...'
                script {
                    bat 'powershell -Command "Start-Sleep -Seconds 20"'
                    bat 'docker-compose ps'
                    
                    try {
                        bat 'curl -f http://localhost:8000/api/tasks/'
                        echo '✅ API fonctionnelle'
                    } catch (Exception e) {
                        echo '❌ API non disponible'
                        bat 'docker-compose logs backend'
                        error('API test failed')
                    }
                    
                    try {
                        bat 'curl -f http://localhost:3000'
                        echo '✅ Frontend fonctionnel'
                    } catch (Exception e) {
                        echo '⚠️ Frontend non disponible'
                        bat 'docker-compose logs frontend'
                    }
                    
                    try {
                        bat 'curl -f http://localhost:9000/api/system/status'
                        echo '✅ SonarQube fonctionnel'
                    } catch (Exception e) {
                        echo '⚠️ SonarQube non disponible'
                    }
                }
            }
        }
        
        stage('Migrations') {
            steps {
                echo '🔄 Migrations Django...'
                bat 'docker-compose exec -T backend python manage.py migrate'
                echo '✅ Migrations effectuées'
            }
        }
    }
    
    post {
        success {
            echo '''
            ═══════════════════════════════════════════════════════
            ✅ PIPELINE RÉUSSI !
            ═══════════════════════════════════════════════════════
            
            🌐 Frontend : http://localhost:3000
            🔧 API : http://localhost:8000/api/tasks/
            🗄️ Adminer : http://localhost:8081
            🔍 SonarQube : http://localhost:9000
            
            ═══════════════════════════════════════════════════════
            '''
        }
        failure {
            echo '❌ PIPELINE ÉCHOUÉ!'
            bat 'docker-compose logs --tail=50'
        }
    }
}