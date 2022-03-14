
// safari & ie exclusion ----------------------------------------------------------------
var is_safari = /^((?!chrome|android).)*safari/i.test(navigator.userAgent);
var is_ie = /*@cc_on!@*/false || !!document.documentMode;

var is_compatible = !(is_safari || is_ie);


if(!is_compatible) {

    var safari_exclusion = {
        type: "html-keyboard-response",
        stimulus:
        "<p>Sorry, this study is not compatible with your browser.</p>" +
        "<p>Please try again with a compatible browser (e.g., Chrome or Firefox).</p>",
        choices: jsPsych.NO_KEYS
    };

    var timeline_safari = [];

    timeline_safari.push(safari_exclusion);
    jsPsych.init({timeline: timeline_safari});

}

// firebase initialization ---------------------------------------------------------------
  var firebase_config = {
        apiKey: "AIzaSyBwDr8n-RNCbBOk1lKIxw7AFgslXGcnQzM",
        databaseURL: "https://postdocgent.firebaseio.com/"
  };

  firebase.initializeApp(firebase_config);
  var database = firebase.database();

  // prolific variables
  var prolificID = jsPsych.data.getURLVariable("PROLIFIC_PID");
  if(prolificID == null) {prolificID = "999";}
  var jspsych_id = jsPsych.randomization.randomID(15); // short ID

  // Preload images
  var preloadimages = [];

  // connection status ---------------------------------------------------------------------
  // This section ensure that we don't lose data. Anytime the 
  // client is disconnected, an alert appears onscreen
  var connectedRef = firebase.database().ref(".info/connected");
  var connection   = firebase.database().ref("IAT/" + jspsych_id + "/")
  var dialog = undefined;
  var first_connection = true;

  connectedRef.on("value", function(snap) {
    if (snap.val() === true) {
      connection
        .push()
        .set({status: "connection",
              timestamp: firebase.database.ServerValue.TIMESTAMP})

      connection
        .push()
        .onDisconnect()
        .set({status: "disconnection",
              timestamp: firebase.database.ServerValue.TIMESTAMP})

    if(!first_connection) {
      dialog.modal('hide');
    }
    first_connection = false;
    } else {
      if(!first_connection) {
      dialog = bootbox.dialog({
          title: 'Connection lost',
          message: '<p><i class="fa fa-spin fa-spinner"></i> Please wait while we try to reconnect.</p>',
          closeButton: false
          });
    }
    }
  });

    // counter variables
  var iat_trial_n      = 1;
  var browser_events_n = 1;

// Variable input -----------------------------------------------------------------------
// group associated with the self and first side in the self-referencing task 
var pairing_SelfRef = jsPsych.randomization.sampleWithoutReplacement(["Andy_left", "John_left", "Andy_right", "John_right"], 1)[0];
// First group rated in the final rating task
var rating_firstgroup = jsPsych.randomization.sampleWithoutReplacement(["Andy_first", "John_first"], 1)[0];
// Picture associated with the andy vs. John first name
var Name_face   = jsPsych.randomization.sampleWithoutReplacement(["45_Andy", "55_Andy"], 1)[0];
        

 // cursor helper functions
var hide_cursor = function() {
	document.querySelector('head').insertAdjacentHTML('beforeend', '<style id="cursor-toggle"> html { cursor: none; } </style>');
}
var show_cursor = function() {
	document.querySelector('#cursor-toggle').remove();
}

var hiding_cursor = {
    type: 'call-function',
    func: hide_cursor
}

var showing_cursor = {
    type: 'call-function',
    func: show_cursor
}

// Preload faces
var stim = [
      "stimuli/Face_45.png",
      "stimuli/Face_55.png",
      "stimuli/Andy_1.jpeg",
      "stimuli/Andy_2.jpeg",
      "stimuli/Andy_3.jpeg",
      "stimuli/Andy_4.jpeg",
      "stimuli/John_1.jpeg",
      "stimuli/John_2.jpeg",
      "stimuli/John_3.jpeg",
      "stimuli/John_4.jpeg",
      "stimuli/Andy_1_instr.jpeg",
      "stimuli/Andy_2_instr.jpeg",
      "stimuli/Andy_3_instr.jpeg",
      "stimuli/Andy_4_instr.jpeg",
      "stimuli/John_1_instr.jpeg",
      "stimuli/John_2_instr.jpeg",
      "stimuli/John_3_instr.jpeg",
      "stimuli/John_4_instr.jpeg",
      "stimuli/Face_45_Andy.jpeg",
      "stimuli/Face_45_John.jpeg",
      "stimuli/Face_55_Andy.jpeg",
      "stimuli/Face_55_John.jpeg",
      "stimuli/Self.jpeg"
];


preloadimages.push(stim);


// Saving blocks ------------------------------------------------------------------------
// Every function here send the data to keen.io. Because data sent is different according
// to trial type, there are differents function definition.

// init ---------------------------------------------------------------------------------
  var saving_id = function(){
     database
        .ref("SelfRef_participant_id/")
        .push()
        .set({jspsych_id: jspsych_id,
               prolificID: prolificID,
               pairing_SelfRef: pairing_SelfRef,
               timestamp: firebase.database.ServerValue.TIMESTAMP})
  }

  // iat trial ----------------------------------------------------------------------------
  var saving_iat_trial = function(){
    database
      .ref("SelfRef_trial/")
      .push()
      .set({jspsych_id: jspsych_id,
          prolificID: prolificID,
          pairing_SelfRef: pairing_SelfRef,
          timestamp: firebase.database.ServerValue.TIMESTAMP,
          iat_trial_data: jsPsych.data.get().last().json()})
  }

// demographic logging ------------------------------------------------------------------

  var saving_browser_events = function(completion) {
    database
     .ref("SelfRef_browser_event/")
     .push()
     .set({jspsych_id: jspsych_id,
      prolificID: prolificID,
      timestamp: firebase.database.ServerValue.TIMESTAMP,
      pairing_SelfRef: pairing_SelfRef,
      completion: completion,
      event_data: jsPsych.data.getInteractionData().json()})
  }



// saving blocks ------------------------------------------------------------------------
var save_id = {
    type: 'call-function',
    func: saving_id
}

var save_iat_trial = {
    type: 'call-function',
    func: saving_iat_trial
}


// iat sampling function ----------------------------------------------------------------
var sample_n_iat = function(list, n) {
  list = jsPsych.randomization.sampleWithoutReplacement(list, n);
  list = jsPsych.randomization.shuffleNoRepeats(list);

  return(list);
}

// EXPERIMENT ---------------------------------------------------------------------------

// Consent --------------------------------------------------------------
  var check_consent = function(elem) {
    if (document.getElementById('info').checked 
      & document.getElementById('volunt').checked 
      & document.getElementById('anony').checked 
      & document.getElementById('end').checked 
      & document.getElementById('consqc').checked 
      & document.getElementById('summ').checked 
      & document.getElementById('participate').checked ) {
      return true;
    }
    else {
      alert("If you wish to participate, you must check all the boxes.");
      return false;
    }
    return false;
  };


  var consent = {
    type:'external-html',
    url: "https://marinerougier.github.io/SelfRef_Perso/external_page_consent.html",
    cont_btn: "start",
    check_fn: check_consent,
        on_load: function() {
          window.scrollTo(0, 0)
        },
  };

// Switching to fullscreen --------------------------------------------------------------
var fullscreen_trial = {
  type: 'fullscreen',
  message:  'To start please switch to full screen </br></br>',
  button_label: 'Switch to fullscreen',
  fullscreen_mode: true,
        on_load: function() {
          window.scrollTo(0, 0);
          $(".").css("text-align", "justify");
          $(".jspsych-content").css("max-width", "80%");
        },
}

// General instruction -----------------------------------------------------------------------------------
var instructions_gene_1 = {
  type: "html-keyboard-response",
  post_trial_gap: 200,
  stimulus:
    "<h1 class ='custom-title'> About this study </h1>" +
    "<p class='instructions'>You can quit the study at any time by closing the browser window. However, please be aware " +
    "that this will <b>end your participation</b>. If you are certain that you want to quit or encounter technical issues "+
    "that force you to quit, <b>you can still receive a partial reward proportionate to the time you actually spent</b> on "+
    "the study. If this occurs, please take the following steps: Return the study via the Prolific study page as "+
    "quickly as possible (please do not submit unless you have completed the study and received a completion code). "+
    "Send a message to the researcher via the Prolific study page, stating that you completed part of the study "+
    "(this will ensure that the researcher knows you should receive a partial reward). </br></br></p>" +
    "<p class = 'continue-instructions'>Press <span class='key'>space</span>" +
    " to continue.</p>",
  choices: [32]
};

var instructions_gene_2 = {
  type: "html-keyboard-response",
  post_trial_gap: 200,
  stimulus:
    "<h1 class ='custom-title'> About this study </h1>" +
    "<p class='instructions'>This study is divided into three separate parts. </br></br>"+
    " In part 1, you will fill in a personality questionnaire about yourself. In part 2, you will complete a categorization task."+
    " Finally, in part 3 you will evaluate stimuli displayed during the categorization task (in part 2). </p></br></br>" +
    "<p class = 'continue-instructions'>Press <span class='key'>space</span>" +
    " to continue.</p>",
  choices: [32]
};

// Personality questionnaire -----------------------------------------------------------------------------------
var Personality_instructions_1 = {
  type: "html-keyboard-response",
  post_trial_gap: 200,
  stimulus:
    "<h1 class ='custom-title'> Part 1: Personality assessment </h1>" +
    "<p class='instructions'>In this first part, you will be asked to fill in a personality questionnaire. <br><br>" +
    " You will be presented with a number of characteristics that may or may not apply to you. For example, do you agree that you are" +
    "  someone who <i>likes to spend time with others</i>? <b>Please select a number for each statement to indicate"+
    " the extent to which you agree or disagree with that statement. </b></br></br>" +
    " It is extremely important that you try to answer <b> as honestly and as spontaneously as possible. We are only interested"+
    " in your true personality here. Also, keep in mind that <b>your responses are anonymous </b>and will be analyzed in an "+
    "aggregated way, that is, together with the answers of other participants.</b></br></br><br>"+
    "</p>" +
    "<p class = 'continue-instructions'>Press <span class='key'>space</span>" +
    " to continue.</p>",
  choices: [32]
};

var scale_questionnaire = ["1</br>Disagree strongly", "2</br>Disagree a little", "3</br>Neutral; no opinion", "4</br>Agree a little", "5</br>Agree strongly"];

var rating_self = {
        type: 'survey-likert',
        preamble: "<br><br><b><i>I AM SOMEONE WHO...</b></i><br><br>",
        questions: [
          {prompt: "<b>Tends to be quiet.</b>", labels: scale_questionnaire, required: true},
          {prompt: "<b>Is compassionate, has a soft heart.</b>", labels: scale_questionnaire, required: true},
          {prompt: "<b>Tends to be disorganized.</b>", labels: scale_questionnaire, required: true},
          {prompt: "<b>Worries a lot.</b>", labels: scale_questionnaire, required: true},
          {prompt: "<b>Is fascinated by art, music, or literature.</b>", labels: scale_questionnaire, required: true},
          {prompt: "<b>Is dominant, acts as a leader.</b>", labels: scale_questionnaire, required: true},
          {prompt: "<b>Is sometimes rude to others.</b>", labels: scale_questionnaire, required: true},
          {prompt: "<b>Has difficulty getting started on tasks.</b>", labels: scale_questionnaire, required: true},
          {prompt: "<b>Tends to feel depressed, blue.</b>", labels: scale_questionnaire, required: true},
          {prompt: "<b>Has little interest in abstract ideas.</b>", labels: scale_questionnaire, required: true},
          {prompt: "<b>Is full of energy.</b>", labels: scale_questionnaire, required: true},
          {prompt: "<b>Assumes the best about people.</b>", labels: scale_questionnaire, required: true},
          {prompt: "<b>Is reliable, can always be counted on.</b>", labels: scale_questionnaire, required: true},
          {prompt: "<b>Is emotionally stable, not easily upset.</b>", labels: scale_questionnaire, required: true},
          {prompt: "<b>Is original, comes up with new ideas.</b>", labels: scale_questionnaire, required: true},
          {prompt: "<b>Is outgoing, sociable.</b>", labels: scale_questionnaire, required: true},
          {prompt: "<b>Can be cold and uncaring.</b>", labels: scale_questionnaire, required: true},
          {prompt: "<b>Keeps things neat and tidy.</b>", labels: scale_questionnaire, required: true},
          {prompt: "<b>Is relaxed, handles stress well.</b>", labels: scale_questionnaire, required: true},
          {prompt: "<b>Has few artistic interests.</b>", labels: scale_questionnaire, required: true},
          {prompt: "<b>Prefers to have others take charge.</b>", labels: scale_questionnaire, required: true},
          {prompt: "<b>Is respectful, treats others with respect.</b>", labels: scale_questionnaire, required: true},
          {prompt: "<b>Is persistent, works until the task is finished.</b>", labels: scale_questionnaire, required: true},
          {prompt: "<b>Feels secure, comfortable with self.</b>", labels: scale_questionnaire, required: true},
          {prompt: "<b>Is complex, a deep thinker.</b>", labels: scale_questionnaire, required: true},
          {prompt: "<b>Is less active than other people.</b>", labels: scale_questionnaire, required: true},
          {prompt: "<b>Tends to find fault with others.</b>", labels: scale_questionnaire, required: true},
          {prompt: "<b>Can be somewhat careless.</b>", labels: scale_questionnaire, required: true},
          {prompt: "<b>Is temperamental, gets emotional easily.</b>", labels: scale_questionnaire, required: true},
          {prompt: "<b>Has little creativity.</b>", labels: scale_questionnaire, required: true}
        ],
        randomize_question_order: false, 
        button_label: 'Continue',
        on_finish: function(data) {
          data.task = "rating";
          var parsed_response  = JSON.parse(data.responses);
          data.Personality_1      = parsed_response.Q0 ;
          data.Personality_2     = parsed_response.Q1 ;
          data.Personality_3     = parsed_response.Q2 ;
          data.Personality_4     = parsed_response.Q3 ;
          data.Personality_5     = parsed_response.Q4 ;
          data.Personality_6     = parsed_response.Q5 ;
          data.Personality_7     = parsed_response.Q6 ;
          data.Personality_8     = parsed_response.Q7 ;
          data.Personality_9     = parsed_response.Q8 ;
          data.Personality_10     = parsed_response.Q9 ;
          data.Personality_11     = parsed_response.Q10 ;
          data.Personality_12     = parsed_response.Q11 ;
          data.Personality_13     = parsed_response.Q12 ;
          data.Personality_14     = parsed_response.Q13 ;
          data.Personality_15     = parsed_response.Q14 ;
          data.Personality_16     = parsed_response.Q15 ;
          data.Personality_17     = parsed_response.Q16 ;
          data.Personality_18     = parsed_response.Q17 ;
          data.Personality_19     = parsed_response.Q18 ;
          data.Personality_20     = parsed_response.Q19 ;
          data.Personality_21     = parsed_response.Q20 ;
          data.Personality_22     = parsed_response.Q21 ;
          data.Personality_23     = parsed_response.Q22 ;
          data.Personality_24     = parsed_response.Q23 ;
          data.Personality_25     = parsed_response.Q24 ;
          data.Personality_26     = parsed_response.Q25 ;
          data.Personality_27     = parsed_response.Q26 ;
          data.Personality_28     = parsed_response.Q27 ;
          data.Personality_29     = parsed_response.Q28 ;
          data.Personality_30     = parsed_response.Q29 ;
          data.target_rating    = "self";
        },
    };

