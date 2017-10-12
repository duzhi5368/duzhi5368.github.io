/**
 * Created by Frankie.W on 2017/3/19.
 */
(function(window){
    'use strict';

    function func_CreateModel(){
        var GameModel = {}

        // 游戏数据初始化
        GameModel.func_Init = function () {
            this.m_nGameDaysPassed = 0;
            this.m_nMaxGrapyDays = 90;                 //  图表中能进行记录的最大天数
            this.m_nMaxTownLv = 100;
            this.m_nMaxTownBuildingNum = 6;
            this.m_nMaxIndustryLv = 3;
            this.m_nItemsPerStore = 12;

            this.m_ExpPool = func_CreateExpPool(this.m_ExpData);
            this.m_ShopPool = func_CreateShopPool(this.m_ShopData);
            this.m_ShopButtonPool = func_CreateShopButtonPool(this.m_ShopButtonData);
            this.m_BuildingsMapPool = func_CreateBuildingsMapPool(this.m_BuildingsMapData);
            this.m_ItemsMapPool = func_CreateItemsMapPool(this.m_ItemsData);
            this.m_UltimateItemDataPool = func_CreateUltimateDataPool(this.m_UltimateItemData);

            // 存储信息
            this.m_nDay = 0;                                 // 游戏累计进行的天数
            this.m_AdventurerList = [];                     // 生存的冒险者个数
            this.m_DeadAdventurerList = [];                 // 死亡的冒险者个数
            this.m_nUserMoney = new BigNumber(50);          // 玩家的金钱总量

            this.m_MoneyRecordArray = [];                   // 玩家历史金钱记录
            this.m_AdventurerRecordArray = [];              // 玩家冒险者数量历史记录
            this.m_nIdleMoneyMade = new BigNumber(0);
            this.m_nDayPassed = 0;
            this.m_nOriginalFunds = new BigNumber(0);
            this.m_nCounter = 0;

            // 铁匠数据
            this.m_nBSSwordLevel = 0;
            this.m_nBSArmorLevel = 0;
            this.m_nHPLossRoll = 4;         // 伤害增加
            this.m_nHPLossPercentage = 0.4;// 怪物的伤害百分比

            // 旅馆数据
            this.m_nInnLevel = 0;
            this.m_nMaxAdventurers = 10;    // 当前小镇冒险者数量上限

            // 庙宇数据
            this.m_nTempleLevel = 0;
            this.m_nIdleHourDays = 1;       // 当前可挂机时间

            // 酒馆数据
            this.m_nTavernLevel = 0;
            this.m_nExpGainRoll = 4;        // 冒险者获得经验增加比

            // 商店数据
            this.m_nShopLevel = 0;
            this.m_nGoldGainRoll = 4;       // 冒险者获得金钱增加比

            // 升级建筑所需要的升级金增幅    (若该值为1，则表示没有任何增幅)
            this.m_nSwordMaintainCost = 1;
            this.m_nArmorMaintainCost = 1;
            this.m_nTavernMaintainCost = 1;
            this.m_nInnMaintainCost = 1;
            this.m_nTempleMaintainCost = 1;
            this.m_nShopMaintainCost = 1;

            this.m_nUpgradeTownMultiplier = 1.1;

            // 初始化BigNumber配置
            BigNumber.config({ FORMAT: {groupSeparator: ',', groupSize: 3 }, DECIMAL_PLACES: 2});
        }

        GameModel.m_ExpData = [
            { 'level': 1,  'stats': [8, 9, 3] }
            , { 'level': 2,  'stats': [24, 11, 4] }
            , { 'level': 3,  'stats': [96, 14, 5] }
            , { 'level': 4,  'stats': [175, 18, 6] }
            , { 'level': 5,  'stats': [400, 23, 7] }
        ];
        function func_CreateExpPool(expData) {
            var pool = {};
            expData.forEach(function(e){
                pool[e.level] = e.status;
            });
            return pool;
        }
        GameModel.m_ShopData = [
            { 'name': 'tavern', 'graphic': 'lissetteFull', 'text': 'Level up your tavern to give adventurers more experience when they fight.' }
            , { 'name': 'inn', 'graphic': 'clavoFull', 'text': 'Level up your inn to allow more adventurers to stay in town.' }
            , { 'name': 'temple', 'graphic': 'jera', 'text': 'Level up your temple to increase the game speed when you\'re not playing. You can collect up to one week of idle play at a time.' }
            , { 'name': 'itemshop', 'graphic': 'mizakFull', 'text': 'Level up your item shop to give adventurers more money when they fight.' }
            , { 'name': 'blacksmith', 'graphic': 'lemelFull', 'text': 'Weapon levels increase the damage adventurers inflict on monsters. Armor levels decrease adventurers\' damage from monsters.' }
        ];
        function func_CreateShopPool(shopData) {
            var pool = {};
            shopData.forEach(function(u) {
                pool[u.name] = { 'graphic': u.graphic, 'text': u.text };
            });
            return pool;
        }
        GameModel.m_ShopButtonData = [
            { 'shopName': 'inn', 'goodsText': 'Amenities', 'tag': 'inn', 'labelText': 'Maximum Adventurers', variable: 'maxAdventurers', 'headGraphic': 'clavoFrown' }
            , { 'shopName': 'tavern', 'goodsText': 'Food and Drink', 'tag': 'tavern', 'labelText': 'Extra Experience Roll', variable: 'expGainRoll', 'headGraphic': 'lissetteFrown' }
            , { 'shopName': 'blacksmith', 'goodsText': 'Armor', 'tag': 'armor', 'labelText': 'HP Loss %', variable: 'hpLossPercentage', 'headGraphic': 'lemelFrown' }
            , { 'shopName': 'itemshop', 'goodsText': 'Items', 'tag': 'shop', 'labelText': 'Extra Money Roll', variable: 'goldGainRoll', 'headGraphic': 'mizakNormal' }
            , { 'shopName': 'temple', 'goodsText': 'Medicine', 'tag': 'temple', 'labelText': 'Days Per Idle Hour', variable: 'idleHourDays', 'headGraphic': 'jera' }
            , { 'shopName': 'blacksmith', 'goodsText': 'Weapons', 'tag': 'sword', 'labelText': 'HP Loss Roll', variable: 'hpLossRoll', 'headGraphic': 'lemelFrown' }
        ];
        function func_CreateShopButtonPool(buttonData) {
            var pool = {};
            buttonData.forEach(function(u) {
                pool[u.tag] = { 'shop': u.shopName, 'goodsText': u.goodsText, 'labelText': u.labelText, 'variable': u.variable, 'headGraphic': u.headGraphic };
            });
            return pool;
        }
        GameModel.m_BuildingsMapData = [
            { 'level' : 1, 'name': 'Lumberjack Camp', 'needs': '', 'cost': 1000000, 'graphic' : 'bldgCamp' , 'location': 'forest', 'industry': 'wood', 'desc': 'Allows logging.' }
            , { 'level' : 2, 'name': 'Sawmill', 'needs': 'Lumberjack Camp', 'cost': 1000000000, 'graphic' : 'bldgSawmill' , 'location': 'forest', 'industry': 'wood', 'desc': 'Produces timber from logs.' }
            , { 'level' : 3, 'name': 'Charcoal Kiln', 'needs': 'Sawmill', 'cost': 1000000000000, 'graphic' : 'bldgKiln' , 'location': 'forest', 'industry': 'wood', 'desc': 'Produces charcoal from timber.' }

            , { 'level' : 1, 'name': 'Ore Mine', 'needs': '', 'cost': 1000000, 'graphic' : 'bldgOreMine' , 'location': 'mountains', 'industry': 'ore', 'desc': 'Extracts rock with metals.' }
            , { 'level' : 1, 'name': 'Alum Mine', 'needs': '', 'cost': 1000000, 'graphic' : 'bldgAlumMine' , 'location': 'mountains', 'industry': 'alum', 'desc': 'Extracts rock with certain minerals.' }
            , { 'level' : 2, 'name': 'Smelter', 'needs': 'Ore Mine', 'cost': 1000000000, 'graphic' : 'bldgSmelter' , 'location': 'mountains', 'industry': 'ore', 'desc': 'Seperates metal from ore.' }
            , { 'level' : 2, 'name': 'Seperator', 'needs': 'Alum Mine', 'cost': 1000000000, 'graphic' : 'bldgSeperator' , 'location': 'mountains', 'industry': 'alum', 'desc': 'Seperates chemicals from rock.' }
            , { 'level' : 3, 'name': 'Iron Roller', 'needs': 'Smelter, Charcoal Kiln', 'cost': 1000000000000, 'graphic' : 'bldgRoller' , 'location': 'mountains', 'industry': 'ore', 'desc': 'Produces metal ingots.' }
            , { 'level' : 3, 'name': 'Chemist', 'needs': 'Seperator', 'cost': 1000000000000, 'graphic' : 'bldgChemist' , 'location': 'mountains', 'industry': 'alum', 'desc': 'Refines alum and other chemicals.' }

            , { 'level' : 1, 'name': 'Sheep Pasture', 'needs': '', 'cost': 1000000, 'graphic' : 'bldgSheep' , 'location': 'pasture', 'industry': 'wool', 'desc': 'Raises sheep.' }
            , { 'level' : 1, 'name': 'Cattle Ranch', 'needs': '', 'cost': 1000000, 'graphic' : 'bldgCattle' , 'location': 'pasture', 'industry': 'beef', 'desc': 'Raises cattle and other food animals.' }
            , { 'level' : 2, 'name': 'Shearing Shed', 'needs': 'Sheep Pasture', 'cost': 1000000000, 'graphic' : 'bldgShearer' , 'location': 'pasture', 'industry': 'wool', 'desc': 'Produces wool.' }
            , { 'level' : 2, 'name': 'Slaughterhouse', 'needs': 'Cattle Ranch', 'cost': 1000000000, 'graphic' : 'bldgSlaughterhouse' , 'location': 'pasture', 'industry': 'beef', 'desc': 'Produces raw meat.' }
            , { 'level' : 3, 'name': 'Loom', 'needs': 'Shearing Shed, Sawmill, Iron Roller', 'cost': 1000000000000, 'graphic' : 'bldgLoom' , 'location': 'pasture', 'industry': 'wool', 'desc': 'Produces yarn from wool.' }
            , { 'level' : 3, 'name': 'Smokehouse', 'needs': 'Slaughterhouse, Sawmill', 'cost': 1000000000000, 'graphic' : 'bldgSmokehouse' , 'location': 'pasture', 'industry': 'beef', 'desc': 'Produces preserved jerky.' }

            , { 'level' : 1, 'name': 'Grain Farm', 'needs': '', 'cost': 1000000, 'graphic' : 'bldgWheatFarm' , 'location': 'prairie', 'industry': 'grain', 'desc': 'Grows cereals like wheat and corn.' }
            , { 'level' : 1, 'name': 'Hops Farm', 'needs': '', 'cost': 1000000, 'graphic' : 'bldgHopsFarm' , 'location': 'prairie', 'industry': 'hops', 'desc': 'Exclusively grows hops for beer.' }
            , { 'level' : 1, 'name': 'Vineyard', 'needs': '', 'cost': 1000000, 'graphic' : 'bldgVineyard' , 'location': 'prairie', 'industry': 'wine', 'desc': 'Grows grapes and fruit for wine.' }
            , { 'level' : 2, 'name': 'Mill', 'needs': 'Grain Farm', 'cost': 1000000000, 'graphic' : 'bldgMill' , 'location': 'prairie', 'industry': 'grain', 'desc': 'Grinds grains into flour.' }
            , { 'level' : 2, 'name': 'Beer Brewery', 'needs': 'Grain Farm, Hops Farm', 'cost': 1000000000, 'graphic' : 'bldgBeerBrewery' , 'location': 'prairie', 'industry': 'hops', 'desc': 'Produces alcoholic beer.' }
            , { 'level' : 2, 'name': 'Winepress', 'needs': 'Vineyard', 'cost': 1000000000, 'graphic' : 'bldgWinepress' , 'location': 'prairie', 'industry': 'wine', 'desc': 'Presses juice out of fruits.' }
            , { 'level' : 3, 'name': 'Bakery', 'needs': 'Mill, Sawmill', 'cost': 1000000000000, 'graphic' : 'bldgBakery' , 'location': 'prairie', 'industry': 'grain', 'desc': 'Produces baked goods from flour.' }
            , { 'level' : 3, 'name': 'Beer Bottler', 'needs': 'Beer Brewery', 'cost': 1000000000000, 'graphic' : 'bldgBeerBottler' , 'location': 'prairie', 'industry': 'hops', 'desc': 'Prepares beer for trade.' }
            , { 'level' : 3, 'name': 'Winery', 'needs': 'Winepress, Charcoal Kiln', 'cost': 1000000000000, 'graphic' : 'bldgWinery' , 'location': 'prairie', 'industry': 'wine', 'desc': 'Ages and bottles wine.' }
            , { 'level' : 1, 'name': 'Docks', 'needs': '', 'cost': 1000000, 'graphic' : 'bldgDock' , 'location': 'sea', 'industry': 'fish', 'desc': 'Allows catching of fish.' }
            , { 'level' : 1, 'name': 'Saltbeds', 'needs': '', 'cost': 1000000, 'graphic' : 'bldgSaltbeds' , 'location': 'sea', 'industry': 'salt', 'desc': 'Captures seawater.' }
            , { 'level' : 2, 'name': 'Fishery', 'needs': 'Docks', 'cost': 1000000000, 'graphic' : 'bldgFishery' , 'location': 'sea', 'industry': 'fish', 'desc': 'Guts and cleans fresh fish.' }
            , { 'level' : 2, 'name': 'Saltpans', 'needs': 'Saltbeds', 'cost': 1000000000, 'graphic' : 'bldgSaltpans' , 'location': 'sea', 'industry': 'salt', 'desc': 'Evaporates seawater.' }
            , { 'level' : 3, 'name': 'Brinery', 'needs': 'Fishery, Sawmill, Saltpans', 'cost': 1000000000000, 'graphic' : 'bldgBrinery' , 'location': 'sea', 'industry': 'fish', 'desc': 'Produces preserved salt fish.' }
            , { 'level' : 3, 'name': 'Saltern', 'needs': 'Saltpans, Sawmill', 'cost': 1000000000000, 'graphic' : 'bldgIodiner' , 'location': 'sea', 'industry': 'salt', 'desc': 'Refines salt from seawater residue.' }
        ];
        function func_CreateBuildingsMapPool(bldgData) {
            var pool = {};
            bldgData.forEach(function(b) {
                pool[b.name] = {'level': b.level,
                    'needsArray': b.needs.length > 0 ? b.needs.split(",").map(function(e) { return e.trim(); }): [],
                    'cost': b.cost,
                    'graphic': b.graphic,
                    'location': b.location,
                    'industry': b.industry,
                    'desc': b.desc,
                    'purchased': false };
            });
            return pool;
        }
        GameModel.m_ItemsData = [
            {'category' : 'sword', 'list': 'club, knife, hatchet, morningstar, shortsword, shortbow, longsword, longbow, battleaxe, broadsword, falchion, crossbow' }
            , {'category' : 'armor', 'list': 'leather armor, buckler, short hauberk, roundshield, long hauberk, kite shield, lamellar, scale armor, partial plate, pavise, full plate, cuirass' }
            , {'category' : 'shop', 'list': 'knapsack, tent, flint, dried fruit, canteen, boots, cloak, jerky, waterproof poncho, cuttlefish, waterproof jersey, portable stove' }
            , {'category' : 'temple', 'list': 'chicken soup, bandages, splints, herbs, iodine, crutches, leeches, tincture, bloodletting, mineral salt, scalpel, elixir' }
            , {'category' : 'tavern', 'list': 'bread, cheese, stew, ale, coffee, fried chicken, whiskey, fish and chips, pork chops, steak, caviar, champagne' }
            , {'category' : 'inn', 'list': 'straw, blankets, pillows, bunkbeds, stable, singles, showers, catering, groom, hot baths, room service, hot tub' }
        ];
        function func_CreateItemsMapPool(itemData) {
            var pool = {};
            itemData.forEach(function(i) {
                pool[i.category] = i.list.split(",").map(function(e) { return e.trim(); });
            });
            return pool;
        }
        GameModel.m_UltimateItemData = [
            { 'name' : 'Arquebus', 'location': 'sword', 'needtext' : 'Iron Roller (castings)\nChemist (potassium)\nCharcoal Kiln (forge charcoal)', 'desc' : 'Mizak\'s Notes:   The newest weapon on the market – makes a crossbow look tame! Just load it with this newfangled “gunpowder,” aim, and pull a small metal trigger.', 'needList': 'Iron Roller, Chemist, Charcoal Kiln', 'tab': 'Ultimate Weapon' }
            , { 'name' : 'Brigandine', 'location': 'armor', 'needtext' : 'Iron Roller (plate)\nLoom (padding)\nCharcoal Kiln (forge charcoal)', 'desc' : 'Mizak\'s Notes:   Looking for armor that is strong but also light? Try the brigandine, with its thick padding with strategically placed sheets of armor stitched throughout.', 'needList': 'Iron Roller, Loom, Charcoal Kiln', 'tab': 'Ultimate Armor' }
            , { 'name' : 'Pemmican', 'location': 'shop', 'needtext' : 'Smokehouse (jerky)\nWinepress (leftover fruit)\nSawmill (firewood)', 'desc' : 'Mizak\'s Notes:   The ultimate in adventuring rations! A mixture of ground jerky, dried fruit, and fat that will literally last decades!', 'needList': 'Smokehouse, Winepress, Sawmill', 'tab': 'Ultimate Item' }
            , { 'name' : 'Poultice', 'location': 'temple', 'needtext' : 'Hops Farm (herbs)\nLoom (cloth bangages)\nSaltern (sea minerals)', 'desc' : 'Mizak\'s Notes:   Suffering from a deep sword wound? We have the answer – our temple’s special mixture of medicine bandaged over the wound. The best choice until we invent penicillin….', 'needList': 'Hops Farm, Loom, Saltern', 'tab': 'Ultimate Medicine' }
            , { 'name' : 'Black Velvet', 'location': 'tavern', 'needtext' : 'Beer Brewery (stout)\nWinery (champagne)\nBakery (pretzels)', 'desc' : 'Mizak\'s Notes:   Fancy! A beer cocktail that uses the darkest stout and the bubbliest champagne. A great mixture of flavor that goes straight to your head.', 'needList': 'Beer Brewery, Winery, Bakery', 'tab': 'Ultimate Drink' }
            , { 'name' : 'Bordello', 'location': 'inn', 'needtext' : 'Shearing Shed (sheepskins)\nWinery (booze)\nDocks (employees)', 'desc' : 'Mizak\'s Notes:   You can\'t have a decent inn without a whorehouse! It\’s the world’s oldest profession, and we need to accommodate our brave adventurers! Well-stocked with beautiful girls and pretty boys, we offer companionship for a reasonable fee.', 'needList': 'Shearing Shed, Winery, Docks', 'tab': 'Ultimate Inn' }
        ];
        function func_CreateUltimateDataPool(ultimateItemData) {
            var pool = {};
            ultimateItemData.forEach(function(u) {
                pool[u.location] = {'name': u.name, 'needArray': u.needList.split(",").map(function(e) { return e.trim(); }), 'location': u.location, 'needText': u.needtext, 'desc': u.desc, 'tab': u.tab };
            });
            return pool;
        }

        GameModel.m_IndustryNames = ['Alum','Beef','Fish','Grain', 'Hops','Ore','Salt','Wine', 'Wood', 'Wool'];

        // 是否玩家已经破产
        GameModel.func_IsBankrupt = function(){
            return this.m_nUserMoney.lessThan(0);
        }
        // 是否游戏通关
        GameModel.func_IsComplete = function(){
            var lTownBuildingsLvCount = this.m_nBSSwordLevel + this.m_nBSArmorLevel + this.m_nInnLevel
                + this.m_nShopLevel + this.m_nTavernLevel + this.m_nTempleLevel;
            if(lTownBuildingsLvCount < this.m_nMaxTownBuildingNum * this.m_nMaxTownLv)
                return false;

            var lBoughtIndustryCount = 0;
            this.m_IndustryNames.forEach(function(n){
                lBoughtIndustryCount += GameModel.func_GetBoughtIndustriesNum(n);
            });

            if(lBoughtIndustryCount >= this.m_IndustryNames.length * this.m_nMaxIndustryLv ){
                return true;
            }
            return false;
        }
        // 当前是否支持本地存储
        GameModel.func_SupportLocalStorage = function(){
            var test = 'FKLocalStorageTester';
            try{
                localStorage.setItem(test, test);
                localStorage.removeItem(test);
                return true;
            }
            catch (e){
                return false;
            }
        }
        // 是否本地已有存储信息
        GameModel.func_IsHadLocalStorage = function(){
            if(localStorage.getItem("FK_TLL_MilitiamenOfVolos_SaveData") === null)
                return false;
            return true;
        }
        // 保存游戏数据
        GameModel.func_SaveGameDataToLocalStorage = function(){
            console.log("开始保存游戏数据.");
            // 清除原本数据
            localStorage.removeItem("FK_TLL_MilitiamenOfVolos_SaveData");
            // 保存新数据
            var SaveObject = {
                Day : this.m_nDay,
                AdventurerList : this.m_AdventurerList,
                DeadAdventurerList : this.m_DeadAdventurerList,
                UserMoney : this.m_nUserMoney,
                MoneyRecordArray : this.m_MoneyRecordArray,
                AdventurerRecordArray : this.m_AdventurerRecordArray,
                SwordLevel : this.m_nBSSwordLevel,
                ArmorLevel : this.m_nBSArmorLevel,
                HPLossPercentage : this.m_nHPLossPercentage,
                HPLossRoll : this.m_nHPLossRoll,
                InnLevel : this.m_nInnLevel,
                MaxAdventurers : this.m_nMaxAdventurers,
                TempleLevel : this.m_nTempleLevel,
                IdleHourDays : this.m_nIdleHourDays,
                TavernLevel : this.m_nTavernLevel,
                ExpGainRoll : this.m_nExpGainRoll,
                ShopLevel : this.m_nShopLevel,
                GoldGainRoll : this.m_nGoldGainRoll,
                SwordMaintainCost : this.m_nSwordMaintainCost,
                ArmorMaintainCost : this.m_nArmorMaintainCost,
                TavernMaintainCost : this.m_nTavernMaintainCost,
                InnMaintainCost : this.m_nInnMaintainCost,
                TempleMaintainCost : this.m_nTempleMaintainCost,
                ShopMaintainCost : this.m_nShopMaintainCost,
                BoughtIndustriesList : this.func_GetBoughtIndustriesList(),
            };
            SaveObject.dataSaved = new Date();          // 数据保存时间
            localStorage.setItem("FK_TLL_MilitiamenOfVolos_SaveData", JSON.stringify(SaveObject));

            console.log("游戏数据保存完毕.");
        }
        // 读取游戏数据
        GameModel.func_LoadGame = function(){
            // 初始化工作
            this.func_Init();
            var loadObject = JSON.parse(localStorage.getItem("FK_TLL_MilitiamenOfVolos_SaveData"));
            if(!loadObject){
                console.log("没有游戏存储数据!");
                return false;
            }

            this.m_nDay = loadObject.Day;
            this.m_nUserMoney = new BigNumber(loadObject.UserMoney);
            this.m_MoneyRecordArray = loadObject.MoneyRecordArray;
            this.m_AdventurerRecordArray = loadObject.AdventurerRecordArray;
            this.m_nBSSwordLevel = loadObject.SwordLevel;
            this.m_nBSArmorLevel = loadObject.ArmorLevel;
            this.m_nHPLossPercentage = loadObject.HPLossPercentage;
            this.m_nHPLossRoll = loadObject.HPLossRoll;
            this.m_nInnLevel = loadObject.InnLevel;
            this.m_nMaxAdventurers = loadObject.MaxAdventurers;
            this.m_nTempleLevel = loadObject.TempleLevel;
            this.m_nIdleHourDays = loadObject.IdleHourDays;
            this.m_nTavernLevel = loadObject.TavernLevel;
            this.m_nExpGainRoll = loadObject.ExpGainRoll;
            this.m_nShopLevel = loadObject.ShopLevel;
            this.m_nGoldGainRoll = loadObject.GoldGainRoll;
            this.m_nSwordMaintainCost = loadObject.SwordMaintainCost;
            this.m_nArmorMaintainCost = loadObject.ArmorMaintainCost;
            this.m_nTavernMaintainCost = loadObject.TavernMaintainCost;
            this.m_nInnMaintainCost = loadObject.InnMaintainCost;
            this.m_nTempleMaintainCost = loadObject.TempleMaintainCost;
            this.m_nShopMaintainCost = loadObject.ShopMaintainCost;
            this.func_LoadAdventurersList(loadObject.AdventurerList, this.m_AdventurerList);
            this.func_LoadAdventurersList(loadObject.DeadAdventurerList, this.m_DeadAdventurerList);
            loadObject.BoughtIndustriesList.forEach(function(data){
                GameModel.m_BuildingsMapPool[data].purchased = true;
            });
            this.func_PrepareIdleStats(loadObject.dataSaved);
            return true;
        }
        // 获取当前日常维护费用
        GameModel.func_GetMaintenanceCost = function () {
            var cost = 0;
            cost += this.m_nSwordMaintainCost > 1 ? this.m_nSwordMaintainCost : 0;
            cost += this.m_nArmorMaintainCost > 1 ? this.m_nArmorMaintainCost : 0;
            cost += this.m_nTavernMaintainCost > 1 ? this.m_nTavernMaintainCost : 0;
            cost += this.m_nInnMaintainCost > 1 ? this.m_nInnMaintainCost : 0;
            cost += this.m_nTempleMaintainCost > 1 ? this.m_nTempleMaintainCost : 0;
            cost += this.m_nShopMaintainCost > 1 ? this.m_nShopMaintainCost : 0;
            var ret = Math.round(cost);
            //console.log("日常维护费用为：" + ret);
            return ret;
        }
        // 获取游戏概况描述
        GameModel.func_GetOverview = function(){
            var maintenance = this.func_GetMaintenanceCost();    // 日常维护开销
            var strRet = "Active adventurers num: " + this.m_AdventurerList.length + "\n";
            strRet += "Level 1-5: " + this.m_AdventurerList.filter(function(a){return a.level <= 5;}).length + "\n";
            strRet += "Level 6-10: " + this.m_AdventurerList.filter(function(a){return a.level <= 10 && a.level > 5;}).length + "\n";
            strRet += "Level 11-15: " + this.m_AdventurerList.filter(function(a){return a.level <= 15 && a.level > 11;}).length + "\n";
            strRet += "Level 16-20: " + this.m_AdventurerList.filter(function(a){return a.level <= 20 && a.level > 15;}).length + "\n";
            strRet += "Level 20+: " + this.m_AdventurerList.filter(function(a){return a.level > 20;}).length + "\n\n";
            strRet += "Day: " + this.m_nDay + "\n";
            strRet += "Current gold: " + this.m_nUserMoney.toFormat() + "\n";
            return strRet;
        }
        // 设置预备状态
        GameModel.func_PrepareIdleStats = function(saveData){
            this.m_nCounter = 0;
            this.m_nGameDaysPassed = 0;
            this.m_nOriginalFunds = new BigNumber(0);
            this.m_nIdleMoneyMade = new BigNumber(0);
            var saveDate = new Date(saveData);
            var today = new Date();
            // 限制挂机上限时间为7天
            var hoursPassed = Math.floor(Math.abs(today - saveDate) / 3600000);
            if(hoursPassed > 7 * 24)
                hoursPassed = 7 * 24;
            this.m_nGameDaysPassed = hoursPassed * this.m_nIdleHourDays;
            this.m_nOriginalFunds = this.m_nUserMoney;
        }
        // 模拟闲置时间行为
        GameModel.func_SimulateIdleTime = function(){
            for(this.m_nCounter = 0; this.m_nCounter < this.m_nGameDaysPassed; this.m_nCounter++){
                this.func_GoAdventuring();
                this.func_VisitTown();
            }
            this.m_nIdleMoneyMade = this.m_nUserMoney.minus(this.m_nOriginalFunds);
        }
        // 判断是否模拟计算完了全部闲置时间
        GameModel.func_IsIdleTimeCalculated = function(){
            return this.m_nCounter >= this.m_nGameDaysPassed;
        }
        GameModel.Func_DieRoll = function(size){
            return Math.floor(Math.random() * size) + 1;
        }
        // 出战(核心函数)
        GameModel.func_GoAdventuring = function() {
            var len = this.m_AdventurerList.length;
            for (var i = len - 1; i > -1; i--) {
                var lev = this.m_AdventurerList[i].level + this.m_nHPLossRoll;
                this.m_AdventurerList[i].func_TakeDamage(Math.round(this.m_AdventurerList[i].hpMax * this.m_nHPLossPercentage)
                    + GameModel.Func_DieRoll(this.m_AdventurerList[i].level));
                if (this.m_AdventurerList[i].alive) {
                    this.m_AdventurerList[i].func_LootMonster(lev, this.m_nExpGainRoll, this.m_nGoldGainRoll);
                    this.m_AdventurerList[i].func_CheckLevel(this.m_ExpPool);
                } else {
                    this.m_DeadAdventurerList.push(this.m_AdventurerList.splice(i, 1));
                }
            }
        }
        // 回城(核心函数)
        GameModel.func_VisitTown = function() {
            var len = this.m_AdventurerList.length;
            var adventurerIncome = 0;
            for (var i = len - 1; i > -1; i--) {
                // 首先冒险者们去治疗
                adventurerIncome += this.m_AdventurerList[i].func_Heal();
                // 然后挨个乱逛去
                adventurerIncome += this.m_AdventurerList[i].func_BackToTownCost(this.m_nShopLevel);
                //adventurerIncome += this.m_AdventurerList[i].func_BackToTownCost(this.m_nTavernLevel);
                adventurerIncome += this.m_AdventurerList[i].func_BackToTownCost(this.m_nTempleLevel);
                adventurerIncome += this.m_AdventurerList[i].func_BackToTownCost(this.m_nBSSwordLevel);
                adventurerIncome += this.m_AdventurerList[i].func_BackToTownCost(this.m_nBSArmorLevel);
                adventurerIncome += this.m_AdventurerList[i].func_BackToTownCost(this.m_nInnLevel);
            }
            // 计算日收益
            this.func_DailyIncomeUpdate(adventurerIncome);
        }
        GameModel.func_DailyIncomeUpdate = function(advIn) {
            var totalIncome = advIn;
            if (totalIncome > 0)
                totalIncome += Math.round(Math.pow(advIn, this.func_GetResourceExponent()));
            this.m_nUserMoney = this.m_nUserMoney.plus(new BigNumber(totalIncome));
            this.func_RecordData(totalIncome);
            this.m_nDay++;  // 过一天算一天
        }
        // 记录当日数据
        GameModel.func_RecordData = function(income){
            if (this.m_MoneyRecordArray.length > this.m_nMaxGrapyDays)
                this.m_MoneyRecordArray.shift();
            if (this.m_AdventurerRecordArray.length > this.m_nMaxGrapyDays)
                this.m_AdventurerRecordArray.shift();
            this.m_MoneyRecordArray.push(income);
            this.m_AdventurerRecordArray.push(this.m_AdventurerList.length);
        }
        // 获取资源指数
        GameModel.func_GetResourceExponent = function(){
            // 从商店里购买物品，会增加该资源指数
            var baseExponent = 1;
            for (var key in this.m_BuildingsMapPool)
                if (this.m_BuildingsMapPool[key].purchased)
                    baseExponent += this.m_BuildingsMapPool[key].level * .005;

            return baseExponent;
        }
        // 设置冒险组列表
        GameModel.func_LoadAdventurersList = function(loadList, targetList){
            loadList.forEach(function(adventure){
                var adventureObj = new Adventurer(1, [1, 1, 1]);
                adventureObj.func_LoadData(adventure.level, adventure.hp, adventure.fightStat,
                    adventure.hpMax, adventure.gold, adventure.totalEarnedGold, adventure.totalSpentGold,
                    adventure.exp, adventure.expToNextLv);
                targetList.push(adventureObj);
            });
        }
        // 获取用户金钱
        GameModel.func_GetUserMoney = function(){
            return this.func_FormatBigNumToText(this.m_nUserMoney);
        }
        GameModel.func_FormatBigNumToText = function(bigNum) {
            var million = new BigNumber(1000000);
            var billion = new BigNumber(1000000000);
            var trillion = new BigNumber(1000000000000);
            var quadrillion = new BigNumber(1000000000000000);

            if (bigNum.greaterThanOrEqualTo(quadrillion)) {
                return bigNum.dividedBy(quadrillion) + " quadrillion";
            } else if (bigNum.greaterThanOrEqualTo(trillion)) {
                return bigNum.dividedBy(trillion) + " trillion";
            } else if (bigNum.greaterThanOrEqualTo(billion)) {
                return bigNum.dividedBy(billion) + " billion";
            } else if (bigNum.greaterThanOrEqualTo(million)) {
                return bigNum.dividedBy(million) + " million";
            } else {
                return bigNum.toFormat();
            }
        }
        GameModel.func_FormatNumToText = function(num) {
            var bigNum = new BigNumber(num);
            return this.func_FormatBigNumToText(bigNum);
        }
        // 获取指定地图的建筑状况
        GameModel.func_GetIndustries = function(loc){
            var types = new Set();
            for(var key in this.m_BuildingsMapPool){
                if(this.m_BuildingsMapPool[key].location === loc){
                    types.add(this.m_BuildingsMapPool[key].industry);
                }
            }
            var typesArray = [];
            types.forEach(function(e){ typesArray.push(e); });
            return typesArray;
        }
        // 已经购买的建筑个数
        GameModel.func_GetBoughtIndustriesNum = function(industriesName){
            var iName = industriesName.toLowerCase();
            var nRet = 0;
            for(var key in this.m_BuildingsMapPool){
                if(this.m_BuildingsMapPool[key].industry === iName &&
                    this.m_BuildingsMapPool[key].purchased ){
                    nRet++;
                }
            }
            return nRet;
        }
        // 已经购买的建筑列表
        GameModel.func_GetBoughtIndustriesList = function(){
            var BoughtIndestriesList = [];
            for(var key in this.m_BuildingsMapPool){
                if(this.m_BuildingsMapPool[key].purchased)
                    BoughtIndestriesList.push[key];
            }
            return BoughtIndestriesList;
        }
        // 获取指定地图的建筑状况
        GameModel.func_GetLocationBuildings = function(loc){
            var locationBuildings = {};
            for(var key in this.m_BuildingsMapPool){
                if(loc === null || this.m_BuildingsMapPool[key].location === loc) {
                    locationBuildings[key] = this.m_BuildingsMapPool[key];
                }
            }
            return locationBuildings;
        }
        // 购买一个建筑
        GameModel.func_BuyBuildings = function(buildingName){
            this.m_nUserMoney = this.m_nUserMoney.minus(new BigNumber(this.m_BuildingsMapPool[buildingName].cost));
            this.m_BuildingsMapPool[buildingName].purchased = true;
        }
        // 查询一个建筑是否已经购买完毕
        GameModel.func_IsBuildingPurchased = function(buildingName){
            return this.m_BuildingsMapPool[buildingName].purchased;
        }
        // 是否有足够金钱
        GameModel.func_IsHasAmount = function(amount) {
            return this.m_nUserMoney.greaterThanOrEqualTo(new BigNumber(amount));
        }
        // 获取招募冒险者的费用
        GameModel.func_AdventurerCost = function(numOfAdv) {
            var numOfAdventurers = this.m_AdventurerList.length;
            var cost = 0;
            for (var i = 0; i < numOfAdv; i++) {
                cost += this.func_NewAdventurerCost(numOfAdventurers);
                numOfAdventurers++;
            }
            return cost;
        }
        // 单个冒险者价格
        GameModel.func_NewAdventurerCost = function(numOfAdv) {
            return Math.floor(50 + 50 * Math.pow(numOfAdv, 1.75));
        }
        // 增加冒险者
        GameModel.func_AddAdventurers = function(num) {
            this.m_nUserMoney = this.m_nUserMoney.minus(new BigNumber(this.func_AdventurerCost(num)));
            for (var i = 0; i < num; i++)
                this.m_AdventurerList.push(new Adventurer(1, this.m_ExpPool[1]));
        }
        //--------------------------------------------------------------------
        // 人类基类
        var Being = function(level, levelStats){
            this.alive = true;
            this.level = level;
            this.hp = levelStats[1];
            this.fightStat = levelStats[2];
        }
        Being.prototype.func_TakeDamage = function(HPLoss){
            if(HPLoss <= 0)
                return;
            this.hp -= HPLoss;
            if(this.hp <= 0){
                this.hp = 0;
                this.alive = false;
            }
        }
        //--------------------------------------------------------------------
        // 冒险者类
        var Adventurer = function(level, levelStats){
            Being.call(this, level, levelStats);
            this.hpMax = levelStats[1];         // 冒险者最大HP
            this.gold = 25;                     // 冒险者携带金钱
            this.totalEarnedGold = 0;         // 冒险者盈利
            this.totalSpentGold = 0;          // 冒险者消费金钱
            this.exp = 0;                       // 冒险者当前经验总量
            this.expToNextLv = levelStats[0];  // 冒险者到下一级的所需经验残余
        };
        Adventurer.prototype = Object.create(Being.prototype);
        Adventurer.prototype.constructor = Adventurer;
        // 读取存档，进行数据初始化
        Adventurer.prototype.func_LoadData = function(level, hp, fightStat, hpMax, gold,
            totalEarnedGold, totalSpentGold, exp, expToNextLv){
            this.level = level;
            this.hp = hp;
            this.fightStat = fightStat;
            this.hpMax = hpMax;
            this.gold = gold;
            this.totalEarnedGold = totalEarnedGold;
            this.totalSpentGold = totalSpentGold;
            this.exp = exp;
            this.expToNextLv = expToNextLv;
        }
        // 怪物死亡，抢劫怪物
        Adventurer.prototype.func_LootMonster = function(deadMonsterLevel, extraExpRoll, extraGoldRoll){
            // 计算金钱掉落公式
            var goldDrop = 10 * Math.rand(Math.pow(deadMonsterLevel, 2));
            var extraGoldDrop = Math.floor(Math.random() * extraGoldRoll) + 1;
            this.gold += (goldDrop + extraGoldDrop);
            this.totalEarnedGold += (goldDrop + extraGoldDrop);
            var expDrop = Math.floor(Math.pow(deadMonsterLevel, 1.5));
            var extraExpDrop = Math.floor(Math.random() * extraExpRoll) + 1;
            this.exp += (expDrop + extraExpDrop);
        }
        // 检查是否升级
        Adventurer.prototype.func_CheckLevel = function(expPool){
            if(this.exp < this.expToNextLv){
                return; // 不够升级
            }
            this.level++;
            // 升级经验公式 / 升级属性公式
            if(this.level > 5){
                this.expToNextLv *= 2;
                this.hpMax += this.level;
                this.fightStat += Math.ceil(this.level / 10);
            }
            else{
                this.expToNextLv = expPool[this.level][0];
                this.hpMax = expPool[this.level][1];
                this.fightStat = expPool[this.level][2];
            }
        }
        // 治愈冒险者
        Adventurer.prototype.func_Heal = function(){
            // 治愈费用公式 1点HP = 1Gold
            var needHeal = this.hpMax - this.hp;
            var healCost = 0;
            if(this.gold < needHeal){
                healCost = this.gold;
            }
            else{
                healCost = needHeal;
            }
            this.hp += healCost;
            this.gold -= healCost;
            return healCost;
        }
        // 回村金币消耗
        Adventurer.prototype.func_BackToTownCost = function(level){
            var goldSpent = Math.round(this.gold * level / 500);
            if(this.gold >= goldSpent){
                this.gold -= goldSpent;
            }
            else{
                goldSpent = this.gold;
                this.gold = 0;
            }
            return goldSpent;
        }


        // 对白数据
        GameModel.openDialogue = [
            { 'speaker': 'Mizak', 'graphic': 'MizakHead', 'text': 'Man, I\'m tired. How are you guys holding up?' }
            , { 'speaker': 'Lissette', 'graphic': 'lissetteFrown', 'text': 'I couldn\'t have gotten more than four hours of sleep this week, with all those adventurers visiting the tavern.' }
            , { 'speaker': 'Clavo', 'graphic': 'clavoFrown', 'text': 'My aunt\'s inn is crammed to the rafters, and they still keep coming into town.' }
            , { 'speaker': 'Lemel', 'graphic': 'lemelFrown', 'text': 'I can barely lift my arms, I\'ve forged so many swords.' }
            , { 'speaker': 'Mizak', 'graphic': 'MizakHead', 'text': 'Hasn\'t anyone raised their prices since adventurers started hitting the dungeon? They\'re bringing in lots of treasure; they can afford it.' }
            , { 'speaker': 'Lissette', 'graphic': 'lissetteFrown', 'text': 'Actually, that makes sense. Maybe if we raised our prices, we wouldn\'t be so busy.' }
            , { 'speaker': 'Lemel', 'graphic': 'lemelFrown', 'text': 'But then we\'ll lose business!' }
            , { 'speaker': 'Mizak', 'graphic': 'MizakHead', 'text': 'Think, big guy! If we charge more, we won\'t need as many customers. And since we\'re the only village in the area, they don\'t have a choice! I have a great plan! I just need to borrow-' }
            , { 'speaker': 'Lemel', 'graphic': 'lemelOut', 'text': 'Here it comes....' }
            , { 'speaker': 'Mizak', 'graphic': 'MizakHead', 'text': '-50 thalers. Lissette, you can spare that much, can\'t you?' }
            , { 'speaker': 'Lissette', 'graphic': 'lissetteAngry', 'text': 'The last time I lent you money, you took eight months to pay it back!' }
            , { 'speaker': 'Mizak', 'graphic': 'MizakHead', 'text': 'Okay, I made a mistake back then. But I have a foolproof plan now.' }
            , { 'speaker': 'Clavo', 'graphic': 'clavoFrown', 'text': 'The last time you had a plan, you trapped us in the dungeon and nearly got us all killed.' }
            , { 'speaker': 'Mizak', 'graphic': 'mizakLaugh', 'text': 'Look. It\'s only a few gold coins. I just need to recruit some more adventurers, work with you guys to improve the shops a bit, and then start buying up the local industries. I\'m telling you, we could be rich!' }
            , { 'speaker': 'Lissette', 'graphic': 'lissetteAngry', 'text': 'Here\'s the money. If I don\'t get it back, I\'m going to beat your ass!' }
            , { 'speaker': 'Mizak', 'graphic': 'MizakHead', 'text': 'No worries. Just follow my lead...\n\n(Press next to start game)' }
        ];

        GameModel.winDialogue = [
            { 'speaker': 'Mizak', 'graphic': 'mizakLaugh', 'text': 'I did it! We have a monopoly on everything! We\'re rich!' }
            , { 'speaker': 'Lissette', 'graphic': 'lissetteAngry', 'text': 'Then where\'s all the gold?!? I need that fifty I loaned you back!' }
            , { 'speaker': 'Mizak', 'graphic': 'MizakHead', 'text': 'Umm...well you see, the money\'s tied up in the property. We\'ll start getting gold coins back again...maybe in a few months....' }
            , { 'speaker': 'Lissette', 'graphic': 'lissetteAngry', 'text': 'That\'s it!!!' }
        ];

        GameModel.loadDialogue = [
            { 'speaker': 'Mizak', 'graphic': 'MizakHead', 'text': 'While you were idle, your adventurers brought in this much money:' }
        ];

        GameModel.loseDialogue = [
            { 'speaker': '', 'graphic': '', 'text': 'Bankrupt! Game Over.' }
        ];

        return GameModel;
    }

    if(typeof(GameModel) === 'undefined'){
        window.GameModel = func_CreateModel();
    }
    else{
        console.log("GameModel已存在...");
    }
})(window);