(function() {
	var canvas;
	var ctx;

	var container = 'body';

	var cardWidth = 272;
	var cardHeight = 450;

	var goldIconWidth = 33;
	var faeriaIconWidth = 32;
	var landIconWidth = 34;

	var rarityHeight = 15;

	var drawBuffer = [];
	var totalLoaded = 0;

	var ready = false;
	var afterLoad = [];

	var onReadyFuncs = [];

	var iconPadding = 2;

	var rarityMap = {
		C: 'img/card_rarity_common.png',
		U: 'img/card_rarity_uncommon.png',
		E: 'img/card_rarity_exceptional.png',
		R: 'img/card_rarity_rare.png',
		L: 'img/card_rarity_legendary.png',
	};

	var landProps = ['B', 'G', 'R', 'Y'];

	function onReady(func) {
		onReadyFuncs.push(func);
	}

	function setContainer(selector) {
		container = selector;
		getElements();
	}
	function init() {
		getElements();
	}

	function getElements() {
		//append the canvas
		var el = document.querySelectorAll(container);
		el[0].innerHTML = '<canvas width="500" height="500"></canvas>';
		canvas = el[0].querySelectorAll('canvas')[0];
		//get the context
		ctx = canvas.getContext('2d');
	}

	function fontActive() {
		ready = true;

		onReadyFuncs.forEach(function(func) { func(); });
		onReadyFuncs = [];

		afterLoad.forEach(function(card) {
			render(card);
		});
		afterLoad = [];
	}

	function render(card) {
		if (!ready) { afterLoad.push(card); return; }
		if (!ctx) { getElements(); }

		queueImage({
			image: card.img,
			x: 18,
			y: 73
		});

		var background = 'img/cardbg_' + card.color + (card.type.toLowerCase() === 'event' ? '_event' : '') + '.png';
		queueImage({
			image: background,
			x: 0,
			y: 33
		});

		var iconOffset = getIconOffset(card);

		if (card.gold) {
			queueImage({
				image: 'img/card_goldicon.png',
				x: iconOffset,
				y: 20
			});
			queueText({
				text: card.gold,
				font: 'normal normal normal 20px Cambo',
				fillStyle: '#000',
				x: iconOffset+(goldIconWidth/2)-6,
				y: 41
			});
			iconOffset += goldIconWidth+iconPadding;
		}
		if (card.faeria) {
			queueImage({
				image: 'img/card_faeriaicon.png',
				x: iconOffset,
				y: 18
			});
			queueText({
				text: card.faeria,
				font: 'normal normal normal 20px Cambo',
				fillStyle: '#000',
				x: iconOffset+(faeriaIconWidth/2)-5,
				y: 40
			});
			iconOffset += faeriaIconWidth+iconPadding;
		}

		landProps.forEach(function(color){
			var i = 0;
			while (i< card['land'+color]) {
				queueImage({
					image: 'img/card_cost_'+color+'.png',
					x: iconOffset,
					y: 16
				});
				iconOffset += landIconWidth/2;
				i++;
			}
		});

		queueImage({
			image: rarityMap[card.rarity],
			x: 12,
			y: 452
		});

		var titleOpts = {
			text: card.name,
			font: 'normal normal bold 15px Cambo',
			fillStyle: '#d0c8a8',
			x: null,
			y: 80
		};
		titleOpts.x = getCenteredTextOffset(titleOpts);
		queueText(titleOpts);

		var typeOpts = {
			text: card.type,
			font: 'normal normal normal 20px Cambo',
			fillStyle: '#d0c8a8',
			x: null,
			y: 473
		};
		typeOpts.x = getCenteredTextOffset(typeOpts);
		queueText(typeOpts);

		effectText = {
			text: card.effect,
			x: 140,
			y: 390,
			maxWidth: 250,
			lineHeight: 20,
			font: 'normal normal normal 17px Helvetica',
			fillStyle: '#000'
		};
		queueWrapText(effectText);

		var attackLifeOpts = {
			text: card.attack + ' / ' + card.life,
			font: 'normal normal normal 24px Cambo',
			fillStyle: '#d0c8a8',
			align: 'center',
			x: 137,
			y: 335
		};
		queueText(attackLifeOpts);
	}

	function getIconOffset(card) {
		var totalIcons = 0;
		var totalIconWidth = 0;
		var isGold = false;
		var isFaeria = false;
		var isLand = false;

		if (card.gold) {
			totalIcons++;
			totalIconWidth += goldIconWidth;
			isGold = true;
		}
		if (card.faeria) {
			totalIcons++;
			totalIconWidth += faeriaIconWidth;
			isFaeria = true;
		}
		landProps.forEach(function(color){
			if (card['land'+color]) {
				totalIcons += card['land'+color];
				totalIconWidth += landIconWidth;
				if (card['land'+color] > 1) {
					totalIconWidth += landIconWidth * (card['land'+color]-1) / 2
				}
			}
			isLand = true;
		});

		if (isGold && isFaeria || isGold && isLand || isFaeria && isLand) {
			totalIconWidth += iconPadding; //padding between icons
		}

		if (isGold && isLand && isFaeria) {
			totalIconWidth += iconPadding;
		}

		return (cardWidth-totalIconWidth)/2;
	}
	function getCenteredTextOffset(opt) {
		ctx.font = opt.font;
		ctx.fillStyle = opt.fillStyle;
		var txtWidth = ctx.measureText(opt.text).width;
		return ((cardWidth-txtWidth)/2)+4;
	}

	function wrapText(opt) {
		var text = opt.text;
		var x = opt.x;
		var y = opt.y;
		var maxWidth = opt.maxWidth;
		var lineHeight = opt.lineHeight;

		ctx.font = opt.font
		ctx.fillStyle = opt.fillStyle;
		ctx.textAlign = 'center';

		var words = text.split(' ');
		var line = '';

		for (var n = 0; n < words.length; n++) {
			var testLine = line + words[n] + ' ';
			var metrics = ctx.measureText(testLine);
			var testWidth = metrics.width;
			if (testWidth > maxWidth && n > 0) {
				ctx.fillText(line, x, y);
				line = words[n] + ' ';
				y += lineHeight;
			} else {
				line = testLine;
			}
		}
		ctx.fillText(line, x, y);
	}

	function queueImage(opt) {
		var img = new Image(); // Create new img element

		img.addEventListener('load', function() {
			totalLoaded++;
			if (totalLoaded === drawBuffer.length) {
				drawAll();
			}
		}, false);
		img.src = opt.image; // Set source path
		opt.img = img;
		opt.type = 'image';
		drawBuffer.push(opt);
	}

	function queueText(opt) {
		opt.type = 'text';
		drawBuffer.push(opt);
		totalLoaded++;
		if (totalLoaded === drawBuffer.length) {
			drawAll();
		}
	}

	function queueWrapText(opt) {
		opt.type = 'wraptext';
		drawBuffer.push(opt);
		totalLoaded++;
		if (totalLoaded === drawBuffer.length) {
			drawAll();
		}
	}

	function drawAll() {
		drawBuffer.forEach(function(opt) {
			switch (opt.type) {
				case 'image':
					ctx.drawImage(opt.img, opt.x, opt.y);
					break;
				case 'text':
					ctx.textAlign = opt.align ? opt.align : 'left';
					ctx.font = opt.font;
					ctx.fillStyle = opt.fillStyle;
					ctx.fillText(opt.text, opt.x, opt.y);
					break;
				case 'wraptext':
					wrapText(opt);
					break;

			}
		});
		drawBuffer = [];
		totalLoaded = 0;
	}

	window.FAERIACARDS = {
		render: render,
		ready: onReady,
		setContainer: setContainer,
		init: init,

		setFontActive: fontActive,
	}
}());

//load fonts
WebFontConfig = {
	google: {
		families: ['Cambo']
	},
	fontactive: function(familyName, fvd) {
		FAERIACARDS.setFontActive();
	}
};
(function () {
    var wf = document.createElement('script');
    wf.src = ('https:' == document.location.protocol ? 'https' : 'http') +
        '://ajax.googleapis.com/ajax/libs/webfont/1/webfont.js';
    wf.type = 'text/javascript';
    wf.async = 'true';
    var s = document.getElementsByTagName('script')[0];
    s.parentNode.insertBefore(wf, s);
})();