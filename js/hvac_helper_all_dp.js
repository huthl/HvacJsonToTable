function reBuildTable(hvacData,tableauData) {
    //new data parent since 12.11.24 in HVAC
    let parameterArray = undefined;
    let timeStamp = new Date();
    if (hvacData['data'] !== undefined){
        parameterArray= hvacData['data'] ;
        if (hvacData['updatedAt'] !== undefined){
            timeStamp = hvacData['updatedAt'];
        }
    }
    else{
        parameterArray = hvacData;
    }

    let state = parameterArray['state'];
    let systemState = state['system'];
    let properties = parameterArray['properties'];
    let configuration = parameterArray['configuration'];
    let systemConfiguration = configuration['system'];
    let systemProperties = properties['system'];
    const heatingCircuits = configuration['circuits'];
    const zones = configuration['zones'];

    const heatingCircuitsStates=state['circuits'];
    const zoneStates=state['zones'];

    let dhwStates= undefined;
    //VRC 700
    if(state['domesticHotWater'] !== undefined){
        dhwStates=state['domesticHotWater'] ;
    }
    //VRC 720
    else if (state['dhw'] !== undefined){
        dhwStates=state['dhw'] ;
    }

    const heatingProperties = properties['circuits'];

    let alternativePoint = systemConfiguration['alternativePoint'];
    let systemScheme = systemProperties['systemScheme'];
    let heatingCircuitBivalencePoint = (systemConfiguration['heatingCircuitBivalencePoint']);

    let dhwPrefix = 'dhw';
    if (systemConfiguration['domesticHotWaterBivalencePoint'] !== undefined){
        dhwPrefix ='domesticHotWater';
    }

    let dhwBivalencePoint = systemConfiguration[dhwPrefix + 'BivalencePoint'];
    let dhwMaximumTemperature = systemConfiguration[dhwPrefix + 'MaximumTemperature'];
    let backupHeaterAllowedFor = systemProperties['backupHeaterAllowedFor'];
    let evuCutBehaviour = systemProperties['energyProvidePowerCutBehavior'];

    let header = "<thead><tr><th class='col-4 align-items-end'>Wert</th><th class='col-3 text-right'>Ist-Wert</th></tr></thead>";
    let table = $("#hvacTable");
    table.empty();

    table.append(header);
    table.append("<tbody id='hvacTableBody'></tbody>");

    $("#hvacTableBody").append('<tr><td colspan="3"><strong>System</strong></td></tr>');
    printNumberRow('SystemSchema', systemScheme, tableauData?.hydraulik_einstellwerte_systemschema, '', 0);
    let vr71Config = systemProperties['moduleConfigurationVR71'];
    if(vr71Config !== undefined){
        printNumberRow('VR71 Konfig', vr71Config, '', '', 0);
    }
    let adpativeHeatingCurve = systemConfiguration['adaptiveHeatingCurve'];
    if(adpativeHeatingCurve !== undefined){
        printTextRow('Adaptive Heizkurve', translateBool(adpativeHeatingCurve) , '');
    }
    printNumberRow('Alternativpunkt', alternativePoint, tableauData?.Einst_Alt_Punkt, '°C', 1,false);
    printNumberRow('Bivalenzpunkt-Warmwasser', dhwBivalencePoint, tableauData?.Einst_Biva_WW, '°C', 0);
    printNumberRow('Bivalenzpunkt Heizen', heatingCircuitBivalencePoint, tableauData?.Einst_Biva_HZ, '°C', 0);
    printNumberRow('Max. WW-Temperatur VPM-W', dhwMaximumTemperature, tableauData?.Einst_max_VL_WW, '°C',0);


    let isLegionallaProtectionActivated = systemProperties['isLegionallaProtectionActivated'];
    if(isLegionallaProtectionActivated !== undefined){
        printTextRow('Legionellenschutz aktiv',translateOpMode( isLegionallaProtectionActivated), '', '', 0);
    }
    let smartPhotovoltaicBufferOffset = systemProperties['smartPhotovoltaicBufferOffset'];
    if(smartPhotovoltaicBufferOffset !== undefined){
        printNumberRow('PV Puffer - Offset', smartPhotovoltaicBufferOffset, '', 'K', 0);
    }
    let value = systemProperties['externalEnergyManagementActivation'];
    if(value !== undefined){
        printTextRow('Anforderung externer Energiemanager',translateBool(value), '');
    }
    //printTextRow('Restförderhöhe max.', maxPressurehead, tableauData?.Einst_Restfoerderh_Pumpe, '°C',0);
    if(backupHeaterAllowedFor !== undefined){
        printTextRow('Zusatzheizung für', translateBackupAllowedFor(backupHeaterAllowedFor), '',  );
    }

    printTextRow('EVU Sperre Funktion', translateEvuMode(evuCutBehaviour), tableauData?.Einst_EVU_Sperrk, '');
    $("#hvacTableBody").append('<tr><td colspan="3"><strong>Aktuelle Systemdaten</strong></td></tr>');

    value = systemState['outdoorTemperature'];
    if(value !== undefined){
        printNumberRow('Aussentemperatur', value, '', '°C', 2);
    }
    value = systemState['outdoorTemperatureAverage24h'];
    if(value !== undefined){
        printNumberRow('Aussentemperatur 24h gemittelt', value, '', '°C', 2);
    }
    value = systemState['systemFlowTemperature'];
    if(value !== undefined){
        printNumberRow('Systemvorlauftemperatur', value, '', '°C', 2);
    }
    value = systemState['systemWaterPressure'];
    if(value !== undefined){
        printNumberRow('Heizanlagendruck', value, '', 'bar', 2);
    }
    value = systemState['energyManagerState'];
    if(value !== undefined){
        printTextRow('Status Energiemanager', translateHeatingMode(value), '');
    }
    value = systemState['systemOff'];
    if(value !== undefined){
        printTextRow('System aus', translateBool(value) , '');
    }

    let dhwCircuits=configuration[dhwPrefix] ;
    if(dhwCircuits!==undefined){
    value = systemConfiguration[dhwPrefix+'FlowSetpointOffset'];
    if(value !== undefined){
        printNumberRow('WW Offset auf Vorlaufsolltemperatur', value, '', 'K');
    }
    value = systemConfiguration[dhwPrefix+'Hysteresis'];
    if(value !== undefined){
        printNumberRow('WW Hysterese', value , '','K');
    }
    value = systemConfiguration[dhwPrefix+'MaximumLoadingTime'];
    if(value !== undefined){
        printNumberRow('WW max. Ladezeit', value , '','min.');
    }
    }
    value = systemConfiguration['maxFlowSetpointHeatpumpError'];
    if(value !== undefined){
        printNumberRow('max. Vorlauftemperatur bei WP Fehler', value , '','°C');
    }   value = systemConfiguration['maxFlowSetpointHpError'];
    if(value !== undefined){
        printNumberRow('max. Vorlauftemperatur bei WP Fehler', value , '','°C');
    }

    print_hc_circuit_rows(heatingCircuits, zones, tableauData,heatingProperties,heatingCircuitsStates,zoneStates);

    if(dhwCircuits!==undefined){
        printDhwCircuitRows(dhwCircuits, tableauData, dhwStates);
    }

    printChTimes(zones);
    if(dhwCircuits!==undefined){
        printDhwCircuitTimes(dhwCircuits);
    }

    //let string_table = "<table>" + document.getElementById('hvacTable').innerHTML + "</table>";

    $("#hvacTableBody").append('<tr><td colspan="3">'+
        "<div>Version 1.0.6 - Datensatz vom: " + timeStamp +
        "</div>"+'</td></tr>');
}

