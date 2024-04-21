/**
 * The MIT License
 *
 * Copyright © 2023 Yuka authors
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in
 * all copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
 * THE SOFTWARE.
 */

/**
* Class for representing a telegram, an envelope which contains a message
* and certain metadata like sender and receiver. Part of the messaging system
* for game entities.
*
* @author {@link https://github.com/Mugen87|Mugen87}
*/
class Telegram {

	/**
	* Constructs a new telegram object.
	*
	* @param {GameEntity} sender - The sender.
	* @param {GameEntity} receiver - The receiver.
	* @param {String} message - The actual message.
	* @param {Number} delay - A time value in millisecond used to delay the message dispatching.
	* @param {Object} data - An object for custom data.
	*/
	constructor( sender, receiver, message, delay, data ) {

		/**
		* The sender.
		* @type {GameEntity}
		*/
		this.sender = sender;

		/**
		* The receiver.
		* @type {GameEntity}
		*/
		this.receiver = receiver;

		/**
		* The actual message.
		* @type {String}
		*/
		this.message = message;

		/**
		* A time value in millisecond used to delay the message dispatching.
		* @type {Number}
		*/
		this.delay = delay;

		/**
		* An object for custom data.
		* @type {Object}
		*/
		this.data = data;

	}

	/**
	* Transforms this instance into a JSON object.
	*
	* @return {Object} The JSON object.
	*/
	toJSON() {

		return {
			type: this.constructor.name,
			sender: this.sender.uuid,
			receiver: this.receiver.uuid,
			message: this.message,
			delay: this.delay,
			data: this.data
		};

	}

	/**
	* Restores this instance from the given JSON object.
	*
	* @param {Object} json - The JSON object.
	* @return {Telegram} A reference to this telegram.
	*/
	fromJSON( json ) {

		this.sender = json.sender;
		this.receiver = json.receiver;
		this.message = json.message;
		this.delay = json.delay;
		this.data = json.data;

		return this;

	}

	/**
	* Restores UUIDs with references to GameEntity objects.
	*
	* @param {Map<String,GameEntity>} entities - Maps game entities to UUIDs.
	* @return {Telegram} A reference to this telegram.
	*/
	resolveReferences( entities ) {

		this.sender = entities.get( this.sender );
		this.receiver = entities.get( this.receiver );

		return this;

	}

}

/* istanbul ignore next */

/**
* Class with a logger interface. Messages are only logged to console if
* their log level is smaller or equal than the current log level.
*
* @author {@link https://github.com/Mugen87|Mugen87}
*/
class Logger {

	/**
	* Sets the log level for the logger. Allow values are: *LOG*,
	* *WARN*, *ERROR*, *SILENT*. The default level is *WARN*. The constants
	* are accessible over the *Logger.LEVEL* namespace.
	*
	* @param {Number} level - The log level.
	*/
	static setLevel( level ) {

		currentLevel = level;

	}

	/**
	* Logs a message with the level *LOG*.
	*
	* @param {...Any} args - The arguments to log.
	*/
	static log( ...args ) {

		if ( currentLevel <= Logger.LEVEL.LOG ) console.log( ...args );

	}

	/**
	* Logs a message with the level *WARN*.
	*
	* @param {...Any} args - The arguments to log.
	*/
	static warn( ...args ) {

		if ( currentLevel <= Logger.LEVEL.WARN ) console.warn( ...args );

	}

	/**
	* Logs a message with the level *ERROR*.
	*
	* @param {...Any} args - The arguments to log.
	*/
	static error( ...args ) {

		if ( currentLevel <= Logger.LEVEL.ERROR ) console.error( ...args );

	}

}

Logger.LEVEL = Object.freeze( {
	LOG: 0,
	WARN: 1,
	ERROR: 2,
	SILENT: 3
} );

let currentLevel = Logger.LEVEL.WARN;

/**
* This class is the core of the messaging system for game entities and used by the
* {@link EntityManager}. The implementation can directly dispatch messages or use a
* delayed delivery for deferred communication. This can be useful if a game entity
* wants to inform itself about a particular event in the future.
*
* @author {@link https://github.com/Mugen87|Mugen87}
*/
class MessageDispatcher {

	/**
	* Constructs a new message dispatcher.
	*/
	constructor() {

		/**
		* A list of delayed telegrams.
		* @type {Array<Telegram>}
		* @readonly
		*/
		this.delayedTelegrams = new Array();

	}

	/**
	* Delivers the message to the receiver.
	*
	* @param {Telegram} telegram - The telegram to deliver.
	* @return {MessageDispatcher} A reference to this message dispatcher.
	*/
	deliver( telegram ) {

		const receiver = telegram.receiver;

		if ( receiver.handleMessage( telegram ) === false ) {

			Logger.warn( 'YUKA.MessageDispatcher: Message not handled by receiver: %o', receiver );

		}

		return this;

	}

	/**
	* Receives the raw telegram data and decides how to dispatch the telegram (with or without delay).
	*
	* @param {GameEntity} sender - The sender.
	* @param {GameEntity} receiver - The receiver.
	* @param {String} message - The actual message.
	* @param {Number} delay - A time value in millisecond used to delay the message dispatching.
	* @param {Object} data - An object for custom data.
	* @return {MessageDispatcher} A reference to this message dispatcher.
	*/
	dispatch( sender, receiver, message, delay, data ) {

		const telegram = new Telegram( sender, receiver, message, delay, data );

		if ( delay <= 0 ) {

			this.deliver( telegram );

		} else {

			this.delayedTelegrams.push( telegram );

		}

		return this;

	}

	/**
	* Used to process delayed messages.
	*
	* @param {Number} delta - The time delta.
	* @return {MessageDispatcher} A reference to this message dispatcher.
	*/
	dispatchDelayedMessages( delta ) {

		let i = this.delayedTelegrams.length;

		while ( i -- ) {

			const telegram = this.delayedTelegrams[ i ];

			telegram.delay -= delta;

			if ( telegram.delay <= 0 ) {

				this.deliver( telegram );

				this.delayedTelegrams.pop();

			}

		}

		return this;

	}

	/**
	* Clears the internal state of this message dispatcher.
	*
	* @return {MessageDispatcher} A reference to this message dispatcher.
	*/
	clear() {

		this.delayedTelegrams.length = 0;

		return this;

	}

	/**
	* Transforms this instance into a JSON object.
	*
	* @return {Object} The JSON object.
	*/
	toJSON() {

		const data = {
			type: this.constructor.name,
			delayedTelegrams: new Array()
		};

		// delayed telegrams

		for ( let i = 0, l = this.delayedTelegrams.length; i < l; i ++ ) {

			const delayedTelegram = this.delayedTelegrams[ i ];
			data.delayedTelegrams.push( delayedTelegram.toJSON() );

		}

		return data;

	}

	/**
	* Restores this instance from the given JSON object.
	*
	* @param {Object} json - The JSON object.
	* @return {MessageDispatcher} A reference to this message dispatcher.
	*/
	fromJSON( json ) {

		this.clear();

		const telegramsJSON = json.delayedTelegrams;

		for ( let i = 0, l = telegramsJSON.length; i < l; i ++ ) {

			const telegramJSON = telegramsJSON[ i ];
			const telegram = new Telegram().fromJSON( telegramJSON );

			this.delayedTelegrams.push( telegram );

		}

		return this;

	}


	/**
	* Restores UUIDs with references to GameEntity objects.
	*
	* @param {Map<String,GameEntity>} entities - Maps game entities to UUIDs.
	* @return {MessageDispatcher} A reference to this message dispatcher.
	*/
	resolveReferences( entities ) {

		const delayedTelegrams = this.delayedTelegrams;

		for ( let i = 0, l = delayedTelegrams.length; i < l; i ++ ) {

			const delayedTelegram = delayedTelegrams[ i ];
			delayedTelegram.resolveReferences( entities );

		}

		return this;

	}

}

const lut = new Array();

for ( let i = 0; i < 256; i ++ ) {

	lut[ i ] = ( i < 16 ? '0' : '' ) + ( i ).toString( 16 );

}

/**
* Class with various math helpers.
*
* @author {@link https://github.com/Mugen87|Mugen87}
*/
class MathUtils {

	/**
	* Computes the signed area of a rectangle defined by three points.
	* This method can also be used to calculate the area of a triangle.
	*
	* @param {Vector3} a - The first point in 3D space.
	* @param {Vector3} b - The second point in 3D space.
	* @param {Vector3} c - The third point in 3D space.
	* @return {Number} The signed area.
	*/
	static area( a, b, c ) {

		return ( ( c.x - a.x ) * ( b.z - a.z ) ) - ( ( b.x - a.x ) * ( c.z - a.z ) );

	}

	/**
	* Returns the indices of the maximum values of the given array.
	*
	* @param {Array<Number>} array - The input array.
	* @return {Array<Number>} Array of indices into the array.
	*/
	static argmax( array ) {

		const max = Math.max( ...array );
		const indices = [];

		for ( let i = 0, l = array.length; i < l; i ++ ) {

			if ( array[ i ] === max ) indices.push( i );

		}

		return indices;

	}

	/**
	* Returns a random sample from a given array.
	*
	* @param {Array<Any>} array - The array that is used to generate the random sample.
	* @param {Array<Number>} probabilities - The probabilities associated with each entry. If not given, the sample assumes a uniform distribution over all entries.
	* @return {Any} The random sample value.
	*/
	static choice( array, probabilities = null ) {

		const random = Math.random();

		if ( probabilities === null ) {

			return array[ Math.floor( Math.random() * array.length ) ];

		} else {

			let probability = 0;

			const index = array.map( ( value, index ) => {

				probability += probabilities[ index ];

				return probability;

			} ).findIndex( ( probability ) => probability >= random );

			return array[ index ];

		}

	}

	/**
	* Ensures the given scalar value is within a given min/max range.
	*
	* @param {Number} value - The value to clamp.
	* @param {Number} min - The min value.
	* @param {Number} max - The max value.
	* @return {Number} The clamped value.
	*/
	static clamp( value, min, max ) {

		return Math.max( min, Math.min( max, value ) );

	}

	/**
	* Computes a RFC4122 Version 4 complied Universally Unique Identifier (UUID).
	*
	* @return {String} The UUID.
	*/
	static generateUUID() {

		// https://stackoverflow.com/questions/105034/create-guid-uuid-in-javascript/21963136#21963136

		const d0 = Math.random() * 0xffffffff | 0;
		const d1 = Math.random() * 0xffffffff | 0;
		const d2 = Math.random() * 0xffffffff | 0;
		const d3 = Math.random() * 0xffffffff | 0;
		const uuid = lut[ d0 & 0xff ] + lut[ d0 >> 8 & 0xff ] + lut[ d0 >> 16 & 0xff ] + lut[ d0 >> 24 & 0xff ] + '-' +
			lut[ d1 & 0xff ] + lut[ d1 >> 8 & 0xff ] + '-' + lut[ d1 >> 16 & 0x0f | 0x40 ] + lut[ d1 >> 24 & 0xff ] + '-' +
			lut[ d2 & 0x3f | 0x80 ] + lut[ d2 >> 8 & 0xff ] + '-' + lut[ d2 >> 16 & 0xff ] + lut[ d2 >> 24 & 0xff ] +
			lut[ d3 & 0xff ] + lut[ d3 >> 8 & 0xff ] + lut[ d3 >> 16 & 0xff ] + lut[ d3 >> 24 & 0xff ];

		return uuid.toUpperCase();

	}

	/**
	* Computes a random float value within a given min/max range.
	*
	* @param {Number} min - The min value.
	* @param {Number} max - The max value.
	* @return {Number} The random float value.
	*/
	static randFloat( min, max ) {

		return min + Math.random() * ( max - min );

	}

	/**
	* Computes a random integer value within a given min/max range.
	*
	* @param {Number} min - The min value.
	* @param {Number} max - The max value.
	* @return {Number} The random integer value.
	*/
	static randInt( min, max ) {

		return min + Math.floor( Math.random() * ( max - min + 1 ) );

	}

}

/**
* Class representing a 3D vector.
*
* @author {@link https://github.com/Mugen87|Mugen87}
*/
class Vector3 {

	/**
	* Constructs a new 3D vector with the given values.
	*
	* @param {Number} x - The x component.
	* @param {Number} y - The y component.
	* @param {Number} z - The z component.
	*/
	constructor( x = 0, y = 0, z = 0 ) {

		/**
		* The x component.
		* @type {Number}
		*/
		this.x = x;

		/**
		* The y component.
		* @type {Number}
		*/
		this.y = y;

		/**
		* The z component.
		* @type {Number}
		*/
		this.z = z;

	}

	/**
	* Sets the given values to this 3D vector.
	*
	* @param {Number} x - The x component.
	* @param {Number} y - The y component.
	* @param {Number} z - The z component.
	* @return {Vector3} A reference to this vector.
	*/
	set( x, y, z ) {

		this.x = x;
		this.y = y;
		this.z = z;

		return this;

	}

	/**
	* Copies all values from the given 3D vector to this 3D vector.
	*
	* @param {Vector3} v - The vector to copy.
	* @return {Vector3} A reference to this vector.
	*/
	copy( v ) {

		this.x = v.x;
		this.y = v.y;
		this.z = v.z;

		return this;

	}

	/**
	* Creates a new 3D vector and copies all values from this 3D vector.
	*
	* @return {Vector3} A new 3D vector.
	*/
	clone() {

		return new this.constructor().copy( this );

	}

	/**
	* Adds the given 3D vector to this 3D vector.
	*
	* @param {Vector3} v - The vector to add.
	* @return {Vector3} A reference to this vector.
	*/
	add( v ) {

		this.x += v.x;
		this.y += v.y;
		this.z += v.z;

		return this;

	}

	/**
	* Adds the given scalar to this 3D vector.
	*
	* @param {Number} s - The scalar to add.
	* @return {Vector3} A reference to this vector.
	*/
	addScalar( s ) {

		this.x += s;
		this.y += s;
		this.z += s;

		return this;

	}

	/**
	* Adds two given 3D vectors and stores the result in this 3D vector.
	*
	* @param {Vector3} a - The first vector of the operation.
	* @param {Vector3} b - The second vector of the operation.
	* @return {Vector3} A reference to this vector.
	*/
	addVectors( a, b ) {

		this.x = a.x + b.x;
		this.y = a.y + b.y;
		this.z = a.z + b.z;

		return this;

	}

	/**
	* Subtracts the given 3D vector from this 3D vector.
	*
	* @param {Vector3} v - The vector to substract.
	* @return {Vector3} A reference to this vector.
	*/
	sub( v ) {

		this.x -= v.x;
		this.y -= v.y;
		this.z -= v.z;

		return this;

	}

	/**
	* Subtracts the given scalar from this 3D vector.
	*
	* @param {Number} s - The scalar to substract.
	* @return {Vector3} A reference to this vector.
	*/
	subScalar( s ) {

		this.x -= s;
		this.y -= s;
		this.z -= s;

		return this;

	}

	/**
	* Subtracts two given 3D vectors and stores the result in this 3D vector.
	*
	* @param {Vector3} a - The first vector of the operation.
	* @param {Vector3} b - The second vector of the operation.
	* @return {Vector3} A reference to this vector.
	*/
	subVectors( a, b ) {

		this.x = a.x - b.x;
		this.y = a.y - b.y;
		this.z = a.z - b.z;

		return this;

	}

	/**
	* Multiplies the given 3D vector with this 3D vector.
	*
	* @param {Vector3} v - The vector to multiply.
	* @return {Vector3} A reference to this vector.
	*/
	multiply( v ) {

		this.x *= v.x;
		this.y *= v.y;
		this.z *= v.z;

		return this;

	}

	/**
	* Multiplies the given scalar with this 3D vector.
	*
	* @param {Number} s - The scalar to multiply.
	* @return {Vector3} A reference to this vector.
	*/
	multiplyScalar( s ) {

		this.x *= s;
		this.y *= s;
		this.z *= s;

		return this;

	}

	/**
	* Multiplies two given 3D vectors and stores the result in this 3D vector.
	*
	* @param {Vector3} a - The first vector of the operation.
	* @param {Vector3} b - The second vector of the operation.
	* @return {Vector3} A reference to this vector.
	*/
	multiplyVectors( a, b ) {

		this.x = a.x * b.x;
		this.y = a.y * b.y;
		this.z = a.z * b.z;

		return this;

	}

	/**
	* Divides the given 3D vector through this 3D vector.
	*
	* @param {Vector3} v - The vector to divide.
	* @return {Vector3} A reference to this vector.
	*/
	divide( v ) {

		this.x /= v.x;
		this.y /= v.y;
		this.z /= v.z;

		return this;

	}

	/**
	* Divides the given scalar through this 3D vector.
	*
	* @param {Number} s - The scalar to multiply.
	* @return {Vector3} A reference to this vector.
	*/
	divideScalar( s ) {

		this.x /= s;
		this.y /= s;
		this.z /= s;

		return this;

	}

	/**
	* Divides two given 3D vectors and stores the result in this 3D vector.
	*
	* @param {Vector3} a - The first vector of the operation.
	* @param {Vector3} b - The second vector of the operation.
	* @return {Vector3} A reference to this vector.
	*/
	divideVectors( a, b ) {

		this.x = a.x / b.x;
		this.y = a.y / b.y;
		this.z = a.z / b.z;

		return this;

	}

	/**
	* Reflects this vector along the given normal.
	*
	* @param {Vector3} normal - The normal vector.
	* @return {Vector3} A reference to this vector.
	*/
	reflect( normal ) {

		// solve r = v - 2( v * n ) * n

		return this.sub( v1$4.copy( normal ).multiplyScalar( 2 * this.dot( normal ) ) );

	}

	/**
	* Ensures this 3D vector lies in the given min/max range.
	*
	* @param {Vector3} min - The min range.
	* @param {Vector3} max - The max range.
	* @return {Vector3} A reference to this vector.
	*/
	clamp( min, max ) {

		this.x = Math.max( min.x, Math.min( max.x, this.x ) );
		this.y = Math.max( min.y, Math.min( max.y, this.y ) );
		this.z = Math.max( min.z, Math.min( max.z, this.z ) );

		return this;

	}

	/**
	* Compares each vector component of this 3D vector and the
	* given one and stores the minimum value in this instance.
	*
	* @param {Vector3} v - The 3D vector to check.
	* @return {Vector3} A reference to this vector.
	*/
	min( v ) {

		this.x = Math.min( this.x, v.x );
		this.y = Math.min( this.y, v.y );
		this.z = Math.min( this.z, v.z );

		return this;

	}

	/**
	* Compares each vector component of this 3D vector and the
	* given one and stores the maximum value in this instance.
	*
	* @param {Vector3} v - The 3D vector to check.
	* @return {Vector3} A reference to this vector.
	*/
	max( v ) {

		this.x = Math.max( this.x, v.x );
		this.y = Math.max( this.y, v.y );
		this.z = Math.max( this.z, v.z );

		return this;

	}

	/**
	* Computes the dot product of this and the given 3D vector.
	*
	* @param {Vector3} v - The given 3D vector.
	* @return {Number} The results of the dor product.
	*/
	dot( v ) {

		return ( this.x * v.x ) + ( this.y * v.y ) + ( this.z * v.z );

	}

	/**
	* Computes the cross product of this and the given 3D vector and
	* stores the result in this 3D vector.
	*
	* @param {Vector3} v - A 3D vector.
	* @return {Vector3} A reference to this vector.
	*/
	cross( v ) {

		const x = this.x, y = this.y, z = this.z;

		this.x = ( y * v.z ) - ( z * v.y );
		this.y = ( z * v.x ) - ( x * v.z );
		this.z = ( x * v.y ) - ( y * v.x );

		return this;

	}

	/**
	* Computes the cross product of the two given 3D vectors and
	* stores the result in this 3D vector.
	*
	* @param {Vector3} a - The first 3D vector.
	* @param {Vector3} b - The second 3D vector.
	* @return {Vector3} A reference to this vector.
	*/
	crossVectors( a, b ) {

		const ax = a.x, ay = a.y, az = a.z;
		const bx = b.x, by = b.y, bz = b.z;

		this.x = ( ay * bz ) - ( az * by );
		this.y = ( az * bx ) - ( ax * bz );
		this.z = ( ax * by ) - ( ay * bx );

		return this;

	}

	/**
	* Computes the angle between this and the given vector.
	*
	* @param {Vector3} v - A 3D vector.
	* @return {Number} The angle in radians.
	*/
	angleTo( v ) {

		const denominator = Math.sqrt( this.squaredLength() * v.squaredLength() );

		if ( denominator === 0 ) return 0;

		const theta = this.dot( v ) / denominator;

		// clamp, to handle numerical problems

		return Math.acos( MathUtils.clamp( theta, - 1, 1 ) );

	}

	/**
	* Computes the length of this 3D vector.
	*
	* @return {Number} The length of this 3D vector.
	*/
	length() {

		return Math.sqrt( this.squaredLength() );

	}

	/**
	* Computes the squared length of this 3D vector.
	* Calling this method is faster than calling {@link Vector3#length},
	* since it avoids computing a square root.
	*
	* @return {Number} The squared length of this 3D vector.
	*/
	squaredLength() {

		return this.dot( this );

	}

	/**
	* Computes the manhattan length of this 3D vector.
	*
	* @return {Number} The manhattan length of this 3D vector.
	*/
	manhattanLength() {

		return Math.abs( this.x ) + Math.abs( this.y ) + Math.abs( this.z );

	}

	/**
	* Computes the euclidean distance between this 3D vector and the given one.
	*
	* @param {Vector3} v - A 3D vector.
	* @return {Number} The euclidean distance between two 3D vectors.
	*/
	distanceTo( v ) {

		return Math.sqrt( this.squaredDistanceTo( v ) );

	}

	/**
	* Computes the squared euclidean distance between this 3D vector and the given one.
	* Calling this method is faster than calling {@link Vector3#distanceTo},
	* since it avoids computing a square root.
	*
	* @param {Vector3} v - A 3D vector.
	* @return {Number} The squared euclidean distance between two 3D vectors.
	*/
	squaredDistanceTo( v ) {

		const dx = this.x - v.x, dy = this.y - v.y, dz = this.z - v.z;

		return ( dx * dx ) + ( dy * dy ) + ( dz * dz );

	}

	/**
	* Computes the manhattan distance between this 3D vector and the given one.
	*
	* @param {Vector3} v - A 3D vector.
	* @return {Number} The manhattan distance between two 3D vectors.
	*/
	manhattanDistanceTo( v ) {

		const dx = this.x - v.x, dy = this.y - v.y, dz = this.z - v.z;

		return Math.abs( dx ) + Math.abs( dy ) + Math.abs( dz );

	}

	/**
	* Normalizes this 3D vector.
	*
	* @return {Vector3} A reference to this vector.
	*/
	normalize() {

		return this.divideScalar( this.length() || 1 );

	}

	/**
	* Multiplies the given 4x4 matrix with this 3D vector
	*
	* @param {Matrix4} m - A 4x4 matrix.
	* @return {Vector3} A reference to this vector.
	*/
	applyMatrix4( m ) {

		const x = this.x, y = this.y, z = this.z;
		const e = m.elements;

		const w = 1 / ( ( e[ 3 ] * x ) + ( e[ 7 ] * y ) + ( e[ 11 ] * z ) + e[ 15 ] );

		this.x = ( ( e[ 0 ] * x ) + ( e[ 4 ] * y ) + ( e[ 8 ] * z ) + e[ 12 ] ) * w;
		this.y = ( ( e[ 1 ] * x ) + ( e[ 5 ] * y ) + ( e[ 9 ] * z ) + e[ 13 ] ) * w;
		this.z = ( ( e[ 2 ] * x ) + ( e[ 6 ] * y ) + ( e[ 10 ] * z ) + e[ 14 ] ) * w;

		return this;

	}

	/**
	* Multiplies the given quaternion with this 3D vector.
	*
	* @param {Quaternion} q - A quaternion.
	* @return {Vector3} A reference to this vector.
	*/
	applyRotation( q ) {

		const x = this.x, y = this.y, z = this.z;
		const qx = q.x, qy = q.y, qz = q.z, qw = q.w;

		// calculate quat * vector

		const ix = qw * x + qy * z - qz * y;
		const iy = qw * y + qz * x - qx * z;
		const iz = qw * z + qx * y - qy * x;
		const iw = - qx * x - qy * y - qz * z;

		// calculate result * inverse quat

		this.x = ix * qw + iw * - qx + iy * - qz - iz * - qy;
		this.y = iy * qw + iw * - qy + iz * - qx - ix * - qz;
		this.z = iz * qw + iw * - qz + ix * - qy - iy * - qx;

		return this;

	}

	/**
	* Extracts the position portion of the given 4x4 matrix and stores it in this 3D vector.
	*
	* @param {Matrix4} m - A 4x4 matrix.
	* @return {Vector3} A reference to this vector.
	*/
	extractPositionFromMatrix( m ) {

		const e = m.elements;

		this.x = e[ 12 ];
		this.y = e[ 13 ];
		this.z = e[ 14 ];

		return this;

	}

	/**
	* Transform this direction vector by the given 4x4 matrix.
	*
	* @param {Matrix4} m - A 4x4 matrix.
	* @return {Vector3} A reference to this vector.
	*/
	transformDirection( m ) {

		const x = this.x, y = this.y, z = this.z;
		const e = m.elements;

		this.x = e[ 0 ] * x + e[ 4 ] * y + e[ 8 ] * z;
		this.y = e[ 1 ] * x + e[ 5 ] * y + e[ 9 ] * z;
		this.z = e[ 2 ] * x + e[ 6 ] * y + e[ 10 ] * z;

		return this.normalize();

	}

	/**
	* Sets the components of this 3D vector from a column of a 3x3 matrix.
	*
	* @param {Matrix3} m - A 3x3 matrix.
	* @param {Number} i - The index of the column.
	* @return {Vector3} A reference to this vector.
	*/
	fromMatrix3Column( m, i ) {

		return this.fromArray( m.elements, i * 3 );

	}

	/**
	* Sets the components of this 3D vector from a column of a 4x4 matrix.
	*
	* @param {Matrix3} m - A 4x4 matrix.
	* @param {Number} i - The index of the column.
	* @return {Vector3} A reference to this vector.
	*/
	fromMatrix4Column( m, i ) {

		return this.fromArray( m.elements, i * 4 );

	}

	/**
	* Sets the components of this 3D vector from a spherical coordinate.
	*
	* @param {Number} radius - The radius.
	* @param {Number} phi - The polar or inclination angle in radians. Should be in the range of (−π/2, +π/2].
	* @param {Number} theta - The azimuthal angle in radians. Should be in the range of (−π, +π].
	* @return {Vector3} A reference to this vector.
	*/
	fromSpherical( radius, phi, theta ) {

		const sinPhiRadius = Math.sin( phi ) * radius;

		this.x = sinPhiRadius * Math.sin( theta );
		this.y = Math.cos( phi ) * radius;
		this.z = sinPhiRadius * Math.cos( theta );

		return this;

	}

	/**
	* Sets the components of this 3D vector from an array.
	*
	* @param {Array<Number>} array - An array.
	* @param {Number} offset - An optional offset.
	* @return {Vector3} A reference to this vector.
	*/
	fromArray( array, offset = 0 ) {

		this.x = array[ offset + 0 ];
		this.y = array[ offset + 1 ];
		this.z = array[ offset + 2 ];

		return this;

	}

	/**
	* Copies all values of this 3D vector to the given array.
	*
	* @param {Array<Number>} array - An array.
	* @param {Number} offset - An optional offset.
	* @return {Array<Number>} The array with the 3D vector components.
	*/
	toArray( array, offset = 0 ) {

		array[ offset + 0 ] = this.x;
		array[ offset + 1 ] = this.y;
		array[ offset + 2 ] = this.z;

		return array;

	}

	/**
	* Returns true if the given 3D vector is deep equal with this 3D vector.
	*
	* @param {Vector3} v - The 3D vector to test.
	* @return {Boolean} The result of the equality test.
	*/
	equals( v ) {

		return ( ( v.x === this.x ) && ( v.y === this.y ) && ( v.z === this.z ) );

	}

}

const v1$4 = new Vector3();

const WorldUp = new Vector3( 0, 1, 0 );

const localRight = new Vector3();
const worldRight = new Vector3();
const perpWorldUp = new Vector3();
const temp = new Vector3();

const colVal = [ 2, 2, 1 ];
const rowVal = [ 1, 0, 0 ];

