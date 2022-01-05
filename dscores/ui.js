class ViewStack {
    constructor() {
        this.views = [$("#defaultView")];
    }

    top() {
        return this.views[this.views.length - 1];
    }

    pushView(view) {
        let previous = this.top();
        this.views.push(view);
        previous.hide();
        view.show();
        $("#viewNav").show();
    }

    popView() {
        let current = this.views.pop();

        if (current.attr("id") === "categoryTableView") {
            $("#categoryTable").empty();
        } else if (current.attr("id") === "elementTableView") {
            $("#elementTable").empty();
        }
    
        current.hide();
        if (this.top().attr("id") === "defaultView") {
            $("#viewNav").hide();
        }
        this.top().show();
    }

    unwind() {
        $(".dynamicTable").empty();
        $("#viewNav").hide();
        this.top().hide();
        this.views = [$("#defaultView")];
        this.top().show();
    }
}

let viewStack = new ViewStack();
let elementStackID = null;

function switchApparatus(newApparatus) {
    let choice = true;
    if (!routine.isEmpty()) {
        choice = confirm("Are you sure you want to switch to a different apparatus?\nYou will lose any progress made on your current routine.");
    }

    if (choice === true) {
        $("#" + apparatus).removeClass("activeApp");
        $("#" + newApparatus).addClass("activeApp");

        apparatus = newApparatus;
        reset();
        viewStack.unwind();
        switch (newApparatus) {
            case "vault":
                $(".collapsible").hide();
                $("#scoreDetails").hide();
                buildCategoryTable();
                $("#viewNav").hide();
                break;
            case "bars":
                $("#valuesContainer").show();
                $("#acroValuesContainer").hide();
                $("#danceValuesContainer").hide();
                $(".collapsible").show();
                $(".collapsible").removeClass("activeIcon");
                $("#scoreDetails").hide();       
                break;
            default:
                $("#valuesContainer").hide();
                $("#acroValuesContainer").show();
                $("#danceValuesContainer").show();
                $(".collapsible").show();
                $(".collapsible").removeClass("activeIcon");
                $("#scoreDetails").hide();       
                break;
        }
        // toggle header button
    }
}

function reset() {
    routine = new RoutineClass[apparatus]();
    elementStackID = null;
    $("#elements").empty();
    $("#scoreTotal").text("0.0");
    $("#values").text("DV:");
    $("#acroValues").text("Acro:");
    $("#danceValues").text("Dance:");
    $("#dismount").text("Dismount:");
    $("#scoreCV").text("CV: 0.0");
    $("#scoreCR").text("CR: 0.0");
    $("#scoreNotes").empty();
    // update buttons
}

function buildCategoryTable() {
    let categories = routine.getCategories(elementStackID);
    categories.forEach(category => {
        let row = $("<tr></tr>");
        let cell = $("<td></td>").text(category);
        cell.addClass("interactiveCell");
        row.append(cell);
        $("#categoryTable").append(row);
    });
    
    viewStack.pushView($("#categoryTableView"));
}

function imageNotFound() {
    $("#elementImage").hide();
    $("#imageSourcedFrom").hide();
    $("#imageNotFound").show();
}

function writeElementStack(element) {
    let elementStack = $("<div></div>");
    elementStack.addClass("stack");
    elementStack.attr("id", elementStackID);

    let deleteButton = $("<button>&times;</button>");
    deleteButton.addClass("delStack");
    elementStack.append(deleteButton);

    let stackText = $("<span></span>").text(getName(element) + " (" + getValue(element) + ")");
    elementStack.append(stackText);

    let popButton = $("<button></button>").text("\u232B");
    popButton.addClass("popStack");
    elementStack.append(popButton);

    let addButton = $("<button></button>").text("\uFF0B");
    addButton.addClass("addStack");
    elementStack.append(addButton);

    $("#elements").append(elementStack);
}

function rewriteElementStack() {
    let elementStack = routine.getStack(elementStackID);
    if (!elementStack) {
        $("#" + elementStackID).remove();
    } else {
        let elements = elementStack.elements;
        let text = ""

        for (var i = 0; i < elements.length; i++) {
            if (i > 0) {
                text += " + ";
            }
    
            text += getName(elements[i]) + " (" + getValue(elements[i]) + ")";
        }
    
        if (elementStack.cv >= 1) {
            text += " [" + convertToDouble(elementStack.cv) + "]";
        }
    
        $("#" + elementStackID).children()[1].textContent = text;
    }
}