function translateBackupAllowedFor(value) {
    switch (value) {
        case 'DHW_AND_HEATING':
        case 'DOMESTIC_HOT_WATER_AND_HEATING':
            return 'Heizen und Warmw.';
        case 'HEATING':
            return 'Heizen';
        case 'DHW':
            return 'Warmwasser';
        case 'DOMESTIC_HOT_WATER':
            return 'Warmwasser';
        case 'DISABLED':
            return 'Deaktiviert';
        default:
            return value;
    }
}

function translateOpMode(value) {
    switch (value) {
        case 'TIME_CONTROLLED':
            return 'Zeitgesteuert';
        case 'MANUAL':
            return 'Manuell (24h)';
        case 'OFF':
            return 'Aus';
        case 'ON':
            return 'An';
        case 'REGULAR':
            return 'Normal';
        case 'NONE':
            return 'Keine';
        case 'DAY':
            return 'Tag';
        case 'Auto':
            return 'Automatisch';
        default:
            return value;
    }
}

function translateEvuMode(value) {
    switch (value) {
        case 'DISABLE_HEATPUMP':
            return 'Wärmepumpe aus';
        case 'DISABLE_HEATPUMP_AND_BACKUP_HEATER':
            return 'WP & ZH aus';
        case 'DISABLE_COOLING':
            return 'Kühlen aus';
        case 'OFF':
            return 'Keine';
        default:
            return value;
    }
}

