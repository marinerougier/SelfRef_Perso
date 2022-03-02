
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
var pairing_SelfRef = jsPsych.randomization.sampleWithoutReplacement(["blue_left", "yellow_left", "blue_right", "yellow_right"], 1)[0];
// First group rated in the final rating task
var rating_firstgroup = jsPsych.randomization.sampleWithoutReplacement(["blue_first", "yellow_first"], 1)[0];
// group associated with the yellow or blue color
var ColorGroup   = jsPsych.randomization.sampleWithoutReplacement(["G1Y", "G1B"], 1)[0];


var genColor = function (colorID, colorName) { return "<span style='color:" + colorID + "'><b>" + colorName + "</b></span>" };

var color_blue = genColor("#2a57ea", "blue");
var color_yellow = genColor("#b5a21b", "yellow");
        

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
var faces_G1B = [
      "stimuli/Face19_J.png",
      "stimuli/Face28_J.png",
      "stimuli/Face55_J.png",
      "stimuli/Face95_J.png",
      "stimuli/Face104_J.png",
      "stimuli/Face115_J.png",
      "stimuli/Face119_J.png",
      "stimuli/Face142_J.png",

      "stimuli/Face10_B.png",
      "stimuli/Face16_B.png",
      "stimuli/Face17_B.png",
      "stimuli/Face45_B.png",
      "stimuli/Face85_B.png",
      "stimuli/Face103_B.png",
      "stimuli/Face116_B.png",
      "stimuli/Face132_B.png"
];

var faces_G1Y = [
      "stimuli/Face10_J.png",
      "stimuli/Face16_J.png",
      "stimuli/Face17_J.png",
      "stimuli/Face45_J.png",
      "stimuli/Face85_J.png",
      "stimuli/Face103_J.png",
      "stimuli/Face116_J.png",
      "stimuli/Face132_J.png",

      "stimuli/Face19_B.png",
      "stimuli/Face28_B.png",
      "stimuli/Face55_B.png",
      "stimuli/Face95_B.png",
      "stimuli/Face104_B.png",
      "stimuli/Face115_B.png",
      "stimuli/Face119_B.png",
      "stimuli/Face142_B.png"
];

preloadimages.push(faces_G1B, faces_G1Y);


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
    " the extent to which you agree or disagree with that statement. </b>" +
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
        /*
        on_load: function() {
          window.scrollTo(0, 0);
          //$(".jspsych-content").css("max-width", "100%");
          $(".jspsych-content").css("margin-top", "100px");
          //$(".jspsych-survey-likert-statement").css("margin", "0px");
          //$(".jspsych-survey-likert-statement").css("padding", "0px");
          //$(".jspsych-survey-likert-opts").css("padding", "0 0 10px");
          //$("#jspsych-survey-likert-next").css("margin-top", "10px");
          //$("#jspsych-survey-likert-form").css("width", "800px");
         // $("li").css("width", "9%");
        },
        */
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
- Blocks 1 & 2: Target 1 – Self (e.g., E key) vs. Target 2 – Others (e.g., I key) --> 4 repetitions in each block (because 10 stim)
- Blocks 3 & 4: Target 1 – Self (e.g., I key) vs. Target 2 – Others (e.g., E key) --> 4 repetitions in each block (because 10 stim)
In case of incorrect classification: a red ‘X’ appears (remains until correction). 
*/