/**
* Class representing a 3x3 matrix. The elements of the matrix
* are stored in column-major order.
*
* @author {@link https://github.com/Mugen87|Mugen87}
*/
class Matrix3 {

	/**
	* Constructs a new 3x3 identity matrix.
	*/
	constructor() {

		/**
		* The elements of the matrix in column-major order.
		* @type {Array<Number>}
		*/
		this.elements = [

			1, 0, 0,
			0, 1, 0,
			0, 0, 1

		];

	}

	/**
	* Sets the given values to this matrix. The arguments are in row-major order.
	*
	* @param {Number} n11 - An element of the matrix.
	* @param {Number} n12 - An element of the matrix.
	* @param {Number} n13 - An element of the matrix.
	* @param {Number} n21 - An element of the matrix.
	* @param {Number} n22 - An element of the matrix.
	* @param {Number} n23 - An element of the matrix.
	* @param {Number} n31 - An element of the matrix.
	* @param {Number} n32 - An element of the matrix.
	* @param {Number} n33 - An element of the matrix.
	* @return {Matrix3} A reference to this matrix.
	*/
	set( n11, n12, n13, n21, n22, n23, n31, n32, n33 ) {

		const e = this.elements;

		e[ 0 ] = n11; e[ 3 ] = n12; e[ 6 ] = n13;
		e[ 1 ] = n21; e[ 4 ] = n22; e[ 7 ] = n23;
		e[ 2 ] = n31; e[ 5 ] = n32; e[ 8 ] = n33;

		return this;

	}

	/**
	* Copies all values from the given matrix to this matrix.
	*
	* @param {Matrix3} m - The matrix to copy.
	* @return {Matrix3} A reference to this matrix.
	*/
	copy( m ) {

		const e = this.elements;
		const me = m.elements;

		e[ 0 ] = me[ 0 ]; e[ 1 ] = me[ 1 ]; e[ 2 ] = me[ 2 ];
		e[ 3 ] = me[ 3 ]; e[ 4 ] = me[ 4 ]; e[ 5 ] = me[ 5 ];
		e[ 6 ] = me[ 6 ]; e[ 7 ] = me[ 7 ]; e[ 8 ] = me[ 8 ];

		return this;

	}

	/**
	* Creates a new matrix and copies all values from this matrix.
	*
	* @return {Matrix3} A new matrix.
	*/
	clone() {

		return new this.constructor().copy( this );

	}

	/**
	* Transforms this matrix to an identity matrix.
	*
	* @return {Matrix3} A reference to this matrix.
	*/
	identity() {

		this.set(

			1, 0, 0,
			0, 1, 0,
			0, 0, 1

		);

		return this;

	}

	/**
	* Multiplies this matrix with the given matrix.
	*
	* @param {Matrix3} m - The matrix to multiply.
	* @return {Matrix3} A reference to this matrix.
	*/
	multiply( m ) {

		return this.multiplyMatrices( this, m );

	}

	/**
	* Multiplies this matrix with the given matrix.
	* So the order of the multiplication is switched compared to {@link Matrix3#multiply}.
	*
	* @param {Matrix3} m - The matrix to multiply.
	* @return {Matrix3} A reference to this matrix.
	*/
	premultiply( m ) {

		return this.multiplyMatrices( m, this );

	}

	/**
	* Multiplies two given matrices and stores the result in this matrix.
	*
	* @param {Matrix3} a - The first matrix of the operation.
	* @param {Matrix3} b - The second matrix of the operation.
	* @return {Matrix3} A reference to this matrix.
	*/
	multiplyMatrices( a, b ) {

		const ae = a.elements;
		const be = b.elements;
		const e = this.elements;

		const a11 = ae[ 0 ], a12 = ae[ 3 ], a13 = ae[ 6 ];
		const a21 = ae[ 1 ], a22 = ae[ 4 ], a23 = ae[ 7 ];
		const a31 = ae[ 2 ], a32 = ae[ 5 ], a33 = ae[ 8 ];

		const b11 = be[ 0 ], b12 = be[ 3 ], b13 = be[ 6 ];
		const b21 = be[ 1 ], b22 = be[ 4 ], b23 = be[ 7 ];
		const b31 = be[ 2 ], b32 = be[ 5 ], b33 = be[ 8 ];

		e[ 0 ] = a11 * b11 + a12 * b21 + a13 * b31;
		e[ 3 ] = a11 * b12 + a12 * b22 + a13 * b32;
		e[ 6 ] = a11 * b13 + a12 * b23 + a13 * b33;

		e[ 1 ] = a21 * b11 + a22 * b21 + a23 * b31;
		e[ 4 ] = a21 * b12 + a22 * b22 + a23 * b32;
		e[ 7 ] = a21 * b13 + a22 * b23 + a23 * b33;

		e[ 2 ] = a31 * b11 + a32 * b21 + a33 * b31;
		e[ 5 ] = a31 * b12 + a32 * b22 + a33 * b32;
		e[ 8 ] = a31 * b13 + a32 * b23 + a33 * b33;

		return this;

	}

	/**
	* Multiplies the given scalar with this matrix.
	*
	* @param {Number} s - The scalar to multiply.
	* @return {Matrix3} A reference to this matrix.
	*/
	multiplyScalar( s ) {

		const e = this.elements;

		e[ 0 ] *= s; e[ 3 ] *= s; e[ 6 ] *= s;
		e[ 1 ] *= s; e[ 4 ] *= s; e[ 7 ] *= s;
		e[ 2 ] *= s; e[ 5 ] *= s; e[ 8 ] *= s;

		return this;

	}

	/**
	* Extracts the basis vectors and stores them to the given vectors.
	*
	* @param {Vector3} xAxis - The first result vector for the x-axis.
	* @param {Vector3} yAxis - The second result vector for the y-axis.
	* @param {Vector3} zAxis - The third result vector for the z-axis.
	* @return {Matrix3} A reference to this matrix.
	*/
	extractBasis( xAxis, yAxis, zAxis ) {

		xAxis.fromMatrix3Column( this, 0 );
		yAxis.fromMatrix3Column( this, 1 );
		zAxis.fromMatrix3Column( this, 2 );

		return this;

	}

	/**
	* Makes a basis from the given vectors.
	*
	* @param {Vector3} xAxis - The first basis vector for the x-axis.
	* @param {Vector3} yAxis - The second basis vector for the y-axis.
	* @param {Vector3} zAxis - The third basis vector for the z-axis.
	* @return {Matrix3} A reference to this matrix.
	*/
	makeBasis( xAxis, yAxis, zAxis ) {

		this.set(
			xAxis.x, yAxis.x, zAxis.x,
			xAxis.y, yAxis.y, zAxis.y,
			xAxis.z, yAxis.z, zAxis.z
		);

		return this;

	}

	/**
	* Creates a rotation matrix that orients an object to face towards a specified target direction.
	*
	* @param {Vector3} localForward - Specifies the forward direction in the local space of the object.
	* @param {Vector3} targetDirection - Specifies the desired world space direction the object should look at.
	* @param {Vector3} localUp - Specifies the up direction in the local space of the object.
	* @return {Matrix3} A reference to this matrix.
	*/
	lookAt( localForward, targetDirection, localUp ) {

		localRight.crossVectors( localUp, localForward ).normalize();

		// orthonormal linear basis A { localRight, localUp, localForward } for the object local space

		worldRight.crossVectors( WorldUp, targetDirection ).normalize();

		if ( worldRight.squaredLength() === 0 ) {

			// handle case when it's not possible to build a basis from targetDirection and worldUp
			// slightly shift targetDirection in order to avoid collinearity

			temp.copy( targetDirection ).addScalar( Number.EPSILON );
			worldRight.crossVectors( WorldUp, temp ).normalize();

		}

		perpWorldUp.crossVectors( targetDirection, worldRight ).normalize();

		// orthonormal linear basis B { worldRight, perpWorldUp, targetDirection } for the desired target orientation

		m1.makeBasis( worldRight, perpWorldUp, targetDirection );
		m2.makeBasis( localRight, localUp, localForward );

		// construct a matrix that maps basis A to B

		this.multiplyMatrices( m1, m2.transpose() );

		return this;

	}

	/**
	* Transposes this matrix.
	*
	* @return {Matrix3} A reference to this matrix.
	*/
	transpose() {

		const e = this.elements;
		let t;

		t = e[ 1 ]; e[ 1 ] = e[ 3 ]; e[ 3 ] = t;
		t = e[ 2 ]; e[ 2 ] = e[ 6 ]; e[ 6 ] = t;
		t = e[ 5 ]; e[ 5 ] = e[ 7 ]; e[ 7 ] = t;

		return this;

	}

	/**
	* Computes the element index according to the given column and row.
	*
	* @param {Number} column - Index of the column.
	* @param {Number} row - Index of the row.
	* @return {Number} The index of the element at the provided row and column.
	*/
	getElementIndex( column, row ) {

		return column * 3 + row;

	}

	/**
	* Computes the frobenius norm. It's the squareroot of the sum of all
	* squared matrix elements.
	*
	* @return {Number} The frobenius norm.
	*/
	frobeniusNorm() {

		const e = this.elements;
		let norm = 0;

		for ( let i = 0; i < 9; i ++ ) {

			norm += e[ i ] * e[ i ];

		}

		return Math.sqrt( norm );

	}

	/**
	* Computes the  "off-diagonal" frobenius norm. Assumes the matrix is symmetric.
	*
	* @return {Number} The "off-diagonal" frobenius norm.
	*/
	offDiagonalFrobeniusNorm() {

		const e = this.elements;
		let norm = 0;

		for ( let i = 0; i < 3; i ++ ) {

			const t = e[ this.getElementIndex( colVal[ i ], rowVal[ i ] ) ];
			norm += 2 * t * t; // multiply the result by two since the matrix is symetric

		}

		return Math.sqrt( norm );

	}

	/**
	* Computes the eigenvectors and eigenvalues.
	*
	* Reference: https://github.com/AnalyticalGraphicsInc/cesium/blob/411a1afbd36b72df64d7362de6aa934730447234/Source/Core/Matrix3.js#L1141 (Apache License 2.0)
	*
	* The values along the diagonal of the diagonal matrix are the eigenvalues.
	* The columns of the unitary matrix are the corresponding eigenvectors.
	*
	* @param {Object} result - An object with unitary and diagonal properties which are matrices onto which to store the result.
	* @return {Object} An object with unitary and diagonal properties which are matrices onto which to store the result.
	*/
	eigenDecomposition( result ) {

		let count = 0;
		let sweep = 0;

		const maxSweeps = 10;

		result.unitary.identity();
		result.diagonal.copy( this );

		const unitaryMatrix = result.unitary;
		const diagonalMatrix = result.diagonal;

		const epsilon = Number.EPSILON * diagonalMatrix.frobeniusNorm();

		while ( sweep < maxSweeps && diagonalMatrix.offDiagonalFrobeniusNorm() > epsilon ) {

			diagonalMatrix.shurDecomposition( m1 );
			m2.copy( m1 ).transpose();
			diagonalMatrix.multiply( m1 );
			diagonalMatrix.premultiply( m2 );
			unitaryMatrix.multiply( m1 );

			if ( ++ count > 2 ) {

				sweep ++;
				count = 0;

			}

		}

		return result;

	}

	/**
	* Finds the largest off-diagonal term and then creates a matrix
	* which can be used to help reduce it.
	*
	* @param {Matrix3} result - The result matrix.
	* @return {Matrix3} The result matrix.
	*/
	shurDecomposition( result ) {

		let maxDiagonal = 0;
		let rotAxis = 1;

		// find pivot (rotAxis) based on largest off-diagonal term

		const e = this.elements;

		for ( let i = 0; i < 3; i ++ ) {

			const t = Math.abs( e[ this.getElementIndex( colVal[ i ], rowVal[ i ] ) ] );

			if ( t > maxDiagonal ) {

				maxDiagonal = t;
				rotAxis = i;

			}

		}

		let c = 1;
		let s = 0;

		const p = rowVal[ rotAxis ];
		const q = colVal[ rotAxis ];

		if ( Math.abs( e[ this.getElementIndex( q, p ) ] ) > Number.EPSILON ) {

			const qq = e[ this.getElementIndex( q, q ) ];
			const pp = e[ this.getElementIndex( p, p ) ];
			const qp = e[ this.getElementIndex( q, p ) ];

			const tau = ( qq - pp ) / 2 / qp;

			let t;

			if ( tau < 0 ) {

				t = - 1 / ( - tau + Math.sqrt( 1 + tau * tau ) );

			} else {

				t = 1 / ( tau + Math.sqrt( 1.0 + tau * tau ) );

			}

			c = 1.0 / Math.sqrt( 1.0 + t * t );
			s = t * c;

		}

		result.identity();

		result.elements[ this.getElementIndex( p, p ) ] = c;
		result.elements[ this.getElementIndex( q, q ) ] = c;
		result.elements[ this.getElementIndex( q, p ) ] = s;
		result.elements[ this.getElementIndex( p, q ) ] = - s;

		return result;

	}

	/**
	* Creates a rotation matrix from the given quaternion.
	*
	* @param {Quaternion} q - A quaternion representing a rotation.
	* @return {Matrix3} A reference to this matrix.
	*/
	fromQuaternion( q ) {

		const e = this.elements;

		const x = q.x, y = q.y, z = q.z, w = q.w;
		const x2 = x + x, y2 = y + y, z2 = z + z;
		const xx = x * x2, xy = x * y2, xz = x * z2;
		const yy = y * y2, yz = y * z2, zz = z * z2;
		const wx = w * x2, wy = w * y2, wz = w * z2;

		e[ 0 ] = 1 - ( yy + zz );
		e[ 3 ] = xy - wz;
		e[ 6 ] = xz + wy;

		e[ 1 ] = xy + wz;
		e[ 4 ] = 1 - ( xx + zz );
		e[ 7 ] = yz - wx;

		e[ 2 ] = xz - wy;
		e[ 5 ] = yz + wx;
		e[ 8 ] = 1 - ( xx + yy );

		return this;

	}

	/**
	* Sets the elements of this matrix by extracting the upper-left 3x3 portion
	* from a 4x4 matrix.
	*
	* @param {Matrix4} m - A 4x4 matrix.
	* @return {Matrix3} A reference to this matrix.
	*/
	fromMatrix4( m ) {

		const e = this.elements;
		const me = m.elements;

		e[ 0 ] = me[ 0 ]; e[ 1 ] = me[ 1 ]; e[ 2 ] = me[ 2 ];
		e[ 3 ] = me[ 4 ]; e[ 4 ] = me[ 5 ]; e[ 5 ] = me[ 6 ];
		e[ 6 ] = me[ 8 ]; e[ 7 ] = me[ 9 ]; e[ 8 ] = me[ 10 ];

		return this;

	}

	/**
	* Sets the elements of this matrix from an array.
	*
	* @param {Array<Number>} array - An array.
	* @param {Number} offset - An optional offset.
	* @return {Matrix3} A reference to this matrix.
	*/
	fromArray( array, offset = 0 ) {

		const e = this.elements;

		for ( let i = 0; i < 9; i ++ ) {

			e[ i ] = array[ i + offset ];

		}

		return this;

	}

	/**
	* Copies all elements of this matrix to the given array.
	*
	* @param {Array<Number>} array - An array.
	* @param {Number} offset - An optional offset.
	* @return {Array<Number>} The array with the elements of the matrix.
	*/
	toArray( array, offset = 0 ) {

		const e = this.elements;

		array[ offset + 0 ] = e[ 0 ];
		array[ offset + 1 ] = e[ 1 ];
		array[ offset + 2 ] = e[ 2 ];

		array[ offset + 3 ] = e[ 3 ];
		array[ offset + 4 ] = e[ 4 ];
		array[ offset + 5 ] = e[ 5 ];

		array[ offset + 6 ] = e[ 6 ];
		array[ offset + 7 ] = e[ 7 ];
		array[ offset + 8 ] = e[ 8 ];

		return array;

	}

	/**
	* Returns true if the given matrix is deep equal with this matrix.
	*
	* @param {Matrix3} m - The matrix to test.
	* @return {Boolean} The result of the equality test.
	*/
	equals( m ) {

		const e = this.elements;
		const me = m.elements;

		for ( let i = 0; i < 9; i ++ ) {

			if ( e[ i ] !== me[ i ] ) return false;

		}

		return true;

	}

}

const m1 = new Matrix3();
const m2 = new Matrix3();

const matrix$1 = new Matrix3();
const vector$1 = new Vector3();

/**
* Class representing a quaternion.
*
* @author {@link https://github.com/Mugen87|Mugen87}
*/
class Quaternion {

	/**
	* Constructs a new quaternion with the given values.
	*
	* @param {Number} x - The x component.
	* @param {Number} y - The y component.
	* @param {Number} z - The z component.
	* @param {Number} w - The w component.
	*/
	constructor( x = 0, y = 0, z = 0, w = 1 ) {

		/**
		* The x component.
		* @type {Number}
		*/
		this.x = x;

		/**
		* The y component.
		* @type {Number}
		*/
		this.y = y;

		/**
		* The z component.
		* @type {Number}
		*/
		this.z = z;

		/**
		* The w component.
		* @type {Number}
		*/
		this.w = w;

	}

	/**
	* Sets the given values to this quaternion.
	*
	* @param {Number} x - The x component.
	* @param {Number} y - The y component.
	* @param {Number} z - The z component.
	* @param {Number} w - The w component.
	* @return {Quaternion} A reference to this quaternion.
	*/
	set( x, y, z, w ) {

		this.x = x;
		this.y = y;
		this.z = z;
		this.w = w;

		return this;

	}

	/**
	* Copies all values from the given quaternion to this quaternion.
	*
	* @param {Quaternion} q - The quaternion to copy.
	* @return {Quaternion} A reference to this quaternion.
	*/
	copy( q ) {

		this.x = q.x;
		this.y = q.y;
		this.z = q.z;
		this.w = q.w;

		return this;

	}

	/**
	* Creates a new quaternion and copies all values from this quaternion.
	*
	* @return {Quaternion} A new quaternion.
	*/
	clone() {

		return new this.constructor().copy( this );

	}

	/**
	* Computes the inverse of this quaternion.
	*
	* @return {Quaternion} A reference to this quaternion.
	*/
	inverse() {

		return this.conjugate().normalize();

	}

	/**
	* Computes the conjugate of this quaternion.
	*
	* @return {Quaternion} A reference to this quaternion.
	*/
	conjugate() {

		this.x *= - 1;
		this.y *= - 1;
		this.z *= - 1;

		return this;

	}

	/**
	* Computes the dot product of this and the given quaternion.
	*
	* @param {Quaternion} q - The given quaternion.
	* @return {Quaternion} A reference to this quaternion.
	*/
	dot( q ) {

		return ( this.x * q.x ) + ( this.y * q.y ) + ( this.z * q.z ) + ( this.w * q.w );

	}

	/**
	* Computes the length of this quaternion.
	*
	* @return {Number} The length of this quaternion.
	*/
	length() {

		return Math.sqrt( this.squaredLength() );

	}

	/**
	* Computes the squared length of this quaternion.
	*
	* @return {Number} The squared length of this quaternion.
	*/
	squaredLength() {

		return this.dot( this );

	}

	/**
	* Normalizes this quaternion.
	*
	* @return {Quaternion} A reference to this quaternion.
	*/
	normalize() {

		let l = this.length();

		if ( l === 0 ) {

			this.x = 0;
			this.y = 0;
			this.z = 0;
			this.w = 1;

		} else {

			l = 1 / l;

			this.x = this.x * l;
			this.y = this.y * l;
			this.z = this.z * l;
			this.w = this.w * l;

		}

		return this;

	}

	/**
	* Multiplies this quaternion with the given quaternion.
	*
	* @param {Quaternion} q - The quaternion to multiply.
	* @return {Quaternion} A reference to this quaternion.
	*/
	multiply( q ) {

		return this.multiplyQuaternions( this, q );

	}

	/**
	* Multiplies the given quaternion with this quaternion.
	* So the order of the multiplication is switched compared to {@link Quaternion#multiply}.
	*
	* @param {Quaternion} q - The quaternion to multiply.
	* @return {Quaternion} A reference to this quaternion.
	*/
	premultiply( q ) {

		return this.multiplyQuaternions( q, this );

	}

	/**
	* Multiplies two given quaternions and stores the result in this quaternion.
	*
	* @param {Quaternion} a - The first quaternion of the operation.
	* @param {Quaternion} b - The second quaternion of the operation.
	* @return {Quaternion} A reference to this quaternion.
	*/
	multiplyQuaternions( a, b ) {

		const qax = a.x, qay = a.y, qaz = a.z, qaw = a.w;
		const qbx = b.x, qby = b.y, qbz = b.z, qbw = b.w;

		this.x = ( qax * qbw ) + ( qaw * qbx ) + ( qay * qbz ) - ( qaz * qby );
		this.y = ( qay * qbw ) + ( qaw * qby ) + ( qaz * qbx ) - ( qax * qbz );
		this.z = ( qaz * qbw ) + ( qaw * qbz ) + ( qax * qby ) - ( qay * qbx );
		this.w = ( qaw * qbw ) - ( qax * qbx ) - ( qay * qby ) - ( qaz * qbz );

		return this;

	}

	/**
	* Computes the shortest angle between two rotation defined by this quaternion and the given one.
	*
	* @param {Quaternion} q - The given quaternion.
	* @return {Number} The angle in radians.
	*/
	angleTo( q ) {

		return 2 * Math.acos( Math.abs( MathUtils.clamp( this.dot( q ), - 1, 1 ) ) );

	}

	/**
	* Transforms this rotation defined by this quaternion towards the target rotation
	* defined by the given quaternion by the given angular step. The rotation will not overshoot.
	*
	* @param {Quaternion} q - The target rotation.
	* @param {Number} step - The maximum step in radians.
	* @param {Number} tolerance - A tolerance value in radians to tweak the result
	* when both rotations are considered to be equal.
	* @return {Boolean} Whether the given quaternion already represents the target rotation.
	*/
	rotateTo( q, step, tolerance = 0.0001 ) {

		const angle = this.angleTo( q );

		if ( angle < tolerance ) return true;

		const t = Math.min( 1, step / angle );

		this.slerp( q, t );

		return false;

	}

	/**
	* Creates a quaternion that orients an object to face towards a specified target direction.
	*
	* @param {Vector3} localForward - Specifies the forward direction in the local space of the object.
	* @param {Vector3} targetDirection - Specifies the desired world space direction the object should look at.
	* @param {Vector3} localUp - Specifies the up direction in the local space of the object.
	* @return {Quaternion} A reference to this quaternion.
	*/
	lookAt( localForward, targetDirection, localUp ) {

		matrix$1.lookAt( localForward, targetDirection, localUp );
		this.fromMatrix3( matrix$1 );

	}

	/**
	* Spherically interpolates between this quaternion and the given quaternion by t.
	* The parameter t is clamped to the range [0, 1].
	*
	* @param {Quaternion} q - The target rotation.
	* @param {Number} t - The interpolation parameter.
	* @return {Quaternion} A reference to this quaternion.
	*/
	slerp( q, t ) {

		if ( t === 0 ) return this;
		if ( t === 1 ) return this.copy( q );

		const x = this.x, y = this.y, z = this.z, w = this.w;

		let cosHalfTheta = w * q.w + x * q.x + y * q.y + z * q.z;

		if ( cosHalfTheta < 0 ) {

			this.w = - q.w;
			this.x = - q.x;
			this.y = - q.y;
			this.z = - q.z;

			cosHalfTheta = - cosHalfTheta;

		} else {

			this.copy( q );

		}

		if ( cosHalfTheta >= 1.0 ) {

			this.w = w;
			this.x = x;
			this.y = y;
			this.z = z;

			return this;

		}

		const sinHalfTheta = Math.sqrt( 1.0 - cosHalfTheta * cosHalfTheta );

		if ( Math.abs( sinHalfTheta ) < 0.001 ) {

			this.w = 0.5 * ( w + this.w );
			this.x = 0.5 * ( x + this.x );
			this.y = 0.5 * ( y + this.y );
			this.z = 0.5 * ( z + this.z );

			return this;

		}

		const halfTheta = Math.atan2( sinHalfTheta, cosHalfTheta );
		const ratioA = Math.sin( ( 1 - t ) * halfTheta ) / sinHalfTheta;
		const ratioB = Math.sin( t * halfTheta ) / sinHalfTheta;

		this.w = ( w * ratioA ) + ( this.w * ratioB );
		this.x = ( x * ratioA ) + ( this.x * ratioB );
		this.y = ( y * ratioA ) + ( this.y * ratioB );
		this.z = ( z * ratioA ) + ( this.z * ratioB );

		return this;

	}

	/**
	* Extracts the rotation of the given 4x4 matrix and stores it in this quaternion.
	*
	* @param {Matrix4} m - A 4x4 matrix.
	* @return {Quaternion} A reference to this quaternion.
	*/
	extractRotationFromMatrix( m ) {

		const e = matrix$1.elements;
		const me = m.elements;

		// remove scaling from the 3x3 portion

		const sx = 1 / vector$1.fromMatrix4Column( m, 0 ).length();
		const sy = 1 / vector$1.fromMatrix4Column( m, 1 ).length();
		const sz = 1 / vector$1.fromMatrix4Column( m, 2 ).length();

		e[ 0 ] = me[ 0 ] * sx;
		e[ 1 ] = me[ 1 ] * sx;
		e[ 2 ] = me[ 2 ] * sx;

		e[ 3 ] = me[ 4 ] * sy;
		e[ 4 ] = me[ 5 ] * sy;
		e[ 5 ] = me[ 6 ] * sy;

		e[ 6 ] = me[ 8 ] * sz;
		e[ 7 ] = me[ 9 ] * sz;
		e[ 8 ] = me[ 10 ] * sz;

		this.fromMatrix3( matrix$1 );

		return this;

	}

	/**
	* Sets the components of this quaternion from the given euler angle (YXZ order).
	*
	* @param {Number} x - Rotation around x axis in radians.
	* @param {Number} y - Rotation around y axis in radians.
	* @param {Number} z - Rotation around z axis in radians.
	* @return {Quaternion} A reference to this quaternion.
	*/
	fromEuler( x, y, z ) {

		// from 3D Math Primer for Graphics and Game Development
		// 8.7.5 Converting Euler Angles to a Quaternion

		// assuming YXZ (head/pitch/bank or yaw/pitch/roll) order

		const c1 = Math.cos( y / 2 );
		const c2 = Math.cos( x / 2 );
		const c3 = Math.cos( z / 2 );

		const s1 = Math.sin( y / 2 );
		const s2 = Math.sin( x / 2 );
		const s3 = Math.sin( z / 2 );

		this.w = c1 * c2 * c3 + s1 * s2 * s3;
		this.x = c1 * s2 * c3 + s1 * c2 * s3;
		this.y = s1 * c2 * c3 - c1 * s2 * s3;
		this.z = c1 * c2 * s3 - s1 * s2 * c3;

		return this;

	}

	/**
	* Returns an euler angel (YXZ order) representation of this quaternion.
	*
	* @param {Object} euler - The resulting euler angles.
	* @return {Object} The resulting euler angles.
	*/
	toEuler( euler ) {

		// from 3D Math Primer for Graphics and Game Development
		// 8.7.6 Converting a Quaternion to Euler Angles

		// extract pitch

		const sp = - 2 * ( this.y * this.z - this.x * this.w );

		// check for gimbal lock

		if ( Math.abs( sp ) > 0.9999 ) {

			// looking straight up or down

			euler.x = Math.PI * 0.5 * sp;
			euler.y = Math.atan2( this.x * this.z + this.w * this.y, 0.5 - this.x * this.x - this.y * this.y );
			euler.z = 0;

		} else { //todo test

			euler.x = Math.asin( sp );
			euler.y = Math.atan2( this.x * this.z + this.w * this.y, 0.5 - this.x * this.x - this.y * this.y );
			euler.z = Math.atan2( this.x * this.y + this.w * this.z, 0.5 - this.x * this.x - this.z * this.z );

		}

		return euler;

	}

