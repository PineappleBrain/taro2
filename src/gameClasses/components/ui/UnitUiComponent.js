var UnitUiComponent = TaroEntity.extend({
	classId: 'UnitUiComponent',
	componentId: 'unitUi',

	init: function (entity, options) {
		var self = this;
		self._entity = entity;
	},

	updateAllAttributeBars: function () {
		var self = this;

		var attributes = self._entity._stats.attributes; // get unit's attribute types
		// assign "type" variable to attributes
		for (var attributeId in attributes) {
			attributes[attributeId].type = attributeId;
		}

		if (taro.isClient && taro.network.id() == self._entity._stats.clientId) {
			// var attributeContainerComponent = self._entity.getAttributeBarContainer()
			var ownerPlayer = self._entity.getOwner();
			var belongsToSelectedUnit = ownerPlayer && ownerPlayer._stats && ownerPlayer._stats.selectedUnitId === self._entity.id();

			if (belongsToSelectedUnit) {
				$('#attribute-bars').html('');
			}

			var isAttributeBarPresent = false;
			for (var attributeTypeId in attributes) {
				// if (attributeContainerComponent) {
				// 	attributeContainerComponent.updateBar(attributeTypeId, attributes[attributeTypeId])
				// }

				if (belongsToSelectedUnit) {
					var attribute = attributes[attributeTypeId];
					if (
						attribute.isVisible && (
							attribute.isVisible === true || // for old deprecated method of showing attr bar
							(attribute.isVisible.indexOf && attribute.isVisible.indexOf('centerBar') > -1)
						)
					) {
						isAttributeBarPresent = true;
						var width = (attribute.value / attribute.max) * 100;

						var bar = $('<div/>', {
							class: 'progress'
						}).append(
							$('<div/>', {
								class: `label progress-label player-${attributeTypeId}`,
								style: 'position: absolute; margin-top: 3px; width: 100%; color: black; font-size: 14px'
							})
						).append(
							$('<div/>', {
								class: `player-max-${attributeTypeId} progress-bar progress-bar-info`,
								role: 'progressbar',
								'aria-valuemin': '0',
								'aria-valuemax': '100',
								style: `width: ${width}%;font-weight:bold;transition:none; background-color:${attribute.color}`
							})
						);

						$('#attribute-bars').append(bar);
					}
				}

				self._entity.attribute.refresh();
			}
			if (isAttributeBarPresent) {
				$('#attribute-bars').css({
					minWidth: '200px'
				});
			}
		}
	},
	removeAllAttributeBars: function () {
		var self = this;
		if (taro.isClient && taro.network.id() == self._entity._stats.clientId) {
			$('#attribute-bars').html('');
		}
	},
	// update one attribute bar
	updateAttributeBar: function (attr) {
		var self = this;

		// only update attributes for this unit
		if (self._entity && self._entity._stats.clientId != taro.network.id()) {
			return;
		}
		var attributeTypes = taro.game.data.attributeTypes;
		if (attributeTypes == undefined || attr == undefined)
			return;

		var name = attributeTypes[attr.type] ? attributeTypes[attr.type].name : attr.name;

		// self._entity.updateAttributeBar(attr); // updating UnitBars from HTML Bar???

		if (
			attr.isVisible && (
				attr.isVisible === true || // for old deprecated method of showing attr bar
				(attr.isVisible.indexOf && attr.isVisible.indexOf('centerBar') > -1)
			)
		) {
			if (attr.value % 1 === 0) {
				attr.value = parseInt(attr.value);
			} else {
				if (attr.decimalPlaces != undefined && attr.decimalPlaces != null) {
					var decimalPlace = parseInt(attr.decimalPlaces);
					if (decimalPlace != NaN) {
						attr.value = parseFloat(attr.value).toFixed(decimalPlace);
					} else {
						attr.value = parseFloat(attr.value).toFixed(2);
					}
				} else {
					attr.value = parseFloat(attr.value).toFixed(2);
				}
			}

			var value = null;
			if (attr.dataType === 'time') {
				value = taro.game.secondsToHms(attr.value);
			} else {
				value = attr.value;
			}

			$(`.player-${attr.type}`).text(attr.displayValue ? `${name}: ${value}/${parseFloat(attr.max).toFixed(0)}` : name);
			var widthInPercent = (attr.value / attr.max) * 100;

			$(`.player-max-${attr.type}`).stop().animate({
				width: `${widthInPercent}%`
			});
		}
	},

	getAbilityDiv: function (ability, options, slotIndex) {
		var self = this;
		// if (ability) {
		// 	var abilityStats = ability._stats;
		// 	if (abilityStats) {
		// 		var abilityDetail = $('<div/>', {
		// 			style: 'font-size: 16px; width: 250px;',
		// 			html: this.getAbilityHtml(abilityStats)
		// 		});

		// 		var abilityQuantity = ability._stats.quantity !== undefined ? ability._stats.quantity : '';
		// 		// || ability._stats.maxQuantity === null
		// 		if ((ability._stats.quantity == 1 && ability._stats.maxQuantity == 1) || ability._stats.quantity === null) {
		// 			abilityQuantity = '';
		// 		}

		// 		var img = abilityStats.inventoryImage || (abilityStats.cellSheet ? abilityStats.cellSheet.url : '');
		// 		var mobileClass = taro.isMobile ? 'height:17px;max-width:20px;object-fit:contain' : 'height:30px;max-width:27px;object-fit:contain';
		// 		var isTrading = options.isTrading;
		// 		if (img) {
		// 			var abilityDiv = $('<div/>', {
		// 				id: `ability-slotindex-${slotIndex}`,
		// 				class: 'ability-div draggable-ability',
		// 				style: 'height:100%',
		// 				role: 'button',
		// 				html: `<div class='${!isTrading ? 'absolute-center' : ''}'><img src='${img}' style='${mobileClass}'/></div><small class='quantity'>${!isNaN(parseFloat(abilityQuantity)) && parseFloat(abilityQuantity) || abilityQuantity}</small>`,
		// 				'data-container': 'body',
		// 				'data-toggle': 'popover',
		// 				'data-placement': options.popover || 'left',
		// 				'data-content': abilityDetail.prop('outerHTML')
		// 			})
		// 				.popover({
		// 					html: true,
		// 					animation: false,
		// 					trigger: 'manual'
		// 				});
		// 		}
		// 	}
		// } else {
			
			var mobileClass = taro.isMobile ? 'height:30px;max-width:30px;object-fit:contain' : 'height:38px;max-width:38px;object-fit:contain;border-radius:0.25rem';
			let img = ($(`#ability-${slotIndex}`).attr('triggerKey').includes('e')) ? 'https://game-icons.net/icons/ffffff/000000/1x1/caro-asercion/warlord-helmet.svg' : 'https://game-icons.net/icons/ffffff/000000/1x1/caro-asercion/badger.svg';
			if (true) {
				var abilityDiv = $('<div/>', {
					id: `ability-slotindex-${slotIndex}`,
					class: 'ability-div draggable-ability',
					style: 'height:100%; position: relative',
					role: 'button',
					html: `<div class='absolute-center'><img src='${img}' style='${mobileClass}'/></div>`,
					// 'data-container': 'body',
					// 'data-toggle': 'popover',
					// 'data-placement': options.popover || 'left',
					// 'data-content': abilityDetail.prop('outerHTML')
				})
			} else {
				var abilityDiv = $('<div/>', {
					id: `ability-slotindex-${slotIndex}`,
					class: 'ability-div draggable-ability',
					style: 'height:100%',
					role: 'button'
				});
			}
			if (options.isDraggable && abilityDiv) {
				abilityDiv.draggable({
					revert: 'invalid',
					cursor: 'move',
					// helper: "clone",
					zIndex: 10000,
					containment: 'window',
					appendTo: 'body',
					start: function (event, ui) { // when being dragged, disable popover. it doesn't need to be enabled later, because updateInventory overwrites popover div
						$('.popover').popover('disable');
					}
				}).droppable({
					drop: function (event, ui) {
						var draggable = ui.draggable; var droppable = $(this);
						var dragPos = draggable.position(); var dropPos = droppable.position();

						draggable.css({
							// left: dropPos.left + 'px',
							// top: dropPos.top + 'px'
							left: 0, top: 0
						});
	
						droppable.css({
							// left: dragPos.left + 'px',
							// top: dragPos.top + 'px'
							left: 0, top: 0
						});

						if (!ui.draggable[0].parentElement.id.includes('ability-') || !droppable[0].parentElement.id.includes('ability-')) {
							// wrong category
							return;
						}
						
						var fromIndex = parseFloat(ui.draggable[0].parentElement.id.replace('ability-', ''));
						// var isTradingAbilityDragged = ui.draggable[0].parentElement.name.include('trade');
						var toIndex = parseFloat(droppable[0].parentElement.id.replace('ability-', ''));
						// var isAbilityDroppedOnTradeSlot = droppable[0].parentElement.name.include('trade');
						

						// store a copy of froms ability and key
						let tempAbility = $(`#ability-${fromIndex}`).attr('ability');
						let tempAbilityTriggerKey = $(`#ability-${fromIndex}`).attr('triggerKey');

						// update the ability and triggerkey of from component to the to component
						$(`#ability-${fromIndex}`).attr('ability', $(`#ability-${toIndex}`).attr('ability'));
						$(`#ability-${fromIndex}`).attr('triggerKey', $(`#ability-${toIndex}`).attr('triggerKey'));

						// recreate ability slot of from component
						self.updateAbilitySlot($(`#ability-${toIndex}`).attr('ability'), fromIndex, $(`#ability-${toIndex}`).attr('triggerKey'));
						
						// update click event of from component
						$(`#ability-${fromIndex}`).off('click').on('click', function () {
							if (taro.client.myPlayer) {
								taro.client.myPlayer.control.keyDown('key', $(`#ability-${fromIndex}`).attr('triggerKey'));
							}
						})
						
						// update the ability and triggerkey of to component to the temp component (old from component)
						$(`#ability-${toIndex}`).attr('ability',tempAbility);
						$(`#ability-${toIndex}`).attr('triggerKey', tempAbilityTriggerKey);

						// recreate ability slot of to component
						self.updateAbilitySlot(tempAbility, toIndex, tempAbilityTriggerKey);

						// update click event of to component
						$(`#ability-${toIndex}`).off('click').on('click', function () {
							if (taro.client.myPlayer) {
								taro.client.myPlayer.control.keyDown('key', tempAbilityTriggerKey);
							}
						})
						// swapping order of ability doesn't matter, no need to tell server (for now)
					}
				});
			}
		// }
		// if (options.isDraggable && abilityDiv) {
		// 	abilityDiv.draggable({
		// 		revert: 'invalid',
		// 		cursor: 'move',
		// 		// helper: "clone",
		// 		zIndex: 10000,
		// 		containment: 'window',
		// 		appendTo: 'body',
		// 		start: function (event, ui) { // when being dragged, disable popover. it doesn't need to be enabled later, because updateInventory overwrites popover div
		// 			$('.popover').popover('disable');
		// 		}
		// 	}).droppable({
		// 		drop: function (event, ui) {
		// 			var draggable = ui.draggable; var droppable = $(this);
		// 			var dragPos = draggable.position(); var dropPos = droppable.position();
		// 			var fromIndex = parseFloat(ui.draggable[0].parentElement.id.replace('ability-', ''));
		// 			// var isTradingAbilityDragged = ui.draggable[0].parentElement.name.include('trade');
		// 			var toIndex = parseFloat(droppable[0].parentElement.id.replace('ability-', ''));
		// 			// var isAbilityDroppedOnTradeSlot = droppable[0].parentElement.name.include('trade');
		// 			draggable.css({
		// 				// left: dropPos.left + 'px',
		// 				// top: dropPos.top + 'px'
		// 				left: 0, top: 0
		// 			});

		// 			droppable.css({
		// 				// left: dragPos.left + 'px',
		// 				// top: dragPos.top + 'px'
		// 				left: 0, top: 0
		// 			});

		// 			var selectedUnit = taro.client.myPlayer.getSelectedUnit();
		// 			var abilities = selectedUnit._stats.abilityIds;

		// 			var fromAbility = taro.$(abilities[fromIndex]);
		// 			var toAbility = taro.$(abilities[toIndex]);
		// 			if (fromAbility) {
		// 				fromAbility.stopUsing();
		// 			}

		// 			if (toAbility) {
		// 				toAbility.stopUsing();
		// 			}

		// 			taro.network.send('swapInventory', { from: fromIndex, to: toIndex });

		// 			var tempAbility = abilities[fromIndex];
		// 			abilities[fromIndex] = abilities[toIndex];
		// 			abilities[toIndex] = tempAbility;

		// 			var totalInventorySlot = selectedUnit._stats.inventorySize;
		// 			if (taro.client.myPlayer.isTrading && (fromIndex >= totalInventorySlot || toIndex >= totalInventorySlot)) {
		// 				taro.tradeUi.sendOfferingAbilities();
		// 			}
		// 		}
		// 	});
		// }
		return abilityDiv;

		return $('<div/>', {
			style: 'font-size: 16px; width: 250px;',
			html: ''
		});
	},

	updateAbilitySlot: function (ability, slotIndex, slotKey) {
		$(`#ability-${slotIndex}`).html(
			this.getAbilityCooldownOverlay(slotIndex).add(
				this.getAbilityDiv(ability, {
					popover: 'top',
					isDraggable: true,
					isPurchasable: false
				}, slotIndex)
			)
		);

		$(`#ability-key-stroke-${slotIndex}`).html(
			`<p class='m-0'><small style='font-weight:900;color: white;padding: 0px 5px;'>${slotKey.toUpperCase()}</small></p>`
		);
	},

	getAbilityCooldownOverlay: function (slotIndex) {
		let abilityCDDiv = $('<div/>', {
			id: `ability-cooldown-overlay-${slotIndex}`,
			class: 'ability-cooldown-overlay ',
			style: 'position: absolute; bottom: 0; width: 100%; height: 0; background-color: #101010aa; z-index: 10001; pointer-events: none', /* higher than ability-div */
		});
		return abilityCDDiv;
	},

	// updateAbilityCooldownOverlay: function (ability) {
	// 	let abilityStats = ability._stats;
	// 	let cdPercent = Math.trunc((1 - Math.min((taro.now - abilityStats.lastUsed) / abilityStats.fireRate, 1)) * 100);
	// 	$(`#ability-cooldown-overlay-${abilityStats.slotIndex}`).css('height', `${cdPercent}%`);
	// },

});

if (typeof (module) !== 'undefined' && typeof (module.exports) !== 'undefined') { module.exports = UnitUiComponent; }
