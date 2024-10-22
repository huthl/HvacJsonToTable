
function reBuildTable(hvacData,tableauData) {
    let systemState = hvacData['state'];
    let properties = hvacData['properties'];
    let configuration = hvacData['configuration'];
    let systemConfiguration = configuration['system'];
    let systemProperties = properties['system'];

    let alternativePoint = systemConfiguration['alternativePoint'];
    let systemScheme = systemProperties['systemScheme'];
    let heatingCircuitBivalencePoint = (systemConfiguration['heatingCircuitBivalencePoint']);
    let dhwBivalencePoint = systemConfiguration['dhwBivalencePoint'];
    let dhwMaximumTemperature = systemConfiguration['dhwMaximumTemperature'];
    let evuCutBehaviour = systemProperties['energyProvidePowerCutBehavior'];

    let header = "<thead><tr><th class='col-4 align-items-end'>Wert</th><th class='col-3 text-right'>Ist-Wert</th></tr></thead>";
    let table = $("#hvacTable");
    table.empty();

    table.append(header);
    table.append("<tbody id='hvacTableBody'></tbody>");

    $("#hvacTableBody").append('<tr><td colspan="3"><strong>System</strong></td></tr>');
    printNumberRow('SystemSchema', systemScheme, tableauData?.hydraulik_einstellwerte_systemschema, '', 0);
    printTextRow('Alternativpunkt', alternativePoint, tableauData?.Einst_Alt_Punkt, '°C', 1);
    printNumberRow('Bivalenzpunkt-Warmwasser', dhwBivalencePoint, tableauData?.Einst_Biva_WW, '°C', 0);
    printNumberRow('Bivalenzpunkt Heizen', heatingCircuitBivalencePoint, tableauData?.Einst_Biva_HZ, '°C', 0);
    printNumberRow('Max. WW-Temperatur', dhwMaximumTemperature, tableauData?.Einst_max_VL_WW, '°C',0);
    //printTextRow('Restförderhöhe max.', maxPressurehead, tableauData?.Einst_Restfoerderh_Pumpe, '°C',0);

    printTextRow('EVU Sperre Funktion', translateEvuMode(evuCutBehaviour), tableauData?.Einst_EVU_Sperrk, '');

    const heatingCircuits = configuration['circuits'];
    const zones = configuration['zones'];
    print_hc_circuit_rows(heatingCircuits, zones, tableauData);
    let dhwCircuits = configuration['dhw'];
    if(dhwCircuits!==undefined){
        printDhwCircuitRows(dhwCircuits, tableauData);
    }

    printChTimes(zones);
    if(dhwCircuits!==undefined){
        printDhwCircuitTimes(dhwCircuits);
    }

    let string_table = "<table>" + document.getElementById('hvacTable').innerHTML + "</table>";


    console.log(string_table);
    var editor = CKEDITOR.instances["p_notice_text"]
    editor.setData(string_table);

    //$('#p_notice_text').val(string_table);

}

function translateOpMode(value) {
    switch (value) {
        case 'TIME_CONTROLLED':
            return 'Zeitgesteuert';
        case 'MANUAL':
            return 'Manuell (24h)';
        case 'OFF':
            return 'Aus';
        default:
            return 'unbekannt';
    }
}

function translateEvuMode(value) {
    switch (value) {
        case 'DISABLE_HEATPUMP':
            return 'Wärmepumpe aus';
        case 'DISABLE_HEATPUMP_AND_BACKUP_HEATER':
            return 'WP & ZH aus';
        case 'OFF':
            return 'Keine';
        default:
            return value;
    }
}