	/**
	* Sets the components of this quaternion from the given 3x3 rotation matrix.
	*
	* @param {Matrix3} m - The rotation matrix.
	* @return {Quaternion} A reference to this quaternion.
	*/
	fromMatrix3( m ) {

		const e = m.elements;

		const m11 = e[ 0 ], m12 = e[ 3 ], m13 = e[ 6 ];
		const m21 = e[ 1 ], m22 = e[ 4 ], m23 = e[ 7 ];
		const m31 = e[ 2 ], m32 = e[ 5 ], m33 = e[ 8 ];

		const trace = m11 + m22 + m33;

		if ( trace > 0 ) {

			let s = 0.5 / Math.sqrt( trace + 1.0 );

			this.w = 0.25 / s;
			this.x = ( m32 - m23 ) * s;
			this.y = ( m13 - m31 ) * s;
			this.z = ( m21 - m12 ) * s;

		} else if ( ( m11 > m22 ) && ( m11 > m33 ) ) {

			let s = 2.0 * Math.sqrt( 1.0 + m11 - m22 - m33 );

			this.w = ( m32 - m23 ) / s;
			this.x = 0.25 * s;
			this.y = ( m12 + m21 ) / s;
			this.z = ( m13 + m31 ) / s;

		} else if ( m22 > m33 ) {

			let s = 2.0 * Math.sqrt( 1.0 + m22 - m11 - m33 );

			this.w = ( m13 - m31 ) / s;
			this.x = ( m12 + m21 ) / s;
			this.y = 0.25 * s;
			this.z = ( m23 + m32 ) / s;

		} else {

			let s = 2.0 * Math.sqrt( 1.0 + m33 - m11 - m22 );

			this.w = ( m21 - m12 ) / s;
			this.x = ( m13 + m31 ) / s;
			this.y = ( m23 + m32 ) / s;
			this.z = 0.25 * s;

		}

		return this;

	}

	/**
	* Sets the components of this quaternion from an array.
	*
	* @param {Array<Number>} array - An array.
	* @param {Number} offset - An optional offset.
	* @return {Quaternion} A reference to this quaternion.
	*/
	fromArray( array, offset = 0 ) {

		this.x = array[ offset + 0 ];
		this.y = array[ offset + 1 ];
		this.z = array[ offset + 2 ];
		this.w = array[ offset + 3 ];

		return this;

	}

	/**
	* Copies all values of this quaternion to the given array.
	*
	* @param {Array<Number>} array - An array.
	* @param {Number} offset - An optional offset.
	* @return {Array<Number>} The array with the quaternion components.
	*/
	toArray( array, offset = 0 ) {

		array[ offset + 0 ] = this.x;
		array[ offset + 1 ] = this.y;
		array[ offset + 2 ] = this.z;
		array[ offset + 3 ] = this.w;

		return array;

	}

	/**
	* Returns true if the given quaternion is deep equal with this quaternion.
	*
	* @param {Quaternion} q - The quaternion to test.
	* @return {Boolean} The result of the equality test.
	*/
	equals( q ) {

		return ( ( q.x === this.x ) && ( q.y === this.y ) && ( q.z === this.z ) && ( q.w === this.w ) );

	}

}

/**
* Class representing a 4x4 matrix. The elements of the matrix
* are stored in column-major order.
*
* @author {@link https://github.com/Mugen87|Mugen87}
*/
class Matrix4 {

	/**
	* Constructs a new 4x4 identity matrix.
	*/
	constructor() {

		/**
		* The elements of the matrix in column-major order.
		* @type {Array<Number>}
		*/
		this.elements = [

			1, 0, 0, 0,
			0, 1, 0, 0,
			0, 0, 1, 0,
			0, 0, 0, 1

		];

	}

	/**
	* Sets the given values to this matrix. The arguments are in row-major order.
	*
	* @param {Number} n11 - An element of the matrix.
	* @param {Number} n12 - An element of the matrix.
	* @param {Number} n13 - An element of the matrix.
	* @param {Number} n14 - An element of the matrix.
	* @param {Number} n21 - An element of the matrix.
	* @param {Number} n22 - An element of the matrix.
	* @param {Number} n23 - An element of the matrix.
	* @param {Number} n24 - An element of the matrix.
	* @param {Number} n31 - An element of the matrix.
	* @param {Number} n32 - An element of the matrix.
	* @param {Number} n33 - An element of the matrix.
	* @param {Number} n34 - An element of the matrix.
	* @param {Number} n41 - An element of the matrix.
	* @param {Number} n42 - An element of the matrix.
	* @param {Number} n43 - An element of the matrix.
	* @param {Number} n44 - An element of the matrix.
	* @return {Matrix4} A reference to this matrix.
	*/
	set( n11, n12, n13, n14, n21, n22, n23, n24, n31, n32, n33, n34, n41, n42, n43, n44 ) {

		const e = this.elements;

		e[ 0 ] = n11; e[ 4 ] = n12; e[ 8 ] = n13; e[ 12 ] = n14;
		e[ 1 ] = n21; e[ 5 ] = n22; e[ 9 ] = n23; e[ 13 ] = n24;
		e[ 2 ] = n31; e[ 6 ] = n32; e[ 10 ] = n33; e[ 14 ] = n34;
		e[ 3 ] = n41; e[ 7 ] = n42; e[ 11 ] = n43; e[ 15 ] = n44;

		return this;

	}

	/**
	* Copies all values from the given matrix to this matrix.
	*
	* @param {Matrix4} m - The matrix to copy.
	* @return {Matrix4} A reference to this matrix.
	*/
	copy( m ) {

		const e = this.elements;
		const me = m.elements;

		e[ 0 ] = me[ 0 ]; e[ 1 ] = me[ 1 ]; e[ 2 ] = me[ 2 ]; e[ 3 ] = me[ 3 ];
		e[ 4 ] = me[ 4 ]; e[ 5 ] = me[ 5 ]; e[ 6 ] = me[ 6 ]; e[ 7 ] = me[ 7 ];
		e[ 8 ] = me[ 8 ]; e[ 9 ] = me[ 9 ]; e[ 10 ] = me[ 10 ]; e[ 11 ] = me[ 11 ];
		e[ 12 ] = me[ 12 ]; e[ 13 ] = me[ 13 ]; e[ 14 ] = me[ 14 ]; e[ 15 ] = me[ 15 ];

		return this;

	}

	/**
	* Creates a new matrix and copies all values from this matrix.
	*
	* @return {Matrix4} A new matrix.
	*/
	clone() {

		return new this.constructor().copy( this );

	}

	/**
	* Transforms this matrix to an identity matrix.
	*
	* @return {Matrix4} A reference to this matrix.
	*/
	identity() {

		this.set(

			1, 0, 0, 0,
			0, 1, 0, 0,
			0, 0, 1, 0,
			0, 0, 0, 1

		);

		return this;

	}

	/**
	* Multiplies this matrix with the given matrix.
	*
	* @param {Matrix4} m - The matrix to multiply.
	* @return {Matrix4} A reference to this matrix.
	*/
	multiply( m ) {

		return this.multiplyMatrices( this, m );

	}

	/**
	* Multiplies this matrix with the given matrix.
	* So the order of the multiplication is switched compared to {@link Matrix4#multiply}.
	*
	* @param {Matrix4} m - The matrix to multiply.
	* @return {Matrix4} A reference to this matrix.
	*/
	premultiply( m ) {

		return this.multiplyMatrices( m, this );

	}

	/**
	* Multiplies two given matrices and stores the result in this matrix.
	*
	* @param {Matrix4} a - The first matrix of the operation.
	* @param {Matrix4} b - The second matrix of the operation.
	* @return {Matrix4} A reference to this matrix.
	*/
	multiplyMatrices( a, b ) {

		const ae = a.elements;
		const be = b.elements;
		const e = this.elements;

		const a11 = ae[ 0 ], a12 = ae[ 4 ], a13 = ae[ 8 ], a14 = ae[ 12 ];
		const a21 = ae[ 1 ], a22 = ae[ 5 ], a23 = ae[ 9 ], a24 = ae[ 13 ];
		const a31 = ae[ 2 ], a32 = ae[ 6 ], a33 = ae[ 10 ], a34 = ae[ 14 ];
		const a41 = ae[ 3 ], a42 = ae[ 7 ], a43 = ae[ 11 ], a44 = ae[ 15 ];

		const b11 = be[ 0 ], b12 = be[ 4 ], b13 = be[ 8 ], b14 = be[ 12 ];
		const b21 = be[ 1 ], b22 = be[ 5 ], b23 = be[ 9 ], b24 = be[ 13 ];
		const b31 = be[ 2 ], b32 = be[ 6 ], b33 = be[ 10 ], b34 = be[ 14 ];
		const b41 = be[ 3 ], b42 = be[ 7 ], b43 = be[ 11 ], b44 = be[ 15 ];

		e[ 0 ] = ( a11 * b11 ) + ( a12 * b21 ) + ( a13 * b31 ) + ( a14 * b41 );
		e[ 4 ] = ( a11 * b12 ) + ( a12 * b22 ) + ( a13 * b32 ) + ( a14 * b42 );
		e[ 8 ] = ( a11 * b13 ) + ( a12 * b23 ) + ( a13 * b33 ) + ( a14 * b43 );
		e[ 12 ] = ( a11 * b14 ) + ( a12 * b24 ) + ( a13 * b34 ) + ( a14 * b44 );

		e[ 1 ] = ( a21 * b11 ) + ( a22 * b21 ) + ( a23 * b31 ) + ( a24 * b41 );
		e[ 5 ] = ( a21 * b12 ) + ( a22 * b22 ) + ( a23 * b32 ) + ( a24 * b42 );
		e[ 9 ] = ( a21 * b13 ) + ( a22 * b23 ) + ( a23 * b33 ) + ( a24 * b43 );
		e[ 13 ] = ( a21 * b14 ) + ( a22 * b24 ) + ( a23 * b34 ) + ( a24 * b44 );

		e[ 2 ] = ( a31 * b11 ) + ( a32 * b21 ) + ( a33 * b31 ) + ( a34 * b41 );
		e[ 6 ] = ( a31 * b12 ) + ( a32 * b22 ) + ( a33 * b32 ) + ( a34 * b42 );
		e[ 10 ] = ( a31 * b13 ) + ( a32 * b23 ) + ( a33 * b33 ) + ( a34 * b43 );
		e[ 14 ] = ( a31 * b14 ) + ( a32 * b24 ) + ( a33 * b34 ) + ( a34 * b44 );

		e[ 3 ] = ( a41 * b11 ) + ( a42 * b21 ) + ( a43 * b31 ) + ( a44 * b41 );
		e[ 7 ] = ( a41 * b12 ) + ( a42 * b22 ) + ( a43 * b32 ) + ( a44 * b42 );
		e[ 11 ] = ( a41 * b13 ) + ( a42 * b23 ) + ( a43 * b33 ) + ( a44 * b43 );
		e[ 15 ] = ( a41 * b14 ) + ( a42 * b24 ) + ( a43 * b34 ) + ( a44 * b44 );

		return this;

	}

	/**
	* Multiplies the given scalar with this matrix.
	*
	* @param {Number} s - The scalar to multiply.
	* @return {Matrix4} A reference to this matrix.
	*/
	multiplyScalar( s ) {

		const e = this.elements;

		e[ 0 ] *= s; e[ 4 ] *= s; e[ 8 ] *= s; e[ 12 ] *= s;
		e[ 1 ] *= s; e[ 5 ] *= s; e[ 9 ] *= s; e[ 13 ] *= s;
		e[ 2 ] *= s; e[ 6 ] *= s; e[ 10 ] *= s; e[ 14 ] *= s;
		e[ 3 ] *= s; e[ 7 ] *= s; e[ 11 ] *= s; e[ 15 ] *= s;

		return this;

	}

	/**
	* Extracts the basis vectors and stores them to the given vectors.
	*
	* @param {Vector3} xAxis - The first result vector for the x-axis.
	* @param {Vector3} yAxis - The second result vector for the y-axis.
	* @param {Vector3} zAxis - The third result vector for the z-axis.
	* @return {Matrix4} A reference to this matrix.
	*/
	extractBasis( xAxis, yAxis, zAxis ) {

		xAxis.fromMatrix4Column( this, 0 );
		yAxis.fromMatrix4Column( this, 1 );
		zAxis.fromMatrix4Column( this, 2 );

		return this;

	}

	/**
	* Makes a basis from the given vectors.
	*
	* @param {Vector3} xAxis - The first basis vector for the x-axis.
	* @param {Vector3} yAxis - The second basis vector for the y-axis.
	* @param {Vector3} zAxis - The third basis vector for the z-axis.
	* @return {Matrix4} A reference to this matrix.
	*/
	makeBasis( xAxis, yAxis, zAxis ) {

		this.set(
			xAxis.x, yAxis.x, zAxis.x, 0,
			xAxis.y, yAxis.y, zAxis.y, 0,
			xAxis.z, yAxis.z, zAxis.z, 0,
			0, 0, 0, 1
		);

		return this;

	}

	/**
	* Composes a matrix from the given position, quaternion and scale.
	*
	* @param {Vector3} position - A vector representing a position in 3D space.
	* @param {Quaternion} rotation - A quaternion representing a rotation.
	* @param {Vector3} scale - A vector representing a 3D scaling.
	* @return {Matrix4} A reference to this matrix.
	*/
	compose( position, rotation, scale ) {

		this.fromQuaternion( rotation );
		this.scale( scale );
		this.setPosition( position );

		return this;

	}

	/**
	* Scales this matrix by the given 3D vector.
	*
	* @param {Vector3} v - A 3D vector representing a scaling.
	* @return {Matrix4} A reference to this matrix.
	*/
	scale( v ) {

		const e = this.elements;

		const x = v.x, y = v.y, z = v.z;

		e[ 0 ] *= x; e[ 4 ] *= y; e[ 8 ] *= z;
		e[ 1 ] *= x; e[ 5 ] *= y; e[ 9 ] *= z;
		e[ 2 ] *= x; e[ 6 ] *= y; e[ 10 ] *= z;
		e[ 3 ] *= x; e[ 7 ] *= y; e[ 11 ] *= z;

		return this;

	}

	/**
	* Sets the translation part of the 4x4 matrix to the given position vector.
	*
	* @param {Vector3} v - A 3D vector representing a position.
	* @return {Matrix4} A reference to this matrix.
	*/
	setPosition( v ) {

		const e = this.elements;

		e[ 12 ] = v.x;
		e[ 13 ] = v.y;
		e[ 14 ] = v.z;

		return this;

	}

	/**
	* Transposes this matrix.
	*
	* @return {Matrix4} A reference to this matrix.
	*/
	transpose() {

		const e = this.elements;
		let t;

		t = e[ 1 ]; e[ 1 ] = e[ 4 ]; e[ 4 ] = t;
		t = e[ 2 ]; e[ 2 ] = e[ 8 ]; e[ 8 ] = t;
		t = e[ 6 ]; e[ 6 ] = e[ 9 ]; e[ 9 ] = t;

		t = e[ 3 ]; e[ 3 ] = e[ 12 ]; e[ 12 ] = t;
		t = e[ 7 ]; e[ 7 ] = e[ 13 ]; e[ 13 ] = t;
		t = e[ 11 ]; e[ 11 ] = e[ 14 ]; e[ 14 ] = t;

		return this;


	}

	/**
	* Computes the inverse of this matrix and stored the result in the given matrix.
	*
	* You can not invert a matrix with a determinant of zero. If you attempt this, the method returns a zero matrix instead.
	*
	* @param {Matrix4} m - The result matrix.
	* @return {Matrix4} The result matrix.
	*/
	getInverse( m ) {

		const e = this.elements;
		const me = m.elements;

		const n11 = e[ 0 ], n21 = e[ 1 ], n31 = e[ 2 ], n41 = e[ 3 ];
		const n12 = e[ 4 ], n22 = e[ 5 ], n32 = e[ 6 ], n42 = e[ 7 ];
		const n13 = e[ 8 ], n23 = e[ 9 ], n33 = e[ 10 ], n43 = e[ 11 ];
		const n14 = e[ 12 ], n24 = e[ 13 ], n34 = e[ 14 ], n44 = e[ 15 ];

		const t11 = n23 * n34 * n42 - n24 * n33 * n42 + n24 * n32 * n43 - n22 * n34 * n43 - n23 * n32 * n44 + n22 * n33 * n44;
		const t12 = n14 * n33 * n42 - n13 * n34 * n42 - n14 * n32 * n43 + n12 * n34 * n43 + n13 * n32 * n44 - n12 * n33 * n44;
		const t13 = n13 * n24 * n42 - n14 * n23 * n42 + n14 * n22 * n43 - n12 * n24 * n43 - n13 * n22 * n44 + n12 * n23 * n44;
		const t14 = n14 * n23 * n32 - n13 * n24 * n32 - n14 * n22 * n33 + n12 * n24 * n33 + n13 * n22 * n34 - n12 * n23 * n34;

		const det = n11 * t11 + n21 * t12 + n31 * t13 + n41 * t14;

		if ( det === 0 ) return m.set( 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0 );

		const detInv = 1 / det;

		me[ 0 ] = t11 * detInv;
		me[ 1 ] = ( n24 * n33 * n41 - n23 * n34 * n41 - n24 * n31 * n43 + n21 * n34 * n43 + n23 * n31 * n44 - n21 * n33 * n44 ) * detInv;
		me[ 2 ] = ( n22 * n34 * n41 - n24 * n32 * n41 + n24 * n31 * n42 - n21 * n34 * n42 - n22 * n31 * n44 + n21 * n32 * n44 ) * detInv;
		me[ 3 ] = ( n23 * n32 * n41 - n22 * n33 * n41 - n23 * n31 * n42 + n21 * n33 * n42 + n22 * n31 * n43 - n21 * n32 * n43 ) * detInv;

		me[ 4 ] = t12 * detInv;
		me[ 5 ] = ( n13 * n34 * n41 - n14 * n33 * n41 + n14 * n31 * n43 - n11 * n34 * n43 - n13 * n31 * n44 + n11 * n33 * n44 ) * detInv;
		me[ 6 ] = ( n14 * n32 * n41 - n12 * n34 * n41 - n14 * n31 * n42 + n11 * n34 * n42 + n12 * n31 * n44 - n11 * n32 * n44 ) * detInv;
		me[ 7 ] = ( n12 * n33 * n41 - n13 * n32 * n41 + n13 * n31 * n42 - n11 * n33 * n42 - n12 * n31 * n43 + n11 * n32 * n43 ) * detInv;

		me[ 8 ] = t13 * detInv;
		me[ 9 ] = ( n14 * n23 * n41 - n13 * n24 * n41 - n14 * n21 * n43 + n11 * n24 * n43 + n13 * n21 * n44 - n11 * n23 * n44 ) * detInv;
		me[ 10 ] = ( n12 * n24 * n41 - n14 * n22 * n41 + n14 * n21 * n42 - n11 * n24 * n42 - n12 * n21 * n44 + n11 * n22 * n44 ) * detInv;
		me[ 11 ] = ( n13 * n22 * n41 - n12 * n23 * n41 - n13 * n21 * n42 + n11 * n23 * n42 + n12 * n21 * n43 - n11 * n22 * n43 ) * detInv;

		me[ 12 ] = t14 * detInv;
		me[ 13 ] = ( n13 * n24 * n31 - n14 * n23 * n31 + n14 * n21 * n33 - n11 * n24 * n33 - n13 * n21 * n34 + n11 * n23 * n34 ) * detInv;
		me[ 14 ] = ( n14 * n22 * n31 - n12 * n24 * n31 - n14 * n21 * n32 + n11 * n24 * n32 + n12 * n21 * n34 - n11 * n22 * n34 ) * detInv;
		me[ 15 ] = ( n12 * n23 * n31 - n13 * n22 * n31 + n13 * n21 * n32 - n11 * n23 * n32 - n12 * n21 * n33 + n11 * n22 * n33 ) * detInv;

		return m;

	}

	/**
	* Computes the maximum scale value for all three axis.
	*
	* @return {Number} The maximum scale value.
	*/
	getMaxScale() {

		const e = this.elements;

		const scaleXSq = e[ 0 ] * e[ 0 ] + e[ 1 ] * e[ 1 ] + e[ 2 ] * e[ 2 ];
		const scaleYSq = e[ 4 ] * e[ 4 ] + e[ 5 ] * e[ 5 ] + e[ 6 ] * e[ 6 ];
		const scaleZSq = e[ 8 ] * e[ 8 ] + e[ 9 ] * e[ 9 ] + e[ 10 ] * e[ 10 ];

		return Math.sqrt( Math.max( scaleXSq, scaleYSq, scaleZSq ) );

	}

	/**
	* Uses the given quaternion to transform the upper left 3x3 part to a rotation matrix.
	* Other parts of the matrix are equal to the identiy matrix.
	*
	* @param {Quaternion} q - A quaternion representing a rotation.
	* @return {Matrix4} A reference to this matrix.
	*/
	fromQuaternion( q ) {

		const e = this.elements;

		const x = q.x, y = q.y, z = q.z, w = q.w;
		const x2 = x + x, y2 = y + y, z2 = z + z;
		const xx = x * x2, xy = x * y2, xz = x * z2;
		const yy = y * y2, yz = y * z2, zz = z * z2;
		const wx = w * x2, wy = w * y2, wz = w * z2;

		e[ 0 ] = 1 - ( yy + zz );
		e[ 4 ] = xy - wz;
		e[ 8 ] = xz + wy;

		e[ 1 ] = xy + wz;
		e[ 5 ] = 1 - ( xx + zz );
		e[ 9 ] = yz - wx;

		e[ 2 ] = xz - wy;
		e[ 6 ] = yz + wx;
		e[ 10 ] = 1 - ( xx + yy );

		e[ 3 ] = 0;
		e[ 7 ] = 0;
		e[ 11 ] = 0;

		e[ 12 ] = 0;
		e[ 13 ] = 0;
		e[ 14 ] = 0;
		e[ 15 ] = 1;

		return this;

	}

	/**
	* Sets the upper-left 3x3 portion of this matrix by the given 3x3 matrix. Other
	* parts of the matrix are equal to the identiy matrix.
	*
	* @param {Matrix3} m - A 3x3 matrix.
	* @return {Matrix4} A reference to this matrix.
	*/
	fromMatrix3( m ) {

		const e = this.elements;
		const me = m.elements;

		e[ 0 ] = me[ 0 ];
		e[ 1 ] = me[ 1 ];
		e[ 2 ] = me[ 2 ];
		e[ 3 ] = 0;

		e[ 4 ] = me[ 3 ];
		e[ 5 ] = me[ 4 ];
		e[ 6 ] = me[ 5 ];
		e[ 7 ] = 0;

		e[ 8 ] = me[ 6 ];
		e[ 9 ] = me[ 7 ];
		e[ 10 ] = me[ 8 ];
		e[ 11 ] = 0;

		e[ 12 ] = 0;
		e[ 13 ] = 0;
		e[ 14 ] = 0;
		e[ 15 ] = 1;

		return this;

	}

	/**
	* Sets the elements of this matrix from an array.
	*
	* @param {Array<Number>} array - An array.
	* @param {Number} offset - An optional offset.
	* @return {Matrix4} A reference to this matrix.
	*/
	fromArray( array, offset = 0 ) {

		const e = this.elements;

		for ( let i = 0; i < 16; i ++ ) {

			e[ i ] = array[ i + offset ];

		}

		return this;

	}

	/**
	* Copies all elements of this matrix to the given array.
	*
	* @param {Array<Number>} array - An array.
	* @param {Number} offset - An optional offset.
	* @return {Array<Number>} The array with the elements of the matrix.
	*/
	toArray( array, offset = 0 ) {

		const e = this.elements;

		array[ offset + 0 ] = e[ 0 ];
		array[ offset + 1 ] = e[ 1 ];
		array[ offset + 2 ] = e[ 2 ];
		array[ offset + 3 ] = e[ 3 ];

		array[ offset + 4 ] = e[ 4 ];
		array[ offset + 5 ] = e[ 5 ];
		array[ offset + 6 ] = e[ 6 ];
		array[ offset + 7 ] = e[ 7 ];

		array[ offset + 8 ] = e[ 8 ];
		array[ offset + 9 ] = e[ 9 ];
		array[ offset + 10 ] = e[ 10 ];
		array[ offset + 11 ] = e[ 11 ];

		array[ offset + 12 ] = e[ 12 ];
		array[ offset + 13 ] = e[ 13 ];
		array[ offset + 14 ] = e[ 14 ];
		array[ offset + 15 ] = e[ 15 ];

		return array;

	}

	/**
	* Returns true if the given matrix is deep equal with this matrix.
	*
	* @param {Matrix4} m - The matrix to test.
	* @return {Boolean} The result of the equality test.
	*/
	equals( m ) {

		const e = this.elements;
		const me = m.elements;

		for ( let i = 0; i < 16; i ++ ) {

			if ( e[ i ] !== me[ i ] ) return false;

		}

		return true;

	}

}

const targetRotation = new Quaternion();
const targetDirection = new Vector3();
const positionWorld = new Vector3();
const quaternionWorld = new Quaternion();

/**
* Base class for all game entities.
*
* @author {@link https://github.com/Mugen87|Mugen87}
*/
class GameEntity {

	/**
	* Constructs a new game entity.
	*/
	constructor() {

		/**
		* The name of this game entity.
		* @type {String}
		*/
		this.name = '';

		/**
		* Whether this game entity is active or not.
		* @type {Boolean}
		* @default true
		*/
		this.active = true;

		/**
		* The child entities of this game entity.
		* @type {Array<GameEntity>}
		*/
		this.children = new Array();

		/**
		* A reference to the parent entity of this game entity.
		* Automatically set when added to a {@link GameEntity}.
		* @type {?GameEntity}
		* @default null
		* @readonly
		*/
		this.parent = null;

		/**
		* A list of neighbors of this game entity.
		* @type {Array<GameEntity>}
		* @readonly
		*/
		this.neighbors = new Array();

		/**
		* Game entities within this radius are considered as neighbors of this entity.
		* @type {Number}
		* @default 1
		*/
		this.neighborhoodRadius = 1;

		/**
		* Whether the neighborhood of this game entity is updated or not.
		* @type {Boolean}
		* @default false
		*/
		this.updateNeighborhood = false;

		/**
		* The position of this game entity.
		* @type {Vector3}
		*/
		this.position = new Vector3();

		/**
		* The rotation of this game entity.
		* @type {Quaternion}
		*/
		this.rotation = new Quaternion();

		/**
		* The scaling of this game entity.
		* @type {Vector3}
		*/
		this.scale = new Vector3( 1, 1, 1 );

		/**
		* The default forward vector of this game entity.
		* @type {Vector3}
		* @default (0,0,1)
		*/
		this.forward = new Vector3( 0, 0, 1 );

		/**
		* The default up vector of this game entity.
		* @type {Vector3}
		* @default (0,1,0)
		*/
		this.up = new Vector3( 0, 1, 0 );

		/**
		* The bounding radius of this game entity in world units.
		* @type {Number}
		* @default 0
		*/
		this.boundingRadius = 0;

		/**
		* The maximum turn rate of this game entity in radians per seconds.
		* The only method that uses this property right now is {@link GameEntity#rotateTo}.
		* @type {Number}
		* @default π
		*/
		this.maxTurnRate = Math.PI;

		/**
		* Whether the entity can activate a trigger or not.
		* @type {Boolean}
		* @default true
		*/
		this.canActivateTrigger = true;

		/**
		* A reference to the entity manager of this game entity.
		* Automatically set when added to an {@link EntityManager}.
		* @type {EntityManager}
		* @default null
		* @readonly
		*/
		this.manager = null;

		// private properties

		// local transformation matrix. no part of the public API due to caching

		this._localMatrix = new Matrix4();

		// internal world matrix reference (only accessible via a getter)

		this._worldMatrix = new Matrix4();

		// per-entity cache in order to avoid unnecessary matrix calculations

		this._cache = {
			position: new Vector3(),
			rotation: new Quaternion(),
			scale: new Vector3( 1, 1, 1 )
		};

		// render component

		this._renderComponent = null;
		this._renderComponentCallback = null;

		// flag to indicate whether the entity was updated by its manager at least once or not

		this._started = false;

		//

		this._uuid = null;

		// if set to true, it means the world matrix requires a recomputation

		this._worldMatrixDirty = false;

	}

	/**
	* A transformation matrix representing the world space of this game entity.
	* @type {Matrix4}
	* @readonly
	*/
	get worldMatrix() {

		this._updateWorldMatrix();

		return this._worldMatrix;

	}

	/**
	* Unique ID, primarily used in context of serialization/deserialization.
	* @type {String}
	* @readonly
	*/
	get uuid() {

		if ( this._uuid === null ) {

			this._uuid = MathUtils.generateUUID();

		}

		return this._uuid;

	}

	/**
	* Executed when this game entity is updated for the first time by its {@link EntityManager}.
	*
	* @return {GameEntity} A reference to this game entity.
	*/
	start() {

		return this;

	}