var att_side      = undefined;
var empty_side     = undefined;
var blue_side_1st = undefined;
var yellow_side_1st  = undefined;

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
  case "blue_left":
        self_side_1st              = "left";
        other_side_1st             = "right";
        blue_side_1st              = "left";
        yellow_side_1st            = "right";

        self_side_2nd              = "right";
        other_side_2nd             = "left";
        blue_side_2nd              = "right";
        yellow_side_2nd            = "left";

        block_1_left_label_bottom  = "<b>Self</b>-related words";
        block_1_right_label_bottom = "<b>Other</b>-related words";
        block_1_left_label_top   = color_blue+" group";
        block_1_right_label_top  = color_yellow+" group";

        block_2_left_label_bottom  = "<b>Self</b>-related words";
        block_2_right_label_bottom = "<b>Other</b>-related words";
        block_2_left_label_top   = color_blue+" group";
        block_2_right_label_top  = color_yellow+" group";

        block_3_left_label_bottom  = "<b>Other</b>-related words";
        block_3_right_label_bottom = "<b>Self</b>-related words";
        block_3_left_label_top   = color_yellow+" group";
        block_3_right_label_top  = color_blue+" group";

        block_4_left_label_bottom  = "<b>Other</b>-related words";
        block_4_right_label_bottom = "<b>Self</b>-related words";
        block_4_left_label_top   = color_yellow+" group";
        block_4_right_label_top  = color_blue+" group";
    break;

  case "blue_right":
        self_side_1st           = "right";
        other_side_1st          = "left";
        blue_side_1st           = "right";
        yellow_side_1st         = "left";

        self_side_2nd           = "left";
        other_side_2nd          = "right";
        blue_side_2nd           = "left";
        yellow_side_2nd         = "right";

        block_1_left_label_bottom  = "<b>Other</b>-related words";
        block_1_right_label_bottom = "<b>Self</b>-related words";
        block_1_left_label_top   = color_yellow+" group";
        block_1_right_label_top  = color_blue+" group";

        block_2_left_label_bottom  = "<b>Other</b>-related words";
        block_2_right_label_bottom = "<b>Self</b>-related words";
        block_2_left_label_top   = color_yellow+" group";
        block_2_right_label_top  = color_blue+" group";

        block_3_left_label_bottom  = "<b>Self</b>-related words";
        block_3_right_label_bottom = "<b>Other</b>-related words";
        block_3_left_label_top   = color_blue+" group";
        block_3_right_label_top  = color_yellow+" group";

        block_4_left_label_bottom  = "<b>Self</b>-related words";
        block_4_right_label_bottom = "<b>Other</b>-related words";
        block_4_left_label_top   = color_blue+" group";
        block_4_right_label_top  = color_yellow+" group";
    break;
  case "yellow_left":
        self_side_1st               = "left";
        other_side_1st              = "right";
        blue_side_1st               = "right";
        yellow_side_1st             = "left";

        self_side_2nd               = "right";
        other_side_2nd              = "left";
        blue_side_2nd               = "left";
        yellow_side_2nd             = "right";

        block_1_left_label_bottom  = "<b>Self</b>-related words";
        block_1_right_label_bottom = "<b>Other</b>-related words";
        block_1_left_label_top   = color_yellow+" group";
        block_1_right_label_top  = color_blue+" group";

        block_2_left_label_bottom  = "<b>Self</b>-related words";
        block_2_right_label_bottom = "<b>Other</b>-related words";
        block_2_left_label_top   = color_yellow+" group";
        block_2_right_label_top  = color_blue+" group";

        block_3_left_label_bottom  = "<b>Other</b>-related words";
        block_3_right_label_bottom = "<b>Self</b>-related words";
        block_3_left_label_top   = color_blue+" group";
        block_3_right_label_top  = color_yellow+" group";

        block_4_left_label_bottom  = "<b>Other</b>-related words";
        block_4_right_label_bottom = "<b>Self</b>-related words";
        block_4_left_label_top   = color_blue+" group";
        block_4_right_label_top  = color_yellow+" group";
    break;

  case "yellow_right":
        self_side_1st               = "right";
        other_side_1st              = "left";
        blue_side_1st               = "left";
        yellow_side_1st             = "right";

        self_side_2nd               = "left";
        other_side_2nd              = "right";
        blue_side_2nd               = "right";
        yellow_side_2nd             = "left";


        block_1_left_label_bottom  = "<b>Other</b>-related words";
        block_1_right_label_bottom = "<b>Self</b>-related words";
        block_1_left_label_top   = color_blue+" group";
        block_1_right_label_top  = color_yellow+" group";

        block_2_left_label_bottom  = "<b>Other</b>-related words";
        block_2_right_label_bottom = "<b>Self</b>-related words";
        block_2_left_label_top   = color_blue+" group";
        block_2_right_label_top  = color_yellow+" group";

        block_3_left_label_bottom  = "<b>Self</b>-related words";
        block_3_right_label_bottom = "<b>Other</b>-related words";
        block_3_left_label_top   = color_yellow+" group";
        block_3_right_label_top  = color_blue+" group";

        block_4_left_label_bottom  = "<b>Self</b>-related words";
        block_4_right_label_bottom = "<b>Other</b>-related words";
        block_4_left_label_top   = color_yellow+" group";
        block_4_right_label_top  = color_blue+" group";
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
    "<p class='instructions'>In this task, you will be asked to sort pictures and words" +
    " into groups as accurately as you can using the keyboard. In the following screen you will be presented" +
    " a list of category labels and the items that belong to each of these categories." +
    "</p>" +
    "<p class='instructions'>As you will see, you will sort pictures of faces depending on whether they have a "+color_blue+" or a "+color_yellow+" background" +
    " and words depending on whether they refer to the <b>self</b> or to <b>others.</b></p>" +
    "<h3 class='instructions'>Instructions</h3>" +
    "<ul class='instructions'>" +
      "<li>Keep fingers on the <span class='key'>E</span> and <span class='key'>I</span>.</li>" +
      "<li>Labels at the top will tell you which items go with each key.</li>" +
      "<li>Be as accurate as you can.</li>" +
    "</ul>" +
    "<p>&nbsp;</p>" +
    "<p class = 'continue-instructions'>Press <span class='key'>space</span>" +
    " to continue.</p>",
  choices: [32]
};

var iat_instructions_1_G1B = {
  type: "html-keyboard-response",
  post_trial_gap: 200,
  stimulus:
    "<h1 class ='custom-title'> Part 2: Categorization task </h1>" +
    "<p class='instructions'><center>Here are the three categories and the items belonging to each category</center></p>" +
    "<table>" +
      "<tr>" +
        "<th width='200px'><p font:80>CATEGORY</p></th>" +
        "<th align='center'><p font:80>ITEM</p></th>" +
      "</tr>" +
      "<br>" +
      "<tr>" +
        "<td><b>Self</b>-related words:</td>" +
        "<td align='left'>me </td>"+
        "<td align='left'>mine </td>"+
        "<td align='left'>I </td>"+
        "<td align='left'>myself </td>" +
        "<td align='left'>my </td>" +
      "</tr>" +
      "<tr>" +
        "<td><b>Other</b>-related words:</td>" +
        "<td align='left'>others </td>"+
        "<td align='left'>they </td>"+
        "<td align='left'>their </td>"+
        "<td align='left'>she </td>" +
        "<td align='left'>he </td>" +
      "</tr>" +
      "<tr>" +
        "<td>Faces of the "+color_yellow+" <br>group:</td>" +
        "<td align='left'><img height = 70px src='stimuli/Face19_J.png'></td>" +
        "<td align='left'><img height = 70px src='stimuli/Face28_J.png'></td>" +
        "<td align='left'><img height = 70px src='stimuli/Face55_J.png'></td>" +
        "<td align='left'><img height = 70px src='stimuli/Face95_J.png'></td>" +
        "<td align='left'><img height = 70px src='stimuli/Face104_J.png'></td>" +
        "<td align='left'><img height = 70px src='stimuli/Face115_J.png'></td>" +
        "<td align='left'><img height = 70px src='stimuli/Face119_J.png'></td>" +
        "<td align='left'><img height = 70px src='stimuli/Face142_J.png'></td>" +
      "</tr>" +
      "<tr>" +
        "<td>Faces of the "+color_blue+" <br>group:</td>" +
        "<td align='left'><img height = 70px src='stimuli/Face10_B.png'></td>" +
        "<td align='left'><img height = 70px src='stimuli/Face16_B.png'></td>" +
        "<td align='left'><img height = 70px src='stimuli/Face17_B.png'></td>" +
        "<td align='left'><img height = 70px src='stimuli/Face45_B.png'></td>" +
        "<td align='left'><img height = 70px src='stimuli/Face85_B.png'></td>" +
        "<td align='left'><img height = 70px src='stimuli/Face103_B.png'></td>" +
        "<td align='left'><img height = 70px src='stimuli/Face116_B.png'></td>" +
        "<td align='left'><img height = 70px src='stimuli/Face132_B.png'></td>" +
      "</tr>" +
    "</table>" +
    "<br>" +
    "<br>" +
    "<p class = 'continue-instructions'>Press <span class='key'>space</span>" +
    " to continue.</p>",
  choices: [32]
};


