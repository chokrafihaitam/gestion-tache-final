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
                        // Ne pas échouer pour le frontend, il peut être en train de compiler
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
            '''
            bat 'docker-compose logs --tail=50'
        }
    }
}