	/**
	* Updates the internal state of this game entity. Normally called by {@link EntityManager#update}
	* in each simulation step.
	*
	* @param {Number} delta - The time delta.
	* @return {GameEntity} A reference to this game entity.
	*/
	update( /* delta */ ) {

		return this;

	}


	/**
	* Adds a game entity as a child to this game entity.
	*
	* @param {GameEntity} entity - The game entity to add.
	* @return {GameEntity} A reference to this game entity.
	*/
	add( entity ) {

		if ( entity.parent !== null ) {

			entity.parent.remove( entity );

		}

		this.children.push( entity );
		entity.parent = this;

		return this;

	}

	/**
	* Removes a game entity as a child from this game entity.
	*
	* @param {GameEntity} entity - The game entity to remove.
	* @return {GameEntity} A reference to this game entity.
	*/
	remove( entity ) {

		const index = this.children.indexOf( entity );
		this.children.splice( index, 1 );

		entity.parent = null;

		return this;

	}

	/**
	* Computes the current direction (forward) vector of this game entity
	* and stores the result in the given vector.
	*
	* @param {Vector3} result - The direction vector of this game entity.
	* @return {Vector3} The direction vector of this game entity.
	*/
	getDirection( result ) {

		return result.copy( this.forward ).applyRotation( this.rotation ).normalize();

	}

	/**
	* Directly rotates the entity so it faces the given target position.
	*
	* @param {Vector3} target - The target position.
	* @return {GameEntity} A reference to this game entity.
	*/
	lookAt( target ) {

		const parent = this.parent;

		if ( parent !== null ) {

			this.getWorldPosition( positionWorld );

			targetDirection.subVectors( target, positionWorld ).normalize();

			this.rotation.lookAt( this.forward, targetDirection, this.up );

			quaternionWorld.extractRotationFromMatrix( parent.worldMatrix ).inverse();

			this.rotation.premultiply( quaternionWorld );

		} else {

			targetDirection.subVectors( target, this.position ).normalize();

			this.rotation.lookAt( this.forward, targetDirection, this.up );

		}

		return this;

	}

	/**
	* Given a target position, this method rotates the entity by an amount not
	* greater than {@link GameEntity#maxTurnRate} until it directly faces the target.
	*
	* @param {Vector3} target - The target position.
	* @param {Number} delta - The time delta.
	* @param {Number} tolerance - A tolerance value in radians to tweak the result
	* when a game entity is considered to face a target.
	* @return {Boolean} Whether the entity is faced to the target or not.
	*/
	rotateTo( target, delta, tolerance = 0.0001 ) {

		const parent = this.parent;

		if ( parent !== null ) {

			this.getWorldPosition( positionWorld );

			targetDirection.subVectors( target, positionWorld ).normalize();

			targetRotation.lookAt( this.forward, targetDirection, this.up );

			quaternionWorld.extractRotationFromMatrix( parent.worldMatrix ).inverse();

			targetRotation.premultiply( quaternionWorld );

		} else {

			targetDirection.subVectors( target, this.position ).normalize();

			targetRotation.lookAt( this.forward, targetDirection, this.up );

		}

		return this.rotation.rotateTo( targetRotation, this.maxTurnRate * delta, tolerance );

	}

	/**
	* Computes the current direction (forward) vector of this game entity
	* in world space and stores the result in the given vector.
	*
	* @param {Vector3} result - The direction vector of this game entity in world space.
	* @return {Vector3} The direction vector of this game entity in world space.
	*/
	getWorldDirection( result ) {

		quaternionWorld.extractRotationFromMatrix( this.worldMatrix );

		return result.copy( this.forward ).applyRotation( quaternionWorld ).normalize();

	}

	/**
	* Computes the current position of this game entity in world space and
	* stores the result in the given vector.
	*
	* @param {Vector3} result - The position of this game entity in world space.
	* @return {Vector3} The position of this game entity in world space.
	*/
	getWorldPosition( result ) {

		return result.extractPositionFromMatrix( this.worldMatrix );

	}

	/**
	* Sets a renderable component of a 3D engine with a sync callback for this game entity.
	*
	* @param {Object} renderComponent - A renderable component of a 3D engine.
	* @param {Function} callback - A callback that can be used to sync this game entity with the renderable component.
	* @return {GameEntity} A reference to this game entity.
	*/
	setRenderComponent( renderComponent, callback ) {

		this._renderComponent = renderComponent;
		this._renderComponentCallback = callback;

		return this;

	}

	/**
	* Holds the implementation for the message handling of this game entity.
	*
	* @param {Telegram} telegram - The telegram with the message data.
	* @return {Boolean} Whether the message was processed or not.
	*/
	handleMessage() {

		return false;

	}

	/**
	* Holds the implementation for the line of sight test of this game entity.
	* This method is used by {@link Vision#visible} in order to determine whether
	* this game entity blocks the given line of sight or not. Implement this method
	* when your game entity acts as an obstacle.
	*
	* @param {Ray} ray - The ray that represents the line of sight.
	* @param {Vector3} intersectionPoint - The intersection point.
	* @return {Vector3} The intersection point.
	*/
	lineOfSightTest() {

		return null;

	}

	/**
	* Sends a message with the given data to the specified receiver.
	*
	* @param {GameEntity} receiver - The receiver.
	* @param {String} message - The actual message.
	* @param {Number} delay - A time value in millisecond used to delay the message dispatching.
	* @param {Object} data - An object for custom data.
	* @return {GameEntity} A reference to this game entity.
	*/
	sendMessage( receiver, message, delay = 0, data = null ) {

		if ( this.manager !== null ) {

			this.manager.sendMessage( this, receiver, message, delay, data );

		} else {

			Logger.error( 'YUKA.GameEntity: The game entity must be added to a manager in order to send a message.' );

		}

		return this;

	}

	/**
	* Transforms this instance into a JSON object.
	*
	* @return {Object} The JSON object.
	*/
	toJSON() {

		return {
			type: this.constructor.name,
			uuid: this.uuid,
			name: this.name,
			active: this.active,
			children: entitiesToIds( this.children ),
			parent: ( this.parent !== null ) ? this.parent.uuid : null,
			neighbors: entitiesToIds( this.neighbors ),
			neighborhoodRadius: this.neighborhoodRadius,
			updateNeighborhood: this.updateNeighborhood,
			position: this.position.toArray( new Array() ),
			rotation: this.rotation.toArray( new Array() ),
			scale: this.scale.toArray( new Array() ),
			forward: this.forward.toArray( new Array() ),
			up: this.up.toArray( new Array() ),
			boundingRadius: this.boundingRadius,
			maxTurnRate: this.maxTurnRate,
			canActivateTrigger: this.canActivateTrigger,
			worldMatrix: this.worldMatrix.toArray( new Array() ),
			_localMatrix: this._localMatrix.toArray( new Array() ),
			_cache: {
				position: this._cache.position.toArray( new Array() ),
				rotation: this._cache.rotation.toArray( new Array() ),
				scale: this._cache.scale.toArray( new Array() ),
			},
			_started: this._started
		};

	}

	/**
	* Restores this instance from the given JSON object.
	*
	* @param {Object} json - The JSON object.
	* @return {GameEntity} A reference to this game entity.
	*/
	fromJSON( json ) {

		this.name = json.name;
		this.active = json.active;
		this.neighborhoodRadius = json.neighborhoodRadius;
		this.updateNeighborhood = json.updateNeighborhood;
		this.position.fromArray( json.position );
		this.rotation.fromArray( json.rotation );
		this.scale.fromArray( json.scale );
		this.forward.fromArray( json.forward );
		this.up.fromArray( json.up );
		this.boundingRadius = json.boundingRadius;
		this.maxTurnRate = json.maxTurnRate;
		this.canActivateTrigger = json.canActivateTrigger;

		this.children = json.children.slice();
		this.neighbors = json.neighbors.slice();
		this.parent = json.parent;

		this._localMatrix.fromArray( json._localMatrix );
		this._worldMatrix.fromArray( json.worldMatrix );

		this._cache.position.fromArray( json._cache.position );
		this._cache.rotation.fromArray( json._cache.rotation );
		this._cache.scale.fromArray( json._cache.scale );

		this._started = json._started;

		this._uuid = json.uuid;

		return this;

	}

	/**
	* Restores UUIDs with references to GameEntity objects.
	*
	* @param {Map<String,GameEntity>} entities - Maps game entities to UUIDs.
	* @return {GameEntity} A reference to this game entity.
	*/
	resolveReferences( entities ) {

		//

		const neighbors = this.neighbors;

		for ( let i = 0, l = neighbors.length; i < l; i ++ ) {

			neighbors[ i ] = entities.get( neighbors[ i ] );

		}

		//

		const children = this.children;

		for ( let i = 0, l = children.length; i < l; i ++ ) {

			children[ i ] = entities.get( children[ i ] );

		}

		//

		this.parent = entities.get( this.parent ) || null;

		return this;

	}

	// Updates the transformation matrix representing the local space.

	_updateMatrix() {

		const cache = this._cache;

		if ( cache.position.equals( this.position ) &&
				cache.rotation.equals( this.rotation ) &&
				cache.scale.equals( this.scale ) ) {

			return;

		}

		this._localMatrix.compose( this.position, this.rotation, this.scale );

		cache.position.copy( this.position );
		cache.rotation.copy( this.rotation );
		cache.scale.copy( this.scale );

		this._worldMatrixDirty = true;

	}

	_updateWorldMatrix() {

		const parent = this.parent;

		if ( parent !== null ) {

			parent._updateWorldMatrix();

		}

		this._updateMatrix();

		if ( this._worldMatrixDirty === true ) {

			if ( parent === null ) {

				this._worldMatrix.copy( this._localMatrix );

			} else {

				this._worldMatrix.multiplyMatrices( this.parent._worldMatrix, this._localMatrix );

			}

			this._worldMatrixDirty = false;

			// invalidate world matrices of children

			const children = this.children;

			for ( let i = 0, l = children.length; i < l; i ++ ) {

				const child = children[ i ];
				child._worldMatrixDirty = true;

			}

		}

	}

	// deprecated

	updateWorldMatrix() {

		// this warning will be removed with v1.0.0

		console.warn( 'GameEntity: .updateWorldMatrix() has been removed. World matrices are automatically updated on access.' );
		return this;

	}

}

function entitiesToIds( array ) {

	const ids = new Array();

	for ( let i = 0, l = array.length; i < l; i ++ ) {

		ids.push( array[ i ].uuid );

	}

	return ids;

}

const displacement$4 = new Vector3();
const target$1 = new Vector3();

/**
* Class representing moving game entities.
*
* @author {@link https://github.com/Mugen87|Mugen87}
* @augments GameEntity
*/
class MovingEntity extends GameEntity {

	/**
	* Constructs a new moving entity.
	*/
	constructor() {

		super();

		/**
		* The velocity of this game entity.
		* @type {Vector3}
		*/
		this.velocity = new Vector3();

		/**
		* The maximum speed at which this game entity may travel.
		* @type {Number}
		* @default 1
		*/
		this.maxSpeed = 1;

		/**
		* Whether the orientation of this game entity will be updated based on the velocity or not.
		* @type {Boolean}
		* @default true
		*/
		this.updateOrientation = true;

	}

	/**
	* Updates the internal state of this game entity.
	*
	* @param {Number} delta - The time delta.
	* @return {MovingEntity} A reference to this moving entity.
	*/
	update( delta ) {

		// make sure vehicle does not exceed maximum speed

		if ( this.getSpeedSquared() > ( this.maxSpeed * this.maxSpeed ) ) {

			this.velocity.normalize();
			this.velocity.multiplyScalar( this.maxSpeed );

		}

		// calculate displacement

		displacement$4.copy( this.velocity ).multiplyScalar( delta );

		// calculate target position

		target$1.copy( this.position ).add( displacement$4 );

		// update the orientation if the vehicle has a non zero velocity

		if ( this.updateOrientation && this.getSpeedSquared() > 0.00000001 ) {

			this.lookAt( target$1 );

		}

		// update position

		this.position.copy( target$1 );

		return this;

	}

	/**
	* Returns the current speed of this game entity.
	*
	* @return {Number} The current speed.
	*/
	getSpeed() {

		return this.velocity.length();

	}

	/**
	* Returns the current speed in squared space of this game entity.
	*
	* @return {Number} The current speed in squared space.
	*/
	getSpeedSquared() {

		return this.velocity.squaredLength();

	}

	/**
	* Transforms this instance into a JSON object.
	*
	* @return {Object} The JSON object.
	*/
	toJSON() {

		const json = super.toJSON();

		json.velocity = this.velocity.toArray( new Array() );
		json.maxSpeed = this.maxSpeed;
		json.updateOrientation = this.updateOrientation;

		return json;

	}

	/**
	* Restores this instance from the given JSON object.
	*
	* @param {Object} json - The JSON object.
	* @return {MovingEntity} A reference to this moving entity.
	*/
	fromJSON( json ) {

		super.fromJSON( json );

		this.velocity.fromArray( json.velocity );
		this.maxSpeed = json.maxSpeed;
		this.updateOrientation = json.updateOrientation;

		return this;

	}

}

/**
* Base class for all concrete steering behaviors. They produce a force that describes
* where an agent should move and how fast it should travel to get there.
*
* Note: All built-in steering behaviors assume a {@link Vehicle#mass} of one. Different values can lead to an unexpected results.
*
* @author {@link https://github.com/Mugen87|Mugen87}
*/
class SteeringBehavior {

	/**
	* Constructs a new steering behavior.
	*/
	constructor() {

		/**
		* Whether this steering behavior is active or not.
		* @type {Boolean}
		* @default true
		*/
		this.active = true;

		/**
		* Can be used to tweak the amount that a steering force contributes to the total steering force.
		* @type {Number}
		* @default 1
		*/
		this.weight = 1;

	}

	/**
	* Calculates the steering force for a single simulation step.
	*
	* @param {Vehicle} vehicle - The game entity the force is produced for.
	* @param {Vector3} force - The force/result vector.
	* @param {Number} delta - The time delta.
	* @return {Vector3} The force/result vector.
	*/
	calculate( /* vehicle, force, delta */ ) {}

	/**
	* Transforms this instance into a JSON object.
	*
	* @return {Object} The JSON object.
	*/
	toJSON() {

		return {
			type: this.constructor.name,
			active: this.active,
			weight: this.weight
		};

	}

	/**
	* Restores this instance from the given JSON object.
	*
	* @param {Object} json - The JSON object.
	* @return {SteeringBehavior} A reference to this steering behavior.
	*/
	fromJSON( json ) {

		this.active = json.active;
		this.weight = json.weight;

		return this;

	}

	/**
	* Restores UUIDs with references to GameEntity objects.
	*
	* @param {Map<String,GameEntity>} entities - Maps game entities to UUIDs.
	* @return {SteeringBehavior} A reference to this steering behavior.
	*/
	resolveReferences( /* entities */ ) {}

}

const averageDirection = new Vector3();
const direction$1 = new Vector3();

/**
* This steering behavior produces a force that keeps a vehicle’s heading aligned with its neighbors.
*
* @author {@link https://github.com/Mugen87|Mugen87}
* @augments SteeringBehavior
*/
class AlignmentBehavior extends SteeringBehavior {

	/**
	* Constructs a new alignment behavior.
	*/
	constructor() {

		super();

	}

	/**
	* Calculates the steering force for a single simulation step.
	*
	* @param {Vehicle} vehicle - The game entity the force is produced for.
	* @param {Vector3} force - The force/result vector.
	* @param {Number} delta - The time delta.
	* @return {Vector3} The force/result vector.
	*/
	calculate( vehicle, force /*, delta */ ) {

		averageDirection.set( 0, 0, 0 );

		const neighbors = vehicle.neighbors;

		// iterate over all neighbors to calculate the average direction vector

		for ( let i = 0, l = neighbors.length; i < l; i ++ ) {

			const neighbor = neighbors[ i ];

			neighbor.getDirection( direction$1 );

			averageDirection.add( direction$1 );

		}

		if ( neighbors.length > 0 ) {

			averageDirection.divideScalar( neighbors.length );

			// produce a force to align the vehicle's heading

			vehicle.getDirection( direction$1 );
			force.subVectors( averageDirection, direction$1 );

		}

		return force;

	}

}

const desiredVelocity$2 = new Vector3();
const displacement$3 = new Vector3();

/**
* This steering behavior produces a force that directs an agent toward a target position.
* Unlike {@link SeekBehavior}, it decelerates so the agent comes to a gentle halt at the target position.
*
* @author {@link https://github.com/Mugen87|Mugen87}
* @augments SteeringBehavior
*/
class ArriveBehavior extends SteeringBehavior {

	/**
	* Constructs a new arrive behavior.
	*
	* @param {Vector3} target - The target vector.
	* @param {Number} deceleration - The amount of deceleration.
	* @param {Number} tolerance - A tolerance value in world units to prevent the vehicle from overshooting its target.
	*/
	constructor( target = new Vector3(), deceleration = 3, tolerance = 0 ) {

		super();

		/**
		* The target vector.
		* @type {Vector3}
		*/
		this.target = target;

		/**
		* The amount of deceleration.
		* @type {Number}
		* @default 3
		*/
		this.deceleration = deceleration;

		/**
		* A tolerance value in world units to prevent the vehicle from overshooting its target.
		* @type {Number}
		* @default 0
		*/
		this.tolerance = tolerance;

	}

	/**
	* Calculates the steering force for a single simulation step.
	*
	* @param {Vehicle} vehicle - The game entity the force is produced for.
	* @param {Vector3} force - The force/result vector.
	* @param {Number} delta - The time delta.
	* @return {Vector3} The force/result vector.
	*/
	calculate( vehicle, force /*, delta */ ) {

		const target = this.target;
		const deceleration = this.deceleration;

		displacement$3.subVectors( target, vehicle.position );

		const distance = displacement$3.length();

		if ( distance > this.tolerance ) {

			// calculate the speed required to reach the target given the desired deceleration

			let speed = distance / deceleration;

			// make sure the speed does not exceed the max

			speed = Math.min( speed, vehicle.maxSpeed );

			// from here proceed just like "seek" except we don't need to normalize
			// the "displacement" vector because we have already gone to the trouble
			// of calculating its length.

			desiredVelocity$2.copy( displacement$3 ).multiplyScalar( speed / distance );

		} else {

			desiredVelocity$2.set( 0, 0, 0 );

		}

		return force.subVectors( desiredVelocity$2, vehicle.velocity );

	}

	/**
	* Transforms this instance into a JSON object.
	*
	* @return {Object} The JSON object.
	*/
	toJSON() {

		const json = super.toJSON();

		json.target = this.target.toArray( new Array() );
		json.deceleration = this.deceleration;

		return json;

	}

	/**
	* Restores this instance from the given JSON object.
	*
	* @param {Object} json - The JSON object.
	* @return {ArriveBehavior} A reference to this behavior.
	*/
	fromJSON( json ) {

		super.fromJSON( json );

		this.target.fromArray( json.target );
		this.deceleration = json.deceleration;

		return this;

	}

}

const desiredVelocity$1 = new Vector3();

/**
* This steering behavior produces a force that directs an agent toward a target position.
*
* @author {@link https://github.com/Mugen87|Mugen87}
* @augments SteeringBehavior
*/
class SeekBehavior extends SteeringBehavior {

	/**
	* Constructs a new seek behavior.
	*
	* @param {Vector3} target - The target vector.
	*/
	constructor( target = new Vector3() ) {

		super();

		/**
		* The target vector.
		* @type {Vector3}
		*/
		this.target = target;

	}

	/**
	* Calculates the steering force for a single simulation step.
	*
	* @param {Vehicle} vehicle - The game entity the force is produced for.
	* @param {Vector3} force - The force/result vector.
	* @param {Number} delta - The time delta.
	* @return {Vector3} The force/result vector.
	*/
	calculate( vehicle, force /*, delta */ ) {

		const target = this.target;

		// First the desired velocity is calculated.
		// This is the velocity the agent would need to reach the target position in an ideal world.
		// It represents the vector from the agent to the target,
		// scaled to be the length of the maximum possible speed of the agent.

		desiredVelocity$1.subVectors( target, vehicle.position ).normalize();
		desiredVelocity$1.multiplyScalar( vehicle.maxSpeed );

		// The steering force returned by this method is the force required,
		// which when added to the agent’s current velocity vector gives the desired velocity.
		// To achieve this you simply subtract the agent’s current velocity from the desired velocity.

		return force.subVectors( desiredVelocity$1, vehicle.velocity );

	}

	/**
	* Transforms this instance into a JSON object.
	*
	* @return {Object} The JSON object.
	*/
	toJSON() {

		const json = super.toJSON();

		json.target = this.target.toArray( new Array() );

		return json;

	}

	/**
	* Restores this instance from the given JSON object.
	*
	* @param {Object} json - The JSON object.
	* @return {SeekBehavior} A reference to this behavior.
	*/
	fromJSON( json ) {

		super.fromJSON( json );

		this.target.fromArray( json.target );

		return this;

	}

}

const centerOfMass = new Vector3();

/**
* This steering produces a steering force that moves a vehicle toward the center of mass of its neighbors.
*
* @author {@link https://github.com/Mugen87|Mugen87}
* @augments SteeringBehavior
*/
class CohesionBehavior extends SteeringBehavior {

	/**
	* Constructs a new cohesion behavior.
	*/
	constructor() {

		super();

		// internal behaviors

		this._seek = new SeekBehavior();

	}

	/**
	* Calculates the steering force for a single simulation step.
	*
	* @param {Vehicle} vehicle - The game entity the force is produced for.
	* @param {Vector3} force - The force/result vector.
	* @param {Number} delta - The time delta.
	* @return {Vector3} The force/result vector.
	*/
	calculate( vehicle, force /*, delta */ ) {

		centerOfMass.set( 0, 0, 0 );

		const neighbors = vehicle.neighbors;

		// iterate over all neighbors to calculate the center of mass

		for ( let i = 0, l = neighbors.length; i < l; i ++ ) {

			const neighbor = neighbors[ i ];

			centerOfMass.add( neighbor.position );

		}

		if ( neighbors.length > 0 ) {

			centerOfMass.divideScalar( neighbors.length );

			// seek to it

			this._seek.target = centerOfMass;
			this._seek.calculate( vehicle, force );

			// the magnitude of cohesion is usually much larger than separation
			// or alignment so it usually helps to normalize it

			force.normalize();

		}

		return force;

	}

}

const desiredVelocity = new Vector3();

/**
* This steering behavior produces a force that steers an agent away from a target position.
* It's the opposite of {@link SeekBehavior}.
*
* @author {@link https://github.com/Mugen87|Mugen87}
* @augments SteeringBehavior
*/
class FleeBehavior extends SteeringBehavior {

	/**
	* Constructs a new flee behavior.
	*
	* @param {Vector3} target - The target vector.
	* @param {Number} panicDistance - The agent only flees from the target if it is inside this radius.
	*/
	constructor( target = new Vector3(), panicDistance = 10 ) {

		super();

		/**
		* The target vector.
		* @type {Vector3}
		*/
		this.target = target;

		/**
		* The agent only flees from the target if it is inside this radius.
		* @type {Number}
		* @default 10
		*/
		this.panicDistance = panicDistance;

	}

	/**
	* Calculates the steering force for a single simulation step.
	*
	* @param {Vehicle} vehicle - The game entity the force is produced for.
	* @param {Vector3} force - The force/result vector.
	* @param {Number} delta - The time delta.
	* @return {Vector3} The force/result vector.
	*/
	calculate( vehicle, force /*, delta */ ) {

		const target = this.target;

		// only flee if the target is within panic distance

		const distanceToTargetSq = vehicle.position.squaredDistanceTo( target );

		if ( distanceToTargetSq <= ( this.panicDistance * this.panicDistance ) ) {

			// from here, the only difference compared to seek is that the desired
			// velocity is calculated using a vector pointing in the opposite direction

			desiredVelocity.subVectors( vehicle.position, target ).normalize();

			// if target and vehicle position are identical, choose default velocity

			if ( desiredVelocity.squaredLength() === 0 ) {

				desiredVelocity.set( 0, 0, 1 );

			}

			desiredVelocity.multiplyScalar( vehicle.maxSpeed );

			force.subVectors( desiredVelocity, vehicle.velocity );

		}

		return force;

	}

	/**
	* Transforms this instance into a JSON object.
	*
	* @return {Object} The JSON object.
	*/
	toJSON() {

		const json = super.toJSON();

		json.target = this.target.toArray( new Array() );
		json.panicDistance = this.panicDistance;

		return json;

	}

	/**
	* Restores this instance from the given JSON object.
	*
	* @param {Object} json - The JSON object.
	* @return {FleeBehavior} A reference to this behavior.
	*/
	fromJSON( json ) {

		super.fromJSON( json );

		this.target.fromArray( json.target );
		this.panicDistance = json.panicDistance;

		return this;

	}

}

const displacement$2 = new Vector3();
const newPursuerVelocity = new Vector3();
const predictedPosition$3 = new Vector3();

/**
* This steering behavior is is almost the same as {@link PursuitBehavior} except that
* the agent flees from the estimated future position of the pursuer.
*
* @author {@link https://github.com/Mugen87|Mugen87}
* @augments SteeringBehavior
*/
class EvadeBehavior extends SteeringBehavior {

	/**
	* Constructs a new evade behavior.
	*
	* @param {MovingEntity} pursuer - The agent to evade from.
	* @param {Number} panicDistance - The agent only flees from the pursuer if it is inside this radius.
	* @param {Number} predictionFactor - This factor determines how far the vehicle predicts the movement of the pursuer.
	*/
	constructor( pursuer = null, panicDistance = 10, predictionFactor = 1 ) {

		super();

		/**
		* The agent to evade from.
		* @type {?MovingEntity}
		* @default null
		*/
		this.pursuer = pursuer;

		/**
		* The agent only flees from the pursuer if it is inside this radius.
		* @type {Number}
		* @default 10
		*/
		this.panicDistance = panicDistance;

		/**
		* This factor determines how far the vehicle predicts the movement of the pursuer.
		* @type {Number}
		* @default 1
		*/
		this.predictionFactor = predictionFactor;

		// internal behaviors

		this._flee = new FleeBehavior();

	}

	/**
	* Calculates the steering force for a single simulation step.
	*
	* @param {Vehicle} vehicle - The game entity the force is produced for.
	* @param {Vector3} force - The force/result vector.
	* @param {Number} delta - The time delta.
	* @return {Vector3} The force/result vector.
	*/
	calculate( vehicle, force /*, delta */ ) {

		const pursuer = this.pursuer;

		displacement$2.subVectors( pursuer.position, vehicle.position );

		let lookAheadTime = displacement$2.length() / ( vehicle.maxSpeed + pursuer.getSpeed() );
		lookAheadTime *= this.predictionFactor; // tweak the magnitude of the prediction

		// calculate new velocity and predicted future position

		newPursuerVelocity.copy( pursuer.velocity ).multiplyScalar( lookAheadTime );
		predictedPosition$3.addVectors( pursuer.position, newPursuerVelocity );

		// now flee away from predicted future position of the pursuer

		this._flee.target = predictedPosition$3;
		this._flee.panicDistance = this.panicDistance;
		this._flee.calculate( vehicle, force );

		return force;

	}

	/**
	* Transforms this instance into a JSON object.
	*
	* @return {Object} The JSON object.
	*/
	toJSON() {

		const json = super.toJSON();

		json.pursuer = this.pursuer ? this.pursuer.uuid : null;
		json.panicDistance = this.panicDistance;
		json.predictionFactor = this.predictionFactor;

		return json;

	}

	/**
	* Restores this instance from the given JSON object.
	*
	* @param {Object} json - The JSON object.
	* @return {EvadeBehavior} A reference to this behavior.
	*/
	fromJSON( json ) {

		super.fromJSON( json );

		this.pursuer = json.pursuer;
		this.panicDistance = json.panicDistance;
		this.predictionFactor = json.predictionFactor;

		return this;

	}

	/**
	* Restores UUIDs with references to GameEntity objects.
	*
	* @param {Map<String,GameEntity>} entities - Maps game entities to UUIDs.
	* @return {EvadeBehavior} A reference to this behavior.
	*/
	resolveReferences( entities ) {

		this.pursuer = entities.get( this.pursuer ) || null;

	}

}

/**
* Class for representing a walkable path.
*
* @author {@link https://github.com/Mugen87|Mugen87}
*/
class Path {

	/**
	* Constructs a new path.
	*/
	constructor() {

		/**
		* Whether this path is looped or not.
		* @type {Boolean}
		*/
		this.loop = false;

		this._waypoints = new Array();
		this._index = 0;

	}

