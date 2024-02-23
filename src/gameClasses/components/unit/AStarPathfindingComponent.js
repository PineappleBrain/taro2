class AStarPathfindingComponent extends TaroEntity {
	classId = 'AStarPathfindingComponent';
	componentId = 'a*';
    constructor(unit) {
        super();
		this._entity = unit;
    }
}

if (typeof (module) !== 'undefined' && typeof (module.exports) !== 'undefined') {
	module.exports = AStarPathfindingComponent;
}
