class RoutineElement {
    constructor(elementObject) {
        this.id = elementObject.id;
        this.name = elementObject.name;
        this.nickname = elementObject.nickname;
        this.nameInCOP = elementObject.description;
        this.code = elementObject.code;
        this.value = elementObject.value;
        this.category = elementObject.category;
        this.subcategory = elementObject.subcategory;
        this.noDV = false;
        this.noCV = false;
        this.noCR = false;
    }

    reset() {
        this.noDV = false;
        this.noCV = false;
        this.noCR = false;
    }

    determineCredit(existingCount) {
        if (existingCount >= 2) {
            this.noDV = true;
            this.noCR = true;
            this.noCV = true;
            return "NOTE: Additional \"" + this.name + "\" will not be credited";
        }
        return null;
    }
}

class BarElement extends RoutineElement {
    constructor(elementObject) {
        super(elementObject);
        this.root = elementObject.root;
        this.halfTurn = elementObject.halfTurn;
        this.fullTurn = elementObject.fullTurn;
        this.beginsOn = elementObject.beginsOn;
        this.endsOn = elementObject.endsOn;
        this.beginsFacing = elementObject.beginsFacing;
        this.endsFacing = elementObject.endsFacing;
        this.startGrip = elementObject.startGrip;
        this.endGrip = elementObject.endGrip;
        this.isShaposh = elementObject.isShaposh;
    }

    determineCredit(existingCount) {
        if (existingCount === 1) {
            this.noDV = true;
            this.noCR = true;
            return "NOTE: Second \"" + this.name + "\" will not be credited for DV or CR";
        }
        return super.determineCredit(existingCount);
    }

    hasFlight() {
        return (this.category === "Release Moves" || this.category === "Transitions");
    }
}

class BeamElement extends RoutineElement {
    constructor(elementObject) {
        super(elementObject);
        this.acro = elementObject.acro;
        this.hits180 = elementObject.hits180;
        this.direction = elementObject.direction;
        this.isSalto = elementObject.isSalto;
        this.receivesCreditOnce = elementObject.receivesCreditOnce;
        this.endsInScale = elementObject.endsInScale;
    }

    determineCredit(existingCount) {
        if (existingCount === 1) {
            this.noDV = true;
            if (this.acro && !this.isSalto) {
                this.noCR = true;
                return "NOTE: Second \"" + this.name + "\" will not be credited for DV or CR";
            } else if (!this.acro) {
                this.noCR = true;
                this.noCV = true;
                return "NOTE: \"" + this.name + "\" (dance element) considered a repeat and will not be credited";
            }
            return "NOTE: Second \"" + this.name + "\" will not be credited for DV";
        }
        return super.determineCredit(existingCount);
    }
}

class FloorElement extends RoutineElement {
    constructor(elementObject, connectionType) {
        super(elementObject);
        this.acro = elementObject.acro;
        this.hits180 = elementObject.hits180;
        this.canConnect = elementObject.canConnect;
        this.hasFullTwist = elementObject.hasFullTwist;
        this.isDoubleSalto = elementObject.isDoubleSalto;
        this.isAerial = elementObject.isAerial;
        this.receivesCreditOnce = elementObject.receivesCreditOnce;
        this.connectionType = connectionType;
    }

    determineCredit(existingCount) {
        if (existingCount === 1) {
            this.noDV = true;
            this.noCR = true;
            if (!this.acro) {
                this.noCV = true;
                return "NOTE: \"" + this.name + "\" (dance element) considered a repeat and will not be credited";
            }
            return "NOTE: Second \"" + this.name + "\" will not be credited for DV or CR";
        }
        return super.determineCredit(existingCount);
    }
}

class ElementStack {
    constructor(id) {
        this.id = id;
        this.elements = [];
        this.cv = 0;
    }

    push(element) {
        this.elements.push(element);
    }

    pop() {
        return this.elements.pop();
    }

    top() {
        return this.elements[this.elements.length - 1];
    }

    isEmpty() {
        return this.elements.length <= 0;
    }

    numElements() {
        return this.elements.length;
    }

    highestValuedElement() {
        if (this.numElements() == 1) {
            return this.top();
        }
        let result = null;
        this.elements.forEach(element => {
            if (!result || element.value > result.value) {
                result = element;
            }
        });
        return result;
    }
}

class BarStack extends ElementStack {
    constructor(id, currentBar, currentlyFacing) {
        super(id);
        this.currentBar = currentBar;
        this.currentlyFacing = currentlyFacing;
        this.currentGrip = "regular";
    }

