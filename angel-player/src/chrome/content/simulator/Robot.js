/*/============================
Actual robot
============================/*/

/*
Robot is the main robot class
    setMotor sets a value to the specified port; port being a key in a dictionary
    simulate runs motors at specified values, gets sensory information
    updateMotors gets new motor values from master object
    updateSensors writes sensory data to master object
    initChassi allows the user to begin building
    addShape adds a shape to the chassi:
        shape is a shape object, from Ammo.js
        trasnform is relative location to center of bot, and rotation of object
        mesh is the three.js mesh
    finishChassi does physics to finalize chassi
    addSensor + addMotor connects an object to the port value
        physicsObject is the physicsObject of the portObject; may be seperate
        chassiLoc is where it should be connected to on the chassi
        objectLoc is where it should be connected to on the object
        chassi axis is in which axis (relative to robot chassi) the hinge should be connected
        object axis is in which axis (relative to object) the hinge should be connected
*/
function Robot()
{
    this.chassi = null;
    this.mesh = null;
    this.portObjects = {};
    this.portValues = {};
    this.motors = {};
    this.sensors = {};
    this.mass = 0;

    return this;
}

Robot.prototype.setMotor = function(port, value)
{
    this.motors[port].setVal(value);
    this.master.motors[port] = value;
};

Robot.prototype.simulate = function()
{
    for(var port in this.motors)
    {
        this.motors[port].run();
    }

    for(port in this.sensors)
    {
        this.sensors[port].run();
    }
};

Robot.prototype.updateMotors = function()
{
    for(var port in this.motors)
    {
        this.motors[port].setVal(master.motors[port]);
    }
};

Robot.prototype.updateSensors = function()
{
    for(var port in this.sensors)
    {
        master.sensors[port] = this.sensors[port].getVal();
    }
};

Robot.prototype.initChassi = function()
{
    this.mesh = new THREE.Object3D();
    this.chassi = new Ammo.btCompoundShape();
};

Robot.prototype.addShape = function(shape, transform, mass, mesh)
{
    this.chassi.addChildShape(transform, shape);
    mesh.position.set(transform.getOrigin().x(), transform.getOrigin().y(), transform.getOrigin().z());
    this.mesh.add(mesh);
    this.mass += mass;
};

Robot.prototype.finishChassi = function(iniX, iniY, iniZ)
{
    var startTransform = new Ammo.btTransform();
    startTransform.setIdentity();
    startTransform.setOrigin(new Ammo.btVector3(iniX, iniY, iniZ)); // Set initial position

    var localInertia = new Ammo.btVector3(0, 0, 0);

    this.chassi.calculateLocalInertia(this.mass, localInertia );

    var motionState = new Ammo.btDefaultMotionState( startTransform );
    var cpInfo = new Ammo.btRigidBodyConstructionInfo(this.mass, motionState, this.chassi, localInertia );
    this.physicsChassi = new Ammo.btRigidBody( cpInfo );
    scene.world.addRigidBody( this.physicsChassi );

    physicsObjects.push(this.physicsChassi);
    this.physicsChassi.mesh = this.mesh;
    scene.add(this.mesh);
};

Robot.prototype.addMotor = function(port, object, physicsObject, chassiLoc, objectLoc, chassiAxis, objectAxis)
{
    master.motors[port] = 0;
    this.motors[port] = object;

    var constraint = new Ammo.btHingeConstraint(this.physicsChassi, physicsObject,
                                                chassiLoc,
                                                objectLoc,
                                                chassiAxis,
                                                objectAxis);
    constraint.setLimit(0, 0);
    scene.world.addConstraint(constraint);
};

Robot.prototype.addSensor = function(port, object, physicsObject, chassiLoc, objectLoc, chassiAxis, objectAxis)
{
    master.sensors[port] = 0;
    this.sensors[port] = object;

    var constraint = new Ammo.btHingeConstraint(this.physicsChassi, physicsObject,
                                                chassiLoc,
                                                objectLoc,
                                                chassiAxis,
                                                objectAxis);
    constraint.setLimit(0, 0);
    scene.world.addConstraint(constraint);
};