name := "daffodil-debugger"

git.useGitDescribe := true

scalacOptions ++= Seq("-Ypartial-unification")
scalaVersion := "2.12.13"

val daffodilVer = "3.1.0"
libraryDependencies := Seq(
  "ch.qos.logback" % "logback-classic" % "1.2.3",
  "com.microsoft.java" % "com.microsoft.java.debug.core" % "0.31.1",
  "co.fs2" %% "fs2-io" % "3.0.4",
  "com.monovore" %% "decline-effect" % "2.1.0",
  "org.apache.daffodil" %% "daffodil-sapi" % daffodilVer,
  "org.apache.daffodil" %% "daffodil-runtime1" % daffodilVer,
  "org.typelevel" %% "log4cats-slf4j" % "2.1.0",
)

buildInfoKeys := Seq[BuildInfoKey](name, version, scalaVersion, sbtVersion, "daffodilVersion" -> daffodilVer)
buildInfoPackage := "org.apache.daffodil.debugger.dap"

enablePlugins(BuildInfoPlugin, GitVersioning, JavaAppPackaging, UniversalPlugin)
