// Testing Server
pipeline {
  agent any
  environment {
          // Define the email recipient address as an environment variable
          MAIL_ID = '(MAIL_ID)'  // Change your mail ID here example:chenna.m@getster.tech
         app_id = '(APP_ID)'
      }

    post {
        always {
            echo 'These actions run regardless of build status.'
            // Add your post-build actions that always run here
            emailext (
                subject: 'Your Backend Testing Build Started Notification',
                body: 'Your Backend Testing  build was started.',
                to: "${MAIL_ID}",
                mimeType: 'text/html',
                attachLog: true,  // Attach the build log to the email
                from: 'jenkins@getster.tech'  // Use the fully qualified sender address
            )
        }
        success {


            // Send success telegram message
            script {
                def successMessage = " The APP ID ${app_id} (Back - end) has been successfully deployed on the testing server."
                def response = httpRequest(
                    acceptType: 'APPLICATION_JSON',
                    contentType: 'APPLICATION_FORM',
                    attaching: true,
                    httpMode: 'POST',
                    url: 'https://api.telegram.org/bot6461768492:AAHnfG526lxo5t8PCpHAQPIrbNqN83qMub0/sendMessage',
                    requestBody: "chat_id=-1001912130570&text=${successMessage}"
                )

                echo "Telegram API Response: ${response}"
            }
            // Send success email
            echo 'Your Backend Testing Build succeeded! Sending email notification...'
            emailext (
                subject: 'Your Backend Testing Build Success Notification',
                body: 'Your Backend Testing  build was successful.',
                to: "${MAIL_ID}",
                mimeType: 'text/html',
                attachLog: true,  // Attach the build log to the email
                from: 'jenkins@getster.tech'  // Use the fully qualified sender address
            )
        }
        failure {

            script {
        // Capture console logs
        def consoleLog = currentBuild.rawBuild.getLog(1000).join('\n') // Gets the last 1000 lines of console output

        // Save consoleLog to a temporary file
        def logFile = "${app_id}_log_${currentBuild.number}.txt"
        writeFile(file: logFile, text: consoleLog)

        // Construct the message
        def failureMessage = "The APP ID ${app_id} (Back - end) has been failed deployed on the testing server."

        // Send the file to Telegram with a caption
        sh """
        curl -v -F "chat_id=-1001912130570" \
             -F document=@${logFile} \
             -F "caption=${failureMessage}" \
             https://api.telegram.org/bot6461768492:AAHnfG526lxo5t8PCpHAQPIrbNqN83qMub0/sendDocument
        """

        // Optionally, delete the temporary log file after sending
        sh "rm -f ${logFile}"

}


          // Send failure email
            echo 'Your Backend Testing Build failed! Sending email notification...'
            emailext (
                subject: 'Your Backend Testing Build Failure Notification',
                body: 'Your Backend Testing  build has failed. Please investigate.',
                to: "${MAIL_ID}",
                mimeType: 'text/html',
                attachLog: true,  // Attach the build log to the email
                from: 'jenkins@getster.tech'  // Use the fully qualified sender address
            )
        }
    }
   stages {
    stage('Build') {
      steps {
        sh 'npm i'
        sh 'npx nest build'
         }
    }
    stage('Dockerfile') {
      steps {
          dir('dist/'){
        writeFile file: 'Dockerfile', text: '''
          FROM node:latest
          WORKDIR /usr/src/app
          COPY package*.json ./
          RUN npm i -f
          COPY . .
          EXPOSE 3000
          CMD ["sh", "-c", "echo 'nameserver 8.8.8.8' >> /etc/resolv.conf && node main.js"]
        '''
         }
      }
    }
stage('dist') {
    steps {
        dir('dist/') {
            withCredentials([string(credentialsId: 'Mysql-Password', variable: 'MYSQL_PASSWORD')]) {
                        writeFile file: "${app_id}api.sh", text: '''
                            pattern="'(?<=:v)\\d+'"
                            sudo sed -i 's#^\\s*PORT\\s*=\\s*.*#PORT=3000#' .env
                            sudo sed -i 's#^\\s*DB_USERNAME\\s*=\\s*.*#DB_USERNAME=admin#' .env
                            sudo sed -i 's#^\\s*DB_PASSWORD\\s*=\\s*.*#DB_PASSWORD=''' + "${MYSQL_PASSWORD}" + '''#' .env
                            sudo sed -i 's#^\\s*DB_HOST\\s*=\\s*.*#DB_HOST=49.50.69.62#' .env
                            file="${app_id}/${app_id}api.yaml"
                            image="${app_id}api"
                            current_version=$(ssh root@49.50.69.62 -p2235 "grep -oP \$pattern /root/getster-apps/\$file")
                            new_version=$(echo \$current_version | awk -F. -v OFS=. '{++\$NF; print}')
                            new_version="v\$new_version"
                            sudo docker build . -t ghcr.io/testimages/${app_id}api:\$new_version
                            sudo docker push ghcr.io/testimages/${app_id}api:\$new_version
                            ssh root@49.50.69.62 -p2235 "sed -i 's|image: ghcr.io/testimages/\$image:.*|image: ghcr.io/testimages/\$image:\$new_version|g' /root/getster-apps/${app_id}/${app_id}api.yaml"
                            ssh root@49.50.69.62 -p2235 "kubectl apply -f /root/getster-apps/${app_id}/${app_id}api.yaml"
                            ssh root@49.50.69.62 -p2235 "kubectl get pod | grep ${app_id}"
                        '''
            }
        }
     }
  }
     stage('cp'){
        steps{
          dir('dist'){
              sh 'cp ../package*.json .'
              sh 'cp ../.env .'
            }
         }
    }

        stage('run'){
                 steps{
                  dir('dist'){
                      sh "chmod +x ${app_id}api.sh"
                      sh "./${app_id}api.sh"
                  }
                }
        }
  }
}