    push(element) {
        super.push(element);
        this.updateBar(element);
        this.updateFacing(element);
        this.currentGrip = element.endGrip;
    }

    updateBar(element) {
        if (this.currentBar === null) {
            this.currentBar = element.endsOn;
        } else if (element.endsOn === "other") {
            this.currentBar = this.currentBar === "high" ? "low" : "high";
        }
    }

    updateFacing(element) {
        if (this.currentlyFacing === null) {
            this.currentlyFacing = element.endsFacing;
        } else if (element.endsFacing === "other") {
            this.currentlyFacing = this.currentlyFacing === "high" ? "low" : "high";
        }
    }
}

class Vault {
    constructor() {
        this.score = 0;
    }

    reset() {
        this.score = 0;
    }

    addElement(element) {
        this.score = element.value;
    }

    getCategories() {
        return [
            "No Salto",
            "Front Handspring",
            "Tsukahara",
            "Yurchenko",
            "Yurchenko Half-On"
        ];
    }

    isEmpty() {
        return this.score == 0;
    }
}

class Routine {
    constructor() {
        this.stacks = [];
        this.stackID = 0;

        this.elements = [];
        this.DV = 0;
        this.CV = 0;
        this.CR = 0;
        this.dismount = 0;
        this.score = 0;
        this.notes = [];
    }

    reset() {
        this.elements = [];
        this.DV = 0;
        this.CV = 0;
        this.CR = 0;
        this.dismount = 0;
        this.score = 0;
        this.notes = [];
    }

    getStack(stackID) {
        return this.stacks.find(stack => stack.id == stackID);
    }

    getStackIndex(stackID) {
        return this.stacks.findIndex(stack => stack.id == stackID);
    }

    finalStackID() {
        let ret = 0;
        this.stacks.forEach(stack => {ret = (stack.id > ret) ? stack.id : ret;});
        return ret;
    }

    addElement(element, stackID) {
        if (!stackID) {
            stackID = this.stackID;
            this.stackID += 1;

            let newStack = new ElementStack(stackID);
            newStack.push(element);

            this.stacks.push(newStack);
        } else {
            this.getStack(stackID).push(element);
        }

        this.calculate();
        return stackID;
    }

    removeElement(stackID) {
        let stack = this.getStack(stackID);
        stack.pop();
        if (stack.numElements() <= 0) {
            this.stacks.splice(this.getStackIndex(stackID), 1);
        }
        this.calculate();
    }

    removeStack(stackID) {
        let numElements = this.getStack(stackID).numElements();
        for (var i = 0; i < numElements; i++) {
            this.getStack(stackID).pop();
        }

        this.stacks.splice(this.getStackIndex(stackID), 1);
        this.calculate();
    }

    isEmpty() {
        return this.stacks.length <= 0;
    }

    countElement(element) {
        return this.elements.filter(e => {
            if (element.id == e.id) {
                return true;
            }
            else if (element.receivesCreditOnce && element.code == e.code) {
                return true;
            }
            return false;
        }).length;
    }
}

class BarRoutine extends Routine {
    constructor() {
        super();
        this.currentBar = null;
        this.currentlyFacing = null;
        this.values = "";
    }

    reset() {
        super.reset();
        this.values = "";
    }

    addElement(element, stackID) {
        if (!stackID) {
            stackID = this.stackID;
            this.stackID += 1;

            let newStack = new BarStack(stackID, this.currentBar, this.currentlyFacing);
            newStack.push(element);
            
            this.updateBar(element);
            this.updateFacing(element);

            this.stacks.push(newStack);
        } else {
            this.getStack(stackID).push(element);

            if (stackID == this.finalStackID()) {
                this.updateBar(element);
                this.updateFacing(element);    
            }
        }

        this.calculate();
        return stackID;
    }

    getCategories(stackID) {
        let categories = [];

        if (this.isEmpty()) {
            categories.push("Mounts");
        } else if (stackID === null) {
            categories.push("Casts");
        } else {
            let stack = this.getStack(stackID);
            if (stack.top().category == "Mounts") {
                categories.push("Casts");
            } else {
                categories.push("Pirouettes");
                if (stack.currentBar == "high" || stack.currentGrip == "regular") {
                    categories.push("Transitions");
                }
                if (stack.currentBar == "high") {
                    categories.push("Release Moves");
                }
                if (stackID == this.finalStackID() && (stack.currentBar == "high" || stack.currentGrip == "regular")) {
                    categories.push("Dismounts");
                }
            }
        }

        return categories;
    }

