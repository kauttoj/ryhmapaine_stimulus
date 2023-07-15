var study = "jatkuva_oppiminen";
var NBLOCKS = 6; // 6
var NSTIMS = 8; //8
var NPEERS = 2; // 3

var subjID = getSubjID(10);

var filename = subjID + '_' + study + '.csv';
var subject_id_property = {'subjID':subjID} // we add this to all data

var g = 'a'; // global gender variable, set to mixed by default

var timesplit = 1.0; // 1 in production
var timing = {
    timeoutBeforePrompt: 0,
    timeoutBeforeStim: 0,
    timeoutBeforeResponse: 1000/timesplit, // Before they can make resp after prompt/stim, WAS 1000
    timeoutBeforeMystery: 1750/timesplit, // WAS 2000
    timeoutBeforeFeedback: 0, // This is evil. Don't use it
    timeoutAfterFeedback: 1000/timesplit, // WAS 1000
    timeoutAfterFeedbackMystery: 1000, // WAS 1000
    timing_post_trial: 500/timesplit, // WAS 500
};

var you_timing = {
    timeoutBeforePrompt: 0,
    timeoutBeforeStim: 0,
    timeoutBeforeResponse: 2000/timesplit, // Before they can make resp after prompt/stim, WAS 2000
};

//ONLY TEXT, PREAMBLES, AND HTML SHOULD BE CHANGED BEYOND THIS POINT.
var peers = {
    'f': females,
    'm': males,
    'a': mixed_genders
};

