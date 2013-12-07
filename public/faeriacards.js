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

	var currentCallback = null;

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
		G: {text: '#a9f300', bg: '#0d3109'},
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
		'Auto-collect',
		'Convoke'
	];

	function onReady(func) {
		if (!ready) {
			onReadyFuncs.push(func);
		} else {
			func();
		}
	}

	function setContainer(selector) {
		if (container === selector) { return; }
		container = selector;
		getElements();
	}
	function init() {
		getElements();
	}

	function getElements() {
		//append the canvas
		var el = document.querySelectorAll(container);
		if (el.length) {
			el[0].innerHTML = '<canvas width="280" height="500"></canvas>';
			canvas = el[0].querySelectorAll('canvas')[0];
			//get the context
			ctx = canvas.getContext('2d');
		}
	}

	var loadedFonts = 0;
	function fontActive() {
		loadedFonts++;
		if (loadedFonts !== 2) { return; }
		ready = true;

		onReadyFuncs.forEach(function(func) { func(); });
		onReadyFuncs = [];

		afterLoad.forEach(function(card) {
			render(card);
		});
		afterLoad = [];

		renderNext();
	}

	var isRendering = false;
	var renderQueue = [];
	function queueRender(obj) {
		renderQueue.push(obj);
		renderNext();
	}

	function clearQueue() {
		renderQueue = [];
	}

	function renderNext() {
		if (!ready || isRendering || !renderQueue.length) { return; }
		var toRender = renderQueue.shift();
		currentCallback = toRender.callback;
		if (container != toRender.container) {
			setContainer(toRender.container);
		}
		render(toRender.card);
	}
	function render(card) {
		if (isRendering) { return; }
		if (!ready) { afterLoad.push(card); return; }
		if (!ctx) { getElements(); }
		isRendering = true;
		ctx.clearRect ( 0,0,canvas.width,canvas.height );

		queueImage({
			image: card.img,
			x: 18,
			y: 73,
			w: 250,
			h: 250
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
				font: 'normal 16px Serif',
				fillStyle: '#000',
				x: iconOffset+(goldIconWidth/2)-5,
				y: 40
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
				font: 'normal 16px Serif',
				fillStyle: '#000',
				x: iconOffset+(faeriaIconWidth/2)-4,
				y: 40
			});
			iconOffset += faeriaIconWidth+iconPadding;
		}

		var toQueue = [];

		landProps.forEach(function(color){
			var startOffset;
			//land icons are rendered right to left
			//if there is at least one land cost, we use last point we left off
			if (card['land'+color]) {
				startOffset = iconOffset;
			}
			//if there are more than one icon, we adjust for each one
			if (card['land'+color] > 1) {
				startOffset += (landIconWidth/2)*(card['land'+color]-1);
			}
			var i = 0;
			while (i< card['land'+color]) {
				//IIFE to capture the startOffset
				(function(offset) {
					//add it to the queue we will sort later to make sure they are in the right order
					toQueue.push({offset: offset, f: function() {
						queueImage({
							image: 'img/card_cost_'+color+'.png',
							x: offset,
							y: 17
						});
					}});
				}(startOffset));
				//update the start offset and the icon offset
				startOffset -= landIconWidth/2;
				iconOffset += landIconWidth/2;
				i++;
			}
		});
		//sort the queue so that they are in offset order
		toQueue.sort(function(a,b){return a.offset - b.offset; });
		//reverse it so they are right->left renderable
		toQueue.reverse();
		//call each function to render it
		toQueue.forEach(function(f){f.f();});

		if (card.rarity) {
			queueImage({
				image: rarityMap[card.rarity],
				x: 12,
				y: 452
			});
		}

		var titleOpts = {
			text: card.name.toUpperCase(),
			font: 'bold 15px IM Fell English',
			fillStyle: '#d9d1b8',
			x: 140,
			y: 35,
			maxWidth: 200,
			lineHeight: 15,
			boxHeight: 100
		};
		queueWrapText(titleOpts);

		var typeOpts = {
			text: card.type,
			font: 'normal 19px IM Fell English',
			fillStyle: '#d9d1b8',
			x: null,
			y: 473
		};
		typeOpts.x = getCenteredTextOffset(typeOpts);
		queueText(typeOpts);

		if (card.effect) {
			effectText = {
				text: card.effect,
				x: 140,
				y: 310,
				maxWidth: 220,
				lineHeight: 20,
				font: 'normal 16px Arial',
				fillStyle: '#000',
				boxHeight: 200,
				color: card.color[0].toUpperCase()
			};
			queueWrapText(effectText);
		}

		if (card.type === 'Creature') {
			var attackLifeOpts = {
				text: card.attack + '    ' + card.life,
				font: 'normal 20px Prata',
				fillStyle: '#d9d1b8',
				align: 'center',
				x: 137,
				y: 335,
				stroke: true
			};
			queueText(attackLifeOpts);

			queueText({
				text: '/',
				font: 'normal 30px Arial Narrow',
				fillStyle: '#635241',
				align: 'center',
				x: 137,
				y: 339
			});
		} else if (card.type === 'Structure' && card.life) {
			var lifeOpts = {
				text: card.life,
				font: 'normal 20px Prata',
				fillStyle: '#d9d1b8',
				align: 'center',
				x: 137,
				y: 335,
				stroke: true
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
		var areLands = false;
		landProps.forEach(function(color){
			if (card['land'+color]) {
				totalIcons += card['land'+color];
				if (!areLands) {
					//if it is the primary color we offset by the full icon width (for the entire visible icon)
					totalIconWidth += landIconWidth;
				} else {
					//if it is a secondary color we have to offset by just half the icon width
					totalIconWidth += landIconWidth/2;
				}
				if (card['land'+color] > 1) {
					totalIconWidth += landIconWidth * (card['land'+color]-1) / 2;
				}
				areLands = true;
			}
			isLand = true;
		});

		if (isGold && isFaeria || isGold && isLand || isFaeria && isLand) {
			totalIconWidth += iconPadding; //padding between icons
		}

		if (isGold && isLand && isFaeria) {
			totalIconWidth += iconPadding;
		}

		return ((cardWidth-totalIconWidth)/2);
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

	function renderColored(opt,x,y,txtWidth,keyword) {
		keyword = generateKeyword(keyword);

		ctx.beginPath();
		ctx.rect(x, y-12, ctx.measureText(keyword).width, 16);
		ctx.fillStyle = keywordColors[opt.color].bg;
		ctx.fill();

		ctx.fillStyle = keywordColors[opt.color].text;
		ctx.fillText(keyword, x, y);

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
			if (words[n]==='[lb]') {
				lines.push(line);
				line = '';
			} else {
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
		}
		lines.push(line);

		var y = opt.y+(boxHeight-(lines.length*lineHeight))/2;

		lines.forEach(function(l){
			var isRendered = false;
			var x = opt.x;

			colorToRender = [];

			keywords.forEach(function(keyword){

				if (l.indexOf(keyword) !== -1) {
					var reg = new RegExp('\\['+keyword+'[0-9]'+'\\]');
					if (l.match(reg)) {
						keyword = l.match(reg)[0];
					}
					var before = l.substr(0, l.indexOf(keyword));
					var after = l.substr(l.indexOf(keyword)+keyword.length, l.length);

					before = before.replace(']','');
					after = after.replace('[','');

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
		//a url
		if (typeof opt.image === 'string') {
			var img = new Image(); // Create new img element

			img.addEventListener('load', function() {
				totalLoaded++;
				if (totalLoaded === drawBuffer.length) {
					drawAll();
				}
			}, false);

			img.addEventListener('error', function() {
				opt.img = null;
				totalLoaded++;
				if (totalLoaded === drawBuffer.length) {
					drawAll();
				}
			})
			img.src = opt.image; // Set source path
			opt.img = img;
		} else {
			opt.img = opt.image;
		}

		opt.type = 'image';
		drawBuffer.push(opt);

		//coming from local file
		if (typeof opt.image === 'object') {
			totalLoaded++;
			drawAll();
		}
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
					if (!opt.img) { return; } //failed to load
					if (opt.w && opt.h) {
						ctx.drawImage(opt.img, opt.x, opt.y, opt.w, opt.h);
						break;
					}
					ctx.drawImage(opt.img, opt.x, opt.y);
					break;
				case 'text':


					if (opt.stroke) {
						ctx.textAlign = opt.align ? opt.align : 'left';
						ctx.fillStyle = opt.fillStyle;
						ctx.shadowColor = "black";
						ctx.shadowBlur = 2;
						ctx.font = "20px Prata";

						ctx.shadowOffsetX = 0;
						ctx.shadowOffsetY = 1;
						ctx.strokeText(opt.text, opt.x, opt.y);

						ctx.shadowOffsetX = 0;
						ctx.shadowOffsetY = -1;
						ctx.strokeText(opt.text, opt.x, opt.y);

						ctx.shadowOffsetX = 1;
						ctx.shadowOffsetY = 0;
						ctx.strokeText(opt.text, opt.x, opt.y);

						ctx.shadowOffsetX = -1;
						ctx.shadowOffsetY = 0;
						ctx.strokeText(opt.text, opt.x, opt.y);
					}

					ctx.shadowOffsetX = 0;
					ctx.shadowOffsetY = 0;
					ctx.shadowBlur = 0;
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
		if (currentCallback) {
			currentCallback(toURL());
			currentCallback = null;
		}
		isRendering = false;
		renderNext();
	}

	function toURL() {
		return canvas.toDataURL();
	}

	window.FAERIACARDS = {
		render: render,
		queue: queueRender,
		ready: onReady,
		setContainer: setContainer,
		init: init,
		toURL: toURL,
		clearQueue: clearQueue,

		setFontActive: fontActive
	};
}());

//load fonts
WebFontConfig = {
	google: {
		families: ['IM Fell English', 'Prata']
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