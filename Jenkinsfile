pipeline {
    agent any

    tools {
        nodejs 'nodejs-18'
    }

    environment {
        DOCKERHUB_CREDENTIALS = credentials('dockerhub-creds')
        IMAGE_NAME = "YOUR_DOCKERHUB_USERNAME/hello-jenkins"
        IMAGE_TAG  = "${BUILD_NUMBER}"
        JEST_JUNIT_OUTPUT_DIR  = 'test-results'
        JEST_JUNIT_OUTPUT_NAME = 'junit.xml'
    }

    stages {

        stage('Checkout') {
            steps { checkout scm }
        }

        stage('Install & Test') {
            steps { sh 'npm ci && npm test' }
            post {
                always { junit 'test-results/junit.xml' }
            }
        }

        stage('Build & Push Docker Image') {
            steps {
                sh "docker build -t ${IMAGE_NAME}:${IMAGE_TAG} ."
                sh """
                    echo ${DOCKERHUB_CREDENTIALS_PSW} | \
                    docker login -u ${DOCKERHUB_CREDENTIALS_USR} --password-stdin
                    docker push ${IMAGE_NAME}:${IMAGE_TAG}
                """
            }
        }

        stage('Deploy to Kubernetes') {
            when { branch 'main' }
            steps {
                sh """
                    kubectl set image deployment/hello-jenkins \
                        hello-jenkins=${IMAGE_NAME}:${IMAGE_TAG}
                    kubectl rollout status deployment/hello-jenkins --timeout=120s
                """
            }
        }

    }

    post {
        success { echo "Build ${BUILD_NUMBER} deployed successfully." }
        failure {
            sh "kubectl rollout undo deployment/hello-jenkins || true"
            echo "Build ${BUILD_NUMBER} failed — rolled back."
        }
    }
}