Step by Step guide to run RWS Example.

1) Copy files from fp-components release into fp-components folder in this root.

2) Copy files from rws-api release into rws-api folder in this root.

3) Copy entire rws-example folder into controller's HOME/WebApps/ path.

4) In RobotStudio, with correct system running, Go to Controller tab and right-click on your task. Select Load module and
   in controller-files folder you will find a module named Example.mod which should be loaded in order to set up correct RAPID values.
   NOTE! if you already have a module with main proc you need to delete that module, or rename it's main proc to something else.

5) Go to Controller tab in RobotStudio and select Load parameters. Now load the EIO.cfg file located in controller-files folder in
   in order to set up correct I/O signals.
   NOTE! The option "Load parameters and replace duplicates" should be selected to avoid removing the existing EIO configuration.

6) Restart controller and start FlexPendant. You should now see RWS Example application and be able to use it.