function printNumberRow(dpName, hvacData, tableauData, unit, precision = 2,warnLowerValue = false) {

    tableauData = tableauData?.replace(",", ".");

    let hvacFloat = parseFloat(hvacData);
    let tableauFloat = parseFloat(tableauData);
    let hvac_dp = "-";
    let tbl_dp = "-";
    if (!isNaN(hvacFloat)) {
        hvac_dp = parseFloat(hvacFloat.toFixed(precision));
    }
    if (!isNaN(tableauFloat)) {
        tbl_dp = parseFloat(tableauFloat.toFixed(precision));
    }

    /*let difference = hvac_dp - tbl_dp;
    let alert = ""
    if (difference>0 || isNaN (difference)){
        alert = " background-color:red";
    }
    else if (difference<0 && warnLowerValue){
        alert = " background-color:yellow";
    }*/


    let tbody = $("#hvacTableBody");
    tbody.append("<tr>" +
        "<td class='text-left' >" + dpName + "</td>" +
        "<td class='text-right' style='text-align: right;"+ alert +"'>"   + hvac_dp + " " + unit + "</td>" +
        "</tr>");
}


/**
 * @param {string} dpName
 * @param {string} hvacData
 * @param {string} tableauData
 * @param alert add clas for alert if needed bg-success
 */
function printTextRow(dpName, hvacData, tableauData, alert = "") {

    let tbody = $("#hvacTableBody");
    tbody.append("<tr>" +
        "<td>" + dpName + "</td>" +
        "<td class='text-right' style='text-align: right;" + alert + "'>" + hvacData + "</td>" +
        "</tr>");
}

function print_hc_circuit_rows(heatingCircuits, zones, tableauData) {
    /*
            "heatDemandLimitedByOutsideTemperature": 21.0,
            "heatingCircuitFlowSetpointExcessOffset": 0.0,
            "heatingCurve": 0.8,
            "heatingFlowTemperatureMaximumSetpoint": 55.0,
            "heatingFlowTemperatureMinimumSetpoint": 15.0,
            "index": 0,
            "roomTemperatureControlMode": "NON",
            "setBackModeEnabled": false
    */
    zones.forEach(function (zone, index, array) {
        try {
            let hcIndex = zone['index'] + 1;
            let heatingCircuit = heatingCircuits[zone['index']];
            let tableau_heatingCurve = 'Einst_HK' + hcIndex + '_Kurve';
            let tableau_minVL = 'Einst_HK' + hcIndex + '_min_VL';
            let tableau_maxVL = 'Einst_HK' + hcIndex + '_max_VL';
            let tableau_rtwunsch = 'Einst_RT_Wunsch';
            let hc_Name = zone['general']['name'];
            let hcOpMode = zone['heating']['operationModeHeating'];
            let hcOpModeName = translateOpMode(hcOpMode);

            $("#hvacTableBody").append('<tr><td colspan="3"><strong>Heizkreis' + hcIndex + ' (' + hc_Name + ')</strong> ' + hcOpModeName + '</td></tr>');
            printNumberRow('Aussentemperaturabschaltgrenze', heatingCircuit['heatDemandLimitedByOutsideTemperature'], tableauData?.['Einst_AT_Abschalt'], '°C', 1,false);
            printNumberRow('Heizkurve', heatingCircuit['heatingCurve'], tableauData?.['tableau_heatingCurve'], '', 2,false);
            printNumberRow('Min. Vorlauftemperatur', heatingCircuit['heatingFlowTemperatureMinimumSetpoint'],  tableauData?.['tableau_minVL'] , '°C', 1,false);
            printNumberRow('Max. Vorlauftemperatur', heatingCircuit['heatingFlowTemperatureMaximumSetpoint'],  tableauData?.['tableau_maxVL'], '°C', 1,false);
            printNumberRow('Wunschtemperatur', zone['heating']['manualModeSetpointHeating'], tableauData?.['tableau_rtwunsch'], '°C',1,false);
        } catch (e) {
            console.log('Fehler HK Convert ' + e.toLocaleString());
        }

    });
}


