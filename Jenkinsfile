node ('master') {
   stage 'Checkout'
   echo 'Checkout'
   // Get some code from a GitHub repository
   git url: 'git@github.com:uniray7/laputa-api.git', credentialsId:'laputa-api-credential'

   stage 'Build'
   echo 'Build'
   docker.withServer('tcp://dockerd:4243') {
      def img = docker.build("laputa-db", "-f docker/mongodb/Dockerfile")
   }

   stage 'Unittest'
   echo 'Unittest'

   docker.withServer('tcp://dockerd:4243') {
//    sh "docker run laputa-api npm test"
   }
}

