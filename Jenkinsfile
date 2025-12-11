pipeline {
    agent any

    environment {
        AWS_REGION = "us-east-1"
        ALIAS = "o9v8l7j1"
        REPO_NAME = "calender-2026"
        ECR_URI = "public.ecr.aws/${ALIAS}/${REPO_NAME}"
        IMAGE_TAG = "latest"
        FULL_IMAGE = "${ECR_URI}:${IMAGE_TAG}"
        GIT_REPO = "https://github.com/bharathsavadatti447/k8s-ci-cd.git"
    }

    stages {

        stage('Checkout Code') {
            steps {
                git branch: 'main', url: "${GIT_REPO}"
            }
        }

        stage('Lint') {
            steps {
                sh """
                    echo "Linting Dockerfile..."
                    hadolint Dockerfile || true
                """
            }
        }

        stage('Docker Build') {
            steps {
                sh """
                    echo "Building Docker image: ${FULL_IMAGE}"
                    docker build -t ${FULL_IMAGE} .
                """
            }
        }

        stage('Login to AWS Public ECR') {
            steps {
                sh """
                    echo "Logging into AWS Public ECR..."
                    aws ecr-public get-login-password --region ${AWS_REGION} \
                        | docker login --username AWS --password-stdin public.ecr.aws/${ALIAS}
                """
            }
        }

        stage('Push Image to Public ECR') {
            steps {
                sh """
                    echo "Pushing image to ECR: ${FULL_IMAGE}"
                    docker push ${FULL_IMAGE}
                """
            }
        }

        stage('Deploy to Kubernetes') {
            steps {
                withKubeConfig(credentialsId: 'k8s-kubeconfig') {
                    sh """
                        echo "Deploying to Kubernetes..."
                        kubectl apply -f deployment-service.yaml
                        kubectl rollout status deployment/calendar-deployment --timeout=60s || true
                    """
                }
            }
        }

        stage('Post Actions') {
            when {
                expression { currentBuild.currentResult == "SUCCESS" || currentBuild.currentResult == "FAILURE" }
            }
            steps {
                script {

                    if (currentBuild.currentResult == "SUCCESS") {
                        echo "Deployment Successful!"
                        echo "Image deployed: ${FULL_IMAGE}"
                    } else {
                        echo "Build Failed. Review console output."
                    }

                    archiveArtifacts artifacts: 'deployment-service.yaml', fingerprint: true
                }
            }
        }
    }

    post {

        always {
            echo "Performing cleanup..."
            sh """
                docker image prune -f || true
                docker container prune -f || true
            """
            echo "Cleanup completed."
        }
    }
}
