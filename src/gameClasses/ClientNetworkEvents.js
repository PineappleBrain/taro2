var ClientNetworkEvents = {
	_onClientDisconnect: function (data) {
		var clientId = data.clientId;
		// if it's me that got disconnected!
		if (clientId == taro.network.id()) {
			$('#disconnect-reason').html(data.reason);
			taro.menuUi.onDisconnectFromServer('clientNetworkEvents #10', data.reason);
			taro.network._io._disconnectReason = data.reason;
		}

		console.log('somebody else disconnected');
	},

	_onStreamUpdateData: function (data) {
		const runAction = functionalTryCatch(() => {
			for (entityId in data) {
				if (taro.client.entityUpdateQueue[entityId] == undefined) {
					taro.client.entityUpdateQueue[entityId] = {};
				}

				var stats = data[entityId];

				for (key in stats) {
					if (
						[
							'attributes',
							'attributesMin',
							'attributesMax',
							'attributesRegenerateRate',
							'variables',
							'quests',
						].includes(key)
					) {
						value = stats[key];
						// without this, these keys will have their values overwritten by every subsequent stream data msg on this engine step
						taro.client.entityUpdateQueue[entityId][key] = _.merge(taro.client.entityUpdateQueue[entityId][key], value);
					} else {
						value = stats[key];
						taro.client.entityUpdateQueue[entityId][key] = value; // overwrite the value if the same key already exists
					}
				}
			}
		});
		if (runAction[0] !== null) {
			// console.error(runAction[0]);
		}
	},

	_onTeleport: function (data) {
		const runAction = functionalTryCatch(() => {
			var entity = taro.$(data.entityId);
			if (entity && data.position) {
				// console.log("teleporting",data.entityId , " to", data.position)
				entity.teleportTo(data.position[0], data.position[1], data.position[2]);
			}
		});
		if (runAction[0] !== null) {
			// console.error(runAction[0]);
		}
	},

	// entity update data was sent to specific clients
	_streamUpdateDataToClients: function (data) {
		const runAction = functionalTryCatch(() => {
			if (data.entityId) {
				var entity = taro.$(data.entityId);
				if (entity) {
					entity.queueStreamUpdateData(data.entityId, data.key, data.value);
				}
			}
		});
		if (runAction[0] !== null) {
			// console.error(runAction[0]);
		}
	},

	_onChangePlayerCameraPanSpeed: function (data) {
		const runAction = functionalTryCatch(() => {
			if (data.panSpeed !== undefined) {
				taro.client.myPlayer.changeCameraPanSpeed(data.panSpeed);
			}
		});
		if (runAction[0] !== null) {
			// console.error(runAction[0]);
		}
	},

	_onHideUnitFromPlayer: function (data) {
		const runAction = functionalTryCatch(() => {
			if (data.unitId) {
				taro.client.queueStreamUpdateData(data.unitId, 'hideUnit', true);
			}
		});
		if (runAction[0] !== null) {
			// console.error(runAction[0]);
		}
	},
	_onShowUnitFromPlayer: function (data) {
		const runAction = functionalTryCatch(() => {
			if (data.unitId) {
				taro.client.queueStreamUpdateData(data.unitId, 'showUnit', true);
			}
		});
		if (runAction[0] !== null) {
			// console.error(runAction[0]);
		}
	},
	_onHideUnitNameLabelFromPlayer: function (data) {
		const runAction = functionalTryCatch(() => {
			if (data.unitId) {
				taro.client.queueStreamUpdateData(data.unitId, 'hideNameLabel', true);
			}
		});
		if (runAction[0] !== null) {
			// console.error(runAction[0]);
		}
	},
	_onShowUnitNameLabelFromPlayer: function (data) {
		const runAction = functionalTryCatch(() => {
			if (data.unitId) {
				taro.client.queueStreamUpdateData(data.unitId, 'showNameLabel', true);
			}
		});
		if (runAction[0] !== null) {
			// console.error(runAction[0]);
		}
	},
	_onOpenShop: function (data) {
		const runAction = functionalTryCatch(() => {
			if (data.type) {
				var shopName = taro.game.data.shops[data.type] ? taro.game.data.shops[data.type].name : 'Item shop';
				var shopDescription = taro.game.data.shops[data.type]
					? taro.clientSanitizer(taro.game.data.shops[data.type].description)
					: '';
				var shopClass = taro.game.data.shops[data.type] ? taro.game.data.shops[data.type].shopClass || '' : '';
				$('#modd-item-shop-header').text(shopName);

				if (shopDescription?.length) {
					$('#modd-item-shop-description').text(shopDescription);
				} else {
					$('#modd-item-shop-description').text('');
				}

				taro.shop.openItemShop(data.type);

				// remove all previous class and add shopClass
				$('#modd-item-shop-modal').removeClass().addClass(`modal ${shopClass}`);

				$('#modd-item-shop-modal').modal('show');
				if (taro.client.myPlayer?.control) {
					taro.client.myPlayer.control.updatePlayerInputStatus();
				}
			}
		});
		if (runAction[0] !== null) {
			// console.error(runAction[0]);
		}
	},

	_onCreateFloatingText: function (data) {
		const runAction = functionalTryCatch(() =>
			taro.client.emit('floating-text', {
				text: data.text,
				x: data.position.x,
				y: data.position.y,
				color: data.color || 'white',
			})
		);
		if (runAction[0] !== null) {
			// console.error(runAction[0]);
		}
	},

	_onCreateDynamicFloatingText: function (data) {
		const runAction = functionalTryCatch(() =>
			taro.client.emit('dynamic-floating-text', {
				text: data.text,
				x: data.position.x,
				y: data.position.y,
				color: data.color || 'white',
				duration: data.duration,
			})
		);
		if (runAction[0] !== null) {
			// console.error(runAction[0]);
		}
	},

	_onOpenDialogue: function (data) {
		const runAction = functionalTryCatch(() => {
			if (data.dialogueId) {
				taro.playerUi.openDialogueModal(data.dialogueId, data.extraData);
			}
		});
		if (runAction[0] !== null) {
			// console.error(runAction[0]);
		}
	},

	_onCloseDialogue: function (data) {
		const runAction = functionalTryCatch(() => {
			taro.playerUi.closeDialogueModal();
		});
		if (runAction[0] !== null) {
			// console.error(runAction[0]);
		}
	},

	_onUpdateEntityAttribute: function (data) {
		const runAction = functionalTryCatch(() => {
			var entityId = data.e;
			var attrId = data.a;
			var value = data.x;
			var property = data.p;

			var entity = taro.$(entityId);
			if (entity && entity._stats && entity._stats.attributes && entity._stats.attributes[attrId]) {
				entity._stats.attributes[attrId][property] = value;
			}
		});
		if (runAction[0] !== null) {
			// console.error(runAction[0]);
		}
	},

	_onUpdateUiTextForTime: function (data) {
		taro.gameText.updateUiTextForTime(data);
	},

	_onUpdateUiText: function (data) {
		taro.gameText.updateUiText(data);
	},

	_onUpdateUIRealtimeCSS: function (data) {
		const runAction = functionalTryCatch(() => {
			const key = 'realtime-css';
			if (!taro.uiTextElementsObj[key]) {
				taro.uiTextElementsObj[key] = document.getElementById(key);
			}
			if (!taro.uiTextElementsObj[key]) {
				return;
			}

			let sanitizedStyle = taro.clientSanitizer(data.style);
			if (data.action == 'update') {
				taro.uiTextElementsObj[key].innerText = sanitizedStyle;
			} else if (data.action == 'append') {
				taro.uiTextElementsObj[key].innerText += `\t${sanitizedStyle}`;
			}
		});
		if (runAction[0] !== null) {
			// console.error(runAction[0]);
		}
	},

	_onAlertHighscore: function (data) {
		// $('.highscore-text').html('You set a new personal highscore!').show();
		// setTimeout(function () {
		// 	$('.highscore-text').hide()
		// }, 5000);
	},

	// _onStartParticle: function(data)
	_onItem: function (data) {
		const runAction = functionalTryCatch(() => {
			var item = taro.$(data.id);
			if (item) {
				if (item._category == 'item') {
					var ownerUnit = item.getOwnerUnit();
					if (data.type == 'use' && ownerUnit && ownerUnit != taro.client.selectedUnit) {
						item.use();
					} else if (data.type == 'stop') {
						item.stopUsing();
					} else if (data.type == 'reload') {
						item.reload();
					}
				} else {
					if (data.type == 'hit') {
						item.effect.start('bulletHit');
					}
				}
			}
		});
		if (runAction[0] !== null) {
			// console.error(runAction[0]);
		}
	},

	_onUi: function (data) {
		const runAction = functionalTryCatch(() => {
			switch (data.command) {
				case 'openItemShop':
					taro.shop.openModdShop('item');
					break;

				case 'openUnitShop':
					taro.shop.openModdShop('unit');
					break;

				case 'closeShop':
					taro.shop.closeShop();
					break;

				case 'showMenuAndSelectCurrentServer':
				case 'showMenu':
					taro.menuUi.showMenu();
					break;

				case 'showMenuAndSelectBestServer':
					taro.menuUi.showMenu(true);
					break;

				case 'showInputModal':
					taro.playerUi.showInputModal(data);
					break;

				case 'showCustomModal':
					taro.playerUi.showCustomModal(data);
					break;

				case 'updateBackpack':
					taro.playerUi.updateBackpack(data);
					break;

				case 'updateUiElement':
					taro.playerUi.updateUiElement(data);
					break;

				case 'openWebsite':
					taro.playerUi.openWebsite(data);
					break;
				case 'showWebsiteModal':
					taro.playerUi.showWebsiteModal(data);
					break;
				case 'showSocialShareModal':
					taro.playerUi.showSocialShareModal(data);
					break;
				case 'showFriendsModal':
					taro.playerUi.showFriendsModal(data);
					break;
				case 'shopResponse':
					taro.shop.purchaseWarning(data.type);
					break;

				case 'shopPurchase':
					taro.shop.openEntityPurchaseModal(data);
					break;

				case 'skinShop': {
					taro.shop.skinShop(data);
					break;
				}
			}
		});
		if (runAction[0] !== null) {
			// console.error(runAction[0]);
		}
	},

	// when client receives a ping response back from the server
	_onPing: function (data) {
		const now = taro._currentTime;
		const latency = now - data.sentAt;

		// console.log("onPing", taro._currentTime, data.sentAt, latency);
		let myUnit = taro.client.selectedUnit;
		// start reconciliation based on discrepancy between
		// where my unit when ping was sent and where unit is when ping is received
		if (
			taro.client.selectedUnit?.posHistory &&
			myUnit.serverStreamedPosition &&
			!taro.client.selectedUnit.isTeleporting
		) {
			let history = taro.client.selectedUnit.posHistory;
			while (history.length > 0) {
				var historyFrame = history.shift();
				// console.log(history.length, "history historyFrame", parseFloat(historyFrame[0]).toFixed(0), "sentAt", parseFloat(data.sentAt).toFixed(0), "diff", parseFloat(data.sentAt - historyFrame[0]).toFixed(0))
				if (data.sentAt - historyFrame[0] <= 0) {
					// console.log("found it!")
					taro.client.myUnitPositionWhenPingSent = {
						x: historyFrame[1][0],
						y: historyFrame[1][1],
					};

					taro.client.selectedUnit.reconRemaining = {
						x: myUnit.serverStreamedPosition.x - taro.client.myUnitPositionWhenPingSent.x,
						y: myUnit.serverStreamedPosition.y - taro.client.myUnitPositionWhenPingSent.y,
					};

					// console.log(latency, taro.client.myUnitPositionWhenPingSent.y, myUnit.serverStreamedPosition.y, taro.client.selectedUnit.reconRemaining.y);

					taro.client.selectedUnit.posHistory = [];

					if (taro.env === 'local' || taro.debugCSP) {
						taro.client.selectedUnit.emit('transform-debug', {
							debug: 'red-square',
							x: taro.client.myUnitPositionWhenPingSent?.x,
							y: taro.client.myUnitPositionWhenPingSent?.y,
							rotation: 0,
						});

						// console.log("reconRemaining", taro.client.selectedUnit.reconRemaining);
						taro.client.selectedUnit.emit('transform-debug', {
							debug: 'blue-square',
							x: myUnit.serverStreamedPosition.x,
							y: myUnit.serverStreamedPosition.y,
							rotation: 0,
						});
					}

					taro.client.sendNextPingAt = taro.now + 100;
					break;
				}
			}
		}

		taro.pingElement = taro.pingElement || document.getElementById('updateping');
		if (taro.pingElement) {
			taro.pingElement.innerHTML = Math.floor(latency);
		}
		taro.pingLatency = taro.pingLatency || [];
		taro.pingLatency.push(Math.floor(latency));
	},

	_onPlayAd: function (data) {
		const runAction = functionalTryCatch(() => {
			taro.ad.play(data);
		});
		if (runAction[0] !== null) {
			// console.error(runAction[0]);
		}
	},

	_onVideoChat: function (data) {
		const runAction = functionalTryCatch(() => {
			if (data.command) {
				switch (data.command) {
					case 'joinGroup':
						switchRoom(data.groupId);
						break;
					case 'leaveGroup':
						switchRoom(myID);
						break;
				}
			}
			console.log('videoChat', data);
		});
		if (runAction[0] !== null) {
			// console.error(runAction[0]);
		}
	},

	_onUserJoinedGame: function (data) {
		const runAction = functionalTryCatch(() => {
			var user = data.user;
			var server = data.server;
			var game = data.game;
			var gameName = data.gameName;
			var gameSlug = data.gameSlug;
			var friend = null;

			if (typeof allFriends != 'undefined') {
				for (var i in allFriends) {
					var friendObj = allFriends[i];

					if (friendObj._id === user) {
						friend = friendObj;
						break;
					}
				}

				if (friend && friend.local) {
					var gameLink = $(`.${friend._id}-game-list`);
					var url = `/play/${gameSlug}?server=${server}&joinGame=true`;

					if (server) {
						var friendName = friend.local.username;
						// causing error player disconnect
						// taro.chat.xssFilters.inHTMLData(friend.local.username);
						var message = `${friendName} is now playing ${gameName}<a class="text-light ml-2 text-decoration" href="${url}" style="text-decoration: underline;">Join</a>`;
						// add message in chat
						taro.chat.postMessage({
							text: message,
							isHtml: true,
						});

						// update game link in friend list
						if (gameLink) {
							friend.currentServers = [
								{
									id: server,
									gameSlug: gameSlug,
									gameName: gameName,
								},
							];
						}
					} else {
						// user left the server so all we have is userId so clear the game-list text
						friend.currentServers = [];
					}

					// sort the friend array
					allFriends.sort(function (a, b) {
						return b.currentServers.length - a.currentServers.length;
					});

					renderAllFriendsPanel();
					renderFriendTabInGame();
				}
			}
		});
		if (runAction[0] !== null) {
			// console.error(runAction[0]);
		}
	},

	_onBuySkin: function (skinHandle) {
		const runAction = functionalTryCatch(() => {
			$(`.btn-buy-skin[name='${skinHandle}']`).html('Purchased');
		});
		if (runAction[0] !== null) {
			// console.error(runAction[0]);
		}
	},

	_onTradeRequest: function (data) {
		$('#trader-name').html(data.name);
		if (data.initatedByMe) {
			$('#trade-request-message').html(`requesting ${data.name} to trade`);
			$('#accept-trade-request-button').hide();
		} else {
			$('#trade-request-message').html(`${data.name} wants to trade`);
			$('#accept-trade-request-button').show();
		}
		$('#trade-request-div').show();
	},
	_onTrade: function (data) {
		$('#trade-message').html('');
		if (data.cmd == 'start') {
			$('#trade-request-div').hide();
			$('#trade-div').show();
		} else if (data.cmd == 'offer') {
			if (parseInt(data.originSlotNumber) > 12) {
				taro.client.tradeOffers[parseInt(data.originSlotNumber) - 12] = data.originSlotItem;
			}
			if (parseInt(data.destinationSlotNumber) > 12) {
				taro.client.tradeOffers[parseInt(data.destinationSlotNumber) - 12] = data.destinationSlotItem;
			}
			$('#trade-message').html(`${$('#trader-name').html()} changed item`);
			taro.client.updateTradeOffer();
		} else if (data.cmd == 'noRoom') {
			$('#trade-message').html('No room in inventory');
		} else if (data.cmd == 'accept') {
			$('#trade-message').html(`${$('#trader-name').html()} accepted`);
		} else if (data.cmd == 'close') {
			// cancels both trade & trade-request
			taro.game.closeTrade();
		}
	},

	_onDevLogs: function (data) {
		const runAction = functionalTryCatch(() => {
			taro.game.updateDevConsole(data);
		});
		if (runAction[0] !== null) {
			// console.error(runAction[0]);
		}
	},

	_onProfile: function (data) {
		// sends data to profiler
		window.reactApp.profiler(data);

		const runAction = functionalTryCatch(() => {
			taro.game.updateDevConsole(data);
		});
		if (runAction[0] !== null) {
			// console.error(runAction[0]);
		}
	},

	_onTrade: function (msg, clientId) {
		switch (msg.type) {
			case 'init': {
				var player = taro.$(msg.from);
				if (player && player._category === 'player') {
					taro.tradeUi.initiateTradeRequest(player);
				}
				break;
			}

			case 'start': {
				var playerA = taro.$(msg.between.playerA);
				var playerB = taro.$(msg.between.playerB);
				if (playerA && playerA._category === 'player' && playerB && playerB._category === 'player') {
					taro.tradeUi.closeTradeRequest();
					taro.tradeUi.startTrading(playerA, playerB);
				}
				break;
			}

			case 'offer': {
				var from = taro.$(msg.from);
				var to = taro.$(msg.to);

				if (from && to && from.tradingWith === to.id()) {
					taro.tradeUi.receiveOfferingItems(msg.tradeItems);
				}
				break;
			}

			case 'accept': {
				console.log('accept ', msg, clientId);
				$('#trader-accept').addClass('active');

				for (let i = 1; i <= 5; i++) {
					const offerDiv = $(`#offer-${i}`);
					if (offerDiv.hasClass('trade-item-added')) {
						offerDiv.addClass('trade-item-success');
					}
				}

				$('#accept-trade-text').text('Complete');
				break;
			}

			case 'success': {
				var playerA = taro.$(msg.between.playerA);
				var playerB = taro.$(msg.between.playerB);
				delete playerA.tradingWith;
				delete playerB.tradingWith;
				delete playerA.isTrading;
				delete playerB.isTrading;
				taro.tradeUi.tradeItems = [];
				taro.tradeUi.acceptDisableReason = null;
				$('#trade-div').hide();
				break;
			}

			case 'cancel': {
				var playerA = taro.$(msg.between.playerA);
				var playerB = taro.$(msg.between.playerB);
				if (playerA) {
					delete playerA.tradingWith;
					delete playerA.isTrading;
				}
				if (playerB) {
					delete playerB.tradingWith;
					delete playerB.isTrading;
				}
				$('#trade-div').hide();
				break;
			}
		}
	},

	_onSendDataFromServer: function (data) {
		var player = taro.client.myPlayer;
		if (player && data) {
			player.lastServerReceivedData = data.data
				? Object.keys(data.data).reduce((result, key) => {
						if (['boolean', 'number'].includes(typeof data.data[key])) {
							result[key] = data.data[key];
						} else if (typeof data.data[key] === 'string') {
							result[key] = taro.clientSanitizer(data.data[key]);
						}

						return result;
					}, {})
				: {};
			taro.script.trigger('whenDataReceivedFromServer');
		}
	},

	// when other players' update tiles, apply the change to my local
	_onEditTile: function (data) {
		taro.client.emit('editTile', data);
	},

	// when other players' update layer opacity, apply the change to my local
	_onChangeLayerOpacity: function (data) {
		taro.client.emit('changeLayerOpacity', data);
	},

	// when other players' update regions, apply the change to my local
	_onEditRegion: function (data) {
		taro.client.emit('editRegion', data);
	},

	// when other players' update variables, apply the change to my local
	_onEditVariable: function (data) {
		taro.client.emit('editVariable', data);
	},

	_onEditInitEntity: function (data) {
		taro.client.emit('editInitEntity', data);
	},

	_onEditGlobalScripts: function (data) {
		taro.client.emit('editGlobalScripts', data);
	},

	_updateClientInitEntities: function (data) {
		const runAction = functionalTryCatch(() => {
			taro.developerMode.updateClientInitEntities(data);
		});
		if (runAction[0] !== null) {
			// console.error(runAction[0]);
		}
	},

	_onUpdateUnit: function (data) {
		taro.developerMode.updateUnit(data);
	},

	_onUpdateItem: function (data) {
		taro.developerMode.updateItem(data);
	},

	_onUpdateProjectile: function (data) {
		taro.developerMode.updateProjectile(data);
	},

	_onUpdateShop: function (data) {
		taro.developerMode.updateShop(data);
	},

	_onUpdateDialogue: function (data) {
		taro.developerMode.updateDialogue(data);
	},

	_onUpdateDevelopersData: function (data) {
		taro.developerMode.updateDevelopersData(data);
	},

	_onErrorLogs: function (logs) {
		var element = document.getElementById('error-log-content');
		for (actionName in logs) {
			var log = logs[actionName];
			// element.innerHTML += `<li style='font-size:12px;'>${log}</li>`;
			taro.client.errorLogs.push({ ...log, path: actionName });
			$('#dev-error-button').text(`Errors (${taro.client.errorLogs.length})`);

			if (window.addToLogs && typeof log.message === 'string') {
				window.addToLogs({ ...log, path: actionName });
			}
		}

		window.reactApp?.showErrorToast(logs[Object.keys(logs)[Object.keys(logs).length - 1]]);
	},

	_onSound: function (data) {
		taro.sound.run(data);
	},

	_onCamera: function (data) {
		const runAction = functionalTryCatch(() => {
			// camera zoom change
			if (data.cmd == 'zoom') {
				taro.client.setZoom(data.zoom);
			}
			// track unit
			if (data.cmd == 'track') {
				var unit = taro.$(data.unitId);
				if (unit) {
					taro.client.vp1.camera.trackTranslate(unit, taro.client._trackTranslateSmoothing);
				}
			}

			if (data.cmd === 'positionCamera') {
				taro.client.positionCamera(data.position.x, data.position.y);
			}
		});
		if (runAction[0] !== null) {
			// console.error(runAction[0]);
		}
	},

	_onGameSuggestion: function (data) {
		const runAction = functionalTryCatch(() => {
			if (data && data.type == 'show') {
				$('#more-games').removeClass('slidedown-menu-animation').addClass('slideup-menu-animation');
			} else if (data && data.type == 'hide') {
				$('#more-games').removeClass('slideup-menu-animation').addClass('slidedown-menu-animation');
			}
		});
		if (runAction[0] !== null) {
			// console.error(runAction[0]);
		}
	},

	_onRenderSocketLogs: function (data) {
		console.warn(data);
	},

	_handlePokiSwitch: function (data) {
		if (window.GAME_PLAY_STARTED) {
			window.PokiSDK?.gameplayStop();
			window.GAME_PLAY_STARTED = false;

			if (window.PokiSDK?.commercialBreak) {
				window.PokiSDK?.commercialBreak(() => {
					// you can pause any background music or other audio here
					$('body').addClass('playing-ad');
				}).then(() => {
					console.log('Commercial break finished, proceeding to game');
					// if the audio was paused you can resume it here (keep in mind that the function above to pause it might not always get called)
					// continue your game here
					$('body').removeClass('playing-ad');
					if (window.switchGameWrapper) {
						window.switchGameWrapper(data);
					}
				});
			} else if (window.switchGameWrapper) {
				window.switchGameWrapper(data);
			}
		}
	},

	_onSendPlayerToMap: function (data) {
		if (data && data.type == 'sendPlayerToMap') {
			// disconnect first so save data process starts immediately
			window.taro.network._io.disconnect('switching_map');

			// always stop music before sending user to another map
			if (taro.sound.musicCurrentlyPlaying) {
				taro.sound.stopMusic();
			}

			if (window.STATIC_EXPORT_ENABLED) {
				taro.client._handlePokiSwitch(data);
			} else {
				if (window.IS_CRAZY_GAMES_ENV) {
					if (window.GAME_PLAY_STARTED) {
						window.CrazyGames.SDK.game.gameplayStop();
						window.GAME_PLAY_STARTED = false;
					}
					// show ads when user travel from survival mode or survival portal to greyhold
					if ((window.gameSlug === 'wQ9ZEoME5' || window.gameSlug === 'y1kYJHfzk') && data.gameSlug === 'WO8osQ6dD') {
						const callbacks = {
							adFinished: () => {
								console.log('End midgame ad');
								const mapUrl = `${window.location.origin}/play/${data.gameSlug}?autojoin=true&autoJoinToken=${data.autoJoinToken}${data.serverId ? '&serverId=' + data.serverId : ''}`;
								window.location.href = mapUrl;
							},
							adError: (error) => {
								console.log('Error midgame ad', error);
								const mapUrl = `${window.location.origin}/play/${data.gameSlug}?autojoin=true&autoJoinToken=${data.autoJoinToken}${data.serverId ? '&serverId=' + data.serverId : ''}`;
								window.location.href = mapUrl;
							},
							adStarted: () => {
								console.log('Start midgame ad');
							},
						};

						$('body').addClass('playing-ad');
						window.CrazyGames.SDK.ad.requestAd('midgame', callbacks);
						return;
					}
				}

				const mapUrl = `${window.location.origin}/play/${data.gameSlug}?autojoin=true&autoJoinToken=${data.autoJoinToken}${data.serverId ? '&serverId=' + data.serverId : ''}`;
				window.location.href = mapUrl;
			}
		}
	},

	_onSendPlayerToGame: function (data) {
		if (data && data.type == 'sendPlayerToGame') {
			if (window.STATIC_EXPORT_ENABLED) {
				taro.client._handlePokiSwitch(data);
			} else {
				if (window.IS_CRAZY_GAMES_ENV) {
					if (window.GAME_PLAY_STARTED) {
						window.CrazyGames.SDK.game.gameplayStop();
						window.GAME_PLAY_STARTED = false;
					}

					// show ads when user travel from survival mode or survival portal to greyhold
					if ((window.gameSlug === 'wQ9ZEoME5' || window.gameSlug === 'y1kYJHfzk') && data.gameSlug === 'WO8osQ6dD') {
						const callbacks = {
							adFinished: () => console.log('End midgame ad'),
							adError: (error) => console.log('Error midgame ad', error),
							adStarted: () => console.log('Start midgame ad'),
						};
						window.CrazyGames.SDK.ad.requestAd('midgame', callbacks);
					}
				}

				const mapUrl = `${window.location.origin}/play/${data.gameSlug}?autojoin=true&${data.serverId ? '&serverId=' + data.serverId : ''}`;
				window.location.href = mapUrl;
			}
		}
	},
};

if (typeof module !== 'undefined' && typeof module.exports !== 'undefined') {
	module.exports = ClientNetworkEvents;
}