	/**
	* Adds the given waypoint to this path.
	*
	* @param {Vector3} waypoint - The waypoint to add.
	* @return {Path} A reference to this path.
	*/
	add( waypoint ) {

		this._waypoints.push( waypoint );

		return this;

	}

	/**
	* Clears the internal state of this path.
	*
	* @return {Path} A reference to this path.
	*/
	clear() {

		this._waypoints.length = 0;
		this._index = 0;

		return this;

	}

	/**
	* Returns the current active waypoint of this path.
	*
	* @return {Vector3} The current active waypoint.
	*/
	current() {

		return this._waypoints[ this._index ];

	}

	/**
	* Returns true if this path is not looped and the last waypoint is active.
	*
	* @return {Boolean} Whether this path is finished or not.
	*/
	finished() {

		const lastIndex = this._waypoints.length - 1;

		return ( this.loop === true ) ? false : ( this._index === lastIndex );

	}

	/**
	* Makes the next waypoint of this path active. If the path is looped and
	* {@link Path#finished} returns true, the path starts from the beginning.
	*
	* @return {Path} A reference to this path.
	*/
	advance() {

		this._index ++;

		if ( ( this._index === this._waypoints.length ) ) {

			if ( this.loop === true ) {

				this._index = 0;

			} else {

				this._index --;

			}

		}

		return this;

	}

	/**
	* Transforms this instance into a JSON object.
	*
	* @return {Object} The JSON object.
	*/
	toJSON() {

		const data = {
			type: this.constructor.name,
			loop: this.loop,
			_waypoints: new Array(),
			_index: this._index
		};

		// waypoints

		const waypoints = this._waypoints;

		for ( let i = 0, l = waypoints.length; i < l; i ++ ) {

			const waypoint = waypoints[ i ];
			data._waypoints.push( waypoint.toArray( new Array() ) );

		}

		return data;

	}

	/**
	* Restores this instance from the given JSON object.
	*
	* @param {Object} json - The JSON object.
	* @return {Path} A reference to this path.
	*/
	fromJSON( json ) {

		this.loop = json.loop;
		this._index = json._index;

		// waypoints

		const waypointsJSON = json._waypoints;

		for ( let i = 0, l = waypointsJSON.length; i < l; i ++ ) {

			const waypointJSON = waypointsJSON[ i ];
			this._waypoints.push( new Vector3().fromArray( waypointJSON ) );

		}

		return this;

	}

}

/**
* This steering behavior produces a force that moves a vehicle along a series of waypoints forming a path.
*
* @author {@link https://github.com/Mugen87|Mugen87}
* @augments SteeringBehavior
*/
class FollowPathBehavior extends SteeringBehavior {

	/**
	* Constructs a new follow path behavior.
	*
	* @param {Path} path - The path to follow.
	* @param {Number} nextWaypointDistance - The distance the agent seeks for the next waypoint.
	*/
	constructor( path = new Path(), nextWaypointDistance = 1 ) {

		super();

		/**
		* The path to follow.
		* @type {Path}
		*/
		this.path = path;

		/**
		* The distance the agent seeks for the next waypoint.
		* @type {Number}
		* @default 1
		*/
		this.nextWaypointDistance = nextWaypointDistance;

		// internal behaviors

		this._arrive = new ArriveBehavior();
		this._seek = new SeekBehavior();

	}

	/**
	* Calculates the steering force for a single simulation step.
	*
	* @param {Vehicle} vehicle - The game entity the force is produced for.
	* @param {Vector3} force - The force/result vector.
	* @param {Number} delta - The time delta.
	* @return {Vector3} The force/result vector.
	*/
	calculate( vehicle, force /*, delta */ ) {

		const path = this.path;

		// calculate distance in square space from current waypoint to vehicle

		const distanceSq = path.current().squaredDistanceTo( vehicle.position );

		// move to next waypoint if close enough to current target

		if ( distanceSq < ( this.nextWaypointDistance * this.nextWaypointDistance ) ) {

			path.advance();

		}

		const target = path.current();

		if ( path.finished() === true ) {

			this._arrive.target = target;
			this._arrive.calculate( vehicle, force );

		} else {

			this._seek.target = target;
			this._seek.calculate( vehicle, force );

		}

		return force;

	}

	/**
	* Transforms this instance into a JSON object.
	*
	* @return {Object} The JSON object.
	*/
	toJSON() {

		const json = super.toJSON();

		json.path = this.path.toJSON();
		json.nextWaypointDistance = this.nextWaypointDistance;

		return json;

	}

	/**
	* Restores this instance from the given JSON object.
	*
	* @param {Object} json - The JSON object.
	* @return {FollowPathBehavior} A reference to this behavior.
	*/
	fromJSON( json ) {

		super.fromJSON( json );

		this.path.fromJSON( json.path );
		this.nextWaypointDistance = json.nextWaypointDistance;

		return this;

	}

}

const midPoint = new Vector3();
const translation$1 = new Vector3();
const predictedPosition1 = new Vector3();
const predictedPosition2 = new Vector3();

/**
* This steering behavior produces a force that moves a vehicle to the midpoint
* of the imaginary line connecting two other agents.
*
* @author {@link https://github.com/Mugen87|Mugen87}
* @augments SteeringBehavior
*/
class InterposeBehavior extends SteeringBehavior {

	/**
	* Constructs a new interpose behavior.
	*
	* @param {MovingEntity} entity1 - The first agent.
	* @param {MovingEntity} entity2 - The second agent.
	* @param {Number} deceleration - The amount of deceleration.
	*/
	constructor( entity1 = null, entity2 = null, deceleration = 3 ) {

		super();

		/**
		* The first agent.
		* @type {?MovingEntity}
		* @default null
		*/
		this.entity1 = entity1;

		/**
		* The second agent.
		* @type {?MovingEntity}
		* @default null
		*/
		this.entity2 = entity2;

		/**
		* The amount of deceleration.
		* @type {Number}
		* @default 3
		*/
		this.deceleration = deceleration;

		// internal behaviors

		this._arrive = new ArriveBehavior();

	}

	/**
	* Calculates the steering force for a single simulation step.
	*
	* @param {Vehicle} vehicle - The game entity the force is produced for.
	* @param {Vector3} force - The force/result vector.
	* @param {Number} delta - The time delta.
	* @return {Vector3} The force/result vector.
	*/
	calculate( vehicle, force /*, delta */ ) {

		const entity1 = this.entity1;
		const entity2 = this.entity2;

		// first we need to figure out where the two entities are going to be
		// in the future. This is approximated by determining the time
		// taken to reach the mid way point at the current time at max speed

		midPoint.addVectors( entity1.position, entity2.position ).multiplyScalar( 0.5 );
		const time = vehicle.position.distanceTo( midPoint ) / vehicle.maxSpeed;

		// now we have the time, we assume that entity 1 and entity 2 will
		// continue on a straight trajectory and extrapolate to get their future positions

		translation$1.copy( entity1.velocity ).multiplyScalar( time );
		predictedPosition1.addVectors( entity1.position, translation$1 );

		translation$1.copy( entity2.velocity ).multiplyScalar( time );
		predictedPosition2.addVectors( entity2.position, translation$1 );

		// calculate the mid point of these predicted positions

		midPoint.addVectors( predictedPosition1, predictedPosition2 ).multiplyScalar( 0.5 );

		// then steer to arrive at it

		this._arrive.deceleration = this.deceleration;
		this._arrive.target = midPoint;
		this._arrive.calculate( vehicle, force );

		return force;

	}

	/**
	* Transforms this instance into a JSON object.
	*
	* @return {Object} The JSON object.
	*/
	toJSON() {

		const json = super.toJSON();

		json.entity1 = this.entity1 ? this.entity1.uuid : null;
		json.entity2 = this.entity2 ? this.entity2.uuid : null;
		json.deceleration = this.deceleration;

		return json;

	}

	/**
	* Restores this instance from the given JSON object.
	*
	* @param {Object} json - The JSON object.
	* @return {InterposeBehavior} A reference to this behavior.
	*/
	fromJSON( json ) {

		super.fromJSON( json );

		this.entity1 = json.entity1;
		this.entity2 = json.entity2;
		this.deceleration = json.deceleration;

		return this;

	}

	/**
	* Restores UUIDs with references to GameEntity objects.
	*
	* @param {Map<String,GameEntity>} entities - Maps game entities to UUIDs.
	* @return {InterposeBehavior} A reference to this behavior.
	*/
	resolveReferences( entities ) {

		this.entity1 = entities.get( this.entity1 ) || null;
		this.entity2 = entities.get( this.entity2 ) || null;

	}

}

const vector = new Vector3();
const center$1 = new Vector3();
const size$1 = new Vector3();

const points = [
	new Vector3(),
	new Vector3(),
	new Vector3(),
	new Vector3(),
	new Vector3(),
	new Vector3(),
	new Vector3(),
	new Vector3()
];

/**
* Class representing an axis-aligned bounding box (AABB).
*
* @author {@link https://github.com/Mugen87|Mugen87}
*/
class AABB {

	/**
	* Constructs a new AABB with the given values.
	*
	* @param {Vector3} min - The minimum bounds of the AABB.
	* @param {Vector3} max - The maximum bounds of the AABB.
	*/
	constructor( min = new Vector3(), max = new Vector3() ) {

		/**
		* The minimum bounds of the AABB.
		* @type {Vector3}
		*/
		this.min = min;

		/**
		* The maximum bounds of the AABB.
		* @type {Vector3}
		*/
		this.max = max;

	}

	/**
	* Sets the given values to this AABB.
	*
	* @param {Vector3} min - The minimum bounds of the AABB.
	* @param {Vector3} max - The maximum bounds of the AABB.
	* @return {AABB} A reference to this AABB.
	*/
	set( min, max ) {

		this.min = min;
		this.max = max;

		return this;

	}

	/**
	* Copies all values from the given AABB to this AABB.
	*
	* @param {AABB} aabb - The AABB to copy.
	* @return {AABB} A reference to this AABB.
	*/
	copy( aabb ) {

		this.min.copy( aabb.min );
		this.max.copy( aabb.max );

		return this;

	}

	/**
	* Creates a new AABB and copies all values from this AABB.
	*
	* @return {AABB} A new AABB.
	*/
	clone() {

		return new this.constructor().copy( this );

	}

	/**
	* Ensures the given point is inside this AABB and stores
	* the result in the given vector.
	*
	* @param {Vector3} point - A point in 3D space.
	* @param {Vector3} result - The result vector.
	* @return {Vector3} The result vector.
	*/
	clampPoint( point, result ) {

		result.copy( point ).clamp( this.min, this.max );

		return result;

	}

	/**
	* Returns true if the given point is inside this AABB.
	*
	* @param {Vector3} point - A point in 3D space.
	* @return {Boolean} The result of the containments test.
	*/
	containsPoint( point ) {

		return point.x < this.min.x || point.x > this.max.x ||
			point.y < this.min.y || point.y > this.max.y ||
			point.z < this.min.z || point.z > this.max.z ? false : true;

	}

	/**
	* Expands this AABB by the given point. So after this method call,
	* the given point lies inside the AABB.
	*
	* @param {Vector3} point - A point in 3D space.
	* @return {AABB} A reference to this AABB.
	*/
	expand( point ) {

		this.min.min( point );
		this.max.max( point );

		return this;

	}

	/**
	* Computes the center point of this AABB and stores it into the given vector.
	*
	* @param {Vector3} result - The result vector.
	* @return {Vector3} The result vector.
	*/
	getCenter( result ) {

		return result.addVectors( this.min, this.max ).multiplyScalar( 0.5 );

	}

	/**
	* Computes the size (width, height, depth) of this AABB and stores it into the given vector.
	*
	* @param {Vector3} result - The result vector.
	* @return {Vector3} The result vector.
	*/
	getSize( result ) {

		return result.subVectors( this.max, this.min );

	}

	/**
	* Returns true if the given AABB intersects this AABB.
	*
	* @param {AABB} aabb - The AABB to test.
	* @return {Boolean} The result of the intersection test.
	*/
	intersectsAABB( aabb ) {

		return aabb.max.x < this.min.x || aabb.min.x > this.max.x ||
			aabb.max.y < this.min.y || aabb.min.y > this.max.y ||
			aabb.max.z < this.min.z || aabb.min.z > this.max.z ? false : true;

	}

	/**
	* Returns true if the given bounding sphere intersects this AABB.
	*
	* @param {BoundingSphere} sphere - The bounding sphere to test.
	* @return {Boolean} The result of the intersection test.
	*/
	intersectsBoundingSphere( sphere ) {

		// find the point on the AABB closest to the sphere center

		this.clampPoint( sphere.center, vector );

		// if that point is inside the sphere, the AABB and sphere intersect.

		return vector.squaredDistanceTo( sphere.center ) <= ( sphere.radius * sphere.radius );

	}

	/**
	* Returns true if the given plane intersects this AABB.
	*
	* Reference: Testing Box Against Plane in Real-Time Collision Detection
	* by Christer Ericson (chapter 5.2.3)
	*
	* @param {Plane} plane - The plane to test.
	* @return {Boolean} The result of the intersection test.
	*/
	intersectsPlane( plane ) {

		const normal = plane.normal;

		this.getCenter( center$1 );
		size$1.subVectors( this.max, center$1 ); // positive extends

		// compute the projection interval radius of b onto L(t) = c + t * plane.normal

		const r = size$1.x * Math.abs( normal.x ) + size$1.y * Math.abs( normal.y ) + size$1.z * Math.abs( normal.z );

		// compute distance of box center from plane

		const s = plane.distanceToPoint( center$1 );

		return Math.abs( s ) <= r;

	}

	/**
	* Returns the normal for a given point on this AABB's surface.
	*
	* @param {Vector3} point - The point on the surface
	* @param {Vector3} result - The result vector.
	* @return {Vector3} The result vector.
	*/
	getNormalFromSurfacePoint( point, result ) {

		// from https://www.gamedev.net/forums/topic/551816-finding-the-aabb-surface-normal-from-an-intersection-point-on-aabb/

		result.set( 0, 0, 0 );

		let distance;
		let minDistance = Infinity;

		this.getCenter( center$1 );
		this.getSize( size$1 );

		// transform point into local space of AABB

		vector.copy( point ).sub( center$1 );

		// x-axis

		distance = Math.abs( size$1.x - Math.abs( vector.x ) );

		if ( distance < minDistance ) {

			minDistance = distance;
			result.set( 1 * Math.sign( vector.x ), 0, 0 );

		}

		// y-axis

		distance = Math.abs( size$1.y - Math.abs( vector.y ) );

		if ( distance < minDistance ) {

			minDistance = distance;
			result.set( 0, 1 * Math.sign( vector.y ), 0 );

		}

		// z-axis

		distance = Math.abs( size$1.z - Math.abs( vector.z ) );

		if ( distance < minDistance ) {

			result.set( 0, 0, 1 * Math.sign( vector.z ) );

		}

		return result;

	}

	/**
	* Sets the values of the AABB from the given center and size vector.
	*
	* @param {Vector3} center - The center point of the AABB.
	* @param {Vector3} size - The size of the AABB per axis.
	* @return {AABB} A reference to this AABB.
	*/
	fromCenterAndSize( center, size ) {

		vector.copy( size ).multiplyScalar( 0.5 ); // compute half size

		this.min.copy( center ).sub( vector );
		this.max.copy( center ).add( vector );

		return this;

	}

	/**
	* Computes an AABB that encloses the given set of points.
	*
	* @param {Array<Vector3>} points - An array of 3D vectors representing points in 3D space.
	* @return {AABB} A reference to this AABB.
	*/
	fromPoints( points ) {

		this.min.set( Infinity, Infinity, Infinity );
		this.max.set( - Infinity, - Infinity, - Infinity );

		for ( let i = 0, l = points.length; i < l; i ++ ) {

			this.expand( points[ i ] );

		}

		return this;

	}

	/**
	* Transforms this AABB with the given 4x4 transformation matrix.
	*
	* @param {Matrix4} matrix - The 4x4 transformation matrix.
	* @return {AABB} A reference to this AABB.
	*/
	applyMatrix4( matrix ) {

		const min = this.min;
		const max = this.max;

		points[ 0 ].set( min.x, min.y, min.z ).applyMatrix4( matrix );
		points[ 1 ].set( min.x, min.y, max.z ).applyMatrix4( matrix );
		points[ 2 ].set( min.x, max.y, min.z ).applyMatrix4( matrix );
		points[ 3 ].set( min.x, max.y, max.z ).applyMatrix4( matrix );
		points[ 4 ].set( max.x, min.y, min.z ).applyMatrix4( matrix );
		points[ 5 ].set( max.x, min.y, max.z ).applyMatrix4( matrix );
		points[ 6 ].set( max.x, max.y, min.z ).applyMatrix4( matrix );
		points[ 7 ].set( max.x, max.y, max.z ).applyMatrix4( matrix );

		return this.fromPoints( points );

	}

	/**
	* Returns true if the given AABB is deep equal with this AABB.
	*
	* @param {AABB} aabb - The AABB to test.
	* @return {Boolean} The result of the equality test.
	*/
	equals( aabb ) {

		return ( aabb.min.equals( this.min ) ) && ( aabb.max.equals( this.max ) );

	}

	/**
	* Transforms this instance into a JSON object.
	*
	* @return {Object} The JSON object.
	*/
	toJSON() {

		return {
			type: this.constructor.name,
			min: this.min.toArray( new Array() ),
			max: this.max.toArray( new Array() )
		};

	}

	/**
	* Restores this instance from the given JSON object.
	*
	* @param {Object} json - The JSON object.
	* @return {AABB} A reference to this AABB.
	*/
	fromJSON( json ) {

		this.min.fromArray( json.min );
		this.max.fromArray( json.max );

		return this;

	}

}

const aabb$2 = new AABB();

/**
* Class representing a bounding sphere.
*
* @author {@link https://github.com/Mugen87|Mugen87}
*/
class BoundingSphere {

	/**
	* Constructs a new bounding sphere with the given values.
	*
	* @param {Vector3} center - The center position of the bounding sphere.
	* @param {Number} radius - The radius of the bounding sphere.
	*/
	constructor( center = new Vector3(), radius = 0 ) {

		/**
		* The center position of the bounding sphere.
		* @type {Vector3}
		*/
		this.center = center;

		/**
		* The radius of the bounding sphere.
		* @type {Number}
		*/
		this.radius = radius;

	}

	/**
	* Sets the given values to this bounding sphere.
	*
	* @param {Vector3} center - The center position of the bounding sphere.
	* @param {Number} radius - The radius of the bounding sphere.
	* @return {BoundingSphere} A reference to this bounding sphere.
	*/
	set( center, radius ) {

		this.center = center;
		this.radius = radius;

		return this;

	}

	/**
	* Copies all values from the given bounding sphere to this bounding sphere.
	*
	* @param {BoundingSphere} sphere - The bounding sphere to copy.
	* @return {BoundingSphere} A reference to this bounding sphere.
	*/
	copy( sphere ) {

		this.center.copy( sphere.center );
		this.radius = sphere.radius;

		return this;

	}

	/**
	* Creates a new bounding sphere and copies all values from this bounding sphere.
	*
	* @return {BoundingSphere} A new bounding sphere.
	*/
	clone() {

		return new this.constructor().copy( this );

	}

	/**
	* Ensures the given point is inside this bounding sphere and stores
	* the result in the given vector.
	*
	* @param {Vector3} point - A point in 3D space.
	* @param {Vector3} result - The result vector.
	* @return {Vector3} The result vector.
	*/
	clampPoint( point, result ) {

		result.copy( point );

		const squaredDistance = this.center.squaredDistanceTo( point );

		if ( squaredDistance > ( this.radius * this.radius ) ) {

			result.sub( this.center ).normalize();
			result.multiplyScalar( this.radius ).add( this.center );

		}

		return result;

	}

	/**
	* Returns true if the given point is inside this bounding sphere.
	*
	* @param {Vector3} point - A point in 3D space.
	* @return {Boolean} The result of the containments test.
	*/
	containsPoint( point ) {

		return ( point.squaredDistanceTo( this.center ) <= ( this.radius * this.radius ) );

	}

	/**
	* Returns true if the given bounding sphere intersects this bounding sphere.
	*
	* @param {BoundingSphere} sphere - The bounding sphere to test.
	* @return {Boolean} The result of the intersection test.
	*/
	intersectsBoundingSphere( sphere ) {

		const radius = this.radius + sphere.radius;

		return ( sphere.center.squaredDistanceTo( this.center ) <= ( radius * radius ) );

	}

	/**
	* Returns true if the given plane intersects this bounding sphere.
	*
	* Reference: Testing Sphere Against Plane in Real-Time Collision Detection
	* by Christer Ericson (chapter 5.2.2)
	*
	* @param {Plane} plane - The plane to test.
	* @return {Boolean} The result of the intersection test.
	*/
	intersectsPlane( plane ) {

		return Math.abs( plane.distanceToPoint( this.center ) ) <= this.radius;

	}

	/**
	* Returns the normal for a given point on this bounding sphere's surface.
	*
	* @param {Vector3} point - The point on the surface
	* @param {Vector3} result - The result vector.
	* @return {Vector3} The result vector.
	*/
	getNormalFromSurfacePoint( point, result ) {

		return result.subVectors( point, this.center ).normalize();

	}

	/**
	* Computes a bounding sphere that encloses the given set of points.
	*
	* @param {Array<Vector3>} points - An array of 3D vectors representing points in 3D space.
	* @return {BoundingSphere} A reference to this bounding sphere.
	*/
	fromPoints( points ) {

		// Using an AABB is a simple way to compute a bounding sphere for a given set
		// of points. However, there are other more complex algorithms that produce a
		// more tight bounding sphere. For now, this approach is a good start.

		aabb$2.fromPoints( points );

		aabb$2.getCenter( this.center );
		this.radius = this.center.distanceTo( aabb$2.max );

		return this;

	}

	/**
	* Transforms this bounding sphere with the given 4x4 transformation matrix.
	*
	* @param {Matrix4} matrix - The 4x4 transformation matrix.
	* @return {BoundingSphere} A reference to this bounding sphere.
	*/
	applyMatrix4( matrix ) {

		this.center.applyMatrix4( matrix );
		this.radius = this.radius * matrix.getMaxScale();

		return this;

	}

	/**
	* Returns true if the given bounding sphere is deep equal with this bounding sphere.
	*
	* @param {BoundingSphere} sphere - The bounding sphere to test.
	* @return {Boolean} The result of the equality test.
	*/
	equals( sphere ) {

		return ( sphere.center.equals( this.center ) ) && ( sphere.radius === this.radius );

	}

	/**
	* Transforms this instance into a JSON object.
	*
	* @return {Object} The JSON object.
	*/
	toJSON() {

		return {
			type: this.constructor.name,
			center: this.center.toArray( new Array() ),
			radius: this.radius
		};

	}

	/**
	* Restores this instance from the given JSON object.
	*
	* @param {Object} json - The JSON object.
	* @return {BoundingSphere} A reference to this bounding sphere.
	*/
	fromJSON( json ) {

		this.center.fromArray( json.center );
		this.radius = json.radius;

		return this;

	}

}

const v1$3 = new Vector3();
const edge1 = new Vector3();
const edge2 = new Vector3();
const normal$1 = new Vector3();
const size = new Vector3();
const matrix = new Matrix4();
const inverse$1 = new Matrix4();
const aabb$1 = new AABB();

/**
* Class representing a ray in 3D space.
*
* @author {@link https://github.com/Mugen87|Mugen87}
*/
class Ray {

	/**
	* Constructs a new ray with the given values.
	*
	* @param {Vector3} origin - The origin of the ray.
	* @param {Vector3} direction - The direction of the ray.
	*/
	constructor( origin = new Vector3(), direction = new Vector3() ) {

		/**
		* The origin of the ray.
		* @type {Vector3}
		*/
		this.origin = origin;

		/**
		* The direction of the ray.
		* @type {Vector3}
		*/
		this.direction = direction;

	}

	/**
	* Sets the given values to this ray.
	*
	* @param {Vector3} origin - The origin of the ray.
	* @param {Vector3} direction - The direction of the ray.
	* @return {Ray} A reference to this ray.
	*/
	set( origin, direction ) {

		this.origin = origin;
		this.direction = direction;

		return this;

	}

	/**
	* Copies all values from the given ray to this ray.
	*
	* @param {Ray} ray - The ray to copy.
	* @return {Ray} A reference to this ray.
	*/
	copy( ray ) {

		this.origin.copy( ray.origin );
		this.direction.copy( ray.direction );

		return this;

	}

	/**
	* Creates a new ray and copies all values from this ray.
	*
	* @return {Ray} A new ray.
	*/
	clone() {

		return new this.constructor().copy( this );

	}

	/**
	* Computes a position on the ray according to the given t value
	* and stores the result in the given 3D vector. The t value has a range of
	* [0, Infinity] where 0 means the position is equal with the origin of the ray.
	*
	* @param {Number} t - A scalar value representing a position on the ray.
	* @param {Vector3} result - The result vector.
	* @return {Vector3} The result vector.
	*/
	at( t, result ) {

		// t has to be zero or positive
		return result.copy( this.direction ).multiplyScalar( t ).add( this.origin );

	}

	/**
	* Performs a ray/sphere intersection test and stores the intersection point
	* to the given 3D vector. If no intersection is detected, *null* is returned.
	*
	* @param {BoundingSphere} sphere - A bounding sphere.
	* @param {Vector3} result - The result vector.
	* @return {Vector3} The result vector.
	*/
	intersectBoundingSphere( sphere, result ) {

		v1$3.subVectors( sphere.center, this.origin );
		const tca = v1$3.dot( this.direction );
		const d2 = v1$3.dot( v1$3 ) - tca * tca;
		const radius2 = sphere.radius * sphere.radius;

		if ( d2 > radius2 ) return null;

		const thc = Math.sqrt( radius2 - d2 );

		// t0 = first intersect point - entrance on front of sphere

		const t0 = tca - thc;

		// t1 = second intersect point - exit point on back of sphere

		const t1 = tca + thc;

		// test to see if both t0 and t1 are behind the ray - if so, return null

		if ( t0 < 0 && t1 < 0 ) return null;

		// test to see if t0 is behind the ray:
		// if it is, the ray is inside the sphere, so return the second exit point scaled by t1,
		// in order to always return an intersect point that is in front of the ray.

		if ( t0 < 0 ) return this.at( t1, result );

		// else t0 is in front of the ray, so return the first collision point scaled by t0

		return this.at( t0, result );

	}

	/**
	* Performs a ray/sphere intersection test. Returns either true or false if
	* there is a intersection or not.
	*
	* @param {BoundingSphere} sphere - A bounding sphere.
	* @return {boolean} Whether there is an intersection or not.
	*/
	intersectsBoundingSphere( sphere ) {

		const v1 = new Vector3();
		let squaredDistanceToPoint;

		const directionDistance = v1.subVectors( sphere.center, this.origin ).dot( this.direction );

		if ( directionDistance < 0 ) {

			// sphere's center behind the ray

			squaredDistanceToPoint = this.origin.squaredDistanceTo( sphere.center );

		} else {

			v1.copy( this.direction ).multiplyScalar( directionDistance ).add( this.origin );

			squaredDistanceToPoint = v1.squaredDistanceTo( sphere.center );

		}


		return squaredDistanceToPoint <= ( sphere.radius * sphere.radius );

	}

