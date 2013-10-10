(function() {
	var ctx;

	var cardWidth = 272;
	var cardHeight = 450;

	var goldIconWidth = 33;

	var rarityHeight = 15;

	var drawBuffer = [];
	var totalLoaded = 0;

	var rarityMap = {
		C: 'img/card_rarity_common.png',
		U: 'img/card_rarity_uncommon.png',
		E: 'img/card_rarity_exceptional.png',
		R: 'img/card_rarity_rare.png',
		L: 'img/card_rarity_legendary.png',
	}

	function init() {
		ctx = document.getElementById('canvas').getContext('2d');
	}

	function render(card) {
		queueImage({
			image: card.img,
			x: 18,
			y: 73
		});

		queueImage({
			image: card.background,
			x: 0,
			y: 33
		});

		queueImage({
			image: 'img/card_goldicon.png',
			x: (cardWidth-goldIconWidth)/2,
			y: 20
		});

		queueText({
			text: card.goldCost,
			font: 'normal normal normal 20px Cambo',
			fillStyle: '#000',
			x: (((cardWidth-goldIconWidth)/2)+goldIconWidth/2)-5,
			y: 40
		})

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
		}
		queueWrapText(effectText);

		var attackLifeOpts = {
			text: card.attack + ' / ' + card.life,
			font: 'normal normal normal 24px Cambo',
			fillStyle: '#d0c8a8',
			x: 137,
			y: 335
		};
		queueText(attackLifeOpts);
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
					ctx.font = opt.font
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

	if(window.addEventListener){
		window.addEventListener('load',init,false); //W3C
	}
	else{
		window.attachEvent('onload',init); //IE
	}

	window.FAERIACARDS = {
		render: render
	}
}());

WebFontConfig = {
    google: {
        families: ['Cambo', 'Rock Salt']
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



if(window.addEventListener){
	window.addEventListener('load',init,false); //W3C
}
else{
	window.attachEvent('onload',init); //IE
}

function init() {
	FAERIACARDS.render({
		name: 'MIRNAST ENGINEER',
		img: 'img/tstimg.jpg',
		background: 'img/cardbg_human.png',
		goldCost: 1,
		rarity: 'E',
		attack: 1,
		life: 2,
		type: 'Creature',
		effect: '1 energy, 1 faeria - Target structure loses 1 life.'
	})
}
