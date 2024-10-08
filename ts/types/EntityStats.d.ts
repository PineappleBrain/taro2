declare interface EntityStats {
	clientId: string;
	controlledBy: string;
	ownerId: string;
	selectedUnitId: string | number | object;
	userId: string;
	defaultData: any;
	isMobile: boolean;
	slotIndex?: number;
	name: string;
	nameLabelColor?: string;
	currentBody: {
		jointType: string;
		width: number;
		height: number;
		depth: number;
	};
	cellSheet: {
		columnCount: number;
		rowCount: number;
		url: string;
	};
	stateId: string;
	states: Record<
		string,
		{
			animation: string;
		}
	>;
	animations: Record<
		string,
		{
			frames: number[];
			framesPerSecond: number;
			loopCount: number;
			name: string;
			threeAnimationKey: string;
		}
	>;
	default?: {
		id: string;
		x: number;
		y: number;
		z?: number;
		width: number;
		height: number;
		depth?: number;
		inside?: string;
		alpha?: number;
	};
	type: string;
	id: string;
	itemTypeId?: string;
	flip: FlipMode;
	instancedMesh: boolean | undefined;
	controls: {
		mouseBehaviour: any;
		abilities: Record<string, ControlAbility>;
		unitAbilities: Record<string, UnitAbility>;
	};
	ownerUnitId: string;
	cameraPointerLock?: boolean;
	cameraPitchRange?: { min: number; max: number };
	cameraOffset?: { x: number; y: number; z: number };
	is3DObject?: boolean;
	shadow?: boolean;
}