	/**
	* Performs a ray/AABB intersection test and stores the intersection point
	* to the given 3D vector. If no intersection is detected, *null* is returned.
	*
	* @param {AABB} aabb - An AABB.
	* @param {Vector3} result - The result vector.
	* @return {Vector3} The result vector.
	*/
	intersectAABB( aabb, result ) {

		let tmin, tmax, tymin, tymax, tzmin, tzmax;

		const invdirx = 1 / this.direction.x,
			invdiry = 1 / this.direction.y,
			invdirz = 1 / this.direction.z;

		const origin = this.origin;

		if ( invdirx >= 0 ) {

			tmin = ( aabb.min.x - origin.x ) * invdirx;
			tmax = ( aabb.max.x - origin.x ) * invdirx;

		} else {

			tmin = ( aabb.max.x - origin.x ) * invdirx;
			tmax = ( aabb.min.x - origin.x ) * invdirx;

		}

		if ( invdiry >= 0 ) {

			tymin = ( aabb.min.y - origin.y ) * invdiry;
			tymax = ( aabb.max.y - origin.y ) * invdiry;

		} else {

			tymin = ( aabb.max.y - origin.y ) * invdiry;
			tymax = ( aabb.min.y - origin.y ) * invdiry;

		}

		if ( ( tmin > tymax ) || ( tymin > tmax ) ) return null;

		// these lines also handle the case where tmin or tmax is NaN
		// (result of 0 * Infinity). x !== x returns true if x is NaN

		if ( tymin > tmin || tmin !== tmin ) tmin = tymin;

		if ( tymax < tmax || tmax !== tmax ) tmax = tymax;

		if ( invdirz >= 0 ) {

			tzmin = ( aabb.min.z - origin.z ) * invdirz;
			tzmax = ( aabb.max.z - origin.z ) * invdirz;

		} else {

			tzmin = ( aabb.max.z - origin.z ) * invdirz;
			tzmax = ( aabb.min.z - origin.z ) * invdirz;

		}

		if ( ( tmin > tzmax ) || ( tzmin > tmax ) ) return null;

		if ( tzmin > tmin || tmin !== tmin ) tmin = tzmin;

		if ( tzmax < tmax || tmax !== tmax ) tmax = tzmax;

		// return point closest to the ray (positive side)

		if ( tmax < 0 ) return null;

		return this.at( tmin >= 0 ? tmin : tmax, result );

	}

	/**
	* Performs a ray/AABB intersection test. Returns either true or false if
	* there is a intersection or not.
	*
	* @param {AABB} aabb - An axis-aligned bounding box.
	* @return {boolean} Whether there is an intersection or not.
	*/
	intersectsAABB( aabb ) {

		return this.intersectAABB( aabb, v1$3 ) !== null;

	}

	/**
	* Performs a ray/plane intersection test and stores the intersection point
	* to the given 3D vector. If no intersection is detected, *null* is returned.
	*
	* @param {Plane} plane - A plane.
	* @param {Vector3} result - The result vector.
	* @return {Vector3} The result vector.
	*/
	intersectPlane( plane, result ) {

		let t;

		const denominator = plane.normal.dot( this.direction );

		if ( denominator === 0 ) {

			if ( plane.distanceToPoint( this.origin ) === 0 ) {

				// ray is coplanar

				t = 0;

			} else {

				// ray is parallel, no intersection

				return null;

			}

		} else {

			t = - ( this.origin.dot( plane.normal ) + plane.constant ) / denominator;

		}

		// there is no intersection if t is negative

		return ( t >= 0 ) ? this.at( t, result ) : null;

	}

	/**
	* Performs a ray/plane intersection test. Returns either true or false if
	* there is a intersection or not.
	*
	* @param {Plane} plane - A plane.
	* @return {boolean} Whether there is an intersection or not.
	*/
	intersectsPlane( plane ) {

		// check if the ray lies on the plane first

		const distToPoint = plane.distanceToPoint( this.origin );

		if ( distToPoint === 0 ) {

			return true;

		}

		const denominator = plane.normal.dot( this.direction );

		if ( denominator * distToPoint < 0 ) {

			return true;

		}

		// ray origin is behind the plane (and is pointing behind it)

		return false;

	}

	/**
	* Performs a ray/OBB intersection test and stores the intersection point
	* to the given 3D vector. If no intersection is detected, *null* is returned.
	*
	* @param {OBB} obb - An orientend bounding box.
	* @param {Vector3} result - The result vector.
	* @return {Vector3} The result vector.
	*/
	intersectOBB( obb, result ) {

		// the idea is to perform the intersection test in the local space
		// of the OBB.

		obb.getSize( size );
		aabb$1.fromCenterAndSize( v1$3.set( 0, 0, 0 ), size );

		matrix.fromMatrix3( obb.rotation );
		matrix.setPosition( obb.center );

		// transform ray to the local space of the OBB

		localRay.copy( this ).applyMatrix4( matrix.getInverse( inverse$1 ) );

		// perform ray <-> AABB intersection test

		if ( localRay.intersectAABB( aabb$1, result ) ) {

			// transform the intersection point back to world space

			return result.applyMatrix4( matrix );

		} else {

			return null;

		}

	}

	/**
	* Performs a ray/OBB intersection test. Returns either true or false if
	* there is a intersection or not.
	*
	* @param {OBB} obb - An orientend bounding box.
	* @return {boolean} Whether there is an intersection or not.
	*/
	intersectsOBB( obb ) {

		return this.intersectOBB( obb, v1$3 ) !== null;

	}

	/**
	* Performs a ray/convex hull intersection test and stores the intersection point
	* to the given 3D vector. If no intersection is detected, *null* is returned.
	* The implementation is based on "Fast Ray-Convex Polyhedron Intersection"
	* by Eric Haines, GRAPHICS GEMS II
	*
	* @param {ConvexHull} convexHull - A convex hull.
	* @param {Vector3} result - The result vector.
	* @return {Vector3} The result vector.
	*/
	intersectConvexHull( convexHull, result ) {

		const faces = convexHull.faces;

		let tNear = - Infinity;
		let tFar = Infinity;

		for ( let i = 0, l = faces.length; i < l; i ++ ) {

			const face = faces[ i ];
			const plane = face.plane;

			const vN = plane.distanceToPoint( this.origin );
			const vD = plane.normal.dot( this.direction );

			// if the origin is on the positive side of a plane (so the plane can "see" the origin) and
			// the ray is turned away or parallel to the plane, there is no intersection

			if ( vN > 0 && vD >= 0 ) return null;

			// compute the distance from the ray’s origin to the intersection with the plane

			const t = ( vD !== 0 ) ? ( - vN / vD ) : 0;

			// only proceed if the distance is positive. since the ray has a direction, the intersection point
			// would lie "behind" the origin with a negative distance

			if ( t <= 0 ) continue;

			// now categorized plane as front-facing or back-facing

			if ( vD > 0 ) {

				//  plane faces away from the ray, so this plane is a back-face

				tFar = Math.min( t, tFar );

			} else {

				// front-face

				tNear = Math.max( t, tNear );

			}

			if ( tNear > tFar ) {

				// if tNear ever is greater than tFar, the ray must miss the convex hull

				return null;

			}

		}

		// evaluate intersection point

		// always try tNear first since its the closer intersection point

		if ( tNear !== - Infinity ) {

			this.at( tNear, result );

		} else {

			this.at( tFar, result );

		}

		return result;

	}

	/**
	* Performs a ray/convex hull intersection test. Returns either true or false if
	* there is a intersection or not.
	*
	* @param {ConvexHull} convexHull - A convex hull.
	* @return {boolean} Whether there is an intersection or not.
	*/
	intersectsConvexHull( convexHull ) {

		return this.intersectConvexHull( convexHull, v1$3 ) !== null;

	}

	/**
	* Performs a ray/triangle intersection test and stores the intersection point
	* to the given 3D vector. If no intersection is detected, *null* is returned.
	*
	* @param {Triangle} triangle - A triangle.
	* @param {Boolean} backfaceCulling - Whether back face culling is active or not.
	* @param {Vector3} result - The result vector.
	* @return {Vector3} The result vector.
	*/
	intersectTriangle( triangle, backfaceCulling, result ) {

		// reference: https://www.geometrictools.com/GTEngine/Include/Mathematics/GteIntrRay3Triangle3.h

		const a = triangle.a;
		const b = triangle.b;
		const c = triangle.c;

		edge1.subVectors( b, a );
		edge2.subVectors( c, a );
		normal$1.crossVectors( edge1, edge2 );

		let DdN = this.direction.dot( normal$1 );
		let sign;

		if ( DdN > 0 ) {

			if ( backfaceCulling ) return null;
			sign = 1;

		} else if ( DdN < 0 ) {

			sign = - 1;
			DdN = - DdN;

		} else {

			return null;

		}

		v1$3.subVectors( this.origin, a );
		const DdQxE2 = sign * this.direction.dot( edge2.crossVectors( v1$3, edge2 ) );

		// b1 < 0, no intersection

		if ( DdQxE2 < 0 ) {

			return null;

		}

		const DdE1xQ = sign * this.direction.dot( edge1.cross( v1$3 ) );

		// b2 < 0, no intersection

		if ( DdE1xQ < 0 ) {

			return null;

		}

		// b1 + b2 > 1, no intersection

		if ( DdQxE2 + DdE1xQ > DdN ) {

			return null;

		}

		// line intersects triangle, check if ray does

		const QdN = - sign * v1$3.dot( normal$1 );

		// t < 0, no intersection

		if ( QdN < 0 ) {

			return null;

		}

		// ray intersects triangle

		return this.at( QdN / DdN, result );

	}

	/**
	* Performs a ray/BVH intersection test and stores the intersection point
	* to the given 3D vector. If no intersection is detected, *null* is returned.
	*
	* @param {BVH} bvh - A BVH.
	* @param {Vector3} result - The result vector.
	* @return {Vector3} The result vector.
	*/
	intersectBVH( bvh, result ) {

		return bvh.root.intersectRay( this, result );

	}

	/**
	* Performs a ray/BVH intersection test. Returns either true or false if
	* there is a intersection or not.
	*
	* @param {BVH} bvh - A BVH.
	* @return {boolean} Whether there is an intersection or not.
	*/
	intersectsBVH( bvh ) {

		return bvh.root.intersectsRay( this );

	}

	/**
	* Transforms this ray by the given 4x4 matrix.
	*
	* @param {Matrix4} m - The 4x4 matrix.
	* @return {Ray} A reference to this ray.
	*/
	applyMatrix4( m ) {

		this.origin.applyMatrix4( m );
		this.direction.transformDirection( m );

		return this;

	}

	/**
	* Returns true if the given ray is deep equal with this ray.
	*
	* @param {Ray} ray - The ray to test.
	* @return {Boolean} The result of the equality test.
	*/
	equals( ray ) {

		return ray.origin.equals( this.origin ) && ray.direction.equals( this.direction );

	}

}

const localRay = new Ray();

const inverse = new Matrix4();
const localPositionOfObstacle = new Vector3();
const localPositionOfClosestObstacle = new Vector3();
const intersectionPoint$1 = new Vector3();
const boundingSphere$1 = new BoundingSphere();

const ray$1 = new Ray( new Vector3( 0, 0, 0 ), new Vector3( 0, 0, 1 ) );

/**
* This steering behavior produces a force so a vehicle avoids obstacles lying in its path.
*
* @author {@link https://github.com/Mugen87|Mugen87}
* @author {@link https://github.com/robp94|robp94}
* @augments SteeringBehavior
*/
class ObstacleAvoidanceBehavior extends SteeringBehavior {

	/**
	* Constructs a new obstacle avoidance behavior.
	*
	* @param {Array<GameEntity>} obstacles - An Array with obstacle of type {@link GameEntity}.
	*/
	constructor( obstacles = new Array() ) {

		super();

		/**
		* An Array with obstacle of type {@link GameEntity}.
		* @type {Array<GameEntity>}
		*/
		this.obstacles = obstacles;

		/**
		* This factor determines how much the vehicle decelerates if an intersection occurs.
		* @type {Number}
		* @default 0.2
		*/
		this.brakingWeight = 0.2;

		/**
		* Minimum length of the detection box used for intersection tests.
		* @type {Number}
		* @default 4
		*/
		this.dBoxMinLength = 4; //

	}

	/**
	* Calculates the steering force for a single simulation step.
	*
	* @param {Vehicle} vehicle - The game entity the force is produced for.
	* @param {Vector3} force - The force/result vector.
	* @param {Number} delta - The time delta.
	* @return {Vector3} The force/result vector.
	*/
	calculate( vehicle, force /*, delta */ ) {

		const obstacles = this.obstacles;

		// this will keep track of the closest intersecting obstacle

		let closestObstacle = null;

		// this will be used to track the distance to the closest obstacle

		let distanceToClosestObstacle = Infinity;

		// the detection box length is proportional to the agent's velocity

		const dBoxLength = this.dBoxMinLength + ( vehicle.getSpeed() / vehicle.maxSpeed ) * this.dBoxMinLength;

		vehicle.worldMatrix.getInverse( inverse );

		for ( let i = 0, l = obstacles.length; i < l; i ++ ) {

			const obstacle = obstacles[ i ];

			if ( obstacle === vehicle ) continue;

			// calculate this obstacle's position in local space of the vehicle

			localPositionOfObstacle.copy( obstacle.position ).applyMatrix4( inverse );

			// if the local position has a positive z value then it must lay behind the agent.
			// besides the absolute z value must be smaller than the length of the detection box

			if ( localPositionOfObstacle.z > 0 && Math.abs( localPositionOfObstacle.z ) < dBoxLength ) {

				// if the distance from the x axis to the object's position is less
				// than its radius + half the width of the detection box then there is a potential intersection

				const expandedRadius = obstacle.boundingRadius + vehicle.boundingRadius;

				if ( Math.abs( localPositionOfObstacle.x ) < expandedRadius ) {

					// do intersection test in local space of the vehicle

					boundingSphere$1.center.copy( localPositionOfObstacle );
					boundingSphere$1.radius = expandedRadius;

					ray$1.intersectBoundingSphere( boundingSphere$1, intersectionPoint$1 );

					// compare distances

					if ( intersectionPoint$1.z < distanceToClosestObstacle ) {

						// save new minimum distance

						distanceToClosestObstacle = intersectionPoint$1.z;

						// save closest obstacle

						closestObstacle = obstacle;

						// save local position for force calculation

						localPositionOfClosestObstacle.copy( localPositionOfObstacle );

					}

				}

			}

		}

		// if we have found an intersecting obstacle, calculate a steering force away from it

		if ( closestObstacle !== null ) {

			// the closer the agent is to an object, the stronger the steering force should be

			const multiplier = 1 + ( ( dBoxLength - localPositionOfClosestObstacle.z ) / dBoxLength );

			// calculate the lateral force

			force.x = ( closestObstacle.boundingRadius - localPositionOfClosestObstacle.x ) * multiplier;

			// apply a braking force proportional to the obstacles distance from the vehicle

			force.z = ( closestObstacle.boundingRadius - localPositionOfClosestObstacle.z ) * this.brakingWeight;

			// finally, convert the steering vector from local to world space (just apply the rotation)

			force.applyRotation( vehicle.rotation );

		}

		return force;

	}

	/**
	* Transforms this instance into a JSON object.
	*
	* @return {Object} The JSON object.
	*/
	toJSON() {

		const json = super.toJSON();

		json.obstacles = new Array();
		json.brakingWeight = this.brakingWeight;
		json.dBoxMinLength = this.dBoxMinLength;

		// obstacles

		for ( let i = 0, l = this.obstacles.length; i < l; i ++ ) {

			json.obstacles.push( this.obstacles[ i ].uuid );

		}

		return json;

	}

	/**
	* Restores this instance from the given JSON object.
	*
	* @param {Object} json - The JSON object.
	* @return {ObstacleAvoidanceBehavior} A reference to this behavior.
	*/
	fromJSON( json ) {

		super.fromJSON( json );

		this.obstacles = json.obstacles;
		this.brakingWeight = json.brakingWeight;
		this.dBoxMinLength = json.dBoxMinLength;

		return this;

	}

	/**
	* Restores UUIDs with references to GameEntity objects.
	*
	* @param {Map<String,GameEntity>} entities - Maps game entities to UUIDs.
	* @return {ObstacleAvoidanceBehavior} A reference to this behavior.
	*/
	resolveReferences( entities ) {

		const obstacles = this.obstacles;

		for ( let i = 0, l = obstacles.length; i < l; i ++ ) {

			obstacles[ i ] = entities.get( obstacles[ i ] );

		}


	}

}

const offsetWorld = new Vector3();
const toOffset = new Vector3();
const newLeaderVelocity = new Vector3();
const predictedPosition$2 = new Vector3();

/**
* This steering behavior produces a force that keeps a vehicle at a specified offset from a leader vehicle.
* Useful for creating formations.
*
* @author {@link https://github.com/Mugen87|Mugen87}
* @augments SteeringBehavior
*/
class OffsetPursuitBehavior extends SteeringBehavior {

	/**
	* Constructs a new offset pursuit behavior.
	*
	* @param {Vehicle} leader - The leader vehicle.
	* @param {Vector3} offset - The offset from the leader.
	*/
	constructor( leader = null, offset = new Vector3() ) {

		super();

		/**
		* The leader vehicle.
		* @type {?Vehicle}
		* @default null
		*/
		this.leader = leader;

		/**
		* The offset from the leader.
		* @type {Vector3}
		*/
		this.offset = offset;

		// internal behaviors

		this._arrive = new ArriveBehavior();
		this._arrive.deceleration = 1.5;

	}

	/**
	* Calculates the steering force for a single simulation step.
	*
	* @param {Vehicle} vehicle - The game entity the force is produced for.
	* @param {Vector3} force - The force/result vector.
	* @param {Number} delta - The time delta.
	* @return {Vector3} The force/result vector.
	*/
	calculate( vehicle, force /*, delta */ ) {

		const leader = this.leader;
		const offset = this.offset;

		// calculate the offset's position in world space

		offsetWorld.copy( offset ).applyMatrix4( leader.worldMatrix );

		// calculate the vector that points from the vehicle to the offset position

		toOffset.subVectors( offsetWorld, vehicle.position );

		// the lookahead time is proportional to the distance between the leader
		// and the pursuer and is inversely proportional to the sum of both
		// agent's velocities

		const lookAheadTime = toOffset.length() / ( vehicle.maxSpeed + leader.getSpeed() );

		// calculate new velocity and predicted future position

		newLeaderVelocity.copy( leader.velocity ).multiplyScalar( lookAheadTime );

		predictedPosition$2.addVectors( offsetWorld, newLeaderVelocity );

		// now arrive at the predicted future position of the offset

		this._arrive.target = predictedPosition$2;
		this._arrive.calculate( vehicle, force );

		return force;

	}

	/**
	* Transforms this instance into a JSON object.
	*
	* @return {Object} The JSON object.
	*/
	toJSON() {

		const json = super.toJSON();

		json.leader = this.leader ? this.leader.uuid : null;
		json.offset = this.offset;

		return json;

	}

	/**
	* Restores this instance from the given JSON object.
	*
	* @param {Object} json - The JSON object.
	* @return {OffsetPursuitBehavior} A reference to this behavior.
	*/
	fromJSON( json ) {

		super.fromJSON( json );

		this.leader = json.leader;
		this.offset = json.offset;

		return this;

	}


	/**
	* Restores UUIDs with references to GameEntity objects.
	*
	* @param {Map<String,GameEntity>} entities - Maps game entities to UUIDs.
	* @return {OffsetPursuitBehavior} A reference to this behavior.
	*/
	resolveReferences( entities ) {

		this.leader = entities.get( this.leader ) || null;

	}

}

const displacement$1 = new Vector3();
const vehicleDirection = new Vector3();
const evaderDirection = new Vector3();
const newEvaderVelocity = new Vector3();
const predictedPosition$1 = new Vector3();

/**
* This steering behavior is useful when an agent is required to intercept a moving agent.
*
* @author {@link https://github.com/Mugen87|Mugen87}
* @augments SteeringBehavior
*/
class PursuitBehavior extends SteeringBehavior {

	/**
	* Constructs a new pursuit behavior.
	*
	* @param {MovingEntity} evader - The agent to pursue.
	* @param {Number} predictionFactor - This factor determines how far the vehicle predicts the movement of the evader.
	*/
	constructor( evader = null, predictionFactor = 1 ) {

		super();

		/**
		* The agent to pursue.
		* @type {?MovingEntity}
		* @default null
		*/
		this.evader = evader;

		/**
		* This factor determines how far the vehicle predicts the movement of the evader.
		* @type {Number}
		* @default 1
		*/
		this.predictionFactor = predictionFactor;

		// internal behaviors

		this._seek = new SeekBehavior();

	}

	/**
	* Calculates the steering force for a single simulation step.
	*
	* @param {Vehicle} vehicle - The game entity the force is produced for.
	* @param {Vector3} force - The force/result vector.
	* @param {Number} delta - The time delta.
	* @return {Vector3} The force/result vector.
	*/
	calculate( vehicle, force /*, delta */ ) {

		const evader = this.evader;

		displacement$1.subVectors( evader.position, vehicle.position );

		// 1. if the evader is ahead and facing the agent then we can just seek for the evader's current position

		vehicle.getDirection( vehicleDirection );
		evader.getDirection( evaderDirection );

		// first condition: evader must be in front of the pursuer

		const evaderAhead = displacement$1.dot( vehicleDirection ) > 0;

		// second condition: evader must almost directly facing the agent

		const facing = vehicleDirection.dot( evaderDirection ) < - 0.95;

		if ( evaderAhead === true && facing === true ) {

			this._seek.target = evader.position;
			this._seek.calculate( vehicle, force );
			return force;

		}

		// 2. evader not considered ahead so we predict where the evader will be

		// the lookahead time is proportional to the distance between the evader
		// and the pursuer. and is inversely proportional to the sum of the
		// agent's velocities

		let lookAheadTime = displacement$1.length() / ( vehicle.maxSpeed + evader.getSpeed() );
		lookAheadTime *= this.predictionFactor; // tweak the magnitude of the prediction

		// calculate new velocity and predicted future position

		newEvaderVelocity.copy( evader.velocity ).multiplyScalar( lookAheadTime );
		predictedPosition$1.addVectors( evader.position, newEvaderVelocity );

		// now seek to the predicted future position of the evader

		this._seek.target = predictedPosition$1;
		this._seek.calculate( vehicle, force );

		return force;

	}

	/**
	* Transforms this instance into a JSON object.
	*
	* @return {Object} The JSON object.
	*/
	toJSON() {

		const json = super.toJSON();

		json.evader = this.evader ? this.evader.uuid : null;
		json.predictionFactor = this.predictionFactor;

		return json;

	}

	/**
	* Restores this instance from the given JSON object.
	*
	* @param {Object} json - The JSON object.
	* @return {PursuitBehavior} A reference to this behavior.
	*/
	fromJSON( json ) {

		super.fromJSON( json );

		this.evader = json.evader;
		this.predictionFactor = json.predictionFactor;

		return this;

	}

	/**
	* Restores UUIDs with references to GameEntity objects.
	*
	* @param {Map<String,GameEntity>} entities - Maps game entities to UUIDs.
	* @return {PursuitBehavior} A reference to this behavior.
	*/
	resolveReferences( entities ) {

		this.evader = entities.get( this.evader ) || null;

	}

}

const toAgent = new Vector3();

/**
* This steering produces a force that steers a vehicle away from those in its neighborhood region.
*
* @author {@link https://github.com/Mugen87|Mugen87}
* @augments SteeringBehavior
*/
class SeparationBehavior extends SteeringBehavior {

	/**
	* Constructs a new separation behavior.
	*/
	constructor() {

		super();

	}

	/**
	* Calculates the steering force for a single simulation step.
	*
	* @param {Vehicle} vehicle - The game entity the force is produced for.
	* @param {Vector3} force - The force/result vector.
	* @param {Number} delta - The time delta.
	* @return {Vector3} The force/result vector.
	*/
	calculate( vehicle, force /*, delta */ ) {

		const neighbors = vehicle.neighbors;

		for ( let i = 0, l = neighbors.length; i < l; i ++ ) {

			const neighbor = neighbors[ i ];

			toAgent.subVectors( vehicle.position, neighbor.position );

			let length = toAgent.length();

			// handle zero length if both vehicles have the same position

			if ( length === 0 ) length = 0.0001;

			// scale the force inversely proportional to the agents distance from its neighbor

			toAgent.normalize().divideScalar( length );

			force.add( toAgent );

		}

		return force;

	}

}

const targetWorld = new Vector3();
const randomDisplacement = new Vector3();

/**
* This steering behavior produces a steering force that will give the
* impression of a random walk through the agent’s environment. The behavior only
* produces a 2D force (XZ).
*
* @author {@link https://github.com/Mugen87|Mugen87}
* @augments SteeringBehavior
*/
class WanderBehavior extends SteeringBehavior {

	/**
	* Constructs a new wander behavior.
	*
	* @param {Number} radius - The radius of the wander circle for the wander behavior.
	* @param {Number} distance - The distance the wander circle is projected in front of the agent.
	* @param {Number} jitter - The maximum amount of displacement along the sphere each frame.
	*/
	constructor( radius = 1, distance = 5, jitter = 5 ) {

		super();

		/**
		* The radius of the constraining circle for the wander behavior.
		* @type {Number}
		* @default 1
		*/
		this.radius = radius;

		/**
		* The distance the wander sphere is projected in front of the agent.
		* @type {Number}
		* @default 5
		*/
		this.distance = distance;

		/**
		* The maximum amount of displacement along the sphere each frame.
		* @type {Number}
		* @default 5
		*/
		this.jitter = jitter;

		this._targetLocal = new Vector3();

		generateRandomPointOnCircle( this.radius, this._targetLocal );

	}

	/**
	* Calculates the steering force for a single simulation step.
	*
	* @param {Vehicle} vehicle - The game entity the force is produced for.
	* @param {Vector3} force - The force/result vector.
	* @param {Number} delta - The time delta.
	* @return {Vector3} The force/result vector.
	*/
	calculate( vehicle, force, delta ) {

		// this behavior is dependent on the update rate, so this line must be
		// included when using time independent frame rate

		const jitterThisTimeSlice = this.jitter * delta;

		// prepare random vector

		randomDisplacement.x = MathUtils.randFloat( - 1, 1 ) * jitterThisTimeSlice;
		randomDisplacement.z = MathUtils.randFloat( - 1, 1 ) * jitterThisTimeSlice;

		// add random vector to the target's position

		this._targetLocal.add( randomDisplacement );

		// re-project this new vector back onto a unit sphere

		this._targetLocal.normalize();

		// increase the length of the vector to the same as the radius of the wander sphere

		this._targetLocal.multiplyScalar( this.radius );

		// move the target into a position wanderDist in front of the agent

		targetWorld.copy( this._targetLocal );
		targetWorld.z += this.distance;

		// project the target into world space

		targetWorld.applyMatrix4( vehicle.worldMatrix );

		// and steer towards it

		force.subVectors( targetWorld, vehicle.position );

		return force;

	}

	/**
	* Transforms this instance into a JSON object.
	*
	* @return {Object} The JSON object.
	*/
	toJSON() {

		const json = super.toJSON();

		json.radius = this.radius;
		json.distance = this.distance;
		json.jitter = this.jitter;
		json._targetLocal = this._targetLocal.toArray( new Array() );

		return json;

	}

	/**
	* Restores this instance from the given JSON object.
	*
	* @param {Object} json - The JSON object.
	* @return {WanderBehavior} A reference to this behavior.
	*/
	fromJSON( json ) {

		super.fromJSON( json );

		this.radius = json.radius;
		this.distance = json.distance;
		this.jitter = json.jitter;
		this._targetLocal.fromArray( json._targetLocal );

		return this;

	}

}

//

function generateRandomPointOnCircle( radius, target ) {

	const theta = Math.random() * Math.PI * 2;

	target.x = radius * Math.cos( theta );
	target.z = radius * Math.sin( theta );

}

const force = new Vector3();

/**
* This class is responsible for managing the steering of a single vehicle. The steering manager
* can manage multiple steering behaviors and combine their produced force into a single one used
* by the vehicle.
*
* @author {@link https://github.com/Mugen87|Mugen87}
*/
class SteeringManager {

	/**
	* Constructs a new steering manager.
	*
	* @param {Vehicle} vehicle - The vehicle that owns this steering manager.
	*/
	constructor( vehicle ) {

		/**
		* The vehicle that owns this steering manager.
		* @type {Vehicle}
		*/
		this.vehicle = vehicle;

		/**
		* A list of all steering behaviors.
		* @type {Array<SteeringBehavior>}
		* @readonly
		*/
		this.behaviors = new Array();

		this._steeringForce = new Vector3(); // the calculated steering force per simulation step
		this._typesMap = new Map(); // used for deserialization of custom behaviors

	}

	/**
	* Adds the given steering behavior to this steering manager.
	*
	* @param {SteeringBehavior} behavior - The steering behavior to add.
	* @return {SteeringManager} A reference to this steering manager.
	*/
	add( behavior ) {

		this.behaviors.push( behavior );

		return this;

	}

	/**
	* Removes the given steering behavior from this steering manager.
	*
	* @param {SteeringBehavior} behavior - The steering behavior to remove.
	* @return {SteeringManager} A reference to this steering manager.
	*/
	remove( behavior ) {

		const index = this.behaviors.indexOf( behavior );
		this.behaviors.splice( index, 1 );

		return this;

	}

