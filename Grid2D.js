import * as THREE from 'three';

export class Grid2D extends THREE.LineSegments {

	constructor( size = 1, divisions = 1, color = 0x888888, corner = new THREE.Vector3() ) {

		// const center = divisions / 2;
		const step = size / divisions;
		// const halfSize = size / 2;

		const vertices = [], colors = [];

		for ( let i = 0, j = 0, k = corner.x; i <= divisions; i ++, k += step ) {

			vertices.push( corner.x, k, 0, corner.x + size, k, 0 );
			vertices.push( k, corner.y, 0, k, corner.y + size, 0 );

		}

		const geometry = new THREE.BufferGeometry();
		geometry.setAttribute( 'position', new THREE.Float32BufferAttribute( vertices, 3 ) );
		geometry.setAttribute( 'color', new THREE.Float32BufferAttribute( colors, 3 ) );

		const material = new THREE.LineBasicMaterial( { color: color, linewidth: 2 } );

		super( geometry, material );

		this.type = 'Grid2D';

	}

	dispose() {

		this.geometry.dispose();
		this.material.dispose();

	}

}