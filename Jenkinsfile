pipeline {
    agent any

    environment {
        AWS_REGION = "us-east-1"                 // Public ECR region
        ALIAS = "o9v8l7j1"                       // Public ECR alias
        REPO_NAME = "calender-2026"              // Your repo name inside ECR
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
    }

    post {

        success {
            echo "Deployment Successful!"
            echo "Image deployed: ${FULL_IMAGE}"
            archiveArtifacts artifacts: 'deployment-service.yaml', fingerprint: true
        }

        failure {
            echo "Build Failed! Check Console Output."
        }

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
