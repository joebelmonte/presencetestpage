function $$(id) {
  return document.getElementById(id);
}

function UTCTimestamp() {
  return Math.round(new Date().valueOf() / 1000);
}

function UTCValidUntil(s) {
  var expires = new Date();
  expires.setTime(s * 1000);
  return expires.toUTCString();
}

function getDuration(max, units) {
  // Convert the input (seconds) into minutes.
  var duration = $$("Timeout").value;

  duration =
    units === "minutes" ? Math.round(duration / 60) : Math.round(duration);
  // Max duration for the auth token is 120 minutes
  if (duration > max) {
    return max;
  } else if (duration < 1) {
    return 1;
  } else {
    return duration;
  }
}

var loginkey = localStorage.getItem("authkey");

function GenerateLoginKey() {
  var version = 1;
  var partnerid = $$("PartnerID").value;
  var partneruserid = $$("PartnerUserID").value;
  var apikey = $$("auth-key").value;
  var timeout = getDuration(86400, "seconds");

  var expires = UTCTimestamp() + timeout;
  var validuntil = UTCValidUntil(expires);
  var keystring = partnerid + partneruserid + version + expires;
  var hmac = CryptoJS.HmacSHA256(keystring, apikey);
  var hmacb64 = hmac.toString(CryptoJS.enc.Base64);

  // set the loginkey
  loginkey = "$" + version + "$" + expires + "$" + hmacb64.substr(0, 43);

  // var server = "https://www.glance.net";
  console.log("the login key is " + loginkey);

  // Put the login key into local storage for use if the user refreshes the page
  localStorage.setItem("authKeySelect", "login-key");
  localStorage.setItem("authkey", loginkey);

  return loginkey;
}

function generateAuthenticationKey() {
  if ($$("auth-key-select").value === "login-key") {
    return $$("auth-key").value;
  } else {
    return GenerateLoginKey();
  }
}

