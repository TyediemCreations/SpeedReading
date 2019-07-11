

var tbox = {
	text_box:null,
	//timer:null,
	txt: "",
	word_index:0,
	sentence_index:0,
	paragraph_index:0,
	words:[],
	is_start: false,
	is_end: false,
	wait: false,
	//start_time:0,
	//time_limit:60,	//currently measured in seconds; convert accordingly
	//curr_time:0,	//same as above
	//interval:10,
	//interval_info:[],
	wpm:400,
	output_window:null,
	
	init:function(limit,interval){
		this.text_box = document.getElementById("text_box");
		//this.timer = document.getElementById("timer");
		//this.time_limit = limit;
		//this.interval = interval;
		
		this.reset();
	},
	getText:function(){
		var txt;
		/*
		if (!this.text_box)
			txt = "";
		else
			txt = this.text_box.value;
		*/
		txt = document.getElementById("text_box").value;
		return txt;
	},
	getWpm:function(){
		var wpm = parseInt(document.getElementById("wpm").value);
		if (!wpm || wpm <= 0){
			return 230;
		}
		return wpm;
	},
	start:function(txt,wpm){
		if (this.is_end) return;
		
		this.is_start = true;
		this.wait = false;
		
		if (this.updating){
			clearInterval(this.updating);
		}
		
		this.txt = txt;
		this.wpm = wpm;
		
		document.getElementById("speed").innerHTML = this.wpm;
		
		this.createWordArray(this.txt);
		
		this.word_index = 0;
		this.sentence_index = 0;
		this.paragraph_index = 0;
		this.store();
		
		this.refresh_rate = this.getRefreshRate(this.wpm);
		
		//this.updating = setInterval(this.update,refresh_rate);
		
		//setTimeout(this.update,this.refresh_rate);
		this.update();
		this.is_start=false;
	},
	getRefreshRate:function(wpm){
		var refresh_rate = (1/wpm)*60*1000;
		return refresh_rate;
	},
	
	createWordArray:function(txt){
		this.words = [];
		
		//this.words = txt.split(" ");
		//this.words = txt.split(/[\s\n]/);
		//this.words = txt.split(/(?!.)/);
		
		/*
		var sentences = txt.split(/([.\?\!])/);
		
		for (var i=0;i<sentences.length;i++){
			//console.log(sentences[i]);
			if (sentences[i] == ''){
				continue;
			}
			if (this.words.length > 0 && 
			 (sentences[i] === '.' ||
			  sentences[i] === '?' ||
			  sentences[i] === '!')){
				var prevSentence = this.words.length-1;
				var lastWord = this.words[prevSentence].length-1;
				this.words[prevSentence][lastWord] += sentences[i];
			}
			else{
				this.words.push(sentences[i].split(/[\s\n]/));
				var newSentence = this.words.length-1;
				if (this.words[newSentence][0] === '')
					this.words[newSentence].shift();
			}
		}
		*/
		var numWords = 0;
		
		var paragraphs = this.clean(txt.split(/[\n]+/));
		for (var p=0;p<paragraphs.length;p++){
			var sentences = this.clean(paragraphs[p].split(/([.\?\!][^\s]*)/));
			var sentence_words = [];
			
			for (var s=0;s<sentences.length;s++){
				if (sentences[s] === ''){
					continue;
				}
				if (sentence_words.length > 0 &&
				  (sentences[s][0] === '.' ||
				   sentences[s][0] === '?' ||
				   sentences[s][0] === '!')){
					var prevSentence = sentence_words.length-1;
					var lastWord = sentence_words[prevSentence].length-1;
					sentence_words[prevSentence][lastWord] += sentences[s];
				}
				else{
					var clean_split = this.clean(sentences[s].split(/[\s\n]+/));
					sentence_words.push(clean_split);
					//sentence_words.push(sentences[s].split(/[(\-)\s\n]+/));
					var newSentence = sentence_words.length-1;
					if (sentence_words[newSentence][0] === '')
						sentence_words[newSentence].shift();
					
					sentence_words[newSentence] = this.separateHyphens(sentence_words[newSentence]);
					
					numWords += sentence_words[newSentence].length;
				}
			}
			this.words.push(sentence_words);
		}
		if (this.words[0].length === 0)
			this.words.shift();
		if (this.words[this.words.length-1].length === 0)
			this.words.pop();
		
		/*
		var sentences = txt.split(/([.\?\!][^\s]*)/);
		
		for (var i=0;i<sentences.length;i++){
			//console.log(sentences[i]);
			if (sentences[i] == ''){
				continue;
			}
			if (this.words.length > 0 && 
			 (sentences[i][0] === '.' ||
			  sentences[i][0] === '?' ||
			  sentences[i][0] === '!')){
				var prevSentence = this.words.length-1;
				var lastWord = this.words[prevSentence].length-1;
				this.words[prevSentence][lastWord] += sentences[i];
			}
			else{
				this.words.push(sentences[i].split(/[\s\n]/));
				var newSentence = this.words.length-1;
				if (this.words[newSentence][0] === '')
					this.words[newSentence].shift();
			}
		}
		*/
		
		//localStorage.setItem("full",this.words);
		console.log("Number of words (approximately): "+numWords);
		console.log(this.words);
	},
	clean:function(dirty_array){
		var clean_array = [];
		
		var empty = new RegExp(/^\s+$/);
		for (var i=0;i<dirty_array.length;i++){
			//if (dirty_array[i].length !== 0 && dirty_array[i] !== ' '){
			if (dirty_array[i].length !== 0 && !dirty_array[i].match(empty)){	
				clean_array.push(dirty_array[i]);
			}
		}
		return clean_array;
	},
	separateHyphens:function(word_list){
		var separated = [];
		var hyphen = new RegExp(/([\-\u2010\u2011\u2012\u2013\u2014\u2015]+)/);
		for (var i=0;i<word_list.length;i++){
			//var foo = word_list[i].split(/([\-]+)/);
			var foo = word_list[i].split(hyphen);	//2010,2011,2012,2013,2014,2015
														//8208-8213
			var bar = [];
			if (foo[0] === '')
				foo.shift();
			if (foo[foo.length-1] === '')
				foo.pop();
			for (var j=0;j<foo.length;j++){
				//if (foo[j][0] === '-' && bar.length !== 0){
				if (foo[j][0].match(hyphen) && bar.length !== 0){
					bar[bar.length-1] += foo[j];
				}else{
					bar.push(foo[j]);
				}
			}
			
			separated = separated.concat(bar);
		}
		
		return this.clean(separated);
	},
	reset:function(){
		this.text_box.value = "";
	},
	displayWords:function(){
		//console.log("Displaying words at paragraph: "+this.paragraph_index+", sentence: "+this.sentence_index+", word: "+this.word_index);
		
		if (tbox.words[tbox.paragraph_index].length === 0)
			return;
		
		document.getElementById("text_output").innerHTML = tbox.words[tbox.paragraph_index][tbox.sentence_index][tbox.word_index];
		
		var prev_word, prev_word_sent, next_word, next_word_sent;
		var prev,next;
		
		prev_word = tbox.word_index - 1;
		prev_word_sent = tbox.sentence_index;
		next_word = tbox.word_index + 1;
		next_word_sent = tbox.sentence_index;
		
		if (prev_word < 0){
			prev_word_sent -= 1;
			if (prev_word_sent < 0){
				prev = "";
			}else{
				var lastIndex = tbox.words[tbox.paragraph_index][prev_word_sent].length - 1;
				prev = tbox.words[tbox.paragraph_index][prev_word_sent][lastIndex];
			}
		}else{
			prev = tbox.words[tbox.paragraph_index][prev_word_sent][prev_word];
		}
		
		if (next_word >= tbox.words[tbox.paragraph_index][next_word_sent].length){
			next_word_sent += 1;
			if (next_word_sent >= tbox.words[tbox.paragraph_index].length){
				next = "";
			}else{
				next = tbox.words[tbox.paragraph_index][next_word_sent][0];
			}
		}else{
			next = tbox.words[tbox.paragraph_index][next_word_sent][next_word];
		}
		
		
		document.getElementById("prev_word").innerHTML = prev;
		document.getElementById("next_word").innerHTML = next;
	},
	disableButtons:function(){
		
		/*
		//document.getElementById("prev_sentence").disabled = false;
		if (tbox.paragraph_index <= 0){
			this.output_window.getElementById("prev_paragraph").disabled = true;
			//if (tbox.sentence_index <= 0)
				//this.output_window.getElementById("prev_sentence").disabled = true;
		}else{
			this.output_window.getElementById("prev_paragraph").disabled = false;
		}
		*/
		
		document.getElementById("next_sentence").disabled = false;
		if (tbox.paragraph_index >= tbox.words.length-1){
			document.getElementById("next_paragraph").disabled = true;
			if (tbox.sentence_index >= tbox.words[tbox.paragraph_index].length-1)
				document.getElementById("next_sentence").disabled = true;
		}else{
			document.getElementById("next_paragraph").disabled = false;
		}
	},
	update:function(){
		if (!tbox.is_start) {
			return;
		}
		var refresh = tbox.refresh_rate;
		/*
		if (tbox.wait){
			tbox.wait = false;
			clearInterval(tbox.updating);
			tbox.updating = setInterval(tbox.update,tbox.refresh_rate);
		}
		*/
		
		tbox.displayWords();
		tbox.disableButtons();
		
		tbox.store();
		
		/**/
		var wordLength = tbox.words[tbox.paragraph_index][tbox.sentence_index][tbox.word_index].length;
		var tooLong = 8;
		if (wordLength > tooLong){
			
			tbox.wait = true;
			
			var egregious = wordLength - tooLong;
			var slowdown = egregious * 0.1;
			if (slowdown > 1)
				slowdown = 1;
			
			slowdown += 1;
			//clearInterval(tbox.updating);
			//this.updating = setInterval(tbox.update,tbox.refresh_rate/slowdown);
			//console.log(tbox.refresh_rate/slowdown);
			refresh = tbox.refresh_rate*slowdown;
		}
		/**/
		
		tbox.word_index += 1;
		if (tbox.word_index >= tbox.words[tbox.paragraph_index][tbox.sentence_index].length){
			tbox.word_index = 0;
			tbox.sentence_index += 1;
		}
		if (tbox.sentence_index >= tbox.words[tbox.paragraph_index].length){
			tbox.paragraph_index += 1;
			
			if (tbox.paragraph_index >= tbox.words.length){
				tbox.paragraph_index -= 1;
				tbox.sentence_index -= 1;
				tbox.word_index = tbox.words[tbox.paragraph_index][tbox.sentence_index].length-1;
				//tbox.is_start = false;
				tbox.pause();
				return;
			}else{
				tbox.word_index = 0;
				tbox.sentence_index = 0;
			}
		}
		
		//console.log(refresh);
		//
		setTimeout(tbox.update,refresh);
		//
	},
	
	pause:function(){
		
		var pause_button = document.getElementById("pause_button");
		if (this.is_start){
			pause_button.innerHTML = "&#9655";
			this.is_start = false;
		}
		else{
			pause_button.innerHTML = "||";
			this.is_start = true;
			setTimeout(this.update,this.refresh_rate);
		}
	},
	previous:function(){	//set index to that of previous sentence
							//'previous' button should be disabled if previous sentence&/paragraph is undefined
		if (this.sentence_index > 0){
			this.sentence_index -= 1;
		}else if (this.paragraph_index > 0){
			//this.sentence_index = 0;
			this.paragraph_index -= 1;	
			this.sentence_index = this.words[this.paragraph_index].length-1;
		}
		
		this.word_index = 0;
		//document.getElementById("text_output").innerHTML = tbox.words[tbox.sentence_index][tbox.word_index];
		this.displayWords();
		this.disableButtons();
		this.store();
	},
	next:function(){	//set index to that of next sentence
						//'next' button should be disabled if next sentence&/paragraph is undefined
		if (this.sentence_index < (this.words[this.paragraph_index].length - 1)){
			this.sentence_index += 1;	
		}else{
			this.paragraph_index += 1;
			this.sentence_index = 0;
		}
		this.word_index = 0;
		
		this.displayWords();
		this.disableButtons();
		this.store();
	},
	prevParagraph:function(){
		if (this.paragraph_index > 0 && this.sentence_index === 0){
			this.paragraph_index -= 1;
		}
		this.sentence_index = 0;
		this.word_index = 0;
		
		this.displayWords();
		this.disableButtons();
		this.store();
	},
	nextParagraph:function(){
		if (this.paragraph_index < this.words.length-1){
			this.paragraph_index += 1;
			this.sentence_index = 0;
			this.word_index = 0;
			
			this.displayWords();
			this.disableButtons();
			this.store();
		}
	},
	
	updateDisplay:function(){	//unused for seeming risk of clearing update without resetting it.
		this.displayWords();
		this.disableButtons();
		this.store();
		
		clearInterval(this.updating);
		this.updating = setInterval(this.update,this.refresh_rate);
	},
	decreaseSpeed:function(){
		if (this.wpm <= 10)
			return;
		
		this.wpm -= 10;
		this.refresh_rate = this.getRefreshRate(this.wpm);
		
		//clearInterval(this.updating);
		//this.updating = setInterval(this.update,refresh_rate);
		
		document.getElementById("speed").innerHTML = this.wpm;
	},
	increaseSpeed:function(){
		this.wpm += 10;
		this.refresh_rate = this.getRefreshRate(this.wpm);
		
		//clearInterval(this.updating);
		//this.updating = setInterval(this.update,refresh_rate);
		
		document.getElementById("speed").innerHTML = this.wpm;
	},
	
	store:function(){
		//console.log("p: "+this.paragraph_index+", s: "+this.sentence_index+", w: "+this.word_index);
		localStorage.setItem("p",this.paragraph_index);
		localStorage.setItem("s",this.sentence_index);
		localStorage.setItem("w",this.word_index);
	}
}
/*
function binarySearch_range(A,value){
	var mid = Math.floor(A.length/2);
	if ((mid+1) >= A.length){
		return mid;
	}
	if (A[mid] >= value && A[mid+1] < value){
		return mid;
	}
	else if (A[mid] > value){
		return binarySearch_range(A[0:mid]);
	}
	else{
		return binarySearch_range(A[mid:A.length-1]);
	}
}
*/

