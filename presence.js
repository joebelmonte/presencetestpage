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

function GenerateLoginKey() {
  var version = 1;
  var partnerid = $$("PartnerID").value;
  var partneruserid = $$("PartnerUserID").value;
  var apikey = $$("APIKey").value;
  var timeout = parseInt($$("Timeout").value, 10);

  var expires = UTCTimestamp() + timeout;
  var validuntil = UTCValidUntil(expires);
  var keystring = partnerid + partneruserid + version + expires;
  var hmac = CryptoJS.HmacSHA256(keystring, apikey);
  var hmacb64 = hmac.toString(CryptoJS.enc.Base64);
  var loginkey = "$" + version + "$" + expires + "$" + hmacb64.substr(0, 43);

  var server = "https://www.glance.net";
  console.log("the login key is " + loginkey);
  return loginkey;
}

function initializePresence() {
  function showpresence() {
    var visitorid = $$("visitorID").value;
    // Construct a new Presence Agent object
    presenceagent = new GLANCE.Presence.Agent({
      visitorid: visitorid
    });

    // Setup event handlers
    presenceagent.onvisitorconn = function(e) {
      // visitor is connecting via websocket and can be signaled
      // display a "connected" status, e.g. light up a cobrowse button
      console.log("in onvisitorconn and e is ", e);
      // Toggle the color of the button to blue/orange when visitor logs in or out
      if (e.connected) {
        document.getElementById("cobrowsebutton").style.background = "#F86717";
      }
      if (!e.connected) {
        // Visitor connection drops to turn the button blue and remove info about visitor browser/url
        document.getElementById("cobrowsebutton").style.background = "#33aae1";
        document.getElementById("visitorurl").innerHTML = "";
        document.getElementById("visitorbrowser").innerHTML = "";
        document.getElementById("visitorbrowserversion").innerHTML = "";
        document.getElementById("visitorplatform").innerHTML = "";
      }
    };
    presenceagent.onpresence = function(e) {
      // visitor posted new presence information
      // display presence information, e.g. new e.url
      console.log("in onpresence and e is ", e);
      document.getElementById("visitorurl").innerHTML = e.url;
      document.getElementById("visitorbrowser").innerHTML = e.browser;
      document.getElementById("visitorbrowserversion").innerHTML = e.browserver;
      document.getElementById("visitorplatform").innerHTML = e.platform;
    };

    // listen for when the showTerms is displayed on the visitor side
    presenceagent.onterms = function(e) {
      console.log("in onterms and e is ", e);
      // If visitor accepts terms, then listen for the session to start.
      // Once the session starts on the visitor side, launch the session on the agent side.
      if (e.status === "accepted") {
        presenceagent.onvisitorsessionstart = function() {
          console.log("i heard the session start");
          var visitorid = $$("visitorID").value;
          launchSession(visitorid);
          console.log("the visitor id is ", visitorid);
        };
      }
      // If the visitor declines the session, show an alert for the agent.
      if (e.status === "declined") {
        console.log("visitor declined session");
        alert("Visitor declined session... =(");
      }
    };
    // Connect the agent so it can receive the above events
    presenceagent.connect();

    // Lookup the visitor to see if he is already present
    presenceagent.lookupVisitor({
      onsuccess: function(visitordata) {
        console.log(
          "lookupVisitor successful and visitordata is ",
          visitordata
        );
        document.getElementById("visitorplatform").innerHTML =
          visitordata.platform;
      },
      onfail: function(reason) {
        console.log("lookupVisitor not successful and reason is ", reason);
      }
    });
  }

  GLANCE.Authorization.authorize({
    service: "presence",
    credentials: {
      partnerid: $$("PartnerID").value,
      partneruserid: $$("PartnerUserID").value,
      loginkey: GenerateLoginKey()
    },
    groupid: $$("PartnerID").value,
    duration: 20,
    onsuccess: showpresence,
    onfail: function(reason) {
      console.log("authorization failed and the reason is ", reason);
    }
  });

  function launchSession(visitorid) {
    var visitorid = visitorid;
    var partnerid = $$("PartnerID").value;
    var partneruserid = $$("PartnerUserID").value;
    var loginkey = GenerateLoginKey();

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
    presenceagent.invokeVisitor({
      func: "GLANCE.Cobrowse.Visitor.showTerms",
      args: {
        sessionKey: $$("visitorID").value
      }
    });
  }

  function cobrowseButtonClicked() {
    console.log("the cobrowse button was clicked!");
    // Need to check if the visitor is connected.  If yes, then launch a cobrowse Session
    // If not, then change the button to accept a code
    presenceagent.lookupVisitor({
      onsuccess: function(visitordata) {
        console.log(
          "within cobrowseButtonClicked lookupVisitor successful and visitordata is ",
          visitordata
        );
        if (visitordata.visitorid) {
          showTerms(visitordata);
          document.getElementById("cobrowsebutton").style.display = "none";
          document.getElementById("waitingforcustomer").style.display = "block";
        }
        if (!visitordata.visitorid) {
          document.getElementById("presence-button").style.display = "none";
          document.getElementById("session-key-join").style.display = "block";
        }
      },
      onfail: function(reason) {
        console.log("lookupVisitor not successful and reason is ", reason);
      }
    });
  }

  function presenceCancelled() {
    console.log("presence is cancelled");
    document.getElementById("cobrowsebutton").style.display = "block";
    document.getElementById("waitingforcustomer").style.display = "none";
  }

  function sessionKeyJoinCancel() {
    console.log("in sessionKeyJoinCancel");
    document.getElementById("presence-button").style.display = "block";
    document.getElementById("session-key-join").style.display = "none";
  }

  document
    .getElementById("cobrowsebutton")
    .addEventListener("click", cobrowseButtonClicked);

  document
    .getElementById("join-with-key")
    .addEventListener("click", function() {
      console.log("You clicked the Join button and the event is ", event);
      var key = document.getElementById("session-key").value;
      launchSession(key);
    });

  document
    .getElementById("presencecancel")
    .addEventListener("click", presenceCancelled);

  document
    .getElementById("session-key-join-cancel")
    .addEventListener("click", sessionKeyJoinCancel);
}

document.getElementById("SubmitButton").addEventListener("click", function() {
  console.log("Submit button clicked ", event);
  // Adding the agent side presence script to the page after the fact to allow for
  // Group ID to be set by user input
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
  document.getElementById("login-key").style.display = "none";
  document.getElementById("presence-button").style.display = "block";
  // setTimeout(function() {
  //   initializePresence();
  // }, 1000);
  document.getElementById("glance-cobrowse").onload = event => {
    initializePresence();
  };
});