	/**
	* Clears the internal state of this steering manager.
	*
	* @return {SteeringManager} A reference to this steering manager.
	*/
	clear() {

		this.behaviors.length = 0;

		return this;

	}

	/**
	* Calculates the steering forces for all active steering behaviors and
	* combines it into a single result force. This method is called in
	* {@link Vehicle#update}.
	*
	* @param {Number} delta - The time delta.
	* @param {Vector3} result - The force/result vector.
	* @return {Vector3} The force/result vector.
	*/
	calculate( delta, result ) {

		this._calculateByOrder( delta );

		return result.copy( this._steeringForce );

	}

	// this method calculates how much of its max steering force the vehicle has
	// left to apply and then applies that amount of the force to add

	_accumulate( forceToAdd ) {

		// calculate how much steering force the vehicle has used so far

		const magnitudeSoFar = this._steeringForce.length();

		// calculate how much steering force remains to be used by this vehicle

		const magnitudeRemaining = this.vehicle.maxForce - magnitudeSoFar;

		// return false if there is no more force left to use

		if ( magnitudeRemaining <= 0 ) return false;

		// calculate the magnitude of the force we want to add

		const magnitudeToAdd = forceToAdd.length();

		// restrict the magnitude of forceToAdd, so we don't exceed the max force of the vehicle

		if ( magnitudeToAdd > magnitudeRemaining ) {

			forceToAdd.normalize().multiplyScalar( magnitudeRemaining );

		}

		// add force

		this._steeringForce.add( forceToAdd );

		return true;

	}

	_calculateByOrder( delta ) {

		const behaviors = this.behaviors;

		// reset steering force

		this._steeringForce.set( 0, 0, 0 );

		// calculate for each behavior the respective force

		for ( let i = 0, l = behaviors.length; i < l; i ++ ) {

			const behavior = behaviors[ i ];

			if ( behavior.active === true ) {

				force.set( 0, 0, 0 );

				behavior.calculate( this.vehicle, force, delta );

				force.multiplyScalar( behavior.weight );

				if ( this._accumulate( force ) === false ) return;

			}

		}

	}

	/**
	* Transforms this instance into a JSON object.
	*
	* @return {Object} The JSON object.
	*/
	toJSON() {

		const data = {
			type: 'SteeringManager',
			behaviors: new Array()
		};

		const behaviors = this.behaviors;

		for ( let i = 0, l = behaviors.length; i < l; i ++ ) {

			const behavior = behaviors[ i ];
			data.behaviors.push( behavior.toJSON() );

		}

		return data;

	}

	/**
	* Restores this instance from the given JSON object.
	*
	* @param {Object} json - The JSON object.
	* @return {SteeringManager} A reference to this steering manager.
	*/
	fromJSON( json ) {

		this.clear();

		const behaviorsJSON = json.behaviors;

		for ( let i = 0, l = behaviorsJSON.length; i < l; i ++ ) {

			const behaviorJSON = behaviorsJSON[ i ];
			const type = behaviorJSON.type;

			let behavior;

			switch ( type ) {

				case 'SteeringBehavior':
					behavior = new SteeringBehavior().fromJSON( behaviorJSON );
					break;

				case 'AlignmentBehavior':
					behavior = new AlignmentBehavior().fromJSON( behaviorJSON );
					break;

				case 'ArriveBehavior':
					behavior = new ArriveBehavior().fromJSON( behaviorJSON );
					break;

				case 'CohesionBehavior':
					behavior = new CohesionBehavior().fromJSON( behaviorJSON );
					break;

				case 'EvadeBehavior':
					behavior = new EvadeBehavior().fromJSON( behaviorJSON );
					break;

				case 'FleeBehavior':
					behavior = new FleeBehavior().fromJSON( behaviorJSON );
					break;

				case 'FollowPathBehavior':
					behavior = new FollowPathBehavior().fromJSON( behaviorJSON );
					break;

				case 'InterposeBehavior':
					behavior = new InterposeBehavior().fromJSON( behaviorJSON );
					break;

				case 'ObstacleAvoidanceBehavior':
					behavior = new ObstacleAvoidanceBehavior().fromJSON( behaviorJSON );
					break;

				case 'OffsetPursuitBehavior':
					behavior = new OffsetPursuitBehavior().fromJSON( behaviorJSON );
					break;

				case 'PursuitBehavior':
					behavior = new PursuitBehavior().fromJSON( behaviorJSON );
					break;

				case 'SeekBehavior':
					behavior = new SeekBehavior().fromJSON( behaviorJSON );
					break;

				case 'SeparationBehavior':
					behavior = new SeparationBehavior().fromJSON( behaviorJSON );
					break;

				case 'WanderBehavior':
					behavior = new WanderBehavior().fromJSON( behaviorJSON );
					break;

				default:

					// handle custom type

					const ctor = this._typesMap.get( type );

					if ( ctor !== undefined ) {

						behavior = new ctor().fromJSON( behaviorJSON );

					} else {

						Logger.warn( 'YUKA.SteeringManager: Unsupported steering behavior type:', type );
						continue;

					}

			}

			this.add( behavior );

		}

		return this;

	}

	/**
	 * Registers a custom type for deserialization. When calling {@link SteeringManager#fromJSON}
	 * the steering manager is able to pick the correct constructor in order to create custom
	 * steering behavior.
	 *
	 * @param {String} type - The name of the behavior type.
	 * @param {Function} constructor - The constructor function.
	 * @return {SteeringManager} A reference to this steering manager.
	 */
	registerType( type, constructor ) {

		this._typesMap.set( type, constructor );

		return this;

	}

	/**
	* Restores UUIDs with references to GameEntity objects.
	*
	* @param {Map<String,GameEntity>} entities - Maps game entities to UUIDs.
	* @return {SteeringManager} A reference to this steering manager.
	*/
	resolveReferences( entities ) {

		const behaviors = this.behaviors;

		for ( let i = 0, l = behaviors.length; i < l; i ++ ) {

			const behavior = behaviors[ i ];
			behavior.resolveReferences( entities );


		}

		return this;

	}

}

/**
* This class can be used to smooth the result of a vector calculation. One use case
* is the smoothing of the velocity vector of game entities in order to avoid a shaky
* movements due to conflicting forces.
*
* @author {@link https://github.com/Mugen87|Mugen87}
* @author {@link https://github.com/robp94|robp94}
*/
class Smoother {

	/**
	* Constructs a new smoother.
	*
	* @param {Number} count - The amount of samples the smoother will use to average a vector.
	*/
	constructor( count = 10 ) {

		/**
		* The amount of samples the smoother will use to average a vector.
		* @type {Number}
		* @default 10
		*/
		this.count = count;

		this._history = new Array(); // this holds the history
		this._slot = 0; // the current sample slot

		// initialize history with Vector3s

		for ( let i = 0; i < this.count; i ++ ) {

			this._history[ i ] = new Vector3();

		}

	}

	/**
	* Calculates for the given value a smooth average.
	*
	* @param {Vector3} value - The value to smooth.
	* @param {Vector3} average - The calculated average.
	* @return {Vector3} The calculated average.
	*/
	calculate( value, average ) {

		// ensure, average is a zero vector

		average.set( 0, 0, 0 );

		// make sure the slot index wraps around

		if ( this._slot === this.count ) {

			this._slot = 0;

		}

		// overwrite the oldest value with the newest

		this._history[ this._slot ].copy( value );

		// increase slot index

		this._slot ++;

		// now calculate the average of the history array

		for ( let i = 0; i < this.count; i ++ ) {

			average.add( this._history[ i ] );

		}

		average.divideScalar( this.count );

		return average;

	}

	/**
	* Transforms this instance into a JSON object.
	*
	* @return {Object} The JSON object.
	*/
	toJSON() {

		const data = {
			type: this.constructor.name,
			count: this.count,
			_history: new Array(),
			_slot: this._slot
		};

		// history

		const history = this._history;

		for ( let i = 0, l = history.length; i < l; i ++ ) {

			const value = history[ i ];
			data._history.push( value.toArray( new Array() ) );

		}

		return data;

	}

	/**
	* Restores this instance from the given JSON object.
	*
	* @param {Object} json - The JSON object.
	* @return {Smoother} A reference to this smoother.
	*/
	fromJSON( json ) {

		this.count = json.count;
		this._slot = json._slot;

		// history

		const historyJSON = json._history;
		this._history.length = 0;

		for ( let i = 0, l = historyJSON.length; i < l; i ++ ) {

			const valueJSON = historyJSON[ i ];
			this._history.push( new Vector3().fromArray( valueJSON ) );

		}


		return this;

	}

}

const steeringForce = new Vector3();
const displacement = new Vector3();
const acceleration = new Vector3();
const target = new Vector3();
const velocitySmooth = new Vector3();

/**
* This type of game entity implements a special type of locomotion, the so called
* *Vehicle Model*. The class uses basic physical metrics in order to implement a
* realistic movement.
*
* @author {@link https://github.com/Mugen87|Mugen87}
* @author {@link https://github.com/robp94|robp94}
* @augments MovingEntity
*/
class Vehicle extends MovingEntity {

	/**
	* Constructs a new vehicle.
	*/
	constructor() {

		super();

		/**
		* The mass of the vehicle in kilogram.
		* @type {Number}
		* @default 1
		*/
		this.mass = 1;

		/**
		* The maximum force this entity can produce to power itself.
		* @type {Number}
		* @default 100
		*/
		this.maxForce = 100;

		/**
		* The steering manager of this vehicle.
		* @type {SteeringManager}
		*/
		this.steering = new SteeringManager( this );

		/**
		* An optional smoother to avoid shakiness due to conflicting steering behaviors.
		* @type {?Smoother}
		* @default null
		*/
		this.smoother = null;

	}

	/**
	* This method is responsible for updating the position based on the force produced
	* by the internal steering manager.
	*
	* @param {Number} delta - The time delta.
	* @return {Vehicle} A reference to this vehicle.
	*/
	update( delta ) {

		// calculate steering force

		this.steering.calculate( delta, steeringForce );

		// acceleration = force / mass

		acceleration.copy( steeringForce ).divideScalar( this.mass );

		// update velocity

		this.velocity.add( acceleration.multiplyScalar( delta ) );

		// make sure vehicle does not exceed maximum speed

		if ( this.getSpeedSquared() > ( this.maxSpeed * this.maxSpeed ) ) {

			this.velocity.normalize();
			this.velocity.multiplyScalar( this.maxSpeed );

		}

		// calculate displacement

		displacement.copy( this.velocity ).multiplyScalar( delta );

		// calculate target position

		target.copy( this.position ).add( displacement );

		// update the orientation if the vehicle has a non zero velocity

		if ( this.updateOrientation === true && this.smoother === null && this.getSpeedSquared() > 0.00000001 ) {

			this.lookAt( target );

		}

		// update position

		this.position.copy( target );

		// if smoothing is enabled, the orientation (not the position!) of the vehicle is
		// changed based on a post-processed velocity vector

		if ( this.updateOrientation === true && this.smoother !== null ) {

			this.smoother.calculate( this.velocity, velocitySmooth );

			displacement.copy( velocitySmooth ).multiplyScalar( delta );
			target.copy( this.position ).add( displacement );

			this.lookAt( target );

		}

		return this;

	}

	/**
	* Transforms this instance into a JSON object.
	*
	* @return {Object} The JSON object.
	*/
	toJSON() {

		const json = super.toJSON();

		json.mass = this.mass;
		json.maxForce = this.maxForce;
		json.steering = this.steering.toJSON();
		json.smoother = this.smoother ? this.smoother.toJSON() : null;

		return json;

	}

	/**
	* Restores this instance from the given JSON object.
	*
	* @param {Object} json - The JSON object.
	* @return {Vehicle} A reference to this vehicle.
	*/
	fromJSON( json ) {

		super.fromJSON( json );

		this.mass = json.mass;
		this.maxForce = json.maxForce;
		this.steering = new SteeringManager( this ).fromJSON( json.steering );
		this.smoother = json.smoother ? new Smoother().fromJSON( json.smoother ) : null;

		return this;

	}

	/**
	* Restores UUIDs with references to GameEntity objects.
	*
	* @param {Map<String,GameEntity>} entities - Maps game entities to UUIDs.
	* @return {Vehicle} A reference to this vehicle.
	*/
	resolveReferences( entities ) {

		super.resolveReferences( entities );

		this.steering.resolveReferences( entities );

	}

}

/**
* Base class for representing trigger regions. It's a predefine region in 3D space,
* owned by one or more triggers. The shape of the trigger can be arbitrary.
*
* @author {@link https://github.com/Mugen87|Mugen87}
*/
class TriggerRegion {

	/**
	* Returns true if the bounding volume of the given game entity touches/intersects
	* the trigger region. Must be implemented by all concrete trigger regions.
	*
	* @param {GameEntity} entity - The entity to test.
	* @return {Boolean} Whether this trigger touches the given game entity or not.
	*/
	touching( /* entity */ ) {

		return false;

	}

	/**
	* Updates this trigger region. Must be implemented by all concrete trigger regions.
	*
	* @param {Trigger} trigger - The trigger that owns this region.
	* @return {TriggerRegion} A reference to this trigger region.
	*/
	update( /* trigger */ ) {

		return this;

	}

	/**
	* Transforms this instance into a JSON object.
	*
	* @return {Object} The JSON object.
	*/
	toJSON() {

		return {
			type: this.constructor.name
		};

	}

	/**
	* Restores this instance from the given JSON object.
	*
	* @param {Object} json - The JSON object.
	* @return {TriggerRegion} A reference to this trigger region.
	*/
	fromJSON( /* json */ ) {

		return this;

	}

}

const boundingSphereEntity$1 = new BoundingSphere();
const center = new Vector3();

/**
* Class for representing a rectangular trigger region as an AABB.
*
* @author {@link https://github.com/Mugen87|Mugen87}
* @augments TriggerRegion
*/
class RectangularTriggerRegion extends TriggerRegion {

	/**
	* Constructs a new rectangular trigger region with the given values.
	*
	* @param {Vector3} size - The size of the region.
	*/
	constructor( size = new Vector3() ) {

		super();

		/**
		* The size of the region.
		* @type {Vector3}
		*/
		this.size = size;

		this._aabb = new AABB();

	}

	/**
	* Returns true if the bounding volume of the given game entity touches/intersects
	* the trigger region.
	*
	* @param {GameEntity} entity - The entity to test.
	* @return {Boolean} Whether this trigger touches the given game entity or not.
	*/
	touching( entity ) {

		boundingSphereEntity$1.set( entity.position, entity.boundingRadius );

		return this._aabb.intersectsBoundingSphere( boundingSphereEntity$1 );

	}

	/**
	* Updates this trigger region.
	*
	* @param {Trigger} trigger - The trigger that owns this region.
	* @return {RectangularTriggerRegion} A reference to this trigger region.
	*/
	update( trigger ) {

		trigger.getWorldPosition( center );

		this._aabb.fromCenterAndSize( center, this.size );

		return this;

	}

	/**
	* Transforms this instance into a JSON object.
	*
	* @return {Object} The JSON object.
	*/
	toJSON() {

		const json = super.toJSON();

		json.size = this.size.toArray( new Array() );

		return json;

	}

	/**
	* Restores this instance from the given JSON object.
	*
	* @param {Object} json - The JSON object.
	* @return {RectangularTriggerRegion} A reference to this trigger region.
	*/
	fromJSON( json ) {

		super.fromJSON( json );

		this.size.fromArray( json.size );

		return this;

	}

}

const boundingSphereEntity = new BoundingSphere();

/**
* Class for representing a spherical trigger region as a bounding sphere.
*
* @author {@link https://github.com/Mugen87|Mugen87}
* @augments TriggerRegion
*/
class SphericalTriggerRegion extends TriggerRegion {

	/**
	* Constructs a new spherical trigger region.
	*
	* @param {Number} radius - The radius of the region.
	*/
	constructor( radius = 0 ) {

		super();

		/**
		* The radius of the region.
		* @type {Number}
		* @default 0
		*/
		this.radius = radius;

		//

		this._boundingSphere = new BoundingSphere();

	}

	/**
	* Returns true if the bounding volume of the given game entity touches/intersects
	* the trigger region.
	*
	* @param {GameEntity} entity - The entity to test.
	* @return {Boolean} Whether this trigger touches the given game entity or not.
	*/
	touching( entity ) {

		entity.getWorldPosition( boundingSphereEntity.center );
		boundingSphereEntity.radius = entity.boundingRadius;

		return this._boundingSphere.intersectsBoundingSphere( boundingSphereEntity );

	}

	/**
	* Updates this trigger region.
	*
	* @param {Trigger} trigger - The trigger that owns this region.
	* @return {SphericalTriggerRegion} A reference to this trigger region.
	*/
	update( trigger ) {

		trigger.getWorldPosition( this._boundingSphere.center );
		this._boundingSphere.radius = this.radius;

		return this;

	}

	/**
	* Transforms this instance into a JSON object.
	*
	* @return {Object} The JSON object.
	*/
	toJSON() {

		const json = super.toJSON();

		json.radius = this.radius;

		return json;

	}

	/**
	* Restores this instance from the given JSON object.
	*
	* @param {Object} json - The JSON object.
	* @return {SphericalTriggerRegion} A reference to this trigger region.
	*/
	fromJSON( json ) {

		super.fromJSON( json );

		this.radius = json.radius;

		return this;

	}

}

/**
* Base class for representing triggers. A trigger generates an action if a game entity
* touches its trigger region, a predefine area in 3D space.
*
* @author {@link https://github.com/Mugen87|Mugen87}
* @augments GameEntity
*/
class Trigger extends GameEntity {

	/**
	* Constructs a new trigger with the given values.
	*
	* @param {TriggerRegion} region - The region of the trigger.
	*/
	constructor( region = new TriggerRegion() ) {

		super();

		/**
		* The region of the trigger.
		* @type {TriggerRegion}
		*/
		this.region = region;

		//

		this.canActivateTrigger = false; // triggers can't activate other triggers by default

		this._typesMap = new Map(); // used for deserialization of custom trigger regions

	}

	/**
	* This method is called per simulation step for all game entities. If the game
	* entity touches the region of the trigger, the respective action is executed.
	*
	* @param {GameEntity} entity - The entity to test
	* @return {Trigger} A reference to this trigger.
	*/
	check( entity ) {

		if ( this.region.touching( entity ) === true ) {

			this.execute( entity );

		}

		return this;

	}

	/**
	* This method is called when the trigger should execute its action.
	* Must be implemented by all concrete triggers.
	*
	* @param {GameEntity} entity - The entity that touched the trigger region.
	* @return {Trigger} A reference to this trigger.
	*/
	execute( /* entity */ ) {}

	/**
	* Updates the region of this trigger. Called by the {@link EntityManager} per
	* simulation step.
	*
	* @return {Trigger} A reference to this trigger.
	*/
	updateRegion() {

		this.region.update( this );

		return this;

	}

	/**
	* Transforms this instance into a JSON object.
	*
	* @return {Object} The JSON object.
	*/
	toJSON() {

		const json = super.toJSON();

		json.region = this.region.toJSON();

		return json;

	}

	/**
	* Restores this instance from the given JSON object.
	*
	* @param {Object} json - The JSON object.
	* @return {Trigger} A reference to this trigger.
	*/
	fromJSON( json ) {

		super.fromJSON( json );

		const regionJSON = json.region;
		let type = regionJSON.type;

		switch ( type ) {

			case 'TriggerRegion':
				this.region = new TriggerRegion().fromJSON( regionJSON );
				break;

			case 'RectangularTriggerRegion':
				this.region = new RectangularTriggerRegion().fromJSON( regionJSON );
				break;

			case 'SphericalTriggerRegion':
				this.region = new SphericalTriggerRegion().fromJSON( regionJSON );
				break;

			default:
				// handle custom type

				const ctor = this._typesMap.get( type );

				if ( ctor !== undefined ) {

					this.region = new ctor().fromJSON( regionJSON );

				} else {

					Logger.warn( 'YUKA.Trigger: Unsupported trigger region type:', regionJSON.type );

				}

		}

		return this;

	}

	/**
	 * Registers a custom type for deserialization. When calling {@link Trigger#fromJSON}
	 * the trigger is able to pick the correct constructor in order to create custom
	 * trigger regions.
	 *
	 * @param {String} type - The name of the trigger region.
	 * @param {Function} constructor - The constructor function.
	 * @return {Trigger} A reference to this trigger.
	 */
	registerType( type, constructor ) {

		this._typesMap.set( type, constructor );

		return this;

	}

}

const candidates = new Array();

/**
* This class is used for managing all central objects of a game like
* game entities.
*
* @author {@link https://github.com/Mugen87|Mugen87}
*/
class EntityManager {

	/**
	* Constructs a new entity manager.
	*/
	constructor() {

		/**
		* A list of {@link GameEntity game entities}.
		* @type {Array<GameEntity>}
		* @readonly
		*/
		this.entities = new Array();

		/**
		* A reference to a spatial index.
		* @type {?CellSpacePartitioning}
		* @default null
		*/
		this.spatialIndex = null;

		this._triggers = new Array(); // used to manage triggers
		this._indexMap = new Map(); // used by spatial indices
		this._typesMap = new Map(); // used for deserialization of custom entities
		this._messageDispatcher = new MessageDispatcher();

	}

	/**
	* Adds a game entity to this entity manager.
	*
	* @param {GameEntity} entity - The game entity to add.
	* @return {EntityManager} A reference to this entity manager.
	*/
	add( entity ) {

		this.entities.push( entity );

		entity.manager = this;

		return this;

	}

	/**
	* Removes a game entity from this entity manager.
	*
	* @param {GameEntity} entity - The game entity to remove.
	* @return {EntityManager} A reference to this entity manager.
	*/
	remove( entity ) {

		const index = this.entities.indexOf( entity );
		this.entities.splice( index, 1 );

		entity.manager = null;

		return this;

	}

	/**
	* Clears the internal state of this entity manager.
	*
	* @return {EntityManager} A reference to this entity manager.
	*/
	clear() {

		this.entities.length = 0;

		this._messageDispatcher.clear();

		return this;

	}

	/**
	* Returns an entity by the given name. If no game entity is found, *null*
	* is returned. This method should be used once (e.g. at {@link GameEntity#start})
	* and the result should be cached for later use.
	*
	* @param {String} name - The name of the game entity.
	* @return {GameEntity} The found game entity.
	*/
	getEntityByName( name ) {

		const entities = this.entities;

		for ( let i = 0, l = entities.length; i < l; i ++ ) {

			const entity = entities[ i ];

			if ( entity.name === name ) return entity;

		}

		return null;

	}

	/**
	* The central update method of this entity manager. Updates all
	* game entities and delayed messages.
	*
	* @param {Number} delta - The time delta.
	* @return {EntityManager} A reference to this entity manager.
	*/
	update( delta ) {

		const entities = this.entities;
		const triggers = this._triggers;

		// update entities

		for ( let i = ( entities.length - 1 ); i >= 0; i -- ) {

			const entity = entities[ i ];

			this.updateEntity( entity, delta );

		}

		// process triggers (this is done after the entity update to ensure
		// up-to-date world matries)

		for ( let i = ( triggers.length - 1 ); i >= 0; i -- ) {

			const trigger = triggers[ i ];

			this.processTrigger( trigger );

		}

		this._triggers.length = 0; // reset

		// handle messaging

		this._messageDispatcher.dispatchDelayedMessages( delta );

		return this;

	}

	/**
	* Updates a single entity.
	*
	* @param {GameEntity} entity - The game entity to update.
	* @param {Number} delta - The time delta.
	* @return {EntityManager} A reference to this entity manager.
	*/
	updateEntity( entity, delta ) {

		if ( entity.active === true ) {

			this.updateNeighborhood( entity );

			// check if start() should be executed

			if ( entity._started === false ) {

				entity.start();

				entity._started = true;

			}

			// update entity

			entity.update( delta );

			// update children

			const children = entity.children;

			for ( let i = ( children.length - 1 ); i >= 0; i -- ) {

				const child = children[ i ];

				this.updateEntity( child, delta );

			}

			// if the entity is a trigger, save the reference for further processing

			if ( entity instanceof Trigger ) {

				this._triggers.push( entity );

			}

			// update spatial index

			if ( this.spatialIndex !== null ) {

				let currentIndex = this._indexMap.get( entity ) || - 1;
				currentIndex = this.spatialIndex.updateEntity( entity, currentIndex );
				this._indexMap.set( entity, currentIndex );

			}

			// update render component

			const renderComponent = entity._renderComponent;
			const renderComponentCallback = entity._renderComponentCallback;

			if ( renderComponent !== null && renderComponentCallback !== null ) {

				renderComponentCallback( entity, renderComponent );

			}

		}

		return this;

	}

	/**
	* Updates the neighborhood of a single game entity.
	*
	* @param {GameEntity} entity - The game entity to update.
	* @return {EntityManager} A reference to this entity manager.
	*/
	updateNeighborhood( entity ) {

		if ( entity.updateNeighborhood === true ) {

			entity.neighbors.length = 0;

			// determine candidates

			if ( this.spatialIndex !== null ) {

				this.spatialIndex.query( entity.position, entity.neighborhoodRadius, candidates );

			} else {

				// worst case runtime complexity with O(n²)

				candidates.length = 0;
				candidates.push( ...this.entities );

			}

			// verify if candidates are within the predefined range

			const neighborhoodRadiusSq = ( entity.neighborhoodRadius * entity.neighborhoodRadius );

			for ( let i = 0, l = candidates.length; i < l; i ++ ) {

				const candidate = candidates[ i ];

				if ( entity !== candidate && candidate.active === true ) {

					const distanceSq = entity.position.squaredDistanceTo( candidate.position );

					if ( distanceSq <= neighborhoodRadiusSq ) {

						entity.neighbors.push( candidate );

					}

				}

			}

		}

		return this;

	}

	/**
	* Processes a single trigger.
	*
	* @param {Trigger} trigger - The trigger to process.
	* @return {EntityManager} A reference to this entity manager.
	*/
	processTrigger( trigger ) {

		trigger.updateRegion(); // ensure its region is up-to-date

		const entities = this.entities;

		for ( let i = ( entities.length - 1 ); i >= 0; i -- ) {

			const entity = entities[ i ];

			if ( trigger !== entity && entity.active === true && entity.canActivateTrigger === true ) {

				trigger.check( entity );

			}

		}

		return this;

	}

	/**
	* Interface for game entities so they can send messages to other game entities.
	*
	* @param {GameEntity} sender - The sender.
	* @param {GameEntity} receiver - The receiver.
	* @param {String} message - The actual message.
	* @param {Number} delay - A time value in millisecond used to delay the message dispatching.
	* @param {Object} data - An object for custom data.
	* @return {EntityManager} A reference to this entity manager.
	*/
	sendMessage( sender, receiver, message, delay, data ) {

		this._messageDispatcher.dispatch( sender, receiver, message, delay, data );

		return this;

	}

	/**
	* Transforms this instance into a JSON object.
	*
	* @return {Object} The JSON object.
	*/
	toJSON() {

		const data = {
			type: this.constructor.name,
			entities: new Array(),
			_messageDispatcher: this._messageDispatcher.toJSON()
		};

		// entities

		function processEntity( entity ) {

			data.entities.push( entity.toJSON() );

			for ( let i = 0, l = entity.children.length; i < l; i ++ ) {

				processEntity( entity.children[ i ] );

			}

		}

		for ( let i = 0, l = this.entities.length; i < l; i ++ ) {

			// recursively process all entities

			processEntity( this.entities[ i ] );

		}

		return data;

	}

	/**
	* Restores this instance from the given JSON object.
	*
	* @param {Object} json - The JSON object.
	* @return {EntityManager} A reference to this entity manager.
	*/
	fromJSON( json ) {

		this.clear();

		const entitiesJSON = json.entities;
		const _messageDispatcherJSON = json._messageDispatcher;

		// entities

		const entitiesMap = new Map();

		for ( let i = 0, l = entitiesJSON.length; i < l; i ++ ) {

			const entityJSON = entitiesJSON[ i ];
			const type = entityJSON.type;

			let entity;

			switch ( type ) {

				case 'GameEntity':
					entity = new GameEntity().fromJSON( entityJSON );
					break;

				case 'MovingEntity':
					entity = new MovingEntity().fromJSON( entityJSON );
					break;

				case 'Vehicle':
					entity = new Vehicle().fromJSON( entityJSON );
					break;

				case 'Trigger':
					entity = new Trigger().fromJSON( entityJSON );
					break;

				default:

					// handle custom type

					const ctor = this._typesMap.get( type );

					if ( ctor !== undefined ) {

						entity = new ctor().fromJSON( entityJSON );

					} else {

						Logger.warn( 'YUKA.EntityManager: Unsupported entity type:', type );
						continue;

					}

			}

			entitiesMap.set( entity.uuid, entity );

			if ( entity.parent === null ) this.add( entity );

		}

		// resolve UUIDs to game entity objects

		for ( let entity of entitiesMap.values() ) {

			entity.resolveReferences( entitiesMap );

		}

		// restore delayed messages

		this._messageDispatcher.fromJSON( _messageDispatcherJSON );

		return this;

	}