var Personality_instructions_end = {
  type: "html-keyboard-response",
  post_trial_gap: 200,
  stimulus:
    "<p class='instructions'><center>The first part of the study is over. Now, you will start Part 2.</center></p><br><br>" +
    "<p class = 'continue-instructions'>Press <span class='key'>space</span>" +
    " to continue.</p>",
  choices: [32]
};

// Self_referencing task -----------------------------------------------------------------------------------
// Self_referencing variable initialization ----------------------------------------------------------
/*
Self-referencing task (SR-task): Four blocks of 40 trials each (standard version; Prestwich et al., 2010): 
- Blocks 1 & 2: Target 1 – Self (e.g., D key) vs. Target 2 – Others (e.g., I key) --> 4 repetitions in each block (because 10 stim)
- Blocks 3 & 4: Target 1 – Self (e.g., I key) vs. Target 2 – Others (e.g., D key) --> 4 repetitions in each block (because 10 stim)
In case of incorrect classification: a red ‘X’ appears (remains until correction). 
*/

// Label -----------------------------------
var block_1_left_label_top      = undefined;
var block_1_right_label_top     = undefined;
var block_1_left_label_bottom   = undefined;
var block_1_right_label_bottom  = undefined;

var block_2_left_label_top      = undefined;
var block_2_right_label_top     = undefined;
var block_2_left_label_bottom   = undefined;
var block_2_right_label_bottom  = undefined;

var block_3_left_label_top      = undefined;
var block_3_right_label_top     = undefined;
var block_3_left_label_bottom   = undefined;
var block_3_right_label_bottom  = undefined;

var block_4_left_label_top      = undefined;
var block_4_right_label_top     = undefined;
var block_4_left_label_bottom   = undefined;
var block_5_right_label_bottom  = undefined;


switch(pairing_SelfRef) {
  case "Andy_left":
        self_side_1st              = "left";
        other_side_1st             = "right";
        Andy_side_1st              = "left";
        John_side_1st            = "right";

        self_side_2nd              = "right";
        other_side_2nd             = "left";
        Andy_side_2nd              = "right";
        John_side_2nd            = "left";

        block_1_left_label_bottom  = "<b>Self</b>-related words";
        block_1_right_label_bottom = "<b>Other</b>-related words";
        block_1_left_label_top   = "Andy";
        block_1_right_label_top  = "John";

        block_2_left_label_bottom  = "<b>Self</b>-related words";
        block_2_right_label_bottom = "<b>Other</b>-related words";
        block_2_left_label_top   = "Andy";
        block_2_right_label_top  = "John";

        block_3_left_label_bottom  = "<b>Other</b>-related words";
        block_3_right_label_bottom = "<b>Self</b>-related words";
        block_3_left_label_top   = "John";
        block_3_right_label_top  = "Andy";

        block_4_left_label_bottom  = "<b>Other</b>-related words";
        block_4_right_label_bottom = "<b>Self</b>-related words";
        block_4_left_label_top   = "John";
        block_4_right_label_top  = "Andy";
    break;

  case "Andy_right":
        self_side_1st           = "right";
        other_side_1st          = "left";
        Andy_side_1st           = "right";
        John_side_1st         = "left";

        self_side_2nd           = "left";
        other_side_2nd          = "right";
        Andy_side_2nd           = "left";
        John_side_2nd         = "right";

        block_1_left_label_bottom  = "<b>Other</b>-related words";
        block_1_right_label_bottom = "<b>Self</b>-related words";
        block_1_left_label_top   = "John";
        block_1_right_label_top  = "Andy";

        block_2_left_label_bottom  = "<b>Other</b>-related words";
        block_2_right_label_bottom = "<b>Self</b>-related words";
        block_2_left_label_top   = "John";
        block_2_right_label_top  = "Andy";

        block_3_left_label_bottom  = "<b>Self</b>-related words";
        block_3_right_label_bottom = "<b>Other</b>-related words";
        block_3_left_label_top   = "Andy";
        block_3_right_label_top  = "John";

        block_4_left_label_bottom  = "<b>Self</b>-related words";
        block_4_right_label_bottom = "<b>Other</b>-related words";
        block_4_left_label_top   = "Andy";
        block_4_right_label_top  = "John";
    break;
  case "John_left":
        self_side_1st               = "left";
        other_side_1st              = "right";
        Andy_side_1st               = "right";
        John_side_1st             = "left";

        self_side_2nd               = "right";
        other_side_2nd              = "left";
        Andy_side_2nd               = "left";
        John_side_2nd             = "right";

        block_1_left_label_bottom  = "<b>Self</b>-related words";
        block_1_right_label_bottom = "<b>Other</b>-related words";
        block_1_left_label_top   = "John";
        block_1_right_label_top  = "Andy";

        block_2_left_label_bottom  = "<b>Self</b>-related words";
        block_2_right_label_bottom = "<b>Other</b>-related words";
        block_2_left_label_top   = "John";
        block_2_right_label_top  = "Andy";

        block_3_left_label_bottom  = "<b>Other</b>-related words";
        block_3_right_label_bottom = "<b>Self</b>-related words";
        block_3_left_label_top   = "Andy";
        block_3_right_label_top  = "John";

        block_4_left_label_bottom  = "<b>Other</b>-related words";
        block_4_right_label_bottom = "<b>Self</b>-related words";
        block_4_left_label_top   = "Andy";
        block_4_right_label_top  = "John";
    break;

  case "John_right":
        self_side_1st               = "right";
        other_side_1st              = "left";
        Andy_side_1st               = "left";
        John_side_1st             = "right";

        self_side_2nd               = "left";
        other_side_2nd              = "right";
        Andy_side_2nd               = "right";
        John_side_2nd             = "left";


        block_1_left_label_bottom  = "<b>Other</b>-related words";
        block_1_right_label_bottom = "<b>Self</b>-related words";
        block_1_left_label_top   = "Andy";
        block_1_right_label_top  = "John";

        block_2_left_label_bottom  = "<b>Other</b>-related words";
        block_2_right_label_bottom = "<b>Self</b>-related words";
        block_2_left_label_top   = "Andy";
        block_2_right_label_top  = "John";

        block_3_left_label_bottom  = "<b>Self</b>-related words";
        block_3_right_label_bottom = "<b>Other</b>-related words";
        block_3_left_label_top   = "John";
        block_3_right_label_top  = "Andy";

        block_4_left_label_bottom  = "<b>Self</b>-related words";
        block_4_right_label_bottom = "<b>Other</b>-related words";
        block_4_left_label_top   = "John";
        block_4_right_label_top  = "Andy";
    break;
}


// To alternate good/bad and black/white trials ---------------------------------------------------------------------
var shuffleIATstims = function (stims) {
    // Alterenate categories blackWhite vs. goodBad
    var n = stims.length / 2;
    var chunkedStims = _.chunk(stims, n);
    var stims1 = jsPsych.randomization.shuffleNoRepeats(chunkedStims[0]);
    var stims2 = jsPsych.randomization.shuffleNoRepeats(chunkedStims[1]);

    var stims12 = stims1.map(function (e, i) { // merge two arrays so that the values alternate
        return [e, stims2[i]];
    });
    var stims21 = stims2.map(function (e, i) {
        return [e, stims1[i]];
    });

    var t = _.sample([stims12, stims21]);
    t = _.flattenDeep(t);

    return t;
};


// iat instructions ---------------------------------------------------------------------
var iat_instructions_1 = {
  type: "html-keyboard-response",
  post_trial_gap: 200,
  stimulus:
    "<h1 class ='custom-title'> Part 2: Categorization task </h1>" +
    "<p class='instructions'>In this task, you will be asked to categorize words, pictures, and names" +
    " as accurately as you can using the keyboard. In the following screen you will be presented" +
    " a list of category labels and the items that belong to each of these categories." +
    "</p>" +
    "<p class='instructions'>As you will see, you will sort the pictures and names of two individuals, Andy and John," +
    " and words depending on whether they refer to the <b>self</b> or to <b>others.</b></p>" +
    "<h3 class='instructions'>Instructions</h3>" +
    "<ul class='instructions'>" +
      "<li>Keep fingers on the <span class='key'>D</span> and <span class='key'>K</span> keys of the keyboard.</li>" +
      "<li>Labels at the top will tell you which items go with each key.</li>" +
      "<li>Be as accurate as you can.</li>" +
    "</ul>" +
    "<p>&nbsp;</p>" +
    "<p class = 'continue-instructions'>Press <span class='key'>space</span>" +
    " to continue.</p>",
  choices: [32]
};

var iat_instructions_1_45_Andy = {
  type: "html-keyboard-response",
  post_trial_gap: 200,
  stimulus:
    "<h1 class ='custom-title'> Part 2: Categorization task </h1>" +
    "<p class='instructions'><center>Here are the four categories and the items belonging to each category. <br>Try to remember which category each item belongs to.</center></p>" +
    "<table>" +
      "<tr>" +
        "<th width='200px'><p font:80>CATEGORY<br><br></p></th>" +
        "<th align='center'><p font:80>ITEM<br><br></p></th>" +
      "</tr>" +
      "<br>" +
      "<tr>" +
        "<td><b>Self</b>-related words:</td>" +
        "<td align='left'>me, &nbsp&nbsp&nbsp&nbsp&nbsp&nbspmine, &nbsp&nbsp&nbsp&nbsp&nbsp&nbspI, &nbsp&nbsp&nbsp&nbsp&nbsp&nbspmyself, &nbsp&nbsp&nbsp&nbsp&nbsp&nbspmy</td>"+
      "</tr>" +
      "<tr>" +
        "<td><br><b>Other</b>-related words:</td>" +
        "<td align='left'><br>others, &nbsp&nbsp&nbsp&nbsp&nbsp&nbspthey, &nbsp&nbsp&nbsp&nbsp&nbsp&nbsptheir, &nbsp&nbsp&nbsp&nbsp&nbsp&nbspshe, &nbsp&nbsp&nbsp&nbsp&nbsp&nbsphe</td>"+
      "</tr>" +
      "<tr>" +
        "<td><br>Andy:<br>(face picture and name in various fonts)</td>" +
        "<td align='left'><br><img height = 100px src='stimuli/Face_45.png'>" +
        "<img height = 50px src='stimuli/Andy_1_instr.jpeg'>" +
        "<img height = 50px src='stimuli/Andy_2_instr.jpeg'>" +
        "<img height = 50px src='stimuli/Andy_3_instr.jpeg'>" +
        "<img height = 50px src='stimuli/Andy_4_instr.jpeg'></td>" +
      "</tr>" +
      "<tr>" +
        "<td><br>John:<br>(face picture and name in various fonts)</td>" +
        "<td align='left'><br><img height = 100px src='stimuli/Face_55.png'>" +
        "<img height = 50px src='stimuli/John_1_instr.jpeg'>" +
        "<img height = 50px src='stimuli/John_2_instr.jpeg'>" +
        "<img height = 50px src='stimuli/John_3_instr.jpeg'>" +
        "<img height = 50px src='stimuli/John_4_instr.jpeg'></td>" +
      "</tr>" +
    "</table>" +
    "<br>" +
    "<p class='instructions'><center>You will perform four categorization blocks of 52 trials each.</center></p>" +
    "<br>" +
    "<p class = 'continue-instructions'>Press <span class='key'>space</span>" +
    " to continue.</p>",
  choices: [32]
};


