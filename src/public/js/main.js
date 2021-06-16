/* eslint-disable no-undef */
const positions = [
	{ text: 'a Node.JS dev', color: 'red' },
	{ text: 'a HTML dev', color: 'red' },
	{ text: 'a python dev', color: 'red' },
];

window.onload = async () => {
	const inViewport = (entries) => {
		entries.forEach(entry => {
			entry.target.classList.toggle('is-inViewport', entry.isIntersecting);
		});
	};

	const Obs = new IntersectionObserver(inViewport);
	const obsOptions = {};
	const ELs_inViewport = document.querySelectorAll('[data-inviewport]');
	ELs_inViewport.forEach(EL => {
		Obs.observe(EL, obsOptions);
	});


	await typeSentence('I\'m Robin, ', '#typing-name');
	carouse(positions, '#typing-job');
};

const typeSentence = async (sentence, eleRef, delay = 100) => {
	const letters = sentence.split('');
	for (let i = 0; i < letters.length; i++) {
		await wait(delay);
		$(eleRef).append(letters[i]);
		if (i == letters.length - 1) return;
	}
};

const deleteSentence = async (eleRef) => {
	const sentence = $(eleRef).html();
	const letters = sentence.split('');
	while (letters.length > 0) {
		await wait(100);
		letters.pop();
		$(eleRef).html(letters.join(''));
	}
};

const carouse = async (carouselList, eleRef) => {
	for (let i = 0; i < carouselList.length; i++) {
		$(eleRef).css('color', carouselList[i].color);
		await typeSentence(carouselList[i].text, eleRef);
		await wait(1500);
		await deleteSentence(eleRef);
		await wait(500);
		if (i >= carouselList.length - 1) { i = 0; }
	}
};

const wait = (ms) => {
	return new Promise(resolve => setTimeout(resolve, ms));
};