//Use this to edit instruction prompts
function practiceGenPoli(opts) {
    var timeline = [{
            "type": "similarity",
            "prompt": "<span>Mikä on <u>${peer}</u>n mielipide asiaan ja miten hän valitsee?</span>",
            "peers": ["Sinä", "Väiski", "Repe"],
            "peer_agree": [1, 0, 1],
            "peer_compare": [0, 1, 1],
            "peer_label": ['Self', 'A', 'B'],
            "stimuli": ["xes/example/example.jpg", "oes/example/example.jpg"],
            "choices": ["e", "i"], // must be lowercase!
            "peerExt": ".jpg",
            //"trialButtonLabel": 'Kun olet lukenut ohjeet, paina Jatka nappia: <br>',
            //"feedbackButtonLabel": "Paina nappia jatkaaksesi: <br>",
            "practice": true,
			"mystery": ['oes/big_yes.jpg', 'xes/big-red-x.jpg'],
            "stimDir": "",
            "timeline": [
			{
                    "phase": "FIRST",
                    "prompt": "<br><strong>OHJE:</strong><br>Kyselyn aikana sinulle esitetään erilaisia mielipiteitä. Harkitse kunkin kysymyksen kohdalla hetki ennen kuin vastaat kannattavasi tai vastustavasi esitettyä mielipidettä. Kun uusi mielipide esitetään, sinua pyydetään osoittamaan oma mielipiteesi klikkaamalla kuvaa. Voit myös käyttää näppäimistön E ja I kirjaimia.<br>Ruudun oikeassa yläkulmassa oleva taulukko näyttää sinun ja muiden tekemät valinnat sitä mukaa, kun niitä kertyy.<br><br> Harkitse nyt seuraavaa mielipidettä:<br><strong>Pitääkö piirroselokuvissa esiintyä ankanmetsästystä?</strong>\
                    <br>Oletko samaa vai eri mieltä? Valitse <strong>KYLLÄ</strong> tai <strong>EI</strong>. Huomaa, että punainen X on aina EI ja vihreä väkänen on aina KYLLÄ.<br>",
                    /*"instructsAfterClick": "<br>Tee valintasi nyt kysymykseen:\
                    <br>Pitääkö sarjakuvissa olla juoneen liittyvää ankanmetsästystä?\
                    <br>(Huomio, että punainen X merkitsee aina EI ja vihreä väkänen tarkoittaa aina KYLLÄ.)<br>",*/
                    "peer": 0,
                    //"feedbackChoices": "mouse",
                },		
				{
                    "peer": 1,
                    "prompt": "<br>Hyvin meni! Nyt kun olet valinnut oman kantasi, yritä arvata muiden henkilöiden mielipidettä samasta asiasta.\
                    <br><strong>Pitääkö piirroselokuvissa esiintyä ankanmetsästystä?</strong>\
                    <br><strong>Miten arvioit ${peer}n mielipidettä?</strong>",
                    'feedbackPrompt': '<br>Saat palautteen muiden henkilöiden mielipiteistä nuolella, joka osoittaa kyseisen henkilön oikean vastauksen.\
                    <br>Tämä palaute näkyy ruudulla yhden sekunnin ennen kuin voit arvata seuraavan henkilön mielipidettä. Huomaa, että muiden henkilöiden vastaukset jäävät näkyviin ruudun oikeassa yläkulmassa olevaan taulukkoon.<br>Paina nappia jatkaaksesi.',
                    "feedbackChoices": "mouse",
                },
				{
                    "peer": 2,
                    "prompt": "<br>Huomaa, että toiset henkilöt voivat olla yksimielisiä tai erimielisiä kunkin esitetyn mielipiteen suhteen.\
                    <br><strong>Pitääkö piirroselokuvissa esiintyä ankanmetsästystä?</strong>\
                    <br><strong>Miten arvioit ${peer}n mielipidettä?</strong>",   
                    'feedbackPrompt': '<br>Huomaa että voit parantaa omia arvauksiasi tarkkailemalla muiden mielipiteitä kokeen aikana. Näet kaikki aikaisemmat valinnat ruudun oikeassa yläkulmassa olevasta taulukosta.<br>Paina nappia jatkaaksesi.',
                    "feedbackChoices": "mouse",
                }, {
                    "phase": "MYSTERY",
                    "prompt": "<br>Määräajoin näet opiskeluun ja työelämään liittyvän väitteen. Sitten näet kahden henkilön KYLLÄ tai EI mielipiteen väitteestä. Heidän valintansa osoitetaan nuolilla.<br><br><strong>Pitääkö oppilaitoksessa olla kaikille ilmainen ruokailu?<br>Väiski ja Repe olivat tätä mieltä:</strong>",
                    //Select the box you would prefer based on the other participants' choices to continue.
                    "peer1": 1,
                    "peer2": 2,
                    "mystery_questions": ['Pitääkö oppilaitoksessa olla kaikille ilmainen ruokailu?'],
                    "response_ends_trial": true,
                },
            ]
        }
    ];

    var info_screen = {
        "type": "instructions",
        "show_clickable_nav": true,
        "key_forward": " ",
        "pages": ['<br><br>Harjoitus on nyt ohi. Seuraavaksi jatkamme varsinaisiin kysymyksiin, joita on 48 kpl.<br>Kysymysten ja vastausten antamisen väliin on asetettu noin 1s mietintäaika, eli viive ei johdu sivuston hitaudesta.<br><br>Paina nappia jatkaaksesi.'],
		on_load: function() {
		// Remove progress bar from screen
			document.getElementById("jspsych-progressbar-container").style.visibility = "visible";
		}
    };
    timeline.push(info_screen);

    return timeline;
}

var practice_timeline = practiceGenPoli({});

//var toShuffle = shuffleTogether(stims.stimuli, stims.prompts);
//stims.stimuli = toShuffle[0];
//stims.prompts = toShuffle[1];
for (var i = 0; i < NBLOCKS; i++) {
	var temp = stims.prompts.slice(i*NSTIMS,(i+1)*NSTIMS)
	temp.shuffle()
	stims.prompts.splice(i*NSTIMS,NSTIMS,...temp)
}

var toShuffle = shuffleTogether(stims.main_questions_statement.slice(0,NBLOCKS), stims.main_questions_question.slice(0,NBLOCKS));
stims.main_questions_statement = toShuffle[0];
stims.main_questions_question = toShuffle[1];

var timeline = [];

