const alpha = ["", "A", "B", "C", "D", "E", "F", "G", "H", "I", "J", "K"];

let apparatus = "bars";
let routine = new BarRoutine();
const ElementClass = {"vault": RoutineElement, "bars": BarElement, "beam": BeamElement, "floor": FloorElement};
const RoutineClass = {"vault": Vault, "bars": BarRoutine, "beam": BeamRoutine, "floor": FloorRoutine};

function convertToDouble(value) {
    let converted = value / 10.0;
    return converted.toFixed(1);
}

function getName(element) {
    return element.nickname ? element.nickname : element.name;
}

function getValue(element) {
    if (apparatus == "vault") {
        return convertToDouble(element.value);
    }
    return alpha[element.value];
}