function initializePresence() {
  function showpresence() {
    var visitorid = $$("visitorID").value;
    // Construct a new Presence Agent object
    presenceagent = new GLANCE.Presence.Agent({
      visitorid: visitorid,
    });

    // Setup event handlers
    presenceagent.onvisitorconn = function (e) {
      // visitor is connecting via websocket and can be signaled
      console.log("in onvisitorconn and e is ", e);
      if (e.connected) {
        // Toggle the color of the button to blue/orange when visitor logs in or out
        // Show information about the visitor's browser/os
        $$("vistor-info").style.display = "block";
        $$("cobrowsebutton").style.background = "#F86717";
      }
      if (!e.connected) {
        // Visitor connection drops to turn the button blue and remove info about visitor browser/url
        $$("cobrowsebutton").style.background = "#33aae1";
        $$("visitorurl").innerHTML = "";
        $$("visitorbrowser").innerHTML = "";
        $$("visitorbrowserversion").innerHTML = "";
        $$("visitorplatform").innerHTML = "";
        $$("vistor-info").style.display = "none";
      }
    };

    presenceagent.onpresence = function (e) {
      // Visitor posted new presence information
      // Display presence information, e.g. new e.url
      console.log("in onpresence and e is ", e);
      $$("visitorurl").innerHTML = e.url;
      $$("visitorbrowser").innerHTML = e.browser;
      $$("visitorbrowserversion").innerHTML = e.browserver;
      $$("visitorplatform").innerHTML = e.platform;
    };

    // Listen for when the showTerms is displayed on the visitor side
    presenceagent.onterms = function (e) {
      console.log("in onterms and e is ", e);
      if (e.status === "accepted") {
        // Not currently doing anything if the visitor accepts the terms and conditions
        console.log("The visitor accepted the terms and conditions.");
      }
      // If the visitor declines the session, show an alert for the agent.
      if (e.status === "declined") {
        console.log("visitor declined session");
        alert("Visitor declined session... =(");
        // if the visitor declines the terms and conditions
        presenceCancelled();
      }
    };
    // Connect the agent so it can receive the above events
    presenceagent.connect();

    // Lookup the visitor to see if he is already present
    presenceagent.lookupVisitor({
      onsuccess: function (visitordata) {
        console.log(
          "lookupVisitor successful and visitordata is ",
          visitordata
        );
        document.getElementById("visitorplatform").innerHTML =
          visitordata.platform;
      },
      onfail: function (reason) {
        console.log("lookupVisitor not successful and reason is ", reason);
      },
    });

    presenceagent.onvisitorsessionend = function () {
      console.log("In onvisitorsessionend.");
      // Once the session ends, clear the event listener for session start.
      presenceagent.onvisitorsessionstart = null;
    };
  }

  GLANCE.Authorization.authorize({
    service: "presence",
    credentials: {
      partnerid: $$("PartnerID").value,
      partneruserid: $$("PartnerUserID").value,
      loginkey: generateAuthenticationKey(),
    },
    groupid: $$("PartnerID").value,
    duration: getDuration(120, "minutes"),
    onsuccess: function () {
      showpresence();
    },
    onfail: function (reason) {
      alert("Authorization failed.");
      console.log("authorization failed and the reason is ", reason);
    },
  });

  function launchSession(visitorid) {
    // Remove start session event listener
    presenceagent.onvisitorsessionstart = null;
    var visitorid = visitorid;
    var partnerid = $$("PartnerID").value;
    var partneruserid = $$("PartnerUserID").value;

    document.getElementById("cobrowsebutton").style.display = "block";
    document.getElementById("waitingforcustomer").style.display = "none";

    console.log("in launchSession and visitorid is ", visitorid);
    if (document.getElementById("open-session-in").value === "browser") {
      window.open(
        "https://www.glance.net/agentjoin/AgentView.aspx?Wait=1&SessionKey=" +
          visitorid +
          "&partnerid=" +
          partnerid +
          "&partneruserid=" +
          partneruserid +
          "&loginkey=" +
          loginkey,
        "_blank",
        "location=no,menubar=0,titlebar=0,status=0,toolbar=0"
      );
    }
    if (document.getElementById("open-session-in").value === "panorama") {
      window.open(
        "glancepanorama://agentjoin/www.glance.net/" +
          partnerid +
          "/" +
          visitorid +
          "?partnerid=" +
          partnerid +
          "&partneruserid=" +
          partneruserid +
          "&loginkey=" +
          loginkey,
        "_self"
      );
    }
  }

  function showTerms(visitordata) {
    // Add the event listener for the session start and launch the session if you hear it.
    presenceagent.onvisitorsessionstart = function () {
      console.log("received session start event");
      var visitorid = $$("visitorID").value;
      launchSession(visitorid);
    };
    // Show the terms and conditions on the visitor side.  Pass the visitor ID as the session key.
    presenceagent.invokeVisitor({
      func: "GLANCE.Cobrowse.Visitor.showTerms",
      args: {
        sessionKey: $$("visitorID").value,
      },
    });
  }

  function cobrowseButtonClicked() {
    console.log("the cobrowse button was clicked!");
    // Need to check if the visitor is connected.  If yes, then show the terms and conditions
    presenceagent.lookupVisitor({
      onsuccess: function (visitordata) {
        console.log(
          "within cobrowseButtonClicked lookupVisitor successful and visitordata is ",
          visitordata
        );
        if (Object.keys(visitordata).length > 0) {
          // Show the terms and conditions to the visitor
          showTerms(visitordata);
          document.getElementById("cobrowsebutton").style.display = "none";
          document.getElementById("waitingforcustomer").style.display = "block";
        }
        if (Object.keys(visitordata).length === 0) {
          // If the visitor is not present, alert the user.
          alert("Visitor not present. Try joining with the session key.");
        }
      },
      onfail: function (reason) {
        console.log("lookupVisitor not successful and reason is ", reason);
        alert("Lookup failed.");
      },
    });
  }

  function presenceCancelled() {
    console.log("presence is cancelled");
    // Remove the event listener
    presenceagent.onvisitorsessionstart = null;
    // Reset the UI
    document.getElementById("cobrowsebutton").style.display = "block";
    document.getElementById("waitingforcustomer").style.display = "none";
  }

  document
    .getElementById("cobrowsebutton")
    .addEventListener("click", cobrowseButtonClicked);

  document
    .getElementById("join-with-key")
    .addEventListener("click", function () {
      console.log("You clicked the Join button and the event is ", event);
      var key = document.getElementById("session-key").value;
      launchSession(key);
    });

  document
    .getElementById("presencecancel")
    .addEventListener("click", presenceCancelled);
}

function showConfigs() {
  document.getElementById("configs").style.display = "block";
  document.getElementById("groupid-setting").innerHTML =
    document.getElementById("PartnerID").value;
  document.getElementById("puid-setting").innerHTML =
    document.getElementById("PartnerUserID").value;
  document.getElementById("visitorid-setting").innerHTML =
    document.getElementById("visitorID").value;
}

var addGlanceScriptTag = function () {
  var groupid = document.getElementById("PartnerID").value;
  var presenceAgentTag = document.createElement("script");
  var url =
    "https://ww2.glancecdn.net/cobrowse/CobrowseJS.ashx?groupid=" +
    groupid +
    "&script=PresenceAgent";
  presenceAgentTag.src = url;
  presenceAgentTag.setAttribute("data-groupid", groupid);
  presenceAgentTag.setAttribute("id", "glance-cobrowse");
  document.getElementsByTagName("head")[0].appendChild(presenceAgentTag);
};

document.getElementById("SubmitButton").addEventListener("click", function () {
  console.log("Submit button clicked.");
  // Adding the agent side presence script to the page after the fact to allow for
  // Group ID to be set by user input
  addGlanceScriptTag();
  // Show and hide some html elements
  document.getElementById("login-key").style.display = "none";
  document.getElementById("presence-button").style.display = "block";
  document.getElementById("session-key-join").style.display = "block";
  showConfigs();

  // Kick off the presence flow once the script tag loads
  document.getElementById("glance-cobrowse").onload = (event) => {
    initializePresence();
  };
});
