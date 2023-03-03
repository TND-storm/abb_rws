// (c) Copyright 2021 ABB
//
// Any unauthorized use, reproduction, distribution,
// or disclosure to third parties is strictly forbidden.
// ABB reserves all rights regarding Intellectual Property Rights

// declare variables in the global scope.
var myButton;
var myDecButton;
var myDigital;
var mySwitch;
var myInput;
var myChart;
var myDropdown;
var mySubmitBtn;
var myToggle;
var myIOData;
var myIOToggleData;
var myStringData;
var myBoolData;
var chartModel = [[0, 0]];
var chartCounter = 1;
// change signalName to valid I/O signal name.
var signalName = "TestSignal";
var toggleSignalName = "ToggleSignal";

// wait for HTML to finish loading before initiating any components.
window.addEventListener("load", async function () {

    // uncomment line below to enable debug console
    fpComponentsEnableLog();

    // wrap everything in a generic try catch in order to catch any potential error not already caught.
    try {
        /* CREATE INCREMENT BUTTON */

        myButton = new FPComponents.Button_A();
        myButton.attachToId("myIncreaseBtn");
        myButton.text = "+";
        myButton.onclick = async function () {

            let value = await myRapidData.getValue();
            value = Number.parseInt(value);
            value += 10;
            try {
                await myRapidData.setValue(value);
            } catch (e) {
                FPComponents.Popup_A.message(e.message, [e.httpStatus.code, e.controllerStatus.name, e.controllerStatus.description]);
            }
        };

        /* CREATE DECREASE BUTTON */
        myDecButton = new FPComponents.Button_A();
        myDecButton.attachToId("myDecreaseBtn");
        myDecButton.text = "-";
        myDecButton.onclick = async function () {

            let value = await myRapidData.getValue();
            value = Number.parseInt(value);
            value -= 10;
            try {
                await myRapidData.setValue(value);
            } catch (e) {
                FPComponents.Popup_A.message(e.message, [e.httpStatus.code, e.controllerStatus.name, e.controllerStatus.description]);
            }
        }

        /* CREATE DIGITAL INDICATOR */
        myDigital = new FPComponents.Digital_A();
        myDigital.desc = "TestSignal";
        myDigital.attachToId("myDigitalDiv");
        myDigital.onclick = async function () {
            var setValue = myDigital.active ? 0 : 1;
            myDigital.active = !myDigital.active

            try {
                await myIOData.setValue(setValue);
            } catch (e) {
                FPComponents.Popup_A.message(e.message, [e.httpStatus.code, e.controllerStatus.name, e.controllerStatus.description]);
            }

        };

        /* CREATE SWITCH COMPONENT */
        mySwitch = new FPComponents.Switch_A();
        mySwitch.attachToId("mySwitchDiv");
        mySwitch.onchange = async function (active) {
            console.log(active);
            handleSwitchChange(active);
        }

        function handleSwitchChange(active) {
            var message = `Do you really want to set ${myBoolData.getName()} to ${active ? "true" : "false"}?`;
            FPComponents.Popup_A.confirm("Are you sure?", message, function (action) {
                if (action == FPComponents.Popup_A.OK) {
                    changeBoolData();
                } else if (action == FPComponents.Popup_A.CANCEL) {
                    // reset switch to value before change.
                    mySwitch.active = !active;
                }
            })
        }

        async function changeBoolData() {
            let value = await myBoolData.getValue();
            console.log("value is " + value);

            try {
                // we set the value to inverse of current value. If value is true, we set to false and vice versa.
                await myBoolData.setValue(!value);
            } catch (e) {
                FPComponents.Popup_A.message(e.message, [e.httpStatus.code, e.controllerStatus.name, e.controllerStatus.description]);
            }
        }

        /* CREATE INPUT COMPONENT */
        myInput = new FPComponents.Input_A();
        myInput.attachToId("myInput");
        myInput.text = "";

        mySubmitBtn = new FPComponents.Button_A();
        mySubmitBtn.attachToId("mySubmitBtn");
        mySubmitBtn.text = "Save";
        mySubmitBtn.onclick = async () => {
            var txt = myInput.text;

            try {
                await myStringData.setValue(txt);
            } catch (e) {
                FPComponents.Popup_A.message(e.message, [e.httpStatus.code, e.controllerStatus.name, e.controllerStatus.description]);
            }
        }

        /* CREATE DROPDOWN COMPONENT */
        myDropdown = new FPComponents.Dropdown_A();
        myDropdown.model = {
            items: [
                "10",
                "20",
                "30",
                "40",
                "50",
                "60",
                "70",
                "80",
                "90"
            ]
        }

        myDropdown.selected = 1;
        myDropdown.onselection = async function (index, obj) {
            var value = parseInt(obj);
            try {
                await myRapidData.setValue(value);
            } catch (e) {
                FPComponents.Popup_A.message(e.message, [e.httpStatus.code, e.controllerStatus.name, e.controllerStatus.description]);
            }
        }

        myDropdown.attachToId("myDropdown");

        /* CREATE CHART COMPONENT */
        myChart = new FPComponents.Linechart_A();
        myChart.width = 300;
        myChart.height = 200;
        myChart.model = [
            {
                points: chartModel
            },
        ];

        myChart.attachToId("chart-default");


        /* CREATE TOGGLE COMPONENT */
        myToggle = new FPComponents.Toggle_A();
        myToggle.model = [
            { text: "Value 0" },
            { text: "Value 1" },
            { text: "Value 2" }
        ];
        myToggle.attachToId("myToggle");
        myToggle.setToggled(0, true);
        myToggle.onclick = async (state) => {
            var activeButton = state.changed.find(item => item[1] == true);
            var setValue = activeButton[0];
            
            try {
                await myIOToggleData.setValue(setValue);
            } catch (e) {
                FPComponents.Popup_A.message(e.message, [e.httpStatus.code, e.controllerStatus.name, e.controllerStatus.description]);
            }
        }



        /* SUBSCRIBE TO IO SIGNAL */
        try {
            myIOData = await RWS.IO.getSignal(signalName);
            myIOData.addCallbackOnChanged(async (newValue) => {
                // first time this is called, newValue is undefined.
                if (newValue == undefined) {
                    newValue = await myIOData.getValue();
                }

                // since 1 and 0 work for true or false we can use the new value directly to set UI status.
                myDigital.active = newValue;
            })
            await myIOData.subscribe(true);
        } catch (e) {
            FPComponents.Popup_A.message(e.message, [e.message, `Couldn't find I/O with name ${signalName}`]);
        }

        /* SUBSCRIBE TO TOGGLE I/O SIGNAL */
        try{
            myIOToggleData = await RWS.IO.getSignal(toggleSignalName);
            myIOToggleData.addCallbackOnChanged(async (newValue) => {
                if(newValue == undefined) {
                    newValue = await myIOToggleData.getValue();
                }
                // set toggle to active IO.
                myToggle.setToggled(newValue, true);
            });

            await myIOToggleData.subscribe(true);
        } catch (e) {
            FPComponents.Popup_A.message(e.message, [e.message, `Couldn't find I/O with name ${toggleSignalName}`]);
        }


        /* SUBSCRIBE TO RAPID VARIABLE */
        myRapidData = await RWS.Rapid.getData("T_ROB1", "Example", "counter");
        myRapidData.addCallbackOnChanged(async function (value) {

            // add new value to the chart array
            chartModel.push([chartCounter, value]);
            // increase counter to increase x value of chart axis, for next update.
            chartCounter++;
            // set the new array in the model.
            myChart.model = [
                {
                    points: chartModel
                }
            ]

            // explicitly set the chartmodel.
            // TODO, is it necessary?
            // myChart.model = myChart.model;


            // update output div with rapid value.
            document.getElementById("outputDiv").textContent = value;

        });
        await myRapidData.subscribe(true);

        /* SUBSCRIBE TO STRING RAPID VARIABLE */
        myStringData = await RWS.Rapid.getData("T_ROB1", "Example", "myName");
        myStringData.addCallbackOnChanged(async function (value) {

            // since value provided in callback is Raw value we use getValue to get cleaned up value, in order to display without quotation marks.
            var val = await myStringData.getValue();
            myInput.text = val;

        });
        await myStringData.subscribe(true);

        /* SUBSCRIBE TO STRING BOOL VARIABLE */
        myBoolData = await RWS.Rapid.getData("T_ROB1", "Example", "isValid");
        myBoolData.addCallbackOnChanged(async function (value) {

            var val = await myBoolData.getValue();
            mySwitch.active = val;

        });
        await myBoolData.subscribe(true);

    } catch (e) {
        var err = JSON.stringify(e);
        console.log(err);
        console.log(e);
        FPComponents.Popup_A.message("Something went wrong!", "Application might not work as intended");
    }

    this.initMenu();
    this.initView();
});