var iat_instructions_1_55_Andy = {
  type: "html-keyboard-response",
  post_trial_gap: 200,
  stimulus:
    "<h1 class ='custom-title'> Part 2: Categorization task </h1>" +
    "<p class='instructions'><center>Here are the four categories and the items belonging to each category. <br>Try to remember which category each item belongs to.</center></p>" +
    "<table>" +
      "<tr>" +
        "<th width='200px'><p font:80>CATEGORY<br><br></p></th>" +
        "<th align='center'><p font:80>ITEM<br><br></p></th>" +
      "</tr>" +
      "<br>" +
      "<tr>" +
        "<td><b>Self</b>-related words:</td>" +
        "<td align='left'>me, &nbsp&nbsp&nbsp&nbsp&nbsp&nbspmine, &nbsp&nbsp&nbsp&nbsp&nbsp&nbspI, &nbsp&nbsp&nbsp&nbsp&nbsp&nbspmyself, &nbsp&nbsp&nbsp&nbsp&nbsp&nbspmy</td>"+
      "</tr>" +
      "<tr>" +
        "<td><b><br>Other</b>-related words:</td>" +
        "<td align='left'><br>others, &nbsp&nbsp&nbsp&nbsp&nbsp&nbspthey, &nbsp&nbsp&nbsp&nbsp&nbsp&nbsptheir, &nbsp&nbsp&nbsp&nbsp&nbsp&nbspshe, &nbsp&nbsp&nbsp&nbsp&nbsp&nbsphe</td>"+
      "</tr>" +
      "<tr>" +
        "<td><br>Andy:<br>(face picture and name in various fonts)</td>" +
        "<td align='left'><br><img height = 100px src='stimuli/Face_55.png'>" +
        "<img height = 50px src='stimuli/Andy_1_instr.jpeg'>" +
        "<img height = 50px src='stimuli/Andy_2_instr.jpeg'>" +
        "<img height = 50px src='stimuli/Andy_3_instr.jpeg'>" +
        "<img height = 50px src='stimuli/Andy_4_instr.jpeg'></td>" +
      "</tr>" +
      "<tr>" +
        "<td><br>John:<br>(face picture and name in various fonts)</td>" +
        "<td align='left'><br><img height = 100px src='stimuli/Face_45.png'>" +
        "<img height = 50px src='stimuli/John_1_instr.jpeg'>" +
        "<img height = 50px src='stimuli/John_2_instr.jpeg'>" +
        "<img height = 50px src='stimuli/John_3_instr.jpeg'>" +
        "<img height = 50px src='stimuli/John_4_instr.jpeg'></td>" +
      "</tr>" +
    "</table>" +
    "<br>" +
    "<p class='instructions'><center>You will perform four categorization blocks of 52 trials each.</center></p>" +
    "<br>" +
    "<p class = 'continue-instructions'>Press <span class='key'>space</span>" +
    " to continue.</p>",
  choices: [32]
};



// iat block instructions ---------------------------------------------------------------

var iat_instructions_block_1 = {
  type: 'html-keyboard-response',
  post_trial_gap: 200,
  stimulus:
  "<div style='position: absolute; top: 18%; left: 20%'><p>" +
    "Press <span class='key'>D</span> for items relating to:<br> " +
    "<span class='iat-category good-bad'>" + block_1_left_label_top  + "</span>" +
    "<br>" +
    "<span class='iat-category good-bad'>" + block_1_left_label_bottom + "</span>" +
  "</p></div>" +
  "<div style='position: absolute; top: 18%; right: 20%'><p>" +
    "Press <span class='key'>K</span>  for items relating to:<br>" +
    "<span class='iat-category good-bad'>" + block_1_right_label_top + "</span>" +
    "<br>" +
    "<span class='iat-category good-bad'>" + block_1_right_label_bottom  + "</span>" +
  "</p></div>" +
  "<div class='iat-instructions' style='position: relative; top: 42%'> "+
  "<h1 class ='custom-title'> Block 1/4 </h1>" +
    "<p class='instructions'>" +
    "<br>" +
    "Remember, each item belongs to only one group." +
    "</p>" +
    "<p class='instructions'>" +
    "Use the <span class='key'>D</span> and <span class='key'>K</span> keys to categorize " +
    "items into the four groups left and right, and correct errors by hitting the other key." +
    "</p>" +
  "</div> " +
  "<br />" +
  "<br>" +
  "<p class = 'continue-instructions'>Press <span class='key'>space bar</span> when you are ready to start.</p>",
  choices: [32]
};

var iat_instructions_block_2 = {
  type: 'html-keyboard-response',
  post_trial_gap: 200,
  stimulus:
  "<div style='position: absolute; top: 18%; left: 20%'><p>" +
    "Press <span class='key'>D</span> for items relating to:<br> " +
    "<span class='iat-category good-bad'>" + block_2_left_label_top  + "</span>" +
    "<br>" +
    "<span class='iat-category good-bad'>" + block_2_left_label_bottom + "</span>" +
  "</p></div>" +
  "<div style='position: absolute; top: 18%; right: 20%'><p>" +
    "Press <span class='key'>K</span>  for items relating to:<br>" +
    "<span class='iat-category good-bad'>" + block_2_right_label_top + "</span>" +
    "<br>" +
    "<span class='iat-category good-bad'>" + block_2_right_label_bottom  + "</span>" +
  "</p></div>" +
  "<div class='iat-instructions' style='position: relative; top: 42%'> "+
  "<h1 class ='custom-title'> Block 2/4 </h1>" +
    "<p class='instructions'>" +
    "<br>" +
    "Categories have the same position as in Block 1." +
    "</p>" +
    "<p class='instructions'>" +
    "As before, use the <span class='key'>E</span> and <span class='key'>K</span> keys to categorize " +
    "items into the four groups left and right, and correct errors by hitting the other key." +
    "</p>" +
  "</div> " +
  "<br />" +
  "<br>" +
  "<p class = 'continue-instructions'>Press <span class='key'>space bar</span> when you are ready to start.</p>",
  choices: [32]
};

var iat_instructions_block_3 = {
  type: 'html-keyboard-response',
  post_trial_gap: 200,
  stimulus:
  "<div style='position: absolute; top: 18%; left: 20%'><p>" +
    "Press <span class='key'>D</span> for items relating to:<br> " +
    "<span class='iat-category good-bad'>" + block_3_left_label_top  + "</span>" +
    "<br>" +
    "<span class='iat-category good-bad'>" + block_3_left_label_bottom + "</span>" +
  "</p></div>" +
  "<div style='position: absolute; top: 18%; right: 20%'><p>" +
    "Press <span class='key'>K</span>  for items relating to:<br>" +
    "<span class='iat-category good-bad'>" + block_3_right_label_top + "</span>" +
    "<br>" +
    "<span class='iat-category good-bad'>" + block_3_right_label_bottom  + "</span>" +
  "</p></div>" +
  "<div class='iat-instructions' style='position: relative; top: 42%'> "+
  "<h1 class ='custom-title'> Block 3/4 </h1>" +
    "<p class='instructions'>" +
    "<br>" +
    "Categories have changed position!" +
    "</p>" +
    "<p class='instructions'>" +
    "<br>" +
    "As before, use the <span class='key'>D</span> and <span class='key'>K</span> keys to categorize " +
    "items into the four groups left and right, and correct errors by hitting the other key." +
    "</p>" +
  "</div> " +
  "<br />" +
  "<br>" +
  "<p class = 'continue-instructions'>Press <span class='key'>space bar</span> when you are ready to start.</p>",
  choices: [32]
};

var iat_instructions_block_4 = {
  type: 'html-keyboard-response',
  post_trial_gap: 200,
  stimulus:
  "<div style='position: absolute; top: 18%; left: 20%'><p>" +
    "Press <span class='key'>D</span> for items relating to:<br> " +
    "<span class='iat-category good-bad'>" + block_4_left_label_top  + "</span>" +
    "<br>" +
    "<span class='iat-category good-bad'>" + block_4_left_label_bottom + "</span>" +
  "</p></div>" +
  "<div style='position: absolute; top: 18%; right: 20%'><p>" +
    "Press <span class='key'>K</span>  for items relating to:<br>" +
    "<span class='iat-category good-bad'>" + block_4_right_label_top + "</span>" +
    "<br>" +
    "<span class='iat-category good-bad'>" + block_4_right_label_bottom  + "</span>" +
  "</p></div>" +
  "<div class='iat-instructions' style='position: relative; top: 42%'> "+
  "<h1 class ='custom-title'> Block 4/4 </h1>" +
    "<p class='instructions'>" +
    "<br>" +
    "Categories have the same position as in Block 3." +
    "</p>" +
    "<p class='instructions'>" +
    "As before, use the <span class='key'>D</span> and <span class='key'>K</span> keys to categorize " +
    "items into the four groups left and right, and correct errors by hitting the other key." +
    "</p>" +
  "</div> " +
  "<br />" +
  "<br>" +
  "<p class = 'continue-instructions'>Press <span class='key'>space bar</span> when you are ready to start.</p>",
  choices: [32]
};
// iat - stimuli ------------------------------------------------------------------------

//Good-looking, Pretty, Handsome, Gorgeous</td>" +

var iat_stim_block_1_2_Face_45_Andy = [
  {type: 'iat-html', category: "self_other",      stimulus: "me",                  stim_key_association: self_side_1st},
  {type: 'iat-html', category: "self_other",      stimulus: "mine",                stim_key_association: self_side_1st},
  {type: 'iat-html', category: "self_other",      stimulus: "I",                   stim_key_association: self_side_1st},
  {type: 'iat-html', category: "self_other",      stimulus: "myself",              stim_key_association: self_side_1st},
  {type: 'iat-html', category: "self_other",      stimulus: "my",                  stim_key_association: self_side_1st},
  {type: 'iat-html', category: "self_other",      stimulus: "others",              stim_key_association: other_side_1st},
  {type: 'iat-html', category: "self_other",      stimulus: "they",                stim_key_association: other_side_1st},
  {type: 'iat-html', category: "self_other",      stimulus: "their",               stim_key_association: other_side_1st},
  {type: 'iat-html', category: "self_other",      stimulus: "she",                 stim_key_association: other_side_1st},
  {type: 'iat-html', category: "self_other",      stimulus: "he",                  stim_key_association: other_side_1st},
  {type: 'iat-image', category: "andy_John", stimulus: 'stimuli/Face_45.png',              stim_key_association: Andy_side_1st},
  {type: 'iat-image', category: "andy_John", stimulus: 'stimuli/Face_45.png',              stim_key_association: Andy_side_1st},
  {type: 'iat-image', category: "andy_John", stimulus: 'stimuli/Face_45.png',              stim_key_association: Andy_side_1st},
  {type: 'iat-image', category: "andy_John", stimulus: 'stimuli/Face_45.png',              stim_key_association: Andy_side_1st},
  {type: 'iat-image', category: "andy_John", stimulus: 'stimuli/Andy_1.jpeg',              stim_key_association: Andy_side_1st},
  {type: 'iat-image', category: "andy_John", stimulus: 'stimuli/Andy_2.jpeg',              stim_key_association: Andy_side_1st},
  {type: 'iat-image', category: "andy_John", stimulus: 'stimuli/Andy_3.jpeg',              stim_key_association: Andy_side_1st},
  {type: 'iat-image', category: "andy_John", stimulus: 'stimuli/Andy_4.jpeg',              stim_key_association: Andy_side_1st},
  {type: 'iat-image', category: "andy_John", stimulus: 'stimuli/Face_55.png',              stim_key_association: John_side_1st},
  {type: 'iat-image', category: "andy_John", stimulus: 'stimuli/Face_55.png',              stim_key_association: John_side_1st},
  {type: 'iat-image', category: "andy_John", stimulus: 'stimuli/Face_55.png',              stim_key_association: John_side_1st},
  {type: 'iat-image', category: "andy_John", stimulus: 'stimuli/Face_55.png',              stim_key_association: John_side_1st},
  {type: 'iat-image', category: "andy_John", stimulus: 'stimuli/John_1.jpeg',              stim_key_association: John_side_1st},
  {type: 'iat-image', category: "andy_John", stimulus: 'stimuli/John_2.jpeg',              stim_key_association: John_side_1st},
  {type: 'iat-image', category: "andy_John", stimulus: 'stimuli/John_3.jpeg',              stim_key_association: John_side_1st},
  {type: 'iat-image', category: "andy_John", stimulus: 'stimuli/John_4.jpeg',              stim_key_association: John_side_1st},
  {type: 'iat-html', category: "self_other",      stimulus: "me",                  stim_key_association: self_side_1st},
  {type: 'iat-html', category: "self_other",      stimulus: "mine",                stim_key_association: self_side_1st},
  {type: 'iat-html', category: "self_other",      stimulus: "I",                   stim_key_association: self_side_1st},
  {type: 'iat-html', category: "self_other",      stimulus: "myself",              stim_key_association: self_side_1st},
  {type: 'iat-html', category: "self_other",      stimulus: "my",                  stim_key_association: self_side_1st},
  {type: 'iat-html', category: "self_other",      stimulus: "others",              stim_key_association: other_side_1st},
  {type: 'iat-html', category: "self_other",      stimulus: "they",                stim_key_association: other_side_1st},
  {type: 'iat-html', category: "self_other",      stimulus: "their",               stim_key_association: other_side_1st},
  {type: 'iat-html', category: "self_other",      stimulus: "she",                 stim_key_association: other_side_1st},
  {type: 'iat-html', category: "self_other",      stimulus: "he",                  stim_key_association: other_side_1st},
  {type: 'iat-image', category: "andy_John", stimulus: 'stimuli/Face_45.png',              stim_key_association: Andy_side_1st},
  {type: 'iat-image', category: "andy_John", stimulus: 'stimuli/Face_45.png',              stim_key_association: Andy_side_1st},
  {type: 'iat-image', category: "andy_John", stimulus: 'stimuli/Face_45.png',              stim_key_association: Andy_side_1st},
  {type: 'iat-image', category: "andy_John", stimulus: 'stimuli/Face_45.png',              stim_key_association: Andy_side_1st},
  {type: 'iat-image', category: "andy_John", stimulus: 'stimuli/Andy_1.jpeg',              stim_key_association: Andy_side_1st},
  {type: 'iat-image', category: "andy_John", stimulus: 'stimuli/Andy_2.jpeg',              stim_key_association: Andy_side_1st},
  {type: 'iat-image', category: "andy_John", stimulus: 'stimuli/Andy_3.jpeg',              stim_key_association: Andy_side_1st},
  {type: 'iat-image', category: "andy_John", stimulus: 'stimuli/Andy_4.jpeg',              stim_key_association: Andy_side_1st},
  {type: 'iat-image', category: "andy_John", stimulus: 'stimuli/Face_55.png',              stim_key_association: John_side_1st},
  {type: 'iat-image', category: "andy_John", stimulus: 'stimuli/Face_55.png',              stim_key_association: John_side_1st},
  {type: 'iat-image', category: "andy_John", stimulus: 'stimuli/Face_55.png',              stim_key_association: John_side_1st},
  {type: 'iat-image', category: "andy_John", stimulus: 'stimuli/Face_55.png',              stim_key_association: John_side_1st},
  {type: 'iat-image', category: "andy_John", stimulus: 'stimuli/John_1.jpeg',              stim_key_association: John_side_1st},
  {type: 'iat-image', category: "andy_John", stimulus: 'stimuli/John_2.jpeg',              stim_key_association: John_side_1st},
  {type: 'iat-image', category: "andy_John", stimulus: 'stimuli/John_3.jpeg',              stim_key_association: John_side_1st},
  {type: 'iat-image', category: "andy_John", stimulus: 'stimuli/John_4.jpeg',              stim_key_association: John_side_1st}
]

