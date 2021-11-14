function $$(id) {
  return document.getElementById(id);
}

function storeSettings(){
  var settings = []

  // Get values
  settings.push({'partnerID': $$("PartnerID").value})
  settings.push({'puid': $$("PartnerUserID").value})
  settings.push({'visitorID': $$("visitorID").value})
  settings.push({'timeout': $$("Timeout").value})
  settings.push({'openSessionIn': $$("open-session-in").value})
  settings.push({'authKeySelect': $$("auth-key-select").value})
  settings.push({'openSessionIn': $$("open-session-in").value})

  // Don't store API key
  if ($$("auth-key-select").value === "login-key"){
    settings.push({'authkey': $$("auth-key").value})
  }

  // Set values
  settings.forEach((setting, index) => {
    localStorage.setItem(`${Object.keys(setting)[0]}`, `${Object.values(setting)[0]}`)
  });

}

function setSettings(){
  $$("PartnerID").value = localStorage.getItem('partnerID')
  $$("auth-key").value = localStorage.getItem('authkey')
  $$("auth-key-select").value = localStorage.getItem('authKeySelect')
  $$("PartnerUserID").value = localStorage.getItem('puid')
  $$("visitorID").value = localStorage.getItem('visitorID')
  $$("Timeout").value = localStorage.getItem('timeout')
  $$("open-session-in").value = localStorage.getItem('openSessionIn')


// Set some defaults
  if (localStorage.getItem('authKeySelect')){
      $$("auth-key-select").value = localStorage.getItem('authKeySelect')
  } else {
      $$("auth-key-select").value = "api-key"
  }

  if (localStorage.getItem('authKeySelect') === "api-key"){
      $$("auth-key").value = ""
  } else {
      $$("auth-key").value = localStorage.getItem('authkey')
  }

  if (localStorage.getItem('timeout')){
      $$("Timeout").value = localStorage.getItem('timeout')
  } else {
      $$("Timeout").value = 3600
  }

  if (localStorage.getItem('openSessionIn')){
      $$("open-session-in").value = localStorage.getItem('openSessionIn')
  } else {
      $$("open-session-in").value = "browser"
  }
}

function authSelectChange(event){
  if ($$("auth-key-select").value === "login-key") {
    $$("auth-key").value = localStorage.getItem('authkey')
  } else if ($$("auth-key-select").value === "api-key") {
    $$("auth-key").value = ""
  }
}

window.addEventListener('DOMContentLoaded', (event) => {
  setSettings()
  $$("SubmitButton").addEventListener("click", storeSettings)
  $$("auth-key-select").addEventListener("change", authSelectChange)
});
