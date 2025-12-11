pipeline {
    agent any

    environment {
        AWS_REGION = "us-east-1"   // Public ECR is here
        ALIAS = "o9v8l7j1"
        ECR_URI = "public.ecr.aws/o9v8l7j1/calender-2026"
        IMAGE_TAG = "latest"
        FULL_IMAGE = "${ECR_URI}:${IMAGE_TAG}"
        REPO = "https://github.com/bharathsavadatti447/k8s-ci-cd.git"
    }

    stages {

        stage('Checkout Code') {
            steps {
                git branch: 'main', url: "${REPO}"
            }
        }

        stage('Docker Build') {
            steps {
                sh "docker build -t ${FULL_IMAGE} ."
            }
        }

        stage('Login to AWS ECR') {
            steps {
                script {
                    sh '''
                        echo "Logging into AWS Public ECR..."
                        aws ecr-public get-login-password --region ${AWS_REGION} | \
                        docker login --username AWS --password-stdin public.ecr.aws/${ALIAS}
                    '''
                }
            }
        }

        stage('Push to Public ECR') {
            steps {
                sh "docker push ${FULL_IMAGE}"
            }
        }

        stage('Deploy to Kubernetes') {
            steps {
                withKubeConfig(credentialsId: 'kubeconfig-cred') {
                    sh """
                    kubectl apply -f deployment-service.yaml
                    """
                }
            }
        }
    }

    post {

        success {
            echo "Deployment Successful!"
            echo "Image deployed: ${FULL_IMAGE}"

            // OPTIONAL: Add Email Notification
            // mail to: 'team@example.com',
            //      subject: "SUCCESS: Build #${env.BUILD_NUMBER}",
            //      body: "Deployment completed successfully."

            // OPTIONAL: Slack Notification
            // slackSend channel: '#deployments', message: "SUCCESS: Build ${env.BUILD_NUMBER}"

            // Archive Deployment File
            archiveArtifacts artifacts: 'app.yaml', fingerprint: true
        }

        failure {
            echo "Build Failed!"

            // OPTIONAL Email
            // mail to: 'team@example.com',
            //      subject: "FAILURE: Build #${env.BUILD_NUMBER}",
            //      body: "Pipeline failed. Please check console output."

            // OPTIONAL Slack
            // slackSend channel: '#deployments', message: "FAILURE: Build ${env.BUILD_NUMBER}"
        }

        always {
            echo "Cleaning up Docker Images..."

            sh """
            docker image prune -f || true
            docker container prune -f || true
            """

            echo "Post build cleanup complete."
        }
    }
}