var iat_stim_block_1_2_Face_55_Andy = [
  {type: 'iat-html', category: "self_other",      stimulus: "me",                  stim_key_association: self_side_1st},
  {type: 'iat-html', category: "self_other",      stimulus: "mine",                stim_key_association: self_side_1st},
  {type: 'iat-html', category: "self_other",      stimulus: "I",                   stim_key_association: self_side_1st},
  {type: 'iat-html', category: "self_other",      stimulus: "myself",              stim_key_association: self_side_1st},
  {type: 'iat-html', category: "self_other",      stimulus: "my",                  stim_key_association: self_side_1st},
  {type: 'iat-html', category: "self_other",      stimulus: "others",              stim_key_association: other_side_1st},
  {type: 'iat-html', category: "self_other",      stimulus: "they",                stim_key_association: other_side_1st},
  {type: 'iat-html', category: "self_other",      stimulus: "their",               stim_key_association: other_side_1st},
  {type: 'iat-html', category: "self_other",      stimulus: "she",                 stim_key_association: other_side_1st},
  {type: 'iat-html', category: "self_other",      stimulus: "he",                  stim_key_association: other_side_1st},
  {type: 'iat-image', category: "andy_John", stimulus: 'stimuli/Face_55.png',              stim_key_association: Andy_side_1st},
  {type: 'iat-image', category: "andy_John", stimulus: 'stimuli/Face_55.png',              stim_key_association: Andy_side_1st},
  {type: 'iat-image', category: "andy_John", stimulus: 'stimuli/Face_55.png',              stim_key_association: Andy_side_1st},
  {type: 'iat-image', category: "andy_John", stimulus: 'stimuli/Face_55.png',              stim_key_association: Andy_side_1st},
  {type: 'iat-image', category: "andy_John", stimulus: 'stimuli/Andy_1.jpeg',              stim_key_association: Andy_side_1st},
  {type: 'iat-image', category: "andy_John", stimulus: 'stimuli/Andy_2.jpeg',              stim_key_association: Andy_side_1st},
  {type: 'iat-image', category: "andy_John", stimulus: 'stimuli/Andy_3.jpeg',              stim_key_association: Andy_side_1st},
  {type: 'iat-image', category: "andy_John", stimulus: 'stimuli/Andy_4.jpeg',              stim_key_association: Andy_side_1st},
  {type: 'iat-image', category: "andy_John", stimulus: 'stimuli/Face_45.png',              stim_key_association: John_side_1st},
  {type: 'iat-image', category: "andy_John", stimulus: 'stimuli/Face_45.png',              stim_key_association: John_side_1st},
  {type: 'iat-image', category: "andy_John", stimulus: 'stimuli/Face_45.png',              stim_key_association: John_side_1st},
  {type: 'iat-image', category: "andy_John", stimulus: 'stimuli/Face_45.png',              stim_key_association: John_side_1st},
  {type: 'iat-image', category: "andy_John", stimulus: 'stimuli/John_1.jpeg',              stim_key_association: John_side_1st},
  {type: 'iat-image', category: "andy_John", stimulus: 'stimuli/John_2.jpeg',              stim_key_association: John_side_1st},
  {type: 'iat-image', category: "andy_John", stimulus: 'stimuli/John_3.jpeg',              stim_key_association: John_side_1st},
  {type: 'iat-image', category: "andy_John", stimulus: 'stimuli/John_4.jpeg',              stim_key_association: John_side_1st},
  {type: 'iat-html', category: "self_other",      stimulus: "me",                  stim_key_association: self_side_1st},
  {type: 'iat-html', category: "self_other",      stimulus: "mine",                stim_key_association: self_side_1st},
  {type: 'iat-html', category: "self_other",      stimulus: "I",                   stim_key_association: self_side_1st},
  {type: 'iat-html', category: "self_other",      stimulus: "myself",              stim_key_association: self_side_1st},
  {type: 'iat-html', category: "self_other",      stimulus: "my",                  stim_key_association: self_side_1st},
  {type: 'iat-html', category: "self_other",      stimulus: "others",              stim_key_association: other_side_1st},
  {type: 'iat-html', category: "self_other",      stimulus: "they",                stim_key_association: other_side_1st},
  {type: 'iat-html', category: "self_other",      stimulus: "their",               stim_key_association: other_side_1st},
  {type: 'iat-html', category: "self_other",      stimulus: "she",                 stim_key_association: other_side_1st},
  {type: 'iat-html', category: "self_other",      stimulus: "he",                  stim_key_association: other_side_1st},
  {type: 'iat-image', category: "andy_John", stimulus: 'stimuli/Face_55.png',              stim_key_association: Andy_side_1st},
  {type: 'iat-image', category: "andy_John", stimulus: 'stimuli/Face_55.png',              stim_key_association: Andy_side_1st},
  {type: 'iat-image', category: "andy_John", stimulus: 'stimuli/Face_55.png',              stim_key_association: Andy_side_1st},
  {type: 'iat-image', category: "andy_John", stimulus: 'stimuli/Face_55.png',              stim_key_association: Andy_side_1st},
  {type: 'iat-image', category: "andy_John", stimulus: 'stimuli/Andy_1.jpeg',              stim_key_association: Andy_side_1st},
  {type: 'iat-image', category: "andy_John", stimulus: 'stimuli/Andy_2.jpeg',              stim_key_association: Andy_side_1st},
  {type: 'iat-image', category: "andy_John", stimulus: 'stimuli/Andy_3.jpeg',              stim_key_association: Andy_side_1st},
  {type: 'iat-image', category: "andy_John", stimulus: 'stimuli/Andy_4.jpeg',              stim_key_association: Andy_side_1st},
  {type: 'iat-image', category: "andy_John", stimulus: 'stimuli/Face_45.png',              stim_key_association: John_side_1st},
  {type: 'iat-image', category: "andy_John", stimulus: 'stimuli/Face_45.png',              stim_key_association: John_side_1st},
  {type: 'iat-image', category: "andy_John", stimulus: 'stimuli/Face_45.png',              stim_key_association: John_side_1st},
  {type: 'iat-image', category: "andy_John", stimulus: 'stimuli/Face_45.png',              stim_key_association: John_side_1st},
  {type: 'iat-image', category: "andy_John", stimulus: 'stimuli/John_1.jpeg',              stim_key_association: John_side_1st},
  {type: 'iat-image', category: "andy_John", stimulus: 'stimuli/John_2.jpeg',              stim_key_association: John_side_1st},
  {type: 'iat-image', category: "andy_John", stimulus: 'stimuli/John_3.jpeg',              stim_key_association: John_side_1st},
  {type: 'iat-image', category: "andy_John", stimulus: 'stimuli/John_4.jpeg',              stim_key_association: John_side_1st},
]

var iat_stim_block_3_4_Face_45_Andy = [
  {type: 'iat-html', category: "self_other",      stimulus: "me",                  stim_key_association: self_side_2nd},
  {type: 'iat-html', category: "self_other",      stimulus: "mine",                stim_key_association: self_side_2nd},
  {type: 'iat-html', category: "self_other",      stimulus: "I",                   stim_key_association: self_side_2nd},
  {type: 'iat-html', category: "self_other",      stimulus: "myself",              stim_key_association: self_side_2nd},
  {type: 'iat-html', category: "self_other",      stimulus: "my",                  stim_key_association: self_side_2nd},
  {type: 'iat-html', category: "self_other",      stimulus: "others",              stim_key_association: other_side_2nd},
  {type: 'iat-html', category: "self_other",      stimulus: "they",                stim_key_association: other_side_2nd},
  {type: 'iat-html', category: "self_other",      stimulus: "their",               stim_key_association: other_side_2nd},
  {type: 'iat-html', category: "self_other",      stimulus: "she",                 stim_key_association: other_side_2nd},
  {type: 'iat-html', category: "self_other",      stimulus: "he",                  stim_key_association: other_side_2nd},
  {type: 'iat-image', category: "andy_John", stimulus: 'stimuli/Face_45.png',              stim_key_association: Andy_side_2nd},
  {type: 'iat-image', category: "andy_John", stimulus: 'stimuli/Face_45.png',              stim_key_association: Andy_side_2nd},
  {type: 'iat-image', category: "andy_John", stimulus: 'stimuli/Face_45.png',              stim_key_association: Andy_side_2nd},
  {type: 'iat-image', category: "andy_John", stimulus: 'stimuli/Face_45.png',              stim_key_association: Andy_side_2nd},
  {type: 'iat-image', category: "andy_John", stimulus: 'stimuli/Andy_1.jpeg',              stim_key_association: Andy_side_2nd},
  {type: 'iat-image', category: "andy_John", stimulus: 'stimuli/Andy_2.jpeg',              stim_key_association: Andy_side_2nd},
  {type: 'iat-image', category: "andy_John", stimulus: 'stimuli/Andy_3.jpeg',              stim_key_association: Andy_side_2nd},
  {type: 'iat-image', category: "andy_John", stimulus: 'stimuli/Andy_4.jpeg',              stim_key_association: Andy_side_2nd},
  {type: 'iat-image', category: "andy_John", stimulus: 'stimuli/Face_55.png',              stim_key_association: John_side_2nd},
  {type: 'iat-image', category: "andy_John", stimulus: 'stimuli/Face_55.png',              stim_key_association: John_side_2nd},
  {type: 'iat-image', category: "andy_John", stimulus: 'stimuli/Face_55.png',              stim_key_association: John_side_2nd},
  {type: 'iat-image', category: "andy_John", stimulus: 'stimuli/Face_55.png',              stim_key_association: John_side_2nd},
  {type: 'iat-image', category: "andy_John", stimulus: 'stimuli/John_1.jpeg',              stim_key_association: John_side_2nd},
  {type: 'iat-image', category: "andy_John", stimulus: 'stimuli/John_2.jpeg',              stim_key_association: John_side_2nd},
  {type: 'iat-image', category: "andy_John", stimulus: 'stimuli/John_3.jpeg',              stim_key_association: John_side_2nd},
  {type: 'iat-image', category: "andy_John", stimulus: 'stimuli/John_4.jpeg',              stim_key_association: John_side_2nd},
  {type: 'iat-html', category: "self_other",      stimulus: "me",                  stim_key_association: self_side_2nd},
  {type: 'iat-html', category: "self_other",      stimulus: "mine",                stim_key_association: self_side_2nd},
  {type: 'iat-html', category: "self_other",      stimulus: "I",                   stim_key_association: self_side_2nd},
  {type: 'iat-html', category: "self_other",      stimulus: "myself",              stim_key_association: self_side_2nd},
  {type: 'iat-html', category: "self_other",      stimulus: "my",                  stim_key_association: self_side_2nd},
  {type: 'iat-html', category: "self_other",      stimulus: "others",              stim_key_association: other_side_2nd},
  {type: 'iat-html', category: "self_other",      stimulus: "they",                stim_key_association: other_side_2nd},
  {type: 'iat-html', category: "self_other",      stimulus: "their",               stim_key_association: other_side_2nd},
  {type: 'iat-html', category: "self_other",      stimulus: "she",                 stim_key_association: other_side_2nd},
  {type: 'iat-html', category: "self_other",      stimulus: "he",                  stim_key_association: other_side_2nd},
  {type: 'iat-image', category: "andy_John", stimulus: 'stimuli/Face_45.png',              stim_key_association: Andy_side_2nd},
  {type: 'iat-image', category: "andy_John", stimulus: 'stimuli/Face_45.png',              stim_key_association: Andy_side_2nd},
  {type: 'iat-image', category: "andy_John", stimulus: 'stimuli/Face_45.png',              stim_key_association: Andy_side_2nd},
  {type: 'iat-image', category: "andy_John", stimulus: 'stimuli/Face_45.png',              stim_key_association: Andy_side_2nd},
  {type: 'iat-image', category: "andy_John", stimulus: 'stimuli/Andy_1.jpeg',              stim_key_association: Andy_side_2nd},
  {type: 'iat-image', category: "andy_John", stimulus: 'stimuli/Andy_2.jpeg',              stim_key_association: Andy_side_2nd},
  {type: 'iat-image', category: "andy_John", stimulus: 'stimuli/Andy_3.jpeg',              stim_key_association: Andy_side_2nd},
  {type: 'iat-image', category: "andy_John", stimulus: 'stimuli/Andy_4.jpeg',              stim_key_association: Andy_side_2nd},
  {type: 'iat-image', category: "andy_John", stimulus: 'stimuli/Face_55.png',              stim_key_association: John_side_2nd},
  {type: 'iat-image', category: "andy_John", stimulus: 'stimuli/Face_55.png',              stim_key_association: John_side_2nd},
  {type: 'iat-image', category: "andy_John", stimulus: 'stimuli/Face_55.png',              stim_key_association: John_side_2nd},
  {type: 'iat-image', category: "andy_John", stimulus: 'stimuli/Face_55.png',              stim_key_association: John_side_2nd},
  {type: 'iat-image', category: "andy_John", stimulus: 'stimuli/John_1.jpeg',              stim_key_association: John_side_2nd},
  {type: 'iat-image', category: "andy_John", stimulus: 'stimuli/John_2.jpeg',              stim_key_association: John_side_2nd},
  {type: 'iat-image', category: "andy_John", stimulus: 'stimuli/John_3.jpeg',              stim_key_association: John_side_2nd},
  {type: 'iat-image', category: "andy_John", stimulus: 'stimuli/John_4.jpeg',              stim_key_association: John_side_2nd}
]

