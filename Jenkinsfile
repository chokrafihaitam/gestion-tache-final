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
                    echo "Arrêt des conteneurs..."
                    docker stop task_manager_mysql task_manager_backend task_manager_frontend task_manager_adminer task_manager_sonarqube task_manager_sonarqube_db 2>nul || exit 0
                    echo "Suppression des conteneurs..."
                    docker rm task_manager_mysql task_manager_backend task_manager_frontend task_manager_adminer task_manager_sonarqube task_manager_sonarqube_db 2>nul || exit 0
                    echo "✅ Nettoyage terminé"
                '''
            }
        }
        
        stage('SonarQube Analysis Backend') {
            steps {
                echo '🔍 Analyse du backend avec SonarQube...'
                script {
                    // Créer le fichier de configuration SonarQube pour le backend
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
                    
                    // Exécuter l'analyse SonarQube
                    bat '''
                        echo "Lancement de l'analyse SonarQube pour le backend..."
                        docker run --rm --network host -v %cd%\\backend:/usr/src -w /usr/src sonarsource/sonar-scanner-cli
                        echo "✅ Analyse backend terminée"
                    '''
                }
            }
        }
        
        stage('SonarQube Analysis Frontend') {
            steps {
                echo '🔍 Analyse du frontend avec SonarQube...'
                script {
                    // Créer le fichier de configuration SonarQube pour le frontend
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
                    
                    // Exécuter l'analyse SonarQube
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
        
        stage('Start Services') {
            steps {
                echo '🚀 Démarrage des services...'
                bat '''
                    echo "Démarrage de MySQL, Backend, Frontend, Adminer et SonarQube..."
                    docker-compose up -d
                    
                    echo "✅ Services démarrés"
                '''
            }
        }
        
        stage('Wait for Services') {
            steps {
                echo '⏳ Attente du démarrage des services...'
                bat 'powershell -Command "Start-Sleep -Seconds 30"'
            }
        }
        
        stage('Health Check') {
            steps {
                echo '🏥 Vérification de la santé des services...'
                script {
                    // Vérifier les conteneurs
                    bat 'docker-compose ps'
                    
                    // Tester l'API
                    try {
                        bat 'curl -f http://localhost:8000/api/tasks/'
                        echo '✅ API Django fonctionnelle'
                    } catch (Exception e) {
                        echo '❌ API non disponible'
                        bat 'docker-compose logs backend --tail=20'
                        error('API test failed')
                    }
                    
                    // Tester le frontend
                    try {
                        bat 'curl -f http://localhost:3000'
                        echo '✅ Frontend React fonctionnel'
                    } catch (Exception e) {
                        echo '⚠️ Frontend non disponible (compilation en cours)'
                    }
                    
                    // Tester SonarQube
                    try {
                        bat 'curl -f http://localhost:9000/api/system/status'
                        echo '✅ SonarQube fonctionnel'
                    } catch (Exception e) {
                        echo '⚠️ SonarQube non disponible'
                    }
                    
                    // Tester Adminer
                    try {
                        bat 'curl -f http://localhost:8081'
                        echo '✅ Adminer fonctionnel'
                    } catch (Exception e) {
                        echo '⚠️ Adminer non disponible'
                    }
                }
            }
        }
        
        stage('Migrations') {
            steps {
                echo '🔄 Exécution des migrations Django...'
                bat '''
                    echo "Application des migrations..."
                    docker-compose exec -T backend python manage.py migrate
                    echo "✅ Migrations effectuées"
                '''
            }
        }
        
        stage('Quality Gate') {
            steps {
                echo '🏆 Vérification du Quality Gate SonarQube...'
                script {
                    // Attendre que l'analyse soit traitée
                    bat 'powershell -Command "Start-Sleep -Seconds 15"'
                    
                    // Vérifier le Quality Gate pour le backend
                    def qualityGateBackend = bat(
                        script: "curl -s -u ${SONAR_TOKEN}: http://localhost:9000/api/qualitygates/project_status?projectKey=task-manager-backend",
                        returnStdout: true
                    ).trim()
                    
                    echo "Backend Quality Gate: ${qualityGateBackend}"
                    
                    // Vérifier le Quality Gate pour le frontend
                    def qualityGateFrontend = bat(
                        script: "curl -s -u ${SONAR_TOKEN}: http://localhost:9000/api/qualitygates/project_status?projectKey=task-manager-frontend",
                        returnStdout: true
                    ).trim()
                    
                    echo "Frontend Quality Gate: ${qualityGateFrontend}"
                    
                    // Vérifier si le Quality Gate est OK
                    if (qualityGateBackend.contains('ERROR') || qualityGateFrontend.contains('ERROR')) {
                        error('❌ Quality Gate échoué! Vérifiez les résultats sur SonarQube')
                    } else if (qualityGateBackend.contains('OK') && qualityGateFrontend.contains('OK')) {
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
            ═══════════════════════════════════════════════════════════════════
            ✅ PIPELINE RÉUSSI !
            ═══════════════════════════════════════════════════════════════════
            
            🌐 Frontend React    : http://localhost:3000
            🔧 API Django        : http://localhost:8000/api/tasks/
            🗄️ Adminer (MySQL)   : http://localhost:8081
            🔍 SonarQube         : http://localhost:9000
            
            📊 Résultats SonarQube:
            - Backend  : http://localhost:9000/dashboard?id=task-manager-backend
            - Frontend : http://localhost:9000/dashboard?id=task-manager-frontend
            
            🔑 Accès SonarQube: admin / admin123
            ═══════════════════════════════════════════════════════════════════
            '''
        }
        failure {
            echo '''
            ═══════════════════════════════════════════════════════════════════
            ❌ PIPELINE ÉCHOUÉ !
            ═══════════════════════════════════════════════════════════════════
            
            🔍 Vérifiez les logs ci-dessus pour plus de détails.
            🔍 Consultez SonarQube: http://localhost:9000
            
            📋 Commandes de diagnostic:
            - docker-compose ps
            - docker-compose logs backend
            - docker-compose logs frontend
            - docker logs task_manager_sonarqube
            ═══════════════════════════════════════════════════════════════════
            '''
            bat 'docker-compose logs --tail=50'
        }
        always {
            echo '🧹 Fin du pipeline'
        }
    }
}