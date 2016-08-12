node ('master') {
   stage 'Checkout'
   echo 'Checkout'
   // Get some code from a GitHub repository
   git url: 'git@github.com:uniray7/laputa-db.git', credentialsId:'laputa-db-cred'

   stage 'Build'
   echo 'Build'
   docker.withServer('tcp://dockerd:4243') {
      def db_img = docker.build("laputa-db", "docker/mongodb/")
      def web_db_img = docker.build("laputa-db-webui", "docker/webui_mongodb/")
   }

   stage 'Unittest'
   echo 'Unittest'

   docker.withServer('tcp://dockerd:4243') {
//    sh "docker run laputa-api npm test"
   }
}