    determineCV(previous, current) {
        if (!previous || previous.noCV || current.noCV || previous.value < 4) {
            return 0;
        }

        let cv = 0
        switch (current.value) {
            case 3:
                if (previous.hasFlight() && this.currentBar === "high" && current.endsOn === "same" && (current.halfTurn || current.hasFlight())) {
                    cv += 2;
                }
                break;
            case 4:
                if (previous.hasFlight() && previous.value > 4 && current.hasFlight()) {
                    cv += 2;
                    break;
                }
                if (previous.hasFlight() && this.currentBar == "high" && current.endsOn == "same" && (current.halfTurn || current.hasFlight())) {
                    cv += 2;
                    break;
                }
                if ((previous.halfTurn || previous.hasFlight()) && (current.halfTurn || current.hasFlight())) {
                    cv += 1;
                }
                break;
            case 5:
            case 6:
            case 7:
            case 8:
                if (previous.hasFlight() && current.hasFlight()) {
                    cv += 2;
                    break;
                }
                if (previous.hasFlight() && this.currentBar == "high" && current.endsOn == "same" && (current.halfTurn || current.hasFlight())) {
                    cv += 2;
                    break;
                }
                if ((previous.halfTurn || previous.hasFlight()) && (current.halfTurn || current.hasFlight())) {
                    cv += 1;
                }   
                break;
            default:
                break;
        }

        return cv;
    }

    analyzeStack(stack, roots) {
        stack.cv = 0;
        for (let i = 0; i < stack.numElements(); i++) {
            let current = stack.elements[i];
            current.reset();

            let root = current.root;
            if (roots[root] >= 3) {
                current.noDV = true;
                current.noCV = true;
                current.noCR = true;
                notes.push("NOTE: Additional \"" + current.name + "\" will not receive credit because there are already 3 or more skills with the same root");
            }
            roots[root] += 1;

            let note = current.determineCredit(this.countElement(current));
            if (note) {
                this.notes.push(note);
            }
            this.elements.push(current);

            let previous = i >= 1 ? stack.elements[i-1] : null;
            stack.cv += this.determineCV(previous, current);
        }
    }

    calculate() {
        this.reset();

        let roots = {
            "Clear hip bwd": 0,
            "Clear hip fwd": 0,
            "Stalder bwd": 0,
            "Stalder fwd": 0,
            "Inbar bwd": 0,
            "Inbar fwd": 0,
            "Toe-on bwd": 0,
            "Toe-on fwd": 0
        };

        this.stacks.forEach(stack => {
            if (stack.top().isShaposh) {
                this.notes.push("NOTE: Shaposhnikova with/without 1/1 turn followed by kip; will incur a 0.5 deduction for empty swing");
            }

            this.analyzeStack(stack, roots);
            this.CV += stack.cv;
        });

        this.elements.sort((elementA, elementB) => elementB.value - elementA.value);

        let count = 0;
        let reqs = [0, 0, 0, 0];
        this.elements.forEach(element => {
            if (!element.noDV && element.category === "Dismounts") {
                this.dismount = element.value;
            } else if (count < 7 && !element.noDV) {
                this.DV += element.value;
                this.values += alpha[element.value] + " ";
                count += 1;
            }

            if (!element.noCR) {
                if (!reqs[0] && element.beginsOn == "high" && element.endsOn == "other") {
                    reqs[0] = 5;
                }
    
                if (!reqs[1] && element.category == "Release Moves") {
                    reqs[1] = 5;
                }
    
                if (!reqs[2] && element.startGrip != element.endGrip && element.category != "Mounts" && element.category != "Casts" && element.category != "Dismounts") {
                    reqs[2] = 5;
                }
    
                if (!reqs[3] && element.fullTurn && element.category !== "Mounts") {
                    reqs[3] = 5;
                }
            }
        });

        if (this.dismount == 0) {
            this.notes.push("NOTE: Routine has no dismount; will incur a 0.5 deduction from the final score");
        } else {
            this.DV += this.dismount
        }
    
        this.CR = reqs.reduce((a, b) => a + b);
        this.score = this.DV + this.CV + this.CR;
    }

    updateBar(element) {
        if (this.currentBar === null) {
            this.currentBar = element.endsOn;
        } else if (element.endsOn === "other") {
            this.currentBar = this.currentBar === "high" ? "low" : "high";
        }
    }

    updateFacing(element) {
        if (this.currentlyFacing === null) {
            this.currentlyFacing = element.endsFacing;
        } else if (element.endsFacing === "other") {
            this.currentlyFacing = this.currentlyFacing === "high" ? "low" : "high";
        }
    }

}

class BeamRoutine extends Routine {
    constructor() {
        super();

        this.acroValues = "";
        this.danceValues = "";
    }

