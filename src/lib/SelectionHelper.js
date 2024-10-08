class SelectionHelper {

	constructor(renderer) {

		this.element = document.createElement('div');
		this.element.style.pointerEvents = 'none';
		this.element.style.border = '1px solid #55aaff';
		this.element.style.backgroundColor = 'rgba(75, 160, 255, 0.3)';
		this.element.style.position = 'fixed';
		// this.element.style.border = 'none';
		this.renderer = renderer;

		this.startPoint = new THREE.Vector2();
		this.pointTopLeft = new THREE.Vector2();
		this.pointBottomRight = new THREE.Vector2();

		this.isDown = false;

		this.onPointerDown = function (event) {

			if (event.button !== 0) return;
			this.isDown = true;
			this.onSelectStart(event);

		}.bind(this);

		this.onPointerMove = function (event) {

			if (this.isDown) {

				this.onSelectMove(event);

			}

		}.bind(this);

		this.onPointerUp = function (event, forceToEnd) {

			if (event?.button !== 0 && !forceToEnd) return;

			this.isDown = false;
			this.onSelectOver();

		}.bind(this);

	}

	dispose() {
	}

	onSelectStart(event) {

		this.element.style.display = 'none';

		this.renderer.domElement.parentElement.appendChild(this.element);

		this.element.style.left = event.clientX + 'px';
		this.element.style.top = event.clientY + 'px';
		this.element.style.width = '0px';
		this.element.style.height = '0px';

		this.startPoint.x = event.clientX;
		this.startPoint.y = event.clientY;

	}

	onSelectMove(event) {

		this.element.style.display = 'block';

		this.pointBottomRight.x = Math.max(this.startPoint.x, event.clientX);
		this.pointBottomRight.y = Math.max(this.startPoint.y, event.clientY);
		this.pointTopLeft.x = Math.min(this.startPoint.x, event.clientX);
		this.pointTopLeft.y = Math.min(this.startPoint.y, event.clientY);

		this.element.style.left = this.pointTopLeft.x + 'px';
		this.element.style.top = this.pointTopLeft.y + 'px';
		this.element.style.width = (this.pointBottomRight.x - this.pointTopLeft.x) + 'px';
		this.element.style.height = (this.pointBottomRight.y - this.pointTopLeft.y) + 'px';

	}

	onSelectOver() {

		this.element.parentElement?.removeChild(this.element);

	}

}
