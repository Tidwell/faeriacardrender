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



Changelog
---------
v1.1

New calls to ready() will now fire immediately if called after ready has already triggered (were not being called at all).

Added Docs