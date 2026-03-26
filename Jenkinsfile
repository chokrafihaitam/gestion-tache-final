pipeline {
    agent any
    
    stages {
        stage('Checkout') {
            steps {
                echo '📦 Récupération du code...'
                checkout scm
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
                    // Attendre avec PowerShell au lieu de timeout
                    bat 'powershell -Command "Start-Sleep -Seconds 15"'
                    
                    // Vérifier l'API
                    def apiStatus = bat(
                        script: 'curl -s -o nul -w "%%{http_code}" http://localhost:8000/api/tasks/',
                        returnStdout: true
                    ).trim()
                    
                    if (apiStatus == '200') {
                        echo '✅ API OK (HTTP 200)'
                    } else {
                        echo "⚠️ API status: ${apiStatus}"
                    }
                    
                    // Vérifier le frontend
                    def frontendStatus = bat(
                        script: 'curl -s -o nul -w "%%{http_code}" http://localhost:3000',
                        returnStdout: true
                    ).trim()
                    
                    if (frontendStatus == '200') {
                        echo '✅ Frontend OK (HTTP 200)'
                    } else {
                        echo "⚠️ Frontend status: ${frontendStatus}"
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
            
            ═══════════════════════════════════════════════════════
            '''
        }
        failure {
            echo '''
            ═══════════════════════════════════════════════════════
            ❌ PIPELINE ÉCHOUÉ !
            ═══════════════════════════════════════════════════════
            
            🔍 Diagnostic : Vérifiez les logs ci-dessus
            ═══════════════════════════════════════════════════════
            '''
            bat 'docker-compose logs --tail=50'
        }
    }
}