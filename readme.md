Library used for rendering Faeria cards via canvas.


*Methods*
-------

render
-------------
(OBJECT card)

renders the card to the canvas (async).  Will automatically wait until after the library is ready if called before assets have loaded.

	FAERIACARDS.render({
	    name: 'Meroval king\'s guard', //String
	    img: 'img/tstimg.jpg', //String or IMG NODE object (if already on page)
	    gold: 1, //Number
	    faeria: 0, //Number
	    rarity: 'E', // 'C','U','E','R','L'
	    attack: 1, // Number
	    life: 2, // Number
	    type: 'Event', //'Creature', Structure', 'Event'
	    effect: 'Draw a card. Ranged attack. [Accumulator2]. [Charge3]. Haunt. Flying. [Charge2]. Draw two cards.', //String  non-value keywords can be typed.  keywords with values have to be in the form: [Keyword#]
	    /*
	    Ranged attack. [Strikeback3]. Conquest. Flying. [Charge3]. Haste. Haunt. [Protection3]. [Accumulator4]. Jump. Frenzy. Curse. [Radiate4]. Aquatic. Auto-collect. Convoke.
	    */
	    color: 'green', //'blue', 'green', 'red', 'yellow', 'human'
	    landB: 0, //number
	    landG: 0, //number
	    landR: 0, //number
	    landY: 0 //number
	});



ready
-----
(FUNCTION func)

Queues a function to be triggered when the library is ready

	FAERIACARDS.ready(function() {
		console.log('lib is ready');
	});



setContainer
------------
(STRING selector)

Sets a container to append the canvas to.  Uses querySelectorAll

	FAERIACARDS.setContainer('.my-container')



toURL
-----
returns the base64 version of the image from canvas (png)

	var pngImg = FAERIACARDS.toURL();


queue
-----
(OBJ { card: OBJ, callback: func})

Queues a render to occur with a callback being called after render is done with the base64 encoded image

	FAERIACARDS.queue({
		card: {
		    name: 'Meroval king\'s guard', //String
		    img: 'img/tstimg.jpg', //String or IMG NODE object (if already on page)
		    gold: 1, //Number
		    faeria: 0, //Number
		    rarity: 'E', // 'C','U','E','R','L'
		    attack: 1, // Number
		    life: 2, // Number
		    type: 'Event', //'Creature', Structure', 'Event'
		    effect: 'Draw a card. Ranged attack. [Accumulator2]. [Charge3]. Haunt. Flying. [Charge2]. Draw two cards.', //String  non-value keywords can be typed.  keywords with values have to be in the form: [Keyword#]
		    /*
		    Ranged attack. [Strikeback3]. Conquest. Flying. [Charge3]. Haste. Haunt. [Protection3]. [Accumulator4]. Jump. Frenzy. Curse. [Radiate4]. Aquatic. Auto-collect. Convoke.
		    */
		    color: 'green', //'blue', 'green', 'red', 'yellow', 'human'
		    landB: 0, //number
		    landG: 0, //number
		    landR: 0, //number
		    landY: 0 //number
		},
		callback: function(img) {
			var i = new Image();
            i.src = img;
            document.getElementsByTagName('body')[0].appendChild(i);
		}
	})



Changelog
---------
v1.2
Added queue method for more control over behavior.  Generally if you want to render a bunch of things, you will want to use queue.  If you want "real-time" updates (and dont mind possible collisions if the data changes too fast), use render.


v1.1
New calls to ready() will now fire immediately if called after ready has already triggered (were not being called at all).

Added Docs