function translateRoomMode(value) {
    switch (value) {
        case 'NON':
            return 'inaktiv';
        case '---':
            return '---';
        case 'ON':
            return 'Aufschaltung';
        default:
            return value;
    }
}

function translateHeatingMode(value) {
    switch (value) {
        case 'IDLE':
            return 'Bereitschaft';
        case 'HEATING':
            return 'Heizen';
        case 'DIRECT_HEATING_CIRCUIT':
            return 'Heizkreis';
        case 'MIXER_CIRCUIT_EXTERNAL':
            return 'Mischerkreis';
        case 'FIX_VALUE':
            return 'Festwertkreis';
        case 'HEATING_ACTIVE':
            return 'Heizen aktiv';
        case 'HEATING_UP':
            return 'Aufheizen';
        case 'HEATING_STANDBY':
            return 'Bereitschaft';
        case 'STANDBY':
            return 'Bereitschaft';
        case 'HEATING_OFF':
            return 'Aus';
        case 'DHW':
            return "Warmwasser"
        default:
            return value;
    }
}

function translateMixerType(value){
    try{
        switch (value) {
            case 'DIRECT_HEATING_CIRCUIT':
                return 'Direkter Heizkreis';
            case 'MIXER_CIRCUIT_EXTERNAL':
                return 'Mischerkreis ext.';
            case 'FIX_VALUE':
                return 'Festwerkreis';
            case 'HEATING':
                return 'Heizkreis';
            case 'DHW':
                return 'Warmwasser';
            default:
                return value;
        }
    }
    catch {
        return value;
    }
}

function translateBool(value) {
    try{
    switch (value) {
        case false:
            return 'nein / falsch';
        case true:
            return 'ja / wahr';
        default:
            return value;
    }
    }
    catch {return value;}
}