var iat_stim_block_3_4_Face_55_Andy = [
  {type: 'iat-html', category: "self_other",      stimulus: "me",                  stim_key_association: self_side_2nd},
  {type: 'iat-html', category: "self_other",      stimulus: "mine",                stim_key_association: self_side_2nd},
  {type: 'iat-html', category: "self_other",      stimulus: "I",                   stim_key_association: self_side_2nd},
  {type: 'iat-html', category: "self_other",      stimulus: "myself",              stim_key_association: self_side_2nd},
  {type: 'iat-html', category: "self_other",      stimulus: "my",                  stim_key_association: self_side_2nd},
  {type: 'iat-html', category: "self_other",      stimulus: "others",              stim_key_association: other_side_2nd},
  {type: 'iat-html', category: "self_other",      stimulus: "they",                stim_key_association: other_side_2nd},
  {type: 'iat-html', category: "self_other",      stimulus: "their",               stim_key_association: other_side_2nd},
  {type: 'iat-html', category: "self_other",      stimulus: "she",                 stim_key_association: other_side_2nd},
  {type: 'iat-html', category: "self_other",      stimulus: "he",                  stim_key_association: other_side_2nd},
  {type: 'iat-image', category: "andy_John", stimulus: 'stimuli/Face_55.png',              stim_key_association: Andy_side_2nd},
  {type: 'iat-image', category: "andy_John", stimulus: 'stimuli/Face_55.png',              stim_key_association: Andy_side_2nd},
  {type: 'iat-image', category: "andy_John", stimulus: 'stimuli/Face_55.png',              stim_key_association: Andy_side_2nd},
  {type: 'iat-image', category: "andy_John", stimulus: 'stimuli/Face_55.png',              stim_key_association: Andy_side_2nd},
  {type: 'iat-image', category: "andy_John", stimulus: 'stimuli/Andy_1.jpeg',              stim_key_association: Andy_side_2nd},
  {type: 'iat-image', category: "andy_John", stimulus: 'stimuli/Andy_2.jpeg',              stim_key_association: Andy_side_2nd},
  {type: 'iat-image', category: "andy_John", stimulus: 'stimuli/Andy_3.jpeg',              stim_key_association: Andy_side_2nd},
  {type: 'iat-image', category: "andy_John", stimulus: 'stimuli/Andy_4.jpeg',              stim_key_association: Andy_side_2nd},
  {type: 'iat-image', category: "andy_John", stimulus: 'stimuli/Face_45.png',              stim_key_association: John_side_2nd},
  {type: 'iat-image', category: "andy_John", stimulus: 'stimuli/Face_45.png',              stim_key_association: John_side_2nd},
  {type: 'iat-image', category: "andy_John", stimulus: 'stimuli/Face_45.png',              stim_key_association: John_side_2nd},
  {type: 'iat-image', category: "andy_John", stimulus: 'stimuli/Face_45.png',              stim_key_association: John_side_2nd},
  {type: 'iat-image', category: "andy_John", stimulus: 'stimuli/John_1.jpeg',              stim_key_association: John_side_2nd},
  {type: 'iat-image', category: "andy_John", stimulus: 'stimuli/John_2.jpeg',              stim_key_association: John_side_2nd},
  {type: 'iat-image', category: "andy_John", stimulus: 'stimuli/John_3.jpeg',              stim_key_association: John_side_2nd},
  {type: 'iat-image', category: "andy_John", stimulus: 'stimuli/John_4.jpeg',              stim_key_association: John_side_2nd},
  {type: 'iat-html', category: "self_other",      stimulus: "me",                  stim_key_association: self_side_2nd},
  {type: 'iat-html', category: "self_other",      stimulus: "mine",                stim_key_association: self_side_2nd},
  {type: 'iat-html', category: "self_other",      stimulus: "I",                   stim_key_association: self_side_2nd},
  {type: 'iat-html', category: "self_other",      stimulus: "myself",              stim_key_association: self_side_2nd},
  {type: 'iat-html', category: "self_other",      stimulus: "my",                  stim_key_association: self_side_2nd},
  {type: 'iat-html', category: "self_other",      stimulus: "others",              stim_key_association: other_side_2nd},
  {type: 'iat-html', category: "self_other",      stimulus: "they",                stim_key_association: other_side_2nd},
  {type: 'iat-html', category: "self_other",      stimulus: "their",               stim_key_association: other_side_2nd},
  {type: 'iat-html', category: "self_other",      stimulus: "she",                 stim_key_association: other_side_2nd},
  {type: 'iat-html', category: "self_other",      stimulus: "he",                  stim_key_association: other_side_2nd},
  {type: 'iat-image', category: "andy_John", stimulus: 'stimuli/Face_55.png',              stim_key_association: Andy_side_2nd},
  {type: 'iat-image', category: "andy_John", stimulus: 'stimuli/Face_55.png',              stim_key_association: Andy_side_2nd},
  {type: 'iat-image', category: "andy_John", stimulus: 'stimuli/Face_55.png',              stim_key_association: Andy_side_2nd},
  {type: 'iat-image', category: "andy_John", stimulus: 'stimuli/Face_55.png',              stim_key_association: Andy_side_2nd},
  {type: 'iat-image', category: "andy_John", stimulus: 'stimuli/Andy_1.jpeg',              stim_key_association: Andy_side_2nd},
  {type: 'iat-image', category: "andy_John", stimulus: 'stimuli/Andy_2.jpeg',              stim_key_association: Andy_side_2nd},
  {type: 'iat-image', category: "andy_John", stimulus: 'stimuli/Andy_3.jpeg',              stim_key_association: Andy_side_2nd},
  {type: 'iat-image', category: "andy_John", stimulus: 'stimuli/Andy_4.jpeg',              stim_key_association: Andy_side_2nd},
  {type: 'iat-image', category: "andy_John", stimulus: 'stimuli/Face_45.png',              stim_key_association: John_side_2nd},
  {type: 'iat-image', category: "andy_John", stimulus: 'stimuli/Face_45.png',              stim_key_association: John_side_2nd},
  {type: 'iat-image', category: "andy_John", stimulus: 'stimuli/Face_45.png',              stim_key_association: John_side_2nd},
  {type: 'iat-image', category: "andy_John", stimulus: 'stimuli/Face_45.png',              stim_key_association: John_side_2nd},
  {type: 'iat-image', category: "andy_John", stimulus: 'stimuli/John_1.jpeg',              stim_key_association: John_side_2nd},
  {type: 'iat-image', category: "andy_John", stimulus: 'stimuli/John_2.jpeg',              stim_key_association: John_side_2nd},
  {type: 'iat-image', category: "andy_John", stimulus: 'stimuli/John_3.jpeg',              stim_key_association: John_side_2nd},
  {type: 'iat-image', category: "andy_John", stimulus: 'stimuli/John_4.jpeg',              stim_key_association: John_side_2nd}
]

// iat - block 3 (test) -----------------------------------------------------------------orginally 74 trials over 8 stim
var iat_block_1_Face_45_Andy = {
  timeline: [
    {
      type: jsPsych.timelineVariable('type'),
      stimulus: jsPsych.timelineVariable('stimulus'),
      category: jsPsych.timelineVariable('category'),
      label_category: ['self_other', 'andy_John'],
      stim_key_association: jsPsych.timelineVariable('stim_key_association'),
      html_when_wrong: '<span style="color: red; font-size: 80px">&times;</span>',
      force_correct_key_press: true,
      display_feedback: true,
      left_category_label:  [block_1_left_label_top, block_1_left_label_bottom],
      right_category_label: [block_1_right_label_top, block_1_right_label_bottom],
      response_ends_trial: true,
      data: {
        iat_type: 'test',
        iat_block: 1,
        iat_label_left:  block_1_left_label_top  + "-" + block_1_left_label_bottom,
        iat_label_right: block_1_right_label_top + "-" + block_1_right_label_bottom
         }
    },
    save_iat_trial
  ],
  timeline_variables: shuffleIATstims(iat_stim_block_1_2_Face_45_Andy)
}

var iat_block_2_Face_45_Andy = {
  timeline: [
    {
      type: jsPsych.timelineVariable('type'),
      stimulus: jsPsych.timelineVariable('stimulus'),
      category: jsPsych.timelineVariable('category'),
      label_category: ['self_other', 'andy_John'],
      stim_key_association: jsPsych.timelineVariable('stim_key_association'),
      html_when_wrong: '<span style="color: red; font-size: 80px">&times;</span>',
      force_correct_key_press: true,
      display_feedback: true,
      left_category_label:  [block_2_left_label_top, block_2_left_label_bottom],
      right_category_label: [block_2_right_label_top, block_2_right_label_bottom],
      response_ends_trial: true,
      data: {
        iat_type: 'test',
        iat_block: 2,
        iat_label_left:  block_2_left_label_top  + "-" + block_2_left_label_bottom,
        iat_label_right: block_2_right_label_top + "-" + block_2_right_label_bottom
         }
    },
    save_iat_trial
  ],
  timeline_variables: shuffleIATstims(iat_stim_block_1_2_Face_45_Andy)
}

var iat_block_3_Face_45_Andy = {
  timeline: [
    {
      type: jsPsych.timelineVariable('type'),
      stimulus: jsPsych.timelineVariable('stimulus'),
      category: jsPsych.timelineVariable('category'),
      label_category: ['self_other', 'andy_John'],
      stim_key_association: jsPsych.timelineVariable('stim_key_association'),
      html_when_wrong: '<span style="color: red; font-size: 80px">&times;</span>',
      force_correct_key_press: true,
      display_feedback: true,
      left_category_label:  [block_3_left_label_top, block_3_left_label_bottom],
      right_category_label: [block_3_right_label_top, block_3_right_label_bottom],
      response_ends_trial: true,
      data: {
        iat_type: 'test',
        iat_block: 3,
        iat_label_left:  block_3_left_label_top  + "-" + block_3_left_label_bottom,
        iat_label_right: block_3_right_label_top + "-" + block_3_right_label_bottom
         }
    },
    save_iat_trial
  ],
  timeline_variables: shuffleIATstims(iat_stim_block_3_4_Face_45_Andy)
}

var iat_block_4_Face_45_Andy = {
  timeline: [
    {
      type: jsPsych.timelineVariable('type'),
      stimulus: jsPsych.timelineVariable('stimulus'),
      category: jsPsych.timelineVariable('category'),
      label_category: ['self_other', 'andy_John'],
      stim_key_association: jsPsych.timelineVariable('stim_key_association'),
      html_when_wrong: '<span style="color: red; font-size: 80px">&times;</span>',
      force_correct_key_press: true,
      display_feedback: true,
      left_category_label:  [block_4_left_label_top, block_4_left_label_bottom],
      right_category_label: [block_4_right_label_top, block_4_right_label_bottom],
      response_ends_trial: true,
      data: {
        iat_type: 'test',
        iat_block: 4,
        iat_label_left:  block_3_left_label_top  + "-" + block_4_left_label_bottom,
        iat_label_right: block_3_right_label_top + "-" + block_4_right_label_bottom
         }
    },
    save_iat_trial
  ],
  timeline_variables: shuffleIATstims(iat_stim_block_3_4_Face_45_Andy)
}


