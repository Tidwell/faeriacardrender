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

	var keywordColors = {
		B: {text: '#00a7a6', bg: '#00222e'},
		G: {text: '#a9f300', bg: '#2d5d00'},
		R: {text: '#db3500', bg: '#2a0007'},
		Y: {text: '#ffc100', bg: '#0f0e0e'},
		H: {text: '#baa083', bg: '#2d2727'}
	};

	var keywords = [
		'Ranged attack',
		'Strikeback',
		'Conquest',
		'Flying',
		'Charge',
		'Haste',
		'Haunt',
		'Protection',
		'Accumulator',
		'Jump',
		'Frenzy',
		'Curse',
		'Radiate',
		'Aquatic',
		'Auto-collect'
	];

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
			var startOffset;
			//land icons are rendered right to left
			if (card['land'+color]) {
				startOffset = iconOffset;
			}
			if (card['land'+color] > 1) {
				startOffset += (landIconWidth/2)*(card['land'+color]-1);
			}
			var i = 0;
			while (i< card['land'+color]) {
				queueImage({
					image: 'img/card_cost_'+color+'.png',
					x: startOffset,
					y: 16
				});
				startOffset -= landIconWidth/2;
				i++;
			}
		});

		queueImage({
			image: rarityMap[card.rarity],
			x: 12,
			y: 452
		});

		var titleOpts = {
			text: card.name.toUpperCase(),
			font: 'normal normal bold 15px Cambo',
			fillStyle: '#d0c8a8',
			x: 140,
			y: 35,
			maxWidth: 200,
			lineHeight: 15,
			boxHeight: 100
		};
		//titleOpts.x = getCenteredTextOffset(titleOpts);
		queueWrapText(titleOpts);

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
			y: 310,
			maxWidth: 220,
			lineHeight: 20,
			font: 'normal normal normal 16px Helvetica',
			fillStyle: '#000',
			boxHeight: 200,
			color: card.color[0].toUpperCase()
		};
		queueWrapText(effectText);

		if (card.type === 'Creature') {
			var attackLifeOpts = {
				text: card.attack + ' / ' + card.life,
				font: 'normal normal normal 24px Cambo',
				fillStyle: '#d0c8a8',
				align: 'center',
				x: 137,
				y: 335
			};
			queueText(attackLifeOpts);
		} else if (card.type === 'Structure') {
			var lifeOpts = {
				text: card.life,
				font: 'normal normal normal 24px Cambo',
				fillStyle: '#d0c8a8',
				align: 'center',
				x: 137,
				y: 335
			};
			queueText(lifeOpts);
		}

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
					totalIconWidth += landIconWidth * (card['land'+color]-1) / 2;
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

	function generateKeyword(keyword) {
		keyword = keyword.replace('[','');
		keyword = keyword.replace(']','');
		var reg = new RegExp(/[0-9]/);
		var num = keyword.match(reg);
		if (num) {
			num = num[0];
			keyword = keyword.replace(num, ' '+num);
		}
		return keyword;
	}

	function wrapText(opt) {
		var boxHeight = opt.boxHeight;
		var text = opt.text;
		var maxWidth = opt.maxWidth;
		var lineHeight = opt.lineHeight;

		ctx.font = opt.font;
		ctx.fillStyle = opt.fillStyle;
		ctx.textAlign = 'center';

		var words = text.split(' ');
		var lines = [];
		var line = '';

		for (var n = 0; n < words.length; n++) {
			var testLine = line + words[n] + ' ';
			var metrics = ctx.measureText(testLine);
			var testWidth = metrics.width;
			if (testWidth > maxWidth && n > 0) {
				lines.push(line);
				line = words[n] + ' ';
			} else {
				line = testLine;
			}
		}
		lines.push(line);

		var y = opt.y+(boxHeight-(lines.length*lineHeight))/2;

		lines.forEach(function(l){
			var isRendered = false;
			var x = opt.x;
			function renderColored(opt,x,y,txtWidth,keyword) {
				keyword = generateKeyword(keyword);

				ctx.beginPath();
				ctx.rect(x, y-12, ctx.measureText(keyword).width, 16);
				ctx.fillStyle = keywordColors[opt.color].bg;
				ctx.fill();

				ctx.fillStyle = keywordColors[opt.color].text;
				ctx.fillText(keyword, x, y);

			}

			colorToRender = [];

			keywords.forEach(function(keyword){

				if (l.indexOf(keyword) !== -1) {
					var reg = new RegExp('\\['+keyword+'[0-9]'+'\\]');
					if (l.match(reg)) {
						keyword = l.match(reg)[0];
					}
					var before = l.substr(0, l.indexOf(keyword));
					var after = l.substr(l.indexOf(keyword)+keyword.length, l.length);

					x = ((cardWidth-ctx.measureText(l).width)/2 + 5);
					ctx.textAlign = 'left';
					ctx.fillStyle = opt.fillStyle;
					ctx.fillText(before, x, y);
					x += ctx.measureText(before).width;

					var colorX = x;
					var colorY = y;

					var txtWidth = ctx.measureText(generateKeyword(keyword)).width;
					x += txtWidth;

					ctx.fillStyle = opt.fillStyle;
					ctx.fillText(after, x, y);

					colorToRender.push({
						opt: opt,
						x: colorX,
						y: colorY,
						txtWidth: txtWidth,
						keyword: keyword
					});

					isRendered = true;
				}
			});
			colorToRender.forEach(function(opt) {
				renderColored(opt.opt, opt.x,opt.y,opt.txtWidth,opt.keyword);
			});

			if (!isRendered) {
				ctx.textAlign = 'center';
				ctx.fillStyle = opt.fillStyle;
				ctx.fillText(l, x, y);
			}
			y += lineHeight;
		});
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