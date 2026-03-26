pipeline {
    agent any
    
    stages {
        stage('Démarrage') {
            steps {
                echo '========================================'
                echo '   GESTION DE TÂCHES - PIPELINE CI/CD'
                echo '========================================'
                bat 'echo "Projet : Gestion de Tâches"'
                bat 'echo "Date : %DATE%"'
                bat 'echo "Heure : %TIME%"'
            }
        }
        
        stage('Construction') {
            steps {
                echo '🏗️ Construction des images Docker...'
                bat 'docker build -t task-manager-backend:latest ./backend'
                bat 'docker build -t task-manager-frontend:latest ./frontend'
            }
        }
        
        stage('Démarrage') {
            steps {
                echo '🚀 Démarrage de l\'application...'
                bat 'docker-compose up -d'
                bat 'timeout /t 10'
            }
        }
        
        stage('Vérification') {
            steps {
                echo '🔍 Vérification des services...'
                bat 'curl -s http://localhost:8000/api/tasks/'
                echo ''
                bat 'curl -s http://localhost:3000 > nul'
                echo '✅ Services vérifiés'
            }
        }
        
        stage('Informations') {
            steps {
                echo '''
                ═══════════════════════════════════════════════
                📊 INFORMATIONS DE DÉPLOIEMENT
                ═══════════════════════════════════════════════
                
                🌐 Frontend : http://localhost:3000
                🔧 API : http://localhost:8000/api/tasks/
                🗄️ Adminer : http://localhost:8081
                🐳 MySQL : localhost:3306
                
                📝 Utilisateur MySQL : taskuser
                🔑 Mot de passe : taskpassword
                💾 Base de données : task_manager
                
                ═══════════════════════════════════════════════
                '''
            }
        }
    }
    
    post {
        success {
            echo '✅ PIPELINE TERMINÉ AVEC SUCCÈS !'
        }
        failure {
            echo '❌ PIPELINE ÉCHOUÉ ! Vérifiez les logs ci-dessus.'
        }
    }
}