var iat_instructions_1_G1Y = {
  type: "html-keyboard-response",
  post_trial_gap: 200,
  stimulus:
    "<h1 class ='custom-title'> Part 2: Categorization task </h1>" +
    "<p class='instructions'><center>Here are the three categories and the items belonging to each category</center></p>" +
    "<table>" +
      "<tr>" +
        "<th width='200px'><p font:80>CATEGORY</p></th>" +
        "<th align='center'><p font:80>ITEM</p></th>" +
      "</tr>" +
      "<br>" +
      "<tr>" +
        "<td><b>Self</b>-related words:</td>" +
        "<td align='left'>me </td>"+
        "<td align='left'>mine </td>"+
        "<td align='left'>I </td>"+
        "<td align='left'>myself </td>" +
        "<td align='left'>my </td>" +
      "</tr>" +
      "<tr>" +
        "<td><b>Other</b>-related words:</td>" +
        "<td align='left'>others </td>"+
        "<td align='left'>they </td>"+
        "<td align='left'>their </td>"+
        "<td align='left'>she </td>" +
        "<td align='left'>he </td>" +
      "</tr>" +
      "<tr>" +
        "<td>Faces of the "+color_yellow+" <br>group:</td>" +
        "<td align='left'><img height = 70px src='stimuli/Face10_J.png'></td>" +
        "<td align='left'><img height = 70px src='stimuli/Face16_J.png'></td>" +
        "<td align='left'><img height = 70px src='stimuli/Face17_J.png'></td>" +
        "<td align='left'><img height = 70px src='stimuli/Face45_J.png'></td>" +
        "<td align='left'><img height = 70px src='stimuli/Face85_J.png'></td>" +
        "<td align='left'><img height = 70px src='stimuli/Face103_J.png'></td>" +
        "<td align='left'><img height = 70px src='stimuli/Face116_J.png'></td>" +
        "<td align='left'><img height = 70px src='stimuli/Face132_J.png'></td>" +
      "</tr>" +
      "<tr>" +
        "<td>Faces of the "+color_blue+" <br>group:</td>" +
        "<td align='left'><img height = 70px src='stimuli/Face19_B.png'></td>" +
        "<td align='left'><img height = 70px src='stimuli/Face28_B.png'></td>" +
        "<td align='left'><img height = 70px src='stimuli/Face55_B.png'></td>" +
        "<td align='left'><img height = 70px src='stimuli/Face95_B.png'></td>" +
        "<td align='left'><img height = 70px src='stimuli/Face104_B.png'></td>" +
        "<td align='left'><img height = 70px src='stimuli/Face115_B.png'></td>" +
        "<td align='left'><img height = 70px src='stimuli/Face119_B.png'></td>" +
        "<td align='left'><img height = 70px src='stimuli/Face142_B.png'></td>" +
      "</tr>" +
    "</table>" +
    "<br>" +
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
    "Press <span class='key'>E</span> for words relating to:<br> " +
    "<span class='iat-category good-bad'>" + block_1_left_label_top  + "</span>" +
    "<br>" +
    "<span class='iat-category good-bad'>" + block_1_left_label_bottom + "</span>" +
  "</p></div>" +
  "<div style='position: absolute; top: 18%; right: 20%'><p>" +
    "Press <span class='key'>I</span>  for words relating to:<br>" +
    "<span class='iat-category good-bad'>" + block_1_right_label_top + "</span>" +
    "<br>" +
    "<span class='iat-category good-bad'>" + block_1_right_label_bottom  + "</span>" +
  "</p></div>" +
  "<div class='iat-instructions' style='position: relative; top: 42%'> "+
    "<p class='instructions'>" +
    "<br>" +
    "Remember, each item belongs to only one group." +
    "</p>" +
    "<p class='instructions'>" +
    "Use the <span class='key'>E</span> and <span class='key'>I</span> keys to categorize " +
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
    "Press <span class='key'>E</span> for words relating to:<br> " +
    "<span class='iat-category good-bad'>" + block_2_left_label_top  + "</span>" +
    "<br>" +
    "<span class='iat-category good-bad'>" + block_2_left_label_bottom + "</span>" +
  "</p></div>" +
  "<div style='position: absolute; top: 18%; right: 20%'><p>" +
    "Press <span class='key'>I</span>  for words relating to:<br>" +
    "<span class='iat-category good-bad'>" + block_2_right_label_top + "</span>" +
    "<br>" +
    "<span class='iat-category good-bad'>" + block_2_right_label_bottom  + "</span>" +
  "</p></div>" +
  "<div class='iat-instructions' style='position: relative; top: 42%'> "+
    "<p class='instructions'>" +
    "<br>" +
    "Categories have the same position as before." +
    "</p>" +
    "<p class='instructions'>" +
    "As before, use the <span class='key'>E</span> and <span class='key'>I</span> keys to categorize " +
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
    "Press <span class='key'>E</span> for words relating to:<br> " +
    "<span class='iat-category good-bad'>" + block_3_left_label_top  + "</span>" +
    "<br>" +
    "<span class='iat-category good-bad'>" + block_3_left_label_bottom + "</span>" +
  "</p></div>" +
  "<div style='position: absolute; top: 18%; right: 20%'><p>" +
    "Press <span class='key'>I</span>  for words relating to:<br>" +
    "<span class='iat-category good-bad'>" + block_3_right_label_top + "</span>" +
    "<br>" +
    "<span class='iat-category good-bad'>" + block_3_right_label_bottom  + "</span>" +
  "</p></div>" +
  "<div class='iat-instructions' style='position: relative; top: 42%'> "+
    "<p class='instructions'>" +
    "Categories have have changed position!" +
    "</p>" +
    "<p class='instructions'>" +
    "<br>" +
    "As before, use the <span class='key'>E</span> and <span class='key'>I</span> keys to categorize " +
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
    "Press <span class='key'>E</span> for words relating to:<br> " +
    "<span class='iat-category good-bad'>" + block_4_left_label_top  + "</span>" +
    "<br>" +
    "<span class='iat-category good-bad'>" + block_4_left_label_bottom + "</span>" +
  "</p></div>" +
  "<div style='position: absolute; top: 18%; right: 20%'><p>" +
    "Press <span class='key'>I</span>  for words relating to:<br>" +
    "<span class='iat-category good-bad'>" + block_4_right_label_top + "</span>" +
    "<br>" +
    "<span class='iat-category good-bad'>" + block_4_right_label_bottom  + "</span>" +
  "</p></div>" +
  "<div class='iat-instructions' style='position: relative; top: 42%'> "+
    "<p class='instructions'>" +
    "<br>" +
    "Categories have the same position as before." +
    "</p>" +
    "<p class='instructions'>" +
    "As before, use the <span class='key'>E</span> and <span class='key'>I</span> keys to categorize " +
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

var iat_stim_block_1_2_G1B = [
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
  {type: 'iat-image', category: "blue_yellow", stimulus: 'stimuli/Face10_B.png',              stim_key_association: blue_side_1st},
  {type: 'iat-image', category: "blue_yellow", stimulus: 'stimuli/Face16_B.png',              stim_key_association: blue_side_1st},
  {type: 'iat-image', category: "blue_yellow", stimulus: 'stimuli/Face17_B.png',              stim_key_association: blue_side_1st},
  {type: 'iat-image', category: "blue_yellow", stimulus: 'stimuli/Face45_B.png',              stim_key_association: blue_side_1st},
  {type: 'iat-image', category: "blue_yellow", stimulus: 'stimuli/Face85_B.png',              stim_key_association: blue_side_1st},
  {type: 'iat-image', category: "blue_yellow", stimulus: 'stimuli/Face103_B.png',              stim_key_association: blue_side_1st},
  {type: 'iat-image', category: "blue_yellow", stimulus: 'stimuli/Face116_B.png',              stim_key_association: blue_side_1st},
  {type: 'iat-image', category: "blue_yellow", stimulus: 'stimuli/Face132_B.png',              stim_key_association: blue_side_1st},
  {type: 'iat-image', category: "blue_yellow", stimulus: 'stimuli/Face19_J.png',            stim_key_association: yellow_side_1st},
  {type: 'iat-image', category: "blue_yellow", stimulus: 'stimuli/Face28_J.png',            stim_key_association: yellow_side_1st},
  {type: 'iat-image', category: "blue_yellow", stimulus: 'stimuli/Face55_J.png',            stim_key_association: yellow_side_1st},
  {type: 'iat-image', category: "blue_yellow", stimulus: 'stimuli/Face95_J.png',            stim_key_association: yellow_side_1st},
  {type: 'iat-image', category: "blue_yellow", stimulus: 'stimuli/Face104_J.png',            stim_key_association: yellow_side_1st},
  {type: 'iat-image', category: "blue_yellow", stimulus: 'stimuli/Face115_J.png',            stim_key_association: yellow_side_1st},
  {type: 'iat-image', category: "blue_yellow", stimulus: 'stimuli/Face119_J.png',            stim_key_association: yellow_side_1st},
  {type: 'iat-image', category: "blue_yellow", stimulus: 'stimuli/Face142_J.png',            stim_key_association: yellow_side_1st}
]

var iat_stim_block_1_2_G1Y = [
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
  {type: 'iat-image', category: "blue_yellow", stimulus: 'stimuli/Face19_B.png',              stim_key_association: blue_side_1st},
  {type: 'iat-image', category: "blue_yellow", stimulus: 'stimuli/Face28_B.png',              stim_key_association: blue_side_1st},
  {type: 'iat-image', category: "blue_yellow", stimulus: 'stimuli/Face55_B.png',              stim_key_association: blue_side_1st},
  {type: 'iat-image', category: "blue_yellow", stimulus: 'stimuli/Face95_B.png',              stim_key_association: blue_side_1st},
  {type: 'iat-image', category: "blue_yellow", stimulus: 'stimuli/Face104_B.png',              stim_key_association: blue_side_1st},
  {type: 'iat-image', category: "blue_yellow", stimulus: 'stimuli/Face115_B.png',              stim_key_association: blue_side_1st},
  {type: 'iat-image', category: "blue_yellow", stimulus: 'stimuli/Face119_B.png',              stim_key_association: blue_side_1st},
  {type: 'iat-image', category: "blue_yellow", stimulus: 'stimuli/Face142_B.png',              stim_key_association: blue_side_1st},
  {type: 'iat-image', category: "blue_yellow", stimulus: 'stimuli/Face10_J.png',            stim_key_association: yellow_side_1st},
  {type: 'iat-image', category: "blue_yellow", stimulus: 'stimuli/Face16_J.png',            stim_key_association: yellow_side_1st},
  {type: 'iat-image', category: "blue_yellow", stimulus: 'stimuli/Face17_J.png',            stim_key_association: yellow_side_1st},
  {type: 'iat-image', category: "blue_yellow", stimulus: 'stimuli/Face45_J.png',            stim_key_association: yellow_side_1st},
  {type: 'iat-image', category: "blue_yellow", stimulus: 'stimuli/Face85_J.png',            stim_key_association: yellow_side_1st},
  {type: 'iat-image', category: "blue_yellow", stimulus: 'stimuli/Face103_J.png',            stim_key_association: yellow_side_1st},
  {type: 'iat-image', category: "blue_yellow", stimulus: 'stimuli/Face116_J.png',            stim_key_association: yellow_side_1st},
  {type: 'iat-image', category: "blue_yellow", stimulus: 'stimuli/Face132_J.png',            stim_key_association: yellow_side_1st}
]

var iat_stim_block_3_4_G1B = [
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
  {type: 'iat-image', category: "blue_yellow", stimulus: 'stimuli/Face10_B.png',              stim_key_association: blue_side_2nd},
  {type: 'iat-image', category: "blue_yellow", stimulus: 'stimuli/Face16_B.png',              stim_key_association: blue_side_2nd},
  {type: 'iat-image', category: "blue_yellow", stimulus: 'stimuli/Face17_B.png',              stim_key_association: blue_side_2nd},
  {type: 'iat-image', category: "blue_yellow", stimulus: 'stimuli/Face45_B.png',              stim_key_association: blue_side_2nd},
  {type: 'iat-image', category: "blue_yellow", stimulus: 'stimuli/Face85_B.png',              stim_key_association: blue_side_2nd},
  {type: 'iat-image', category: "blue_yellow", stimulus: 'stimuli/Face103_B.png',              stim_key_association: blue_side_2nd},
  {type: 'iat-image', category: "blue_yellow", stimulus: 'stimuli/Face116_B.png',              stim_key_association: blue_side_2nd},
  {type: 'iat-image', category: "blue_yellow", stimulus: 'stimuli/Face132_B.png',              stim_key_association: blue_side_2nd},
  {type: 'iat-image', category: "blue_yellow", stimulus: 'stimuli/Face19_J.png',            stim_key_association: yellow_side_2nd},
  {type: 'iat-image', category: "blue_yellow", stimulus: 'stimuli/Face28_J.png',            stim_key_association: yellow_side_2nd},
  {type: 'iat-image', category: "blue_yellow", stimulus: 'stimuli/Face55_J.png',            stim_key_association: yellow_side_2nd},
  {type: 'iat-image', category: "blue_yellow", stimulus: 'stimuli/Face95_J.png',            stim_key_association: yellow_side_2nd},
  {type: 'iat-image', category: "blue_yellow", stimulus: 'stimuli/Face104_J.png',            stim_key_association: yellow_side_2nd},
  {type: 'iat-image', category: "blue_yellow", stimulus: 'stimuli/Face115_J.png',            stim_key_association: yellow_side_2nd},
  {type: 'iat-image', category: "blue_yellow", stimulus: 'stimuli/Face119_J.png',            stim_key_association: yellow_side_2nd},
  {type: 'iat-image', category: "blue_yellow", stimulus: 'stimuli/Face142_J.png',            stim_key_association: yellow_side_2nd}
]

var iat_stim_block_3_4_G1Y = [
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
  {type: 'iat-image', category: "blue_yellow", stimulus: 'stimuli/Face19_B.png',              stim_key_association: blue_side_2nd},
  {type: 'iat-image', category: "blue_yellow", stimulus: 'stimuli/Face28_B.png',              stim_key_association: blue_side_2nd},
  {type: 'iat-image', category: "blue_yellow", stimulus: 'stimuli/Face55_B.png',              stim_key_association: blue_side_2nd},
  {type: 'iat-image', category: "blue_yellow", stimulus: 'stimuli/Face95_B.png',              stim_key_association: blue_side_2nd},
  {type: 'iat-image', category: "blue_yellow", stimulus: 'stimuli/Face104_B.png',              stim_key_association: blue_side_2nd},
  {type: 'iat-image', category: "blue_yellow", stimulus: 'stimuli/Face115_B.png',              stim_key_association: blue_side_2nd},
  {type: 'iat-image', category: "blue_yellow", stimulus: 'stimuli/Face119_B.png',              stim_key_association: blue_side_2nd},
  {type: 'iat-image', category: "blue_yellow", stimulus: 'stimuli/Face142_B.png',              stim_key_association: blue_side_2nd},
  {type: 'iat-image', category: "blue_yellow", stimulus: 'stimuli/Face10_J.png',            stim_key_association: yellow_side_2nd},
  {type: 'iat-image', category: "blue_yellow", stimulus: 'stimuli/Face16_J.png',            stim_key_association: yellow_side_2nd},
  {type: 'iat-image', category: "blue_yellow", stimulus: 'stimuli/Face17_J.png',            stim_key_association: yellow_side_2nd},
  {type: 'iat-image', category: "blue_yellow", stimulus: 'stimuli/Face45_J.png',            stim_key_association: yellow_side_2nd},
  {type: 'iat-image', category: "blue_yellow", stimulus: 'stimuli/Face85_J.png',            stim_key_association: yellow_side_2nd},
  {type: 'iat-image', category: "blue_yellow", stimulus: 'stimuli/Face103_J.png',            stim_key_association: yellow_side_2nd},
  {type: 'iat-image', category: "blue_yellow", stimulus: 'stimuli/Face116_J.png',            stim_key_association: yellow_side_2nd},
  {type: 'iat-image', category: "blue_yellow", stimulus: 'stimuli/Face132_J.png',            stim_key_association: yellow_side_2nd}
]

// iat - block 3 (test) -----------------------------------------------------------------orginally 74 trials over 8 stim
var iat_block_1_G1B = {
  timeline: [
    {
      type: jsPsych.timelineVariable('type'),
      stimulus: jsPsych.timelineVariable('stimulus'),
      category: jsPsych.timelineVariable('category'),
      label_category: ['self_other', 'blue_yellow'],
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
  timeline_variables: shuffleIATstims(iat_stim_block_1_2_G1B)
}

var iat_block_2_G1B = {
  timeline: [
    {
      type: jsPsych.timelineVariable('type'),
      stimulus: jsPsych.timelineVariable('stimulus'),
      category: jsPsych.timelineVariable('category'),
      label_category: ['self_other', 'blue_yellow'],
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
  timeline_variables: shuffleIATstims(iat_stim_block_1_2_G1B)
}

var iat_block_3_G1B = {
  timeline: [
    {
      type: jsPsych.timelineVariable('type'),
      stimulus: jsPsych.timelineVariable('stimulus'),
      category: jsPsych.timelineVariable('category'),
      label_category: ['self_other', 'blue_yellow'],
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
  timeline_variables: shuffleIATstims(iat_stim_block_3_4_G1B)
}

var iat_block_4_G1B = {
  timeline: [
    {
      type: jsPsych.timelineVariable('type'),
      stimulus: jsPsych.timelineVariable('stimulus'),
      category: jsPsych.timelineVariable('category'),
      label_category: ['self_other', 'blue_yellow'],
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
  timeline_variables: shuffleIATstims(iat_stim_block_3_4_G1B)
}


var iat_block_1_G1Y = {
  timeline: [
    {
      type: jsPsych.timelineVariable('type'),
      stimulus: jsPsych.timelineVariable('stimulus'),
      category: jsPsych.timelineVariable('category'),
      label_category: ['self_other', 'blue_yellow'],
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
  timeline_variables: shuffleIATstims(iat_stim_block_1_2_G1Y)
}
/*
var iat_block_1_G1Y = {
  timeline: [
    {
      type: jsPsych.timelineVariable('type'),
      stimulus: jsPsych.timelineVariable('stimulus'),
      category: jsPsych.timelineVariable('category'),
      label_category: ['self_other', 'blue_yellow'],
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
  timeline_variables: shuffleIATstims(iat_stim_block_1_2_G1Y)
}
*/
var iat_block_2_G1Y = {
  timeline: [
    {
      type: jsPsych.timelineVariable('type'),
      stimulus: jsPsych.timelineVariable('stimulus'),
      category: jsPsych.timelineVariable('category'),
      label_category: ['self_other', 'blue_yellow'],
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
  timeline_variables: shuffleIATstims(iat_stim_block_1_2_G1Y)
}

var iat_block_3_G1Y = {
  timeline: [
    {
      type: jsPsych.timelineVariable('type'),
      stimulus: jsPsych.timelineVariable('stimulus'),
      category: jsPsych.timelineVariable('category'),
      label_category: ['self_other', 'blue_yellow'],
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
  timeline_variables: shuffleIATstims(iat_stim_block_3_4_G1Y)
}

var iat_block_4_G1Y = {
  timeline: [
    {
      type: jsPsych.timelineVariable('type'),
      stimulus: jsPsych.timelineVariable('stimulus'),
      category: jsPsych.timelineVariable('category'),
      label_category: ['self_other', 'blue_yellow'],
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
  timeline_variables: shuffleIATstims(iat_stim_block_3_4_G1Y)
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

// Rating of the blue and yellow groups-----------------------------------------------------------------------------------
var Rating_instructions_1 = {
  type: "html-keyboard-response",
  post_trial_gap: 200,
  stimulus:
    "<h1 class ='custom-title'> Part 3: Rating of the Blue and Yellow groups </h1>" +
    "<p class='instructions'>You should know that <b>each group of faces</b> that you saw in the categorization task"+
    " (those with a "+color_blue+" background and those with a "+color_yellow+" background)" +
    " was in fact <b>very different from the other group. The two groups have very different personality and typically"+
    " behave in different ways. Moreover, <b>within each group</b>, members share a series of psychological characteristics,"+
    " making them <b>similar to each other</b>.</b></br></br>"+
    " Your task is to evaluate members of the blue group and members of the yellow group on the same series of traits as in Part 1."+
    " It is extremely important that you try to answer <b> as honestly and as spontaneously as possible.</b> There are no good or" +
    " bad answers. You just have to respond <b>as intuitively as possible. </b></br></br>"+
    "</p>" +
    "<p class = 'continue-instructions'>Press <span class='key'>space</span>" +
    " to continue.</p>",
  choices: [32]
};

var rating_blue = {
        type: 'survey-likert',
        post_trial_gap: 200,
        preamble: "<br><br><b><i>Members of the "+color_blue+" group...</b></i><br><br>",
        questions: [
          {prompt: "<b>Tend to be quiet.</b>", labels: scale_questionnaire, required: true},
          {prompt: "<b>Are compassionate, have a soft heart.</b>", labels: scale_questionnaire, required: true},
          {prompt: "<b>Tend to be disorganized.</b>", labels: scale_questionnaire, required: true},
          {prompt: "<b>Worry a lot.</b>", labels: scale_questionnaire, required: true},
          {prompt: "<b>Are fascinated by art, music, or literature.</b>", labels: scale_questionnaire, required: true},
          {prompt: "<b>Are dominant, act as leaders.</b>", labels: scale_questionnaire, required: true},
          {prompt: "<b>Are sometimes rude to others.</b>", labels: scale_questionnaire, required: true},
          {prompt: "<b>Have difficulty getting started on tasks.</b>", labels: scale_questionnaire, required: true},
          {prompt: "<b>Tend to feel depressed, blue.</b>", labels: scale_questionnaire, required: true},
          {prompt: "<b>Have little interest in abstract ideas.</b>", labels: scale_questionnaire, required: true},
          {prompt: "<b>Are full of energy.</b>", labels: scale_questionnaire, required: true},
          {prompt: "<b>Assume the best about people.</b>", labels: scale_questionnaire, required: true},
          {prompt: "<b>Are reliable, can always be counted on.</b>", labels: scale_questionnaire, required: true},
          {prompt: "<b>Are emotionally stable, not easily upset.</b>", labels: scale_questionnaire, required: true},
          {prompt: "<b>Are original, come up with new ideas.</b>", labels: scale_questionnaire, required: true},
          {prompt: "<b>Are outgoing, sociable.</b>", labels: scale_questionnaire, required: true},
          {prompt: "<b>Can be cold and uncaring.</b>", labels: scale_questionnaire, required: true},
          {prompt: "<b>Keep things neat and tidy.</b>", labels: scale_questionnaire, required: true},
          {prompt: "<b>Are relaxed, handle stress well.</b>", labels: scale_questionnaire, required: true},
          {prompt: "<b>Have few artistic interests.</b>", labels: scale_questionnaire, required: true},
          {prompt: "<b>Prefer to have others take charge.</b>", labels: scale_questionnaire, required: true},
          {prompt: "<b>Are respectful, treat others with respect.</b>", labels: scale_questionnaire, required: true},
          {prompt: "<b>Are persistent, work until the task is finished.</b>", labels: scale_questionnaire, required: true},
          {prompt: "<b>Feel secure, comfortable with themselves.</b>", labels: scale_questionnaire, required: true},
          {prompt: "<b>Are complex, deep thinkers.</b>", labels: scale_questionnaire, required: true},
          {prompt: "<b>Are less active than other people.</b>", labels: scale_questionnaire, required: true},
          {prompt: "<b>Tend to find fault with others.</b>", labels: scale_questionnaire, required: true},
          {prompt: "<b>Can be somewhat careless.</b>", labels: scale_questionnaire, required: true},
          {prompt: "<b>Are temperamental, get emotional easily.</b>", labels: scale_questionnaire, required: true},
          {prompt: "<b>Have little creativity.</b>", labels: scale_questionnaire, required: true}
        ],
        randomize_question_order: false, 
        button_label: 'Continue',
        /*
        on_load: function() {
          window.scrollTo(0, 0);
          //$(".jspsych-content").css("max-width", "100%");
          $(".jspsych-content").css("margin-top", "100px");
          //$(".jspsych-survey-likert-statement").css("margin", "0px");
          //$(".jspsych-survey-likert-statement").css("padding", "0px");
          //$(".jspsych-survey-likert-opts").css("padding", "0 0 10px");
          //$("#jspsych-survey-likert-next").css("margin-top", "10px");
          //$("#jspsych-survey-likert-form").css("width", "800px");
         // $("li").css("width", "9%");
        },
        */
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
          data.target_rating    = "blue group";
        },
    };

var rating_yellow = {
        type: 'survey-likert',
        post_trial_gap: 200,
        preamble: "<br><br><b><i>Members of the "+color_yellow+" group...</b></i><br><br>",
        questions: [
          {prompt: "<b>Tend to be quiet.</b>", labels: scale_questionnaire, required: true},
          {prompt: "<b>Are compassionate, have a soft heart.</b>", labels: scale_questionnaire, required: true},
          {prompt: "<b>Tend to be disorganized.</b>", labels: scale_questionnaire, required: true},
          {prompt: "<b>Worry a lot.</b>", labels: scale_questionnaire, required: true},
          {prompt: "<b>Are fascinated by art, music, or literature.</b>", labels: scale_questionnaire, required: true},
          {prompt: "<b>Are dominant, act as leaders.</b>", labels: scale_questionnaire, required: true},
          {prompt: "<b>Are sometimes rude to others.</b>", labels: scale_questionnaire, required: true},
          {prompt: "<b>Have difficulty getting started on tasks.</b>", labels: scale_questionnaire, required: true},
          {prompt: "<b>Tend to feel depressed, blue.</b>", labels: scale_questionnaire, required: true},
          {prompt: "<b>Have little interest in abstract ideas.</b>", labels: scale_questionnaire, required: true},
          {prompt: "<b>Are full of energy.</b>", labels: scale_questionnaire, required: true},
          {prompt: "<b>Assume the best about people.</b>", labels: scale_questionnaire, required: true},
          {prompt: "<b>Are reliable, can always be counted on.</b>", labels: scale_questionnaire, required: true},
          {prompt: "<b>Are emotionally stable, not easily upset.</b>", labels: scale_questionnaire, required: true},
          {prompt: "<b>Are original, come up with new ideas.</b>", labels: scale_questionnaire, required: true},
          {prompt: "<b>Are outgoing, sociable.</b>", labels: scale_questionnaire, required: true},
          {prompt: "<b>Can be cold and uncaring.</b>", labels: scale_questionnaire, required: true},
          {prompt: "<b>Keep things neat and tidy.</b>", labels: scale_questionnaire, required: true},
          {prompt: "<b>Are relaxed, handle stress well.</b>", labels: scale_questionnaire, required: true},
          {prompt: "<b>Have few artistic interests.</b>", labels: scale_questionnaire, required: true},
          {prompt: "<b>Prefer to have others take charge.</b>", labels: scale_questionnaire, required: true},
          {prompt: "<b>Are respectful, treat others with respect.</b>", labels: scale_questionnaire, required: true},
          {prompt: "<b>Are persistent, work until the task is finished.</b>", labels: scale_questionnaire, required: true},
          {prompt: "<b>Feel secure, comfortable with themselves.</b>", labels: scale_questionnaire, required: true},
          {prompt: "<b>Are complex, deep thinkers.</b>", labels: scale_questionnaire, required: true},
          {prompt: "<b>Are less active than other people.</b>", labels: scale_questionnaire, required: true},
          {prompt: "<b>Tend to find fault with others.</b>", labels: scale_questionnaire, required: true},
          {prompt: "<b>Can be somewhat careless.</b>", labels: scale_questionnaire, required: true},
          {prompt: "<b>Are temperamental, get emotional easily.</b>", labels: scale_questionnaire, required: true},
          {prompt: "<b>Have little creativity.</b>", labels: scale_questionnaire, required: true}
        ],
        randomize_question_order: false, 
        button_label: 'Continue',
        /*
        on_load: function() {
          window.scrollTo(0, 0);
          //$(".jspsych-content").css("max-width", "100%");
          $(".jspsych-content").css("margin-top", "100px");
          //$(".jspsych-survey-likert-statement").css("margin", "0px");
          //$(".jspsych-survey-likert-statement").css("padding", "0px");
          //$(".jspsych-survey-likert-opts").css("padding", "0 0 10px");
          //$("#jspsych-survey-likert-next").css("margin-top", "10px");
          //$("#jspsych-survey-likert-form").css("width", "800px");
         // $("li").css("width", "9%");
        },
        */
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
          data.target_rating    = "yellow group";
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
      questions: [{prompt: "In the categorization task, what group shared the same response key with self-related words?", options: ['The blue group', 'The yellow group', 'I do not remember'], required: true}],
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
      questions: [{prompt: "Do you think that the key sharing between self- and other-related words<br> and faces of the blue or yellow group influenced your judgment of the<br> blue and yellow groups when you had to judge them on the personality <br>traits/outcomes?", options: ['Yes', 'No', 'I do not know'], required: true}],
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
      questions: [{prompt: "When we asked you to evaluate the yellow and blue groups on the personality traits/outcomes,<br> did you tell us the truth about what you think? Or did you just fake your response (i.e., tell us <br>what you thought we wanted to hear)? Please be honest here (it will not affect payment in any way).", options: ['Yes - I faked my response based on what I thought the researchers wanted to find', 'No - my responses were based on how I genuinely felt', 'I do not know'], required: true}],
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
  debrief += "Now we would like to explain what we were trying to learn about with this study. First of all, you should know that the aim of "; 
  debrief += "this study was not to investigate your perception accuracy. Perception accuracy is not a real ability. Instead, our "; 
  debrief += "aim was to test whether your judgment of the three persons you saw depended on the physical attractiveness of the persons they were associated with. "; 
  debrief += "Individuals tend to attribute many positive qualities to attractive persons. For instance, when a person is attractive, "; 
  debrief += "people tend to think that s/he is also trustworthy.<br><br>";
  debrief += "Our goal is to test if we can find a similar effect (that is called the “attractiveness Halo effect”) in the present study "; 
  debrief += "with our procedure. Indeed, in the present study, we presented you faces varying on attractiveness (on the ) "; 
  debrief += "on one side of the screen, paired with faces relatively neutral on attractiveness on the other side (on the ). ";
  debrief += "Our hypothesis was thus that the attractiveness value of the attractive/less attractive face should influence the ";
  debrief += "perceived attractiveness of the other face in the pair. Therefore, participants’ evaluations of the initially neutral faces "; 
  debrief += "should vary as a function of the physical attractiveness of the faces they were paired with. <br><br>";
  debrief += "In addition, for half of the participants, we made the attractiveness of the faces on the  very salient ";
  debrief += "(with labels and instructions). The other half of the participants did not receive this attractiveness information. ";
  debrief += "We expect the influence of the attractiveness on the  on the other face to be larger for the first group of participants. <br><br>";
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


switch(ColorGroup) {
  case "G1B":
    timeline.push(iat_instructions_1,
              iat_instructions_1_G1B,
              iat_instructions_block_1, 
              iat_block_1_G1B,
              iat_instructions_block_2, 
              iat_block_2_G1B,
              iat_instructions_block_3, 
              iat_block_3_G1B,
              iat_instructions_block_4, 
              iat_block_4_G1B,
              iat_instructions_2);
    break;
  case "G1Y":
    timeline.push(iat_instructions_1,
              iat_instructions_1_G1Y,
              iat_instructions_block_1, 
              iat_block_1_G1Y,
              iat_instructions_block_2, 
              iat_block_2_G1Y,
              iat_instructions_block_3, 
              iat_block_3_G1Y,
              iat_instructions_block_4, 
              iat_block_4_G1Y,
              iat_instructions_2);
    break;
}

switch(rating_firstgroup) {
  case "blue_first":
    timeline.push(showing_cursor,
                  Rating_instructions_1,
                  rating_blue,
                  rating_yellow,
                  Rating_instructions_end);
    break;
  case "yellow_first":
    timeline.push(showing_cursor,
                  Rating_instructions_1,
                  rating_yellow,
                  rating_blue,
                  Rating_instructions_end);
    break;
}

timeline.push(memory_group,
              demand_awareness,
              influence_awareness,
              demand_compliance,
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
                ColorGroup: ColorGroup,
            });

        var dataSelfRating = data.filter({ target_rating: 'self' }).csv();
        var dataBlueRating = data.filter({ target_rating: 'blue group' }).csv();
        var dataYellowRating = data.filter({ target_rating: 'yellow group' }).csv();

        saving_browser_events(completion = true);

        /* Send data to Firebase */
      database
        .ref("SelfRef_Perso/" + jspsych_id + "/")
        .update({ dataSelfRating })
        .then(function () {
      database
        .ref("SelfRef_Perso/" + jspsych_id + "/")
        .update({ dataBlueRating })
        .then(function () {
      database
        .ref("SelfRef_Perso/" + jspsych_id + "/")
        .update({ dataYellowRating })
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