function printDhwCircuitRows(dhwCircuits, tableauData) {
    dhwCircuits.forEach(function (dhwCircuit, index, array) {
        try {
            let dhwIndexName = ''
            if (dhwCircuit['index'] < 255) {
                $("#hvacTableBody").append('<tr><td><strong>Achtung mehrere WW-Kreise ? Bitte prüfen !</td></tr>');
                return;
            }

            let tableau_wwTapSet = 'Einst_Temp_WW';

            let dhwOpMode = dhwCircuit['operationModeDhw'];
            let dhwOpModeName = translateOpMode(dhwOpMode);

            $("#hvacTableBody").append('<tr><td colspan="3"><strong>WW-Kreis' + dhwIndexName + '</strong> ' + dhwOpModeName +'</td></tr>');
            printNumberRow('WW-Solltemperatur', dhwCircuit['tappingSetpoint'],  tableauData?.[tableau_wwTapSet], '°C',0,false);

        } catch (e) {
            console.log('Fehler WW Convert ' + e.toLocaleString());
        }
    });
}

function printChTimes(chZones) {
    chZones.forEach(function (zone, index, array) {
        try {
            let hcIndex = zone['index'] + 1;
            printColSpanText('Heizkreis ' + hcIndex + '-Zeitprogramm')
            const hcTimesArray = zone['heating']['timeProgramHeating'];
            print_times(hcTimesArray, 'Heizkreis ' + hcIndex, 'Bedarf');
        } catch (e) {
            console.log('ch times error ' + e.toLocaleString());
        }
    });
}

function printDhwCircuitTimes(dhwCircuits) {
    dhwCircuits.forEach(function (dhwCircuit, index, array) {
        try {
            printColSpanText('WW-Zeitprogramm')
            if (dhwCircuit['index'] < 255) {
                $("#hvacTableBody").append('<tr><td><strong>Achtung mehrere WW-Kreise ? Bitte prüfen !</td></tr>');
                return;
            }
            const dhwTimesArray = dhwCircuit['timeProgramDhw'];
            const circTimesArray = dhwCircuit['timeProgramCirculationPump'];
            print_times(dhwTimesArray, 'WW-Ladung', 'Bedarf');
            print_times(circTimesArray, 'WW-Zirkulation', 'Bedarf');
        } catch (e) {
            console.log('dhw times error ' + e.toLocaleString());
        }
    });
}


function printColSpanText(text) {
    $("#hvacTableBody").append('<tr><td colspan="3"><strong>' + text + '</td></tr>');
}