var initMenu = function () {
    var menu = new FPComponents.Menu_A();
    menu.model = {
        content: [
            {
                type: "gap"
            },
            {
                type: "label",
                label: "RWS Example Menu"
            },
            {
                type: "gap"
            },
            {
                type: "button",
                label: "RAPID examples",
                arrow: true,
                onclick: function () {
                    var IOView = document.getElementById("io-view");
                    IOView.style.display = "none";

                    var mainView = document.getElementById("main-view");
                    mainView.style.display = "flex";
                }
            },
            {
                type: "button",
                label: "I/O examples",
                arrow: true,
                onclick: function () {
                    var mainView = document.getElementById("main-view");
                    mainView.style.display = "none";

                    var IOView = document.getElementById("io-view");
                    IOView.style.display = "flex";
                }
            }
        ]
    }

    menu.attachToId("menu-main");
}

var initView = function () {
    var mainView = document.getElementById("main-view");
    mainView.style.display = "flex";
}

// Here we should do things that should happen when app activate.
var appActivate = async function () {
    console.log("subscribe");
    // subscribe to data
    if (myBoolData) {
        await myBoolData.subscribe(true);
    }

    if (myStringData) {
        await myStringData.subscribe(true);
    }

    if (myRapidData) {
        await myRapidData.subscribe();
    }

    if (myIOData) {
        await myIOData.subscribe(true);
    }


    return true;
}

// Here we should do things that should happen right before app deactivates.
var appDeactivate = async function () {
    console.log("unsubscribe");
    // unsubscribe to data
    if (myBoolData) {
        await myBoolData.unsubscribe();
    }

    if (myStringData) {
        await myStringData.unsubscribe();
    }

    if (myRapidData) {
        await myRapidData.unsubscribe();
    }

    if (myIOData) {
        await myIOData.unsubscribe();
    }

    return true;
}