function printNumberRow(dpName, parameterArray, tableauData, unit, precision = 2,warnLowerValue = false) {

    tableauData = tableauData?.replace(",", ".");

    let hvacFloat = parseFloat(parameterArray);
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
 * @param {string} parameterArray
 * @param {string} tableauData
 * @param alert add clas for alert if needed bg-success
 */
function printTextRow(dpName, parameterArray, tableauData, alert = "") {

    let tbody = $("#hvacTableBody");
    tbody.append("<tr>" +
        "<td>" + dpName + "</td>" +
        "<td class='text-right' style='text-align: right;" + alert + "'>" + parameterArray + "</td>" +
        "</tr>");
}

function print_hc_circuit_rows(heatingCircuits, zones, tableauData,heatingProperties,heatingCircuitsStates,zoneStates) {
    heatingProperties.forEach(function (property,index,array){
        let mixerCircuitTypeExternal = property['mixerCircuitTypeExternal'];
        let hcIndex = property['index'] + 1;
        if (mixerCircuitTypeExternal !== undefined && mixerCircuitTypeExternal !=='HEATING'){
            printTextRow('<strong>Heizkreis'+hcIndex+'</strong> eingestellt als' , translateMixerType( mixerCircuitTypeExternal), '', '');
        }
        else{
            let zone = getIndexedDataset(property['index'],zones)
            //printTextRow('<strong>Heizkreis'+hcIndex+'</strong> eingestellt als' , translateMixerType( mixerCircuitTypeExternal), '', '');
            printZone(zone,heatingCircuits, tableauData,heatingProperties,heatingCircuitsStates,zoneStates)
        }

    });
}

function printZone(zone,heatingCircuits,tableauData,heatingProperties,heatingCircuitsStates,zoneStates)  {

        try {
            let hcIndex = zone['index'] + 1;
            let heatingCircuit = heatingCircuits[zone['index']];
            let zoneGeneral = zone['general'];
            let zoneHeating = zone['heating'];
            const heatingType = getHeatingType(zone['index'],heatingProperties)
            let hc_Name = zone['general']['name'];
            let hcOpMode = zone['heating']['operationModeHeating'];
            let hcOpModeName = translateOpMode(hcOpMode);

            $("#hvacTableBody").append('<tr><td colspan="3"><strong>Heizkreis' + hcIndex + ' (' + hc_Name + ')</strong> ' + hcOpModeName + '</td></tr>');
            if (heatingType !== undefined) {
                printTextRow('Heizkreiskonfig ', heatingType[1] + "/" + heatingType[0], '',);
            }
            printNumberRow('Aussentemperaturabschaltgrenze', heatingCircuit['heatDemandLimitedByOutsideTemperature'], tableauData?.['Einst_AT_Abschalt'], '°C', 1,false);
            printNumberRow('Heizkurve', heatingCircuit['heatingCurve'], tableauData?.['tableau_heatingCurve'], '', 2,false);
            printTextRow('Raumaufschaltung', translateRoomMode( heatingCircuit['roomTemperatureControlMode']), '', '', 2,false);
            printNumberRow('Min. Vorlauftemperatur', heatingCircuit['heatingFlowTemperatureMinimumSetpoint'],  tableauData?.['tableau_minVL'] , '°C', 1,false);
            printNumberRow('Max. Vorlauftemperatur', heatingCircuit['heatingFlowTemperatureMaximumSetpoint'],  tableauData?.['tableau_maxVL'], '°C', 1,false);
            $("#hvacTableBody").append('<tr><td colspan="3"><strong>Heizkreis' + hcIndex + ' (' + hc_Name + ')</strong> aktuelle Werte</td></tr>');
            const currentState = getIndexedDataset(zone['index'],heatingCircuitsStates);
            if (currentState !== undefined){
                let value = currentState['currentCircuitFlowTemperature'];
                if(value !== undefined){
                    printNumberRow('Vorlauf-Ist-Temperatur', translateHeatingMode(value), '','°C',2);
                }
                value = currentState['heatingCircuitFlowSetpoint'];
                if(value !== undefined){
                    printNumberRow('Vorlauf-Soll-Temperatur', translateHeatingMode(value), '' ,'°C',2);
                }
                value = currentState['calculatedEnergyManagerState'];
                if(value !== undefined){
                    printTextRow('Energiemanager Soll Status', translateHeatingMode(value), '' );
                }
                value = currentState['circuitState'];
                if(value !== undefined){
                    printTextRow('Energiemanager Ist Status', translateHeatingMode(value), '' );
                }
            }
            const currentZoneState = getIndexedDataset(zone['index'],zoneStates);
            if (currentZoneState !== undefined){
                let value = currentZoneState['currentRoomHumidity'];
                if(value !== undefined){
                    printNumberRow('Aktuelle Raumfeuchte', value, '', '%',2);
                }
                value = currentZoneState['currentRoomTemperature'];
                if(value !== undefined){
                    printNumberRow('Raumtemperatur-Ist', value, '','°C',2 );
                }
                value = currentZoneState['desiredRoomTemperatureSetpoint'];
                if(value !== undefined){
                    printNumberRow('Raumtemperatur-Soll (desiredRoomTemperatureSetpoint)', value, '','°C',2 );
                }
                value = currentZoneState['desiredRoomTemperatureSetpointHeating'];
                if(value !== undefined){
                    printNumberRow('Raumtemperatur-Soll (desiredRoomTemperatureSetpointHeating)', value, '','°C',2 );
                }
                value = currentZoneState['heatingState'];
                if(value !== undefined){
                    printTextRow('Zone-Heizstatus', translateHeatingMode(value), '', );
                }
                value = currentZoneState['currentSpecialFunction'];
                if(value !== undefined){
                    printTextRow('Aktuelle Sonderfunktion', translateOpMode(value), '', );
                }
                value = currentZoneState['quickVetoEndDateTime'];
                if(value !== undefined){
                    printTextRow('QuickVeto-Start-Datum/Zeit', value, '', );
                }
                value = currentZoneState['quickVetoEndDateTime'];
                if(value !== undefined){
                    printTextRow('QuickVeto-End-Datum/Zeit', value, '', );
                }
            }

            let value = zoneHeating['dayTemperatureHeating'];
            if(value !== undefined){
                printNumberRow('Wunschtemperatur Tag', value, '','°C',2);
            }

            value = zoneHeating['manualModeSetpointHeating'];
            if(value !== undefined){
                printNumberRow('Wunschtemperatur Manuell', value, '','°C',2);
            }

            value = zoneHeating['setBackTemperature'];
            if(value !== undefined){
                printNumberRow('Absenktemperatur', value, '', '°C', 2);
            }
             value = zoneGeneral['holidaySetpoint'];
            if(value !== undefined){
                printNumberRow('Ferien Sollwert', value, '', '°C', 2);
            }
            value = zoneGeneral['holidayStartDateTime'];
            if(value !== undefined){
                printTextRow('Ferienprogramm Start', value, '');
            }
            value = zoneGeneral['holidayEndDateTime'];
            if(value !== undefined){
                printTextRow('Ferienprogramm Ende', value, '');
            }
            } catch (e) {
            console.log('Fehler HK Convert ' + e.toLocaleString());
        }
}

function getHeatingType(hcIndex,heatingProperties){
    let resultVal = undefined;
    try{
        heatingProperties.forEach(function (value, index, array){
                if (value['index'] === hcIndex){
                    resultVal = [translateHeatingMode( value['heatingCircuitType']),translateHeatingMode(value['mixerCircuitTypeExternal'])];
                }
            }
        );
   }
    catch (e) {
        console.log(e.toLocaleString());
    }
    return resultVal;
}

function getIndexedDataset(index,inputArray){
    let resultVal  =undefined;
    try{
        inputArray.forEach(function (value){
                if (value['index']===index){
                    resultVal= value;
                }
            }
        );
    }
    catch (e) {
        console.log(e.toLocaleString());
    }
    return resultVal;
}

function printDhwCircuitRows(dhwCircuits, tableauData,dhwCircuitsStates) {
    dhwCircuits.forEach(function (dhwCircuit, index, array) {
        try {
            let dhwIndexName = ''
            if (dhwCircuit['index'] < 255) {
                $("#hvacTableBody").append('<tr><td><strong>Achtung mehrere WW-Kreise ? Bitte prüfen !</td></tr>');
                return;
            }

            let tableau_wwTapSet = 'Einst_Temp_WW';

            let dhwOpMode= undefined;
            //VRC 700
            if(dhwCircuit['operationModeDomesticHotWater'] !== undefined){
                dhwOpMode = dhwCircuit['operationModeDomesticHotWater'] ;
            }
            //VRC 720
            else if (dhwCircuit['operationModeDhw'] !== undefined){
                dhwOpMode = dhwCircuit['operationModeDhw'];
            }
            let dhwOpModeName = translateOpMode(dhwOpMode);

            $("#hvacTableBody").append('<tr><td colspan="3"><strong>WW-Kreis' + dhwIndexName + '</strong> ' + dhwOpModeName +'</td></tr>');
            printNumberRow('WW-Solltemperatur', dhwCircuit['tappingSetpoint'],  tableauData?.[tableau_wwTapSet], '°C',0,false);

            const currentState = getIndexedDataset(dhwCircuit['index'],dhwCircuitsStates);
            if (currentState !== undefined){
                let value = undefined;
                //VRC 700
                if(currentState['currentDomesticHotWaterTemperature'] !== undefined){
                    value = currentState['currentDomesticHotWaterTemperature'] ;
                }
                //VRC 720
                else if (currentState['currentDhwTemperature'] !== undefined){
                    value = currentState['currentDhwTemperature'];
                }
                if(value !== undefined){
                    printNumberRow('WW-Ist-Temperatur', value, '','°C',2 );
                }
                value = currentState['currentSpecialFunction'];
                if(value !== undefined){
                    printTextRow('Aktuelle Sonderfunktion', translateOpMode(value), '', );
                }
            }

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
            let dhwTimesArray = undefined;
            //VRC 700
            if(dhwCircuit['timeProgramDomesticHotWater'] !== undefined){
                dhwTimesArray = dhwCircuit['timeProgramDomesticHotWater'];
            }
            //VRC 720
            else if (dhwCircuit['timeProgramDhw'] !== undefined){
                dhwTimesArray = dhwCircuit['timeProgramDhw'];
            }


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