var iat_block_1_Face_55_Andy = {
  timeline: [
    {
      type: jsPsych.timelineVariable('type'),
      stimulus: jsPsych.timelineVariable('stimulus'),
      category: jsPsych.timelineVariable('category'),
      label_category: ['self_other', 'andy_John'],
      stim_key_association: jsPsych.timelineVariable('stim_key_association'),
      html_when_wrong: '<span style="color: red; font-size: 80px">&times;</span>',
      force_correct_key_press: true,
      display_feedback: true,
      left_category_label:  [block_1_left_label_top, block_1_left_label_bottom],
      right_category_label: [block_1_right_label_top, block_1_right_label_bottom],
      response_ends_trial: true,
      data: {
        iat_type: 'test',
        iat_block: 1,
        iat_label_left:  block_1_left_label_top  + "-" + block_1_left_label_bottom,
        iat_label_right: block_1_right_label_top + "-" + block_1_right_label_bottom
         }
    },
    save_iat_trial
  ],
  timeline_variables: shuffleIATstims(iat_stim_block_1_2_Face_55_Andy)
}
 
var iat_block_2_Face_55_Andy = {
  timeline: [
    {
      type: jsPsych.timelineVariable('type'),
      stimulus: jsPsych.timelineVariable('stimulus'),
      category: jsPsych.timelineVariable('category'),
      label_category: ['self_other', 'andy_John'],
      stim_key_association: jsPsych.timelineVariable('stim_key_association'),
      html_when_wrong: '<span style="color: red; font-size: 80px">&times;</span>',
      force_correct_key_press: true,
      display_feedback: true,
      left_category_label:  [block_2_left_label_top, block_2_left_label_bottom],
      right_category_label: [block_2_right_label_top, block_2_right_label_bottom],
      response_ends_trial: true,
      data: {
        iat_type: 'test',
        iat_block: 2,
        iat_label_left:  block_2_left_label_top  + "-" + block_2_left_label_bottom,
        iat_label_right: block_2_right_label_top + "-" + block_2_right_label_bottom
         }
    },
    save_iat_trial
  ],
  timeline_variables: shuffleIATstims(iat_stim_block_1_2_Face_55_Andy)
}

var iat_block_3_Face_55_Andy = {
  timeline: [
    {
      type: jsPsych.timelineVariable('type'),
      stimulus: jsPsych.timelineVariable('stimulus'),
      category: jsPsych.timelineVariable('category'),
      label_category: ['self_other', 'andy_John'],
      stim_key_association: jsPsych.timelineVariable('stim_key_association'),
      html_when_wrong: '<span style="color: red; font-size: 80px">&times;</span>',
      force_correct_key_press: true,
      display_feedback: true,
      left_category_label:  [block_3_left_label_top, block_3_left_label_bottom],
      right_category_label: [block_3_right_label_top, block_3_right_label_bottom],
      response_ends_trial: true,
      data: {
        iat_type: 'test',
        iat_block: 3,
        iat_label_left:  block_3_left_label_top  + "-" + block_3_left_label_bottom,
        iat_label_right: block_3_right_label_top + "-" + block_3_right_label_bottom
         }
    },
    save_iat_trial
  ],
  timeline_variables: shuffleIATstims(iat_stim_block_3_4_Face_55_Andy)
}

var iat_block_4_Face_55_Andy = {
  timeline: [
    {
      type: jsPsych.timelineVariable('type'),
      stimulus: jsPsych.timelineVariable('stimulus'),
      category: jsPsych.timelineVariable('category'),
      label_category: ['self_other', 'andy_John'],
      stim_key_association: jsPsych.timelineVariable('stim_key_association'),
      html_when_wrong: '<span style="color: red; font-size: 80px">&times;</span>',
      force_correct_key_press: true,
      display_feedback: true,
      left_category_label:  [block_4_left_label_top, block_4_left_label_bottom],
      right_category_label: [block_4_right_label_top, block_4_right_label_bottom],
      response_ends_trial: true,
      data: {
        iat_type: 'test',
        iat_block: 4,
        iat_label_left:  block_3_left_label_top  + "-" + block_4_left_label_bottom,
        iat_label_right: block_3_right_label_top + "-" + block_4_right_label_bottom
         }
    },
    save_iat_trial
  ],
  timeline_variables: shuffleIATstims(iat_stim_block_3_4_Face_55_Andy)
}

//
var iat_instructions_2 = {
  type: "html-keyboard-response",
  post_trial_gap: 200,
  stimulus:
    "<p><center>Part 2 is over.</center></p>" +
    "<br>" +
    "<p class = 'continue-instructions'>Press <strong>space</strong> to continue to the last part of the study.</p>",
  choices: [32]
};

// Rating of andy and John -----------------------------------------------------------------------------------
var Rating_instructions_1 = {
  type: "html-keyboard-response",
  post_trial_gap: 200,
  stimulus:
    "<h1 class ='custom-title'> Part 3: Rating of Andy and John </h1>" +
    "<p class='instructions'>You should know that <b>the two persons</b> that you saw in the categorization task"+
    " (Andy and John)" +
    " are in fact <b>very different from each other. Indeed, Andy and John have a very different personalities and typically"+
    " behave in very different ways.</br></br>"+
    " Your task is to evaluate Andy and John on the same series of traits as in Part 1."+
    " It is extremely important that you try to answer <b> as honestly and as spontaneously as possible.</b> There are no good or" +
    " bad answers. You just have to respond <b>as intuitively as possible. </b></br></br>"+
    "</p>" +
    "<p class = 'continue-instructions'>Press <span class='key'>space</span>" +
    " to continue.</p>",
  choices: [32]
};


var rating_Andy_45Andy = {
        type: 'survey-likert',
        post_trial_gap: 200,
        preamble: "<br><br><img class='imgBack' src='stimuli/Face_45_Andy.jpeg'><br><br><br>",
        questions: [
          {prompt: "<b>Tends to be quiet.</b>", labels: scale_questionnaire, required: true},
          {prompt: "<b>Is compassionate, has a soft heart.</b>", labels: scale_questionnaire, required: true},
          {prompt: "<b>Tends to be disorganized.</b>", labels: scale_questionnaire, required: true},
          {prompt: "<b>Worries a lot.</b>", labels: scale_questionnaire, required: true},
          {prompt: "<b>Is fascinated by art, music, or literature.</b>", labels: scale_questionnaire, required: true},
          {prompt: "<b>Is dominant, acts as a leader.</b>", labels: scale_questionnaire, required: true},
          {prompt: "<b>Is sometimes rude to others.</b>", labels: scale_questionnaire, required: true},
          {prompt: "<b>Has difficulty getting started on tasks.</b>", labels: scale_questionnaire, required: true},
          {prompt: "<b>Tends to feel depressed, blue.</b>", labels: scale_questionnaire, required: true},
          {prompt: "<b>Has little interest in abstract ideas.</b>", labels: scale_questionnaire, required: true},
          {prompt: "<b>Is full of energy.</b>", labels: scale_questionnaire, required: true},
          {prompt: "<b>Assumes the best about people.</b>", labels: scale_questionnaire, required: true},
          {prompt: "<b>Is reliable, can always be counted on.</b>", labels: scale_questionnaire, required: true},
          {prompt: "<b>Is emotionally stable, not easily upset.</b>", labels: scale_questionnaire, required: true},
          {prompt: "<b>Is original, comes up with new ideas.</b>", labels: scale_questionnaire, required: true},
          {prompt: "<b>Is outgoing, sociable.</b>", labels: scale_questionnaire, required: true},
          {prompt: "<b>Can be cold and uncaring.</b>", labels: scale_questionnaire, required: true},
          {prompt: "<b>Keeps things neat and tidy.</b>", labels: scale_questionnaire, required: true},
          {prompt: "<b>Is relaxed, handles stress well.</b>", labels: scale_questionnaire, required: true},
          {prompt: "<b>Has few artistic interests.</b>", labels: scale_questionnaire, required: true},
          {prompt: "<b>Prefers to have others take charge.</b>", labels: scale_questionnaire, required: true},
          {prompt: "<b>Is respectful, treats others with respect.</b>", labels: scale_questionnaire, required: true},
          {prompt: "<b>Is persistent, works until the task is finished.</b>", labels: scale_questionnaire, required: true},
          {prompt: "<b>Feels secure, comfortable with self.</b>", labels: scale_questionnaire, required: true},
          {prompt: "<b>Is complex, a deep thinker.</b>", labels: scale_questionnaire, required: true},
          {prompt: "<b>Is less active than other people.</b>", labels: scale_questionnaire, required: true},
          {prompt: "<b>Tends to find fault with others.</b>", labels: scale_questionnaire, required: true},
          {prompt: "<b>Can be somewhat careless.</b>", labels: scale_questionnaire, required: true},
          {prompt: "<b>Is temperamental, gets emotional easily.</b>", labels: scale_questionnaire, required: true},
          {prompt: "<b>Has little creativity.</b>", labels: scale_questionnaire, required: true}
        ],
        randomize_question_order: false, 
        button_label: 'Continue',
        on_load: function() {
          window.scrollTo(0, 0);
          $(".jspsych-content").css("margin-top", "200px");
        },
        on_finish: function(data) {
          data.task = "rating";
          var parsed_response  = JSON.parse(data.responses);
          data.Personality_1      = parsed_response.Q0 ;
          data.Personality_2     = parsed_response.Q1 ;
          data.Personality_3     = parsed_response.Q2 ;
          data.Personality_4     = parsed_response.Q3 ;
          data.Personality_5     = parsed_response.Q4 ;
          data.Personality_6     = parsed_response.Q5 ;
          data.Personality_7     = parsed_response.Q6 ;
          data.Personality_8     = parsed_response.Q7 ;
          data.Personality_9     = parsed_response.Q8 ;
          data.Personality_10     = parsed_response.Q9 ;
          data.Personality_11     = parsed_response.Q10 ;
          data.Personality_12     = parsed_response.Q11 ;
          data.Personality_13     = parsed_response.Q12 ;
          data.Personality_14     = parsed_response.Q13 ;
          data.Personality_15     = parsed_response.Q14 ;
          data.Personality_16     = parsed_response.Q15 ;
          data.Personality_17     = parsed_response.Q16 ;
          data.Personality_18     = parsed_response.Q17 ;
          data.Personality_19     = parsed_response.Q18 ;
          data.Personality_20     = parsed_response.Q19 ;
          data.Personality_21     = parsed_response.Q20 ;
          data.Personality_22     = parsed_response.Q21 ;
          data.Personality_23     = parsed_response.Q22 ;
          data.Personality_24     = parsed_response.Q23 ;
          data.Personality_25     = parsed_response.Q24 ;
          data.Personality_26     = parsed_response.Q25 ;
          data.Personality_27     = parsed_response.Q26 ;
          data.Personality_28     = parsed_response.Q27 ;
          data.Personality_29     = parsed_response.Q28 ;
          data.Personality_30     = parsed_response.Q29 ;
          data.target_rating    = "Andy";
        },
    };

