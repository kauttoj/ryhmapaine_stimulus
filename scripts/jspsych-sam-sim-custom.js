var resp, mouse_listener_instructs, keyboard_listener;
/**
 * jspsych-sam-sim.js
 * Josh de Leeuw
 * Zach Ingbretsen
 *
 * Latent grouping trial design
 *
 * documentation: docs.jspsych.org
 *
 */

jsPsych.plugins.similarity = (function () {

    var resp,
    mouse_listener_instructs,
    keyboard_listener,
    trial_data;
    var plugin = {};

    jsPsych.pluginAPI.registerPreload('similarity', 'stimuli', 'image', function (t) {
        return !t.is_html || t.is_html == 'undefined'
    });
    jsPsych.pluginAPI.registerPreload('similarity', 'peers', 'image', function (t) {
        return !t.is_html || t.is_html == 'undefined'
    });

    plugin.info = {
        name: 'similarity',
        description: '',
        parameters: {
            stimuli: {
                type: [jsPsych.plugins.parameterType.STRING],
            default:
                undefined,
                array: true,
                no_function: false,
                description: ''
            },
            peers: {
                type: [jsPsych.plugins.parameterType.STRING],
            default:
                undefined,
                array: true,
                no_function: false,
                description: ''
            },
            names: {
                type: [jsPsych.plugins.parameterType.STRING],
            default:
                undefined,
                array: true,
                no_function: false,
                description: ''
            },
            choices: {
                type: [jsPsych.plugins.parameterType.STRING],
            default:
                undefined,
                array: true,
                no_function: false,
                description: ''
            },
            fMRI: {
                type: [jsPsych.plugins.parameterType.BOOL],
            default:
                false,
                no_function: false,
                description: ''
            },
            is_html: {
                type: [jsPsych.plugins.parameterType.BOOL],
            default:
                false,
                no_function: false,
                description: ''
            },
            labels: {
                type: [jsPsych.plugins.parameterType.STRING],
                array: true,
            default:
                ['Not at all similar', 'Identical'],
                no_function: false,
                description: ''
            },
            intervals: {
                type: [jsPsych.plugins.parameterType.INT],
            default:
                100,
                no_function: false,
                description: ''
            },
            show_ticks: {
                type: [jsPsych.plugins.parameterType.BOOL],
            default:
                false,
                no_function: false,
                description: ''
            },
            show_response: {
                type: [jsPsych.plugins.parameterType.SELECT],
                options: ['FIRST_STIMULUS', 'SECOND_STIMULUS', 'POST_STIMULUS'],
            default:
                'FIRST_STIMULUS',
                no_function: false,
                description: ''
            },
            timing_post_trial: {
                type: [jsPsych.plugins.parameterType.INT],
            default:
                0,
                no_function: false,
                description: ''
            },
            timing_image_gap: {
                type: [jsPsych.plugins.parameterType.INT],
            default:
                1000,
                no_function: false,
                description: ''
            },
            testing: {
                type: [jsPsych.plugins.parameterType.BOOL],
            default:
                '',
                no_function: false,
                description: ''
            },
            prompt: {
                type: [jsPsych.plugins.parameterType.STRING],
            default:
                '',
                no_function: false,
                description: ''
            },
            phase: {
                type: [jsPsych.plugins.parameterType.STRING],
            default:
                '',
                no_function: false,
                description: ''
            }
        }
    }

    plugin.trial = function (display_element, trial) {

        function ifelse(arg, arg_def) {
            return (typeof arg === 'undefined') ? arg_def : arg;
        }

        function custTimeout(func, time) {
            console.log("custTimeout");
            time = ifelse(time, 0);
            if (time > 0) {
                jsPsych.pluginAPI.setTimeout(function () {
                    console.log("executing:");
                    console.log(func);
                    func();
                }, time);
            } else {
                func();
            }
        }

        // default parameters
        trial.labels = (typeof trial.labels === 'undefined') ? ["Not at all similar", "Identical"] : trial.labels;
        trial.intervals = trial.intervals || 100;
        trial.show_ticks = ifelse(trial.show_ticks, false);
        //(typeof trial.show_ticks === 'undefined')	? false : trial.show_ticks;

        trial.show_response = trial.show_response || "SECOND_STIMULUS";
        trial.mystery = trial.mystery || ['img/big_yes.jpg', 'img/big_no.jpg'];

        trial.timing_post_trial = (typeof trial.timing_post_trial === 'undefined') ? 1000 : trial.timing_post_trial; // default 1000ms
        trial.timing_image_gap = trial.timing_image_gap || 1000; // default 1000ms

        trial.is_html = (typeof trial.is_html === 'undefined') ? false : trial.is_html;
        trial.prompt = (typeof trial.prompt === 'undefined') ? '' : trial.prompt;
        trial.testing = (typeof trial.testing === 'undefined') ? false : trial.testing;
        trial.practice = (typeof trial.practice === 'undefined') ? false : trial.practice;
        trial.names = (typeof trial.names === 'undefined') ? trial.peers : trial.names;

        trial.center_percent = trial.center_percent || 75;
        trial.fMRI = trial.fMRI || false;
        trial.phase = trial.phase || "";
        trial.peerDir = trial.peerDir || 'img/agents/';
        trial.peerExt = (typeof trial.peerExt === 'undefined') ? '.jpg' : trial.peerExt;
        trial.stimDir = (typeof trial.stimDir === 'undefined') ? 'img/movies/' : trial.stimDir;
        trial.stimTableWidth = trial.stimTableWidth || '650px'; // WAS 600px
        trial.prefix = trial.prefix || 'jspsych-';
        trial.mysteryCorrect = trial.mysteryCorrect || 'B';

        trial.respDelay = trial.respDelay || 0;

        trial.yes_no_labels = (typeof trial.yes_no_labels === 'undefined') ? true : trial.yes_no_labels;

        trial.prompt = trial.prompt.replace(/\${peer}/, trial.names[trial.peer]);

        trial.timeoutBeforeFeedback = ifelse(trial.timeoutBeforeFeedback, 0);
        trial.timeoutBeforeMystery = ifelse(trial.timeoutBeforeMystery, 0);
        trial.timeoutBeforePrompt = ifelse(trial.timeoutBeforePrompt, 0);
        trial.timeoutBeforeResponse = ifelse(trial.timeoutBeforeResponse, 0);
        trial.timeoutBeforeStim = ifelse(trial.timeoutBeforeStim, 0);
        trial.timeoutAfterFeedback = ifelse(trial.timeoutAfterFeedback, 0);
        trial.timeoutAfterFeedbackMystery = ifelse(trial.timeoutAfterFeedbackMystery, 0);
        trial.timeoutAfterStim = ifelse(trial.timeoutAfterStim, 0);

        // if any trial variables are functions
        // this evaluates the function and replaces
        // it with the output of the function

        trial = jsPsych.pluginAPI.evaluateFunctionParameters(trial);
        var startTime,
        keyboard_listener,
        practice_keyboard_listener,
        keyboard_listener2;

        showBlankScreen();

        if (trial.practice) {
            $('#' + trial.prefix + 'progressbar-container').hide();
            trial.timing_post_trial = 0;
        } else {
            $('#' + trial.prefix + 'progressbar-container').show();
        }

        function showBlankScreen() {
            //$(display_element).css('visibility', 'hidden');
            $('#jspsych-stim').css('visibility', 'hidden');
            if (trial.phase == "FIRST") {
                writeHTML();
            }
            if (trial.peer == 0) {
                $('#' + trial.prefix + 'history_table').append(
                    addHistoryRow());
            }

            custTimeout(showNextStim, trial.timeoutBeforeStim);
        }

        function createHistoryTable() {

            var $div = $('<div>', {
                id: trial.prefix + 'history',
                css: {
                    width: '600px'
                }
            });

            var $table = $('<table>', {
                id: trial.prefix + 'history_table',
                css: {}
            });

            var $tr_pic = $('<tr>');
            var $tr_name = $('<tr>');

            for (var j = 0; j < trial.peers.length; j++) {
                $tr_pic.append($('<td>', {
                        //width: "25%"
                    }).html($('<div>', {
                            css: {
                                //width: '25%'
                            }
                        }).append(
                            $('<img>', {
                                src: trial.peerDir + trial.peers[j] + trial.peerExt,
                                class: 'history',
                            }).addClass(trial.peer_label[j]))));
                $tr_name.append($('<td>', {
                        //width: "25%"
                    }).html(
                        $('<p>', {
                            text: trial.names[j],
                            class: 'history',
                        }).addClass(trial.peer_label[j])));
            }

            $table.append($tr_pic);
            $table.append($tr_name);
            $div.append($table);
            return $div;
        }

        function addHistoryRow() {
            var $tr = $('<tr>');
            for (var j = 0; j < trial.peers.length; j++) {
                $tr.append($('<td>'));
            }
            return $tr;
        }

        function createStimTable() {
            var $div = $('<div>', {
                id: trial.prefix + 'stim',
                css: {
                    width: trial.stimTableWidth,
                }
            });

            var $table = $('<table>', {
                'id': trial.prefix + 'stim_table',
            })

                var $prompt = $('<tr>').append($('<td>', {
                        html: '<h5 id="jspsych-prompt">',
                        width: trial.stimTableWidth,
                        colspan: 2
                    }));

            var $tr = $('<tr>');
            for (var i = 0; i < trial.stimuli.length; i++) {
                var $td = $('<td>', {
                    id: 'jspsych-choice_' + i
                });
                $tr.append($td);
            }

            var $tr_label = $('<tr>');
            for (var i = 0; i < trial.stimuli.length; i++) {
                var $td = $('<td>', {
                    id: 'jspsych-label_' + i,
                    "class": "jspsych-label",
                });
                $tr_label.append($td);
            }

            var $tr_sub_label = $('<tr>');
            for (var i = 0; i < trial.stimuli.length; i++) {
                var $td = $('<td>', {
                    id: 'jspsych-sub-label_' + i,
                    "class": "jspsych-sub-label",
                });
                $tr_sub_label.append($td);
            }

            $table.append($prompt);
            $table.append($tr_label);
            $table.append($tr);
            $table.append($tr_sub_label);
            $div.append($table);
            return $div;
        }

        function writeHTML() {
            $(display_element).empty();

            var $historyTable = createHistoryTable();
            var $stimTable = createStimTable();

            var $displayTable = $('<div>').append(
                    $('<div>').append(
                        $('<div>', {
                            html: $stimTable,
                            css: {
                                //width: '80%'
                                float: 'left',
                                position: 'relative',
                                //width: '200px',
                                top: '0px',
                                left: '0px'

                            }
                        })).append(
                        $('<div>', {
                            html: $historyTable,
                            css: {
                                //width: "10%"
                                float: 'right',
                                position: 'relative',
                                width: '300px',
                                top: '0px',
                                //left: trial.stimTableWidth,
                                'margin-left': '30px',
                            }
                        })));

            display_element.append($displayTable);
            display_element.prepend($('<div>', {
                    id: 'header',
                    css: {
                        //height: '50px',
                        //'background-color': 'blue',
                    }
                }));
            $stimTable.append($('<div>', {
                    id: "jspsych-peer"
                }));
        }

        function writeStims() {
            for (var i = 0; i < trial.stimuli.length; i++) {
                var label = '';
                $('#jspsych-label_' + i).html($('<p>', {
                        text: trial.choices[i].toUpperCase(),
                        css: {
                            margin: '0px',
                            height: '25px',
                        }
                    }));
                if (trial.stim_label != undefined) {
                    $('#jspsych-label_' + i).append(
                        $('<p>', {
                            text: trial.stim_label[i].toUpperCase(),
                            css: {
                                margin: '0px',
                                height: '25px',
                                color: 'gray',
                            }
                        }));
                }

                $('#jspsych-choice_' + i).html($('<img>', {
                        src: trial.stimDir + trial.stimuli[i],
                        class: 'stim',
						border: '1px solid',
						"border-color": 'gray',
                    }));

                if (trial.yes_no_labels == true) {
                    if (trial.stimuli[i].indexOf('xes') >= 0) {
                        var lab = "EI";
                    } else if (trial.stimuli[i].indexOf('oes') >= 0) {
                        var lab = "KYLLÄ";
                    } else {
                        var lab = "";
                    }
                    $('#jspsych-sub-label_' + i).empty().append(
                        $('<p>', {
                            text: lab,
                            css: {
                                margin: '0px',
                                height: '25px',
                                color: 'gray',
                            }
                        }));
                }
				
            }
            $('#jspsych-stim').css('visibility', 'visible');
        }
		function startImgClickListener() {
			$('#jspsych-choice_' + 0).children('img.stim')[0].addEventListener('click', (e) => {logResp({key:trial.choices[0].charCodeAt(0),rt:(new Date()).getTime()-startTime})},{once : true})
			$('#jspsych-choice_' + 0).children('img.stim')[0].clicked = false
			$('#jspsych-choice_' + 1).children('img.stim')[0].addEventListener('click', (e) => {logResp({key:trial.choices[1].charCodeAt(0),rt:(new Date()).getTime()-startTime})},{once : true})
			$('#jspsych-choice_' + 1).children('img.stim')[0].clicked = false
		}		

        function showNextStim() {
            console.log('Current stimilus is ' + trial.stimuli[0])
            if ((trial.phase == "MYSTERY") && (!trial.practice)) {
                custTimeout(askMystery, trial.timeoutBeforeStim);
                startKeyListener()
                //custTimeout(startKeyListener, trial.timeoutBeforeResponse +trial.timeoutBeforeMystery);
                logResp({
                    key: 69,
                    rt: 0
                })
                /*
                lblock = {
                type: 'survey-likert',
                preamble: 'Vastaa seuraaviin kysymyksiin',
                questions: ['kysymys 1 dasads dsdsad dsad asdsdsadsad dasdada','kysymys 2 dasads dsdsad dsad asdsdsadsad dasdada'],
                }
                jsPsych.addNodeToEndOfTimeline(lblock)
                 */			
			} else if ((trial.phase == "MYSTERY") && (trial.practice)) {
				custTimeout(askMystery, trial.timeoutBeforeStim);
				//custTimeout(startKeyListener, trial.timeoutBeforeResponse);
				$('#jspsych-stim').append($('<input>', {
						'type': 'submit',
						'id': 'jspsych-survey-text-next',
						'value': 'Jatka'
				}));
				$("#jspsych-survey-text-next").click(function() {
				  jsPsych.finishTrial({});
				});	
				
            } else {
                custTimeout(askPref, trial.timeoutBeforePrompt);
                custTimeout(writeStims, trial.timeoutBeforeStim);
                var max_t = Math.max(trial.timeoutBeforePrompt, trial.timeoutBeforeStim);
                custTimeout(startKeyListener, trial.timeoutBeforeResponse + max_t);								
				
				//if (trial.practice == false) {
				custTimeout(startImgClickListener, trial.timeoutBeforeResponse + max_t);					
				//}
            }

            //$(display_element).css('visibility', 'visible');
/*
            if (trial.practice == true && trial.phase != "MYSTERY") {
                var mouse_listener_instructs = function (e) {
                    function setTrialInstructs() {
                        if (typeof trial.instructsAfterClick != 'undefined') {
                            var newPrompt = trial.instructsAfterClick.replace(
                                    /\${peer}/, trial.names[trial.peer]);
                            $('#jspsych-prompt').html(newPrompt);
                        }
                    }
                    $('#feedbackContinue').unbind('click', mouse_listener_instructs);
                    $('#continueBlock').remove();
                    setTrialInstructs();
                    startKeyListener();
					startImgClickListener();
                };

                stopKeyListener();
                //console.log('askpref');
                appendContinue(mouse_listener_instructs, trial.trialButtonLabel);
            }
			*/
        }

        function askMystery() {
            writePrompt();
            for(var i = 0; i < trial.stimuli.length; i++) {
				$('#jspsych-choice_' + i).html($('<img>', {
				src: trial.stimDir + trial.mystery[i],
				class: 'stim mystery' ,
				border: '1px solid',
				"border-color": 'gray',
				}
				));
				$('#jspsych-sub-label_' + i).empty()
            }
 					
			var arrows=['KYLLÄ','EI'] // get correct order of yes and no
			var lab;
			for(var i = 0; i < trial.stimuli.length; i++) {
				if (trial.mystery[i].indexOf('xes') >= 0) {
					lab = "EI";
					arrows[i]=lab
				} else if (trial.mystery[i].indexOf('oes') >= 0) {
					lab = "KYLLÄ";
					arrows[i]=lab
				}				
				$('#jspsych-sub-label_' + i).empty().append(
					$('<p>', {
						text: lab,
						css: {
							margin: '0px',
							height: '25px',
							color: 'gray',
						}
					}));
			}						

            $('#jspsych-peer').html(
                $('<div>', {
                    id: 'jspsych-peer-pic'
                }).append(
                    $('<img>', {
                        src: trial.peerDir + (arrows[0]=='KYLLÄ' ? 'greenarrowL.png' : 'redarrowL.png'),// 'arrowL.jpg'
                        width: '10%',
						id: 'arrow_imageL',
						style:"vertical-align: top;",
                    })).append(
                    $('<div>', {
                        css: {
                            display: 'inline-block'
                        }
                    }).append(
                        $('<img>', {
                            src: trial.peerDir + trial.peers[trial.peer1] + trial.peerExt,
                            width: '100%',
                            class: "mystery" + trial.peer_label[trial.peer1],
                        })).append(
                        $('<p>').text(trial.names[trial.peer1]))).append(
                    $('<div>', {
                        css: {
                            display: 'inline-block'
                        }
                    }).append(
                        $('<img>', {
                            src: trial.peerDir + trial.peers[trial.peer2] + trial.peerExt,
                            width: '100%',
                            class: "mystery" + trial.peer_label[trial.peer2],
                        })).append(
                        $('<p>').text(trial.names[trial.peer2]))).append(
                    $('<img>', {
                        src: trial.peerDir + (arrows[1]=='KYLLÄ' ? 'greenarrowR.png' : 'redarrowR.png'), //'redarrowR.png', // 'arrowR.jpg'
                        width: '10%',
						id: 'arrow_imageR',
						style:"vertical-align: top;",
                    }))).append(
                $('<p>', {
                    id: 'jspsych-peer-name'
                }).text(trial.names[trial.peer]))

            $('#jspsych-peer-pic>div').css({
                'width': '20%'
            });
            $('#jspsych-peer-pic>div>img').css({
                'width': '85%'
            });
            $('#jspsych-peer-pic>img').css({
                'width': '20%'
            });	
			$('#arrow_imageL')[0].style.width='10%'
			$('#arrow_imageR')[0].style.width='10%'
			
			$('#jspsych-label_0').html('')
			$('#jspsych-label_1').html('')			
			
			/*
			// DO NOT SHOW IMAGES
			$('#jspsych-choice_0').html('')
			$('#jspsych-choice_1').html('')
			// set 50-50 for labels or long texts will be mess.
			// there is no "yes" or "no" here
			$('#jspsych-sub-label_0').html('')
			$('#jspsych-sub-label_1').html('')
			*/
			// add some space after labels
			$('#jspsych-stim_table').after('<br>')
			
			if (trial.practice) {
				// we add likert example questions here
				$('#jspsych-stim').append('Sitten tämä sama väite esitetään sinulle ja sinun tehtävänäsi on vastata siihen uudelleen. Kerro kuinka samaa mieltä olet esitetyn väitteen kanssa asteikolla yhdestä kymmeneen (1...10).<br>(1 = täysin eri mieltä, ..., 10 = täysin samaa mieltä)<br>')
				$('#jspsych-stim').append('<form id="jspsych-survey-likert-form">');
				questions = trial.mystery_questions //['Kurssilla syödään paljon']
				// add likert scale questions
				for (var i = 0; i < questions.length; i++) {
				  // add question
				  $('#jspsych-survey-likert-form').append('<div class="jspsych-survey-likert-statement" align="left">' + '<strong>' + questions[i]) + '</strong>';
				  // add options
				  var width = 10;
				  var question_id = 'Q' + i
				  options_string = '<ul class="jspsych-survey-likert-opts" data-radio-group="' + question_id + '">';
				  options_string += '1 '
				  for (var j = 0; j < 10; j++) {
					options_string += '<input type="radio" name="' + question_id + '" value="' + j + '" style="height:25px; width:25px; vertical-align: middle;"><label class="jspsych-survey-likert-opt-label">' + "   " + '</label>';
				  }
				  options_string += ' 10'
				  options_string += '</ul></div>';
				  $('#jspsych-survey-likert-form').append(options_string);			 
				}					
				$('#jspsych-survey-likert-form').append('Paina nappia jatkaaksesi.');
			}
            $('#jspsych-stim').css('visibility', 'visible');
        }

        function writePrompt() {
            if ((trial.phase == "MYSTERY")) {
                var mysteryPeers = []
                mysteryPeers.push(trial.peer_compare.indexOf(1));
                mysteryPeers.push(
                    trial.peer_compare.slice(mysteryPeers[0] + 1).indexOf(1) + mysteryPeers[0] + 1);
                mysteryPeers.shuffle();

                trial.peer1 = mysteryPeers.pop();
                trial.peer2 = mysteryPeers.pop();
                trial.prompt = trial.prompt.replace(/\${peer1}/, trial.names[trial.peer1]);
                trial.prompt = trial.prompt.replace(/\${peer2}/, trial.names[trial.peer2]);
            } else {
                trial.prompt = trial.prompt.replace(/\${peer}/, trial.names[trial.peer]);
            }

            if (trial.practice) {
                $('#jspsych-prompt').html(
                    $('<p>', {
                        html: trial.prompt,
                        css: {}
                    })).addClass('practice');
            } else {
				
                if ((trial.phase == "MYSTERY")) {
                    var marg = 50;
                } else {
                    var marg = 20;
                }
                $('#jspsych-prompt').html(
                    $('<p>', {
                        html: trial.prompt,
                        css: {
                            height: '0px',
                            'margin-bottom': marg + 'px',
                            'margin-top': '0px',
                        }
                    }));
            }
        }

        function appendContinue(listener, text) {
            //console.log(listener);
            var $div = $('<div>', {
                id: 'continueBlock',
            });
            var $p = $('<p>', {
                html: text,
            });

            var $butt = $('<input>')
                .attr('type', 'button')
                .attr('value', 'Jatka')
                .attr('id', 'feedbackContinue')
                .on('click', listener);

            $div.append($p).append($butt);
            $('#jspsych-prompt').append($div);
        }

        function askPref() {
            writePrompt();
           
            trial.names[trial.peer].toLowerCase();

            if (trial.names[trial.peer].toLowerCase() == "sinä") {
                $('#jspsych-peer').empty();
            } else {
                $('#jspsych-peer').html(
                    $('<p>', {
                        id: 'jspsych-peer-ACC'
                    })).append(
                    $('<div>', {
                        id: 'jspsych-peer-pic'
                    }).append(
                        $('<img>', {
                            src: trial.peerDir + trial.peers[trial.peer] + trial.peerExt,
                            class: 'peer',
                        }))).append(
                    $('<p>', {
                        id: 'jspsych-peer-name'
                    }).text(trial.names[trial.peer]));
            }

        }

        function showFeedback(trial_data) {

            var mouse_listener = function (e) {
                $('#feedbackContinue').unbind('click', mouse_listener);
                jsPsych.finishTrial(trial_data);
            };

            //console.log('showing feedback');
            var $histAppend = $($('#jspsych-history_table tr').slice(-1).children()[trial.peer]);

            if ((trial.phase != "MYSTERY")) {
                //console.log('not mystery');
                if (trial.peer != 0) {
                    /*
                    $('#jspsych-peer').html(
                    $('<p>').text(trial.peers[trial.peer])
                    );
                    $('#jspsych-peer').append(
                    $('<img>', {src: trial.peer_pics[trial.peer]})
                    );
                     */

                    $histAppend.append(
                        $('<img>', {
                            src: trial_data.peerChoice,
                            class: 'history',
                        }))

                    if (trial_data.ACC == 1) {
                        $('#jspsych-peer-ACC').text("OIKEIN").css({
                            color: 'green'
                        });
                    } else {
                        $('#jspsych-peer-ACC').text("VÄÄRIN").css({
                            color: 'red'
                        });
                    }
                } else {
                    $histAppend.append(
                        $('<img>', {
                            src: trial_data.respChoice,
                            class: 'history',
                        }).addClass('self'))
                }

                if (!trial.practice || trial.feedbackPrompt == undefined || trial.phase == "MYSTERY") {
                    custTimeout(function () {
                        jsPsych.finishTrial(trial_data);
                    }, trial.timeoutAfterFeedback);
                } else {
                    if (trial.feedbackChoices == 'mouse' || trial.feedbackChoices == 'click') {
                        //console.log('feedbackChoices == mouse');
                        appendContinue(mouse_listener, trial.feedbackButtonLabel);
                    } else {
                        practice_keyboard_listener = jsPsych.pluginAPI.getKeyboardResponse({
                            callback_function: function () {
                                jsPsych.pluginAPI.cancelKeyboardResponse(practice_keyboard_listener);
                                jsPsych.finishTrial(trial_data);
                            },
                            valid_responses: [' '],
                            rt_method: 'date',
                            persist: true,
                            allow_held_key: false
                        });
                    }

                    if (trial.feedbackPrompt) {
						$('#jspsych-prompt').html(
							$('<p>', {
								html: trial.feedbackPrompt,
								css: {}
							})).addClass('practice');												
                        //$('#jspsych-prompt').html(trial.feedbackPrompt).addClass('practice'); // this leads to ugly bolded font

                        if (trial.feedbackChoices == 'mouse' || trial.feedbackChoices == 'click') {
                            //console.log('yes, feedbackChoices is mouse or click');
                            appendContinue(mouse_listener, trial.feedbackButtonLabel);
                        } else {
                            $('#jspsych-prompt').append(
                                $('<p>', {
                                    text: "Paina välilyöntiä jatkaaksesi"
                                }));
                        }
                    }
                }

				if (!trial.practice || trial.phase!='FIRST') {
					if (trial_data.peerSide == 'left') {
						$('#jspsych-peer-pic').prepend(
							$('<img>', {
								src: trial.peerDir + 'arrowL.jpg',
								class: 'peer',
								style:"vertical-align: top;",
							}));
					} else {
						$('#jspsych-peer-pic').append(
							$('<img>', {
								src: trial.peerDir + 'arrowR.jpg',
								class: 'peer',
								style:"vertical-align: top;",
							}));
					}
				}

            } else {
                custTimeout(function () {
                    jsPsych.finishTrial(trial_data);
                }, trial.timeoutAfterFeedbackMystery);
            }
        }

        function startKeyListener() {
            startTime = (new Date()).getTime();
            keyboard_listener = jsPsych.pluginAPI.getKeyboardResponse({
                callback_function: logResp,
                valid_responses: trial.choices,
                rt_method: 'date',
                persist: true,
                allow_held_key: false
            });
			// allow pictures to be clicked also		
            // keyboard_listener2 = jsPsych.pluginAPI.getKeyboardResponse({
            // 	callback_function: fmriAdvance,
            // 	valid_responses: ['p'],
            // 	rt_method: 'date',
            // 	persist: true,
            // 	allow_held_key: false
            // });
        }

        function stopKeyListener() {
            jsPsych.pluginAPI.cancelKeyboardResponse(keyboard_listener);
        }

        function logResp(arg) {
			
			if ((typeof $('#jspsych-choice_' + 0).children('img.stim')[0] !== 'undefined') && (typeof $('#jspsych-choice_' + 1).children('img.stim')[0] !== 'undefined')) {	
				// clicking only
				if ($('#jspsych-choice_' + 0).children('img.stim')[0].clicked || $('#jspsych-choice_' + 0).children('img.stim')[0].clicked) {
					return;	 // either button pressed, leave
				} else {
					// set as pressed
					$('#jspsych-choice_' + 0).children('img.stim')[0].clicked=true
					$('#jspsych-choice_' + 1).children('img.stim')[0].clicked=true					
				}
			}
			
            try {
                stopKeyListener(); // need to skip this in mystery phase
            } catch (err) { ;
            }
										
            jsPsych.pluginAPI.clearAllTimeouts();

            var endTime = (new Date()).getTime();
            var response_time = endTime - startTime;
            var respCharCode = arg.key;
            var respKey = String.fromCharCode(arg.key);
            var respChoiceNum = trial.choices.indexOf(respKey.toLowerCase());
            var respChoice = trial.stimDir + trial.stimuli[respChoiceNum];
            var unselectedChoice = trial.stimDir + trial.stimuli[(respChoiceNum + 1) % 2];

            var subjectChoice,
            subjectUnselected,
            peerChoice,
            ACC,
            lastSelfTrial,
            left,
            right,
            peerSide;
            if (trial.peer == 0) {
                subjectChoice = respChoice;
            } else {
                var selfTrials = jsPsych.data.getData({
                    peerNum: 0
                });
                lastSelfTrial = selfTrials[selfTrials.length - 1];

                subjectChoice = lastSelfTrial.respChoice;
                subjectUnselected = lastSelfTrial.unselectedChoice;

                if (trial.peer_agree[trial.peer] == 1) {
                    peerChoice = subjectChoice;
                } else {
                    peerChoice = subjectUnselected;
                }

                if (respChoice == peerChoice && (trial.phase != "MYSTERY")) {
                    ACC = 1;
                } else {
                    ACC = 0;
                }
                left = trial.stimDir + trial.stimuli[0];
                right = trial.stimDir + trial.stimuli[1];
                if (peerChoice == left) {
                    peerSide = 'left';
                } else {
                    peerSide = 'right';
                }
            }

            var correctChoice = trial.peer_agree[trial.peer] == 1 ?
                trial.stimuli[respChoiceNum] :
                trial.stimuli[(respChoiceNum + 1) % 2];

            var peerName = trial.names[trial.peer];
            var peerImg = trial.peers[trial.peer];
            var mysteryPeers = [trial.peer1, trial.peer2];

            var trial_data = {
                "rt": arg.rt,
                "respCharCode": respCharCode,
                "respKey": respKey,
                "respChoiceNum": respChoiceNum,
                "respChoice": respChoice,
                "unselectedChoice": unselectedChoice,
                "subjectChoice": subjectChoice,
                "peerChoice": peerChoice,
                "stimuli": JSON.stringify(trial.stimuli),
                "peerNum": trial.peer,
                "peerName": peerName,
                "peerImg": peerImg,
                "peerSide": peerSide,
                "ACC": ACC,
                "MysteryPeer1": trial.peer1,
                "MysteryPeer2": trial.peer2,
                "phase": trial.phase,
				'responses': JSON.stringify({'Prompt':trial.prompt}),
            };
            if ((trial.phase == "MYSTERY")) {
				trial_data['responses'] = JSON.stringify({
					'Question':trial.mystery_questions,
					'left_resp':$('#jspsych-sub-label_0')[0].textContent,'left_peer_name':trial.names[trial.peer1],'left_peer_type':trial.peer_label[trial.peer1],
					'right_resp':$('#jspsych-sub-label_1')[0].textContent,'right_peer_name':trial.names[trial.peer2],'right_peer_type':trial.peer_label[trial.peer2]})
				trial_data["stimuli"] = JSON.stringify(trial.mystery)
            }

            for (var i = 0; i < trial.peers.length; i++) {
                trial_data["PeerImg" + i] = trial.peers[i];
                trial_data["PeerName" + i] = trial.names[i];
                trial_data["PeerAgreement" + i] = trial.peer_agree[i];
                trial_data["PeerCompare" + i] = trial.peer_compare[i];
                trial_data["PeerLabel" + i] = trial.peer_label[i];
            }

            custTimeout(function () {
                showFeedback(trial_data);
            }, trial.timeoutBeforeFeedback);
        }

        function jitter() {}

    };
    return plugin;
})();