function updateScore() {
    $("#scoreTotal").text(convertToDouble(routine.score));
    if (apparatus == "vault") {
        return;
    }
    if (apparatus === "bars") {
        $("#values").text("DV: " + routine.values);
    } else {
        $("#acroValues").text("Acro: " + routine.acroValues);
        $("#danceValues").text("Dance: " + routine.danceValues);
    }
    $("#dismount").text("Dismount: " + alpha[routine.dismount]);
    $("#scoreCV").text("CV: " + convertToDouble(routine.CV));
    $("#scoreCR").text("CR: " + convertToDouble(routine.CR));
    
    text = ""
    routine.notes.forEach(note => {
        text += note + "\r\n";
    });
    $("#scoreNotes").text(text);
}

function addElement(element) {
    if (elementStackID !== null) {
        routine.addElement(element, elementStackID);
        rewriteElementStack();
    } else {
        elementStackID = routine.addElement(element);
        writeElementStack(element);
    }

    viewStack.unwind();
    updateScore();
}

$(document).ready(() => {
    let savedElement = null;

    $(".apparatus").click((event) => {
        switchApparatus(event.target.id);
    });

    $("#elements").click((event) => {
        if (event.target && event.target.nodeName === "BUTTON") {
            elementStackID = event.target.parentNode.id;

            switch (event.target.className) {
                case "delStack":
                    routine.removeStack(elementStackID);
                    $("#" + elementStackID).remove();
                    updateScore();
                    break;
                case "popStack":
                    routine.removeElement(elementStackID, true);
                    rewriteElementStack();
                    updateScore();
                    break;
                case "addStack":
                    buildCategoryTable();
                    break;
                default:
                    break;
            }
        }
    });

    $("#addElement").click(() => {
        elementStackID = null;
        buildCategoryTable();
    });

    $("#restart").click(() => {
        let choice = confirm("Are you sure you want to start over?");
        if (choice === true) {
            reset();
        }
    });

    $(".collapsible").click(() => {
        $(".collapsible").toggleClass("activeIcon");
        $("#scoreDetails").toggle();
    });

    $("#backButton").click(() => {
        viewStack.popView();
    });

    $("#cancelButton").click(() => {
        viewStack.unwind();
    });

    $("#categoryTable").click((event) => {
        if (event.target && event.target.nodeName === "TD") {
            let category = event.target.textContent;
            let filteredElements = elements[apparatus].filter(element => element.category === category);
            filteredElements.forEach(element => {
                let row = $("<tr></tr>");

                let cell = $("<td></td>");
                cell.attr("id", element.id);
                cell.addClass("interactiveCell");

                let nameContainer = $("<span></span>").text(getName(element) + " (" + getValue(element) + ")");
                let button = $("<button></button>").text("\u24D8");

                cell.append(nameContainer);
                cell.append(button);
                row.append(cell);
                $("#elementTable").append(row);
            });

            viewStack.pushView($("#elementTableView"));
        }
    });

    $("#elementTable").click((event) => {
        if (event.target) {
            let id = event.target.nodeName == "TD" ? event.target.id : event.target.parentNode.id;            
            let elementObject = elements[apparatus].find(element => element.id == id);

            if (event.target.nodeName == "BUTTON") {
                $("#elementName").text(getName(elementObject));
                $("#elementDescription").text(elementObject.description);
                $("#imageNotFound").hide();
                $("#elementImage").show();
                $("#imageSourcedFrom").show();
                $("#elementImage").attr("src", "assets/elements/" + apparatus + "/" + id + ".gif");
                $("#elementModal").show();
                return;
            }

            if (apparatus === "floor" && elementStackID !== null && elementObject.acro && routine.getStack(elementStackID).top().acro) {
                viewStack.pushView($("#connectionTypePromptView"));
                savedElement = elementObject;
            } else {
                let element = new ElementClass[apparatus](elementObject);
                addElement(element);
            }
        }
    });

    $("#connectionTypeTable").click((event) => {
        if (event.target && event.target.nodeName == "TD") {
            let element = new FloorElement(savedElement, event.target.id);
            savedElement = null;
            addElement(element);
        }
    });

    $(".closeModal").click(() => {
        $(".modal").hide();
    });

    $(".modal").click((event) => {
        if (event.target && event.target.className == "modal") {
            $(".modal").hide();
        }
    });
});