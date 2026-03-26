pipeline {
    agent any
    
    environment {
        SONAR_HOST_URL = 'http://localhost:9000'
        SONAR_TOKEN = credentials('sonarqube-token')
        SONARQUBE_INSTALLATION = 'SonarQube'

    }
    
    stages {
        stage('Checkout') {
            steps {
                echo '📦 Récupération du code...'
                checkout scm
            }
        }
        stage('SonarQube analysis') {
            steps {
                withSonarQubeEnv("${env.SONARQUBE_INSTALLATION}") {
                    sh '''
                        set -e
                        if [ -z "${SONAR_HOST_URL:-}" ]; then
                          echo "ERROR: SONAR_HOST_URL is empty. In Jenkins: Manage Jenkins → Configure System → SonarQube servers, set Server URL to an address this agent can reach (not localhost if SonarQube runs elsewhere or Jenkins is in Docker)."
                          exit 1
                        fi
                        bunx sonarqube-scanner \
                          -Dsonar.host.url="$SONAR_HOST_URL" \
                          -Dsonar.token="${SONAR_AUTH_TOKEN:-}"
                    '''
                }
            }
        }
        
//         stage('SonarQube Analysis Backend') {
//             steps {
//                 echo '🔍 Analyse du backend avec SonarQube...'
//                 script {
//                     // Créer le fichier de configuration SonarQube pour le backend
//                     writeFile file: 'backend/sonar-project.properties', text: """
// sonar.projectKey=task-manager-backend
// sonar.projectName=Task Manager Backend
// sonar.projectVersion=1.0
// sonar.sources=.
// sonar.exclusions=**/migrations/**,**/tests/**,**/__pycache__/**,**/static/**,**/media/**
// sonar.language=py
// sonar.python.version=3.11
// sonar.sourceEncoding=UTF-8
// sonar.host.url=${SONAR_HOST_URL}
// sonar.login=${SONAR_TOKEN}
// """
                    
//                     // Exécuter l'analyse SonarQube
//                     bat '''
//                         docker run --rm --network host -v %cd%\backend:/usr/src -w /usr/src sonarsource/sonar-scanner-cli
//                     '''
//                     echo '✅ Analyse backend terminée'
//                 }
//             }
//         }
        
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
                        docker run --rm --network host -v %cd%\frontend:/usr/src -w /usr/src sonarsource/sonar-scanner-cli
                    '''
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
                    // Attendre le démarrage complet
                    bat 'powershell -Command "Start-Sleep -Seconds 20"'
                    
                    // Vérifier que tous les conteneurs tournent
                    bat 'docker-compose ps'
                    
                    // Tester l'API
                    try {
                        bat 'curl -f http://localhost:8000/api/tasks/'
                        echo '✅ API fonctionnelle'
                    } catch (Exception e) {
                        echo '❌ API non disponible'
                        bat 'docker-compose logs backend'
                        error('API test failed')
                    }
                    
                    // Tester le frontend
                    try {
                        bat 'curl -f http://localhost:3000'
                        echo '✅ Frontend fonctionnel'
                    } catch (Exception e) {
                        echo '⚠️ Frontend non disponible'
                        bat 'docker-compose logs frontend'
                    }
                    
                    // Tester SonarQube
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
                bat '''
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
                    bat 'powershell -Command "Start-Sleep -Seconds 10"'
                    
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
                    } else {
                        echo '✅ Quality Gate passé avec succès!'
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
            🔍 Consultez SonarQube: http://localhost:9000
            
            ═══════════════════════════════════════════════════════
            '''
            bat 'docker-compose logs --tail=50'
        }
        always {
            echo '🧹 Fin du pipeline'
        }
    }
}
// pipeline {
//     agent any
    
//     stages {
//         stage('Checkout') {
//             steps {
//                 echo '📦 Récupération du code...'
//                 checkout scm
//             }
//         }
        
//         stage('Build Docker') {
//             steps {
//                 echo '🏗️ Construction des images Docker...'
//                 bat '''
//                     echo "Construction du backend..."
//                     docker build -t task-manager-backend:latest ./backend
//                     if %errorlevel% neq 0 exit /b %errorlevel%
                    
//                     echo "Construction du frontend..."
//                     docker build -t task-manager-frontend:latest ./frontend
//                     if %errorlevel% neq 0 exit /b %errorlevel%
                    
//                     echo "✅ Images construites"
//                 '''
//             }
//         }
        
//         stage('Deploy') {
//             steps {
//                 echo '🚀 Déploiement...'
//                 bat '''
//                     echo "Arrêt des anciens conteneurs..."
//                     docker-compose down || exit 0
                    
//                     echo "Démarrage des nouveaux conteneurs..."
//                     docker-compose up -d
                    
//                     echo "✅ Déploiement terminé"
//                 '''
//             }
//         }
        
//         stage('Health Check') {
//             steps {
//                 echo '🏥 Vérification de la santé des services...'
//                 script {
//                     // Attendre le démarrage complet
//                     bat 'powershell -Command "Start-Sleep -Seconds 20"'
                    
//                     // Vérifier que tous les conteneurs tournent
//                     bat 'docker-compose ps'
                    
//                     // Tester l'API
//                     try {
//                         bat 'curl -f http://localhost:8000/api/tasks/'
//                         echo '✅ API fonctionnelle'
//                     } catch (Exception e) {
//                         echo '❌ API non disponible'
//                         bat 'docker-compose logs backend'
//                         error('API test failed')
//                     }
                    
//                     // Tester le frontend
//                     try {
//                         bat 'curl -f http://localhost:3000'
//                         echo '✅ Frontend fonctionnel'
//                     } catch (Exception e) {
//                         echo '⚠️ Frontend non disponible'
//                         bat 'docker-compose logs frontend'
//                         // Ne pas échouer pour le frontend, il peut être en train de compiler
//                     }
//                 }
//             }
//         }
        
//         stage('Migrations') {
//             steps {
//                 echo '🔄 Migrations Django...'
//                 bat '''
//                     docker-compose exec -T backend python manage.py migrate
//                     echo "✅ Migrations effectuées"
//                 '''
//             }
//         }
//     }
    
//     post {
//         success {
//             echo '''
//             ═══════════════════════════════════════════════════════
//             ✅ PIPELINE RÉUSSI !
//             ═══════════════════════════════════════════════════════
            
//             🌐 Frontend : http://localhost:3000
//             🔧 API : http://localhost:8000/api/tasks/
//             🗄️ Adminer : http://localhost:8081
            
//             ═══════════════════════════════════════════════════════
//             '''
//         }
//         failure {
//             echo '''
//             ═══════════════════════════════════════════════════════
//             ❌ PIPELINE ÉCHOUÉ !
//             ═══════════════════════════════════════════════════════
//             '''
//             bat 'docker-compose logs --tail=50'
//         }
//     }
// }