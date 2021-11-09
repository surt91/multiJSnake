pipeline {
    agent none
    stages {
        stage('Build') {
            agent any
            steps {
                sh './mvnw -Djavacpp.platform=linux-x86_64 clean package'
                sh 'rm -rf target/node'
                stash includes: 'target/', name: 'multijsnake'
            }
        }
        stage('Test') {
            agent any
            steps {
                unstash 'multijsnake'
                sh './mvnw test'
            }
        }

        // https://github.com/cypress-io/cypress-example-kitchensink/blob/master/basic/Jenkinsfile}
        stage('Cypress') {
            agent {
                // this image provides everything needed to run Cypress
                docker {
                    image 'cypress/base:10'
                }
            }
            steps {
                unstash 'multijsnake'
                sh 'npm install wait-on'
                sh 'java -jar target/multijsnake-0.0.1-SNAPSHOT.jar & wait-on http://localhost:8080'
                sh "npm run cy"
            }
        }
    }
}