function test(){
	console.log("testin");
}

window.onload = function(){
	var txt = localStorage.getItem("txt");
	var wpm = parseInt(localStorage.getItem("wpm"));
	tbox.start(txt,wpm);
}

//call update: (1/(wpm)) * 60 seconds 

/*
To do: 	-(*done*) after separating by punctuation, but before separating by whitespace/newline,
  must move any non-whitespace characters from the beginning of next sentence to
  the end of previous.
		-(*done*) also, should separate by paragraph and add |< and >| buttons to navigate there-based.
			-add paragraph button functionality; allow sentence buttons to navigate across paragraphs
		-(*...maybe don't*) start using 'updateDisplay' to (hopefully) prevent an awkward pause after hitting a button
		-seperate hyphenated words (but keep the hyphen on the first word)
		
Idea: 	-wpm automatically lowers for longer words (*currently (commented out): pauses a frame if encounters a word with more than n<-8 characters)		
		-bolded word
		
Notes:	-if output window is minimized, setinterval (can be) drastically slowed.
		if an issue, look here: https://stackoverflow.com/questions/5927284/how-can-i-make-setinterval-also-work-when-a-tab-is-inactive-in-chrome
		
		
test input:

"This is the first sentence!" And this the next.
The third sentence, why that was the best one? Then again, I guess the fourth was also pretty... pretty alright, I guess.
However, the fifth kinda stunk.
*/

/*
Note: as per wikipedia, 'proofreading' speeds are 200WPM on paper, 180 WPM on a monitor
	'Skimming' results in speeds of 700 WPM and above, while 
	normal 'reading for comprehension' is around 200-230 WPM
*/