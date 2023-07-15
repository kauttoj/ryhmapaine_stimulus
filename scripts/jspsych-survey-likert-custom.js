/**
 * jspsych-survey-likert
 * a jspsych plugin for measuring items on a likert scale
 *
 * Josh de Leeuw
 *
 * documentation: docs.jspsych.org
 *
 */

/*
function generateTable(display_element) {
// creates a <table> element and a <tbody> element
const tbl = document.createElement("table");
const tblBody = document.createElement("tbody");

// creating all cells
for (let i = 0; i < 2; i++) {
// creates a table row
const row = document.createElement("tr");

for (let j = 0; j < 2; j++) {
// Create a <td> element and a text node, make the text
// node the contents of the <td>, and put the <td> at
// the end of the table row
const cell = document.createElement("td");
const cellText = document.createTextNode(`cell in row ${i}, column ${j}`);
cell.appendChild(cellText);
row.appendChild(cell);
}

// add the row to the end of the table body
tblBody.appendChild(row);
}

// put the <tbody> in the <table>
tbl.appendChild(tblBody);
// appends <table> into <body>
document.body.appendChild(tbl);
// sets the border attribute of tbl to '2'
tbl.setAttribute("border", "1px solid black");
}
 */

// CUSTOMIZED 10-ITEM LIKERT QUESTIONS

jsPsych.plugins['survey-likert'] = (function () {

    var plugin = {};

    plugin.trial = function (display_element, trial) {

        // default parameters for the trial
        trial.preamble = typeof trial.preamble === 'undefined' ? "" : trial.preamble;

        trial.labels = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '10']
        // if any trial variables are functions
        // this evaluates the function and replaces
        // it with the output of the function
        trial = jsPsych.pluginAPI.evaluateFunctionParameters(trial);

        // hack to force specific location
		var need_end_div = false
        if (typeof trial.location_after !== 'undefined') {
            //console.log('using custom display_elements')
            display_element = $(trial.location_after)
                display_element.addClass('jspsych-display-element');
        } else {		
			// if not part of another trial, we want to limit the width of content with a new div
			//$("#jspsych-content").attr("style","width: 800px;")	
			display_element.append($('<div>', {
                "id": "content-width-limiter",
                "style":"width: 850px;",
            }));
			display_element = $("#content-width-limiter")			
			display_element.addClass('jspsych-display-element');
		}
        // show preamble text
        display_element.append($('<div>', {
                "id": 'jspsych-survey-likert-preamble',
                "class": 'jspsych-survey-likert-preamble'
            }));

        $('#jspsych-survey-likert-preamble').html(trial.preamble);
		
		display_element.append('<form id="jspsych-survey-likert-form">');
		form_element = $('#jspsych-survey-likert-form');
		// add likert scale questions
		for (var i = 0; i < trial.questions.length; i++) {
		  
		  // add question
		  if (trial.questions.length>1) {
			form_element.append('<div class="jspsych-survey-likert-statement" align="left">' + '<strong>' + String(i+1) + ". " + trial.questions[i]) + '</strong>';
		  } else {
			form_element.append('<div class="jspsych-survey-likert-statement" align="left">' + '<strong>' + trial.questions[i]) + '</strong>';			  
		  }
		  // add options
		  var width = 100 / trial.labels.length;
		  var question_id = 'Q' + i + '_' + trial.questions[i].replaceAll(' ','_')
		  options_string = '<ul class="jspsych-survey-likert-opts" data-radio-group="' + question_id + '">';
		  options_string += '1 '
		  for (var j = 0; j < trial.labels.length; j++) {
			options_string += '<input type="radio" name="' + question_id + '" value="' + j + '" style="height:25px; width:25px; vertical-align: middle;" required><label class="jspsych-survey-likert-opt-label">' + "   " + '</label>';
		  }
		  options_string += ' 10'
		  options_string += '</ul></div><br>';
		  form_element.append(options_string);
		}		
		
        // modification2
        form_element.append($('<input>', {
                'type': 'submit',
                'class': 'jspsych-survey-likert jspsych-btn',
                'value': 'Lähetä vastaus'
            }));
			
		form_element.append('<p>   </p>') // add some space after button		

        form_element.submit(function (event) { // modification3

            event.preventDefault(); // modification4

            // measure response time
            var endTime = (new Date()).getTime();
            var response_time = endTime - startTime;

            // create object to hold responses
            var question_data = {};
            $("#jspsych-survey-likert-form .jspsych-survey-likert-opts").each(function (index) {
                var id = $(this).data('radio-group');
                var response = $('input[name="' + id + '"]:checked').val();
                if (typeof response == 'undefined') {
                    response = -1;
                }
                var obje = {};
                obje[id] = response;
                $.extend(question_data, obje);
            });

            // save data
            var trial_data = {
                "rt": response_time,
                "responses": JSON.stringify(question_data)
            };

            display_element.html('');

            // next trial
            jsPsych.finishTrial(trial_data);
        });

        var startTime = (new Date()).getTime();
    };

    return plugin;
})();