var welcome_block = {
    "type": "instructions",
    "show_clickable_nav": true,
    "key_forward": "",	
    "pages": ["<div class='center-content'><br><br>Tervetuloa DIGISTI hankkeen kyselyyn!<br><br>Kyselyyn vastaamiseen menee aikaa noin 15 minuuttia.<br><strong>HUOM: Ylimääräisenä palkintona arvomme viisi 50e arvoista S-ryhmän lahjakorttia kaikkien kyselyn loppuun saakka tehneiden kesken</strong>.<br><p><strong>Tekniset vaatimukset:</strong><br>Kysely vaatii Javascriptin toimiakseen.<br>Pyydämme varmuuden vuoksi laittamaan mainosten ja skriptien estäjät pois päältä kyselyn ajaksi.</p> <p>Ethän päivitä tai lataa sivua uudestaan kesken kyselyn.<br>Muutoin kysely on aloitettava kokonaan alusta ja edelliset vastaukset katoavat.</p><p>Paina nappia jatkaaksesi."],
    //choices: 'mouse',
	on_load: function() {
    // Remove progress bar from screen
		document.getElementById("jspsych-progressbar-container").style.visibility = "hidden";
	}
};

// SQL save helper function
function saveData(data) {
  var xhr = new XMLHttpRequest();
  xhr.open('POST', 'write_data.php'); // change 'write_data.php' to point to php script.
  xhr.setRequestHeader('Content-Type', 'application/json');
  xhr.onload = function() {
    if(xhr.status == 200){
      var response = JSON.parse(xhr.responseText);
      console.log("XML server response " + String(response.success));
    }
  };
  xhr.send(data);
}

// forced saving block
var savetrial_block = {
  type: 'call-function',
  async: true,
  func: function(){
    var xhr = new XMLHttpRequest();
    xhr.open('POST', 'write_data.php');
    xhr.setRequestHeader('Content-Type', 'application/json');
    xhr.onload = function() {
      if(xhr.status == 200){
        var response = JSON.parse(xhr.responseText);
        console.log("XML server response " + String(response.success));
      }
    };
	jsPsych.data.addProperties(subject_id_property);
    xhr.send(jsPsych.data.getDataAsJSON());
  }
}

var comments_block = {
    type: 'survey-text-sam',
    questions: ['Avoimet kommentit ja palaute'],	
    validation: [function (x) {return true}], // we don't really check these
    rows: [6],
    input_type: ['textarea'],
    preamble: ["<div>Kyselyn varsinainen osa on nyt ohi.<br>Jos sinulla on kommentteja tai palautetta liittyen kyselyyn, voit kirjoittaa niitä alle. Tämä on vapaaehtoista.<br>Paina nappia siirtyäksesi eteenpäin.</div>"],
	on_finish: function () {
		;
	}
};

var demographics_block = {
    type: 'survey-text-sam',
    questions: [        
        'Mikä on sukupuolesi?',
        'Mikä on ikäsi vuosissa (numero)?', // number
    ],
    value: [], // EMPTY IN PRODUCTION
    input_type: ['likert','text'], // ['text','text','text','text']
    label: [['nainen', 'mies', 'muu/en halua määritellä'],''],
    validation: [function (x) {
            return (x != 'undefined')
        },
        function (x) {
            if (x == '') {
                return false;
            };
            return ((Number(x) <= 80) & (Number(x) >= 12));
        }
    ],
    validationMessage: [
        'sukupuoli puuttuu',
        'ikä virheellinen (oltava välillä 12-80 vuotta)',
    ],
    preamble: ["<div>\
        <h4>OSIO A: Taustakysymykset</h4>Vastaa alla oleviin kysymyksiin ja paina nappia jatkaaksesi.\
        </div><br>"],
    on_finish: function (trial_data) {
		var gender = trial_data['gender'];
		if (gender == 'nainen') {
			g = 'f';
		} else if (gender == 'mies') {
			g = 'm';
		} else {
			g = 'a';
		}
		console.log('valittu sukupuoli: ' + g)
	}
};

