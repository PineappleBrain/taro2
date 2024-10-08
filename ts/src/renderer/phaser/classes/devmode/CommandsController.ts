interface CommandEmitterProps {
	func: () => void;
	undo: () => void;
	allFinished?: () => void;
	cache?: any;
	mergedUuid?: string;
}

interface CommandControllerProps {
	commands: CommandEmitterProps[];
}

type DefaultCommands = 'increaseBrushSize' | 'decreaseBrushSize';

class CommandController implements CommandControllerProps {
	commands: CommandEmitterProps[] = [];
	defaultCommands: Record<DefaultCommands, () => void>;
	nowInsertIndex = 0;
	maxCommands: number;
	map?: Phaser.Tilemaps.Tilemap;
	/**
	 * if CommandController shift(), the cache's pointer do not auto shift, so add offset to make
	 * sure it could point to right cache;
	 */
	offset = 0;
	constructor(defaultCommands: Record<DefaultCommands, () => void>, map?: Phaser.Tilemaps.Tilemap) {
		this.defaultCommands = defaultCommands;
		this.map = map;
	}

	/**
	 * add command to exec
	 * @param command new command
	 * @param forceToHistory force to history
	 * @param history whether the added command will go into the history? (can be undo and redo)
	 * @param mapEdit this command is for map editing? if so, it will check if the map changed after
	 * command exec, if no change happened, it will not go into the history.
	 */
	addCommand(command: CommandEmitterProps, forceToHistory = false, history = true, mapEdit = true, cache: any = undefined) {
		const oldTaroMap = JSON.stringify(taro.game.data.map.layers);
		command.func();
		if (history || forceToHistory) {
			if (mapEdit && !forceToHistory) {
				if (JSON.stringify(taro.game.data.map.layers) === oldTaroMap) {
					return;
				}
			}
			if (this.nowInsertIndex < this.commands.length) {
				this.commands.splice(this.nowInsertIndex, this.commands.length - this.nowInsertIndex);
				this.commands[this.nowInsertIndex] = command;
				this.nowInsertIndex += 1;
			} else {
				this.commands.push(command);
				this.nowInsertIndex += 1;
			}
		}
		this.commands[this.commands.length - 1].cache = cache;
	}

	undo() {
		if (this.commands[this.nowInsertIndex - 1]) {
			this.nowInsertIndex -= 1;
			this.commands[this.nowInsertIndex].undo();
			if (this.commands[this.nowInsertIndex - 1]?.mergedUuid !== undefined && this.commands[this.nowInsertIndex - 1].mergedUuid === this.commands[this.nowInsertIndex].mergedUuid) {
				this.undo();
			} else {
				this.commands[this.nowInsertIndex].allFinished?.();
			}
		}
	}

	redo() {
		if (this.commands[this.nowInsertIndex]) {
			this.commands[this.nowInsertIndex].func();
			this.nowInsertIndex += 1;
			if (this.commands[this.nowInsertIndex]?.mergedUuid !== undefined && this.commands[this.nowInsertIndex - 1].mergedUuid === this.commands[this.nowInsertIndex].mergedUuid) {
				this.redo();
			}
			this.commands[this.nowInsertIndex - 1].allFinished?.();
		}
	}
}
