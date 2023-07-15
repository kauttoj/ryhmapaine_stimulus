/**
 * jspsych-survey-text
 * a jspsych plugin for free response survey questions
 *
 * Josh de Leeuw
 *
 * documentation: docs.jspsych.org
 *
 */

jsPsych.plugins['survey-text-sam'] = (function() {

    var plugin = {};

    plugin.info = {
	name: 'survey-text-sam',
	description: '',
	parameters: {
	    questions: {
		type: [jsPsych.plugins.parameterType.STRING],
		array: true,
		default: undefined,
		no_function: false,
		description: ''
	    },
	    premable: {
		type: [jsPsych.plugins.parameterType.STRING],
		default: '',
		no_function: false,
		description: ''
	    },
	    rows: {
		type: [jsPsych.plugins.parameterType.INT],
		array: true,
		default: 1,
		no_function: false,
		description: ''
	    },
	    columns: {
		type: [jsPsych.plugins.parameterType.INT],
		array: true,
		default: 40,
		no_function: false,
		description: ''
	    }
	}
    }

    plugin.trial = function(display_element, trial) {

	trial.preamble = typeof trial.preamble == 'undefined' ? "" : trial.preamble;
	trial.input_type = typeof trial.input_type == 'undefined' ? "text" : trial.input_type;

	if (typeof trial.rows == 'undefined') {
	    trial.rows = [];
	    for (var i = 0; i < trial.questions.length; i++) {
		trial.rows.push(1);
	    }
	} else if (typeof trial.rows == 'number') {
	    var n = trial.rows;
	    trial.rows = [];
	    for (var i = 0; i < trial.questions.length; i++) {
		trial.rows.push(n);
	    }
	}
	if (typeof trial.columns == 'undefined') {
	    trial.columns = [];
	    for (var i = 0; i < trial.questions.length; i++) {
		trial.columns.push(40);
	    }
	} else if (typeof trial.columns == 'number') {
	    var n = trial.columns;
	    trial.columns = [];
	    for (var i = 0; i < trial.questions.length; i++) {
		trial.columns.push(n);
	    }
	}


	var value = trial.value || "";
	
	// if any trial variables are functions
	// this evaluates the function and replaces
	// it with the output of the function
	trial = jsPsych.pluginAPI.evaluateFunctionParameters(trial);

	// show preamble text
	display_element.empty().append($('<div>', {
	    "id": 'jspsych-survey-text-preamble',
	    "class": 'jspsych-survey-text-preamble',
		"style":"width: 800px; visibility: visible;"
	}));

	$('#jspsych-survey-text-preamble').html(trial.preamble);

	// Warning message area
	display_element.append($('<div>', {
	    id: 'warning',
	    css: {color: 'red'}
	}));

	// add all likert-type questions
	display_element.append('<form id="jspsych-survey-likert-form">');	
	for (var i = 0; i < trial.questions.length; i++) {
	  if (trial.input_type[i] == "likert") {
		  form_element = $('#jspsych-survey-likert-form');
		  // add question
		  form_element.append('<div class="jspsych-survey-likert-statement" align="middle">' + '<strong>' + (i+1) + ". " + trial.questions[i]) + '</strong>';
		  // add options
		  var width = 100 / trial.label[i].length;
		  var question_id = 'Q' + i + '_' + trial.questions[i].replaceAll(' ','_')  //'Q' + i
		  options_string = '<ul class="jspsych-survey-likert-opts" data-radio-group="' + question_id + '">';
		  for (var j = 0; j < trial.label[i].length; j++) {
		  options_string += '<input type="radio" name="' + question_id + '" value="' + trial.label[i][j] + '" style="height:30px; width:30px; vertical-align: middle;" required><label class="jspsych-survey-likert-opt-label">' + trial.label[i][j] + '</label>';
		  }
		  options_string += '</ul></div>';
		  form_element.append(options_string);
	  }
	}		

	// add other types of questions
	for (var i = 0; i < trial.questions.length; i++) {
		if (trial.input_type[i] != "likert") {
			// create div
			display_element.append($('<div>', {
			"id": 'jspsych-survey-text-' + i,
			"class": 'jspsych-survey-text-question',
			"css": {
				"margin": '2em 0em'
			}
			}));
			// add question text
			$("#jspsych-survey-text-" + i).append('<p class="jspsych-survey-text">' + '<strong>' +(i+1) + ". " + trial.questions[i] + '</strong></p>');
			var question_id = 'Q' + i + '_' + trial.questions[i].replaceAll(' ','_')

			if (trial.input_type[i] == "text") {
			// add text box
				$("#jspsych-survey-text-" + i).append('<input type="text" value="' + value + '" name="#jspsych-survey-text-response-' + i + '" cols="' + trial.columns[i] + '" rows="' + trial.rows[i] + '" data-question-id="'+ question_id +'"></input>');
			} else if (trial.input_type[i] == "textarea") {
				$("#jspsych-survey-text-" + i).append('<textarea placeholder="' + value + '" name="#jspsych-survey-text-response-' + i + '" cols="' + trial.columns[i] + '" rows="' + trial.rows[i] + '" data-question-id="'+ question_id +'"></textarea>');
			}
		}
	}

	// add submit button
	display_element.append($('<button>', {
	    'id': 'jspsych-survey-text-next',
	    'class': 'jspsych-btn jspsych-survey-text'
	}));

	$("#jspsych-survey-text-next").html('Lähetä vastaus');
	display_element.append('<p>   </p>') // add some space after button
	
	function validate( ) {
	    var validated = true;
	    var trial_data = {};
	    var $warning = $('<div>');
		
		var current_index = 0
		$("#jspsych-survey-likert-form .jspsych-survey-likert-opts").each(function (index) {
			var id = $(this).data('radio-group');
			var response = $('input[name="' + id + '"]:checked').val();
			if (typeof response == 'undefined') {
				$warning.append(
				$('<p>').html(trial.validationMessage[index])
				);
				validated = false;
			} else {
				trial_data[id] = response;
			}
			current_index = current_index+1
		});						
	    $("div.jspsych-survey-text-question").each(function(index) {
			index = index + current_index
			//console.log('index = ' + index)			
			//console.log('question_id = ' + $(this).children('input').data('question-id'));			
			var id = 'Q' + index  //"Q" + index;
			if (trial.input_type[index] == "text") {
				var val = $(this).children('input').val();
				id = $(this).children('input').data('question-id')
				//console.log(val);
			} else if (trial.input_type[index] == "textarea") {
				//console.log('textarea');
				var val = $(this).children('textarea').val();
				id = $(this).children('textarea').data('question-id')
				//console.log(val);			
			} else {
				;//console.log('BAD DATA TYPE!')
			}
			var resp = trial.validation[index](val);
			//console.log(resp);
			if (!resp) {
				$warning.append(
				$('<p>').html(trial.validationMessage[index])
				);
				validated = false;
			} else {
				trial_data[id] = val;
			}
	    });
	    if (validated){
			finishTrial(trial_data); 
	    }else {
			$('#warning').html($warning);
	    }
	}

	function finishTrial(resp) {
	    // measure response time
	    var endTime = (new Date()).getTime();
	    var response_time = endTime - startTime;
	
		var question_data = {};
		var current_index = 0
		$("#jspsych-survey-likert-form .jspsych-survey-likert-opts").each(function (index) {
			var id = $(this).data('radio-group');
			var response = $('input[name="' + id + '"]:checked').val();
			question_data[id] = response;
			current_index = current_index+1
		});						
	    $("div.jspsych-survey-text-question").each(function(index) {
			index = index + current_index		
			var id = 'Q' + index  //"Q" + index;
			if (trial.input_type[index] == "text") {
				var val = $(this).children('input').val();
				id = $(this).children('input').data('question-id')
			} else if (trial.input_type[index] == "textarea") {
				console.log('textarea');
				var val = $(this).children('textarea').val();
				id = $(this).children('textarea').data('question-id')		
			} else {
				console.log('BAD DATA TYPE!!!')
			}
			question_data[id] = val;
	    });		
		question_data["navigator"] = 'unknown'
		try {
			question_data["navigator"] = String(navigator.userAgent);
		} catch {
			;
		}

	    // save data
	    var trialdata = {
			"rt": response_time,
			"responses": JSON.stringify(resp),
	    };
		question_data_final = {};
		for (const [key, value] of Object.entries(question_data)) {
			if (key.includes('sukupuol')) { // HARD-CODED, not good for general use!
				question_data_final['gender']=value;
			}
		}				
	    $.extend(trialdata,question_data_final);

	    display_element.html('');

	    // next trial
	    jsPsych.finishTrial(trialdata);
	}
	$("#jspsych-survey-text-next").click(validate);

	var startTime = (new Date()).getTime();
    };

    return plugin;
})();