    reset() {
        super.reset();
        this.acroValues = "";
        this.danceValues = "";
    }

    getCategories(stackID) {
        if (this.isEmpty()) {
            return ["Mounts"];
        }

        return [
            "Leaps/Jumps/Hops",
            "Turns",
            "Acrobatic Flight",
            "Dismounts"
        ];
    }

    determineCV(previous, current) {
        if (previous.noCV || current.noCV) {
            return 0;
        }
        let mapping = bb.cvMap[previous.value][current.value];
        let cv = (typeof mapping == "function") ? mapping(previous, current) : mapping;
        return cv;
    }

    determineSB(element1, element2, element3) {
        if (element1.noCV || element2.noCV || element3.noCV) {
            return false;
        }
        if (element1.value >= 2 && element2.value >= 2 && element3.value >= 2) {
            if (element1.value >= 3 || element2.value >= 3 || element3.value >= 3) {
                return true;
            }
        }
        return false;
    }

    analyzeStack(stack) {
        stack.cv = 0;
        let result = {fulfillsCR1: false, fulfillsCR3: false};
        let sb = false;

        for (let i = 0; i < stack.numElements(); i++) {
            let current = stack.elements[i];
            current.reset();

            let note = current.determineCredit(this.countElement(current));
            if (note) {
                this.notes.push(note);
            }
            this.elements.push(current);

            let previous = i >= 1 ? stack.elements[i-1] : null;
            if (previous) {
                if (!current.noCR && !previous.noCR) {
                    if (!result.fulfillsCR1 && !previous.acro && !current.acro && (previous.hits180 || current.hits180)) {
                        result.fulfillsCR1 = true;
                    }
            
                    if (!result.fulfillsCR3 && previous.category == "Acrobatic Flight" && current.category == "Acrobatic Flight" && (previous.isSalto || current.isSalto)) {
                        result.fulfillsCR3 = true;
                    }
                }

                stack.cv += this.determineCV(previous, current);
                if (!sb && i >= 2) {
                    sb = this.determineSB(stack.elements[i - 2], previous, current);
                    if (sb) {
                        stack.cv += 1;
                    }
                }
            }
        }

        return result;
    }

    calculate() {
        this.reset();

        let reqs = [0, 0, 0, 0];

        this.stacks.forEach(stack => {
            let result = this.analyzeStack(stack);
            if (!reqs[0] && result.fulfillsCR1) {
                reqs[0] = 5;
            }
            if (!reqs[2] && result.fulfillsCR3) {
                reqs[2] = 5;
            }
            this.CV += stack.cv;
        });

        this.elements.sort((elementA, elementB) => elementB.value - elementA.value);

        let count = 0;
        let acroCount = 0;
        let acroDV = 0;
        let danceCount = 0;
        let danceDV = 0;
        let fwd = false;
        let bwd = false;

        this.elements.forEach(element => {
            if (!element.noDV && element.category === "Dismounts") {
                this.dismount = element.value;
            } else if (count < 7 && !element.noDV) {
                if (element.acro && acroCount < 4) {
                    acroDV += element.value;
                    this.acroValues += alpha[element.value] + " ";
                    acroCount += 1;
                    count += 1;
                } else if (!element.acro && danceCount < 5) {
                    danceDV += element.value;
                    this.danceValues += alpha[element.value] + " ";
                    danceCount += 1;
                    count += 1;
                }
            }

            if (!element.noCR) {
                if (!reqs[1] && element.category == "Turns") {
                    reqs[1] = 5;
                }
    
                if (!reqs[3]) {
                    if (!fwd && element.direction == "fwd" || element.direction == "swd") {
                        fwd = true;
                    }
                    if (!bwd && element.direction == "bwd") {
                        bwd = true;
                    }
                    if (fwd && bwd) {
                        reqs[3] = 5;
                    }
                }
            }
        });

        this.DV = acroDV + danceDV;
        if (this.dismount == 0) {
            this.notes.push("NOTE: Routine has no dismount; will incur a 0.5 deduction from the final score");
        } else {
            this.DV += this.dismount
        }
    
        this.CR = reqs.reduce((a, b) => a + b);
        this.score = this.DV + this.CV + this.CR;
    }
}

class FloorRoutine extends Routine {
    constructor() {
        super();
        this.acroValues = "";
        this.danceValues = "";
    }

    reset() {
        super.reset();
        this.acroValues = "";
        this.danceValues = "";
    }