function print_times(timesArray, name, preset,presetTemp = undefined) {
    let maxSetPoint = 0;

    for (let slot = 0; slot < 12; slot++) {
        //muss nochmal überarbeitet werden bei Bedarf
        let mondayStart= 0, mondayEnd= 0, tuesdayStart= 0, tuesdayEnd= 0, wednesdayStart= 0, wednesdayEnd= 0, thursdayStart= 0, thursdayEnd= 0,
            fridayStart= 0, fridayEnd= 0, saturdayStart= 0, saturdayEnd= 0, sundayStart= 0, sundayEnd = 0;
        let mondaySetpoint=undefined,tuesdaySetpoint = undefined,wednesdaySetpoint=undefined,thursdaySetpoint=undefined,fridaySetpoint=undefined,saturdaySetpoint=undefined,sundaySetpoint=undefined;


        if ('monday' in timesArray && timesArray['monday'].length>slot) {
            mondayStart = createCtrlTime(timesArray['monday'][slot]['startTime']);
            mondayEnd = createCtrlTime(timesArray['monday'][slot]['endTime']);
            mondaySetpoint= timesArray['monday'][slot]['setpoint'];
        }
        if ('tuesday' in timesArray && timesArray['tuesday'].length>slot) {
            tuesdayStart = createCtrlTime(timesArray['tuesday'][slot]['startTime']);
            tuesdayEnd = createCtrlTime(timesArray['tuesday'][slot]['endTime']);
            tuesdaySetpoint = timesArray['tuesday'][slot]['setpoint'];
        }
        if ('wednesday' in timesArray && timesArray['wednesday'].length>slot) {
            wednesdayStart = createCtrlTime(timesArray['wednesday'][slot]['startTime']);
            wednesdayEnd = createCtrlTime(timesArray['wednesday'][slot]['endTime']);
            wednesdaySetpoint= timesArray['wednesday'][slot]['setpoint'];
        }
        if ('thursday' in timesArray && timesArray['thursday'].length>slot) {
            thursdayStart = createCtrlTime(timesArray['thursday'][slot]['startTime']);
            thursdayEnd = createCtrlTime(timesArray['thursday'][slot]['endTime']);
            thursdaySetpoint= timesArray['thursday'][slot]['setpoint'];
        }
        if ('friday' in timesArray && timesArray['friday'].length>slot) {
            fridayStart = createCtrlTime(timesArray['friday'][slot]['startTime']);
            fridayEnd = createCtrlTime(timesArray['friday'][slot]['endTime']);
            fridaySetpoint= timesArray['friday'][slot]['setpoint'];
        }
        if ('saturday' in timesArray && timesArray['saturday'].length>slot) {
            saturdayStart = createCtrlTime(timesArray['saturday'][slot]['startTime']);
            saturdayEnd = createCtrlTime(timesArray['saturday'][slot]['endTime']);
            saturdaySetpoint= timesArray['saturday'][slot]['setpoint'];
        }
        if ('sunday' in timesArray && timesArray['sunday'].length>slot) {
            sundayStart = createCtrlTime(timesArray['sunday'][slot]['startTime']);
            sundayEnd = createCtrlTime(timesArray['sunday'][slot]['endTime']);
            sundaySetpoint= timesArray['sunday'][slot]['setpoint'];
        }

        maxSetPoint = Math.max(mondaySetpoint??0,tuesdaySetpoint??0,wednesdaySetpoint??0,thursdaySetpoint??0,fridaySetpoint??0,saturdaySetpoint??0,sundaySetpoint??0,maxSetPoint);
        //check maximum comfortemp

        if ((mondayStart === tuesdayStart &&
                mondayStart === wednesdayStart &&
                mondayStart === thursdayStart &&
                mondayStart === fridayStart &&
                mondayStart === saturdayStart &&
                mondayStart === sundayStart) &&
            (mondayEnd === tuesdayEnd &&
                mondayEnd === wednesdayEnd &&
                mondayEnd === thursdayEnd &&
                mondayEnd === fridayEnd &&
                mondayStart === saturdayEnd &&
                mondayStart === sundayEnd)
        ) {
            if (mondayStart!==mondayEnd){
                printTextRow(name + ' Mo-So', mondayStart + ' - ' + mondayEnd, preset);
            }

        } else {
            if (
                (mondayStart === tuesdayStart &&
                    mondayStart === wednesdayStart &&
                    mondayStart === thursdayStart &&
                    mondayStart === fridayStart) &&
                (mondayEnd === tuesdayEnd &&
                    mondayEnd === wednesdayEnd &&
                    mondayEnd === thursdayEnd &&
                    mondayEnd === fridayEnd) &&
                (mondaySetpoint === tuesdaySetpoint &&
                    mondaySetpoint=== wednesdaySetpoint&&
                    mondaySetpoint===thursdaySetpoint&&
                    mondaySetpoint===fridaySetpoint)
            )
            {
                if (mondayStart !== 0 && mondayEnd !== 0 && mondayStart !== mondayEnd){
                    var tempText = mondaySetpoint === undefined? '': ' - ' + mondaySetpoint+' °C' ;
                    printTextRow(name + ' Mo-Fr ', mondayStart + ' - ' + mondayEnd + ' Uhr ' + tempText,preset);
                }
                if (saturdayStart !== 0 && saturdayEnd !== 0 && saturdayStart !== saturdayEnd){
                    var tempText = saturdaySetpoint === undefined? '': ' - ' + saturdaySetpoint+' °C' ;
                    printTextRow(name + ' Sa ', saturdayStart + ' - ' + saturdayEnd + ' Uhr '  + tempText,preset);}
                if (sundayStart !== 0 && sundayEnd !== 0 && sundayStart !== sundayEnd){
                    var tempText = sundaySetpoint === undefined? '': ' - ' + sundaySetpoint+' °C' ;
                    printTextRow(name + ' So ', sundayStart + ' - ' + sundayEnd+ ' Uhr ' + tempText ,preset);}
            } else {
                if (mondayStart !== mondayEnd){
                    var tempText = mondaySetpoint === undefined? '': ' - ' + mondaySetpoint+' °C' ;
                    printTextRow(name +' Mo ', mondayStart + ' - ' + mondayEnd + ' Uhr ' + tempText ,preset);}
                if (tuesdayStart !== tuesdayEnd){
                    var tempText = tuesdaySetpoint === undefined? '': ' - ' + tuesdaySetpoint+' °C' ;
                    printTextRow(name + ' Di ', tuesdayStart + ' - ' + tuesdayEnd + ' Uhr ' + tempText ,preset);}
                if (wednesdayStart !== wednesdayEnd){
                    var tempText = wednesdaySetpoint === undefined? '': ' - ' + wednesdaySetpoint+' °C' ;
                    printTextRow(name + ' Mi ', wednesdayStart + ' - ' + wednesdayEnd+ ' Uhr ' + tempText ,preset);}
                if (thursdayStart !==  thursdayEnd ){
                    var tempText = thursdaySetpoint === undefined? '': ' - ' + thursdaySetpoint+' °C' ;
                    printTextRow(name+ ' Do ', thursdayStart + ' - ' + thursdayEnd+ ' Uhr ' + tempText ,preset);}
                if (fridayStart !==  fridayEnd ){
                    var tempText = fridaySetpoint === undefined? '': ' - ' + fridaySetpoint+' °C' ;
                    printTextRow(name+ ' Fr ', fridayStart + ' - ' + fridayEnd+ ' Uhr ' + tempText ,preset);}
                if (saturdayStart !== saturdayEnd ){
                    var tempText = saturdaySetpoint === undefined? '': ' - ' + saturdaySetpoint+' °C' ;
                    printTextRow(name + ' Sa ', saturdayStart + ' - ' + saturdayEnd + ' Uhr '  + tempText,preset);}
                if (sundayStart !== sundayEnd){
                    var tempText = sundaySetpoint === undefined? '': ' - ' + sundaySetpoint+' °C' ;
                    printTextRow(name + ' So ', sundayStart + ' - ' + sundayEnd+ ' Uhr ' + tempText ,preset);}

            }
        }
    }
    if (presetTemp !== undefined && maxSetPoint > parseFloat(presetTemp)){
        printNumberRow("Max. Komforttemperatur",maxSetPoint,presetTemp,"°C");
        $("#hvacTableBody").append('<tr><td colspan="3"><strong>Hinweis: Max.Komforttemperatur Zeitprogramm höher als empfohlen.</strong></td></tr>');
    }
}

function createCtrlTime(value) {
    if (value == null) return '';
    let minInt = Math.abs((value / 6) % 10);
    minInt=  (minInt.toFixed(1));
    let minVal=0;
    if (minInt==="1.7") minVal=1;
    else if (minInt==="3.3") minVal=2;
    else if (minInt==="5.0") minVal=3;
    else if (minInt==="6.7") minVal=4;
    else if (minInt==="8.3") minVal=5;
    let min = minVal + '0';
    if (value < 60) {
        return '0:' + min;
    } else { //60 /6=1
        let rest = (((value / 6) - minInt) / 10).toFixed(0);
        let hour = rest.toString();
        return hour + ':' + min;
    }
}