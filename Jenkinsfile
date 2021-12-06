pipeline {
    agent any
    stages {
        stage('Build') {
            steps {
                sh './mvnw -Djavacpp.platform=linux-x86_64 clean package'
                sh 'rm -rf target/node'
                stash includes: 'target/', name: 'multijsnake'
            }
        }
        stage('Test') {
            steps {
                unstash 'multijsnake'
                sh './mvnw test'
            }
        }
        stage('Cypress') {
            steps {
                unstash 'multijsnake'
                sh './mvnw integration-test'
            }
        }
    }
}