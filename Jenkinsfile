pipeline {
    agent any
    
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
                    docker stop task_manager_mysql task_manager_backend task_manager_frontend task_manager_adminer 2>nul || exit 0
                    echo "Suppression des conteneurs..."
                    docker rm task_manager_mysql task_manager_backend task_manager_frontend task_manager_adminer 2>nul || exit 0
                    echo "✅ Nettoyage terminé"
                '''
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
                    echo "Démarrage des services..."
                    docker-compose up -d mysql backend frontend adminer
                    echo "✅ Services démarrés"
                '''
            }
        }
        
        stage('Wait') {
            steps {
                echo '⏳ Attente du démarrage...'
                bat 'powershell -Command "Start-Sleep -Seconds 20"'
            }
        }
        
        stage('Health Check') {
            steps {
                echo '🏥 Vérification de la santé des services...'
                script {
                    bat 'docker-compose ps'
                    
                    try {
                        bat 'curl -f http://localhost:8000/api/tasks/'
                        echo '✅ API Django fonctionnelle'
                    } catch (Exception e) {
                        echo '❌ API non disponible'
                        bat 'docker-compose logs backend --tail=20'
                        error('API test failed')
                    }
                    
                    try {
                        bat 'curl -f http://localhost:3000'
                        echo '✅ Frontend React fonctionnel'
                    } catch (Exception e) {
                        echo '⚠️ Frontend non disponible (compilation en cours)'
                    }
                }
            }
        }
        
        stage('Migrations') {
            steps {
                echo '🔄 Exécution des migrations Django...'
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
            
            ═══════════════════════════════════════════════════════
            '''
        }
        failure {
            echo '❌ PIPELINE ÉCHOUÉ!'
            bat 'docker-compose logs --tail=50'
        }
    }
}