// MOST COMMON BOX2D CLASSES
var b2Vec2 = Box2D.Common.Math.b2Vec2,
	b2AABB = Box2D.Collision.b2AABB,
	b2BodyDef = Box2D.Dynamics.b2BodyDef,
	b2Body = Box2D.Dynamics.b2Body,
	b2FixtureDef = Box2D.Dynamics.b2FixtureDef,
	b2Fixture = Box2D.Dynamics.b2Fixture,
	b2World = Box2D.Dynamics.b2World,
	b2MassData = Box2D.Collision.Shapes.b2MassData,
	b2PolygonShape = Box2D.Collision.Shapes.b2PolygonShape,
	b2CircleShape = Box2D.Collision.Shapes.b2CircleShape,
	b2DebugDraw = Box2D.Dynamics.b2DebugDraw,
	b2MouseJointDef =  Box2D.Dynamics.Joints.b2MouseJointDef,
    b2RayCastInput = Box2D.Collision.b2RayCastInput,
    b2RayCastOutput = Box2D.Collision.b2RayCastOutput;

// THE MAIN GAME ENGINE
PhysicsEngine = Class.extend({
	PHYSICS_FRAME_RATE: 1.0 / 60.0,
	PHYSICS_VELOCITY_ITERATIONS: 2,
	PHYSICS_POSITION_ITERATIONS: 5,
	debug: false,
	world: null,
	debugDraw: new b2DebugDraw(),
	init: function(){
		this.x_offset = 0;
		this.y_offset = 0;
		this.gravity = new b2Vec2(0, 9.7);
	},
	build: function(){
		this.world = new b2World(this.gravity,true);
	},
	update: function () {
		// step the physics world
		this.world.Step(
			this.PHYSICS_FRAME_RATE,			// FRAME RATE
			this.PHYSICS_VELOCITY_ITERATIONS,	// VELOCITY ITERATIONS
			this.PHYSICS_POSITION_ITERATIONS	// POSITION ITERATIONS
		);

		if(this.debug){
			this.world.DrawDebugData();
		}

		this.world.ClearForces();

		if(Config.LIGHTS){
			light_engine.update();
		}
	},
	addContactListener: function (callbacks) {
		var listener = new Box2D.Dynamics.b2ContactListener();

		if (callbacks.BeginContact) listener.BeginContact = function (contact) {
			callbacks.BeginContact(contact.GetFixtureA().GetBody(), contact.GetFixtureB().GetBody());
		}
		if (callbacks.EndContact) listener.EndContact = function (contact) {
			callbacks.EndContact(contact.GetFixtureA().GetBody(), contact.GetFixtureB().GetBody());
		}
		if (callbacks.PostSolve) listener.PostSolve = function (contact, impulse) {
			callbacks.PostSolve(contact.GetFixtureA().GetBody(), contact.GetFixtureB().GetBody(), impulse.normalImpulses[0]);
		}
        this.world.SetContactListener(listener);
	},
	addBody: function (entityDef) {
		// create box2d body
		var bodyDef = new b2BodyDef;
		if (entityDef.type == 'static') {
			bodyDef.type = b2Body.b2_staticBody;
		} else {
			bodyDef.type = b2Body.b2_dynamicBody;
		}
			bodyDef.position.Set(entityDef.x,entityDef.y);

		if(entityDef.allowSleep===false) bodyDef.allowSleep = false;
		if (entityDef.userData) bodyDef.userData = entityDef.userData;
		// register the body
		var body = this.registerBody(bodyDef);
		// create box2d fixture
		var fixDef = new b2FixtureDef;
		if (entityDef.radius) {
			fixDef.shape = new b2CircleShape(entityDef.radius);
		} else if (entityDef.polyPoints) {
			var points = entityDef.polyPoints;
			var vectors = [];
			for (var i = 0; i < points.length; i++) {
				var vec = new b2Vec2();
					vec.Set(points[i].x, points[i].y);
				vectors[i] = vec;
			}
        	fixDef.shape = new b2PolygonShape;
        	fixDef.shape.SetAsArray(vectors, vectors.length);
        } else {
        	fixDef.shape = new b2PolygonShape;
      		fixDef.shape.SetAsBox(entityDef.width, entityDef.height);
        }
		
		// set density and frition
		if (entityDef.type == 'static') {
			fixDef.density = 2; 
			fixDef.friction = 1;
		} else {
			fixDef.density = 2; 
			fixDef.friction = 0.5;
		}

		// Append the Fixture to the body
		body.CreateFixture(fixDef);
		return body;
	},
	vec: function(x,y){
		var vec = new b2Vec2();
		vec.Set(x, y);
		return vec;
	},
	registerBody: function (bodyDef) {
        var body = this.world.CreateBody(bodyDef);
        return body;
    },
    unregisterBody: function (body) {
        this.world.DestroyBody(body);
        return null;
    },
    debug: function(element,scale){
		//setup debug draw
		
		this.debugDraw.SetSprite(element);
		this.debugDraw.SetDrawScale(scale);
		this.debugDraw.SetFillAlpha(0.1);
		this.debugDraw.SetLineThickness(0.1);
		this.debugDraw.SetFlags(b2DebugDraw.e_shapeBit | b2DebugDraw.e_jointBit);
		this.world.SetDebugDraw(this.debugDraw);
		this.debug = true;
    }
});

var physics_engine = new PhysicsEngine();