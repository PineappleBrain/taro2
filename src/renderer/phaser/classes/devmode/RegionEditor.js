var RegionEditor = /** @class */ (function () {
    function RegionEditor(gameScene, devModeScene, devModeTools) {
        var _this = this;
        this.gameScene = gameScene;
        this.devModeScene = devModeScene;
        this.devModeTools = devModeTools;
        gameScene.input.on('pointerdown', function (pointer) {
            if (_this.regionTool) {
                var worldPoint = _this.gameScene.cameras.main.getWorldPoint(pointer.x, pointer.y);
                _this.regionDrawStart = {
                    x: worldPoint.x,
                    y: worldPoint.y,
                };
            }
        }, this);
        var graphics = this.regionDrawGraphics = gameScene.add.graphics();
        var width;
        var height;
        gameScene.input.on('pointermove', function (pointer) {
            if (!pointer.leftButtonDown())
                return;
            else if (_this.regionTool) {
                var worldPoint = gameScene.cameras.main.getWorldPoint(pointer.x, pointer.y);
                width = worldPoint.x - _this.regionDrawStart.x;
                height = worldPoint.y - _this.regionDrawStart.y;
                graphics.clear();
                graphics.lineStyle(2, 0x036ffc, 1);
                graphics.strokeRect(_this.regionDrawStart.x, _this.regionDrawStart.y, width, height);
            }
        }, this);
        gameScene.input.on('pointerup', function (pointer) {
            if (!pointer.leftButtonReleased())
                return;
            var worldPoint = gameScene.cameras.main.getWorldPoint(pointer.x, pointer.y);
            if (_this.regionTool && _this.regionDrawStart && _this.regionDrawStart.x !== worldPoint.x && _this.regionDrawStart.y !== worldPoint.y) {
                graphics.clear();
                _this.regionTool = false;
                _this.devModeTools.highlightModeButton(0);
                var x = _this.regionDrawStart.x;
                var y = _this.regionDrawStart.y;
                if (width < 0) {
                    x = _this.regionDrawStart.x + width;
                    width *= -1;
                }
                if (height < 0) {
                    y = _this.regionDrawStart.y + height;
                    height *= -1;
                }
                ige.network.send('editRegion', { x: Math.trunc(x),
                    y: Math.trunc(y),
                    width: Math.trunc(width),
                    height: Math.trunc(height) });
                _this.regionDrawStart = null;
            }
        }, this);
        this.clickedList = [];
    }
    RegionEditor.prototype.edit = function (data) {
        if (data.newName && data.name !== data.newName) {
            var region = ige.regionManager.getRegionById(data.name);
            if (region)
                region._stats.id = data.newName;
            this.devModeScene.regions.forEach(function (region) {
                if (region.name === data.name) {
                    region.name = data.newName;
                    region.updateLabel();
                }
            });
        }
        else if (data.showModal) {
            ige.addNewRegion && ige.addNewRegion({ name: data.name, x: data.x, y: data.y, width: data.width, height: data.height, userId: data.userId });
        }
        ige.updateRegionInReact && ige.updateRegionInReact();
    };
    RegionEditor.prototype.cancelDrawRegion = function () {
        if (this.regionTool) {
            this.regionDrawGraphics.clear();
            this.regionTool = false;
            this.devModeTools.highlightModeButton(0);
            this.regionDrawStart = null;
        }
    };
    RegionEditor.prototype.addClickedList = function (regionData) {
        this.clickedList.push(regionData);
    };
    RegionEditor.prototype.showClickedList = function () {
        console.log(this.clickedList.length);
        if (this.clickedList.length === 1) {
            ige.addNewRegion && ige.addNewRegion(this.clickedList[0]);
        }
        else {
            /* TODO show list of all regions in array this.clickedList and allow to choose one and call ige.addNewRegion && ige.addNewRegion(this.clickedList[number]); */
        }
        this.clickedList = [];
    };
    RegionEditor.prototype.showRegions = function () {
        this.devModeScene.regions.forEach(function (region) {
            region.show();
            region.label.visible = true;
        });
    };
    RegionEditor.prototype.hideRegions = function () {
        this.devModeScene.regions.forEach(function (region) {
            if (region.devModeOnly) {
                region.hide();
            }
            region.label.visible = false;
        });
    };
    return RegionEditor;
}());
//# sourceMappingURL=RegionEditor.js.map