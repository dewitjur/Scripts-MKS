// ==UserScript==
// @name         Credits Missionheader
// @namespace    http://tampermonkey.net/
// @version      1.0.0
// @description  Shows a label with the average credits of the mission in the missionheader
// @author       JRH1997
// @match        https://www.meldkamerspel.com/missions/*
// @grant        none
// ==/UserScript==

(function() {
    'use strict';

    var html_str;
    var label;
    var credits;

    var requirements;

    function getRequirements()
    {
        return new Promise(resolve => {
            $.ajax({
                url: "https://www.meldkamerspel.com/einsaetze.json",
                method: "GET",
            }).done((res) => {
                resolve(res);
            });
        });
    }

   function beautifyCredits(credits)
    {
        return credits.toString().replace(/(\d)(?=(\d{3})+(?!\d))/g, '$1.');
    }

async function init()
    {
        let missionH1 = $("#missionH1");

        //console.log(await getCredits(3));
        if(sessionStorage.getItem("LSS_Missionrequirements") == null)
        {
            requirements = await getRequirements();
            sessionStorage.setItem("LSS_Missionrequirements", JSON.stringify(requirements));
        }
        else
        {
            requirements = JSON.parse(sessionStorage.getItem("LSS_Missionrequirements"));
        }

        await getlabel()

        let html = `<br>&nbsp&nbsp&nbsp&nbsp
		<span class="label ` + label + `"> <span id='html_str'> - </span></span>
		`;

		let Creditsintitle = missionH1.append(html);

        calculate();
	}
async function calculate()
    {
        var credits = 0;
        var help = $("#navbar-right-help-button");
        var HelpButton = help.find("a[id*='mission_help']").parent().parent().parent();
        //if($(t).parent().css("display") == "none") return;
        let missionId = $('#mission_help').attr('href').split("/").pop().replace(/\?.*/, '');
        if(missionId == "null") return;
        if (requirements.filter(e => e.id == parseInt(missionId))[0] == undefined)
        {
            sessionStorage.clear("LSS_Missionrequirements")
            requirements = await getRequirements();
            sessionStorage.setItem("LSS_Missionrequirements", JSON.stringify(requirements));
            requirements = JSON.parse(sessionStorage.getItem("LSS_Missionrequirements"));
            let mission = requirements.filter(e => e.id == parseInt(missionId))[0];
            //var credits = requirements[parseInt(missionId)].average_credits || 0;
            let missionCredits = mission.average_credits || 0;
            credits += missionCredits;
        }
        else
        {
            let mission = requirements.filter(e => e.id == parseInt(missionId))[0];
            //var credits = requirements[parseInt(missionId)].average_credits || 0;
            let missionCredits = mission.average_credits || 0;
            credits += missionCredits;
        }
        if (credits == 0)
            $("#html_str").text `Alleen Ambulance`;
        else
            $("#html_str").text(beautifyCredits(credits) + ` Credits`);
    }
async function getlabel()
    {
        var credits = 0;
        var help = $("#navbar-right-help-button");
        var HelpButton = help.find("a[id*='mission_help']").parent().parent().parent();
        //if($(t).parent().css("display") == "none") return;
        let missionId = $('#mission_help').attr('href').split("/").pop().replace(/\?.*/, '');
        if(missionId == "null") return;
        if (requirements.filter(e => e.id == parseInt(missionId))[0] == undefined)
        {
            sessionStorage.clear("LSS_Missionrequirements")
            requirements = await getRequirements();
            sessionStorage.setItem("LSS_Missionrequirements", JSON.stringify(requirements));
            requirements = JSON.parse(sessionStorage.getItem("LSS_Missionrequirements"));
            let mission = requirements.filter(e => e.id == parseInt(missionId))[0];
            //var credits = requirements[parseInt(missionId)].average_credits || 0;
            let missionCredits = mission.average_credits || 0;
            credits += missionCredits;
        }
        else
        {
            let mission = requirements.filter(e => e.id == parseInt(missionId))[0];
            //var credits = requirements[parseInt(missionId)].average_credits || 0;
            let missionCredits = mission.average_credits || 0;
            credits += missionCredits;
        }
        if (credits == 0) {label = 'label-warning'}
        else if (credits >= 8000) {label = 'label-danger'}
        else if (credits >= 4500) {label = 'label-success'}
        else {label = 'label-primary'}
    }

let missionHelp = $('#mission_help');
  if (missionHelp.length > 0) {
init ();
  }
})();