const database = require('./datbase')

var _ = require('lodash');

function printHeader() {
    return `***<没钱赚商店>购物清单***\n`;
}

function generateItemObj(itemObj, barcode) {
    return Object.assign(itemObj, getItemDetails(barcode))
}

function printItem(itemObj) {
    return `名称：${itemObj.name}，数量：${itemObj.count}${itemObj.unit}，单价：${itemObj.price.toFixed(2)}(元)，小计：${itemObj.subtotal.toFixed(2)}(元)\n`
}

function printPromotionHeader() {
    return "挥泪赠送商品：\n";
}

function printPromotionItem(itemObj) {
    return `名称：${itemObj.name}，数量：${itemObj.promotedCount}${itemObj.unit}\n`;
}
function printLineBreak() {
    return `----------------------\n`;
}
function printTotal(summary) {
    return `总计：${summary.total.toFixed(2)}(元)\n节省：${summary.savedTotal.toFixed(2)}(元)\n**********************`;
}

function main() {
    return 'Hello World!';
};

function calculateTotal(itemsInCart) {
    return _.reduce(itemsInCart, function(acc, item) {
        acc.total += item.subtotal;
        acc.savedTotal += item.price * item.promotedCount || 0;
        return acc;
    }, { total: 0, savedTotal: 0});
}

function printInventory(inputs) {
    let message = printHeader();

    let itemsInCart = groupByItem(inputs);
    _.forIn(itemsInCart, function (value, key) {
        generateItemObj(value, key);
    });

    addPromotion(itemsInCart);

    _.forIn(itemsInCart, function (item) {
        if (item.promoType === 'BUY_TWO_GET_ONE_FREE' && item.count >= 3) {
            item.promotedCount = Math.floor(item.count / 3);
        }
        item.subtotal = item.price * (item.count - (item.promotedCount || 0));
        message += printItem(item);
    });

    message += printLineBreak();
    message += printPromotionHeader();
    _.forIn(itemsInCart, function (item) {
        if (item.promotedCount) {
            message += printPromotionItem(item);
        }
    });
    message += printLineBreak();
    message += printTotal(calculateTotal(itemsInCart));

    console.log(message);
    return message;
}

function getItemDetails(barcode) {
    let items = database.loadAllItems();

    let itemDetails = _.find(items, function (obj) {
        return obj.barcode===barcode;
    });

    return itemDetails;
}

function parseBarcode(input) {
    const [barcode, count = 1] = input.split('-');
    return {barcode, count: parseInt(count)}
}

function groupByItem (inputs) {
    return inputs.reduce((acc, cur) => {
        let obj = parseBarcode(cur);
        acc[obj.barcode] = acc[obj.barcode] || {};
        acc[obj.barcode].count = (acc[obj.barcode].count || 0) + obj.count;
        return acc;
    }, {});
}

function addPromotion(items) {
    let promotions = database.loadPromotions();

    promotions.forEach(promo => {
        let barcodes = promo.barcodes;
        barcodes.forEach(barcode => {
            if (items[barcode]) {
                items[barcode].promoType = promo.type;
            }
        })
    })
}

module.exports = {
    main,
    printInventory
}