var rating_John_45Andy = {
        type: 'survey-likert',
        post_trial_gap: 200,
        preamble: "<br><br><img class='imgBack' src='stimuli/Face_55_John.jpeg'><br><br>",
        questions: [
          {prompt: "<b>Tends to be quiet.</b>", labels: scale_questionnaire, required: true},
          {prompt: "<b>Is compassionate, has a soft heart.</b>", labels: scale_questionnaire, required: true},
          {prompt: "<b>Tends to be disorganized.</b>", labels: scale_questionnaire, required: true},
          {prompt: "<b>Worries a lot.</b>", labels: scale_questionnaire, required: true},
          {prompt: "<b>Is fascinated by art, music, or literature.</b>", labels: scale_questionnaire, required: true},
          {prompt: "<b>Is dominant, acts as a leader.</b>", labels: scale_questionnaire, required: true},
          {prompt: "<b>Is sometimes rude to others.</b>", labels: scale_questionnaire, required: true},
          {prompt: "<b>Has difficulty getting started on tasks.</b>", labels: scale_questionnaire, required: true},
          {prompt: "<b>Tends to feel depressed, blue.</b>", labels: scale_questionnaire, required: true},
          {prompt: "<b>Has little interest in abstract ideas.</b>", labels: scale_questionnaire, required: true},
          {prompt: "<b>Is full of energy.</b>", labels: scale_questionnaire, required: true},
          {prompt: "<b>Assumes the best about people.</b>", labels: scale_questionnaire, required: true},
          {prompt: "<b>Is reliable, can always be counted on.</b>", labels: scale_questionnaire, required: true},
          {prompt: "<b>Is emotionally stable, not easily upset.</b>", labels: scale_questionnaire, required: true},
          {prompt: "<b>Is original, comes up with new ideas.</b>", labels: scale_questionnaire, required: true},
          {prompt: "<b>Is outgoing, sociable.</b>", labels: scale_questionnaire, required: true},
          {prompt: "<b>Can be cold and uncaring.</b>", labels: scale_questionnaire, required: true},
          {prompt: "<b>Keeps things neat and tidy.</b>", labels: scale_questionnaire, required: true},
          {prompt: "<b>Is relaxed, handles stress well.</b>", labels: scale_questionnaire, required: true},
          {prompt: "<b>Has few artistic interests.</b>", labels: scale_questionnaire, required: true},
          {prompt: "<b>Prefers to have others take charge.</b>", labels: scale_questionnaire, required: true},
          {prompt: "<b>Is respectful, treats others with respect.</b>", labels: scale_questionnaire, required: true},
          {prompt: "<b>Is persistent, works until the task is finished.</b>", labels: scale_questionnaire, required: true},
          {prompt: "<b>Feels secure, comfortable with self.</b>", labels: scale_questionnaire, required: true},
          {prompt: "<b>Is complex, a deep thinker.</b>", labels: scale_questionnaire, required: true},
          {prompt: "<b>Is less active than other people.</b>", labels: scale_questionnaire, required: true},
          {prompt: "<b>Tends to find fault with others.</b>", labels: scale_questionnaire, required: true},
          {prompt: "<b>Can be somewhat careless.</b>", labels: scale_questionnaire, required: true},
          {prompt: "<b>Is temperamental, gets emotional easily.</b>", labels: scale_questionnaire, required: true},
          {prompt: "<b>Has little creativity.</b>", labels: scale_questionnaire, required: true}
        ],
        randomize_question_order: false, 
        button_label: 'Continue',
        on_load: function() {
          window.scrollTo(0, 0);
          $(".jspsych-content").css("margin-top", "200px");
        },
        on_finish: function(data) {
          data.task = "rating";
          var parsed_response  = JSON.parse(data.responses);
          data.Personality_1      = parsed_response.Q0 ;
          data.Personality_2     = parsed_response.Q1 ;
          data.Personality_3     = parsed_response.Q2 ;
          data.Personality_4     = parsed_response.Q3 ;
          data.Personality_5     = parsed_response.Q4 ;
          data.Personality_6     = parsed_response.Q5 ;
          data.Personality_7     = parsed_response.Q6 ;
          data.Personality_8     = parsed_response.Q7 ;
          data.Personality_9     = parsed_response.Q8 ;
          data.Personality_10     = parsed_response.Q9 ;
          data.Personality_11     = parsed_response.Q10 ;
          data.Personality_12     = parsed_response.Q11 ;
          data.Personality_13     = parsed_response.Q12 ;
          data.Personality_14     = parsed_response.Q13 ;
          data.Personality_15     = parsed_response.Q14 ;
          data.Personality_16     = parsed_response.Q15 ;
          data.Personality_17     = parsed_response.Q16 ;
          data.Personality_18     = parsed_response.Q17 ;
          data.Personality_19     = parsed_response.Q18 ;
          data.Personality_20     = parsed_response.Q19 ;
          data.Personality_21     = parsed_response.Q20 ;
          data.Personality_22     = parsed_response.Q21 ;
          data.Personality_23     = parsed_response.Q22 ;
          data.Personality_24     = parsed_response.Q23 ;
          data.Personality_25     = parsed_response.Q24 ;
          data.Personality_26     = parsed_response.Q25 ;
          data.Personality_27     = parsed_response.Q26 ;
          data.Personality_28     = parsed_response.Q27 ;
          data.Personality_29     = parsed_response.Q28 ;
          data.Personality_30     = parsed_response.Q29 ;
          data.target_rating    = "John";
        },
    };

var rating_Andy_55Andy = {
        type: 'survey-likert',
        post_trial_gap: 200,
        preamble: "<br><br><img class='imgBack' src='stimuli/Face_55_Andy.jpeg'><br><br>",
        questions: [
          {prompt: "<b>Tends to be quiet.</b>", labels: scale_questionnaire, required: true},
          {prompt: "<b>Is compassionate, has a soft heart.</b>", labels: scale_questionnaire, required: true},
          {prompt: "<b>Tends to be disorganized.</b>", labels: scale_questionnaire, required: true},
          {prompt: "<b>Worries a lot.</b>", labels: scale_questionnaire, required: true},
          {prompt: "<b>Is fascinated by art, music, or literature.</b>", labels: scale_questionnaire, required: true},
          {prompt: "<b>Is dominant, acts as a leader.</b>", labels: scale_questionnaire, required: true},
          {prompt: "<b>Is sometimes rude to others.</b>", labels: scale_questionnaire, required: true},
          {prompt: "<b>Has difficulty getting started on tasks.</b>", labels: scale_questionnaire, required: true},
          {prompt: "<b>Tends to feel depressed, blue.</b>", labels: scale_questionnaire, required: true},
          {prompt: "<b>Has little interest in abstract ideas.</b>", labels: scale_questionnaire, required: true},
          {prompt: "<b>Is full of energy.</b>", labels: scale_questionnaire, required: true},
          {prompt: "<b>Assumes the best about people.</b>", labels: scale_questionnaire, required: true},
          {prompt: "<b>Is reliable, can always be counted on.</b>", labels: scale_questionnaire, required: true},
          {prompt: "<b>Is emotionally stable, not easily upset.</b>", labels: scale_questionnaire, required: true},
          {prompt: "<b>Is original, comes up with new ideas.</b>", labels: scale_questionnaire, required: true},
          {prompt: "<b>Is outgoing, sociable.</b>", labels: scale_questionnaire, required: true},
          {prompt: "<b>Can be cold and uncaring.</b>", labels: scale_questionnaire, required: true},
          {prompt: "<b>Keeps things neat and tidy.</b>", labels: scale_questionnaire, required: true},
          {prompt: "<b>Is relaxed, handles stress well.</b>", labels: scale_questionnaire, required: true},
          {prompt: "<b>Has few artistic interests.</b>", labels: scale_questionnaire, required: true},
          {prompt: "<b>Prefers to have others take charge.</b>", labels: scale_questionnaire, required: true},
          {prompt: "<b>Is respectful, treats others with respect.</b>", labels: scale_questionnaire, required: true},
          {prompt: "<b>Is persistent, works until the task is finished.</b>", labels: scale_questionnaire, required: true},
          {prompt: "<b>Feels secure, comfortable with self.</b>", labels: scale_questionnaire, required: true},
          {prompt: "<b>Is complex, a deep thinker.</b>", labels: scale_questionnaire, required: true},
          {prompt: "<b>Is less active than other people.</b>", labels: scale_questionnaire, required: true},
          {prompt: "<b>Tends to find fault with others.</b>", labels: scale_questionnaire, required: true},
          {prompt: "<b>Can be somewhat careless.</b>", labels: scale_questionnaire, required: true},
          {prompt: "<b>Is temperamental, gets emotional easily.</b>", labels: scale_questionnaire, required: true},
          {prompt: "<b>Has little creativity.</b>", labels: scale_questionnaire, required: true}
        ],
        randomize_question_order: false, 
        button_label: 'Continue',
        on_load: function() {
          window.scrollTo(0, 0);
          $(".jspsych-content").css("margin-top", "200px");
        },
        on_finish: function(data) {
          data.task = "rating";
          var parsed_response  = JSON.parse(data.responses);
          data.Personality_1      = parsed_response.Q0 ;
          data.Personality_2     = parsed_response.Q1 ;
          data.Personality_3     = parsed_response.Q2 ;
          data.Personality_4     = parsed_response.Q3 ;
          data.Personality_5     = parsed_response.Q4 ;
          data.Personality_6     = parsed_response.Q5 ;
          data.Personality_7     = parsed_response.Q6 ;
          data.Personality_8     = parsed_response.Q7 ;
          data.Personality_9     = parsed_response.Q8 ;
          data.Personality_10     = parsed_response.Q9 ;
          data.Personality_11     = parsed_response.Q10 ;
          data.Personality_12     = parsed_response.Q11 ;
          data.Personality_13     = parsed_response.Q12 ;
          data.Personality_14     = parsed_response.Q13 ;
          data.Personality_15     = parsed_response.Q14 ;
          data.Personality_16     = parsed_response.Q15 ;
          data.Personality_17     = parsed_response.Q16 ;
          data.Personality_18     = parsed_response.Q17 ;
          data.Personality_19     = parsed_response.Q18 ;
          data.Personality_20     = parsed_response.Q19 ;
          data.Personality_21     = parsed_response.Q20 ;
          data.Personality_22     = parsed_response.Q21 ;
          data.Personality_23     = parsed_response.Q22 ;
          data.Personality_24     = parsed_response.Q23 ;
          data.Personality_25     = parsed_response.Q24 ;
          data.Personality_26     = parsed_response.Q25 ;
          data.Personality_27     = parsed_response.Q26 ;
          data.Personality_28     = parsed_response.Q27 ;
          data.Personality_29     = parsed_response.Q28 ;
          data.Personality_30     = parsed_response.Q29 ;
          data.target_rating    = "Andy";
        },
    };


var rating_John_55Andy = {
        type: 'survey-likert',
        post_trial_gap: 200,
        preamble: "<br><br><img class='imgBack' src='stimuli/Face_45_John.jpeg'><br><br>",
        questions: [
          {prompt: "<b>Tends to be quiet.</b>", labels: scale_questionnaire, required: true},
          {prompt: "<b>Is compassionate, has a soft heart.</b>", labels: scale_questionnaire, required: true},
          {prompt: "<b>Tends to be disorganized.</b>", labels: scale_questionnaire, required: true},
          {prompt: "<b>Worries a lot.</b>", labels: scale_questionnaire, required: true},
          {prompt: "<b>Is fascinated by art, music, or literature.</b>", labels: scale_questionnaire, required: true},
          {prompt: "<b>Is dominant, acts as a leader.</b>", labels: scale_questionnaire, required: true},
          {prompt: "<b>Is sometimes rude to others.</b>", labels: scale_questionnaire, required: true},
          {prompt: "<b>Has difficulty getting started on tasks.</b>", labels: scale_questionnaire, required: true},
          {prompt: "<b>Tends to feel depressed, blue.</b>", labels: scale_questionnaire, required: true},
          {prompt: "<b>Has little interest in abstract ideas.</b>", labels: scale_questionnaire, required: true},
          {prompt: "<b>Is full of energy.</b>", labels: scale_questionnaire, required: true},
          {prompt: "<b>Assumes the best about people.</b>", labels: scale_questionnaire, required: true},
          {prompt: "<b>Is reliable, can always be counted on.</b>", labels: scale_questionnaire, required: true},
          {prompt: "<b>Is emotionally stable, not easily upset.</b>", labels: scale_questionnaire, required: true},
          {prompt: "<b>Is original, comes up with new ideas.</b>", labels: scale_questionnaire, required: true},
          {prompt: "<b>Is outgoing, sociable.</b>", labels: scale_questionnaire, required: true},
          {prompt: "<b>Can be cold and uncaring.</b>", labels: scale_questionnaire, required: true},
          {prompt: "<b>Keeps things neat and tidy.</b>", labels: scale_questionnaire, required: true},
          {prompt: "<b>Is relaxed, handles stress well.</b>", labels: scale_questionnaire, required: true},
          {prompt: "<b>Has few artistic interests.</b>", labels: scale_questionnaire, required: true},
          {prompt: "<b>Prefers to have others take charge.</b>", labels: scale_questionnaire, required: true},
          {prompt: "<b>Is respectful, treats others with respect.</b>", labels: scale_questionnaire, required: true},
          {prompt: "<b>Is persistent, works until the task is finished.</b>", labels: scale_questionnaire, required: true},
          {prompt: "<b>Feels secure, comfortable with self.</b>", labels: scale_questionnaire, required: true},
          {prompt: "<b>Is complex, a deep thinker.</b>", labels: scale_questionnaire, required: true},
          {prompt: "<b>Is less active than other people.</b>", labels: scale_questionnaire, required: true},
          {prompt: "<b>Tends to find fault with others.</b>", labels: scale_questionnaire, required: true},
          {prompt: "<b>Can be somewhat careless.</b>", labels: scale_questionnaire, required: true},
          {prompt: "<b>Is temperamental, gets emotional easily.</b>", labels: scale_questionnaire, required: true},
          {prompt: "<b>Has little creativity.</b>", labels: scale_questionnaire, required: true}
        ],
        randomize_question_order: false, 
        button_label: 'Continue',
        on_load: function() {
          window.scrollTo(0, 0);
          $(".jspsych-content").css("margin-top", "200px");
        },
        on_finish: function(data) {
          data.task = "rating";
          var parsed_response  = JSON.parse(data.responses);
          data.Personality_1      = parsed_response.Q0 ;
          data.Personality_2     = parsed_response.Q1 ;
          data.Personality_3     = parsed_response.Q2 ;
          data.Personality_4     = parsed_response.Q3 ;
          data.Personality_5     = parsed_response.Q4 ;
          data.Personality_6     = parsed_response.Q5 ;
          data.Personality_7     = parsed_response.Q6 ;
          data.Personality_8     = parsed_response.Q7 ;
          data.Personality_9     = parsed_response.Q8 ;
          data.Personality_10     = parsed_response.Q9 ;
          data.Personality_11     = parsed_response.Q10 ;
          data.Personality_12     = parsed_response.Q11 ;
          data.Personality_13     = parsed_response.Q12 ;
          data.Personality_14     = parsed_response.Q13 ;
          data.Personality_15     = parsed_response.Q14 ;
          data.Personality_16     = parsed_response.Q15 ;
          data.Personality_17     = parsed_response.Q16 ;
          data.Personality_18     = parsed_response.Q17 ;
          data.Personality_19     = parsed_response.Q18 ;
          data.Personality_20     = parsed_response.Q19 ;
          data.Personality_21     = parsed_response.Q20 ;
          data.Personality_22     = parsed_response.Q21 ;
          data.Personality_23     = parsed_response.Q22 ;
          data.Personality_24     = parsed_response.Q23 ;
          data.Personality_25     = parsed_response.Q24 ;
          data.Personality_26     = parsed_response.Q25 ;
          data.Personality_27     = parsed_response.Q26 ;
          data.Personality_28     = parsed_response.Q27 ;
          data.Personality_29     = parsed_response.Q28 ;
          data.Personality_30     = parsed_response.Q29 ;
          data.target_rating    = "John";
        },
    };


