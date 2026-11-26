// Pipeline de Bichomanía: pruebas automáticas (Jest + Maven/Selenium) + análisis SonarQube
// Funciona en Jenkins sobre Windows (bat) o Linux (sh).

def ejecutar(String comando) {
    if (isUnix()) { sh comando } else { bat comando }
}

pipeline {
    agent any

    // Se ejecuta solo cada vez que hay commits nuevos (revisa el repo cada 5 minutos)
    triggers {
        pollSCM('H/5 * * * *')
    }

    parameters {
        booleanParam(name: 'PRUEBAS_SELENIUM', defaultValue: false,
            description: 'Ejecutar también las pruebas funcionales Maven + Selenium (necesitan MySQL y Chrome)')
    }

    tools {
        nodejs 'node20'      // Manage Jenkins > Tools > NodeJS installations
        maven 'maven3'       // Manage Jenkins > Tools > Maven installations
        jdk 'jdk17'          // Manage Jenkins > Tools > JDK installations
    }

    environment {
        CI = 'true'
        JEST_JUNIT_OUTPUT_DIR = 'reportes'
    }

    options {
        timestamps()
        timeout(time: 40, unit: 'MINUTES')
        buildDiscarder(logRotator(numToKeepStr: '15'))
    }

    stages {
        stage('Checkout') {
            steps {
                checkout scm
            }
        }

        stage('Pruebas unitarias') {
            parallel {
                stage('Backend (Jest)') {
                    steps {
                        dir('backend') {
                            ejecutar 'npm ci'
                            ejecutar 'npm run test:ci'
                        }
                    }
                }
                stage('Frontend (Jest)') {
                    steps {
                        dir('frontend') {
                            ejecutar 'npm ci'
                            ejecutar 'npm run test:ci'
                        }
                    }
                }
            }
        }

        stage('Pruebas funcionales (Maven + Selenium)') {
            when { expression { params.PRUEBAS_SELENIUM } }
            steps {
                // .env.local guardado en Jenkins como credencial "Secret file" con id bichomania-env
                withCredentials([file(credentialsId: 'bichomania-env', variable: 'ENV_LOCAL')]) {
                    dir('backend') {
                        script {
                            if (isUnix()) {
                                sh 'cp "$ENV_LOCAL" .env.local && (nohup node index.js > backend.log 2>&1 &)'
                            } else {
                                bat 'copy /Y "%ENV_LOCAL%" .env.local && start "backend" /B cmd /c "node index.js > backend.log 2>&1"'
                            }
                        }
                    }
                }
                dir('frontend') {
                    script {
                        if (isUnix()) {
                            sh 'npm run build && (nohup npx serve -s build -l 3000 > frontend.log 2>&1 &)'
                        } else {
                            bat 'npm run build && start "frontend" /B cmd /c "npx serve -s build -l 3000 > frontend.log 2>&1"'
                        }
                    }
                }
                // Espera a que backend (3001) y frontend (3000) respondan
                script {
                    if (isUnix()) {
                        sh 'for i in $(seq 1 30); do curl -s localhost:3001 >/dev/null && curl -s localhost:3000 >/dev/null && exit 0; sleep 2; done; exit 1'
                    } else {
                        powershell '''
                            for ($i = 0; $i -lt 30; $i++) {
                                try { Invoke-WebRequest http://localhost:3001 -UseBasicParsing | Out-Null
                                      Invoke-WebRequest http://localhost:3000 -UseBasicParsing | Out-Null; exit 0 } catch { Start-Sleep 2 }
                            }
                            exit 1
                        '''
                    }
                }
                dir('backend/pruebas_funcionales_carrito') {
                    ejecutar 'mvn -B test -Dheadless=true'
                }
                dir('backend/pruebas_funcionales_encuesta') {
                    ejecutar 'mvn -B test -Dheadless=true'
                }
            }
        }

        stage('Análisis SonarQube') {
            steps {
                script {
                    def scanner = tool 'sonar-scanner'   // Manage Jenkins > Tools > SonarQube Scanner installations
                    withSonarQubeEnv('SonarQube') {      // Manage Jenkins > System > SonarQube servers
                        if (isUnix()) {
                            sh "${scanner}/bin/sonar-scanner"
                        } else {
                            bat "\"${scanner}\\bin\\sonar-scanner.bat\""
                        }
                    }
                }
            }
        }

        stage('Quality Gate') {
            steps {
                // Necesita el webhook de SonarQube hacia http://<jenkins>/sonarqube-webhook/
                timeout(time: 5, unit: 'MINUTES') {
                    waitForQualityGate abortPipeline: false
                }
            }
        }
    }

    post {
        always {
            junit allowEmptyResults: true, testResults: '''
                backend/reportes/*.xml,
                frontend/reportes/*.xml,
                backend/pruebas_funcionales_*/target/surefire-reports/*.xml
            '''
            archiveArtifacts allowEmptyArchive: true, artifacts: 'backend/coverage/lcov-report/**, frontend/coverage/lcov-report/**, **/*.log'
        }
        success { echo 'Todas las pruebas pasaron y el análisis se envió a SonarQube.' }
        failure { echo 'Falló alguna etapa: revisa la pestaña "Test Result" o la consola.' }
    }
}
