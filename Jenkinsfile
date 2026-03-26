pipeline {
    agent any
    
    environment {
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
        
        stage('Clean Docker') {
            steps {
                echo '🧹 Nettoyage des conteneurs existants...'
                bat '''
                    docker stop task_manager_mysql task_manager_backend task_manager_frontend task_manager_adminer 2>nul || exit 0
                    docker rm task_manager_mysql task_manager_backend task_manager_frontend task_manager_adminer 2>nul || exit 0
                    echo "✅ Nettoyage terminé"
                '''
            }
        }
        
        stage('Start SonarQube') {
            steps {
                echo '🚀 Démarrage de SonarQube...'
                bat '''
                    echo "Démarrage de SonarQube et sa base de données..."
                    docker-compose up -d sonarqube sonarqube_db
                    echo "✅ SonarQube démarré"
                '''
            }
        }
        
        stage('Wait for SonarQube') {
            steps {
                echo '⏳ Attente du démarrage de SonarQube...'
                bat 'powershell -Command "Start-Sleep -Seconds 30"'
                
                script {
                    // Vérifier que SonarQube est prêt
                    try {
                        bat 'curl -f http://localhost:9000/api/system/status'
                        echo '✅ SonarQube est prêt'
                    } catch (Exception e) {
                        echo '⚠️ SonarQube pas encore prêt, on continue...'
                    }
                }
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
                        echo "Lancement de l'analyse SonarQube..."
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
                        echo "Lancement de l'analyse SonarQube..."
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
            when {
                expression { return true }
            }
            steps {
                echo '🏆 Vérification du Quality Gate...'
                script {
                    bat 'powershell -Command "Start-Sleep -Seconds 10"'
                    
                    def qualityGateBackend = bat(
                        script: "curl -s -u ${SONAR_TOKEN}: http://localhost:9000/api/qualitygates/project_status?projectKey=task-manager-backend",
                        returnStdout: true
                    ).trim()
                    
                    echo "Backend Quality Gate: ${qualityGateBackend}"
                    
                    if (qualityGateBackend.contains('ERROR')) {
                        echo '⚠️ Quality Gate backend non passé'
                    } else {
                        echo '✅ Quality Gate backend OK'
                    }
                }
            }
        }
    }
    
    post {
        success {
            echo '✅ PIPELINE RÉUSSI!'
            echo '🌐 Frontend: http://localhost:3000'
            echo '🔧 API: http://localhost:8000/api/tasks/'
            echo '🔍 SonarQube: http://localhost:9000'
        }
        failure {
            echo '❌ PIPELINE ÉCHOUÉ!'
            bat 'docker-compose logs --tail=50'
        }
    }
}