var Rating_instructions_end = {
  type: "html-keyboard-response",
  post_trial_gap: 200,
  stimulus:
    "<p class='instructions'><center>The last part of the study is over. Now, we will ask you to answer a few questions.</center></p><br><br>" +
    "<p class = 'continue-instructions'>Press <span class='key'>space</span>" +
    " to continue.</p>",
  choices: [32]
};

// Final questions -----------------------------------------------------------------------

/* Memory of the self-group referencing */
var memory_group = {
      type: 'survey-multi-choice',
      questions: [{prompt: "In the categorization task, who shared the same response key with self-related words?", options: ['Andy', 'John', 'I do not remember'], required: true}],
      button_label: "Continue",
      on_load: function() {
          window.scrollTo(0, 0);
          $(".jspsych-content").css("margin-top", "200px");
          $(".jspsych-content").css("max-width", "90%");
        },
      on_finish: function(data) {
          jsPsych.data.addProperties({
              memory_group: JSON.parse(data.responses)["Q0"],
          });
      },
  };

  var demand_awareness = {
        timeline: [{
            type: 'survey-text',
            questions: [{ prompt: 'What do you think the researchers were trying to achieve in this study?', rows: 3, columns: 60 }],
            button_label: "continue",
        }],
        loop_function: function (data) {
            var res = data.values()[0].responses;
            var res = JSON.parse(res).Q0;
            if (res == "") {
                alert("Please answer the question");
                return true;
            }
        },
        on_finish: function (data) {
            jsPsych.data.addProperties({
                demand_awareness: JSON.parse(data.responses).Q0,
            });
        },
    };

  var influence_awareness = {
      type: 'survey-multi-choice',
      questions: [{prompt: "Do you think that the key sharing between self- and other-related words<br> and Andy and John influenced your judgment of Andy and John <br>when you had to judge them on the personality traits/outcomes?", options: ['Yes', 'No', 'I do not know'], required: true}],
      button_label: "Continue",
      on_load: function() {
          window.scrollTo(0, 0);
          $(".jspsych-content").css("margin-top", "200px");
          $(".jspsych-content").css("max-width", "90%");
        },
      on_finish: function(data) {
          jsPsych.data.addProperties({
              influence_awareness: JSON.parse(data.responses)["Q0"],
          });
      },
  };

  var demand_compliance = {
      type: 'survey-multi-choice',
      questions: [{prompt: "When we asked you to evaluate Andy and John on the personality traits/outcomes,<br> did you tell us the truth about what you think? Or did you just fake your response (i.e., tell us <br>what you thought we wanted to hear)? Please be honest here (it will not affect payment in any way).", options: ['Yes - I faked my response based on what I thought the researchers wanted to find', 'No - my responses were based on how I genuinely felt', 'I do not know'], required: true}],
      button_label: "Continue",
      on_load: function() {
          window.scrollTo(0, 0);
          $(".jspsych-content").css("margin-top", "200px");
          $(".jspsych-content").css("max-width", "90%");
        },
      on_finish: function(data) {
          jsPsych.data.addProperties({
              demand_compliance: JSON.parse(data.responses)["Q0"],
          });
      },
  };


 /* First name */
    var first_name_pp = {
      type: 'survey-multi-choice',
      questions: [{prompt: "Is your name Andy or John?", options: ['Yes (my name is Andy or John)', 'No'], required: true}],
      button_label: "Continue",
      on_finish: function(data) {
          jsPsych.data.addProperties({
              first_name_pp: JSON.parse(data.responses)["Q0"],
          });
      },
  };


 /* AGE */
  var age = {
      timeline: [{
        type: 'survey-text',
        questions: [{prompt: "How old are you?", rows: 1, columns: 10}],
        button_label: "Continue",
      }],
      on_load: function() {
          window.scrollTo(0, 0);
          $(".jspsych-content").css("margin-top", "200px");
          $(".jspsych-content").css("max-width", "90%");
        },
      loop_function: function(data){ 
        var age = data.values()[0].responses;
        var age = JSON.parse(age).Q0; 
        if(age == ""){
          alert("Please indicate your age"); 
          return true; 
        }
      },
      on_finish: function(data) {
          jsPsych.data.addProperties({
              age: JSON.parse(data.responses)["Q0"],
          });
      },
  };

  var gender = {
      type: 'survey-multi-choice',
      questions: [{prompt: "Please indicate your gender:", options: ['Male', 'Female', 'Other'], required: true}],
      button_label: "Continue",
      on_finish: function(data) {
          jsPsych.data.addProperties({
              gender: JSON.parse(data.responses)["Q0"],
          });
      },
  };

  var languageOptions = ['Native speaker', 'Very well', 'Well', 'Average', 'Badly', 'Very badly'];
  var language = {
        type: 'survey-multi-choice',
        questions: [{ prompt: "How well do you speak english?", options: languageOptions, required: true }],
        button_label: "continue",
        on_finish: function (data) {
            jsPsych.data.addProperties({
                language: JSON.parse(data.responses).Q0,
            });
            console.log(data);
        },
    };

  var Prolific_reported = {
        timeline: [{
            type: 'survey-text',
            questions: [{ prompt: 'Please indicate your Prolific ID:', rows: 3, columns: 60 }],
            button_label: "continue",
        }],
        loop_function: function (data) {
            var res = data.values()[0].responses;
            var res = JSON.parse(res).Q0;
            if (res == "") {
                alert("Please answer the question");
                return true;
            }
        },
        on_finish: function (data) {
            jsPsych.data.addProperties({
                Prolific_reported: JSON.parse(data.responses).Q0,
            });
        },
    };

  var comments = {
        timeline: [{
            type: 'survey-text',
            questions: [{ prompt: 'Do you have comments regarding this study? [Optional]', rows: 3, columns: 60 }],
            button_label: "continue",
        }],
        on_finish: function (data) {
            jsPsych.data.addProperties({
                Comment: JSON.parse(data.responses).Q0,
            });
        },
    };

 /* EXIT FULLSCREEN MODE */
  var exitFullscreen = {
    type: 'fullscreen',
    fullscreen_mode: false
  };

    /* DEBRIEF */
  var debrief = [];
  debrief += "<h1>End of the study</h1>";
  debrief += "<p class='justify'>Thank you for participating in this online experiment!<br><br>";
  debrief += "In some experiments, we cannot tell people everything about the experiment at the beginning because their responses would not be ";
  debrief += "natural. For example, if we told people what the point of the experiment was ahead of time, then some people might do whatever ";
  debrief += "it is they think we want them to do, just to be helpful. Other people might do the exact opposite of what they think we want "; 
  debrief += "them to do, just to show us that we cannot figure them out. When people are trying to second-guess what the experiment is "; 
  debrief += "really about, and they behave a certain way because of it, our results get messed up. That is because they are not behaving "; 
  debrief += "like they naturally would in the real world. The whole point of this experiment is to find out how people would ";
  debrief += "naturally behave.<br><br>";
  debrief += "Now we would like to explain what we were trying to learn about with this study. In the first part of the study, we assessed your "; 
  debrief += "personality using the Big Five Inventory (e.g., to what extent you think you are extroverted). In the second part, we asked you to categorize words referring to the self (e.g., 'I') "; 
  debrief += "and to others (e.g., 'he') together with picures of Andy and John. Our goal in this second part was to create a special link "; 
  debrief += "between these categories of items: When two categories (e.g., self words and the picture of John) share the same response key, we expect "; 
  debrief += "them to be more strongly linked after the task. If so, you should have rated the group of faces sharing the response key with ";
  debrief += "self words as more similar to yourself in the third part (e.g., as more 'extroverted' if you think you are 'extroverted'). <br><br>"; 
  debrief += "We would like to emphasize that there are no correct responses in this study: We were looking at people’s natural responses. ";
  debrief += "We hope you understand that we couldn't tell you all of this before because it would have ruined our study. ";
  debrief += "Again, your responses will be anonymous and will be analyzed as part of a group of responses.</br></br>";
  debrief += "We hope this explanation was clear. If you want additional information, if you have any questions, or if you would like ";
  debrief += "to withdraw consent and have your data excluded, do not hesitate to contact us via Prolific Academic. If you are "; 
  debrief += "interested, you can also ask for the results of this experiment—be aware, however, that this could take several weeks "; 
  debrief += "to gather all the data we need and to analyze them. <br><br>";
  debrief += "You can copy this code on Prolific: <b>1848E97F</b> ";
  debrief += "or you can click on the following link to validate your participation:</p>";
  debrief += "<a href='https://app.prolific.co/submissions/complete?cc=1848E97F' target='_blank'>click here</a><br><br>";


// end fullscreen -----------------------------------------------------------------------

var fullscreen_trial_exit = {
  type: 'fullscreen',
  fullscreen_mode: false
}


// procedure ----------------------------------------------------------------------------
// Initialize timeline ------------------------------------------------------------------

var timeline = [];

timeline.push(consent);

// fullscreen
timeline.push(
        instructions_gene_1,
        instructions_gene_2,
        fullscreen_trial);

// prolific verification
timeline.push(save_id);


timeline.push(Personality_instructions_1,
              rating_self,
              Personality_instructions_end,
              hiding_cursor)


switch(Name_face) {
  case "45_Andy":
    timeline.push(iat_instructions_1,
              iat_instructions_1_45_Andy,
              iat_instructions_block_1, 
              iat_block_1_Face_45_Andy,
              iat_instructions_block_2, 
              iat_block_2_Face_45_Andy,
              iat_instructions_block_3, 
              iat_block_3_Face_45_Andy,
              iat_instructions_block_4, 
              iat_block_4_Face_45_Andy,
              iat_instructions_2,
              showing_cursor,
              Rating_instructions_1,
              rating_Andy_45Andy,
              rating_John_45Andy,
              Rating_instructions_end);
    break;
  case "55_Andy":
    timeline.push(iat_instructions_1,
              iat_instructions_1_55_Andy,
              iat_instructions_block_1, 
              iat_block_1_Face_55_Andy,
              iat_instructions_block_2, 
              iat_block_2_Face_55_Andy,
              iat_instructions_block_3, 
              iat_block_3_Face_55_Andy,
              iat_instructions_block_4, 
              iat_block_4_Face_55_Andy,
              iat_instructions_2,
              showing_cursor,
              Rating_instructions_1,
              rating_Andy_55Andy,
              rating_John_55Andy,
              Rating_instructions_end);
    break;
}

timeline.push(memory_group,
              demand_awareness,
              influence_awareness,
              demand_compliance,
              first_name_pp,
              age,
              gender,
              language,
              Prolific_reported,
              comments);

timeline.push(fullscreen_trial_exit);

// Launch experiment --------------------------------------------------------------------
// preloading ---------------------------------------------------------------------------
// Preloading. For some reason, it appears auto-preloading fails, so using it manually.
// In principle, it should have ended when participants starts VAAST procedure (which)
// contains most of the image that have to be pre-loaded.
var loading_gif               = ["media/loading.gif"]

jsPsych.pluginAPI.preloadImages(loading_gif);

// timeline initiaization ---------------------------------------------------------------

if(is_compatible) {
  jsPsych.init({
      timeline: timeline,
      preload_images: preloadimages,
      on_interaction_data_update: function() {
        saving_browser_events(completion = false);
      },
    on_finish: function(data) {
       $("#jspsych-content").html("<img src='https://i.gifer.com/4V0b.gif'>");

        /* jsPsych: add data to every trial */
            jsPsych.data.addProperties({
                jspsych_id: jspsych_id,
                prolificID: prolificID,
                pairing_SelfRef: pairing_SelfRef,
                rating_firstgroup: rating_firstgroup,
                Name_face: Name_face,
            });

        var dataSelfRating = data.filter({ target_rating: 'self' }).csv();
        var dataAndy = data.filter({ target_rating: 'Andy' }).csv();
        var dataJohn = data.filter({ target_rating: 'John' }).csv();

        saving_browser_events(completion = true);

        /* Send data to Firebase */
      database
        .ref("SelfRef_Perso/" + jspsych_id + "/")
        .update({ dataSelfRating })
        .then(function () {
      database
        .ref("SelfRef_Perso/" + jspsych_id + "/")
        .update({ dataAndy })
        .then(function () {
      database
        .ref("SelfRef_Perso/" + jspsych_id + "/")
        .update({ dataJohn })
        .then(function () {
              console.log("Data sent!");
              $("#jspsych-content").html(debrief);
              //setTimeout(jsPsych.data.displayData, 5000);
           });
         });
        });
    }
  });
}
