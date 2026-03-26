pipeline {
    agent any
    
    environment {
        SONAR_TOKEN = credentials('SONAR_TOKEN')
        SONAR_HOST_URL = 'http://host.docker.internal:9000'
    }
    
    stages {
        stage('Checkout') {
            steps {
                echo '📦 Récupération du code...'
                checkout scm
            }
        }
        
        stage('Clean Docker') {
            steps {
                echo '🧹 Nettoyage des conteneurs existants...'
                bat '''
                    echo "Arrêt des conteneurs..."
                    docker stop task_manager_mysql task_manager_backend task_manager_frontend task_manager_adminer task_manager_sonarqube task_manager_sonarqube_db 2>nul || exit 0
                    echo "Suppression des conteneurs..."
                    docker rm task_manager_mysql task_manager_backend task_manager_frontend task_manager_adminer task_manager_sonarqube task_manager_sonarqube_db 2>nul || exit 0
                    echo "✅ Nettoyage terminé"
                '''
            }
        }
        
        stage('Start SonarQube') {
            steps {
                echo '🚀 Démarrage de SonarQube...'
                bat '''
                    echo "Démarrage de SonarQube..."
                    docker-compose up -d sonarqube sonarqube_db
                    echo "✅ SonarQube démarré, attente 45 secondes..."
                    powershell -Command "Start-Sleep -Seconds 45"
                '''
            }
        }
        
        stage('SonarQube Backend') {
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
                    bat '''
                        echo "Lancement de l'analyse SonarQube pour le backend..."
                        docker run --rm --network host -v %cd%\\backend:/usr/src -w /usr/src sonarsource/sonar-scanner-cli
                        echo "✅ Analyse backend terminée"
                    '''
                }
            }
        }
        
        stage('SonarQube Frontend') {
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
                    bat '''
                        echo "Lancement de l'analyse SonarQube pour le frontend..."
                        docker run --rm --network host -v %cd%\\frontend:/usr/src -w /usr/src sonarsource/sonar-scanner-cli
                        echo "✅ Analyse frontend terminée"
                    '''
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
        
        stage('Start Application') {
            steps {
                echo '🚀 Démarrage de l\'application...'
                bat '''
                    echo "Démarrage de MySQL, Backend, Frontend et Adminer..."
                    docker-compose up -d mysql backend frontend adminer
                    echo "✅ Application démarrée"
                '''
            }
        }
        
        stage('Wait') {
            steps {
                echo '⏳ Attente du démarrage...'
                bat 'powershell -Command "Start-Sleep -Seconds 20"'
            }
        }
        
        stage('Test API') {
            steps {
                echo '🧪 Test de l\'API...'
                bat 'curl -f http://localhost:8000/api/tasks/'
                echo '✅ API fonctionnelle'
            }
        }
        
        stage('Migrations') {
            steps {
                echo '🔄 Migrations Django...'
                bat 'docker-compose exec -T backend python manage.py migrate'
                echo '✅ Migrations effectuées'
            }
        }
        
        stage('Quality Gate') {
            steps {
                echo '🏆 Vérification du Quality Gate SonarQube...'
                script {
                    bat 'powershell -Command "Start-Sleep -Seconds 15"'
                    
                    def qualityGateBackend = bat(
                        script: "curl -s -u ${SONAR_TOKEN}: http://host.docker.internal:9000/api/qualitygates/project_status?projectKey=task-manager-backend",
                        returnStdout: true
                    ).trim()
                    
                    echo "Backend Quality Gate: ${qualityGateBackend}"
                    
                    def qualityGateFrontend = bat(
                        script: "curl -s -u ${SONAR_TOKEN}: http://host.docker.internal:9000/api/qualitygates/project_status?projectKey=task-manager-frontend",
                        returnStdout: true
                    ).trim()
                    
                    echo "Frontend Quality Gate: ${qualityGateFrontend}"
                    
                    if (qualityGateBackend.contains('OK') && qualityGateFrontend.contains('OK')) {
                        echo '✅ Quality Gate passé avec succès!'
                    } else {
                        echo '⚠️ Quality Gate en attente de traitement...'
                    }
                }
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
            
            📊 Résultats SonarQube:
            - Backend: http://localhost:9000/dashboard?id=task-manager-backend
            - Frontend: http://localhost:9000/dashboard?id=task-manager-frontend
            
            ═══════════════════════════════════════════════════════
            '''
        }
        failure {
            echo '''
            ═══════════════════════════════════════════════════════
            ❌ PIPELINE ÉCHOUÉ !
            ═══════════════════════════════════════════════════════
            
            🔍 Vérifiez les logs ci-dessus pour plus de détails.
            ═══════════════════════════════════════════════════════
            '''
            bat 'docker-compose logs --tail=50'
        }
    }
}