var likert_and_survey_block = {
    type: 'survey-likert',
    preamble: '<div><h4>OSIO B: Mielipiteet opiskelusta</h4>Seuraavat kuusi kuvausta liittyvät opiskeluun.<br>Kerro kuinka samaa mieltä olet esitetyn väitteen kanssa asteikolla yhdestä kymmeneen (1...10):<br>1 = täysin eri mieltä, ..., 10 = täysin samaa mieltä</div><br>',
    questions: stims.main_questions_statement,
    on_finish:
    function () {		
		var toShuffle = shuffleTogether(stims.main_questions_statement, stims.main_questions_question);
		stims.main_questions_statement = toShuffle[0];
		stims.main_questions_question = toShuffle[1];		
		
        //var progress = jsPsych.progress();
        //console.log('You have completed approximately '+progress.percent_complete+'% of the experiment');
		for (var i = 0; i < NBLOCKS; i++) {
			var stim = stims.stimuli.splice(0, NSTIMS);
			var prompts = stims.prompts.splice(0, NSTIMS);
			var peer = peers[g][0].splice(0, NPEERS);
			var names = peers[g][1].splice(0, NPEERS);
			var opts = {
				includeLikert: false,
				testing: false,
				stimDir: stims.stimDir,
				block_num: i,
				peerAgreement: [25,75],
				stim_regex: /.*\/(.*)\.jpg/,
				prompt_regex: /How (.*) is this.*/,
				timing: timing,
				you_timing: you_timing,
				mystery_questions: stims.main_questions_question[i],
			};

			block = poliTimelineGenNamesMod(stim, prompts, peer, names, opts);	
					
			block.type = 'similarity';
			for (var j = 0; j < block.length; j++) {
				jsPsych.addNodeToEndOfTimeline(block[j], function () {});
			}

			lblock = {
				type: 'survey-likert',
				preamble: 'Kerro kuinka samaa mieltä olet esitetyn väitteen kanssa asteikolla yhdestä kymmeneen (1...10):<br>1 = täysin eri mieltä, ..., 10 = täysin samaa mieltä<br>',
				questions: [stims.main_questions_statement[i]],
				location_after: "#jspsych-stim", // put likert after main block, not under sidebar table
				//display_element: $("#jspsych-stim"),  // DOES NOT WORK
				on_finish: function () {
					try {										
						jsPsych.data.addProperties(subject_id_property) // add subjID to all rows					
						saveData(jsPsych.data.getDataAsJSON())									
						//jsPsych.data.localSave(filename, 'csv');
					} catch (e) {
						console.log('data save failed!')
					}
				}
			}
			jsPsych.addNodeToEndOfTimeline(lblock)
		}
		jsPsych.addNodeToEndOfTimeline(comments_block);
		jsPsych.data.addProperties(subject_id_property);
		jsPsych.addNodeToEndOfTimeline(savetrial_block); // force save before proceeding
    },
};

var fullscreen_block = {
    "type": "instructions",
    "show_clickable_nav": true,
    "key_forward": "",
    "pages": ['<h4>OSIO C: Mielipiteitä opiskelusta ja työelämästä</h4>Seuraavat kysymykset liittyvät opiskeluun ja työelämään.<br>Aloitamme harjoitusosuudella.<br><br>Ole hyvä ja siirry nyt kokoruudun tilaan, ellet jo ole sellaisessa.<br>Tämä tapahtuu painamalla F11 näppäintä tai valitsemalla selainikkunan reunasta kokoruudun tilan.<br><br>Paina nappia jatkaaksesi.'],
    "on_finish": function () {
		;
    }
};

var practice_warning_block = {
    type: "instructions",
    show_clickable_nav: true,
    show_progress_bar: false,
    key_forward: "",
    pages: ['Seuraavaksi opit lisää kyselystä ja teet harjoitusosuuden.<br><br><strong>Paina nappia jatkaaksesi.</strong>'],
    on_finish: function () {
        var progress = jsPsych.progress();
        console.log('You have completed approximately ' + progress.percent_complete + '% of the experiment');
    }
};

timeline.push(welcome_block);
timeline.push(demographics_block);
timeline.push(likert_and_survey_block);
timeline.push(fullscreen_block);
timeline.push.apply(timeline, practice_timeline); // appending list to list

jsPsych.pluginAPI.preloadImages(stims, function () {
    jsPsych.init({
        timeline: timeline,
        show_progress_bar: true,
        fullscreen: true, // WAS true;
        on_finish: function () {            
			try {											
				saveData(jsPsych.data.getDataAsJSON()) // last save				
				//jsPsych.data.localSave(filename, 'csv');
			} catch (e) {
				console.log('data save failed!')
			}
			
			$('#jspsych-content').empty()
            .css('visibility', 'visible')
            .html('<br>Siirryt nyt automaattisesti eteenpäin<br><a href="SECRET">Klikkaa linkkiä siirtyäksesi eteenpäin</a>');

			//window.open("SECRET", "_self");
			
		}
    });
});