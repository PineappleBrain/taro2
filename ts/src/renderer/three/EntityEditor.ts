namespace Renderer {
	export namespace Three {
		export class EntityEditor {
			activeEntityPlacement: boolean;
			preview: Renderer.Three.AnimatedSprite | Renderer.Three.Model;
			previewGroup: THREE.Group = new THREE.Group();
			gizmo: EntityGizmo;
			entityGroup: THREE.Group[];
			activeEntity: { id: string; player: string; entityType: string, action?: ActionData, is3DObject?: boolean, offset?: THREE.Vector3 }[];
			selectedEntities: (InitEntity | Region | THREE.Group)[];
			selectedGroup: THREE.Group;
			selectedEntitiesMinMaxCenterPos: { min: THREE.Vector3, max: THREE.Vector3, center: THREE.Vector3 } = { min: new THREE.Vector3(Infinity, Infinity, Infinity), max: new THREE.Vector3(-Infinity, -Infinity, -Infinity), center: new THREE.Vector3(0, 0, 0) }
			copiedEntity: InitEntity;
			static TAG = "selectedGroup"
			constructor() {
				this.preview = undefined;
				this.entityGroup = [];
				this.selectedEntities = [];
				this.selectedGroup = new THREE.Group();
				(this.selectedGroup as any).tag = Three.EntityEditor.TAG;
				const renderer = Renderer.Three.instance();
				renderer.initEntityLayer.add(this.selectedGroup);
				renderer.initEntityLayer.add(this.previewGroup);
				this.activatePlacement(false);
				this.gizmo = new EntityGizmo();
				taro.client.on('add-entities', () => {
					this.selectEntity(null);
					this.activatePlacement(true);
				});
				taro.client.on('cursor', () => {
					this.activatePlacement(false);
				});
				taro.client.on('draw-region', () => {
					this.selectEntity(null);
					this.activatePlacement(false);
				});
				taro.client.on('brush', () => {
					this.selectEntity(null);
					this.activatePlacement(false);
				});
				taro.client.on('empty-tile', () => {
					this.selectEntity(null);
					this.activatePlacement(false);
				});
				taro.client.on('fill', () => {
					this.selectEntity(null);
					this.activatePlacement(false);
				});
				taro.client.on('clear', () => {
					this.selectEntity(null);
				});
				taro.client.on('updateActiveEntity', () => {
					this.activeEntity = [inGameEditor.getActiveEntity && inGameEditor.getActiveEntity()];
					this.updatePreview();
				});
				const initEntities = renderer.entityManager.initEntities;
				taro.client.on('editInitEntity', (data: ActionData) => {
					let found = false;
					initEntities.forEach((initEntity) => {
						if (initEntity.action.actionId === data.actionId) {
							found = true;
							initEntity.updateAction(data);
						}
					});
					if (!found) {
						renderer.createInitEntity(data);
					}
				});
				taro.client.on('updateInitEntities', () => {
					taro.developerMode.initEntities.forEach((action) => {
						let found = false;
						initEntities.forEach((initEntity) => {
							if (initEntity.action.actionId === action.actionId) {
								found = true;
								initEntity.updateAction(action);
							}
						});
						if (!found) {
							renderer.createInitEntity(action);
						}
					});
				});

				window.addEventListener('keydown', (event) => {
					const renderer = Renderer.Three.instance();
					if (event.key === 'Delete' || event.key === 'Backspace') {
						this.deleteEntity();
					}
					if (event.key === 'c' && event.ctrlKey && this.selectedEntities.some((e) => e instanceof InitEntity)) {



						setTimeout(() => {

							console.log(this.selectedEntities)
							this.activeEntity = this.selectedEntities.filter((e) => e instanceof InitEntity).map((e: InitEntity) => {
								const action = e.action
								return {
									id: action.entity,
									player: action.player.variableName,
									entityType: action.entityType,
									action: action,
									is3DObject: e.isObject3D,
									offset: e.offset
								}
							}).filter(e => e !== null)
							console.log(this.activeEntity)
							this.selectEntity(null);
							this.activatePlacement(true);
							this.updatePreview();
							(window as any).selectTool('add-entities');
						}, 0)

					}
					if (event.key === 'a' && event.ctrlKey) {
						this.selectedEntities = []
						renderer.initEntityLayer.children.slice().forEach((e) => {
							this.selectEntity(e as any, 'addOrRemove');
						})
					}
					if (event.key === 'G' && event.shiftKey) {
						this.selectedEntities.slice().forEach((e) => {
							this.selectEntity(e as any, 'addOrRemove');
						})
					}
				});
			}

			activatePlacement(active: boolean): void {
				if (active) {
					//show entities list
					this.activeEntityPlacement = true;
					inGameEditor.toggleEntityPlacementWindow && inGameEditor.toggleEntityPlacementWindow(true);
				} else {
					//hide entities list
					this.activeEntityPlacement = false;
					inGameEditor.toggleEntityPlacementWindow && inGameEditor.toggleEntityPlacementWindow(false);
				}
			}

			updatePreview(): void {
				this.previewGroup.clear();
				const renderer = Renderer.Three.instance();
				if (this.activeEntity.length === 0) {
					if (this.previewGroup) {
						this.previewGroup.visible = false;
					}
					return;
				} else {
					this.previewGroup.visible = true;
				}

				this.activeEntity.forEach((entityData) => {
					console.log(entityData)
					if (entityData !== null) {
						const entity = taro.game.data[entityData.entityType] && taro.game.data[entityData.entityType][entityData.id];
						let height: number;
						let width: number;
						let depth: number;
						let key: string;
						let newPreview;
						if (entityData.entityType === 'unitTypes') {
							key = `${entity.cellSheet.url}`;
							if (entity.bodies?.default) {
								height = entity.bodies.default.height;
								width = entity.bodies.default.width;
								depth = entity.bodies.default.depth;
							} else {
								console.log('no default body for unit', entityData.id);
								return;
							}
						} else if (entityData.entityType === 'itemTypes') {
							key = `${entity.cellSheet.url}`;
							if (entity.bodies?.dropped) {
								height = entity.bodies.dropped.height;
								width = entity.bodies.dropped.width;
								depth = entity.bodies.dropped.depth;
							} else {
								console.log('no dropped body for item', entityData.id);
								return;
							}
						} else if (entityData.entityType === 'projectileTypes') {
							key = `${entity.cellSheet.url}`;
							if (entity.bodies?.default) {
								height = entity.bodies.default.height;
								width = entity.bodies.default.width;
								depth = entity.bodies.default.depth;
							} else {
								console.log('no default body for projectile', entityData.id);
								return;
							}
						}
						if (entityData.action && entityData.action.scale) {
							height *= entityData.action.scale.z;
							width *= entityData.action.scale.x;
							depth *= entityData.action.scale.y;
						}
						const cols = entity.cellSheet.columnCount || 1;
						const rows = entity.cellSheet.rowCount || 1;
						if (entity.is3DObject) {
							newPreview = new Renderer.Three.Model(key);
							newPreview.setSize(Utils.pixelToWorld(width), Utils.pixelToWorld(depth), Utils.pixelToWorld(height));
							newPreview.setOpacity(0.5);
							if (entityData.action && entityData.action.rotation) {
								newPreview.rotation.set(
									THREE.MathUtils.degToRad(entityData.action.rotation.x),
									THREE.MathUtils.degToRad(entityData.action.rotation.y),
									THREE.MathUtils.degToRad(entityData.action.rotation.z)
								);
							}
							this.previewGroup.add(newPreview);
						} else {
							const tex = gAssetManager.getTexture(key).clone();
							const frameWidth = tex.image.width / cols;
							const frameHeight = tex.image.height / rows;
							const texture = new TextureSheet(key, tex, frameWidth, frameHeight);

							newPreview = new Renderer.Three.AnimatedSprite(texture) as Renderer.Three.AnimatedSprite;
							newPreview.setBillboard(entity.isBillboard, renderer.camera);
							newPreview.scale.set(Utils.pixelToWorld(width), 1, Utils.pixelToWorld(height));
							newPreview.setOpacity(0.5);

							this.previewGroup.add(newPreview);
						}
						if (entityData.offset) {
							newPreview.position.set(entityData.offset.x, entityData.offset.y, entityData.offset.z);
						}
					}

				})




			}

			resetMinMax() {
				this.selectedEntitiesMinMaxCenterPos.max.set(-Infinity, -Infinity, -Infinity)
				this.selectedEntitiesMinMaxCenterPos.min.set(Infinity, Infinity, Infinity)
			}

			calcMinMaxPosition() {
				this.resetMinMax();
				this.selectedEntitiesMinMaxCenterPos.center.copy(this.selectedGroup.position);
				this.selectedEntities.forEach((e) => {
					let nowPos = e.position.clone();
					if ((e.parent as any).tag === Three.EntityEditor.TAG) {
						nowPos.add(e.parent.position);
					}
					this.selectedEntitiesMinMaxCenterPos.min.min(nowPos);
					this.selectedEntitiesMinMaxCenterPos.max.max(nowPos);
				})
				const positions = this.selectedEntitiesMinMaxCenterPos;
				const prevCenterPos = positions.center.clone();
				positions.center.set((positions.min.x + positions.max.x) / 2, (positions.min.y + positions.max.y) / 2, (positions.min.z + positions.max.z) / 2)
				const offsetPos = prevCenterPos.sub(positions.center)
				this.selectedEntities.forEach((e) => {
					this.showOrHideOutline(e, true)
					if ((e.parent as any).tag === Three.EntityEditor.TAG) {
						e.position.add(offsetPos)
					} else {
						e.position.sub(positions.center)
						this.selectedGroup.add(e)
					}
				})
				return positions
			}

			update(): void {
				const renderer = Renderer.Three.instance();
				if (this.activeEntityPlacement && this.previewGroup) {
					const worldPoint = renderer.raycastFloor(0);
					if (worldPoint) {
						this.previewGroup.position.setX(worldPoint.x);
						this.previewGroup.position.setY(Renderer.Three.getVoxels().calcLayersHeight(0) + 0.1);
						this.previewGroup.position.setZ(worldPoint.z);
					}
					this.previewGroup.children.forEach((child) => {
						if (child instanceof Renderer.Three.AnimatedSprite) {
							child.setBillboard(child.billboard, renderer.camera);
						}
					})
				}
				renderer.initEntityLayer.children.forEach((e: any) => {
					this.updateGroupOrEntity(e)
				})
			}

			updateGroupOrEntity(e: THREE.Group | THREE.Object3D) {
				if ((e as any).tag === Three.EntityEditor.TAG) {
					e.children.forEach((e_child) => {
						this.updateGroupOrEntity(e_child)
					})
				} else {
					(e as any).update?.();
				}
			}

			getLastSelectedEntity() {
				return this.selectedEntities[
					this.selectedEntities.length - 1
				]
			}

			showOrHideOutline(e: any, show: boolean) {
				if ((e as any).tag === Three.EntityEditor.TAG) {
					e.children.forEach((e_child) => {
						this.showOrHideOutline(e_child, show)
					})
				} else {
					if (e.body?.sprite !== undefined) {
						e.body.sprite.children[0].visible = show;
					}
				}
			}
			selectEntity(entity: InitEntity | Region, mode: 'addOrRemove' | 'select' = 'select'): void {
				const renderer = Renderer.Three.instance();
				if (entity === null) {
					this.selectedEntities = [];
					this.gizmo.control.detach();
					renderer.initEntityLayer.children.forEach((e) => {
						this.showOrHideOutline(e, false)
					})
					taro.client.emit('show-transform-modes', false);
					return;
				}
				taro.client.emit('show-transform-modes', true);
				switch (mode) {
					case 'select':
						{
							if ((entity.parent as any)?.tag !== Three.EntityEditor.TAG) {
								this.selectedEntities = [entity];
								this.gizmo.attach(entity);
								this.showOrHideOutline(entity, true)
							} else {
								this.selectedEntities = entity.parent.children as any;
								this.selectedGroup = entity.parent as any;
								this.selectedEntities.forEach((e) => {
									this.showOrHideOutline(e, true);
								})
								this.gizmo.attach(entity.parent);
							}
							break;
						}
					case 'addOrRemove': {
						let remove = false;
						if (this.selectedEntities.find((e) => e.uuid === entity.uuid) === undefined) {
							this.selectedEntities.push(entity);
						} else {
							remove = true;
							this.selectedEntities = this.selectedEntities.filter((e) => e.uuid !== entity.uuid)
							this.selectedGroup.remove(entity);
							renderer.initEntityLayer.add(entity);
						}
						const minMaxPos = this.calcMinMaxPosition()
						if (remove) {
							this.showOrHideOutline(entity, false);
							entity.position.add(this.selectedGroup.position);
							entity.scale.multiply(this.selectedGroup.scale);
							entity.rotation.set(this.selectedGroup.rotation.x + entity.rotation.x, this.selectedGroup.rotation.y + entity.rotation.y, this.selectedGroup.rotation.z + entity.rotation.z,)
						}
						if (this.selectedEntities.length === 0) {
							this.gizmo.control.detach();
							taro.client.emit('show-transform-modes', false);
						} else {
							this.selectedGroup.position.copy(minMaxPos.center);
							this.gizmo.attach(this.selectedGroup);
						}
						break;
					}
				}

			}

			deleteEntity(): void {
				this.selectedEntities.forEach((e) => {
					if ((e as any).tag === Three.EntityEditor.TAG) {
						e.children.forEach((e_child: any) => e_child.delete())
					}
					if (e instanceof InitEntity) {
						e.delete();
					} else {
						if (e instanceof Region) {
							const data = {
								name: e.taroEntity._stats.id,
								delete: true,
							};
							const nowData = JSON.stringify(data)
							const nowTransformData = JSON.stringify(e.stats)
							const renderer = Renderer.Three.instance();

							renderer.voxelEditor.commandController.addCommand({
								func: () => {
									const data = JSON.parse(nowData)
									inGameEditor.updateRegionInReact && !window.isStandalone && inGameEditor.updateRegionInReact(data, 'threejs');
								},
								undo: () => {
									const transformData = JSON.parse(nowTransformData);
									// TODO: no need to show the modal here
									inGameEditor.addNewRegion &&
										inGameEditor.addNewRegion({
											name: '',
											x: transformData.x,
											y: transformData.y,
											width: transformData.width,
											height: transformData.height,
											create: true,
										});
								}
							}, true)
						}
					}
				})
				this.selectEntity(null);
			}
		}
	}
}
