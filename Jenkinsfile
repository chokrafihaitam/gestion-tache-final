pipeline {
    agent any
    
    stages {
        stage('Initialisation') {
            steps {
                echo '========================================'
                echo '   GESTION DE TÂCHES - PIPELINE CI/CD'
                echo '========================================'
                script {
                    def date = new Date()
                    echo "📅 Date : ${date.format('dd/MM/yyyy')}"
                    echo "⏰ Heure : ${date.format('HH:mm:ss')}"
                }
            }
        }
        
        stage('Checkout') {
            steps {
                echo '📦 Récupération du code source...'
                checkout scm
                echo '✅ Code récupéré avec succès'
            }
        }
        
        stage('Build Docker Backend') {
            steps {
                echo '🐳 Construction de l\'image backend...'
                script {
                    try {
                        sh '''
                            cd backend
                            docker build -t task-manager-backend:latest .
                        '''
                        echo '✅ Image backend construite'
                    } catch (Exception e) {
                        echo '❌ Erreur construction backend'
                        throw e
                    }
                }
            }
        }
        
        stage('Build Docker Frontend') {
            steps {
                echo '🐳 Construction de l\'image frontend...'
                script {
                    try {
                        sh '''
                            cd frontend
                            docker build -t task-manager-frontend:latest .
                        '''
                        echo '✅ Image frontend construite'
                    } catch (Exception e) {
                        echo '❌ Erreur construction frontend'
                        throw e
                    }
                }
            }
        }
        
        stage('Stop Services') {
            steps {
                echo '🛑 Arrêt des services existants...'
                sh '''
                    docker-compose down || true
                '''
                echo '✅ Services arrêtés'
            }
        }
        
        stage('Start Services') {
            steps {
                echo '🚀 Démarrage des services...'
                sh '''
                    docker-compose up -d
                '''
                echo '✅ Services démarrés'
            }
        }
        
        stage('Wait') {
            steps {
                echo '⏳ Attente du démarrage des services...'
                sh 'sleep 15'
            }
        }
        
        stage('Database Migrations') {
            steps {
                echo '🔄 Exécution des migrations Django...'
                script {
                    try {
                        sh '''
                            docker-compose exec -T backend python manage.py migrate
                        '''
                        echo '✅ Migrations appliquées'
                    } catch (Exception e) {
                        echo '⚠️ Erreur migrations, mais continue...'
                    }
                }
            }
        }
        
        stage('Test API') {
            steps {
                echo '🧪 Test de l\'API Django...'
                script {
                    try {
                        sh 'curl -f http://localhost:8000/api/tasks/'
                        echo '✅ API fonctionnelle'
                    } catch (Exception e) {
                        echo '❌ API non disponible'
                        sh 'docker-compose logs backend'
                        error('API test failed')
                    }
                }
            }
        }
        
        stage('Test Frontend') {
            steps {
                echo '🧪 Test du frontend React...'
                script {
                    try {
                        sh 'curl -f http://localhost:3000'
                        echo '✅ Frontend fonctionnel'
                    } catch (Exception e) {
                        echo '❌ Frontend non disponible'
                        sh 'docker-compose logs frontend'
                        error('Frontend test failed')
                    }
                }
            }
        }
        
        stage('Final Status') {
            steps {
                echo '''
                ═══════════════════════════════════════════════════════
                ✅ PIPELINE RÉUSSI !
                ═══════════════════════════════════════════════════════
                
                📱 Frontend : http://localhost:3000
                🔧 API : http://localhost:8000/api/tasks/
                🗄️ Adminer : http://localhost:8081
                
                🐳 Conteneurs :
                - MySQL : port 3306
                - Backend : port 8000
                - Frontend : port 3000
                - Adminer : port 8081
                
                ═══════════════════════════════════════════════════════
                '''
            }
        }
    }
    
    post {
        success {
            echo '🎉 PIPELINE TERMINÉ AVEC SUCCÈS !'
        }
        failure {
            echo '''
            ═══════════════════════════════════════════════════════
            ❌ PIPELINE ÉCHOUÉ !
            ═══════════════════════════════════════════════════════
            
            📋 Voir les logs ci-dessus pour les erreurs.
            
            🔍 Commandes de diagnostic :
            - docker-compose logs backend
            - docker-compose logs frontend
            - docker-compose ps
            ═══════════════════════════════════════════════════════
            '''
        }
        always {
            echo '🧹 Fin du pipeline'
        }
    }
}