namespace Renderer {
	export namespace Three {
		export class Model extends Node {
			private scene: THREE.Group;
			private aabb = new THREE.Box3();
			private size = new THREE.Vector3();
			private center = new THREE.Vector3();
			private originalSize = new THREE.Vector3();
			private originalScale = new THREE.Vector3();

			constructor(name: string) {
				super();

				const model = gAssetManager.getModel(name);
				this.scene = SkeletonUtils.clone(model.scene);
				this.add(this.scene);

				this.scaleSceneToFitWithinUnits(1);
			}

			getSize() {
				this.aabb.setFromObject(this.scene);
				return this.aabb.getSize(this.size);
			}

			setSize2D(x: number, z: number) {
				this.scene.scale.x = this.originalScale.x * (x / this.originalSize.x);
				this.scene.scale.z = this.originalScale.z * (z / this.originalSize.z);
			}

			getCenter() {
				this.aabb.setFromObject(this.scene);
				return this.aabb.getCenter(this.center);
			}

			private scaleSceneToFitWithinUnits(units: number) {
				const size = this.getSize();
				const scale = units / Math.max(...size.toArray());
				this.scene.scale.setScalar(scale);
				this.originalSize.copy(this.getSize());
				this.originalScale.copy(this.scene.scale);
			}
		}
	}
}
