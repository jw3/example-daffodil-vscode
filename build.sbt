lazy val daffodilVer = "3.1.0"

lazy val commonSettings = {
  Seq(
    git.useGitDescribe := true,
    libraryDependencies ++= Seq(
      "org.apache.daffodil" %% "daffodil-sapi" % daffodilVer,
      "org.apache.daffodil" %% "daffodil-runtime1" % daffodilVer,
    ),
    licenses += ("Apache-2.0", new URL("https://www.apache.org/licenses/LICENSE-2.0.txt")),
    organization := "Adam Rosien, John Wass",
    scalaVersion := "2.12.13",
    scalacOptions ++= Seq("-Ypartial-unification"),
    startYear := Some(2021),
  )
}

lazy val commonPlugins = Seq(BuildInfoPlugin, GitVersioning, JavaAppPackaging, UniversalPlugin)

lazy val `daffodil-debugger` = project
  .in(file("."))
  .settings(commonSettings)
  .settings(publish / skip := true)
  .dependsOn(core)
  .aggregate(core)

lazy val core = project
  .in(file("server/core"))
  .settings(commonSettings)
  .settings(
    name := "daffodil-debugger",
    libraryDependencies ++= Seq(
      "ch.qos.logback" % "logback-classic" % "1.2.3",
      "com.microsoft.java" % "com.microsoft.java.debug.core" % "0.31.1",
      "co.fs2" %% "fs2-io" % "3.0.4",
      "com.monovore" %% "decline-effect" % "2.1.0",
      "org.typelevel" %% "log4cats-slf4j" % "2.1.0",
    ),
    buildInfoKeys := Seq[BuildInfoKey](name, version, scalaVersion, sbtVersion, "daffodilVersion" -> daffodilVer, "commit" -> git.gitHeadCommit.value.getOrElse("(unknown)")),
    buildInfoOptions += BuildInfoOption.BuildTime,
    buildInfoPackage := "org.apache.daffodil.debugger.dap",
    packageName := s"${name.value}-$daffodilVer",
  )
  .enablePlugins(commonPlugins: _*)
