/*
	Note: note incompatible with versions of Internet Explorer prior to 8
		due to usage of 'localStorage'
*/


var input = {
	output_window:null,
	delLater:false,
	paragraphs:[],
	words:[],
	prev_p:null,
	
	start:function(){
		var txt = document.getElementById("text_box").value;
		var wpm = parseInt(document.getElementById("wpm").value);
		if (!wpm || wpm <= 0){
			wpm = 230;
		}
		
		//8212
		//txt = txt.replaceAll(/[\u2010\u2011\u2012\u2013\u2014\u2015]/,'-');
		
		localStorage.setItem("txt",txt);
		localStorage.setItem("wpm",wpm);
		
		if (this.paragraphs.length !== 0){
			for (var p=0;p<this.paragraphs.length;p++){
				var pid = "p"+p.toString();
				var div = document.getElementById(pid);
				div.parentNode.removeChild(div);
			}
			document.getElementById("full_text").innerHTML = "";
			this.prev_p = null;
		}
		
		this.createWordArray(txt);
		this.paragraphs = this.clean(txt.split(/[\n]+/));
		if (this.paragraphs[0].length === 0)
			this.paragraphs.shift();
		
		if (this.output_window !== null){
			this.output_window.close();
		}
		
		var strWindowFeatures = "location=yes,height=340,width=620,scrollbars=yes,status=yes";
		var URL = "output.html";
		this.output_window = window.open(URL,"_blank", strWindowFeatures);
		
		/**/
		for (var p=0;p<this.paragraphs.length;p++){
			var div = document.createElement("div");
			div.id = "p"+p.toString();
			document.getElementById("full_text").appendChild(div);
			div.innerHTML = this.paragraphs[p];
			var br = document.createElement("br");
			document.getElementById("full_text").appendChild(br);
			document.getElementById("full_text").appendChild(br);
			document.getElementById("full_text").appendChild(br);
			document.getElementById("full_text").appendChild(br);
		}
		/**/
		/*
		var br = document.createElement("br");
		var full_text = document.getElementById("full_text");
		
		this.createWordArray(txt);
		for (var p=0;p<this.words.length;p++){
			for (var s=0;s<this.words[p].length;s++){
				for (var w=0;w<this.words[p][s].length;w++){
					var span = document.createElement("span");
					span.id = "p"+p.toString()+"s"+s.toString()+"w"+w.toString();
					span.innerHTML = this.words[p][s][w];
					full_text.appendChild(span);
				}
				full_text.innerHTML += "&nbsp";
			}
			for (var i=0;i<4;i++){
				full_text.appendChild(br);
			}
		}
		document.getElementById("p0s0w1").innerHTML = "gray";
		*/
		
		var refresh_rate = (1/700)*60*1000;
		setInterval(printFullText,refresh_rate);
	},
	createWordArray:function(txt){
		this.words = [];
		
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
		
		console.log("Number of words (approximately): "+numWords);
		console.log(this.words);
	},
	clean:function(dirty_array){
		var clean_array = [];
		
		var empty = new RegExp(/^\s+$/);
		for (var i=0;i<dirty_array.length;i++){
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
}

function printFullText(){
	//var full = localStorage.getItem("full");
	var paragraph = parseInt(localStorage.getItem("p"));
	var sentence = parseInt(localStorage.getItem("s"));
	var word = parseInt(localStorage.getItem("w"));
	//console.log("p: "+paragraph+", s: "+sentence+", w: "+word);
	
	var full_str = "";
	var txt_area = document.getElementById("full_text");
	
	
	/**/
	if (input.prev_p !== paragraph && input.prev_p !== null){
		document.getElementById("p"+input.prev_p.toString()).innerHTML = input.paragraphs[input.prev_p];
	}
	
	var the_paragraph = document.getElementById("p"+paragraph.toString());
	try{
		the_paragraph.innerHTML = "";
	}
	catch (TypeError){
		return;
	}
		
	var str = "";
	var hyphen = new RegExp(/([\-\u2010\u2011\u2012\u2013\u2014\u2015]+)/);
	
	for (var s=0;s<input.words[paragraph].length;s++){
		for (var w=0;w<input.words[paragraph][s].length;w++){
			var the_word = input.words[paragraph][s][w];
			
			if (s === sentence && w === word){
				str += "<span style=\"background-color:#D0D0D0\">"+the_word+"</span>";
				input.prev_p = paragraph;
			}else{
				str += the_word;
			}
			//if (the_word[the_word.length-1] !== '-'){
			if (!the_word[the_word.length-1].match(hyphen)){
				//console.log(str[str.length-1]);
				str += " ";
			}
		}
	}
	the_paragraph.innerHTML = str;
	
	/*
	for (var p=0;p<input.paragraphs.length;p++){
		if (p === paragraph){
			input.prev_p = p;
			
			document.getElementById("p"+p.toString()).innerHTML = "";
			var str = "";
			var sentences_rough = input.paragraphs[p].split(/([.\?\!][^\s]*)/);
			var sentences = [];
			for (var s=0;s<sentences_rough.length;s++){
				if (sentences_rough[s] == ''){
					continue;
				}
				if (sentences.length > 0 &&
				  (sentences_rough[s][0] === '.' ||
				   sentences_rough[s][0] === '?' ||
				   sentences_rough[s][0] === '!')){
					var prevSentence = sentences.length-1;
					//var lastWord = sentences[prevSentence].length-1;
					//sentences[prevSentence][lastWord] += sentences_rough[s];
					sentences[prevSentence] += sentences_rough[s];
				}else{
					sentences.push(sentences_rough[s]);
				}
			}
			//for (var s=0;)
			//console.log(sentences);
			for (var s=0;s<sentences.length;s++){
				if (s !== sentence){
					str += sentences[s];
				}else{
					var words = sentences[s].split(/[\s\n]+/);
					if (words[0] === '')
						words.shift();
					//console.log(words);
					for (var w=0;w<words.length;w++){
						if (w !== word){
							//console.log("w is: "+w+", word is: "+word);
							str += words[w]+" ";
						}else{
							//str += "<b>"+words[w]+"</b> ";
							str += "<span style=\"background-color:#D0D0D0\">"+words[w]+"</span> ";
							
							
							//console.log(words[w]);
							//str += "fart ";
						}
					}
				}
				str += " ";
			}
			//console.log(str);
			document.getElementById("p"+p.toString()).innerHTML = str;
			break;
		}
	}
	*/
	/*
	txt_area.innerHTML = "";
	for (var p=0;p<input.paragraphs.length;p++){
		if (p !== paragraph){
			txt_area.innerHTML += input.paragraphs[p];
			txt_area.innerHTML += "<br>";
		}else{
			
			//further split up into sentences, then words
		}
		//full_str += input.paragraphs[p];
		//full_str += "\n";
	}
	*/
	//document.getElementById("full_text").innerHTML = full_str;
	/*
	if (!full || input.delLater)
		return;
	else{
		console.log(full[1]);
		input.delLater = true;
		return;
	}
	
	var full_str = "";
	for (var p=0;p<full.length;p++){
		for (var s=0;s<full[p].length;s++){
			for (var w=0;w<full[p][s].length;w++){
				var str = full[p][s][w];
				//console.log(str);
				if (p === paragraph && s === sentence && w === word)
					str = str.bold();
				full_str += str+" ";
			}
		}
		full_str += "\n";
	}
	document.getElementById("full_text").innerHTML = full_str;
	*/
}

String.prototype.replaceAll = function(search, replacement){
	var target = this;
	return target.replace(new RegExp(search, 'g'), replacement);
}


/*
window.onload = function(){
	var num = 5;
	localStorage.setItem("myItem",num);
	console.log(num);
}
*/

/*
To do: ensure divs id 'px' can be cleaned up upon re-pressing 'start'  
*/

/*
Note: 'Nate the Snake' is about 10861 words
*/