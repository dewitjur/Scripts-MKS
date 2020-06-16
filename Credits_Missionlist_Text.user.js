// ==UserScript==
// @name         Credits Missionlist Text
// @namespace    http://tampermonkey.net/
// @version      4.0.9
// @description  Credits in Missionlist in Text
// @author       JRH1997
// @match        https://www.meldkamerspel.com/
// @grant        none
// ==/UserScript==

(function() {
    'use strict';

    var requirements;
    var credits ='';
    var html_str

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
    };

    init();

    // missionMarkerAdd
    var original_func = missionMarkerAdd;

    // this function is called when a mission is mutated
    missionMarkerAdd = function(e) {
        original_func.apply(this, arguments);

        mutations(e);
    }

    async function mutations(e)
    {
        var Missions = $('.missionSideBarEntry');
        var added = false;

        for (var i = 0; i < Missions.length; i++)
        {
            var childs = Missions[i].firstElementChild.firstElementChild.children;
            var existing = false;

            if (e.id != Missions[i].getAttribute('mission_id')) continue;

            if(sessionStorage.getItem("LSS_Missionrequirements") == null)
            {
                requirements = await getRequirements();
                sessionStorage.setItem("LSS_Missionrequirements", JSON.stringify(requirements));
            }
            else
            {
                requirements = JSON.parse(sessionStorage.getItem("LSS_Missionrequirements"));
            }

            // check if element is existing
            for (var ic = 0; ic < childs.length; ic++)
            {
                if(childs[ic].className == 'creditsmissionlist')
                {
                   existing = true;
                   break;
                }
            }

            if(existing == true && e.mtid != undefined)
            {
                for(var ic2 = 0; ic2 < childs.length; ic2++)
                {
                    if(childs[ic2].className != 'creditsmissionlist') continue;
                    let credits = gettypecredits(e.mtid).average_credits || 0;

                    gethtml_str(credits);

                    var child = childs[ic2];
                    Missions[i].firstElementChild.firstElementChild.removeChild(child);
                    child.innerHTML = html_str;
                    Missions[i].firstElementChild.firstElementChild.appendChild(child);
                }
            }
            else //create
            {
                if(Missions[i].getAttribute('mission_type_id') == 'null') continue;

                let credits = gettypecredits(Missions[i].getAttribute('mission_type_id')).average_credits || 0;

                gethtml_str(credits);

                var div_elem = document.createElement('div');

                div_elem.innerHTML = html_str;
                div_elem.setAttribute("class", "creditsmissionlist");
                div_elem.setAttribute("id", "creditsmissionlist_" + Missions[i].getAttribute('mission_id'));
                Missions[i].firstElementChild.firstElementChild.appendChild(div_elem);
            }
        }
    }

    async function init()
    {
        // clear
        $('.creditsmissionlist').remove();

        // get  mission list
        var Missions = $('.missionSideBarEntry');

        sessionStorage.clear("LSS_Missionrequirements")
        requirements = await getRequirements();
        sessionStorage.setItem("LSS_Missionrequirements", JSON.stringify(requirements));
        requirements = JSON.parse(sessionStorage.getItem("LSS_Missionrequirements"));

        // add info to mission
        for (var i = 0; i < Missions.length; i++)
        {
            if (Missions[i].getAttribute('mission_type_id') == 'null') continue;

            let credits = gettypecredits(Missions[i].getAttribute('mission_type_id')).average_credits || 0;

            gethtml_str(credits);

            var div_elem = document.createElement('div');
            div_elem.innerHTML = html_str;
		        div_elem.setAttribute("class", "creditsmissionlist");
            div_elem.setAttribute("id", "creditsmissionlist_" + Missions[i].getAttribute('mission_id'));

            // add div element
            Missions[i].firstElementChild.firstElementChild.appendChild(div_elem);
        }
    }

    function gettypecredits(type)
    {
        return requirements.filter(e => e.id == [type])[0];
    }
    function gethtml_str(credits)
    {
        if (credits == 0) html_str = `Alleen Ambulance`
        else html_str = 'Gem. ' + credits.toString().replace(/(\d)(?=(\d{3})+(?!\d))/g, '$1.') + ' Credits';
    }
})();