    getCategories(stackID) {
        let previousCategory = stackID !== null ? this.getStack(stackID).top().category : null;

        if (previousCategory) {
            switch (previousCategory) {
                case "Leaps":
                case "Hops":
                    return ["Leaps", "Hops", "Jumps"];
                case "Jumps":
                    return ["Jumps"];
                case "Turns":
                    return ["Jumps", "Turns"];
                case "Forward Saltos":
                case "Backward Saltos":                
                    return ["Jumps", "Forward Saltos", "Backward Saltos"];
                default:
                    break;
            }
        }

        return [
            "Leaps",
            "Hops",
            "Jumps",
            "Turns",
            "Forward Saltos",
            "Backward Saltos"
        ];
    }

    determineCV(previous, current, i) {
        if (previous.noCV || current.noCV) {
            return 0;
        }
        let mapping = fx.cvMap[previous.value][current.value];
        let cv = (typeof mapping == "function") ? mapping(previous, current, i) : mapping;
        return cv;
    }

    analyzeStack(stack) {
        stack.cv = 0;
        let result = {fulfillsCR1: false, isAcroLine: false};

        for (let i = 0; i < stack.numElements(); i++) {
            let current = stack.elements[i];
            current.reset();

            let note = current.determineCredit(this.countElement(current));
            if (note) {
                this.notes.push(note);
            }
            this.elements.push(current);

            if (!result.isAcroLine && current.acro && !current.isAerial && !current.noDV) {
                result.isAcroLine = true;
            }

            let previous = i >= 1 ? stack.elements[i-1] : null;
            if (previous) {
                if (!current.noCR && !previous.noCR) {
                    if (!result.fulfillsCR1) {
                        if (previous.category == "Leaps" || previous.category == "Hops") {
                            if (current.category == "Leaps" || current.category == "Hops") {
                                if (previous.hits180 || current.hits180) {
                                    result.fulfillsCR1 = true;
                                }
                            }
                        }
                    }
                }

                stack.cv += this.determineCV(previous, current, i);
            }
        }

        return result;
    }

    calculate() {
        this.reset();

        let reqs = [0, 0, 0, 0];
        let acroLines = [];

        this.stacks.forEach(stack => {
            let result = this.analyzeStack(stack);
            if (!reqs[0] && result.fulfillsCR1) {
                reqs[0] = 5;
            }
            if (result.isAcroLine) {
                if (acroLines.length >= 4) {
                    let note = "NOTE: More than four acro lines; acro line containing ";
                    let noteComplete = false;
                    stack.elements.forEach(element => {
                        element.noDV = true;
                        if (!noteComplete) {
                            note += "\"" + getName(element) + "\" will not be credited for DV.";
                            noteComplete = true;
                        }
                    });
                } else {
                    acroLines.push(stack.id);
                }
            }
            this.CV += stack.cv;
        });

        this.elements.sort((elementA, elementB) => elementB.value - elementA.value);

        let count = 0;
        let acroCount = 0;
        let acroDV = 0;
        let danceCount = 0;
        let danceDV = 0;
        let fwd = false;
        let bwd = false;
        let dismountElement = null;

        if (acroLines.length >= 2) {
            let dismountLine = this.getStack(acroLines[acroLines.length - 1]);
            dismountElement = dismountLine.highestValuedElement();
            this.dismount = dismountElement.value;
        }

        this.elements.forEach(element => {
            if (count < 7 && !element.noDV && (!dismountElement || element.id != dismountElement.id)) {
                if (element.acro && acroCount < 4) {
                    acroDV += element.value;
                    this.acroValues += alpha[element.value] + " ";
                    acroCount += 1;
                    count += 1;
                } else if (!element.acro && danceCount < 5) {
                    danceDV += element.value;
                    this.danceValues += alpha[element.value] + " ";
                    danceCount += 1;
                    count += 1;
                }
            }

            if (!element.noCR) {
                if (!reqs[1] && element.hasFullTwist) {
                    reqs[1] = 5;
                }

                if (!reqs[2] && element.isDoubleSalto) {
                    reqs[2] = 5;
                }
    
                if (!reqs[3]) {
                    if (!fwd && element.category == "Forward Saltos" && !element.isAerial) {
                        fwd = true;
                    }
                    if (!bwd && element.category == "Backward Saltos" && !element.isAerial) {
                        bwd = true;
                    }
                    if (fwd && bwd) {
                        reqs[3] = 5;
                    }
                }
            }
        });

        this.DV = acroDV + danceDV;
        if (this.dismount == 0) {
            this.notes.push("NOTE: Routine has no dismount; will incur a 0.5 deduction from the final score");
        } else {
            this.DV += this.dismount
        }
    
        this.CR = reqs.reduce((a, b) => a + b);
        this.score = this.DV + this.CV + this.CR;
    }
}