	/**
	* Registers a custom type for deserialization. When calling {@link EntityManager#fromJSON}
	* the entity manager is able to pick the correct constructor in order to create custom
	* game entities.
	*
	* @param {String} type - The name of the entity type.
	* @param {Function} constructor - The constructor function.
	* @return {EntityManager} A reference to this entity manager.
	*/
	registerType( type, constructor ) {

		this._typesMap.set( type, constructor );

		return this;

	}

}

/**
* Base class for representing a state in context of State-driven agent design.
*
* @author {@link https://github.com/Mugen87|Mugen87}
*/
class State {

	/**
	* This method is called once during a state transition when the {@link StateMachine} makes
	* this state active.
	*
	* @param {GameEntity} owner - The game entity that represents the execution context of this state.
	*/
	enter( /* owner */ ) {}

	/**
	* This method is called per simulation step if this state is active.
	*
	* @param {GameEntity} owner - The game entity that represents the execution context of this state.
	*/
	execute( /* owner */ ) {}

	/**
	* This method is called once during a state transition when the {@link StateMachine} makes
	* this state inactive.
	*
	* @param {GameEntity} owner - The game entity that represents the execution context of this state.
	*/
	exit( /* owner */ ) {}

	/**
	* Transforms this instance into a JSON object.
	*
	* @return {Object} The JSON object.
	*/
	toJSON() {}

	/**
	* Restores this instance from the given JSON object.
	*
	* @param {Object} json - The JSON object.
	* @return {State} A reference to this state.
	*/
	fromJSON( /* json */ ) {}

	/**
	* Restores UUIDs with references to GameEntity objects.
	*
	* @param {Map<String,GameEntity>} entities - Maps game entities to UUIDs.
	* @return {State} A reference to this state.
	*/
	resolveReferences( /* entities */ ) {}

	/**
	* This method is called when messaging between game entities occurs.
	*
	* @param {GameEntity} owner - The game entity that represents the execution context of this state.
	* @param {Telegram} telegram - A data structure containing the actual message.
	* @return {Boolean} Whether the message was processed or not.
	*/
	onMessage( /* owner, telegram */ ) {

		return false;

	}

}

/**
* Finite state machine (FSM) for implementing State-driven agent design.
*
* @author {@link https://github.com/Mugen87|Mugen87}
*/
class StateMachine {

	/**
	* Constructs a new state machine with the given values.
	*
	* @param {GameEntity} owner - The owner of this state machine.
	*/
	constructor( owner = null ) {

		/**
		* The game entity that owns this state machine.
		* @type {?GameEntity}
		* @default null
		*/
		this.owner = owner;

		/**
		* The current state of the game entity.
		* @type {?State}
		* @default null
		*/
		this.currentState = null;

		/**
		* The previous state of the game entity.
		* @type {?State}
		* @default null
		*/
		this.previousState = null; // a reference to the last state the agent was in

		/**
		* This state logic is called every time the state machine is updated.
		* @type {?State}
		* @default null
		*/
		this.globalState = null;

		/**
		* A map with all states of the state machine.
		* @type {Map<String,State>}
		*/
		this.states = new Map();

		//

		this._typesMap = new Map();

	}

	/**
	* Updates the internal state of the FSM. Usually called by {@link GameEntity#update}.
	*
	* @return {StateMachine} A reference to this state machine.
	*/
	update() {

		if ( this.globalState !== null ) {

			this.globalState.execute( this.owner );

		}

		if ( this.currentState !== null ) {

			this.currentState.execute( this.owner );

		}

		return this;

	}

	/**
	* Adds a new state with the given ID to the state machine.
	*
	* @param {String} id - The ID of the state.
	* @param {State} state - The state.
	* @return {StateMachine} A reference to this state machine.
	*/
	add( id, state ) {

		if ( state instanceof State ) {

			this.states.set( id, state );

		} else {

			Logger.warn( 'YUKA.StateMachine: .add() needs a parameter of type "YUKA.State".' );

		}

		return this;

	}

	/**
	* Removes a state via its ID from the state machine.
	*
	* @param {String} id - The ID of the state.
	* @return {StateMachine} A reference to this state machine.
	*/
	remove( id ) {

		this.states.delete( id );

		return this;

	}

	/**
	* Returns the state for the given ID.
	*
	* @param {String} id - The ID of the state.
	* @return {State} The state for the given ID.
	*/
	get( id ) {

		return this.states.get( id );

	}

	/**
	* Performs a state change to the state defined by its ID.
	*
	* @param {String} id - The ID of the state.
	* @return {StateMachine} A reference to this state machine.
	*/
	changeTo( id ) {

		const state = this.get( id );

		this._change( state );

		return this;

	}

	/**
	* Returns to the previous state.
	*
	* @return {StateMachine} A reference to this state machine.
	*/
	revert() {

		this._change( this.previousState );

		return this;

	}

	/**
	* Returns true if this FSM is in the given state.
	*
	* @return {Boolean} Whether this FSM is in the given state or not.
	*/
	in( id ) {

		const state = this.get( id );

		return ( state === this.currentState );

	}

	/**
	* Tries to dispatch the massage to the current or global state and returns true
	* if the message was processed successfully.
	*
	* @param {Telegram} telegram - The telegram with the message data.
	* @return {Boolean} Whether the message was processed or not.
	*/
	handleMessage( telegram ) {

		// first see, if the current state is valid and that it can handle the message

		if ( this.currentState !== null && this.currentState.onMessage( this.owner, telegram ) === true ) {

			return true;

		}

		// if not, and if a global state has been implemented, send the message to the global state

		if ( this.globalState !== null && this.globalState.onMessage( this.owner, telegram ) === true ) {

			return true;

		}

		return false;

	}

	/**
	* Transforms this instance into a JSON object.
	*
	* @return {Object} The JSON object.
	*/
	toJSON() {

		const json = {
			owner: this.owner.uuid,
			currentState: null,
			previousState: null,
			globalState: null,
			states: new Array()
		};

		const statesMap = new Map();

		// states

		for ( let [ id, state ] of this.states ) {

			json.states.push( {
				type: state.constructor.name,
				id: id,
				state: state.toJSON()
			} );

			statesMap.set( state, id );

		}

		json.currentState = statesMap.get( this.currentState ) || null;
		json.previousState = statesMap.get( this.previousState ) || null;
		json.globalState = statesMap.get( this.globalState ) || null;

		return json;

	}

	/**
	* Restores this instance from the given JSON object.
	*
	* @param {Object} json - The JSON object.
	* @return {StateMachine} A reference to this state machine.
	*/
	fromJSON( json ) {

		this.owner = json.owner;

		//

		const statesJSON = json.states;

		for ( let i = 0, l = statesJSON.length; i < l; i ++ ) {

			const stateJSON = statesJSON[ i ];
			const type = stateJSON.type;

			const ctor = this._typesMap.get( type );

			if ( ctor !== undefined ) {

				const id = stateJSON.id;
				const state = new ctor().fromJSON( stateJSON.state );

				this.add( id, state );

			} else {

				Logger.warn( 'YUKA.StateMachine: Unsupported state type:', type );
				continue;

			}

		}

		//

		this.currentState = ( json.currentState !== null ) ? ( this.get( json.currentState ) || null ) : null;
		this.previousState = ( json.previousState !== null ) ? ( this.get( json.previousState ) || null ) : null;
		this.globalState = ( json.globalState !== null ) ? ( this.get( json.globalState ) || null ) : null;

		return this;

	}

	/**
	* Restores UUIDs with references to GameEntity objects.
	*
	* @param {Map<String,GameEntity>} entities - Maps game entities to UUIDs.
	* @return {StateMachine} A reference to this state machine.
	*/
	resolveReferences( entities ) {

		this.owner = entities.get( this.owner ) || null;

		for ( let state of this.states.values() ) {

			state.resolveReferences( entities );

		}

		return this;

	}

	/**
	* Registers a custom type for deserialization. When calling {@link StateMachine#fromJSON}
	* the state machine is able to pick the correct constructor in order to create custom states.
	*
	* @param {String} type - The name of the state type.
	* @param {Function} constructor - The constructor function.
	* @return {StateMachine} A reference to this state machine.
	*/
	registerType( type, constructor ) {

		this._typesMap.set( type, constructor );

		return this;

	}

	//

	_change( state ) {

		this.previousState = this.currentState;

		if ( this.currentState !== null ) {

			this.currentState.exit( this.owner );

		}

		this.currentState = state;

		this.currentState.enter( this.owner );

	}

}

/**
* Base class for representing a goal in context of Goal-driven agent design.
*
* @author {@link https://github.com/Mugen87|Mugen87}
*/
class Goal {

	/**
	* Constructs a new goal.
	*
	* @param {GameEntity} owner - The owner of this goal.
	*/
	constructor( owner = null ) {

		/**
		* The owner of this goal.
		* @type {?GameEntity}
		* @default null
		*/
		this.owner = owner;

		/**
		* The status of this goal.
		* @type {Status}
		* @default INACTIVE
		*/
		this.status = Goal.STATUS.INACTIVE;

	}

	/**
	* Executed when this goal is activated.
	*/
	activate() {}

	/**
	* Executed in each simulation step.
	*/
	execute() {}

	/**
	* Executed when this goal is satisfied.
	*/
	terminate() {}

	/**
	* Goals can handle messages. Many don't though, so this defines a default behavior
	*
	* @param {Telegram} telegram - The telegram with the message data.
	* @return {Boolean} Whether the message was processed or not.
	*/
	handleMessage( /* telegram */ ) {

		return false;

	}

	/**
	* Returns true if the status of this goal is *ACTIVE*.
	*
	* @return {Boolean} Whether the goal is active or not.
	*/
	active() {

		return this.status === Goal.STATUS.ACTIVE;

	}

	/**
	* Returns true if the status of this goal is *INACTIVE*.
	*
	* @return {Boolean} Whether the goal is inactive or not.
	*/
	inactive() {

		return this.status === Goal.STATUS.INACTIVE;

	}

	/**
	* Returns true if the status of this goal is *COMPLETED*.
	*
	* @return {Boolean} Whether the goal is completed or not.
	*/
	completed() {

		return this.status === Goal.STATUS.COMPLETED;

	}

	/**
	* Returns true if the status of this goal is *FAILED*.
	*
	* @return {Boolean} Whether the goal is failed or not.
	*/
	failed() {

		return this.status === Goal.STATUS.FAILED;

	}

	/**
	* Ensures the goal is replanned if it has failed.
	*
	* @return {Goal} A reference to this goal.
	*/
	replanIfFailed() {

		if ( this.failed() === true ) {

			this.status = Goal.STATUS.INACTIVE;

		}

		return this;

	}

	/**
	* Ensures the goal is activated if it is inactive.
	*
	* @return {Goal} A reference to this goal.
	*/
	activateIfInactive() {

		if ( this.inactive() === true ) {

			this.status = Goal.STATUS.ACTIVE;

			this.activate();

		}

		return this;

	}

	/**
	* Transforms this instance into a JSON object.
	*
	* @return {Object} The JSON object.
	*/
	toJSON() {

		return {
			type: this.constructor.name,
			owner: this.owner.uuid,
			status: this.status
		};

	}

	/**
	* Restores this instance from the given JSON object.
	*
	* @param {Object} json - The JSON object.
	* @return {Goal} A reference to this goal.
	*/
	fromJSON( json ) {

		this.owner = json.owner; // uuid
		this.status = json.status;

		return this;

	}

	/**
	* Restores UUIDs with references to GameEntity objects.
	*
	* @param {Map<String,GameEntity>} entities - Maps game entities to UUIDs.
	* @return {Goal} A reference to this goal.
	*/
	resolveReferences( entities ) {

		this.owner = entities.get( this.owner ) || null;

		return this;

	}

}

Goal.STATUS = Object.freeze( {
	ACTIVE: 'active', // the goal has been activated and will be processed each update step
	INACTIVE: 'inactive', // the goal is waiting to be activated
	COMPLETED: 'completed', // the goal has completed and will be removed on the next update
	FAILED: 'failed' // the goal has failed and will either replan or be removed on the next update
} );

/**
* Class representing a composite goal. Essentially it's a goal which consists of subgoals.
*
* @author {@link https://github.com/Mugen87|Mugen87}
* @augments Goal
*/
class CompositeGoal extends Goal {

	/**
	* Constructs a new composite goal.
	*
	* @param {GameEntity} owner - The owner of this composite goal.
	*/
	constructor( owner = null ) {

		super( owner );

		/**
		* A list of subgoals.
		* @type {Array<Goal>}
		*/
		this.subgoals = new Array();

	}

	/**
	* Adds a goal as a subgoal to this instance.
	*
	* @param {Goal} goal - The subgoal to add.
	* @return {Goal} A reference to this goal.
	*/
	addSubgoal( goal ) {

		this.subgoals.unshift( goal );

		return this;

	}

	/**
	* Removes a subgoal from this instance.
	*
	* @param {Goal} goal - The subgoal to remove.
	* @return {Goal} A reference to this goal.
	*/
	removeSubgoal( goal ) {

		const index = this.subgoals.indexOf( goal );
		this.subgoals.splice( index, 1 );

		return this;

	}

	/**
	* Removes all subgoals and ensures {@link Goal#terminate} is called
	* for each subgoal.
	*
	* @return {Goal} A reference to this goal.
	*/
	clearSubgoals() {

		const subgoals = this.subgoals;

		for ( let i = 0, l = subgoals.length; i < l; i ++ ) {

			const subgoal = subgoals[ i ];

			subgoal.terminate();

		}

		subgoals.length = 0;

		return this;

	}

	/**
	* Returns the current subgoal. If no subgoals are defined, *null* is returned.
	*
	* @return {Goal} The current subgoal.
	*/
	currentSubgoal() {

		const length = this.subgoals.length;

		if ( length > 0 ) {

			return this.subgoals[ length - 1 ];

		} else {

			return null;

		}

	}

	/**
	* Executes the current subgoal of this composite goal.
	*
	* @return {Status} The status of this composite subgoal.
	*/
	executeSubgoals() {

		const subgoals = this.subgoals;

		// remove all completed and failed goals from the back of the subgoal list

		for ( let i = subgoals.length - 1; i >= 0; i -- ) {

			const subgoal = subgoals[ i ];

			if ( ( subgoal.completed() === true ) || ( subgoal.failed() === true ) ) {

				// if the current subgoal is a composite goal, terminate its subgoals too

				if ( subgoal instanceof CompositeGoal ) {

					subgoal.clearSubgoals();

				}

				// terminate the subgoal itself

				subgoal.terminate();
				subgoals.pop();

			} else {

				break;

			}

		}

		// if any subgoals remain, process the one at the back of the list

		const subgoal = this.currentSubgoal();

		if ( subgoal !== null ) {

			subgoal.activateIfInactive();

			subgoal.execute();

			// if subgoal is completed but more subgoals are in the list, return 'ACTIVE'
			// status in order to keep processing the list of subgoals

			if ( ( subgoal.completed() === true ) && ( subgoals.length > 1 ) ) {

				return Goal.STATUS.ACTIVE;

			} else {

				return subgoal.status;

			}

		} else {

			return Goal.STATUS.COMPLETED;

		}

	}

	/**
	* Returns true if this composite goal has subgoals.
	*
	* @return {Boolean} Whether the composite goal has subgoals or not.
	*/
	hasSubgoals() {

		return this.subgoals.length > 0;

	}

	/**
	* Returns true if the given message was processed by the current subgoal.
	*
	* @return {Boolean} Whether the message was processed or not.
	*/
	handleMessage( telegram ) {

		const subgoal = this.currentSubgoal();

		if ( subgoal !== null ) {

			return subgoal.handleMessage( telegram );

		}

		return false;

	}

	/**
	* Transforms this instance into a JSON object.
	*
	* @return {Object} The JSON object.
	*/
	toJSON() {

		const json = super.toJSON();

		json.subgoals = new Array();

		for ( let i = 0, l = this.subgoals.length; i < l; i ++ ) {

			const subgoal = this.subgoals[ i ];
			json.subgoals.push( subgoal.toJSON() );

		}

		return json;

	}

	/**
	* Restores UUIDs with references to GameEntity objects.
	*
	* @param {Map<String,GameEntity>} entities - Maps game entities to UUIDs.
	* @return {CompositeGoal} A reference to this composite goal.
	*/
	resolveReferences( entities ) {

		super.resolveReferences( entities );

		for ( let i = 0, l = this.subgoals.length; i < l; i ++ ) {

			const subgoal = this.subgoals[ i ];
			subgoal.resolveReferences( entities );

		}

		return this;

	}

}

/**
* Class for representing the brain of a game entity.
*
* @author {@link https://github.com/Mugen87|Mugen87}
* @augments CompositeGoal
*/
class Think extends CompositeGoal {

	/**
	* Constructs a new *Think* object.
	*
	* @param {GameEntity} owner - The owner of this instance.
	*/
	constructor( owner = null ) {

		super( owner );

		/**
		* A list of goal evaluators.
		* @type {Array<GoalEvaluator>}
		*/
		this.evaluators = new Array();

		//

		this._typesMap = new Map();

	}

	/**
	* Executed when this goal is activated.
	*/
	activate() {

		this.arbitrate();

	}

	/**
	* Executed in each simulation step.
	*/
	execute() {

		this.activateIfInactive();

		const subgoalStatus = this.executeSubgoals();

		if ( subgoalStatus === Goal.STATUS.COMPLETED || subgoalStatus === Goal.STATUS.FAILED ) {

			this.status = Goal.STATUS.INACTIVE;

		}

	}

	/**
	* Executed when this goal is satisfied.
	*/
	terminate() {

		this.clearSubgoals();

	}

	/**
	* Adds the given goal evaluator to this instance.
	*
	* @param {GoalEvaluator} evaluator - The goal evaluator to add.
	* @return {Think} A reference to this instance.
	*/
	addEvaluator( evaluator ) {

		this.evaluators.push( evaluator );

		return this;

	}

	/**
	* Removes the given goal evaluator from this instance.
	*
	* @param {GoalEvaluator} evaluator - The goal evaluator to remove.
	* @return {Think} A reference to this instance.
	*/
	removeEvaluator( evaluator ) {

		const index = this.evaluators.indexOf( evaluator );
		this.evaluators.splice( index, 1 );

		return this;

	}

	/**
	* This method represents the top level decision process of an agent.
	* It iterates through each goal evaluator and selects the one that
	* has the highest score as the current goal.
	*
	* @return {Think} A reference to this instance.
	*/
	arbitrate() {

		const evaluators = this.evaluators;

		let bestDesirability = - 1;
		let bestEvaluator = null;

		// try to find the best top-level goal/strategy for the entity

		for ( let i = 0, l = evaluators.length; i < l; i ++ ) {

			const evaluator = evaluators[ i ];

			let desirability = evaluator.calculateDesirability( this.owner );
			desirability *= evaluator.characterBias;

			if ( desirability >= bestDesirability ) {

				bestDesirability = desirability;
				bestEvaluator = evaluator;

			}

		}

		// use the evaluator to set the respective goal

		if ( bestEvaluator !== null ) {

			bestEvaluator.setGoal( this.owner );

		} else {

			Logger.error( 'YUKA.Think: Unable to determine goal evaluator for game entity:', this.owner );

		}

		return this;

	}

	/**
	* Transforms this instance into a JSON object.
	*
	* @return {Object} The JSON object.
	*/
	toJSON() {

		const json = super.toJSON();

		json.evaluators = new Array();

		for ( let i = 0, l = this.evaluators.length; i < l; i ++ ) {

			const evaluator = this.evaluators[ i ];
			json.evaluators.push( evaluator.toJSON() );

		}

		return json;

	}

	/**
	* Restores this instance from the given JSON object.
	*
	* @param {Object} json - The JSON object.
	* @return {Think} A reference to this instance.
	*/
	fromJSON( json ) {

		super.fromJSON( json );

		const typesMap = this._typesMap;

		this.evaluators.length = 0;
		this.terminate();

		// evaluators

		for ( let i = 0, l = json.evaluators.length; i < l; i ++ ) {

			const evaluatorJSON = json.evaluators[ i ];
			const type = evaluatorJSON.type;

			const ctor = typesMap.get( type );

			if ( ctor !== undefined ) {

				const evaluator = new ctor().fromJSON( evaluatorJSON );
				this.evaluators.push( evaluator );

			} else {

				Logger.warn( 'YUKA.Think: Unsupported goal evaluator type:', type );
				continue;

			}

		}

		// goals

		function parseGoal( goalJSON ) {

			const type = goalJSON.type;

			const ctor = typesMap.get( type );

			if ( ctor !== undefined ) {

				const goal = new ctor().fromJSON( goalJSON );

				const subgoalsJSON = goalJSON.subgoals;

				if ( subgoalsJSON !== undefined ) {

					// composite goal

					for ( let i = 0, l = subgoalsJSON.length; i < l; i ++ ) {

						const subgoal = parseGoal( subgoalsJSON[ i ] );

						if ( subgoal ) goal.subgoals.push( subgoal );

					}

				}

				return goal;

			} else {

				Logger.warn( 'YUKA.Think: Unsupported goal evaluator type:', type );
				return;

			}

		}

		for ( let i = 0, l = json.subgoals.length; i < l; i ++ ) {

			const subgoal = parseGoal( json.subgoals[ i ] );

			if ( subgoal ) this.subgoals.push( subgoal );

		}

		return this;

	}

	/**
	* Registers a custom type for deserialization. When calling {@link Think#fromJSON}
	* this instance is able to pick the correct constructor in order to create custom
	* goals or goal evaluators.
	*
	* @param {String} type - The name of the goal or goal evaluator.
	* @param {Function} constructor - The constructor function.
	* @return {Think} A reference to this instance.
	*/
	registerType( type, constructor ) {

		this._typesMap.set( type, constructor );

		return this;

	}

}
new Array();
new Array();
new Array();

let CreatureModule =
{
    packageMgr:
    {
        /**
         * Adds a new CreaturePackPlayer.
         * @param {String} fileName - The file name.
         * @returns {Boolean} Whether there is a file.
         */
        addPackLoader(fileName){},
        /**
         * Adds a new CreaturePackPlayer.
         * @param {String} fileName - The file name.
         * @returns {Number} The player id.
         */
        addPackPlayer(fileName){},
        /**
         * Removes an existing CreaturePackPlayer.
         * @param {Number} playerId - The player id.
         */
        removePackPlayer(playerId){},
        /**
         * Sets an active animation.
         * @param {Number} playerId - The player id.
         * @param {String} animationName - The animation name.
         */
        setPlayerActiveAnimation(playerId, animationName){},
        /**
         * Blends into an animation.
         * @param {Number} playerId - The player id.
         * @param {String} animationName - The animation name.
         * @param {Number} blendDelta - [0.0, 1.0]
         */
        setPlayerBlendToAnimation(playerId, animationName, blendDelta){},
        /**
         * Steps the player object.
         * @param {Number} playerId - The player id.
         * @param {Number} delta - The time delta.
         */
        stepPlayer(playerId, delta){},
        /**
         * Sets the absolute time for the player object
         * @param {Number} playerId - The player id.
         * @param {Number} currentTime - The absolute time.
         */
        setPlayerRunTime(playerId, currentTime){},
        /**
         * Gets the absolute time of a player object
         * @param {Number} playerId - The player id.
         * @returns {Number} The absolute time.
         */
        getPlayerRunTime(playerId){},
        /**
         * Applies an offset z to each mesh region.
         * @param {Number} playerId - The player id.
         * @param {Number} offsetZ - Z Offset.
         */
        applyRegionOffsetsZ(playerId, offsetZ){},
        /**
         * Gets the points of the player object.
         * @param {Number} playerId - The player id.
         * @returns {Float32Array} The points(X,Y) array.
         */
        getPlayerPoints(playerId){},
        /**
         * Gets the points of the player object.
         * @param {Number} playerId - The player id.
         * @returns {Float32Array} The points(X,Y,Z) array.
         */
        getPlayerPoints3D(playerId){},
        /**
         * Gets the colors of the player object.
         * @param {Number} playerId - The player id.
         * @returns {Uint8Array} The colors(R,G,B,A) array.
         */
        getPlayerColors(playerId){},
        /**
         * Gets the uvs of the player ocject.
         * @param {Number} playerId - The player id.
         * @returns {Float32Array} The uvs(S,T) array.
         */
        getPlayerUVs(playerId){},
        /**
         * Gets the indices of a player
         * @param {Number} playerId - The player id.
         * @returns {Float32Array} The indices array.
         */
        getPlayerIndices(playerId){},
        /**
         * Gets the bounds of a player.
         * @param {Number} playerId - The player id.
         * @returns {Array} The bounds array.
         */
        getPlayerBounds(playerId){},
        /**
         * Gets the starting time of the currently active animation
         * @param {Number} playerId - The player id.
         * @returns {Number} The absolute time.
         */
        getActiveAnimStartTime(playerId){},
        /**
         * Gets the ending time of the currently active animation
         * @param {Number} playerId - The player id.
         * @returns {Number} The absolute time.
         */    
        getActiveAnimEndTime(playerId){},
        /**
         * Gets the name of the currently active animation.
         * @param {Number} playerId - The player id.
         * @returns {String} The animation name.
         */
        getActiveAnimName(playerId){},
        /**
         * Gets the array of the animations name.
         * @param {Number} playerId - The player id.
         * @returns {Array} The animations name array.
         */
        getAllAnimNames(playerId){},
    },
    /**
     * 
     * @param {String} filePath
     * @param {Function} callback
     */
    loadFile(filePath, callback){},
    /**
     * 
     * @param {Object} wasmModule 
     * @param {Float32Array} typedArray 
     */
    heapBytes(wasmModule, typedArray){}
};
CreatureModule = globalThis.CreatureModule;

class _State extends State
{
	// Properties
	animation;

	constructor(animation)
	{
		super();

		this.animation = animation;
	}

	enter(owner)
	{
		if(!CreatureModule)
			return;
		
		CreatureModule.packageMgr.setPlayerActiveAnimation(owner.player.playerId, this.animation);
	}

	execute(owner)
	{

	}

	exit(owner)
	{

	}
}
class YukaEntity extends Vehicle
{
	// Properties
	player;
	animations;

	brain;
	stateMachine;

	currentTime;
	stateDuration;
	crossFadeDuration;

	constructor(player, animations)
    {
		super();

		this.player = player;
		this.animations = animations;

		this.brain = new Think(this);
		this.stateMachine = new StateMachine(this);

		for(let i = 0; i < this.animations.length; ++i)
		{
			let state = new _State(this.animations[i]);
			this.stateMachine.add(state.animation, state);
		}

		this.currentTime = 0;

		this.stateMachine.changeTo("default");
	}

	/**
	* This method is responsible for updating the position based on the force produced
	* by the internal steering manager.
	*
	* @param {Number} delta - The time delta.
	* @return {Vehicle} A reference to this vehicle.
	*/
    update(delta)
    {
		super.update(delta);

		this.currentTime += delta;

		this.stateMachine.update();

        return this;
    }
}

class YukaManager
{
    // Properties
    #EntityManager;

    constructor()
    {
        this.#EntityManager = new EntityManager();
    }

    Add(actor, animtions)
    {
        let entity = new YukaEntity(actor.CP, animtions);

        entity.setRenderComponent(actor, this.Sync);
        
        actor.Entity = entity;
        this.#EntityManager.add(entity);
    }

    Remove(actor)
    {
        this.#EntityManager.remove(actor.Entity);
    }

	/**
     * @param {YukaEntity} entity
	 * @param {CL3D.SceneNode} actor
	*/
    Sync(entity, actor)
    {
        entity.position;
        entity.rotation;
        entity.scale;
    }

    Update(actor, timeMs)
    {
        // delta time
        if (this.lastTime == null)
            this.lastTime = timeMs;
        
        const elapsedTime = timeMs - this.lastTime;
        this.lastTime = timeMs;

        this.#EntityManager.updateEntity(elapsedTime, actor.Entity);
    }
}

export { YukaManager };
